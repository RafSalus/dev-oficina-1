import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { toast } from 'sonner'
import { ClienteServicosPage } from '../../src/pages/cliente/ClienteServicosPage'
import { AprovacaoOrcamentoClientePage } from '../../src/pages/AprovacaoOrcamentoClientePage'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))

const clienteLogado = { clienteAtivo: { value: 'cli-9', nome: 'Paula Reis' } }
vi.mock('../../src/context/ClienteContext', () => ({
  useCliente: () => clienteLogado,
}))

const OS = {
  numeroOS: '000777',
  clienteId: 'cli-9',
  cliente: 'Paula Reis',
  status: 'aguardando_aprovacao',
  placa: 'PAU1L23',
  marcaModelo: 'Honda Fit',
  pecasOS: [
    { id: 'p1', codigo: 'FRE-1', nome: 'Pastilha de Freio', quantidade: 1, precoUnitario: 200 },
    { id: 'p2', codigo: 'PAL-1', nome: 'Palheta', quantidade: 2, precoUnitario: 25 },
  ],
  servicosOS: [],
  terceirosOS: [],
  itensAprovacaoOS: [
    { itemId: 'p1', classificacao: 'essencial', motivo: 'Desgaste crítico' },
    { itemId: 'p2', classificacao: 'opcional', motivo: 'Borracha ressecada' },
  ],
  itensAdicionaisOS: [
    { id: 'ad1', descricao: 'Coxim trincado', categoria: 'peca', classificacao: 'seguranca', valorEstimado: 90, status: 'pendente_cliente' },
  ],
}

const gravarOS = () => localStorage.setItem('dev_oficina_ordens_servico', JSON.stringify([OS]))
const simularTela = (mobile) =>
  (window.matchMedia = vi.fn().mockReturnValue({ matches: mobile, addEventListener: vi.fn(), removeEventListener: vi.fn() }))

function renderPortal() {
  return render(
    <MemoryRouter>
      <ClienteServicosPage />
    </MemoryRouter>
  )
}

function renderPublica(rota) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route path="/aprovacao/:id" element={<AprovacaoOrcamentoClientePage />} />
        <Route path="/aprovacao" element={<AprovacaoOrcamentoClientePage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Portal do Cliente /cliente/servicos — página inteira (Story 2.0 / QA TEST-001)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    clienteLogado.clienteAtivo = { value: 'cli-9', nome: 'Paula Reis' }
    simularTela(false)
  })

  it('sem OS do cliente mostra o estado vazio original', () => {
    clienteLogado.clienteAtivo = { value: 'cli-sem-os', nome: 'Outro' }
    gravarOS()
    renderPortal()
    expect(screen.getByText('Nenhuma ordem de serviço em andamento')).toBeTruthy()
  })

  it('desktop embutido: sem botão Fechar e com rodapé preso ao container', () => {
    gravarOS()
    renderPortal()
    expect(screen.getByText('Pastilha de Freio')).toBeTruthy()
    expect(screen.queryByText('Fechar')).toBeNull()
    const rodape = screen.getByText('Total do Orçamento').closest('footer')
    expect(rodape.className).toContain('sticky')
    expect(rodape.className).not.toContain('fixed')
  })

  it('portal avisa ao dispensar item opcional e recalcula o total', () => {
    gravarOS()
    renderPortal()
    expect(screen.getAllByText('R$ 250.00').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByText('Incluído'))
    expect(toast.info).toHaveBeenCalledWith('Item complementar removido do seu orçamento.')
    expect(screen.getAllByText('R$ 200.00').length).toBeGreaterThan(0)
  })

  it('mobile usa o mesmo hook: lista itens e aprova com a mensagem do portal', () => {
    simularTela(true)
    gravarOS()
    renderPortal()
    expect(screen.getByText('Aprovação de Orçamento')).toBeTruthy()
    expect(screen.getByText('Palheta')).toBeTruthy()
    expect(screen.getByText('Essencial')).toBeTruthy()

    fireEvent.click(screen.getByText('Aprovar Orçamento'))
    fireEvent.click(screen.getByText('Confirmar e Autorizar'))
    expect(toast.success).toHaveBeenCalledWith(
      'Orçamento aprovado com sucesso! A oficina já foi notificada para iniciar os serviços.'
    )
    expect(JSON.parse(localStorage.getItem('dev_oficina_aprovacoes'))['000777'].responsavel).toBe('Paula Reis')
  })
})

describe('Página pública /aprovacao/:id — página inteira (Story 2.0 / QA TEST-001)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    clienteLogado.clienteAtivo = { value: 'cli-9', nome: 'Paula Reis' }
    simularTela(false)
    gravarOS()
  })

  it('renderiza a OS da rota com botão Fechar e rodapé fixo', () => {
    renderPublica('/aprovacao/000777')
    expect(screen.getByText('Pastilha de Freio')).toBeTruthy()
    expect(screen.getByText('Fechar')).toBeTruthy()
    expect(screen.getByText('Total do Orçamento').closest('footer').className).toContain('fixed')
  })

  it('dispensar opcional não gera aviso e a escolha sobrevive à resposta de item adicional', () => {
    renderPublica('/aprovacao/000777')
    fireEvent.click(screen.getByText('Incluído'))
    expect(toast.info).not.toHaveBeenCalled()
    expect(toast.success).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('Recusar'))
    expect(toast.success).toHaveBeenCalledWith('Item recusado. A oficina foi notificada.')
    // A Palheta continua dispensada depois que a OS é recarregada pela resposta
    expect(screen.getByText('Incluir')).toBeTruthy()
  })

  it('modal abre sem nome preenchido e aprova com a mensagem da página pública', () => {
    renderPublica('/aprovacao/000777')
    fireEvent.click(screen.getByText('Aprovar Orçamento'))
    const inputs = screen.getAllByRole('textbox')
    expect(inputs.some((i) => i.value === 'Paula Reis')).toBe(false)
    fireEvent.submit(inputs[0].closest('form'))
    expect(toast.success).toHaveBeenCalledWith('Orçamento aprovado com sucesso! A oficina já foi notificada.')
  })

  it('/aprovacao sem número não usa a OS do cliente logado', () => {
    renderPublica('/aprovacao')
    expect(screen.getByText('Orçamento não localizado')).toBeTruthy()
    expect(screen.queryByText('Pastilha de Freio')).toBeNull()
  })

  it('mobile: preço da linha considera o desconto e mostra a marca da peça', async () => {
    const { montarServicoMobile } = await import('../../src/utils/aprovacao/aprovacaoMobile')
    const servico = montarServicoMobile({ numeroOS: '1' }, [
      { itemId: 'x', categoria: 'peca', nome: 'Disco', marca: 'Fremax', quantidade: 2, precoUnitario: 100, subtotal: 180, classificacao: 'essencial', motivo: '' },
    ])
    expect(servico.pecas[0].preco * servico.pecas[0].quantidade).toBe(180)
    expect(servico.pecas[0].marca).toBe('Fremax')
  })
})
