import { describe, it, expect } from 'vitest'

// Testable pure logic for operating hours
function checkHorarioOperacional(dateObj) {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: 'numeric',
    hourCycle: 'h23',
  })
  const hora = parseInt(formatter.format(dateObj), 10)
  return hora >= 8 && hora < 19
}

// Testable route permission logic
function evaluateRouteAccess({ portal, role, isAuthenticated, isHorario, isDispositivo, clienteAtivo }) {
  // 1. Cliente portal
  if (portal === 'cliente') {
    if (!clienteAtivo) return { allowed: false, redirect: '/cliente/entrar' }
    return { allowed: true }
  }

  // 2. Unauthenticated
  if (!isAuthenticated) {
    return { allowed: false, redirect: '/gestao/entrar' }
  }

  const isAdmin = role === 'admin'
  const isSecretaria = role === 'secretaria'
  const isMecanico = role === 'mecanico'

  // 3. Gestão
  if (portal === 'gestao') {
    if (!isAdmin) return { allowed: false, redirect: '/gestao/acesso-negado' }
    return { allowed: true, bypass: true }
  }

  // 4. Secretaria
  if (portal === 'secretaria') {
    if (!isSecretaria && !isAdmin) return { allowed: false, redirect: '/gestao/acesso-negado' }
    if (!isAdmin) {
      if (!isHorario) return { allowed: false, block: 'horario' }
      if (!isDispositivo) return { allowed: false, block: 'dispositivo' }
    }
    return { allowed: true }
  }

  // 5. Mecanico
  if (portal === 'mecanico') {
    if (!isMecanico && !isAdmin) return { allowed: false, redirect: '/gestao/acesso-negado' }
    if (!isAdmin) {
      if (!isHorario) return { allowed: false, block: 'horario' }
      if (!isDispositivo) return { allowed: false, block: 'dispositivo' }
    }
    return { allowed: true }
  }

  return { allowed: false, redirect: '/gestao/acesso-negado' }
}

describe('Story 1.1: Proteção de Rotas e Guards de Horário/Dispositivo', () => {
  describe('Horário Operacional (08:00 às 19:00 no fuso de Brasília)', () => {
    it('deve permitir acesso às 08:00 (início do expediente)', () => {
      // 08:00 BRT (UTC-3) is 11:00 UTC
      const date = new Date('2026-09-21T11:00:00Z')
      expect(checkHorarioOperacional(date)).toBe(true)
    })

    it('deve permitir acesso às 12:30 (meio do expediente)', () => {
      // 12:30 BRT is 15:30 UTC
      const date = new Date('2026-09-21T15:30:00Z')
      expect(checkHorarioOperacional(date)).toBe(true)
    })

    it('deve permitir acesso às 18:59 (fim do expediente)', () => {
      // 18:59 BRT is 21:59 UTC
      const date = new Date('2026-09-21T21:59:00Z')
      expect(checkHorarioOperacional(date)).toBe(true)
    })

    it('deve bloquear acesso às 19:00 (após o expediente)', () => {
      // 19:00 BRT is 22:00 UTC
      const date = new Date('2026-09-21T22:00:00Z')
      expect(checkHorarioOperacional(date)).toBe(false)
    })

    it('deve bloquear acesso às 07:59 (antes do expediente)', () => {
      // 07:59 BRT is 10:59 UTC
      const date = new Date('2026-09-21T10:59:00Z')
      expect(checkHorarioOperacional(date)).toBe(false)
    })

    it('deve bloquear acesso de madrugada (02:00)', () => {
      // 02:00 BRT is 05:00 UTC
      const date = new Date('2026-09-21T05:00:00Z')
      expect(checkHorarioOperacional(date)).toBe(false)
    })
  })

  describe('Guards de Permissão e Redirecionamento', () => {
    it('usuário deslogado tentando acessar Gestão deve ser redirecionado para /gestao/entrar', () => {
      const result = evaluateRouteAccess({
        portal: 'gestao',
        role: null,
        isAuthenticated: false,
        isHorario: true,
        isDispositivo: true,
      })
      expect(result.allowed).toBe(false)
      expect(result.redirect).toBe('/gestao/entrar')
    })

    it('cliente sem cadastro ativo deve ser redirecionado para /cliente/entrar sem vazar dados', () => {
      const result = evaluateRouteAccess({
        portal: 'cliente',
        role: null,
        isAuthenticated: false,
        clienteAtivo: null,
      })
      expect(result.allowed).toBe(false)
      expect(result.redirect).toBe('/cliente/entrar')
    })

    it('cliente com sessão ativa deve ter acesso liberado ao portal do cliente', () => {
      const result = evaluateRouteAccess({
        portal: 'cliente',
        role: null,
        isAuthenticated: false,
        clienteAtivo: { id: 'cli_1', nome: 'Cliente Valido' },
      })
      expect(result.allowed).toBe(true)
    })

    it('secretária dentro do horário e em dispositivo autorizado deve ter acesso liberado', () => {
      const result = evaluateRouteAccess({
        portal: 'secretaria',
        role: 'secretaria',
        isAuthenticated: true,
        isHorario: true,
        isDispositivo: true,
      })
      expect(result.allowed).toBe(true)
    })

    it('secretária fora do horário (ex: 20:00) deve ser bloqueada por horário', () => {
      const result = evaluateRouteAccess({
        portal: 'secretaria',
        role: 'secretaria',
        isAuthenticated: true,
        isHorario: false,
        isDispositivo: true,
      })
      expect(result.allowed).toBe(false)
      expect(result.block).toBe('horario')
    })

    it('secretária em dispositivo sem autorização deve ser bloqueada por dispositivo', () => {
      const result = evaluateRouteAccess({
        portal: 'secretaria',
        role: 'secretaria',
        isAuthenticated: true,
        isHorario: true,
        isDispositivo: false,
      })
      expect(result.allowed).toBe(false)
      expect(result.block).toBe('dispositivo')
    })

    it('administrador deve ter bypass 24/7 de horário e dispositivo na Gestão', () => {
      const result = evaluateRouteAccess({
        portal: 'gestao',
        role: 'admin',
        isAuthenticated: true,
        isHorario: false, // Fora do horário comercial
        isDispositivo: false, // Dispositivo não pareado
      })
      expect(result.allowed).toBe(true)
      expect(result.bypass).toBe(true)
    })

    it('administrador deve ter acesso liberado também ao portal da Secretaria fora de horário', () => {
      const result = evaluateRouteAccess({
        portal: 'secretaria',
        role: 'admin',
        isAuthenticated: true,
        isHorario: false,
        isDispositivo: false,
      })
      expect(result.allowed).toBe(true)
    })

    it('mecânico tentando acessar Gestão deve ser redirecionado para acesso-negado', () => {
      const result = evaluateRouteAccess({
        portal: 'gestao',
        role: 'mecanico',
        isAuthenticated: true,
        isHorario: true,
        isDispositivo: true,
      })
      expect(result.allowed).toBe(false)
      expect(result.redirect).toBe('/gestao/acesso-negado')
    })
  })
})
