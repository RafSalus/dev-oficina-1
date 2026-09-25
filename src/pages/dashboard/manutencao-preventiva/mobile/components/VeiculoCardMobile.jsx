import React from 'react'
import {
  User,
  WhatsappLogo,
  ClipboardText,
  Gauge,
  Eye,
} from '@phosphor-icons/react'
import { formatarTelefone } from '../../../../../utils/fiscalValidators'

export function VeiculoCardMobile({
  vSaude,
  onDetalhes,
  onAtualizarKm,
  onCriarOS,
  onWhatsApp,
}) {
  const v = vSaude.veiculo
  const foneLimpo = (v.clienteTelefone || '').replace(/\D/g, '')
  const vencidos = vSaude.itensAvaliados.filter((i) => i.status === 'vencido')
  const emAtencao = vSaude.itensAvaliados.filter((i) => i.status === 'atencao')

  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-2xs p-3.5 space-y-2.5">
      {/* Topo do Card */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-[#101828] text-white">
            {vSaude.placa}
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            {v.ano} • {v.cor}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`font-mono font-black text-xs px-2 py-0.5 rounded-full ${
              vSaude.healthScore >= 80
                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                : vSaude.healthScore >= 50
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-[#101828] text-white'
            }`}
          >
            {vSaude.healthScore}% Saúde
          </span>
        </div>
      </div>

      {/* Modelo e Proprietário */}
      <div>
        <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
          {v.marcaModelo || v.modelo}
        </h4>
        <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
          <User size={13} className="text-sky-600 shrink-0" />
          <strong className="text-slate-800 truncate">{v.clienteNome}</strong>
          {v.clienteTelefone && (
            <span className="text-slate-400 text-[11px] shrink-0">
              ({formatarTelefone(v.clienteTelefone)})
            </span>
          )}
        </div>
      </div>

      {/* KM e Status */}
      <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Hodômetro</span>
          <strong className="font-mono text-slate-900 font-extrabold">
            {v.kmPadrao || v.kmAtual || '0'} km
          </strong>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Oportunidade</span>
          <strong className="font-mono text-sky-800 font-extrabold">
            {vSaude.receitaPotencialTotal > 0
              ? `R$ ${vSaude.receitaPotencialTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
              : 'Em dia'}
          </strong>
        </div>
      </div>

      {/* Alertas Pendentes */}
      {(vencidos.length > 0 || emAtencao.length > 0 || vSaude.temGarantiaPendente) && (
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Serviços e Revisões Necessárias
          </span>
          <div className="flex flex-wrap gap-1">
            {vencidos.map((it) => (
              <span
                key={it.id}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300"
              >
                {it.nome}
              </span>
            ))}
            {emAtencao.map((it) => (
              <span
                key={it.id}
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200"
              >
                {it.nome}
              </span>
            ))}
            {vSaude.temGarantiaPendente && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                Revisão Garantia
              </span>
            )}
          </div>
        </div>
      )}

      {/* Barra de Ações Mobile (Touch-friendly 40px min - Regra 10) */}
      <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onDetalhes(vSaude)}
          className="h-9 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
        >
          <Eye size={14} />
          <span>Ficha</span>
        </button>

        <button
          type="button"
          onClick={() => onAtualizarKm(v)}
          className="h-9 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
        >
          <Gauge size={14} />
          <span>KM</span>
        </button>

        {foneLimpo ? (
          <button
            type="button"
            onClick={() => onWhatsApp(vSaude)}
            className="h-9 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
          >
            <WhatsappLogo size={14} weight="fill" />
            <span>Whats</span>
          </button>
        ) : (
          <div className="h-9 rounded-xl bg-slate-50 text-slate-300 text-xs font-bold flex items-center justify-center gap-1">
            <span>Whats</span>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            onCriarOS(v, [
              ...vencidos,
              ...emAtencao,
              ...(vSaude.temGarantiaPendente
                ? [vSaude.itensAvaliados.find((i) => i.id === 'revisao_garantia')].filter(Boolean)
                : []),
            ])
          }
          className="h-9 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
        >
          <ClipboardText size={14} weight="bold" />
          <span>Criar OS</span>
        </button>
      </div>
    </div>
  )
}
