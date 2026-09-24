# Dev Oficina — Mecânica Gabriel ERP

Sistema de gestão integrado da **Mecânica Gabriel**, desenvolvido em **React 19 + Vite 6 + Tailwind CSS v4**, com persistência assíncrona, testes no Vitest e integração com Supabase.

---

## 📁 Estrutura do Projeto

```text
dev-oficina/
├── .aiox-core/          # Core do framework AIOX e inteligência de fluxo
├── docs/                # Documentação canônica, PRD, ADRs e Stories
│   ├── architecture/    # Modelos arquiteturais e ADRs (ADR-001 a ADR-004)
│   ├── design-references/# Referências visuais e modelos físicos
│   ├── brownfield-architecture.md # Diagnóstico inicial e matriz de dívidas
│   ├── prd.md           # Product Requirements Document (v1.3 consolidado)
│   └── stories/         # Backlog de estórias de usuário e acceptance criteria
├── public/              # Arquivos públicos e estáticos (PWA, ícones, manifest)
├── src/                 # Código-fonte da aplicação
│   ├── components/      # Componentes reutilizáveis (auth, modais, UI)
│   ├── constants/       # Constantes de negócio, tabelas de preço e catálogo
│   ├── context/         # Contextos React (AdminAuth, Cliente, Notice)
│   ├── layouts/         # Layouts dos 4 portais (Gestão, Secretaria, Mecânico, Cliente)
│   ├── lib/             # Clientes de infraestrutura (Supabase)
│   ├── pages/           # Telas e workspaces operacionais
│   ├── repositories/    # Camada de repositórios assíncronos (Async Contract First)
│   ├── routes/          # Rotas operacionais compartilhadas
│   ├── services/        # Integrações e serviços externos (ViaCEP, etc.)
│   └── utils/           # Funções puras utilitárias e regras de negócio
├── supabase/            # Migrações DDL e esquemas SQL
├── tests/               # Suíte de testes automatizados com Vitest
├── .env.example         # Template de variáveis de ambiente
├── SYSTEM_RULES.md      # 16 regras mandatórias de UI e arquitetura
└── vite.config.js       # Configuração do Vite com alias @ e Tailwind v4
```

---

## 🔐 Configuração de Ambiente

1. Copie o arquivo de exemplo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```

2. As variáveis conectam a aplicação ao projeto Supabase Cloud:
   ```dotenv
   SUPABASE_URL=https://scdwdmfiiiylcbqekuwc.supabase.co
   SUPABASE_PUBLISHABLE_KEY=sb_publishable_o1yn4HcyPio-u4joG0cZ0w_AB1ZuWLG
   SUPABASE_JWKS_URL=https://scdwdmfiiiylcbqekuwc.supabase.co/auth/v1/.well-known/jwks.json
   ```

> [!NOTE]
> Na ausência de conexão ou offline, o sistema ativa automaticamente o fallback defensivo em cache local (`localStorage`), garantindo continuidade operacional sem travamentos.

---

## 👤 Acesso Administrativo Inicial

O Administrador Geral já está provisionado no Supabase Auth e configurado na aplicação:

- **URL de Acesso:** `/gestao/entrar`
- **E-mail:** `rtzrafael@gmail.com`
- **Senha:** definida pelo proprietário; nunca registre senhas na documentação.
- **Papel:** `admin` (Acesso 24/7 com bypass de horário e de rede)
- **UUID Supabase:** `b0815410-e82e-4034-aa87-567faf2f6500`

---

## 🛡️ Procedimento de Emergência para MFA (Segundo Fator)

Caso o Administrador perca o smartphone, troque de aparelho ou o aplicativo autenticador seja desinstalado acidentalmente:

### Desativação do MFA via SQL Editor (Supabase):
Execute o comando abaixo substituindo pelo e-mail do administrador para desvincular os fatores TOTP:
```sql
DELETE FROM auth.mfa_factors
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'rtzrafael@gmail.com'
);
```
Após executar a instrução, o próximo login em `/gestao/entrar` solicitará automaticamente o pareamento de um novo aplicativo autenticador na tela `/gestao/mfa/configurar`.

---

## 🚀 Scripts Disponíveis

```bash
# Iniciar ambiente de desenvolvimento Vite
npm run dev

# Executar bateria de testes automatizados (Vitest)
npm test

# Executar verificação estática de código (ESLint v9)
npm run lint

# Gerar build otimizado para produção
npm run build

# Validar estrutura e conformidade de agentes
npm run validate:structure
npm run validate:agents
```

---

## 🌐 Portais do Sistema

- **Gestão (`/gestao`):** Acesso exclusivo para o Administrador (acesso 24/7 com MFA).
- **Secretaria (`/secretaria`):** Recepção e fluxo operacional (08:00 às 19:00 com pareamento de máquina).
- **Mecânico (`/mecanico`):** Terminal de pátio e checklist técnico (08:00 às 19:00 com pareamento de máquina).
- **Cliente (`/cliente`):** Acompanhamento de OS, aprovação de orçamentos e histórico de manutenções.
- **Público (`/cotacao/:id`, `/aprovacao/:id`, `/vistoria/:id`):** Links seguros externos sem exigência de login.

---

## 📐 Diretrizes Canônicas e Regras de Sistema

Consulte obrigatoriamente antes de modificar código:
1. [SYSTEM_RULES.md](file:///home/rafael/projetos/dev-oficina/SYSTEM_RULES.md): 16 regras inegociáveis de UI, modais, cores (sem verde) e selects.
2. [PRD v1.3](file:///home/rafael/projetos/dev-oficina/docs/prd.md): Requisitos de produto, personas e critérios de aceitação.
3. [Brownfield Architecture](file:///home/rafael/projetos/dev-oficina/docs/brownfield-architecture.md): Diagnóstico de componentes e dívidas técnicas tratadas.
