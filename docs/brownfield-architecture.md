# Mecânica Gabriel (dev-oficina) — Brownfield Architecture Document

## Introduction

Este documento captura o **ESTADO ATUAL REAL** do codebase `dev-oficina`, incluindo dívida técnica, workarounds e padrões praticados (não os idealizados). Serve como referência primária para agentes de IA que trabalharão em evoluções deste sistema.

O produto é um **ERP web/PWA de oficina mecânica** ("Mecânica Gabriel", Apucarana-PR), cobrindo o ciclo completo de atendimento automotivo: agenda, ordem de serviço, diagnóstico, cotação de peças, aprovação pelo cliente, execução, PDV, estoque/compras e portais dedicados por perfil.

### Document Scope

Documentação **abrangente de todo o sistema**.

> `[AUTO-DECISION]` Não foi encontrado PRD nem requirements em `docs/` → optou-se pela opção 4 do task `document-project.md` (documentação completa do codebase). Motivo: a missão solicitou a base de conhecimento do projeto e não há artefato de escopo para focalizar.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-09-21 | 1.0 | Análise brownfield inicial (estado real do codebase) | Atlas (@analyst) |

### Confiança das Afirmações

| Área | Confiança | Base |
|------|-----------|------|
| Stack, build, rotas, estrutura | **Alta** | Leitura direta dos arquivos |
| Modelo de domínio e persistência | **Alta** | Leitura dos módulos `constants/` e `mockOrdensAbertas.js` |
| Dívida técnica listada | **Alta** | Evidência por grep/contagem, citada em cada item |
| Intenção de negócio de módulos incompletos | **Média** | Inferida de `docs/*.md` e menus; não validada com stakeholder |
| Roadmap / prioridades | **Baixa** | Não há backlog formal no repositório |

---

## Quick Reference — Key Files and Entry Points

### Arquivos críticos para entender o sistema

| Papel | Arquivo |
|-------|---------|
| HTML shell / meta PWA | `index.html` |
| Bootstrap React + registro do Service Worker | `src/main.jsx` |
| **Mapa completo de rotas (fonte de verdade da navegação)** | `src/App.jsx` |
| **Regras de negócio/UI obrigatórias do projeto** | `SYSTEM_RULES.md` (16 regras) |
| Cliente Supabase (somente Auth) | `src/lib/supabase.js` |
| Autenticação administrativa | `src/context/AdminAuthContext.jsx` |
| **Núcleo do domínio: Ordem de Serviço** | `src/pages/dashboard/orcamento/mockOrdensAbertas.js` (1023 linhas) |
| Máquina de estados da OS | `src/pages/dashboard/orcamento/statusTransicao.js` + `kanbanColunas.js` |
| Rascunho de OS (form multi-etapa) | `src/pages/dashboard/nova-os/useOsDraft.js` |
| Tokens de tema + regras de impressão A4 + scrollbar oculta | `src/index.css` |
| Configuração dos 4 portais PWA | `src/lib/pwaPortals.js` |
| Build | `vite.config.js`, `package.json` |
| Ambiente de dev | `docker-compose.yml`, `README.md` |

### Documentação funcional pré-existente (escrita à mão, boa qualidade)

- `docs/admin/CadastrosBase-Suprimentos.md` (368 linhas) — especificação do menu Suprimentos
- `docs/admin/VeiculosEstacionados.md` (405 linhas) — regra de negócio de veículos vendidos
- `docs/oficina/LevaETraz.md` (245 linhas) — logística de busca/entrega com dupla de funcionários
- `docs/oficina/PecasDanificadas.md` (162 linhas) — módulo ainda **não implementado** (rota é placeholder)
- `docs/cliente/AprovacaoOrcamento-StepperProgress.md` (205 linhas) — esteira de progresso do cliente

---

## High Level Architecture

### Technical Summary

SPA **React 19 + Vite 6**, 100% client-side, sem backend próprio. Toda a lógica de negócio roda no browser e todo o estado de domínio é persistido em **`localStorage`**, com módulos "mock" servindo simultaneamente como *seed*, *repositório* e *camada de regra de negócio*. O Supabase está presente **apenas para autenticação** do painel de gestão — nenhuma tabela de banco é consultada.

O sistema é entregue como **4 PWAs distintos** (Gestão, Secretaria, Mecânico, Cliente) servidos pelo mesmo bundle, diferenciados em runtime por prefixo de rota, manifest trocado dinamicamente e menus próprios.

**Implicação prática:** este é um protótipo funcional de alta fidelidade / MVP navegável, não um sistema multiusuário. Dois navegadores não compartilham dados.

### Actual Tech Stack (de `package.json`)

| Categoria | Tecnologia | Versão | Notas |
|-----------|-----------|--------|-------|
| Runtime | Node.js | 18+ (implícito) | Executado via container `dev-oficina` |
| Build | Vite | ^6.2.0 | `type: module`, sem TypeScript |
| UI | React / React DOM | ^19.3.0 | JSX puro, sem TS, sem PropTypes |
| Router | react-router-dom | ^7.18.4 | `BrowserRouter`, rotas aninhadas por layout |
| Estilo | Tailwind CSS + @tailwindcss/vite | ^4.3.3 | Tailwind v4 (config via `@theme` em CSS, **sem `tailwind.config.js`**) |
| Ícones | @phosphor-icons/react | ^2.1.10 | Chunk próprio no build |
| BaaS | @supabase/supabase-js | ^2.116.0 | **Só Auth** (sessão, MFA/AAL, reset de senha) |
| Toasts | sonner | ^2.0.8 | Obrigatório `top-right` (SYSTEM_RULES 8/16) |
| Selects | react-select | ^5.10.2 | Obrigatório; `<select>` nativo proibido (Regra 6) |
| Máscaras | imask / react-imask | ^7.6.1 | Obrigatório em campos formatados (Regra 13) |
| Drag & drop | @dnd-kit/core, /sortable, /utilities | ^6.3.1 / ^10 / ^3.2.2 | Kanban de OS |
| CEP | cep-promise | ^4.4.1 | Fallback manual para ViaCEP |
| Testes | — | — | **Nenhum framework de teste instalado** |
| Lint/Types | — | — | **Nenhum ESLint, Prettier ou TypeScript** |

### Repository Structure Reality Check

- **Tipo:** Polyrepo, aplicação única (não é monorepo apesar do `AGENTS.md` mencionar `packages/`)
- **Package manager:** npm (`package-lock.json`)
- **Tamanho:** ~65.800 linhas em `src/` distribuídas em 185 arquivos; 244 arquivos versionados
- **Notável:** o framework AIOX (`.aiox-core/`, `.claude/`, `.codex/`, etc.) foi instalado **em 2026-09-21 e ainda não foi commitado** — aparece como untracked no `git status`

---

## Source Tree and Module Organization

### Estrutura real

```text
dev-oficina/
├── index.html                  # Shell PWA, metas iOS/Android, viewport travado (Regra 10)
├── vite.config.js              # host 0.0.0.0, usePolling (Docker), manualChunks
├── docker-compose.yml          # container dev-oficina, portas 5173/4173/3000
├── SYSTEM_RULES.md             # ⚠️ 16 regras obrigatórias de UI/arquitetura — LER ANTES DE CODAR
├── README.md                   # ⚠️ DESATUALIZADO: descreve projeto Vite vanilla (src/main.js)
├── docs/                       # Especificações funcionais por módulo (admin/cliente/oficina)
├── dist/, dist_old/            # Builds antigos no working tree (gitignored, ruído)
├── home/rafael/projetos/...    # ⚠️ Diretório aninhado vazio — artefato acidental de comando
├── "Ordem Serviço.jpg"         # 1.8 MB versionado — referência visual da OS em papel
└── src/                        # 65.817 linhas
    ├── main.jsx                # ReactDOM.createRoot + registro de /sw.js (só em PROD)
    ├── App.jsx                 # Todas as rotas (194 linhas) — ponto único de navegação
    ├── index.css               # @theme Tailwind v4, fontes Inter, scrollbar oculta, @media print A4
    ├── lib/                    # supabase.js (auth-only) + pwaPortals.js (4 manifests)
    ├── context/                # 4 providers: AdminAuth, Cliente, Mecanico, Notice
    ├── layouts/                # 6 shells: Dashboard, Secretaria, Mecanico, Cliente, 2 de auth
    ├── hooks/                  # useIsMobile (860px), usePwaInstall
    ├── services/               # fipeService (parallelum.com.br), cepService (cep-promise+ViaCEP)
    ├── utils/                  # fiscalValidators (GTIN/CNPJ/CPF), googleMapsRouting, routeContext
    ├── constants/              # ⚠️ 6.678 linhas — seeds + repositórios + REGRAS DE NEGÓCIO
    ├── components/             # 73 arquivos, 20.121 linhas (landing + modais + shells)
    └── pages/                  # 71 arquivos, 36.734 linhas (telas desktop + mobile)
```

### Módulos-chave e onde vive a lógica

| Domínio | Arquivos principais | Observação |
|---------|--------------------|------------|
| **Ordem de Serviço (núcleo)** | `pages/dashboard/orcamento/mockOrdensAbertas.js`, `OrcamentoOSListPage.jsx` (1451), `PainelDetalhesOS.jsx` (1376), `KanbanOSBoard.jsx`, `statusTransicao.js` | ~30 funções de negócio dentro de um arquivo chamado "mock" |
| **Abertura de OS** | `pages/dashboard/nova-os/` — `useOsDraft.js`, `OsFormularioAbertura.jsx` (1132) | Rascunho persistido em `dev_oficina_draft_os` |
| **Agenda** | `constants/agendaData.js` (562), `pages/dashboard/agenda/AgendaPage.jsx` | Grade semanal, fila prioritária, `recalcularCascataDeAtrasos()` |
| **Suprimentos** | `constants/cadastrosSuprimentosData.js` (894), `comprasData.js` (699), páginas `suprimentos/*` | Peças, Serviços, Terceiros, Estoque, Compras, Cotação |
| **Cotação de peças** | `pages/dashboard/suprimentos/CotacaoPage.jsx` (1531), `components/suprimentos/CotacaoModalForm.jsx` (1401), portal público `pages/CotacaoAutoPecaPage.jsx` (770) | Fluxo com fornecedor externo via link público |
| **PDV** | `pages/dashboard/pdv/` — `PDVPage.jsx` (806), `pdvData.js`, `ReciboVendaImpressao.jsx` | Gera chave de acesso e protocolo **mock** de NF |
| **Clientes e Frota** | `constants/mockClientesVeiculos.js` (397), `components/clientes/ClienteModalForm.jsx` (1325) | Veículos vivem dentro do cliente; `carregarTodosVeiculosDaFrota()` achata |
| **Veículos Estacionados** | `constants/mockVeiculosEstacionados.js` (528) | Regra de veículo vendido com histórico preservado |
| **Leva e Traz** | `constants/mockLevaETraz.js` (532), `pages/dashboard/leva-e-traz/` | Deslocamento com dupla + frota de apoio |
| **Manutenção Preventiva** | `constants/mockManutencaoPreventiva.js` (698) | `calcularSaudeVeiculo()` — ficha de saúde por km/tempo |
| **Portal do Mecânico** | `pages/mecanico/MecanicoDashboardPage.jsx` (**2052 linhas**) | ⚠️ Maior arquivo; **todas** as 13 rotas `/mecanico/*` apontam para ele |
| **Portal do Cliente** | `pages/cliente/ClienteServicosPage.jsx` (1593), `pages/AprovacaoOrcamentoClientePage.jsx` (1200) | Aprovação de orçamento é rota pública |
| **Landing pública** | `components/Hero|Services|About|Footer|BrandsMarquee|LocationMap.jsx`, `constants/company.js` | Site institucional na raiz `/` |

---

## Data Models and APIs

### Não há banco de dados

Nenhum arquivo em `src/` executa `.from()` ou `.rpc()` do Supabase (verificado por grep). O único consumidor de `src/lib/supabase.js` é `AdminAuthContext.jsx`, que usa exclusivamente `auth.*`.

### Modelo de domínio — onde ler

Os "modelos" são objetos JS literais nos módulos de seed. Referências canônicas (não duplicar conteúdo):

| Entidade | Definição canônica |
|----------|--------------------|
| Ordem de Serviço | `SEED_ORDENS_ABERTAS[0]` em `src/pages/dashboard/orcamento/mockOrdensAbertas.js:57` |
| OS finalizada | `SEED_ORDENS_FINALIZADAS` em `mockOrdensAbertas.js:736` |
| Formulário de nova OS | `INITIAL_FORM_DATA` em `src/pages/dashboard/nova-os/useOsDraft.js:31` |
| Cliente + veículos | `MOCK_CLIENTES_VEICULOS` em `src/constants/mockClientesVeiculos.js:1` |
| Peça / Serviço / Terceiro | `PECAS_INICIAIS`, `SERVICOS_INICIAIS`, `TERCEIROS_INICIAIS` em `src/constants/cadastrosSuprimentosData.js` |
| Agendamento / Fila | `AGENDAMENTOS_INICIAIS`, `FILA_ESPERA_INICIAL` em `src/constants/agendaData.js` |
| Deslocamento (Leva e Traz) | `SEED_LEVA_E_TRAZ` em `src/constants/mockLevaETraz.js:73` |
| Veículo estacionado | `SEED_VEICULOS_ESTACIONADOS` em `src/constants/mockVeiculosEstacionados.js:18` |
| Manutenção preventiva | `ITENS_PREVENTIVOS_CATALOGO`, `SEED_MANUTENCOES_PREVENTIVAS` em `src/constants/mockManutencaoPreventiva.js` |

**A OS é um objeto denormalizado**: carrega snapshot de cliente (nome, CPF, telefone, endereço), veículo (placa, marca, modelo, km) e arrays `pecasOS`, `servicosOS`, `terceirosOS` com totais pré-calculados (`totalPecas`, `totalServicos`, `totalTerceiros`, `valorTotal`). Não há chave estrangeira real — apenas `clienteId` por convenção.

### Máquina de estados da OS (fonte de verdade)

`src/pages/dashboard/orcamento/kanbanColunas.js` define a sequência; `statusTransicao.js` define as regras:

```
fila → em_diagnostico → aguardando_pecas → terceirizado
     → aguardando_aprovacao → aprovado_execucao → pronto_retirada
```

Regras implementadas:
- `podeTransicionarPara()` — **só permite mover uma etapa para frente ou para trás**, nunca pular.
- `motivoBloqueioTransicao()` — gates condicionais: entrar em `em_diagnostico` exige pré-condições (`motivoImpedimentoDiagnostico`); sair de `aprovado_execucao` é bloqueado se houver item adicional de segurança aguardando resposta do cliente.
- `STATUS_ORCAMENTO` (em `mockOrdensAbertas.js:13`) é uma **lista separada** com labels e cores de badge. Os status novos (`fila`, `terceirizado`) foram anexados **no fim** da lista porque vários consumidores usam `STATUS_ORCAMENTO[1]` como fallback — comentário explícito no código. **Não reordenar essa lista.**

### APIs externas consumidas

| Serviço | Propósito | Arquivo | Fallback |
|---------|-----------|---------|----------|
| Supabase Auth | Login/MFA/recuperação da gestão | `src/lib/supabase.js`, `src/context/AdminAuthContext.jsx` | Estado `unconfigured` degrada silenciosamente |
| FIPE (parallelum.com.br) | Marca/modelo/ano/combustível (**sem preços**, por regra explícita) | `src/services/fipeService.js` | `MARCAS_CONTINGENCIA` hardcoded (21 marcas) + cache em memória |
| ViaCEP / cep-promise | Endereço por CEP | `src/services/cepService.js` | `cep-promise` → `fetch` direto ViaCEP → erro pedindo preenchimento manual |
| Google Maps | Roteirização do Leva e Traz | `src/utils/googleMapsRouting.js` | — |
| WhatsApp (wa.me) | Disparo externo ao cliente/fornecedor | Vários (`Footer`, `ClientesPage`, `CotacaoAutoPecaPage`, ...) | — |

**Não há OpenAPI, Postman collection ou backend próprio.**

---

## Padrões Reais do Código (o que está de fato em uso)

1. **Idioma:** código em **português** (variáveis, funções, comentários). `obterOrdensAbertas`, `salvarOrdensAbertas`, `motivoImpedimentoDiagnostico`. Manter.
2. **Exports nomeados** para componentes (`export function ClientesPage()`). Exceção: `App.jsx` (default) e `AgendaPage` (default).
3. **Módulo de domínio = seed + repositório + regras**, padrão repetido em todos os domínios:
   ```
   CHAVE_STORAGE_X → SEED_X / X_INICIAIS → carregarX() → salvarX() → mutadoras (criarX, atualizarX, excluirX)
   ```
   `carregarX()` lê `localStorage`, e se vazio **auto-semeia** com o seed e devolve.
4. **Imports relativos** (`../../context/...`), sem alias configurado — em conflito com o Artigo VI (Absolute Imports) da Constitution AIOX.
5. **Desktop e mobile são árvores separadas:** 24 arquivos consomem `useIsMobile()` e há 16 diretórios `mobile/` com 45 arquivos que duplicam telas inteiras (`ClientesPage.jsx` ↔ `mobile/MobileClientesPage.jsx`). Breakpoint único: `max-width: 860px`.
6. **Modais redimensionáveis** via `components/suprimentos/ModalRedimensionavel.jsx` — aceita props em PT **e** EN (`titulo`/`title`, `larguraPadrao`/`defaultWidth`), persistindo dimensões em `localStorage` (Regra 9).
7. **Erros silenciados:** `try { ... } catch {}` em torno de acessos a `localStorage` é ubíquo — intencional (modo privado/quota), mas mascara bugs de serialização.

---

## Technical Debt and Known Issues

### 🔴 Crítico

1. **Nenhuma rota é protegida por autenticação.**
   `DashboardLayout`, `SecretariaLayout`, `MecanicoLayout` e `ClienteLayout` não consultam `useAdminAuth()` para bloquear acesso — o hook só é usado para exibir o usuário e oferecer *logout* (`DashboardHeader`, `MobileMenuSheet`, `SecretariaHeader`). Navegar direto para `/gestao/dashboard` dá acesso total ao ERP sem login. Não existe componente `ProtectedRoute`.
   *Evidência:* `grep -rn "useAdminAuth" src/` retorna 0 ocorrências em guards de rota.

2. **Credenciais Supabase hardcoded como fallback no código-fonte.**
   `src/lib/supabase.js:3-11` embute URL e `sb_publishable_...` literalmente quando as env vars faltam. As mesmas credenciais estão em `.env.example` (versionado). São chaves publicáveis/anon, mas o padrão impede rotação e vaza o projeto Supabase real.

3. **Zero cobertura de testes e zero tooling de qualidade.**
   Não há Vitest/Jest/Playwright, ESLint ou TypeScript. `package.json` expõe apenas `dev`, `build`, `preview`. **`AGENTS.md` instrui rodar `npm run lint`, `npm run typecheck` e `npm test` — todos inexistentes e falharão.** Contraria o Artigo V (Quality First) da Constitution AIOX.

4. **Persistência exclusiva em `localStorage` (≈30 chaves).**
   Sem sincronização, sem multiusuário, sem backup, sujeito a limite de ~5 MB e a apagamento pelo navegador. Fotos/assinaturas (`dev_oficina_assinaturas_checklist`, fotos de peça) aceleram o estouro de quota. É o maior bloqueador para produção.

### 🟠 Alto

5. **Arquivos-monstro.** 11 arquivos acima de 1.000 linhas, liderados por `MecanicoDashboardPage.jsx` (**2052**), `ComprasPage.jsx` (1967), `ClienteServicosPage.jsx` (1593), `CotacaoPage.jsx` (1531), `OrcamentoOSListPage.jsx` (1451). O portal do mecânico concentra 13 rotas num único componente que se auto-roteia internamente.

6. **Duplicação desktop/mobile.** 45 arquivos em diretórios `mobile/` reimplementam telas existentes. Toda regra nova precisa ser aplicada duas vezes; risco alto de divergência silenciosa (ex.: `AgendaAgendamentoModal.jsx` vs `MobileAgendaAgendamentoModal.jsx`).

7. **Nomenclatura "mock" para código de produção.** `mockOrdensAbertas.js` contém ~30 funções de regra de negócio real (transições, recálculo de totais, aprovação de itens, arquivamento). O nome induz a erro de que é descartável.

8. **Violações das próprias SYSTEM_RULES:**
   - **Regra 6** (`<select>` nativo proibido): 5 ocorrências — `CotacaoAutoPecaPage.jsx:702` e `MecanicoDashboardPage.jsx:1412,1516,1945,2020`.
   - **Regra 7** (verde proibido, exceto WhatsApp): 19 arquivos usam `green-`/`emerald-`; ao menos 8 não têm nenhuma referência a WhatsApp — `Hero.jsx`, `LocationMap.jsx`, `MecanicoHeader/Footer.jsx`, `ClienteHeader/Footer.jsx`, `GestaoRecuperarSenhaPage.jsx` e `context/NoticeContext.jsx` (`SEVERITY_STYLES.success = 'bg-green-800 ...'`).

9. **Dois sistemas de notificação concorrentes.** `sonner` (obrigatório por regra, `top-right`) coexiste com `NoticeContext` (banner próprio *bottom-left*, com verde). Contraria as Regras 8 e 16 e deveria ser consolidado.

### 🟡 Médio

10. **`README.md` desatualizado** — descreve um projeto Vite vanilla com `src/main.js` e `src/style.css`; a realidade é React 19 com `src/main.jsx` e 185 arquivos.
11. **`AGENTS.md` descreve estrutura de outro projeto** (`bin/`, `packages/`, `tests/`) — herdado do template AIOX, não corresponde ao repositório.
12. **Fiscal é simulado.** `pdvData.js` expõe `gerarChaveAcessoMock()` e `gerarProtocoloMock()`; não há integração real de NF-e/NFS-e apesar do menu "Nota Fiscal".
13. **Módulos com rota mas sem tela.** Em `/gestao` e `/secretaria`, apontam para `DashboardPage` como placeholder: `garantias`, `ferramentas`, `pecas-danificadas`, `despesas`, `nota-fiscal`, `relatorios`, `funcionarios`, `configuracoes`. Em `/cliente`, 7 das 8 rotas usam `ClienteModulePlaceholder`.
14. **Duplicação de `/gestao` e `/secretaria`.** `App.jsx` repete ~25 rotas idênticas nos dois blocos (Regra 14 de compartilhamento), sem fábrica de rotas — toda rota nova precisa ser adicionada em dois lugares.
15. **Constantes duplicadas.** `CATEGORIAS_PECAS_OPCOES` existe em `constants/cadastrosSuprimentosData.js:9` **e** em `constants/catalogoPecasEstoque.js:67`.
16. **Ruído no working tree.** `dist/` e `dist_old/` presentes localmente; `home/rafael/projetos/dev-oficina/docs/cliente/` é uma árvore de diretórios vazia criada por engano; `Ordem Serviço.jpg` (1,8 MB) versionado.

### Workarounds e gotchas que o agente precisa saber

- **Não reordenar `STATUS_ORCAMENTO`** (`mockOrdensAbertas.js:13`) — vários consumidores dependem de `STATUS_ORCAMENTO[1]` como fallback; por isso `fila` e `terceirizado` ficam no fim da lista, fora da ordem do fluxo.
- **`ModalRedimensionavel` aceita props em PT e EN** — aliases mantidos por compatibilidade com chamadas antigas; não remover sem varrer todos os usos.
- **Vite usa `usePolling: true`** (`vite.config.js`) — obrigatório para hot reload funcionar com o bind mount do Docker; remover quebra o HMR.
- **Service Worker só registra em `import.meta.env.PROD`** (`src/main.jsx`) — cache `mg-oficina-shell-v1` em `public/sw.js` com estratégia stale-while-revalidate; ao mudar assets do shell, **bumpar `CACHE_NAME`** ou usuários instalados ficam com versão velha.
- **Inputs mobile precisam de `font-size: 16px`** — `src/index.css` força isso em `@media (max-width: 860px)` para impedir o zoom automático do Safari (Regra 10). Reduzir fonte de input no mobile reintroduz o bug.
- **Tailwind v4 sem arquivo de config** — tokens de marca são definidos em `@theme` dentro de `src/index.css` (`--color-brand-blue: #0284c7`). Procurar `tailwind.config.js` é perda de tempo.
- **Scrollbars são globalmente ocultas** com `!important` em `*` (Regra 11). Qualquer expectativa visual de barra de rolagem será frustrada.
- **`assumirOrdemSemMecanico()`** é o **único** caminho em que o mecânico grava `mecanicoId` numa OS, e só funciona se a OS ainda não tiver mecânico; reatribuição é exclusiva da secretaria/gestão via `OsFormularioAbertura.jsx`.
- **`@media print` em `src/index.css`** esconde `aside, nav, header, button` globalmente e pagina por `.folha-pagina-a4`. Telas de impressão (`FolhaOrdemServicoImpressao.jsx`, `ReciboVendaImpressao.jsx`) dependem dessas classes.
- **`localStorage` é lido dentro de `useState(() => ...)`** em vários providers — mudanças de formato de dado precisam de migração defensiva, pois dados antigos persistem no browser do usuário.

---

## Integration Points e Navegação

### Os 4 portais PWA

Definidos em `src/lib/pwaPortals.js` e aplicados por `PwaManifestSwitcher` (troca `<link rel=manifest>` e título conforme a rota) e `PwaStandaloneRedirect` (ao abrir em `/` no modo standalone, redireciona para o último portal usado, chave `dev_oficina_last_portal_home`).

| Prefixo | Manifest | Home | Layout |
|---------|----------|------|--------|
| `/gestao` | `/site.webmanifest` | `/gestao/dashboard` | `DashboardLayout` |
| `/secretaria` | `/site-secretaria.webmanifest` | `/secretaria/dashboard` | `SecretariaLayout` |
| `/mecanico` | `/site-mecanico.webmanifest` | `/mecanico/dashboard` | `MecanicoLayout` |
| `/cliente` | `/site-cliente.webmanifest` | `/cliente/resumo` | `ClienteLayout` |

### Rotas públicas (sem login, por design — links enviados ao cliente/fornecedor)

`/` (landing) · `/cliente/entrar` · `/gestao/entrar` · `/gestao/recuperar-senha` · `/gestao/acesso-negado` · `/cotacao/:id` · `/aprovacao/:id` · `/orcamento/:id` · `/vistoria/:id`

Essas telas devem ter botão "Fechar Aba" (Regra 15), pois são abertas em nova aba.

### Menus por perfil

`constants/dashboardMenus.js` (gestão, 6 categorias) · `secretariaMenus.js` (mesma árvore menos Relatórios/Funcionários/Configurações, Regra 14) · `mecanicoMenus.js` · `clienteMenus.js`. `utils/routeContext.js` resolve categoria + rótulo da tela atual para o cabeçalho.

---

## Development and Deployment

### Setup local (o que funciona de fato)

```bash
docker compose up -d                       # sobe o container dev-oficina
docker exec -it dev-oficina npm install    # primeira vez
docker exec -it dev-oficina npm run dev    # http://localhost:5173
```

Sem Docker: `npm install && npm run dev` (Node 18+). Variáveis em `.env` (ver `.env.example`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. O app **funciona sem elas** — apenas o login da gestão fica em estado `unconfigured`.

### Build e deploy

- **Build:** `npm run build` → `dist/` com `manualChunks` (`vendor`, `icons`, `supabase`), `chunkSizeWarningLimit: 1000`.
- **Preview:** `npm run preview` (porta 4173).
- **Deploy:** **não há pipeline.** Sem workflow de CI em `.github/workflows`, sem Dockerfile de produção, sem config de Vercel/Netlify. Deploy é manual (servir `dist/` como estático + fallback SPA para `index.html`).
- **Ambientes:** só `development`. Não há separação dev/staging/prod.

### Testing Reality

- Unit: **0%** · Integração: **nenhuma** · E2E: **nenhuma**
- QA é 100% manual no browser.
- Os testes existentes no repositório pertencem ao framework AIOX (`.aiox-core/**/__tests__/`), não à aplicação.

---

## Como contribuir sem quebrar o sistema (checklist para agentes)

1. **Ler `SYSTEM_RULES.md` na íntegra antes de qualquer mudança de UI.** As 16 regras são vinculantes e mais específicas que qualquer convenção genérica de React/Tailwind.
2. Antes de criar uma tela, verificar se já existe par desktop **e** mobile; se existir só um, decidir conscientemente se replica (padrão atual) ou unifica.
3. Alterações no fluxo da OS passam por `kanbanColunas.js` + `statusTransicao.js` — **não reimplementar cálculo de índice de status** (já foi deduplicado de 3 arquivos).
4. Todo campo formatado usa `react-imask`; todo dropdown usa `react-select`.
5. Toast de sucesso/evento → `sonner` `top-right`. Confirmação/cancelamento/exclusão → modal sobre o formulário. Nunca `alert()`/`confirm()`.
6. Persistência nova segue o padrão `CHAVE_STORAGE_X` + `carregarX()` / `salvarX()` em `src/constants/` (ou no módulo de dados do domínio).
7. Rotas novas em `/gestao` provavelmente precisam ser duplicadas em `/secretaria` (Regra 14) — exceto Relatórios, Funcionários e Configurações.
8. Não confiar no `AGENTS.md` nem no `README.md` para comandos: **só existem** `npm run dev`, `npm run build`, `npm run preview`.

---

## Recomendações priorizadas (insumo para @pm / @architect)

| # | Ação | Impacto | Esforço | Justificativa |
|---|------|---------|---------|---------------|
| 1 | Criar `ProtectedRoute` e aplicar aos 4 layouts | 🔴 Crítico | Baixo | Hoje o ERP inteiro é público |
| 2 | Remover credenciais hardcoded de `src/lib/supabase.js` e de `.env.example`; rotacionar chave | 🔴 Crítico | Baixo | Segredo versionado |
| 3 | Definir estratégia de persistência real (Supabase Postgres + RLS) e plano de migração do `localStorage` | 🔴 Crítico | Alto | Bloqueador de produção/multiusuário |
| 4 | Adicionar ESLint + Vitest + script `lint`/`test`; alinhar `AGENTS.md` | 🟠 Alto | Médio | Artigo V da Constitution; comandos documentados não existem |
| 5 | Quebrar `MecanicoDashboardPage.jsx` (2052 linhas) em rotas/componentes reais | 🟠 Alto | Alto | Maior gargalo de manutenção |
| 6 | Auditar e corrigir violações das Regras 6 e 7 (5 `<select>`, ~8 arquivos com verde indevido) | 🟠 Alto | Baixo | Consistência com as regras do próprio projeto |
| 7 | Consolidar `NoticeContext` no `sonner` | 🟡 Médio | Baixo | Dois sistemas de notificação conflitantes |
| 8 | Renomear `mockOrdensAbertas.js` → `ordensServicoRepository.js` (ou similar) | 🟡 Médio | Baixo | Nome esconde que é código de produção |
| 9 | Extrair array de rotas compartilhadas gestão/secretaria em `App.jsx` | 🟡 Médio | Baixo | Elimina duplicação de 25 rotas |
| 10 | Reescrever `README.md`; remover `dist_old/`, `home/` e avaliar `Ordem Serviço.jpg` | 🟡 Médio | Baixo | Higiene de repositório |
| 11 | Configurar alias `@/` no Vite (Artigo VI — Absolute Imports) | 🟢 Baixo | Baixo | Imports relativos profundos |

---

## Appendix — Comandos e referências rápidas

### Comandos disponíveis

```bash
npm run dev       # Vite dev server em 0.0.0.0:5173 (strictPort, polling)
npm run build     # Build de produção em dist/
npm run preview   # Preview do build em 0.0.0.0:4173
```

> `npm run lint`, `npm run typecheck` e `npm test` **não existem** neste projeto.

### Chaves de `localStorage` em uso (prefixo `dev_oficina_`)

`ordens_servico` · `orcamentos` · `ordens_finalizadas` · `draft_os` · `os_visualizacao` · `agenda_agendamentos` · `agenda_fila` · `cadastros_clientes` · `cadastros_servicos` · `cadastros_pecas` · `cadastros_terceiros` · `movimentacoes_estoque` · `pedidos_compra` · `cotacoes_pecas` · `cotacoes` · `aprovacoes` · `pdv_vendas` · `notas_fiscais` · `pdv_modal_pagamento` · `veiculos_estacionados` · `leva_e_traz` · `frota_apoio` · `manutencoes_preventivas` · `pecas_danificadas` · `ferramentas_danificadas` · `requisicoes_pecas` · `assinaturas_checklist` · `cliente_ativo` · `mecanico_ativo` · `last_portal_home` · `header_pinned` (+ variantes `mecanico_`, `secretaria_`, `cliente_`) · `modal_impressao_dims`

**Reset completo do sistema:** limpar o `localStorage` do domínio — todos os módulos re-semeiam automaticamente a partir dos `SEED_*` / `*_INICIAIS`.

### Debugging

- Não há logger estruturado; erros de storage vão para `console.error` e boa parte dos `catch` é vazia.
- Não há Sentry configurado (a var `SENTRY_DSN` em `.env.example` é do template AIOX, não usada no código).
- Inspecionar estado de domínio: DevTools → Application → Local Storage.

### Documentos relacionados

- `SYSTEM_RULES.md` — regras obrigatórias (leitura mandatória)
- `docs/admin/`, `docs/cliente/`, `docs/oficina/` — especificações funcionais por módulo
- `.aiox-core/constitution.md` — princípios do framework AIOX instalado no repositório
