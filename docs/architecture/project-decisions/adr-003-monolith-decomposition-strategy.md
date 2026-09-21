# ADR-003: Estratégia de Decomposição e Modularização de Arquivos Monolíticos

- **Status:** Aprovado  
- **Data:** 2026-09-21  
- **Autor:** Aria (@architect, Holistic System Architect)  
- **Contexto:** Story 1.11 e NFR17 do PRD v1.2  

---

## 1. Contexto e Problema

O projeto possui **11 arquivos com mais de 1.000 linhas de código**, sendo os casos mais críticos:
1. `src/pages/mecanico/MecanicoDashboardPage.jsx` — **2.052 linhas** em um único componente auto-roteado que acumula gestão de abas, cronometragem, diagnóstico, orçamento e checklist.
2. `src/pages/dashboard/orcamento/mockOrdensAbertas.js` — **1.023 linhas** que misturam dados iniciais (seed), mutações de storage, cálculos de impostos/margens e validações de transição de status.
3. `useOsDraft.js` + `NovaOrdemServicoPage.jsx` — **~1.400 linhas somadas**, acumulando regras de validação de formulário em 4 etapas.

Arquivos desse porte geram alto acoplamento, tornam quase impossível a escrita de testes unitários limpos e geram conflitos severos em alterações de equipe.

---

## 2. Decisão Arquitetural: Padrão *Container-Presenter & Domain Hooks*

Para fatiar esses arquivos sem quebrar a reatividade ou introduzir prop drilling excessivo, adotaremos a seguinte arquitetura:

```
┌────────────────────────────────────────────────────────┐
│             Container / Orquestrador                   │
│       (< 200 linhas: rotas, abas e layout)             │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌───────────────────────────┐
│     Domain Hook         │ │   Subcomponentes Visuais  │
│ (Regras, cálculos, timers)│ │ (Cards, tabelas, modais)  │
│ (< 250 linhas)          │ │ (< 250 linhas cada)       │
└─────────────────────────┘ └───────────────────────────┘
```

---

## 3. Plano de Decomposição Específico

### 3.1 `MecanicoDashboardPage.jsx` (2.052L ➔ 4 Arquivos < 250L)

O arquivo original é decomposto sob `src/pages/mecanico/`:

1. **`MecanicoDashboardPage.jsx` (< 200 linhas):** Atua apenas como Container e Header do portal, gerenciando a seleção de abas ("Minha Fila", "Em Diagnóstico", "Em Execução", "Histórico").
2. **`hooks/useMecanicoWorkflow.js` (< 220 linhas):** Concentra a lógica de assumir OS, disparar cronômetro de execução, registrar pausas e salvar laudos técnicos.
3. **`components/MecanicoOSFila.jsx` (< 200 linhas):** Exibe a listagem de OSs disponíveis e atribuídas ao mecânico logado.
4. **`components/MecanicoDiagnosticoView.jsx` (< 250 linhas):** Painel interativo para inserção de fotos de peças quebradas, laudo do defeito e solicitação de novas peças.
5. **`components/MecanicoExecucaoTimer.jsx` (< 180 linhas):** Card focado com cronômetro em tempo real, botão "Iniciar Serviço", "Pausar" e "Concluir".

### 3.2 `mockOrdensAbertas.js` (1.023L ➔ 3 Módulos)

Separado sob `src/repositories/` e `src/utils/`:

1. **`src/repositories/ordensServicoRepository.js` (< 350 linhas):** CRUD de ordens de serviço, persistência e leitura de dados.
2. **`src/utils/osCalculos.js` (< 150 linhas):** Funções matemáticas puras (`totalPecas`, `totalServicos`, `totalTerceiros`, descontos e total líquido).
3. **`src/utils/osTransicaoValidation.js` (< 180 linhas):** Validações de máquina de estados (`podeTransicionarPara`, `motivoBloqueioTransicao`).

### 3.3 `NovaOrdemServicoPage.jsx` (~1.400L ➔ Wizard Modular)

Decomposição das abas em subcomponentes puros sob `src/pages/dashboard/nova-os/components/`:
- `EtapaClienteVeiculo.jsx` (< 200L)
- `EtapaSintomasRelato.jsx` (< 150L)
- `EtapaVistoriaChecklist.jsx` (< 250L)
- `EtapaItensMecanico.jsx` (< 200L)

---

## 4. Regras de Ouro da Arquitetura (NFR17)

1. **Teto Máximo:** Nenhum arquivo novo ou refatorado pode exceder 350-400 linhas.
2. **Funções Puras:** Lógicas de cálculos e validações devem ser funções isoladas sem efeitos colaterais.
3. **Zero Regressão:** O comportamento observável e as chaves de dados devem permanecer 100% idênticos.
