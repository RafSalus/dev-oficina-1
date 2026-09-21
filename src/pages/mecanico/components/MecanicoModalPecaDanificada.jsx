import { X } from '@phosphor-icons/react'
import Select from 'react-select'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'

const OPCOES_DESTINO_PECA = [
  { value: 'Descarte Ambiental', label: 'Descarte Ambiental Responsável' },
  { value: 'Garantia do Fabricante', label: 'Acionamento de Garantia do Fabricante' },
  { value: 'Devolução ao Cliente', label: 'Devolução ao Cliente (Visualização)' },
]

// Modal renderizado no orquestrador (MecanicoDashboardPage), não na aba "Peças Danificadas" —
// assim ele permanece aberto mesmo que o mecânico troque de aba antes de concluir o registro,
// preservando o comportamento original em que o modal era um irmão de nível de página.
export function MecanicoModalPecaDanificada({ aberto, form, setForm, onFechar, onSubmit }) {
  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl max-w-md w-full p-5 text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#e4e7ec] pb-3">
          <h3 className="text-sm font-extrabold text-[#101828]">Registrar Peça Danificada</h3>
          <button type="button" onClick={onFechar} className="text-[#667085] hover:text-[#101828]">
            <X size={16} weight="bold" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="font-bold text-[#344054] block mb-1">Descrição da Peça Avariada:</label>
            <input
              type="text"
              required
              value={form.peca}
              onChange={(e) => setForm({ ...form, peca: e.target.value })}
              placeholder="Ex: Amortecedor vazando óleo com haste riscada"
              className="w-full h-9 px-3 border border-[#d0d5dd] rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-[#344054] block mb-1">Código da Peça (se houver):</label>
            <input
              type="text"
              value={form.codigoPeca}
              onChange={(e) => setForm({ ...form, codigoPeca: e.target.value })}
              placeholder="Ex: 014290"
              className="w-full h-9 px-3 border border-[#d0d5dd] rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-[#344054] block mb-1">Motivo do Defeito:</label>
            <input
              type="text"
              value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              className="w-full h-9 px-3 border border-[#d0d5dd] rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-[#344054] block mb-1">Destino da Peça:</label>
            <Select
              options={OPCOES_DESTINO_PECA}
              value={OPCOES_DESTINO_PECA.find((o) => o.value === form.tipoDestino) || OPCOES_DESTINO_PECA[0]}
              onChange={(opt) => setForm({ ...form, tipoDestino: opt ? opt.value : 'Descarte Ambiental' })}
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
            <button type="submit" className="px-4 py-2 bg-[#0284c7] text-white rounded-xl font-bold shadow-xs">
              Gravar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const FORM_PECA_DANIFICADA_INICIAL = {
  peca: '',
  codigoPeca: '',
  motivo: 'Desgaste severo e ressecamento térmico',
  tipoDestino: 'Descarte Ambiental',
}
