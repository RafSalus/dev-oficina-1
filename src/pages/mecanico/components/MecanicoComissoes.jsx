export function MecanicoComissoes({ metricasMecanico, ordensDoMecanico }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl">
          <span className="text-[10px] font-bold text-[#0369a1] uppercase">Taxa de Comissão</span>
          <span className="text-2xl font-black text-[#0284c7] block mt-1 font-mono">
            {metricasMecanico.percComissao}%
          </span>
          <span className="text-[11px] text-[#475467] block mt-0.5">Sobre serviços de oficina</span>
        </div>

        <div className="p-4 bg-white border border-[#d0d5dd] rounded-2xl">
          <span className="text-[10px] font-bold text-[#667085] uppercase">Total de Mão de Obra</span>
          <span className="text-2xl font-black text-[#101828] block mt-1 font-mono">
            R$ {metricasMecanico.totalMaoObra.toFixed(2)}
          </span>
          <span className="text-[11px] text-[#475467] block mt-0.5">Serviços executados</span>
        </div>

        <div className="p-4 bg-[#101828] text-white rounded-2xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Comissão Acumulada</span>
          <span className="text-2xl font-black text-[#38bdf8] block mt-1 font-mono">
            R$ {metricasMecanico.comissaoAcumulada.toFixed(2)}
          </span>
          <span className="text-[11px] text-gray-300 block mt-0.5">Disponível no fechamento</span>
        </div>

        <div className="p-4 bg-white border border-[#d0d5dd] rounded-2xl">
          <span className="text-[10px] font-bold text-[#667085] uppercase">Previsão Mensal</span>
          <span className="text-2xl font-black text-[#101828] block mt-1 font-mono">
            R$ {(metricasMecanico.comissaoAcumulada * 3.5).toFixed(2)}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">Meta em 85%</span>
        </div>
      </div>

      {/* Detalhamento de cada serviço e comissão */}
      <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden bg-white">
        <div className="p-3.5 bg-[#f8fafc] border-b border-[#e4e7ec] font-extrabold text-xs text-[#101828] uppercase tracking-wider">
          Extrato de Serviços e Comissões do Mecânico
        </div>
        <div className="divide-y divide-[#f2f4f7]">
          {ordensDoMecanico.flatMap((os) =>
            (os.servicosOS || []).map((s, idx) => {
              const valor = (s.precoUnitario || s.valorUnitario || 0) * (s.quantidade || 1)
              const comissao = valor * (metricasMecanico.percComissao / 100)
              return (
                <div key={`${os.numeroOS}-${idx}`} className="p-3 text-xs flex items-center justify-between hover:bg-[#f8fafc]">
                  <div>
                    <span className="font-bold text-[#101828] block">{s.nome}</span>
                    <span className="text-[#667085] text-[11px]">
                      OS #{os.numeroOS} • {os.marcaModelo} ({os.placa}) • Cód: {s.codigo}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#101828] block font-mono">
                      R$ {valor.toFixed(2)}
                    </span>
                    <span className="text-[11px] font-black text-[#0284c7] block font-mono">
                      Comissão: R$ {comissao.toFixed(2)}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
