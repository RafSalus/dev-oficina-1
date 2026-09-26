import React from 'react'
import { Users, Clock, Wrench, Trash, ShieldCheck, Receipt } from '@phosphor-icons/react'
import { PRIORIDADE_FILA } from '../../../constants/agendaData'

const COLUNAS = [
  { rotulo: 'Posição', classe: 'text-center w-16' },
  { rotulo: 'Prioridade' },
  { rotulo: 'Horário Chegada' },
  { rotulo: 'Cliente e Contato' },
  { rotulo: 'Veículo e Placa' },
  { rotulo: 'Motivo / Diagnóstico Solicitado' },
  { rotulo: 'Mecânico Preferencial' },
  { rotulo: 'Ações', classe: 'text-right' },
]

function LinhaFila({ item, posicao, mecanicosAgenda, onAbrirOS, onRemover }) {
  const isGarantia = item.prioridade === 'GARANTIA'
  const pInfo = PRIORIDADE_FILA[item.prioridade] || PRIORIDADE_FILA.NORMAL
  const mecPref = mecanicosAgenda.find((m) => m.id === item.mecanicoPreferencialId)

  return (
    <tr
      className={`transition-colors ${
        isGarantia ? 'bg-slate-900/5 hover:bg-slate-900/10 font-medium' : 'hover:bg-slate-50'
      }`}
    >
      {/* Posição */}
      <td className="py-3.5 px-4 text-center">
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold ${
            isGarantia ? 'bg-[#0f172a] text-white' : 'bg-slate-100 text-slate-700 border border-slate-300'
          }`}
        >
          {posicao}º
        </span>
      </td>

      {/* Prioridade */}
      <td className="py-3.5 px-4">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded ${
            isGarantia ? 'bg-[#0f172a] text-white border border-[#0f172a]' : pInfo.corBadge
          }`}
        >
          {isGarantia && <ShieldCheck size={13} weight="bold" />}
          {pInfo.rotulo}
        </span>
      </td>

      {/* Chegada */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
          <Clock size={14} className="text-[#0284c7]" />
          <span>{item.horaChegada}</span>
        </div>
        <span className="text-[10px] text-slate-400">Est.: ~{item.tempoEstimadoMinutos || 45} min</span>
      </td>

      {/* Cliente */}
      <td className="py-3.5 px-4">
        <div className="font-bold text-slate-900">{item.clienteNome}</div>
        {item.clienteTelefone && <div className="text-[11px] text-slate-500">{item.clienteTelefone}</div>}
      </td>

      {/* Veículo */}
      <td className="py-3.5 px-4">
        <div className="font-medium text-slate-800">{item.veiculoModelo}</div>
        {item.veiculoPlaca && (
          <span className="inline-block mt-0.5 text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-700">
            {item.veiculoPlaca}
          </span>
        )}
      </td>

      {/* Motivo */}
      <td className="py-3.5 px-4 max-w-xs">
        <p className="text-slate-700 line-clamp-2 leading-relaxed italic">"{item.motivo}"</p>
      </td>

      {/* Mecânico Preferencial */}
      <td className="py-3.5 px-4">
        {mecPref ? (
          <span className="font-medium text-slate-800 flex items-center gap-1">
            <Wrench size={13} className="text-[#0284c7]" />
            {mecPref.nome}
          </span>
        ) : (
          <span className="text-slate-400 italic">Qualquer mecânico</span>
        )}
      </td>

      {/* Ações */}
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onAbrirOS(item)}
            className="px-2.5 py-1.5 text-xs text-white bg-[#0284c7] hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1 font-semibold shadow-xs"
            title="Abrir Ordem de Servico com os dados deste cliente"
          >
            <Receipt size={14} weight="bold" />
            <span>Abrir OS</span>
          </button>
          <button
            type="button"
            onClick={() => onRemover(item)}
            className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
            title="Remover da fila"
          >
            <Trash size={14} />
            <span>Remover</span>
          </button>
        </div>
      </td>
    </tr>
  )
}

export function TabelaFila({ filaFiltrada, mecanicosAgenda, onAbrirOS, onRemover }) {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6">
      {filaFiltrada.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 shadow-xs">
          <Users size={42} className="mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-slate-700">Fila de atendimento vazia</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Nenhum cliente aguardando atendimento presencial no momento. Quando um cliente chegar, clique em "Inserir Cliente na Fila".
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                {COLUNAS.map((c) => (
                  <th key={c.rotulo} className={`py-3 px-4${c.classe ? ` ${c.classe}` : ''}`}>
                    {c.rotulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filaFiltrada.map((item, index) => (
                <LinhaFila
                  key={item.id}
                  item={item}
                  posicao={index + 1}
                  mecanicosAgenda={mecanicosAgenda}
                  onAbrirOS={onAbrirOS}
                  onRemover={onRemover}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
