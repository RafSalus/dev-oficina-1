import React from 'react'
import {
  Car,
  WhatsappLogo,
  Eye,
  WarningCircle,
  SealCheck,
  ShieldWarning,
  Clock,
  CheckCircle,
} from '@phosphor-icons/react'
import { formatarTelefone } from '../../utils/fiscalValidators'

function StatusBadge({ status, diasRestantes }) {
  if (status === 'ACIONADA') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
        Acionada (Em Análise)
      </span>
    )
  }

  if (status === 'A_VENCER') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
        <Clock size={13} weight="bold" />
        {diasRestantes} dias restantes
      </span>
    )
  }

  if (status === 'EXPIRADA') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
        Expirada
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
      <CheckCircle size={13} weight="bold" />
      Ativa ({diasRestantes} dias)
    </span>
  )
}

function TipoBadge({ tipo }) {
  const configs = {
    MISTO: { label: 'Peça + Serviço', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    PECA: { label: 'Peça', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    SERVICO: { label: 'Mão de Obra', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  }
  const conf = configs[tipo] || configs.MISTO
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${conf.bg}`}>
      {conf.label}
    </span>
  )
}

export function GarantiasTabela({
  garantias,
  onVerDetalhes,
  onAcionarGarantia,
}) {
  if (garantias.length === 0) {
    return (
      <div className="flex-1 bg-white rounded-xl border border-zinc-200/80 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 mb-3">
          <SealCheck size={32} weight="light" />
        </div>
        <h3 className="text-sm font-bold text-zinc-800">Nenhuma garantia encontrada</h3>
        <p className="text-xs text-zinc-500 max-w-sm mt-1">
          Não foram localizados registros com os filtros e termos de busca aplicados.
        </p>
      </div>
    )
  }

  const gerarLinkWhatsapp = (item) => {
    const foneLimpo = (item.clienteTelefone || '').replace(/\D/g, '')
    const msg = encodeURIComponent(
      `Olá ${item.clienteNome}! Aqui é da oficina. Estamos entrando em contato referente à garantia dos serviços do seu veículo ${item.veiculo} (OS ${item.numeroOS}). Como está o funcionamento do carro? Ficamos à disposição!`
    )
    return `https://wa.me/55${foneLimpo}?text=${msg}`
  }

  return (
    <div className="flex-1 bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden flex flex-col min-h-0">
      <div className="flex-1 overflow-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/80 bg-zinc-50/75 text-[11px] font-bold uppercase tracking-wider text-zinc-500 sticky top-0 z-10 backdrop-blur-xs">
              <th className="py-2.5 px-3">Garantia / OS</th>
              <th className="py-2.5 px-3">Cliente & Veículo</th>
              <th className="py-2.5 px-3">Peça / Serviço Coberto</th>
              <th className="py-2.5 px-3">Validade</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs">
            {garantias.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-zinc-50/60 transition-colors group"
              >
                {/* Garantia / OS */}
                <td className="py-2.5 px-3 align-top whitespace-nowrap">
                  <div className="font-bold text-zinc-900">{item.id}</div>
                  <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                    {item.numeroOS}
                  </div>
                  <div className="mt-1">
                    <TipoBadge tipo={item.tipo} />
                  </div>
                </td>

                {/* Cliente & Veículo */}
                <td className="py-2.5 px-3 align-top">
                  <div className="font-semibold text-zinc-900">{item.clienteNome}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {formatarTelefone(item.clienteTelefone)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-600 font-medium">
                    <Car size={13} className="text-zinc-400 shrink-0" />
                    <span className="truncate max-w-[190px]">{item.veiculo}</span>
                    <span className="px-1.5 py-0.2 bg-zinc-200 text-zinc-800 rounded font-mono text-[10px] font-bold">
                      {item.placa}
                    </span>
                  </div>
                </td>

                {/* Peça / Serviço Coberto */}
                <td className="py-2.5 px-3 align-top max-w-xs">
                  <div className="font-medium text-zinc-800 line-clamp-2" title={item.descricao}>
                    {item.descricao}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Resp: <span className="text-zinc-600 font-medium">{item.mecanicoResponsavel}</span>
                  </div>
                </td>

                {/* Validade */}
                <td className="py-2.5 px-3 align-top whitespace-nowrap">
                  <div className="text-zinc-900 font-medium">
                    Até {new Date(item.dataValidade).toLocaleDateString('pt-BR')}
                  </div>
                  {item.quilometragemLimite > 0 && (
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      ou até {item.quilometragemLimite.toLocaleString('pt-BR')} km
                    </div>
                  )}
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Exec: {new Date(item.dataExecucao).toLocaleDateString('pt-BR')}
                  </div>
                </td>

                {/* Status */}
                <td className="py-2.5 px-3 align-top text-center whitespace-nowrap">
                  <StatusBadge status={item.status} diasRestantes={item.diasRestantes} />
                </td>

                {/* Ações */}
                <td className="py-2.5 px-3 align-top text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Botão WhatsApp */}
                    {item.clienteTelefone && (
                      <a
                        href={gerarLinkWhatsapp(item)}
                        target="_blank"
                        rel="noreferrer"
                        title="Falar no WhatsApp"
                        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center justify-center border border-emerald-200"
                      >
                        <WhatsappLogo size={16} weight="fill" />
                      </a>
                    )}

                    {/* Botão Ver Detalhes */}
                    <button
                      type="button"
                      onClick={() => onVerDetalhes(item)}
                      title="Ver Detalhes da Garantia"
                      className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors border border-zinc-200"
                    >
                      <Eye size={16} />
                    </button>

                    {/* Botão Acionar Garantia */}
                    {item.status !== 'EXPIRADA' && (
                      <button
                        type="button"
                        onClick={() => onAcionarGarantia(item)}
                        title="Registrar Retorno / Reclamação"
                        className="px-2 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                      >
                        Acionar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
