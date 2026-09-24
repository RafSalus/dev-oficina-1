import React from 'react'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { useOrdensServicoLista } from '../../../hooks/useOrdensServicoLista'
import { OSListaToolbar } from '../../../components/ordem-servico/lista/OSListaToolbar'
import { OSMetricasAbertas } from '../../../components/ordem-servico/lista/OSMetricasAbertas'
import { OSMetricasArquivo } from '../../../components/ordem-servico/lista/OSMetricasArquivo'
import { OSListaTabela } from '../../../components/ordem-servico/lista/OSListaTabela'
import { formatMoeda } from '../../../utils/ordemServico/osMensagens'
import { ModalImpressaoOS } from './ModalImpressaoOS'
import { PainelDetalhesOS } from './PainelDetalhesOS'
import { MobileOrcamentoOSListPage } from './mobile/MobileOrcamentoOSListPage'
import { ModalChecklistSaida } from './ModalChecklistSaida'
import { NovaOrdemServicoModal } from '../nova-os/NovaOrdemServicoModal'

/** Modal de abertura/edição de OS — formulário, igual aos demais cadastros do sistema. */
function ModalNovaOS({ lista }) {
  const { modais, acoes } = lista
  if (!modais.modalNovaOsAberto) return null
  return (
    <NovaOrdemServicoModal
      isOpen={modais.modalNovaOsAberto}
      dadosIniciais={modais.dadosNovaOsPreenchidos}
      onClose={modais.fecharNovaOS}
      onSalvo={acoes.recarregarListas}
    />
  )
}

/**
 * Tela de Ordens de Serviço (OS Abertas e Arquivos). Orquestra toolbar, métricas,
 * lista/Kanban, painel de detalhes e modais; a regra vive em `useOrdensServicoLista`,
 * compartilhado com a versão mobile (ADR-003 / NFR18).
 */
export function OrcamentoOSListPage() {
  const isMobile = useIsMobile()
  const lista = useOrdensServicoLista()
  const { abaAtiva, filtros, selecao, modais, acoes } = lista
  const ordemSelecionada = selecao.ordemSelecionada

  if (isMobile) {
    return (
      <>
        <MobileOrcamentoOSListPage
          abaAtiva={abaAtiva}
          setAbaAtiva={acoes.trocarAba}
          ordensAbertas={lista.ordensAbertas}
          ordensFinalizadas={lista.ordensFinalizadas}
          abertasFiltradas={lista.abertasFiltradas}
          finalizadasFiltradas={lista.finalizadasFiltradas}
          busca={filtros.busca}
          setBusca={filtros.setBusca}
          filtroStatus={filtros.filtroStatus}
          setFiltroStatus={filtros.setFiltroStatus}
          filtroPrioridade={filtros.filtroPrioridade}
          setFiltroPrioridade={filtros.setFiltroPrioridade}
          metricasAbertas={lista.metricasAbertas}
          metricasFinalizadas={lista.metricasFinalizadas}
          onAtualizarStatus={acoes.atualizarStatus}
          onFinalizarEArquivar={acoes.finalizarEArquivar}
          onReabrirOrdem={acoes.reabrirOrdem}
          onExcluirOrdem={acoes.excluir}
          onCopiarLink={acoes.copiarLink}
          onDispararWhatsApp={acoes.dispararWhatsApp}
          onAbrirNovaOS={acoes.abrirNovaOS}
          onEditarOS={acoes.editarOS}
          formatMoeda={formatMoeda}
        />
        <ModalNovaOS lista={lista} />
      </>
    )
  }

  return (
    <div className="h-full w-full flex flex-col gap-2.5 overflow-hidden select-none">
      <OSListaToolbar
        abaAtiva={abaAtiva}
        visualizacao={lista.visualizacao}
        totalAbertas={lista.ordensAbertas.length}
        totalFinalizadas={lista.ordensFinalizadas.length}
        filtros={filtros}
        onTrocarAba={acoes.trocarAba}
        onAlternarVisualizacao={acoes.alternarVisualizacao}
        onRecarregar={acoes.recarregarListas}
        onNovaOS={acoes.abrirNovaOS}
      />

      {abaAtiva === 'abertas' ? (
        <OSMetricasAbertas
          metricas={lista.metricasAbertas}
          filtroStatus={filtros.filtroStatus}
          onFiltrar={filtros.setFiltroStatus}
        />
      ) : (
        <OSMetricasArquivo metricas={lista.metricasFinalizadas} />
      )}

      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-[#d0d5dd] shadow-xs flex overflow-hidden relative">
        <OSListaTabela lista={lista} />

        {ordemSelecionada && (
          <PainelDetalhesOS
            os={ordemSelecionada}
            initialSubTab={selecao.subAbaAlvoPainel}
            isArquivada={abaAtiva === 'arquivos'}
            onClose={acoes.fecharPainel}
            onAbrirImpressao={() => acoes.abrirImpressao(ordemSelecionada)}
            onAtualizarStatus={acoes.atualizarStatus}
            onFaturarNoPDV={acoes.faturarNoPDV}
            onAdicionarItem={acoes.adicionarItem}
            onAtualizarFotoPeca={acoes.atualizarFotoPeca}
            onReabrir={acoes.reabrirOrdem}
            onExcluir={acoes.excluir}
            onAbrirCotacao={acoes.abrirCotacao}
            onReportarItemAdicional={acoes.reportarItemAdicional}
            onEditarOS={acoes.editarOS}
          />
        )}
      </div>

      <ModalImpressaoOS isOpen={modais.modalImpressaoAberta} onClose={modais.fecharImpressao} osData={modais.osParaImpressao} />

      {/* Checklist de Saída — obrigatório antes de faturar no PDV */}
      <ModalChecklistSaida
        isOpen={Boolean(modais.osParaChecklistSaida)}
        onClose={modais.fecharChecklistSaida}
        os={modais.osParaChecklistSaida}
        onConfirmar={acoes.confirmarChecklistSaida}
      />

      <ModalNovaOS lista={lista} />
    </div>
  )
}
