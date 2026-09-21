# ADR-004: Arquitetura Single Logic, Adaptive UI (Erradicação de Duplicações Mobile)

- **Status:** Aprovado  
- **Data:** 2026-09-21  
- **Autor:** Aria (@architect, Holistic System Architect)  
- **Contexto:** NFR11, NFR18, CR5 e SYSTEM_RULES.md (Regra 10)  

---

## 1. Contexto e Problema

O projeto acumulou **44 arquivos duplicados sob 16 diretórios `src/**/mobile/`**. Para quase toda funcionalidade, foram criadas duas versões:
- `MinhaTelaPage.jsx` (Desktop)
- `mobile/MobileMinhaTelaPage.jsx` (Mobile)

Essa prática gera:
- **Dívida Técnica Exponencial:** Qualquer alteração em regra de negócio ou correção de bug precisa ser codificada e testada duas vezes.
- **Divergência Silenciosa:** Telas desktop atualizadas enquanto as versões mobile ficavam defasadas e quebradas.
- **Inchaço do Bundle:** Componentes duplicados competindo por espaço e memória.

---

## 2. Decisão Arquitetural: *Single Logic, Adaptive Presentation*

A partir do PRD v1.2, **é proibida a criação de novos arquivos sob diretórios `mobile/`**. Toda tela ou funcionalidade (incluindo o novo módulo de **Funcionários**) deve adotar o padrão **Single Logic, Adaptive Presentation**:

```
src/pages/dashboard/funcionarios/
├── FuncionariosPage.jsx         # Orquestrador com Layout Responsivo
├── hooks/
│   └── useFuncionarios.js       # Hook ÚNICO de Lógica (Desktop + Mobile)
└── components/
    ├── FuncionarioModal.jsx     # Modal Responsivo (Categoria B)
    ├── FuncionarioTableDesktop.jsx # Tabela densa para monitores (md:block)
    └── FuncionarioCardListMobile.jsx # Cards de toque para smartphones (md:hidden)
```

---

## 3. Diretrizes de Implementação

### 3.1 Unicidade de Lógica
- O estado (`useState`, `useReducer`), as validações de formulário, chamadas a repositórios e notificações residem em um **único Custom Hook de domínio** (ex: `useFuncionarios()`).
- O hook é consumido tanto pelo layout desktop quanto pelas visualizações móveis.

### 3.2 Adaptação Visual Responsiva com Tailwind v4
- **Layouts e Grids:** Usar classes responsivas naturais (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
- **Tabelas Densas vs. Cards de Toque:**
  - Em telas grandes (`>= 768px`), renderiza `<TabelaDesktop>` com múltiplas colunas e ordenação.
  - Em telas pequenas (`< 768px`), renderiza `<CardListMobile>` com cards de toque confortáveis e ações contextuais.
- **Ambos os componentes vivem na mesma pasta do módulo**, sem clones em pastas `mobile/`.

### 3.3 Cumprimento Rígido da Regra 10 do `SYSTEM_RULES.md`
- Todo campo de input, `<textarea>` e input interno do `react-select` renderizado em dispositivos móveis DEVE possuir classe forçando `text-base` (`font-size: 16px` mínimo).
- Isso impede que o Safari (iOS) e navegadores Android apliquem o incômodo zoom automático ao focar no campo.

---

## 4. Consequências

- **Manutenibilidade:** Uma única alteração corrige o comportamento em todas as resoluções simultaneamente.
- **Economia de Tempo:** Redução de 50% no esforço de desenvolvimento de novas telas.
- **Conformidade PWA:** O sistema opera com comportamento e fluidez de aplicativo nativo instalado.
