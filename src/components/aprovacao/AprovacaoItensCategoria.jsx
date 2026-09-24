import React from 'react'
import { Camera, Lock } from '@phosphor-icons/react'

/**
 * Renderiza uma seção de itens aprováveis por categoria (Peças, Serviços ou Terceiros).
 * Implementa o modelo de travamento de itens essenciais e toggle de opcionais (ADR-003 / NFR17).
 *
 * @param {Object} props
 * @param {string} props.titulo - Título da seção (ex.: "Peças e Componentes")
 * @param {Array} props.itens - Lista de itens normalizados pertencentes à categoria
 * @param {Object} props.respostasLocais - Mapa de respostas { [itemId]: 'aprovado' | 'recusado' }
 * @param {boolean} props.estaAprovado - Se o orçamento já foi formalmente aprovado
 * @param {(itemId: string, classificacao: string) => void} props.onToggleItem - Callback para alternar item opcional
 * @param {(fotoUrl: string) => void} props.onVerFoto - Callback para abrir zoom de evidência
 */
export function AprovacaoItensCategoria({
  titulo,
  itens,
  respostasLocais,
  estaAprovado,
  onToggleItem,
  onVerFoto,
}) {
  if (!itens || itens.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-xs overflow-hidden">
      <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#d0d5dd] flex items-center justify-between">
        <span className="text-xs font-extrabold text-[#101828] uppercase tracking-wider">
          {titulo}
        </span>
        <span className="text-[11px] font-bold text-[#667085]">{itens.length} itens</span>
      </div>

      <div className="divide-y divide-[#eaecf0]">
        {itens.map((item) => {
          const isEssencial = item.classificacao === 'essencial'
          const isRecusado = respostasLocais[item.itemId] === 'recusado'

          return (
            <div
              key={item.itemId}
              className={`p-3.5 flex items-center justify-between gap-3 hover:bg-[#fcfcfd] transition-colors ${
                isRecusado ? 'opacity-50' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-xs font-bold text-[#101828] line-clamp-1 ${
                      isRecusado ? 'line-through text-[#98a2b3]' : ''
                    }`}
                  >
                    {item.nome}
                  </span>
                  {isEssencial ? (
                    <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-bold">
                      <Lock size={9} weight="bold" />
                      Obrigatório
                    </span>
                  ) : (
                    <span className="shrink-0 px-1.5 py-0.2 rounded-full bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] text-[9px] font-bold">
                      Opcional
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-[#667085] flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="font-mono font-semibold">{item.codigo || item.itemId}</span>
                  <span>•</span>
                  <span>Qtd: {item.quantidade}</span>
                  {item.parceiroNome && (
                    <>
                      <span>•</span>
                      <span>Parceiro: {item.parceiroNome}</span>
                    </>
                  )}
                </div>

                {item.motivo && (
                  <p className="text-[10.5px] text-[#475467] italic mt-1 leading-relaxed">
                    {item.motivo}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                <span
                  className={`text-xs font-extrabold ${
                    isRecusado ? 'text-[#98a2b3] line-through' : 'text-[#101828]'
                  }`}
                >
                  R$ {item.subtotal.toFixed(2)}
                </span>

                <div className="flex items-center gap-1.5">
                  {item.foto && (
                    <button
                      type="button"
                      onClick={() => onVerFoto(item.foto)}
                      className="text-[10px] text-[#0284c7] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      title="Ver foto da avaria"
                    >
                      <Camera size={11} weight="bold" />
                      <span>Ver Foto</span>
                    </button>
                  )}

                  {!isEssencial && !estaAprovado && (
                    <button
                      type="button"
                      onClick={() => onToggleItem(item.itemId, item.classificacao)}
                      className={`h-6 px-2 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                        isRecusado
                          ? 'bg-white border border-[#d0d5dd] text-[#667085] hover:border-[#101828]'
                          : 'bg-[#101828] text-white hover:bg-black'
                      }`}
                    >
                      {isRecusado ? 'Incluir' : 'Incluído'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
