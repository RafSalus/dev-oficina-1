import React, { useState } from 'react'
import {
  CheckSquare,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  ClipboardText,
  CarProfile,
  Speedometer,
  FloppyDisk,
  X,
} from '@phosphor-icons/react'
import { ITENS_CHECKLIST_ENTRADA, ITENS_CHECKLIST_SAIDA, checklistCompleto } from '../../../../constants/checklistItems'
import { podeIniciarDiagnostico } from '../../orcamento/mockOrdensAbertas'
import { toast } from 'sonner'

export function TabChecklist({ formData, updateFormData, onSaveStep, onFinalizarRapido, onCancel }) {
  const [subTab, setSubTab] = useState('entrada') // 'entrada' | 'saida'

  const checklistEntrada = formData.checklistEntrada || {}
  const checklistSaida = formData.checklistSaida || {}

  // Seleção de status do item (ok | nao_ok | nao_se_aplica)
  const handleStatusItem = (tipo, itemId, status) => {
    const currentList = tipo === 'entrada' ? checklistEntrada : checklistSaida
    const currentItem = currentList[itemId] || { status: '', obs: '' }

    const updatedList = {
      ...currentList,
      [itemId]: {
        ...currentItem,
        status: currentItem.status === status ? '' : status,
      },
    }

    if (tipo === 'entrada') {
      updateFormData({ checklistEntrada: updatedList })
    } else {
      updateFormData({ checklistSaida: updatedList })
    }
  }

  // Atualização de observação por item
  const handleObsItem = (tipo, itemId, obsValue) => {
    const currentList = tipo === 'entrada' ? checklistEntrada : checklistSaida
    const currentItem = currentList[itemId] || { ok: false, obs: '' }

    const updatedList = {
      ...currentList,
      [itemId]: {
        ...currentItem,
        obs: obsValue,
      },
    }

    if (tipo === 'entrada') {
      updateFormData({ checklistEntrada: updatedList })
    } else {
      updateFormData({ checklistSaida: updatedList })
    }
  }

  // Contadores
  const totalEntradaOk = ITENS_CHECKLIST_ENTRADA.filter(
    (item) => checklistEntrada[item.id]?.status === 'conforme'
  ).length
  const totalSaidaOk = ITENS_CHECKLIST_SAIDA.filter(
    (item) => checklistSaida[item.id]?.status === 'conforme'
  ).length

  // Divisão dos itens de entrada em 3 colunas (8, 8 e 6 itens)
  const itensCol1 = ITENS_CHECKLIST_ENTRADA.slice(0, 8)
  const itensCol2 = ITENS_CHECKLIST_ENTRADA.slice(8, 16)
  const itensCol3 = ITENS_CHECKLIST_ENTRADA.slice(16, 22)

  // Renderizador de linha de item de checklist
  const renderItemRow = (item, tipo) => {
    const state = (tipo === 'entrada' ? checklistEntrada : checklistSaida)[item.id] || {
      status: '',
      obs: '',
    }
    const status = state.status || ''

    return (
      <div
        key={item.id}
        className={`mb-2 rounded-xl border transition-colors ${
          status === 'conforme'
            ? 'bg-[#f0f9ff] border-[#bae6fd]'
            : status === 'nao_conforme'
            ? 'bg-[#fef3f2] border-[#fecdca]'
            : status === 'isento'
            ? 'bg-[#f8fafc] border-[#d0d5dd]'
            : 'bg-white border-[#d0d5dd] hover:border-[#98a2b3]'
        }`}
      >
        {/* Linha do item: Label + Botões de Status */}
        <div className="flex items-center gap-2 px-2.5 pt-2 pb-1">
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-[#101828] uppercase leading-none">
              {item.label}
            </span>
            {item.desc && (
              <span className="text-[9px] text-[#667085] ml-1.5 uppercase">
                {item.desc}
              </span>
            )}
          </div>

          {/* 3 Botões de Status */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => handleStatusItem(tipo, item.id, 'conforme')}
              className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer border ${
                status === 'conforme'
                  ? 'bg-[#0284c7] text-white border-[#0284c7]'
                  : 'bg-white text-[#0284c7] border-[#bae6fd] hover:bg-[#e0f2fe]'
              }`}
            >
              Conforme
            </button>
            <button
              type="button"
              onClick={() => handleStatusItem(tipo, item.id, 'nao_conforme')}
              className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer border ${
                status === 'nao_conforme'
                  ? 'bg-[#b42318] text-white border-[#b42318]'
                  : 'bg-white text-[#b42318] border-[#fecdca] hover:bg-[#fef3f2]'
              }`}
            >
              Não Conforme
            </button>
            <button
              type="button"
              onClick={() => handleStatusItem(tipo, item.id, 'isento')}
              className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer border ${
                status === 'isento'
                  ? 'bg-[#344054] text-white border-[#344054]'
                  : 'bg-white text-[#344054] border-[#d0d5dd] hover:bg-[#f9fafb]'
              }`}
            >
              Isento
            </button>
          </div>
        </div>

        {/* Campo OBS abaixo do item */}
        <div className="flex items-center gap-1.5 px-2.5 pb-2 pl-2.5">
          <span className="text-[9px] font-bold text-[#667085] uppercase shrink-0">OBS:</span>
          <input
            type="text"
            value={state.obs || ''}
            onChange={(e) => handleObsItem(tipo, item.id, e.target.value)}
            placeholder="-"
            className="flex-1 bg-transparent hover:bg-[#f2f4f7] focus:bg-white border border-transparent focus:border-[#e4e7ec] rounded px-1.5 py-0.5 text-[10px] text-[#101828] placeholder-[#d0d5dd] focus:outline-none transition-all"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col justify-between gap-2.5 overflow-hidden">
      {/* Sub-Header com Seletor de Entrada / Saída e Ações Rápidas */}
      <div className="h-10 shrink-0 bg-white px-3 rounded-2xl border border-[#d0d5dd] shadow-sm flex items-center justify-between gap-2">
        {/* Segmented Switcher Entrada / Saída */}
        <div className="flex items-center gap-1 bg-[#f2f4f7] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setSubTab('entrada')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'entrada'
                ? 'bg-white text-[#101828] shadow-xs'
                : 'text-[#667085] hover:text-[#101828]'
            }`}
          >
            <ClipboardText size={14} weight={subTab === 'entrada' ? 'bold' : 'regular'} />
            <span>Checklist de Entrada</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                totalEntradaOk === ITENS_CHECKLIST_ENTRADA.length
                  ? 'bg-[#e0f2fe] text-[#0284c7]'
                  : 'bg-[#fffaeb] text-[#b54708]'
              }`}
            >
              {totalEntradaOk}/{ITENS_CHECKLIST_ENTRADA.length} OK
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('saida')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'saida'
                ? 'bg-white text-[#101828] shadow-xs'
                : 'text-[#667085] hover:text-[#101828]'
            }`}
          >
            <ShieldCheck size={14} weight={subTab === 'saida' ? 'bold' : 'regular'} />
            <span>Checklist de Saída</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                totalSaidaOk === ITENS_CHECKLIST_SAIDA.length
                  ? 'bg-[#e0f2fe] text-[#0284c7]'
                  : 'bg-[#f2f4f7] text-[#667085]'
              }`}
            >
              {totalSaidaOk}/{ITENS_CHECKLIST_SAIDA.length} OK
            </span>
          </button>
        </div>
      </div>

      {/* Conteúdo Principal do Checklist (Sem scroll vertical na tela principal) */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {subTab === 'entrada' ? (
          /* CHECKLIST DE ENTRADA (22 itens distribuídos em 3 colunas elegantes) */
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-2 overflow-hidden">
            {/* Coluna 1: Itens 1 a 8 */}
            <div className="h-full bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-1 rounded-xl bg-[#f2f4f7] px-3 py-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#101828]">Cabine e Mecânica Inicial</h3>
                    <p className="text-[10px] text-[#667085]">Itens 1 a 8 de 22</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col py-1 overflow-hidden min-h-0">
                {itensCol1.map((item) => renderItemRow(item, 'entrada'))}
              </div>
            </div>

            {/* Coluna 2: Itens 9 a 16 */}
            <div className="h-full bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-1 rounded-xl bg-[#f2f4f7] px-3 py-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#101828]">Segurança e Carroceria</h3>
                    <p className="text-[10px] text-[#667085]">Itens 9 a 16 de 22</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col py-1 overflow-hidden min-h-0">
                {itensCol2.map((item) => renderItemRow(item, 'entrada'))}
              </div>
            </div>

            {/* Coluna 3: Itens 17 a 22 + Observações Gerais */}
            <div className="h-full bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-1 rounded-xl bg-[#f2f4f7] px-3 py-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#101828]">Rodas, Elétrica e Observações</h3>
                    <p className="text-[10px] text-[#667085]">Itens 17 a 22 e notas gerais</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden min-h-0">
                <div className="flex flex-col shrink-0">
                  {itensCol3.map((item) => renderItemRow(item, 'entrada'))}
                </div>

                {/* Observações Gerais de Entrada */}
                <div className="flex-1 flex flex-col min-h-0 pt-1 border-t border-[#f2f4f7]">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                    Observações Gerais (Entrada)
                  </label>
                  <textarea
                    value={formData.checklistEntradaObs || ''}
                    onChange={(e) => updateFormData({ checklistEntradaObs: e.target.value })}
                    placeholder="Anotações gerais da vistoria de entrada, pertences deixados pelo cliente, avarias prévias na lataria..."
                    className="flex-1 w-full bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-white border border-[#d0d5dd] focus:border-[#101828] rounded-xl p-2 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CHECKLIST DE SAÍDA (5 itens + Observações Gerais + Termo de Liberação) */
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-2 overflow-hidden">
            {/* Coluna 1: Itens de Saída */}
            <div className="h-full bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center gap-2 pb-3 mb-1 rounded-xl bg-[#f2f4f7] px-3 py-2 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <CheckSquare size={16} weight="bold" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#101828]">Itens de Saída e Liberação</h3>
                  <p className="text-[10px] text-[#667085]">Conferência final antes da entrega</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col py-1 overflow-hidden min-h-0">
                {ITENS_CHECKLIST_SAIDA.map((item) => renderItemRow(item, 'saida'))}
              </div>
            </div>

            {/* Coluna 2: KM de Saída + Observações Gerais de Saída */}
            <div className="h-full bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-1 rounded-xl bg-[#f2f4f7] px-3 py-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <ClipboardText size={14} weight="bold" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#101828]">Dados de Saída</h3>
                    <p className="text-[10px] text-[#667085]">KM final e observações</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col py-3 min-h-0 gap-3">
                {/* Campo KM de Saída */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#344054]">
                      Quilometragem de Saída (KM) <span className="text-[#b42318]">*</span>
                    </label>
                    <span className="text-[10px] text-[#667085]">Hodômetro final</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ex: 64.280 km"
                      value={formData.kmSaida || ''}
                      onChange={(e) => updateFormData({ kmSaida: e.target.value })}
                      className="w-full bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-white border border-[#d0d5dd] focus:border-[#101828] rounded-xl px-3 h-10 text-sm font-bold text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all shadow-xs"
                    />
                    <Speedometer size={16} className="absolute right-3 top-2.5 text-[#98a2b3]" />
                  </div>
                  {formData.km && (
                    <p className="text-[10px] text-[#667085] mt-1">
                      KM de entrada: <span className="font-bold text-[#344054]">{formData.km}</span>
                    </p>
                  )}
                </div>

                {/* Observações Gerais de Saída */}
                <div className="flex-1 flex flex-col min-h-0">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                    Relatório de Liberação / Observações Finais
                  </label>
                  <textarea
                    value={formData.checklistSaidaObs || ''}
                    onChange={(e) => updateFormData({ checklistSaidaObs: e.target.value })}
                    placeholder="Relate o resultado do teste de rodagem, recomendações de retorno para revisão, peças velhas devolvidas ao cliente..."
                    className="flex-1 w-full bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-white border border-[#d0d5dd] focus:border-[#101828] rounded-xl p-3 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Coluna 3: Status de Liberação */}
            <div className="h-full bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-1 rounded-xl bg-[#f2f4f7] px-3 py-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <CarProfile size={14} weight="bold" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#101828]">Controle de Qualidade</h3>
                    <p className="text-[10px] text-[#667085]">Validação de conformidade técnica</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between py-3 gap-3 overflow-hidden">
                <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#667085]">Entrada do Veículo:</span>
                    <span className="font-bold text-[#101828]">
                      {totalEntradaOk}/{ITENS_CHECKLIST_ENTRADA.length} itens OK
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#667085]">Saída do Veículo:</span>
                    <span className="font-bold text-[#101828]">
                      {totalSaidaOk}/{ITENS_CHECKLIST_SAIDA.length} itens OK
                    </span>
                  </div>
                  <div className="w-full bg-[#e4e7ec] h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-[#101828] h-full transition-all duration-300"
                      style={{
                        width: `${
                          ((totalEntradaOk + totalSaidaOk) /
                            (ITENS_CHECKLIST_ENTRADA.length + ITENS_CHECKLIST_SAIDA.length)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] text-[11px] text-[#475467] leading-relaxed space-y-1.5">
                  <p className="font-bold text-[#101828]">Importante na Entrega:</p>
                  <p>• Apresentar ao cliente as peças substituídas.</p>
                  <p>• Validar se o hodômetro final condiz com os testes de rodagem.</p>
                  <p>• Confirmar se a etiqueta de próxima troca de óleo está afixada.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barra Inferior de Ações da Etapa */}
      <div className="h-11 shrink-0 bg-white px-5 rounded-2xl border border-[#d0d5dd] shadow-sm flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#667085] shrink-0 hidden sm:block">
          Aba 2 de 7 • <strong className="text-[#101828] font-bold">Checklist Oficial</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!checklistCompleto(checklistEntrada, ITENS_CHECKLIST_ENTRADA)) {
                const faltam = ITENS_CHECKLIST_ENTRADA.filter((item) => !checklistEntrada[item.id]?.status).length
                toast.warning(
                  `Faltam ${faltam} ${faltam === 1 ? 'item' : 'itens'} do Checklist de Entrada. Marque Conforme, Não Conforme ou Isento em todos antes de continuar.`
                )
                setSubTab('entrada')
                return
              }
              if (!podeIniciarDiagnostico(formData)) {
                toast.warning('Atribua um mecânico responsável (na aba Cliente e Veículo) antes de continuar para o Diagnóstico.')
                return
              }
              toast.success('Checklist salvo com sucesso!')
              onSaveStep?.()
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f2f4f7] text-[#101828] text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Só disponível com um mecânico já atribuído"
          >
            <ArrowRight size={15} weight="bold" />
            <span>Continuar para Diagnóstico</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!checklistCompleto(checklistEntrada, ITENS_CHECKLIST_ENTRADA)) {
                const faltam = ITENS_CHECKLIST_ENTRADA.filter((item) => !checklistEntrada[item.id]?.status).length
                toast.warning(
                  `Faltam ${faltam} ${faltam === 1 ? 'item' : 'itens'} do Checklist de Entrada. Marque Conforme, Não Conforme ou Isento em todos antes de enviar para a fila.`
                )
                setSubTab('entrada')
                return
              }
              onFinalizarRapido?.()
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Envia a OS para a Fila mesmo sem mecânico atribuído — o diagnóstico fica para depois"
          >
            <FloppyDisk size={15} weight="bold" />
            <span>Salvar e Enviar para Fila</span>
          </button>
        </div>
      </div>
    </div>
  )
}
