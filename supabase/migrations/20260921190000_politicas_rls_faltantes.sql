-- Corrige lacuna de segurança: audit_logs, compras_pedidos e compras_cotacoes tinham RLS
-- habilitado (ALTER TABLE ... ENABLE ROW LEVEL SECURITY, na migração inicial) mas nenhuma
-- política — ou seja, ficavam com acesso totalmente bloqueado (inclusive para o admin) pelas
-- chaves anon/authenticated do app, já que RLS ligado sem política nega tudo por padrão.
--
-- Segue exatamente o mesmo padrão já usado em estoque_movimentacoes (a tabela mais parecida,
-- também ainda não conectada a um fluxo real do app): acesso total só para admin. Nenhuma
-- decisão nova de permissão é introduzida — só fecha a lacuna com a convenção já estabelecida.

BEGIN;

CREATE POLICY "Admin total compras_pedidos" ON public.compras_pedidos FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin total compras_cotacoes" ON public.compras_cotacoes FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin total audit_logs" ON public.audit_logs FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

COMMIT;
