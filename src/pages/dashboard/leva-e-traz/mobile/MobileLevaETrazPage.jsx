import React from 'react'
import { useLevaETrazWorkflow } from '../../../../hooks/useLevaETrazWorkflow'
import { MobileLevaETrazHeader } from './components/MobileLevaETrazHeader'
import { MobileListaDeslocamentos } from './components/MobileListaDeslocamentos'
import { ModalNovoDeslocamento } from '../../../../components/leva-e-traz/ModalNovoDeslocamento'
import { ModalFinalizarDeslocamento } from '../../../../components/leva-e-traz/ModalFinalizarDeslocamento'
import { ModalDetalhesDeslocamento } from '../../../../components/leva-e-traz/ModalDetalhesDeslocamento'

export function MobileLevaETrazPage() {
  const {
    metricas,
    abaAtiva,
    setAbaAtiva,
    busca,
    setBusca,
    deslocamentosFiltradosMobile,
    modalNovoAberto,
    setModalNovoAberto,
    modalFinalizarAberto,
    setModalFinalizarAberto,
    modalDetalhesAberto,
    setModalDetalhesAberto,
    deslocamentoSelecionado,
    recarregarDados,
    handleIniciarViagem,
    handleAbrirFinalizar,
    handleAbrirDetalhes,
    handleExcluir,
    handleAbrirNovo,
  } = useLevaETrazWorkflow()

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <MobileLevaETrazHeader
        metricas={metricas}
        abaAtiva={abaAtiva}
        setAbaAtiva={setAbaAtiva}
        busca={busca}
        setBusca={setBusca}
        onNovoDeslocamento={handleAbrirNovo}
      />

      <div className="flex-1 p-3 overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-h-0">
        <MobileListaDeslocamentos
          deslocamentos={deslocamentosFiltradosMobile}
          abaAtiva={abaAtiva}
          onIniciar={handleIniciarViagem}
          onFinalizar={handleAbrirFinalizar}
          onDetalhes={handleAbrirDetalhes}
          onExcluir={handleExcluir}
        />
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
    </div>
  )
}
