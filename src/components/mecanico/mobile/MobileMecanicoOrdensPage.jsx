import React, { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ClipboardText, HandGrabbing, CarProfile } from '@phosphor-icons/react'
import { useMecanico } from '../../../context/MecanicoContext'
import { obterOrdensAbertas, STATUS_ORCAMENTO, assumirOrdemSemMecanico } from '../../../pages/dashboard/orcamento/mockOrdensAbertas'

// Tela mobile "Minhas OS" — lista as ordens já atribuídas ao mecânico ativo e, acima delas,
// a Fila Disponível (OS sem mecânico) para que ele possa puxar uma para si (D4: só funciona
// em OS ainda sem atribuição — reatribuir uma OS de outro mecânico continua sendo ação da
// secretaria/gestão).
export function MobileMecanicoOrdensPage() {
  const { mecanicoAtivo } = useMecanico()
  const [ordens, setOrdens] = useState(() => obterOrdensAbertas())

  const recarregar = () => setOrdens(obterOrdensAbertas())

  const minhasOS = useMemo(
    () => ordens.filter((os) => os.mecanicoNome === mecanicoAtivo.nome),
    [ordens, mecanicoAtivo.nome]
  )

  const ordensDisponiveis = useMemo(
    () =>
      ordens.filter(
        (os) => os.status === 'fila' && !(os.mecanicoId || (os.mecanicoNome && os.mecanicoNome !== 'Não atribuído'))
      ),
    [ordens]
  )

  const handlePuxar = (numeroOS) => {
    const resultado = assumirOrdemSemMecanico(numeroOS, mecanicoAtivo.value, mecanicoAtivo.nome)
    if (resultado.erro) {
      toast.warning(resultado.erro)
      return
    }
    recarregar()
    toast.success(`OS #${numeroOS} atribuída a você! Preencha a vistoria e o diagnóstico para avançar.`)
  }

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-[#101828] tracking-tight">Minhas Ordens de Serviço</h1>
        <p className="text-xs text-[#667085] font-medium">{mecanicoAtivo.nome}</p>
      </div>

      {ordensDisponiveis.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-[#0369a1] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <HandGrabbing size={14} weight="bold" />
            Fila Disponível para Atendimento
          </h2>
          <div className="bg-[#f0f9ff] rounded-2xl border border-[#bae6fd] divide-y divide-[#e0f2fe] overflow-hidden">
            {ordensDisponiveis.map((os) => (
              <div key={os.numeroOS} className="p-3.5 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#101828] truncate">#{os.numeroOS} • {os.cliente}</p>
                  <p className="text-[11px] text-[#667085] truncate">{os.placa} • {os.marcaModelo}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePuxar(os.numeroOS)}
                  className="shrink-0 h-9 px-3 rounded-xl bg-[#0284c7] active:bg-[#0369a1] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <HandGrabbing size={14} weight="bold" />
                  Puxar OS
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xs font-bold text-[#101828] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ClipboardText size={14} weight="bold" />
          Minhas OS Atribuídas ({minhasOS.length})
        </h2>

        {minhasOS.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e4e7ec] p-6 text-center">
            <p className="text-xs text-[#667085]">Nenhuma OS atribuída a você no momento.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e4e7ec] divide-y divide-[#f2f4f7] overflow-hidden">
            {minhasOS.map((os) => {
              const statusInfo = STATUS_ORCAMENTO.find((s) => s.value === os.status) || STATUS_ORCAMENTO[1]
              return (
                <div key={os.numeroOS} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f2f4f7] flex items-center justify-center shrink-0">
                    <CarProfile size={18} className="text-[#101828]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#101828] truncate">#{os.numeroOS} • {os.cliente}</p>
                    <p className="text-[11px] text-[#667085] truncate">{os.placa} • {os.marcaModelo}</p>
                  </div>
                  <span
                    className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${statusInfo.badgeBg} ${statusInfo.badgeText} ${statusInfo.border}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
