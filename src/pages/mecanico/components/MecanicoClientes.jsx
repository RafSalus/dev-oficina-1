import { WhatsappLogo } from '@phosphor-icons/react'
import { MOCK_CLIENTES_VEICULOS } from '../../../constants/mockClientesVeiculos'

export function MecanicoClientes() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-extrabold text-[#101828]">
          Consulta de Clientes e Histórico do Veículo
        </h3>
        <p className="text-xs text-[#667085]">
          Localize rapidamente dados de contato e ficha do cliente para alinhamentos técnicos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {MOCK_CLIENTES_VEICULOS.slice(0, 9).map((cli) => {
          const veic = cli.veiculos[0]
          return (
            <div
              key={cli.id}
              className="p-3.5 bg-white border border-[#e4e7ec] rounded-2xl shadow-2xs space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#101828] text-sm truncate">{cli.nome}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0284c7] text-white">
                  {veic?.placa}
                </span>
              </div>
              <div className="text-[11px] text-[#667085] space-y-0.5">
                <p>Carro: <strong className="text-[#101828]">{veic?.marcaModelo} ({veic?.ano})</strong></p>
                <p>Cor: {veic?.cor} • KM Padrão: {veic?.kmPadrao} KM</p>
                <p>Telefone: {cli.telefone}</p>
              </div>
              <div className="pt-2 border-t border-[#f2f4f7] flex items-center justify-between">
                <a
                  href={`https://wa.me/55${cli.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#25D366] hover:underline"
                >
                  <WhatsappLogo size={15} weight="fill" />
                  <span>WhatsApp Direto</span>
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
