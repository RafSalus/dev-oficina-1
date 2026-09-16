# Diretrizes e Regras do Sistema - Mecânica Gabriel (dev-oficina)

> **REGRA CRÍTICA DE INTERFACE E ARQUITETURA DE TELAS:**
> 1. **Limite Fixo até o Footer:** A tela principal (`<main>`) tem como limite inferior obrigatório o Footer. Nada pode ultrapassar ou ficar abaixo dele.
> 2. **Sem Scroll na Tela Principal:** É expressamente proibida a criação de scroll vertical na tela principal do sistema (`overflow-hidden` mandatório no container principal).
> 3. **Design de Tela Única (Single-Screen Workspace):** Todos os módulos, cadastros, formulários e listagens devem ser concebidos para caber e operar com 100% de aproveitamento da altura útil (`h-full`, `min-h-0`), utilizando grids inteligentes, colunas proporcionais, painéis ou abas compactas quando necessário.
> 4. **Estilo Visual Uber:** Cores sóbrias e elegantes (fundo neutro `#f3f4f6`, sidebar preta `bg-black`, cartões brancos com borda fina `#e4e7ec`, tipografia nítida e contrastante, sem "árvore de natal" e sem vibe-code).
