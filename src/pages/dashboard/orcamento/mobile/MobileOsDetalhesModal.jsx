import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  WhatsappLogo,
  Copy,
  Check,
  PencilSimple,
  Trash,
  Package,
  Wrench,
  Handshake,
  ShieldCheck,
  Archive,
  ArrowUUpLeft,
} from '@phosphor-icons/react'
import Select from 'react-select'
import { toast } from 'sonner'
import { STATUS_ORCAMENTO } from '../mockOrdensAbertas'
import { DRAFT_KEY } from '../../nova-os/useOsDraft'
import { mobileSelectStyles } from '../../nova-os/mobile/mobileSelectStyles'

const SUB_TABS = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'itens', label: 'Itens' },
  { id: 'diagnostico', label: 'Diagnóstico' },
]

export function MobileOsDetalhesModal({
  isOpen,
  os,
  isArquivada,
  onFechar,
  onAtualizarStatus,
  onFinalizarEArquivar,
  onReabrir,
  onExcluir,
  onCopiarLink,
  onDispararWhatsApp,
  formatMoeda,
}) {
  const navigate = useNavigate()
  const [subTab, setSubTab] = useState('resumo')
  const [copiado, setCopiado] = useState(false)
  const [acaoConfirmando, setAcaoConfirmando] = useState(null) // 'excluir' | 'finalizar' | null

  if (!isOpen || !os) return null

  const statusAtual = STATUS_ORCAMENTO.find((s) => s.value === os.status) || STATUS_ORCAMENTO[1]

  const handleCopiarLink = () => {
    onCopiarLink(os)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const handleEditarNaNovaOS = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(os))
      toast.info(`Carregando OS #${os.numeroOS} no formulário de edição...`)
      onFechar()
      navigate('/gestao/ordem-de-servico/nova')
    } catch (e) {
      toast.error('Erro ao preparar edição da OS.')
    }
  }

  const confirmarAcao = () => {
    if (acaoConfirmando === 'excluir') {
      onExcluir(os.numeroOS)
      toast.success(`OS #${os.numeroOS} cancelada e removida com sucesso.`)
      onFechar()
    } else if (acaoConfirmando === 'finalizar') {
      onFinalizarEArquivar(os.numeroOS)
    }
    setAcaoConfirmando(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#eaecf0] flex flex-col">
      <header
        className="shrink-0 bg-white border-b border-[#e4e7ec]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="h-14 px-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="p-2.5 rounded-xl text-[#475467] active:bg-[#f2f4f7] transition-colors shrink-0"
          >
            <X size={20} weight="bold" />
          </button>
          <div className="flex flex-col items-center min-w-0">
            <span className="text-sm font-extrabold text-[#101828] truncate">OS #{os.numeroOS}</span>
            <span className="text-[10px] font-semibold text-[#667085] truncate max-w-[220px]">{os.cliente}</span>
          </div>
          <div className="w-9 shrink-0" />
        </div>

        <div className="px-3 pb-2.5 flex items-center gap-1.5">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all ${
                subTab === tab.id ? 'bg-[#101828] text-white' : 'bg-[#f2f4f7] text-[#667085]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4">
        {subTab === 'resumo' && (
          <>
            {isArquivada ? (
              <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shrink-0">
                    <Archive size={18} weight="bold" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#101828]">Finalizada e Arquivada</p>
                    <p className="text-[10.5px] text-[#667085]">Entregue em {os.dataFinalizacao || os.dataEntrada}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1.5">
                  Status da Ordem de Serviço
                </label>
                <Select
                  value={statusAtual}
                  onChange={(opt) => {
                    if (opt && opt.value !== os.status) {
                      onAtualizarStatus(os.numeroOS, opt.value)
                      toast.success(`Status da OS #${os.numeroOS} alterado para "${opt.label}"!`)
                    }
                  }}
                  options={STATUS_ORCAMENTO.filter((s) => s.value !== 'todos')}
                  isSearchable={false}
                  styles={mobileSelectStyles}
                />
              </div>
            )}

            <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#f2f4f7]">
                <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-[#101828] text-white tracking-wider">
                  {os.placa || 'PLACA'}
                </span>
                <span className="text-xs text-[#667085] font-medium">{os.ano} • {os.cor}</span>
              </div>
              <p className="text-sm font-extrabold text-[#101828]">{os.marcaModelo}</p>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#f2f4f7] text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#98a2b3] block">Cliente</span>
                  <span className="font-bold text-[#101828] block truncate">{os.cliente}</span>
                  <span className="text-[#475467] block">{os.telefone || 'Sem telefone'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#98a2b3] block">KM de Entrada</span>
                  <span className="font-bold text-[#101828] block">{os.km || '—'} KM</span>
                  <span className="text-[#475467] block">Téc: {os.mecanicoNome || 'Não definido'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#98a2b3] mb-2">Composição do Orçamento</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#667085]">Peças ({os.pecasOS?.length || 0})</span>
                  <span className="font-bold text-[#101828]">R$ {formatMoeda(os.totalPecas)}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#667085]">Mão de Obra Oficina ({os.servicosOS?.length || 0})</span>
                  <span className="font-bold text-[#101828]">R$ {formatMoeda(os.totalServicos)}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#667085]">Serviços de Terceiros ({os.terceirosOS?.length || 0})</span>
                  <span className="font-bold text-[#101828]">R$ {formatMoeda(os.totalTerceiros || 0)}</span>
                </div>
                {os.descontoTotal > 0 && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#b42318]">Desconto</span>
                    <span className="font-bold text-[#b42318]">- R$ {formatMoeda(os.descontoTotal)}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 p-3 rounded-xl bg-[#101828] flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase">Total</span>
                <span className="text-lg font-extrabold text-white">R$ {formatMoeda(os.valorTotal)}</span>
              </div>
              {os.condicaoPagamentoOS && (
                <p className="text-[11px] text-[#667085] mt-2.5 pt-2.5 border-t border-[#f2f4f7]">
                  <span className="font-semibold text-[#344054]">Pagamento: </span>
                  {os.condicaoPagamentoOS}
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#98a2b3] block">Entrada</span>
                <span className="font-bold text-[#101828] block">{os.dataEntrada} às {os.horaEntrada}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#98a2b3] block">Previsão de Entrega</span>
                <span className="font-bold text-[#0284c7] block">
                  {os.previsaoEntregaData || 'A definir'} {os.previsaoEntregaHora ? `às ${os.previsaoEntregaHora}` : ''}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => onDispararWhatsApp(os)}
                className="h-11 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <WhatsappLogo size={16} weight="fill" />
                WhatsApp
              </button>
              <button
                type="button"
                onClick={handleCopiarLink}
                className="h-11 rounded-xl border border-[#d0d5dd] text-[#344054] text-xs font-bold flex items-center justify-center gap-1.5"
              >
                {copiado ? <Check size={14} className="text-[#0284c7]" /> : <Copy size={14} />}
                {copiado ? 'Copiado!' : 'Copiar Link'}
              </button>
            </div>

            {/* Ações Rápidas */}
            <div className="space-y-2 mb-3">
              <button
                type="button"
                onClick={handleEditarNaNovaOS}
                className="w-full h-11 rounded-xl bg-white border border-[#d0d5dd] text-[#101828] text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <PencilSimple size={15} weight="bold" />
                Editar no Formulário
              </button>

              {!isArquivada && (
                <button
                  type="button"
                  onClick={() => setAcaoConfirmando('finalizar')}
                  className="w-full h-11 rounded-xl bg-[#101828] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Archive size={15} weight="bold" />
                  Finalizar e Arquivar OS
                </button>
              )}

              {isArquivada && (
                <button
                  type="button"
                  onClick={() => {
                    onReabrir(os.numeroOS)
                    toast.success(`OS #${os.numeroOS} reaberta com sucesso!`)
                  }}
                  className="w-full h-11 rounded-xl bg-[#0284c7] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ArrowUUpLeft size={15} weight="bold" />
                  Reabrir Ordem de Serviço
                </button>
              )}

              <button
                type="button"
                onClick={() => setAcaoConfirmando('excluir')}
                className="w-full h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Trash size={15} weight="bold" />
                Cancelar e Excluir OS
              </button>
            </div>
          </>
        )}

        {subTab === 'itens' && (
          <>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
                  <Package size={14} weight="bold" className="text-[#0284c7]" />
                  Peças ({os.pecasOS?.length || 0})
                </span>
                <span className="text-xs font-black text-[#101828]">R$ {formatMoeda(os.totalPecas)}</span>
              </div>
              <div className="bg-white rounded-2xl border border-[#d0d5dd] divide-y divide-[#f2f4f7] overflow-hidden">
                {(!os.pecasOS || os.pecasOS.length === 0) ? (
                  <p className="p-3 text-center text-[#98a2b3] italic text-xs">Nenhuma peça adicionada.</p>
                ) : (
                  os.pecasOS.map((p, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#101828] truncate">{p.nome}</p>
                        <span className="text-[10.5px] text-[#667085]">{p.quantidade} {p.unidade || 'UN'} × R$ {formatMoeda(p.precoUnitario)}</span>
                      </div>
                      <span className="font-black text-[#101828] shrink-0">
                        R$ {formatMoeda(p.quantidade * p.precoUnitario - (p.desconto || 0))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
                  <Wrench size={14} weight="bold" className="text-[#0284c7]" />
                  Mão de Obra Oficina ({os.servicosOS?.length || 0})
                </span>
                <span className="text-xs font-black text-[#101828]">R$ {formatMoeda(os.totalServicos)}</span>
              </div>
              <div className="bg-white rounded-2xl border border-[#d0d5dd] divide-y divide-[#f2f4f7] overflow-hidden">
                {(!os.servicosOS || os.servicosOS.length === 0) ? (
                  <p className="p-3 text-center text-[#98a2b3] italic text-xs">Nenhum serviço de oficina adicionado.</p>
                ) : (
                  os.servicosOS.map((s, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#101828] truncate">{s.nome}</p>
                        <span className="text-[10.5px] text-[#667085]">{s.tempoHoras ? `${s.tempoHoras}h` : 'Mão de obra'}</span>
                      </div>
                      <span className="font-black text-[#101828] shrink-0">
                        R$ {formatMoeda(s.quantidade * s.precoUnitario - (s.desconto || 0))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Serviços de Terceiros */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
                  <Handshake size={14} weight="bold" className="text-[#0284c7]" />
                  Serviços de Terceiros ({os.terceirosOS?.length || 0})
                </span>
                <span className="text-xs font-black text-[#101828]">R$ {formatMoeda(os.totalTerceiros || 0)}</span>
              </div>
              <div className="bg-white rounded-2xl border border-[#d0d5dd] divide-y divide-[#f2f4f7] overflow-hidden">
                {(!os.terceirosOS || os.terceirosOS.length === 0) ? (
                  <p className="p-3 text-center text-[#98a2b3] italic text-xs">Nenhum serviço de terceiros vinculado.</p>
                ) : (
                  os.terceirosOS.map((t, idx) => {
                    const preco = parseFloat(t.valorVenda || t.precoFinal || t.precoUnitario) || 0
                    const qtd = parseFloat(t.quantidade) || 1
                    const desc = parseFloat(t.desconto) || 0
                    const liq = Math.max(0, preco * qtd - desc)
                    return (
                      <div key={idx} className="p-3 flex items-center justify-between gap-2 text-xs bg-amber-50/20">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[#101828] truncate">{t.nome}</p>
                          <span className="text-[10.5px] text-[#667085]">
                            {t.parceiroNome ? `Parceiro: ${t.parceiroNome}` : 'Serviço externo'}
                          </span>
                        </div>
                        <span className="font-black text-[#101828] shrink-0 font-mono">
                          R$ {formatMoeda(liq)}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleEditarNaNovaOS}
              className="w-full h-11 rounded-xl border border-[#d0d5dd] text-[#344054] text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <PencilSimple size={15} weight="bold" />
              Adicionar ou Alterar Itens
            </button>
          </>
        )}

        {subTab === 'diagnostico' && (
          <>
            <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#98a2b3] mb-2">Relato do Cliente</h3>
              <p className="text-xs text-[#101828] leading-relaxed italic bg-[#f8fafc] p-3 rounded-xl border border-[#f2f4f7]">
                "{os.relatoCliente || 'Nenhum relato informado na abertura.'}"
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7] mb-2">
                Laudo Técnico ({os.mecanicoNome || 'Oficina'})
              </h3>
              <p className="text-xs text-[#344054] leading-relaxed whitespace-pre-line bg-[#f8fafc] p-3 rounded-xl border border-[#f2f4f7]">
                {os.laudoTecnico || 'Aguardando laudo técnico.'}
              </p>
            </div>
          </>
        )}
      </main>

      {/* Rodapé de ações administrativas */}
      <footer
        className="shrink-0 bg-white border-t border-[#e4e7ec] px-4 py-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        {acaoConfirmando ? (
          <div className="flex items-center gap-2">
            <span className="flex-1 text-xs font-bold text-[#101828]">
              {acaoConfirmando === 'excluir'
                ? `Cancelar e excluir a OS #${os.numeroOS}?`
                : `Finalizar e arquivar a OS #${os.numeroOS}?`}
            </span>
            <button
              type="button"
              onClick={() => setAcaoConfirmando(null)}
              className="h-9 px-3 rounded-lg border border-[#d0d5dd] text-[#344054] text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarAcao}
              className={`h-9 px-3 rounded-lg text-white text-xs font-bold ${
                acaoConfirmando === 'excluir' ? 'bg-[#b42318]' : 'bg-[#0284c7]'
              }`}
            >
              Confirmar
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            {isArquivada ? (
              <span className="text-xs font-bold text-[#667085]">OS no Arquivo</span>
            ) : (
              <button
                type="button"
                onClick={handleEditarNaNovaOS}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#d0d5dd] text-[#344054] text-xs font-bold"
              >
                <PencilSimple size={15} weight="bold" />
                Editar OS
              </button>
            )}
            <button
              type="button"
              onClick={() => setAcaoConfirmando('excluir')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[#98a2b3] active:text-[#b42318] active:bg-[#fef3f2] text-xs font-semibold"
            >
              <Trash size={15} weight="bold" />
              Excluir
            </button>
          </div>
        )}
      </footer>
    </div>
  )
}
