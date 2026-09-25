import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PDVPage } from '../../src/pages/dashboard/pdv/PDVPage'
import {
  converterOSParaItensCarrinho,
  resumoFormasPagamento,
  construirVendaPDV,
} from '../../src/pages/dashboard/pdv/pdvWorkflowHelpers'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))

describe('PDV Decomposto e Workflow (Story 2.0b / ADR-003)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('pdvWorkflowHelpers', () => {
    it('converterOSParaItensCarrinho mapeia peças, serviços e terceiros da OS', () => {
      const mockOS = {
        numeroOS: '1001',
        pecasOS: [{ codigo: 'P01', nome: 'Filtro', quantidade: 2, precoUnitario: 30 }],
        servicosOS: [{ codigo: 'S01', nome: 'Troca de Óleo', quantidade: 1, valorUnitario: 50 }],
        terceirosOS: [{ codigo: 'T01', nome: 'Torno Mecânico', quantidade: 1, precoUnitario: 80 }],
      }

      const itens = converterOSParaItensCarrinho(mockOS)
      expect(itens).toHaveLength(3)

      expect(itens[0]).toMatchObject({
        tipo: 'peca',
        codigo: 'P01',
        nome: 'Filtro',
        quantidade: 2,
        precoUnitario: 30,
        origemOS: true,
      })

      expect(itens[1]).toMatchObject({
        tipo: 'servico',
        codigo: 'S01',
        nome: 'Troca de Óleo',
        quantidade: 1,
        precoUnitario: 50,
        origemOS: true,
      })

      expect(itens[2]).toMatchObject({
        tipo: 'terceiro',
        codigo: 'T01',
        nome: 'Torno Mecânico',
        quantidade: 1,
        precoUnitario: 80,
        origemOS: true,
      })
    })

    it('resumoFormasPagamento formata métodos e parcelas corretamente', () => {
      const formas = [
        { metodo: 'pix', valor: 100 },
        { metodo: 'credito', valor: 200, parcelas: 3 },
      ]
      const resumo = resumoFormasPagamento(formas)
      expect(resumo).toBe('PIX + Cartão de Crédito 3x')
    })

    it('construirVendaPDV gera registro de venda completo', () => {
      const venda = construirVendaPDV({
        itensCarrinho: [{ uid: '1', nome: 'Item Teste', quantidade: 1, precoUnitario: 100 }],
        totais: { subtotal: 100, descontoGeralValor: 10, totalGeral: 90 },
        clienteInfo: { nome: 'João Teste' },
        veiculoInfo: { placa: 'ABC-1234' },
        osVinculada: { numeroOS: '5555' },
        formasPagamento: [{ metodo: 'dinheiro', valor: 90 }],
        tipoNota: 'nfce',
        documentoNota: '',
        troco: 0,
      })

      expect(venda.numeroOSVinculada).toBe('5555')
      expect(venda.subtotal).toBe(100)
      expect(venda.totalGeral).toBe(90)
      expect(venda.cliente.nome).toBe('João Teste')
      expect(venda.veiculo.placa).toBe('ABC-1234')
      expect(venda.tipoNota).toBe('nfce')
    })
  })

  describe('PDVPage Component', () => {
    it('renderiza os painéis principais do PDV (Header, Catálogo e Cupom)', () => {
      render(
        <MemoryRouter initialEntries={['/gestao/pdv']}>
          <PDVPage />
        </MemoryRouter>
      )

      expect(screen.getByText('Ponto de Venda (PDV)')).toBeTruthy()
      expect(screen.getByRole('button', { name: /peças e produtos/i })).toBeTruthy()
      expect(screen.getByRole('button', { name: /serviços/i })).toBeTruthy()
      expect(screen.getByText('Cupom Atual')).toBeTruthy()
      expect(screen.getByRole('button', { name: /finalizar venda/i }).disabled).toBe(true)
    })

    it('permite alternar catálogo entre peças e serviços', () => {
      render(
        <MemoryRouter initialEntries={['/gestao/pdv']}>
          <PDVPage />
        </MemoryRouter>
      )

      const btnServicos = screen.getByRole('button', { name: /serviços/i })
      fireEvent.click(btnServicos)

      expect(screen.getByPlaceholderText('Buscar por nome ou código...')).toBeTruthy()
    })
  })
})
