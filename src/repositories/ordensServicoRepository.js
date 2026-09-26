/**
 * Repositório central de Ordens de Serviço — Story 2.14 / ADR-002 / ADR-005.
 * Unificação de abertas e finalizadas em tabela única, persistência Supabase e fail-closed.
 */

import { executarRepositorio, isModoRemoto } from './supabaseHelpers'
import {
  STORAGE_KEY_ORDENS,
  STORAGE_KEY_ORCAMENTOS,
  STORAGE_KEY_FINALIZADAS,
  obterOrdensAbertas,
  salvarOrdensAbertas,
  obterOrdensFinalizadas,
  salvarOrdensFinalizadas,
  assumirOrdemSemMecanico as assumirOrdemSemMecanicoLocal,
  atualizarStatusOrdem as atualizarStatusOrdemLocal,
  atualizarChecklistSaida,
  adicionarItemNaOrdem,
  atualizarPecasAposCotacao,
  registrarAprovacaoItens,
  adicionarItemAdicional,
  responderItemAdicional,
  atualizarFotoPecaOrdem,
  excluirOrdem,
  gerarProximoNumeroOS,
  adicionarOuAtualizarOrdem as adicionarOuAtualizarOrdemLocal,
  finalizarEArquivarOrdem as finalizarEArquivarOrdemLocal,
  reabrirOrdemFinalizada as reabrirOrdemFinalizadaLocal,
} from './ordensServicoLocal'
import {
  carregarOrdensServicoRemoto,
  obterOrdemServicoPorIdRemoto,
  salvarOrdemServicoRemoto,
  transicionarStatusOSRemoto,
  vincularMecanicoOSRemoto,
  aplicarPecaNaOSRemoto,
  devolverPecaDaOSRemoto,
} from './ordensServicoSupabase'

export { SEED_ORDENS_ABERTAS } from './seeds/seedOrdensAbertas'
export { SEED_ORDENS_FINALIZADAS } from './seeds/seedOrdensFinalizadas'

export {
  motivoImpedimentoDiagnostico,
  podeIniciarDiagnostico,
  motivoImpedimentoAvancoPorItemAdicional,
} from '../utils/osTransicaoValidation'

export {
  STORAGE_KEY_ORDENS,
  STORAGE_KEY_ORCAMENTOS,
  STORAGE_KEY_FINALIZADAS,
  obterOrdensAbertas,
  salvarOrdensAbertas,
  obterOrdensFinalizadas,
  salvarOrdensFinalizadas,
  atualizarChecklistSaida,
  adicionarItemNaOrdem,
  atualizarPecasAposCotacao,
  registrarAprovacaoItens,
  adicionarItemAdicional,
  responderItemAdicional,
  atualizarFotoPecaOrdem,
  excluirOrdem,
  gerarProximoNumeroOS,
}

export const STATUS_ORCAMENTO = [
  { value: 'todos', label: 'Todos os Status', color: 'zinc' },
  { value: 'em_diagnostico', label: 'Em Diagnóstico', color: 'slate', badgeBg: 'bg-[#f2f4f7]', badgeText: 'text-[#344054]', border: 'border-[#d0d5dd]' },
  { value: 'aguardando_pecas', label: 'Aguardando Peças', color: 'amber', badgeBg: 'bg-amber-50', badgeText: 'text-amber-800', border: 'border-amber-200' },
  { value: 'aguardando_aprovacao', label: 'Aguardando Aprovação', color: 'sky', badgeBg: 'bg-[#e0f2fe]', badgeText: 'text-[#0369a1]', border: 'border-[#bae6fd]' },
  { value: 'aprovado_execucao', label: 'Aprovado e Em Execução', color: 'navy', badgeBg: 'bg-[#101828]', badgeText: 'text-white', border: 'border-[#101828]' },
  { value: 'pronto_retirada', label: 'Pronto para Retirada', color: 'blue', badgeBg: 'bg-[#0284c7]', badgeText: 'text-white', border: 'border-[#0284c7]' },
  { value: 'fila', label: 'Na Fila', color: 'zinc', badgeBg: 'bg-zinc-100', badgeText: 'text-zinc-700', border: 'border-zinc-200' },
  { value: 'terceirizado', label: 'Terceirizado', color: 'violet', badgeBg: 'bg-violet-50', badgeText: 'text-violet-700', border: 'border-violet-200' },
]

export const STATUS_PERMITE_FATURAMENTO = ['aprovado_execucao', 'pronto_retirada']

export const PRIORIDADE_OPTIONS = [
  { value: 'todas', label: 'Todas as Prioridades' },
  { value: 'normal', label: 'Normal' },
  { value: 'urgente', label: 'Urgente' },
  { value: 'retorno', label: 'Retorno e Garantia' },
]

export function assumirOrdemSemMecanico(numeroOS, mecanicoId, mecanicoNome) {
  const res = assumirOrdemSemMecanicoLocal(numeroOS, mecanicoId, mecanicoNome)
  if (res && !res.erro && isModoRemoto()) {
    vincularMecanicoOSRemoto(numeroOS, mecanicoId, mecanicoNome).catch((err) => {
      console.error('Erro ao vincular mecânico no Supabase:', err)
    })
  }
  return res
}

export function atualizarStatusOrdem(numeroOS, novoStatus) {
  const osAtualizada = atualizarStatusOrdemLocal(numeroOS, novoStatus)
  if (osAtualizada && isModoRemoto()) {
    transicionarStatusOSRemoto(numeroOS, novoStatus).catch((err) => {
      console.error('Erro ao transicionar status no Supabase:', err)
    })
  }
  return osAtualizada
}

export function adicionarOuAtualizarOrdem(osData) {
  const salva = adicionarOuAtualizarOrdemLocal(osData)
  if (isModoRemoto()) {
    salvarOrdemServicoRemoto(salva).catch((err) => {
      console.error('Erro ao salvar OS remota no Supabase:', err)
    })
  }
  return salva
}

export const salvarOrdemAberta = adicionarOuAtualizarOrdem

export function finalizarEArquivarOrdem(numeroOS, dadosComplementares = {}) {
  const finalizada = finalizarEArquivarOrdemLocal(numeroOS, dadosComplementares)
  if (finalizada && isModoRemoto()) {
    salvarOrdemServicoRemoto(finalizada).catch((err) => {
      console.error('Erro ao finalizar OS no Supabase:', err)
    })
  }
  return finalizada
}

export function reabrirOrdemFinalizada(numeroOS) {
  const reaberta = reabrirOrdemFinalizadaLocal(numeroOS)
  if (reaberta && isModoRemoto()) {
    salvarOrdemServicoRemoto(reaberta).catch((err) => {
      console.error('Erro ao reabrir OS no Supabase:', err)
    })
  }
  return reaberta
}

// ==============================================================================
// Interface Assíncrona do Repositório (Story 2.14 / ADR-002 §3.2)
// ==============================================================================

export async function carregarOrdensServico({ filtro = 'todas' } = {}) {
  return executarRepositorio({
    contexto: { entidade: 'ordens_servico', operacao: 'carregar', filtro },
    remoto: () => carregarOrdensServicoRemoto({ filtro }),
    local: () => {
      if (filtro === 'abertas') return obterOrdensAbertas()
      if (filtro === 'finalizadas') return obterOrdensFinalizadas()
      return [...obterOrdensAbertas(), ...obterOrdensFinalizadas()]
    },
  })
}

export async function obterOrdemServicoPorId(idOuNumeroOS) {
  return executarRepositorio({
    contexto: { entidade: 'ordens_servico', operacao: 'obterPorId', idOuNumeroOS },
    remoto: () => obterOrdemServicoPorIdRemoto(idOuNumeroOS),
    local: () => {
      const todas = [...obterOrdensAbertas(), ...obterOrdensFinalizadas()]
      return todas.find((o) => String(o.id) === String(idOuNumeroOS) || String(o.numeroOS) === String(idOuNumeroOS)) || null
    },
  })
}

export async function salvarOrdemServico(osData) {
  return executarRepositorio({
    contexto: { entidade: 'ordens_servico', operacao: 'salvar', numeroOS: osData.numeroOS },
    remoto: () => salvarOrdemServicoRemoto(osData),
    local: () => adicionarOuAtualizarOrdemLocal(osData),
  })
}

export async function transicionarStatusOS(osIdOuNumero, novoStatus, updatedAt = null) {
  return executarRepositorio({
    contexto: { entidade: 'ordens_servico', operacao: 'transicionarStatus', osIdOuNumero, novoStatus },
    remoto: () => transicionarStatusOSRemoto(osIdOuNumero, novoStatus, updatedAt),
    local: () => atualizarStatusOrdemLocal(osIdOuNumero, novoStatus),
  })
}

export async function vincularMecanicoOS(osIdOuNumero, mecanicoId, mecanicoNome, updatedAt = null) {
  return executarRepositorio({
    contexto: { entidade: 'ordens_servico', operacao: 'vincularMecanico', osIdOuNumero, mecanicoId },
    remoto: () => vincularMecanicoOSRemoto(osIdOuNumero, mecanicoId, mecanicoNome, updatedAt),
    local: () => assumirOrdemSemMecanicoLocal(osIdOuNumero, mecanicoId, mecanicoNome),
  })
}

export async function aplicarPecaNaOS(osId, itemId, pecaId, quantidade) {
  return executarRepositorio({
    contexto: { entidade: 'ordens_servico', operacao: 'aplicarPecaNaOS', osId, pecaId },
    remoto: () => aplicarPecaNaOSRemoto(osId, itemId, pecaId, quantidade),
    local: () => ({ sucesso: true, osId, itemId, pecaId, quantidade }),
  })
}

export async function devolverPecaDaOS(osId, itemId, pecaId, quantidade) {
  return executarRepositorio({
    contexto: { entidade: 'ordens_servico', operacao: 'devolverPecaDaOS', osId, pecaId },
    remoto: () => devolverPecaDaOSRemoto(osId, itemId, pecaId, quantidade),
    local: () => ({ sucesso: true, osId, itemId, pecaId, quantidade }),
  })
}
