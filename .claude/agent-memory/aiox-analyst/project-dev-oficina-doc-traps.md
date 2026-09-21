---
name: project-dev-oficina-doc-traps
description: In dev-oficina, SYSTEM_RULES.md is the binding ruleset while AGENTS.md/README.md are stale template leftovers that will mislead
metadata:
  type: project
---

`SYSTEM_RULES.md` (repo root) holds the 16 binding UI/architecture rules for this project and overrides generic React/Tailwind conventions. Meanwhile `AGENTS.md` and `README.md` are stale: `AGENTS.md` came from the AIOX template and describes `bin/`, `packages/`, `tests/` plus `npm run lint|typecheck|test` — none exist here; `README.md` still describes a vanilla Vite project.

**Why:** The AIOX framework was installed into an already-mature app repo on 2026-09-21, so its boilerplate docs never matched reality. Following them wastes a cycle on commands that fail.

**How to apply:** For any analysis, doc or plan touching this repo, read `SYSTEM_RULES.md` first and verify commands against `package.json` (only `dev`, `build`, `preview`) rather than trusting `AGENTS.md`. Full current-state analysis lives in `docs/brownfield-architecture.md`.
