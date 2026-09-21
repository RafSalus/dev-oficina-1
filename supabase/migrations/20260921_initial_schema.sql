-- ==============================================================================
-- MECÂNICA GABRIEL — ESQUEMA RELACIONAL & POLÍTICAS RLS (SUPABASE POSTGRES)
-- Migração Inicial: 20260921_initial_schema.sql
-- Autor: Aria (@architect) & Dex (@dev)
-- ==============================================================================

-- 0. Extensões Essenciais
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABELA DE FUNCIONÁRIOS & EQUIPE (Regra 14: Restrito à Gestão)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.funcionarios (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    telefone TEXT NOT NULL,
    cargo TEXT NOT NULL CHECK (cargo IN ('mecanico', 'secretaria', 'gerente', 'eletricista', 'auxiliar')),
    cargo_label TEXT,
    especialidade TEXT,
    email TEXT,
    box_elevador TEXT,
    comissao_servicos NUMERIC(5,2) DEFAULT 0.00,
    comissao_pecas NUMERIC(5,2) DEFAULT 0.00,
    data_admissao DATE NOT NULL DEFAULT CURRENT_DATE,
    horario_trabalho TEXT DEFAULT '08:00 às 19:00',
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 2. CLIENTES E PROPRIETÁRIOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.clientes (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'PF' CHECK (tipo IN ('PF', 'PJ')),
    cpf_cnpj TEXT UNIQUE NOT NULL,
    telefone TEXT NOT NULL,
    telefone_secundario TEXT,
    email TEXT,
    endereco JSONB DEFAULT '{}'::jsonb,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 3. VEÍCULOS & FROTA
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.veiculos (
    id TEXT PRIMARY KEY,
    cliente_id TEXT REFERENCES public.clientes(id) ON DELETE CASCADE,
    placa TEXT UNIQUE NOT NULL,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    ano TEXT,
    combustivel TEXT DEFAULT 'Flex',
    cor TEXT,
    km_atual INTEGER DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 4. CATÁLOGO DE PEÇAS & SUPRIMENTOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pecas (
    id TEXT PRIMARY KEY,
    codigo TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT DEFAULT 'Geral',
    unidade_medida TEXT DEFAULT 'UN',
    estoque_atual INTEGER DEFAULT 0,
    estoque_minimo INTEGER DEFAULT 2,
    preco_custo NUMERIC(10,2) DEFAULT 0.00,
    preco_venda NUMERIC(10,2) DEFAULT 0.00,
    margem_lucro NUMERIC(5,2) DEFAULT 0.00,
    localizacao TEXT,
    fornecedor_padrao TEXT,
    cst_csosn TEXT DEFAULT '102',
    cfop TEXT DEFAULT '5102',
    ncm TEXT DEFAULT '8708.29.99',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 5. CATÁLOGO DE SERVIÇOS (MÃO DE OBRA)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.servicos (
    id TEXT PRIMARY KEY,
    codigo TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT DEFAULT 'Mecânica Geral',
    valor_mao_de_obra NUMERIC(10,2) DEFAULT 0.00,
    tempo_estimado_horas NUMERIC(4,2) DEFAULT 1.00,
    cnae TEXT DEFAULT '4520-0/01',
    codigo_servico_ibpt TEXT DEFAULT '14.01',
    aliquota_iss NUMERIC(5,2) DEFAULT 5.00,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 6. FORNECEDORES & TERCEIROS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.terceiros (
    id TEXT PRIMARY KEY,
    razao_social TEXT NOT NULL,
    nome_fantasia TEXT,
    cnpj_cpf TEXT,
    telefone TEXT,
    email TEXT,
    ramo_atividade TEXT,
    tempo_medio_retorno_horas NUMERIC(4,1) DEFAULT 24.0,
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 7. KARDEX & MOVIMENTAÇÕES DE ESTOQUE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.estoque_movimentacoes (
    id TEXT PRIMARY KEY,
    peca_id TEXT REFERENCES public.pecas(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste')),
    quantidade INTEGER NOT NULL,
    motivo TEXT NOT NULL,
    documento_ref TEXT,
    usuario TEXT DEFAULT 'Sistema',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 8. PEDIDOS DE COMPRA & COTAÇÕES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.compras_pedidos (
    id TEXT PRIMARY KEY,
    numero_pedido TEXT UNIQUE NOT NULL,
    fornecedor_id TEXT REFERENCES public.terceiros(id),
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'entregue', 'cancelado')),
    itens JSONB DEFAULT '[]'::jsonb,
    valor_total NUMERIC(10,2) DEFAULT 0.00,
    data_previsao_entrega DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compras_cotacoes (
    id TEXT PRIMARY KEY,
    numero_cotacao TEXT UNIQUE NOT NULL,
    ordem_servico_ref TEXT,
    status TEXT NOT NULL DEFAULT 'em_cotacao' CHECK (status IN ('em_cotacao', 'respondida', 'aprovada', 'cancelada')),
    itens JSONB DEFAULT '[]'::jsonb,
    propostas_fornecedores JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 9. TABELA CENTRAL DE ORDENS DE SERVIÇO (MÁQUINA DE ESTADOS CR2)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ordens_servico (
    id TEXT PRIMARY KEY,
    numero_os TEXT UNIQUE NOT NULL,
    cliente_id TEXT REFERENCES public.clientes(id),
    veiculo_id TEXT REFERENCES public.veiculos(id),
    mecanico_id TEXT REFERENCES public.funcionarios(id),
    mecanico_nome TEXT,
    status TEXT NOT NULL DEFAULT 'fila' CHECK (
        status IN (
            'fila',
            'em_diagnostico',
            'orcamento_pendente',
            'aguardando_aprovacao',
            'aprovado_execucao',
            'execucao_finalizada',
            'pronto_retirada',
            'finalizada',
            'cancelada'
        )
    ),
    snapshot_cliente JSONB NOT NULL DEFAULT '{}'::jsonb,
    snapshot_veiculo JSONB NOT NULL DEFAULT '{}'::jsonb,
    sintomas_cliente TEXT,
    diagnostico_tecnico TEXT,
    itens_pecas JSONB DEFAULT '[]'::jsonb,
    itens_servicos JSONB DEFAULT '[]'::jsonb,
    itens_terceiros JSONB DEFAULT '[]'::jsonb,
    subtotal_pecas NUMERIC(10,2) DEFAULT 0.00,
    subtotal_servicos NUMERIC(10,2) DEFAULT 0.00,
    subtotal_terceiros NUMERIC(10,2) DEFAULT 0.00,
    desconto_geral NUMERIC(10,2) DEFAULT 0.00,
    valor_total NUMERIC(10,2) DEFAULT 0.00,
    km_entrada INTEGER DEFAULT 0,
    nivel_combustivel TEXT DEFAULT '1/2',
    checklist_entrada JSONB DEFAULT '{}'::jsonb,
    fotos_entrada JSONB DEFAULT '[]'::jsonb,
    assinatura_cliente TEXT,
    data_entrada TIMESTAMPTZ DEFAULT now(),
    previsao_entrega TIMESTAMPTZ,
    data_finalizacao TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 10. TRILHA DE AUDITORIA & LGPD (Gate G2.7)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabela TEXT NOT NULL,
    registro_id TEXT NOT NULL,
    operacao TEXT NOT NULL,
    usuario_id UUID,
    usuario_papel TEXT,
    valor_anterior JSONB,
    valor_novo JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) — SEGURANÇA SOBERANA NO POSTGRES
-- ==============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pecas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras_cotacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 11.1. Política para Administrador (Acesso Total 24/7)
CREATE POLICY "Admin total funcionarios" ON public.funcionarios FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin total clientes" ON public.clientes FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin total veiculos" ON public.veiculos FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin total pecas" ON public.pecas FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin total servicos" ON public.servicos FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin total terceiros" ON public.terceiros FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin total estoque" ON public.estoque_movimentacoes FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin total ordens_servico" ON public.ordens_servico FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 11.2. Acesso da Equipe Operacional (Secretaria e Mecânico)
-- Leitura de catálogos e clientes
CREATE POLICY "Equipe le clientes" ON public.clientes FOR SELECT TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('secretaria', 'mecanico', 'admin'));

CREATE POLICY "Equipe le veiculos" ON public.veiculos FOR SELECT TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('secretaria', 'mecanico', 'admin'));

CREATE POLICY "Equipe le pecas" ON public.pecas FOR SELECT TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('secretaria', 'mecanico', 'admin'));

CREATE POLICY "Equipe le servicos" ON public.servicos FOR SELECT TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('secretaria', 'mecanico', 'admin'));

CREATE POLICY "Equipe le terceiros" ON public.terceiros FOR SELECT TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('secretaria', 'mecanico', 'admin'));

-- Secretaria pode criar e editar clientes e veículos
CREATE POLICY "Secretaria grava clientes" ON public.clientes FOR INSERT TO authenticated
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('secretaria', 'admin'));

CREATE POLICY "Secretaria atualiza clientes" ON public.clientes FOR UPDATE TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('secretaria', 'admin'));

CREATE POLICY "Secretaria grava veiculos" ON public.veiculos FOR INSERT TO authenticated
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('secretaria', 'admin'));

CREATE POLICY "Secretaria atualiza veiculos" ON public.veiculos FOR UPDATE TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('secretaria', 'admin'));

-- 11.3. Restrição de Horário para Operadores (08:00 às 19:00 Horário de Brasília) - Gate G2.6
CREATE POLICY "Operadores atualizam OS em horario comercial" ON public.ordens_servico FOR UPDATE TO authenticated
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('secretaria', 'mecanico')
        AND EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo') >= 8
        AND EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo') < 19
    );

CREATE POLICY "Operadores leem OSs" ON public.ordens_servico FOR SELECT TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('secretaria', 'mecanico', 'admin'));

-- 11.4. Políticas para Chave Pública e Leitura Inicial de Seeds (Public Anon Fallback)
CREATE POLICY "Public anon select pecas" ON public.pecas FOR SELECT TO anon USING (true);
CREATE POLICY "Public anon select servicos" ON public.servicos FOR SELECT TO anon USING (true);
CREATE POLICY "Public anon select terceiros" ON public.terceiros FOR SELECT TO anon USING (true);
CREATE POLICY "Public anon select funcionarios" ON public.funcionarios FOR SELECT TO anon USING (ativo = true);

-- ==============================================================================
-- 12. SEEDS INICIAIS DA MECÂNICA GABRIEL
-- ==============================================================================

-- Funcionários Iniciais
INSERT INTO public.funcionarios (id, nome, cpf, telefone, cargo, cargo_label, especialidade, email, box_elevador, comissao_servicos, comissao_pecas, data_admissao, horario_trabalho, ativo, observacoes)
VALUES
    ('mec-carlos', 'Carlos Eduardo Silveira', '284.910.482-15', '(43) 99876-1122', 'mecanico', 'Chefe de Oficina', 'Injeção Eletrônica e Motor', 'carlos.eduardo@mecanicagabriel.com.br', 'Box 01 (Elevador Hidráulico)', 15.0, 2.5, '2022-03-10', '08:00 às 19:00', true, 'Chefe da equipe técnica.'),
    ('mec-gabriel', 'Gabriel Amaral', '392.817.409-88', '(43) 99876-3344', 'mecanico', 'Mecânico Especialista', 'Suspensão, Freios e Geometria 3D', 'gabriel.amaral@mecanicagabriel.com.br', 'Box 02 (Alinhador 3D)', 12.0, 2.0, '2023-01-15', '08:00 às 19:00', true, 'Especialista em alinhamento 3D.'),
    ('mec-rafael', 'Rafael Salustiano', '401.928.374-55', '(43) 99876-5566', 'mecanico', 'Mecânico Pleno', 'Transmissão, Câmbio e Embreagem', 'rafael.salustiano@mecanicagabriel.com.br', 'Box 03 (Elevador 4 Toneladas)', 10.0, 2.0, '2023-08-01', '08:00 às 19:00', true, 'Especialista em caixas de câmbio.'),
    ('mec-rodrigo', 'Rodrigo Alencar', '512.839.401-22', '(43) 99876-7788', 'mecanico', 'Mecânico Especialista', 'Suspensão e Freios Pesados', 'rodrigo.alencar@mecanicagabriel.com.br', 'Box 04 (Vala de Inspeção)', 12.0, 2.0, '2023-05-20', '08:00 às 19:00', true, 'Especialista em utilitários e vans.'),
    ('mec-danilo', 'Danilo Silva', '623.940.512-33', '(43) 99876-8899', 'eletricista', 'Eletricista Automotivo', 'Elétrica, Baterias e Ar Condicionado', 'danilo.silva@mecanicagabriel.com.br', 'Box 05 (Bancada Elétrica)', 12.0, 2.5, '2022-11-10', '08:00 às 19:00', true, 'Diagnóstico de redes CAN e alternadores.'),
    ('mec-lucas', 'Lucas Nogueira', '734.051.623-44', '(43) 99876-0011', 'auxiliar', 'Auxiliar de Mecânica', 'Manutenção Básica, Óleo e Filtros', 'lucas.nogueira@mecanicagabriel.com.br', 'Box 06 (Rampa de Troca de Óleo)', 5.0, 1.0, '2024-02-01', '08:00 às 19:00', true, 'Apoio geral no pátio e boxes.'),
    ('func-mariana', 'Mariana Alencar Ferreira', '192.837.465-09', '(43) 99876-4455', 'secretaria', 'Secretária / Atendimento', 'Recepção, Triagem e Emissão de OS', 'mariana.ferreira@mecanicagabriel.com.br', 'Recepção Principal', 0.0, 0.0, '2023-02-01', '08:00 às 19:00', true, 'Atendimento inicial de balcão e agendamentos.'),
    ('func-roberto', 'Roberto Carlos Meneghel', '847.291.034-77', '(43) 99876-6677', 'gerente', 'Gerente Geral', 'Gestão Financeira, DRE e Compras', 'roberto.meneghel@mecanicagabriel.com.br', 'Escritório Administrativo', 2.0, 1.0, '2021-08-15', '08:00 às 19:00', true, 'Gerente administrativo e financeiro.')
ON CONFLICT (id) DO NOTHING;

-- Peças Iniciais
INSERT INTO public.pecas (id, codigo, nome, descricao, categoria, unidade_medida, estoque_atual, estoque_minimo, preco_custo, preco_venda, margem_lucro, localizacao, fornecedor_padrao, ativo)
VALUES
    ('peca-001', 'OLE-5W30-SINT', 'Óleo Motor 5W30 100% Sintético', 'Lubrificante sintético para motores flex e gasolina modernos', 'Óleos e Fluidos', 'LT', 48, 12, 28.50, 48.00, 68.42, 'Prateleira A-01', 'Distribuidora LubriMax', true),
    ('peca-002', 'FLT-OLEO-UNIV', 'Filtro de Óleo Blindado Linha Leve', 'Elemento filtrante de óleo para motores 1.0 a 1.8 flex', 'Filtros', 'UN', 24, 6, 14.00, 32.00, 128.57, 'Prateleira B-03', 'AutoPeças Brasil', true),
    ('peca-003', 'PST-FRT-VENT', 'Jogo de Pastilhas de Freio Dianteiras', 'Pastilhas cerâmicas de alta durabilidade e baixo ruído', 'Freios', 'JG', 12, 4, 65.00, 140.00, 115.38, 'Prateleira C-02', 'Freios & Cia', true),
    ('peca-004', 'DIS-FRT-VENT', 'Par de Discos de Freio Dianteiros Ventilados', 'Discos usinados em ferro fundido de alta dissipação térmica', 'Freios', 'PR', 8, 2, 140.00, 290.00, 107.14, 'Prateleira C-04', 'Freios & Cia', true),
    ('peca-005', 'VEL-IGN-IRID', 'Jogo de Velas de Ignição Iridium (4 Unidades)', 'Velas de alta performance para ignição estável e economia de combustível', 'Ignição', 'JG', 10, 3, 95.00, 190.00, 100.00, 'Prateleira D-01', 'Distribuidora EletroCar', true)
ON CONFLICT (id) DO NOTHING;

-- Serviços Iniciais
INSERT INTO public.servicos (id, codigo, nome, descricao, categoria, valor_mao_de_obra, tempo_estimado_horas, cnae, codigo_servico_ibpt, aliquota_iss, ativo)
VALUES
    ('serv-001', 'SRV-TROCA-OLEO', 'Troca de Óleo e Filtros do Motor', 'Substituição completa do lubrificante e do filtro de óleo com descarte ecológico', 'Revisão e Lubrificação', 60.00, 0.75, '4520-0/01', '14.01', 5.0, true),
    ('serv-002', 'SRV-REVISAO-FREIO', 'Revisão Completa do Sistema de Freios', 'Troca de pastilhas, sangria de fluido DOT 4 e inspeção de discos e tambores', 'Freios', 130.00, 1.50, '4520-0/01', '14.01', 5.0, true),
    ('serv-003', 'SRV-GEOMETRIA-3D', 'Alinhamento de Direção 3D e Balanceamento', 'Calibração a laser dos ângulos de caster, camber e convergência das 4 rodas', 'Suspensão e Geometria', 120.00, 1.00, '4520-0/01', '14.01', 5.0, true),
    ('serv-004', 'SRV-DIAG-ELETRON', 'Diagnóstico Eletrônico Computadorizado', 'Varredura completa de módulos com scanner automotivo e laudo técnico impresso', 'Diagnóstico e Injeção', 150.00, 1.00, '4520-0/01', '14.01', 5.0, true),
    ('serv-005', 'SRV-SUSPENSAO', 'Substituição de Amortecedores e Batentes Dianteiros', 'Desmontagem, troca do conjunto de amortecedor e batentes e teste em rampa', 'Suspensão', 180.00, 2.50, '4520-0/01', '14.01', 5.0, true)
ON CONFLICT (id) DO NOTHING;

-- Terceiros Iniciais
INSERT INTO public.terceiros (id, razao_social, nome_fantasia, cnpj_cpf, telefone, email, ramo_atividade, tempo_medio_retorno_horas, ativo)
VALUES
    ('terc-001', 'Retífica de Motores Norte Paranaense Ltda', 'Retífica Norte', '12.345.678/0001-90', '(43) 3321-4455', 'contato@retificanorte.com.br', 'Retífica de Cabeçotes e Blocos', 48.0, true),
    ('terc-002', 'Torno e Solda Especializada Gabriel & Filhos', 'Torno e Solda Gabriel', '23.456.789/0001-01', '(43) 3321-7788', 'tornoesolda@gabriel.com.br', 'Usinagem e Recuperação de Eixos', 24.0, true)
ON CONFLICT (id) DO NOTHING;
