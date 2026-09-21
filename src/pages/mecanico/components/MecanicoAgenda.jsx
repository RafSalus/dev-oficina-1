// Usado também no preview da aba "Minha Bancada" (MecanicoVisaoGeral) — fonte única.
export const AGENDA_DO_DIA = [
  {
    horario: '08:00 - 10:30',
    veiculo: 'Fiat Doblo 1.8 Cargo (ASF6I46)',
    servico: 'Troca Tubo de Água do Coletor e Limpeza Arrefecimento',
    elevador: 'Box 01 (Elevador Hidráulico)',
    status: 'Em Andamento',
    osNumero: '002908',
  },
  {
    horario: '10:30 - 12:00',
    veiculo: 'VW Gol 1.6 Trend (ABC1D23)',
    servico: 'Troca de Discos e Pastilhas Dianteiras',
    elevador: 'Box 01 (Elevador Hidráulico)',
    status: 'Aguardando Aprovação de Peças',
    osNumero: '002909',
  },
  {
    horario: '13:30 - 15:30',
    veiculo: 'Chevrolet Onix 1.0 Turbo (BRA2E19)',
    servico: 'Substituição Amortecedores Dianteiros e Buchas',
    elevador: 'Box 01 (Elevador Hidráulico)',
    status: 'Agendado',
    osNumero: '002911',
  },
  {
    horario: '16:00 - 17:30',
    veiculo: 'Toyota Corolla 2.0 XEi (TYT5J88)',
    servico: 'Revisão Preventiva de 60.000 km e Troca de Fluidos',
    elevador: 'Box 01 (Elevador Hidráulico)',
    status: 'Agendado',
    osNumero: '002913',
  },
]

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
