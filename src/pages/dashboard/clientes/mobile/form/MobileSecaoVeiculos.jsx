import React, { useState } from 'react'
import { Car, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { MobileFormularioInclusaoVeiculo } from './MobileFormularioInclusaoVeiculo'

export function MobileSecaoVeiculos({
  veiculos,
  onAdicionarVeiculo,
  onRemoverVeiculo,
}) {
  const [adicionandoVeiculo, setAdicionandoVeiculo] = useState(false)

  const handleConfirmar = (veiculoItem) => {
    onAdicionarVeiculo(veiculoItem)
    setAdicionandoVeiculo(false)
    toast.success('Veículo incluído com sucesso!')
  }

  return (
    <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
          <Car size={14} weight="bold" className="text-[#0284c7]" />
          Veículos ({veiculos.length})
        </h3>
        {!adicionandoVeiculo && (
          <button
            type="button"
            onClick={() => setAdicionandoVeiculo(true)}
            className="text-[10.5px] font-bold text-[#0284c7] cursor-pointer"
          >
            + Incluir Veículo
          </button>
        )}
      </div>

      {adicionandoVeiculo && (
        <MobileFormularioInclusaoVeiculo
          veiculos={veiculos}
          onConfirmar={handleConfirmar}
          onCancelar={() => setAdicionandoVeiculo(false)}
        />
      )}

      {veiculos.length === 0 ? (
        <p className="text-xs text-[#98a2b3] italic text-center py-3">
          Nenhum veículo vinculado ainda.
        </p>
      ) : (
        <div className="space-y-2">
          {veiculos.map((v, index) => (
            <div
              key={v.value || v.placa || index}
              className="flex items-center justify-between gap-2 p-3 bg-[#f8fafc] border border-[#e4e7ec] rounded-xl"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[10.5px] px-1.5 py-0.5 rounded bg-white border border-[#e4e7ec] text-[#101828]">
                    {v.placa}
                  </span>
                  <span className="text-xs font-bold text-[#101828] truncate">
                    {v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim()}
                  </span>
                </div>
                <p className="text-[10.5px] text-[#667085] mt-0.5">
                  {v.ano || '—'} • {v.cor || '—'} • {v.combustivel || 'FLEX'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemoverVeiculo(index)}
                className="p-1.5 text-[#98a2b3] active:text-rose-600 shrink-0 cursor-pointer"
              >
                <Trash size={15} weight="bold" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
