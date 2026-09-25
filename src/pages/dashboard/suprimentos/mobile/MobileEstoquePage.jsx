import React from 'react'
import { useEstoqueWorkflow } from '../../../../hooks/useEstoqueWorkflow'
import { MobilePecaFormModal } from './MobilePecaFormModal'
import { MobileEstoqueMovimentoModal } from './MobileEstoqueMovimentoModal'
import { MobileEstoqueHeader } from './estoque/MobileEstoqueHeader'
import { MobileAbaPosicao } from './estoque/MobileAbaPosicao'
import { MobileAbaKardex } from './estoque/MobileAbaKardex'
import { MobileAbaEstoqueReposicao } from './estoque/MobileAbaEstoqueReposicao'

/**
 * MobileEstoquePage - Container mobile para gestão de estoque e almoxarifado.
 * Segue ADR-003 delegando estado e regras para `useEstoqueWorkflow`.
 */
export function MobileEstoquePage({ estoque: estoqueProp } = {}) {
  const hookEstoque = useEstoqueWorkflow()
  const estoque = estoqueProp || hookEstoque

  const {
    abaAtiva,
    setAbaAtiva,
    metricas,
    pecasFiltradas,
    itensReposicao,
    investimentoReposicao,
    movimentacoesFiltradas,
    filtros,
    modais,
    acoes,
  } = estoque

  return (
    <div className="px-4 pt-4 pb-6">
      <MobileEstoqueHeader
        metricas={metricas}
        abaAtiva={abaAtiva}
        onTrocarAba={setAbaAtiva}
        onNovoMovimento={() => acoes.abrirMovimento(null)}
      />

      {abaAtiva === 'posicao' && (
        <MobileAbaPosicao
          pecas={pecasFiltradas}
          busca={filtros.busca}
          onBuscaChange={filtros.setBusca}
          filtroCategoria={filtros.filtroCategoria}
          onCategoriaChange={filtros.selecionarCategoria}
          filtroStatus={filtros.filtroStatusEstoque}
          onStatusChange={filtros.selecionarStatus}
          onEditarPeca={acoes.abrirPeca}
          onMovimentarPeca={acoes.abrirMovimento}
          onKardexPeca={acoes.abrirKardexDaPeca}
        />
      )}

      {abaAtiva === 'kardex' && (
        <MobileAbaKardex
          movimentacoes={movimentacoesFiltradas}
          buscaKardex={filtros.buscaKardex}
          onBuscaKardexChange={filtros.setBuscaKardex}
          filtroTipoMovimento={filtros.filtroTipoMovimento}
          onTipoMovimentoChange={filtros.selecionarTipoMovimento}
        />
      )}

      {abaAtiva === 'reposicao' && (
        <MobileAbaEstoqueReposicao
          itensReposicao={itensReposicao}
          totalInvestimento={investimentoReposicao}
          onCopiarLista={acoes.copiarListaReposicao}
          onCotarTodas={acoes.cotarTodasReposicoes}
          onCotarItem={acoes.cotarReposicao}
          onEntradaItem={acoes.abrirMovimento}
        />
      )}

      <MobilePecaFormModal
        isOpen={modais.modalPecaAberto}
        onClose={modais.fecharPeca}
        onSalvar={(dados) => {
          acoes.salvarPeca(dados)
          modais.fecharPeca()
        }}
        onExcluir={(id) => {
          acoes.excluirPeca(id)
          modais.fecharPeca()
        }}
        pecaParaEditar={modais.pecaParaEditar}
      />

      <MobileEstoqueMovimentoModal
        isOpen={modais.modalMovimentoAberto}
        onClose={modais.fecharMovimento}
        pecaPreSelecionada={modais.pecaParaMovimento}
        onSucesso={acoes.recarregar}
      />
    </div>
  )
}
