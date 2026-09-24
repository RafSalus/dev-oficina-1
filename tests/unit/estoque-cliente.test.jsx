import React from 'react'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { toast } from 'sonner'
import { EstoquePage } from '../../src/pages/dashboard/suprimentos/EstoquePage'
import { ClienteModalForm } from '../../src/components/clientes/ClienteModalForm'
import { carregarCotacoes } from '../../src/constants/comprasData'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))

vi.mock('../../src/services/fipeService', () => ({
  buscarMarcasFipe: vi.fn().mockResolvedValue([{ value: '21', label: 'Fiat' }]),
  buscarModelosFipe: vi.fn().mockResolvedValue([]),
  buscarAnosFipe: vi.fn().mockResolvedValue([]),
  normalizarCombustivelFipe: vi.fn(() => ''),
  extrairAnoFipe: vi.fn(() => ''),
}))

vi.mock('../../src/services/cepService', () => ({
  consultarCepApi: vi.fn().mockResolvedValue({ logradouro: 'Rua Ponta Grossa', bairro: 'Centro', cidade: 'Apucarana', uf: 'PR' }),
}))

const PECAS = [
  { id: 'p1', codigo: 'FLT-01', nome: 'Filtro de Óleo', categoria: 'Filtros', estoqueAtual: 1, estoqueMinimo: 4, precoCusto: 20, precoVenda: 35, unidade: 'UN' },
  { id: 'p2', codigo: 'VEL-01', nome: 'Vela de Ignição', categoria: 'Ignição', estoqueAtual: 10, estoqueMinimo: 4, precoCusto: 15, precoVenda: 30, unidade: 'UN' },
  { id: 'p3', codigo: 'PAS-01', nome: 'Pastilha de Freio', categoria: 'Freios', estoqueAtual: 0, estoqueMinimo: 2, precoCusto: 80, precoVenda: 140, unidade: 'JG' },
]

const MOVIMENTACOES = [
  { id: 'm1', tipo: 'ENTRADA', pecaNome: 'Filtro de Óleo', pecaCodigo: 'FLT-01', quantidade: 5, saldoAnterior: 0, saldoNovo: 5, dataHora: '2026-09-20T10:00:00.000Z', documento: 'NF 123' },
  { id: 'm2', tipo: 'SAIDA', pecaNome: 'Vela de Ignição', pecaCodigo: 'VEL-01', quantidade: 2, saldoAnterior: 12, saldoNovo: 10, dataHora: '2026-09-21T10:00:00.000Z' },
]

function renderizarEstoque() {
  return render(
    <MemoryRouter initialEntries={['/gestao/estoque']}>
      <Routes>
        <Route path="/gestao/estoque" element={<EstoquePage />} />
        <Route path="/gestao/compras/cotacao/:id" element={<div>Tela de Cotação</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('EstoquePage decomposto (Story 2.0 / Task 4)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    localStorage.setItem('dev_oficina_cadastros_pecas', JSON.stringify(PECAS))
    localStorage.setItem('dev_oficina_movimentacoes_estoque', JSON.stringify(MOVIMENTACOES))
    localStorage.setItem('dev_oficina_cadastros_terceiros', JSON.stringify([{ id: 't1', nomeFantasia: 'Auto Peças Norte', categoria: 'Auto Peças' }]))
  })

  it('mostra indicadores, situação de cada peça e ordena por nome', () => {
    renderizarEstoque()
    expect(screen.getByText('R$ 170,00')).toBeTruthy()
    expect(screen.getByText('2 repor')).toBeTruthy()
    const nomes = screen.getAllByText(/Filtro de Óleo|Vela de Ignição|Pastilha de Freio/).map((n) => n.textContent)
    expect(nomes).toEqual(['Filtro de Óleo', 'Pastilha de Freio', 'Vela de Ignição'])
    expect(within(screen.getByText('Pastilha de Freio').closest('tr')).getByText('Zerado')).toBeTruthy()
    expect(within(screen.getByText('Vela de Ignição').closest('tr')).getByText('Adequado')).toBeTruthy()
  })

  it('abre o Kardex filtrado pela peça', () => {
    renderizarEstoque()
    const linha = screen.getByText('Filtro de Óleo').closest('tr')
    fireEvent.click(within(linha).getByTitle('Ver histórico de movimentações (Kardex)'))
    expect(screen.getByDisplayValue('FLT-01')).toBeTruthy()
    expect(screen.getByText('NF 123')).toBeTruthy()
    expect(screen.queryByText('Vela de Ignição')).toBeNull()
  })

  it('cota todas as reposições com a sugestão de compra do Estoque', () => {
    renderizarEstoque()
    fireEvent.click(screen.getByText('Sugestão de Reposição e Compras'))
    fireEvent.click(screen.getByText('Cotar Todas as Reposições (2)'))

    const [cotacao] = carregarCotacoes()
    expect(cotacao.veiculoModelo).toBe('Reposição Completa de Almoxarifado')
    expect(cotacao.itens.map((i) => [i.nome, i.quantidade])).toEqual([
      ['Pastilha de Freio', 4],
      ['Filtro de Óleo', 7],
    ])
    expect(cotacao.fornecedoresCotados[0].nome).toBe('Auto Peças Norte')
    expect(screen.getByText('Tela de Cotação')).toBeTruthy()
  })
})

const CLIENTE_EXISTENTE = {
  value: 'cli-1',
  id: 'cli-1',
  codigoCliente: '0000007',
  tipoPessoa: 'F',
  nome: '  Maria Souza ',
  documento: '529.982.247-25',
  telefone: '43999990000',
  cep: '86800000',
  logradouro: 'Rua A',
  numero: '10',
  bairro: 'Centro',
  cidade: 'Apucarana',
  uf: 'PR',
  veiculos: [
    { value: 'v1', placa: 'ABC1D23', marcaModelo: 'Fiat Uno' },
    { value: 'v2', placa: 'DEF4G56', marcaModelo: 'VW Gol' },
    { value: 'v3', placa: 'GHI7J89', marcaModelo: 'Ford Ka' },
  ],
}

describe('ClienteModalForm decomposto (Story 2.0 / Task 4)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('valida os campos obrigatórios antes de salvar', () => {
    const onSalvar = vi.fn()
    render(<ClienteModalForm isOpen onClose={vi.fn()} onSalvar={onSalvar} />)
    fireEvent.submit(screen.getByText('Salvar Cliente').closest('form'))
    expect(toast.warning).toHaveBeenCalledWith('O nome do cliente é obrigatório.')
    expect(onSalvar).not.toHaveBeenCalled()
  })

  it('salva o cliente em edição com os campos normalizados', () => {
    const onSalvar = vi.fn()
    const onClose = vi.fn()
    render(<ClienteModalForm isOpen onClose={onClose} onSalvar={onSalvar} clienteParaEditar={CLIENTE_EXISTENTE} />)
    expect(screen.getByText('CPF validado oficialmente')).toBeTruthy()

    fireEvent.submit(screen.getByText('Salvar Cliente').closest('form'))
    const payload = onSalvar.mock.calls[0][0]
    expect(payload).toMatchObject({
      id: 'cli-1',
      nome: 'Maria Souza',
      nomeFantasia: 'Maria Souza',
      telefone: '(43) 99999-0000',
      label: '0000007 - Maria Souza - (43) 99999-0000',
      endereco: 'Rua A, 10 - Centro, Apucarana - PR',
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('filtra e remove veículos da frota e pede confirmação para descartar', () => {
    const onClose = vi.fn()
    render(<ClienteModalForm isOpen onClose={onClose} onSalvar={vi.fn()} clienteParaEditar={CLIENTE_EXISTENTE} />)
    fireEvent.change(screen.getByPlaceholderText('Filtrar veículos da frota por placa, marca ou modelo...'), { target: { value: 'gol' } })
    expect(screen.queryByText('ABC1D23')).toBeNull()

    // Remove o Gol (índice 1 na lista completa, mesmo com a lista filtrada)
    fireEvent.click(screen.getByTitle('Remover veículo'))
    expect(screen.getByText('Veículos Vinculados (2)')).toBeTruthy()

    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.getByText('Descartar alterações do cliente?')).toBeTruthy()
    fireEvent.click(screen.getByText('Sim, Descartar'))
    expect(onClose).toHaveBeenCalled()
  })

  it('abre a inclusão de veículo com código automático e marcas da FIPE', async () => {
    render(<ClienteModalForm isOpen onClose={vi.fn()} onSalvar={vi.fn()} />)
    fireEvent.click(screen.getByText('Incluir Veículo'))
    expect(screen.getByText('Novo Veículo para o Cliente')).toBeTruthy()
    fireEvent.click(screen.getAllByText('Incluir Veículo').at(-1))
    expect(toast.warning).toHaveBeenCalledWith('Informe a placa do veículo.')
    const { buscarMarcasFipe } = await import('../../src/services/fipeService')
    await waitFor(() => expect(buscarMarcasFipe).toHaveBeenCalled())
  })
})
