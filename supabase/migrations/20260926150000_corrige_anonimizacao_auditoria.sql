-- ==============================================================================
-- Story 2.2b — correções do QA gate FAIL (2026-09-26)
-- Autor: Dara (@data-engineer)
--
-- SEC-001 (high): anonimizar_titular_auditoria() aceitava usuário autenticado SEM papel.
--   papel_usuario() = '' → audit_ator() devolvia NULL → "NULL NOT IN (...)" é NULL e não
--   levantava a exceção. Corrigido: a checagem trata NULL como não autorizado.
-- SEC-003 (low): claims presentes sem "role" (ou com role desconhecida) eram classificadas
--   como 'sistema', que pode anonimizar. Agora 'sistema' é só conexão SEM claims; o resto
--   vira 'indefinido' (sem permissão de anonimizar).
-- LGPD-001 (medium): o snapshot do cliente em UPDATEs de OS (diff sem cliente_id) não era
--   anonimizado. Agora as OS do titular são localizadas por registro_id, a partir de
--   ordens_servico.cliente_id e das linhas da trilha que registram o cliente_id.
--
-- ROLLBACK MANUAL: reaplicar as definições de audit_ator() e anonimizar_titular_auditoria()
-- de 20260926140000_auditoria_ator_lgpd.sql (não recomendado: reabre o SEC-001).
-- ==============================================================================

BEGIN;

-- 1. Classificação do ator (ADR-008 §2), com "sistema" restrito a conexões sem claims -------
CREATE OR REPLACE FUNCTION public.audit_ator(
  OUT usuario_id uuid,
  OUT usuario_papel text
)
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  v_claims jsonb := NULLIF(current_setting('request.jwt.claims', true), '')::jsonb;
  v_role text := v_claims ->> 'role';
BEGIN
  IF v_claims IS NULL THEN
    usuario_papel := 'sistema'; -- conexão direta ao banco (SQL Editor, CLI, migrations, pg_cron)
  ELSIF v_role = 'authenticated' THEN
    usuario_id := auth.uid();
    usuario_papel := NULLIF(public.papel_usuario(), '');
  ELSIF v_role = 'anon' THEN
    usuario_papel := 'publico_token';
  ELSIF v_role = 'service_role' THEN
    usuario_papel := 'service_role';
  ELSE
    usuario_papel := 'indefinido'; -- claims sem role reconhecida: nunca tratadas como privilegiadas
  END IF;
END;
$$;

-- 2. Anonimização com checagem que falha fechada e busca das OS por registro_id -------------
CREATE OR REPLACE FUNCTION public.anonimizar_titular_auditoria(p_tabela text, p_registro_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ator record;
  v_pessoa boolean := p_tabela IN ('clientes', 'funcionarios', 'cadastros_clientes');
  v_alteradas integer := 0;
  v_n integer;
BEGIN
  SELECT * INTO v_ator FROM public.audit_ator();

  -- Admin (pedido do titular) ou processos internos (service_role / conexão sem JWT).
  -- COALESCE: papel NULL (autenticado sem papel) nunca passa.
  IF COALESCE(v_ator.usuario_papel, '') NOT IN ('admin', 'service_role', 'sistema') THEN
    RAISE EXCEPTION 'Apenas o administrador pode anonimizar a trilha de auditoria'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  UPDATE public.audit_logs
  SET valor_anterior = public.fn_anonimizar_jsonb(valor_anterior, v_pessoa),
      valor_novo = public.fn_anonimizar_jsonb(valor_novo, v_pessoa)
  WHERE tabela = p_tabela
    AND registro_id = p_registro_id
    AND operacao <> 'ANONIMIZACAO';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_alteradas := v_n;

  -- O snapshot do cliente fica nas linhas da OS (registro_id = id da OS). Com o diff do
  -- UPDATE, a linha pode não ter cliente_id: localiza as OS do titular e anonimiza por id.
  IF p_tabela = 'clientes' THEN
    WITH os_do_titular AS (
      SELECT os.id FROM public.ordens_servico AS os WHERE os.cliente_id = p_registro_id
      UNION
      SELECT a.registro_id FROM public.audit_logs AS a
      WHERE a.tabela = 'ordens_servico'
        AND (a.valor_anterior ->> 'cliente_id' = p_registro_id OR a.valor_novo ->> 'cliente_id' = p_registro_id)
    )
    UPDATE public.audit_logs AS a
    SET valor_anterior = public.fn_anonimizar_jsonb(a.valor_anterior, false),
        valor_novo = public.fn_anonimizar_jsonb(a.valor_novo, false)
    WHERE a.tabela = 'ordens_servico'
      AND a.operacao <> 'ANONIMIZACAO'
      AND a.registro_id IN (SELECT id FROM os_do_titular)
      AND (a.valor_anterior ? 'snapshot_cliente' OR a.valor_novo ? 'snapshot_cliente');
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_alteradas := v_alteradas + v_n;
  END IF;

  INSERT INTO public.audit_logs (
    tabela, registro_id, operacao, usuario_id, usuario_papel, valor_novo, db_usuario
  )
  VALUES (
    p_tabela, p_registro_id, 'ANONIMIZACAO', v_ator.usuario_id, v_ator.usuario_papel,
    jsonb_build_object('linhas_anonimizadas', v_alteradas), session_user
  );

  RETURN v_alteradas;
END;
$$;

COMMIT;
