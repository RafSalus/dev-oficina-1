# ADR-008: Trilha de Auditoria — Classificação do Ator e Minimização/Retenção de Dados Pessoais (LGPD)

- **Status:** Aprovado. Decisão delegada pelo proprietário ao `@architect` em 2026-09-26 ("pode decidir o que é melhor com base na sua experiência e no que o mercado costuma usar").
- **Data:** 2026-09-26
- **Autor:** Aria (@architect); implementação: `@data-engineer` (Story 2.2b)
- **Contexto:** Story 2.2 (gate CONCERNS — achados SEC-001, SEC-003, REQ-001), NFR13, NFR16, NFR19.5; ADR-005 §2.9; ADR-006 §2.3 item 7; ADR-007 §3.9

---

## 1. Contexto e Problema

A Story 2.2 criou `public.fn_audit_trigger()`, que grava toda escrita das tabelas críticas em `public.audit_logs`. O gate da 2.2 levantou duas questões:

1. **Quem fez a alteração (SEC-001).** A regra atual é "`auth.uid()` nulo → `usuario_papel = 'publico_token'`". Mas `auth.uid()` também é nulo quando a escrita vem do `service_role` (Edge Functions como `criar-login-funcionario`), do SQL Editor, de migrations e de jobs agendados. Na prática a trilha mistura o vetor anônimo de maior risco (links públicos por token, ADR-006) com operações privilegiadas da própria oficina. Isso já aconteceu em produção: a correção de conta de 2026-09-26, feita por SQL, ficou registrada como `publico_token`.
2. **Dados pessoais na trilha (SEC-003).** A trilha guarda a linha inteira (`to_jsonb(OLD/NEW)`). Cada `UPDATE` de status numa OS copia os snapshots de cliente e veículo; cada alteração de cliente copia CPF, telefone, e-mail e endereço. Como a trilha é imutável, esses dados sobrevivem à exclusão do registro original, o que conflita com a retenção de 3 anos do ADR-007 §3.9 e com o princípio de necessidade da LGPD (art. 6º, III).

O NFR16 exige autor, data/hora e **valores anteriores**, então apagar ou mascarar valores de forma geral não é aceitável.

---

## 2. Decisão 1 — Classificação do ator pela claim `role` do JWT

A função passa a classificar o ator pela claim `role` do JWT de `request.jwt.claims` (definida pelo PostgREST em toda requisição), e não pela ausência de `auth.uid()`:

| Origem da escrita | Claim `role` | `usuario_papel` gravado | `usuario_id` |
|---|---|---|---|
| Usuário logado (admin, secretaria, mecânico, cliente) | `authenticated` | `public.papel_usuario()` (ou `NULL` se não houver papel) | `auth.uid()` |
| Link público por token (RPC `SECURITY DEFINER`, ADR-006/007) | `anon` | `publico_token` | `NULL` |
| Edge Function / backend com a service key | `service_role` | `service_role` | `NULL` |
| Conexão direta ao banco, sem JWT (SQL Editor, migrations, `pg_cron`, CLI) | ausente | `sistema` | `NULL` |

Colunas novas em `public.audit_logs`:

- `db_usuario text` — `session_user` (papel de banco da conexão: `authenticator`, `postgres`, `supabase_admin`...). É o que ferramentas como `pgaudit` e `supa_audit` registram, e distingue a CLI do SQL Editor quando `usuario_papel = 'sistema'`.
- `token_acesso_id text NULL` — id do token público (nunca o token), lido de `current_setting('app.token_acesso_id', true)`. As RPCs públicas da Story 2.17 fazem `set_config('app.token_acesso_id', <id>, true)` antes de escrever. Cumpre o ADR-006 §2.3 item 7 (REQ-001).

**Por quê:** é o padrão do próprio Supabase (a claim `role` é a fonte de verdade que o PostgREST usa para trocar de papel) e o que ferramentas de auditoria de Postgres fazem, ou seja, separar o ator de aplicação do papel de banco. Mantém o marcador `publico_token` exclusivo do vetor anônimo, que é onde a trilha mais precisa ser precisa.

---

## 3. Decisão 2 — LGPD: minimizar, restringir, reter por prazo e anonimizar sob demanda

A abordagem segue o padrão de mercado para trilhas de auditoria com dados pessoais: a trilha **fica**, porque tem base legal própria (LGPD art. 7º, II e VI; art. 16, I: cumprimento de obrigação legal e exercício regular de direitos), mas com **minimização, acesso restrito, prazo e anonimização**. Não se usa mascaramento geral, porque isso quebraria o NFR16.

### 3.1 Minimização: `UPDATE` grava só o que mudou

- **`UPDATE`:** `valor_anterior` e `valor_novo` passam a conter **apenas as colunas alteradas**, mais `id`. As colunas que só mudam por efeito colateral (`updated_at`) não disparam registro sozinhas: um `UPDATE` que não muda nada além de `updated_at` não gera linha de auditoria.
- **`INSERT` e `DELETE`:** continuam com a linha completa. Representam a criação e a remoção do registro, e o `DELETE` é o único lugar onde o valor anterior sobrevive.
- **Efeito:** uma mudança de status numa OS passa a gravar `{id, status}` em vez da OS inteira com os snapshots do cliente. O volume de dados pessoais copiados cai de "toda escrita" para "só quando o dado pessoal muda, e na criação/remoção".

### 3.2 Acesso restrito (já vigente)

- Leitura só pelo `admin` (política "Admin le audit_logs"); nenhuma escrita por `anon`/`authenticated`, inclusive `TRUNCATE` (Story 2.2).

### 3.3 Retenção de 5 anos

- A trilha é retida por **5 anos** contados de `created_at` e depois expurgada.
- **Por que 5 anos:** é o prazo prescricional do Código de Defesa do Consumidor para reparação por defeito do serviço (art. 27) e o prazo fiscal/tributário usual (CTN art. 173/174). É o período em que a oficina pode precisar provar quem alterou uma OS, um valor ou um cadastro. Mais que isso não tem finalidade que justifique a guarda.
- **Execução:** função `public.expurgar_audit_logs(p_anos int default 5)` (`SECURITY DEFINER`, só para `service_role`/dono), agendada **mensalmente** via `pg_cron` (disponível no projeto; é o mesmo mecanismo previsto no ADR-007 §3.9). A exclusão é feita pelo dono da tabela; `anon`/`authenticated` continuam sem `DELETE`.
- O prazo fica configurável pelo parâmetro, e não espalhado no código.

### 3.4 Anonimização sob demanda (direito do titular e retenção do ADR-007)

- Função `public.anonimizar_titular_auditoria(p_tabela text, p_registro_id text)`: nas linhas da trilha daquele registro, substitui os valores das **colunas de identificação pessoal** por `"[anonimizado]"`, preservando o restante (quem alterou, quando, operação, campos de negócio). A própria anonimização é registrada na trilha como `operacao = 'ANONIMIZACAO'`.
- **Colunas de identificação pessoal** (lista única, numa constante SQL da função): `cpf`, `cpf_cnpj`, `cpf_digitos`, `rg`, `telefone`, `celular`, `whatsapp`, `email`, `email_contato`, `endereco`, `logradouro`, `numero`, `complemento`, `bairro`, `cep`, `data_nascimento`, e o conteúdo de `snapshot_cliente`. Stories novas que criarem colunas pessoais incluem o nome na lista.
- **Quem chama:** o `admin` (via RPC, com checagem `papel_usuario() = 'admin'`) quando atender a um pedido de exclusão do titular (LGPD art. 18, VI) e não houver obrigação legal de guardar; e os jobs de retenção do ADR-007 §3.9, ao excluir um cadastro após 3 anos.
- **Por que não "crypto-shredding"** (cifrar dados pessoais por titular e destruir a chave): resolve o mesmo problema, mas exige gestão de chaves por titular (Vault/pgsodium) e descriptografia em toda leitura da trilha. Para o volume e a equipe de uma oficina, a anonimização pontual resolve com uma fração da complexidade.

### 3.5 Registro legado

- A linha já existente de 2026-09-26 (correção da conta do proprietário, feita por SQL) é reclassificada de `publico_token` para `sistema` na migration da Story 2.2b, com `db_usuario` desconhecido (`NULL`). É o único ajuste em linha antiga, documentado na migration.

---

### 3.6 Emenda de implementação (Story 2.2b, 2026-09-26)

Ajustes feitos pelo `@data-engineer` ao implementar o §3.4, para a anonimização cumprir o objetivo:

- **Nome do titular:** `nome`, `nome_fantasia` e `razao_social` também são anonimizados, **só** quando a tabela é de pessoa (`clientes`, `funcionarios`, `cadastros_clientes`). Em `pecas`/`servicos`, `nome` é o nome do item e fica intacto. Sem isso a "anonimização" deixaria o titular identificável pelo nome.
- **`telefone_secundario`** (coluna existente em `clientes`) entra na lista.
- **Snapshot na OS:** ao anonimizar `('clientes', id)`, a função também anonimiza `snapshot_cliente` nas linhas de `ordens_servico` cujo `cliente_id` é o do titular — o snapshot fica nas linhas da OS, cujo `registro_id` é o id da OS.
- **Quem pode chamar:** além do admin, `service_role` e processos sem JWT (`sistema`), porque os jobs de retenção do ADR-007 §3.9 também chamam a função (§5). Usuário autenticado sem papel admin recebe `insufficient_privilege`.
- **Linhas legadas (§3.5):** como nenhuma RPC pública por token existia antes desta migration, **todas** as linhas `publico_token` já gravadas são reclassificadas para `sistema` (em produção era 1).

## 4. Consequências

**Positivas**
- `publico_token` passa a identificar só o vetor anônimo; operações da própria oficina ficam distinguíveis entre `service_role` e `sistema`, e a CLI se distingue do SQL Editor por `db_usuario`.
- A trilha para de acumular cópias de dados pessoais a cada mudança operacional; os dados pessoais têm prazo e uma forma documentada de anonimização.
- O NFR16 continua atendido: autor, data/hora e valores anteriores dos campos alterados.

**Negativas / custos**
- Um `UPDATE` não mostra mais a linha inteira; para reconstituir o estado completo num instante, é preciso combinar o `INSERT` com os `UPDATE`s seguintes. É o trade-off padrão de trilhas baseadas em diff.
- A lista de colunas pessoais precisa ser mantida pelas stories que criam colunas novas.
- `pg_cron` passa a ser uma extensão habilitada no projeto.

---

## 5. Impacto nas stories

| Story | Impacto |
|---|---|
| **2.2b** | Implementa §2 e §3 (com a emenda do §3.6): colunas `db_usuario` e `token_acesso_id`; nova versão de `fn_audit_trigger()` (classificação por claim, diff no `UPDATE`); `expurgar_audit_logs()` + agendamento `pg_cron`; `anonimizar_titular_auditoria()`; reclassificação da linha legada. |
| 2.5, 2.6, 2.7 | Dependem da 2.2b; colunas pessoais novas entram na lista do §3.4. |
| 2.17 | RPCs públicas fazem `set_config('app.token_acesso_id', ...)` antes de escrever. |
| 2.20a/2.20c | O job de retenção de 3 anos chama `anonimizar_titular_auditoria('cadastros_clientes', id)` antes de excluir o cadastro. |
