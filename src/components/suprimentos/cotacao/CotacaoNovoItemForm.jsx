import React from 'react'
import { CheckCircle } from '@phosphor-icons/react'

/** Estado inicial do formulário rápido de peça. */
export const FORM_NOVO_ITEM_VAZIO = {
  codigo: '',
  nome: '',
  quantidade: 1,
  unidade: 'UN',
  marcaSugerida: '',
  observacoes: '',
}

const INPUT = 'w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-500'
const INPUT_CENTRO =
  'w-full h-9 px-2 rounded-lg border border-slate-300 text-xs font-bold text-center text-slate-900 bg-white focus:outline-none focus:border-sky-500 font-mono'

function Campo({ rotulo, className = '', children }) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">{rotulo}</label>
      {children}
    </div>
  )
}

/**
 * Formulário inline para incluir uma peça avulsa na cotação. O estado fica no
 * painel pai para que "Cancelar" apenas oculte o formulário, mantendo o que foi digitado.
 * @param {{
 *   form: object, setForm: Function,
 *   onAdicionar: (form: object) => boolean,
 *   onFechar: Function
 * }} props - `onAdicionar` devolve true quando a peça foi aceita; então o formulário é limpo e fechado.
 */
export function CotacaoNovoItemForm({ form, setForm, onAdicionar, onFechar }) {
  const alterar = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }))

  const confirmar = (e) => {
    e?.preventDefault()
    if (onAdicionar(form)) {
      setForm(FORM_NOVO_ITEM_VAZIO)
      onFechar()
    }
  }

  return (
    <div className="p-4 bg-sky-50/50 border border-sky-200 rounded-xl space-y-3 animate-in fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-sky-900">Cadastrar Peça para Cotação</span>
        <button type="button" onClick={onFechar} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
          Cancelar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Campo rotulo="Código SKU / Fabricante">
          <input
            type="text"
            value={form.codigo}
            onChange={(e) => alterar('codigo', e.target.value)}
            placeholder="Ex: 0018969"
            className={`${INPUT} font-mono`}
          />
        </Campo>

        <Campo rotulo="Nome / Descrição da Peça *" className="sm:col-span-2">
          <input
            type="text"
            value={form.nome}
            onChange={(e) => alterar('nome', e.target.value)}
            placeholder="Ex: Tubo Suporte de Arrefecimento"
            className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-sky-500"
          />
        </Campo>

        <div className="grid grid-cols-2 gap-2">
          <Campo rotulo="Quantidade">
            <input
              type="number"
              min="1"
              value={form.quantidade}
              onChange={(e) => alterar('quantidade', Math.max(1, parseInt(e.target.value) || 1))}
              className={INPUT_CENTRO}
            />
          </Campo>
          <Campo rotulo="Unidade">
            <input
              type="text"
              value={form.unidade}
              onChange={(e) => alterar('unidade', e.target.value.toUpperCase())}
              placeholder="UN"
              className={INPUT_CENTRO}
            />
          </Campo>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Campo rotulo="Marca Sugerida / Linha Preferencial">
          <input
            type="text"
            value={form.marcaSugerida}
            onChange={(e) => alterar('marcaSugerida', e.target.value)}
            placeholder="Ex: Valclei / Original Fiat"
            className={INPUT}
          />
        </Campo>

        <Campo rotulo="Observação / Defeito Constatado pelo Mecânico">
          <input
            type="text"
            value={form.observacoes}
            onChange={(e) => alterar('observacoes', e.target.value)}
            placeholder="Ex: Fissura plástica com vazamento no arrefecimento"
            className={INPUT}
          />
        </Campo>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={confirmar}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          <CheckCircle size={15} weight="bold" />
          <span>Confirmar Peça na Cotação</span>
        </button>
      </div>
    </div>
  )
}
