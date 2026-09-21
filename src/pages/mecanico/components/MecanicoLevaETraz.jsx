const SERVICOS_LEVA_E_TRAZ = [
  {
    id: 'lt-1',
    veiculo: 'Fiat Doblo 1.8 Cargo',
    placa: 'ASF6I46',
    cliente: 'Edgar Amaral da Silveira',
    tipo: 'Busca realizada',
    motorista: 'Paulo Guinchos',
    horario: 'Hoje às 12:45',
    status: 'Entregue na Oficina (Bancada Box 01)',
    statusCor: 'sky',
  },
  {
    id: 'lt-2',
    veiculo: 'VW Gol 1.6 Trend',
    placa: 'ABC1D23',
    cliente: 'Marcos Vinicius Rezende',
    tipo: 'Entrega agendada',
    motorista: 'Tiago Transportes',
    horario: 'Hoje às 17:30',
    status: 'Aguardando Teste Final da Oficina',
    statusCor: 'amber',
  },
  {
    id: 'lt-3',
    veiculo: 'Chevrolet Onix 1.0 Turbo',
    placa: 'BRA2E19',
    cliente: 'Luciana Ferreira Borges',
    tipo: 'Busca a domicílio',
    motorista: 'Paulo Guinchos',
    horario: 'Amanhã às 08:30',
    status: 'Agendado no Pátio',
    statusCor: 'zinc',
  },
]

export function MecanicoLevaETraz() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-extrabold text-[#101828]">
          Serviço de Leva e Traz - Veículos sob sua Manutenção
        </h3>
        <p className="text-xs text-[#667085]">
          Acompanhe a chegada de veículos pelo motorista da oficina e os carros prontos para retorno.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SERVICOS_LEVA_E_TRAZ.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white border border-[#e4e7ec] rounded-2xl shadow-2xs space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-[#101828]">{item.veiculo}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#101828] text-white">
                {item.placa}
              </span>
            </div>
            <div className="text-[11px] text-[#667085] space-y-0.5">
              <p>Cliente: <strong className="text-[#101828]">{item.cliente}</strong></p>
              <p>Motorista: {item.motorista} • {item.horario}</p>
              <p className="font-semibold text-[#0284c7] pt-1">{item.tipo}</p>
            </div>
            <div className="pt-2 border-t border-[#f2f4f7] text-[11px] font-bold text-[#101828]">
              Status: {item.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
