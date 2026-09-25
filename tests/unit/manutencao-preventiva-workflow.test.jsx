import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ManutencaoPreventivaPage } from '../../src/pages/dashboard/manutencao-preventiva/ManutencaoPreventivaPage'
import { MobileManutencaoPreventivaPage } from '../../src/pages/dashboard/manutencao-preventiva/mobile/MobileManutencaoPreventivaPage'
import * as useIsMobileModule from '../../src/hooks/useIsMobile'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))

describe('Manutenção Preventiva Decomposta e Workflow (Story 2.0c / ADR-003)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(false)
  })

  it('renderiza o cabeçalho executivo desktop com métricas e abas', () => {
    render(
      <MemoryRouter>
        <ManutencaoPreventivaPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Manutenção Preventiva e Saúde da Frota')).toBeDefined()
    expect(screen.getByText('Saúde da Frota Ativa')).toBeDefined()
    expect(screen.getByText('Campanhas e Oportunidades por Serviço')).toBeDefined()
  })

  it('permite alternar para a aba de Campanhas no desktop', () => {
    render(
      <MemoryRouter>
        <ManutencaoPreventivaPage />
      </MemoryRouter>
    )

    const btnCampanhas = screen.getByText('Campanhas e Oportunidades por Serviço')
    fireEvent.click(btnCampanhas)

    expect(btnCampanhas.className).toContain('text-slate-900')
  })

  it('renderiza versão mobile corretamente quando isMobile é verdadeiro', () => {
    vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true)

    render(
      <MemoryRouter>
        <MobileManutencaoPreventivaPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Manutenção Preventiva')).toBeDefined()
    expect(screen.getAllByText('Frota Ativa').length).toBeGreaterThan(0)
  })
})
