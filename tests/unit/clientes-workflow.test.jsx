import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ClientesPage } from '../../src/pages/dashboard/clientes/ClientesPage'
import { MobileClientesPage } from '../../src/pages/dashboard/clientes/mobile/MobileClientesPage'
import * as useIsMobileModule from '../../src/hooks/useIsMobile'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))

describe('Clientes e Frotistas Decompostos e Workflow (Story 2.0d / ADR-003)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(false)
  })

  it('renderiza a página desktop com título, indicadores e botão de novo cliente', () => {
    render(
      <MemoryRouter>
        <ClientesPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Clientes e Frotistas')).toBeDefined()
    expect(screen.getByText('Novo Cliente')).toBeDefined()
    expect(screen.getByText('Total de Clientes')).toBeDefined()
    expect(screen.getByText('Pessoas Físicas (CPF)')).toBeDefined()
    expect(screen.getByText('Pessoas Jurídicas (CNPJ)')).toBeDefined()
    expect(screen.getByText('Veículos na Base')).toBeDefined()
  })

  it('filtra clientes pelo campo de busca textual no desktop', async () => {
    render(
      <MemoryRouter>
        <ClientesPage />
      </MemoryRouter>
    )

    const inputBusca = screen.getByPlaceholderText(
      'Buscar por nome, CPF, CNPJ, telefone, placa do veículo ou cidade...'
    )
    fireEvent.change(inputBusca, { target: { value: 'InexistenteXYZ123' } })

    expect(await screen.findByText('Nenhum cliente encontrado')).toBeDefined()
  })

  it('renderiza a versão mobile de clientes com chips de métricas e lista de cards', () => {
    vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true)

    render(
      <MemoryRouter>
        <MobileClientesPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Clientes e Frotistas')).toBeDefined()
    expect(screen.getByText('Total')).toBeDefined()
    expect(screen.getByPlaceholderText('Buscar nome, CPF/CNPJ, telefone ou placa...')).toBeDefined()
  })
})
