import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  X,
  Printer,
  WhatsappLogo,
  Copy,
  Check,
  PencilSimple,
  Trash,
  Wrench,
  Package,
  Clock,
  Receipt,
  ShieldCheck,
  Archive,
  ArrowUUpLeft,
  Handshake,
  CreditCard,
  Plus,
  Camera,
  CheckCircle,
  ArrowSquareOut,
  HourglassMedium,
  WarningCircle,
} from '@phosphor-icons/react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { toast } from 'sonner'
import { STATUS_ORCAMENTO, STATUS_PERMITE_FATURAMENTO } from './mockOrdensAbertas'
import { SEQUENCIA_STATUS, podeTransicionarPara, motivoBloqueioTransicao } from './statusTransicao'
import { ITENS_CHECKLIST_ENTRADA, checklistCompleto, carregarAssinaturaVistoria } from '../../../constants/checklistItems'
import {
  carregarPecasCadastradas,
  carregarServicosCadastrados,
  carregarTerceirosCadastrados,
} from '../../../constants/cadastrosSuprimentosData'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'
import { ModalConfirmacao } from '../../../components/ModalConfirmacao'
import { ModalRedimensionavel } from '../../../components/suprimentos/ModalRedimensionavel'

const OPCOES_STATUS_ORDENADAS = SEQUENCIA_STATUS.map((status) =>
  STATUS_ORCAMENTO.find((s) => s.value === status)
).filter(Boolean)

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
    backgroundColor: state.isDisabled ? '#ffffff' : state.isSelected ? '#101828' : state.isFocused ? '#f2f4f7' : '#ffffff',
    color: state.isDisabled ? '#d0d5dd' : state.isSelected ? '#ffffff' : '#101828',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
  }),
}

// Além de Resumo, Itens e Vistoria/Diagnóstico (sempre visíveis), uma aba extra aparece de
// acordo com o status atual da OS — o modal fica sempre focado no que realmente importa na
// etapa em que a OS está, em vez de abas genéricas desconectadas do estágio real do fluxo.
const ABA_ESTAGIO_POR_STATUS = {
  aguardando_pecas: 'cotacao',
  terceirizado: 'terceirizado',
  aguardando_aprovacao: 'aprovacao',
  aprovado_execucao: 'execucao',
  pronto_retirada: 'execucao',
}

const LABEL_ABA_ESTAGIO = {
  cotacao: 'Cotação',
  terceirizado: 'Terceirizado',
  aprovacao: 'Aprovação do Cliente',
  execucao: 'Execução',
}

export function PainelDetalhesOS({
  os,
  onClose,
  onAbrirImpressao,
  onAtualizarStatus,
  onExcluir,
  isArquivada = false,
  onFaturarNoPDV,
  onAdicionarItem,
  onAtualizarFotoPeca,
  onReabrir,
  onEditarOS,
  onAbrirCotacao,
  onReportarItemAdicional,
  initialSubTab = null,
}) {
  const [copiado, setCopiado] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab || 'resumo')
  const assinaturaVistoria = useMemo(() => carregarAssinaturaVistoria(os?.numeroOS), [os?.numeroOS, os?.checklistEntrada])

  // Aba extra de estágio (Cotação/Terceirizado/Aprovação/Execução) que corresponde ao
  // status atual da OS — some sozinha quando a OS sai daquele status.
  const abaEstagio = os ? ABA_ESTAGIO_POR_STATUS[os.status] : null
  const abasVisiveis = useMemo(() => {
    const base = ['resumo', 'itens', 'vistoria']
    return abaEstagio ? [...base, abaEstagio] : base
  }, [abaEstagio])

  // Quando o atalho do Kanban (Terceirizado) pede uma OS com aba-alvo específica, pula
  // direto para ela; caso contrário, se a aba atualmente ativa deixou de existir para o
  // status atual da OS (ex.: acabou de ser aprovada), volta para o Resumo.
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab)
      return
    }
    setActiveSubTab((atual) => (abasVisiveis.includes(atual) ? atual : 'resumo'))
  }, [initialSubTab, os?.numeroOS, os?.status, abasVisiveis])

  // Inserção rápida de peça/serviço/terceiro direto na aba correspondente, sem reabrir o
  // wizard inteiro. Peças vêm do Almoxarifado real (mesma base de /gestao/estoque e
  // /gestao/pecas): se tiver saldo suficiente, usa o preço e a peça do cadastro; se não
  // tiver (ou não existir), a peça entra marcada "Para Cotação".
  const [catalogoPecas, setCatalogoPecas] = useState([])
  const [catalogoServicos, setCatalogoServicos] = useState([])
  const [catalogoTerceiros, setCatalogoTerceiros] = useState([])
  const [pecaRapidaSelecao, setPecaRapidaSelecao] = useState(null)
  const [pecaRapidaQtd, setPecaRapidaQtd] = useState('1')
  const [servicoRapidoSelecao, setServicoRapidoSelecao] = useState(null)
  const [servicoRapidoQtd, setServicoRapidoQtd] = useState('1')
  const [servicoRapidoPreco, setServicoRapidoPreco] = useState('')
  const [terceiroRapidoSelecao, setTerceiroRapidoSelecao] = useState(null)
  const [terceiroRapidoDescricao, setTerceiroRapidoDescricao] = useState('')
  const [terceiroRapidoQtd, setTerceiroRapidoQtd] = useState('1')
  const [terceiroRapidoValor, setTerceiroRapidoValor] = useState('')
  const [itemAdicionalDescricao, setItemAdicionalDescricao] = useState('')
  const [itemAdicionalCategoria, setItemAdicionalCategoria] = useState('peca')
  const [itemAdicionalClassificacao, setItemAdicionalClassificacao] = useState('seguranca')
  const [itemAdicionalValor, setItemAdicionalValor] = useState('')

  // Última peça adicionada nesta sessão — permite tirar a foto dela na hora (câmera do celular)
  const [ultimaPecaAdicionada, setUltimaPecaAdicionada] = useState(null) // { id, nome }
  const inputFotoPecaRef = useRef(null)
  const [fotoZoomUrl, setFotoZoomUrl] = useState(null)
  const [confirmandoAprovarRapido, setConfirmandoAprovarRapido] = useState(false)
  const [confirmandoExclusaoOS, setConfirmandoExclusaoOS] = useState(false)

  useEffect(() => {
    setCatalogoPecas(carregarPecasCadastradas())
    setCatalogoServicos(carregarServicosCadastrados())
    setCatalogoTerceiros(carregarTerceirosCadastrados())
  }, [])

  const opcoesPecasCatalogo = catalogoPecas
    .filter((p) => p.ativo !== false)
    .map((p) => ({
      value: p.id,
      label: `${p.codigo} - ${p.nome} (estoque: ${p.estoqueAtual ?? 0} ${p.unidade || 'UN'})`,
      peca: p,
    }))

  const opcoesServicosCatalogo = catalogoServicos
    .filter((s) => s.ativo !== false)
    .map((s) => ({
      value: s.id,
      label: `${s.codigo} - ${s.nome}`,
      servico: s,
    }))

  // Terceirizado (serviço externo) e Autopeças/Distribuidora compartilham o mesmo cadastro de
  // fornecedores — só entram aqui quem presta "Serviços Externos" (ou "Ambos").
  const opcoesTerceirosCatalogo = catalogoTerceiros
    .filter((t) => t.ativo !== false && ['Serviços Externos', 'Ambos'].includes(t.categoriaFornecedor))
    .map((t) => ({
      value: t.id,
      label: `${t.nomeFantasia || t.razaoSocial}${t.tipoServico ? ` • ${t.tipoServico}` : ''}`,
      terceiro: t,
    }))

  // Tecla Escape para fechar o modal
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
    onEditarOS?.(os)
  }

  const handleAprovarRapido = () => {
    setConfirmandoAprovarRapido(true)
  }

  const confirmarAprovacaoRapida = () => {
    onAtualizarStatus(os.numeroOS, 'aprovado_execucao')
    toast.success(`Orçamento #${os.numeroOS} aprovado! Status atualizado para Aprovado e Em Execução.`)
    setConfirmandoAprovarRapido(false)
  }

  const confirmarExclusaoOS = () => {
    onExcluir(os.numeroOS)
    toast.success(`OS #${os.numeroOS} cancelada e removida com sucesso.`)
    setConfirmandoExclusaoOS(false)
  }

  const handleAlterarStatus = (opt) => {
    if (!opt || opt.value === os.status) return
    if (!podeTransicionarPara(os.status, opt.value)) {
      toast.warning('Só é possível mover a OS para a etapa anterior ou a etapa seguinte, sem pular colunas.')
      return
    }
    const motivo = motivoBloqueioTransicao(os, opt.value)
    if (motivo) {
      toast.warning(motivo)
      return
    }
    onAtualizarStatus(os.numeroOS, opt.value)
    toast.success(`Status da OS #${os.numeroOS} alterado para "${opt.label}"!`)
  }

  // Adiciona uma peça avulsa direto na OS a partir da aba Vistoria e Diagnóstico
  const handleAdicionarPecaRapida = () => {
    const nome = (pecaRapidaSelecao?.peca?.nome || pecaRapidaSelecao?.value || pecaRapidaSelecao?.label || '').trim()
    if (!nome) {
      toast.warning('Busque a peça no almoxarifado ou digite o nome dela.')
      return
    }

    const pecaCadastro = pecaRapidaSelecao?.peca || null
    const qtd = parseFloat(pecaRapidaQtd) || 1
    const disponivel = pecaCadastro ? Number(pecaCadastro.estoqueAtual) || 0 : 0
    const paraCotacao = !pecaCadastro || qtd > disponivel
    const itemId = `peca-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

    onAdicionarItem?.(os.numeroOS, 'peca', {
      id: itemId,
      codigo: pecaCadastro?.codigo || 'A COTAR',
      nome,
      unidade: pecaCadastro?.unidade || 'UN',
      quantidade: qtd,
      precoUnitario: paraCotacao ? 0 : Number(pecaCadastro.precoVenda) || 0,
      desconto: 0,
      categoria: pecaCadastro?.categoria || '',
      statusEstoque: paraCotacao ? 'para_cotacao' : 'em_estoque',
      estoqueAtual: disponivel,
      estoqueMinimo: pecaCadastro?.estoqueMinimo || 1,
      fornecedorId: paraCotacao ? '' : 'estoque-interno',
      fornecedorNome: paraCotacao ? 'Cotação Externa' : 'Estoque Interno',
    })

    if (paraCotacao) {
      toast.warning(
        `"${nome}" não tem saldo suficiente no almoxarifado e foi marcada para Cotação. Mova a OS para "Cotação" no Kanban para disparar a cotação com fornecedores.`
      )
    } else {
      toast.success(`Peça "${nome}" adicionada à OS #${os.numeroOS} (baixa do estoque interno).`)
    }

    setUltimaPecaAdicionada({ id: itemId, nome })
    setPecaRapidaSelecao(null)
    setPecaRapidaQtd('1')
  }

  // Abre a câmera do celular (não a galeria) para fotografar a peça recém-adicionada
  const handleTirarFotoPeca = () => {
    inputFotoPecaRef.current?.click()
  }

  const handleFotoPecaSelecionada = (e) => {
    const file = e.target.files?.[0]
    if (!file || !ultimaPecaAdicionada) return

    const reader = new FileReader()
    reader.onload = (event) => {
      onAtualizarFotoPeca?.(os.numeroOS, ultimaPecaAdicionada.id, event.target.result)
      toast.success(`Foto de "${ultimaPecaAdicionada.nome}" anexada com sucesso!`)
      setUltimaPecaAdicionada(null)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Adiciona um serviço avulso direto na OS a partir da aba Vistoria e Diagnóstico
  const handleAdicionarServicoRapido = () => {
    const nome = (servicoRapidoSelecao?.servico?.nome || servicoRapidoSelecao?.value || servicoRapidoSelecao?.label || '').trim()
    if (!nome) {
      toast.warning('Busque o serviço no catálogo ou digite o nome dele.')
      return
    }
    const preco = parseFloat(servicoRapidoPreco)
    if (!preco || preco <= 0) {
      toast.warning('Informe o valor da mão de obra.')
      return
    }
    const servicoCadastro = servicoRapidoSelecao?.servico || null
    onAdicionarItem?.(os.numeroOS, 'servico', {
      codigo: servicoCadastro?.codigo || 'AVULSO',
      nome,
      unidade: 'MO',
      quantidade: parseFloat(servicoRapidoQtd) || 1,
      precoUnitario: preco,
      desconto: 0,
      categoria: servicoCadastro?.categoria || '',
    })
    toast.success(`Serviço "${nome}" adicionado à OS #${os.numeroOS}.`)
    setServicoRapidoSelecao(null)
    setServicoRapidoQtd('1')
    setServicoRapidoPreco('')
  }

  // Registra um serviço terceirizado direto na OS a partir da aba Terceirizado
  const handleAdicionarTerceiroRapido = () => {
    const nome = terceiroRapidoDescricao.trim()
    if (!nome) {
      toast.warning('Descreva o serviço que será terceirizado.')
      return
    }
    const valor = parseFloat(terceiroRapidoValor)
    if (!valor || valor <= 0) {
      toast.warning('Informe o valor de venda deste serviço terceirizado.')
      return
    }
    const parceiro = terceiroRapidoSelecao?.terceiro || null
    onAdicionarItem?.(os.numeroOS, 'terceiro', {
      id: `terc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      codigo: 'TERCEIRIZADO',
      nome,
      parceiroNome: parceiro ? parceiro.nomeFantasia || parceiro.razaoSocial : terceiroRapidoSelecao?.label || 'Parceiro a definir',
      parceiroId: parceiro?.id || '',
      quantidade: parseFloat(terceiroRapidoQtd) || 1,
      valorVenda: valor,
      precoUnitario: valor,
      desconto: 0,
    })
    toast.success(`Serviço terceirizado "${nome}" adicionado à OS #${os.numeroOS}.`)
    setTerceiroRapidoDescricao('')
    setTerceiroRapidoSelecao(null)
    setTerceiroRapidoQtd('1')
    setTerceiroRapidoValor('')
  }

  // Dispara a solicitação de orçamento/prazo ao parceiro terceirizado selecionado
  const handleSolicitarParceiroWhatsapp = () => {
    const parceiro = terceiroRapidoSelecao?.terceiro
    if (!parceiro) {
      toast.warning('Selecione o parceiro terceirizado para disparar a solicitação.')
      return
    }
    const foneLimpo = (parceiro.contatoTelefone || parceiro.contato?.telefone || '').replace(/\D/g, '')
    if (!foneLimpo) {
      toast.warning('Este parceiro não tem telefone cadastrado.')
      return
    }
    const nomeParceiro = parceiro.nomeFantasia || parceiro.razaoSocial
    const msg = `Olá, *${nomeParceiro}*! Aqui é da *Mecânica Gabriel*.\n\nPrecisamos terceirizar um serviço da OS *#${os.numeroOS}* (${os.marcaModelo || 'veículo'} - Placa ${os.placa || '—'}):\n"${terceiroRapidoDescricao || 'Serviço a definir'}"\n\nPode nos passar prazo e valor?`
    window.open(`https://api.whatsapp.com/send?phone=55${foneLimpo}&text=${encodeURIComponent(msg)}`, '_blank')
    toast.success('Solicitação preparada para envio ao parceiro via WhatsApp!')
  }

  // Reporta um item novo encontrado durante a execução (peça quebrou, item de segurança) —
  // itens de segurança disparam aviso ao cliente na hora, já que bloqueiam o avanço da OS
  // até ele responder (motivoImpedimentoAvancoPorItemAdicional).
  const handleReportarItemAdicional = () => {
    const descricao = itemAdicionalDescricao.trim()
    if (!descricao) {
      toast.warning('Descreva o item encontrado durante a execução.')
      return
    }
    onReportarItemAdicional?.(os.numeroOS, {
      descricao,
      categoria: itemAdicionalCategoria,
      classificacao: itemAdicionalClassificacao,
      valorEstimado: parseFloat(itemAdicionalValor) || 0,
      criadoPor: { tipo: 'secretaria', nome: 'Secretaria/Gestão' },
    })

    const foneLimpo = (os.telefone || '').replace(/\D/g, '')
    const urgencia = itemAdicionalClassificacao === 'seguranca' ? 'segurança' : 'melhoria'
    const msg = `Olá, *${os.cliente}*! Aqui é da *Mecânica Gabriel*.\n\nDurante a execução da OS *#${os.numeroOS}* (${os.marcaModelo || 'veículo'}), identificamos um item adicional de *${urgencia}*:\n"${descricao}"\n\nSua aprovação é necessária para ${itemAdicionalClassificacao === 'seguranca' ? 'continuarmos com segurança' : 'incluirmos este item'}. Confira e responda pelo link:\n👉 ${linkCliente}`
    const url = foneLimpo
      ? `https://api.whatsapp.com/send?phone=55${foneLimpo}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')

    toast.success('Item adicional registrado e cliente notificado via WhatsApp.')
    setItemAdicionalDescricao('')
    setItemAdicionalValor('')
  }

  const checklistEntradaCompleto = checklistCompleto(os.checklistEntrada, ITENS_CHECKLIST_ENTRADA)
  const podeLancarItensRapidos = !isArquivada && (os.status === 'fila' || os.status === 'em_diagnostico')
  const pecasParaCotacao = (os.pecasOS || []).filter((p) => p.statusEstoque === 'para_cotacao')
  const totalItens = (os.pecasOS?.length || 0) + (os.servicosOS?.length || 0) + (os.terceirosOS?.length || 0)

  const abas = [
    { id: 'resumo', label: 'Resumo e Valores' },
    { id: 'itens', label: `Itens (${totalItens})` },
    { id: 'vistoria', label: 'Vistoria e Diagnóstico' },
    ...(abaEstagio ? [{ id: abaEstagio, label: LABEL_ABA_ESTAGIO[abaEstagio] }] : []),
  ]

  const rodape = isArquivada ? (
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
  )

  return (
    <>
      <ModalRedimensionavel
        isOpen={true}
        onClose={onClose}
        titulo={`OS #${os.numeroOS}`}
        subtitulo={`${os.cliente || 'Cliente'} • ${os.placa ? os.placa.toUpperCase() : 'Sem placa'}`}
        badge={statusAtual.label}
        icone={Receipt}
        larguraPadrao={900}
        alturaPadrao={760}
        larguraMinima={700}
        alturaMinima={520}
        storageKey="modal_detalhes_os"
        rodape={
          <div className="w-full flex items-center justify-between">
            {rodape}
            {!isArquivada && (
              <button
                type="button"
                onClick={() => setConfirmandoExclusaoOS(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-medium cursor-pointer transition-colors"
                title="Excluir ou Cancelar Ordem de Serviço"
              >
                <Trash size={15} weight="bold" />
                <span>Excluir</span>
              </button>
            )}
          </div>
        }
      >
        <div className="h-full flex flex-col max-w-4xl mx-auto w-full text-xs text-[#344054]">
          {/* Seletor rápido de Status ou Faixa de Finalizada */}
          {isArquivada ? (
            <div className="shrink-0 mb-3 p-2.5 rounded-2xl bg-[#f0f9ff] border border-[#bae6fd] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0284c7] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Archive size={18} weight="bold" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#101828] block">Ordem Finalizada e Arquivada</span>
                  <span className="text-[11px] text-[#475467]">Entregue em {os.dataFinalizacao || os.dataEntrada}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="shrink-0 mb-3 flex items-center gap-3">
              <span className="text-xs font-bold text-[#475467] shrink-0">Alterar Status:</span>
              <div className="flex-1">
                <Select
                  styles={selectStatusStyles}
                  value={statusAtual}
                  onChange={handleAlterarStatus}
                  options={OPCOES_STATUS_ORDENADAS}
                  isOptionDisabled={(opt) => !podeTransicionarPara(os.status, opt.value)}
                  isSearchable={false}
                />
              </div>
            </div>
          )}

          {/* Abas por Estágio */}
          <div className="shrink-0 mb-3 flex items-center gap-1.5 p-1 bg-[#f2f4f7] rounded-2xl border border-[#e4e7ec] overflow-x-auto no-scrollbar">
            {abas.map((aba) => (
              <button
                key={aba.id}
                type="button"
                onClick={() => setActiveSubTab(aba.id)}
                className={`shrink-0 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeSubTab === aba.id
                    ? 'bg-[#101828] text-white shadow-2xs'
                    : 'text-[#475467] hover:bg-white hover:text-[#101828]'
                }`}
              >
                {aba.label}
              </button>
            ))}
          </div>

          {/* Painel da aba ativa — key reinicia a rolagem ao trocar de aba */}
          <div key={activeSubTab} className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-4 pb-1">
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
                    <div className="grid grid-cols-1 gap-2">
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
                      ) : STATUS_PERMITE_FATURAMENTO.includes(os.status) ? (
                        <button
                          type="button"
                          onClick={() => onFaturarNoPDV?.(os)}
                          className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#101828] hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                          title="Concluir o checklist de saída, ir ao PDV, cobrar e emitir nota fiscal — a OS só é arquivada depois do pagamento confirmado"
                        >
                          <CreditCard size={16} weight="bold" className="text-[#38bdf8]" />
                          <span className="truncate">Faturar e Finalizar no PDV</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#f8fafc] border border-[#e4e7ec] text-[#667085] text-xs font-bold rounded-xl">
                          <Clock size={16} weight="bold" />
                          <span className="truncate">Etapa Atual: {statusAtual.label}</span>
                        </div>
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
                        <div key={idx} className="p-3 text-xs flex items-center justify-between hover:bg-[#f8fafc] transition-colors gap-2.5">
                          {p.fotoUrl ? (
                            <button
                              type="button"
                              onClick={() => setFotoZoomUrl(p.fotoUrl)}
                              className="w-10 h-10 rounded-lg overflow-hidden border border-[#d0d5dd] shrink-0 cursor-pointer"
                              title="Ver foto da peça"
                            >
                              <img src={p.fotoUrl} alt={p.nome} className="w-full h-full object-cover" />
                            </button>
                          ) : (
                            <div className="w-10 h-10 rounded-lg border border-dashed border-[#d0d5dd] bg-[#f8fafc] flex items-center justify-center text-[#98a2b3] shrink-0">
                              <Camera size={15} weight="regular" />
                            </div>
                          )}
                          <div className="min-w-0 pr-3 flex-1">
                            <p className="font-bold text-[#101828] truncate text-xs">{p.nome}</p>
                            <span className="text-[#667085] text-[11px] mt-0.5 block">
                              Cód: {p.codigo || '—'} • {p.quantidade} {p.unidade || 'UN'} × R$ {formatMoeda(p.precoUnitario)}
                            </span>
                            {p.statusEstoque === 'para_cotacao' && (
                              <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#fffaeb] text-[#b54708] border border-[#fedf89]">
                                Para Cotação
                              </span>
                            )}
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
                            R$ {formatMoeda((s.quantidade || 1) * (s.precoUnitario ?? s.valorUnitario ?? 0) - (s.desconto || 0))}
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

                <p className="text-center text-[11px] text-[#98a2b3]">
                  Use "Editar OS" no rodapé para revisar dados de cliente, veículo e triagem.
                </p>
              </div>
            )}

            {activeSubTab === 'vistoria' && (
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
                    <span className="text-[#667085] text-[11px]">22 itens inspecionados — pode ser preenchido pela secretaria ou pelo mecânico</span>
                  </div>
                  {checklistEntradaCompleto ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#101828] text-white text-[10px] font-bold">
                      Concluído
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-[#fffaeb] text-[#b54708] border border-[#fedf89] text-[10px] font-bold">
                      Pendente
                    </span>
                  )}
                </div>

                {/* Aprovação do Cliente na Vistoria (assinatura digital via link publico) —
                    obrigatória antes de avançar a OS para Diagnóstico */}
                <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-4 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#101828] block text-xs">Aprovação da Vistoria pelo Cliente</span>
                    <span className="text-[#667085] text-[11px]">
                      {assinaturaVistoria
                        ? `Assinado por ${assinaturaVistoria.nomeAssinante} em ${assinaturaVistoria.dataHora}`
                        : 'Aguardando o cliente assinar o checklist enviado por WhatsApp'}
                    </span>
                  </div>
                  {assinaturaVistoria ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#101828] text-white text-[10px] font-bold">
                      Aprovado
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-[#fffaeb] text-[#b54708] border border-[#fedf89] text-[10px] font-bold">
                      Pendente
                    </span>
                  )}
                </div>

                {/* Inserção rápida de Peça e Serviço — só faz sentido antes da OS entrar em
                    Cotação/Terceirizado/Execução, etapas que já têm seus próprios fluxos */}
                {podeLancarItensRapidos && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white border border-[#d0d5dd] rounded-2xl p-3.5 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
                        <Package size={14} weight="bold" className="text-[#0284c7]" />
                        Adicionar Peça do Almoxarifado
                      </span>
                      <CreatableSelect
                        value={pecaRapidaSelecao}
                        onChange={setPecaRapidaSelecao}
                        options={opcoesPecasCatalogo}
                        isClearable
                        placeholder="Buscar peça cadastrada ou digitar nova..."
                        styles={customSelectStyles}
                        formatCreateLabel={(input) => `Peça não cadastrada: "${input}" (vai para cotação)`}
                        noOptionsMessage={() => 'Nenhuma peça cadastrada com este termo'}
                      />
                      <input
                        type="number"
                        min="1"
                        value={pecaRapidaQtd}
                        onChange={(e) => setPecaRapidaQtd(e.target.value)}
                        placeholder="Quantidade"
                        className="w-full h-9 px-2.5 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7] text-center"
                      />
                      {pecaRapidaSelecao?.peca ? (
                        <p className="text-[10.5px] text-[#667085]">
                          R$ {Number(pecaRapidaSelecao.peca.precoVenda || 0).toFixed(2)} • Estoque: {pecaRapidaSelecao.peca.estoqueAtual ?? 0} {pecaRapidaSelecao.peca.unidade || 'UN'}
                          {(parseFloat(pecaRapidaQtd) || 1) > (Number(pecaRapidaSelecao.peca.estoqueAtual) || 0) && (
                            <span className="text-[#b54708] font-bold"> — estoque insuficiente, entrará para Cotação</span>
                          )}
                        </p>
                      ) : pecaRapidaSelecao ? (
                        <p className="text-[10.5px] text-[#b54708] font-semibold">Peça não cadastrada — entrará para Cotação</p>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleAdicionarPecaRapida}
                        className="w-full h-9 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus size={14} weight="bold" />
                        Adicionar Peça
                      </button>

                      {ultimaPecaAdicionada && (
                        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#ecfdf3] border border-[#a6f4c5]">
                          <span className="text-[10.5px] font-bold text-[#027a48] truncate flex items-center gap-1">
                            <CheckCircle size={13} weight="fill" />
                            {ultimaPecaAdicionada.nome}
                          </span>
                          <button
                            type="button"
                            onClick={handleTirarFotoPeca}
                            className="h-7 px-2.5 rounded-lg bg-[#027a48] hover:bg-[#026a3f] text-white text-[10.5px] font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Camera size={13} weight="bold" />
                            Tirar Foto
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={inputFotoPecaRef}
                        onChange={handleFotoPecaSelecionada}
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                      />
                    </div>

                    <div className="bg-white border border-[#d0d5dd] rounded-2xl p-3.5 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
                        <Wrench size={14} weight="bold" className="text-[#0284c7]" />
                        Adicionar Serviço do Catálogo
                      </span>
                      <CreatableSelect
                        value={servicoRapidoSelecao}
                        onChange={(opt) => {
                          setServicoRapidoSelecao(opt)
                          if (opt?.servico) {
                            setServicoRapidoPreco(String(opt.servico.valorMaoDeObra || ''))
                          }
                        }}
                        options={opcoesServicosCatalogo}
                        isClearable
                        placeholder="Buscar serviço cadastrado ou digitar novo..."
                        styles={customSelectStyles}
                        formatCreateLabel={(input) => `Adicionar serviço "${input}"`}
                        noOptionsMessage={() => 'Nenhum serviço cadastrado com este termo'}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min="1"
                          value={servicoRapidoQtd}
                          onChange={(e) => setServicoRapidoQtd(e.target.value)}
                          placeholder="Qtd"
                          className="h-9 px-2.5 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7] text-center"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={servicoRapidoPreco}
                          onChange={(e) => setServicoRapidoPreco(e.target.value)}
                          placeholder="Valor R$"
                          className="h-9 px-2.5 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAdicionarServicoRapido}
                        className="w-full h-9 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus size={14} weight="bold" />
                        Adicionar Serviço
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSubTab === 'cotacao' && (
              <div className="space-y-4">
                <div className="bg-[#fffaeb] border border-[#fedf89] rounded-2xl p-4 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#b54708] flex items-center gap-1.5">
                    <Package size={14} weight="bold" />
                    Peças Aguardando Cotação com Fornecedores
                  </span>
                  <p className="text-[11px] text-[#7a4504]">
                    Esta etapa é da secretaria/gestão — envie os itens abaixo para cotação com os fornecedores cadastrados e volte para atualizar o preço final antes de seguir para Aprovação.
                  </p>
                </div>

                <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden divide-y divide-[#f2f4f7] bg-white shadow-2xs">
                  {pecasParaCotacao.length === 0 ? (
                    <p className="p-4 text-center text-[#98a2b3] italic text-xs">Nenhuma peça marcada para cotação nesta OS.</p>
                  ) : (
                    pecasParaCotacao.map((p, idx) => (
                      <div key={idx} className="p-3 text-xs flex items-center justify-between">
                        <div className="min-w-0 pr-3">
                          <p className="font-bold text-[#101828] truncate">{p.nome}</p>
                          <span className="text-[#667085] text-[11px]">Cód: {p.codigo || 'A COTAR'} • {p.quantidade} {p.unidade || 'UN'}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#fffaeb] text-[#b54708] border border-[#fedf89] text-[9px] font-bold shrink-0">
                          Para Cotação
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {onAbrirCotacao && (
                  <button
                    type="button"
                    onClick={() => onAbrirCotacao(os)}
                    className="w-full h-10 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <ArrowSquareOut size={15} weight="bold" />
                    <span>Abrir Cotação de Peças com Fornecedores</span>
                  </button>
                )}
              </div>
            )}

            {activeSubTab === 'terceirizado' && (
              <div className="space-y-4">
                <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-700 flex items-center gap-1.5">
                    <Handshake size={14} weight="bold" />
                    Serviço Terceirizado
                  </span>
                  <p className="text-[11px] text-violet-800">
                    Esta etapa é da secretaria/gestão — negocie com o parceiro externo e registre o serviço terceirizado nesta OS.
                  </p>
                </div>

                <div className="bg-white border border-[#d0d5dd] rounded-2xl p-3.5 space-y-2 shadow-2xs">
                  <span className="text-[11px] font-bold text-[#344054] block">Parceiro Terceirizado</span>
                  <Select
                    value={terceiroRapidoSelecao}
                    onChange={setTerceiroRapidoSelecao}
                    options={opcoesTerceirosCatalogo}
                    isClearable
                    placeholder="Selecione o parceiro cadastrado..."
                    styles={customSelectStyles}
                    noOptionsMessage={() => 'Nenhum parceiro terceirizado cadastrado'}
                  />

                  <span className="text-[11px] font-bold text-[#344054] block pt-1">Descrição do Serviço</span>
                  <input
                    type="text"
                    value={terceiroRapidoDescricao}
                    onChange={(e) => setTerceiroRapidoDescricao(e.target.value)}
                    placeholder="Ex: Teste de estanqueidade do radiador"
                    className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-semibold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7]"
                  />

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <input
                      type="number"
                      min="1"
                      value={terceiroRapidoQtd}
                      onChange={(e) => setTerceiroRapidoQtd(e.target.value)}
                      placeholder="Qtd"
                      className="h-9 px-2.5 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7] text-center"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={terceiroRapidoValor}
                      onChange={(e) => setTerceiroRapidoValor(e.target.value)}
                      placeholder="Valor de Venda R$"
                      className="h-9 px-2.5 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSolicitarParceiroWhatsapp}
                      className="h-9 rounded-xl bg-[#25d366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      <WhatsappLogo size={14} weight="fill" />
                      Solicitar ao Parceiro
                    </button>
                    <button
                      type="button"
                      onClick={handleAdicionarTerceiroRapido}
                      className="h-9 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      <Plus size={14} weight="bold" />
                      Adicionar à OS
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#667085] block mb-2">
                    Terceiros Já Lançados ({os.terceirosOS?.length || 0})
                  </span>
                  <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden divide-y divide-[#f2f4f7] bg-white shadow-2xs">
                    {(!os.terceirosOS || os.terceirosOS.length === 0) ? (
                      <p className="p-4 text-center text-[#98a2b3] italic text-xs">Nenhum serviço de terceiros vinculado ainda.</p>
                    ) : (
                      os.terceirosOS.map((t, idx) => (
                        <div key={idx} className="p-3 text-xs flex items-center justify-between bg-violet-50/20">
                          <div className="min-w-0 pr-3">
                            <p className="font-bold text-[#101828] truncate">{t.nome}</p>
                            <span className="text-[#667085] text-[11px]">Parceiro: {t.parceiroNome || 'A definir'}</span>
                          </div>
                          <span className="font-black text-[#101828] shrink-0 text-xs font-mono">
                            R$ {formatMoeda((parseFloat(t.valorVenda) || 0) * (parseFloat(t.quantidade) || 1) - (parseFloat(t.desconto) || 0))}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'aprovacao' && (
              <div className="space-y-4">
                <div className="bg-[#e0f2fe] border border-[#bae6fd] rounded-2xl p-4 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0369a1] flex items-center gap-1.5">
                    <ShieldCheck size={14} weight="bold" />
                    Aguardando Aprovação do Cliente
                  </span>
                  <p className="text-[11px] text-[#0369a1]">
                    Envie o link para o cliente conferir peças, serviços e laudo técnico, e autorizar a execução do orçamento.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleEnviarWhatsapp}
                    className="flex items-center justify-center gap-1.5 h-10 bg-[#25d366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <WhatsappLogo size={15} weight="fill" />
                    <span>Enviar via WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopiarLink}
                    className="flex items-center justify-center gap-1.5 h-10 bg-white hover:bg-[#f2f4f7] text-[#101828] border border-[#d0d5dd] text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                  >
                    {copiado ? <Check size={15} weight="bold" className="text-[#0284c7]" /> : <Copy size={15} weight="bold" />}
                    <span>{copiado ? 'Copiado!' : 'Copiar Link'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAprovarRapido}
                  className="w-full h-10 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                  title="Use quando o cliente já autorizou por telefone, WhatsApp ou presencialmente"
                >
                  <ShieldCheck size={15} weight="bold" className="text-[#0284c7]" />
                  <span>Cliente já aprovou (telefone/presencial) — Aprovar Agora</span>
                </button>
              </div>
            )}

            {activeSubTab === 'execucao' && (
              <div className="space-y-4">
                <div className="bg-white border border-[#d0d5dd] rounded-2xl p-3.5 space-y-2 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
                    <HourglassMedium size={14} weight="bold" className="text-[#0284c7]" />
                    Reportar Item Adicional Encontrado na Execução
                  </span>
                  <input
                    type="text"
                    value={itemAdicionalDescricao}
                    onChange={(e) => setItemAdicionalDescricao(e.target.value)}
                    placeholder="Ex: Coxim do motor trincado durante a desmontagem"
                    className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-semibold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemAdicionalValor}
                      onChange={(e) => setItemAdicionalValor(e.target.value)}
                      placeholder="Valor estimado R$"
                      className="h-9 px-2.5 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7]"
                    />
                    <div className="grid grid-cols-2 gap-0.5 bg-white p-0.5 rounded-xl border border-[#d0d5dd]">
                      <button
                        type="button"
                        onClick={() => setItemAdicionalClassificacao('seguranca')}
                        className={`h-8 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          itemAdicionalClassificacao === 'seguranca' ? 'bg-rose-600 text-white' : 'text-[#667085] hover:bg-[#f2f4f7]'
                        }`}
                      >
                        Segurança
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemAdicionalClassificacao('opcional')}
                        className={`h-8 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          itemAdicionalClassificacao === 'opcional' ? 'bg-[#101828] text-white' : 'text-[#667085] hover:bg-[#f2f4f7]'
                        }`}
                      >
                        Opcional
                      </button>
                    </div>
                  </div>
                  {itemAdicionalClassificacao === 'seguranca' && (
                    <p className="text-[10.5px] text-rose-700 flex items-center gap-1">
                      <WarningCircle size={12} weight="fill" />
                      <span>Itens de segurança bloqueiam o avanço da OS até o cliente responder.</span>
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleReportarItemAdicional}
                    className="w-full h-9 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <WhatsappLogo size={14} weight="fill" />
                    Reportar e Notificar Cliente
                  </button>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#667085] block mb-2">
                    Itens Adicionais Reportados ({os.itensAdicionaisOS?.length || 0})
                  </span>
                  {(!os.itensAdicionaisOS || os.itensAdicionaisOS.length === 0) ? (
                    <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-6 text-center">
                      <p className="text-[11px] text-[#667085]">Nenhum item adicional identificado nesta OS até o momento.</p>
                    </div>
                  ) : (
                    <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden divide-y divide-[#f2f4f7] bg-white shadow-2xs">
                      {os.itensAdicionaisOS.map((item) => (
                        <div key={item.id} className="p-3 text-xs flex items-center justify-between gap-2">
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-[#101828] truncate">{item.descricao}</p>
                              {item.classificacao === 'seguranca' && (
                                <span className="shrink-0 px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-bold">
                                  Segurança
                                </span>
                              )}
                            </div>
                            <span className="text-[#667085] text-[11px]">R$ {formatMoeda(item.valorEstimado)}</span>
                          </div>
                          {item.status === 'aprovado' ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#101828] text-white text-[10px] font-bold shrink-0">Aprovado</span>
                          ) : item.status === 'recusado' ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#f2f4f7] text-[#667085] text-[10px] font-bold shrink-0">Recusado</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-[#fffaeb] text-[#b54708] border border-[#fedf89] text-[10px] font-bold shrink-0">
                              Aguardando Cliente
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </ModalRedimensionavel>

      {/* Zoom da foto da peça (clicada na aba Itens) */}
      {fotoZoomUrl && (
        <div
          className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setFotoZoomUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={fotoZoomUrl} alt="Foto da peça ampliada" className="max-h-[80vh] w-auto object-contain" />
            <button
              type="button"
              onClick={() => setFotoZoomUrl(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* Diálogo de Confirmação para Aprovação Rápida na Frente do Modal */}
      <ModalConfirmacao
        isOpen={confirmandoAprovarRapido}
        onClose={() => setConfirmandoAprovarRapido(false)}
        onConfirm={confirmarAprovacaoRapida}
        titulo="Aprovar orçamento e iniciar execução?"
        descricao="Use esta opção quando o cliente já autorizou os serviços e peças por telefone, WhatsApp ou presencialmente."
        itemDestaque={os ? `OS #${os.numeroOS} • ${os.cliente || 'Cliente'} • Total: R$ ${formatMoeda(os.valorTotal || 0)}` : ''}
        textoConfirmar="Sim, Aprovar Agora"
        textoCancelar="Cancelar"
        variante="primario"
      />

      {/* Diálogo de Confirmação para Exclusão da OS na Frente do Modal */}
      <ModalConfirmacao
        isOpen={confirmandoExclusaoOS}
        onClose={() => setConfirmandoExclusaoOS(false)}
        onConfirm={confirmarExclusaoOS}
        titulo="Cancelar e excluir esta OS?"
        descricao="Esta ação remove a ordem de serviço permanentemente do sistema e não pode ser desfeita."
        itemDestaque={os ? `OS #${os.numeroOS} • ${os.cliente || 'Cliente'} (${os.placa || 'Sem placa'})` : ''}
        textoConfirmar="Sim, Excluir Definitivamente"
        textoCancelar="Cancelar"
        variante="perigo"
      />
    </>
  )
}
