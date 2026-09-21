import {
  ITENS_CHECKLIST_ENTRADA,
  checklistCompleto,
  carregarAssinaturaVistoria,
} from '../constants/checklistItems'

// A secretária pode colocar uma OS na Fila sem a Vistoria de Entrada preenchida (ela pode
// ficar pendente até esse ponto), mas para avançar para Diagnóstico ela precisa estar
// completa e aprovada (assinada digitalmente) pelo cliente — além de ter mecânico atribuído.
// Retorna o motivo do bloqueio (para exibir ao usuário) ou null quando pode avançar.
export function motivoImpedimentoDiagnostico(dados) {
  if (!(dados?.mecanicoId || dados?.mecanicoNome)) {
    return 'Atribua um mecânico responsável a esta OS antes de mover para Diagnóstico.'
  }
  if (!checklistCompleto(dados?.checklistEntrada, ITENS_CHECKLIST_ENTRADA)) {
    return 'Finalize todos os itens da Vistoria de Entrada antes de mover para Diagnóstico.'
  }
  if (!carregarAssinaturaVistoria(dados?.numeroOS)) {
    return 'A Vistoria de Entrada ainda não foi aprovada (assinada) pelo cliente.'
  }
  return null
}

export function podeIniciarDiagnostico(dados) {
  return motivoImpedimentoDiagnostico(dados) === null
}

// Gate de bloqueio ortogonal ao status (não é uma etapa nova do Kanban, é uma trava condicional
// sobre "Aprovado e Em Execução"): item de segurança ainda sem resposta do cliente impede a OS
// de avançar. Itens opcionais pendentes nunca bloqueiam — ficam só como aviso.
export function motivoImpedimentoAvancoPorItemAdicional(dados) {
  const pendenteSeguranca = (dados?.itensAdicionaisOS || []).find(
    (it) => it.classificacao === 'seguranca' && it.status === 'pendente_cliente'
  )
  if (pendenteSeguranca) {
    return `Existe um item de segurança ("${pendenteSeguranca.descricao}") aguardando aprovação do cliente antes de continuar.`
  }
  return null
}
