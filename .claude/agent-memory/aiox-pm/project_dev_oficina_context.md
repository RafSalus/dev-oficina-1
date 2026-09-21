---
name: project-dev-oficina-context
description: dev-oficina is a React/Vite workshop ERP prototype, not an AIOX framework repo — CLAUDE.md/AGENTS.md describe a different project and their quality commands do not exist
metadata:
  type: project
---

`dev-oficina` é o **produto** (ERP/PWA de oficina "Mecânica Gabriel"), não o framework AIOX. O AIOX foi instalado no repo em 2026-09-21 e ainda não foi commitado.

**Why:** `.claude/CLAUDE.md` e `AGENTS.md` foram herdados do template AIOX e descrevem outra estrutura (`bin/`, `packages/`, `tests/`). Eles mandam rodar `npm run lint`, `npm run typecheck` e `npm test` — **os três não existem** neste `package.json` (só `dev`, `build`, `preview`). Seguir essas instruções literalmente gera falha garantida.

**How to apply:**
- Fontes de verdade reais do projeto: `SYSTEM_RULES.md` (16 regras de UI vinculantes, mais específicas que qualquer convenção React/Tailwind), `docs/brownfield-architecture.md` (estado real do codebase) e `docs/prd.md` (plano de remediação).
- O preset `nextjs-react` em `.aiox-core/data/technical-preferences.md` **não se aplica** — o projeto é Vite + React 19 em JS puro, sem TypeScript/Zustand/React Query.
- Documentação funcional em `docs/admin/`, `docs/oficina/`, `docs/cliente/` aparece como deletada no git status e é a única fonte de intenção de negócio de módulos incompletos — restaurar antes de commitar.
- Ver [[feedback-pm-brownfield-prd-scope]] para as decisões de escopo já tomadas.
