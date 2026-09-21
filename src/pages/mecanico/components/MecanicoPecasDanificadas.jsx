import { Plus } from '@phosphor-icons/react'

export function MecanicoPecasDanificadas({ pecasDanificadas, onAbrirModal }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-[#101828]">
            Registro de Peças Danificadas e Avarias
          </h3>
          <p className="text-xs text-[#667085]">
            Controle de peças substituídas, comprovação para o cliente e descarte correto.
          </p>
        </div>
        <button
          type="button"
          onClick={onAbrirModal}
          className="px-3.5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <Plus size={15} weight="bold" />
          <span>Registrar Peça Danificada</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pecasDanificadas.map((item) => (
          <div
            key={item.id}
            className="p-3.5 bg-white border border-[#e4e7ec] rounded-2xl shadow-2xs space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#101828] text-sm">{item.peca}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {item.tipoDestino}
              </span>
            </div>
            <div className="text-[11px] text-[#667085] space-y-0.5">
              <p>Veículo: <strong className="text-[#101828]">{item.veiculo}</strong> (OS #{item.numeroOS})</p>
              <p>Mecânico: {item.mecanicoNome} • Cód: {item.codigoPeca || '—'}</p>
              <p className="text-[#475467] italic pt-1">"{item.motivo}"</p>
            </div>
            <div className="pt-2 border-t border-[#f2f4f7] flex items-center justify-between text-[10px] text-[#98a2b3]">
              <span>Registrado em {item.dataRegistro}</span>
              <span className="font-bold text-[#0284c7]">{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
