import React from 'react'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { useLevaETrazWorkflow } from '../../../hooks/useLevaETrazWorkflow'
import { MobileLevaETrazPage } from './mobile/MobileLevaETrazPage'
import { LevaETrazHeader } from './components/LevaETrazHeader'
import { AbaFrotaApoio } from './components/AbaFrotaApoio'
import { TabelaDeslocamentos } from './components/TabelaDeslocamentos'
import { ModalNovoDeslocamento } from '../../../components/leva-e-traz/ModalNovoDeslocamento'
import { ModalFinalizarDeslocamento } from '../../../components/leva-e-traz/ModalFinalizarDeslocamento'
import { ModalDetalhesDeslocamento } from '../../../components/leva-e-traz/ModalDetalhesDeslocamento'
import { ModalVeiculoApoio } from '../../../components/leva-e-traz/ModalVeiculoApoio'

export function LevaETrazPage() {
  const isMobile = useIsMobile()
  const workflow = useLevaETrazWorkflow()

  if (isMobile) {
    return <MobileLevaETrazPage />
  }

  const {
    veiculosApoio,
    abaAtiva,
    setAbaAtiva,
    busca,
    setBusca,
    filtroTipo,
    setFiltroTipo,
    filtroEquipe,
    setFiltroEquipe,
    temFiltroAtivo,
    handleLimparFiltros,
    metricas,
    deslocamentosFiltrados,
    modalNovoAberto,
    setModalNovoAberto,
    modalFinalizarAberto,
    setModalFinalizarAberto,
    modalDetalhesAberto,
    setModalDetalhesAberto,
    deslocamentoSelecionado,
    modalVeiculoApoioAberto,
    setModalVeiculoApoioAberto,
    veiculoApoioEditando,
    recarregarDados,
    handleIniciarViagem,
    handleAbrirFinalizar,
    handleAbrirDetalhes,
    handleExcluir,
    handleAbrirNovo,
    handleEditarVeiculoApoio,
    handleNovoVeiculoApoio,
  } = workflow

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <LevaETrazHeader
        metricas={metricas}
        abaAtiva={abaAtiva}
        setAbaAtiva={setAbaAtiva}
        busca={busca}
        setBusca={setBusca}
        filtroTipo={filtroTipo}
        setFiltroTipo={setFiltroTipo}
        filtroEquipe={filtroEquipe}
        setFiltroEquipe={setFiltroEquipe}
        temFiltroAtivo={temFiltroAtivo}
        onLimparFiltros={handleLimparFiltros}
        onNovoDeslocamento={handleAbrirNovo}
      />

      <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
        {abaAtiva === 'frota_apoio' ? (
          <AbaFrotaApoio
            veiculosApoio={veiculosApoio}
            onNovoVeiculoApoio={handleNovoVeiculoApoio}
            onEditarVeiculoApoio={handleEditarVeiculoApoio}
          />
        ) : (
          <TabelaDeslocamentos
            deslocamentos={deslocamentosFiltrados}
            abaAtiva={abaAtiva}
            temFiltroAtivo={temFiltroAtivo}
            onLimparFiltros={handleLimparFiltros}
            onIniciarViagem={handleIniciarViagem}
            onAbrirFinalizar={handleAbrirFinalizar}
            onAbrirDetalhes={handleAbrirDetalhes}
            onExcluir={handleExcluir}
          />
        )}
      </div>

      <ModalNovoDeslocamento
        isOpen={modalNovoAberto}
        onClose={() => setModalNovoAberto(false)}
        onSalvo={recarregarDados}
      />

      <ModalFinalizarDeslocamento
        isOpen={modalFinalizarAberto}
        onClose={() => setModalFinalizarAberto(false)}
        deslocamento={deslocamentoSelecionado}
        onFinalizado={recarregarDados}
      />

      <ModalDetalhesDeslocamento
        isOpen={modalDetalhesAberto}
        onClose={() => setModalDetalhesAberto(false)}
        deslocamento={deslocamentoSelecionado}
      />

      <ModalVeiculoApoio
        isOpen={modalVeiculoApoioAberto}
        onClose={() => setModalVeiculoApoioAberto(false)}
        onSalvo={recarregarDados}
        veiculo={veiculoApoioEditando}
      />
    </div>
  )
}
