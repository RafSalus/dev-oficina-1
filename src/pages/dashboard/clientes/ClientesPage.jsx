import React from 'react'
import { ClienteModalForm } from '../../../components/clientes/ClienteModalForm'
import { ClienteFrotaModal } from '../../../components/clientes/ClienteFrotaModal'
import { ModalConfirmacao } from '../../../components/ModalConfirmacao'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { useClientesWorkflow } from '../../../hooks/useClientesWorkflow'
import { MobileClientesPage } from './mobile/MobileClientesPage'
import { ClientesHeader } from './components/ClientesHeader'
import { TabelaClientes } from './components/TabelaClientes'

/**
 * Página de Gestão de Clientes e Frotistas (ADR-003 / NFR17).
 * Orquestrador desktop decomposto em Container-Presenter.
 */
export function ClientesPage() {
  const isMobile = useIsMobile()
  const workflow = useClientesWorkflow()

  if (isMobile) {
    return <MobileClientesPage />
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <ClientesHeader workflow={workflow} />

      <TabelaClientes workflow={workflow} />

      {/* Modal de Cadastro e Edição */}
      <ClienteModalForm
        isOpen={workflow.modalAberto}
        onClose={workflow.fecharModal}
        onSalvar={workflow.salvarCliente}
        clienteParaEditar={workflow.clienteEmEdicao}
      />

      {/* Modal de Visualização da Frota de Veículos */}
      <ClienteFrotaModal
        isOpen={Boolean(workflow.clienteFrotaModal)}
        onClose={workflow.fecharFrota}
        cliente={workflow.clienteFrotaModal}
        onEditarCliente={(cli) => {
          workflow.fecharFrota()
          workflow.abrirEditar(cli)
        }}
      />

      {/* Diálogo de Confirmação de Exclusão */}
      <ModalConfirmacao
        isOpen={Boolean(workflow.clienteParaExcluir)}
        onClose={workflow.cancelarExclusao}
        onConfirm={workflow.confirmarExclusao}
        titulo="Excluir este cliente?"
        descricao="Esta operação removerá permanentemente o cliente e todos os vínculos cadastrados."
        itemDestaque={
          workflow.clienteParaExcluir
            ? `Cliente: ${workflow.clienteParaExcluir.nome}`
            : ''
        }
        textoConfirmar="Sim, Excluir"
        textoCancelar="Cancelar"
        variante="perigo"
      />
    </div>
  )
}
