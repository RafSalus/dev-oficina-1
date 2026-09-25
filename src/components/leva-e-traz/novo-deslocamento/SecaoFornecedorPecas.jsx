import React from 'react'
import { IMaskInput } from 'react-imask'
import { Package } from '@phosphor-icons/react'

export function SecaoFornecedorPecas({
  fornecedorNome,
  setFornecedorNome,
  fornecedorTelefone,
  setFornecedorTelefone,
  numeroOS,
  setNumeroOS,
  pecasDescricao,
  setPecasDescricao,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
        <Package size={14} className="text-sky-600" />
        <span>Dados do Fornecedor e Peças a Coletar</span>
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Fornecedor / Distribuidora *</label>
          <input
            type="text"
            value={fornecedorNome}
            onChange={(e) => setFornecedorNome(e.target.value)}
            placeholder="Ex: Radiadores Apucarana, Distribuidora Nakata..."
            className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-600"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">Telefone Fornecedor</label>
          <IMaskInput
            mask="(00) 00000-0000"
            value={fornecedorTelefone}
            onAccept={(value) => setFornecedorTelefone(value)}
            placeholder="(43) 3333-0000"
            className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-sky-600"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">Nº OS / Cotação</label>
          <input
            type="text"
            value={numeroOS}
            onChange={(e) => setNumeroOS(e.target.value)}
            placeholder="Ex: OS #002908"
            className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-sky-600"
          />
        </div>

        <div className="sm:col-span-12">
          <label className="block text-xs font-bold text-slate-700 mb-1">Descrição das Peças / Insumos</label>
          <input
            type="text"
            value={pecasDescricao}
            onChange={(e) => setPecasDescricao(e.target.value)}
            placeholder="Ex: 1x Tubo de água de arrefecimento, 2x Abraçadeiras, 1x Aditivo Paraflu..."
            className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-600"
          />
        </div>
      </div>
    </div>
  )
}
