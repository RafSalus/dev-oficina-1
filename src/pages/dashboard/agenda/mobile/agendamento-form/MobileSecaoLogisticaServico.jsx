import React from 'react'
import { Car, Clock, MapPin } from '@phosphor-icons/react'
import { inputBaseClass, textareaBaseClass, labelBaseClass } from '../../../nova-os/mobile/mobileSelectStyles'
import { secaoMobileClass, TituloSecaoMobile } from './MobileSecaoClienteVeiculo'

const OPCOES_LOGISTICA_MOBILE = [
  { valor: 'CLIENTE_LEVA', titulo: 'Cliente vai levar o carro', descricao: 'Traz o veículo pessoalmente' },
  { valor: 'OFICINA_BUSCA', titulo: 'Oficina deve buscar (Leva e Traz)', descricao: 'Retirada no endereço do cliente' },
]

export function MobileSecaoLogistica({ form }) {
  const { tipoLogistica } = form

  return (
    <section className={secaoMobileClass}>
      <TituloSecaoMobile icone={Car}>Logística: Entrega e Coleta</TituloSecaoMobile>

      <div className="space-y-2">
        {OPCOES_LOGISTICA_MOBILE.map((opcao) => (
          <label
            key={opcao.valor}
            className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
              tipoLogistica === opcao.valor
                ? 'border-[#0284c7] bg-sky-50 ring-1 ring-[#0284c7]'
                : 'border-[#d0d5dd] bg-white'
            }`}
          >
            <input
              type="radio"
              name="tipoLogisticaMobile"
              checked={tipoLogistica === opcao.valor}
              onChange={() => form.setTipoLogistica(opcao.valor)}
              className="mt-0.5"
            />
            <div>
              <span className="text-xs font-bold block text-[#101828]">{opcao.titulo}</span>
              <span className="text-[11px] text-[#667085]">{opcao.descricao}</span>
            </div>
          </label>
        ))}
      </div>

      <div>
        <label className={labelBaseClass}>
          {tipoLogistica === 'CLIENTE_LEVA' ? 'Horário previsto de entrega *' : 'Horário para buscar o carro *'}
        </label>
        <div className="relative min-w-0 max-w-full">
          <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
          <input
            type="time"
            value={form.horarioVeiculo}
            onChange={(e) => form.setHorarioVeiculo(e.target.value)}
            className={`${inputBaseClass} pl-10 min-w-0 max-w-full block appearance-none`}
            style={{ WebkitAppearance: 'none' }}
          />
        </div>
      </div>

      {tipoLogistica === 'OFICINA_BUSCA' && (
        <div>
          <label className={labelBaseClass}>Endereço de Coleta *</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-3.5 text-[#98a2b3]" />
            <textarea
              rows={2}
              value={form.enderecoColeta}
              onChange={(e) => form.setEnderecoColeta(e.target.value)}
              placeholder="Rua, número, bairro e cidade..."
              className={`${textareaBaseClass} pl-10`}
            />
          </div>
        </div>
      )}
    </section>
  )
}

export function MobileSecaoServico({ form }) {
  return (
    <section className={secaoMobileClass}>
      <div>
        <label className={labelBaseClass}>Serviço Solicitado / Motivo *</label>
        <textarea
          rows={3}
          value={form.servicoDescricao}
          onChange={(e) => form.setServicoDescricao(e.target.value)}
          placeholder="Ex: Troca de pastilhas de freio dianteiras, revisão dos 40.000km..."
          className={textareaBaseClass}
        />
      </div>
      <div>
        <label className={labelBaseClass}>Observações Internas</label>
        <textarea
          rows={2}
          value={form.observacoes}
          onChange={(e) => form.setObservacoes(e.target.value)}
          placeholder="Ex: Cliente tem pressa, vai viajar no fim de semana..."
          className={textareaBaseClass}
        />
      </div>
    </section>
  )
}
