import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ShieldCheck,
  Car,
  X,
  CheckCircle,
  WarningCircle,
  MinusCircle,
  WhatsappLogo,
  PenNib,
  Receipt,
  Camera,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { obterOrdensAbertas, obterOrdensFinalizadas } from './dashboard/orcamento/mockOrdensAbertas'
import {
  ITENS_CHECKLIST_ENTRADA,
  FOTOS_VEICULO_TIPOS,
  carregarAssinaturaVistoria,
  salvarAssinaturaVistoria,
} from '../constants/checklistItems'

export function VistoriaEntradaClientePage() {
  const { id } = useParams()
  const numeroOS = id

  const dadosOS = useMemo(() => {
    return (
      obterOrdensAbertas().find((o) => String(o.numeroOS) === String(numeroOS)) ||
      obterOrdensFinalizadas().find((o) => String(o.numeroOS) === String(numeroOS)) ||
      null
    )
  }, [numeroOS])

  const [assinatura, setAssinatura] = useState(() => carregarAssinaturaVistoria(numeroOS))
  const [nomeAssinante, setNomeAssinante] = useState('')

  const checklist = dadosOS?.checklistEntrada || {}
  const totalItens = ITENS_CHECKLIST_ENTRADA.length
  const conformesCount = ITENS_CHECKLIST_ENTRADA.filter((i) => checklist[i.id]?.status === 'conforme').length
  const naoConformesCount = ITENS_CHECKLIST_ENTRADA.filter((i) => checklist[i.id]?.status === 'nao_conforme').length

  const handleFecharAba = () => {
    window.close()
    setTimeout(() => {
      if (!window.closed) {
        if (window.history.length > 1) {
          window.history.back()
        } else {
          window.location.href = '/'
        }
      }
    }, 150)
  }

  const handleAssinar = (e) => {
    e.preventDefault()
    const nomeFinal = nomeAssinante.trim()
    if (!nomeFinal) {
      toast.warning('Informe seu nome completo para confirmar a assinatura.')
      return
    }

    const agora = new Date()
    const registro = {
      numeroOS,
      nomeAssinante: nomeFinal,
      dataHora: `${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      conformesCount,
      naoConformesCount,
      totalItens,
    }

    salvarAssinaturaVistoria(numeroOS, registro)
    setAssinatura(registro)
    toast.success('Checklist confirmado e assinado digitalmente!')
  }

  const handleFalarComOficina = () => {
    const msg = `Olá! Estou vendo o checklist de vistoria de entrada da OS #${numeroOS} e gostaria de tirar uma dúvida.`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (!dadosOS) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 select-none">
        <div className="max-w-sm w-full bg-white border border-[#d0d5dd] rounded-2xl p-6 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3]">
            <Receipt size={24} weight="duotone" />
          </div>
          <h1 className="text-sm font-bold text-[#101828]">Checklist não encontrado</h1>
          <p className="text-xs text-[#667085]">
            Não localizamos a Ordem de Serviço #{numeroOS}. Verifique o link recebido ou fale com a oficina.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#101828] flex flex-col pb-16 select-none">
      {/* Cabecalho do Portal do Cliente */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#d0d5dd] shadow-xs px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/favicon-96x96.png"
              alt="Mecânica Gabriel"
              className="w-9 h-9 object-contain rounded-xl border border-[#e4e7ec] shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-sm font-black text-[#101828] leading-tight truncate">Mecânica Gabriel</h1>
              <span className="text-[10px] font-semibold text-[#667085] block truncate">
                Vistoria de Entrada • OS #{numeroOS}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleFalarComOficina}
              className="h-8 px-2.5 sm:px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <WhatsappLogo size={15} weight="fill" />
              <span className="hidden sm:inline">Dúvidas? Fale Conosco</span>
            </button>

            {/* Botao Fechar Aba (Regra 15 - Suporte a Fullscreen) */}
            <button
              type="button"
              onClick={handleFecharAba}
              className="h-8 px-3 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Fechar esta aba"
            >
              <X size={14} weight="bold" />
              <span>Fechar Aba</span>
            </button>
          </div>
        </div>
      </header>

      {/* Banner do Veiculo */}
      <div className="bg-[#101828] text-white px-4 py-3.5 shadow-sm">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#38bdf8] shrink-0">
              <Car size={20} weight="bold" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-extrabold bg-[#0284c7] text-white px-2 py-0.5 rounded-md">
                  {dadosOS.placa || 'SEM PLACA'}
                </span>
                <span className="text-sm font-bold truncate">{dadosOS.marcaModelo || 'Veículo em Atendimento'}</span>
              </div>
              <div className="text-[11px] text-white/70 mt-0.5">
                {dadosOS.cliente} • Entrada: {dadosOS.dataEntrada} às {dadosOS.horaEntrada}
              </div>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold">
            <ShieldCheck size={16} weight="fill" className="text-[#0284c7]" />
            <span>{conformesCount + naoConformesCount}/{totalItens} itens vistoriados</span>
          </div>
        </div>
      </div>

      {/* Conteudo Principal */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 space-y-4">
        {dadosOS.fotosVeiculoEntrada && Object.keys(dadosOS.fotosVeiculoEntrada).length > 0 && (
          <div className="bg-white border border-[#d0d5dd] rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#f0f9ff] text-[#0284c7] flex items-center justify-center">
                <Camera size={15} weight="bold" />
              </div>
              <h2 className="text-xs font-bold text-[#101828] uppercase tracking-wider">Fotos do Veículo na Entrada</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {FOTOS_VEICULO_TIPOS.filter((tipo) => dadosOS.fotosVeiculoEntrada[tipo.id]).map((tipo) => (
                <div key={tipo.id} className="space-y-1">
                  <div className="w-full aspect-square rounded-xl border border-[#e4e7ec] overflow-hidden">
                    <img
                      src={dadosOS.fotosVeiculoEntrada[tipo.id]}
                      alt={tipo.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[9.5px] font-bold text-[#475467] text-center truncate">{tipo.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border border-[#d0d5dd] rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#101828] uppercase tracking-wider">Checklist Oficial de Entrada</h2>
            {naoConformesCount > 0 && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                {naoConformesCount} item(ns) não conforme
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {ITENS_CHECKLIST_ENTRADA.map((item) => {
              const estado = checklist[item.id] || { status: '', obs: '' }
              const isConforme = estado.status === 'conforme'
              const isNaoConforme = estado.status === 'nao_conforme'
              const isIsento = estado.status === 'isento'

              return (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border flex items-start justify-between gap-2 ${
                    isNaoConforme
                      ? 'bg-rose-50/60 border-rose-200'
                      : isConforme
                      ? 'bg-[#f0f9ff]/60 border-[#bae6fd]'
                      : 'bg-[#f8fafc] border-[#e4e7ec]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#101828]">{item.label}</p>
                    {estado.obs && <p className="text-[10.5px] text-[#667085] mt-0.5">{estado.obs}</p>}
                  </div>
                  <div className="shrink-0">
                    {isConforme && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#0369a1]">
                        <CheckCircle size={14} weight="fill" /> Conforme
                      </span>
                    )}
                    {isNaoConforme && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700">
                        <WarningCircle size={14} weight="fill" /> Não Conforme
                      </span>
                    )}
                    {isIsento && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#667085]">
                        <MinusCircle size={14} weight="fill" /> Não se Aplica
                      </span>
                    )}
                    {!estado.status && (
                      <span className="text-[10px] font-bold text-[#98a2b3]">Não inspecionado</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Assinatura Digital */}
        <div className="bg-white border border-[#d0d5dd] rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#f0f9ff] text-[#0284c7] flex items-center justify-center">
              <PenNib size={15} weight="bold" />
            </div>
            <h2 className="text-xs font-bold text-[#101828] uppercase tracking-wider">Assinatura Digital do Cliente</h2>
          </div>

          {assinatura ? (
            <div className="p-3.5 rounded-xl bg-[#f0f9ff] border border-[#bae6fd] flex items-center gap-3">
              <CheckCircle size={22} weight="fill" className="text-[#0284c7] shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-[#101828]">Checklist confirmado e assinado por {assinatura.nomeAssinante}</p>
                <p className="text-[#475467] mt-0.5">Em {assinatura.dataHora}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAssinar} className="space-y-2.5">
              <p className="text-[11px] text-[#667085] leading-relaxed">
                Ao assinar, você confirma que conferiu os itens listados acima no recebimento do seu veículo pela
                Mecânica Gabriel.
              </p>
              <input
                type="text"
                value={nomeAssinante}
                onChange={(e) => setNomeAssinante(e.target.value)}
                placeholder="Digite seu nome completo"
                className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] text-sm font-semibold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
              />
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <PenNib size={16} weight="bold" />
                <span>Confirmar e Assinar Digitalmente</span>
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
