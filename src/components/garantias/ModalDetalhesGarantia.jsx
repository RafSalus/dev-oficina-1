import React from 'react'
import {
  X,
  SealCheck,
  Car,
  User,
  Clock,
  Wrench,
  ShieldCheck,
  FileText,
  WhatsappLogo,
  WarningCircle,
} from '@phosphor-icons/react'
import { formatarTelefone } from '../../utils/fiscalValidators'

export function ModalDetalhesGarantia({
  garantia,
  isOpen,
  onClose,
  onAcionar,
}) {
  if (!isOpen || !garantia) return null

  const foneLimpo = (garantia.clienteTelefone || '').replace(/\D/g, '')
  const linkWhats = `https://wa.me/55${foneLimpo}?text=${encodeURIComponent(
    `Olá ${garantia.clienteNome}! Estamos em contato sobre a garantia ${garantia.id} do seu veículo ${garantia.veiculo} (OS ${garantia.numeroOS}).`
  )}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Cabeçalho do Modal */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <SealCheck size={22} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900">{garantia.id}</h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-zinc-200 text-zinc-800 rounded">
                  {garantia.numeroOS}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Executado em {new Date(garantia.dataExecucao).toLocaleDateString('pt-BR')} • {garantia.mecanicoResponsavel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo com scroll interno */}
        <div className="p-6 space-y-5 overflow-y-auto no-scrollbar text-xs">
          {/* Cartão Cliente & Veículo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200/80">
            <div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider mb-1">
                <User size={13} />
                <span>Dados do Cliente</span>
              </div>
              <div className="font-bold text-zinc-900 text-sm">{garantia.clienteNome}</div>
              <div className="text-zinc-600 mt-0.5">{formatarTelefone(garantia.clienteTelefone)}</div>
              {garantia.clienteTelefone && (
                <a
                  href={linkWhats}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  <WhatsappLogo size={15} weight="fill" />
                  Abrir conversa no WhatsApp
                </a>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider mb-1">
                <Car size={13} />
                <span>Veículo & Quilometragem</span>
              </div>
              <div className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                <span>{garantia.veiculo}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-zinc-800 text-white rounded font-mono text-[10px] font-bold">
                  {garantia.placa}
                </span>
                <span className="text-zinc-600 text-[11px]">
                  KM inicial: <strong>{garantia.quilometragemExecucao?.toLocaleString('pt-BR')} km</strong>
                </span>
              </div>
              {garantia.quilometragemLimite > 0 && (
                <div className="text-[11px] text-zinc-500 mt-1">
                  Limite de garantia: <strong>{garantia.quilometragemLimite?.toLocaleString('pt-BR')} km</strong>
                </div>
              )}
            </div>
          </div>

          {/* Vigência e Prazos */}
          <div className="bg-sky-50/50 border border-sky-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock size={24} className="text-sky-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase text-sky-800 tracking-wider">
                  Vigência da Garantia
                </span>
                <div className="text-sm font-bold text-zinc-900">
                  Válida até {new Date(garantia.dataValidade).toLocaleDateString('pt-BR')}
                </div>
                <div className="text-zinc-500 text-[11px]">
                  {garantia.diasRestantes > 0
                    ? `${garantia.diasRestantes} dias de cobertura restantes`
                    : 'Período legal e contratual encerrado'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">
                Valor Total da OS
              </span>
              <span className="text-base font-extrabold text-zinc-900">
                R$ {garantia.valorTotalOS?.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Itens Cobertos Discriminados */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
              <Wrench size={14} />
              <span>Itens e Serviços Cobertos</span>
            </h4>
            <div className="border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-100">
              {garantia.itensCobertos?.map((item, idx) => (
                <div key={idx} className="p-3 bg-white flex items-center justify-between hover:bg-zinc-50/60">
                  <div>
                    <div className="font-semibold text-zinc-800">{item.nome}</div>
                    <div className="text-[11px] text-zinc-400">
                      Tipo: {item.tipo === 'PECA' ? 'Peça de Reposição' : 'Mão de Obra Técnica'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700">
                      {item.garantiaMeses} meses
                      {item.garantiaKm > 0 ? ` ou ${item.garantiaKm.toLocaleString('pt-BR')} km` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico de Acionamentos */}
          {garantia.acionamentos?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-2 flex items-center gap-1.5">
                <WarningCircle size={14} />
                <span>Histórico de Retornos / Acionamentos</span>
              </h4>
              <div className="space-y-2">
                {garantia.acionamentos.map((ac) => (
                  <div key={ac.id} className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900">{ac.id} — {ac.dataAcionamento}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-rose-200 text-rose-800 rounded">
                        {ac.statusAcionamento}
                      </span>
                    </div>
                    <p className="text-zinc-700 text-xs">{ac.motivoReclamacao}</p>
                    {ac.parecerTecnico && (
                      <p className="text-zinc-500 text-[11px] italic">Parecer: {ac.parecerTecnico}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observações / Termo da Oficina */}
          <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 text-zinc-600 text-[11px] space-y-1">
            <span className="font-bold text-zinc-800 block">Termos e Condições da Garantia:</span>
            <p>
              Garantia legal de 90 dias conforme Art. 26 do Código de Defesa do Consumidor (CDC) complementada por garantia contratual das peças aplicadas pelo fabricante. A garantia não cobre danos por mau uso, sinistros ou intervenções de terceiros.
            </p>
            {garantia.observacoes && (
              <p className="text-zinc-800 font-medium pt-1">
                <strong>Nota do Atendimento:</strong> {garantia.observacoes}
              </p>
            )}
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>

          {garantia.status !== 'EXPIRADA' && (
            <button
              type="button"
              onClick={() => {
                onClose()
                onAcionar(garantia)
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <WarningCircle size={15} weight="bold" />
              <span>Registrar Retorno / Acionamento</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
