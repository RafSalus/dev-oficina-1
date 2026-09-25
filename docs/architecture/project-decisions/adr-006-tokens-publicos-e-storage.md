# ADR-006: Acesso Público por Token e Armazenamento de Mídia no Supabase Storage

- **Status:** Aprovado. D4 (escopo) e D6 foram resolvidos por decisão do proprietário em 2026-09-24  
- **Data:** 2026-09-24 (revisão 2026-09-24: decisão do proprietário sobre D4 e D6)  
- **Autor:** Aria (@architect, Holistic System Architect)  
- **Contexto:** Stories 2.17 e 2.18; PRD v1.4 (FR3, NFR12, NFR13, R-11); ADR-001 (rotas públicas); ADR-005 (regras de funções no banco)  

---

## 1. Contexto e Problema

Quatro rotas são públicas por design (FR3): `/cotacao/:id` (fornecedor responde cotação), `/aprovacao/:id` e `/orcamento/:id` (cliente aprova orçamento, mesma página) e `/vistoria/:id` (cliente vê checklist, fotos e assinatura de entrada). Hoje elas leem o `localStorage` do próprio navegador. No Supabase, elas são a **única superfície de leitura e escrita sem autenticação** do sistema.

Problemas encontrados no desenho das stories:

1. **Token único por cotação vaza propostas:** a cotação é enviada a vários fornecedores e `compras_cotacoes.propostas_fornecedores` guarda todas as propostas. Com um token por cotação, o fornecedor A lê a proposta do B.
2. **Token guardado em claro:** qualquer `SELECT` autenticado na tabela (ou vazamento de backup) entrega links válidos.
3. **URL assinada gerada por RPC:** a Story 2.18 prevê que a RPC `obter_vistoria_por_token` gere `createSignedUrl`. **Uma função Postgres não consegue assinar URLs do Storage** — a assinatura é feita pela API do Storage com chave de servidor.
4. Faltam: grants explícitos, uso único da decisão, trava de estado, rate limit, políticas de `storage.objects` e convenção de caminhos.

---

## 2. Decisões

### 2.1 Tabela dedicada de tokens (não coluna na tabela de domínio)

```text
public.tokens_acesso_publico
  id            text PK default gen_random_uuid()::text
  token_hash    bytea UNIQUE NOT NULL        -- SHA-256 do token; o token em claro nunca é gravado
  finalidade    text CHECK (finalidade IN ('cotacao_fornecedor','aprovacao_orcamento','vistoria'))
  registro_id   text NOT NULL                -- id da cotação ou da OS
  fornecedor_id text NULL REFERENCES terceiros(id)   -- obrigatório quando finalidade = cotacao_fornecedor
  expira_em     timestamptz NOT NULL
  usado_em      timestamptz NULL             -- preenchido na decisão/resposta (uso único)
  revogado_em   timestamptz NULL
  criado_por    uuid NOT NULL                -- auth.uid() de quem emitiu
  created_at    timestamptz default now()
```

- *Trade-off:* a coluna na tabela de domínio é mais simples, mas não comporta **um token por fornecedor** e mistura credencial com dado de negócio. A tabela dedicada permite revogar/expirar em lote e dá um único padrão aos três fluxos.
- RLS ativo; **nenhuma** política para `anon`; `SELECT` somente `admin`/`secretaria` (sem expor `token_hash` na UI); escrita somente pelas funções abaixo.
- Hash com `extensions.digest(token, 'sha256')` (schema do `pgcrypto` no Supabase — o `@data-engineer` confirma o schema real no projeto).

### 2.2 Emissão

- RPC `public.emitir_token_publico(finalidade, registro_id, fornecedor_id)`, `SECURITY DEFINER`, restrita a `admin`/`secretaria`/`mecanico` conforme a finalidade (checagem de `papel_usuario()` na primeira linha).
- Gera 32 bytes aleatórios (`extensions.gen_random_bytes(32)`), codificados em base64url; grava só o hash; **retorna o token em claro uma única vez** para montar o link (`wa.me`, impressão).
- Reenviar um link = emitir token novo e revogar o anterior (o sistema não consegue "recuperar" um token, por desenho).
- Cotação: **um token por par (cotação, fornecedor)**.
- Validade inicial proposta (constantes documentadas numa tabela `public.config_acesso_publico`, não espalhadas no código — "Config > Hardcoding"): cotação 72 h; aprovação de orçamento 7 dias; vistoria 30 dias. Valores ajustáveis sem nova migration de função.

### 2.3 Consumo: funções públicas

| Função | Tipo | Retorna / faz |
|---|---|---|
| `obter_cotacao_por_token(token)` | leitura | itens da cotação + **somente a proposta do fornecedor do token** |
| `registrar_proposta_fornecedor(token, proposta jsonb)` | escrita | grava/atualiza só a entrada daquele fornecedor em `propostas_fornecedores` |
| `obter_aprovacao_por_token(token)` | leitura | projeção mínima da OS (número, veículo, itens, totais, status) — nunca `SELECT *`, nunca CPF/telefone |
| `registrar_decisao_aprovacao(token, decisao jsonb)` | escrita | aplica aprovação/recusa de itens e transição de status |
| `obter_vistoria_por_token(token)` | leitura | checklist + **caminhos** dos objetos no Storage (não URLs) |

Regras comuns (ver também ADR-005 §2.9):

1. `SECURITY DEFINER`, `SET search_path = ''`, objetos qualificados.
2. `REVOKE EXECUTE ON FUNCTION ... FROM PUBLIC;` e `GRANT EXECUTE ... TO anon, authenticated;` somente nas cinco funções públicas. `emitir_token_publico` fica sem grant para `anon`.
3. Validação: hash confere + `expira_em > now()` + `revogado_em IS NULL` + finalidade correta. Qualquer falha → **mesma resposta genérica** ("link inválido ou expirado"), sem distinguir o motivo.
4. **Nunca** aceitam `id` de OS/cotação como parâmetro.
5. **Uso único com trava de estado nas escritas:**
   - `registrar_decisao_aprovacao` só atua se `usado_em IS NULL` **e** a OS estiver em `aguardando_aprovacao`; faz `SELECT ... FOR UPDATE` na OS, grava `usado_em` na mesma transação. Segunda chamada → resposta genérica.
   - `registrar_proposta_fornecedor` só atua com a cotação em `em_cotacao`; o fornecedor pode reenviar enquanto a cotação estiver aberta (sem `usado_em`); o fechamento da cotação encerra o token.
   - Leituras (`obter_*`) podem ser repetidas até expirar.
6. **Rate limit:** tabela `public.limites_acesso_publico(chave_hash, janela_inicio, contagem)` e função `public.consumir_cota(chave, limite, janela)` chamada no início de cada função pública, com chave = hash do token e, nas funções chamadas via Edge Function, também do IP. Limites iniciais: 30 leituras/10 min por token; 5 escritas/10 min por token. Excedeu → resposta genérica.
7. Auditoria: as escritas passam pelo `fn_audit_trigger()` com `usuario_id` nulo; a função grava `usuario_papel = 'publico_token'` e o `id` do token (nunca o token) para rastreabilidade.
8. Os tokens nunca vão para logs de aplicação; as páginas públicas usam `<meta name="referrer" content="no-referrer">` para não vazar a URL a terceiros.

### 2.4 Storage de fotos e assinaturas

- **Bucket privado `vistorias`** (nunca público), com `file_size_limit` e `allowed_mime_types` (`image/jpeg`, `image/png`, `image/webp`) configurados no bucket. O front comprime a imagem antes do upload (redução de 4G/quota, R-11).
- **Convenção de caminhos:** `os/{os_id}/fotos/{uuid}.{ext}` e `os/{os_id}/assinatura/{uuid}.png`. O `os_id` é UUID (ADR-005 §2.6), portanto não adivinhável; o `uuid` do arquivo é gerado no cliente só para o nome do objeto.
- **Políticas em `storage.objects`** (todas com `bucket_id = 'vistorias'`):

| Operação | Quem |
|---|---|
| `INSERT` | `papel_usuario() IN ('admin','secretaria','mecanico')` |
| `SELECT` | `papel_usuario() IN ('admin','secretaria','mecanico')` |
| `UPDATE` / `DELETE` | somente `admin` (a vistoria é evidência; substituir = novo objeto) |
| `anon` | **nenhuma política** |

- `ordens_servico.fotos_entrada`, `checklist_entrada` e `assinatura_cliente` passam a guardar **caminhos**, não base64.
- **Janela de horário (D4, decisão do proprietário, 2026-09-24):** a decisão aplica a janela a Veículos e Suprimentos (ADR-005 §2.10) e não cita o Storage de vistoria. Por isso as políticas de `storage.objects` **não** recebem janela. Na prática, o vínculo da mídia à OS continua sujeito à janela já vigente no `UPDATE` de `ordens_servico`, que grava os caminhos. Um upload fora do horário gera um objeto órfão, que não fica visível a ninguém de fora da equipe. Recomendação: limpeza periódica de objetos sem referência (tarefa de manutenção, não bloqueante).

### 2.5 URLs assinadas por Edge Function

- Nova Edge Function **`acesso-publico-midia`**:
  1. recebe o token;
  2. chama `obter_vistoria_por_token(token)` com o cliente `anon` (a validação, a expiração e o rate limit ficam na RPC — fonte única de verdade);
  3. com o cliente **service role**, gera `createSignedUrls` **somente para os caminhos devolvidos pela RPC**, com validade de **5 minutos**;
  4. devolve dados + URLs. Resposta genérica em qualquer falha.
- A service role key existe só como secret da Edge Function (mesmo padrão de `criar-login-funcionario`); CORS restrito a `ALLOWED_ORIGINS`.
- Para a equipe autenticada, o front usa `createSignedUrl` diretamente (as políticas de `SELECT` do §2.4 bastam).
- **Falha de upload (Story 2.18 AC7):** no modo remoto a mídia pendente fica **somente em memória** durante a sessão, com botão de reenvio e aviso explícito de que ainda não foi salva; não há persistência local (ADR-005 §2.3). Fila offline persistente = fora de escopo.

### 2.6 Formato das rotas públicas

- **Decisão do proprietário (D6, 2026-09-24):** `/cotacao/:token`, `/aprovacao/:token`, `/orcamento/:token`, `/vistoria/:token`, com **troca única de `:id` para `:token`, sem período de transição**: nenhuma rota aceita mais `:id`. Motivo: não há links em produção enviados a clientes ou fornecedores.
- Links antigos com `:id` (só de ambiente de desenvolvimento) passam a cair na resposta genérica "link inválido ou expirado"; não há redirecionamento.
- O guard (`ProtectedRoute`, ADR-001) não muda: as rotas continuam públicas; muda só o parâmetro e a fonte de dados. FR3 do PRD precisa refletir `:token` (ajuste do `@pm`).

---

## 3. Alternativas Rejeitadas

| Alternativa | Motivo |
|---|---|
| Política `TO anon` nas tabelas de domínio | Foi o padrão inseguro removido na Fase 0; expõe a tabela inteira |
| Token em claro em coluna da OS/cotação | Vazamento de leitura = links válidos; não suporta um token por fornecedor |
| `id` da OS como "segredo" | Adivinhável/enumerável; não expira; não revoga |
| Bucket público ou URL pública permanente | Fotos do veículo e assinatura (dado pessoal) indexáveis para sempre |
| URL assinada gerada pela RPC | Tecnicamente impossível no Postgres |

---

## 4. Consequências

- A superfície anônima fica concentrada em 5 funções e 1 Edge Function, todas revisáveis pelo `@architect`.
- Reenvio de link sempre gera token novo (efeito colateral aceito).
- Teste obrigatório no gate da 2.17/2.18: token adulterado, token de outro fornecedor, token expirado, token revogado, segunda decisão com o mesmo token, acesso `anon` direto às tabelas e ao bucket — todos negados.

## 5. Impacto nas Stories (a aplicar pelo `@sm`)

| Story | Ajuste |
|---|---|
| 2.9 | Fluxo público de cotação passa a ser por fornecedor; AC7 referencia este ADR |
| 2.14 | `id` da OS por `gen_random_uuid()` (pré-requisito da convenção de caminhos) |
| 2.17 | Substituir o trade-off coluna × tabela pela decisão §2.1; incluir §2.2, §2.3 (grants, uso único, rate limit), `registrar_proposta_fornecedor`; AC4 → troca única `:id` → `:token`, sem transição (D6, §2.6) |
| 2.18 | Edge Function `acesso-publico-midia` (§2.5); políticas e caminhos (§2.4); AC7 sem contingência local persistente; sem janela de horário no Storage (D4, §2.4) |
