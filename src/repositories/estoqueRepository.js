import {
  carregarMovimentacoesEstoque,
  salvarMovimentacoesEstoque,
} from '../constants/cadastrosSuprimentosData'
import { obterPecaPorId, salvarPeca } from './suprimentosRepository'

/**
 * Carrega a lista completa de movimentações de estoque.
 * @returns {Promise<Array>}
 */
export async function carregarMovimentacoes() {
  return Promise.resolve(carregarMovimentacoesEstoque())
}

/**
 * Registra uma movimentação de estoque (entrada, saída ou ajuste) e atualiza o saldo da peça.
 * @param {Object} mov - { pecaId, tipo: 'entrada'|'saida'|'ajuste', quantidade, motivo, documentoRef, usuario }
 * @returns {Promise<Object>}
 */
export async function registrarMovimentacao(mov) {
  const lista = carregarMovimentacoesEstoque()
  const novaMov = {
    id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    data: new Date().toISOString(),
    ...mov,
  }

  lista.unshift(novaMov)
  salvarMovimentacoesEstoque(lista)

  // Atualizar saldo físico da peça no repositório de suprimentos
  if (mov.pecaId) {
    const peca = await obterPecaPorId(mov.pecaId)
    if (peca) {
      const qtdAtual = Number(peca.estoqueAtual ?? peca.estoque) || 0
      const qtdMov = Number(mov.quantidade) || 0
      let novoSaldo = qtdAtual

      if (mov.tipo === 'entrada') {
        novoSaldo = qtdAtual + qtdMov
      } else if (mov.tipo === 'saida') {
        novoSaldo = Math.max(0, qtdAtual - qtdMov)
      } else if (mov.tipo === 'ajuste') {
        novoSaldo = qtdMov
      }

      await salvarPeca({
        ...peca,
        estoqueAtual: novoSaldo,
        estoque: novoSaldo,
      })
    }
  }

  return Promise.resolve(novaMov)
}

/**
 * Retorna o histórico de movimentações (Kardex) de uma peça específica.
 * @param {string} pecaId
 * @returns {Promise<Array>}
 */
export async function obterKardexPeca(pecaId) {
  const lista = carregarMovimentacoesEstoque()
  const filtrada = lista.filter((m) => String(m.pecaId) === String(pecaId))
  return Promise.resolve(filtrada)
}

/**
 * Retorna o saldo atual de uma peça no estoque.
 * @param {string} pecaId
 * @returns {Promise<number>}
 */
export async function obterSaldoPeca(pecaId) {
  const peca = await obterPecaPorId(pecaId)
  if (!peca) return Promise.resolve(0)
  return Promise.resolve(Number(peca.estoqueAtual ?? peca.estoque) || 0)
}
