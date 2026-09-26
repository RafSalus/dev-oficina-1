---
name: supabase-prod-qa-policy
description: Supabase CLI is linked to the PRODUCTION project "Oficina"; QA may only run read-only counts and ROLLBACK-terminated SQL tests, never display PII
metadata:
  type: project
---

`npx supabase` in this repo is logged in and linked to the production project "Oficina" (Epic 2 migrations are applied there directly). QA may run read-only queries (`db query --linked "SELECT ..."`) and the transactional `supabase/tests/*.test.sql` files, which end in ROLLBACK. No `db push`, no persistent writes, and no CPF/phone/email in output: use counts and booleans only.

**Why:** It is a real production database containing the owner's PII. The lead set these limits for the Story 2.3 gate (2026-09-26).

**How to apply:** `db query -f` shows only the last result set, and NOTICEs are hidden. A RAISE EXCEPTION returns exit 1, so exit 0 means the test passed. Compare counts before and after (audit_logs, auth.users, test-prefixed rows) to prove there is no residue. The 2.3 test inserts into auth.users inside the transaction (TEST-001), so flag any new tests that write to the auth schema in prod.
