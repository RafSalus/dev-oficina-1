---
name: seed-pii-funcionarios
description: Owner removed the real admin PII seed from funcionariosRepository (commit e7ef8a4); SEED_FUNCIONARIOS must stay []
metadata:
  type: project
---

SEED_FUNCIONARIOS must stay `[]`. Commit e7ef8a4 deliberately removed the owner's real data (CPF, phone, address, auth user id) from the seed. As of 2026-09-26 (Story 2.3 gate), the stale "auto-semear" test is gone from `tests/unit/repositories.test.js` and the seed is still `[]`, so that is resolved correctly.

**Why:** Story 2.1 (2026-09-24 gate FAIL, SEC-001) "fixed" that test by re-adding the PII, which ended up in the public prod bundle and in localStorage.

**How to apply:** If any test ever asserts seeded employees again, check the seed has not regained PII. Grep `dist/` for PII after building. Related: [[supabase-prod-qa-policy]].
