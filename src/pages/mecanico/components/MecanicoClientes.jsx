import { WhatsappLogo, CircleNotch } from '@phosphor-icons/react'
import { useClientesCadastrados } from '../../../hooks/useClientesCadastrados'

export function MecanicoClientes() {
  const { clientes, carregando } = useClientesCadastrados({ incluirVeiculos: true })

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

      {carregando ? (
        <div className="flex items-center justify-center p-8 text-[#667085] gap-2">
          <CircleNotch size={20} className="animate-spin text-[#0284c7]" />
          <span className="text-xs font-medium">Carregando clientes...</span>
        </div>
      ) : clientes.length === 0 ? (
        <div className="p-8 text-center bg-white border border-[#e4e7ec] rounded-2xl text-xs text-[#667085]">
          Nenhum cliente cadastrado no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {clientes.slice(0, 9).map((cli) => {
            const veic = cli.veiculos?.[0]
            const telLimpo = (cli.whatsapp || cli.telefone || '').replace(/\D/g, '')
            return (
              <div
                key={cli.id || cli.value}
                className="p-3.5 bg-white border border-[#e4e7ec] rounded-2xl shadow-2xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#101828] text-sm truncate">{cli.nome}</span>
                  {veic?.placa && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0284c7] text-white">
                      {veic.placa}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#667085] space-y-0.5">
                  <p>Carro: <strong className="text-[#101828]">{veic?.marcaModelo || (veic?.marca ? `${veic.marca} ${veic.modelo || ''}` : 'Não informado')} {veic?.ano ? `(${veic.ano})` : ''}</strong></p>
                  <p>Cor: {veic?.cor || 'Não informada'} • KM: {veic?.kmAtual || veic?.kmPadrao || 0} KM</p>
                  <p>Telefone: {cli.telefone || 'Não informado'}</p>
                </div>
                {telLimpo && (
                  <div className="pt-2 border-t border-[#f2f4f7] flex items-center justify-between">
                    <a
                      href={`https://wa.me/55${telLimpo}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#25D366] hover:underline"
                    >
                      <WhatsappLogo size={15} weight="fill" />
                      <span>WhatsApp Direto</span>
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
