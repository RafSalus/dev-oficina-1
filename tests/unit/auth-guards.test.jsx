// Guards de rota (Story 1.1, reescrito na Story 2.4): testa as regras REAIS de
// src/components/auth/routeAccessRules.js e a ligação do ProtectedRoute com elas, com o
// AdminAuthContext simulado. A derivação de sessão/papel/MFA a partir do Supabase
// (app_metadata, sessão forjada, erro de MFA) fica em auth-seguranca.test.jsx, que simula o
// cliente Supabase — camadas diferentes, sem fixtures compartilhadas.
import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import {
  avaliarAcessoRota,
  isHorarioOperacional,
  lerClienteAtivo,
  CHAVE_CLIENTE_ATIVO,
} from '../../src/components/auth/routeAccessRules'

// Contexto de autenticação controlado pelo teste; as regras de acesso são as reais.
const authMock = vi.hoisted(() => ({
  estado: { status: 'aal2', role: 'admin', isLoading: false, signOut: () => {} },
  horario: true,
  dispositivo: true,
}))

vi.mock('../../src/context/AdminAuthContext', () => ({
  useAdminAuth: () => authMock.estado,
  isHorarioOperacionalOficina: () => authMock.horario,
  isDispositivoAutorizado: () => authMock.dispositivo,
}))

const { ProtectedRoute } = await import('../../src/components/auth/ProtectedRoute')

const RETURN_URL = encodeURIComponent('/secretaria/agenda')

// Parâmetros de uma sessão autenticada com MFA verificado
const sessao = (extra) => ({ status: 'aal2', returnUrl: RETURN_URL, isHorario: true, isDispositivo: true, ...extra })

describe('Story 1.1 / 2.4: Proteção de Rotas e Guards de Horário/Dispositivo (código real)', () => {
  describe('Horário Operacional (08:00 às 19:00 no fuso de Brasília)', () => {
    it('deve permitir acesso às 08:00 (início do expediente)', () => {
      // 08:00 BRT (UTC-3) is 11:00 UTC
      expect(isHorarioOperacional(new Date('2026-09-21T11:00:00Z'))).toBe(true)
    })

    it('deve permitir acesso às 12:30 (meio do expediente)', () => {
      expect(isHorarioOperacional(new Date('2026-09-21T15:30:00Z'))).toBe(true)
    })

    it('deve permitir acesso às 18:59 (fim do expediente)', () => {
      expect(isHorarioOperacional(new Date('2026-09-21T21:59:00Z'))).toBe(true)
    })

    it('deve bloquear acesso às 19:00 (após o expediente)', () => {
      expect(isHorarioOperacional(new Date('2026-09-21T22:00:00Z'))).toBe(false)
    })

    it('deve bloquear acesso às 07:59 (antes do expediente)', () => {
      expect(isHorarioOperacional(new Date('2026-09-21T10:59:00Z'))).toBe(false)
    })

    it('deve bloquear acesso de madrugada (02:00)', () => {
      expect(isHorarioOperacional(new Date('2026-09-21T05:00:00Z'))).toBe(false)
    })
  })

  describe('Guards de Permissão e Redirecionamento', () => {
    it('usuário deslogado tentando acessar Gestão deve ser redirecionado para /gestao/entrar', () => {
      expect(avaliarAcessoRota({ portal: 'gestao', status: 'unauthenticated', role: null, returnUrl: RETURN_URL })).toEqual({
        acao: 'redirecionar',
        destino: `/gestao/entrar?returnUrl=${RETURN_URL}`,
      })
    })

    it('cliente sem cadastro ativo deve ser redirecionado para /cliente/entrar sem vazar dados', () => {
      expect(avaliarAcessoRota({ portal: 'cliente', status: 'unauthenticated', clienteAtivo: null, returnUrl: RETURN_URL })).toEqual({
        acao: 'redirecionar',
        destino: `/cliente/entrar?returnUrl=${RETURN_URL}`,
      })
    })

    it('cliente com sessão ativa deve ter acesso liberado ao portal do cliente', () => {
      const decisao = avaliarAcessoRota({
        portal: 'cliente',
        status: 'unauthenticated',
        clienteAtivo: JSON.stringify({ id: 'cli_1', nome: 'Cliente Valido' }),
        returnUrl: RETURN_URL,
      })
      expect(decisao).toEqual({ acao: 'liberar' })
    })

    it('secretária dentro do horário e em dispositivo autorizado deve ter acesso liberado', () => {
      expect(avaliarAcessoRota(sessao({ portal: 'secretaria', role: 'secretaria' }))).toEqual({ acao: 'liberar' })
    })

    it('secretária fora do horário (ex: 20:00) deve ser bloqueada por horário', () => {
      expect(avaliarAcessoRota(sessao({ portal: 'secretaria', role: 'secretaria', isHorario: false }))).toEqual({
        acao: 'bloquear',
        motivo: 'horario',
      })
    })

    it('secretária em dispositivo sem autorização deve ser bloqueada por dispositivo', () => {
      expect(avaliarAcessoRota(sessao({ portal: 'secretaria', role: 'secretaria', isDispositivo: false }))).toEqual({
        acao: 'bloquear',
        motivo: 'dispositivo',
      })
    })

    it('administrador deve ter bypass 24/7 de horário e dispositivo na Gestão', () => {
      expect(avaliarAcessoRota(sessao({ portal: 'gestao', role: 'admin', isHorario: false, isDispositivo: false }))).toEqual({
        acao: 'liberar',
      })
    })

    it('administrador deve ter acesso liberado também ao portal da Secretaria fora de horário', () => {
      expect(avaliarAcessoRota(sessao({ portal: 'secretaria', role: 'admin', isHorario: false, isDispositivo: false }))).toEqual({
        acao: 'liberar',
      })
    })

    // Antes da Story 2.4 este caso esperava /gestao/acesso-negado, mas validava uma cópia da regra
    // dentro do teste: o ProtectedRoute real sempre enviou mecânico e secretária ao próprio dashboard.
    it('mecânico tentando acessar Gestão deve ser redirecionado ao próprio dashboard', () => {
      expect(avaliarAcessoRota(sessao({ portal: 'gestao', role: 'mecanico' }))).toEqual({
        acao: 'redirecionar',
        destino: '/mecanico/dashboard',
      })
    })
  })

  describe('Casos do ProtectedRoute real que a cópia antiga não cobria', () => {
    it('secretária tentando acessar Gestão vai para o dashboard da secretaria', () => {
      expect(avaliarAcessoRota(sessao({ portal: 'gestao', role: 'secretaria' })).destino).toBe('/secretaria/dashboard')
    })

    it('papel desconhecido na Gestão vai para acesso-negado', () => {
      expect(avaliarAcessoRota(sessao({ portal: 'gestao', role: null })).destino).toBe('/gestao/acesso-negado')
    })

    it('secretária no portal do mecânico (e vice-versa) vai para acesso-negado', () => {
      expect(avaliarAcessoRota(sessao({ portal: 'mecanico', role: 'secretaria' })).destino).toBe('/gestao/acesso-negado')
      expect(avaliarAcessoRota(sessao({ portal: 'secretaria', role: 'mecanico' })).destino).toBe('/gestao/acesso-negado')
    })

    it('mecânico no próprio portal segue as mesmas travas de horário e dispositivo', () => {
      expect(avaliarAcessoRota(sessao({ portal: 'mecanico', role: 'mecanico' }))).toEqual({ acao: 'liberar' })
      expect(avaliarAcessoRota(sessao({ portal: 'mecanico', role: 'mecanico', isHorario: false })).motivo).toBe('horario')
      expect(avaliarAcessoRota(sessao({ portal: 'mecanico', role: 'mecanico', isDispositivo: false })).motivo).toBe('dispositivo')
    })

    it('horário é checado antes do dispositivo', () => {
      expect(
        avaliarAcessoRota(sessao({ portal: 'secretaria', role: 'secretaria', isHorario: false, isDispositivo: false })).motivo
      ).toBe('horario')
    })

    it('MFA pendente redireciona para configurar ou verificar, preservando a rota', () => {
      expect(avaliarAcessoRota(sessao({ portal: 'secretaria', role: 'secretaria', status: 'mfa_setup_required' })).destino).toBe(
        `/gestao/mfa/configurar?returnUrl=${RETURN_URL}`
      )
      expect(avaliarAcessoRota(sessao({ portal: 'gestao', role: 'admin', status: 'mfa_verify_required' })).destino).toBe(
        `/gestao/mfa/verificar?returnUrl=${RETURN_URL}`
      )
    })

    it('Supabase não configurado libera só no servidor de desenvolvimento (fail-closed em produção)', () => {
      expect(avaliarAcessoRota({ portal: 'gestao', status: 'unconfigured', isDev: true, returnUrl: RETURN_URL })).toEqual({
        acao: 'liberar',
      })
      expect(avaliarAcessoRota({ portal: 'gestao', status: 'unconfigured', isDev: false, returnUrl: RETURN_URL }).destino).toBe(
        `/gestao/entrar?returnUrl=${RETURN_URL}`
      )
    })

    it('allowedRoles restringe portais customizados, com bypass do admin', () => {
      const base = sessao({ portal: 'relatorios', allowedRoles: ['secretaria'] })
      expect(avaliarAcessoRota({ ...base, role: 'mecanico' }).destino).toBe('/gestao/acesso-negado')
      expect(avaliarAcessoRota({ ...base, role: 'secretaria' })).toEqual({ acao: 'liberar' })
      expect(avaliarAcessoRota({ ...base, role: 'admin' })).toEqual({ acao: 'liberar' })
    })
  })

  describe('lerClienteAtivo', () => {
    afterEach(() => localStorage.clear())

    it('lê o marcador do Portal do Cliente ou retorna null', () => {
      expect(lerClienteAtivo()).toBeNull()
      localStorage.setItem(CHAVE_CLIENTE_ATIVO, '{"id":"cli_1"}')
      expect(lerClienteAtivo()).toBe('{"id":"cli_1"}')
    })
  })

  describe('ProtectedRoute consome as regras reais', () => {
    const renderizar = (portal, rota = `/${portal}/area`) =>
      render(
        <MemoryRouter initialEntries={[rota]}>
          <Routes>
            <Route path={rota} element={<ProtectedRoute portal={portal}><p>Conteúdo protegido</p></ProtectedRoute>} />
            <Route path="/gestao/entrar" element={<p>Tela de login</p>} />
            <Route path="/mecanico/dashboard" element={<p>Dashboard do mecânico</p>} />
            <Route path="/cliente/entrar" element={<p>Login do cliente</p>} />
          </Routes>
        </MemoryRouter>
      )

    beforeEach(() => {
      authMock.estado = { status: 'aal2', role: 'secretaria', isLoading: false, signOut: () => {} }
      authMock.horario = true
      authMock.dispositivo = true
      localStorage.clear()
    })

    it('libera a secretária no expediente', () => {
      renderizar('secretaria')
      expect(screen.getByText('Conteúdo protegido')).toBeDefined()
    })

    it('mostra o bloqueio de horário fora do expediente', () => {
      authMock.horario = false
      renderizar('secretaria')
      expect(screen.queryByText('Conteúdo protegido')).toBeNull()
    })

    it('redireciona o mecânico que tenta abrir a Gestão', () => {
      authMock.estado = { ...authMock.estado, role: 'mecanico' }
      renderizar('gestao')
      expect(screen.getByText('Dashboard do mecânico')).toBeDefined()
    })

    it('redireciona sessão inexistente para o login', () => {
      authMock.estado = { ...authMock.estado, status: 'unauthenticated', role: null }
      renderizar('gestao')
      expect(screen.getByText('Tela de login')).toBeDefined()
    })

    it('usa o marcador do localStorage no portal do cliente', () => {
      renderizar('cliente')
      expect(screen.getByText('Login do cliente')).toBeDefined()
    })

    it('mostra o carregamento enquanto a sessão é verificada', () => {
      authMock.estado = { ...authMock.estado, isLoading: true }
      renderizar('secretaria')
      expect(screen.getByText('Verificando credenciais de acesso...')).toBeDefined()
    })
  })
})
