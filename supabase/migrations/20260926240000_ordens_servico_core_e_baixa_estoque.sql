-- ==============================================================================
-- Story 2.14: Migração do Núcleo da Ordem de Serviço (OS + Itens) para Supabase
-- Autor: Dara (@data-engineer) / Dex (@dev)
--
-- 1. CHECK de status atualizado com a união dos valores confirmados
-- 2. Defaults para id (gen_random_uuid) e sequence para numero_os
-- 3. RLS: Política de INSERT para secretaria
-- 4. RPC restrita public.aplicar_peca_na_os (ponto único de baixa de estoque)
-- 5. RPC restrita public.devolver_peca_da_os (devolução explícita ao estoque)
-- ==============================================================================

BEGIN;

-- 1. Sincronização do CHECK de status de ordens_servico (AC4) ------------------
ALTER TABLE public.ordens_servico
    DROP CONSTRAINT IF EXISTS ordens_servico_status_check;

ALTER TABLE public.ordens_servico
    ADD CONSTRAINT ordens_servico_status_check
    CHECK (status IN (
        'fila',
        'em_diagnostico',
        'aguardando_pecas',
        'aguardando_aprovacao',
        'aprovado_execucao',
        'pronto_retirada',
        'terceirizado',
        'finalizada',
        'cancelada',
        'orcamento_pendente',
        'execucao_finalizada'
    ));

-- 2. Sequence e defaults de identificadores (AC8, ADR-005 §2.6) ---------------
ALTER TABLE public.ordens_servico
    ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

CREATE SEQUENCE IF NOT EXISTS public.seq_numero_os START WITH 2914;

ALTER TABLE public.ordens_servico
    ALTER COLUMN numero_os SET DEFAULT lpad(nextval('public.seq_numero_os')::text, 6, '0');

-- 3. RLS: Adiciona política de INSERT para secretaria (AC10) -------------------
DROP POLICY IF EXISTS "ordens_servico_insert_secretaria" ON public.ordens_servico;
CREATE POLICY "ordens_servico_insert_secretaria"
    ON public.ordens_servico
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.papel_usuario() = 'admin'
        OR (public.papel_usuario() = 'secretaria' AND public.em_horario_operacional())
    );

-- 4. RPC public.aplicar_peca_na_os (AC11 / Ponto único de baixa) --------------
CREATE OR REPLACE FUNCTION public.aplicar_peca_na_os(
    os_id TEXT,
    item_id TEXT,
    peca_id TEXT,
    quantidade INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_status TEXT;
    v_numero_os TEXT;
    v_mecanico_id TEXT;
    v_itens_pecas JSONB;
    v_novos_itens_pecas JSONB;
    v_papel TEXT;
    v_func_id TEXT;
BEGIN
    -- Autenticação
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Acesso não autorizado' USING ERRCODE = '42501';
    END IF;

    -- Papel
    v_papel := public.papel_usuario();
    IF v_papel NOT IN ('admin', 'secretaria', 'mecanico') THEN
        RAISE EXCEPTION 'Papel de usuário sem permissão para aplicar peça na OS' USING ERRCODE = '42501';
    END IF;

    -- Janela operacional (D4) para secretaria e mecanico
    IF v_papel IN ('secretaria', 'mecanico') AND NOT public.em_horario_operacional() THEN
        RAISE EXCEPTION 'Operação fora do horário comercial (08:00 às 18:59)' USING ERRCODE = '42501';
    END IF;

    -- Validação da OS
    SELECT status, numero_os, mecanico_id, itens_pecas
    INTO v_status, v_numero_os, v_mecanico_id, v_itens_pecas
    FROM public.ordens_servico
    WHERE id = os_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ordem de serviço % não encontrada', os_id USING ERRCODE = 'P0002';
    END IF;

    -- (a) Validação do status: deve ser aprovado_execucao
    IF v_status <> 'aprovado_execucao' THEN
        RAISE EXCEPTION 'Peça só pode ser aplicada em OS no status aprovado_execucao (status atual: %)', v_status
        USING ERRCODE = '22023';
    END IF;

    -- (b) Validação de quantidade
    IF quantidade <= 0 THEN
        RAISE EXCEPTION 'Quantidade de peças deve ser maior que zero' USING ERRCODE = '22023';
    END IF;

    -- (c) Restrição do mecânico à própria OS
    IF v_papel = 'mecanico' THEN
        v_func_id := public.funcionario_atual_id();
        IF v_func_id IS NULL OR v_mecanico_id IS NULL OR v_mecanico_id <> v_func_id THEN
            RAISE EXCEPTION 'Mecânico só pode aplicar peças em ordens de serviço sob sua responsabilidade'
            USING ERRCODE = '42501';
        END IF;
    END IF;

    -- (d) Validação da existência da peça no catálogo
    PERFORM 1 FROM public.pecas WHERE id = peca_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Peça % não encontrada no catálogo', peca_id USING ERRCODE = 'P0002';
    END IF;

    -- Grava movimentação de saída em estoque_movimentacoes (Story 2.8)
    -- O índice único parcial uq_estoque_movimentacoes_os_item_saida protege contra duplicidade
    INSERT INTO public.estoque_movimentacoes (
        peca_id,
        tipo,
        quantidade,
        motivo,
        documento_ref,
        ordem_servico_id,
        os_item_id
    ) VALUES (
        peca_id,
        'saida',
        quantidade,
        'Aplicação de peça na OS #' || v_numero_os,
        'OS-' || v_numero_os,
        os_id,
        item_id
    );

    -- Atualiza itens_pecas (JSONB) na ordens_servico
    SELECT jsonb_agg(
        CASE
            WHEN elem->>'id' = item_id OR elem->>'pecaId' = peca_id
            THEN elem || jsonb_build_object('baixado', true, 'data_baixa', timezone('utc'::text, now())::text)
            ELSE elem
        END
    )
    INTO v_novos_itens_pecas
    FROM jsonb_array_elements(COALESCE(v_itens_pecas, '[]'::jsonb)) AS elem;

    UPDATE public.ordens_servico
    SET itens_pecas = COALESCE(v_novos_itens_pecas, v_itens_pecas),
        updated_at = timezone('utc'::text, now())
    WHERE id = os_id;

    RETURN jsonb_build_object(
        'sucesso', true,
        'os_id', os_id,
        'numero_os', v_numero_os,
        'item_id', item_id,
        'peca_id', peca_id,
        'quantidade', quantidade
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.aplicar_peca_na_os(TEXT, TEXT, TEXT, INTEGER) TO authenticated;

-- 5. RPC public.devolver_peca_da_os (AC12 / Devolução explícita) --------------
CREATE OR REPLACE FUNCTION public.devolver_peca_da_os(
    os_id TEXT,
    item_id TEXT,
    peca_id TEXT,
    quantidade INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_numero_os TEXT;
    v_itens_pecas JSONB;
    v_novos_itens_pecas JSONB;
    v_papel TEXT;
BEGIN
    -- Autenticação
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Acesso não autorizado' USING ERRCODE = '42501';
    END IF;

    -- Papel: apenas admin e secretaria (AC12)
    v_papel := public.papel_usuario();
    IF v_papel NOT IN ('admin', 'secretaria') THEN
        RAISE EXCEPTION 'Apenas administrador e secretaria podem devolver peças ao estoque' USING ERRCODE = '42501';
    END IF;

    -- Janela operacional (D4) para secretaria
    IF v_papel = 'secretaria' AND NOT public.em_horario_operacional() THEN
        RAISE EXCEPTION 'Operação fora do horário comercial (08:00 às 18:59)' USING ERRCODE = '42501';
    END IF;

    -- Validação de quantidade
    IF quantidade <= 0 THEN
        RAISE EXCEPTION 'Quantidade de peças deve ser maior que zero' USING ERRCODE = '22023';
    END IF;

    -- Busca OS
    SELECT numero_os, itens_pecas
    INTO v_numero_os, v_itens_pecas
    FROM public.ordens_servico
    WHERE id = os_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ordem de serviço % não encontrada', os_id USING ERRCODE = 'P0002';
    END IF;

    -- Validação da peça no catálogo
    PERFORM 1 FROM public.pecas WHERE id = peca_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Peça % não encontrada no catálogo', peca_id USING ERRCODE = 'P0002';
    END IF;

    -- Grava movimentação de entrada em estoque_movimentacoes
    INSERT INTO public.estoque_movimentacoes (
        peca_id,
        tipo,
        quantidade,
        motivo,
        documento_ref,
        ordem_servico_id,
        os_item_id
    ) VALUES (
        peca_id,
        'entrada',
        quantidade,
        'Devolução manual de peça da OS #' || v_numero_os,
        'DEV-OS-' || v_numero_os,
        os_id,
        item_id
    );

    -- Atualiza itens_pecas (JSONB)
    SELECT jsonb_agg(
        CASE
            WHEN elem->>'id' = item_id OR elem->>'pecaId' = peca_id
            THEN elem || jsonb_build_object('devolvido', true, 'data_devolucao', timezone('utc'::text, now())::text)
            ELSE elem
        END
    )
    INTO v_novos_itens_pecas
    FROM jsonb_array_elements(COALESCE(v_itens_pecas, '[]'::jsonb)) AS elem;

    UPDATE public.ordens_servico
    SET itens_pecas = COALESCE(v_novos_itens_pecas, v_itens_pecas),
        updated_at = timezone('utc'::text, now())
    WHERE id = os_id;

    RETURN jsonb_build_object(
        'sucesso', true,
        'os_id', os_id,
        'numero_os', v_numero_os,
        'item_id', item_id,
        'peca_id', peca_id,
        'quantidade', quantidade
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.devolver_peca_da_os(TEXT, TEXT, TEXT, INTEGER) TO authenticated;

COMMIT;
