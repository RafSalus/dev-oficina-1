import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MobileComprasPage } from '../../src/pages/dashboard/suprimentos/mobile/MobileComprasPage'
import { MobileEstoquePage } from '../../src/pages/dashboard/suprimentos/mobile/MobileEstoquePage'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))

describe('Telas Mobile de Suprimentos Decompostas (Story 2.0b / ADR-003)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renderiza MobileComprasPage com indicadores e alterna entre abas', () => {
    render(
      <MemoryRouter initialEntries={['/gestao/compras']}>
        <MobileComprasPage />
      </MemoryRouter>
    )

    // Título e abas
    expect(screen.getByText('Compras & Cotações')).toBeTruthy()
    expect(screen.getByRole('button', { name: /^pedidos$/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /^cotações$/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /^demandas os$/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /^reposição$/i })).toBeTruthy()

    // Alterna para Cotações
    fireEvent.click(screen.getByRole('button', { name: /^cotações$/i }))
    expect(screen.getByText('Nenhuma cotação encontrada')).toBeTruthy()

    // Alterna para Demandas OS
    fireEvent.click(screen.getByRole('button', { name: /^demandas os$/i }))
    expect(screen.getByText('Sem demandas pendentes')).toBeTruthy()

    // Alterna para Reposição
    fireEvent.click(screen.getByRole('button', { name: /^reposição$/i }))
    expect(screen.getByText('Estoque Regularizado')).toBeTruthy()
  })

  it('renderiza MobileEstoquePage com métricas e navega entre abas Posição, Kardex e Reposição', () => {
    render(
      <MemoryRouter initialEntries={['/gestao/estoque']}>
        <MobileEstoquePage />
      </MemoryRouter>
    )

    // Título e abas
    expect(screen.getByText('Estoque e Almoxarifado')).toBeTruthy()
    expect(screen.getByRole('button', { name: /^posição$/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /^kardex$/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /^reposição$/i })).toBeTruthy()

    // Alterna para Kardex
    fireEvent.click(screen.getByRole('button', { name: /^kardex$/i }))
    expect(screen.getByPlaceholderText(/buscar sku, item, documento/i)).toBeTruthy()

    // Alterna para Reposição
    fireEvent.click(screen.getByRole('button', { name: /^reposição$/i }))
    expect(screen.getByText(/estimativa de investimento/i)).toBeTruthy()
  })
})
