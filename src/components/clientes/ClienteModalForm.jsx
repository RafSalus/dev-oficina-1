import React from 'react'
import { User, FloppyDisk, Notebook } from '@phosphor-icons/react'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { ModalConfirmacao } from '../ModalConfirmacao'
import { useClienteForm } from '../../hooks/useClienteForm'
import { SecaoIdentificacaoCliente } from './form/SecaoIdentificacaoCliente'
import { SecaoContatoCliente, SecaoEnderecoCliente } from './form/SecaoContatoEnderecoCliente'
import { SecaoVeiculosCliente } from './form/SecaoVeiculosCliente'

/**
 * Modal de cadastro/edição de cliente: identificação, contato, endereço (com CEP),
 * veículos vinculados (com FIPE) e observações. Estado e regras em `useClienteForm`
 * (ADR-003). Usado em Clientes e na aba Cliente/Veículo da Nova OS.
 * @param {{isOpen: boolean, onClose: Function, onSalvar: Function, clienteParaEditar?: object}} props
 */
export function ClienteModalForm({ isOpen, onClose, onSalvar, clienteParaEditar }) {
  const cliente = useClienteForm({ isOpen, clienteParaEditar, onSalvar, onClose })
  const { form, descarte } = cliente

  return (
    <>
      <ModalRedimensionavel
        isOpen={isOpen}
        onClose={cliente.cancelar}
        titulo={clienteParaEditar ? 'Editar Cadastro de Cliente' : 'Novo Cadastro de Cliente'}
        subtitulo="Dados cadastrais completos, contato, endereço e gestão de veículos vinculados"
        icone={User}
        larguraPadrao={880}
        alturaPadrao={740}
        larguraMinima={640}
        alturaMinima={480}
        larguraMaxima={1360}
        alturaMaxima={940}
        storageKey="cliente_modal"
      >
        <form onSubmit={cliente.salvar} className="space-y-6">
          <SecaoIdentificacaoCliente cliente={cliente} />
          <SecaoContatoCliente cliente={cliente} />
          <SecaoEnderecoCliente cliente={cliente} />
          <SecaoVeiculosCliente cliente={cliente} />

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <Notebook size={16} className="text-sky-600" />
              <span>Observações e Histórico do Cliente</span>
            </div>
            <textarea
              value={form.observacoes}
              onChange={(e) => cliente.alterar('observacoes', e.target.value)}
              rows={2}
              placeholder="Preferências de contato, frotista com faturamento quinzenal, etc..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          {/* Rodapé com botão único de confirmação (Regra 12) */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={cliente.cancelar}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md shadow-sm transition-colors cursor-pointer"
            >
              <FloppyDisk size={16} />
              <span>Salvar Cliente</span>
            </button>
          </div>
        </form>
      </ModalRedimensionavel>

      {/* Confirmação de descarte na frente do formulário */}
      <ModalConfirmacao
        isOpen={descarte.confirmando}
        onClose={descarte.fechar}
        onConfirm={descarte.confirmar}
        titulo="Descartar alterações do cliente?"
        descricao="Os dados preenchidos deste cadastro não foram salvos e serão perdidos. Deseja realmente sair?"
        itemDestaque={form.nome ? `Cliente: ${form.nome}` : ''}
        textoConfirmar="Sim, Descartar"
        textoCancelar="Continuar Preenchendo"
        variante="perigo"
      />
    </>
  )
}
