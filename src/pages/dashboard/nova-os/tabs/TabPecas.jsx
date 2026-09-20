import React, { useState, useMemo, useRef } from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import {
  Package,
  Wrench,
  Car,
  Plus,
  Trash,
  PencilSimple,
  X,
  FloppyDisk,
  CheckCircle,
  FileText,
  ArrowsClockwise,
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
  ShareNetwork,
  Storefront,
  WarningCircle,
  Clock,
  ArrowSquareOut,
  ShieldCheck,
  Buildings,
  PhoneCall,
  CheckSquare,
  Square,
  ChatText,
  ArrowsOutCardinal,
} from '@phosphor-icons/react'
import {
  AUTO_PECAS_FORNECEDORES,
  CATEGORIAS_PECAS_OPCOES,
  CATALOGO_PECAS_ESTOQUE,
} from '../../../../constants/catalogoPecasEstoque'
import { gerarLaudoTecnico } from '../../../../constants/catalogoPecasServicos'
import { toast } from 'sonner'

// Constantes de persistência e dimensões padrão dos modais (Regra 9 de SYSTEM_RULES.md)
const CHAVE_STORAGE_MODAL_PECA = 'dev_oficina_modal_peca_dims'
const CHAVE_STORAGE_MODAL_COTACAO = 'dev_oficina_modal_cotacao_dims'
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
    if (!salvo) {
      return { largura: padraoLargura, altura: padraoAltura, posicaoX: 0, posicaoY: 0 }
    }
    const parsed = JSON.parse(salvo)
    const maxW = Math.max(360, window.innerWidth - 24)
    const maxH = Math.max(340, window.innerHeight - 24)
    const largura = Math.min(maxW, Math.max(360, Number(parsed.largura) || padraoLargura))
    const altura = Math.min(maxH, Math.max(340, Number(parsed.altura) || padraoAltura))

    const maxPosX = Math.max(0, (window.innerWidth - 120) / 2)
    const maxPosY = Math.max(0, (window.innerHeight - 80) / 2)
    const posicaoX = Math.min(maxPosX, Math.max(-maxPosX, Number(parsed.posicaoX) || 0))
    const posicaoY = Math.min(maxPosY, Math.max(-maxPosY, Number(parsed.posicaoY) || 0))

    return { largura, altura, posicaoX, posicaoY }
  } catch {
    return { largura: padraoLargura, altura: padraoAltura, posicaoX: 0, posicaoY: 0 }
  }
}

const salvarDimensoesNoStorage = (chave, dimensoes) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(chave, JSON.stringify(dimensoes))
  } catch (e) {
    console.warn('Falha ao salvar dimensões no localStorage:', e)
  }
}

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '40px',
    height: '40px',
    backgroundColor: state.isDisabled ? '#f2f4f7' : state.isFocused ? '#ffffff' : '#f8fafc',
    borderColor: state.isFocused ? '#101828' : '#d0d5dd',
    borderWidth: '1px',
    borderRadius: '12px',
    boxShadow: state.isFocused ? '0 0 0 1px #101828' : 'none',
    fontSize: '12.5px',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    ':hover': {
      borderColor: state.isFocused ? '#101828' : '#98a2b3',
      backgroundColor: state.isDisabled ? '#f2f4f7' : '#ffffff',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    height: '40px',
    padding: '0 12px',
  }),
  input: (base) => ({
    ...base,
    margin: '0px',
    color: '#101828',
    fontSize: '12.5px',
    fontWeight: '600',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '40px',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '4px 8px',
    color: '#667085',
    ':hover': { color: '#101828' },
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '4px 6px',
    color: '#667085',
    ':hover': { color: '#101828' },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '14px',
    border: '1px solid #d0d5dd',
    boxShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.1), 0 6px 10px -3px rgba(0, 0, 0, 0.04)',
    zIndex: 50,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    padding: '4px',
  }),
  menuList: (base) => ({
    ...base,
    padding: '2px',
    maxHeight: '220px',
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: state.isSelected ? 700 : 500,
    backgroundColor: state.isSelected
      ? '#101828'
      : state.isFocused
      ? '#f2f4f7'
      : 'transparent',
    color: state.isSelected ? '#ffffff' : '#101828',
    cursor: 'pointer',
    padding: '7px 12px',
    transition: 'all 0.1s ease',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#101828',
    fontWeight: 700,
    fontSize: '12.5px',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#98a2b3',
    fontSize: '12.5px',
    fontWeight: 500,
  }),
}

export function TabPecas({ formData, updateFormData, onSaveStep, onCancel }) {
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
    pecasOS = [],
    cotacoesEnviadas = [],
  } = formData

  // Modais de apoio
  const [modalDadosAberto, setModalDadosAberto] = useState(false)
  const [modalLaudoAberto, setModalLaudoAberto] = useState(false)
  const [modalLaudoMaximizada, setModalLaudoMaximizada] = useState(false)
  const [modalPecaAberto, setModalPecaAberto] = useState(false)
  const [modalPecaMaximizada, setModalPecaMaximizada] = useState(false)
  const [modalCotacaoAberto, setModalCotacaoAberto] = useState(false)
  const [modalCotacaoMaximizada, setModalCotacaoMaximizada] = useState(false)
  const [fotoZoomUrl, setFotoZoomUrl] = useState(null)
  const [copiadoLaudo, setCopiadoLaudo] = useState(false)
  const [copiadoLinkCotacao, setCopiadoLinkCotacao] = useState(false)
  const [editandoPecaId, setEditandoPecaId] = useState(null)

  // Dimensões, posição e redimensionamento livre do modal de peça
  const [tamanhoModalPeca, setTamanhoModalPeca] = useState(() =>
    carregarDimensoesSalvas(CHAVE_STORAGE_MODAL_PECA, LARGURA_PADRAO_MODAL, ALTURA_PADRAO_MODAL)
  )
  const [estaRedimensionandoPeca, setEstaRedimensionandoPeca] = useState(false)
  const [estaArrastandoPeca, setEstaArrastandoPeca] = useState(false)
  const dragModalPecaRef = useRef({
    ativo: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
  })
  const resizeModalPecaRef = useRef({
    ativo: false,
    direcao: null,
    startX: 0,
    startY: 0,
    startLargura: LARGURA_PADRAO_MODAL,
    startAltura: ALTURA_PADRAO_MODAL,
    startPosX: 0,
    startPosY: 0,
  })

  // Dimensões, posição e redimensionamento livre do modal de cotação
  const [tamanhoModalCotacao, setTamanhoModalCotacao] = useState(() =>
    carregarDimensoesSalvas(CHAVE_STORAGE_MODAL_COTACAO, LARGURA_PADRAO_MODAL, ALTURA_PADRAO_MODAL)
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

  // Filtros e busca na tabela de pecas
  const [termoBusca, setTermoBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroEstoque, setFiltroEstoque] = useState('todos')

  // Referencia para upload de foto no modal
  const fileInputPecaRef = useRef(null)

  // Estado do formulario de peca
  const FORM_PECA_DEFAULT = {
    codigo: '',
    nome: '',
    categoria: 'Outros Componentes',
    statusEstoque: 'para_cotacao', // Padrao: se nao constar no estoque interno com saldo, vem como cotar
    estoqueAtual: 0,
    estoqueMinimo: 1,
    fornecedorId: '',
    fornecedorNome: 'Cotação Externa',
    marcaSugerida: '',
    precoUnitario: '0.00',
    quantidade: '1',
    desconto: '0.00',
    fotoUrl: null,
    fotoNome: '',
    observacoes: '',
  }

  const [formPeca, setFormPeca] = useState(FORM_PECA_DEFAULT)

  // Estado da cotacao a ser gerada / enviada
  const [pecasSelecionadasCotacao, setPecasSelecionadasCotacao] = useState([])
  const [fornecedoresSelecionados, setFornecedoresSelecionados] = useState(
    AUTO_PECAS_FORNECEDORES.map((f) => f.id)
  )
  const [cotacaoAtivaId, setCotacaoAtivaId] = useState(null)
  const [cotacaoEnviadaSucesso, setCotacaoEnviadaSucesso] = useState(false)

  // Opcoes do catalogo de pecas para CreatableSelect
  const opcoesCatalogoPecas = useMemo(() => {
    return CATALOGO_PECAS_ESTOQUE.map((item) => ({
      value: item.nome,
      label: `${item.nome} (${item.categoria}) • ${
        item.estoqueAtual > 0
          ? `Disponível no Estoque (${item.estoqueAtual} un)`
          : 'Sem Estoque (Marcar para Cotação)'
      }`,
      dados: item,
    }))
  }, [])

  // Contagem de pecas diagnosticadas pendentes de importacao
  const pecasDiagnosticoDisponiveis = useMemo(() => {
    return pecasDiagnostico.filter((pd) => {
      const nomePd = pd.nome?.trim().toLowerCase()
      return !pecasOS.some((po) => po.nome?.trim().toLowerCase() === nomePd)
    })
  }, [pecasDiagnostico, pecasOS])

  // Metricas financeiras e de estoque das pecas
  const metricas = useMemo(() => {
    let totalPecasOS = pecasOS.length
    let totalEmEstoque = 0
    let totalParaCotacao = 0
    let subtotalBruto = 0
    let totalDescontos = 0

    pecasOS.forEach((item) => {
      const valorUnit = parseFloat(item.precoUnitario) || 0
      const qtd = parseFloat(item.quantidade) || 1
      const desc = parseFloat(item.desconto) || 0

      if (item.statusEstoque === 'em_estoque') {
        totalEmEstoque += 1
      } else {
        totalParaCotacao += 1
      }

      subtotalBruto += valorUnit * qtd
      totalDescontos += desc
    })

    const totalLiquido = Math.max(0, subtotalBruto - totalDescontos)

    return {
      totalPecasOS,
      totalEmEstoque,
      totalParaCotacao,
      subtotalBruto: subtotalBruto.toFixed(2),
      totalDescontos: totalDescontos.toFixed(2),
      totalLiquido: totalLiquido.toFixed(2),
    }
  }, [pecasOS])

  // Pecas filtradas pela busca, categoria e status de estoque
  const pecasFiltradas = useMemo(() => {
    const termo = termoBusca.trim().toLowerCase()
    return pecasOS.filter((item) => {
      const matchBusca =
        !termo ||
        (item.nome && item.nome.toLowerCase().includes(termo)) ||
        (item.codigo && item.codigo.toLowerCase().includes(termo)) ||
        (item.fornecedorNome && item.fornecedorNome.toLowerCase().includes(termo)) ||
        (item.marcaSugerida && item.marcaSugerida.toLowerCase().includes(termo)) ||
        (item.observacoes && item.observacoes.toLowerCase().includes(termo))

      const matchCategoria =
        filtroCategoria === 'todas' || item.categoria === filtroCategoria

      const matchEstoque =
        filtroEstoque === 'todos' || item.statusEstoque === filtroEstoque

      return matchBusca && matchCategoria && matchEstoque
    })
  }, [pecasOS, termoBusca, filtroCategoria, filtroEstoque])

  // Handler para importar pecas da tela de diagnostico
  const handlePuxarDoDiagnostico = () => {
    if (!pecasDiagnostico.length) {
      toast.warning('Não há peças registradas na aba de diagnóstico para importar.')
      return
    }

    const novosItens = pecasDiagnostico.map((itemDiag, idx) => {
      const indexTotal = pecasOS.length + idx + 1
      const nomeLower = itemDiag.nome ? itemDiag.nome.trim().toLowerCase() : ''

      // Consulta no catalogo de estoque para verificar disponibilidade real
      const itemCatalogo = CATALOGO_PECAS_ESTOQUE.find(
        (c) =>
          c.nome.toLowerCase() === nomeLower ||
          c.nome.toLowerCase().includes(nomeLower) ||
          nomeLower.includes(c.nome.toLowerCase())
      )

      const temEstoque = itemCatalogo && itemCatalogo.estoqueAtual > 0
      const statusEstoque = temEstoque ? 'em_estoque' : 'para_cotacao'
      const codigoGerado = itemCatalogo?.codigo || `PEC-${String(indexTotal).padStart(3, '0')}`
      const categoria = itemCatalogo?.categoria || 'Outros Componentes'
      const estoqueAtual = itemCatalogo ? itemCatalogo.estoqueAtual : 0
      const estoqueMinimo = itemCatalogo ? itemCatalogo.estoqueMinimo : 1
      const precoUnitario = temEstoque && itemCatalogo
        ? itemCatalogo.precoUnitario.toFixed(2)
        : '0.00'
      const fornecedorId = temEstoque ? 'estoque-interno' : ''
      const fornecedorNome = temEstoque ? 'Estoque Interno' : 'Cotação Externa'
      const marcaSugerida = itemCatalogo?.marcaSugerida || ''

      return {
        id: `peca-imp-${Date.now()}-${idx}`,
        codigo: codigoGerado,
        nome: itemDiag.nome,
        categoria,
        statusEstoque,
        estoqueAtual,
        estoqueMinimo,
        fornecedorId,
        fornecedorNome,
        marcaSugerida,
        precoUnitario,
        quantidade: itemDiag.quantidade || '1',
        desconto: '0.00',
        fotoUrl: itemDiag.fotoUrl || null,
        fotoNome: itemDiag.fotoNome || '',
        observacoes: itemDiag.observacao || 'Item apontado na triagem de diagnóstico técnico',
        origem: 'diagnostico',
      }
    })

    // Adiciona apenas os que ainda nao foram importados
    const novosFiltrados = novosItens.filter(
      (n) => !pecasOS.some((existente) => existente.nome.toLowerCase() === n.nome.toLowerCase())
    )

    if (novosFiltrados.length === 0) {
      toast.info('Todas as peças da tela de diagnóstico já foram importadas para a tabela.')
      return
    }

    const qtdEstoque = novosFiltrados.filter((p) => p.statusEstoque === 'em_estoque').length
    const qtdCotacao = novosFiltrados.filter((p) => p.statusEstoque === 'para_cotacao').length

    const listaAtualizada = [...pecasOS, ...novosFiltrados]
    updateFormData({ pecasOS: listaAtualizada })

    if (qtdCotacao > 0 && qtdEstoque > 0) {
      toast.success(
        `${novosFiltrados.length} peça(s) importada(s): ${qtdEstoque} em estoque e ${qtdCotacao} sem estoque (marcada(s) para cotação).`
      )
    } else if (qtdCotacao > 0) {
      toast.warning(
        `${novosFiltrados.length} peça(s) importada(s). Nenhuma possui saldo no estoque interno, todas marcadas para cotação externa.`
      )
    } else {
      toast.success(`${novosFiltrados.length} peça(s) importada(s), todas disponíveis no estoque interno!`)
    }
  }

  // Abrir modal para adicionar nova peca
  const handleAbrirNovaPeca = () => {
    const proximoNumero = pecasOS.length + 1
    const codigoPadrao = `PEC-${String(proximoNumero).padStart(3, '0')}`

    setEditandoPecaId(null)
    setFormPeca({
      ...FORM_PECA_DEFAULT,
      codigo: codigoPadrao,
      statusEstoque: 'para_cotacao',
      fornecedorId: '',
      fornecedorNome: 'Cotação Externa',
    })
    setModalPecaMaximizada(false)
    setModalPecaAberto(true)
  }

  // Handler inteligente para selecao ou digitacao de peca no modal
  const handleSelecionarOuCriarPeca = (opt) => {
    if (!opt) {
      setFormPeca((prev) => ({
        ...prev,
        nome: '',
        statusEstoque: 'para_cotacao',
        estoqueAtual: 0,
        fornecedorId: '',
        fornecedorNome: 'Cotação Externa',
        precoUnitario: '0.00',
        desconto: '0.00',
      }))
      return
    }

    // Caso 1: Usuario selecionou uma peca do catalogo com dados anexados
    if (opt.dados) {
      const itemEstoque = opt.dados
      const temSaldo = (itemEstoque.estoqueAtual || 0) > 0

      setFormPeca((prev) => ({
        ...prev,
        nome: itemEstoque.nome,
        codigo: itemEstoque.codigo || prev.codigo,
        categoria: itemEstoque.categoria || prev.categoria,
        statusEstoque: temSaldo ? 'em_estoque' : 'para_cotacao',
        estoqueAtual: itemEstoque.estoqueAtual || 0,
        estoqueMinimo: itemEstoque.estoqueMinimo || 1,
        fornecedorId: temSaldo ? 'estoque-interno' : '',
        fornecedorNome: temSaldo ? 'Estoque Interno' : 'Cotação Externa',
        precoUnitario: temSaldo && itemEstoque.precoUnitario ? itemEstoque.precoUnitario.toFixed(2) : '0.00',
        desconto: temSaldo ? prev.desconto : '0.00',
        marcaSugerida: itemEstoque.marcaSugerida || prev.marcaSugerida,
      }))

      if (temSaldo) {
        toast.info(`Peça disponível no estoque interno (${itemEstoque.estoqueAtual} un).`)
      } else {
        toast.warning('Peça sem saldo no estoque (0 un). Marcada automaticamente para Cotação.')
      }
      return
    }

    // Caso 2: Usuario digitou manualmente um nome no campo
    const textoDigitado = (opt.value || opt.label || '').trim()
    const textoLower = textoDigitado.toLowerCase()

    // Consulta no catalogo de estoque para verificar se a peca existe
    const itemEncontrado = CATALOGO_PECAS_ESTOQUE.find(
      (c) =>
        c.nome.toLowerCase() === textoLower ||
        c.codigo.toLowerCase() === textoLower ||
        c.nome.toLowerCase().includes(textoLower) ||
        textoLower.includes(c.nome.toLowerCase())
    )

    if (itemEncontrado && itemEncontrado.estoqueAtual > 0) {
      // Encontrada no estoque e com saldo > 0: entra como estoque interno
      setFormPeca((prev) => ({
        ...prev,
        nome: itemEncontrado.nome,
        codigo: itemEncontrado.codigo || prev.codigo,
        categoria: itemEncontrado.categoria || prev.categoria,
        statusEstoque: 'em_estoque',
        estoqueAtual: itemEncontrado.estoqueAtual,
        estoqueMinimo: itemEncontrado.estoqueMinimo || 1,
        fornecedorId: 'estoque-interno',
        fornecedorNome: 'Estoque Interno',
        precoUnitario: itemEncontrado.precoUnitario.toFixed(2),
        marcaSugerida: itemEncontrado.marcaSugerida || prev.marcaSugerida,
      }))
      toast.info(`Peça identificada no estoque interno (${itemEncontrado.estoqueAtual} un disponíveis).`)
    } else {
      // Nao encontrada no estoque ou sem saldo: vem como para cotacao
      setFormPeca((prev) => ({
        ...prev,
        nome: textoDigitado,
        statusEstoque: 'para_cotacao',
        estoqueAtual: itemEncontrado ? itemEncontrado.estoqueAtual : 0,
        categoria: itemEncontrado ? itemEncontrado.categoria : prev.categoria,
        fornecedorId: '',
        fornecedorNome: 'Cotação Externa',
        precoUnitario: '0.00',
        desconto: '0.00',
        marcaSugerida: itemEncontrado ? itemEncontrado.marcaSugerida : prev.marcaSugerida,
      }))
      toast.warning('Peça não localizada no estoque interno. Marcada automaticamente para Cotação.')
    }
  }

  // Abrir modal para editar peca existente
  const handleAbrirEdicaoPeca = (item) => {
    setEditandoPecaId(item.id)
    const isEstoque = item.statusEstoque === 'em_estoque'
    setFormPeca({
      codigo: item.codigo || '',
      nome: item.nome || '',
      categoria: item.categoria || 'Outros Componentes',
      statusEstoque: item.statusEstoque || 'para_cotacao',
      estoqueAtual: item.estoqueAtual ?? 0,
      estoqueMinimo: item.estoqueMinimo ?? 1,
      fornecedorId: isEstoque ? 'estoque-interno' : (item.fornecedorId || ''),
      fornecedorNome: isEstoque ? 'Estoque Interno' : (item.fornecedorNome || 'Cotação Externa'),
      marcaSugerida: item.marcaSugerida || '',
      precoUnitario: isEstoque && item.precoUnitario ? String(item.precoUnitario) : '0.00',
      quantidade: item.quantidade ? String(item.quantidade) : '1',
      desconto: isEstoque && item.desconto ? String(item.desconto) : '0.00',
      fotoUrl: item.fotoUrl || null,
      fotoNome: item.fotoNome || '',
      observacoes: item.observacoes || '',
    })
    setModalPecaMaximizada(false)
    setModalPecaAberto(true)
  }

  // Upload de imagem no modal da peca
  const handleUploadFoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setFormPeca((prev) => ({
        ...prev,
        fotoUrl: event.target.result,
        fotoNome: file.name,
      }))
    }
    reader.readAsDataURL(file)
  }

  // Remover foto da peca
  const handleRemoverFoto = () => {
    setFormPeca((prev) => ({
      ...prev,
      fotoUrl: null,
      fotoNome: '',
    }))
    if (fileInputPecaRef.current) {
      fileInputPecaRef.current.value = ''
    }
  }

  // Salvar peca (adicionar ou atualizar)
  const handleSalvarPeca = (e) => {
    e.preventDefault()

    if (!formPeca.nome || !formPeca.nome.trim()) {
      toast.error('Por favor, informe o nome ou descrição da peça.')
      return
    }

    const isCotacao = formPeca.statusEstoque === 'para_cotacao'
    const precoNum = isCotacao ? 0 : (parseFloat(formPeca.precoUnitario) || 0)
    const qtdNum = parseFloat(formPeca.quantidade) || 1
    const descNum = isCotacao ? 0 : (parseFloat(formPeca.desconto) || 0)
    const fornecedorNomeFinal = isCotacao ? 'Cotação Externa' : 'Estoque Interno'
    const fornecedorIdFinal = isCotacao ? '' : 'estoque-interno'

    if (editandoPecaId) {
      const atualizadas = pecasOS.map((item) => {
        if (item.id === editandoPecaId) {
          return {
            ...item,
            ...formPeca,
            fornecedorId: isCotacao ? (item.fornecedorId || '') : 'estoque-interno',
            fornecedorNome: isCotacao
              ? (item.fornecedorNome && item.fornecedorNome !== 'Estoque Interno' ? item.fornecedorNome : 'Cotação Externa')
              : 'Estoque Interno',
            precoUnitario: isCotacao && parseFloat(item.precoUnitario) > 0 ? item.precoUnitario : precoNum.toFixed(2),
            quantidade: qtdNum.toString(),
            desconto: isCotacao ? '0.00' : descNum.toFixed(2),
          }
        }
        return item
      })
      updateFormData({ pecasOS: atualizadas })
      toast.success('Peça atualizada com sucesso!')
    } else {
      const novaPeca = {
        id: `peca-os-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ...formPeca,
        fornecedorId: fornecedorIdFinal,
        fornecedorNome: fornecedorNomeFinal,
        precoUnitario: precoNum.toFixed(2),
        quantidade: qtdNum.toString(),
        desconto: descNum.toFixed(2),
        origem: 'manual',
      }
      updateFormData({ pecasOS: [...pecasOS, novaPeca] })
      toast.success('Peça adicionada à Ordem de Serviço com sucesso!')
    }

    setModalPecaAberto(false)
  }

  // Remover peca da lista
  const handleRemoverPeca = (id) => {
    const atualizadas = pecasOS.filter((p) => p.id !== id)
    updateFormData({ pecasOS: atualizadas })
    toast.info('Peça removida da Ordem de Serviço.')
  }

  // Subtotal da peca em edicao no modal
  const subtotalPecaModal = useMemo(() => {
    const v = parseFloat(formPeca.precoUnitario) || 0
    const q = parseFloat(formPeca.quantidade) || 1
    const d = parseFloat(formPeca.desconto) || 0
    return Math.max(0, v * q - d).toFixed(2)
  }, [formPeca.precoUnitario, formPeca.quantidade, formPeca.desconto])

  // ==========================================
  // HANDLERS MODAL DE PEÇA (ARRASTO E RESIZE COM PERSISTÊNCIA)
  // ==========================================

  // Arrasto do cabeçalho do modal de peça para mover posição
  const handleIniciarArrastoHeaderPeca = (e) => {
    if (e.button !== 0 || modalPecaMaximizada) return
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return

    e.preventDefault()
    setEstaArrastandoPeca(true)

    const startX = e.clientX
    const startY = e.clientY
    const startPosX = tamanhoModalPeca.posicaoX || 0
    const startPosY = tamanhoModalPeca.posicaoY || 0

    dragModalPecaRef.current = {
      ativo: true,
      startX,
      startY,
      startPosX,
      startPosY,
    }

    let ultimoX = startPosX
    let ultimoY = startPosY

    const handleMouseMove = (moveEvent) => {
      if (!dragModalPecaRef.current.ativo) return
      const deltaX = moveEvent.clientX - dragModalPecaRef.current.startX
      const deltaY = moveEvent.clientY - dragModalPecaRef.current.startY

      const maxPosX = Math.max(0, (window.innerWidth - 120) / 2)
      const maxPosY = Math.max(0, (window.innerHeight - 80) / 2)

      const novaPosX = Math.min(maxPosX, Math.max(-maxPosX, Math.round(dragModalPecaRef.current.startPosX + deltaX)))
      const novaPosY = Math.min(maxPosY, Math.max(-maxPosY, Math.round(dragModalPecaRef.current.startPosY + deltaY)))

      ultimoX = novaPosX
      ultimoY = novaPosY

      setTamanhoModalPeca((prev) => ({
        ...prev,
        posicaoX: novaPosX,
        posicaoY: novaPosY,
      }))
    }

    const handleMouseUp = () => {
      dragModalPecaRef.current.ativo = false
      setEstaArrastandoPeca(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      setTamanhoModalPeca((prev) => {
        const atualizado = { ...prev, posicaoX: ultimoX, posicaoY: ultimoY }
        salvarDimensoesNoStorage(CHAVE_STORAGE_MODAL_PECA, atualizado)
        return atualizado
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Redimensionamento livre do modal de peça
  const handleIniciarRedimensionamentoPeca = (e, direcao) => {
    e.preventDefault()
    e.stopPropagation()
    if (modalPecaMaximizada) return

    setEstaRedimensionandoPeca(true)
    const startX = e.clientX
    const startY = e.clientY
    const startLargura = tamanhoModalPeca.largura
    const startAltura = tamanhoModalPeca.altura
    const startPosX = tamanhoModalPeca.posicaoX || 0
    const startPosY = tamanhoModalPeca.posicaoY || 0

    resizeModalPecaRef.current = {
      ativo: true,
      direcao,
      startX,
      startY,
      startLargura,
      startAltura,
      startPosX,
      startPosY,
    }

    let ultimoTamanho = {
      largura: startLargura,
      altura: startAltura,
      posicaoX: startPosX,
      posicaoY: startPosY,
    }

    const handleMouseMove = (moveEvent) => {
      if (!resizeModalPecaRef.current.ativo) return

      const deltaX = moveEvent.clientX - resizeModalPecaRef.current.startX
      const deltaY = moveEvent.clientY - resizeModalPecaRef.current.startY
      const { direcao: dir, startLargura: sW, startAltura: sH, startPosX: sX, startPosY: sY } = resizeModalPecaRef.current

      const maxW = typeof window !== 'undefined' ? window.innerWidth - 24 : 1400
      const maxH = typeof window !== 'undefined' ? window.innerHeight - 24 : 900
      const minW = 420
      const minH = 360

      let novaLargura = sW
      let novaAltura = sH
      let novaPosX = sX
      let novaPosY = sY

      if (dir === 'direita' || dir === 'canto') {
        const calculada = Math.max(minW, Math.min(maxW, Math.round(sW + deltaX)))
        const deltaReal = calculada - sW
        novaLargura = calculada
        novaPosX = Math.round(sX + deltaReal / 2)
      }

      if (dir === 'baixo' || dir === 'canto') {
        const calculada = Math.max(minH, Math.min(maxH, Math.round(sH + deltaY)))
        const deltaReal = calculada - sH
        novaAltura = calculada
        novaPosY = Math.round(sY + deltaReal / 2)
      }

      ultimoTamanho = {
        largura: novaLargura,
        altura: novaAltura,
        posicaoX: novaPosX,
        posicaoY: novaPosY,
      }

      setTamanhoModalPeca(ultimoTamanho)
    }

    const handleMouseUp = () => {
      resizeModalPecaRef.current.ativo = false
      setEstaRedimensionandoPeca(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      salvarDimensoesNoStorage(CHAVE_STORAGE_MODAL_PECA, ultimoTamanho)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Restaurar tamanho e posição padrão do modal de peça
  const handleRestaurarPadraoPeca = () => {
    const padrao = {
      largura: LARGURA_PADRAO_MODAL,
      altura: ALTURA_PADRAO_MODAL,
      posicaoX: 0,
      posicaoY: 0,
    }
    setTamanhoModalPeca(padrao)
    salvarDimensoesNoStorage(CHAVE_STORAGE_MODAL_PECA, padrao)
    toast.info('Tamanho e posição do formulário de peças restaurados para o padrão.')
  }

  // ==========================================
  // HANDLERS MODAL DE COTAÇÃO (ARRASTO E RESIZE COM PERSISTÊNCIA)
  // ==========================================

  // Arrasto do cabeçalho do modal de cotação para mover posição
  const handleIniciarArrastoHeaderCotacao = (e) => {
    if (e.button !== 0 || modalCotacaoMaximizada) return
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return

    e.preventDefault()
    setEstaArrastandoCotacao(true)

    const startX = e.clientX
    const startY = e.clientY
    const startPosX = tamanhoModalCotacao.posicaoX || 0
    const startPosY = tamanhoModalCotacao.posicaoY || 0

    dragModalCotacaoRef.current = {
      ativo: true,
      startX,
      startY,
      startPosX,
      startPosY,
    }

    let ultimoX = startPosX
    let ultimoY = startPosY

    const handleMouseMove = (moveEvent) => {
      if (!dragModalCotacaoRef.current.ativo) return
      const deltaX = moveEvent.clientX - dragModalCotacaoRef.current.startX
      const deltaY = moveEvent.clientY - dragModalCotacaoRef.current.startY

      const maxPosX = Math.max(0, (window.innerWidth - 120) / 2)
      const maxPosY = Math.max(0, (window.innerHeight - 80) / 2)

      const novaPosX = Math.min(maxPosX, Math.max(-maxPosX, Math.round(dragModalCotacaoRef.current.startPosX + deltaX)))
      const novaPosY = Math.min(maxPosY, Math.max(-maxPosY, Math.round(dragModalCotacaoRef.current.startPosY + deltaY)))

      ultimoX = novaPosX
      ultimoY = novaPosY

      setTamanhoModalCotacao((prev) => ({
        ...prev,
        posicaoX: novaPosX,
        posicaoY: novaPosY,
      }))
    }

    const handleMouseUp = () => {
      dragModalCotacaoRef.current.ativo = false
      setEstaArrastandoCotacao(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      setTamanhoModalCotacao((prev) => {
        const atualizado = { ...prev, posicaoX: ultimoX, posicaoY: ultimoY }
        salvarDimensoesNoStorage(CHAVE_STORAGE_MODAL_COTACAO, atualizado)
        return atualizado
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Redimensionamento livre do modal de cotação
  const handleIniciarRedimensionamentoCotacao = (e, direcao) => {
    e.preventDefault()
    e.stopPropagation()
    if (modalCotacaoMaximizada) return

    setEstaRedimensionandoCotacao(true)
    const startX = e.clientX
    const startY = e.clientY
    const startLargura = tamanhoModalCotacao.largura
    const startAltura = tamanhoModalCotacao.altura
    const startPosX = tamanhoModalCotacao.posicaoX || 0
    const startPosY = tamanhoModalCotacao.posicaoY || 0

    resizeModalCotacaoRef.current = {
      ativo: true,
      direcao,
      startX,
      startY,
      startLargura,
      startAltura,
      startPosX,
      startPosY,
    }

    let ultimoTamanho = {
      largura: startLargura,
      altura: startAltura,
      posicaoX: startPosX,
      posicaoY: startPosY,
    }

    const handleMouseMove = (moveEvent) => {
      if (!resizeModalCotacaoRef.current.ativo) return

      const deltaX = moveEvent.clientX - resizeModalCotacaoRef.current.startX
      const deltaY = moveEvent.clientY - resizeModalCotacaoRef.current.startY
      const { direcao: dir, startLargura: sW, startAltura: sH, startPosX: sX, startPosY: sY } = resizeModalCotacaoRef.current

      const maxW = typeof window !== 'undefined' ? window.innerWidth - 24 : 1400
      const maxH = typeof window !== 'undefined' ? window.innerHeight - 24 : 900
      const minW = 420
      const minH = 360

      let novaLargura = sW
      let novaAltura = sH
      let novaPosX = sX
      let novaPosY = sY

      if (dir === 'direita' || dir === 'canto') {
        const calculada = Math.max(minW, Math.min(maxW, Math.round(sW + deltaX)))
        const deltaReal = calculada - sW
        novaLargura = calculada
        novaPosX = Math.round(sX + deltaReal / 2)
      }

      if (dir === 'baixo' || dir === 'canto') {
        const calculada = Math.max(minH, Math.min(maxH, Math.round(sH + deltaY)))
        const deltaReal = calculada - sH
        novaAltura = calculada
        novaPosY = Math.round(sY + deltaReal / 2)
      }

      ultimoTamanho = {
        largura: novaLargura,
        altura: novaAltura,
        posicaoX: novaPosX,
        posicaoY: novaPosY,
      }

      setTamanhoModalCotacao(ultimoTamanho)
    }

    const handleMouseUp = () => {
      resizeModalCotacaoRef.current.ativo = false
      setEstaRedimensionandoCotacao(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      salvarDimensoesNoStorage(CHAVE_STORAGE_MODAL_COTACAO, ultimoTamanho)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Restaurar tamanho e posição padrão do modal de cotação
  const handleRestaurarPadraoCotacao = () => {
    const padrao = {
      largura: LARGURA_PADRAO_MODAL,
      altura: ALTURA_PADRAO_MODAL,
      posicaoX: 0,
      posicaoY: 0,
    }
    setTamanhoModalCotacao(padrao)
    salvarDimensoesNoStorage(CHAVE_STORAGE_MODAL_COTACAO, padrao)
    toast.info('Tamanho e posição do formulário de cotação restaurados para o padrão.')
  }

  // ==========================================
  // HANDLERS MODAL DE LAUDO (ARRASTO E RESIZE COM PERSISTÊNCIA)
  // ==========================================

  // Arrasto do cabeçalho do modal de laudo para mover posição
  const handleIniciarArrastoHeaderLaudo = (e) => {
    if (e.button !== 0 || modalLaudoMaximizada) return
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return

    e.preventDefault()
    setEstaArrastandoLaudo(true)

    const startX = e.clientX
    const startY = e.clientY
    const startPosX = tamanhoModalLaudo.posicaoX || 0
    const startPosY = tamanhoModalLaudo.posicaoY || 0

    dragModalLaudoRef.current = {
      ativo: true,
      startX,
      startY,
      startPosX,
      startPosY,
    }

    let ultimoX = startPosX
    let ultimoY = startPosY

    const handleMouseMove = (moveEvent) => {
      if (!dragModalLaudoRef.current.ativo) return
      const deltaX = moveEvent.clientX - dragModalLaudoRef.current.startX
      const deltaY = moveEvent.clientY - dragModalLaudoRef.current.startY

      const maxPosX = Math.max(0, (window.innerWidth - 120) / 2)
      const maxPosY = Math.max(0, (window.innerHeight - 80) / 2)

      const novaPosX = Math.min(maxPosX, Math.max(-maxPosX, Math.round(dragModalLaudoRef.current.startPosX + deltaX)))
      const novaPosY = Math.min(maxPosY, Math.max(-maxPosY, Math.round(dragModalLaudoRef.current.startPosY + deltaY)))

      ultimoX = novaPosX
      ultimoY = novaPosY

      setTamanhoModalLaudo((prev) => ({
        ...prev,
        posicaoX: novaPosX,
        posicaoY: novaPosY,
      }))
    }

    const handleMouseUp = () => {
      dragModalLaudoRef.current.ativo = false
      setEstaArrastandoLaudo(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      setTamanhoModalLaudo((prev) => {
        const atualizado = { ...prev, posicaoX: ultimoX, posicaoY: ultimoY }
        salvarDimensoesNoStorage(CHAVE_STORAGE_MODAL_LAUDO, atualizado)
        return atualizado
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Redimensionamento livre do modal de laudo
  const handleIniciarRedimensionamentoLaudo = (e, direcao) => {
    e.preventDefault()
    e.stopPropagation()
    if (modalLaudoMaximizada) return

    setEstaRedimensionandoLaudo(true)
    const startX = e.clientX
    const startY = e.clientY
    const startLargura = tamanhoModalLaudo.largura
    const startAltura = tamanhoModalLaudo.altura
    const startPosX = tamanhoModalLaudo.posicaoX || 0
    const startPosY = tamanhoModalLaudo.posicaoY || 0

    resizeModalLaudoRef.current = {
      ativo: true,
      direcao,
      startX,
      startY,
      startLargura,
      startAltura,
      startPosX,
      startPosY,
    }

    let ultimoTamanho = {
      largura: startLargura,
      altura: startAltura,
      posicaoX: startPosX,
      posicaoY: startPosY,
    }

    const handleMouseMove = (moveEvent) => {
      if (!resizeModalLaudoRef.current.ativo) return

      const deltaX = moveEvent.clientX - resizeModalLaudoRef.current.startX
      const deltaY = moveEvent.clientY - resizeModalLaudoRef.current.startY
      const { direcao: dir, startLargura: sW, startAltura: sH, startPosX: sX, startPosY: sY } = resizeModalLaudoRef.current

      const maxW = typeof window !== 'undefined' ? window.innerWidth - 24 : 1600
      const maxH = typeof window !== 'undefined' ? window.innerHeight - 24 : 1000
      const minW = 480
      const minH = 380

      let novaLargura = sW
      let novaAltura = sH
      let novaPosX = sX
      let novaPosY = sY

      if (dir === 'direita' || dir === 'canto') {
        const calculada = Math.max(minW, Math.min(maxW, Math.round(sW + deltaX)))
        const deltaReal = calculada - sW
        novaLargura = calculada
        novaPosX = Math.round(sX + deltaReal / 2)
      }

      if (dir === 'baixo' || dir === 'canto') {
        const calculada = Math.max(minH, Math.min(maxH, Math.round(sH + deltaY)))
        const deltaReal = calculada - sH
        novaAltura = calculada
        novaPosY = Math.round(sY + deltaReal / 2)
      }

      ultimoTamanho = {
        largura: novaLargura,
        altura: novaAltura,
        posicaoX: novaPosX,
        posicaoY: novaPosY,
      }

      setTamanhoModalLaudo(ultimoTamanho)
    }

    const handleMouseUp = () => {
      resizeModalLaudoRef.current.ativo = false
      setEstaRedimensionandoLaudo(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      salvarDimensoesNoStorage(CHAVE_STORAGE_MODAL_LAUDO, ultimoTamanho)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Restaurar tamanho e posição padrão do laudo
  const handleRestaurarPadraoLaudo = () => {
    const padrao = {
      largura: LARGURA_PADRAO_LAUDO,
      altura: ALTURA_PADRAO_LAUDO,
      posicaoX: 0,
      posicaoY: 0,
    }
    setTamanhoModalLaudo(padrao)
    salvarDimensoesNoStorage(CHAVE_STORAGE_MODAL_LAUDO, padrao)
    toast.info('Tamanho e posição do laudo restaurados para o padrão.')
  }

  // Abrir modal de envio de cotacao
  const handleAbrirModalCotacao = () => {
    // Seleciona automaticamente todas as pecas marcadas como 'para_cotacao'
    const pecasParaCotar = pecasOS.filter((p) => p.statusEstoque === 'para_cotacao')

    if (pecasParaCotar.length === 0 && pecasOS.length > 0) {
      setPecasSelecionadasCotacao(pecasOS.map((p) => p.id))
      toast.info('Todas as peças da OS foram selecionadas para cotação externa.')
    } else if (pecasOS.length === 0) {
      toast.warning('Adicione peças ou importe do diagnóstico antes de enviar uma cotação.')
      return
    } else {
      setPecasSelecionadasCotacao(pecasParaCotar.map((p) => p.id))
    }

    // Gera id unico para esta cotacao
    const novoCotId = `COT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    setCotacaoAtivaId(novoCotId)
    setCotacaoEnviadaSucesso(false)
    setCopiadoLinkCotacao(false)
    setModalCotacaoAberto(true)
  }

  // Alternar selecao de peca para cotacao
  const handleTogglePecaCotacao = (id) => {
    setPecasSelecionadasCotacao((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    )
  }

  // Alternar selecao de fornecedor parceiro
  const handleToggleFornecedorCotacao = (id) => {
    setFornecedoresSelecionados((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    )
  }

  // Pecas que estao selecionadas para a cotacao
  const itensCotacaoSelecionados = useMemo(() => {
    return pecasOS.filter((p) => pecasSelecionadasCotacao.includes(p.id))
  }, [pecasOS, pecasSelecionadasCotacao])

  // Link absoluto da cotacao para envio a auto peca
  const urlCotacaoPublica = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dev-oficina.com'
    return `${origin}/cotacao/${cotacaoAtivaId || 'COT-DEMO'}`
  }, [cotacaoAtivaId])

  // Salvar registro de cotacao enviada no localStorage e formData
  const handleSalvarEEnviarCotacao = (abrirJanela = false) => {
    if (itensCotacaoSelecionados.length === 0) {
      toast.error('Selecione pelo menos uma peça para incluir na solicitação de cotação.')
      return
    }

    if (fornecedoresSelecionados.length === 0) {
      toast.error('Selecione pelo menos uma auto peças parceira para receber a cotação.')
      return
    }

    const fornecedoresAlvo = AUTO_PECAS_FORNECEDORES.filter((f) =>
      fornecedoresSelecionados.includes(f.id)
    )

    const novaCotacaoRegistro = {
      id: cotacaoAtivaId,
      dataCriacao: new Date().toISOString(),
      status: 'aguardando_resposta',
      cliente,
      placa: placa || 'BRA-2E19',
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
        quantidade: item.quantidade,
        marcaSugerida: item.marcaSugerida,
        fotoUrl: item.fotoUrl,
        observacoes: item.observacoes,
      })),
      fornecedores: fornecedoresAlvo,
      respostas: {},
    }

    // Salva no localStorage compartilhado para permitir que a pagina /cotacao/:id acesse
    try {
      const historicoRaw = localStorage.getItem('dev_oficina_cotacoes')
      const historico = historicoRaw ? JSON.parse(historicoRaw) : {}
      historico[cotacaoAtivaId] = novaCotacaoRegistro
      localStorage.setItem('dev_oficina_cotacoes', JSON.stringify(historico))
    } catch (e) {
      console.error('Erro ao salvar cotacao no localStorage:', e)
    }

    // Atualiza formData da OS
    const listaCotacoes = [...cotacoesEnviadas, novaCotacaoRegistro]
    updateFormData({ cotacoesEnviadas: listaCotacoes })

    setCotacaoEnviadaSucesso(true)
    toast.success('Cotação oficial gerada e vinculada à Ordem de Serviço!')

    if (abrirJanela) {
      window.open(urlCotacaoPublica, '_blank')
    }
  }

  // Copiar link da cotacao
  const handleCopiarLinkCotacao = () => {
    navigator.clipboard.writeText(urlCotacaoPublica)
    setCopiadoLinkCotacao(true)
    toast.success('Link da cotação copiado para a área de transferência!')
    setTimeout(() => setCopiadoLinkCotacao(false), 2500)
  }

  // Montar e disparar WhatsApp para um fornecedor
  const handleDispararWhatsAppFornecedor = (fornecedor) => {
    // Garante que a cotacao foi salva no storage antes do envio
    handleSalvarEEnviarCotacao(false)

    const veiculoTexto = placa ? `${placa} (${marcaModelo || 'Veículo'})` : marcaModelo || 'Veículo'
    const textoMsg = `Olá, equipe da *${fornecedor.nome}*! 👋%0A%0AAqui é da *Mecânica Gabriel*. Solicitamos cotação para o veículo:%0A🚗 *Veículo:* ${veiculoTexto}%0A📅 *Ano:* ${ano || 'Não informado'} | *KM:* ${km || 'Não informado'}%0A%0A📦 *Peças Solicitadas:*%0A${itensCotacaoSelecionados
      .map((item, i) => `${i + 1}. *${item.nome}* - Qtd: ${item.quantidade}${item.marcaSugerida ? ` (Pref: ${item.marcaSugerida})` : ''}`)
      .join('%0A')}%0A%0A📸 *Acesse o link abaixo para ver as fotos das peças e enviar o preço:*%0A🔗 ${urlCotacaoPublica}`

    const zapUrl = `https://wa.me/55${fornecedor.whatsapp.replace(/\D/g, '')}?text=${textoMsg}`
    toast.info(`Abrindo WhatsApp para ${fornecedor.nome}...`)
    window.open(zapUrl, '_blank')
  }

  // Copiar texto do laudo tecnico
  const handleCopiarLaudo = () => {
    if (!laudoTecnico) return
    navigator.clipboard.writeText(laudoTecnico)
    setCopiadoLaudo(true)
    toast.success('Texto do laudo técnico copiado para a área de transferência!')
    setTimeout(() => setCopiadoLaudo(false), 2000)
  }

  // Regenerar laudo tecnico
  const handleGerarLaudo = () => {
    const novoLaudo = gerarLaudoTecnico(formData)
    updateFormData({ laudoTecnico: novoLaudo })
    toast.success('Laudo técnico atualizado com base nos dados atuais!')
  }

  return (
    <div className="h-full w-full flex flex-col justify-between gap-2.5 overflow-hidden">
      {/* Barra Superior: Acesso ao Contexto, Importacao e Acoes Principais */}
      <div className="h-12 shrink-0 bg-white px-3 sm:px-4 rounded-2xl border border-[#d0d5dd] shadow-sm flex items-center justify-between gap-2">
        {/* Lado Esquerdo: Identificacao e Botoes de Apoio */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Package size={16} weight="bold" />
          </div>

          <span className="text-xs font-bold text-[#101828] hidden xl:inline shrink-0">
            Peças e Materiais
          </span>

          {/* Botao de Dados do Veiculo e Queixa */}
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

          {/* Botao de Ver Laudo Tecnico do Diagnostico */}
          <button
            type="button"
            onClick={() => setModalLaudoAberto(true)}
            className="h-8 px-2.5 sm:px-3 rounded-xl bg-[#f8fafc] hover:bg-[#f2f4f7] active:bg-[#eaecf0] border border-[#d0d5dd] text-[#101828] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            title="Visualizar ou editar o laudo técnico do diagnóstico"
          >
            <Sparkle size={15} weight="fill" className={laudoTecnico ? 'text-amber-500' : 'text-[#667085]'} />
            <span className="hidden sm:inline">Ver Laudo do Diagnóstico</span>
            {laudoTecnico && (
              <span className="w-2 h-2 rounded-full bg-[#0284c7]" title="Laudo gerado" />
            )}
          </button>
        </div>

        {/* Lado Direito: Acoes de Importacao, Adicao e Envio de Cotacao */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Botao: Puxar do Diagnostico */}
          <button
            type="button"
            onClick={handlePuxarDoDiagnostico}
            className={`h-8.5 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
              pecasDiagnosticoDisponiveis.length > 0
                ? 'bg-[#e0f2fe] text-[#0284c7] border-[#bae6fd] hover:bg-[#bae6fd]'
                : 'bg-[#f8fafc] text-[#344054] border-[#d0d5dd] hover:bg-[#f2f4f7]'
            }`}
            title="Importar peças apontadas na triagem de diagnóstico técnico com fotos"
          >
            <ArrowDownRight size={15} weight="bold" />
            <span>Puxar do Diagnóstico</span>
            {pecasDiagnosticoDisponiveis.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#0284c7] text-white">
                {pecasDiagnosticoDisponiveis.length}
              </span>
            )}
          </button>

          {/* Botao: Adicionar Nova Peca */}
          <button
            type="button"
            onClick={handleAbrirNovaPeca}
            className="h-8.5 px-3 rounded-xl bg-white hover:bg-[#f8fafc] border border-[#d0d5dd] text-[#101828] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
          >
            <Plus size={14} weight="bold" />
            <span>Adicionar Peça</span>
          </button>

          {/* Botao Principal: Enviar Cotacao para Auto Pecas */}
          <button
            type="button"
            onClick={handleAbrirModalCotacao}
            className="h-8.5 px-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 shrink-0"
            title="Enviar cotação das peças para auto peças parceiras cadastradas"
          >
            <PaperPlaneTilt size={15} weight="bold" className="text-[#38bdf8]" />
            <span>Enviar Cotação</span>
            {metricas.totalParaCotacao > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-black">
                {metricas.totalParaCotacao}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Faixa de Metricas Rapidas e Resumo das Pecas na OS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 shrink-0">
        <div className="p-2.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#f2f4f7] text-[#101828] flex items-center justify-center font-bold text-xs shrink-0">
            <Package size={16} weight="bold" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-[#667085] block leading-none">
              Peças na OS
            </span>
            <span className="text-sm font-extrabold text-[#101828] mt-0.5 block truncate">
              {metricas.totalPecasOS} {metricas.totalPecasOS === 1 ? 'item' : 'itens'}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center font-bold text-xs shrink-0">
            <CheckCircle size={16} weight="bold" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-[#667085] block leading-none">
              Em Estoque
            </span>
            <span className="text-sm font-extrabold text-[#0284c7] mt-0.5 block truncate">
              {metricas.totalEmEstoque} {metricas.totalEmEstoque === 1 ? 'peça' : 'peças'}
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
              {metricas.totalParaCotacao} {metricas.totalParaCotacao === 1 ? 'peça' : 'peças'}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#fef3f2] text-[#b42318] flex items-center justify-center font-bold text-xs shrink-0">
            <Tag size={16} weight="bold" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-[#667085] block leading-none">
              Descontos
            </span>
            <span className="text-sm font-extrabold text-[#b42318] mt-0.5 block truncate">
              R$ {metricas.totalDescontos}
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-2xl bg-[#101828] text-white shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 text-[#38bdf8] flex items-center justify-center font-bold text-xs shrink-0">
            <CurrencyDollar size={16} weight="bold" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-white/70 block leading-none">
              Total Peças
            </span>
            <span className="text-sm font-extrabold text-[#38bdf8] mt-0.5 block truncate">
              R$ {metricas.totalLiquido}
            </span>
          </div>
        </div>
      </div>

      {/* Area Central: Tabela Completa e Responsiva de Pecas */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-[#d0d5dd] shadow-sm flex flex-col overflow-hidden">
        {/* Barra de Ferramentas Superior da Tabela: Titulo, Contadores e Busca */}
        <div className="px-4 py-2.5 border-b border-[#d0d5dd] bg-[#fcfcfd] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#101828] text-white flex items-center justify-center shrink-0">
              <Package size={14} weight="bold" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-[#101828] whitespace-nowrap">
                Peças e Componentes
              </h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#f2f4f7] text-[#344054] border border-[#e4e7ec] whitespace-nowrap">
                {pecasOS.length} {pecasOS.length === 1 ? 'item' : 'itens'}
              </span>
              {termoBusca && (
                <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-[#eff8ff] text-[#175cd3] border border-[#b2ddff] whitespace-nowrap">
                  Filtrados: {pecasFiltradas.length}
                </span>
              )}
            </div>
          </div>

          {/* Campo de Busca Rapida, Filtro por Categoria e Filtro por Estoque */}
          <div className="flex items-center gap-2 flex-1 max-w-xl justify-end">
            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Buscar peça, código ou fornecedor..."
                className="w-full h-8.5 pl-8 pr-7 rounded-xl bg-white border border-[#d0d5dd] text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none focus:border-[#101828] shadow-2xs transition-all"
              />
              <MagnifyingGlass
                size={14}
                weight="bold"
                className="absolute left-2.5 top-2.5 text-[#667085]"
              />
              {termoBusca && (
                <button
                  type="button"
                  onClick={() => setTermoBusca('')}
                  className="absolute right-2 top-2 p-0.5 rounded text-[#98a2b3] hover:text-[#101828] cursor-pointer"
                  title="Limpar busca"
                >
                  <X size={12} weight="bold" />
                </button>
              )}
            </div>

            {/* Filtro por Categoria */}
            <div className="w-36 hidden md:block">
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full h-8.5 px-2.5 rounded-xl bg-white border border-[#d0d5dd] text-xs font-medium text-[#101828] focus:outline-none focus:border-[#101828] cursor-pointer shadow-2xs"
              >
                <option value="todas">Todas Categorias</option>
                {CATEGORIAS_PECAS_OPCOES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Situacao de Estoque */}
            <div className="w-36 hidden sm:block">
              <select
                value={filtroEstoque}
                onChange={(e) => setFiltroEstoque(e.target.value)}
                className="w-full h-8.5 px-2.5 rounded-xl bg-white border border-[#d0d5dd] text-xs font-medium text-[#101828] focus:outline-none focus:border-[#101828] cursor-pointer shadow-2xs"
              >
                <option value="todos">Todas Situações</option>
                <option value="em_estoque">Em Estoque</option>
                <option value="para_cotacao">Para Cotação</option>
              </select>
            </div>
          </div>
        </div>

        {/* Container com Scroll Responsivo Horizontal e Vertical */}
        <div className="flex-1 overflow-auto min-h-0 relative select-text">
          <table className="w-full min-w-[1050px] text-left border-collapse">
            {/* Cabecalho da Tabela (10 Colunas) */}
            <thead className="sticky top-0 z-10 bg-[#f8fafc] border-b-2 border-[#d0d5dd] text-[#344054] uppercase font-black text-[11px] tracking-wider shadow-2xs">
              <tr>
                <th className="py-3 px-3.5 w-28 text-center whitespace-nowrap">Código</th>
                <th className="py-3 px-3 text-center w-20 whitespace-nowrap">Foto</th>
                <th className="py-3 px-4 min-w-[260px] whitespace-nowrap">Descrição da Peça</th>
                <th className="py-3 px-3 text-center w-36 whitespace-nowrap">Situação / Estoque</th>
                <th className="py-3 px-3.5 w-44 whitespace-nowrap">Fornecedor / Auto Peça</th>
                <th className="py-3 px-3.5 text-right w-32 whitespace-nowrap">Valor Unit.</th>
                <th className="py-3 px-2 text-center w-20 whitespace-nowrap">Qtd</th>
                <th className="py-3 px-3 text-right w-28 whitespace-nowrap">Desconto</th>
                <th className="py-3 px-4 text-right w-36 whitespace-nowrap">Subtotal Líquido</th>
                <th className="py-3 px-3 text-center w-32 whitespace-nowrap">Ações</th>
              </tr>
            </thead>

            {/* Corpo da Tabela */}
            <tbody className="divide-y divide-[#e4e7ec]">
              {pecasOS.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto p-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#f8fafc] border border-[#d0d5dd] flex items-center justify-center text-[#667085] shadow-xs">
                        <Package size={28} weight="bold" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#101828]">
                          Nenhuma peça adicionada a esta OS
                        </h4>
                        <p className="text-xs text-[#667085] leading-relaxed mt-1">
                          Importe as peças com fotos apontadas no diagnóstico ou adicione componentes e materiais para cotação.
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 mt-1">
                        {pecasDiagnostico.length > 0 && (
                          <button
                            type="button"
                            onClick={handlePuxarDoDiagnostico}
                            className="px-3.5 py-2 rounded-xl bg-[#e0f2fe] hover:bg-[#bae6fd] border border-[#bae6fd] text-[#0284c7] text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            Puxar {pecasDiagnostico.length} do Diagnóstico
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleAbrirNovaPeca}
                          className="px-3.5 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          + Adicionar Peça
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : pecasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <p className="text-xs font-bold text-[#101828]">
                        Nenhuma peça corresponde à pesquisa
                      </p>
                      <p className="text-[11px] text-[#667085]">
                        Tente ajustar o termo digitado ou a situação de estoque.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setTermoBusca('')
                          setFiltroCategoria('todas')
                          setFiltroEstoque('todos')
                        }}
                        className="mt-2 px-3 py-1.5 rounded-xl border border-[#d0d5dd] bg-white text-xs font-semibold text-[#344054] hover:bg-[#f8fafc] cursor-pointer"
                      >
                        Limpar Filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                pecasFiltradas.map((item) => {
                  const valorUnit = parseFloat(item.precoUnitario) || 0
                  const qtd = parseFloat(item.quantidade) || 1
                  const desc = parseFloat(item.desconto) || 0
                  const totalLinha = Math.max(0, valorUnit * qtd - desc)
                  const emEstoque = item.statusEstoque === 'em_estoque'

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#f8fafc] transition-colors group text-xs text-[#101828]"
                    >
                      {/* Codigo */}
                      <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-xs px-2 py-1 rounded-lg bg-[#f2f4f7] text-[#344054] border border-[#e4e7ec] inline-block whitespace-nowrap">
                          {item.codigo || 'PEC-000'}
                        </span>
                      </td>

                      {/* Foto da Peca com Zoom ao Clicar */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {item.fotoUrl ? (
                          <button
                            type="button"
                            onClick={() => setFotoZoomUrl(item.fotoUrl)}
                            className="relative w-11 h-11 mx-auto rounded-xl overflow-hidden border border-[#d0d5dd] group/foto cursor-pointer shadow-2xs block bg-white"
                            title="Clique para ampliar a foto tirada pelo mecânico"
                          >
                            <img
                              src={item.fotoUrl}
                              alt={item.nome}
                              className="w-full h-full object-cover group-hover/foto:scale-110 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/foto:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <Eye size={16} weight="bold" />
                            </div>
                          </button>
                        ) : (
                          <div
                            className="w-11 h-11 mx-auto rounded-xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] flex flex-col items-center justify-center text-[#98a2b3]"
                            title="Sem foto registrada"
                          >
                            <Camera size={16} weight="regular" />
                            <span className="text-[8px] font-bold uppercase mt-0.5">Sem</span>
                          </div>
                        )}
                      </td>

                      {/* Descricao da Peca e Categoria */}
                      <td className="py-3.5 px-4 min-w-[260px]">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-[#101828] hover:text-[#0284c7] transition-colors block">
                              {item.nome}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f2f4f7] text-[#475467] border border-[#e4e7ec] whitespace-nowrap">
                              {item.categoria || 'Geral'}
                            </span>
                          </div>
                          {(item.marcaSugerida || item.observacoes) && (
                            <p className="text-[11px] text-[#667085] mt-1 line-clamp-1">
                              {item.marcaSugerida && (
                                <strong className="text-[#344054] font-semibold">
                                  Marca: {item.marcaSugerida} •{' '}
                                </strong>
                              )}
                              {item.observacoes}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Situacao / Estoque */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border whitespace-nowrap shadow-2xs ${
                            emEstoque
                              ? 'bg-[#e0f2fe] text-[#0284c7] border-[#bae6fd]'
                              : 'bg-[#fffaeb] text-[#b54708] border-[#fedf89]'
                          }`}
                        >
                          {emEstoque ? (
                            <>
                              <CheckCircle size={13} weight="fill" className="text-[#0284c7]" />
                              <span>Em Estoque</span>
                              {item.estoqueAtual > 0 && (
                                <span className="font-mono text-[10px] font-black opacity-80">
                                  ({item.estoqueAtual})
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <Storefront size={13} weight="bold" className="text-[#b54708]" />
                              <span>Para Cotação</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Fornecedor / Origem */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {emEstoque ? (
                            <CheckCircle size={14} weight="fill" className="text-[#0284c7] shrink-0" />
                          ) : (
                            <Storefront size={14} weight="bold" className="text-[#b54708] shrink-0" />
                          )}
                          <span className="text-xs font-bold text-[#101828] truncate block whitespace-nowrap">
                            {emEstoque
                              ? 'Estoque Interno'
                              : (item.fornecedorNome && item.fornecedorNome !== 'Auto Peças Central'
                                  ? item.fornecedorNome
                                  : 'Cotação Externa')}
                          </span>
                        </div>
                      </td>

                      {/* Valor Unitario */}
                      <td className="py-3.5 px-3.5 text-right font-mono font-bold text-sm text-[#101828] whitespace-nowrap">
                        {!emEstoque && valorUnit === 0 ? (
                          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[#fffaeb] text-[#b54708] border border-[#fedf89] inline-block">
                            A Cotar
                          </span>
                        ) : (
                          `R$ ${valorUnit.toFixed(2)}`
                        )}
                      </td>

                      {/* Quantidade */}
                      <td className="py-3.5 px-2 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-[#f8fafc] border border-[#d0d5dd] text-[#101828] inline-block whitespace-nowrap">
                          {qtd}
                        </span>
                      </td>

                      {/* Desconto */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-xs whitespace-nowrap">
                        {!emEstoque && valorUnit === 0 ? (
                          <span className="text-[#98a2b3] whitespace-nowrap">—</span>
                        ) : desc > 0 ? (
                          <span className="text-[#b42318] whitespace-nowrap">- R$ {desc.toFixed(2)}</span>
                        ) : (
                          <span className="text-[#98a2b3] whitespace-nowrap">R$ 0,00</span>
                        )}
                      </td>

                      {/* Subtotal Liquido */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-sm sm:text-base text-[#101828] whitespace-nowrap">
                        {!emEstoque && totalLinha === 0 ? (
                          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[#fffaeb] text-[#b54708] border border-[#fedf89] inline-block">
                            Sob Cotação
                          </span>
                        ) : (
                          `R$ ${totalLinha.toFixed(2)}`
                        )}
                      </td>

                      {/* Acoes */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAbrirEdicaoPeca(item)}
                            className="w-8 h-8 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#101828] hover:text-white text-[#344054] transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
                            title="Editar esta peça"
                          >
                            <PencilSimple size={14} weight="bold" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoverPeca(item.id)}
                            className="w-8 h-8 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#fef3f2] text-[#667085] hover:text-[#b42318] hover:border-[#fecdca] transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
                            title="Remover peça da OS"
                          >
                            <Trash size={14} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>

            {/* Rodape Totalizador Fixo na Tabela */}
            {pecasOS.length > 0 && (
              <tfoot className="sticky bottom-0 z-10 bg-[#f8fafc] border-t-2 border-[#d0d5dd] text-xs shadow-xs font-bold">
                <tr>
                  <td
                    colSpan={5}
                    className="py-3.5 px-4 text-right font-extrabold uppercase text-[#475467] tracking-wider text-[11px]"
                  >
                    Totais de Peças e Materiais ({pecasFiltradas.length} {pecasFiltradas.length === 1 ? 'item' : 'itens'}):
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-mono font-bold text-xs text-[#344054]">
                    R$ {metricas.subtotalBruto}
                  </td>
                  <td className="py-3.5 px-2 text-center font-mono font-bold text-xs text-[#667085]">
                    —
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-xs text-[#b42318]">
                    {parseFloat(metricas.totalDescontos) > 0
                      ? `- R$ ${metricas.totalDescontos}`
                      : 'R$ 0,00'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-sm sm:text-base text-[#0284c7] bg-[#f0f9ff] border-l border-r border-[#bae6fd]">
                    R$ {metricas.totalLiquido}
                  </td>
                  <td className="py-3.5 px-3"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Barra Inferior Fixa de Navegacao da Etapa */}
      <div className="h-11 shrink-0 bg-white px-5 rounded-2xl border border-[#d0d5dd] shadow-sm flex items-center justify-between">
        <span className="text-xs font-medium text-[#667085]">
          Aba 5 de 7 • <strong className="text-[#101828] font-bold">Peças e Componentes</strong>
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

      {/* MODAL 1: Adicionar ou Editar Peca da OS */}
      {modalPecaAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 select-none">
          <form
            onSubmit={handleSalvarPeca}
            style={
              modalPecaMaximizada
                ? { width: '99vw', height: '98vh', transform: 'none' }
                : {
                    width: `${tamanhoModalPeca.largura}px`,
                    maxWidth: '98vw',
                    height: `${tamanhoModalPeca.altura}px`,
                    maxHeight: '96vh',
                    minWidth: '360px',
                    minHeight: '380px',
                    transform: `translate(${tamanhoModalPeca.posicaoX || 0}px, ${tamanhoModalPeca.posicaoY || 0}px)`,
                  }
            }
            className={`relative bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl flex flex-col overflow-hidden ${
              estaRedimensionandoPeca || estaArrastandoPeca
                ? 'transition-none select-none'
                : 'transition-[width,height] duration-150 select-auto'
            }`}
          >
            {/* Header do Modal */}
            <div
              onMouseDown={handleIniciarArrastoHeaderPeca}
              onDoubleClick={() => setModalPecaMaximizada(!modalPecaMaximizada)}
              className={`px-5 py-3.5 border-b border-[#f2f4f7] flex items-center justify-between shrink-0 bg-white select-none ${
                modalPecaMaximizada ? 'cursor-default' : estaArrastandoPeca ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              title={
                modalPecaMaximizada
                  ? 'Dê um duplo clique no cabeçalho para restaurar'
                  : 'Clique e arraste pelo cabeçalho para mover • Duplo clique para maximizar'
              }
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <Package size={18} weight="bold" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-[#101828]">
                      {editandoPecaId ? 'Editar Peça da OS' : 'Adicionar Peça à Ordem de Serviço'}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f2f4f7] text-[#344054] border border-[#e4e7ec]">
                      {formPeca.statusEstoque === 'em_estoque' ? 'Estoque Interno' : 'Para Cotação'}
                    </span>
                    {!modalPecaMaximizada && (
                      <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold text-[#667085] bg-[#f8fafc] px-1.5 py-0.5 rounded-md border border-[#eaecf0]">
                        <ArrowsOutCardinal size={10} weight="bold" />
                        Mover
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#667085] mt-0.5 truncate">
                    Consulta automática no estoque interno e direcionamento para cotação externa
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Botão de Restaurar Tamanho e Posição Padrão se foi redimensionado ou movido */}
                {(tamanhoModalPeca.largura !== LARGURA_PADRAO_MODAL ||
                  tamanhoModalPeca.altura !== ALTURA_PADRAO_MODAL ||
                  Boolean(tamanhoModalPeca.posicaoX) ||
                  Boolean(tamanhoModalPeca.posicaoY)) &&
                  !modalPecaMaximizada && (
                    <button
                      type="button"
                      onClick={handleRestaurarPadraoPeca}
                      className="h-8.5 px-2.5 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-[#344054] flex items-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Restaurar tamanho e posição padrão do formulário"
                    >
                      <ArrowsClockwise size={13} weight="bold" />
                      <span className="hidden sm:inline">Tamanho Padrão</span>
                    </button>
                  )}

                <button
                  type="button"
                  onClick={() => setModalPecaMaximizada(!modalPecaMaximizada)}
                  className="h-8.5 w-8.5 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-[#101828] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  title={modalPecaMaximizada ? 'Restaurar tamanho' : 'Maximizar formulário'}
                >
                  {modalPecaMaximizada ? (
                    <ArrowsInSimple size={16} weight="bold" />
                  ) : (
                    <ArrowsOutSimple size={16} weight="bold" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModalPecaAberto(false)}
                  className="h-8.5 w-8.5 rounded-xl text-[#667085] hover:text-[#101828] hover:bg-[#f2f4f7] flex items-center justify-center transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
            </div>

            {/* Conteudo do Formulario com Scroll Confortavel */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-xs min-h-0 bg-[#f8fafc]/50">
              {/* Bloco 1: Identificacao da Peca, Catalogo e Categoria */}
              <div className="p-4 rounded-2xl bg-white border border-[#d0d5dd] shadow-xs space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  {/* Codigo */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-[#344054] mb-1">
                      Código da Peça
                    </label>
                    <input
                      type="text"
                      value={formPeca.codigo}
                      onChange={(e) =>
                        setFormPeca((prev) => ({ ...prev, codigo: e.target.value.toUpperCase() }))
                      }
                      placeholder="PEC-001"
                      className="w-full h-10 px-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] font-mono text-xs font-bold text-[#101828] focus:bg-white focus:outline-none focus:border-[#101828]"
                    />
                  </div>

                  {/* Nome da Peca com Sugestoes do Catalogo */}
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-bold text-[#344054] mb-1">
                      Nome / Descrição da Peça *
                    </label>
                    <CreatableSelect
                      styles={customSelectStyles}
                      options={opcoesCatalogoPecas}
                      value={
                        formPeca.nome
                          ? { label: formPeca.nome, value: formPeca.nome }
                          : null
                      }
                      onChange={handleSelecionarOuCriarPeca}
                      placeholder="Selecione do catálogo ou digite uma nova peça..."
                      formatCreateLabel={(inputValue) => `Adicionar "${inputValue}" (marcar para cotação)`}
                      isClearable
                    />

                    {formPeca.nome && (
                      <div
                        className={`mt-2 p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                          formPeca.statusEstoque === 'em_estoque'
                            ? 'bg-[#e0f2fe] border-[#bae6fd] text-[#0284c7]'
                            : 'bg-[#fffaeb] border-[#fedf89] text-[#b54708]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {formPeca.statusEstoque === 'em_estoque' ? (
                            <CheckCircle size={16} weight="fill" className="shrink-0" />
                          ) : (
                            <Storefront size={16} weight="bold" className="shrink-0" />
                          )}
                          <span className="text-[11px] font-bold truncate">
                            {formPeca.statusEstoque === 'em_estoque'
                              ? `Consultado no estoque: Disponível (${formPeca.estoqueAtual} un no estoque interno)`
                              : 'Consultado no estoque: Sem saldo disponível (0 un) → Marcada para Cotação'}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                            formPeca.statusEstoque === 'em_estoque'
                              ? 'bg-white text-[#0284c7] border-[#bae6fd]'
                              : 'bg-white text-[#b54708] border-[#fedf89]'
                          }`}
                        >
                          {formPeca.statusEstoque === 'em_estoque' ? 'Em Estoque' : 'Para Cotação'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Categoria */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-[#344054] mb-1">
                      Categoria do Componente
                    </label>
                    <Select
                      styles={customSelectStyles}
                      options={CATEGORIAS_PECAS_OPCOES}
                      value={CATEGORIAS_PECAS_OPCOES.find((c) => c.value === formPeca.categoria)}
                      onChange={(opt) =>
                        setFormPeca((prev) => ({ ...prev, categoria: opt?.value || 'Freios' }))
                      }
                    />
                  </div>
                </div>

                {/* Marca Sugerida / Fabricante */}
                <div>
                  <label className="block text-[11px] font-bold text-[#344054] mb-1">
                    Marca Sugerida / Preferência Técnica (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formPeca.marcaSugerida}
                    onChange={(e) =>
                      setFormPeca((prev) => ({ ...prev, marcaSugerida: e.target.value }))
                    }
                    placeholder="Ex: Bosch, Nakata, Cofap, Fras-le, Original..."
                    className="w-full h-10 px-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] text-xs font-medium text-[#101828] focus:bg-white focus:outline-none focus:border-[#101828]"
                  />
                </div>
              </div>

              {/* Bloco 2: Valores Financeiros e Quantidade */}
              {formPeca.statusEstoque === 'em_estoque' ? (
                <div className="p-4 rounded-2xl bg-white border border-[#d0d5dd] shadow-xs">
                  <div className="flex items-center gap-1.5 mb-3">
                    <CurrencyDollar size={16} weight="bold" className="text-[#101828]" />
                    <span className="text-xs font-extrabold text-[#101828]">
                      Valores Financeiros e Quantidade
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 items-end">
                    {/* Preco Unitario */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#344054] mb-1">
                        Valor Unitário (R$)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-[#667085]">
                          R$
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formPeca.precoUnitario}
                          onChange={(e) =>
                            setFormPeca((prev) => ({ ...prev, precoUnitario: e.target.value }))
                          }
                          className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] font-mono text-xs font-bold text-[#101828] focus:bg-white focus:outline-none focus:border-[#101828]"
                        />
                      </div>
                    </div>

                    {/* Quantidade */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#344054] mb-1">
                        Quantidade
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={formPeca.quantidade}
                        onChange={(e) =>
                          setFormPeca((prev) => ({ ...prev, quantidade: e.target.value }))
                        }
                        className="w-full h-10 px-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] font-mono text-xs font-bold text-[#101828] focus:bg-white focus:outline-none focus:border-[#101828]"
                      />
                    </div>

                    {/* Desconto */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#344054] mb-1">
                        Desconto (R$)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-[#667085]">
                          R$
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formPeca.desconto}
                          onChange={(e) =>
                            setFormPeca((prev) => ({ ...prev, desconto: e.target.value }))
                          }
                          className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] font-mono text-xs font-bold text-[#101828] focus:bg-white focus:outline-none focus:border-[#101828]"
                        />
                      </div>
                    </div>

                    {/* Subtotal Calculado */}
                    <div className="p-2.5 rounded-xl bg-[#101828] text-white flex flex-col justify-center">
                      <span className="text-[10px] font-bold uppercase text-white/70 block leading-none">
                        Subtotal da Peça
                      </span>
                      <span className="text-base font-black font-mono text-[#38bdf8] mt-1 block">
                        R$ {subtotalPecaModal}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white border border-[#d0d5dd] shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f2f4f7]">
                    <div className="flex items-center gap-1.5">
                      <Package size={16} weight="bold" className="text-[#101828]" />
                      <span className="text-xs font-extrabold text-[#101828]">
                        Quantidade para Cotação Externa
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[#b54708] bg-[#fffaeb] px-2.5 py-0.5 rounded-full border border-[#fedf89]">
                      Preço informado na Cotação
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-center">
                    <div>
                      <label className="block text-[11px] font-bold text-[#344054] mb-1">
                        Quantidade Necessária *
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={formPeca.quantidade}
                        onChange={(e) =>
                          setFormPeca((prev) => ({ ...prev, quantidade: e.target.value }))
                        }
                        className="w-full h-10 px-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] font-mono text-xs font-bold text-[#101828] focus:bg-white focus:outline-none focus:border-[#101828]"
                      />
                    </div>

                    <div className="sm:col-span-2 p-3 rounded-xl bg-[#f0f9ff] border border-[#b9e6fe] text-xs text-[#0369a1] flex items-center gap-2.5">
                      <Storefront size={20} weight="bold" className="text-[#0284c7] shrink-0" />
                      <p className="text-[11px] font-medium leading-relaxed">
                        Esta peça será enviada para cotação externa. Não é necessário preencher preços agora. As auto peças parceiras informarão valores, marcas disponíveis e prazos de entrega diretamente no link de cotação.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bloco 3: Foto da Peca (Evidencia com a foto tirada pelo mecanico) */}
              <div className="p-4 rounded-2xl bg-white border border-[#d0d5dd] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Camera size={16} weight="bold" className="text-[#101828]" />
                    <span className="text-xs font-bold text-[#101828]">
                      Foto / Evidência da Peça
                    </span>
                  </div>
                  <span className="text-[10.5px] text-[#667085]">
                    Aparece na tela de cotação da auto peças parceira
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {formPeca.fotoUrl ? (
                    <div className="flex items-center gap-3">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#d0d5dd] shadow-2xs group shrink-0">
                        <img
                          src={formPeca.fotoUrl}
                          alt="Foto da peça"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFotoZoomUrl(formPeca.fotoUrl)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                          title="Ampliar foto"
                        >
                          <Eye size={18} weight="bold" />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-[#101828] block truncate max-w-xs">
                          {formPeca.fotoNome || 'Foto da peça anexada'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputPecaRef.current?.click()}
                            className="px-2.5 py-1 rounded-lg border border-[#d0d5dd] bg-[#f8fafc] text-xs font-bold text-[#344054] hover:bg-[#f2f4f7] cursor-pointer"
                          >
                            Substituir Foto
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoverFoto}
                            className="px-2.5 py-1 rounded-lg border border-[#fecdca] bg-[#fef3f2] text-xs font-bold text-[#b42318] hover:bg-[#fee4e2] cursor-pointer"
                          >
                            Remover Foto
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputPecaRef.current?.click()}
                        className="px-4 py-3 rounded-xl border border-dashed border-[#d0d5dd] hover:border-[#101828] bg-[#f8fafc] hover:bg-white text-[#344054] flex items-center gap-2 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Camera size={18} weight="bold" />
                        <span>Carregar Foto da Peça (Câmera ou Arquivo)</span>
                      </button>
                      <span className="text-[11px] text-[#667085] italic">
                        Fotos anexadas evitam o envio de peças incorretas pelas distribuidoras.
                      </span>
                    </div>
                  )}

                  <input
                    ref={fileInputPecaRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadFoto}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Bloco 4: Observacoes Tecnicas */}
              <div className="p-4 rounded-2xl bg-white border border-[#d0d5dd] shadow-xs">
                <label className="block text-[11px] font-bold text-[#344054] mb-1">
                  Observações Técnicas / Defeito Constatado
                </label>
                <textarea
                  rows={2}
                  value={formPeca.observacoes}
                  onChange={(e) =>
                    setFormPeca((prev) => ({ ...prev, observacoes: e.target.value }))
                  }
                  placeholder="Ex: Peça com folga axial acentuada, vazamento no retentor ou desgaste excessivo..."
                  className="w-full p-2.5 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] text-xs font-medium text-[#101828] focus:bg-white focus:outline-none focus:border-[#101828] resize-y min-h-[55px]"
                />
              </div>
            </div>

            {/* Rodape do Modal */}
            <div className="px-5 py-3.5 border-t border-[#f2f4f7] bg-white flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setModalPecaAberto(false)}
                className="px-4 py-2 rounded-xl border border-[#d0d5dd] bg-white text-xs font-bold text-[#344054] hover:bg-[#f8fafc] transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <FloppyDisk size={15} weight="bold" />
                <span>{editandoPecaId ? 'Atualizar Peça' : 'Salvar Peça na OS'}</span>
              </button>
            </div>

            {/* Borda Direita: Redimensionar Largura */}
            {!modalPecaMaximizada && (
              <div
                onMouseDown={(e) => handleIniciarRedimensionamentoPeca(e, 'direita')}
                className="absolute top-0 right-0 w-2 h-full cursor-e-resize hover:bg-[#0284c7]/20 transition-colors z-20"
                title="Arraste para ajustar a largura do formulário"
              />
            )}

            {/* Borda Inferior: Redimensionar Altura */}
            {!modalPecaMaximizada && (
              <div
                onMouseDown={(e) => handleIniciarRedimensionamentoPeca(e, 'baixo')}
                className="absolute bottom-0 left-0 w-full h-2 cursor-s-resize hover:bg-[#0284c7]/20 transition-colors z-20"
                title="Arraste para ajustar a altura do formulário"
              />
            )}

            {/* Grip de Redimensionamento no Canto Inferior Direito */}
            {!modalPecaMaximizada && (
              <div
                onMouseDown={(e) => handleIniciarRedimensionamentoPeca(e, 'canto')}
                className="absolute bottom-1 right-1 w-5 h-5 flex items-end justify-end p-0.5 cursor-se-resize text-[#98a2b3] hover:text-[#101828] select-none transition-colors z-30 group"
                title="Arraste para redimensionar o formulário"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="opacity-70 group-hover:opacity-100">
                  <circle cx="8.5" cy="8.5" r="1" />
                  <circle cx="5" cy="8.5" r="1" />
                  <circle cx="8.5" cy="5" r="1" />
                  <circle cx="1.5" cy="8.5" r="1" />
                  <circle cx="5" cy="5" r="1" />
                  <circle cx="8.5" cy="1.5" r="1" />
                </svg>
              </div>
            )}
          </form>
        </div>
      )}

      {/* MODAL 2: Enviar Cotacao para Auto Pecas Cadastradas */}
      {modalCotacaoAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 select-none">
          <div
            style={
              modalCotacaoMaximizada
                ? { width: '99vw', height: '98vh', transform: 'none' }
                : {
                    width: `${tamanhoModalCotacao.largura}px`,
                    maxWidth: '98vw',
                    height: `${tamanhoModalCotacao.altura}px`,
                    maxHeight: '96vh',
                    minWidth: '360px',
                    minHeight: '380px',
                    transform: `translate(${tamanhoModalCotacao.posicaoX || 0}px, ${tamanhoModalCotacao.posicaoY || 0}px)`,
                  }
            }
            className={`relative bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl flex flex-col overflow-hidden ${
              estaRedimensionandoCotacao || estaArrastandoCotacao
                ? 'transition-none select-none'
                : 'transition-[width,height] duration-150 select-auto'
            }`}
          >
            {/* Header do Modal com Logo da Oficina */}
            <div
              onMouseDown={handleIniciarArrastoHeaderCotacao}
              onDoubleClick={() => setModalCotacaoMaximizada(!modalCotacaoMaximizada)}
              className={`px-5 py-3.5 border-b border-[#f2f4f7] flex items-center justify-between shrink-0 bg-white select-none ${
                modalCotacaoMaximizada ? 'cursor-default' : estaArrastandoCotacao ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              title={
                modalCotacaoMaximizada
                  ? 'Dê um duplo clique no cabeçalho para restaurar'
                  : 'Clique e arraste pelo cabeçalho para mover • Duplo clique para maximizar'
              }
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src="/favicon-96x96.png"
                  alt="Mecânica Gabriel"
                  className="w-9 h-9 object-contain rounded-xl border border-[#d0d5dd] shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-[#101828]">
                      Enviar Cotação para Auto Peças
                    </h3>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd]">
                      #{cotacaoAtivaId}
                    </span>
                    {!modalCotacaoMaximizada && (
                      <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold text-[#667085] bg-[#f8fafc] px-1.5 py-0.5 rounded-md border border-[#eaecf0]">
                        <ArrowsOutCardinal size={10} weight="bold" />
                        Mover
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#667085] mt-0.5 truncate">
                    Mecânica Gabriel • Envio com fotos das peças e dados do veículo
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Botão de Restaurar Tamanho e Posição Padrão se foi redimensionado ou movido */}
                {(tamanhoModalCotacao.largura !== LARGURA_PADRAO_MODAL ||
                  tamanhoModalCotacao.altura !== ALTURA_PADRAO_MODAL ||
                  Boolean(tamanhoModalCotacao.posicaoX) ||
                  Boolean(tamanhoModalCotacao.posicaoY)) &&
                  !modalCotacaoMaximizada && (
                    <button
                      type="button"
                      onClick={handleRestaurarPadraoCotacao}
                      className="h-8.5 px-2.5 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-[#344054] flex items-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Restaurar tamanho e posição padrão da cotação"
                    >
                      <ArrowsClockwise size={13} weight="bold" />
                      <span className="hidden sm:inline">Tamanho Padrão</span>
                    </button>
                  )}

                <button
                  type="button"
                  onClick={() => setModalCotacaoMaximizada(!modalCotacaoMaximizada)}
                  className="h-8.5 w-8.5 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-[#101828] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  title={modalCotacaoMaximizada ? 'Restaurar tamanho' : 'Maximizar formulário'}
                >
                  {modalCotacaoMaximizada ? (
                    <ArrowsInSimple size={16} weight="bold" />
                  ) : (
                    <ArrowsOutSimple size={16} weight="bold" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setModalCotacaoAberto(false)}
                  className="h-8.5 w-8.5 rounded-xl text-[#667085] hover:text-[#101828] hover:bg-[#f2f4f7] flex items-center justify-center transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
            </div>

            {/* Conteudo do Modal de Cotacao */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-xs min-h-0 bg-[#eaecf0]/40">
              {/* Alerta de Sucesso caso ja tenha sido disparada */}
              {cotacaoEnviadaSucesso && (
                <div className="p-3.5 rounded-2xl bg-[#e0f2fe] border border-[#bae6fd] flex items-center gap-2.5 text-xs text-[#0369a1] shadow-xs">
                  <CheckCircle size={20} weight="fill" className="text-[#0284c7] shrink-0" />
                  <span className="font-bold">
                    Cotação registrada com sucesso! O link oficial já está ativo para as auto peças.
                  </span>
                </div>
              )}

              {/* Identificacao do Veiculo (Fundamental para a Auto Peca nao errar) */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                    Veículo Solicitante da Cotação
                  </span>
                  <span className="text-sm font-extrabold text-[#101828] block mt-0.5">
                    {marcaModelo || 'Veículo não informado'}
                  </span>
                  <span className="text-[11px] text-[#475467] block mt-0.5">
                    Ano: {ano || '-'} • Cor: {cor || '-'} • KM: {km ? `${km} km` : 'Não informado'}
                  </span>
                </div>

                {placa && (
                  <div className="flex flex-col items-center bg-white border-2 border-[#101828] rounded-xl px-3 py-1 shadow-xs shrink-0">
                    <span className="text-[7.5px] font-black uppercase tracking-widest text-[#101828] leading-none">
                      BRASIL
                    </span>
                    <span className="font-mono font-black text-base text-[#101828] tracking-wider leading-none mt-0.5">
                      {placa}
                    </span>
                  </div>
                )}
              </div>

              {/* Bloco 1: Selecao de Pecas para Enviar na Cotacao */}
              <div className="p-4 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#f2f4f7]">
                  <div className="flex items-center gap-2">
                    <Package size={16} weight="bold" className="text-[#101828]" />
                    <span className="text-xs font-extrabold text-[#101828]">
                      1. Peças Solicitadas para Cotação
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#0284c7] bg-[#e0f2fe] px-2 py-0.5 rounded-full border border-[#bae6fd]">
                    {itensCotacaoSelecionados.length} selecionadas
                  </span>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {pecasOS.map((item) => {
                    const selecionado = pecasSelecionadasCotacao.includes(item.id)
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleTogglePecaCotacao(item.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          selecionado
                            ? 'bg-[#f8fafc] border-[#101828] shadow-2xs'
                            : 'bg-white border-[#e4e7ec] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            className="text-[#101828] cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTogglePecaCotacao(item.id)
                            }}
                          >
                            {selecionado ? (
                              <CheckSquare size={18} weight="fill" className="text-[#101828]" />
                            ) : (
                              <Square size={18} weight="regular" className="text-[#98a2b3]" />
                            )}
                          </button>

                          {item.fotoUrl ? (
                            <img
                              src={item.fotoUrl}
                              alt={item.nome}
                              className="w-10 h-10 rounded-lg object-cover border border-[#d0d5dd] shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#f2f4f7] border border-[#d0d5dd] flex items-center justify-center text-[#98a2b3] shrink-0">
                              <Camera size={16} />
                            </div>
                          )}

                          <div className="min-w-0">
                            <span className="font-extrabold text-xs text-[#101828] block truncate">
                              {item.nome}
                            </span>
                            <span className="text-[10.5px] text-[#667085] block mt-0.5">
                              {item.codigo} • Qtd: {item.quantidade || 1}
                              {item.marcaSugerida && ` • Marca: ${item.marcaSugerida}`}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                            item.statusEstoque === 'em_estoque'
                              ? 'bg-[#e0f2fe] text-[#0284c7] border-[#bae6fd]'
                              : 'bg-[#fffaeb] text-[#b54708] border-[#fedf89]'
                          }`}
                        >
                          {item.statusEstoque === 'em_estoque' ? 'Em Estoque' : 'Para Cotação'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Bloco 2: Selecao de Auto Pecas Parceiras Cadastradas */}
              <div className="p-4 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#f2f4f7]">
                  <div className="flex items-center gap-2">
                    <Storefront size={16} weight="bold" className="text-[#101828]" />
                    <span className="text-xs font-extrabold text-[#101828]">
                      2. Selecione as Auto Peças Cadastradas para Envio
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#344054] bg-[#f2f4f7] px-2 py-0.5 rounded-full border border-[#e4e7ec]">
                    {fornecedoresSelecionados.length} fornecedores selecionados
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AUTO_PECAS_FORNECEDORES.map((fornecedor) => {
                    const selecionado = fornecedoresSelecionados.includes(fornecedor.id)
                    return (
                      <div
                        key={fornecedor.id}
                        onClick={() => handleToggleFornecedorCotacao(fornecedor.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                          selecionado
                            ? 'bg-[#f8fafc] border-[#101828] shadow-2xs'
                            : 'bg-white border-[#e4e7ec] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            className="text-[#101828] cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleFornecedorCotacao(fornecedor.id)
                            }}
                          >
                            {selecionado ? (
                              <CheckSquare size={18} weight="fill" className="text-[#101828]" />
                            ) : (
                              <Square size={18} weight="regular" className="text-[#98a2b3]" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <span className="font-extrabold text-xs text-[#101828] block truncate">
                              {fornecedor.nome}
                            </span>
                            <span className="text-[10.5px] text-[#667085] block truncate mt-0.5">
                              {fornecedor.especialidade}
                            </span>
                            <span className="text-[10px] text-[#0284c7] font-semibold block mt-0.5">
                              Entrega: {fornecedor.tempoMedioEntrega}
                            </span>
                          </div>
                        </div>

                        {/* Botao de Disparo Direto via WhatsApp */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDispararWhatsAppFornecedor(fornecedor)
                          }}
                          className="h-8 px-2.5 rounded-lg bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-[11px] flex items-center gap-1 transition-all shadow-2xs cursor-pointer shrink-0 active:scale-95"
                          title="Enviar link da cotação diretamente via WhatsApp"
                        >
                          <WhatsappLogo size={15} weight="fill" />
                          <span>Cotar</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Bloco 3: Link Exclusivo da Cotacao da Auto Peca */}
              <div className="p-4 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShareNetwork size={16} weight="bold" className="text-[#101828]" />
                    <span className="text-xs font-extrabold text-[#101828]">
                      3. Link Oficial da Cotação para a Auto Peça (Mobile e Desktop)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#667085]">
                    Público e Responsivo
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={urlCotacaoPublica}
                    className="flex-1 h-9 px-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] font-mono text-[11.5px] text-[#344054] select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopiarLinkCotacao}
                    className="h-9 px-3 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f8fafc] text-xs font-bold text-[#101828] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                  >
                    {copiadoLinkCotacao ? (
                      <>
                        <Check size={14} weight="bold" className="text-[#0284c7]" />
                        <span className="text-[#0284c7]">Copiado!</span>
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
                    className="h-9 px-3 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                    title="Abre a tela que o vendedor da auto peças vai ver e responder"
                  >
                    <ArrowSquareOut size={14} weight="bold" />
                    <span>Visualizar Tela da Auto Peça</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Rodape do Modal */}
            <div className="px-5 py-3.5 border-t border-[#f2f4f7] bg-white flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setModalCotacaoAberto(false)}
                className="px-4 py-2 rounded-xl border border-[#d0d5dd] bg-white text-xs font-bold text-[#344054] hover:bg-[#f8fafc] transition-colors cursor-pointer"
              >
                Fechar
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSalvarEEnviarCotacao(false)}
                  className="px-4 py-2 rounded-xl bg-[#101828] hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <FloppyDisk size={15} weight="bold" />
                  <span>Salvar Registro de Envio</span>
                </button>
              </div>
            </div>

            {/* Borda Direita: Redimensionar Largura */}
            {!modalCotacaoMaximizada && (
              <div
                onMouseDown={(e) => handleIniciarRedimensionamentoCotacao(e, 'direita')}
                className="absolute top-0 right-0 w-2 h-full cursor-e-resize hover:bg-[#0284c7]/20 transition-colors z-20"
                title="Arraste para ajustar a largura da cotação"
              />
            )}

            {/* Borda Inferior: Redimensionar Altura */}
            {!modalCotacaoMaximizada && (
              <div
                onMouseDown={(e) => handleIniciarRedimensionamentoCotacao(e, 'baixo')}
                className="absolute bottom-0 left-0 w-full h-2 cursor-s-resize hover:bg-[#0284c7]/20 transition-colors z-20"
                title="Arraste para ajustar a altura da cotação"
              />
            )}

            {/* Grip de Redimensionamento no Canto Inferior Direito */}
            {!modalCotacaoMaximizada && (
              <div
                onMouseDown={(e) => handleIniciarRedimensionamentoCotacao(e, 'canto')}
                className="absolute bottom-1 right-1 w-5 h-5 flex items-end justify-end p-0.5 cursor-se-resize text-[#98a2b3] hover:text-[#101828] select-none transition-colors z-30 group"
                title="Arraste para redimensionar o formulário de cotação"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="opacity-70 group-hover:opacity-100">
                  <circle cx="8.5" cy="8.5" r="1" />
                  <circle cx="5" cy="8.5" r="1" />
                  <circle cx="8.5" cy="5" r="1" />
                  <circle cx="1.5" cy="8.5" r="1" />
                  <circle cx="5" cy="5" r="1" />
                  <circle cx="8.5" cy="1.5" r="1" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Zoom de Foto da Peca */}
      {fotoZoomUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setFotoZoomUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-3 right-3 z-10">
              <button
                type="button"
                onClick={() => setFotoZoomUrl(null)}
                className="w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            <img
              src={fotoZoomUrl}
              alt="Ampliação da peça"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* MODAL 4: Dados do Veiculo, Cliente e Queixa (Identico a TabServicos) */}
      {modalDadosAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#f2f4f7] flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#101828] text-white flex items-center justify-center font-bold text-xs">
                  <Car size={16} weight="bold" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#101828]">
                    Dados do Veículo, Cliente e Queixa
                  </h3>
                  <p className="text-[11px] text-[#667085]">
                    Informações registradas na recepção da oficina
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalDadosAberto(false)}
                className="p-1.5 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#f2f4f7] transition-colors cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3 text-xs min-h-0">
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] flex items-center justify-between gap-3">
                <div>
                  <span className="text-[9.5px] uppercase font-bold text-[#667085] block">
                    Modelo e Ano
                  </span>
                  <span className="text-sm font-extrabold text-[#101828] block">
                    {marcaModelo || 'Modelo não informado'}
                  </span>
                  <span className="text-[11px] text-[#475467] block mt-0.5">
                    Ano: {ano || '-'} • Cor: {cor || '-'} • KM: {km ? `${km} km` : 'Não informado'}
                  </span>
                </div>

                {placa && (
                  <div className="flex flex-col items-center bg-white border border-[#101828] rounded-lg px-2.5 py-1 shadow-2xs shrink-0">
                    <span className="text-[7px] font-black uppercase tracking-widest text-[#101828] leading-none">
                      BRASIL
                    </span>
                    <span className="font-mono font-black text-sm text-[#101828] tracking-wider leading-none mt-0.5">
                      {placa}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[9.5px] uppercase font-bold text-[#667085] block">
                    Cliente / Titular
                  </span>
                  <span className="text-xs font-extrabold text-[#101828] block truncate">
                    {cliente || 'Não identificado'}
                  </span>
                  {documento && (
                    <span className="text-[11px] text-[#667085] block mt-0.5">
                      CPF / CNPJ: {documento}
                    </span>
                  )}
                </div>

                {telefone && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-[#475467]">{telefone}</span>
                    <a
                      href={`https://wa.me/55${telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-lg bg-[#25D366] hover:bg-[#1da851] text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="WhatsApp"
                    >
                      <WhatsappLogo size={16} weight="fill" />
                    </a>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#d0d5dd]">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#475467] mb-1.5">
                  <ChatText size={14} weight="bold" />
                  <span>Relato da Queixa Informada pelo Cliente:</span>
                </div>
                {relatoCliente ? (
                  <p className="text-xs font-medium text-[#101828] whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-[#e4e7ec]">
                    {relatoCliente}
                  </p>
                ) : (
                  <p className="text-xs text-[#667085] italic">
                    Nenhum relato específico registrado na recepção.
                  </p>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#f2f4f7] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setModalDadosAberto(false)}
                className="px-4 py-1.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Laudo Tecnico do Diagnostico (Identico a TabServicos) */}
      {modalLaudoAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 select-none">
          <div
            style={
              modalLaudoMaximizada
                ? { width: '99vw', height: '98vh', transform: 'none' }
                : {
                    width: `${tamanhoModalLaudo.largura}px`,
                    maxWidth: '98vw',
                    height: `${tamanhoModalLaudo.altura}px`,
                    maxHeight: '96vh',
                    minWidth: '480px',
                    minHeight: '380px',
                    transform: `translate(${tamanhoModalLaudo.posicaoX || 0}px, ${tamanhoModalLaudo.posicaoY || 0}px)`,
                  }
            }
            className={`relative bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl flex flex-col overflow-hidden ${
              estaRedimensionandoLaudo || estaArrastandoLaudo
                ? 'transition-none select-none'
                : 'transition-[width,height] duration-150 select-auto'
            }`}
          >
            <div
              onMouseDown={handleIniciarArrastoHeaderLaudo}
              onDoubleClick={() => setModalLaudoMaximizada(!modalLaudoMaximizada)}
              className={`px-5 py-3.5 border-b border-[#f2f4f7] flex items-center justify-between shrink-0 bg-white select-none ${
                modalLaudoMaximizada ? 'cursor-default' : estaArrastandoLaudo ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              title={
                modalLaudoMaximizada
                  ? 'Dê um duplo clique no cabeçalho para restaurar'
                  : 'Clique e arraste pelo cabeçalho para mover • Duplo clique para maximizar'
              }
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-black text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <Sparkle size={20} weight="fill" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-[#101828] leading-none">
                      Laudo Técnico de Diagnóstico
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd] shrink-0">
                      Documento Oficial
                    </span>
                    {!modalLaudoMaximizada && (
                      <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold text-[#667085] bg-[#f8fafc] px-1.5 py-0.5 rounded-md border border-[#eaecf0]">
                        <ArrowsOutCardinal size={10} weight="bold" />
                        Mover
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#667085] mt-0.5 truncate">
                    Compilação técnica das peças apontadas, evidências fotográficas e serviços a executar
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Botão de Restaurar Tamanho e Posição Padrão se foi redimensionado ou movido */}
                {(tamanhoModalLaudo.largura !== LARGURA_PADRAO_LAUDO ||
                  tamanhoModalLaudo.altura !== ALTURA_PADRAO_LAUDO ||
                  Boolean(tamanhoModalLaudo.posicaoX) ||
                  Boolean(tamanhoModalLaudo.posicaoY)) &&
                  !modalLaudoMaximizada && (
                    <button
                      type="button"
                      onClick={handleRestaurarPadraoLaudo}
                      className="h-8.5 px-2.5 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-[#344054] flex items-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Restaurar tamanho e posição padrão do laudo"
                    >
                      <ArrowsClockwise size={13} weight="bold" />
                      <span className="hidden sm:inline">Tamanho Padrão</span>
                    </button>
                  )}
                <button
                  type="button"
                  onClick={handleCopiarLaudo}
                  className="h-8.5 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-xs font-bold text-[#101828] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Copiar texto completo do laudo para a área de transferência"
                >
                  {copiadoLaudo ? (
                    <>
                      <Check size={14} weight="bold" className="text-[#0284c7]" />
                      <span className="text-[#0284c7]">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} weight="bold" />
                      <span className="hidden sm:inline">Copiar Texto</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGerarLaudo}
                  className="h-8.5 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-xs font-bold text-[#101828] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Regenerar laudo a partir das peças e serviços atuais"
                >
                  <ArrowsClockwise size={14} weight="bold" />
                  <span className="hidden sm:inline">Regenerar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalLaudoMaximizada(!modalLaudoMaximizada)}
                  className="h-8.5 w-8.5 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-[#101828] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  title={modalLaudoMaximizada ? 'Restaurar tamanho' : 'Maximizar tela cheia'}
                >
                  {modalLaudoMaximizada ? (
                    <ArrowsInSimple size={16} weight="bold" />
                  ) : (
                    <ArrowsOutSimple size={16} weight="bold" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setModalLaudoAberto(false)}
                  className="h-8.5 w-8.5 rounded-xl text-[#667085] hover:text-[#101828] hover:bg-[#f2f4f7] flex items-center justify-center transition-colors cursor-pointer"
                  title="Fechar visualização"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-4 sm:p-5 overflow-hidden bg-[#eaecf0]">
              <div className="lg:col-span-4 h-full flex flex-col gap-3 overflow-y-auto no-scrollbar min-h-0">
                <div className="p-3.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex flex-col gap-2 shrink-0">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f2f4f7]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                      Dados da Ordem de Serviço
                    </span>
                    {placa ? (
                      <div className="flex flex-col items-center bg-white border border-[#101828] rounded-md px-2 py-0.5 shadow-2xs">
                        <span className="text-[6.5px] font-black uppercase tracking-widest text-[#101828] leading-none">
                          BRASIL
                        </span>
                        <span className="font-mono font-black text-[11px] text-[#101828] tracking-wider leading-none mt-0.5">
                          {placa}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#b42318] font-bold">Sem placa</span>
                    )}
                  </div>

                  <div className="text-xs space-y-1">
                    <div>
                      <span className="text-[9.5px] font-bold uppercase text-[#667085] block">
                        Veículo:
                      </span>
                      <span className="font-bold text-[#101828]">
                        {marcaModelo || 'Modelo não informado'}
                      </span>
                      <span className="text-[11px] text-[#475467] block">
                        Ano {ano || '-'} • Cor {cor || '-'} • KM: {km ? `${km} km` : 'Não informado'}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-[#f2f4f7]">
                      <span className="text-[9.5px] font-bold uppercase text-[#667085] block">
                        Cliente / Titular:
                      </span>
                      <span className="font-bold text-[#101828]">
                        {cliente || 'Não identificado'}
                      </span>
                      {telefone && (
                        <span className="text-[11px] text-[#475467] block">
                          Tel: {telefone}
                        </span>
                      )}
                    </div>

                    <div className="pt-1.5 border-t border-[#f2f4f7]">
                      <span className="text-[9.5px] font-bold uppercase text-[#667085] block">
                        Mecânico Responsável:
                      </span>
                      <span className="font-bold text-[#101828]">
                        {mecanicoNome || 'Não designado'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex flex-col gap-2 shrink-0">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f2f4f7]">
                    <div className="flex items-center gap-1.5">
                      <Camera size={15} weight="bold" className="text-[#101828]" />
                      <span className="text-xs font-bold text-[#101828]">
                        Evidências das Peças
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f8fafc] text-[#344054] border border-[#d0d5dd]">
                      {pecasDiagnostico.length} {pecasDiagnostico.length === 1 ? 'peça' : 'peças'}
                    </span>
                  </div>

                  {pecasDiagnostico.length === 0 ? (
                    <p className="text-xs text-[#667085] italic py-1">
                      Nenhuma peça cadastrada.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {pecasDiagnostico.map((peca, idx) => (
                        <div
                          key={peca.id || idx}
                          className="p-2 rounded-xl bg-[#f8fafc] border border-[#e4e7ec] flex items-center gap-2.5"
                        >
                          {peca.fotoUrl ? (
                            <button
                              type="button"
                              onClick={() => setFotoZoomUrl(peca.fotoUrl)}
                              className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#d0d5dd] shrink-0 group cursor-pointer shadow-2xs block"
                              title="Clique para ampliar foto"
                            >
                              <img
                                src={peca.fotoUrl}
                                alt={peca.nome}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Eye size={16} weight="bold" />
                              </div>
                            </button>
                          ) : (
                            <div className="w-12 h-12 rounded-lg border border-dashed border-[#d0d5dd] bg-white flex flex-col items-center justify-center text-[#98a2b3] shrink-0">
                              <Camera size={16} weight="regular" />
                              <span className="text-[7.5px] uppercase font-bold mt-0.5">Sem foto</span>
                            </div>
                          )}

                          <div className="min-w-0 flex-1 text-xs">
                            <span className="font-bold text-[#101828] block truncate leading-tight">
                              {peca.nome}
                            </span>
                            <span className="text-[10.5px] text-[#667085] block mt-0.5">
                              Qtd: {peca.quantidade || 1}
                              {peca.observacao && ` • ${peca.observacao}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex flex-col gap-2 shrink-0">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f2f4f7]">
                    <div className="flex items-center gap-1.5">
                      <Wrench size={15} weight="bold" className="text-[#101828]" />
                      <span className="text-xs font-bold text-[#101828]">
                        Serviços Solicitados
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f8fafc] text-[#344054] border border-[#d0d5dd]">
                      {servicosDiagnostico.length} {servicosDiagnostico.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  {servicosDiagnostico.length === 0 ? (
                    <p className="text-xs text-[#667085] italic py-1">
                      Nenhum serviço selecionado.
                    </p>
                  ) : (
                    <ul className="space-y-1.5 text-xs">
                      {servicosDiagnostico.map((servico, idx) => (
                        <li
                          key={servico.id || idx}
                          className="flex items-start gap-2 p-1.5 rounded-lg bg-[#f8fafc] border border-[#e4e7ec]"
                        >
                          <span className="w-5 h-5 rounded-md bg-white border border-[#d0d5dd] text-[#101828] font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-[#101828] leading-snug">
                            {servico.nome}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="lg:col-span-8 h-full flex flex-col bg-white rounded-2xl border border-[#d0d5dd] shadow-sm overflow-hidden min-h-0">
                <div className="px-4 py-3 border-b border-[#f2f4f7] bg-[#fcfcfd] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <FileText size={16} weight="bold" className="text-[#101828]" />
                    <span className="text-xs font-extrabold text-[#101828]">
                      Corpo Oficial do Laudo Técnico
                    </span>
                  </div>
                  <span className="text-[10.5px] text-[#667085] font-medium">
                    Edição livre e direta
                  </span>
                </div>

                <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0 bg-white">
                  <textarea
                    value={laudoTecnico}
                    onChange={(e) => updateFormData({ laudoTecnico: e.target.value })}
                    placeholder="O laudo técnico ainda não foi gerado. Clique em 'Regenerar' no canto superior direito para compilar os dados automaticamente."
                    className="w-full flex-1 p-4 rounded-xl border border-[#d0d5dd] font-mono text-xs sm:text-[12.5px] leading-relaxed text-[#101828] bg-[#fcfcfd] focus:bg-white focus:outline-none focus:border-[#101828] resize-none overflow-y-auto"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#f2f4f7] bg-white flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#667085]">
                As alterações realizadas no laudo técnico são salvas automaticamente na OS.
              </span>
              <button
                type="button"
                onClick={() => setModalLaudoAberto(false)}
                className="px-4 py-1.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
              >
                Concluir Visualização
              </button>
            </div>

            {/* Borda Direita: Redimensionar Largura */}
            {!modalLaudoMaximizada && (
              <div
                onMouseDown={(e) => handleIniciarRedimensionamentoLaudo(e, 'direita')}
                className="absolute top-0 right-0 w-2 h-full cursor-e-resize hover:bg-[#0284c7]/20 transition-colors z-20"
                title="Arraste para ajustar a largura do laudo"
              />
            )}

            {/* Borda Inferior: Redimensionar Altura */}
            {!modalLaudoMaximizada && (
              <div
                onMouseDown={(e) => handleIniciarRedimensionamentoLaudo(e, 'baixo')}
                className="absolute bottom-0 left-0 w-full h-2 cursor-s-resize hover:bg-[#0284c7]/20 transition-colors z-20"
                title="Arraste para ajustar a altura do laudo"
              />
            )}

            {/* Grip de Redimensionamento no Canto Inferior Direito */}
            {!modalLaudoMaximizada && (
              <div
                onMouseDown={(e) => handleIniciarRedimensionamentoLaudo(e, 'canto')}
                className="absolute bottom-1 right-1 w-5 h-5 flex items-end justify-end p-0.5 cursor-se-resize text-[#98a2b3] hover:text-[#101828] select-none transition-colors z-30 group"
                title="Arraste para redimensionar o formulário do laudo"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="opacity-70 group-hover:opacity-100">
                  <circle cx="8.5" cy="8.5" r="1" />
                  <circle cx="5" cy="8.5" r="1" />
                  <circle cx="8.5" cy="5" r="1" />
                  <circle cx="1.5" cy="8.5" r="1" />
                  <circle cx="5" cy="5" r="1" />
                  <circle cx="8.5" cy="1.5" r="1" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
