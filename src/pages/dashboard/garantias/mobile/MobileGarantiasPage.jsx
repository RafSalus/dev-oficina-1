import React, { useState } from 'react'
import {
  SealCheck,
  MagnifyingGlass,
  X,
  Car,
  WhatsappLogo,
  Eye,
  PlusCircle,
  WarningCircle,
  Clock,
  CheckCircle,
} from '@phosphor-icons/react'
import { formatarTelefone } from '../../../../utils/fiscalValidators'

export function MobileGarantiasPage({
  garantias,
  metricas,
  busca,
  onBuscaChange,
  filtroStatus,
  onFiltroStatusChange,
  contadores,
  onVerDetalhes,
  onAcionarGarantia,
  onNovoAcionamento,
}) {
  const tabs = [
    { id: 'TODAS', label: 'Todas', count: contadores.total },
    { id: 'ATIVA', label: 'Ativas', count: contadores.ativas },
    { id: 'A_VENCER', label: 'A Vencer', count: contadores.aVencer },
    { id: 'ACIONADA', label: 'Acionadas', count: contadores.acionadas },
    { id: 'EXPIRADA', label: 'Expiradas', count: contadores.expiradas },
  ]

  const gerarLinkWhatsapp = (item) => {
    const foneLimpo = (item.clienteTelefone || '').replace(/\D/g, '')
    const msg = encodeURIComponent(
      `Olá ${item.clienteNome}! Estamos acompanhando a garantia do seu veículo ${item.veiculo} (OS ${item.numeroOS}). Qualquer necessidade, conte conosco!`
    )
    return `https://wa.me/55${foneLimpo}?text=${msg}`
  }

  return (
    <div className="p-3 space-y-3 pb-8">
      {/* Top Banner Mobile */}
      <div className="bg-white rounded-xl p-3 border border-zinc-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <SealCheck size={22} weight="duotone" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-zinc-900 leading-tight">Garantias</h1>
            <p className="text-[10px] text-zinc-500">{contadores.ativas} vigentes • {contadores.acionadas} acionadas</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNovoAcionamento}
          className="px-2.5 py-1.5 bg-rose-600 active:bg-rose-700 text-white text-[11px] font-bold rounded-lg shadow-xs flex items-center gap-1"
        >
          <PlusCircle size={14} weight="bold" />
          <span>Acionar</span>
        </button>
      </div>

      {/* Mini KPIs em Grid 2x2 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white p-2.5 rounded-xl border border-emerald-500/20 shadow-xs">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">Ativas</span>
          <span className="text-lg font-black text-emerald-600 block">{metricas.ativas}</span>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-amber-500/20 shadow-xs">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">A Vencer</span>
          <span className="text-lg font-black text-amber-600 block">{metricas.aVencer}</span>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-rose-500/20 shadow-xs">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">Acionamentos</span>
          <span className="text-lg font-black text-rose-600 block">{metricas.acionadas}</span>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-sky-500/20 shadow-xs">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">Taxa Retorno</span>
          <span className="text-lg font-black text-sky-600 block">{metricas.taxaRetorno}%</span>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <MagnifyingGlass
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
        />
        <input
          type="text"
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder="Buscar placa, cliente ou OS..."
          className="w-full pl-9 pr-8 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-xs"
        />
        {busca && (
          <button
            type="button"
            onClick={() => onBuscaChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 p-1"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Tabs com Scroll Horizontal */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {tabs.map((tab) => {
          const isAtivo = filtroStatus === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFiltroStatusChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 shrink-0 ${
                isAtivo ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border border-zinc-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-80">({tab.count})</span>
            </button>
          )
        })}
      </div>

      {/* Cards de Garantias */}
      <div className="space-y-2.5">
        {garantias.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-zinc-200 text-zinc-500 text-xs">
            Nenhuma garantia encontrada.
          </div>
        ) : (
          garantias.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-3.5 border border-zinc-200/90 shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 text-xs">{item.id}</span>
                    <span className="font-mono text-[10px] bg-zinc-100 text-zinc-700 px-1.5 py-0.2 rounded font-bold">
                      {item.numeroOS}
                    </span>
                  </div>
                  <div className="font-semibold text-zinc-800 text-xs mt-0.5">{item.clienteNome}</div>
                </div>

                {/* Status Badge */}
                {item.status === 'ACIONADA' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    Acionada
                  </span>
                ) : item.status === 'A_VENCER' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    {item.diasRestantes}d restantes
                  </span>
                ) : item.status === 'EXPIRADA' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                    Expirada
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Ativa ({item.diasRestantes}d)
                  </span>
                )}
              </div>

              {/* Veículo & Placa */}
              <div className="flex items-center justify-between text-[11px] text-zinc-600 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                <div className="flex items-center gap-1.5 truncate">
                  <Car size={13} className="text-zinc-400 shrink-0" />
                  <span className="truncate">{item.veiculo}</span>
                </div>
                <span className="font-mono font-bold bg-zinc-200 text-zinc-800 px-1.5 rounded shrink-0">
                  {item.placa}
                </span>
              </div>

              {/* Descrição */}
              <div className="text-[11px] text-zinc-700 line-clamp-2">
                {item.descricao}
              </div>

              {/* Rodapé do Card com Ações */}
              <div className="pt-1 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400">
                  Vence: {new Date(item.dataValidade).toLocaleDateString('pt-BR')}
                </span>

                <div className="flex items-center gap-1.5">
                  {item.clienteTelefone && (
                    <a
                      href={gerarLinkWhatsapp(item)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg inline-flex items-center justify-center"
                    >
                      <WhatsappLogo size={14} weight="fill" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => onVerDetalhes(item)}
                    className="px-2 py-1 text-[11px] font-semibold bg-zinc-100 text-zinc-700 rounded-lg border border-zinc-200 flex items-center gap-1"
                  >
                    <Eye size={13} />
                    <span>Detalhes</span>
                  </button>

                  {item.status !== 'EXPIRADA' && (
                    <button
                      type="button"
                      onClick={() => onAcionarGarantia(item)}
                      className="px-2 py-1 text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg"
                    >
                      Acionar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
