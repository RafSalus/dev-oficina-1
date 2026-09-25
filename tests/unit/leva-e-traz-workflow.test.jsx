import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LevaETrazPage } from '../../src/pages/dashboard/leva-e-traz/LevaETrazPage'
import { MobileLevaETrazPage } from '../../src/pages/dashboard/leva-e-traz/mobile/MobileLevaETrazPage'
import * as useIsMobileModule from '../../src/hooks/useIsMobile'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))

describe('Leva e Traz Decomposto e Workflow (Story 2.0c / ADR-003)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(false)
  })

  it('renderiza o cabeçalho executivo desktop com indicadores de operação', () => {
    render(
      <MemoryRouter>
        <LevaETrazPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Leva e Traz e Logística')).toBeDefined()
    expect(screen.getByText('Fila e Roteiro Ativo')).toBeDefined()
    expect(screen.getByText('Histórico de Viagens')).toBeDefined()
    expect(screen.getByText('Veículos de Apoio')).toBeDefined()
  })

  it('permite alternar para a aba de Veículos de Apoio no desktop', () => {
    render(
      <MemoryRouter>
        <LevaETrazPage />
      </MemoryRouter>
    )

    const btnApoio = screen.getByText('Veículos de Apoio')
    fireEvent.click(btnApoio)

    expect(screen.getByText(/Status dos Veículos e Motos de Apoio/i)).toBeDefined()
  })

  it('renderiza a versão mobile de Leva e Traz quando isMobile é verdadeiro', () => {
    vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true)

    render(
      <MemoryRouter>
        <MobileLevaETrazPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Leva e Traz')).toBeDefined()
    expect(screen.getByText(/Roteiro do Dia/i)).toBeDefined()
    expect(screen.getByText(/Histórico Concluído/i)).toBeDefined()
  })
})
