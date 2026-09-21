# ADR-001: Arquitetura de Proteção de Rotas, Controle de Horário e Pareamento de Dispositivo

- **Status:** Aprovado  
- **Data:** 2026-09-21  
- **Autor:** Aria (@architect, Holistic System Architect)  
- **Contexto:** Stories 1.1, 1.9 e FR1, FR2, FR15, FR20 do PRD v1.2  

---

## 1. Contexto e Problema

O sistema `dev-oficina` possui 4 portais distintos (Gestão, Secretaria, Mecânico e Cliente), mas até o momento não possuía nenhum componente de proteção de rotas (`ProtectedRoute`). Qualquer pessoa que digitasse `/gestao/dashboard` no navegador obtinha acesso irrestrito aos relatórios financeiros e dados confidenciais da oficina.

Adicionalmente, o proprietário estabeleceu requisitos de segurança e negócio vinculantes:
1. **Secretaria e Mecânico:** Acesso restrito a dias operacionais e horário comercial (**08:00 às 19:00**), sendo que o primeiro acesso exige pareamento prévio na rede física da oficina.
2. **Administrador (Gestão):** Acesso irrestrito (**24/7 de qualquer lugar**), protegido por segundo fator de autenticação (MFA TOTP AAL2).
3. **Cliente:** Proibição de auto-cadastro público e eliminação da identidade default pública que vazava dados pessoais de clientes no navegador.

---

## 2. Decisão Arquitetural

Implementar o componente `ProtectedRoute` no react-router-dom v7 adotando a seguinte **Hierarquia de Avaliação em Pipeline**:

```mermaid
flowchart TD
    Req([Navegação para Rota Protegida]) --> CheckPublic{É Rota Pública?<br/>/cotacao, /aprovacao, /orcamento}
    CheckPublic -->|Sim| Allow[Renderiza Conteúdo sem Auth]
    CheckPublic -->|Não| CheckSession{Possui Sessão Ativa?}
    
    CheckSession -->|Não| RedirectLogin[Redireciona para /entrar com ?returnUrl]
    CheckSession -->|Sim| CheckRole{Papel do Usuário}
    
    %% ADMIN
    CheckRole -->|admin| CheckMfa{MFA AAL2 Ativo?}
    CheckMfa -->|Não| RedirectMfaConfig[Redireciona /gestao/mfa/configurar]
    CheckMfa -->|Pendente Desafio| RedirectMfaVerify[Redireciona /gestao/mfa/verificar]
    CheckMfa -->|AAL2 OK| AdminBypass[Acesso Irrestrito 24/7 Qualquer Local]
    
    %% OPERACIONAL
    CheckRole -->|secretaria / mecanico| CheckTime{Horário Comercial?<br/>08:00 às 19:00}
    CheckTime -->|Fora de Horário| BlockTime[Exibe BloqueioHorarioView]
    CheckTime -->|Dentro do Horário| CheckDevice{Dispositivo Autorizado?<br/>dev_oficina_device_token}
    CheckDevice -->|Não Pareado| BlockDevice[Exibe BloqueioDispositivoView]
    CheckDevice -->|Pareado OK| OperAllow[Renderiza Portal Operacional]

    %% CLIENTE
    CheckRole -->|cliente| CheckClientIdentity{Identidade Ativa?}
    CheckClientIdentity -->|Não| RedirectClienteLogin[/cliente/entrar]
    CheckClientIdentity -->|Sim| ClienteAllow[Renderiza Portal do Cliente]
```

### Detalhes Técnicos de Implementação:

1. **Validação de Horário Operacional:**
   - No Epic 1 (Frontend): O guard calcula o horário local em fuso horário `America/Sao_Paulo` (usando `Intl.DateTimeFormat`). Se a hora for `< 8` ou `>= 19` para papéis operacionais, interrompe a renderização e exibe o componente sóbrio `<BloqueioHorarioView />`.
   - No Epic 2 (Backend Supabase): A validação é promovida para as políticas de RLS e Edge Functions (`EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo') BETWEEN 8 AND 18`).
2. **Pareamento de Dispositivo na Oficina (`dev_oficina_device_token`):**
   - O primeiro login de secretária ou mecânico em uma máquina deve ser liberado pelo administrador ou realizado conectado ao IP/rede local da oficina.
   - Uma vez autorizado, o navegador armazena um token criptográfico assinado (`localStorage.setItem('dev_oficina_device_token', ...)`).
   - Tentativas de login em máquinas desconhecidas fora da oficina sem esse token são bloqueadas.
3. **Bypass e MFA do Administrador:**
   - O papel `admin` ignora a verificação de horário e a restrição de rede, desde que a sessão esteja elevada para `aal2` via `supabase.auth.mfa.getAuthenticatorAssuranceLevel()`.
   - Caso a conta possua MFA pendente de verificação, redireciona para `/gestao/mfa/verificar`.

---

## 3. Consequências

- **Positivas:** 
  - Erradicação de acessos acidentais ou não autorizados ao ERP.
  - Bloqueio de colaboradores fora do expediente de trabalho, mitigando passivos trabalhistas e riscos de manipulação de dados fora do expediente.
  - O gestor tem total flexibilidade para gerenciar a oficina de casa ou em viagens com segurança de nível bancário (MFA).
- **Negativas / Mitigações:**
  - Em caso de horário de verão ou troca de fuso horário da máquina cliente, o uso de `Intl` fixado em `America/Sao_Paulo` impede que o usuário burle o sistema adiantando o relógio local.
