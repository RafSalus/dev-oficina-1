# Mecânica Gabriel (dev-oficina) — Brownfield Enhancement PRD

> **Enhancement:** Fundação de Produção, Ciclo Operacional Completo do MVP 1 e Arquitetura Modular  
> **Autor:** Morgan (@pm, Investigative Product Strategist) · **Modo:** Alinhado com Stakeholder  
> **Insumos:** Diretrizes do Proprietário (2026-09-21), `SYSTEM_RULES.md`, `docs/brownfield-architecture.md` v1.0

---

## 1. Intro Project Analysis and Context

### 1.1 Existing Project Overview

#### Analysis Source
**Document-project output disponível em:** `docs/brownfield-architecture.md` (386 linhas, confiança Alta para stack/rotas/dívida técnica, gerada por leitura direta do codebase em 2026-09-21).

Este PRD referencia diretamente o código-fonte inspecionado e as diretrizes do stakeholder, vinculando requisitos à realidade técnica do repositório (Artigo IV — No Invention).

#### Current Project State
`dev-oficina` é um **ERP web/PWA de oficina mecânica** ("Mecânica Gabriel", Apucarana-PR) concebido para cobrir o ciclo completo de atendimento automotivo: agenda → abertura de OS → diagnóstico → cotação de peças → aprovação do cliente → execução → PDV → estoque/compras.

Estado técnico real:
- **SPA React 19 + Vite 6**, 100% client-side, ~65.800 linhas em 185 arquivos `src/`.
- **Sem backend próprio.** Todo o estado de domínio vive em **~30 chaves de `localStorage`** (prefixo `dev_oficina_`). Os módulos `constants/*` e `mockOrdensAbertas.js` atuam simultaneamente como seed, repositório e camada de regra de negócio.
- **Supabase presente apenas para Auth** (sessão/MFA/reset). Nenhum `.from()` ou `.rpc()` no código.
- **4 PWAs no mesmo bundle** (Gestão, Secretaria, Mecânico, Cliente), diferenciados por prefixo de rota + troca dinâmica de manifest (`src/lib/pwaPortals.js`).
- **16 regras de UI/arquitetura vinculantes** em `SYSTEM_RULES.md`.
- **Presença de arquivos monolíticos** com mais de 1.000 a 2.000 linhas de código (ex: `MecanicoDashboardPage.jsx` com 2.052 linhas, `mockOrdensAbertas.js` com 1.023 linhas).
- **Duplicação de telas inteiras** entre desktop e mobile (44 arquivos `.jsx` sob 16 diretórios `src/**/mobile/`).

### 1.2 Available Documentation Analysis
- [x] Tech Stack Documentation — `docs/brownfield-architecture.md` § Actual Tech Stack
- [x] Source Tree/Architecture — § Source Tree and Module Organization
- [x] Coding Standards — `SYSTEM_RULES.md` (16 regras mandatórias)
- [x] API Documentation — N/A por ausência de backend próprio
- [x] External API Documentation — FIPE, ViaCEP, Google Maps, WhatsApp (`wa.me`), Supabase Auth
- [x] UX/UI Guidelines — `SYSTEM_RULES.md` (regras 1 a 16)
- [x] Technical Debt Documentation — `docs/brownfield-architecture.md` § Technical Debt (16 itens)

### 1.3 Enhancement Scope Definition

#### Enhancement Type
- [x] **Bug Fix and Stability Improvements** (guards de rota, segredos removidos, testes automatizados)
- [x] **Technology Stack Upgrade** (ESLint + Vitest no pipeline)
- [x] **Integration with New Systems** (Supabase Postgres + RLS como persistência real — Epic 2)
- [x] **Full Operational Cycle Completion — MVP 1** (fechamento ponta a ponta dos 10 domínios: Funcionários a PDV e OS completa)
- [x] **Architectural Refactoring** (decomposição de arquivos monolíticos > 1000 linhas e fim da duplicação `mobile/`)
- [x] **Product Roadmap Gated** (Epic 3A: Mobile Operacional/Cliente, Epic 4: Rede de Cotação, Epic 3B: Mobile Administrativo)

#### Enhancement Description
O primeiro MVP do sistema entrega **o ciclo operacional completo da oficina em funcionamento real**, interligando todos os fluxos de negócio necessários para a operação diária da Mecânica Gabriel:
$$\begin{aligned}
&\textbf{Funcionários} \rightarrow \textbf{Fornecedores e Peças} \rightarrow \textbf{Estoque e Compras} \rightarrow \textbf{Cliente e Veículo} \\
&\rightarrow \textbf{Agenda Dinâmica} \rightarrow \textbf{Ordem de Serviço (Ciclo Completo)} \rightarrow \textbf{PDV (Recebimento e Baixa)}
\end{aligned}$$

Além de fechar as dívidas críticas de segurança (rotas desprotegidas, credenciais expostas, rotas de MFA quebradas e vazamento de dados), este PRD estabelece a **decomposição dos arquivos monolíticos** e institui o modelo de **Single Logic, Adaptive Presentation** para desktop e mobile, erradicando a criação de novas telas duplicadas.

### 1.4 Goals and Background Context

#### Goals
- **Ciclo Operacional Completo:** Habilitar a operação real do balcão ao pátio da oficina no primeiro MVP, incluindo o novo módulo de **Cadastro de Funcionários** integrado à Agenda e à atribuição de Ordens de Serviço.
- **Segurança de Acesso e Perfil:** Bloquear rotas não autenticadas; exigir autenticação em dois fatores (MFA TOTP) para o Administrador; aplicar janela operacional (08:00 às 19:00) com primeiro acesso na oficina para Secretaria e Mecânico, garantindo acesso irrestrito 24/7 para a Gestão.
- **Proteção de Dados e LGPD:** Eliminar identidades mock públicas (`ClienteContext`); proibir qualquer auto-cadastro público de clientes; ativar primeiro acesso de clientes via WhatsApp oficial.
- **Qualidade e Refatoração:** Decompor arquivos com mais de 1.000 linhas (`MecanicoDashboardPage.jsx`, `mockOrdensAbertas.js`, etc.) em módulos < 350 linhas; instalar suíte de testes (`npm test`) e linter (`npm run lint`).
- **Conformidade `SYSTEM_RULES.md`:** Cumprimento rigoroso das 16 regras vinculantes (Single-Screen Workspace, Branco/Preto/Azul sem verde, `react-select`, `react-imask`, modais categorias A/B/C, scrollbars invisíveis).

### 1.5 Change Log

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|--------|
| Criação | 2026-09-21 | 1.0 | PRD brownfield inicial derivado de `docs/brownfield-architecture.md` v1.0 | Morgan (@pm) |
| Correct Course | 2026-09-21 | 1.1 | Incorporação inicial dos 7 pedidos do stakeholder via `correct-course`. | Morgan (@pm) |
| Correct Course (fechamento) | 2026-09-21 | 1.3 | **Restauração da avaliação de riscos e formalização da pendência arquitetural.** A consolidação v1.2 havia removido as seções § 4.3, § 4.4 e § 4.5, deixando referências órfãs (R-7 citado na Story 1.8 sem tabela de riscos; CR5 citado em § 2.4 sem definição; "Apêndice B" inexistente). Adicionados: § 4.3 (padrões de código), § 4.4 (deploy e configuração), § 4.5 (riscos R-1 a R-16, incluindo R-12 lockout de MFA, R-13 base de clientes exposta, R-14 controle de rede não resolvido, R-15 identidade mock do portal do cliente, R-16 pressão por antecipar roadmap), CR5, **OQ-3** (restrição por rede — em aberto, requer ADR) e nota de limite na Story 1.1. Registro em `docs/sprint-change-proposal-2026-09-21.md`. | Morgan (@pm) |
| Master Consolidation | 2026-09-21 | 1.2 | **Aprovação integral do Stakeholder e consolidação do MVP 1.** Adição do Ciclo Completo de Oficina (FR22 Funcionários, FR23 Ciclo da OS), resolução de horários (08h-19h operacional vs Admin 24/7 com MFA em FR20), primeiro acesso de cliente via WhatsApp oficial (FR17/FR18), decomposição obrigatória de arquivos monolíticos >1000L (NFR17, Story 1.11), arquitetura Single Logic Adaptive UI (NFR18), detalhamento completo das Stories 1.9, 1.10 e 1.11, formalização de § 4.6 (OQ-1 e OQ-2), gates G2.6-G2.7, Roadmap em Ondas (Epic 3A, 4 e 3B) e métricas M10-M14. | Morgan (@pm) |

---

## 2. Requirements

### 2.1 Functional Requirements

- **FR1:** O sistema DEVE bloquear o acesso a qualquer rota sob `/gestao/*`, `/secretaria/*` e `/mecanico/*` quando não houver sessão autenticada válida, redirecionando para a tela de login correspondente e preservando a rota de destino para retorno pós-login.
- **FR2:** O sistema DEVE bloquear o acesso a `/cliente/*` (exceto `/cliente/entrar`) sem identidade de cliente estabelecida.
- **FR3:** As rotas públicas por design — `/`, `/cliente/entrar`, `/gestao/entrar`, `/gestao/recuperar-senha`, `/gestao/acesso-negado`, `/cotacao/:id`, `/aprovacao/:id`, `/orcamento/:id`, `/vistoria/:id` — DEVEM permanecer acessíveis sem autenticação.
- **FR4:** Durante a verificação de sessão, o sistema DEVE exibir estado de carregamento e NÃO DEVE renderizar conteúdo protegido nem piscar a tela de login.
- **FR5:** O cliente Supabase DEVE ler URL e chave exclusivamente de variáveis de ambiente (`import.meta.env`), sem qualquer valor literal de fallback.
- **FR6:** Quando as variáveis de ambiente estiverem ausentes, o sistema DEVE manter o estado `unconfigured` e emitir aviso em console em desenvolvimento.
- **FR7:** O repositório DEVE expor os scripts `npm run lint` e `npm test` funcionais, e o `AGENTS.md` DEVE refletir exatamente os scripts existentes.
- **FR8:** A máquina de estados da Ordem de Serviço (`statusTransicao.js`, `kanbanColunas.js`) DEVE possuir testes automatizados cobrindo transições válidas, salto de etapa e gates de bloqueio.
- **FR9:** O acesso a dados de cada domínio DEVE ocorrer através de interface de repositório explícita (`carregar*`/`salvar*`/mutadoras), sem acesso direto a `localStorage` a partir de componentes de UI.
- **FR10:** O sistema DEVE utilizar um único mecanismo de notificação de eventos — `sonner`, posicionado `top-right` — eliminando o banner concorrente de `NoticeContext`.
- **FR11:** Todos os campos de seleção DEVEM usar `react-select`; as ocorrências remanescentes de `<select>` nativo DEVEM ser convertidas (Regra 6).
- **FR12:** O uso da cor verde DEVE ser restrito exclusivamente ao ícone/botão da marca WhatsApp (Regra 7).
- **FR13 (Epic 2):** O sistema DEVE persistir todas as entidades de domínio em Supabase Postgres gerenciado, com RLS por perfil.
- **FR14 (Epic 2):** O sistema DEVE fornecer migração que importe o estado de `localStorage` para o banco Postgres sem perda de dados.
- **FR15 (MFA TOTP no Portal de Gestão — Story 1.9):** O portal de Gestão DEVE exigir verificação em duas etapas via Supabase Auth MFA (`enroll`, `challenge`, `verify`, `listFactors`, `unenroll`), elevando a sessão a AAL2. As rotas `/gestao/mfa/configurar` e `/gestao/mfa/verificar` DEVEM existir no roteador `App.jsx` e funcionar plenamente.
- **FR16 (Recuperação de MFA):** DEVE existir caminho documentado de recuperação para perda do dispositivo autenticador, evitando lockout permanente do administrador.
- **FR17 (Cadastro de Cliente Exclusivo da Oficina):** O sistema NÃO DEVE disponibilizar auto-cadastro público de cliente (`signUp`). Toda conta de cliente DEVE ser originada no balcão da oficina (Gestão ou Secretaria).
- **FR18 (Ativação de Cliente via WhatsApp):** O primeiro acesso do cliente DEVE ser ativado por link/código enviado pelo WhatsApp oficial da oficina (`wa.me`), eliminando o mock default (`ClienteContext`) que exibia dados de clientes anônimos.
- **FR19 (Mobile com Dinâmica Própria):** O sistema DEVE ser operável em smartphone com dinâmica adaptada (alvos de toque confortáveis, densidade reduzida, fluxos ágeis e sem zoom indevido), utilizando arquitetura Single Logic Adaptive UI.
- **FR20 (Horário Operacional e Política de Acesso):**
  - **Secretaria e Mecânico:** Acesso restrito aos dias úteis e horário comercial (**08:00 às 19:00**). O primeiro acesso/autorização do dispositivo deve ocorrer presencialmente na oficina.
  - **Administrador (Gestão):** Acesso irrestrito (**24/7 de qualquer lugar**), protegido por MFA AAL2.
- **FR21 (Rede de Cotação — Epic 4):** O sistema DEVE permitir cotar peças junto a auto peças parceiras e serviços com terceirizados diretamente da OS, com comparação de preços e prazos.
- **FR22 (Módulo de Funcionários — MVP 1, Story 1.10):** O sistema DEVE disponibilizar cadastro completo de funcionários (nome, CPF, telefone, cargo: mecânico/secretária/gerente, comissão sobre peças e serviços, horário de trabalho e status ativo/inativo). Os mecânicos ativos cadastrados DEVEM abastecer dinamicamente as listas de seleção da Agenda e das Ordens de Serviço.
  - *Restrição de Perfil (Regra 14):* Módulo visível exclusivamente para o Administrador (Gestão), com acesso bloqueado para a Secretária.
- **FR23 (Ciclo Completo da OS — MVP 1):** O fluxo da Ordem de Serviço DEVE funcionar de ponta a ponta: Abertura (checklist/fotos) ➔ Diagnóstico ➔ Orçamento (peças e serviços) ➔ Aprovação do Cliente ➔ Execução pelo Mecânico ➔ Conclusão ➔ Pagamento no PDV com baixa automática de estoque das peças utilizadas.

### 2.2 Non-Functional Requirements

- **NFR1:** Cumprimento rigoroso das 16 regras de `SYSTEM_RULES.md` em todas as telas e componentes.
- **NFR2:** Tempo de carregamento inicial não deve degradar em mais de 200 ms com guards de rota.
- **NFR3:** O bundle de produção não deve crescer mais de 5% no Epic 1.
- **NFR4:** Zero segredos versionados no repositório; `.env.example` apenas com placeholders.
- **NFR5:** Suíte de testes locais executando em menos de 60 segundos.
- **NFR6:** Cobertura de testes: 100% nas funções de transição da OS e ≥ 60% nos repositórios de domínio.
- **NFR7:** ESLint em modo baseline para código legado e bloqueante para arquivos novos ou modificados.
- **NFR8:** PWA offline shell (`mg-oficina-shell-v1`) preservado; bump obrigatório de `CACHE_NAME` em mudanças de shell.
- **NFR9 (Epic 2):** Leituras de listagem em ≤ 1s no 4G; escritas otimistas na interface.
- **NFR10 (Epic 2):** Suporte a no mínimo 10 usuários simultâneos com consistência de dados.
- **NFR11 (Contenção de Duplicação Mobile):** Proibição estrita da criação de novos arquivos sob diretórios `src/**/mobile/`. Novas interfaces devem nascer responsivas ou usar subcomponentes adaptativos na mesma pasta.
- **NFR12 (Menor Privilégio):** Mecânico não tem acesso a dados financeiros globais; cliente só acessa suas próprias OSs e veículos.
- **NFR13 (LGPD e Dados Pessoais):** Dados de clientes protegidos por criptografia em trânsito (TLS) e repouso (Epic 2 Postgres), com política de descarte e finalidade documentadas.
- **NFR14 (Minimização no Storage Local):** Proibição de novos dados sensíveis desnecessários em `localStorage` e rotina de limpeza de cache no logout.
- **NFR15 (Mascaramento na UI):** CPF, CNPJ e telefones mascarados por padrão para perfis sem necessidade operacional do dado integral.
- **NFR16 (Auditoria — Epic 2):** Trilha imutável registrando autor, data/hora e valores anteriores em alterações de OS, clientes, estoque e valores financeiros.
- **NFR17 (Decomposição de Arquivos Monolíticos):** Nenhum arquivo de componente novo ou refatorado deve ultrapassar 350-400 linhas de código. Componentes gigantes como `MecanicoDashboardPage.jsx` (2.052 linhas) e `mockOrdensAbertas.js` (1.023 linhas) devem ser fatiados em submódulos e hooks de responsabilidade única.
- **NFR18 (Single Logic, Adaptive Presentation):** Toda funcionalidade que suporte desktop e mobile deve compartilhar o mesmo hook de lógica de negócio e validações, segregando apenas os subcomponentes de apresentação visual quando a densidade de tela exigir.

### 2.3 Compatibility Requirements

- **CR1 (APIs Externas):** Preservar integrações com FIPE (sem preços por regra), ViaCEP (`cep-promise`), Google Maps, WhatsApp (`wa.me`) e Supabase Auth.
- **CR2 (Compatibilidade de Dados):** Formato de dados em `localStorage` deve ser mantido compatível até a migração do Epic 2; a lista `STATUS_ORCAMENTO` (`mockOrdensAbertas.js:13`) NÃO PODE ter seus índices reordenados.
- **CR3 (SYSTEM_RULES.md Mandatório):**
  - R1: Limite fixo até o Footer.
  - R2: Sem scroll vertical na tela principal (`overflow-hidden`).
  - R3: Single-Screen Workspace (100% da altura útil).
  - R4: Paleta Branco, Preto e Azul (#0284c7) sóbria.
  - R5: Proibição absoluta do caractere '&' em textos visíveis.
  - R6: `react-select` obrigatório em 100% dos selects.
  - R7: Proibição de verde (exclusivo para WhatsApp).
  - R8 e R16: Notificações no topo à direita (`sonner`) e confirmações sobre o formulário ativo (in-modal).
  - R9: Modais redimensionáveis com persistência e limites das Categorias A, B e C, com cabeçalho rigidamente ancorado no topo.
  - R10: Proibição de zoom automático no mobile (inputs ≥ 16px).
  - R11: Barras de rolagem invisíveis visualmente (`scrollbar-width: none`).
  - R12: Proibição de botões redundantes na mesma tela.
  - R13: Máscaras de input obrigatórias (`react-imask`).
  - R14: Compartilhamento de telas Gestão e Secretaria (exceto Relatórios, Funcionários e Configurações).
  - R15: Botão "Fechar Aba" em visualizações abertas em nova aba.
- **CR4 (Portais PWA):** Preservar os 4 manifests PWA e o redirect standalone (`dev_oficina_last_portal_home`).
- **CR5 (Mobile e Autenticação):** Qualquer evolução da estratégia mobile (FR19, NFR18, Epics 3A/3B) DEVE preservar os 4 manifests PWA, o comportamento standalone, o breakpoint funcional de `max-width: 860px` (`src/hooks/useIsMobile.js:3`) enquanto a árvore duplicada existir, e a Regra 10 (`font-size` ≥ 16px em inputs mobile, forçado em `src/index.css` para impedir o zoom automático do Safari). A introdução do MFA (FR15) DEVE preservar os estados já existentes em `AdminAuthContext` (`unconfigured`, `mfa_setup_required`, `mfa_verify_required`) e o fluxo de recuperação de senha, sem trocar de biblioteca de autenticação.

### 2.4 Rastreabilidade dos Requisitos do Stakeholder

| # | Item Solicitado pelo Stakeholder | Classificação | Destino no PRD | Entrega |
|---|---|---|---|---|
| 1 | Versão mobile com dinâmica própria e sem duplicatas | Requisito de Produto + Arquitetura | FR19, NFR11, NFR18, CR5, Epic 3A (§ 8.1) | Contenção imediata + Onda 3A |
| 2 | Autenticação em dois fatores via Supabase (MFA) | Segurança Crítica | FR15, FR16, Story 1.9, Risco R-12 | Epic 1 |
| 3 | Segurança de dados do cliente e da oficina | Segurança & LGPD | NFR12 a NFR16, Gate G2.7 | Epic 1 + Epic 2 |
| 4 | Acesso restrito à oficina (08h-19h vs Admin 24/7) | Regra de Negócio & Segurança | FR20, OQ-1 (§ 4.6), Story 1.1 | Epic 1 + Epic 2 |
| 5 | Organização de pastas e quebra de arquivos gigantes | Engenharia & Qualidade | NFR17, NFR18, Stories 1.3, 1.5, 1.7, 1.8, 1.11 | Epic 1 |
| 6 | Sistema de cotação com auto peças e terceirizados | Feature Estratégica | FR21, Epic 4 (§ 8.2) | Pós-Epic 2 (Antecipado) |
| 7 | Cadastro de cliente exclusivo na oficina + WhatsApp | Regra de Negócio & Anti-fraude | FR17, FR18, OQ-2 (§ 4.6), Story 1.1 | Epic 1 |
| 8 | Cadastro de Funcionários funcional | Domínio de Negócio Novo | FR22, Story 1.10, Regra 14 | Epic 1 (MVP 1) |
| 9 | Ciclo Completo da OS até o PDV no primeiro MVP | Meta Central do Negócio | FR23, § 1.3, Seção 6 | Epic 1 (MVP 1) |
| 10 | Conformidade rigorosa com o SYSTEM_RULES.md | Diretrizes de UI/UX | CR3, NFR1, Apêndice A | Todas as Stories |

> **Pendência declarada do item 4.** A parte do pedido original que trata de **"acesso somente através da rede que a oficina está cadastrada"** foi parcialmente endereçada por FR20/OQ-1 (janela de horário + pareamento de dispositivo), mas o **controle por rede/IP em si permanece sem solução técnica validada** — ver **OQ-3** (§ 4.6) e risco **R-14** (§ 4.5). Nenhuma story deve implementar allowlist de rede antes do ADR de `@architect`.

---

## 3. User Interface Enhancement Goals

### 3.1 Design System e Linguagem Visual
O design system do sistema é baseado exclusivamente nos tokens definidos em `src/index.css`:
- **Cores:** Fundo neutro (`#f3f4f6` / `#f8fafc`), sidebar preta (`#000000`), cartões brancos (`#ffffff`) com bordas suaves (`#e4e7ec` / `#d0d5dd`), textos em navy/preto (`#101828`) e o azul oficial da marca (`#0284c7`, `#0369a1`, `#e0f2fe`).
- **Verde:** Exclusivo para o ícone e botão de disparo do WhatsApp.
- **Tipografia e Campos:** `react-select` padronizado e `react-imask` em todos os inputs formatados.
- **Espaço Útil:** Toda tela opera em layout de tela única (`h-full`, `overflow-hidden`), sem barra de rolagem principal na página.

### 3.2 Modais e Janelas Redimensionáveis (Regra 9)
Todos os formulários e janelas modais adotam ancoragem rígida de cabeçalho no topo e respeito estrito aos limites:
- **Categoria A (Compactos):** 520px - 640px (ex: Atualizar Km, Vincular Cliente, Recibo PDV).
- **Categoria B (Cadastros Padrão):** 800px - 860px (ex: **Funcionários**, Peças, Serviços, Fornecedores).
- **Categoria C (Workspaces Complexos):** 1040px - 1100px (ex: Nova Ordem de Serviço, Cotação, Compras com Itens).

---

## 4. Technical Constraints and Decisions

### 4.1 Stack Tecnológico Existente
- **Frontend:** React 19.3.0, Vite 6.2.0, react-router-dom 7.18.4, Tailwind CSS v4 via `@tailwindcss/vite`.
- **Bibliotecas Centrais:** `@phosphor-icons/react`, `sonner` (toasts), `react-select`, `imask`/`react-imask`, `@dnd-kit/*`.
- **Autenticação:** `@supabase/supabase-js` (Auth com suporte a TOTP MFA).
- **Qualidade a Introduzir:** ESLint + Vitest + `@testing-library/react`.

### 4.2 Arquitetura de Pastas e Arquivos (Single Logic, Adaptive Presentation)
A organização de pastas elimina a criação de arquivos redundantes sob `mobile/`:
```
src/
├── components/
│   ├── auth/                # Guards de autenticação, MFA e horário
│   └── shared/              # Modais redimensionáveis, selects e tabelas
├── pages/
│   ├── dashboard/
│   │   ├── funcionarios/    # Módulo de funcionários (Novo)
│   │   ├── agenda/          # Agenda dinâmica com fila prioritária
│   │   ├── nova-os/         # Formulário de abertura modularizado
│   │   ├── orcamento/       # Kanban de OS e Painel de Detalhes
│   │   ├── suprimentos/     # Peças, Fornecedores, Compras, Estoque
│   │   └── pdv/             # Ponto de Venda e baixa da OS
│   └── mecanico/            # Portal do mecânico fatiado em submódulos
└── repositories/            # Camada de abstração de dados (Repo Pattern)
```

### 4.3 Padrões de Código e Convenções

- **Idioma do domínio:** português (`obterOrdensAbertas`, `motivoImpedimentoDiagnostico`). Convenção mantida — não traduzir.
- **Padrão de repositório:** `CHAVE_STORAGE_X` + `SEED_X`/`X_INICIAIS` + `carregarX()`/`salvarX()` + mutadoras. O prefixo `mock` em código de produção é enganoso e é corrigido na Story 1.7.
- **Exports nomeados** para componentes (exceções históricas `App.jsx` e `AgendaPage` mantidas).
- **Precedência normativa:** `SYSTEM_RULES.md` prevalece sobre qualquer convenção genérica de React/Tailwind **e** sobre o preset `nextjs-react` de `.aiox-core/data/technical-preferences.md`, que não se aplica a este projeto.

> `[AUTO-DECISION]` Adotar o preset `nextjs-react` das technical-preferences? → **Não.** Motivo: o preset assume Next.js 16, TypeScript, Zustand e React Query; o projeto é Vite + React 19 em JS puro com estado local. Forçar o preset seria uma reescrita disfarçada de padronização. Divergência consciente registrada.

> `[AUTO-DECISION]` Migrar para TypeScript agora? → **Não.** Motivo: 185 arquivos / ~65k linhas sem tipos; a migração competiria por capacidade com as dívidas críticas e não mitiga nenhuma delas. Candidato a epic futuro, após a persistência estabilizar os contratos de dados (§ 10 Fora de Escopo).

### 4.4 Deploy, Configuração e Operação

- **Build:** `npm run build` permanece o alvo; `manualChunks` (`vendor`, `icons`, `supabase`) inalterado. `usePolling: true` do Vite e registro do service worker apenas em `import.meta.env.PROD` preservados.
- **CI:** este PRD introduz apenas o **gate de qualidade** (`lint`, `test`, `build`) em `.github/workflows` (Story 1.3). Pipeline de deploy para produção é dependência do Epic 2 e escala para `@devops` (gate G2.5).
- **Configuração:** `.env` local com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`; `.env.example` apenas com placeholders; variáveis do template AIOX segregadas das da aplicação.
- **Logging:** exigência mínima — todo `catch` **novo ou tocado** deve registrar erro. Instrumentação global (Sentry) fica fora de escopo; a variável `SENTRY_DSN` presente em `.env.example` é do template AIOX e não é usada.

### 4.5 Avaliação de Riscos e Mitigação

> Restaurada e ampliada na v1.3. Os riscos R-12 a R-16 decorrem diretamente dos requisitos incorporados na revisão de stakeholder.

| ID | Risco | Sev. | Mitigação |
|----|-------|------|-----------|
| R-1 | **Guard de rota quebra rotas públicas.** `/cotacao/:id`, `/aprovacao/:id`, `/orcamento/:id` e `/vistoria/:id` são enviadas por link a clientes e fornecedores externos; um guard amplo demais derruba o fluxo comercial. | 🔴 Crítico | Allowlist explícita das 9 rotas públicas em teste automatizado (Story 1.1 AC4); smoke test manual dos 4 links externos antes do merge. |
| R-2 | **Rotação da chave Supabase derruba login** durante a janela de troca. | 🟠 Alto | Rotacionar em janela combinada; validar login em dev com a chave nova antes de revogar a antiga. A chave é publicável/anon, mas o projeto real ficou exposto — **assumir comprometido**. |
| R-3 | **ESLint big-bang** em ~65k linhas gera milhares de erros e paralisa a entrega. | 🟠 Alto | NFR7: baseline de warnings para o legado, bloqueio apenas em arquivos tocados. |
| R-4 | **Divergência silenciosa desktop/mobile.** 44 arquivos duplicados; correção aplicada só em um lado passa despercebida. | 🟠 Alto | Critério de aceite "par mobile verificado" nas stories de UI; NFR11 impede que a duplicação cresça; Epic 3A elimina a causa. |
| R-5 | **Refatoração do núcleo de OS sem rede de segurança.** `mockOrdensAbertas.js` concentra ~30 funções de negócio em 1.023 linhas. | 🔴 Crítico | **Sequenciamento rígido:** Story 1.4 (testes) precede as Stories 1.7 e 1.11 (renomeação e decomposição). Nenhuma refatoração estrutural sem teste cobrindo. |
| R-6 | **Perda de dados na migração para Postgres.** Usuários podem ter operação real em `localStorage`. | 🔴 Crítico | Gate G2.4: ferramenta de export/import com dry-run e rollback; `localStorage` mantido como espelho read-only por um ciclo. |
| R-7 | **Documentação funcional apagada.** `git status` mostra 5 specs de módulo deletadas e não commitadas (~1.385 linhas) — única fonte de intenção de negócio de módulos incompletos. | 🟠 Alto | Restaurar do git **antes de qualquer commit** (`git checkout -- docs/`). Ação imediata (Story 1.8 AC2, § 11 item 1), não uma story futura. |
| R-8 | **Service worker serve versão antiga** após deploy (cache `mg-oficina-shell-v1`, stale-while-revalidate): usuários com PWA instalado continuariam sem guard. | 🟠 Alto | Bump obrigatório de `CACHE_NAME` em qualquer story que altere o shell; item de verificação no DoD. |
| R-9 | **Regressão em `STATUS_ORCAMENTO`.** Reordenar a lista quebra consumidores que usam `STATUS_ORCAMENTO[1]` como fallback. | 🟡 Médio | Teste travando a ordem dos índices (Story 1.4 AC3); comentário existente no código preservado. |
| R-10 | **Escopo escorrega para features** durante a remediação. | 🟡 Médio | § 10 Fora de Escopo é vinculante; feature nova exige decisão formal do proprietário com custo explicitado por `@pm`. |
| R-11 | **Quota de `localStorage` estoura** antes do Epic 2 (fotos e assinaturas em `dev_oficina_assinaturas_checklist`). | 🟠 Alto | Monitorar; se ocorrer, promover hotfix com compressão/descarte de imagens. Reforça a urgência do Epic 2. |
| R-12 | **MFA tranca o dono fora do próprio sistema.** Perda ou troca do celular sem caminho de remoção do fator deixa a oficina sem acesso à Gestão. Agravante atual: `GestaoEntrarPage.jsx:45,49` já redireciona para `/gestao/mfa/configurar` e `/gestao/mfa/verificar`, **rotas que não existem em `App.jsx`** — quem tiver MFA ativo no Supabase hoje já está em lockout. | 🔴 Crítico | FR16 + Story 1.9 AC7: caminho de recuperação documentado e **testado antes** de tornar o MFA obrigatório; ativação faseada; no mínimo dois usuários de Gestão com fator cadastrado; procedimento de `unenroll` via painel Supabase no README. |
| R-13 | **Base de clientes exposta em texto claro.** Sem guard e sem banco, todos os dados pessoais (CPF, telefone, endereço, placas, fotos, assinaturas) são legíveis no `localStorage` de qualquer navegador que abra a URL — exposição de dado pessoal com implicação de LGPD. | 🔴 Crítico | Stories 1.1 e 1.9 (acesso) + Epic 2 (persistência e RLS) + NFR12-NFR16. **Enquanto o Epic 1 não concluir, não cadastrar dados reais de clientes em ambiente publicamente acessível.** |
| R-14 | **Controle de acesso por rede (FR20) tratado como simples, e não é.** O pareamento por token em `localStorage` (OQ-1) é um controle **client-side e contornável** — o cliente Supabase fala direto com o PostgREST, então um navegador modificado ignora a checagem. Enforcement real exige validação server-side ou camada de rede. Somam-se: IP dinâmico é a norma em link comercial de pequeno porte, e mecânico em campo (Leva e Traz, 4G) fica fora da rede por definição — **conflito direto com FR19 (mobilidade)**. | 🔴 Crítico | **OQ-3 + gate G2.6.** No Epic 1, o guard de horário/dispositivo é tratado explicitamente como **dissuasão de UI, não como segurança**. Nenhuma story de allowlist de rede antes do ADR de `@architect`. |
| R-15 | **Identidade padrão no portal do cliente vaza dados.** `ClienteContext.jsx:19-20` (`// Padrão: Edgar Amaral da Silveira`) entrega os dados de um cliente real — veículos e ordens de serviço — a qualquer visitante anônimo de `/cliente/*`. | 🔴 Crítico | Story 1.1 AC3 + AC9 e FR18: remoção do fallback mock e guard efetivo. Teste automatizado cobrindo acesso anônimo a `/cliente/*`. |
| R-16 | **Roadmap declarado vira pressão para antecipar features.** Com Epics 3A e 4 escritos, cresce a tentação de iniciá-los antes da fundação — exatamente o padrão que gerou a dívida atual. | 🟠 Alto | Pré-requisitos rígidos declarados em § 8; antecipação exige decisão formal do proprietário, com o custo em dívida quantificado por `@pm` antes do aceite. |

**Estratégia de mitigação (resumo):** sequenciamento por risco crescente (segurança barata primeiro, arquitetura cara depois); rede de testes **antes** de qualquer refatoração estrutural (1.4 → 1.7/1.11); nenhuma story do Epic 1 depende de decisão arquitetural pendente; e os dois pontos ainda não resolvidos (FR20 rede, persistência) ficam atrás de gates formais em vez de virarem improviso em story.

### 4.6 Open Questions e Decisões de Negócio Consolidadas

> [!NOTE]
> **OQ-1: Como operar o controle de horário e local de acesso (FR20)?**  
> **Decisão Aprovada:**  
> 1. **Secretaria e Mecânico:** Acesso bloqueado fora do horário comercial (**08:00 às 19:00**). No primeiro acesso do funcionário na oficina, o navegador recebe um token de pareamento de dispositivo (`dev_oficina_device_token`). Tentativas de acesso fora do horário ou sem o dispositivo pareado exibem tela sóbria de bloqueio.  
> 2. **Administrador (Gestão):** Possui **acesso irrestrito (24/7 de qualquer lugar)** com bypass total de horário e rede, garantido pela exigência de MFA TOTP AAL2.  
> 3. **Epic 2:** A checagem de horário é validada no backend Supabase com fuso horário `America/Sao_Paulo`.

> [!NOTE]
> **OQ-2: Como o cliente recebe o seu primeiro acesso ao portal (FR18)?**  
> **Decisão Aprovada:**  
> O cliente é cadastrado presencialmente no balcão da oficina. Ao salvar o cadastro, o sistema gera uma mensagem padrão e abre o WhatsApp oficial da oficina (`wa.me`) contendo o link de ativação seguro. O cliente acessa o link, cadastra sua senha e acessa o portal `/cliente` com seus veículos e ordens de serviço. Auto-cadastro público é terminantemente proibido.

> [!WARNING]
> **OQ-3: Como restringir de fato o acesso à rede cadastrada da oficina (FR20)? — EM ABERTO, requer ADR de `@architect`.**
>
> **Status:** **NÃO RESOLVIDO.** Esta é a única pendência arquitetural do pedido do stakeholder. A OQ-1 resolveu a dimensão de *horário* e de *pareamento de dispositivo*; a dimensão de *rede* continua sem solução validada. Registrado para não ser confundido com decisão tomada.
>
> **Por que não é trivial (não inventar solução):**
> 1. O Supabase é consumido **direto do browser** via PostgREST. Qualquer verificação de IP, rede ou token de dispositivo feita no front-end é **dissuasão de interface, não controle de acesso** — um navegador com devtools ignora a checagem e fala direto com a API. O token `dev_oficina_device_token` em `localStorage` é copiável.
> 2. Enforcement real exige uma das camadas abaixo, cada uma com custo e trade-off próprios: proxy reverso / WAF com allowlist; Cloudflare Access ou equivalente Zero Trust; validação server-side em Edge Function com a lista de redes autorizadas; VPN; ou certificado/atestação de dispositivo.
> 3. **IP fixo não é dado.** Link comercial de pequeno porte costuma ter IP dinâmico (PPPoE). Uma allowlist de IP exige IP fixo contratado ou DNS dinâmico — decisão que envolve custo de infraestrutura da oficina, não apenas código.
> 4. **Conflito declarado com FR19.** Mecânico em campo (Leva e Traz), atendimento no pátio via 4G e o acesso 24/7 do Administrador ficam, por definição, fora da rede da oficina. Amarrar o sistema à rede e exigir mobilidade são requisitos que se contradizem parcialmente; o ADR precisa decidir o recorte (ex.: rede obrigatória apenas para Secretaria, exceção explícita para Mecânico e Gestão).
>
> **Pergunta objetiva para o `@architect` (gate G2.6):** dado que não há equipe de backend e que o acesso é browser→PostgREST, qual camada de enforcement de rede é viável e proporcional ao risco desta oficina — e qual o recorte por perfil que preserva FR19 e o acesso 24/7 da Gestão (FR20)?
>
> **Decisão de escopo `[AUTO-DECISION]`:** FR20 (dimensão rede) fica **documentado como requisito de negócio e não agendado**. Não bloqueia o Epic 1 nem o Epic 2. Nenhuma story de allowlist de rede deve ser criada ou aceita antes do ADR — o risco é entregar uma tela de bloqueio que dá **falsa sensação de segurança** (R-14) e que, pior, poderia justificar relaxar controles reais (auth, MFA, RLS) por se acreditar protegido pela rede.

---

## 5. Epic Structure and Wave Strategy

Adotamos a **Estratégia de Entrega em Ondas de Valor (Wave Strategy)**:

1. **Epic 1 — Fundação de Produção, Segurança, Ciclo Completo do MVP 1 e Arquitetura:**
   - Proteção de rotas, eliminação de credenciais, MFA TOTP, ferramental de teste/lint, repositórios de dados.
   - Entrega do **Módulo de Funcionários** e fechamento do **Ciclo Operacional Completo da Oficina** (Funcionários ➔ Peças/Estoque ➔ Agenda ➔ OS Completa ➔ PDV).
   - Decomposição de arquivos monolíticos > 1000 linhas e trava de duplicação mobile.
2. **Epic 2 — Persistência Real Supabase Postgres & RLS:**
   - Substituição do `localStorage` por banco em nuvem durável, multiusuário e com validação server-side de horários e regras LGPD.
3. **Epic 3A — Mobile Operacional & Cliente (Fast Track):**
   - Redesenho e aperfeiçoamento da experiência mobile adaptativa para os portais essenciais de smartphone: **Mecânico no pátio** e **Cliente no celular**.
4. **Epic 4 — Rede de Cotação de Auto Peças e Terceirizados (ANTECIPADA):**
   - Ativação da rede de fornecedores externos conectada diretamente à OS em tempo real.
5. **Epic 3B — Mobile Administrativo Remanescente:**
   - Adaptação contínua de telas administrativas complexas para resoluções menores.

---

## 6. Epic 1: Detalhamento de Stories (MVP 1 Operacional)

### Story 1.1 — Proteção de rotas, guards de horário e perfis
- **Como** proprietário da oficina,
- **Quero** que o acesso ao ERP seja restrito a usuários autenticados e respeite a jornada de trabalho,
- **Para** proteger dados de clientes, financeiro e garantir que funcionários acessem apenas no horário comercial.

#### Acceptance Criteria
1. Componente `ProtectedRoute` consome contextos existentes e valida sessão ativa.
2. Rotas `/gestao/*`, `/secretaria/*` e `/mecanico/*` redirecionam para suas respectivas telas de login quando deslogadas.
3. Rota `/cliente/*` exige identidade válida de cliente; visitantes anônimos são redirecionados para `/cliente/entrar`.
4. As rotas públicas da FR3 permanecem 100% liberadas sem autenticação.
5. Preserva rota de destino para retorno pós-login (`returnUrl`).
6. Exibe estado sóbrio de carregamento durante checagem de sessão sem piscar tela de login.
7. `/gestao/acesso-negado` torna-se alcançável para sessões sem permissão.
8. Cumpre regras de UI: sem scroll vertical principal (R2), sem verde (R7).
9. **(AC 10)** Proibição absoluta de rotas ou botões de auto-cadastro público de cliente (FR17).
10. **(AC 11 - Regra de Horário):** Usuários dos perfis `secretaria` e `mecanico` têm acesso liberado exclusivamente entre **08:00 e 19:00** em dias operacionais com dispositivo pareado; fora desse horário, exibe tela de aviso amigável de fora de expediente. O perfil `admin` possui bypass permanente (24/7 em qualquer lugar).

> **Limite declarado desta story (R-14 / OQ-3).** O guard de horário e o pareamento de dispositivo implementados aqui são **client-side**: valem como regra operacional e dissuasão, **não como controle de segurança**. O enforcement real depende de validação server-side (gate G2.6, Epic 2). A restrição por **rede da oficina** (FR20, dimensão rede) **não faz parte desta story** e não deve ser implementada antes do ADR de `@architect` — ver OQ-3 (§ 4.6).

---

### Story 1.2 — Remoção de credenciais do código e rotação de chaves
- **AC1:** `src/lib/supabase.js` lê exclusivamente de `import.meta.env`, sem valores de fallback no código.
- **AC2:** `.env.example` contém apenas placeholders; variáveis AIOX segregadas.
- **AC3:** `.gitignore` cobre `.env` e variações.
- **AC4:** Chave Supabase anon rotacionada no painel e antiga revogada.
- **AC5:** Estado `unconfigured` preservado caso variáveis faltem em desenvolvimento.

---

### Story 1.3 — Tooling de qualidade executável (Lint e Testes)
- **AC1:** ESLint configurado para React 19 + JSX com regras alinhadas ao `SYSTEM_RULES.md`.
- **AC2:** Vitest + `@testing-library/react` instalados; `npm test` funcional.
- **AC3:** `package.json` expõe `lint` e `test`; `typecheck` removido do `AGENTS.md`.
- **AC4:** Workflow de CI no GitHub Actions executando `lint`, `test` e `build`.
- **AC5:** Suíte roda em menos de 60 segundos localmente.

---

### Story 1.4 — Testes de regressão da máquina de estados da OS
- **AC1:** Testes cobrindo `podeTransicionarPara()`: avanço válido, recuo válido e salto proibido.
- **AC2:** Testes para todos os gates de bloqueio (`motivoBloqueioTransicao`, `motivoImpedimentoDiagnostico`).
- **AC3:** Teste travando os índices da lista `STATUS_ORCAMENTO` (`mockOrdensAbertas.js:13`).
- **AC4:** Testes das funções de cálculo de totais da OS (`totalPecas`, `totalServicos`, `totalTerceiros`).
- **AC5:** Testes de `assumirOrdemSemMecanico()`.
- **AC6:** Cobertura de 100% das transições da OS.

---

### Story 1.5 — Camada de repositório para acesso a dados
- **AC1:** Acesso a `localStorage` de domínio concentrado em funções `carregar*`/`salvar*`/mutadoras sob `src/repositories/`.
- **AC2:** Componentes de UI consom exclusivamente os repositórios.
- **AC3:** Interfaces compatíveis com Promises assíncronas para facilitar a migração do Epic 2.
- **AC4:** Formato de dados mantido intacto (compatibilidade retroativa).
- **AC5:** Testes cobrem ≥ 60% das linhas dos módulos de repositório.

---

### Story 1.6 — Consolidação de notificações e conformidade de UI
- **AC1:** `NoticeContext` removido ou redirecionado para `sonner`; banner bottom-left eliminado (Regras 8 e 16).
- **AC2:** Remoção de todo verde indevido nos arquivos identificados (Regra 7).
- **AC3:** Verde restrito ao ícone e disparo do WhatsApp.
- **AC4:** Substituição de `<select>` nativos remanescentes por `react-select` (Regra 6).
- **AC5:** Toasts sempre no topo à direita (`top-right`); confirmações sempre na frente do formulário em modal ativo (Regra 16).

---

### Story 1.7 — Renomeação do repositório de OS e extração de rotas compartilhadas
- **AC1:** `mockOrdensAbertas.js` renomeado para `ordensServicoRepository.js` com imports atualizados.
- **AC2:** Rotas compartilhadas entre Gestão e Secretaria extraídas para array comum em `App.jsx`, respeitando a Regra 14.
- **AC3:** Alias `@/` configurado no Vite apontando para `src/`.

---

### Story 1.8 — Higiene do repositório e limpeza de órfãos
- **AC1:** `README.md` reescrito com stack real (React 19, Vite 6, Docker Compose, scripts reais).
- **AC2:** As 5 documentações funcionais deletadas em `docs/` restauradas do git (Risco R-7).
- **AC3:** Remoção de `dist/`, `dist_old/` e pasta vazia `home/` do working tree.
- **AC4:** `Ordem Serviço.jpg` (1,8 MB) movido para `docs/` com finalidade documentada.
- **AC5:** Unificação da constante `CATEGORIAS_PECAS_OPCOES`.

---

### Story 1.9 — Autenticação em dois fatores (MFA TOTP) no Portal de Gestão
- **Como** gestor ou proprietário da oficina,
- **Quero** poder ativar e verificar segundo fator de autenticação (MFA TOTP) no portal de Gestão,
- **Para** proteger o sistema contra acesso indevido mesmo em caso de vazamento de senha.

#### Acceptance Criteria
1. As rotas `/gestao/mfa/configurar` e `/gestao/mfa/verificar` existem e estão registradas em `App.jsx`.
2. O fluxo de configuração exibe QR Code e chave manual via `supabase.auth.mfa.enroll({ factorType: 'totp' })`.
3. Validação do código de 6 dígitos via `supabase.auth.mfa.challenge` + `verify`, elevando a sessão para `aal2`.
4. Usuários com MFA ativado são desafiados após login com senha em `/gestao/mfa/verificar`.
5. Interface respeita as 16 regras de `SYSTEM_RULES.md`: fundo sóbrio, sem scroll, botões azuis e inputs numéricos formatados.
6. Permite ao administrador autenticado desativar ou reconfigurar fator (`listFactors`, `unenroll`).
7. Procedimento de emergência documentado no README para recuperação em caso de perda de dispositivo.

---

### Story 1.10 — Módulo de Cadastro de Funcionários (MVP 1)
- **Como** administrador da oficina,
- **Quero** cadastrar os funcionários da equipe (mecânicos, secretárias e gerentes),
- **Para** atribuir ordens de serviço, compor a agenda do pátio e gerenciar comissões.

#### Acceptance Criteria
1. Criada a página funcional `/gestao/funcionarios` sob `src/pages/dashboard/funcionarios/`.
2. Módulo visível exclusivamente para a Gestão; rota bloqueada e oculta para a Secretaria (Regra 14).
3. Formulário de funcionário em modal redimensionável de **Categoria B** (800px a 860px) conforme a Regra 9, com ancoragem de topo.
4. Campos: Nome Completo, CPF (com máscara `react-imask`, Regra 13), Telefone Celular (com máscara), Cargo (`react-select`: Mecânico, Secretária, Gerente, Auxiliar, Eletricista), Comissão sobre Serviços (%), Comissão sobre Peças (%), Data de Admissão, Horário de Trabalho, e Status (Ativo/Inativo).
5. Criado `src/repositories/funcionariosRepository.js` com persistência local e auto-seeding baseado na equipe inicial.
6. A Agenda Dinâmica e o formulário de Nova Ordem de Serviço consom dinamicamente a lista de mecânicos ativos deste repositório, substituindo os arrays estáticos legados.
7. Cumpre integralmente o `SYSTEM_RULES.md`: paleta Branco/Preto/Azul, zero verde, scrollbars invisíveis, e toasts via `sonner` no topo à direita.

---

### Story 1.11 — Decomposição e Modularização de Arquivos Monolíticos
- **Como** desenvolvedor do sistema,
- **Quero** que arquivos gigantes com mais de 1.000 linhas sejam fatiados em componentes menores e hooks dedicados,
- **Para** manter a manutenibilidade do código, evitar bugs de concorrência e facilitar testes automatizados.

#### Acceptance Criteria
1. `MecanicoDashboardPage.jsx` (2.052 linhas) é decomposto em orquestrador enxuto (< 250 linhas) e subcomponentes modulares sob `src/pages/mecanico/components/` (`MecanicoOSFila.jsx`, `MecanicoDiagnosticoView.jsx`, `MecanicoExecucaoTimer.jsx`).
2. `mockOrdensAbertas.js` (1.023 linhas) é fatiado na camada de repositório, extraindo validações de transição (`osTransicaoValidation.js`) e cálculos matemáticos (`osCalculos.js`).
3. `NovaOrdemServicoPage.jsx` e `useOsDraft.js` são estruturados por etapas isoladas de formulário.
4. Nenhum componente refatorado ultrapassa 350-400 linhas de código (NFR17).
5. Todo o comportamento observável pelo usuário permanece 100% idêntico e sem regressão funcional.

---

## 7. Epic 2: Persistência Real e Multiusuário (Supabase Postgres)

**Status:** Aguardando execução de gate arquitetural em paralelo ao Epic 1.

### 7.1 Gates de Entrada Obrigatórios
- **G2.1:** ADR de estratégia: Supabase PostgREST direto do browser com RLS vs API intermediária (`@architect`).
- **G2.2:** Modelagem relacional da OS denormalizada e arrays vinculados (`@data-engineer`).
- **G2.3:** Políticas de RLS para os 4 perfis de acesso (`@data-engineer`).
- **G2.4:** Ferramenta de migração de dados de `localStorage` para Postgres com rollback (`@data-engineer`).
- **G2.5:** Ambientes dev/staging/prod e pipeline CI/CD (`@devops`).
- **G2.6:** Enforcement backend para janelas de horário comercial (08:00 às 19:00) e tokens de dispositivo (`@architect`).
- **G2.7:** Políticas de segurança de dados pessoais, mascaramento e auditoria LGPD (`@architect`).

---

## 8. Roadmap de Produto Pós-Fundação

### 8.1 Epic 3A: Mobile Operacional & Cliente (Fast Track)
- **Foco:** PWA do Mecânico no pátio e PWA do Cliente no smartphone.
- **Escopo:** Interface desenhada para toque, botões de ação rápida, leitor de câmera para checklist/fotos de vistoria, e aprovação ágil de orçamentos pelo cliente via celular. Sem duplicação de arquivos de código (Single Logic Adaptive UI).

### 8.2 Epic 4: Rede de Cotação de Auto Peças e Terceirizados
- **Foco:** Economia e agilidade na compra de peças e contratação de serviços externos.
- **Escopo:** Disparo simultâneo de pedidos de cotação para fornecedores de autopeças e oficinas terceirizadas a partir do orçamento da OS; tela de comparação de preços e prazos; aprovação automática com importação de custos para a Ordem de Serviço.

### 8.3 Epic 3B: Mobile Administrativo Remanescente
- **Foco:** Responsividade contínua para módulos de desktop da Gestão e Secretaria em telas compactas.

---

## 9. Success Metrics

| # | Métrica | Situação Inicial | Meta no MVP 1 | Verificação |
|---|---------|-------------------|---------------|-------------|
| **M1** | Rotas internas sem login | 100% livres | **0% (Todas protegidas)** | Teste automatizado de rotas |
| **M2** | Segredos versionados no código | Presentes | **Zero** | Varredura no git |
| **M3** | Comandos de qualidade existentes | 0 de 3 | **2 de 2 (`lint`, `test`)** | `npm run lint && npm test` |
| **M4** | Cobertura de transições da OS | 0% | **100%** | Vitest coverage report |
| **M5** | Componentes com acesso direto a `localStorage` | Ubíquo (> 50) | **Zero (Apenas via Repositórios)** | Auditoria de código |
| **M6** | Violações conhecidas de UI (verde, select) | Presentes | **Zero** | Revisão visual e grep |
| **M7** | Módulo de Funcionários funcional | Inexistente (Placeholder) | **100% Operacional** | Teste manual e criação de OS |
| **M8** | Ciclo ponta a ponta da OS até PDV | Parcial / Quebrado | **100% Fluido e Integrado** | Teste de ciclo de ponta a ponta |
| **M9** | Arquivos com mais de 1.000 linhas | 11 arquivos | **Zero nos módulos refatorados** | Contagem de linhas de código |
| **M10** | Acesso operacional fora de 08h-19h | Livre | **100% Bloqueado** | Teste de guard com relógio simulado |
| **M11** | Adesão de MFA no Portal de Gestão | 0% (Lockout) | **100% Funcional** | Teste de login com TOTP |
| **M12** | Auto-cadastro público de cliente | Indefinido | **0% (Proibido e Inexistente)** | Auditoria de rotas públicas |
| **M13** | Novas telas duplicadas em `mobile/` | 44 arquivos existentes | **Zero novas duplicações** | Contagem de arquivos `mobile/` |
| **M14** *(Epic 2)* | Usuários simultâneos reais | 1 por navegador | **≥ 10 concorrentes em nuvem** | Teste multiusuário Supabase |

---

## 10. Fora de Escopo do MVP 1 (Vinculante)

Para assegurar a entrega e estabilidade do primeiro MVP, permanecem formalmente fora de escopo:
- Integração fiscal com SEFAZ / emissão real de NF-e e NFS-e (permanece com geração simulada).
- Migração do projeto inteiro para TypeScript.
- Testes E2E com Playwright (testes unitários e de integração via Vitest são suficientes para o MVP 1).
- Módulos administrativos secundários hoje em placeholder (Relatórios avançados, Configurações de sistema e Despesas financeiras).
- Alteração ou flexibilização das 16 regras de `SYSTEM_RULES.md`.

---

## 11. Próximos Passos de Execução

| Ordem | Ação | Responsável |
|-------|------|-------------|
| 1 | Restaurar as 5 documentações funcionais deletadas em `docs/` antes de qualquer commit | `@devops` / `@pm` |
| 2 | Criar as histórias de desenvolvimento detalhadas para o backlog do Epic 1 | `@sm` (Scrum Master) |
| 3 | Iniciar o gate arquitetural G2.1 a G2.7 para o Supabase Postgres | `@architect` + `@data-engineer` |
| 4 | **Emitir ADR respondendo a OQ-3** (enforcement de acesso por rede, FR20) antes de qualquer story de allowlist | `@architect` |
| 5 | Executar as histórias 1.1 até 1.11 na sequência definida, respeitando **1.4 antes de 1.7 e 1.11** (R-5) | `@dev` (Fullstack Developer) |
| 6 | Executar os gates de qualidade e verificação das 16 regras de UI | `@qa` (Quality Assurance) |

**Prompt de handoff para `@architect` (OQ-3 / gate G2.6):** "O proprietário da oficina pediu que o sistema só seja acessível a partir da rede cadastrada da oficina. O PRD registra isso como FR20 (dimensão rede) e o deixou deliberadamente **não agendado**, porque o acesso é browser→Supabase PostgREST: qualquer checagem de IP ou token de dispositivo feita no front-end é contornável (ver R-14 e OQ-3 em `docs/prd.md`). Preciso de um ADR respondendo: (a) qual camada de enforcement é viável e proporcional sem equipe de backend — proxy/WAF, Cloudflare Access, Edge Function com validação server-side, VPN ou atestação de dispositivo; (b) como lidar com IP dinâmico em link comercial de pequeno porte; (c) qual o recorte por perfil, dado que FR19 exige mobilidade (mecânico em 4G no pátio e no Leva e Traz) e FR20 garante acesso 24/7 de qualquer lugar para a Gestão. Restrições não-negociáveis: preservar as 16 `SYSTEM_RULES.md`, preservar as 9 rotas públicas de `/cotacao`, `/aprovacao`, `/orcamento` e `/vistoria`, e não reordenar `STATUS_ORCAMENTO`."

---

## Apêndice A — Checklist de Conformidade com o `SYSTEM_RULES.md`

Todo componente ou tela entregue no MVP 1 deve passar pela verificação obrigatória:
- [ ] **R1 / R2 / R3:** Container com `h-full`, `overflow-hidden`, limite exato no footer, sem barra de rolagem na página.
- [ ] **R4 / R7:** Fundo neutro, sidebar preta, cartões brancos, acentos em azul `#0284c7`. **Zero verde** fora do WhatsApp.
- [ ] **R5:** Busca por '&' em títulos e textos visíveis retorna zero ocorrências.
- [ ] **R6:** 100% dos selects usam `react-select`. Tag `<select>` ausente.
- [ ] **R8 / R16:** Toasts informativos no `top-right` (`sonner`); modais de confirmação na frente do formulário ativo.
- [ ] **R9:** Modais redimensionáveis com persistência, ancoragem no topo e limites de largura/altura por categoria (A, B ou C).
- [ ] **R10:** Inputs mobile com `font-size: 16px` mínimo para evitar zoom automático.
- [ ] **R11:** Scrollbars invisíveis em todas as áreas roláveis.
- [ ] **R12:** Zero botões duplicados/redundantes na mesma tela.
- [ ] **R13:** Máscaras ativas com `react-imask` em CPF, CNPJ, telefone, placa e moeda.
- [ ] **R14:** Telas compartilhadas Gestão ↔ Secretaria (com Funcionários exclusivo de Gestão).
- [ ] **R15:** Botão "Fechar Aba" em todas as telas abertas em nova aba.
