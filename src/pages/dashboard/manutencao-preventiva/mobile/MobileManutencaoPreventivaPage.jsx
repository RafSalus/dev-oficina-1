import React from 'react'
import { usePreventivaWorkflow } from '../../../../hooks/usePreventivaWorkflow'
import { MobilePreventivaHeader } from './components/MobilePreventivaHeader'
import { MobileAbaCampanhas } from './components/MobileAbaCampanhas'
import { MobileAbaFrota } from './components/MobileAbaFrota'
import { ModalFichaSaudeVeiculo } from '../../../../components/manutencao-preventiva/ModalFichaSaudeVeiculo'
import { ModalAtualizarKmVeiculo } from '../../../../components/manutencao-preventiva/ModalAtualizarKmVeiculo'

export function MobileManutencaoPreventivaPage() {
  const {
    metricas,
    abaAtiva,
    setAbaAtiva,
    busca,
    setBusca,
    veiculosAvaliados,
    veiculosFiltradosMobile,
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
  } = usePreventivaWorkflow()

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <MobilePreventivaHeader
        metricas={metricas}
        abaAtiva={abaAtiva}
        setAbaAtiva={setAbaAtiva}
        busca={busca}
        setBusca={setBusca}
      />

      <div className="flex-1 p-3 overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-h-0 space-y-3">
        {abaAtiva === 'campanhas' ? (
          <MobileAbaCampanhas veiculosAvaliados={veiculosAvaliados} />
        ) : (
          <MobileAbaFrota
            veiculos={veiculosFiltradosMobile}
            onDetalhes={handleAbrirFicha}
            onAtualizarKm={handleAbrirAtualizarKm}
            onCriarOS={handleGerarOrdemServico}
            onWhatsApp={handleEnviarWhatsAppCliente}
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
