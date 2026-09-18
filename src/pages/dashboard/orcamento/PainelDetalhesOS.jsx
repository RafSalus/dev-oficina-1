import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  X,
  Printer,
  WhatsappLogo,
  Copy,
  Check,
  ArrowSquareOut,
  PencilSimple,
  Trash,
  User,
  Car,
  Wrench,
  Package,
  CalendarBlank,
  Clock,
  CurrencyDollar,
  Receipt,
  FileText,
  ShieldCheck,
  WarningCircle,
  CaretRight,
  Archive,
  ArrowUUpLeft,
  Handshake,
} from '@phosphor-icons/react'
import Select from 'react-select'
import { toast } from 'sonner'
import { STATUS_ORCAMENTO } from './mockOrdensAbertas'
import { DRAFT_KEY } from '../nova-os/useOsDraft'

const STORAGE_KEY_PAINEL_WIDTH = 'dev_oficina_painel_os_width'
const LARGURA_PADRAO_PAINEL = 520

const selectStatusStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '34px',
    height: '34px',
    backgroundColor: '#f8fafc',
    borderColor: state.isFocused ? '#0284c7' : '#d0d5dd',
    borderRadius: '0.625rem',
    boxShadow: state.isFocused ? '0 0 0 1px #0284c7' : 'none',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 8px',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    border: '1px solid #d0d5dd',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.75rem',
    fontWeight: state.isSelected ? '700' : '500',
    backgroundColor: state.isSelected ? '#101828' : state.isFocused ? '#f2f4f7' : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#101828',
    cursor: 'pointer',
  }),
}

export function PainelDetalhesOS({
  os,
  onClose,
  onAbrirImpressao,
  onAtualizarStatus,
  onExcluir,
  isArquivada = false,
  onFinalizarEArquivar,
  onReabrir,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [copiado, setCopiado] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState('resumo') // 'resumo', 'itens', 'diagnostico'

  // Largura com suporte a redimensionamento e persistência
  const [painelLargura, setPainelLargura] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_PAINEL_WIDTH)
      if (salvo) {
        const n = parseInt(salvo, 10)
        if (n >= 480 && n <= 960) return n
      }
    } catch (e) {}
    return LARGURA_PADRAO_PAINEL
  })

  const resizingRef = useRef({ ativo: false, startX: 0, startW: 0 })

  const handleMouseDownResize = (e) => {
    e.preventDefault()
    e.stopPropagation()
    resizingRef.current = {
      ativo: true,
      startX: e.clientX,
      startW: painelLargura,
    }

    const handleMouseMove = (moveEvent) => {
      if (!resizingRef.current.ativo) return
      // Mover para a esquerda aumenta a largura do painel
      const deltaX = resizingRef.current.startX - moveEvent.clientX
      const maxW = Math.max(500, Math.min(window.innerWidth - 360, 960))
      const minW = 480
      const novoW = Math.max(minW, Math.min(maxW, resizingRef.current.startW + deltaX))
      setPainelLargura(novoW)
    }

    const handleMouseUp = () => {
      resizingRef.current.ativo = false
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      setPainelLargura((cur) => {
        try {
          localStorage.setItem(STORAGE_KEY_PAINEL_WIDTH, String(cur))
        } catch (err) {}
        return cur
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Tecla Escape para fechar a aba lateral
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!os) return null

  const statusAtual = STATUS_ORCAMENTO.find((s) => s.value === os.status) || STATUS_ORCAMENTO[1]

  const formatMoeda = (val) => {
    const n = parseFloat(val) || 0
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Gera link do cliente para aprovação
  const linkCliente = `${window.location.origin}/aprovacao/${os.numeroOS}`

  const handleCopiarLink = () => {
    navigator.clipboard.writeText(linkCliente)
    setCopiado(true)
    toast.success(`Link de aprovação da OS #${os.numeroOS} copiado para a área de transferência!`)
    setTimeout(() => setCopiado(false), 2500)
  }

  const handleEnviarWhatsapp = () => {
    const foneLimpo = (os.telefone || '').replace(/\D/g, '')
    const msg = `Olá, *${os.cliente}*! Aqui é da *Mecânica Gabriel*.\n\nO orçamento da sua *${os.marcaModelo || 'veículo'}* (Placa: *${os.placa || '—'}*) referente à OS *#${os.numeroOS}* está pronto no valor total de *R$ ${formatMoeda(os.valorTotal)}*.\n\nVocê pode conferir todos os itens, fotos do laudo técnico e autorizar diretamente pelo link seguro abaixo:\n👉 ${linkCliente}\n\nFicamos à disposição para qualquer dúvida!`
    const url = foneLimpo
      ? `https://api.whatsapp.com/send?phone=55${foneLimpo}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`

    window.open(url, '_blank')
    toast.success('Disparo de orçamento via WhatsApp preparado!')
  }

  const handleEditarNaNovaOS = () => {
    try {
      // Salva no draft para abrir e continuar na tela de Nova OS
      localStorage.setItem(DRAFT_KEY, JSON.stringify(os))
      toast.info(`Carregando OS #${os.numeroOS} no formulário de edição...`)
      const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'
      navigate(`${basePath}/ordem-de-servico/nova`)
    } catch (e) {
      toast.error('Erro ao preparar edição da OS.')
    }
  }

  const handleAprovarRapido = () => {
    onAtualizarStatus(os.numeroOS, 'aprovado_execucao')
    toast.success(`Orçamento #${os.numeroOS} aprovado! Status atualizado para Aprovado e Em Execução.`)
  }

  return (
    <aside
      style={{ width: `${painelLargura}px` }}
      className="absolute top-0 right-0 bottom-0 z-20 bg-white border-l border-[#d0d5dd] flex flex-col select-none overflow-hidden shadow-[-12px_0_30px_rgba(0,0,0,0.14)] animate-in slide-in-from-right duration-200"
    >
      {/* Barra de redimensionamento por arrasto na borda esquerda */}
      <div
        onMouseDown={handleMouseDownResize}
        className="absolute top-0 bottom-0 left-0 w-2.5 -translate-x-1 cursor-ew-resize z-30 group flex items-center justify-center hover:bg-[#0284c7]/20 transition-colors"
        title="Arraste para redimensionar a largura do painel lateral"
      >
        <div className="w-1 h-10 rounded-full bg-zinc-300 group-hover:bg-[#0284c7] transition-colors shadow-2xs" />
      </div>

      {/* Cabeçalho do Painel */}
      <header className="px-4 py-3 border-b border-[#e4e7ec] flex items-center justify-between bg-[#f8fafc] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#101828] text-[#0284c7] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
            <Receipt size={20} weight="duotone" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#101828] whitespace-nowrap shrink-0">OS #{os.numeroOS}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusAtual.badgeBg} ${statusAtual.badgeText} ${statusAtual.border}`}>
                {statusAtual.label}
              </span>
            </div>
            <p className="text-xs text-[#667085] truncate font-medium mt-0.5">{os.cliente}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#eaecf0] rounded-lg cursor-pointer transition-colors"
          title="Fechar Painel Lateral"
        >
          <X size={16} weight="bold" />
        </button>
      </header>

      {/* Seletor rápido de Status ou Faixa de Finalizada */}
      {isArquivada ? (
        <div className="px-4 py-2.5 bg-[#f0f9ff] border-b border-[#bae6fd] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0284c7] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Archive size={18} weight="bold" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#101828] block">Ordem Finalizada e Arquivada</span>
              <span className="text-[11px] text-[#475467]">
                Entregue em {os.dataFinalizacao || os.dataEntrada}
              </span>
            </div>
          </div>
          {onReabrir && (
            <button
              type="button"
              onClick={() => onReabrir(os.numeroOS)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#f2f4f7] text-[#101828] border border-[#d0d5dd] rounded-lg text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
              title="Reabrir esta OS e mover de volta para as OS Abertas"
            >
              <ArrowUUpLeft size={13} weight="bold" />
              <span>Reabrir OS</span>
            </button>
          )}
        </div>
      ) : (
        <div className="px-4 py-2.5 bg-white border-b border-[#e4e7ec] flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-[#475467] shrink-0">Alterar Status:</span>
          <div className="flex-1">
            <Select
              styles={selectStatusStyles}
              value={statusAtual}
              onChange={(opt) => {
                if (opt && opt.value !== os.status) {
                  onAtualizarStatus(os.numeroOS, opt.value)
                  toast.success(`Status da OS #${os.numeroOS} alterado para "${opt.label}"!`)
                }
              }}
              options={STATUS_ORCAMENTO.filter((s) => s.value !== 'todos')}
              isSearchable={false}
            />
          </div>
        </div>
      )}

      {/* Sub-abas de navegação rápida */}
      <div className="px-4 pt-2.5 border-b border-[#e4e7ec] flex items-center gap-2 bg-[#f8fafc] shrink-0">
        <button
          type="button"
          onClick={() => setActiveSubTab('resumo')}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
            activeSubTab === 'resumo'
              ? 'text-[#0284c7] border-[#0284c7] bg-white shadow-2xs'
              : 'text-[#667085] border-transparent hover:text-[#101828]'
          }`}
        >
          Resumo e Valores
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('itens')}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
            activeSubTab === 'itens'
              ? 'text-[#0284c7] border-[#0284c7] bg-white shadow-2xs'
              : 'text-[#667085] border-transparent hover:text-[#101828]'
          }`}
        >
          Itens ({ (os.pecasOS?.length || 0) + (os.servicosOS?.length || 0) + (os.terceirosOS?.length || 0) })
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('diagnostico')}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
            activeSubTab === 'diagnostico'
              ? 'text-[#0284c7] border-[#0284c7] bg-white shadow-2xs'
              : 'text-[#667085] border-transparent hover:text-[#101828]'
          }`}
        >
          Diagnóstico e Laudo
        </button>
      </div>

      {/* Corpo com Scroll Interno Limpo e Invisível */}
      <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 p-4 space-y-4 text-xs text-[#344054]">
        {activeSubTab === 'resumo' && (
          <>
            {/* Card Veículo e Cliente */}
            <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-[#101828] text-white tracking-wider shadow-2xs">
                    {os.placa || 'PLACA'}
                  </span>
                  <span className="font-bold text-sm text-[#101828] truncate">{os.marcaModelo}</span>
                </div>
                <span className="text-xs text-[#667085] font-medium">{os.ano} • {os.cor}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2.5 border-t border-[#e4e7ec]">
                <div>
                  <span className="text-[#667085] block text-[10px] font-bold uppercase tracking-wider">CLIENTE</span>
                  <span className="font-bold text-xs text-[#101828] truncate block mt-0.5">{os.cliente}</span>
                  <span className="text-xs text-[#475467] block mt-0.5">{os.telefone || 'Sem telefone cadastrado'}</span>
                </div>
                <div>
                  <span className="text-[#667085] block text-[10px] font-bold uppercase tracking-wider">KM DE ENTRADA</span>
                  <span className="font-bold text-xs text-[#101828] block mt-0.5">{os.km || '—'} KM</span>
                  <span className="text-xs text-[#475467] block mt-0.5">Mecânico: {os.mecanicoNome || 'Não definido'}</span>
                </div>
              </div>
            </div>

            {/* Quadro Financeiro do Orçamento com Separação Nítida */}
            <div className="bg-white border border-[#d0d5dd] rounded-2xl p-4 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                Composição do Orçamento
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#475467] py-0.5">
                  <span>Peças e Insumos ({os.pecasOS?.length || 0} itens)</span>
                  <span className="font-semibold text-[#101828]">R$ {formatMoeda(os.totalPecas)}</span>
                </div>
                <div className="flex justify-between items-center text-[#475467] py-0.5">
                  <span>Mão de Obra Oficina ({os.servicosOS?.length || 0} itens)</span>
                  <span className="font-semibold text-[#101828]">R$ {formatMoeda(os.totalServicos)}</span>
                </div>
                <div className="flex justify-between items-center text-[#475467] py-0.5">
                  <span>Serviços de Terceiros ({os.terceirosOS?.length || 0} itens)</span>
                  <span className="font-semibold text-[#101828]">R$ {formatMoeda(os.totalTerceiros || 0)}</span>
                </div>
                {os.descontoTotal > 0 && (
                  <div className="flex justify-between items-center text-rose-600 py-0.5">
                    <span>Desconto Concedido</span>
                    <span className="font-bold">- R$ {formatMoeda(os.descontoTotal)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-[#e4e7ec] flex justify-between items-center">
                  <span className="font-extrabold text-[#101828] text-sm">TOTAL DO ORÇAMENTO</span>
                  <span className="text-lg font-black text-[#0284c7]">
                    R$ {formatMoeda(os.valorTotal)}
                  </span>
                </div>
              </div>

              {os.condicaoPagamentoOS && (
                <div className="pt-2.5 border-t border-[#e4e7ec]/70 text-xs text-[#667085] flex items-center justify-between bg-[#f8fafc] -mx-4 -mb-4 px-4 py-2.5 rounded-b-2xl">
                  <span className="font-semibold text-[#344054]">Condição de Pagamento:</span>
                  <span className="font-bold text-[#101828]">{os.condicaoPagamentoOS}</span>
                </div>
              )}
            </div>

            {/* Datas e Prazos */}
            <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#667085] font-bold block text-[10px] uppercase tracking-wider">ENTRADA NA OFICINA</span>
                <span className="font-bold text-xs text-[#101828] block mt-0.5">{os.dataEntrada} às {os.horaEntrada}</span>
              </div>
              <div>
                <span className="text-[#667085] font-bold block text-[10px] uppercase tracking-wider">PREVISÃO DE ENTREGA</span>
                <span className="font-bold text-xs text-[#0284c7] block mt-0.5">
                  {os.previsaoEntregaData || 'A definir'} {os.previsaoEntregaHora ? `às ${os.previsaoEntregaHora}` : ''}
                </span>
              </div>
            </div>

            {/* Ações Rápidas Compactas */}
            <div className="space-y-2 pt-1">
              {/* Linha 1: Compartilhamento e Impressão (3 botões em 1 linha) */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleEnviarWhatsapp}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#25d366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                  title="Enviar Orçamento via WhatsApp"
                >
                  <WhatsappLogo size={15} weight="fill" />
                  <span className="truncate">WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={onAbrirImpressao}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-white hover:bg-[#f2f4f7] text-[#101828] border border-[#d0d5dd] text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                  title="Imprimir Folha de Orçamento"
                >
                  <Printer size={15} weight="bold" />
                  <span className="truncate">Imprimir</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopiarLink}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-white hover:bg-[#f2f4f7] text-[#101828] border border-[#d0d5dd] text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                  title="Copiar Link de Aprovação do Cliente"
                >
                  {copiado ? <Check size={15} weight="bold" className="text-[#0284c7]" /> : <Copy size={15} weight="bold" />}
                  <span className="truncate">{copiado ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>

              {/* Linha 2: Ações de Status e Execução */}
              {isArquivada ? (
                <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-3 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-[#0284c7] font-bold">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={16} weight="fill" />
                      <span>Conclusão e Garantia</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#475467]">{os.garantiaAte || 'Garantia: 90 dias'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[#475467] text-[11px]">
                    <div>
                      <span className="text-[#667085] block text-[10px] uppercase font-bold">FINALIZADA EM</span>
                      <span className="font-bold text-[#101828] text-xs">{os.dataFinalizacao || os.dataEntrada} às {os.horaFinalizacao || os.horaEntrada}</span>
                    </div>
                    <div>
                      <span className="text-[#667085] block text-[10px] uppercase font-bold">DOCUMENTO / PGTO</span>
                      <span className="font-bold text-[#101828] text-xs">{os.formaPagamento || 'PIX'} • {os.notaFiscal || 'NFS-e'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {os.status === 'aguardando_aprovacao' ? (
                    <button
                      type="button"
                      onClick={handleAprovarRapido}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#101828] hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                      title="Aprovar orçamento e iniciar execução na oficina"
                    >
                      <ShieldCheck size={16} weight="bold" className="text-[#0284c7]" />
                      <span className="truncate">Aprovar OS</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#f0f9ff] border border-[#bae6fd] text-[#0284c7] text-xs font-bold rounded-xl">
                      <ShieldCheck size={16} weight="bold" />
                      <span className="truncate">Em Execução</span>
                    </div>
                  )}

                  {onFinalizarEArquivar && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Confirmar finalização do atendimento da OS #${os.numeroOS}? O veículo será dado como entregue e a OS será transferida para os Arquivos.`
                          )
                        ) {
                          onFinalizarEArquivar(os.numeroOS)
                        }
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                      title="Concluir entrega do veículo e arquivar OS"
                    >
                      <Archive size={16} weight="bold" />
                      <span className="truncate">Finalizar e Arquivar</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {activeSubTab === 'itens' && (
          <div className="space-y-4">
            {/* Lista de Peças */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
                  <Package size={16} weight="bold" className="text-[#0284c7]" />
                  Peças e Insumos ({os.pecasOS?.length || 0})
                </span>
                <span className="text-xs font-black text-[#101828]">R$ {formatMoeda(os.totalPecas)}</span>
              </div>
              <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden divide-y divide-[#f2f4f7] bg-white shadow-2xs">
                {(!os.pecasOS || os.pecasOS.length === 0) ? (
                  <p className="p-4 text-center text-[#98a2b3] italic text-xs">Nenhuma peça adicionada ainda.</p>
                ) : (
                  os.pecasOS.map((p, idx) => (
                    <div key={idx} className="p-3 text-xs flex items-center justify-between hover:bg-[#f8fafc] transition-colors">
                      <div className="min-w-0 pr-3">
                        <p className="font-bold text-[#101828] truncate text-xs">{p.nome}</p>
                        <span className="text-[#667085] text-[11px] mt-0.5 block">
                          Cód: {p.codigo || '—'} • {p.quantidade} {p.unidade || 'UN'} × R$ {formatMoeda(p.precoUnitario)}
                        </span>
                      </div>
                      <span className="font-black text-[#101828] shrink-0 text-xs font-mono">
                        R$ {formatMoeda(p.quantidade * p.precoUnitario - (p.desconto || 0))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Lista de Mão de Obra e Serviços da Oficina */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
                  <Wrench size={16} weight="bold" className="text-[#0284c7]" />
                  Mão de Obra (Oficina) ({os.servicosOS?.length || 0})
                </span>
                <span className="text-xs font-black text-[#101828]">R$ {formatMoeda(os.totalServicos)}</span>
              </div>
              <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden divide-y divide-[#f2f4f7] bg-white shadow-2xs">
                {(!os.servicosOS || os.servicosOS.length === 0) ? (
                  <p className="p-4 text-center text-[#98a2b3] italic text-xs">Nenhum serviço de oficina adicionado.</p>
                ) : (
                  os.servicosOS.map((s, idx) => (
                    <div key={idx} className="p-3 text-xs flex items-center justify-between hover:bg-[#f8fafc] transition-colors">
                      <div className="min-w-0 pr-3">
                        <p className="font-bold text-[#101828] truncate text-xs">{s.nome}</p>
                        <span className="text-[#667085] text-[11px] mt-0.5 block">
                          Cód: {s.codigo || '—'} {s.tempoHoras ? `• Tempo: ${s.tempoHoras}h` : ''}
                        </span>
                      </div>
                      <span className="font-black text-[#101828] shrink-0 text-xs font-mono">
                        R$ {formatMoeda((s.quantidade || 1) * (s.precoUnitario || 0) - (s.desconto || 0))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Lista de Serviços de Terceiros (Separados) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
                  <Handshake size={16} weight="bold" className="text-[#0284c7]" />
                  Serviços de Terceiros ({os.terceirosOS?.length || 0})
                </span>
                <span className="text-xs font-black text-[#101828]">R$ {formatMoeda(os.totalTerceiros || 0)}</span>
              </div>
              <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden divide-y divide-[#f2f4f7] bg-white shadow-2xs">
                {(!os.terceirosOS || os.terceirosOS.length === 0) ? (
                  <p className="p-4 text-center text-[#98a2b3] italic text-xs">Nenhum serviço de terceiros vinculado.</p>
                ) : (
                  os.terceirosOS.map((t, idx) => {
                    const preco = parseFloat(t.valorVenda || t.precoFinal || t.precoUnitario) || 0
                    const qtd = parseFloat(t.quantidade) || 1
                    const desc = parseFloat(t.desconto) || 0
                    const liq = Math.max(0, preco * qtd - desc)

                    return (
                      <div key={idx} className="p-3 text-xs flex items-center justify-between hover:bg-[#f8fafc] transition-colors bg-amber-50/20">
                        <div className="min-w-0 pr-3">
                          <p className="font-bold text-[#101828] truncate text-xs">{t.nome}</p>
                          <span className="text-[#667085] text-[11px] mt-0.5 block">
                            Cód: {t.codigo || '—'} • Parceiro: <strong className="text-[#101828] font-semibold">{t.parceiroNome || 'Fornecedor Terceirizado'}</strong>
                          </span>
                        </div>
                        <span className="font-black text-[#101828] shrink-0 text-xs font-mono">
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
              className="w-full py-2.5 px-4 bg-white hover:bg-[#f2f4f7] text-[#101828] border border-[#d0d5dd] rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all active:scale-95"
            >
              <PencilSimple size={15} weight="bold" />
              <span>Adicionar ou Alterar Itens na OS</span>
            </button>
          </div>
        )}

        {activeSubTab === 'diagnostico' && (
          <div className="space-y-4">
            {/* Relato do Cliente */}
            <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#667085] block">
                Queixa e Relato Inicial do Cliente
              </span>
              <p className="text-xs text-[#101828] leading-relaxed italic bg-white p-3 rounded-xl border border-[#e4e7ec]/60">
                "{os.relatoCliente || 'Nenhum relato detalhado informado na abertura.'}"
              </p>
            </div>

            {/* Laudo Técnico do Mecânico */}
            <div className="bg-white border border-[#d0d5dd] rounded-2xl p-4 space-y-2 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7] block">
                Laudo Técnico do Mecânico ({os.mecanicoNome || 'Oficina'})
              </span>
              <p className="text-xs text-[#344054] leading-relaxed whitespace-pre-line bg-[#f8fafc] p-3 rounded-xl border border-[#e4e7ec]/60">
                {os.laudoTecnico || 'Aguardando inserção de laudo técnico pelo mecânico.'}
              </p>
            </div>

            {/* Checklist */}
            <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-4 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-[#101828] block text-xs">Checklist de Entrada</span>
                <span className="text-[#667085] text-[11px]">22 itens inspecionados</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#101828] text-white text-[10px] font-bold">
                Concluído
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Rodapé de Ações Administrativas */}
      <footer className="px-4 py-2.5 border-t border-[#e4e7ec] bg-[#f8fafc] flex items-center justify-between shrink-0">
        {isArquivada ? (
          onReabrir ? (
            <button
              type="button"
              onClick={() => onReabrir(os.numeroOS)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#f2f4f7] text-[#101828] border border-[#d0d5dd] rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-2xs"
            >
              <ArrowUUpLeft size={15} weight="bold" />
              <span>Reabrir OS</span>
            </button>
          ) : (
            <span className="text-xs font-bold text-[#667085]">OS no Arquivo</span>
          )
        ) : (
          <button
            type="button"
            onClick={handleEditarNaNovaOS}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#f2f4f7] text-[#101828] border border-[#d0d5dd] rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-2xs"
          >
            <PencilSimple size={15} weight="bold" />
            <span>Editar OS</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Deseja realmente cancelar/excluir a OS #${os.numeroOS}?`)) {
              onExcluir(os.numeroOS)
              toast.success(`OS #${os.numeroOS} cancelada e removida com sucesso.`)
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-medium cursor-pointer transition-colors"
          title="Excluir ou Cancelar Ordem de Serviço"
        >
          <Trash size={15} weight="bold" />
          <span>Excluir</span>
        </button>
      </footer>
    </aside>
  )
}
