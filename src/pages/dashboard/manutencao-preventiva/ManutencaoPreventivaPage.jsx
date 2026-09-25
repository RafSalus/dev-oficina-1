import React from 'react'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { usePreventivaWorkflow } from '../../../hooks/usePreventivaWorkflow'
import { MobileManutencaoPreventivaPage } from './mobile/MobileManutencaoPreventivaPage'
import { PreventivaHeader } from './components/PreventivaHeader'
import { AbaSaudeFrota } from './components/AbaSaudeFrota'
import { AbaCampanhasOportunidades } from './components/AbaCampanhasOportunidades'
import { AbaRetornosGarantia } from './components/AbaRetornosGarantia'
import { ModalFichaSaudeVeiculo } from '../../../components/manutencao-preventiva/ModalFichaSaudeVeiculo'
import { ModalAtualizarKmVeiculo } from '../../../components/manutencao-preventiva/ModalAtualizarKmVeiculo'

export function ManutencaoPreventivaPage() {
  const isMobile = useIsMobile()
  const workflow = usePreventivaWorkflow()

  if (isMobile) {
    return <MobileManutencaoPreventivaPage />
  }

  const {
    metricas,
    abaAtiva,
    setAbaAtiva,
    busca,
    setBusca,
    filtroStatus,
    setFiltroStatus,
    filtroServico,
    setFiltroServico,
    opcoesServicos,
    veiculosFiltrados,
    veiculosAvaliados,
    modalFichaAberto,
    setModalFichaAberto,
    modalAtualizarKmAberto,
    setModalAtualizarKmAberto,
    saudeSelecionada,
    veiculoParaAtualizar,
    recarregarDados,
    handleGerarOrdemServico,
    handleEnviarWhatsAppCliente,
    handleAbrirFicha,
    handleAbrirAtualizarKm,
  } = workflow

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] overflow-hidden">
      <PreventivaHeader
        metricas={metricas}
        abaAtiva={abaAtiva}
        setAbaAtiva={setAbaAtiva}
        busca={busca}
        setBusca={setBusca}
        filtroStatus={filtroStatus}
        setFiltroStatus={setFiltroStatus}
        filtroServico={filtroServico}
        setFiltroServico={setFiltroServico}
        opcoesServicos={opcoesServicos}
      />

      <div className="flex-1 min-h-0 p-6 overflow-hidden flex flex-col">
        {abaAtiva === 'campanhas' ? (
          <AbaCampanhasOportunidades
            veiculosAvaliados={veiculosAvaliados}
            setFiltroServico={setFiltroServico}
            setAbaAtiva={setAbaAtiva}
          />
        ) : abaAtiva === 'garantias' ? (
          <AbaRetornosGarantia
            veiculosAvaliados={veiculosAvaliados}
            onEnviarWhatsApp={handleEnviarWhatsAppCliente}
            onAbrirFicha={handleAbrirFicha}
            onGerarOrdemServico={handleGerarOrdemServico}
          />
        ) : (
          <AbaSaudeFrota
            veiculosFiltrados={veiculosFiltrados}
            onAtualizarKm={handleAbrirAtualizarKm}
            onAbrirFicha={handleAbrirFicha}
            onGerarOrdemServico={handleGerarOrdemServico}
            onEnviarWhatsApp={handleEnviarWhatsAppCliente}
          />
        )}
      </div>

      <ModalFichaSaudeVeiculo
        isOpen={modalFichaAberto}
        onClose={() => setModalFichaAberto(false)}
        saudeVeiculo={saudeSelecionada}
        onAtualizarKm={handleAbrirAtualizarKm}
        onGerarOrdemServico={handleGerarOrdemServico}
      />

      <ModalAtualizarKmVeiculo
        isOpen={modalAtualizarKmAberto}
        onClose={() => setModalAtualizarKmAberto(false)}
        veiculo={veiculoParaAtualizar}
        onAtualizado={recarregarDados}
      />
    </div>
  )
}
