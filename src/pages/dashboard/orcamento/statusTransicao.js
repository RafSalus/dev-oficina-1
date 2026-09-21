import { KANBAN_COLUNAS_OS } from './kanbanColunas'
import { motivoImpedimentoDiagnostico, motivoImpedimentoAvancoPorItemAdicional } from './mockOrdensAbertas'

// Sequência real do fluxo de uma OS (mesma ordem das colunas do Kanban) — usada tanto para
// ordenar o seletor de status quanto para só permitir mover para a etapa anterior ou a
// seguinte, nunca pular direto para qualquer uma. Ponto único de verdade, compartilhado entre
// PainelDetalhesOS, MobileOsDetalhesModal, KanbanOSBoard e OrcamentoOSListPage — antes dessa
// extração, essa mesma conta de índice estava duplicada em três desses arquivos.
export const SEQUENCIA_STATUS = KANBAN_COLUNAS_OS.map((c) => c.status)

export function podeTransicionarPara(statusAtual, statusAlvo) {
  const indiceAtual = SEQUENCIA_STATUS.indexOf(statusAtual)
  const indiceAlvo = SEQUENCIA_STATUS.indexOf(statusAlvo)
  if (indiceAtual === -1 || indiceAlvo === -1) return false
  return Math.abs(indiceAlvo - indiceAtual) === 1
}

// Motivo de bloqueio (string) ou null quando a transição pode acontecer. Reúne, num só lugar,
// todos os gates condicionais de negócio que dependem do status de destino — hoje só o de
// Diagnóstico, mas é o ponto de extensão natural para novos gates (ex.: item de segurança
// pendente de aprovação do cliente bloqueando a saída de "Aprovado e Em Execução").
export function motivoBloqueioTransicao(os, statusAlvo) {
  if (statusAlvo === 'em_diagnostico') {
    return motivoImpedimentoDiagnostico(os)
  }
  // Trava condicional sobre o status atual (não sobre o destino): um item de segurança
  // reportado em execução e ainda sem resposta do cliente impede sair de "Em Execução"
  // para qualquer etapa seguinte, até o cliente responder.
  if (os?.status === 'aprovado_execucao') {
    return motivoImpedimentoAvancoPorItemAdicional(os)
  }
  return null
}
