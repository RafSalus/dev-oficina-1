import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { toast } from 'sonner'
import { CotacaoPage } from '../../src/pages/dashboard/suprimentos/CotacaoPage'
import { carregarCotacoes } from '../../src/constants/comprasData'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))

const OS_ABERTA = {
  numeroOS: '000202',
  status: 'aguardando_pecas',
  cliente: 'João Lima',
  telefone: '43911112222',
  placa: 'XYZ9A87',
  marcaModelo: 'VW Gol 1.0',
  ano: '2015',
  km: '90000',
  pecasOS: [{ codigo: 'AMT-01', nome: 'Amortecedor Dianteiro', quantidade: 2, unidade: 'UN' }],
}

const COTACAO_SALVA = {
  id: 'COT-2026-0007',
  numeroOS: '',
  clienteNome: 'Almoxarifado Central',
  veiculoPlaca: 'OFICINA',
  veiculoModelo: 'Reposição de Almoxarifado',
  status: 'EM_COTACAO',
  observacoes: 'Reposição',
  itens: [{ id: 'it-1', codigo: 'FLT-01', nome: 'Filtro de Óleo', quantidade: 3, unidade: 'UN' }],
  fornecedoresCotados: [
    { id: 'f1', nome: 'Auto Peças Norte', status: 'AGUARDANDO', valorTotal: null, respostasItens: {} },
    { id: 'f2', nome: 'Distribuidora Sul', status: 'AGUARDANDO', valorTotal: null, respostasItens: {} },
  ],
  fornecedorVencedorId: null,
  dataCriacao: '2026-09-20T10:00:00.000Z',
}

function renderizarCotacao(rota) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route path="/gestao/compras/cotacao/:id" element={<CotacaoPage />} />
        <Route path="/gestao/compras" element={<div>Tela de Compras</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('CotacaoPage decomposta (Story 2.0 / Task 2)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    localStorage.setItem('dev_oficina_ordens_servico', JSON.stringify([OS_ABERTA]))
    localStorage.setItem('dev_oficina_cotacoes_pecas', JSON.stringify([COTACAO_SALVA]))
  })

  it('carrega a cotação salva pelo id da rota', () => {
    renderizarCotacao('/gestao/compras/cotacao/COT-2026-0007')
    expect(screen.getByText('COT-2026-0007')).toBeTruthy()
    expect(screen.getByText('Filtro de Óleo')).toBeTruthy()
    expect(screen.getByText('Auto Peças Norte')).toBeTruthy()
    expect(screen.getByText('Distribuidora Sul')).toBeTruthy()
  })

  it('pré-preenche veículo e peças a partir da OS em ?os=', () => {
    renderizarCotacao('/gestao/compras/cotacao/nova?os=000202')
    expect(screen.getByDisplayValue('XYZ9A87')).toBeTruthy()
    expect(screen.getByDisplayValue('João Lima')).toBeTruthy()
    expect(screen.getByText('Amortecedor Dianteiro')).toBeTruthy()
    expect(screen.getByText('OS Vinculada: #000202')).toBeTruthy()
  })

  it('recalcula o total da proposta ao preencher o preço unitário', () => {
    renderizarCotacao('/gestao/compras/cotacao/COT-2026-0007')
    const card = screen.getByText('Auto Peças Norte').closest('div.border')
    fireEvent.click(within(card).getByText('Preços'))
    fireEvent.change(within(card).getByPlaceholderText('0,00'), { target: { value: '12.5' } })
    expect(within(card).getAllByText('R$ 37.50').length).toBeGreaterThan(0)
    expect(within(card).getByText('Proposta Recebida')).toBeTruthy()
  })

  it('aprova a menor proposta, salva a cotação e abre o pedido de compra', () => {
    renderizarCotacao('/gestao/compras/cotacao/COT-2026-0007')
    const preencher = (nome, preco) => {
      const card = screen.getByText(nome).closest('div.border')
      fireEvent.click(within(card).getByText('Preços'))
      fireEvent.change(within(card).getByPlaceholderText('0,00'), { target: { value: preco } })
    }
    preencher('Auto Peças Norte', '20')
    preencher('Distribuidora Sul', '15')

    fireEvent.click(screen.getByText('Aprovar Cotação e Gerar Pedido'))

    const [salva] = carregarCotacoes()
    expect(salva.status).toBe('APROVADA')
    expect(salva.fornecedorVencedorId).toBe('f2')
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Distribuidora Sul'))
    expect(screen.getByText('Novo Pedido de Compra de Peças')).toBeTruthy()
  })

  it('inclui peça avulsa pelo formulário rápido e valida o nome', () => {
    renderizarCotacao('/gestao/compras/cotacao/COT-2026-0007')
    fireEvent.click(screen.getByText('Adicionar Peça à Cotação'))
    fireEvent.click(screen.getByText('Confirmar Peça na Cotação'))
    expect(toast.error).toHaveBeenCalledWith('Informe o nome ou descrição da peça.')

    fireEvent.change(screen.getByPlaceholderText('Ex: Tubo Suporte de Arrefecimento'), {
      target: { value: 'Correia Dentada' },
    })
    fireEvent.click(screen.getByText('Confirmar Peça na Cotação'))
    expect(screen.getByText('Correia Dentada')).toBeTruthy()
    expect(screen.getByText('Lista de Peças que Estão em Cotação (2 itens)')).toBeTruthy()
  })

  it('mantém o que foi digitado ao cancelar e reabrir o formulário de peça', () => {
    renderizarCotacao('/gestao/compras/cotacao/COT-2026-0007')
    fireEvent.click(screen.getByText('Adicionar Peça à Cotação'))
    fireEvent.change(screen.getByPlaceholderText('Ex: Tubo Suporte de Arrefecimento'), {
      target: { value: 'Bomba de Água' },
    })
    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByPlaceholderText('Ex: Tubo Suporte de Arrefecimento')).toBeNull()

    fireEvent.click(screen.getByText('Adicionar Peça à Cotação'))
    expect(screen.getByDisplayValue('Bomba de Água')).toBeTruthy()
  })
})
