import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { toast } from 'sonner'
import { OrcamentoOSListPage } from '../../src/pages/dashboard/orcamento/OrcamentoOSListPage'
import { obterOrdensAbertas } from '../../src/pages/dashboard/orcamento/mockOrdensAbertas'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))

const OS_APROVACAO = {
  numeroOS: '000301',
  status: 'aguardando_aprovacao',
  prioridade: 'normal',
  cliente: 'Carla Mendes',
  telefone: '(43) 99999-1111',
  placa: 'QWE1R23',
  marcaModelo: 'Toyota Corolla',
  ano: '2019',
  km: '60000',
  mecanicoNome: 'Carlos',
  relatoCliente: 'Barulho na suspensão',
  dataEntrada: '20/09/2026',
  horaEntrada: '08:30',
  valorTotal: 850,
  totalPecas: 600,
  totalServicos: 250,
  pecasOS: [{ id: 'p1', codigo: 'AMT-1', nome: 'Amortecedor', quantidade: 2, precoUnitario: 300 }],
  servicosOS: [{ id: 's1', codigo: 'SRV-1', nome: 'Troca de Amortecedor', quantidade: 1, precoUnitario: 250 }],
  terceirosOS: [],
}

const OS_FILA = {
  numeroOS: '000302',
  status: 'fila',
  prioridade: 'urgente',
  cliente: 'Bruno Alves',
  telefone: '',
  placa: 'ASD4F56',
  marcaModelo: 'Fiat Uno',
  ano: '2012',
  km: '',
  relatoCliente: 'Não liga',
  dataEntrada: '24/09/2026',
  horaEntrada: '07:10',
  valorTotal: 0,
  pecasOS: [],
  servicosOS: [],
  terceirosOS: [],
}

const OS_EXECUCAO = {
  ...OS_FILA,
  numeroOS: '000303',
  status: 'aprovado_execucao',
  prioridade: 'normal',
  cliente: 'Diego Rocha',
  placa: 'ZXC7V89',
  itensAdicionaisOS: [],
}

const OS_ARQUIVADA = {
  ...OS_APROVACAO,
  numeroOS: '000250',
  status: 'finalizada',
  cliente: 'Eva Prado',
  dataFinalizacao: '10/09/2026',
  notaFiscal: 'NFS-e 998',
}

function renderizar() {
  return render(
    <MemoryRouter initialEntries={['/gestao/orcamentos']}>
      <OrcamentoOSListPage />
    </MemoryRouter>
  )
}

const linhaDaOS = (numero) => screen.getByText(`#${numero}`).closest('div.grid')

describe('OrcamentoOSListPage e PainelDetalhesOS decompostos (Story 2.0 / Task 3)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    window.open = vi.fn()
    localStorage.setItem('dev_oficina_ordens_servico', JSON.stringify([OS_APROVACAO, OS_FILA, OS_EXECUCAO]))
    localStorage.setItem('dev_oficina_ordens_finalizadas', JSON.stringify([OS_ARQUIVADA]))
  })

  it('lista as OS abertas com prioridade, status e total', () => {
    renderizar()
    expect(linhaDaOS('000301')).toBeTruthy()
    expect(within(linhaDaOS('000302')).getByText('Urgente')).toBeTruthy()
    expect(within(linhaDaOS('000301')).getByText('R$ 850,00')).toBeTruthy()
    expect(screen.getByText('(R$ 850,00)')).toBeTruthy()
  })

  it('filtra pelo card de etapa e pela busca', () => {
    renderizar()
    fireEvent.click(screen.getByTitle('Clique para filtrar ordens na Fila de Espera'))
    expect(screen.queryByText('#000301')).toBeNull()
    expect(screen.getByText('#000302')).toBeTruthy()
    expect(toast.info).toHaveBeenCalledWith('Filtrando ordens Na Fila de Espera.')

    fireEvent.click(screen.getByTitle('Clique para ver todas as ordens abertas'))
    fireEvent.change(screen.getByPlaceholderText('Buscar placa, cliente, nº OS...'), { target: { value: 'corolla' } })
    expect(screen.getByText('#000301')).toBeTruthy()
    expect(screen.queryByText('#000302')).toBeNull()
  })

  it('mostra o arquivo de OS finalizadas', () => {
    renderizar()
    fireEvent.click(screen.getByText('Arquivos'))
    expect(screen.getByText('#000250')).toBeTruthy()
    expect(screen.getByText('NFS-e 998')).toBeTruthy()
    expect(screen.getByText('OS no Arquivo')).toBeTruthy()
  })

  it('abre o painel na aba da etapa e aprova o orçamento manualmente', () => {
    renderizar()
    fireEvent.click(linhaDaOS('000301'))
    fireEvent.click(screen.getByText('Aprovação do Cliente'))
    fireEvent.click(screen.getByText('Cliente já aprovou (telefone/presencial) — Aprovar Agora'))
    fireEvent.click(screen.getByText('Sim, Aprovar Agora'))

    const os = obterOrdensAbertas().find((o) => o.numeroOS === '000301')
    expect(os.status).toBe('aprovado_execucao')
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Orçamento #000301 aprovado'))
  })

  it('mantém o formulário de item adicional ao trocar de aba e notifica o cliente', () => {
    renderizar()
    fireEvent.click(linhaDaOS('000303'))
    fireEvent.click(screen.getByText('Execução'))
    fireEvent.change(screen.getByPlaceholderText('Ex: Coxim do motor trincado durante a desmontagem'), {
      target: { value: 'Correia trincada' },
    })
    fireEvent.click(screen.getByText('Resumo e Valores'))
    fireEvent.click(screen.getByText('Execução'))
    expect(screen.getByDisplayValue('Correia trincada')).toBeTruthy()

    fireEvent.click(screen.getByText('Reportar e Notificar Cliente'))
    const os = obterOrdensAbertas().find((o) => o.numeroOS === '000303')
    expect(os.itensAdicionaisOS[0]).toMatchObject({ descricao: 'Correia trincada', classificacao: 'seguranca' })
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('api.whatsapp.com/send?text='), '_blank')
  })

  it('OS na fila mostra só as abas fixas e o seletor de status', () => {
    renderizar()
    fireEvent.click(linhaDaOS('000302'))
    expect(screen.getByText('Alterar Status:')).toBeTruthy()
    expect(screen.getByText('Vistoria e Diagnóstico')).toBeTruthy()
    expect(screen.queryByText('Execução')).toBeNull()
  })
})
