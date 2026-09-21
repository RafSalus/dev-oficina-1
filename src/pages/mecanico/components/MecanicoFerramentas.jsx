import { Plus } from '@phosphor-icons/react'

export function MecanicoFerramentas({ ferramentasDanificadas, onAbrirModal }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-[#101828]">
            Controle de Ferramentas e Equipamentos da Oficina
          </h3>
          <p className="text-xs text-[#667085]">
            Relate ferramentas quebradas, descalibradas ou que necessitam de substituição imediata.
          </p>
        </div>
        <button
          type="button"
          onClick={onAbrirModal}
          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <Plus size={15} weight="bold" />
          <span>Relatar Ferramenta Danificada</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ferramentasDanificadas.map((ferr) => (
          <div
            key={ferr.id}
            className="p-3.5 bg-white border border-[#e4e7ec] rounded-2xl shadow-2xs space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#101828] text-sm">{ferr.ferramenta}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                ferr.urgencia === 'alta'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                Urgência: {ferr.urgencia}
              </span>
            </div>
            <div className="text-[11px] text-[#667085] space-y-0.5">
              <p>Bancada: <strong className="text-[#101828]">{ferr.box}</strong> • Relatado por: {ferr.mecanicoNome}</p>
              <p className="text-[#475467] pt-1">Defeito: {ferr.problema}</p>
            </div>
            <div className="pt-2 border-t border-[#f2f4f7] flex items-center justify-between text-[10px] text-[#98a2b3]">
              <span>{ferr.dataRegistro}</span>
              <span className="font-bold text-[#101828]">{ferr.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
