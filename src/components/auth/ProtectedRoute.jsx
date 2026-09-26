import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import {
  useAdminAuth,
  isHorarioOperacionalOficina,
  isDispositivoAutorizado,
} from '../../context/AdminAuthContext'
import { BloqueioHorarioView } from './BloqueioHorarioView'
import { avaliarAcessoRota, lerClienteAtivo } from './routeAccessRules'

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

  // Decisão pura (routeAccessRules.js); aqui ficam só a coleta de contexto e a renderização
  const decisao = avaliarAcessoRota({
    portal,
    status,
    role,
    allowedRoles,
    returnUrl: encodeURIComponent(location.pathname + location.search),
    clienteAtivo: portal === 'cliente' ? lerClienteAtivo() : null,
    isDev: import.meta.env.DEV,
    isHorario: isHorarioOperacionalOficina(),
    isDispositivo: isDispositivoAutorizado(),
  })

  if (decisao.acao === 'redirecionar') {
    return <Navigate to={decisao.destino} replace />
  }
  if (decisao.acao === 'bloquear') {
    return <BloqueioHorarioView motivo={decisao.motivo} onLogout={signOut} />
  }
  return children
}
