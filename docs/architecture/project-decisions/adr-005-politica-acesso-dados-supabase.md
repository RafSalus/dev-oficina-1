# ADR-005: Política de Acesso a Dados no Supabase — Fail-Closed, Escrita Atômica e Concorrência

- **Status:** Aprovado. D4, D5 (inclusive estoque) e o ponto único de baixa (Opção 1, §2.11) resolvidos por decisão do proprietário em 2026-09-24  
- **Data:** 2026-09-24 (revisões em 2026-09-24: decisão do proprietário sobre D4 e D5; decisão do proprietário sobre venda no PDV com caixa aberto; decisão do proprietário de que o mecânico não lança estoque e a baixa acontece no uso da peça pela OS; decisão do proprietário confirmando a Opção 1 da §2.11)  
- **Autor:** Aria (@architect, Holistic System Architect)  
- **Contexto:** Epic 2 (Stories 2.1 a 2.19), PRD v1.4 (FR9, FR25, NFR10, NFR12, NFR14, NFR16), ADR-002, revisão arquitetural do Epic 2 de 2026-09-24  
- **Complementa:** ADR-002 (Async Contract First). Não o substitui: as assinaturas públicas dos repositórios continuam valendo.

---

## 1. Contexto e Problema

O ADR-002 garantiu que toda função de repositório seja assíncrona, mas não definiu **o que acontece quando o banco falha**. O único repositório já ligado ao Supabase (`src/repositories/funcionariosRepository.js`) estabeleceu, de fato, o seguinte padrão, que as Stories 2.1 a 2.19 mandam replicar ("fallback transparente para `localStorage`"):

1. grava primeiro no `localStorage` e depois chama o Supabase;
2. não checa o `{ error }` retornado — o `supabase-js` **não lança exceção** em erro de RLS, constraint ou rede, apenas devolve `error`;
3. na leitura, `data.length > 0` faz uma tabela legitimamente vazia devolver o cache local antigo.

Consequências observáveis quando o sistema for multiusuário (NFR10, ≥ 10 usuários simultâneos):

- **Sucesso falso:** um `INSERT` negado pelo RLS aparece para o usuário como salvo; o dado existe só no navegador dele.
- **Divergência entre máquinas:** cada estação passa a ter uma cópia própria, sem reconciliação.
- **Dado pessoal persistido no navegador**, contrariando NFR14.
- **Escritas em várias etapas sem atomicidade** (movimentação + saldo; recebimento de compra + N movimentações + OS; venda + nota + baixa de estoque): uma falha no meio deixa o banco inconsistente.
- **IDs e números gerados no front** (`mov-${Date.now()}`, "maior número + 1") colidem com usuários simultâneos.
- **Gravação da lista inteira** (Agenda: `salvarAgendamentos(array)`) faz a última gravação apagar as alterações dos outros.

Com a remoção do FR14 (PRD v1.4), não existe dado legado em `localStorage` a preservar: o fallback não tem função em produção.

---

## 2. Decisões

### 2.1 Fail-closed quando o Supabase está configurado

| Modo | Condição | Fonte de dados | Em erro |
|---|---|---|---|
| **Remoto (produção)** | `isSupabaseConfigured === true` | Somente Supabase | Lança `ErroRepositorio`; **nada** é gravado localmente |
| **Local (dev/teste)** | `isSupabaseConfigured === false` **e** build não-produtivo (`import.meta.env.PROD === false`) | `localStorage` (comportamento atual) | Comportamento atual |
| **Inválido** | Build de produção sem Supabase configurado | — | Erro explícito na inicialização (fail-closed, mesmo princípio do `AdminAuthContext` desde o commit `b006f0d`) |

- É **proibido** o fallback para `localStorage` motivado por falha de chamada (rede, RLS, constraint).
- O modo é decidido **uma vez** na inicialização, não por chamada.

### 2.2 Checagem obrigatória de `{ error }`

- Toda chamada `supabase.from(...)`, `.rpc(...)` e `.storage` passa por um único wrapper (Story 2.1) que:
  1. verifica `error` **e** o resultado esperado (ex.: `.select().single()` após `insert`/`update` para confirmar que a linha foi de fato afetada — um `UPDATE` bloqueado por RLS retorna 0 linhas **sem** erro);
  2. registra `console.error` com operação + entidade (PRD §4.4);
  3. lança `ErroRepositorio` com código normalizado.
- Códigos mínimos (mapeados a partir do `code` do PostgREST/Postgres):

| Código | Origem | Mensagem ao usuário (via `sonner`) |
|---|---|---|
| `SEM_PERMISSAO` | `42501`, ou 0 linhas afetadas em escrita | "Você não tem permissão para esta operação." |
| `DUPLICADO` | `23505` | Específica por entidade ("CPF/CNPJ já cadastrado", "Placa já cadastrada"…) |
| `CONFLITO_EDICAO` | checagem de `updated_at` (§2.7) | "Este registro foi alterado por outra pessoa. Recarregue." |
| `FORA_DO_HORARIO` | política de janela (FR20) | "Operação permitida apenas das 08h às 19h." |
| `REFERENCIA_INVALIDA` | `23503` | Específica por entidade |
| `INDISPONIVEL` | erro de rede/timeout | "Sem conexão com o servidor. Nada foi salvo." |

- O contrato `{ dados, carregando, erro }` dos hooks (Story 2.1 AC4) permanece; `erro` passa a carregar o `codigo`.

### 2.3 Sem cache de dados pessoais

- No modo remoto, dados de domínio (clientes, veículos, OS, funcionários, vendas, cadastros) vivem **apenas em memória** (estado React) durante a sessão.
- No login e no logout, uma rotina de limpeza remove as chaves legadas de domínio `dev_oficina_*` do `localStorage` (NFR14). Chaves de preferência de UI não pessoais podem permanecer.
- Cache persistente offline (IndexedDB, fila de sincronização) está **fora do escopo** deste ADR; se vier a ser necessário, exige ADR próprio (criptografia, expiração, reconciliação).
- **Capacidade perdida, justificada:** o uso offline "silencioso" deixa de existir no modo remoto. Justificativa: o offline atual não é um requisito do PRD, produz dados divergentes e contraria NFR14; o comportamento substituto é erro explícito "nada foi salvo".

### 2.4 RPCs transacionais para escritas em várias etapas

Toda operação que altera mais de uma linha/tabela como uma unidade de negócio vira **uma função Postgres** (`LANGUAGE plpgsql`, uma transação), chamada via `supabase.rpc()`. O repositório mantém a assinatura pública (ADR-002) e passa a delegar à RPC.

| Story | Operação atual (JS) | RPC | Conteúdo transacional |
|---|---|---|---|
| 2.8 | `registrarMovimentacao()` | `registrar_movimentacao_estoque(...)` | `INSERT` em `estoque_movimentacoes`; saldo pelo trigger de §2.5 |
| 2.9 | `receberCompraNoEstoque()` / `receberPedidoCompra()` | `receber_pedido_compra(pedido_id, documento)` | status do pedido → `entregue` + 1 movimentação de entrada por item + anotação na OS vinculada (comportamento atual de `comprasData.js:140-150`) |
| 2.9 | `aprovarCotacaoEGerarPedidoCompra()` | `aprovar_cotacao_gerar_pedido(cotacao_id, fornecedor_id)` | status da cotação + criação do pedido com número de sequence |
| 2.19 | `registrarVendaPDV()` | `registrar_venda_pdv(payload)` | valida allowlist `STATUS_PERMITE_FATURAMENTO` **dentro** da função + venda + nota simulada + baixa de estoque só dos itens ainda não baixados (idempotente, §2.11) |
| 2.14/2.15 | — (novo) | `aplicar_peca_na_os(os_id, os_item_id)` e `devolver_peca_da_os(...)` | baixa no uso e devolução física (§2.11) |

- As RPCs usam `SECURITY INVOKER` sempre que as políticas de RLS do chamador bastarem; `SECURITY DEFINER` só quando a operação precisar tocar tabela que o chamador não acessa diretamente — e então a função **checa o papel explicitamente** com `public.papel_usuario()` na primeira linha.
- Regras de negócio existentes são **replicadas, não reinventadas** (Artigo IV). Divergências entre o código e o banco (ex.: status de cotação `CANCELADA` no front vs. `cancelada` no `CHECK`) são resolvidas por mapeamento explícito no repositório, documentado na story.

### 2.5 Saldo de estoque mantido somente pelo Kardex

- `pecas.estoque_atual` passa a ser **derivado**: atualizado exclusivamente por um trigger `AFTER INSERT ON estoque_movimentacoes`, que replica exatamente a regra atual de `src/repositories/estoqueRepository.js:34-44`:
  - `entrada` → `saldo + quantidade`;
  - `saida` → `GREATEST(0, saldo - quantidade)` (o piso zero atual é preservado);
  - `ajuste` → `quantidade` (valor absoluto).
- A atualização usa `SELECT ... FOR UPDATE` na linha da peça para serializar lançamentos simultâneos.
- **Proteção de `estoque_atual`:** um trigger `BEFORE UPDATE ON pecas` rejeita qualquer alteração de `estoque_atual` que não venha do trigger do Kardex (marcador de sessão `set_config('app.origem_kardex', 'on', true)`, local à transação). Isso vale inclusive para a Secretaria, que recebe `UPDATE` em `pecas` pelo FR25.
  - *Trade-off:* GRANT por coluna foi descartado porque o Supabase concede `UPDATE` em nível de tabela ao papel `authenticated`, e revogar por coluna não anula o grant de tabela — exigiria reestruturar os grants padrão.
  - O saldo inicial de uma peça nova é lançado como movimentação `ajuste` (não por `INSERT` direto no campo), mantendo a trilha.
- Recomendação ao `@data-engineer`: coluna `saldo_resultante` em `estoque_movimentacoes`, preenchida pelo trigger, porque o piso zero e o `ajuste` absoluto fazem a soma do Kardex divergir do saldo — a coluna torna cada linha auditável.
- `UPDATE`/`DELETE` em `estoque_movimentacoes`: somente admin (FR25). Correções = nova movimentação `ajuste`.

### 2.6 Identificadores e números gerados no banco

- **Chave primária (`id TEXT`):** passa a ter `DEFAULT gen_random_uuid()::text` nas tabelas novas e nas existentes. O front **não gera mais `id`**; o `INSERT` retorna a linha criada (`.select().single()`). IDs legados com prefixo (`cli-…`, `func-…`) continuam válidos (a coluna segue `TEXT`).
  - *Trade-off vs. sequence/IDENTITY na PK:* UUID não expõe volume de negócio nem é sequencialmente adivinhável, o que importa para o ADR-006 (rotas públicas). Números sequenciais ficam reservados para o que o usuário lê.
- **Números de negócio legíveis** (`numero_os`, `numero_venda`, `numero_pedido`, `numero_cotacao`, códigos de deslocamento e frota de apoio): `SEQUENCE` dedicada por série, aplicada por `DEFAULT` ou trigger, preservando o formato visual atual de cada módulo (ex.: `PED-AAAA-NNNN`). Fica proibido o padrão "ler o maior + 1" no front.
- Buracos na numeração (transação desfeita) são aceitos; se o fiscal real (fora do MVP 1) exigir numeração sem buracos, isso exigirá ADR próprio.

### 2.7 Gravação por linha com controle de concorrência otimista

- Repositórios deixam de gravar listas inteiras. Toda mutação é por linha (`insert`/`update`/`delete` com `eq('id', …)`).
- Tabelas editáveis por mais de um perfil (Agenda, Fila de Espera, OS, Leva e Traz) usam **checagem de `updated_at`**: o `UPDATE` inclui `.eq('updated_at', valorLido)`; zero linhas afetadas → `CONFLITO_EDICAO`. Depende do trigger `fn_set_updated_at()` da Story 2.2.
- Operações que alteram várias linhas por regra (ex.: `recalcularCascataDeAtrasos()` da Agenda) chamam uma RPC que recebe a lista de `{ id, updated_at_lido, novos_campos }` e aplica tudo ou nada.

### 2.8 Identidade do funcionário no banco: `public.funcionario_atual_id()`

```sql
-- Assinatura de referência (DDL final: @data-engineer)
CREATE FUNCTION public.funcionario_atual_id() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT f.id FROM public.funcionarios f
      WHERE f.auth_user_id = auth.uid() AND f.ativo = true $$;
```

- `SECURITY DEFINER` é necessário porque `funcionarios` só é legível pelo admin; a função devolve **apenas o `id`**.
- Usos: autoria em `estoque_movimentacoes.usuario`, `requisicoes_pecas.solicitante_id`, danificados, deslocamentos; políticas de "próprios registros".
- O estado `mecanicoAtivo` do `MecanicoContext` passa a ser derivado da sessão (`auth.uid()` → funcionário), não do `localStorage`.
- **D5 — requisições de peça (decisão do proprietário, 2026-09-24):** o mecânico vê **somente as requisições que ele mesmo solicitou**. Política de referência em `requisicoes_pecas`:
  - `SELECT` e `INSERT` do mecânico: `papel_usuario() = 'mecanico' AND solicitante_id = public.funcionario_atual_id()` (no `INSERT`, via `WITH CHECK`, para o mecânico não criar requisição em nome de outro);
  - `secretaria`/`admin`: leem todas e atendem ou recusam (`UPDATE`), como previsto na Story 2.15.
- **D5 — estoque (decisão do proprietário, 2026-09-24):** o mecânico **não** lança movimentação de estoque manualmente e **não recebe** `INSERT` (nem `SELECT`) em `estoque_movimentacoes`. Quando ele usa uma peça na OS dele, o **sistema** gera a movimentação automaticamente, por uma RPC `SECURITY DEFINER` (ver §2.11).

### 2.9 Regras obrigatórias para funções no banco

1. Toda função `SECURITY DEFINER` declara `SET search_path = ''` e qualifica todos os objetos com schema (`public.`, `auth.`, `extensions.`).
2. Toda função `SECURITY DEFINER` chamável pelo cliente faz `REVOKE EXECUTE ... FROM PUBLIC` e concede `EXECUTE` só aos papéis necessários.
3. Toda política nova usa `public.papel_usuario()`; `user_metadata` é proibido para autorização (reafirma a Fase 0).
4. É proibida política `TO authenticated USING (true)` ou qualquer política que não filtre por papel — hoje a segurança contra contas sem papel depende disso.
5. Auditoria (Story 2.2): `fn_audit_trigger()` com `SET search_path = ''`; lista de tabelas auditadas ampliada para `pecas`, `servicos` e `terceiros` (preços e cadastros agora escritos pela Secretaria, FR25) e para toda tabela nova do Epic 2.

### 2.10 Janela de horário (FR20) nas novas escritas

- **Função única:** `public.em_horario_operacional()` (fuso `America/Sao_Paulo`, limites 8 e 19 hoje fixos na política de `ordens_servico`), reutilizada por todas as políticas que aplicam a janela, em vez de repetir a expressão em cada uma. A política existente de `ordens_servico` passa a usar essa função sem mudança de comportamento.
- **D4 — decisão do proprietário (2026-09-24):** Decisão confirmada pelo proprietário e validada pelo `@po` (a janela aplica-se a Veículos e Suprimentos; não se aplica a Clientes):

| Domínio | Tabelas / operações | Janela para `secretaria`/`mecanico` |
|---|---|---|
| Veículos | `veiculos` (`INSERT`/`UPDATE`) e a RPC de hodômetro (`km_atual`, Story 2.13) | **Aplica** |
| Suprimentos | `pecas`, `servicos`, `terceiros`, `estoque_movimentacoes`, `compras_pedidos`, `compras_cotacoes` (escritas do FR25) e as RPCs de §2.4 que escrevem nelas (`registrar_movimentacao_estoque`, `receber_pedido_compra`, `aprovar_cotacao_gerar_pedido`) | **Aplica** |
| Clientes | `clientes` (`INSERT`/`UPDATE`) | **Não aplica** |
| Ordens de serviço | `ordens_servico` (`UPDATE`) | Aplica (já vigente desde a Fase 0; sem mudança) |

- O admin continua sem janela (24/7 com MFA, FR20).
- Leituras (`SELECT`) nunca têm janela.
- **PDV — decisão do proprietário (2026-09-24):** a venda no PDV pode acontecer depois das 19h **enquanto o caixa do dia estiver aberto**. Depois do fechamento do caixa, a venda fica bloqueada até a próxima janela.
  - `registrar_venda_pdv` passa a ser `SECURITY DEFINER`, com `SET search_path = ''`, checagem de papel na primeira linha (`papel_usuario() IN ('admin','secretaria')`) e `REVOKE ... FROM PUBLIC` / `GRANT ... TO authenticated`.
  - Condição de autorização para a secretaria: `public.caixa_do_dia_aberto() OR public.em_horario_operacional()`. O admin segue sem restrição de horário (FR20).
  - Como roda com privilégio próprio, a baixa de estoque interna à RPC **não** passa pela janela de `estoque_movimentacoes`. A condição acima é a única regra de horário da venda, e o trigger de saldo (§2.5) continua valendo.
  - **Dependência (verificada em 2026-09-24):** **não existe** conceito de abertura/fechamento de caixa no código nem no schema. O `ModalFechamentoPagamento.jsx` é o fechamento de *uma venda*, não do caixa, e nenhuma migration tem tabela de caixa. É **requisito novo para a Story 2.19**, no mínimo necessário:
    - tabela `pdv_caixas`, com um registro por dia civil (`America/Sao_Paulo`) e `aberto_em`, `aberto_por`, `fechado_em`, `fechado_por`;
    - RPCs `abrir_caixa()` e `fechar_caixa()`, restritas a `admin`/`secretaria`;
    - função `public.caixa_do_dia_aberto()`: `STABLE`, `SET search_path = ''`, verdadeira só se o caixa do dia corrente foi aberto e ainda não foi fechado;
    - **condição necessária para a regra não ser contornada:** a secretaria só abre o caixa dentro de `em_horario_operacional()`. Sem isso, bastaria abrir o caixa às 22h para vender fora da janela. Um caixa não fechado deixa de valer na virada do dia.
  - Conciliação de valores, sangria e relatório de caixa **não** fazem parte deste requisito.
- **Consequência:** a política atual de `veiculos` (migration `20260924130000`, hoje sem janela) precisa de migration incremental.
- **Fora do escopo da decisão D4:** Agenda, Fila de Espera, Leva e Traz, Manutenção Preventiva, requisições e danificados. Continuam sem janela até decisão explícita do proprietário.

### 2.11 Ponto único de baixa de estoque por item de OS

**Conflito a resolver.** O FR23 do PRD diz "Pagamento no PDV com baixa automática de estoque das peças utilizadas", e o código atual faz exatamente isso: `PDVPage.jsx:347-370` baixa no pagamento, e adicionar peça à OS (`PainelDetalhesOS.jsx`) **não** movimenta estoque, apesar de o texto do toast dizer "baixa do estoque interno". A decisão D5 do proprietário diz que a movimentação acontece **quando o mecânico usa a peça na OS**. Se as duas coisas forem implementadas como estão, o mesmo item é baixado duas vezes.

**Opções avaliadas**

| | Opção | Prós | Contras |
|---|---|---|---|
| **1** | **Baixa no uso pela OS; o PDV só fatura o que já foi baixado** (e baixa venda avulsa e itens de OS ainda não baixados) | Atende literalmente a D5; o saldo reflete a prateleira no momento em que a peça sai; nenhum conceito novo além de uma chave de idempotência | **Altera o FR23** (a baixa sai do pagamento); OS cancelada depois do uso exige devolução explícita |
| 2 | Reserva no uso; baixa efetiva no PDV | Mantém o FR23 literal; cancelar a OS só libera a reserva, sem movimentação | Conceito novo (`estoque_reservado` ou tabela de reservas; saldo disponível ≠ saldo físico); OS paga dias depois deixa o saldo físico errado nesse intervalo; OS abandonada prende reserva; não atende a D5 como foi dita ("registra a movimentação") |

**Decisão: Opção 1** (recomendada pela arquitetura e confirmada por decisão do proprietário em 2026-09-24), com garantia de ponto único **no banco**, independente do caminho:

1. Cada item de peça em `ordens_servico.itens_pecas` já tem `id` próprio (gerado hoje no front; passa a ser UUID). `estoque_movimentacoes` ganha as colunas `ordem_servico_id` e `os_item_id`, com **índice único parcial** `(ordem_servico_id, os_item_id) WHERE tipo = 'saida'`. Assim, a segunda tentativa de baixar o mesmo item é rejeitada ou ignorada (`ON CONFLICT DO NOTHING`), venha ela do uso ou do PDV.
2. RPC `public.aplicar_peca_na_os(os_id, os_item_id)`:
   - `SECURITY DEFINER`, `SET search_path = ''`;
   - papel `mecanico` somente na OS em que `mecanico_id = public.funcionario_atual_id()`; `secretaria`/`admin` em qualquer OS;
   - somente com a OS em `aprovado_execucao` (peça de orçamento ainda não aprovado não baixa);
   - item precisa ser peça de catálogo (`peca_id` presente; itens "A COTAR" não baixam);
   - gera a saída pelo Kardex (trigger de saldo §2.5, piso zero preservado);
   - janela `em_horario_operacional()` para mecânico/secretaria (D4, Suprimentos).
3. `registrar_venda_pdv` (§2.10): para itens com origem em OS, baixa **apenas** os que ainda não têm saída (mesmo índice único). Venda avulsa baixa normalmente. Isso preserva o comportamento atual para peças de OS que nunca foram marcadas como usadas.
4. **Estorno e cancelamento:**
   - item removido da OS ou OS `cancelada` depois do uso → **não** há estorno automático. A secretaria/admin registra devolução **somente** do que voltou fisicamente à prateleira (RPC `devolver_peca_da_os`, movimentação `entrada` com `motivo` de devolução e referência ao item). Óleo aplicado, por exemplo, não volta;
   - estorno de venda no PDV (admin, Story 2.19) **não** reverte baixa; devolução física segue a mesma RPC;
   - toda devolução fica no Kardex e em `audit_logs`.
5. O momento exato em que a UI do mecânico chama `aplicar_peca_na_os` (ação por item "usar peça") é detalhe de story (2.14/2.15), não deste ADR.

- **Decisão do proprietário (2026-09-24):** Opção 1 confirmada. O FR23 passa a dizer "baixa automática no uso da peça pela OS; o PDV fatura e baixa apenas o que ainda não foi baixado". O `@pm` atualiza o PRD. O índice único do item 1 é obrigatório, porque ele elimina a baixa dupla.

---

## 3. Consequências

**Positivas**
- Nenhum sucesso falso: o que o usuário vê salvo está no banco.
- Saldo de estoque consistente e auditável, sem depender do front.
- Numeração e IDs livres de colisão com usuários simultâneos.
- Base única para as políticas de "próprios registros".

**Negativas / custos**
- Sem modo offline no ambiente remoto (erro explícito em vez de gravação local).
- Mais lógica em SQL (RPCs e triggers) → testes de banco passam a ser necessários (`supabase test db` ou script SQL documentado), além dos testes Vitest com mock.
- O trigger de proteção de `estoque_atual` exige que toda ferramenta administrativa lance ajuste pelo Kardex.

**Riscos residuais**
- RPCs `SECURITY DEFINER` mal escritas contornam o RLS → revisão obrigatória do `@architect` em cada uma (Quality Gate).
- `audit_logs` cresce com os JSONB da OS → monitorar; otimização fora do MVP.

---

## 4. Impacto nas Stories (a aplicar pelo `@sm`)

| Story | Ajuste |
|---|---|
| 2.1 | Trocar "fallback em falha" por §2.1/§2.2; wrapper com `ErroRepositorio`; limpeza de chaves (§2.3); refatorar `funcionariosRepository` para checar `error` |
| 2.2 | `search_path` vazio; auditar `pecas`/`servicos`/`terceiros`; `updated_at` é pré-requisito de §2.7 |
| 2.3 | Incluir `funcionario_atual_id()` (§2.8) |
| 2.5–2.7, 2.10–2.16 | Remover "fallback local quando falhar"; IDs pelo banco; 2.10/2.12/2.14 com checagem de `updated_at` |
| 2.7 | FR25 + proteção de `estoque_atual` (§2.5) |
| 2.8 | RPC + trigger de saldo (§2.4/§2.5); remover "opção simples"; colunas `ordem_servico_id`/`os_item_id` e índice único parcial de saída por item (§2.11); sem política de estoque para o mecânico (D5) |
| 2.9 | RPCs `receber_pedido_compra` e `aprovar_cotacao_gerar_pedido`; FR25 |
| 2.13 | `atualizarHodometroVeiculo` via RPC restrita a `km_atual` (o mecânico não tem `UPDATE` em `veiculos`) |
| 2.19 | RPC `registrar_venda_pdv` com allowlist no banco; `SECURITY DEFINER` com a regra "caixa do dia aberto OU janela"; requisito novo: `pdv_caixas`, `abrir_caixa`/`fechar_caixa` e `caixa_do_dia_aberto()` (§2.10); baixa idempotente, só dos itens sem saída registrada (§2.11) |
| 2.6, 2.7, 2.8, 2.9, 2.13 | Aplicar `em_horario_operacional()` às escritas de secretaria/mecânico (D4, §2.10); a 2.6 inclui a migration incremental da política de `veiculos` |
| 2.5 | Sem janela de horário em `clientes` (D4) |
| 2.15 | O mecânico vê e cria só as próprias requisições (D5, §2.8) |
| 2.14 | RPCs `aplicar_peca_na_os`/`devolver_peca_da_os` (§2.11) |
