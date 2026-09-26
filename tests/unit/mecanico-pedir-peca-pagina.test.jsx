import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Story 2.15 (REL-001): a página só marca a peça na OS se a requisição foi gravada.
const mocks = vi.hoisted(() => ({
  pedirPecaParaOS: vi.fn(),
  salvarOrdemAberta: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))

vi.mock('../../src/hooks/useIsMobile', () => ({ useIsMobile: () => false }))

vi.mock('../../src/constants/catalogoPecasEstoque', () => ({
  CATALOGO_PECAS_ESTOQUE: [
    { codigo: 'PST-01', nome: 'Pastilha de freio', categoria: 'Freios', estoqueAtual: 4, precoUnitario: 120, marcaSugerida: 'Bosch' },
  ],
}))

vi.mock('../../src/pages/dashboard/orcamento/mockOrdensAbertas', () => ({
  obterOrdensAbertas: () => [
    { numeroOS: '1042', marcaModelo: 'Fiat Uno', placa: 'ABC1D23', cliente: 'Maria Souza', clienteNome: 'Maria Souza', mecanicoNome: 'João Mecânico', status: 'em_execucao', pecasOS: [], servicosOS: [] },
  ],
  atualizarStatusOrdem: vi.fn(),
  salvarOrdemAberta: mocks.salvarOrdemAberta,
  assumirOrdemSemMecanico: vi.fn(),
}))

vi.mock('../../src/context/MecanicoContext', () => ({
  useMecanico: () => ({
    mecanicoAtivo: { value: 'mec-1', nome: 'João Mecânico', boxElevador: 'Box 1' },
    pecasDanificadas: [],
    adicionarPecaDanificada: vi.fn(),
    ferramentasDanificadas: [],
    adicionarFerramentaDanificada: vi.fn(),
    requisicoesPecas: [],
    carregandoRequisicoes: false,
    pedirPecaParaOS: mocks.pedirPecaParaOS,
  }),
}))

const { MecanicoDashboardPage } = await import('../../src/pages/mecanico/MecanicoDashboardPage')

function renderizar() {
  return render(
    <MemoryRouter initialEntries={['/mecanico/pedir-pecas']}>
      <MecanicoDashboardPage />
    </MemoryRouter>
  )
}

describe('Página do mecânico — pedir peça (Story 2.15, REL-001)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('requisição gravada: envia os dados e marca a peça na OS como requisitada', async () => {
    mocks.pedirPecaParaOS.mockResolvedValueOnce({ id: 'req-1' })
    renderizar()

    fireEvent.click(await screen.findByText('Pedir Peça'))

    await waitFor(() => expect(mocks.salvarOrdemAberta).toHaveBeenCalledTimes(1))
    expect(mocks.pedirPecaParaOS).toHaveBeenCalledWith(
      expect.objectContaining({ numeroOS: '1042', pecaNome: 'Pastilha de freio', codigoPeca: 'PST-01' })
    )
    const osSalva = mocks.salvarOrdemAberta.mock.calls[0][0]
    expect(osSalva.pecasOS).toEqual([
      expect.objectContaining({ codigo: 'PST-01', statusRequisicao: 'Requisitada pelo Mecânico' }),
    ])
  })

  it('requisição falhou: não marca nada na OS (fail-closed)', async () => {
    mocks.pedirPecaParaOS.mockResolvedValueOnce(null)
    renderizar()

    fireEvent.click(await screen.findByText('Pedir Peça'))

    await waitFor(() => expect(mocks.pedirPecaParaOS).toHaveBeenCalledTimes(1))
    await new Promise((r) => setTimeout(r, 0))
    expect(mocks.salvarOrdemAberta).not.toHaveBeenCalled()
  })
})
