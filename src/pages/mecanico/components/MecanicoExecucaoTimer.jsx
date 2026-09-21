import { useState } from 'react'
import { Warning } from '@phosphor-icons/react'
import { adicionarItemAdicional } from '../../dashboard/orcamento/mockOrdensAbertas'
import { toast } from 'sonner'

// Não existe cronômetro/apontamento de horas de execução implementado no sistema — este
// componente hospeda a única UI hoje vinculada à fase de execução: o reporte de item
// adicional encontrado com a OS já em 'aprovado_execucao' (itens de segurança bloqueiam o
// avanço da OS até o cliente responder, ver motivoImpedimentoAvancoPorItemAdicional).
export function MecanicoExecucaoTimer({ osAtiva, recarregarOrdens, mecanicoNome }) {
  const [itemAdicionalDescricao, setItemAdicionalDescricao] = useState('')
  const [itemAdicionalClassificacao, setItemAdicionalClassificacao] = useState('seguranca')
  const [itemAdicionalValor, setItemAdicionalValor] = useState('')

  if (osAtiva?.status !== 'aprovado_execucao') return null

  const handleReportarItemAdicional = () => {
    if (!osAtiva) return
    const descricao = itemAdicionalDescricao.trim()
    if (!descricao) {
      toast.error('Descreva o item encontrado durante a execução.')
      return
    }
    adicionarItemAdicional(osAtiva.numeroOS, {
      descricao,
      categoria: 'peca',
      classificacao: itemAdicionalClassificacao,
      valorEstimado: parseFloat(itemAdicionalValor) || 0,
      criadoPor: { tipo: 'mecanico', nome: mecanicoNome },
    })
    recarregarOrdens()

    const foneLimpo = (osAtiva.telefone || '').replace(/\D/g, '')
    const urgencia = itemAdicionalClassificacao === 'seguranca' ? 'segurança' : 'melhoria'
    const linkAprovacao = `${window.location.origin}/aprovacao/${osAtiva.numeroOS}`
    const msg = `Olá, *${osAtiva.cliente}*! Aqui é da *Mecânica Gabriel*.\n\nDurante a execução da OS *#${osAtiva.numeroOS}* identificamos um item adicional de *${urgencia}*:\n"${descricao}"\n\nSua aprovação é necessária. Confira e responda pelo link:\n👉 ${linkAprovacao}`
    if (foneLimpo) {
      window.open(`https://api.whatsapp.com/send?phone=55${foneLimpo}&text=${encodeURIComponent(msg)}`, '_blank')
    }

    toast.success('Item adicional registrado e cliente notificado!')
    setItemAdicionalDescricao('')
    setItemAdicionalValor('')
  }

  return (
    <div className="bg-white border border-[#d0d5dd] rounded-xl p-3 text-xs mt-3 space-y-2">
      <span className="text-[#667085] font-bold uppercase text-[10px] flex items-center gap-1.5">
        <Warning size={13} weight="bold" className="text-[#0284c7]" />
        Encontrou algo novo na execução?
      </span>
      <input
        type="text"
        value={itemAdicionalDescricao}
        onChange={(e) => setItemAdicionalDescricao(e.target.value)}
        placeholder="Ex: Coxim do motor trincado durante a desmontagem"
        className="w-full h-9 px-2.5 rounded-lg border border-[#d0d5dd] text-xs font-semibold text-[#101828] bg-[#f8fafc] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7]"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          min="0"
          step="0.01"
          value={itemAdicionalValor}
          onChange={(e) => setItemAdicionalValor(e.target.value)}
          placeholder="Valor estimado R$"
          className="h-8.5 px-2.5 rounded-lg border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-[#f8fafc] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7]"
        />
        <div className="grid grid-cols-2 gap-0.5 bg-[#f8fafc] p-0.5 rounded-lg border border-[#d0d5dd]">
          <button
            type="button"
            onClick={() => setItemAdicionalClassificacao('seguranca')}
            className={`h-7.5 rounded text-[10px] font-bold cursor-pointer ${
              itemAdicionalClassificacao === 'seguranca' ? 'bg-rose-600 text-white' : 'text-[#667085]'
            }`}
          >
            Segurança
          </button>
          <button
            type="button"
            onClick={() => setItemAdicionalClassificacao('opcional')}
            className={`h-7.5 rounded text-[10px] font-bold cursor-pointer ${
              itemAdicionalClassificacao === 'opcional' ? 'bg-[#101828] text-white' : 'text-[#667085]'
            }`}
          >
            Opcional
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={handleReportarItemAdicional}
        className="w-full h-9 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold cursor-pointer active:scale-95 transition-all"
      >
        Reportar e Notificar Cliente
      </button>
    </div>
  )
}
