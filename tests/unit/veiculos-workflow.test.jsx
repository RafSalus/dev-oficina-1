import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VeiculosPage } from '../../src/pages/dashboard/veiculos/VeiculosPage'
import { MobileVeiculosPage } from '../../src/pages/dashboard/veiculos/mobile/MobileVeiculosPage'
import * as useIsMobileModule from '../../src/hooks/useIsMobile'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))

describe('Veículos da Frota Decompostos e Workflow (Story 2.0d / ADR-003)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(false)
  })

  it('renderiza a página desktop com título, indicadores da frota e botão de novo veículo', () => {
    render(
      <MemoryRouter>
        <VeiculosPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Frota de Veículos')).toBeDefined()
    expect(screen.getByText('Novo Veículo')).toBeDefined()
    expect(screen.getByText('Total na Frota')).toBeDefined()
    expect(screen.getByText('Veículos de Frotistas (PJ)')).toBeDefined()
    expect(screen.getByText('Particulares (PF)')).toBeDefined()
    expect(screen.getByText('Montadoras Atendidas')).toBeDefined()
  })

  it('filtra veículos pelo campo de busca rápida no desktop', async () => {
    render(
      <MemoryRouter>
        <VeiculosPage />
      </MemoryRouter>
    )

    const inputBusca = screen.getByPlaceholderText(
      'Buscar por placa, modelo, marca, cliente, chassi...'
    )
    fireEvent.change(inputBusca, { target: { value: 'PLACA9999XYZ' } })

    expect(await screen.findByText('Nenhum veículo encontrado')).toBeDefined()
  })

  it('renderiza a versão mobile de veículos com cards e estatísticas', () => {
    vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true)

    render(
      <MemoryRouter>
        <MobileVeiculosPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Frota de Veículos')).toBeDefined()
    expect(screen.getByText('Total na Frota')).toBeDefined()
    expect(screen.getByPlaceholderText('Buscar placa, modelo, marca, cliente...')).toBeDefined()
  })
})
