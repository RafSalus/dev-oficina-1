import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import {
  useAdminAuth,
  isHorarioOperacionalOficina,
  isDispositivoAutorizado,
} from '../../context/AdminAuthContext'
import { BloqueioHorarioView } from './BloqueioHorarioView'

/**
 * LoadingSpinnerSobrio
 * Exibido durante a verificação de sessão (AC6 da Story 1.1)
 * Em conformidade com o SYSTEM_RULES.md:
 * - Fundo neutro #f8fafc
 * - Acabamento sóbrio em azul oficial (#0284c7)
 * - Sem scroll e sem piscar tela de login
 */
function LoadingSpinnerSobrio() {
  return (
    <div className="w-full h-full min-h-0 flex flex-col items-center justify-center bg-[#f8fafc] overflow-hidden">
      <div className="w-10 h-10 border-3 border-[#e0f2fe] border-t-[#0284c7] rounded-full animate-spin mb-3" />
      <span className="text-xs font-semibold text-[#475467] tracking-wide">
        Verificando credenciais de acesso...
      </span>
    </div>
  )
}

/**
 * ProtectedRoute
 * Componente central de autorização e guards de acesso (ADR-001 / Story 1.1).
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Conteúdo protegido da rota
 * @param {'gestao'|'secretaria'|'mecanico'|'cliente'} props.portal - Identificador do portal
 * @param {string[]} [props.allowedRoles] - Lista opcional de papéis autorizados
 */
export function ProtectedRoute({ children, portal = 'gestao', allowedRoles }) {
  const location = useLocation()
  const { status, role, isLoading, signOut } = useAdminAuth()

  // 1. Estado de Verificação de Sessão (AC6)
  if (isLoading) {
    return <LoadingSpinnerSobrio />
  }

  const returnUrl = encodeURIComponent(location.pathname + location.search)

  // 2. Portal do CLIENTE
  if (portal === 'cliente') {
    let clienteSalvo = null
    try {
      clienteSalvo = localStorage.getItem('dev_oficina_cliente_ativo')
    } catch {}

    if (!clienteSalvo) {
      return <Navigate to={`/cliente/entrar?returnUrl=${returnUrl}`} replace />
    }

    return children
  }

  // 3. Portais Administrativos e Operacionais (Gestão, Secretaria, Mecânico)
  // Supabase sem configuração: libera apenas no servidor de desenvolvimento local.
  // Em build de produção a rota falha fechada e exige login.
  if (status === 'unconfigured' && import.meta.env.DEV) {
    return children
  }

  // Sem sessão válida, redireciona para o login preservando a rota pretendida (AC2 e AC5)
  if (status !== 'aal2' && status !== 'mfa_setup_required' && status !== 'mfa_verify_required') {
    return <Navigate to={`/gestao/entrar?returnUrl=${returnUrl}`} replace />
  }

  // Desafios de MFA — obrigatório para todo login real (admin, secretaria e mecânico), não só
  // para o portal de gestão (Story 1.9 ampliada). As páginas de MFA são compartilhadas entre
  // portais e usam returnUrl para voltar exatamente para onde o usuário tentou entrar.
  if (status === 'mfa_setup_required') {
    return <Navigate to={`/gestao/mfa/configurar?returnUrl=${returnUrl}`} replace />
  }
  if (status === 'mfa_verify_required') {
    return <Navigate to={`/gestao/mfa/verificar?returnUrl=${returnUrl}`} replace />
  }

  // Se o papel do usuário é expressamente restrito (AC8)
  const isAdmin = role === 'admin'
  const isSecretaria = role === 'secretaria'
  const isMecanico = role === 'mecanico'

  // Validação de Permissão por Portal
  if (portal === 'gestao') {
    // Apenas Administrador acessa Gestão
    if (!isAdmin) {
      if (isSecretaria) return <Navigate to="/secretaria/dashboard" replace />
      if (isMecanico) return <Navigate to="/mecanico/dashboard" replace />
      return <Navigate to="/gestao/acesso-negado" replace />
    }
    // Admin tem bypass permanente de horário e rede (AC11)
    return children
  }

  if (portal === 'secretaria') {
    // Secretaria e Admin podem acessar o portal da secretaria
    if (!isSecretaria && !isAdmin) {
      return <Navigate to="/gestao/acesso-negado" replace />
    }

    // Se for colaboradora (não admin), aplica restrição de horário e dispositivo (AC9 e AC10)
    if (!isAdmin) {
      if (!isHorarioOperacionalOficina()) {
        return <BloqueioHorarioView motivo="horario" onLogout={signOut} />
      }
      if (!isDispositivoAutorizado()) {
        return <BloqueioHorarioView motivo="dispositivo" onLogout={signOut} />
      }
    }

    return children
  }

  if (portal === 'mecanico') {
    // Mecânico e Admin podem acessar o portal do mecânico
    if (!isMecanico && !isAdmin) {
      return <Navigate to="/gestao/acesso-negado" replace />
    }

    // Se não for admin, aplica restrição de horário e dispositivo no pátio (AC9 e AC10)
    if (!isAdmin) {
      if (!isHorarioOperacionalOficina()) {
        return <BloqueioHorarioView motivo="horario" onLogout={signOut} />
      }
      if (!isDispositivoAutorizado()) {
        return <BloqueioHorarioView motivo="dispositivo" onLogout={signOut} />
      }
    }

    return children
  }

  // Validação opcional de papéis customizados
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role) && !isAdmin) {
    return <Navigate to="/gestao/acesso-negado" replace />
  }

  return children
}
