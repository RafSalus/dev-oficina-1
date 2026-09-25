# Sprint Change Proposal — dev-oficina (Epic 2)

> **Task:** `correct-course.md` · **Checklist:** `.aiox-core/product/checklists/change-checklist.md`
> **Modo:** YOLO (decisões autônomas registradas como `[AUTO-DECISION]`)
> **Agente:** Morgan (@pm, Strategist) · **Data:** 2026-09-24
> **Artefato afetado:** `docs/prd.md` (v1.4 → v1.5)
> **Status:** **APLICADO** — as edições já estão no PRD, não são propostas pendentes.
> **Nota de rastreabilidade:** o Change Log v1.4 do PRD já apontava para este documento, que não havia sido criado. Ele é criado junto com a v1.5 e registra as **duas** rodadas do dia: a v1.4 (decisões do proprietário sobre as Open Questions do Epic 2) e a v1.5 (decisões do proprietário sobre os ADR-005, ADR-006 e ADR-007). Fontes: `docs/prd.md` e os três ADRs. Nada aqui foi decidido fora dessas fontes (Artigo IV).

---

## 1. Understand the Trigger & Context

### 1.1 Gatilho da mudança

Entrada do proprietário da oficina, em duas rodadas no mesmo dia:

- **Rodada 1 (v1.4):** respostas às Open Questions do Epic 2 (`docs/stories/epic-2-INDEX.md`, OQ 3, 4, 5, 8 e 9) sobre permissões da Secretaria, forma de acesso do cliente e importação de dados antigos.
- **Rodada 2 (v1.5):** decisões sobre os pontos que os ADRs do Epic 2 devolveram ao proprietário (D4, D5, D6, Opção 1 da baixa de estoque, Opção B da autenticação do cliente e OQ-5).

**Natureza do gatilho:** `[x] Requisito recém-descoberto` · `[x] Pivô necessário com base em nova informação` · `[x] Conflito entre requisito e decisão de arquitetura (FR23 × D5)`

### 1.2 Impacto inicial observado

| Rodada | Mudança | Efeito no PRD |
|---|---|---|
| v1.4 | Secretaria passa a escrever em Suprimentos | Requisito novo (FR25) |
| v1.4 | Cliente se cadastra no site pelo CPF e depende de aprovação | **Inversão** de FR17 (de proibição para permissão com aprovação); FR18 reescrito; FR24 e NFR19 novos |
| v1.4 | Não há dado real em `localStorage` a importar | FR14 removido do escopo |
| v1.5 | Baixa de estoque no uso da peça pela OS | **Altera o FR23** (a baixa sai do pagamento no PDV) |
| v1.5 | Rotas públicas por token | FR3 muda de `:id` para `:token` |
| v1.5 | Janela 08h-19h por domínio; PDV com caixa aberto; requisições do mecânico | FR20, FR25 e NFR12 detalhados |
| v1.5 | Login por CPF (Opção B), conferência, expiração e retenção | OQ-4 e OQ-5 resolvidas; FR17, FR24 e NFR19 detalhados |

### 1.3 Evidência coletada (conforme PRD e ADRs)

| Achado | Fonte | Consequência |
|---|---|---|
| Os dados mock foram apagados | Migration `20260924120000_remover_dados_mock.sql`, commit `e7ef8a4` (PRD FR14) | Não há dado a importar: FR14 removido, G2.4 cancelado, R-6 rebaixado |
| `clientes.cpf_cnpj` já é `UNIQUE NOT NULL` | `20260921_initial_schema.sql:41` (PRD FR24) | A aprovação vincula, nunca duplica |
| Secretaria já tem `INSERT`/`UPDATE` sem `DELETE` em `clientes`/`veiculos` | Migration `20260924130000` (PRD FR25) | Base para o `[AUTO-DECISION]` de `DELETE` só do admin em Suprimentos |
| O Supabase Auth não autentica por CPF | PRD OQ-4; ADR-007 §1 | O mecanismo de login exigiu ADR (gate G2.8) |
| O código atual baixa estoque no pagamento; adicionar peça à OS não movimenta estoque | `PDVPage.jsx:347-370` e `PainelDetalhesOS.jsx` (ADR-005 §2.11) | Implementar D5 sem mudar o FR23 baixaria o mesmo item duas vezes |
| Não existe conceito de abertura/fechamento de caixa | Verificação de 2026-09-24 registrada no ADR-005 §2.10 (`ModalFechamentoPagamento.jsx` fecha uma venda, não o caixa; nenhuma migration tem tabela de caixa) | A venda após as 19h depende de requisito novo na Story 2.19 |
| Não há links públicos em produção | ADR-006 §2.6 | A troca `:id` → `:token` pode ser feita de uma vez, sem transição |

---

## 2. Epic Impact Assessment

### 2.1 Epic 1 — sem mudança de escopo

A proibição de auto-cadastro implementada na Story 1.1 (AC10/AC12) **continua vigente** até o fluxo seguro do Epic 2 passar pelo gate G2.8.

### 2.2 Epic 2 — ampliado e resequenciado internamente

- **v1.4:** RLS de escrita da Secretaria nas Stories 2.7, 2.8 e 2.9 (FR25); Story 2.20 marcada para divisão; gate **G2.8** criado; gate **G2.4** cancelado.
- **v1.5:** Story 2.20 dividida em **2.20a** (schema, RLS e Edge Function), **2.20b** (tela de aprovação e RPCs) e **2.20c** (sessão real do portal), conforme ADR-007 §6. As Stories 2.6 a 2.9, 2.13, 2.14, 2.15, 2.17, 2.18 e 2.19 recebem os ajustes listados nas tabelas "Impacto nas Stories" dos ADR-005 §4, ADR-006 §5 e ADR-007 §6. O conceito de **caixa do dia** é requisito novo da Story 2.19.

### 2.3 Epics de roadmap (3A, 4, 3B) — sem impacto

---

## 3. Artifact Conflict & Impact Analysis

| Artefato | Conflito? | Ação |
|---|---|---|
| `docs/prd.md` | **Sim** — FR17 contradizia a nova decisão (v1.4); FR23 contradizia a D5 (v1.5); FR3 citava `:id` | Editado (v1.3 → v1.4 → v1.5). Ver § 5. |
| ADR-005, ADR-006, ADR-007 | Não | São a fonte das decisões da v1.5; o PRD passa a referenciá-los em vez de duplicá-los |
| Stories do Epic 2 | Sim | Ajustes são do `@sm` (em andamento); este documento **não** edita stories |
| `docs/architecture/supabase-persistence-model.md` | A verificar | A atualização foi pedida ao `@architect` na v1.4 e não consta dos ADRs; segue em aberto |
| Código-fonte | **Nenhuma alteração** | `@pm` não toca código |

---

## 4. Path Forward Evaluation

| Opção | Avaliação | Veredito |
|---|---|---|
| **1. Ajuste direto / integração** | Absorver as decisões nos FRs existentes, criar FR24/FR25/NFR19 e referenciar os ADRs | **✅ ESCOLHIDA** |
| **2. Rollback** | Nada do fluxo novo foi implementado | ➖ N/A |
| **3. Re-scoping / PRD V2** | A tese do PRD (fundação antes de feature, Epic 2 como persistência real) não mudou; as decisões são de regra de negócio e permissão | ❌ Rejeitada |

### 4.1 Escolha da baixa de estoque (FR23 × D5)

O ADR-005 §2.11 avaliou duas opções. O proprietário confirmou a **Opção 1**:

| | Opção | Veredito |
|---|---|---|
| **1** | Baixa no uso pela OS; o PDV fatura e baixa só o que ainda não foi baixado | **Escolhida** — atende a D5 literalmente; saldo reflete a prateleira; custo é uma chave de idempotência |
| 2 | Reserva no uso; baixa efetiva no PDV | Rejeitada — conceito novo de reserva; saldo físico errado entre uso e pagamento; não atende a D5 como foi dita |

### 4.2 Escolha do login por CPF

O ADR-007 §2 avaliou três opções. A **Opção B** (Edge Function `cliente-auth` + e-mail sintético por HMAC com pepper) foi aprovada. A Opção A (e-mail sintético calculado no front) foi rejeitada por inviabilizar anti-enumeração e rate limit; a Opção C (OTP por SMS) por custo recorrente, SIM swap e por trocar o identificador de CPF para telefone.

---

## 5. Edições aplicadas em `docs/prd.md`

### 5.1 v1.4 (Rodada 1)

| ID | Mudança | Origem |
|---|---|---|
| **FR25** (novo) | Secretaria cadastra e edita Peças, Serviços e Terceiros, lança estoque e cria/edita Pedidos de Compra e Cotações, com RLS por `public.papel_usuario()`. `[AUTO-DECISION]` `DELETE` só do admin nas seis tabelas; `UPDATE` em `estoque_movimentacoes` só do admin (Kardex append-only) | Decisão do proprietário |
| **NFR12** | Nota: cadastro pendente/recusado não acessa dado algum; matriz de escrita da Secretaria em FR25 | Decisão do proprietário |
| **FR17** (reescrito) | De "proibição de auto-cadastro" para "auto-cadastro público por CPF com aprovação obrigatória"; transição mantém a proibição da Story 1.1 até o G2.8; `[AUTO-DECISION]` CNPJ fora do auto-cadastro | Decisão do proprietário |
| **FR18** (reescrito) | Acesso só após aprovação e vínculo com `public.clientes`; WhatsApp deixa de ativar e vira aviso opcional, sem credencial | Decisão do proprietário |
| **FR24** (novo) | Tela de cadastros pendentes no módulo Clientes (listar, conferir, aprovar sem duplicar, recusar, avisar), com auditoria | Decisão do proprietário |
| **NFR19** (novo) | 8 requisitos não negociáveis do cadastro público (zero dado antes da aprovação no banco, anti-enumeração, DV do CPF, rate limit/CAPTCHA, LGPD, sem duplicidade, CPF não é segredo, papel só no servidor) | Decorrência de segurança |
| **FR2/FR3** | Rota pública de cadastro acrescida; formato `:id`/`:token` remetido ao ADR da Story 2.17 | Decorrência |
| **OQ-2** | Substituída pela nova decisão | Decisão do proprietário |
| **OQ-4** (nova) | Como o CPF vira credencial — bloqueante, `@architect` | Pendência de arquitetura |
| **OQ-5** (nova) | Interpretações e `[AUTO-DECISION]`s a confirmar | Pendência de negócio |
| **G2.8** (novo) | ADR de autenticação do cliente por CPF | Gate |
| **R-17 a R-19** (novos) | CPF de terceiro, enumeração/abuso do formulário, auth por CPF no front | Avaliação de risco |
| **M12** | Reescrita para "cadastros com acesso sem aprovação = zero" | Métrica |
| **FR14** | **Removido do escopo** sem renumeração; G2.4 cancelado; R-6 rebaixado | Decisão do proprietário |

### 5.2 v1.5 (Rodada 2)

| ID | Mudança | Referência |
|---|---|---|
| **FR23** | Baixa automática **no uso da peça pela OS**; PDV fatura e baixa só o que ainda não foi baixado; venda avulsa continua baixando no PDV; **baixa única por item** por índice único em `estoque_movimentacoes`; cancelamento, remoção de item e estorno **não revertem** automaticamente — Secretaria/admin registra devolução só do que voltou fisicamente; mecânico não lança movimentação manual | ADR-005 §2.8 e §2.11 |
| **FR3** | `/cotacao`, `/aprovacao`, `/orcamento` e `/vistoria` passam de `:id` para `:token`, **quebra única, sem transição** (D6) | ADR-006 §2.6 |
| **FR20** | Janela 08h-19h para escrita de Secretaria/Mecânico em **Veículos** e **Suprimentos**, não em **Clientes** (D4); PDV vende após as 19h **enquanto o caixa do dia estiver aberto** (conceito novo, Story 2.19) | ADR-005 §2.10 |
| **FR25 / NFR12** | Mecânico sem `SELECT`/`INSERT` em `estoque_movimentacoes` e vendo **só as próprias requisições** de peças (D5); janela aplicada às escritas de Suprimentos | ADR-005 §2.8 e §2.10 |
| **FR17** | Mecanismo de login: Opção B | ADR-007 §3 |
| **FR24** | Conferência de identidade pela Secretaria via WhatsApp oficial, usando o **telefone já cadastrado** quando o CPF existe; recusa exclui a conta na hora | ADR-007 §3.6 |
| **NFR19.5** | Pendentes expiram em **30 dias**; recusa exclui a conta **na hora**; retenção dos dados do cadastro por **3 anos**; texto do termo de consentimento pendente | ADR-007 §3.9 |
| **OQ-4** | **Resolvida** pelo ADR-007 | ADR-007 |
| **OQ-5** | **Resolvida**, exceto o texto do termo de consentimento LGPD (`@po`/jurídico) | ADR-007 §3.6 e §3.9 |
| **G2.8** | ADR emitido; gate segue exigindo verificação da implementação | ADR-007 |
| **R-17, R-19** | Mitigações atualizadas com o ADR-007 | ADR-007 |
| § 1.2, § 2.4, § 11 | Referências aos ADRs; itens 14 a 16 de rastreabilidade; próximos passos atualizados | — |

### 5.3 Avaliação de risco das decisões da v1.5

| Risco | Origem | Mitigação | Residual |
|---|---|---|---|
| Baixa dupla do mesmo item (uso + PDV) | FR23 × código atual | Índice único parcial por item de OS em `estoque_movimentacoes` (obrigatório) | Baixo |
| Saldo inflado ou negativo após OS cancelada | Sem reversão automática | Devolução manual só do que voltou fisicamente, auditada | Depende de disciplina operacional da Secretaria |
| Venda fora da janela contornando a regra | Caixa aberto como exceção | Caixa só abre dentro da janela; perde validade na virada do dia | Baixo |
| Links antigos quebrados | Quebra única `:id` → `:token` | Só existem links de desenvolvimento; resposta genérica | Nenhum em produção |
| Impostor com CPF de outra pessoa (R-17) e squatting de CPF | Auto-cadastro | Conferência pelo telefone já cadastrado; recusa exclui a conta na hora; pendentes expiram em 30 dias | Conferência humana continua sendo ponto de falha |
| Cadastro de CPF sem registro prévio | Sem dado do titular a comparar | Contato pelo telefone informado | Garantia menor, aceita pelo ADR-007 §3.6 |

---

## 6. Perguntas encaminhadas ao `@architect` e situação

Lista referenciada pelo PRD (OQ-4 e § 11). Todas as perguntas vieram da v1.4; a situação é a da v1.5.

| # | Pergunta | Situação |
|---|---|---|
| 1 | Mapeamento CPF → identidade no Supabase Auth sem expor e-mail/telefone nem permitir enumeração | **Respondida** — ADR-007 §3.2 e §3.4 (Opção B) |
| 2 | Onde vive o cadastro pendente e como a RLS garante zero acesso antes da aprovação | **Respondida** — ADR-007 §3.3 e §3.7 |
| 3 | Como a aprovação vincula o cadastro a `clientes` (vínculo, normalização do CPF, conflito) | **Respondida** — ADR-007 §3.6 |
| 4 | Rate limit, CAPTCHA, respostas neutras e recuperação de senha sem e-mail obrigatório | **Respondida** — ADR-007 §3.4 e §3.8 |
| 5 | Se as escritas da Secretaria (FR25) e a aprovação de cadastros (FR24) aplicam a janela de FR20 | **Respondida** — Suprimentos aplica; Clientes (inclusive aprovação) não (D4; ADR-005 §2.10, ADR-007 §3.6) |
| 6 | Token público da Story 2.17 | **Respondida** — ADR-006 §2.1 a §2.3 |
| 7 | Contrato de URL `/aprovacao/:id` → `:token` (e demais rotas públicas) | **Respondida** — ADR-006 §2.6 (D6) |
| 8 | Atualização de `docs/architecture/supabase-persistence-model.md` | **Em aberto** — não consta dos ADRs |

**Pendência de negócio remanescente:** texto do termo de consentimento LGPD (finalidade e prazo de 3 anos) — `@po`/jurídico (ADR-007 §3.9).

**Pendência de arquitetura não relacionada a esta mudança:** OQ-3 (restrição por rede, FR20) continua em aberto, sem alteração.

---

## 7. Plano de ação e handoff

| # | Ação | Responsável | Bloqueia? |
|---|---|---|---|
| 1 | Refletir nas stories as decisões da v1.5 conforme as tabelas "Impacto nas Stories" dos ADR-005, ADR-006 e ADR-007 (em andamento) | `@sm` → validação `@po` | Sim — stories afetadas não saem de Draft sem isso |
| 2 | Redigir o termo de consentimento LGPD | `@po` + jurídico | Bloqueia a entrada em produção do cadastro público (2.20a/2.20c) |
| 3 | Atualizar `supabase-persistence-model.md` | `@architect` | Não |
| 4 | DDL do índice único de baixa, `pdv_caixas` e RPCs do ADR-005 §2.10/§2.11 | `@data-engineer` | Sim — pré-requisito das Stories 2.8, 2.14 e 2.19 |
| 5 | Checklist de ambiente "signup público desligado" | `@devops` | Sim — condição do gate G2.8 (ADR-007 §3.5) |
| 6 | Verificar o gate G2.8 antes de liberar o cadastro público e remover a proibição da Story 1.1 | `@qa` + `@architect` | Sim |

### Critérios de sucesso desta mudança

- Nenhum item de OS é baixado duas vezes (teste do índice único).
- Nenhuma venda da Secretaria acontece fora da janela sem caixa do dia aberto.
- Nenhuma rota pública aceita `:id`.
- Mecânico não lê `estoque_movimentacoes` nem requisições de outros mecânicos.
- Cadastro pendente ou recusado não lê nenhuma linha (M12); pendente expira em 30 dias; recusado não bloqueia novo cadastro do titular.

---

## 8. Change Checklist — registro de execução

| Seção | Status | Nota |
|---|---|---|
| 1. Understand the Trigger & Context | `[x]` | Duas rodadas de decisão do proprietário; conflito FR23 × D5 identificado pelo ADR-005 |
| 2. Epic Impact Assessment | `[x]` | Epic 1 inalterado; Epic 2 ampliado (FR24, FR25, caixa do dia) e Story 2.20 dividida |
| 3. Artifact Conflict & Impact Analysis | `[x]` | PRD alterado; stories com o `@sm`; `supabase-persistence-model.md` em aberto |
| 4. Path Forward Evaluation | `[x]` | Ajuste direto; Opção 1 da baixa e Opção B do login registradas |
| 5. Sprint Change Proposal Components | `[x]` | Este documento |
| 6. Final Review & Handoff | `[x]` | Decisões dadas pelo proprietário (modo YOLO); handoff para `@sm`, `@po`, `@data-engineer`, `@devops`, `@qa` |

**Restrições respeitadas:** nenhum código implementado · nenhuma story ou ADR editado · nenhum commit feito · Artigo IV (No Invention) — cada mudança rastreia a uma decisão do proprietário, ao PRD ou a um ADR.

**`[AUTO-DECISION]` registradas nesta execução:**
- Criar este documento cobrindo v1.4 e v1.5 num único arquivo → sim (motivo: o PRD v1.4 já apontava para este nome de arquivo, e as duas rodadas são do mesmo dia).
- Itens a–e e g da OQ-5 → registrados como **mantidos** no fechamento da OQ-5 (motivo: a instrução foi marcar a OQ-5 como resolvida; só os itens f e h têm decisão explícita do proprietário nos ADRs). Se o proprietário discordar de algum, reabrir o item específico.
