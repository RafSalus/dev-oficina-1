/**
 * Repositório assíncrono de Veículos Estacionados (Pátio) — Story 2.11 / ADR-005.
 * Gravação por linha com ID gerado pelo banco, preservação de histórico e RLS FR25.
 */

import { getSupabaseDataClient } from '../lib/supabase'
import { executarRepositorio, executarOperacao } from './supabaseHelpers'
import { ErroRepositorio, CODIGOS_ERRO } from './erroRepositorio'
import {
  mapearVeiculoEstacionadoParaDominio,
  mapearVeiculoEstacionadoParaDb,
} from './mapeadores/veiculosEstacionados'
import {
  carregarVeiculosEstacionados as carregarVeiculosEstacionadosLocal,
  estacionarVeiculo as estacionarVeiculoLocal,
  vincularVeiculoEstacionadoAoCliente as vincularVeiculoEstacionadoAoClienteLocal,
  atualizarVeiculoEstacionado as atualizarVeiculoEstacionadoLocal,
  excluirVeiculoEstacionado as excluirVeiculoEstacionadoLocal,
  obterHistoricoCompletoVeiculo,
} from '../constants/mockVeiculosEstacionados'
import * as clientesRepository from './clientesRepository'
import * as veiculosRepository from './veiculosRepository'

export { obterHistoricoCompletoVeiculo }

export async function carregarVeiculosEstacionados() {
  return executarRepositorio({
    contexto: { entidade: 'veiculos_estacionados', operacao: 'carregar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase.from('veiculos_estacionados').select('*').order('created_at', { ascending: false }),
        { entidade: 'veiculos_estacionados', operacao: 'carregar' }
      )
      return (data || []).map(mapearVeiculoEstacionadoParaDominio)
    },
    local: () => carregarVeiculosEstacionadosLocal(),
  })
}

export async function obterVeiculoEstacionadoPorId(id) {
  if (!id) return Promise.resolve(null)

  return executarRepositorio({
    contexto: { entidade: 'veiculos_estacionados', operacao: 'obterPorId' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase.from('veiculos_estacionados').select('*').eq('id', id).maybeSingle(),
        { entidade: 'veiculos_estacionados', operacao: 'obterPorId' }
      )
      return data ? mapearVeiculoEstacionadoParaDominio(data) : null
    },
    local: () => {
      const lista = carregarVeiculosEstacionadosLocal()
      return lista.find((v) => String(v.id) === String(id)) || null
    },
  })
}

export async function estacionarVeiculo({ veiculo, dadosVenda }) {
  return executarRepositorio({
    contexto: { entidade: 'veiculos_estacionados', operacao: 'estacionar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const placaFormatada = String(veiculo.placa || '').toUpperCase().trim()
      const historicoAcumulado = obterHistoricoCompletoVeiculo(placaFormatada, veiculo)

      const payload = mapearVeiculoEstacionadoParaDb({
        veiculoId: veiculo.id || null,
        placa: placaFormatada,
        codigoVeiculo: veiculo.codigoVeiculo || '',
        marca: veiculo.marca || (veiculo.marcaModelo ? veiculo.marcaModelo.split(' ')[0] : ''),
        modelo: veiculo.modelo || (veiculo.marcaModelo ? veiculo.marcaModelo.split(' ').slice(1).join(' ') : ''),
        marcaModelo: veiculo.marcaModelo || `${veiculo.marca || ''} ${veiculo.modelo || ''}`.trim(),
        ano: veiculo.ano || '',
        cor: veiculo.cor || '',
        combustivel: veiculo.combustivel || 'FLEX',
        kmAtual: dadosVenda.kmNaVenda || veiculo.kmPadrao || veiculo.km || '',
        chassi: veiculo.chassi || '',
        renavam: veiculo.renavam || '',
        dataEstacionamento: dadosVenda.dataVenda || new Date().toLocaleDateString('pt-BR'),
        motivoVenda: dadosVenda.motivoVenda || 'Cliente vendeu o veículo e novo proprietário ainda não é cliente da oficina',
        antigoClienteId: veiculo.clienteId || null,
        antigoClienteNome: veiculo.clienteNome || 'Cliente anterior',
        antigoClienteTelefone: veiculo.clienteTelefone || '',
        antigoClienteDocumento: veiculo.clienteDocumento || '',
        novoDonoNome: dadosVenda.novoDonoNome || '',
        novoDonoTelefone: dadosVenda.novoDonoTelefone || '',
        novoDonoDocumento: dadosVenda.novoDonoDocumento || '',
        novoDonoEmail: dadosVenda.novoDonoEmail || '',
        observacoes: dadosVenda.observacoes || '',
        historicoManutencoes: historicoAcumulado,
      })

      delete payload.id

      const data = await executarOperacao(
        supabase.from('veiculos_estacionados').insert(payload).select().single(),
        { entidade: 'veiculos_estacionados', operacao: 'estacionar' }
      )

      const ident = veiculo.id || veiculo.value || veiculo.placa
      if (ident) {
        await veiculosRepository.excluirVeiculo(ident).catch((err) => {
          console.warn('Aviso ao desvincular da frota ativa:', err)
        })
      }

      return mapearVeiculoEstacionadoParaDominio(data)
    },
    local: () => estacionarVeiculoLocal({ veiculo, dadosVenda }),
  })
}

export async function vincularVeiculoEstacionadoAoCliente({
  veiculoEstacionadoId,
  clienteDestinoId = null,
  novoClienteData = null,
}) {
  return executarRepositorio({
    contexto: { entidade: 'veiculos_estacionados', operacao: 'vincularCliente' },
    remoto: async () => {
      const estacionado = await obterVeiculoEstacionadoPorId(veiculoEstacionadoId)
      if (!estacionado) {
        throw new ErroRepositorio(
          CODIGOS_ERRO.REFERENCIA_INVALIDA,
          'Veículo estacionado não encontrado.',
          { contexto: { entidade: 'veiculos_estacionados', operacao: 'vincularCliente' } }
        )
      }

      let idDoClienteDestino = clienteDestinoId
      let nomeDoClienteDestino = ''

      if (novoClienteData) {
        const salvoCliente = await clientesRepository.salvarCliente({
          ...novoClienteData,
          tipoPessoa: novoClienteData.tipoPessoa || 'F',
          nome: novoClienteData.nome.trim(),
        })
        idDoClienteDestino = salvoCliente.id
        nomeDoClienteDestino = salvoCliente.nome
      } else {
        const cli = await clientesRepository.obterClientePorId(idDoClienteDestino)
        if (cli) {
          nomeDoClienteDestino = cli.nome
        }
      }

      const veiculoParaFrota = {
        codigoVeiculo: estacionado.codigoVeiculo || '',
        placa: estacionado.placa,
        marca: estacionado.marca,
        modelo: estacionado.modelo,
        marcaModelo: estacionado.marcaModelo,
        ano: estacionado.ano,
        cor: estacionado.cor,
        combustivel: estacionado.combustivel,
        kmPadrao: estacionado.kmAtual,
        chassi: estacionado.chassi,
        renavam: estacionado.renavam,
        ativo: true,
        clienteId: idDoClienteDestino,
        historicoManutencoes: estacionado.historicoManutencoes || [],
      }

      const salvoVeiculo = await veiculosRepository.salvarVeiculo(veiculoParaFrota)

      await excluirVeiculoEstacionado(veiculoEstacionadoId)

      return {
        clienteId: idDoClienteDestino,
        clienteNome: nomeDoClienteDestino,
        veiculo: salvoVeiculo,
      }
    },
    local: () =>
      vincularVeiculoEstacionadoAoClienteLocal({
        veiculoEstacionadoId,
        clienteDestinoId,
        novoClienteData,
      }),
  })
}

export async function atualizarVeiculoEstacionado(idOuObjeto, dados = null, updatedAtLido = null) {
  const id = typeof idOuObjeto === 'object' ? idOuObjeto.id : idOuObjeto
  const payloadDados = typeof idOuObjeto === 'object' ? idOuObjeto : (dados || {})
  const updatedAt = typeof idOuObjeto === 'object' ? (idOuObjeto.updatedAt || updatedAtLido) : updatedAtLido

  return executarRepositorio({
    contexto: { entidade: 'veiculos_estacionados', operacao: 'atualizar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const payload = mapearVeiculoEstacionadoParaDb({ ...payloadDados, id })

      let query = supabase.from('veiculos_estacionados').update(payload).eq('id', id)
      if (updatedAt) {
        query = query.eq('updated_at', updatedAt)
      }

      const { data, error } = await query.select()
      if (error) throw error
      if (!data || data.length === 0) {
        throw new ErroRepositorio(
          CODIGOS_ERRO.CONFLITO_EDICAO,
          'Registro foi modificado concorrentemente ou não existe mais.',
          { contexto: { entidade: 'veiculos_estacionados', operacao: 'atualizar' } }
        )
      }
      return mapearVeiculoEstacionadoParaDominio(data[0])
    },
    local: () => atualizarVeiculoEstacionadoLocal({ ...payloadDados, id }),
  })
}

export async function excluirVeiculoEstacionado(id) {
  return executarRepositorio({
    contexto: { entidade: 'veiculos_estacionados', operacao: 'excluir' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      await executarOperacao(
        supabase.from('veiculos_estacionados').delete().eq('id', id),
        { entidade: 'veiculos_estacionados', operacao: 'excluir' }
      )
      return true
    },
    local: () => {
      excluirVeiculoEstacionadoLocal(id)
      return true
    },
  })
}
