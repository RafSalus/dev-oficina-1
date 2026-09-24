import React from 'react'
import { Camera, Eye } from '@phosphor-icons/react'

/**
 * Aba de Peças Danificadas com Fotos (NFR17).
 * Exibe galeria de fotos de evidência com indicação de avarias e substituições recomendadas.
 *
 * @param {Object} props
 * @param {Array} props.fotosDasPecas - Lista de fotos das peças [{ nome, fotoUrl, observacao }]
 * @param {(fotoUrl: string) => void} props.onVerFoto - Callback para zoom na foto
 */
export function AprovacaoFotosTab({ fotosDasPecas = [], onVerFoto }) {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Banner de Evidências */}
      <div className="p-3.5 bg-[#e0f2fe] border border-[#bae6fd] rounded-2xl flex items-center gap-2.5">
        <Camera size={20} weight="bold" className="text-[#0284c7] shrink-0" />
        <p className="text-xs text-[#0369a1] leading-relaxed">
          Fotos reais registradas durante a desmontagem e triagem do veículo para
          comprovação do desgaste e transparência total.
        </p>
      </div>

      {fotosDasPecas.length === 0 && (
        <div className="p-6 text-center bg-white border border-dashed border-[#d0d5dd] rounded-2xl">
          <Camera size={28} weight="light" className="mx-auto text-[#98a2b3] mb-2" />
          <p className="text-sm font-bold text-[#101828]">
            Nenhuma foto anexada a este orçamento
          </p>
          <p className="text-xs text-[#667085] mt-1">
            Fale com nosso consultor pelo WhatsApp se quiser ver evidências das peças antes
            de aprovar.
          </p>
        </div>
      )}

      {fotosDasPecas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fotosDasPecas.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#d0d5dd] shadow-xs overflow-hidden flex flex-col group"
            >
              <div
                onClick={() => onVerFoto(item.fotoUrl)}
                className="relative h-48 bg-black overflow-hidden cursor-zoom-in"
              >
                <img
                  src={item.fotoUrl}
                  alt={item.nome}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="px-3 py-1.5 rounded-xl bg-white/90 text-black text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <Eye size={14} weight="bold" />
                    <span>Ampliar Imagem</span>
                  </span>
                </div>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="text-xs font-extrabold text-[#101828] line-clamp-1">
                    {item.nome}
                  </h4>
                  <p className="text-[11px] text-[#475467] mt-1 leading-relaxed">
                    {item.observacao}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#eaecf0] flex items-center justify-between text-[10px] text-[#667085]">
                  <span className="font-bold text-[#b42318]">Substituição Recomendada</span>
                  <button
                    type="button"
                    onClick={() => onVerFoto(item.fotoUrl)}
                    className="text-[#0284c7] font-bold hover:underline cursor-pointer"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
