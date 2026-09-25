import React from 'react'
import { X, Notebook, CheckCircle, Trash } from '@phosphor-icons/react'
import { textareaBaseClass } from '../../nova-os/mobile/mobileSelectStyles'
import { useVeiculoModalWorkflow } from '../../../../hooks/useVeiculoModalWorkflow'
import { MobileSecaoProprietario } from './form/MobileSecaoProprietario'
import { MobileSecaoIdentificacaoVeiculo } from './form/MobileSecaoIdentificacaoVeiculo'
import { MobileSecaoEspecificacoesFipe } from './form/MobileSecaoEspecificacoesFipe'

export function MobileVeiculoFormModal({
  isOpen,
  onClose,
  onSalvar,
  onExcluir,
  veiculoParaEditar,
  clientePredefinidoId,
}) {
  const workflow = useVeiculoModalWorkflow({
    isOpen,
    onClose,
    onSalvar,
    onExcluir,
    veiculoParaEditar,
    clientePredefinidoId,
  })

  const {
    formData,
    alterar,
    salvar,
    confirmandoExclusao,
    setConfirmandoExclusao,
    confirmarExclusao,
  } = workflow

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#eaecf0] flex flex-col">
      <header
        className="shrink-0 bg-white border-b border-[#e4e7ec]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="h-14 px-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-2.5 rounded-xl text-[#475467] active:bg-[#f2f4f7] shrink-0 cursor-pointer"
          >
            <X size={20} weight="bold" />
          </button>
          <span className="text-sm font-extrabold text-[#101828] truncate">
            {veiculoParaEditar ? 'Editar Veículo' : 'Novo Veículo'}
          </span>
          <div className="w-9 shrink-0" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-4">
        <MobileSecaoProprietario workflow={workflow} />

        <MobileSecaoIdentificacaoVeiculo workflow={workflow} />

        <MobileSecaoEspecificacoesFipe workflow={workflow} />

        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <Notebook size={14} weight="bold" className="text-[#0284c7]" />
            Observações
          </h3>
          <textarea
            rows={3}
            value={formData.observacoes}
            onChange={(e) => alterar('observacoes', e.target.value)}
            placeholder="Avarias prévias, tipo de óleo recomendado..."
            className={textareaBaseClass}
          />
        </section>

        {veiculoParaEditar && onExcluir && (
          <section>
            {confirmandoExclusao ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 flex items-center gap-2">
                <span className="flex-1 text-xs font-bold text-[#101828]">
                  Excluir este veículo?
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmandoExclusao(false)}
                  className="h-9 px-3 rounded-lg border border-[#d0d5dd] bg-white text-[#344054] text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarExclusao}
                  className="h-9 px-3 rounded-lg bg-[#b42318] text-white text-xs font-bold cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmandoExclusao(true)}
                className="w-full h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash size={15} weight="bold" />
                Excluir Veículo
              </button>
            )}
          </section>
        )}
      </main>

      <footer
        className="shrink-0 bg-white border-t border-[#e4e7ec] px-4 py-3"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)',
        }}
      >
        <button
          type="button"
          onClick={salvar}
          className="w-full h-12 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle size={18} weight="bold" />
          {veiculoParaEditar ? 'Salvar Alterações' : 'Cadastrar Veículo'}
        </button>
      </footer>
    </div>
  )
}
