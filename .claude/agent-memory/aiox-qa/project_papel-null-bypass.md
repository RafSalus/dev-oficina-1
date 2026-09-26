---
name: papel-null-bypass
description: papel_usuario() returns '' for users without app_metadata.role; any NULLIF plus NOT IN check fails open. Found in 2.2b anonimizar_titular_auditoria (gate FAIL, 2026-09-26)
metadata:
  type: project
---

`public.papel_usuario()` returns `''` when the JWT has no `app_metadata.role`. When code wraps it in `NULLIF(..., '')` and then checks `papel NOT IN (...)`, the check evaluates to NULL and the guard is skipped. This happened in Story 2.2b: `anonimizar_titular_auditoria` could be called by any authenticated user without a role. Gate FAIL, SEC-001, on 2026-09-26, with the vulnerable function already in production.

**Why:** Authenticated users without a role are realistic: public signup with the anon key, accounts created before a role is set, and future "cliente" users.

**How to apply:** In every SECURITY DEFINER function or RLS check for this project, test the case of an authenticated user with no role and require a fail-closed form such as `COALESCE(x,'') NOT IN` or `IS DISTINCT FROM 'admin'`. Also confirm that the harness `pgtest/qa22b.mjs` (scratchpad) covers the fix. Related: [[supabase-prod-qa-policy]].
