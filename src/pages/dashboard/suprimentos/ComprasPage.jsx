import React from 'react'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { useComprasWorkflow } from '../../../hooks/useComprasWorkflow'
import { ComprasHeader } from '../../../components/suprimentos/compras/ComprasHeader'
import { ComprasIndicadores } from '../../../components/suprimentos/compras/ComprasIndicadores'
import { ComprasAbasNav } from '../../../components/suprimentos/compras/ComprasAbasNav'
import { AbaPedidosCompra } from '../../../components/suprimentos/compras/AbaPedidosCompra'
import { AbaCotacoesPecas } from '../../../components/suprimentos/compras/AbaCotacoesPecas'
import { AbaDemandasOS } from '../../../components/suprimentos/compras/AbaDemandasOS'
import { AbaReposicaoAlmoxarifado } from '../../../components/suprimentos/compras/AbaReposicaoAlmoxarifado'
import { ComprasModais } from '../../../components/suprimentos/compras/ComprasModais'
import { MobileComprasPage } from './mobile/MobileComprasPage'

/**
 * Tela desktop de Compras e Cotações: orquestra cabeçalho, abas e modais.
 * Toda a regra de negócio vive em `useComprasWorkflow` (ADR-003).
 */
function ComprasDesktop() {
  const compras = useComprasWorkflow()
  const { abaAtiva, metricas, filtros, selecao, modais, acoes } = compras

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <ComprasHeader
        totalPedidos={compras.pedidos.length}
        metricas={metricas}
        onIrPara={acoes.irPara}
        onNovoPedido={acoes.abrirNovoPedido}
        onNovaCotacao={acoes.abrirNovaCotacao}
      >
        <ComprasIndicadores metricas={metricas} />
        <ComprasAbasNav
          abaAtiva={abaAtiva}
          onSelecionar={compras.setAbaAtiva}
          metricas={metricas}
          totalPedidos={compras.pedidosFiltrados.length}
          totalCotacoes={compras.cotacoesFiltradas.length}
          totalReposicao={compras.itensReposicao.length}
        />
      </ComprasHeader>

      {abaAtiva === 'pedidos' && (
        <AbaPedidosCompra
          pedidos={compras.pedidosFiltrados}
          fornecedores={compras.fornecedores}
          filtros={filtros}
          onReceber={modais.setPedidoParaReceber}
          onCopiar={acoes.copiarPedidoWhatsApp}
          onEditar={acoes.editarPedido}
          onExcluir={modais.setPedidoParaExcluir}
        />
      )}

      {abaAtiva === 'cotacoes' && (
        <AbaCotacoesPecas
          cotacoes={compras.cotacoesFiltradas}
          filtros={filtros}
          onNovaCotacao={acoes.abrirNovaCotacao}
          onVisualizar={modais.setCotacaoParaVisualizar}
          onCopiarWhatsApp={acoes.copiarLinkCotacaoWhatsApp}
          onAbrir={acoes.editarCotacao}
          onAprovar={acoes.aprovarCotacaoDireto}
          onExcluir={modais.setCotacaoParaExcluir}
        />
      )}

      {abaAtiva === 'demandas_os' && (
        <AbaDemandasOS
          demandas={compras.demandasFiltradas}
          busca={filtros.buscaDemandas}
          onBuscar={filtros.setBuscaDemandas}
          selecao={selecao}
          onGerarCotacaoAgrupada={acoes.gerarCotacaoAgrupada}
          onCatalogar={acoes.abrirCatalogarPeca}
          onCotar={acoes.abrirCotacaoDemanda}
          onCompraDireta={acoes.compraDiretaDemanda}
        />
      )}

      {abaAtiva === 'reposicao' && (
        <AbaReposicaoAlmoxarifado
          itens={compras.itensReposicao}
          onCotar={acoes.cotarReposicao}
          onCotarTodas={acoes.cotarTodasReposicoes}
          onCompraDireta={acoes.compraDiretaReposicao}
        />
      )}

      <ComprasModais modais={modais} acoes={acoes} />
    </div>
  )
}

/**
 * Rota `/{gestao|secretaria}/compras`: versão mobile ou desktop conforme a viewport.
 */
export function ComprasPage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileComprasPage /> : <ComprasDesktop />
}
