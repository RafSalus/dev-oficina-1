import { X } from '@phosphor-icons/react'
import Select from 'react-select'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'

const OPCOES_URGENCIA_FERRAMENTA = [
  { value: 'baixa', label: 'Baixa (Pode aguardar revisão mensal)' },
  { value: 'media', label: 'Média (Uso diário)' },
  { value: 'alta', label: 'Alta (Impede o andamento do trabalho)' },
]

// Modal renderizado no orquestrador (MecanicoDashboardPage), não na aba "Ferramentas" —
// assim ele permanece aberto mesmo que o mecânico troque de aba antes de concluir o relato,
// preservando o comportamento original em que o modal era um irmão de nível de página.
export function MecanicoModalFerramenta({ aberto, form, setForm, onFechar, onSubmit }) {
  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl max-w-md w-full p-5 text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#e4e7ec] pb-3">
          <h3 className="text-sm font-extrabold text-[#101828]">Relatar Ferramenta Danificada</h3>
          <button type="button" onClick={onFechar} className="text-[#667085] hover:text-[#101828]">
            <X size={16} weight="bold" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="font-bold text-[#344054] block mb-1">Nome da Ferramenta / Equipamento:</label>
            <input
              type="text"
              required
              value={form.ferramenta}
              onChange={(e) => setForm({ ...form, ferramenta: e.target.value })}
              placeholder="Ex: Torquímetro de Estalo, Scanner KTS, Macaco Jacaré"
              className="w-full h-9 px-3 border border-[#d0d5dd] rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-[#344054] block mb-1">Defeito Observado:</label>
            <textarea
              required
              rows={3}
              value={form.problema}
              onChange={(e) => setForm({ ...form, problema: e.target.value })}
              placeholder="Ex: Escapando pressão de ar pelo gatilho, trava quebrou..."
              className="w-full p-2.5 border border-[#d0d5dd] rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-[#344054] block mb-1">Nível de Urgência:</label>
            <Select
              options={OPCOES_URGENCIA_FERRAMENTA}
              value={OPCOES_URGENCIA_FERRAMENTA.find((o) => o.value === form.urgencia) || OPCOES_URGENCIA_FERRAMENTA[0]}
              onChange={(opt) => setForm({ ...form, urgencia: opt ? opt.value : 'baixa' })}
              styles={customSelectStyles}
              isSearchable={false}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onFechar}
              className="px-3 py-2 border border-[#d0d5dd] rounded-xl font-bold text-[#475467]"
            >
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold shadow-xs">
              Abrir Chamado
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const FORM_FERRAMENTA_INICIAL = {
  ferramenta: '',
  problema: '',
  urgencia: 'media',
}
