// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AgendaPage from '../../src/pages/dashboard/agenda/AgendaPage'
import { ClientesPage } from '../../src/pages/dashboard/clientes/ClientesPage'
import { VeiculosPage } from '../../src/pages/dashboard/veiculos/VeiculosPage'
import { EstacionadosPage } from '../../src/pages/dashboard/estacionados/EstacionadosPage'
import { LevaETrazPage } from '../../src/pages/dashboard/leva-e-traz/LevaETrazPage'
import { ManutencaoPreventivaPage } from '../../src/pages/dashboard/manutencao-preventiva/ManutencaoPreventivaPage'

// Garante que as telas de Atendimento e Pátio renderizam sem dados (sem mocks) e sem quebrar.
const TELAS = [
  ['Agenda', AgendaPage],
  ['Clientes', ClientesPage],
  ['Veículos', VeiculosPage],
  ['Estacionados', EstacionadosPage],
  ['Leva e Traz', LevaETrazPage],
  ['Manutenção Preventiva', ManutencaoPreventivaPage],
]

beforeEach(() => {
  localStorage.clear()
  window.matchMedia =
    window.matchMedia ||
    vi.fn().mockImplementation(() => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
})

afterEach(() => cleanup())

describe('Telas de Atendimento e Pátio com armazenamento vazio', () => {
  it.each(TELAS)('%s renderiza sem erro', (_nome, Tela) => {
    expect(() =>
      render(
        <MemoryRouter>
          <Tela />
        </MemoryRouter>
      )
    ).not.toThrow()
  })
})

describe('limparDadosMockLegados', async () => {
  const { limparDadosMockLegados, CHAVE_LIMPEZA_MOCKS } = await import('../../src/utils/limparDadosMockLegados')

  it('remove dados antigos, preserva sessão e roda uma única vez', () => {
    localStorage.setItem('dev_oficina_agenda_agendamentos', '[{"id":"ag-1"}]')
    localStorage.setItem('dev_oficina_leva_e_traz', '[{"id":"lt-1"}]')
    localStorage.setItem('dev_oficina_admin_session', '{"ok":true}')
    localStorage.setItem('outra_app', 'x')

    const removidas = limparDadosMockLegados()

    expect(removidas.sort()).toEqual(['dev_oficina_agenda_agendamentos', 'dev_oficina_leva_e_traz'])
    expect(localStorage.getItem('dev_oficina_admin_session')).toBe('{"ok":true}')
    expect(localStorage.getItem('outra_app')).toBe('x')
    expect(localStorage.getItem(CHAVE_LIMPEZA_MOCKS)).toBeTruthy()

    localStorage.setItem('dev_oficina_leva_e_traz', '[{"id":"real"}]')
    expect(limparDadosMockLegados()).toEqual([])
    expect(localStorage.getItem('dev_oficina_leva_e_traz')).toBe('[{"id":"real"}]')
  })
})
