const SERVICOS_LEVA_E_TRAZ = []

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

      {SERVICOS_LEVA_E_TRAZ.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e4e7ec] p-6 text-center">
          <p className="text-xs text-[#667085]">Nenhum deslocamento de leva e traz no momento.</p>
        </div>
      ) : (
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
      )}
    </div>
  )
}
