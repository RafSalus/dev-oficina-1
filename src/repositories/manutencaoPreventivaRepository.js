/**
 * Repositório assíncrono de Manutenção Preventiva — Story 2.13 / ADR-005.
 * Gravação por linha em Supabase Postgres, RPC de hodômetro e cálculo de saúde.
 */

import { getSupabaseDataClient } from '../lib/supabase'
import { executarRepositorio, executarOperacao } from './supabaseHelpers'
import { ErroRepositorio, CODIGOS_ERRO } from './erroRepositorio'
import {
  mapearManutencaoPreventivaParaDominio,
  mapearManutencaoPreventivaParaDb,
} from './mapeadores/manutencaoPreventiva'
import {
  carregarManutencoesPreventivas as carregarManutencoesPreventivasLocal,
  registrarExecucaoPreventiva as registrarExecucaoPreventivaLocal,
  atualizarHodometroVeiculo as atualizarHodometroVeiculoLocal,
  calcularSaudeVeiculo,
  ITENS_PREVENTIVOS_CATALOGO,
} from '../constants/mockManutencaoPreventiva'
import * as veiculosRepository from './veiculosRepository'
import * as veiculosEstacionadosRepository from './veiculosEstacionadosRepository'

export { calcularSaudeVeiculo, ITENS_PREVENTIVOS_CATALOGO }

/**
 * Carrega a lista de manutenções preventivas
 */
export async function carregarManutencoesPreventivas() {
  return executarRepositorio({
    contexto: { entidade: 'manutencoes_preventivas', operacao: 'carregar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase
          .from('manutencoes_preventivas')
          .select('*')
          .order('ultima_execucao_data', { ascending: false })
          .order('created_at', { ascending: false }),
        { entidade: 'manutencoes_preventivas', operacao: 'carregar' }
      )
      return (data || []).map(mapearManutencaoPreventivaParaDominio)
    },
    local: () => carregarManutencoesPreventivasLocal(),
  })
}

/**
 * Carrega veículos ativos da oficina (exclui veículos no pátio de estacionados)
 * Delega para veiculosRepository e veiculosEstacionadosRepository (AC4).
 */
export async function carregarVeiculosAtivosPreventiva() {
  const [todosVeiculos, estacionados] = await Promise.all([
    veiculosRepository.carregarVeiculos().catch(() => []),
    veiculosEstacionadosRepository.carregarVeiculosEstacionados().catch(() => []),
  ])

  const placasEstacionadas = new Set(
    (estacionados || []).map((e) => (e.placa || '').toUpperCase().trim()).filter(Boolean)
  )

  return (todosVeiculos || []).filter((v) => {
    const placa = (v.placa || '').toUpperCase().trim()
    return v.ativo !== false && !placasEstacionadas.has(placa)
  })
}

/**
 * Atualiza o hodômetro de um veículo ativo através de RPC restrita (AC6 / ADR-005 §2.13)
 */
export async function atualizarHodometroVeiculo(placa, novoKm, permitirRegressao = false) {
  if (!placa) {
    throw new ErroRepositorio(
      CODIGOS_ERRO.DADOS_INVALIDOS,
      'Placa do veículo é obrigatória para atualizar o hodômetro.'
    )
  }

  const placaLimpa = String(placa).toUpperCase().trim()
  const kmNumerico = parseInt(String(novoKm).replace(/\D/g, ''), 10)

  if (isNaN(kmNumerico) || kmNumerico < 0) {
    throw new ErroRepositorio(
      CODIGOS_ERRO.DADOS_INVALIDOS,
      'Quilometragem informada deve ser um número inteiro não negativo.'
    )
  }

  return executarRepositorio({
    contexto: { entidade: 'veiculos', operacao: 'atualizarHodometro', placa: placaLimpa },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const { data, error } = await supabase.rpc('atualizar_hodometro_veiculo', {
        placa: placaLimpa,
        novo_km: kmNumerico,
        permitir_regressao: Boolean(permitirRegressao),
      })

      if (error) {
        throw new ErroRepositorio(
          CODIGOS_ERRO.OPERACAO_INVALIDA,
          `Erro ao atualizar hodômetro via RPC: ${error.message}`,
          error
        )
      }

      return data
    },
    local: () => atualizarHodometroVeiculoLocal(placaLimpa, kmNumerico),
  })
}

/**
 * Registra a execução de um item preventivo para o veículo (AC1, AC4)
 */
export async function registrarExecucaoPreventiva(dados) {
  if (!dados || !dados.placa || !dados.itemId) {
    throw new ErroRepositorio(
      CODIGOS_ERRO.DADOS_INVALIDOS,
      'Placa e itemId são obrigatórios para registrar preventiva.'
    )
  }

  const placaLimpa = String(dados.placa).toUpperCase().trim()

  return executarRepositorio({
    contexto: { entidade: 'manutencoes_preventivas', operacao: 'registrarExecucao', placa: placaLimpa },
    remoto: async () => {
      let veiculoId = dados.veiculoId

      if (!veiculoId) {
        const veiculo = await veiculosRepository.obterVeiculoPorPlaca(placaLimpa)
        if (veiculo && veiculo.id) {
          veiculoId = veiculo.id
        }
      }

      if (!veiculoId) {
        throw new ErroRepositorio(
          CODIGOS_ERRO.NAO_ENCONTRADO,
          `Veículo de placa ${placaLimpa} não encontrado no cadastro.`
        )
      }

      const payload = mapearManutencaoPreventivaParaDb(dados, veiculoId)
      const supabase = getSupabaseDataClient()

      const data = await executarOperacao(
        supabase.from('manutencoes_preventivas').insert(payload).select().single(),
        { entidade: 'manutencoes_preventivas', operacao: 'registrarExecucao' }
      )

      const registroSalvo = mapearManutencaoPreventivaParaDominio(data)

      // Atualiza hodômetro caso solicitado e haja KM informado
      if (dados.atualizarKmVeiculo && (dados.km || dados.ultimaExecucaoKm)) {
        const kmAlvo = dados.km || dados.ultimaExecucaoKm
        await atualizarHodometroVeiculo(placaLimpa, kmAlvo).catch((err) => {
          console.warn('Aviso: Hodômetro não atualizado após preventiva:', err.message)
        })
      }

      return registroSalvo
    },
    local: () => registrarExecucaoPreventivaLocal(dados),
  })
}
