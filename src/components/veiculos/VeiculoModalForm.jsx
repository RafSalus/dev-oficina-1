import React from 'react'
import { Car, FloppyDisk, Notebook } from '@phosphor-icons/react'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { useVeiculoModalWorkflow } from '../../hooks/useVeiculoModalWorkflow'
import { SecaoClienteProprietario } from './form/SecaoClienteProprietario'
import { SecaoIdentificacaoVeiculo } from './form/SecaoIdentificacaoVeiculo'
import { SecaoEspecificacoesFipe } from './form/SecaoEspecificacoesFipe'

/**
 * Modal de cadastro e edição de veículo da frota (ADR-003 / NFR17).
 * Consulta técnica FIPE integrada e vínculo com o cliente proprietário.
 */
export function VeiculoModalForm({
  isOpen,
  onClose,
  onSalvar,
  veiculoParaEditar,
  clientePredefinidoId,
}) {
  const workflow = useVeiculoModalWorkflow({
    isOpen,
    onClose,
    onSalvar,
    veiculoParaEditar,
    clientePredefinidoId,
  })

  const { formData, alterar, salvar } = workflow

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      titulo={veiculoParaEditar ? 'Editar Veículo da Frota' : 'Novo Cadastro de Veículo'}
      subtitulo="Consulta técnica FIPE integrada e vínculo com o cliente proprietário"
      icone={Car}
      badge="Frota Oficial"
      larguraPadrao={860}
      alturaPadrao={680}
      larguraMinima={600}
      alturaMinima={460}
      larguraMaxima={1200}
      alturaMaxima={880}
      storageKey="veiculo_modal_dimensoes"
    >
      <form onSubmit={salvar} className="space-y-5">
        <SecaoClienteProprietario workflow={workflow} />

        <SecaoIdentificacaoVeiculo workflow={workflow} />

        <SecaoEspecificacoesFipe workflow={workflow} />

        {/* Observações e Histórico de Manutenções */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <Notebook size={16} className="text-sky-600" />
            <span>Observações Técnicas e Histórico do Veículo</span>
          </div>
          <textarea
            value={formData.observacoes}
            onChange={(e) => alterar('observacoes', e.target.value)}
            rows={2}
            placeholder="Avarias prévias na lataria, tipo de óleo recomendado, preferências de manutenção..."
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none text-slate-900"
          />
        </div>

        {/* Rodapé com botão único de confirmação (Regra 12) */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-md text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <FloppyDisk size={16} weight="bold" />
            <span>{veiculoParaEditar ? 'Salvar Alterações' : 'Cadastrar Veículo'}</span>
          </button>
        </div>
      </form>
    </ModalRedimensionavel>
  )
}
