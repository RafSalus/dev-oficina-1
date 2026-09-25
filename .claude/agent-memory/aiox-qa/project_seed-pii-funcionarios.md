---
name: seed-pii-funcionarios
description: Owner removed the real admin PII seed from funcionariosRepository (commit e7ef8a4); the repositories.test "auto-semear" test is stale, not the code
metadata:
  type: project
---

SEED_FUNCIONARIOS must stay `[]`. Commit e7ef8a4 deliberately removed the owner's real data (CPF, phone, address, auth user id) from the seed. The test `tests/unit/repositories.test.js` "deve auto-semear apenas o administrador real" was left stale and fails on HEAD.

**Why:** Story 2.1 (2026-09-24 gate FAIL, SEC-001) "fixed" that test by re-adding the PII, which ended up in the public prod bundle and in localStorage.

**How to apply:** When that test turns green, check whether the seed or the test changed. Only fixing the test is acceptable. Grep `dist/` for PII after building. Related: [[qa-snapshot-validation]] (measure on a `git archive HEAD` snapshot plus the scoped files, not on the working tree).
