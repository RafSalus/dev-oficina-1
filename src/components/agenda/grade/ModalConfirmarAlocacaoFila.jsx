import React from 'react'
import { PaperPlaneTilt, ShieldCheck, CheckCircle } from '@phosphor-icons/react'
import { ModalRedimensionavel } from '../../suprimentos/ModalRedimensionavel'

function LinhaDetalhe({ rotulo, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{rotulo}</span>
      {children}
    </div>
  )
}

/** Confirmação rápida: aloca o 1º cliente da fila no slot, sem digitação. */
export function ModalConfirmarAlocacaoFila({ alocacao, mecanicoNome, onCancelar, onConfirmar }) {
  if (!alocacao) return null
  const { cliente, diaObj, horario } = alocacao

  return (
    <ModalRedimensionavel
      isOpen={!!alocacao}
      onClose={onCancelar}
      titulo="Confirmar Envio e Preenchimento Automático"
      larguraPadrao={540}
      alturaPadrao={420}
      larguraMinima={460}
      alturaMinima={360}
      larguraMaxima={800}
      alturaMaxima={600}
      storageKey="modal_confirmar_alocacao_fila"
    >
      <div className="flex flex-col h-full bg-white text-slate-800 p-5 justify-between">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-sky-50 border border-sky-200 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-[#0284c7] text-white flex items-center justify-center shrink-0">
              <PaperPlaneTilt size={20} weight="bold" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-sky-950 uppercase">Alocar 1º Cliente da Fila Automaticamente</h4>
              <p className="text-xs text-sky-800 mt-0.5">
                O slot da grade será preenchido automaticamente com os dados do cliente, sem necessidade de digitação.
              </p>
            </div>
          </div>

          {/* Detalhes do Cliente e Horário */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs">
            <LinhaDetalhe rotulo="Cliente (1º da Fila):">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                {cliente.prioridade === 'GARANTIA' && <ShieldCheck size={14} weight="bold" className="text-slate-900" />}
                {cliente.clienteNome}
              </span>
            </LinhaDetalhe>

            <LinhaDetalhe rotulo="Veículo / Placa:">
              <span className="font-semibold text-slate-800">
                {cliente.veiculoModelo} ({cliente.veiculoPlaca || 'Sem placa'})
              </span>
            </LinhaDetalhe>

            <LinhaDetalhe rotulo="Mecânico:">
              <span className="font-bold text-[#0284c7]">{mecanicoNome}</span>
            </LinhaDetalhe>

            <LinhaDetalhe rotulo="Dia e Horário:">
              <span className="font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                {diaObj?.nome}, às {horario}h
              </span>
            </LinhaDetalhe>

            <div className="pt-1 border-t border-slate-200 text-slate-600 italic">Motivo: "{cliente.motivo}"</div>
          </div>
        </div>

        {/* Ações */}
        <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
          <button type="button" onClick={onCancelar} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800">
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            className="px-4 py-2 bg-[#0284c7] hover:bg-sky-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CheckCircle size={16} weight="bold" />
            <span>Confirmar e Preencher Slot</span>
          </button>
        </div>
      </div>
    </ModalRedimensionavel>
  )
}
