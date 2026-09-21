import { useState } from 'react'
import { ShieldCheck } from '@phosphor-icons/react'
import { ITENS_CHECKLIST_ENTRADA } from '../../../../constants/checklistItems'
import { AbaClienteVeiculo } from './abas/AbaClienteVeiculo'
import { AbaSintomasRelato } from './abas/AbaSintomasRelato'
import { AbaChecklistVistoria } from './abas/AbaChecklistVistoria'
import { AbaItensAtribuicao } from './abas/AbaItensAtribuicao'

const ABAS_FORMULARIO = [
  { id: 'cliente-veiculo', label: 'Cliente e Veiculo' },
  { id: 'sintomas-relato', label: 'Sintomas e Relato' },
  { id: 'checklist-vistoria', label: 'Vistoria de Entrada' },
  { id: 'itens-atribuicao', label: 'Equipe Responsavel' },
]

export function OsFormularioAbertura({ formData, updateFormData, onEnviarAssinatura }) {
  const [abaAtiva, setAbaAtiva] = useState('cliente-veiculo')

  const checklistEntrada = formData.checklistEntrada || {}
  const totalItens = ITENS_CHECKLIST_ENTRADA.length
  const preenchidosCount = ITENS_CHECKLIST_ENTRADA.filter((item) => Boolean(checklistEntrada[item.id]?.status)).length
  const naoConformesCount = ITENS_CHECKLIST_ENTRADA.filter((item) => checklistEntrada[item.id]?.status === 'nao_conforme').length

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
      {/* Aviso quando esta OS foi aberta atendendo alguem da Fila de Atendimento da Agenda */}
      {formData.filaEsperaId && (
        <div className="shrink-0 mb-3 p-2.5 rounded-2xl bg-[#f0f9ff] border border-[#bae6fd] text-[10.5px] text-[#0369a1] font-semibold flex items-center gap-1.5">
          <ShieldCheck size={14} weight="fill" className="shrink-0" />
          <span>Atendendo cliente da Fila de Atendimento (Agenda) — sai de la ao salvar esta OS.</span>
        </div>
      )}

      {/* Abas do Formulario: Cliente/Veiculo, Sintomas/Relato, Vistoria de Entrada, Equipe Responsavel */}
      <div className="shrink-0 mb-3 flex items-center gap-1.5 p-1 bg-[#f2f4f7] rounded-2xl border border-[#e4e7ec]">
        {ABAS_FORMULARIO.map((aba) => (
          <button
            key={aba.id}
            type="button"
            onClick={() => setAbaAtiva(aba.id)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              abaAtiva === aba.id
                ? 'bg-[#101828] text-white shadow-2xs'
                : 'text-[#475467] hover:bg-white hover:text-[#101828]'
            }`}
          >
            <span>{aba.label}</span>
            {aba.id === 'sintomas-relato' && !formData.relatoCliente?.trim() && (
              <span
                title="Obrigatorio para salvar a OS"
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  abaAtiva === 'sintomas-relato' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                }`}
              >
                Obrigatorio
              </span>
            )}
            {aba.id === 'checklist-vistoria' && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  abaAtiva === 'checklist-vistoria' ? 'bg-[#0284c7] text-white' : 'bg-[#e4e7ec] text-[#475467]'
                } ${naoConformesCount > 0 ? '!bg-amber-500 !text-white' : ''}`}
              >
                {preenchidosCount}/{totalItens}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Painel da aba ativa — key reinicia a rolagem ao trocar de aba */}
      <div key={abaAtiva} className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3 pb-1">
        {abaAtiva === 'cliente-veiculo' && (
          <AbaClienteVeiculo formData={formData} updateFormData={updateFormData} />
        )}

        {abaAtiva === 'sintomas-relato' && (
          <AbaSintomasRelato formData={formData} updateFormData={updateFormData} />
        )}

        {abaAtiva === 'checklist-vistoria' && (
          <AbaChecklistVistoria
            checklistEntrada={checklistEntrada}
            preenchidosCount={preenchidosCount}
            totalItens={totalItens}
            naoConformesCount={naoConformesCount}
            fotosVeiculoEntrada={formData.fotosVeiculoEntrada}
            updateFormData={updateFormData}
            onEnviarAssinatura={onEnviarAssinatura}
          />
        )}

        {abaAtiva === 'itens-atribuicao' && (
          <AbaItensAtribuicao formData={formData} updateFormData={updateFormData} />
        )}
      </div>
    </div>
  )
}
