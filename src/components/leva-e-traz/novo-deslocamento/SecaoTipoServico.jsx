import React from 'react'
import { Car, User, Package, Wrench } from '@phosphor-icons/react'

export function SecaoTipoServico({ tipoServico, setTipoServico }) {
  const tipos = [
    { id: 'busca_veiculo', label: 'Busca de Carro', icon: Car },
    { id: 'entrega_veiculo', label: 'Entrega de Carro', icon: Car },
    { id: 'translado_cliente', label: 'Leva e Traz Cliente', icon: User },
    { id: 'busca_pecas', label: 'Busca de Peças', icon: Package },
    { id: 'socorro_externo', label: 'Socorro Mecânico', icon: Wrench },
  ]

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
        Tipo de Serviço de Logística *
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {tipos.map((tipo) => {
          const IconeTipo = tipo.icon
          const ativo = tipoServico === tipo.id
          return (
            <button
              key={tipo.id}
              type="button"
              onClick={() => setTipoServico(tipo.id)}
              className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                ativo
                  ? 'bg-sky-50 border-sky-600 text-sky-800 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 font-medium'
              }`}
            >
              <IconeTipo size={18} className={ativo ? 'text-sky-600' : 'text-slate-500'} />
              <span className="text-[11px] leading-tight">{tipo.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
