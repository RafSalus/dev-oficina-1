# Sprint Change Proposal — dev-oficina

> **Task:** `correct-course.md` · **Checklist:** `.aiox-core/product/checklists/change-checklist.md`
> **Modo:** YOLO (decisões autônomas registradas como `[AUTO-DECISION]`)
> **Agente:** Morgan (@pm, Strategist) · **Data:** 2026-09-21
> **Artefato afetado:** `docs/prd.md` (v1.0 → v1.3)
> **Status:** **APLICADO** — as edições já estão no PRD, não são propostas pendentes.

---

## 1. Understand the Trigger & Context

### 1.1 Gatilho da mudança

Não é uma story falha nem um beco técnico: é **entrada de stakeholder**. O proprietário da oficina — ausente durante a redação do PRD v1.0, lacuna registrada à época em § 7.5 e no Apêndice A como issue HIGH ("stakeholder não validado") — revisou o documento e apresentou 7 requisitos de negócio.

**Natureza do gatilho:** `[x] Requisito recém-descoberto` · `[x] Pivô necessário com base em nova informação`

Vale nomear o que isso significa de positivo: o PRD v1.0 derivou prioridades de **evidência técnica**, não de negócio, e declarou essa fraqueza. O stakeholder fechou a lacuna. Este correct-course é o mecanismo funcionando como deveria, não um erro sendo corrigido.

### 1.2 Impacto inicial observado

Cinco dos sete pedidos são absorvíveis sem alterar a tese do PRD. Dois a alteram materialmente:

- **Item 6 (rede de cotação)** é feature de produto e **quebra o princípio "zero features novas"** declarado em § 1.3.
- **Item 1 (mobile de verdade)** é reescrita de UI, também fora do hardening.

Sem tratamento explícito, ambos seriam executados informalmente, por fora do documento — exatamente o padrão que gerou as 16 dívidas do `brownfield-architecture.md`.

### 1.3 Evidência coletada (verificação direta no código, não inferência)

| Achado | Evidência | Consequência |
|---|---|---|
| **MFA está pela metade e causa lockout** | `AdminAuthContext.jsx:41` chama `client.auth.mfa.getAuthenticatorAssuranceLevel()` e define `mfa_setup_required`/`mfa_verify_required`; `GestaoEntrarPage.jsx:45,49` redireciona para `/gestao/mfa/configurar` e `/gestao/mfa/verificar`; **nenhuma dessas rotas existe em `App.jsx`**; `grep` por `mfa.enroll|challenge|verify` retorna zero. Mensagens de UI já existem em `constants/company.js:216-228`. | O item 2 **não é feature nova** — é caminho quebrado. Hoje, usuário com MFA ativo no Supabase fica travado fora do sistema. Reclassificado como hardening → Epic 1. |
| **Supabase suporta MFA TOTP nativamente** | `supabase.auth.mfa.*` (`enroll`, `challenge`, `verify`, `listFactors`, `unenroll`), AAL1/AAL2. `@supabase/supabase-js ^2.116.0` já instalado. | Confirmado: nenhuma biblioteca adicional necessária. Pergunta do usuário respondida: **sim, dá para fazer com Supabase**. |
| **Portal do cliente vaza dados pessoais** | `ClienteContext.jsx:19-20` — `// Padrão: Edgar Amaral da Silveira`, retorna `MOCK_CLIENTES_VEICULOS[0]` quando não há cliente selecionado. | Qualquer visitante anônimo de `/cliente/*` vê dados, veículos e OSs de um cliente real. Risco R-15, crítico. |
| **Auto-cadastro de cliente não existe hoje** | `grep -rn "signUp" src/` → **zero ocorrências**. | O item 7 **formaliza e trava** o comportamento atual em vez de construir algo novo. Custo próximo de zero, valor alto. |
| **Duplicação mobile quantificada** | 44 arquivos `.jsx` sob diretórios `mobile/`; breakpoint único em `src/hooks/useIsMobile.js:3`. | Item 1 confirmado como epic próprio, não story. |

---

## 2. Epic Impact Assessment

### 2.1 Epic 1 (Fundação) — **ampliado, não redefinido**

Continua completável e continua sendo a primeira onda. Absorveu MFA (Story 1.9), a trava anti-vazamento do portal do cliente (ACs da Story 1.1) e a contenção de duplicação mobile (NFR11, custo zero). A tese "fundação antes de feature" sobrevive intacta.

### 2.2 Epic 2 (Persistência) — **ampliado nos gates**

Dois gates novos: **G2.6** (enforcement server-side de horário/dispositivo) e **G2.7** (mascaramento, auditoria e política LGPD). O escopo indicativo ganhou a emissão de credencial de acesso do cliente, que depende de persistência real.

### 2.3 Epics novos — **roadmap declarado**

- **Epic 3A** — Mobile Operacional & Cliente (fast track: mecânico no pátio, cliente no celular).
- **Epic 4** — Rede de Cotação de Auto Peças e Terceirizados.
- **Epic 3B** — Mobile administrativo remanescente.

### 2.4 Resumo do impacto

A estrutura passou de **2 epics sequenciais** para **uma estratégia de ondas de valor**. Nenhuma story existente foi invalidada; nenhuma foi descartada. O sequenciamento por risco crescente permanece a espinha dorsal.

---

## 3. Artifact Conflict & Impact Analysis

| Artefato | Conflito? | Ação |
|---|---|---|
| `docs/prd.md` | **Sim** — § 1.3 declarava "New Feature Addition: explicitamente fora de escopo" | Editado (v1.1 → v1.3). Ver § 5. |
| `docs/brownfield-architecture.md` | Não | Nenhuma afirmação técnica contradita; ao contrário, os itens 1, 2 e 7 **confirmam** dívidas já catalogadas. |
| `SYSTEM_RULES.md` | Não | Nenhuma das 16 regras alterada. Regra 10 (16px) e Regra 14 (Gestão↔Secretaria) reforçadas em CR5 e FR22. |
| Stories do Epic 1 | Parcial | Story 1.1 ganhou ACs e nota de limite; Story 1.8 ganhou AC; Stories 1.9-1.11 criadas. |
| Código-fonte | **Nenhuma alteração** | Nada foi implementado. `@pm` não toca código. |

### 3.1 Referências órfãs corrigidas na v1.3

A consolidação v1.2 removeu as seções § 4.3, § 4.4 e § 4.5, deixando três ponteiros quebrados que teriam confundido `@sm` e `@dev`:

- Story 1.8 AC2 citava "Risco R-7" — **sem tabela de riscos no documento**.
- § 2.4 citava CR5 — **CR5 não existia** (§ 2.3 parava em CR4).
- § 2.4 citava "Apêndice B" — **só existe Apêndice A**.

Todas corrigidas. A avaliação de riscos foi restaurada e ampliada de R-11 para **R-16**.

---

## 4. Path Forward Evaluation

| Opção | Avaliação | Veredito |
|---|---|---|
| **1. Ajuste direto / integração** | Absorver os 7 itens no PRD existente: 5 como FR/NFR/AC dentro dos epics atuais, 2 como epics novos gated. Preserva todo o trabalho feito. Esforço: edição documental. | **✅ ESCOLHIDA** |
| **2. Rollback** | Nada foi implementado — não há o que reverter. | ➖ N/A |
| **3. Re-scoping / PRD V2** | O MVP original (Epic 1) continua válido e não foi contradito por nenhum dos 7 itens. Reescrever seria descartar um documento correto por mudança de *adição*, não de *direção*. | ❌ Rejeitada |

### Caminho recomendado e aplicado

**Ajuste direto com declaração honesta de mudança de natureza do documento.** O PRD deixa de ser "hardening puro" e passa a ser **"hardening (Epics 1-2) + roadmap de produto declarado e bloqueado (Epics 3A, 4, 3B)"**. O princípio *zero features novas* **permanece vinculante para os Epics 1 e 2**; o que mudou é que o trabalho futuro passou a estar escrito e sequenciado em vez de indefinido.

> `[AUTO-DECISION]` Por que declarar o roadmap em vez de recusá-lo? → Porque recusá-lo não impede que aconteça. O proprietário quer a rede de cotação; deixá-la fora do documento só garante que ela chegue sem análise de dependência, no meio do Epic 1. Escrita e bloqueada, o custo de antecipá-la fica explícito e negociável. **Risco assumido e mitigado por R-16.**

---

## 5. Edições aplicadas em `docs/prd.md`

### 5.1 Requisitos criados

| ID | Conteúdo | Origem |
|---|---|---|
| **FR15** | MFA TOTP no portal de Gestão via `supabase.auth.mfa.*`, sessão AAL2, rotas `/gestao/mfa/*` existentes e funcionais | Item 2 |
| **FR16** | Caminho documentado de recuperação de MFA (anti-lockout) | Item 2 + R-12 |
| **FR17** | Proibição absoluta de auto-cadastro público de cliente | Item 7 |
| **FR18** | Ativação de cliente via WhatsApp oficial; eliminação do mock default | Item 7 + OQ-2 |
| **FR19** | Mobile com dinâmica própria (Single Logic Adaptive UI) | Item 1 |
| **FR20** | Política de acesso: Secretaria/Mecânico 08h-19h com dispositivo pareado; Gestão 24/7 com MFA. **Dimensão rede: não agendada** | Item 4 |
| **FR21** | Rede de cotação com auto peças e terceirizados — alto nível, Epic 4 | Item 6 |
| **NFR11** | Contenção de duplicação mobile (proibição de novos arquivos em `mobile/`) | Item 1 |
| **NFR12-NFR16** | Menor privilégio, LGPD, minimização no storage local, mascaramento na UI, auditoria imutável | Item 3 |
| **NFR17-NFR18** | Decomposição de arquivos > 1.000 linhas; lógica única com apresentação adaptativa | Itens 1 e 5 |
| **CR5** | Preservação de PWA/breakpoint/Regra 10 na evolução mobile e dos estados de auth no MFA | Itens 1 e 2 |

### 5.2 Stories

- **Story 1.9 — MFA TOTP** (nova): 7 ACs, incluindo QR Code, `challenge`+`verify`, `unenroll` e procedimento de emergência no README.
- **Story 1.10 — Módulo de Funcionários** (nova).
- **Story 1.11 — Decomposição de arquivos monolíticos** (nova): atende o item 5.
- **Story 1.1** — ACs 9 e 10 adicionados (proibição de auto-cadastro; regra de horário) + **nota de limite** declarando que o guard é client-side e que a restrição por rede não pertence a esta story.
- **Story 1.8** — reforçada para o item 5 (higiene e organização).

### 5.3 Riscos criados (§ 4.5, restaurada)

**R-12** lockout de MFA (🔴) · **R-13** base de clientes em texto claro, LGPD (🔴) · **R-14** controle de rede não resolvido e falsa sensação de segurança (🔴) · **R-15** identidade mock vazando dados no portal do cliente (🔴) · **R-16** pressão para antecipar o roadmap (🟠).

### 5.4 Gates e métricas

- **G2.6** — enforcement server-side de horário e dispositivo (`@architect`).
- **G2.7** — mascaramento, auditoria e política LGPD (`@architect`).
- **M10-M14** — bloqueio fora de horário, MFA funcional, zero auto-cadastro, zero novas duplicações mobile, ≥10 usuários concorrentes.

---

## 6. O que fica em aberto para `@architect`

### OQ-3 — Restrição de acesso por rede da oficina (item 4) — **NÃO RESOLVIDO**

Único ponto do pedido do stakeholder que **não** virou requisito executável. Registrado em § 4.6 do PRD com o raciocínio completo. Em resumo:

1. O acesso é **browser → Supabase PostgREST**. Checagem de IP ou token de dispositivo no front-end é **dissuasão de UI, não controle de acesso** — devtools contornam; `dev_oficina_device_token` em `localStorage` é copiável.
2. Enforcement real exige camada externa: proxy/WAF com allowlist, Cloudflare Access/Zero Trust, Edge Function com validação server-side, VPN ou atestação de dispositivo. Cada uma com custo e trade-off distintos.
3. **IP fixo não é dado.** Link comercial de pequeno porte costuma ter IP dinâmico — a allowlist pode exigir contratação de IP fixo, decisão de infraestrutura da oficina.
4. **Conflito com FR19:** mecânico em 4G no pátio e no Leva e Traz, e a Gestão com acesso 24/7 de qualquer lugar, estão fora da rede por definição. O ADR precisa decidir o recorte por perfil.

**Decisão:** FR20 (dimensão rede) documentado como requisito de negócio, **não agendado**, não bloqueante para Epics 1 e 2. Nenhuma story de allowlist deve ser criada ou aceita antes do ADR. Prompt de handoff pronto em § 11 do PRD.

> O risco mais sério aqui não é deixar de implementar — é implementar mal. Uma tela de bloqueio por rede que não bloqueia nada cria confiança indevida e pode justificar relaxar os controles que realmente protegem (auth, MFA, RLS). Ver R-14.

---

## 7. Plano de ação e handoff

| # | Ação | Responsável | Bloqueia? |
|---|---|---|---|
| 1 | Restaurar as 5 specs funcionais deletadas em `docs/` **antes de qualquer commit** (R-7) | `@devops` | Sim — perda de contexto de negócio |
| 2 | Validar o PRD v1.3 e priorizar o backlog do Epic 1 | `@po` | Não |
| 3 | Quebrar as Stories 1.1-1.11 em stories formais | `@sm` | Não |
| 4 | **ADR de OQ-3** (enforcement de rede) + gates G2.1-G2.7 | `@architect` + `@data-engineer` | Bloqueia apenas FR20 e o Epic 2 |
| 5 | Implementar respeitando **1.4 antes de 1.7 e 1.11** (R-5) | `@dev` | Sim — sequenciamento rígido |
| 6 | Gates de qualidade por story, com atenção às regras de UI | `@qa` | Não |

### Critérios de sucesso desta mudança

A mudança terá funcionado se, ao fim do Epic 1: nenhuma rota interna abre sem login (M1); o MFA funciona de ponta a ponta sem lockout (M11); nenhum visitante anônimo enxerga dados de cliente (M12 + R-15 fechado); a contagem de arquivos em `mobile/` não subiu (M13); e **nenhuma linha de código de allowlist de rede foi escrita sem ADR** (R-14 respeitado).

---

## 8. Change Checklist — registro de execução

| Seção | Status | Nota |
|---|---|---|
| 1. Understand the Trigger & Context | `[x]` | Entrada de stakeholder; 5 achados verificados no código |
| 2. Epic Impact Assessment | `[x]` | Epic 1 ampliado; Epic 2 com 2 gates novos; 3 epics de roadmap criados |
| 3. Artifact Conflict & Impact Analysis | `[x]` | Só `docs/prd.md` alterado; 3 referências órfãs corrigidas |
| 4. Path Forward Evaluation | `[x]` | Ajuste direto escolhido; rollback N/A; PRD V2 rejeitado |
| 5. Sprint Change Proposal Components | `[x]` | Este documento |
| 6. Final Review & Handoff | `[x]` | Aprovação do stakeholder dada no próprio pedido de inclusão (modo YOLO); handoff para `@architect` e `@po` definido |

**Restrições respeitadas:** nenhum código implementado · nenhum commit feito · Artigo IV (No Invention) respeitado — toda afirmação técnica rastreia a arquivo:linha ou a capacidade documentada do Supabase; a única pendência sem solução foi **declarada como pendência** (OQ-3) em vez de inventada.
