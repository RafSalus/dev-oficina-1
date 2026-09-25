import React from 'react'
import { IMaskInput } from 'react-imask'
import { MapPin } from '@phosphor-icons/react'
import { GoogleMapsIcon } from '../../icons/GoogleMapsIcon'
import { gerarLinkGoogleMapsTrajeto } from '../../../utils/googleMapsRouting'

export function SecaoRotaPrazosCobranca({
  enderecoOrigem,
  setEnderecoOrigem,
  enderecoDestino,
  setEnderecoDestino,
  cidade,
  idaEVolta,
  setIdaEVolta,
  handleCalcularRota,
  resumoCalculoRota,
  data,
  setData,
  horarioSaidaPrevisto,
  setHorarioSaidaPrevisto,
  tempoEstimadoMinutos,
  setTempoEstimadoMinutos,
  kmEstimado,
  setKmEstimado,
  tipoCobranca,
  setTipoCobranca,
  valorTaxa,
  setValorTaxa,
  observacoes,
  setObservacoes,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin size={14} className="text-sky-600" />
          <span>Endereço, Rota e Trajeto no Google Maps</span>
        </h4>

        {/* Alternador Ida e Volta vs Apenas Ida */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => {
              setIdaEVolta(true)
              if (enderecoDestino) handleCalcularRota(enderecoDestino, cidade, true)
            }}
            className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors cursor-pointer ${
              idaEVolta
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ida e Volta à Oficina
          </button>
          <button
            type="button"
            onClick={() => {
              setIdaEVolta(false)
              if (enderecoDestino) handleCalcularRota(enderecoDestino, cidade, false)
            }}
            className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors cursor-pointer ${
              !idaEVolta
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Apenas Ida
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Ponto de Origem</label>
          <input
            type="text"
            value={enderecoOrigem}
            onChange={(e) => setEnderecoOrigem(e.target.value)}
            placeholder="Oficina Gabriel..."
            className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-600"
          />
        </div>

        <div className="sm:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Endereço de Destino *</label>
          <input
            type="text"
            value={enderecoDestino}
            onChange={(e) => {
              setEnderecoDestino(e.target.value)
              if (e.target.value.length > 8) {
                handleCalcularRota(e.target.value, cidade, idaEVolta)
              }
            }}
            placeholder="Rua, Número, Bairro do cliente ou fornecedor..."
            className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-600"
          />
        </div>

        {/* Barra de Ações com Google Maps */}
        <div className="sm:col-span-12 flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleCalcularRota(enderecoDestino, cidade, idaEVolta)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              title="Calcular estimativa de tempo e distância"
            >
              <GoogleMapsIcon className="w-3.5 h-4.5" />
              <span>Calcular Tempo e KM ({idaEVolta ? 'Ida e Volta' : 'Apenas Ida'})</span>
            </button>

            {resumoCalculoRota && (
              <span className="text-[11px] font-medium text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                {resumoCalculoRota}
              </span>
            )}
          </div>

          {enderecoDestino && (
            <a
              href={gerarLinkGoogleMapsTrajeto({
                origem: enderecoOrigem,
                destino: enderecoDestino,
                idaEVolta,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Abrir rota no Google Maps e iniciar navegação GPS"
            >
              <GoogleMapsIcon className="w-3.5 h-4.5" />
              <span>Iniciar Trajeto no Google Maps</span>
            </a>
          )}
        </div>

        <div className="sm:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">Data</label>
          <IMaskInput
            mask="00/00/0000"
            value={data}
            onAccept={(value) => setData(value)}
            placeholder="DD/MM/AAAA"
            className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-sky-600"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">Horário Previsto Saída *</label>
          <IMaskInput
            mask="00:00"
            value={horarioSaidaPrevisto}
            onAccept={(value) => setHorarioSaidaPrevisto(value)}
            placeholder="14:00"
            className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-sky-600"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">Tempo Estimado</label>
          <input
            type="number"
            min="10"
            max="360"
            value={tempoEstimadoMinutos}
            onChange={(e) => setTempoEstimadoMinutos(e.target.value)}
            placeholder="Minutos"
            className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-sky-600"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">Distância Estimada (KM)</label>
          <input
            type="text"
            value={kmEstimado}
            onChange={(e) => setKmEstimado(e.target.value)}
            placeholder="Ex: 15 km"
            className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-sky-600"
          />
        </div>

        {/* Cobrança / Taxa */}
        <div className="sm:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Taxa de Leva e Traz</label>
          <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-50 h-9">
            <button
              type="button"
              onClick={() => setTipoCobranca('cortesia')}
              className={`flex-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                tipoCobranca === 'cortesia'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cortesia da Oficina
            </button>
            <button
              type="button"
              onClick={() => setTipoCobranca('cobrado')}
              className={`flex-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                tipoCobranca === 'cobrado'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cobrado do Cliente
            </button>
          </div>
        </div>

        {tipoCobranca === 'cobrado' ? (
          <div className="sm:col-span-6">
            <label className="block text-xs font-bold text-slate-700 mb-1">Valor da Taxa (R$)</label>
            <input
              type="text"
              value={valorTaxa}
              onChange={(e) => setValorTaxa(e.target.value)}
              placeholder="50,00"
              className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-sky-600"
            />
          </div>
        ) : (
          <div className="sm:col-span-6 flex items-center pt-5 text-xs text-slate-500 italic">
            * Serviço sem custo adicional para fidelização do cliente.
          </div>
        )}

        <div className="sm:col-span-12">
          <label className="block text-xs font-bold text-slate-700 mb-1">Observações da Viagem</label>
          <textarea
            rows={2}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Instruções de portaria, contato no local ou pontos de referência..."
            className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-600 resize-none"
          />
        </div>
      </div>
    </div>
  )
}
