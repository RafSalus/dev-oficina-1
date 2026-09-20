import React, { useState, useMemo, useRef } from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import {
  Handshake,
  Car,
  Plus,
  Trash,
  PencilSimple,
  X,
  FloppyDisk,
  CheckCircle,
  CurrencyDollar,
  Tag,
  ArrowDownRight,
  Sparkle,
  WhatsappLogo,
  Copy,
  Check,
  ArrowsOutSimple,
  ArrowsInSimple,
  Camera,
  Eye,
  MagnifyingGlass,
  PaperPlaneTilt,
  Storefront,
  WarningCircle,
  Clock,
  ArrowsClockwise,
  PhoneCall,
  Buildings,
  ShieldCheck,
  Wrench,
  FileText,
  ArrowsOutCardinal,
} from '@phosphor-icons/react'
import {
  PARCEIROS_TERCEIROS,
  CATEGORIAS_TERCEIROS_OPCOES,
  STATUS_TERCEIRO_OPCOES,
  PRAZO_TERCEIRO_OPCOES,
  CATALOGO_SERVICOS_TERCEIROS,
} from '../../../../constants/catalogoTerceiros'
import { gerarLaudoTecnico } from '../../../../constants/catalogoPecasServicos'
import { toast } from 'sonner'

// Constantes de persistência e dimensões padrão dos modais (Regra 9 de SYSTEM_RULES.md)
const CHAVE_STORAGE_MODAL_TERCEIRO = 'dev_oficina_modal_terceiro_dims'
const CHAVE_STORAGE_MODAL_COTACAO_TERC = 'dev_oficina_modal_cotacao_terc_dims'
const CHAVE_STORAGE_MODAL_LAUDO = 'dev_oficina_modal_laudo_dims'
const LARGURA_PADRAO_MODAL = 896
const ALTURA_PADRAO_MODAL = 640
const LARGURA_PADRAO_LAUDO = 1152
const ALTURA_PADRAO_LAUDO = 720

const carregarDimensoesSalvas = (chave, padraoLargura, padraoAltura) => {
  if (typeof window === 'undefined') {
    return { largura: padraoLargura, altura: padraoAltura, posicaoX: 0, posicaoY: 0 }
  }
  try {
    const salvo = localStorage.getItem(chave)
    if (salvo) {
      const parsed = JSON.parse(salvo)
      return {
        largura: Math.max(500, Math.min(window.innerWidth - 40, parsed.largura || padraoLargura)),
        altura: Math.max(380, Math.min(window.innerHeight - 40, parsed.altura || padraoAltura)),
        posicaoX: parsed.posicaoX || 0,
        posicaoY: parsed.posicaoY || 0,
      }
    }
  } catch (e) {
    console.error('Erro ao carregar dimensões salvas do modal:', e)
  }
  return { largura: padraoLargura, altura: padraoAltura, posicaoX: 0, posicaoY: 0 }
}

const salvarDimensoesNoStorage = (chave, dimensoes) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(chave, JSON.stringify(dimensoes))
  } catch (e) {
    console.error('Erro ao persistir dimensões do modal no storage:', e)
  }
}

// Estilos customizados do react-select alinhados com o tema oficial sóbrio
const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '38px',
    height: '38px',
    backgroundColor: '#ffffff',
    borderColor: state.isFocused ? '#0284c7' : '#d0d5dd',
    borderRadius: '0.75rem',
    boxShadow: state.isFocused ? '0 0 0 1px #0284c7' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#0284c7' : '#98a2b3',
    },
    fontSize: '0.8125rem',
    cursor: 'pointer',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 10px',
    height: '38px',
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    border: '1px solid #d0d5dd',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: 9999,
    overflow: 'hidden',
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
    maxHeight: '200px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#101828'
      : state.isFocused
      ? '#f2f4f7'
      : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#101828',
    fontSize: '0.8125rem',
    borderRadius: '0.5rem',
    padding: '8px 12px',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#101828',
      color: '#ffffff',
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: '#101828',
    fontWeight: 500,
  }),
  placeholder: (base) => ({
    ...base,
    color: '#98a2b3',
    fontSize: '0.8125rem',
  }),
}

const customSelectSmallStyles = {
  ...customSelectStyles,
  control: (base, state) => ({
    ...base,
    minHeight: '32px',
    height: '32px',
    backgroundColor: '#ffffff',
    borderColor: state.isFocused ? '#0284c7' : '#d0d5dd',
    borderRadius: '0.75rem',
    boxShadow: state.isFocused ? '0 0 0 1px #0284c7' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#0284c7' : '#98a2b3',
    },
    fontSize: '0.75rem',
    cursor: 'pointer',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 8px',
    height: '32px',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#101828',
    fontWeight: 500,
  }),
}

export function TabTerceiros({ formData, updateFormData, onSaveStep, onCancel }) {
  const {
    cliente = '',
    documento = '',
    telefone = '',
    placa = '',
    marcaModelo = '',
    ano = '',
    cor = '',
    km = '',
    relatoCliente = '',
    mecanicoId = '',
    mecanicoNome = '',
    pecasDiagnostico = [],
    servicosDiagnostico = [],
    laudoTecnico = '',
    terceirosOS = [],
    cotacoesTerceirosEnviadas = [],
  } = formData

  // Modais de apoio
  const [modalDadosAberto, setModalDadosAberto] = useState(false)
  const [modalLaudoAberto, setModalLaudoAberto] = useState(false)
  const [modalLaudoMaximizada, setModalLaudoMaximizada] = useState(false)
  const [modalTerceiroAberto, setModalTerceiroAberto] = useState(false)
  const [modalTerceiroMaximizada, setModalTerceiroMaximizada] = useState(false)
  const [modalCotacaoAberto, setModalCotacaoAberto] = useState(false)
  const [modalCotacaoMaximizada, setModalCotacaoMaximizada] = useState(false)
  const [fotoZoomUrl, setFotoZoomUrl] = useState(null)
  const [copiadoLaudo, setCopiadoLaudo] = useState(false)
  const [copiadoLinkCotacao, setCopiadoLinkCotacao] = useState(false)
  const [editandoTerceiroId, setEditandoTerceiroId] = useState(null)

  // Dimensões, posição e redimensionamento livre do modal de serviço de terceiro
  const [tamanhoModalTerceiro, setTamanhoModalTerceiro] = useState(() =>
    carregarDimensoesSalvas(CHAVE_STORAGE_MODAL_TERCEIRO, LARGURA_PADRAO_MODAL, ALTURA_PADRAO_MODAL)
  )
  const [estaRedimensionandoTerceiro, setEstaRedimensionandoTerceiro] = useState(false)
  const [estaArrastandoTerceiro, setEstaArrastandoTerceiro] = useState(false)
  const dragModalTerceiroRef = useRef({
    ativo: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
  })
  const resizeModalTerceiroRef = useRef({
    ativo: false,
    direcao: null,
    startX: 0,
    startY: 0,
    startLargura: LARGURA_PADRAO_MODAL,
    startAltura: ALTURA_PADRAO_MODAL,
    startPosX: 0,
    startPosY: 0,
  })

  // Dimensões, posição e redimensionamento livre do modal de cotação externa
  const [tamanhoModalCotacao, setTamanhoModalCotacao] = useState(() =>
    carregarDimensoesSalvas(CHAVE_STORAGE_MODAL_COTACAO_TERC, LARGURA_PADRAO_MODAL, ALTURA_PADRAO_MODAL)
  )
  const [estaRedimensionandoCotacao, setEstaRedimensionandoCotacao] = useState(false)
  const [estaArrastandoCotacao, setEstaArrastandoCotacao] = useState(false)
  const dragModalCotacaoRef = useRef({
    ativo: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
  })
  const resizeModalCotacaoRef = useRef({
    ativo: false,
    direcao: null,
    startX: 0,
    startY: 0,
    startLargura: LARGURA_PADRAO_MODAL,
    startAltura: ALTURA_PADRAO_MODAL,
    startPosX: 0,
    startPosY: 0,
  })

  // Dimensões, posição e redimensionamento livre do modal de laudo
  const [tamanhoModalLaudo, setTamanhoModalLaudo] = useState(() =>
    carregarDimensoesSalvas(CHAVE_STORAGE_MODAL_LAUDO, LARGURA_PADRAO_LAUDO, ALTURA_PADRAO_LAUDO)
  )
  const [estaRedimensionandoLaudo, setEstaRedimensionandoLaudo] = useState(false)
  const [estaArrastandoLaudo, setEstaArrastandoLaudo] = useState(false)
  const dragModalLaudoRef = useRef({
    ativo: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
  })
  const resizeModalLaudoRef = useRef({
    ativo: false,
    direcao: null,
    startX: 0,
    startY: 0,
    startLargura: LARGURA_PADRAO_LAUDO,
    startAltura: ALTURA_PADRAO_LAUDO,
    startPosX: 0,
    startPosY: 0,
  })

  // Filtros e busca na tabela de terceiros
  const [termoBusca, setTermoBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  // Referência para upload de foto no modal
  const fileInputTerceiroRef = useRef(null)

  // Estado padrão do formulário de serviço de terceiro
  const FORM_TERCEIRO_DEFAULT = {
    codigo: '',
    nome: '',
    categoria: 'Retífica de Motor e Cabeçote',
    status: 'aguardando_envio',
    parceiroId: 'parc-1',
    parceiroNome: 'Retífica Bandeirantes',
    custo: '0.00',
    valorVenda: '0.00',
    desconto: '0.00',
    prazoEstimado: '1 dia útil (24 horas)',
    ordemExterna: '',
    garantia: '6 meses',
    fotoUrl: null,
    fotoNome: '',
    observacoes: '',
  }

  const [formTerceiro, setFormTerceiro] = useState(FORM_TERCEIRO_DEFAULT)

  // Estado da cotação a ser gerada / enviada
  const [itensSelecionadosCotacao, setItensSelecionadosCotacao] = useState([])
  const [parceirosSelecionados, setParceirosSelecionados] = useState(
    PARCEIROS_TERCEIROS.slice(0, 2).map((p) => p.id)
  )
  const [cotacaoAtivaId, setCotacaoAtivaId] = useState('')
  const [cotacaoEnviadaSucesso, setCotacaoEnviadaSucesso] = useState(false)

  // Opções do catálogo de terceiros para CreatableSelect
  const opcoesCatalogoTerceiros = useMemo(() => {
    return CATALOGO_SERVICOS_TERCEIROS.map((c) => ({
      value: c.nome,
      label: `${c.nome} (${c.categoria})`,
      dadosCompletos: c,
    }))
  }, [])

  // Opções de categorias para o filtro
  const opcoesFiltroCategoria = useMemo(() => {
    return [
      { value: 'todas', label: 'Todas as categorias' },
      ...CATEGORIAS_TERCEIROS_OPCOES,
    ]
  }, [])

  // Opções de parceiros para selects
  const opcoesParceiros = useMemo(() => {
    return PARCEIROS_TERCEIROS.map((p) => ({
      value: p.id,
      label: `${p.nome} • ${p.especialidade}`,
      nome: p.nome,
    }))
  }, [])

  // Serviços da triagem/diagnóstico que ainda não foram puxados
  const itensDiagnosticoDisponiveis = useMemo(() => {
    const nomesJaAdicionados = terceirosOS.map((t) => (t.nome || '').trim().toLowerCase())

    // Procura em servicosDiagnostico
    const servicosPendentes = servicosDiagnostico.filter((sd) => {
      const nomeSd = (sd.nome || '').trim().toLowerCase()
      return !nomesJaAdicionados.includes(nomeSd)
    })

    // Procura também em pecasDiagnostico se houver itens sugestivos de terceirização
    const pecasPendentes = pecasDiagnostico.filter((pd) => {
      const nomePd = (pd.nome || '').trim().toLowerCase()
      const ehSugeridoTerceiro = /ret[íi]fica|torno|usinagem|solda|m[óo]dulo|ecu|caixa|cabe[çc]ote|radiador|guincho/i.test(nomePd)
      return ehSugeridoTerceiro && !nomesJaAdicionados.includes(nomePd)
    })

    return [...servicosPendentes, ...pecasPendentes]
  }, [servicosDiagnostico, pecasDiagnostico, terceirosOS])

  // Filtragem da tabela de serviços de terceiros
  const terceirosFiltrados = useMemo(() => {
    return terceirosOS.filter((item) => {
      const termo = termoBusca.toLowerCase().trim()
      const matchBusca =
        !termo ||
        (item.nome && item.nome.toLowerCase().includes(termo)) ||
        (item.codigo && item.codigo.toLowerCase().includes(termo)) ||
        (item.parceiroNome && item.parceiroNome.toLowerCase().includes(termo)) ||
        (item.categoria && item.categoria.toLowerCase().includes(termo)) ||
        (item.ordemExterna && item.ordemExterna.toLowerCase().includes(termo)) ||
        (item.observacoes && item.observacoes.toLowerCase().includes(termo))

      const matchCategoria =
        filtroCategoria === 'todas' || item.categoria === filtroCategoria

      const matchStatus =
        filtroStatus === 'todos' || item.status === filtroStatus

      return matchBusca && matchCategoria && matchStatus
    })
  }, [terceirosOS, termoBusca, filtroCategoria, filtroStatus])

  // Métricas financeiras e de volume dos serviços terceirizados
  const metricas = useMemo(() => {
    let totalItens = terceirosOS.length
    let totalEmExecucao = 0
    let totalParaCotacao = 0
    let custoTotal = 0
    let totalVendaBruto = 0
    let totalDescontos = 0

    terceirosOS.forEach((item) => {
      const custo = parseFloat(item.custo) || 0
      const venda = parseFloat(item.valorVenda) || 0
      const desc = parseFloat(item.desconto) || 0

      custoTotal += custo
      totalVendaBruto += venda
      totalDescontos += desc

      if (
        item.status === 'em_execucao' ||
        item.status === 'pronto_para_retirada' ||
        item.status === 'concluido'
      ) {
        totalEmExecucao++
      } else if (
        item.status === 'para_cotacao' ||
        item.status === 'aguardando_envio'
      ) {
        totalParaCotacao++
      }
    })

    const totalLiquido = Math.max(0, totalVendaBruto - totalDescontos)
    const lucroBruto = Math.max(0, totalLiquido - custoTotal)
    const margemPercentual =
      totalLiquido > 0 ? ((lucroBruto / totalLiquido) * 100).toFixed(0) : '0'

    return {
      totalItens,
      totalEmExecucao,
      totalParaCotacao,
      custoTotal: custoTotal.toFixed(2),
      totalDescontos: totalDescontos.toFixed(2),
      totalLiquido: totalLiquido.toFixed(2),
      lucroBruto: lucroBruto.toFixed(2),
      margemPercentual,
    }
  }, [terceirosOS])

  // Handler para importar serviços da tela de diagnóstico
  const handlePuxarDoDiagnostico = () => {
    if (!servicosDiagnostico.length && !pecasDiagnostico.length) {
      toast.warning('Não há serviços ou peças registradas na aba de diagnóstico para importar.')
      return
    }

    const nomesJaAdicionados = terceirosOS.map((t) => (t.nome || '').trim().toLowerCase())

    // Coleta itens de serviços
    let itensParaImportar = servicosDiagnostico.filter((sd) => {
      const nomeSd = (sd.nome || '').trim().toLowerCase()
      return !nomesJaAdicionados.includes(nomeSd)
    })

    // Coleta também peças que representam serviços externos (ex: retíficas)
    const pecasExternas = pecasDiagnostico.filter((pd) => {
      const nomePd = (pd.nome || '').trim().toLowerCase()
      const ehSugeridoTerceiro = /ret[íi]fica|torno|usinagem|solda|m[óo]dulo|ecu|caixa|cabe[çc]ote|radiador|guincho/i.test(nomePd)
      return ehSugeridoTerceiro && !nomesJaAdicionados.includes(nomePd)
    })

    // Une as listas sem duplicidade
    const listaConsolidada = [...itensParaImportar, ...pecasExternas]

    if (listaConsolidada.length === 0) {
      toast.info('Todos os serviços da aba de diagnóstico já foram importados para Terceiros.')
      return
    }

    const novosItens = listaConsolidada.map((itemDiag, idx) => {
      const indexTotal = terceirosOS.length + idx + 1
      const nomeLower = itemDiag.nome ? itemDiag.nome.trim().toLowerCase() : ''

      // Tenta encontrar parâmetros no catálogo de terceiros
      const itemCatalogo = CATALOGO_SERVICOS_TERCEIROS.find(
        (c) =>
          c.nome.toLowerCase() === nomeLower ||
          c.nome.toLowerCase().includes(nomeLower) ||
          nomeLower.includes(c.nome.toLowerCase())
      )

      // Identifica parceiro padrão
      const parceiroPadrao =
        PARCEIROS_TERCEIROS.find((p) => p.id === itemCatalogo?.parceiroPadraoId) ||
        PARCEIROS_TERCEIROS[0]

      const codigoGerado =
        itemCatalogo?.codigo || `TER-${String(indexTotal).padStart(3, '0')}`

      const categoria =
        itemCatalogo?.categoria ||
        (/ret[íi]fica|cabe[çc]ote|bloco/i.test(nomeLower)
          ? 'Retífica de Motor e Cabeçote'
          : /torno|usinagem|prisioneiro/i.test(nomeLower)
          ? 'Tornearia e Usinagem'
          : /m[óo]dulo|eletr[ôo]nic|ecu|painel/i.test(nomeLower)
          ? 'Módulos e Eletrônica'
          : /solda/i.test(nomeLower)
          ? 'Soldas Especiais'
          : /dire[çc][ãa]o|hidr[áa]ulica/i.test(nomeLower)
          ? 'Direção Hidráulica e Elétrica'
          : /radiador|colmeia/i.test(nomeLower)
          ? 'Radiadores e Arrefecimento'
          : /guincho|reboque/i.test(nomeLower)
          ? 'Guincho e Transporte'
          : 'Outros Especializados')

      const custo = itemCatalogo?.custoPadrao
        ? itemCatalogo.custoPadrao.toFixed(2)
        : '150.00'
      const valorVenda = itemCatalogo?.valorVendaPadrao
        ? itemCatalogo.valorVendaPadrao.toFixed(2)
        : '250.00'
      const prazoEstimado = itemCatalogo?.prazoPadrao || '1 dia útil (24 horas)'
      const garantia = itemCatalogo?.garantiaPadrao || '3 meses'

      return {
        id: `terc-imp-${Date.now()}-${idx}`,
        codigo: codigoGerado,
        nome: itemDiag.nome,
        categoria,
        status: 'aguardando_envio',
        parceiroId: parceiroPadrao.id,
        parceiroNome: parceiroPadrao.nome,
        custo,
        valorVenda,
        desconto: '0.00',
        prazoEstimado,
        ordemExterna: '',
        garantia,
        fotoUrl: itemDiag.fotoUrl || null,
        fotoNome: itemDiag.fotoNome || '',
        observacoes:
          itemDiag.observacao || 'Identificado na triagem técnica da oficina mecânica',
        origem: 'diagnostico',
      }
    })

    const listaAtualizada = [...terceirosOS, ...novosItens]
    updateFormData({ terceirosOS: listaAtualizada })
    toast.success(
      `${novosItens.length} ${
        novosItens.length === 1
          ? 'serviço terceirizado importado'
          : 'serviços terceirizados importados'
      } do diagnóstico!`
    )
  }

  // Abrir modal para novo serviço de terceiro
  const handleAbrirNovoTerceiro = () => {
    const proximoNumero = terceirosOS.length + 1
    const codigoSugerido = `TER-${String(proximoNumero).padStart(3, '0')}`

    setFormTerceiro({
      ...FORM_TERCEIRO_DEFAULT,
      codigo: codigoSugerido,
    })
    setEditandoTerceiroId(null)
    setModalTerceiroAberto(true)
  }

  // Abrir modal para editar serviço de terceiro existente
  const handleAbrirEditarTerceiro = (item) => {
    setFormTerceiro({
      codigo: item.codigo || '',
      nome: item.nome || '',
      categoria: item.categoria || 'Retífica de Motor e Cabeçote',
      status: item.status || 'aguardando_envio',
      parceiroId: item.parceiroId || 'parc-1',
      parceiroNome: item.parceiroNome || 'Retífica Bandeirantes',
      custo: item.custo || '0.00',
      valorVenda: item.valorVenda || '0.00',
      desconto: item.desconto || '0.00',
      prazoEstimado: item.prazoEstimado || '1 dia útil (24 horas)',
      ordemExterna: item.ordemExterna || '',
      garantia: item.garantia || '6 meses',
      fotoUrl: item.fotoUrl || null,
      fotoNome: item.fotoNome || '',
      observacoes: item.observacoes || '',
    })
    setEditandoTerceiroId(item.id)
    setModalTerceiroAberto(true)
  }

  // Excluir serviço de terceiro
  const handleExcluirTerceiro = (id) => {
    const item = terceirosOS.find((t) => t.id === id)
    const atualizados = terceirosOS.filter((t) => t.id !== id)
    updateFormData({ terceirosOS: atualizados })
    toast.info(`Serviço de terceiro "${item?.nome || 'Item'}" removido da OS.`)
  }

  // Salvar formulário de serviço de terceiro (adicionar ou atualizar)
  const handleSalvarTerceiro = (e) => {
    e?.preventDefault()

    if (!formTerceiro.nome || !formTerceiro.nome.trim()) {
      toast.error('Informe a descrição do serviço terceirizado.')
      return
    }

    const custoNum = parseFloat(formTerceiro.custo) || 0
    const vendaNum = parseFloat(formTerceiro.valorVenda) || 0

    if (vendaNum < 0 || custoNum < 0) {
      toast.error('Valores financeiros não podem ser negativos.')
      return
    }

    const parceiroObjeto = PARCEIROS_TERCEIROS.find(
      (p) => p.id === formTerceiro.parceiroId
    )
    const parceiroNomeFinal = parceiroObjeto
      ? parceiroObjeto.nome
      : formTerceiro.parceiroNome || 'Parceiro Externo'

    if (editandoTerceiroId) {
      // Atualização
      const atualizados = terceirosOS.map((item) => {
        if (item.id === editandoTerceiroId) {
          return {
            ...item,
            ...formTerceiro,
            parceiroNome: parceiroNomeFinal,
          }
        }
        return item
      })
      updateFormData({ terceirosOS: atualizados })
      toast.success('Serviço terceirizado atualizado com sucesso!')
    } else {
      // Inserção
      const novoItem = {
        id: `terc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ...formTerceiro,
        parceiroNome: parceiroNomeFinal,
        origem: 'manual',
      }
      updateFormData({ terceirosOS: [...terceirosOS, novoItem] })
      toast.success('Serviço de terceiro adicionado à Ordem de Serviço!')
    }

    setModalTerceiroAberto(false)
    setEditandoTerceiroId(null)
  }

  // Upload de foto no formulário de terceiro
  const handleFotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setFormTerceiro((prev) => ({
        ...prev,
        fotoUrl: event.target.result,
        fotoNome: file.name,
      }))
      toast.success('Foto da peça ou componente anexada com sucesso!')
    }
    reader.readAsDataURL(file)
  }

  // Remover foto do formulário de terceiro
  const handleRemoverFoto = () => {
    setFormTerceiro((prev) => ({
      ...prev,
      fotoUrl: null,
      fotoNome: '',
    }))
    if (fileInputTerceiroRef.current) {
      fileInputTerceiroRef.current.value = ''
    }
  }

  // Seleção rápida ao escolher do catálogo
  const handleSelecionarDoCatalogo = (opcao) => {
    if (!opcao) return

    if (opcao.dadosCompletos) {
      const c = opcao.dadosCompletos
      const parceiro = PARCEIROS_TERCEIROS.find((p) => p.id === c.parceiroPadraoId)

      setFormTerceiro((prev) => ({
        ...prev,
        nome: c.nome,
        categoria: c.categoria,
        custo: c.custoPadrao.toFixed(2),
        valorVenda: c.valorVendaPadrao.toFixed(2),
        parceiroId: c.parceiroPadraoId || prev.parceiroId,
        parceiroNome: parceiro ? parceiro.nome : c.parceiroPadraoNome,
        prazoEstimado: c.prazoPadrao || prev.prazoEstimado,
        garantia: c.garantiaPadrao || prev.garantia,
        observacoes: c.descricao || prev.observacoes,
      }))
    } else {
      setFormTerceiro((prev) => ({
        ...prev,
        nome: opcao.value || opcao.label,
      }))
    }
  }

  // ==========================================
  // HANDLERS MODAL DE SERVIÇO TERCEIRIZADO (ARRASTO E RESIZE COM PERSISTÊNCIA)
  // ==========================================

  const handleIniciarArrastoHeaderTerceiro = (e) => {
    if (e.button !== 0 || modalTerceiroMaximizada) return
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return

    e.preventDefault()
    setEstaArrastandoTerceiro(true)

    const startX = e.clientX
    const startY = e.clientY
    const startPosX = tamanhoModalTerceiro.posicaoX || 0
    const startPosY = tamanhoModalTerceiro.posicaoY || 0

    dragModalTerceiroRef.current = {
      ativo: true,
      startX,
      startY,
      startPosX,
      startPosY,
    }

    let ultimoX = startPosX
    let ultimoY = startPosY

    const handleMouseMove = (moveEvent) => {
      if (!dragModalTerceiroRef.current.ativo) return
      const deltaX = moveEvent.clientX - dragModalTerceiroRef.current.startX
      const deltaY = moveEvent.clientY - dragModalTerceiroRef.current.startY

      const maxPosX = Math.max(0, (window.innerWidth - 120) / 2)
      const maxPosY = Math.max(0, (window.innerHeight - 80) / 2)

      const novaPosX = Math.min(
        maxPosX,
        Math.max(-maxPosX, Math.round(dragModalTerceiroRef.current.startPosX + deltaX))
      )
      const novaPosY = Math.min(
        maxPosY,
        Math.max(-maxPosY, Math.round(dragModalTerceiroRef.current.startPosY + deltaY))
      )

      ultimoX = novaPosX
      ultimoY = novaPosY

      setTamanhoModalTerceiro((prev) => ({
        ...prev,
        posicaoX: novaPosX,
        posicaoY: novaPosY,
      }))
    }

    const handleMouseUp = () => {
      dragModalTerceiroRef.current.ativo = false
      setEstaArrastandoTerceiro(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      setTamanhoModalTerceiro((prev) => {
        const atualizado = { ...prev, posicaoX: ultimoX, posicaoY: ultimoY }
        salvarDimensoesNoStorage(CHAVE_STORAGE_MODAL_TERCEIRO, atualizado)
        return atualizado
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleIniciarRedimensionamentoTerceiro = (e, direcao) => {
    e.preventDefault()
    e.stopPropagation()
    if (modalTerceiroMaximizada) return

    setEstaRedimensionandoTerceiro(true)
    const startX = e.clientX
    const startY = e.clientY
    const startLargura = tamanhoModalTerceiro.largura
    const startAltura = tamanhoModalTerceiro.altura
    const startPosX = tamanhoModalTerceiro.posicaoX || 0
    const startPosY = tamanhoModalTerceiro.posicaoY || 0

    resizeModalTerceiroRef.current = {
      ativo: true,
      direcao,
      startX,
      startY,
      startLargura,
      startAltura,
      startPosX,
      startPosY,
    }

    let ultimoLargura = startLargura
    let ultimoAltura = startAltura
    let ultimoPosX = startPosX
    let ultimoPosY = startPosY

    const handleMouseMove = (moveEvent) => {
      if (!resizeModalTerceiroRef.current.ativo) return
      const deltaX = moveEvent.clientX - resizeModalTerceiroRef.current.startX
      const deltaY = moveEvent.clientY - resizeModalTerceiroRef.current.startY

      const minLargura = 520
      const maxLargura = Math.max(minLargura, window.innerWidth - 40)
      const minAltura = 420
      const maxAltura = Math.max(minAltura, window.innerHeight - 40)

      let novaLargura = resizeModalTerceiroRef.current.startLargura
      let novaAltura = resizeModalTerceiroRef.current.startAltura
      let novaPosX = resizeModalTerceiroRef.current.startPosX
      let novaPosY = resizeModalTerceiroRef.current.startPosY

      if (direcao.includes('r')) {
        novaLargura = Math.min(
          maxLargura,
          Math.max(minLargura, resizeModalTerceiroRef.current.startLargura + deltaX)
        )
      } else if (direcao.includes('l')) {
        const possivelLargura = resizeModalTerceiroRef.current.startLargura - deltaX
        if (possivelLargura >= minLargura && possivelLargura <= maxLargura) {
          novaLargura = possivelLargura
          novaPosX = resizeModalTerceiroRef.current.startPosX + deltaX / 2
        }
      }

      if (direcao.includes('b')) {
        novaAltura = Math.min(
          maxAltura,
          Math.max(minAltura, resizeModalTerceiroRef.current.startAltura + deltaY)
        )
      } else if (direcao.includes('t')) {
        const possivelAltura = resizeModalTerceiroRef.current.startAltura - deltaY
        if (possivelAltura >= minAltura && possivelAltura <= maxAltura) {
          novaAltura = possivelAltura
          novaPosY = resizeModalTerceiroRef.current.startPosY + deltaY / 2
        }
      }

      ultimoLargura = Math.round(novaLargura)
      ultimoAltura = Math.round(novaAltura)
      ultimoPosX = Math.round(novaPosX)
      ultimoPosY = Math.round(novaPosY)

      setTamanhoModalTerceiro((prev) => ({
        ...prev,
        largura: ultimoLargura,
        altura: ultimoAltura,
        posicaoX: ultimoPosX,
        posicaoY: ultimoPosY,
      }))
    }

    const handleMouseUp = () => {
      resizeModalTerceiroRef.current.ativo = false
      setEstaRedimensionandoTerceiro(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      setTamanhoModalTerceiro((prev) => {
        const atualizado = {
          ...prev,
          largura: ultimoLargura,
          altura: ultimoAltura,
          posicaoX: ultimoPosX,
          posicaoY: ultimoPosY,
        }
        salvarDimensoesNoStorage(CHAVE_STORAGE_MODAL_TERCEIRO, atualizado)
        return atualizado
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleRestaurarTamanhoPadraoTerceiro = () => {
    const padrao = {
      largura: LARGURA_PADRAO_MODAL,
      altura: ALTURA_PADRAO_MODAL,
      posicaoX: 0,
      posicaoY: 0,
    }
    setTamanhoModalTerceiro(padrao)
    setModalTerceiroMaximizada(false)
    salvarDimensoesNoStorage(CHAVE_STORAGE_MODAL_TERCEIRO, padrao)
    toast.success('Tamanho e posição do modal restaurados para o padrão.')
  }

  // ==========================================
  // HANDLERS MODAL DE COTAÇÃO / PARCEIROS (ARRASTO E RESIZE)
  // ==========================================

  const handleAbrirModalCotacao = () => {
    if (terceirosOS.length === 0) {
      toast.warning('Adicione pelo menos um serviço de terceiro para solicitar cotação.')
      return
    }

    // Por padrão seleciona todos os que estiverem com status para cotação ou todos se nenhum
    const paraCotar = terceirosOS.filter(
      (t) => t.status === 'para_cotacao' || t.status === 'aguardando_envio'
    )
    if (paraCotar.length > 0) {
      setItensSelecionadosCotacao(paraCotar.map((t) => t.id))
    } else {
      setItensSelecionadosCotacao(terceirosOS.map((t) => t.id))
    }

    const novoCotId = `COT-TERC-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`
    setCotacaoAtivaId(novoCotId)
    setCotacaoEnviadaSucesso(false)
    setCopiadoLinkCotacao(false)
    setModalCotacaoAberto(true)
  }

  const handleToggleItemCotacao = (id) => {
    setItensSelecionadosCotacao((prev) =>
      prev.includes(id) ? prev.filter((iId) => iId !== id) : [...prev, id]
    )
  }

  const handleToggleParceiroCotacao = (id) => {
    setParceirosSelecionados((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    )
  }

  const itensCotacaoSelecionados = useMemo(() => {
    return terceirosOS.filter((t) => itensSelecionadosCotacao.includes(t.id))
  }, [terceirosOS, itensSelecionadosCotacao])

  const urlCotacaoPublica = useMemo(() => {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://dev-oficina.com'
    return `${origin}/cotacao/${cotacaoAtivaId || 'COT-TERC-DEMO'}`
  }, [cotacaoAtivaId])

  const handleSalvarEEnviarCotacao = (abrirJanela = false) => {
    if (itensCotacaoSelecionados.length === 0) {
      toast.error('Selecione pelo menos um serviço para incluir na solicitação de cotação.')
      return
    }

    if (parceirosSelecionados.length === 0) {
      toast.error('Selecione pelo menos um parceiro prestador para receber a cotação.')
      return
    }

    const parceirosAlvo = PARCEIROS_TERCEIROS.filter((p) =>
      parceirosSelecionados.includes(p.id)
    )

    const novaCotacaoRegistro = {
      id: cotacaoAtivaId,
      dataCriacao: new Date().toISOString(),
      status: 'aguardando_resposta',
      cliente,
      placa: placa || 'Sem placa',
      marcaModelo: marcaModelo || 'Veículo em Atendimento',
      ano,
      cor,
      km,
      mecanicoNome: mecanicoNome || 'Oficina Mecânica',
      itens: itensCotacaoSelecionados.map((item) => ({
        id: item.id,
        codigo: item.codigo,
        nome: item.nome,
        categoria: item.categoria,
        prazoEstimado: item.prazoEstimado,
        ordemExterna: item.ordemExterna,
        fotoUrl: item.fotoUrl,
        observacoes: item.observacoes,
      })),
      parceiros: parceirosAlvo,
    }

    try {
      const historicoRaw = localStorage.getItem('dev_oficina_cotacoes_terceiros')
      const historico = historicoRaw ? JSON.parse(historicoRaw) : {}
      historico[cotacaoAtivaId] = novaCotacaoRegistro
      localStorage.setItem('dev_oficina_cotacoes_terceiros', JSON.stringify(historico))
    } catch (e) {
      console.error('Erro ao salvar cotação de terceiros no localStorage:', e)
    }

    const listaCotacoes = [...cotacoesTerceirosEnviadas, novaCotacaoRegistro]
    updateFormData({ cotacoesTerceirosEnviadas: listaCotacoes })

    setCotacaoEnviadaSucesso(true)
    toast.success('Solicitação de orçamento gerada e vinculada à OS!')

    if (abrirJanela) {
      window.open(urlCotacaoPublica, '_blank')
    }
  }

  const handleCopiarLinkCotacao = () => {
    navigator.clipboard.writeText(urlCotacaoPublica)
    setCopiadoLinkCotacao(true)
    toast.success('Link da solicitação copiado para a área de transferência!')
    setTimeout(() => setCopiadoLinkCotacao(false), 2500)
  }

  const handleDispararWhatsAppParceiro = (parceiro) => {
    handleSalvarEEnviarCotacao(false)

    const veiculoTexto = placa
      ? `${placa} (${marcaModelo || 'Veículo'})`
      : marcaModelo || 'Veículo'

    const textoMsg = `Olá, equipe da *${parceiro.nome}*! 👋%0A%0AAqui é da *Mecânica Gabriel*. Solicitamos cotação e prazo para serviços especializados:%0A🚗 *Veículo:* ${veiculoTexto}%0A📅 *Ano:* ${
      ano || 'Não informado'
    } | *KM:* ${km || 'Não informado'}%0A%0A🛠️ *Serviços Solicitados:*%0A${itensCotacaoSelecionados
      .map(
        (item, i) =>
          `${i + 1}. *${item.nome}* (${item.categoria})${
            item.observacoes ? ` - Detalhes: ${item.observacoes}` : ''
          }`
      )
      .join('%0A')}%0A%0A📸 *Link para conferir fotos e especificações técnicas:*%0A🔗 ${urlCotacaoPublica}`

    const zapUrl = `https://wa.me/55${parceiro.whatsapp.replace(/\D/g, '')}?text=${textoMsg}`
    toast.info(`Abrindo WhatsApp para ${parceiro.nome}...`)
    window.open(zapUrl, '_blank')
  }

  const handleDispararWhatsAppItemIndividual = (item) => {
    const parceiro =
      PARCEIROS_TERCEIROS.find((p) => p.id === item.parceiroId) || PARCEIROS_TERCEIROS[0]
    const veiculoTexto = placa
      ? `${placa} (${marcaModelo || 'Veículo'})`
      : marcaModelo || 'Veículo'

    const textoMsg = `Olá, equipe da *${parceiro.nome}*! 👋%0A%0AAqui é da *Mecânica Gabriel*. Solicitamos atendimento para:%0A🚗 *Veículo:* ${veiculoTexto}%0A🛠️ *Serviço:* *${item.nome}*%0A📋 *Categoria:* ${item.categoria}%0A⏱️ *Prazo Desejado:* ${item.prazoEstimado}%0A📝 *Instruções:* ${
      item.observacoes || 'Conforme padrão técnico da oficina'
    }`

    const zapUrl = `https://wa.me/55${parceiro.whatsapp.replace(/\D/g, '')}?text=${textoMsg}`
    toast.info(`Abrindo WhatsApp para ${parceiro.nome}...`)
    window.open(zapUrl, '_blank')
  }

  // Copiar e gerar laudo técnico
  const handleCopiarLaudo = () => {
    if (!laudoTecnico) return
    navigator.clipboard.writeText(laudoTecnico)
    setCopiadoLaudo(true)
    toast.success('Texto do laudo técnico copiado para a área de transferência!')
    setTimeout(() => setCopiadoLaudo(false), 2000)
  }

  const handleGerarLaudo = () => {
    const novoLaudo = gerarLaudoTecnico(formData)
    updateFormData({ laudoTecnico: novoLaudo })
    toast.success('Laudo técnico atualizado com base nos dados atuais!')
  }

  return (
    <div className="h-full w-full flex flex-col justify-between gap-2.5 overflow-hidden">
      {/* Barra Superior: Acesso ao Contexto, Importação e Ações Principais */}
      <div className="h-12 shrink-0 bg-white px-3 sm:px-4 rounded-2xl border border-[#d0d5dd] shadow-sm flex items-center justify-between gap-2">
        {/* Lado Esquerdo: Identificação e Botões de Apoio */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Handshake size={16} weight="bold" />
          </div>

          <span className="text-xs font-bold text-[#101828] hidden xl:inline shrink-0">
            Serviços de Terceiros
          </span>

          {/* Botão de Dados do Veículo e Queixa */}
          <button
            type="button"
            onClick={() => setModalDadosAberto(true)}
            className="h-8 px-2.5 sm:px-3 rounded-xl bg-[#f8fafc] hover:bg-[#f2f4f7] active:bg-[#eaecf0] border border-[#d0d5dd] text-[#101828] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            title="Visualizar dados do cliente e queixa"
          >
            <Car size={15} weight="bold" className="text-[#344054]" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">
              {placa ? `${placa} • ${marcaModelo || 'Veículo'}` : 'Dados do Veículo'}
            </span>
          </button>

          {/* Botão de Ver Laudo Técnico do Diagnóstico */}
          <button
            type="button"
            onClick={() => setModalLaudoAberto(true)}
            className="h-8 px-2.5 sm:px-3 rounded-xl bg-[#f8fafc] hover:bg-[#f2f4f7] active:bg-[#eaecf0] border border-[#d0d5dd] text-[#101828] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            title="Visualizar ou editar o laudo técnico do diagnóstico"
          >
            <Sparkle
              size={15}
              weight="fill"
              className={laudoTecnico ? 'text-amber-500' : 'text-[#667085]'}
            />
            <span className="hidden sm:inline">Ver Laudo do Diagnóstico</span>
            {laudoTecnico && (
              <span className="w-2 h-2 rounded-full bg-[#0284c7]" title="Laudo gerado" />
            )}
          </button>
        </div>

        {/* Lado Direito: Ações de Importação, Adição e Cotação */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Botão: Puxar do Diagnóstico */}
          <button
            type="button"
            onClick={handlePuxarDoDiagnostico}
            className={`h-8.5 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
              itensDiagnosticoDisponiveis.length > 0
                ? 'bg-[#e0f2fe] text-[#0284c7] border-[#bae6fd] hover:bg-[#bae6fd]'
                : 'bg-[#f8fafc] text-[#344054] border-[#d0d5dd] hover:bg-[#f2f4f7]'
            }`}
            title="Importar serviços e apontamentos registrados na triagem de diagnóstico"
          >
            <ArrowDownRight size={15} weight="bold" />
            <span>Puxar do Diagnóstico</span>
            {itensDiagnosticoDisponiveis.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#0284c7] text-white">
                {itensDiagnosticoDisponiveis.length}
              </span>
            )}
          </button>

          {/* Botão: Adicionar Novo Serviço de Terceiro */}
          <button
            type="button"
            onClick={handleAbrirNovoTerceiro}
            className="h-8.5 px-3 rounded-xl bg-white hover:bg-[#f8fafc] border border-[#d0d5dd] text-[#101828] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
          >
            <Plus size={14} weight="bold" />
            <span>Adicionar Serviço de Terceiro</span>
          </button>

          {/* Botão Principal: Solicitar Orçamento / Cotação com Parceiros */}
          <button
            type="button"
            onClick={handleAbrirModalCotacao}
            className="h-8.5 px-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 shrink-0"
            title="Enviar solicitação e cotação de serviço para prestadores externos parceiros"
          >
            <PaperPlaneTilt size={15} weight="bold" className="text-[#38bdf8]" />
            <span>Solicitar Orçamento</span>
            {metricas.totalParaCotacao > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-black">
                {metricas.totalParaCotacao}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Faixa de Métricas Rápidas e Resumo Financeiro */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 shrink-0">
        <div className="p-2.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#f2f4f7] text-[#101828] flex items-center justify-center font-bold text-xs shrink-0">
            <Handshake size={16} weight="bold" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-[#667085] block leading-none">
              Serviços Terceiros
            </span>
            <span className="text-sm font-extrabold text-[#101828] mt-0.5 block truncate">
              {metricas.totalItens} {metricas.totalItens === 1 ? 'item' : 'itens'}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center font-bold text-xs shrink-0">
            <CheckCircle size={16} weight="bold" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-[#667085] block leading-none">
              Em Execução / Aprovado
            </span>
            <span className="text-sm font-extrabold text-[#0284c7] mt-0.5 block truncate">
              {metricas.totalEmExecucao} {metricas.totalEmExecucao === 1 ? 'serviço' : 'serviços'}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#fef0c7] text-[#b54708] flex items-center justify-center font-bold text-xs shrink-0">
            <Storefront size={16} weight="bold" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-[#667085] block leading-none">
              Para Cotação
            </span>
            <span className="text-sm font-extrabold text-[#b54708] mt-0.5 block truncate">
              {metricas.totalParaCotacao} {metricas.totalParaCotacao === 1 ? 'item' : 'itens'}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#f8fafc] text-[#344054] flex items-center justify-center font-bold text-xs shrink-0 border border-[#eaecf0]">
            <Tag size={16} weight="bold" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-[#667085] block leading-none">
              Custo Terceiros
            </span>
            <span className="text-sm font-extrabold text-[#344054] mt-0.5 block truncate">
              R$ {metricas.custoTotal}
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-2xl bg-[#101828] text-white shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 text-[#38bdf8] flex items-center justify-center font-bold text-xs shrink-0">
            <CurrencyDollar size={16} weight="bold" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-white/70 block leading-none">
              Total Venda na OS
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-sm font-extrabold text-[#38bdf8] truncate">
                R$ {metricas.totalLiquido}
              </span>
              <span className="text-[10px] font-bold text-white/60 truncate" title="Lucro Bruto da Oficina">
                (+R$ {metricas.lucroBruto})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Área Central: Tabela Completa e Responsiva de Terceiros */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-[#d0d5dd] shadow-sm flex flex-col overflow-hidden">
        {/* Barra de Ferramentas Superior da Tabela: Busca e Filtros */}
        <div className="px-4 py-2.5 border-b border-[#d0d5dd] bg-[#fcfcfd] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#101828] text-white flex items-center justify-center shrink-0">
              <Handshake size={14} weight="bold" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-[#101828] block leading-none">
                Lista de Serviços de Terceiros
              </span>
              <span className="text-[11px] text-[#667085] mt-0.5 block">
                {terceirosFiltrados.length} de {terceirosOS.length} registrados
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Campo de Busca Rápida */}
            <div className="relative w-48 sm:w-60">
              <MagnifyingGlass
                size={14}
                weight="bold"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#667085]"
              />
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Buscar serviço, código ou parceiro..."
                className="w-full h-8 pl-8 pr-2.5 rounded-xl border border-[#d0d5dd] text-xs text-[#101828] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] bg-white transition-all"
              />
              {termoBusca && (
                <button
                  type="button"
                  onClick={() => setTermoBusca('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#98a2b3] hover:text-[#101828]"
                >
                  <X size={12} weight="bold" />
                </button>
              )}
            </div>

            {/* Filtro por Categoria */}
            <div className="w-44 sm:w-52">
              <Select
                options={opcoesFiltroCategoria}
                value={
                  opcoesFiltroCategoria.find((c) => c.value === filtroCategoria) ||
                  opcoesFiltroCategoria[0]
                }
                onChange={(opcao) => setFiltroCategoria(opcao?.value || 'todas')}
                styles={customSelectSmallStyles}
                isSearchable={false}
                placeholder="Categoria..."
              />
            </div>

            {/* Filtro por Status */}
            <div className="flex items-center gap-1 bg-[#f2f4f7] p-0.5 rounded-xl border border-[#e4e7ec]">
              <button
                type="button"
                onClick={() => setFiltroStatus('todos')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filtroStatus === 'todos'
                    ? 'bg-[#101828] text-white shadow-xs'
                    : 'text-[#475467] hover:text-[#101828]'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus('em_execucao')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filtroStatus === 'em_execucao'
                    ? 'bg-[#101828] text-white shadow-xs'
                    : 'text-[#475467] hover:text-[#101828]'
                }`}
              >
                Em Execução
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus('para_cotacao')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filtroStatus === 'para_cotacao'
                    ? 'bg-[#101828] text-white shadow-xs'
                    : 'text-[#475467] hover:text-[#101828]'
                }`}
              >
                Cotação
              </button>
            </div>
          </div>
        </div>

        {/* Tabela com Scroll Interno Bounded */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
          {terceirosFiltrados.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#d0d5dd] flex items-center justify-center mb-3 text-[#101828]">
                <Handshake size={24} weight="bold" />
              </div>
              <h3 className="text-sm font-extrabold text-[#101828] mb-1">
                {terceirosOS.length === 0
                  ? 'Nenhum serviço terceirizado lançado nesta Ordem de Serviço'
                  : 'Nenhum serviço encontrado para os filtros selecionados'}
              </h3>
              <p className="text-xs text-[#667085] max-w-sm mb-4 leading-relaxed">
                {terceirosOS.length === 0
                  ? 'Você pode importar os serviços identificados no diagnóstico técnico ou adicionar novos serviços como retífica, usinagem, soldas e reparos de módulos.'
                  : 'Tente alterar os termos da busca ou redefinir os filtros de categoria e status.'}
              </p>

              {terceirosOS.length === 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {itensDiagnosticoDisponiveis.length > 0 && (
                    <button
                      type="button"
                      onClick={handlePuxarDoDiagnostico}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <ArrowDownRight size={14} weight="bold" />
                      <span>Puxar {itensDiagnosticoDisponiveis.length} do Diagnóstico</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAbrirNovoTerceiro}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <Plus size={14} weight="bold" />
                    <span>Adicionar Primeiro Serviço</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="sticky top-0 bg-[#f8fafc] border-b border-[#d0d5dd] z-10">
                <tr className="text-[11px] font-bold text-[#475467] uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-28">Código / Foto</th>
                  <th className="py-2.5 px-3">Serviço Terceirizado</th>
                  <th className="py-2.5 px-3">Prestador / Parceiro</th>
                  <th className="py-2.5 px-3 w-32">Prazo</th>
                  <th className="py-2.5 px-3 text-right w-24">Custo</th>
                  <th className="py-2.5 px-3 text-right w-24">Venda OS</th>
                  <th className="py-2.5 px-3 text-right w-24">Margem</th>
                  <th className="py-2.5 px-3 text-center w-28">Status</th>
                  <th className="py-2.5 px-3 text-center w-28">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaecf0] text-xs">
                {terceirosFiltrados.map((item) => {
                  const custo = parseFloat(item.custo) || 0
                  const venda = parseFloat(item.valorVenda) || 0
                  const desc = parseFloat(item.desconto) || 0
                  const liquido = Math.max(0, venda - desc)
                  const lucro = liquido - custo
                  const margem = liquido > 0 ? ((lucro / liquido) * 100).toFixed(0) : '0'

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#f8fafc] transition-colors group"
                    >
                      {/* Código e Thumbnail da Foto */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          {item.fotoUrl ? (
                            <button
                              type="button"
                              onClick={() => setFotoZoomUrl(item.fotoUrl)}
                              className="w-8 h-8 rounded-lg overflow-hidden border border-[#d0d5dd] hover:border-[#0284c7] transition-all cursor-pointer relative shrink-0 group/foto"
                              title="Clique para ampliar foto"
                            >
                              <img
                                src={item.fotoUrl}
                                alt={item.nome}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/foto:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye size={12} weight="bold" className="text-white" />
                              </div>
                            </button>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] shrink-0">
                              <Camera size={14} weight="regular" />
                            </div>
                          )}
                          <span className="font-mono text-[11px] font-bold text-[#101828]">
                            {item.codigo || 'TER'}
                          </span>
                        </div>
                      </td>

                      {/* Descrição e Categoria */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[#101828] line-clamp-1">
                          {item.nome}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded-md bg-[#f2f4f7] text-[#344054] text-[10px] font-medium border border-[#e4e7ec]">
                            {item.categoria}
                          </span>
                          {item.origem === 'diagnostico' && (
                            <span className="px-1.5 py-0.2 rounded-md bg-[#e0f2fe] text-[#0284c7] text-[10px] font-bold">
                              Diagnóstico
                            </span>
                          )}
                          {item.ordemExterna && (
                            <span className="text-[10px] font-medium text-[#667085]">
                              Ref: {item.ordemExterna}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Prestador / Parceiro */}
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-[#101828] truncate max-w-[160px]">
                          {item.parceiroNome || 'A definir'}
                        </div>
                        <div className="text-[10px] text-[#667085] flex items-center gap-1 mt-0.5">
                          <Buildings size={11} weight="bold" />
                          <span>Prestador Externo</span>
                        </div>
                      </td>

                      {/* Prazo */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 text-[#344054] font-medium text-[11px]">
                          <Clock size={12} weight="bold" className="text-[#667085] shrink-0" />
                          <span className="truncate">{item.prazoEstimado || 'A combinar'}</span>
                        </div>
                        {item.garantia && (
                          <div className="text-[10px] text-[#667085] mt-0.5">
                            Gar: {item.garantia}
                          </div>
                        )}
                      </td>

                      {/* Custo da Oficina */}
                      <td className="py-2.5 px-3 text-right font-medium text-[#475467]">
                        R$ {custo.toFixed(2)}
                      </td>

                      {/* Venda ao Cliente na OS */}
                      <td className="py-2.5 px-3 text-right font-bold text-[#101828]">
                        R$ {liquido.toFixed(2)}
                        {desc > 0 && (
                          <div className="text-[10px] text-[#b42318] font-normal">
                            -R$ {desc.toFixed(2)}
                          </div>
                        )}
                      </td>

                      {/* Lucro e Margem */}
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-bold text-[#0284c7]">
                          R$ {lucro.toFixed(2)}
                        </span>
                        <div className="text-[10px] text-[#667085] font-semibold">
                          {margem}%
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'concluido'
                              ? 'bg-[#f2f4f7] text-[#101828] border border-[#d0d5dd]'
                              : item.status === 'em_execucao' ||
                                item.status === 'pronto_para_retirada'
                              ? 'bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd]'
                              : item.status === 'para_cotacao'
                              ? 'bg-[#fef0c7] text-[#b54708] border border-[#fedf89]'
                              : 'bg-[#f2f4f7] text-[#475467] border border-[#e4e7ec]'
                          }`}
                        >
                          {STATUS_TERCEIRO_OPCOES.find((s) => s.value === item.status)?.label ||
                            'Aguardando'}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* WhatsApp rápido para o parceiro */}
                          <button
                            type="button"
                            onClick={() => handleDispararWhatsAppItemIndividual(item)}
                            className="w-7 h-7 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] flex items-center justify-center transition-all cursor-pointer"
                            title="Conversar com o parceiro no WhatsApp"
                          >
                            <WhatsappLogo size={14} weight="fill" />
                          </button>

                          {/* Editar */}
                          <button
                            type="button"
                            onClick={() => handleAbrirEditarTerceiro(item)}
                            className="w-7 h-7 rounded-lg hover:bg-[#f2f4f7] text-[#475467] hover:text-[#101828] flex items-center justify-center transition-all cursor-pointer"
                            title="Editar serviço de terceiro"
                          >
                            <PencilSimple size={14} weight="bold" />
                          </button>

                          {/* Excluir */}
                          <button
                            type="button"
                            onClick={() => handleExcluirTerceiro(item.id)}
                            className="w-7 h-7 rounded-lg hover:bg-[#fef3f2] text-[#667085] hover:text-[#b42318] flex items-center justify-center transition-all cursor-pointer"
                            title="Remover da OS"
                          >
                            <Trash size={14} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Barra Inferior de Ações da Etapa (Navegação Oficial) */}
      <div className="h-11 shrink-0 bg-white px-5 rounded-2xl border border-[#d0d5dd] shadow-sm flex items-center justify-between">
        <span className="text-xs font-medium text-[#667085]">
          Aba 6 de 7 • <strong className="text-[#101828] font-bold">Serviços de Terceiros</strong>
        </span>

        <button
          type="button"
          onClick={onSaveStep}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <FloppyDisk size={15} weight="bold" />
          <span>Salvar e Continuar</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Adicionar ou Editar Serviço de Terceiro (Arrastável e Redimensionável) */}
      {/* ========================================================================= */}
      {modalTerceiroAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 select-none">
          <form
            onSubmit={handleSalvarTerceiro}
            style={
              modalTerceiroMaximizada
                ? { width: '100vw', height: '100vh', top: 0, left: 0, borderRadius: 0 }
                : {
                    width: `${tamanhoModalTerceiro.largura}px`,
                    height: `${tamanhoModalTerceiro.altura}px`,
                    transform: `translate(${tamanhoModalTerceiro.posicaoX}px, ${tamanhoModalTerceiro.posicaoY}px)`,
                  }
            }
            className="bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl flex flex-col overflow-hidden relative"
          >
            {/* Cabeçalho Arrastável */}
            <div
              onMouseDown={handleIniciarArrastoHeaderTerceiro}
              className={`px-5 py-3 border-b border-[#d0d5dd] bg-[#f8fafc] flex items-center justify-between shrink-0 ${
                modalTerceiroMaximizada ? 'cursor-default' : 'cursor-move'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Handshake size={16} weight="bold" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#101828] leading-none">
                    {editandoTerceiroId
                      ? 'Editar Serviço de Terceiro'
                      : 'Adicionar Serviço de Terceiro à OS'}
                  </h3>
                  <span className="text-[11px] text-[#667085] mt-0.5 block">
                    {editandoTerceiroId
                      ? `Editando ${formTerceiro.codigo || 'Serviço'}`
                      : 'Cadastro e alocação de serviços mecânicos ou reparos terceirizados'}
                  </span>
                </div>
              </div>

              {/* Botões de Ação da Janela */}
              <div className="flex items-center gap-1 shrink-0">
                {(tamanhoModalTerceiro.largura !== LARGURA_PADRAO_MODAL ||
                  tamanhoModalTerceiro.altura !== ALTURA_PADRAO_MODAL ||
                  tamanhoModalTerceiro.posicaoX !== 0 ||
                  tamanhoModalTerceiro.posicaoY !== 0) && (
                  <button
                    type="button"
                    onClick={handleRestaurarTamanhoPadraoTerceiro}
                    className="p-1.5 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#eaecf0] transition-colors cursor-pointer"
                    title="Restaurar tamanho e posição padrão"
                  >
                    <ArrowsClockwise size={15} weight="bold" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setModalTerceiroMaximizada(!modalTerceiroMaximizada)}
                  className="p-1.5 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#eaecf0] transition-colors cursor-pointer"
                  title={modalTerceiroMaximizada ? 'Restaurar janela' : 'Maximizar janela'}
                >
                  {modalTerceiroMaximizada ? (
                    <ArrowsInSimple size={15} weight="bold" />
                  ) : (
                    <ArrowsOutSimple size={15} weight="bold" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalTerceiroAberto(false)
                    setEditandoTerceiroId(null)
                  }}
                  className="p-1.5 rounded-lg text-[#667085] hover:text-[#b42318] hover:bg-[#fef3f2] transition-colors cursor-pointer"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>
            </div>

            {/* Corpo do Formulário */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
              {/* Linha 1: Código e Nome do Serviço com CreatableSelect */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Código do Serviço
                  </label>
                  <input
                    type="text"
                    value={formTerceiro.codigo}
                    onChange={(e) =>
                      setFormTerceiro((prev) => ({ ...prev, codigo: e.target.value }))
                    }
                    placeholder="Ex: TER-001"
                    className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-mono font-bold text-[#101828] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] bg-[#f8fafc]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Descrição do Serviço Terceirizado <span className="text-[#0284c7]">*</span>
                  </label>
                  <CreatableSelect
                    options={opcoesCatalogoTerceiros}
                    value={
                      formTerceiro.nome
                        ? { value: formTerceiro.nome, label: formTerceiro.nome }
                        : null
                    }
                    onChange={handleSelecionarDoCatalogo}
                    styles={customSelectStyles}
                    placeholder="Digite ou selecione do catálogo de terceiros..."
                    isClearable
                  />
                </div>
              </div>

              {/* Linha 2: Categoria, Prestador Parceiro e Prazo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Categoria Especializada
                  </label>
                  <Select
                    options={CATEGORIAS_TERCEIROS_OPCOES}
                    value={
                      CATEGORIAS_TERCEIROS_OPCOES.find(
                        (c) => c.value === formTerceiro.categoria
                      ) || CATEGORIAS_TERCEIROS_OPCOES[0]
                    }
                    onChange={(opcao) =>
                      setFormTerceiro((prev) => ({
                        ...prev,
                        categoria: opcao?.value || 'Outros Especializados',
                      }))
                    }
                    styles={customSelectStyles}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Prestador / Parceiro Externo
                  </label>
                  <Select
                    options={opcoesParceiros}
                    value={
                      opcoesParceiros.find((p) => p.value === formTerceiro.parceiroId) ||
                      opcoesParceiros[0]
                    }
                    onChange={(opcao) =>
                      setFormTerceiro((prev) => ({
                        ...prev,
                        parceiroId: opcao?.value || 'parc-1',
                        parceiroNome: opcao?.nome || 'Prestador Externo',
                      }))
                    }
                    styles={customSelectStyles}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Prazo Estimado de Execução
                  </label>
                  <CreatableSelect
                    options={PRAZO_TERCEIRO_OPCOES}
                    value={
                      formTerceiro.prazoEstimado
                        ? {
                            value: formTerceiro.prazoEstimado,
                            label: formTerceiro.prazoEstimado,
                          }
                        : null
                    }
                    onChange={(opcao) =>
                      setFormTerceiro((prev) => ({
                        ...prev,
                        prazoEstimado: opcao?.value || '1 dia útil (24 horas)',
                      }))
                    }
                    styles={customSelectStyles}
                    placeholder="Selecione ou digite..."
                  />
                </div>
              </div>

              {/* Linha 3: Valores Financeiros (Custo, Venda, Desconto e Status) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8fafc] p-3 rounded-xl border border-[#e4e7ec]">
                <div>
                  <label className="block text-[11px] font-bold text-[#344054] mb-1">
                    Custo Oficina (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formTerceiro.custo}
                    onChange={(e) =>
                      setFormTerceiro((prev) => ({ ...prev, custo: e.target.value }))
                    }
                    className="w-full h-9 px-3 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-white focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#344054] mb-1">
                    Valor Venda na OS (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formTerceiro.valorVenda}
                    onChange={(e) =>
                      setFormTerceiro((prev) => ({
                        ...prev,
                        valorVenda: e.target.value,
                      }))
                    }
                    className="w-full h-9 px-3 rounded-xl border border-[#d0d5dd] text-xs font-extrabold text-[#101828] bg-white focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#344054] mb-1">
                    Desconto (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formTerceiro.desconto}
                    onChange={(e) =>
                      setFormTerceiro((prev) => ({
                        ...prev,
                        desconto: e.target.value,
                      }))
                    }
                    className="w-full h-9 px-3 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#b42318] bg-white focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#344054] mb-1">
                    Status do Reparo
                  </label>
                  <Select
                    options={STATUS_TERCEIRO_OPCOES}
                    value={
                      STATUS_TERCEIRO_OPCOES.find(
                        (s) => s.value === formTerceiro.status
                      ) || STATUS_TERCEIRO_OPCOES[0]
                    }
                    onChange={(opcao) =>
                      setFormTerceiro((prev) => ({
                        ...prev,
                        status: opcao?.value || 'aguardando_envio',
                      }))
                    }
                    styles={customSelectSmallStyles}
                  />
                </div>
              </div>

              {/* Linha 4: OS Externa / Nota Fiscal e Garantia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    OS Externa / Nota Fiscal do Parceiro
                  </label>
                  <input
                    type="text"
                    value={formTerceiro.ordemExterna}
                    onChange={(e) =>
                      setFormTerceiro((prev) => ({
                        ...prev,
                        ordemExterna: e.target.value,
                      }))
                    }
                    placeholder="Ex: OS Retífica #4582 / NF-e 1209"
                    className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs text-[#101828] bg-white focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Garantia Oferecida pelo Parceiro
                  </label>
                  <input
                    type="text"
                    value={formTerceiro.garantia}
                    onChange={(e) =>
                      setFormTerceiro((prev) => ({ ...prev, garantia: e.target.value }))
                    }
                    placeholder="Ex: 6 meses ou 10.000 km"
                    className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs text-[#101828] bg-white focus:outline-none focus:border-[#0284c7]"
                  />
                </div>
              </div>

              {/* Linha 5: Foto da Peça / Componente e Observações Técnicas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Upload de Foto */}
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Registro Fotográfico
                  </label>
                  <input
                    type="file"
                    ref={fileInputTerceiroRef}
                    onChange={handleFotoUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {formTerceiro.fotoUrl ? (
                    <div className="relative rounded-xl border border-[#d0d5dd] overflow-hidden group/img h-28 bg-black">
                      <img
                        src={formTerceiro.fotoUrl}
                        alt="Foto da peça"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setFotoZoomUrl(formTerceiro.fotoUrl)}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                          title="Ampliar"
                        >
                          <Eye size={16} weight="bold" />
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoverFoto}
                          className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white cursor-pointer"
                          title="Remover foto"
                        >
                          <Trash size={16} weight="bold" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputTerceiroRef.current?.click()}
                      className="w-full h-28 border-2 border-dashed border-[#d0d5dd] hover:border-[#0284c7] rounded-xl flex flex-col items-center justify-center text-[#667085] hover:text-[#0284c7] transition-all cursor-pointer bg-[#f8fafc]"
                    >
                      <Camera size={22} weight="bold" className="mb-1" />
                      <span className="text-[11px] font-bold">Anexar Foto da Peça</span>
                      <span className="text-[10px] text-[#98a2b3]">Para envio ao terceiro</span>
                    </button>
                  )}
                </div>

                {/* Observações Técnicas */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Instruções Técnicas e Observações para o Parceiro
                  </label>
                  <textarea
                    rows={4}
                    value={formTerceiro.observacoes}
                    onChange={(e) =>
                      setFormTerceiro((prev) => ({
                        ...prev,
                        observacoes: e.target.value,
                      }))
                    }
                    placeholder="Instruções específicas para o prestador externo (ex: medidas de retífica, testes necessários, pontos de atenção)..."
                    className="w-full h-28 p-2.5 rounded-xl border border-[#d0d5dd] text-xs text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Rodapé do Modal com Resumo de Lucro e Ações */}
            <div className="px-5 py-3 border-t border-[#d0d5dd] bg-[#f8fafc] flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#667085]">
                  Lucro Estimado na Terceirização:{' '}
                  <strong className="text-[#0284c7] font-bold">
                    R${' '}
                    {(
                      Math.max(
                        0,
                        (parseFloat(formTerceiro.valorVenda) || 0) -
                          (parseFloat(formTerceiro.desconto) || 0)
                      ) - (parseFloat(formTerceiro.custo) || 0)
                    ).toFixed(2)}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalTerceiroAberto(false)
                    setEditandoTerceiroId(null)
                  }}
                  className="px-4 py-2 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f2f4f7] text-[#475467] text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <CheckCircle size={15} weight="bold" />
                  <span>{editandoTerceiroId ? 'Salvar Alterações' : 'Salvar Serviço'}</span>
                </button>
              </div>
            </div>

            {/* Alças de Redimensionamento Livre (Bordas e Cantos) */}
            {!modalTerceiroMaximizada && (
              <>
                <div
                  onMouseDown={(e) => handleIniciarRedimensionamentoTerceiro(e, 'r')}
                  className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-[#0284c7]/20 transition-colors"
                />
                <div
                  onMouseDown={(e) => handleIniciarRedimensionamentoTerceiro(e, 'b')}
                  className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-[#0284c7]/20 transition-colors"
                />
                <div
                  onMouseDown={(e) => handleIniciarRedimensionamentoTerceiro(e, 'br')}
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-center justify-center text-[#98a2b3] hover:text-[#0284c7]"
                >
                  <ArrowsOutCardinal size={12} weight="bold" />
                </div>
              </>
            )}
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Solicitar Orçamento / Cotação com Parceiros Terceirizados */}
      {/* ========================================================================= */}
      {modalCotacaoAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 select-none">
          <div
            style={
              modalCotacaoMaximizada
                ? { width: '100vw', height: '100vh', top: 0, left: 0, borderRadius: 0 }
                : {
                    width: `${tamanhoModalCotacao.largura}px`,
                    height: `${tamanhoModalCotacao.altura}px`,
                    transform: `translate(${tamanhoModalCotacao.posicaoX}px, ${tamanhoModalCotacao.posicaoY}px)`,
                  }
            }
            className="bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl flex flex-col overflow-hidden relative"
          >
            {/* Header Arrastável */}
            <div
              className={`px-5 py-3 border-b border-[#d0d5dd] bg-[#f8fafc] flex items-center justify-between shrink-0 ${
                modalCotacaoMaximizada ? 'cursor-default' : 'cursor-move'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <PaperPlaneTilt size={16} weight="bold" className="text-[#38bdf8]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#101828] leading-none">
                    Solicitar Orçamento a Parceiros Terceirizados
                  </h3>
                  <span className="text-[11px] text-[#667085] mt-0.5 block">
                    Envie solicitações com fotos e especificações para retíficas, tornearias e especialistas
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalCotacaoMaximizada(!modalCotacaoMaximizada)}
                  className="p-1.5 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#eaecf0] transition-colors cursor-pointer"
                >
                  {modalCotacaoMaximizada ? (
                    <ArrowsInSimple size={15} weight="bold" />
                  ) : (
                    <ArrowsOutSimple size={15} weight="bold" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModalCotacaoAberto(false)}
                  className="p-1.5 rounded-lg text-[#667085] hover:text-[#b42318] hover:bg-[#fef3f2] transition-colors cursor-pointer"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>
            </div>

            {/* Conteúdo da Cotação */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
              {/* Seleção dos Serviços a Cotar */}
              <div>
                <label className="block text-xs font-bold text-[#344054] mb-2">
                  1. Selecione os Serviços Terceirizados para a Solicitação:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {terceirosOS.map((item) => {
                    const estaSel = itensSelecionadosCotacao.includes(item.id)
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItemCotacao(item.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          estaSel
                            ? 'border-[#0284c7] bg-[#e0f2fe]/40 text-[#101828]'
                            : 'border-[#d0d5dd] bg-white text-[#475467] hover:bg-[#f8fafc]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={estaSel}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#0284c7] cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{item.nome}</div>
                            <div className="text-[10px] text-[#667085] truncate">
                              {item.categoria} • Prazo: {item.prazoEstimado}
                            </div>
                          </div>
                        </div>

                        {item.fotoUrl && (
                          <span className="w-5 h-5 rounded-md bg-[#0284c7]/10 text-[#0284c7] flex items-center justify-center shrink-0">
                            <Camera size={12} weight="bold" />
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Seleção dos Parceiros */}
              <div>
                <label className="block text-xs font-bold text-[#344054] mb-2">
                  2. Selecione os Parceiros Prestadores para Envio:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PARCEIROS_TERCEIROS.map((parceiro) => {
                    const estaSel = parceirosSelecionados.includes(parceiro.id)
                    return (
                      <div
                        key={parceiro.id}
                        onClick={() => handleToggleParceiroCotacao(parceiro.id)}
                        className={`p-3 rounded-xl border flex items-start justify-between gap-2.5 cursor-pointer transition-all ${
                          estaSel
                            ? 'border-[#0284c7] bg-[#e0f2fe]/30'
                            : 'border-[#d0d5dd] bg-white hover:bg-[#f8fafc]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={estaSel}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#0284c7] mt-0.5 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-[#101828] truncate">
                              {parceiro.nome}
                            </div>
                            <div className="text-[11px] text-[#475467] line-clamp-1">
                              {parceiro.especialidade}
                            </div>
                            <div className="text-[10px] text-[#667085] mt-0.5">
                              Tempo: {parceiro.tempoMedioEntrega}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDispararWhatsAppParceiro(parceiro)
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                          title="Enviar orçamento diretamente no WhatsApp"
                        >
                          <WhatsappLogo size={14} weight="fill" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Link Público da Cotação */}
              <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="min-w-0 w-full sm:w-auto">
                  <span className="text-[11px] font-bold text-[#344054] block">
                    Link Oficial da Solicitação de Orçamento:
                  </span>
                  <span className="text-xs font-mono text-[#0284c7] block truncate mt-0.5">
                    {urlCotacaoPublica}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopiarLinkCotacao}
                    className="px-3 py-1.5 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f2f4f7] text-[#101828] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    {copiadoLinkCotacao ? (
                      <>
                        <Check size={14} weight="bold" className="text-[#0284c7]" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} weight="bold" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSalvarEEnviarCotacao(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <PaperPlaneTilt size={14} weight="bold" className="text-[#38bdf8]" />
                    <span>Visualizar Página</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Rodapé do Modal de Cotação */}
            <div className="px-5 py-3 border-t border-[#d0d5dd] bg-[#f8fafc] flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setModalCotacaoAberto(false)}
                className="px-4 py-2 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f2f4f7] text-[#475467] text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Zoom de Foto da Peça / Serviço Terceirizado */}
      {/* ========================================================================= */}
      {fotoZoomUrl && (
        <div
          onClick={() => setFotoZoomUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[85vh] bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex flex-col"
          >
            <div className="absolute top-3 right-3 z-10">
              <button
                type="button"
                onClick={() => setFotoZoomUrl(null)}
                className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
              >
                <X size={16} weight="bold" />
              </button>
            </div>
            <img
              src={fotoZoomUrl}
              alt="Ampliação da foto"
              className="w-full h-full object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Dados do Veículo, Cliente e Queixa */}
      {/* ========================================================================= */}
      {modalDadosAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#d0d5dd] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 border-b border-[#d0d5dd] bg-[#f8fafc] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Car size={18} weight="bold" className="text-[#0284c7]" />
                <h3 className="text-sm font-extrabold text-[#101828]">
                  Dados do Veículo e Atendimento
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalDadosAberto(false)}
                className="p-1 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#eaecf0] transition-colors cursor-pointer"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e4e7ec] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#667085] font-medium">Cliente:</span>
                  <strong className="text-[#101828]">{cliente || 'Não identificado'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085] font-medium">Telefone / WhatsApp:</span>
                  <span className="text-[#101828] font-semibold">{telefone || 'Não informado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085] font-medium">Documento:</span>
                  <span className="text-[#101828] font-mono">{documento || 'Não informado'}</span>
                </div>
              </div>

              <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e4e7ec] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#667085] font-medium">Veículo:</span>
                  <strong className="text-[#101828]">{marcaModelo || 'Não informado'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085] font-medium">Placa:</span>
                  <strong className="text-[#0284c7] font-mono">{placa || 'Sem placa'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085] font-medium">Ano / Cor:</span>
                  <span className="text-[#101828]">{ano || 'Ano N/D'} • {cor || 'Cor N/D'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085] font-medium">Quilometragem:</span>
                  <span className="text-[#101828] font-semibold">{km ? `${km} km` : 'Não informada'}</span>
                </div>
              </div>

              {relatoCliente && (
                <div>
                  <span className="text-[11px] font-bold text-[#667085] uppercase block mb-1">
                    Queixa Inicial do Cliente:
                  </span>
                  <div className="p-3 bg-white border border-[#d0d5dd] rounded-xl text-[#344054] italic leading-relaxed">
                    "{relatoCliente}"
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-[#d0d5dd] bg-[#f8fafc] flex justify-end">
              <button
                type="button"
                onClick={() => setModalDadosAberto(false)}
                className="px-4 py-1.5 rounded-xl bg-[#101828] text-white text-xs font-bold hover:bg-black transition-all cursor-pointer shadow-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: Laudo Técnico do Diagnóstico (Arrastável e Redimensionável) */}
      {/* ========================================================================= */}
      {modalLaudoAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 select-none">
          <div
            style={
              modalLaudoMaximizada
                ? { width: '100vw', height: '100vh', top: 0, left: 0, borderRadius: 0 }
                : {
                    width: `${tamanhoModalLaudo.largura}px`,
                    height: `${tamanhoModalLaudo.altura}px`,
                    transform: `translate(${tamanhoModalLaudo.posicaoX}px, ${tamanhoModalLaudo.posicaoY}px)`,
                  }
            }
            className="bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl flex flex-col overflow-hidden relative"
          >
            <div className="px-5 py-3 border-b border-[#d0d5dd] bg-[#f8fafc] flex items-center justify-between shrink-0 cursor-move">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkle size={18} weight="fill" className="text-amber-500" />
                <h3 className="text-sm font-extrabold text-[#101828]">
                  Laudo Técnico do Diagnóstico
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setModalLaudoMaximizada(!modalLaudoMaximizada)}
                  className="p-1.5 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#eaecf0] transition-colors cursor-pointer"
                >
                  {modalLaudoMaximizada ? (
                    <ArrowsInSimple size={15} weight="bold" />
                  ) : (
                    <ArrowsOutSimple size={15} weight="bold" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModalLaudoAberto(false)}
                  className="p-1.5 rounded-lg text-[#667085] hover:text-[#b42318] hover:bg-[#fef3f2] transition-colors cursor-pointer"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 p-5 overflow-y-auto">
              <textarea
                rows={16}
                value={laudoTecnico}
                onChange={(e) => updateFormData({ laudoTecnico: e.target.value })}
                placeholder="Nenhum laudo gerado ainda..."
                className="w-full h-full p-4 rounded-xl border border-[#d0d5dd] font-mono text-xs text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] resize-none leading-relaxed"
              />
            </div>

            <div className="px-5 py-3 border-t border-[#d0d5dd] bg-[#f8fafc] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={handleGerarLaudo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f2f4f7] text-[#101828] text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <ArrowsClockwise size={14} weight="bold" />
                <span>Atualizar Laudo com Dados Atuais</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopiarLaudo}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  {copiadoLaudo ? (
                    <>
                      <Check size={14} weight="bold" className="text-[#38bdf8]" />
                      <span>Copiado com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} weight="bold" />
                      <span>Copiar Laudo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
