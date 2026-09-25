---
name: qa-isolated-head
description: No dev-oficina, rodar os gates de QA num snapshot isolado de HEAD, porque o working tree costuma ter trabalho não commitado de outras stories
metadata:
  type: project
---

O working tree do dev-oficina costuma ter alterações não commitadas de várias stories em paralelo (ex.: MFA, Garantias, 2.1 durante o gate da 2.0 em 2026-09-24). Os números de teste do @dev podem vir desse working tree sujo, e não dos commits da story.

**Why:** no gate da Story 2.0, o @dev declarou 18/149 testes verdes, mas HEAD isolado tinha 15/124 com 1 falha pré-existente, corrigida só por trabalho não commitado de outra story.

**How to apply:** `git archive HEAD | tar -x -C /tmp/qaX`, criar um symlink para node_modules e copiar o `.env` (gitignored; sem ele, supabase-connection.test.js falha). Rodar vitest, eslint e vite build ali e comparar com a base da story para separar falhas pré-existentes de regressões. Não usar stash nem checkout (proibidos pelo solicitante).
