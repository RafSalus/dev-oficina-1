import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ComprasPage } from '../../src/pages/dashboard/suprimentos/ComprasPage'
import { carregarCotacoes } from '../../src/constants/comprasData'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))

const OS_ABERTA = {
  numeroOS: '000101',
  status: 'aguardando_pecas',
  cliente: 'Maria Souza',
  telefone: '43999990000',
  placa: 'ABC1D23',
  marcaModelo: 'Fiat Doblo 1.8',
  ano: '2010',
  km: '280000',
  mecanicoNome: 'Carlos',
  pecasOS: [
    { codigo: 'PEC-10', nome: 'Pastilha de Freio', quantidade: 2, unidade: 'JG', marca: 'Cobreq' },
    { codigo: 'PEC-11', nome: 'Disco de Freio', quantidade: 2, unidade: 'UN' },
  ],
}

const TERCEIROS = [
  { id: 't1', nomeFantasia: 'Oficina do Zé', categoria: 'Retífica', telefone: '4333330000' },
  { id: 't2', nomeFantasia: 'Auto Peças Norte', categoria: 'Auto Peças', whatsapp: '(43) 98888-7777' },
]

const PECAS = [
  { id: 'p1', codigo: 'FLT-01', nome: 'Filtro de Óleo', estoqueAtual: 1, estoqueMinimo: 4, precoCusto: 20, unidade: 'UN' },
  { id: 'p2', codigo: 'VEL-01', nome: 'Vela de Ignição', estoqueAtual: 10, estoqueMinimo: 4, precoCusto: 15, unidade: 'UN' },
]

const PEDIDOS = [
  {
    id: 'ped-1',
    numeroPedido: 'PC-2026-0001',
    fornecedorId: 't2',
    fornecedorNome: 'Auto Peças Norte',
    status: 'AGUARDANDO_ENTREGA',
    valorTotal: 150,
    dataEmissao: '2026-09-20T10:00:00.000Z',
    itens: [{ codigo: 'PEC-10', nome: 'Pastilha de Freio', quantidade: 2, unidade: 'JG' }],
  },
]

function LocalizacaoAtual() {
  const location = useLocation()
  return <div data-testid="rota-atual">{location.pathname}</div>
}

function renderizarCompras() {
  return render(
    <MemoryRouter initialEntries={['/gestao/compras']}>
      <Routes>
        <Route path="/gestao/compras" element={<ComprasPage />} />
        <Route path="/gestao/compras/cotacao/:id" element={<LocalizacaoAtual />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ComprasPage decomposta (Story 2.0 / Task 2)', () => {
  beforeEach(() => {
    localStorage.clear()
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    localStorage.setItem('dev_oficina_ordens_servico', JSON.stringify([OS_ABERTA]))
    localStorage.setItem('dev_oficina_cadastros_terceiros', JSON.stringify(TERCEIROS))
    localStorage.setItem('dev_oficina_cadastros_pecas', JSON.stringify(PECAS))
    localStorage.setItem('dev_oficina_pedidos_compra', JSON.stringify(PEDIDOS))
  })

  it('renderiza cabeçalho, indicadores e a tabela de pedidos', () => {
    renderizarCompras()
    expect(screen.getByText('Compras e Cotações')).toBeTruthy()
    expect(screen.getByText('1 pedidos')).toBeTruthy()
    expect(screen.getByText('R$ 150,00')).toBeTruthy()
    expect(screen.getByText('PC-2026-0001')).toBeTruthy()
    expect(screen.getByText('Aguardando')).toBeTruthy()
  })

  it('filtra pedidos pela busca textual', () => {
    renderizarCompras()
    fireEvent.change(screen.getByPlaceholderText(/Buscar por número do pedido/), {
      target: { value: 'inexistente' },
    })
    expect(screen.queryByText('PC-2026-0001')).toBeNull()
    expect(screen.getByText('Nenhum pedido de compra localizado')).toBeTruthy()
  })

  it('lista a reposição de almoxarifado com déficit e sugestão de compra', () => {
    renderizarCompras()
    fireEvent.click(screen.getAllByText('Reposição de Almoxarifado')[0])
    const linha = screen.getByText('Filtro de Óleo').closest('tr')
    expect(within(linha).getByText('-3')).toBeTruthy()
    expect(within(linha).getByText('7 UN')).toBeTruthy()
    expect(within(linha).getByText('R$ 140.00')).toBeTruthy()
    expect(screen.queryByText('Vela de Ignição')).toBeNull()
  })

  it('"Cotar Peça" cria a cotação com as peças da OS e abre a tela dedicada', () => {
    renderizarCompras()
    fireEvent.click(screen.getByText('Demandas das Ordens de Serviço'))
    fireEvent.click(screen.getAllByText('Cotar Peça')[0])

    const [cotacao] = carregarCotacoes()
    expect(cotacao.numeroOS).toBe('000101')
    expect(cotacao.clienteNome).toBe('Maria Souza')
    expect(cotacao.itens.map((i) => i.nome)).toEqual(['Pastilha de Freio', 'Disco de Freio'])
    // Prioriza autopeças como fornecedores iniciais
    expect(cotacao.fornecedoresCotados.map((f) => f.id)).toEqual(['t2'])
    expect(cotacao.fornecedoresCotados[0].whatsapp).toBe('43988887777')
    expect(screen.getByTestId('rota-atual').textContent).toBe(`/gestao/compras/cotacao/${cotacao.id}`)
  })

  it('"Cotar Todas as Reposições" gera uma cotação agrupada do almoxarifado', () => {
    renderizarCompras()
    fireEvent.click(screen.getAllByText('Reposição de Almoxarifado')[0])
    fireEvent.click(screen.getByText(/Cotar Todas as Reposições/))

    const [cotacao] = carregarCotacoes()
    expect(cotacao.veiculoModelo).toBe('Reposição Completa de Almoxarifado')
    expect(cotacao.observacoes).toBe('Cotação de reposição do almoxarifado (1 itens)')
    expect(cotacao.itens[0]).toMatchObject({ nome: 'Filtro de Óleo', quantidade: 7 })
    expect(cotacao.fornecedoresCotados[0].nome).toBe('Auto Peças Norte')
  })
})
