import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  podeTransicionarPara,
  motivoBloqueioTransicao,
} from '../../src/pages/dashboard/orcamento/statusTransicao'
import {
  STATUS_ORCAMENTO,
  STATUS_PERMITE_FATURAMENTO,
  assumirOrdemSemMecanico,
  adicionarItemNaOrdem,
  salvarOrdensAbertas,
} from '../../src/pages/dashboard/orcamento/mockOrdensAbertas'
import { ITENS_CHECKLIST_ENTRADA, salvarAssinaturaVistoria } from '../../src/constants/checklistItems'

describe('Story 1.4: Testes de Regressão da Máquina de Estados e Cálculos da OS', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('AC3: Integridade da Lista STATUS_ORCAMENTO e Faturamento', () => {
    it('deve manter rigorosamente "em_diagnostico" no índice 1 como fallback padrão (CR2)', () => {
      expect(STATUS_ORCAMENTO[1].value).toBe('em_diagnostico')
      expect(STATUS_ORCAMENTO[1].label).toBe('Em Diagnóstico')
    })

    it('deve conter todos os 8 status canônicos na ordem esperada pelo sistema', () => {
      const valores = STATUS_ORCAMENTO.map((s) => s.value)
      expect(valores).toEqual([
        'todos',
        'em_diagnostico',
        'aguardando_pecas',
        'aguardando_aprovacao',
        'aprovado_execucao',
        'pronto_retirada',
        'fila',
        'terceirizado',
      ])
    })

    it('STATUS_PERMITE_FATURAMENTO deve permitir faturamento exclusivamente em execução e retirada', () => {
      expect(STATUS_PERMITE_FATURAMENTO).toEqual(['aprovado_execucao', 'pronto_retirada'])
      expect(STATUS_PERMITE_FATURAMENTO.includes('aguardando_aprovacao')).toBe(false)
      expect(STATUS_PERMITE_FATURAMENTO.includes('fila')).toBe(false)
      expect(STATUS_PERMITE_FATURAMENTO.includes('em_diagnostico')).toBe(false)
    })
  })

  describe('AC1: Função podeTransicionarPara (Transições e Saltos Proibidos)', () => {
    it('deve permitir transição válida para a próxima etapa (passo à frente)', () => {
      expect(podeTransicionarPara('fila', 'em_diagnostico')).toBe(true)
      expect(podeTransicionarPara('em_diagnostico', 'aguardando_pecas')).toBe(true)
      expect(podeTransicionarPara('aguardando_pecas', 'terceirizado')).toBe(true)
      expect(podeTransicionarPara('terceirizado', 'aguardando_aprovacao')).toBe(true)
      expect(podeTransicionarPara('aguardando_aprovacao', 'aprovado_execucao')).toBe(true)
      expect(podeTransicionarPara('aprovado_execucao', 'pronto_retirada')).toBe(true)
    })

    it('deve permitir retorno válido para a etapa imediatamente anterior (passo atrás)', () => {
      expect(podeTransicionarPara('em_diagnostico', 'fila')).toBe(true)
      expect(podeTransicionarPara('aguardando_pecas', 'em_diagnostico')).toBe(true)
      expect(podeTransicionarPara('pronto_retirada', 'aprovado_execucao')).toBe(true)
    })

    it('deve proibir saltos diretos entre etapas não adjacentes', () => {
      // Salto de 2 ou mais etapas para a frente
      expect(podeTransicionarPara('fila', 'aguardando_pecas')).toBe(false)
      expect(podeTransicionarPara('fila', 'pronto_retirada')).toBe(false)
      expect(podeTransicionarPara('em_diagnostico', 'aprovado_execucao')).toBe(false)
      // Salto de 2 ou mais etapas para trás
      expect(podeTransicionarPara('pronto_retirada', 'fila')).toBe(false)
      expect(podeTransicionarPara('aprovado_execucao', 'em_diagnostico')).toBe(false)
    })

    it('deve rejeitar transição para o mesmo status', () => {
      expect(podeTransicionarPara('fila', 'fila')).toBe(false)
      expect(podeTransicionarPara('em_diagnostico', 'em_diagnostico')).toBe(false)
    })

    it('deve rejeitar status desconhecidos ou inválidos', () => {
      expect(podeTransicionarPara('inexistente', 'fila')).toBe(false)
      expect(podeTransicionarPara('fila', 'invalido')).toBe(false)
      expect(podeTransicionarPara(null, undefined)).toBe(false)
    })
  })

  describe('AC2: Função motivoBloqueioTransicao e Gates Condicionais', () => {
    it('deve bloquear avanço para "em_diagnostico" se não houver mecânico atribuído', () => {
      const os = { numeroOS: '100', mecanicoNome: null, mecanicoId: null }
      const motivo = motivoBloqueioTransicao(os, 'em_diagnostico')
      expect(motivo).toMatch(/mecânico responsável/)
    })

    it('deve bloquear avanço para "em_diagnostico" se a vistoria de entrada estiver incompleta', () => {
      const os = {
        numeroOS: '100',
        mecanicoNome: 'Carlos Eduardo',
        checklistEntrada: {}, // Vazio
      }
      const motivo = motivoBloqueioTransicao(os, 'em_diagnostico')
      expect(motivo).toMatch(/Vistoria de Entrada/)
    })

    it('deve bloquear avanço para "em_diagnostico" se a vistoria não estiver assinada pelo cliente', () => {
      const checklistPreenchido = {}
      ITENS_CHECKLIST_ENTRADA.forEach((it) => {
        checklistPreenchido[it.id] = { status: 'conforme' }
      })
      const os = {
        numeroOS: '100',
        mecanicoNome: 'Carlos Eduardo',
        checklistEntrada: checklistPreenchido,
      }
      // Sem assinatura salva
      const motivo = motivoBloqueioTransicao(os, 'em_diagnostico')
      expect(motivo).toMatch(/ainda não foi aprovada \(assinada\) pelo cliente/)
    })

    it('deve liberar transição para "em_diagnostico" quando mecânico, vistoria completa e assinatura existirem', () => {
      const checklistPreenchido = {}
      ITENS_CHECKLIST_ENTRADA.forEach((it) => {
        checklistPreenchido[it.id] = { status: 'conforme' }
      })
      salvarAssinaturaVistoria('100', { data: '2026-09-21', cliente: 'Edgar' })

      const os = {
        numeroOS: '100',
        mecanicoNome: 'Carlos Eduardo',
        checklistEntrada: checklistPreenchido,
      }
      const motivo = motivoBloqueioTransicao(os, 'em_diagnostico')
      expect(motivo).toBeNull()
    })

    it('deve bloquear avanço a partir de "aprovado_execucao" se houver item adicional de segurança pendente', () => {
      const os = {
        numeroOS: '100',
        status: 'aprovado_execucao',
        itensAdicionaisOS: [
          {
            id: 'adit-1',
            classificacao: 'seguranca',
            status: 'pendente_cliente',
            descricao: 'Pastilha de freio gasta até o metal',
          },
        ],
      }
      const motivo = motivoBloqueioTransicao(os, 'pronto_retirada')
      expect(motivo).toMatch(/Pastilha de freio gasta até o metal/)
    })

    it('não deve bloquear avanço se item adicional de segurança já foi aprovado ou recusado', () => {
      const os = {
        numeroOS: '100',
        status: 'aprovado_execucao',
        itensAdicionaisOS: [
          {
            id: 'adit-1',
            classificacao: 'seguranca',
            status: 'aprovado',
            descricao: 'Pastilha trocada',
          },
        ],
      }
      const motivo = motivoBloqueioTransicao(os, 'pronto_retirada')
      expect(motivo).toBeNull()
    })

    it('não deve bloquear avanço se item adicional pendente for apenas opcional', () => {
      const os = {
        numeroOS: '100',
        status: 'aprovado_execucao',
        itensAdicionaisOS: [
          {
            id: 'adit-2',
            classificacao: 'opcional',
            status: 'pendente_cliente',
            descricao: 'Palheta do limpador traseiro',
          },
        ],
      }
      const motivo = motivoBloqueioTransicao(os, 'pronto_retirada')
      expect(motivo).toBeNull()
    })

    it('deve retornar null para transições regulares sem bloqueios', () => {
      const os = { numeroOS: '100', status: 'aguardando_pecas' }
      expect(motivoBloqueioTransicao(os, 'terceirizado')).toBeNull()
    })
  })

  describe('AC4: Cálculos Matemáticos e Recálculo da OS', () => {
    it('deve calcular corretamente a inserção de peças com quantidade decimal e descontos', () => {
      const osInicial = {
        numeroOS: 'OS-CALC-1',
        status: 'em_diagnostico',
        pecasOS: [],
        servicosOS: [],
        terceirosOS: [],
        descontoGeralOS: '0.00',
        totalPecas: 0,
        totalServicos: 0,
        totalTerceiros: 0,
        valorTotal: 0,
      }
      salvarOrdensAbertas([osInicial])

      // Inserir peça: 3.5 litros de óleo a R$ 45.50 cada com R$ 5.00 de desconto
      const itemPeca = {
        codigo: 'OLEO-5W30',
        nome: 'Óleo Sintético 5W30',
        quantidade: 3.5,
        precoUnitario: 45.5,
        desconto: 5.0,
      }
      const atualizada = adicionarItemNaOrdem('OS-CALC-1', 'peca', itemPeca)

      // 3.5 * 45.50 = 159.25 - 5.00 = 154.25
      expect(atualizada.totalPecas).toBeCloseTo(154.25, 2)
      expect(atualizada.valorTotal).toBeCloseTo(154.25, 2)
    })

    it('deve calcular corretamente a soma mista de peças, serviços e terceiros com desconto geral', () => {
      const osInicial = {
        numeroOS: 'OS-CALC-2',
        status: 'em_diagnostico',
        pecasOS: [{ precoUnitario: 100, quantidade: 2, desconto: 10 }], // 190.00
        servicosOS: [{ precoUnitario: 150, quantidade: 1, desconto: 0 }], // 150.00
        terceirosOS: [],
        descontoGeralOS: '40.00',
      }
      salvarOrdensAbertas([osInicial])

      // Adicionar serviço de terceiro de R$ 80.00
      const itemTerceiro = {
        valorVenda: 80.0,
        quantidade: 1,
        desconto: 0,
      }
      const atualizada = adicionarItemNaOrdem('OS-CALC-2', 'terceiro', itemTerceiro)

      // Peças (190) + Serviços (150) + Terceiro (80) - Desconto (40) = 380.00
      expect(atualizada.totalPecas).toBe(190)
      expect(atualizada.totalServicos).toBe(150)
      expect(atualizada.totalTerceiros).toBe(80)
      expect(atualizada.valorTotal).toBe(380)
    })

    it('deve garantir que valorTotal nunca seja negativo mesmo se o desconto for maior que o subtotal', () => {
      const osInicial = {
        numeroOS: 'OS-CALC-3',
        status: 'em_diagnostico',
        pecasOS: [],
        servicosOS: [{ precoUnitario: 50, quantidade: 1, desconto: 0 }], // 50.00
        terceirosOS: [],
        descontoGeralOS: '200.00', // Desconto maior que o total
      }
      salvarOrdensAbertas([osInicial])

      const atualizada = adicionarItemNaOrdem('OS-CALC-3', 'servico', {
        precoUnitario: 10,
        quantidade: 1,
        desconto: 0,
      })
      // Subtotal = 60, Desconto = 200 -> Math.max(0, 60 - 200) = 0
      expect(atualizada.valorTotal).toBe(0)
    })
  })

  describe('AC5: Função assumirOrdemSemMecanico ("Puxar OS")', () => {
    it('deve retornar erro ao tentar assumir OS inexistente', () => {
      salvarOrdensAbertas([])
      const res = assumirOrdemSemMecanico('999999', 'mec-1', 'Joao')
      expect(res.erro).toBe('OS não encontrada.')
    })

    it('deve permitir atribuição com sucesso quando a OS não tem mecânico', () => {
      const osSemMec = {
        numeroOS: 'OS-101',
        mecanicoId: null,
        mecanicoNome: 'Não atribuído',
        status: 'fila',
      }
      salvarOrdensAbertas([osSemMec])

      const res = assumirOrdemSemMecanico('OS-101', 'mec-1', 'Lucas Mecânico')
      expect(res.erro).toBeUndefined()
      expect(res.os.mecanicoId).toBe('mec-1')
      expect(res.os.mecanicoNome).toBe('Lucas Mecânico')
    })

    it('deve rejeitar atribuição se a OS já estiver com outro mecânico atribuído', () => {
      const osComMec = {
        numeroOS: 'OS-102',
        mecanicoId: 'mec-2',
        mecanicoNome: 'Carlos Eduardo',
        status: 'em_diagnostico',
      }
      salvarOrdensAbertas([osComMec])

      const res = assumirOrdemSemMecanico('OS-102', 'mec-1', 'Lucas Mecânico')
      expect(res.erro).toBe('Esta OS já está atribuída a Carlos Eduardo.')
    })
  })
})
