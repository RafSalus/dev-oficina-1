import React from 'react'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { useEstacionadosWorkflow } from '../../../hooks/useEstacionadosWorkflow'
import { MobileEstacionadosPage } from './mobile/MobileEstacionadosPage'
import { EstacionadosHeader } from './components/EstacionadosHeader'
import { TabelaEstacionados } from './components/TabelaEstacionados'
import { ModalHistoricoManutencao } from '../../../components/estacionados/ModalHistoricoManutencao'
import { ModalVincularCliente } from '../../../components/estacionados/ModalVincularCliente'
import { ModalEstacionarVeiculo } from '../../../components/estacionados/ModalEstacionarVeiculo'
import { ModalEditarEstacionado } from '../../../components/estacionados/ModalEditarEstacionado'

export function EstacionadosPage() {
  const isMobile = useIsMobile()
  const workflow = useEstacionadosWorkflow()

  if (isMobile) {
    return <MobileEstacionadosPage />
  }

  const {
    busca,
    setBusca,
    filtroSituacao,
    setFiltroSituacao,
    filtroMarca,
    setFiltroMarca,
    opcoesMarcas,
    metricas,
    estacionadosFiltrados,
    temFiltroAtivo,
    handleLimparFiltros,
    modalEstacionarAberto,
    setModalEstacionarAberto,
    modalHistoricoAberto,
    setModalHistoricoAberto,
    modalVincularAberto,
    setModalVincularAberto,
    modalEditarAberto,
    setModalEditarAberto,
    veiculoSelecionado,
    handleAbrirEstacionar,
    handleAbrirHistorico,
    handleAbrirVincular,
    handleAbrirEditar,
    handleExcluir,
    recarregarEstacionados,
  } = workflow

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <EstacionadosHeader
        metricas={metricas}
        busca={busca}
        setBusca={setBusca}
        filtroSituacao={filtroSituacao}
        setFiltroSituacao={setFiltroSituacao}
        filtroMarca={filtroMarca}
        setFiltroMarca={setFiltroMarca}
        opcoesMarcas={opcoesMarcas}
        temFiltroAtivo={temFiltroAtivo}
        onLimparFiltros={handleLimparFiltros}
        onAbrirEstacionar={handleAbrirEstacionar}
      />

      <TabelaEstacionados
        estacionados={estacionadosFiltrados}
        temFiltroAtivo={temFiltroAtivo}
        onLimparFiltros={handleLimparFiltros}
        onAbrirEstacionar={handleAbrirEstacionar}
        onAbrirHistorico={handleAbrirHistorico}
        onAbrirVincular={handleAbrirVincular}
        onAbrirEditar={handleAbrirEditar}
        onExcluir={handleExcluir}
      />

      <ModalHistoricoManutencao
        isOpen={modalHistoricoAberto}
        onClose={() => setModalHistoricoAberto(false)}
        veiculo={veiculoSelecionado}
      />

      <ModalVincularCliente
        isOpen={modalVincularAberto}
        onClose={() => setModalVincularAberto(false)}
        veiculo={veiculoSelecionado}
        onVinculoConcluido={recarregarEstacionados}
      />

      <ModalEstacionarVeiculo
        isOpen={modalEstacionarAberto}
        onClose={() => setModalEstacionarAberto(false)}
        veiculoInicial={veiculoSelecionado}
        onEstacionadoConcluido={recarregarEstacionados}
      />

      <ModalEditarEstacionado
        isOpen={modalEditarAberto}
        onClose={() => setModalEditarAberto(false)}
        veiculo={veiculoSelecionado}
        onEdicaoConcluida={recarregarEstacionados}
      />
    </div>
  )
}
