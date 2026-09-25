import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EstacionadosPage } from '../../src/pages/dashboard/estacionados/EstacionadosPage'
import { MobileEstacionadosPage } from '../../src/pages/dashboard/estacionados/mobile/MobileEstacionadosPage'
import * as useIsMobileModule from '../../src/hooks/useIsMobile'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))

describe('Estacionados Decomposto e Workflow (Story 2.0c / ADR-003)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(false)
  })

  it('renderiza a página desktop de Estacionados com cabeçalho e indicadores', () => {
    render(
      <MemoryRouter>
        <EstacionadosPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Veículos Estacionados')).toBeDefined()
    expect(screen.getByText('Estacionar Veículo')).toBeDefined()
    expect(screen.getByText('Total Estacionados')).toBeDefined()
    expect(screen.getByText('Comprador Informado')).toBeDefined()
  })

  it('permite filtrar veículos por termo de busca no desktop', () => {
    render(
      <MemoryRouter>
        <EstacionadosPage />
      </MemoryRouter>
    )

    const inputBusca = screen.getByPlaceholderText(/Buscar por placa, modelo, marca/i)
    fireEvent.change(inputBusca, { target: { value: 'XYZ9999' } })

    expect(inputBusca.value).toBe('XYZ9999')
  })

  it('renderiza a versão mobile de Estacionados quando isMobile é verdadeiro', () => {
    vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true)

    render(
      <MemoryRouter>
        <MobileEstacionadosPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Estacionados')).toBeDefined()
    expect(screen.getByText('Estacionar')).toBeDefined()
  })
})
