-- ==============================================================================
-- Story 2.9: Migração de Compras (Pedidos) e Cotações para Supabase Postgres
-- ADR-005 §2.4 (RPCs transacionais), §2.6 (Sequences), §2.10 (Janela D4), FR25 (RLS)
-- ==============================================================================

-- 1. Sequences dedicadas para numeração de Pedidos e Cotações -----------------

CREATE SEQUENCE IF NOT EXISTS public.seq_compras_pedidos_numero START 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_compras_cotacoes_numero START 9041;

-- Colunas adicionais seguras para compras_pedidos e compras_cotacoes
ALTER TABLE public.compras_pedidos ADD COLUMN IF NOT EXISTS ordem_servico_ref TEXT;
ALTER TABLE public.compras_pedidos ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.compras_cotacoes ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Trigger para gerar número de pedido sequencial (PED-AAAA-NNN)
CREATE OR REPLACE FUNCTION public.fn_gerar_numero_pedido_compra()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    NEW.id := gen_random_uuid()::text;
  END IF;
  IF NEW.numero_pedido IS NULL OR NEW.numero_pedido = '' THEN
    NEW.numero_pedido := concat('PED-', to_char(CURRENT_DATE, 'YYYY'), '-', lpad(nextval('public.seq_compras_pedidos_numero')::text, 3, '0'));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_before_insert_compras_pedidos ON public.compras_pedidos;
CREATE TRIGGER trg_before_insert_compras_pedidos
  BEFORE INSERT ON public.compras_pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_gerar_numero_pedido_compra();

-- Trigger para gerar número de cotação sequencial (COT-AAAA-NNNN)
CREATE OR REPLACE FUNCTION public.fn_gerar_numero_cotacao()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    NEW.id := gen_random_uuid()::text;
  END IF;
  IF NEW.numero_cotacao IS NULL OR NEW.numero_cotacao = '' THEN
    NEW.numero_cotacao := concat('COT-', to_char(CURRENT_DATE, 'YYYY'), '-', nextval('public.seq_compras_cotacoes_numero')::text);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_before_insert_compras_cotacoes ON public.compras_cotacoes;
CREATE TRIGGER trg_before_insert_compras_cotacoes
  BEFORE INSERT ON public.compras_cotacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_gerar_numero_cotacao();

-- 2. RPC transacional: receber_pedido_compra ----------------------------------
-- Atualiza status para 'entregue', lança Kardex por item e anota OS se vinculada
CREATE OR REPLACE FUNCTION public.receber_pedido_compra(
  p_pedido_id text,
  p_documento text DEFAULT NULL
)
RETURNS public.compras_pedidos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_papel text;
  v_pedido public.compras_pedidos;
  v_item jsonb;
  v_peca_id text;
  v_codigo text;
  v_peca_db record;
  v_qtd integer;
  v_os record;
  v_doc text;
BEGIN
  v_papel := public.papel_usuario();
  IF v_papel NOT IN ('secretaria', 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: permissão insuficiente para receber pedido de compra';
  END IF;

  IF v_papel = 'secretaria' AND NOT public.em_horario_operacional() THEN
    RAISE EXCEPTION 'Operação fora do horário comercial permitido (08:00 às 19:00)';
  END IF;

  SELECT * INTO v_pedido
  FROM public.compras_pedidos
  WHERE id = p_pedido_id OR numero_pedido = p_pedido_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido de compra não localizado.' USING ERRCODE = 'P0002';
  END IF;

  IF v_pedido.status = 'entregue' THEN
    RAISE EXCEPTION 'Este pedido de compra já foi recebido anteriormente.' USING ERRCODE = 'P0001';
  END IF;

  v_doc := COALESCE(NULLIF(TRIM(p_documento), ''), v_pedido.numero_pedido);

  -- 1. Dar entrada no estoque para cada item
  IF v_pedido.itens IS NOT NULL AND jsonb_typeof(v_pedido.itens) = 'array' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(v_pedido.itens)
    LOOP
      v_peca_id := v_item->>'pecaId';
      IF v_peca_id IS NULL OR v_peca_id = '' THEN
        v_peca_id := v_item->>'peca_id';
      END IF;
      v_codigo := v_item->>'codigo';
      v_qtd := COALESCE((v_item->>'quantidade')::integer, 1);

      SELECT id INTO v_peca_db
      FROM public.pecas
      WHERE (v_peca_id IS NOT NULL AND id = v_peca_id)
         OR (v_codigo IS NOT NULL AND v_codigo <> '' AND codigo = v_codigo)
      LIMIT 1;

      IF FOUND AND v_qtd > 0 THEN
        PERFORM public.registrar_movimentacao_estoque(
          v_peca_db.id,
          'entrada',
          v_qtd,
          concat('Recebimento de Pedido de Compra #', v_pedido.numero_pedido),
          v_doc,
          'Rafael Almoxarife',
          NULL,
          NULL
        );
      END IF;
    END LOOP;
  END IF;

  -- 2. Atualizar OS se vinculada e aguardando_pecas
  IF v_pedido.ordem_servico_ref IS NOT NULL AND v_pedido.ordem_servico_ref <> '' THEN
    SELECT * INTO v_os
    FROM public.ordens_servico
    WHERE numero_os = v_pedido.ordem_servico_ref OR id = v_pedido.ordem_servico_ref
    FOR UPDATE;

    IF FOUND AND v_os.status = 'aguardando_aprovacao' THEN
      UPDATE public.ordens_servico
      SET status = 'aprovado_execucao',
          updated_at = now()
      WHERE id = v_os.id;
    END IF;
  END IF;

  -- 3. Atualizar status do pedido para entregue
  UPDATE public.compras_pedidos
  SET status = 'entregue',
      updated_at = now()
  WHERE id = v_pedido.id
  RETURNING * INTO v_pedido;

  RETURN v_pedido;
END;
$$;

GRANT EXECUTE ON FUNCTION public.receber_pedido_compra(text, text) TO authenticated, service_role;

-- 3. RPC transacional: aprovar_cotacao_gerar_pedido ---------------------------
-- Atualiza status da cotação para 'aprovada' e gera o pedido oficial atomicamente
CREATE OR REPLACE FUNCTION public.aprovar_cotacao_gerar_pedido(
  p_cotacao_id text,
  p_fornecedor_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_papel text;
  v_cotacao public.compras_cotacoes;
  v_fornecedor jsonb;
  v_f jsonb;
  v_itens_pedido jsonb := '[]'::jsonb;
  v_item jsonb;
  v_item_id text;
  v_preco numeric(10,2);
  v_qtd integer;
  v_valor_total numeric(10,2) := 0.00;
  v_pedido public.compras_pedidos;
  v_novo_item jsonb;
  v_idx integer := 0;
  v_nome_fornecedor text := '';
  v_cond_pagamento text := 'Boleto 30 Dias';
BEGIN
  v_papel := public.papel_usuario();
  IF v_papel NOT IN ('secretaria', 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: permissão insuficiente para aprovar cotação';
  END IF;

  IF v_papel = 'secretaria' AND NOT public.em_horario_operacional() THEN
    RAISE EXCEPTION 'Operação fora do horário comercial permitido (08:00 às 19:00)';
  END IF;

  SELECT * INTO v_cotacao
  FROM public.compras_cotacoes
  WHERE id = p_cotacao_id OR numero_cotacao = p_cotacao_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cotação não localizada.' USING ERRCODE = 'P0002';
  END IF;

  -- Localizar fornecedor em propostas_fornecedores
  IF v_cotacao.propostas_fornecedores IS NOT NULL AND jsonb_typeof(v_cotacao.propostas_fornecedores) = 'array' THEN
    FOR v_f IN SELECT * FROM jsonb_array_elements(v_cotacao.propostas_fornecedores)
    LOOP
      IF v_f->>'id' = p_fornecedor_id THEN
        v_fornecedor := v_f;
        EXIT;
      END IF;
    END LOOP;

    IF v_fornecedor IS NULL AND (p_fornecedor_id IS NULL OR p_fornecedor_id = '') THEN
      v_fornecedor := v_cotacao.propostas_fornecedores->0;
    END IF;
  END IF;

  IF v_fornecedor IS NULL THEN
    RAISE EXCEPTION 'Fornecedor não selecionado para a aprovação da cotação.' USING ERRCODE = 'P0001';
  END IF;

  v_nome_fornecedor := COALESCE(v_fornecedor->>'nome', 'Fornecedor Vencedor');
  v_cond_pagamento := COALESCE(v_fornecedor->>'condicaoPagamento', 'Boleto 30 Dias');

  -- 1. Atualizar cotação para aprovada
  UPDATE public.compras_cotacoes
  SET status = 'aprovada',
      updated_at = now()
  WHERE id = v_cotacao.id
  RETURNING * INTO v_cotacao;

  -- 2. Montar itens com preços do fornecedor vencedor
  IF v_cotacao.itens IS NOT NULL AND jsonb_typeof(v_cotacao.itens) = 'array' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(v_cotacao.itens)
    LOOP
      v_idx := v_idx + 1;
      v_item_id := COALESCE(v_item->>'id', concat('it-', v_idx));
      v_qtd := COALESCE((v_item->>'quantidade')::integer, 1);
      
      v_preco := COALESCE(
        (v_fornecedor->'respostasItens'->v_item_id->>'preco')::numeric,
        (v_item->>'precoEstimado')::numeric,
        0.00
      );

      v_novo_item := jsonb_build_object(
        'id', concat('item-ped-', extract(epoch from now())::bigint, '-', v_idx),
        'pecaId', COALESCE(v_item->>'pecaId', ''),
        'codigo', COALESCE(v_item->>'codigo', ''),
        'nome', COALESCE(v_item->>'nome', 'Item'),
        'unidade', COALESCE(v_item->>'unidade', 'UN'),
        'quantidade', v_qtd,
        'precoCusto', v_preco,
        'valorTotal', (v_qtd * v_preco),
        'marca', COALESCE(v_fornecedor->'respostasItens'->v_item_id->>'marca', v_item->>'marcaSugerida', '')
      );

      v_valor_total := v_valor_total + (v_qtd * v_preco);
      v_itens_pedido := v_itens_pedido || jsonb_build_array(v_novo_item);
    END LOOP;
  END IF;

  -- 3. Inserir pedido de compra com status 'aprovado' (aguardando entrega)
  INSERT INTO public.compras_pedidos (
    fornecedor_id,
    status,
    itens,
    valor_total,
    data_previsao_entrega,
    ordem_servico_ref,
    metadata
  ) VALUES (
    p_fornecedor_id,
    'aprovado',
    v_itens_pedido,
    v_valor_total,
    CURRENT_DATE + 1,
    v_cotacao.ordem_servico_ref,
    jsonb_build_object(
      'fornecedorNome', v_nome_fornecedor,
      'formaPagamento', v_cond_pagamento,
      'origemTipo', CASE WHEN v_cotacao.ordem_servico_ref IS NOT NULL AND v_cotacao.ordem_servico_ref <> '' THEN 'ORDEM_SERVICO' ELSE 'REPOSICAO_ESTOQUE' END,
      'observacoes', concat('Pedido de compra gerado a partir da Cotação #', v_cotacao.numero_cotacao, '. Fornecedor vencedor: ', v_nome_fornecedor)
    )
  )
  RETURNING * INTO v_pedido;

  RETURN jsonb_build_object(
    'cotacao', to_jsonb(v_cotacao),
    'pedido', to_jsonb(v_pedido)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.aprovar_cotacao_gerar_pedido(text, text) TO authenticated, service_role;

-- 4. RLS FR25: Permissões em compras_pedidos e compras_cotacoes ---------------

ALTER TABLE public.compras_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras_cotacoes ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas existentes
DROP POLICY IF EXISTS "Admin total compras_pedidos" ON public.compras_pedidos;
DROP POLICY IF EXISTS "Secretaria le compras_pedidos" ON public.compras_pedidos;
DROP POLICY IF EXISTS "Secretaria insere compras_pedidos" ON public.compras_pedidos;
DROP POLICY IF EXISTS "Secretaria atualiza compras_pedidos" ON public.compras_pedidos;

DROP POLICY IF EXISTS "Admin total compras_cotacoes" ON public.compras_cotacoes;
DROP POLICY IF EXISTS "Secretaria le compras_cotacoes" ON public.compras_cotacoes;
DROP POLICY IF EXISTS "Secretaria insere compras_cotacoes" ON public.compras_cotacoes;
DROP POLICY IF EXISTS "Secretaria atualiza compras_cotacoes" ON public.compras_cotacoes;

-- Políticas compras_pedidos
CREATE POLICY "Admin total compras_pedidos" ON public.compras_pedidos
  FOR ALL TO authenticated
  USING (public.papel_usuario() = 'admin')
  WITH CHECK (public.papel_usuario() = 'admin');

CREATE POLICY "Secretaria le compras_pedidos" ON public.compras_pedidos
  FOR SELECT TO authenticated
  USING (public.papel_usuario() IN ('secretaria', 'admin'));

CREATE POLICY "Secretaria insere compras_pedidos" ON public.compras_pedidos
  FOR INSERT TO authenticated
  WITH CHECK (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  );

CREATE POLICY "Secretaria atualiza compras_pedidos" ON public.compras_pedidos
  FOR UPDATE TO authenticated
  USING (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  )
  WITH CHECK (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  );

-- Políticas compras_cotacoes (NENHUMA política para papel anon - Story 2.17 / ADR-006)
CREATE POLICY "Admin total compras_cotacoes" ON public.compras_cotacoes
  FOR ALL TO authenticated
  USING (public.papel_usuario() = 'admin')
  WITH CHECK (public.papel_usuario() = 'admin');

CREATE POLICY "Secretaria le compras_cotacoes" ON public.compras_cotacoes
  FOR SELECT TO authenticated
  USING (public.papel_usuario() IN ('secretaria', 'admin'));

CREATE POLICY "Secretaria insere compras_cotacoes" ON public.compras_cotacoes
  FOR INSERT TO authenticated
  WITH CHECK (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  );

CREATE POLICY "Secretaria atualiza compras_cotacoes" ON public.compras_cotacoes
  FOR UPDATE TO authenticated
  USING (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  )
  WITH CHECK (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  );
