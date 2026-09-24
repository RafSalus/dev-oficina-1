import React from 'react'
import { render, screen, renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAprovacaoOrcamento } from '../../src/hooks/useAprovacaoOrcamento'
import { AprovacaoOrcamentoTab } from '../../src/components/aprovacao/AprovacaoOrcamentoTab'
import { AprovacaoHeader } from '../../src/components/aprovacao/AprovacaoHeader'

// Mock do ClienteContext
vi.mock('../../src/context/ClienteContext', () => ({
  useCliente: () => ({
    clienteAtivo: { value: 'cli-001', nome: 'Rafael Salustiano' },
  }),
}))

// Mock de ordens abertas para testes de aprovação
vi.mock('../../src/pages/dashboard/orcamento/mockOrdensAbertas', () => {
  const osMock = {
    numeroOS: '002908',
    clienteId: 'cli-001',
    cliente: 'Rafael Salustiano',
    status: 'aguardando_aprovacao',
    placa: 'ABC-1234',
    marcaModelo: 'Honda Civic 2.0',
    ano: '2021',
    cor: 'Prata',
    km: '45000',
    pecasOS: [
      { id: 'p1', codigo: 'PEC-01', nome: 'Pastilha de Freio Dianteira', quantidade: 1, precoUnitario: 180, subtotal: 180, motivoSeguranca: 'Desgaste crítico' },
      { id: 'p2', codigo: 'PEC-02', nome: 'Filtro de Ar Condicionado', quantidade: 1, precoUnitario: 60, subtotal: 60 },
    ],
    servicosOS: [
      { id: 's1', codigo: 'SRV-01', nome: 'Troca de Pastilhas Dianteiras', valorUnitario: 120, subtotal: 120 },
      { id: 's2', codigo: 'SRV-02', nome: 'Higienização de Ar Condicionado', valorUnitario: 80, subtotal: 80 },
    ],
    terceirosOS: [],
    itensAdicionaisOS: [],
  }

  return {
    obterOrdensAbertas: () => [osMock],
    obterOrdensFinalizadas: () => [],
    atualizarStatusOrdem: vi.fn(),
    registrarAprovacaoItens: vi.fn(),
    responderItemAdicional: vi.fn(),
  }
})

describe('Fluxo Decomposto de Aprovação de Orçamento (Story 2.0 / NFR17 / NFR18)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('deve carregar dados da OS e calcular os totais iniciais corretamente no hook useAprovacaoOrcamento', () => {
    const { result } = renderHook(() => useAprovacaoOrcamento('002908'))

    expect(result.current.temOS).toBe(true)
    expect(result.current.numeroOS).toBe('002908')
    expect(result.current.totais.subTotalPecas).toBe(240)
    expect(result.current.totais.subTotalServicos).toBe(200)
    expect(result.current.totais.totalGeral).toBe(440)
    expect(result.current.totais.valorPixComDesconto).toBe(440 * 0.95)
  })

  it('não deve permitir desmarcar item classificado como essencial (trava de segurança)', () => {
    const { result } = renderHook(() => useAprovacaoOrcamento('002908'))

    // Pastilha de freio é essencial (segurança)
    act(() => {
      result.current.handleToggleItem('p1', 'essencial')
    })

    // Permanece aprovado e total não muda
    expect(result.current.respostasLocais['p1']).toBe('aprovado')
    expect(result.current.totais.totalGeral).toBe(440)
  })

  it('permite alternar item opcional recalculando o total geral imediatamente', () => {
    const { result } = renderHook(() => useAprovacaoOrcamento('002908'))

    // Filtro de ar condicionado é opcional (R$ 60)
    act(() => {
      result.current.handleToggleItem('p2', 'opcional')
    })

    expect(result.current.respostasLocais['p2']).toBe('recusado')
    expect(result.current.totais.totalGeral).toBe(440 - 60) // 380
  })

  it('registra confirmação de aprovação com sucesso no localStorage e atualiza estado', () => {
    const { result } = renderHook(() => useAprovacaoOrcamento('002908'))

    act(() => {
      result.current.confirmarAprovacao({
        nomeResponsavel: 'Rafael Salustiano',
        formaPagamento: 'pix',
      })
    })

    expect(result.current.estaAprovado).toBe(true)
    expect(result.current.nomeResponsavelAprovacao).toBe('Rafael Salustiano')
    expect(result.current.formaPagamentoEscolhida).toBe('pix')

    const salvas = JSON.parse(localStorage.getItem('dev_oficina_aprovacoes') || '{}')
    expect(salvas['002908']).toBeDefined()
    expect(salvas['002908'].responsavel).toBe('Rafael Salustiano')
  })

  it('renderiza AprovacaoHeader e exibe dados do veículo e da OS corretamente', () => {
    const dadosOS = {
      numeroOS: '002908',
      placa: 'ABC-1234',
      marcaModelo: 'Honda Civic 2.0',
      ano: '2021',
      cor: 'Prata',
      km: '45000',
    }

    render(
      <AprovacaoHeader
        dadosOS={dadosOS}
        estaAprovado={false}
        dataHoraAprovacao={null}
        onAbrirFolhaImpressao={() => {}}
        onTirarDuvidasWhatsApp={() => {}}
      />
    )

    expect(screen.getByText('Mecânica Gabriel')).toBeTruthy()
    expect(screen.getByText('ABC-1234')).toBeTruthy()
    expect(screen.getByText('Honda Civic 2.0')).toBeTruthy()
    expect(screen.getByText('Aguardando sua autorização')).toBeTruthy()
  })

  it('renderiza AprovacaoOrcamentoTab com seções de Peças, Serviços e totais calculados', () => {
    const itens = [
      { itemId: 'p1', categoria: 'peca', nome: 'Pastilha', subtotal: 180, quantidade: 1, classificacao: 'essencial' },
      { itemId: 's1', categoria: 'servico', nome: 'Mão de Obra', subtotal: 120, quantidade: 1, classificacao: 'essencial' },
    ]
    const totais = {
      subTotalPecas: 180,
      subTotalServicos: 120,
      subTotalTerceiros: 0,
      totalGeral: 300,
      valorPixComDesconto: 285,
      valorParcelado10x: '30,00',
    }

    render(
      <AprovacaoOrcamentoTab
        totais={totais}
        itensAprovaveis={itens}
        respostasLocais={{ p1: 'aprovado', s1: 'aprovado' }}
        estaAprovado={false}
        onToggleItem={() => {}}
        onVerFoto={() => {}}
      />
    )

    expect(screen.getByText('Peças e Componentes de Reposição')).toBeTruthy()
    expect(screen.getByText('Serviços Mecânicos e Mão de Obra')).toBeTruthy()
    expect(screen.getByText('R$ 300.00')).toBeTruthy()
    expect(screen.getByText('R$ 285.00')).toBeTruthy()
  })
})
