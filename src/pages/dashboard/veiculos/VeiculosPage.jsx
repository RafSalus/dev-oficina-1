import React from 'react'
import { VeiculoModalForm } from '../../../components/veiculos/VeiculoModalForm'
import { ModalEstacionarVeiculo } from '../../../components/estacionados/ModalEstacionarVeiculo'
import { ModalConfirmacao } from '../../../components/ModalConfirmacao'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { useVeiculosWorkflow } from '../../../hooks/useVeiculosWorkflow'
import { MobileVeiculosPage } from './mobile/MobileVeiculosPage'
import { VeiculosHeader } from './components/VeiculosHeader'
import { TabelaVeiculos } from './components/TabelaVeiculos'

/**
 * Página de Gestão da Frota de Veículos (ADR-003 / NFR17).
 * Orquestrador desktop decomposto em Container-Presenter.
 */
export function VeiculosPage() {
  const isMobile = useIsMobile()
  const workflow = useVeiculosWorkflow()

  if (isMobile) {
    return <MobileVeiculosPage />
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <VeiculosHeader workflow={workflow} />

      <TabelaVeiculos workflow={workflow} />

      {/* Modal de Cadastro e Edição de Veículo */}
      <VeiculoModalForm
        isOpen={workflow.modalAberto}
        onClose={workflow.fecharModal}
        onSalvar={workflow.salvarVeiculo}
        veiculoParaEditar={workflow.veiculoEmEdicao}
      />

      {/* Modal para Estacionar Veículo Vendido */}
      <ModalEstacionarVeiculo
        isOpen={workflow.modalEstacionarAberto}
        onClose={workflow.fecharEstacionar}
        veiculoInicial={workflow.veiculoParaEstacionar}
        onEstacionadoConcluido={workflow.recarregarFrota}
      />

      {/* Diálogo de Confirmação de Exclusão */}
      <ModalConfirmacao
        isOpen={Boolean(workflow.veiculoParaExcluir)}
        onClose={workflow.cancelarExclusao}
        onConfirm={workflow.confirmarExclusao}
        titulo="Remover este veículo da frota?"
        descricao="Esta operação removerá o veículo da listagem da frota cadastrada."
        itemDestaque={
          workflow.veiculoParaExcluir
            ? `Placa: ${workflow.veiculoParaExcluir.placa} ${
                workflow.veiculoParaExcluir.marcaModelo
                  ? `(${workflow.veiculoParaExcluir.marcaModelo})`
                  : ''
              }`
            : ''
        }
        textoConfirmar="Sim, Remover"
        textoCancelar="Cancelar"
        variante="perigo"
      />
    </div>
  )
}
