-- ==============================================================================
-- Story 2.10: Migração da Agenda Dinâmica e Fila de Espera para Supabase Postgres
-- ADR-005 §2.6 (id UUID/TEXT), §2.7 (Gravação por linha e concorrência otimista),
-- §2.4 (RPC transacional cascata), FR25 (RLS)
-- ==============================================================================

-- 1. Criação da tabela public.agenda_agendamentos -----------------------------

CREATE TABLE IF NOT EXISTS public.agenda_agendamentos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  mecanico_id TEXT REFERENCES public.funcionarios(id) ON DELETE SET NULL,
  mecanico_nome TEXT,
  cliente_id TEXT REFERENCES public.clientes(id) ON DELETE SET NULL,
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT,
  cliente_endereco TEXT,
  veiculo_id TEXT REFERENCES public.veiculos(id) ON DELETE SET NULL,
  veiculo_modelo TEXT NOT NULL,
  veiculo_placa TEXT,
  servico_descricao TEXT NOT NULL,
  dia_chave TEXT NOT NULL CHECK (dia_chave IN ('seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom')),
  data_agendamento DATE,
  horario_inicio TEXT NOT NULL,
  duracao_horas INTEGER NOT NULL DEFAULT 1,
  tipo_logistica TEXT NOT NULL DEFAULT 'CLIENTE_LEVA' CHECK (tipo_logistica IN ('CLIENTE_LEVA', 'OFICINA_BUSCA')),
  horario_veiculo TEXT,
  endereco_coleta TEXT,
  observacoes TEXT,
  em_atraso BOOLEAN NOT NULL DEFAULT false,
  tempo_atraso_minutos INTEGER NOT NULL DEFAULT 0,
  foi_empurrado_cascata BOOLEAN NOT NULL DEFAULT false,
  empurrado_de_dia TEXT,
  empurrado_minutos INTEGER DEFAULT 0,
  motivo_empurrado TEXT,
  horario_original TEXT,
  dia_original TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Criação da tabela public.agenda_fila_espera --------------------------------

CREATE TABLE IF NOT EXISTS public.agenda_fila_espera (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  cliente_id TEXT REFERENCES public.clientes(id) ON DELETE SET NULL,
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT,
  veiculo_id TEXT REFERENCES public.veiculos(id) ON DELETE SET NULL,
  veiculo_modelo TEXT,
  veiculo_placa TEXT,
  motivo TEXT,
  prioridade TEXT NOT NULL DEFAULT 'NORMAL' CHECK (prioridade IN ('GARANTIA', 'RETORNO', 'URGENTE', 'NORMAL')),
  hora_chegada TEXT NOT NULL,
  data_chegada DATE NOT NULL DEFAULT CURRENT_DATE,
  mecanico_preferencial_id TEXT REFERENCES public.funcionarios(id) ON DELETE SET NULL,
  tempo_estimado_minutos INTEGER DEFAULT 45,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Índices de apoio ---------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_agenda_agendamentos_mec_dia ON public.agenda_agendamentos(mecanico_id, dia_chave);
CREATE INDEX IF NOT EXISTS idx_agenda_agendamentos_data ON public.agenda_agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agenda_fila_espera_data ON public.agenda_fila_espera(data_chegada, prioridade);

-- 4. Triggers de updated_at e Auditoria (Story 2.2) ----------------------------

DROP TRIGGER IF EXISTS trg_set_updated_at_agenda_agendamentos ON public.agenda_agendamentos;
CREATE TRIGGER trg_set_updated_at_agenda_agendamentos
  BEFORE UPDATE ON public.agenda_agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_agenda_fila_espera ON public.agenda_fila_espera;
CREATE TRIGGER trg_set_updated_at_agenda_fila_espera
  BEFORE UPDATE ON public.agenda_fila_espera
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_audit_agenda_agendamentos ON public.agenda_agendamentos;
CREATE TRIGGER trg_audit_agenda_agendamentos
  AFTER INSERT OR UPDATE OR DELETE ON public.agenda_agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_agenda_fila_espera ON public.agenda_fila_espera;
CREATE TRIGGER trg_audit_agenda_fila_espera
  AFTER INSERT OR UPDATE OR DELETE ON public.agenda_fila_espera
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_audit_trigger();

-- 5. RPC Transacional: aplicar_cascata_atrasos_agenda -------------------------
-- Aplica recálculo de cascata de atrasos atômico (tudo ou nada) com checagem de concorrência
CREATE OR REPLACE FUNCTION public.aplicar_cascata_atrasos_agenda(
  p_itens jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_papel text;
  v_item jsonb;
  v_reg public.agenda_agendamentos;
  v_count integer := 0;
  v_id text;
  v_updated_at_lido text;
BEGIN
  v_papel := public.papel_usuario();
  IF v_papel NOT IN ('secretaria', 'mecanico', 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: permissão insuficiente para aplicar cascata de atrasos';
  END IF;

  IF v_papel IN ('secretaria', 'mecanico') AND NOT public.em_horario_operacional() THEN
    RAISE EXCEPTION 'Operação fora do horário comercial permitido (08:00 às 19:00)';
  END IF;

  IF p_itens IS NULL OR jsonb_typeof(p_itens) <> 'array' THEN
    RAISE EXCEPTION 'Lista de agendamentos em formato inválido';
  END IF;

  -- 1ª etapa: validação e lock pessimista para garantir consistência otimista
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens)
  LOOP
    v_id := v_item->>'id';
    v_updated_at_lido := v_item->>'updated_at_lido';

    SELECT * INTO v_reg
    FROM public.agenda_agendamentos
    WHERE id = v_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Agendamento % não localizado', v_id USING ERRCODE = 'P0002';
    END IF;

    IF v_updated_at_lido IS NOT NULL AND v_reg.updated_at::text <> v_updated_at_lido THEN
      RAISE EXCEPTION 'Conflito de edição no agendamento % (edição concorrente detectada)', v_id USING ERRCODE = 'P0003';
    END IF;
  END LOOP;

  -- 2ª etapa: aplicação das alterações atômicas
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens)
  LOOP
    v_id := v_item->>'id';

    UPDATE public.agenda_agendamentos
    SET
      dia_chave = COALESCE(v_item->>'dia_chave', v_item->>'diaChave', dia_chave),
      dia_original = COALESCE(v_item->>'dia_original', v_item->>'diaOriginal', dia_original),
      horario_inicio = COALESCE(v_item->>'horario_inicio', v_item->>'horarioInicio', horario_inicio),
      horario_original = COALESCE(v_item->>'horario_original', v_item->>'horarioOriginal', horario_original),
      foi_empurrado_cascata = COALESCE((v_item->>'foi_empurrado_cascata')::boolean, (v_item->>'foiEmpurradoCascata')::boolean, foi_empurrado_cascata),
      empurrado_minutos = COALESCE((v_item->>'empurrado_minutos')::integer, (v_item->>'empurradoMinutos')::integer, empurrado_minutos),
      empurrado_de_dia = COALESCE(v_item->>'empurrado_de_dia', v_item->>'empurradoDeDia', empurrado_de_dia),
      motivo_empurrado = COALESCE(v_item->>'motivo_empurrado', v_item->>'motivoEmpurrado', motivo_empurrado),
      em_atraso = COALESCE((v_item->>'em_atraso')::boolean, (v_item->>'emAtraso')::boolean, em_atraso),
      tempo_atraso_minutos = COALESCE((v_item->>'tempo_atraso_minutos')::integer, (v_item->>'tempoAtrasoMinutos')::integer, tempo_atraso_minutos),
      updated_at = now()
    WHERE id = v_id;

    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'sucesso', true,
    'total_afetado', v_count
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.aplicar_cascata_atrasos_agenda(jsonb) TO authenticated, service_role;

-- 6. Row Level Security (RLS) FR25 --------------------------------------------

ALTER TABLE public.agenda_agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_fila_espera ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas existentes se houver
DROP POLICY IF EXISTS "Admin total agenda_agendamentos" ON public.agenda_agendamentos;
DROP POLICY IF EXISTS "Equipe le agenda_agendamentos" ON public.agenda_agendamentos;
DROP POLICY IF EXISTS "Equipe insere agenda_agendamentos" ON public.agenda_agendamentos;
DROP POLICY IF EXISTS "Equipe atualiza agenda_agendamentos" ON public.agenda_agendamentos;
DROP POLICY IF EXISTS "Equipe exclui agenda_agendamentos" ON public.agenda_agendamentos;

DROP POLICY IF EXISTS "Admin total agenda_fila_espera" ON public.agenda_fila_espera;
DROP POLICY IF EXISTS "Equipe le agenda_fila_espera" ON public.agenda_fila_espera;
DROP POLICY IF EXISTS "Equipe insere agenda_fila_espera" ON public.agenda_fila_espera;
DROP POLICY IF EXISTS "Equipe atualiza agenda_fila_espera" ON public.agenda_fila_espera;
DROP POLICY IF EXISTS "Equipe exclui agenda_fila_espera" ON public.agenda_fila_espera;

-- Políticas para agenda_agendamentos
CREATE POLICY "Admin total agenda_agendamentos" ON public.agenda_agendamentos
  FOR ALL TO authenticated
  USING (public.papel_usuario() = 'admin')
  WITH CHECK (public.papel_usuario() = 'admin');

CREATE POLICY "Equipe le agenda_agendamentos" ON public.agenda_agendamentos
  FOR SELECT TO authenticated
  USING (public.papel_usuario() IN ('secretaria', 'mecanico', 'admin'));

CREATE POLICY "Equipe insere agenda_agendamentos" ON public.agenda_agendamentos
  FOR INSERT TO authenticated
  WITH CHECK (public.papel_usuario() IN ('secretaria', 'mecanico', 'admin'));

CREATE POLICY "Equipe atualiza agenda_agendamentos" ON public.agenda_agendamentos
  FOR UPDATE TO authenticated
  USING (
    public.papel_usuario() IN ('secretaria', 'mecanico', 'admin')
    AND (public.papel_usuario() = 'admin' OR public.em_horario_operacional())
  )
  WITH CHECK (
    public.papel_usuario() IN ('secretaria', 'mecanico', 'admin')
    AND (public.papel_usuario() = 'admin' OR public.em_horario_operacional())
  );

CREATE POLICY "Equipe exclui agenda_agendamentos" ON public.agenda_agendamentos
  FOR DELETE TO authenticated
  USING (public.papel_usuario() IN ('secretaria', 'admin'));

-- Políticas para agenda_fila_espera
CREATE POLICY "Admin total agenda_fila_espera" ON public.agenda_fila_espera
  FOR ALL TO authenticated
  USING (public.papel_usuario() = 'admin')
  WITH CHECK (public.papel_usuario() = 'admin');

CREATE POLICY "Equipe le agenda_fila_espera" ON public.agenda_fila_espera
  FOR SELECT TO authenticated
  USING (public.papel_usuario() IN ('secretaria', 'mecanico', 'admin'));

CREATE POLICY "Equipe insere agenda_fila_espera" ON public.agenda_fila_espera
  FOR INSERT TO authenticated
  WITH CHECK (public.papel_usuario() IN ('secretaria', 'mecanico', 'admin'));

CREATE POLICY "Equipe atualiza agenda_fila_espera" ON public.agenda_fila_espera
  FOR UPDATE TO authenticated
  USING (
    public.papel_usuario() IN ('secretaria', 'mecanico', 'admin')
    AND (public.papel_usuario() = 'admin' OR public.em_horario_operacional())
  )
  WITH CHECK (
    public.papel_usuario() IN ('secretaria', 'mecanico', 'admin')
    AND (public.papel_usuario() = 'admin' OR public.em_horario_operacional())
  );

CREATE POLICY "Equipe exclui agenda_fila_espera" ON public.agenda_fila_espera
  FOR DELETE TO authenticated
  USING (public.papel_usuario() IN ('secretaria', 'admin'));
