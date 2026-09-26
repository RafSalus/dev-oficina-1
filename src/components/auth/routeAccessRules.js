/**
 * Regras puras de acesso às rotas protegidas (Story 2.4 / ADR-001 / Story 1.1).
 *
 * Fronteira: aqui ficam só decisões determinísticas a partir de parâmetros. Buscar a sessão
 * (AdminAuthContext), ler o localStorage e redirecionar via react-router ficam no
 * `ProtectedRoute`, que consome estas funções.
 */

export const CHAVE_CLIENTE_ATIVO = 'dev_oficina_cliente_ativo'
export const HORA_ABERTURA = 8
export const HORA_FECHAMENTO = 19
export const FUSO_OFICINA = 'America/Sao_Paulo'

// Status do AdminAuthContext que representam uma sessão real (com ou sem MFA pendente)
const STATUS_COM_SESSAO = ['aal2', 'mfa_setup_required', 'mfa_verify_required']

/**
 * Indica se o instante está dentro do expediente da oficina (08:00–18:59, horário de Brasília).
 * @param {Date} [data]
 * @returns {boolean}
 */
export function isHorarioOperacional(data = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: FUSO_OFICINA,
      hour: 'numeric',
      hourCycle: 'h23',
    })
    const hora = parseInt(formatter.format(data), 10)
    return hora >= HORA_ABERTURA && hora < HORA_FECHAMENTO
  } catch {
    // Fallback defensivo usando hora local caso Intl falhe
    const horaLocal = data.getHours()
    return horaLocal >= HORA_ABERTURA && horaLocal < HORA_FECHAMENTO
  }
}

/**
 * Lê o marcador de cliente autenticado do Portal do Cliente.
 * @returns {string|null}
 */
export function lerClienteAtivo() {
  try {
    return localStorage.getItem(CHAVE_CLIENTE_ATIVO)
  } catch {
    return null
  }
}

const liberar = () => ({ acao: 'liberar' })
const redirecionar = (destino) => ({ acao: 'redirecionar', destino })
const bloquear = (motivo) => ({ acao: 'bloquear', motivo })

/**
 * Colaborador (não admin) em portal operacional: exige expediente e dispositivo pareado.
 */
function avaliarRestricaoOperacional({ isAdmin, isHorario, isDispositivo }) {
  if (isAdmin) return liberar() // Admin tem bypass permanente de horário e rede (AC11)
  if (!isHorario) return bloquear('horario')
  if (!isDispositivo) return bloquear('dispositivo')
  return liberar()
}

/**
 * Decide o acesso a uma rota protegida.
 *
 * @param {Object} params
 * @param {'gestao'|'secretaria'|'mecanico'|'cliente'} params.portal
 * @param {string} params.status - status do AdminAuthContext ('aal2', 'unconfigured', ...)
 * @param {'admin'|'secretaria'|'mecanico'|null} params.role
 * @param {string} params.returnUrl - rota pretendida, já codificada (encodeURIComponent)
 * @param {string|null} [params.clienteAtivo] - marcador do Portal do Cliente
 * @param {boolean} [params.isDev] - servidor de desenvolvimento (import.meta.env.DEV)
 * @param {boolean} [params.isHorario] - dentro do expediente
 * @param {boolean} [params.isDispositivo] - dispositivo pareado
 * @param {string[]} [params.allowedRoles]
 * @returns {{acao: 'liberar'} | {acao: 'redirecionar', destino: string} | {acao: 'bloquear', motivo: 'horario'|'dispositivo'}}
 */
export function avaliarAcessoRota({
  portal = 'gestao',
  status,
  role,
  returnUrl,
  clienteAtivo = null,
  isDev = false,
  isHorario = false,
  isDispositivo = false,
  allowedRoles,
}) {
  // 1. Portal do CLIENTE
  if (portal === 'cliente') {
    return clienteAtivo ? liberar() : redirecionar(`/cliente/entrar?returnUrl=${returnUrl}`)
  }

  // 2. Supabase sem configuração: libera apenas no servidor de desenvolvimento local.
  // Em build de produção a rota falha fechada e exige login.
  if (status === 'unconfigured' && isDev) {
    return liberar()
  }

  // 3. Sem sessão válida, redireciona para o login preservando a rota pretendida (AC2 e AC5)
  if (!STATUS_COM_SESSAO.includes(status)) {
    return redirecionar(`/gestao/entrar?returnUrl=${returnUrl}`)
  }

  // 4. MFA obrigatório para todo login real (Story 1.9 ampliada)
  if (status === 'mfa_setup_required') {
    return redirecionar(`/gestao/mfa/configurar?returnUrl=${returnUrl}`)
  }
  if (status === 'mfa_verify_required') {
    return redirecionar(`/gestao/mfa/verificar?returnUrl=${returnUrl}`)
  }

  const isAdmin = role === 'admin'
  const isSecretaria = role === 'secretaria'
  const isMecanico = role === 'mecanico'

  // 5. Validação de permissão por portal
  if (portal === 'gestao') {
    if (isAdmin) return liberar()
    if (isSecretaria) return redirecionar('/secretaria/dashboard')
    if (isMecanico) return redirecionar('/mecanico/dashboard')
    return redirecionar('/gestao/acesso-negado')
  }

  if (portal === 'secretaria') {
    if (!isSecretaria && !isAdmin) return redirecionar('/gestao/acesso-negado')
    return avaliarRestricaoOperacional({ isAdmin, isHorario, isDispositivo })
  }

  if (portal === 'mecanico') {
    if (!isMecanico && !isAdmin) return redirecionar('/gestao/acesso-negado')
    return avaliarRestricaoOperacional({ isAdmin, isHorario, isDispositivo })
  }

  // 6. Validação opcional de papéis customizados
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role) && !isAdmin) {
    return redirecionar('/gestao/acesso-negado')
  }

  return liberar()
}
