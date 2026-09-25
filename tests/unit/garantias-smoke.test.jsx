// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GarantiasPage } from '../../src/pages/dashboard/garantias/GarantiasPage'
import {
  carregarGarantias,
  calcularMetricasGarantias,
  MOCK_GARANTIAS_INICIAIS,
} from '../../src/constants/mockGarantias'

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

describe('Tela de Garantias (UI/UX Smoke Tests)', () => {
  it('renderiza GarantiasPage sem erro', () => {
    expect(() =>
      render(
        <MemoryRouter>
          <GarantiasPage />
        </MemoryRouter>
      )
    ).not.toThrow()

    expect(screen.getByText('Garantias Ativas')).toBeDefined()
    expect(screen.getByPlaceholderText(/Buscar por placa, cliente, OS/i)).toBeDefined()
  })

  it('calcula métricas corretamente a partir dos dados iniciais', () => {
    const metricas = calcularMetricasGarantias(MOCK_GARANTIAS_INICIAIS)
    expect(metricas.total).toBe(6)
    expect(metricas.ativas).toBeGreaterThan(0)
    expect(metricas.aVencer).toBe(1)
    expect(metricas.acionadas).toBe(1)
    expect(metricas.expiradas).toBe(1)
  })

  it('persiste e recarrega garantias do localStorage', () => {
    const lista = carregarGarantias()
    expect(lista.length).toBe(MOCK_GARANTIAS_INICIAIS.length)
  })
})
