import React from 'react'
import { Wrench, Clock, ArrowLeft, ArrowRight } from '@phosphor-icons/react'

export function TabDiagnostico({
  formData,
  updateFormData,
  onPrev,
  onNext,
}) {
  const {
    tipoAtendimento,
    prioridade,
    tecnicoResponsavel,
    previsaoData,
    previsaoHora,
    relatoCliente,
    diagnosticoInicial,
    checklist,
  } = formData

  const handleChecklistChange = (key) => {
    updateFormData({
      checklist: {
        ...checklist,
        [key]: !checklist[key],
      },
    })
  }

  return (
    <div className="h-full w-full flex flex-col justify-between gap-2.5 overflow-hidden">
      {/* Grid de 2 Cartões: Parâmetros e Diagnósticos */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-hidden">
        {/* Cartão 1: Parâmetros & Checklist de Entrada */}
        <div className="h-full bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#f2f4f7] shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Clock size={16} weight="bold" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#101828]">Condições & Prazos</h2>
              <p className="text-[10px] text-[#667085]">Parâmetros técnicos e checklist de entrada</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2 space-y-2 overflow-hidden">
            {/* Grid 2 colunas: Tipo de Atendimento e Prioridade */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Tipo de Atendimento
                </label>
                <select
                  value={tipoAtendimento}
                  onChange={(e) => updateFormData({ tipoAtendimento: e.target.value })}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2.5 h-8.5 text-xs font-semibold text-[#101828] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="orcamento">Orçamento</option>
                  <option value="corretiva">Manutenção Corretiva</option>
                  <option value="preventiva">Revisão Preventiva</option>
                  <option value="garantia">Retorno em Garantia</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Prioridade
                </label>
                <select
                  value={prioridade}
                  onChange={(e) => updateFormData({ prioridade: e.target.value })}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2.5 h-8.5 text-xs font-semibold text-[#101828] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente (Veículo parado)</option>
                </select>
              </div>
            </div>

            {/* Mecânico Responsável */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Mecânico Responsável
              </label>
              <input
                type="text"
                placeholder="Ex: Gabriel"
                value={tecnicoResponsavel}
                onChange={(e) => updateFormData({ tecnicoResponsavel: e.target.value })}
                className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3 h-8.5 text-xs font-semibold text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
              />
            </div>

            {/* Previsão de Entrega */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Previsão de Entrega
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={previsaoData}
                  onChange={(e) => updateFormData({ previsaoData: e.target.value })}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2.5 h-8.5 text-xs font-medium text-[#101828] focus:outline-none transition-all"
                />
                <input
                  type="time"
                  value={previsaoHora}
                  onChange={(e) => updateFormData({ previsaoHora: e.target.value })}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2.5 h-8.5 text-xs font-medium text-[#101828] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Checklist de Entrada */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1.5">
                Checklist de Entrada
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-[#f9fafb] border border-[#e4e7ec] cursor-pointer hover:bg-[#f2f4f7] transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.estepe}
                    onChange={() => handleChecklistChange('estepe')}
                    className="rounded text-black focus:ring-black accent-black w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-xs text-[#344054] font-medium">Estepe presente</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-[#f9fafb] border border-[#e4e7ec] cursor-pointer hover:bg-[#f2f4f7] transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.macaco}
                    onChange={() => handleChecklistChange('macaco')}
                    className="rounded text-black focus:ring-black accent-black w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-xs text-[#344054] font-medium">Macaco</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-[#f9fafb] border border-[#e4e7ec] cursor-pointer hover:bg-[#f2f4f7] transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.chaveRoda}
                    onChange={() => handleChecklistChange('chaveRoda')}
                    className="rounded text-black focus:ring-black accent-black w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-xs text-[#344054] font-medium">Chave de roda</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-[#f9fafb] border border-[#e4e7ec] cursor-pointer hover:bg-[#f2f4f7] transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.semPertences}
                    onChange={() => handleChecklistChange('semPertences')}
                    className="rounded text-black focus:ring-black accent-black w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-xs text-[#344054] font-medium">Sem pertences</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Cartão 2: Relato & Diagnóstico Inicial */}
        <div className="h-full bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#f2f4f7] shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Wrench size={16} weight="bold" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#101828]">Diagnóstico Técnico</h2>
              <p className="text-[10px] text-[#667085]">Relato do condutor e avaliação preliminar</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2 space-y-2.5 overflow-hidden min-h-0">
            {/* Relato do Cliente */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Relato do Cliente (Queixa Principal)
              </label>
              <textarea
                value={relatoCliente}
                onChange={(e) => updateFormData({ relatoCliente: e.target.value })}
                placeholder="Descreva detalhadamente o sintoma relatado: ruídos, vibrações, luzes no painel, perda de potência..."
                className="flex-1 w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl p-3 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Diagnóstico Inicial */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Diagnóstico Inicial / Parecer da Oficina
              </label>
              <textarea
                value={diagnosticoInicial}
                onChange={(e) => updateFormData({ diagnosticoInicial: e.target.value })}
                placeholder="Anotações técnicas da recepção: testes a realizar, componentes a inspecionar, scanner automotivo..."
                className="flex-1 w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl p-3 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Barra Inferior de Navegação Rápida entre Abas */}
      <div className="h-10 shrink-0 bg-white px-4 rounded-xl border border-[#e4e7ec] shadow-xs flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475467] hover:text-[#101828] cursor-pointer"
        >
          <ArrowLeft size={14} weight="bold" />
          <span>Voltar para Cliente e Veículo</span>
        </button>

        <span className="text-[11px] font-medium text-[#667085]">
          Aba 2 de 7 • <strong className="text-[#101828]">Diagnóstico</strong>
        </span>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#101828] hover:text-black hover:underline cursor-pointer"
        >
          <span>Avançar para Peças</span>
          <ArrowRight size={14} weight="bold" />
        </button>
      </div>
    </div>
  )
}
