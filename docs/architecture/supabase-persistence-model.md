# Documento de Arquitetura de Persistência — Supabase Postgres e RLS (Epic 2)

> **Autor:** Aria (@architect, Holistic System Architect)  
> **Status:** Blueprint de Arquitetura Aprovado  
> **Referência:** Gates G2.1 a G2.7 do PRD v1.2  

---

## 1. Decisão Estrutural (Gate G2.1): Supabase PostgREST Direto do Browser + RLS

### Decisão
Utilizar o **Supabase Client (PostgREST) diretamente do frontend React**, com **Row Level Security (RLS)** atuando como a camada primária e soberana de autorização no banco de dados Postgres.

### Justificativa
1. **Sem Necessidade de Equipe de Backend:** A oficina não possui infraestrutura ou equipe dedicada de backend Node/Python. Adicionar uma API intermediária criaria um ponto único de falha desnecessário e duplicaria o trabalho de endpoints.
2. **Desempenho e Tipagem:** O PostgREST é extremamente rápido, roda em Rust/Haskell diretamente sobre o Postgres e fornece controle granular de queries.
3. **Segurança no Banco:** O RLS garante que, mesmo que alguém tente injetar comandos pelo console do navegador, o banco rejeita qualquer leitura ou gravação fora do perfil do usuário autenticado.

---

## 2. Modelagem Relacional das Entidades de Domínio (Gate G2.2)

A Ordem de Serviço atual é um objeto denormalizado que guarda snapshots de cliente e veículo. A modelagem no Postgres preserva essa semântica histórica para que alterações cadastrais futuras de um cliente não alterem o histórico de uma OS já fechada:

```sql
-- 1. Tabela de Funcionários (Equipe da Oficina)
CREATE TABLE public.funcionarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    telefone TEXT NOT NULL,
    cargo TEXT NOT NULL CHECK (cargo IN ('mecanico', 'secretaria', 'gerente', 'eletricista', 'auxiliar')),
    comissao_servicos NUMERIC(5,2) DEFAULT 0.00,
    comissao_pecas NUMERIC(5,2) DEFAULT 0.00,
    data_admissao DATE NOT NULL,
    horario_trabalho TEXT DEFAULT '08:00 às 19:00',
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Clientes
CREATE TABLE public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cpf_cnpj TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT,
    endereco JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Veículos
CREATE TABLE public.veiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    placa TEXT UNIQUE NOT NULL,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    ano TEXT,
    km_atual INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela Central de Ordens de Serviço (com snapshot histórico)
CREATE TABLE public.ordens_servico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_os SERIAL UNIQUE,
    cliente_id UUID REFERENCES public.clientes(id),
    veiculo_id UUID REFERENCES public.veiculos(id),
    mecanico_responsavel_id UUID REFERENCES public.funcionarios(id),
    status TEXT NOT NULL DEFAULT 'fila',
    snapshot_cliente JSONB NOT NULL,
    snapshot_veiculo JSONB NOT NULL,
    sintomas TEXT,
    laudo_tecnico TEXT,
    valor_pecas NUMERIC(10,2) DEFAULT 0.00,
    valor_servicos NUMERIC(10,2) DEFAULT 0.00,
    valor_terceiros NUMERIC(10,2) DEFAULT 0.00,
    valor_desconto NUMERIC(10,2) DEFAULT 0.00,
    valor_total NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 3. Políticas de Row Level Security — RLS (Gate G2.3)

O Postgres controla o que cada perfil pode ler ou gravar:

```sql
-- Ativação de RLS
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

-- 1. Política de Administrador (Acesso Total 24/7)
CREATE POLICY "Admin total access" ON public.ordens_servico
    FOR ALL
    TO authenticated
    USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' )
    WITH CHECK ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- 2. Política de Funcionários: Regra 14 (Secretaria não enxerga dados de Funcionários)
CREATE POLICY "Gestao le e grava funcionarios" ON public.funcionarios
    FOR ALL
    TO authenticated
    USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- 3. Política de Restrição de Horário Server-Side (Gate G2.6)
-- Secretaria e Mecânico só podem alterar dados das 08h às 19h no fuso de Brasília:
CREATE POLICY "Operacional horario comercial" ON public.ordens_servico
    FOR UPDATE
    TO authenticated
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('secretaria', 'mecanico')
        AND EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo') >= 8
        AND EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo') < 19
    );

-- 4. Política do Portal do Cliente (Menor Privilégio - NFR12)
-- Cliente só lê e aprova as OSs associadas ao seu ID:
CREATE POLICY "Cliente ve apenas suas OSs" ON public.ordens_servico
    FOR SELECT
    TO authenticated
    USING ( cliente_id = auth.uid() );
```

---

## 4. Trilha de Auditoria e LGPD (Gate G2.7)

Criada tabela de auditoria imutável via triggers do Postgres, registrando alterações críticas de faturamento e dados de clientes:

```sql
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabela TEXT NOT NULL,
    registro_id UUID NOT NULL,
    operacao TEXT NOT NULL,
    usuario_id UUID,
    valor_anterior JSONB,
    valor_novo JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 5. Próximos Passos de Execução
Com esse modelo formalizado, o `@dev` implementará a Story 1.1 e 1.5 já sabendo exatamente quais campos e nomes de entidades espelharão o banco de dados final!
