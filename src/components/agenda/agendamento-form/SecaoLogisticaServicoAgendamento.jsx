import React from 'react'
import { Car, Clock, MapPin } from '@phosphor-icons/react'
import { inputClass, labelClass } from './estilosAgendamentoForm'

const OPCOES_LOGISTICA_DESKTOP = [
  {
    valor: 'CLIENTE_LEVA',
    titulo: 'Cliente vai levar o carro na oficina',
    descricao: 'O cliente traz o veículo pessoalmente',
  },
  {
    valor: 'OFICINA_BUSCA',
    titulo: 'Oficina deve buscar o carro (Leva e Traz)',
    descricao: 'A oficina retira o veículo no endereço',
  },
]

export function SecaoLogisticaAgendamento({ form }) {
  const { tipoLogistica } = form

  return (
    <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Car size={16} className="text-[#0284c7]" />
          4. Logística: Entrega e Coleta do Carro
        </span>
      </div>

      {/* Opções de Logística */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {OPCOES_LOGISTICA_DESKTOP.map((opcao) => (
          <label
            key={opcao.valor}
            className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-all ${
              tipoLogistica === opcao.valor
                ? 'border-[#0284c7] bg-white text-slate-900 shadow-xs ring-1 ring-[#0284c7]'
                : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
            }`}
          >
            <input
              type="radio"
              name="tipoLogistica"
              value={opcao.valor}
              checked={tipoLogistica === opcao.valor}
              onChange={() => form.setTipoLogistica(opcao.valor)}
              className="mt-0.5 text-[#0284c7] focus:ring-[#0284c7]"
            />
            <div>
              <span className="text-xs font-bold block">{opcao.titulo}</span>
              <span className="text-[11px] text-slate-500">{opcao.descricao}</span>
            </div>
          </label>
        ))}
      </div>

      {/* Campos Específicos da Logística */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div>
          <label className={labelClass}>
            {tipoLogistica === 'CLIENTE_LEVA'
              ? 'Horário previsto de entrega pelo cliente *'
              : 'Horário em que a oficina deve buscar o carro *'}
          </label>
          <div className="relative">
            <Clock size={16} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="time"
              required
              value={form.horarioVeiculo}
              onChange={(e) => form.setHorarioVeiculo(e.target.value)}
              className="w-full text-xs pl-8 pr-2 py-2 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
            />
          </div>
        </div>

        {tipoLogistica === 'OFICINA_BUSCA' && (
          <div>
            <label className={labelClass}>Endereço onde deve ser pego o carro *</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                value={form.enderecoColeta}
                onChange={(e) => form.setEnderecoColeta(e.target.value)}
                placeholder="Rua, número, bairro e cidade..."
                className="w-full text-xs pl-8 pr-2 py-2 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function SecaoServicoAgendamento({ form }) {
  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Serviço Solicitado / Motivo do Atendimento *</label>
        <textarea
          rows={2}
          required
          value={form.servicoDescricao}
          onChange={(e) => form.setServicoDescricao(e.target.value)}
          placeholder="Ex: Troca de pastilhas de freio dianteiras, revisão dos 40.000km, barulho na direção..."
          className="w-full text-xs p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
        />
      </div>

      <div>
        <label className={labelClass}>Observações Internas (Opcional)</label>
        <input
          type="text"
          value={form.observacoes}
          onChange={(e) => form.setObservacoes(e.target.value)}
          placeholder="Ex: Cliente tem pressa pois vai viajar no final de semana..."
          className={inputClass}
        />
      </div>
    </div>
  )
}
