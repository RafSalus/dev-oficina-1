// Usado também no preview da aba "Minha Bancada" (MecanicoVisaoGeral) — fonte única.
export const AGENDA_DO_DIA = []

export function MecanicoAgenda({ mecanicoNome, setOsSelecionadaId, setActiveTab }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-extrabold text-[#101828]">
          Agenda e Distribuição de Horários - {mecanicoNome}
        </h3>
        <p className="text-xs text-[#667085]">
          Escala de boxes e atendimentos programados para a sua bancada hoje.
        </p>
      </div>

      <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden bg-white">
        <div className="divide-y divide-[#f2f4f7]">
          {AGENDA_DO_DIA.length === 0 && (
            <p className="p-4 text-xs text-[#667085]">Nenhum atendimento programado para hoje.</p>
          )}
          {AGENDA_DO_DIA.map((item, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-[#f8fafc]">
              <div className="flex items-center gap-4">
                <div className="w-24 font-mono font-bold text-[#0284c7] text-sm shrink-0">
                  {item.horario}
                </div>
                <div>
                  <span className="font-bold text-[#101828] text-sm block">{item.veiculo}</span>
                  <span className="text-[#475467] block text-xs mt-0.5">{item.servico}</span>
                  <span className="text-[11px] text-[#667085] block mt-0.5">
                    Local: {item.elevador} • OS #{item.osNumero}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#f2f4f7] text-[#101828]">
                  {item.status}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOsSelecionadaId(item.osNumero)
                    setActiveTab('dashboard')
                  }}
                  className="px-3 py-1.5 bg-[#101828] text-white rounded-xl font-bold cursor-pointer hover:bg-black"
                >
                  Abrir OS
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
