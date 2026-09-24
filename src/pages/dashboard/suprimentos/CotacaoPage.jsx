import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Select from 'react-select'
import {
  ArrowLeft,
  ShareNetwork,
  FloppyDisk,
  Plus,
  Trash,
  Buildings,
  Package,
  CalendarBlank,
  CreditCard,
  User,
  FileText,
  WarningCircle,
  Clock,
  Car,
  CheckCircle,
  Copy,
  WhatsappLogo,
  ArrowSquareOut,
  CurrencyDollar,
  ListBullets,
  PencilSimple,
  CaretDown,
  CaretUp,
  Tag,
  ShieldCheck,
  ShoppingCart,
  Eye,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalConfirmacao } from '../../../components/ModalConfirmacao'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'
import {
  carregarPecasCadastradas,
  carregarTerceirosCadastrados,
} from '../../../constants/cadastrosSuprimentosData'
import {
  carregarCotacoes,
  salvarCotacao,
  gerarProximoNumeroCotacao,
  aprovarCotacaoEGerarPedido,
  excluirCotacao,
} from '../../../constants/comprasData'
import { obterOrdensAbertas, atualizarPecasAposCotacao } from '../../../pages/dashboard/orcamento/mockOrdensAbertas'
import { CompraModalForm } from '../../../components/suprimentos/CompraModalForm'
import { VisualizarCotacaoModal } from '../../../components/suprimentos/VisualizarCotacaoModal'

// Helpers seguros de contatos e autopeças (Regra 5: sem & em labels)
const extrairTelefoneLimpo = (t) => {
  if (!t) return '43998544106'
  const tel = t.whatsapp || t.contatoTelefone || t.telefone || t.contato?.telefone || ''
  const limpo = String(tel).replace(/\D/g, '')
  return limpo.length >= 8 ? limpo : '43998544106'
}

const extrairTelefoneExibicao = (t) => {
  if (!t) return ''
  return String(t.telefone || t.contatoTelefone || t.contato?.telefone || '')
}

const filtrarFornecedoresAutoPecas = (terceiros) => {
  if (!Array.isArray(terceiros)) return []
  return terceiros.filter((t) => {
    const cat = String(t.categoria || t.categoriaFornecedor || '').toLowerCase()
    const ramo = String(t.ramoAtividade || t.tipoServico || '').toLowerCase()
    return (
      cat.includes('auto') ||
      cat.includes('peça') ||
      cat.includes('peca') ||
      cat.includes('distribuidora') ||
      ramo.includes('auto') ||
      ramo.includes('peça') ||
      ramo.includes('peca') ||
      ramo.includes('distribuidora')
    )
  })
}

export function CotacaoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'

  // Dados sincronizados
  const [pecasCatalogo, setPecasCatalogo] = useState([])
  const [fornecedoresCadastrados, setFornecedoresCadastrados] = useState([])
  const [ordensAbertas, setOrdensAbertas] = useState([])

  // Modal para conclusão do pedido de compra quando aprovado
  const [modalCompraAberto, setModalCompraAberto] = useState(false)
  const [dadosPedidoParaGerar, setDadosPedidoParaGerar] = useState(null)

  // Modal para pré-visualização da página pública de cotação
  const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false)
  const [confirmandoExclusaoCotacao, setConfirmandoExclusaoCotacao] = useState(false)

  // Estado da cotação
  const [idCotacao, setIdCotacao] = useState('')
  const [numeroOS, setNumeroOS] = useState('')
  const [clienteNome, setClienteNome] = useState('')
  const [clienteTelefone, setClienteTelefone] = useState('')
  const [veiculoPlaca, setVeiculoPlaca] = useState('')
  const [veiculoModelo, setVeiculoModelo] = useState('')
  const [ano, setAno] = useState('')
  const [km, setKm] = useState('')
  const [mecanicoNome, setMecanicoNome] = useState('')
  const [status, setStatus] = useState('EM_COTACAO')
  const [observacoes, setObservacoes] = useState('')
  const [dataCriacao, setDataCriacao] = useState('')

  // Lista de peças que estão em cotação
  const [itens, setItens] = useState([])

  // Lista de fornecedores cotados
  const [fornecedoresCotados, setFornecedoresCotados] = useState([])

  // Fornecedor vencedor selecionado
  const [fornecedorVencedorId, setFornecedorVencedorId] = useState(null)

  // Controle de expansão de preços por fornecedor
  const [fornecedorExpandidoId, setFornecedorExpandidoId] = useState(null)

  // Adição rápida de peça
  const [mostrarNovoItem, setMostrarNovoItem] = useState(false)
  const [novoItemCodigo, setNovoItemCodigo] = useState('')
  const [novoItemNome, setNovoItemNome] = useState('')
  const [novoItemQuantidade, setNovoItemQuantidade] = useState(1)
  const [novoItemUnidade, setNovoItemUnidade] = useState('UN')
  const [novoItemMarcaSugerida, setNovoItemMarcaSugerida] = useState('')
  const [novoItemObservacoes, setNovoItemObservacoes] = useState('')

  // Fornecedor a ser adicionado
  const [fornecedorSelecionadoParaAdicionar, setFornecedorSelecionadoParaAdicionar] = useState(null)

  // Carregamento da cotação e dados de referência
  useEffect(() => {
    const pecas = carregarPecasCadastradas()
    const terceiros = carregarTerceirosCadastrados()
    const ordens = obterOrdensAbertas()
    const todasCotacoes = carregarCotacoes()

    setPecasCatalogo(pecas)
    setFornecedoresCadastrados(terceiros)
    setOrdensAbertas(ordens)

    // 1. Verifica se foi passada cotação pronta no navigation state
    let encontrada = location.state?.cotacao

    // 2. Se não veio no state, busca pelo id nas cotações salvas
    if (!encontrada && id && id !== 'nova') {
      encontrada = todasCotacoes.find((c) => String(c.id) === String(id))
      if (!encontrada) {
        try {
          const raw = localStorage.getItem('dev_oficina_cotacoes_pecas')
          if (raw) {
            const list = JSON.parse(raw)
            encontrada = list.find((c) => String(c.id) === String(id))
          }
        } catch {}
      }
    }

    if (encontrada) {
      setIdCotacao(encontrada.id)
      setNumeroOS(encontrada.numeroOS || '')
      setClienteNome(encontrada.clienteNome || '')
      setClienteTelefone(encontrada.clienteTelefone || '')
      setVeiculoPlaca(encontrada.veiculoPlaca || '')
      setVeiculoModelo(encontrada.veiculoModelo || '')
      setAno(encontrada.ano || '')
      setKm(encontrada.km || '')
      setMecanicoNome(encontrada.mecanicoNome || '')
      setStatus(encontrada.status || 'EM_COTACAO')
      setObservacoes(encontrada.observacoes || '')
      setDataCriacao(encontrada.dataCriacao || new Date().toISOString())
      setItens(encontrada.itens && Array.isArray(encontrada.itens) ? encontrada.itens : [])
      setFornecedoresCotados(
        encontrada.fornecedoresCotados && Array.isArray(encontrada.fornecedoresCotados)
          ? encontrada.fornecedoresCotados
          : criarFornecedoresIniciaisPadrao(terceiros)
      )
      setFornecedorVencedorId(encontrada.fornecedorVencedorId || null)
      return
    }

    // Caso seja nova cotação ou não encontrada
    const queryParams = new URLSearchParams(location.search)
    const osParam = queryParams.get('os') || ''
    const itemParam = queryParams.get('item') || ''
    const nomeParam = queryParams.get('nome') || ''

    const novoId = (id && id !== 'nova') ? id : gerarProximoNumeroCotacao()
    setIdCotacao(novoId)
    setDataCriacao(new Date().toISOString())
    setStatus('EM_COTACAO')

    if (osParam) {
      const osEncontrada = ordens.find((o) => String(o.numeroOS) === String(osParam))
      if (osEncontrada) {
        setNumeroOS(String(osEncontrada.numeroOS))
        setClienteNome(osEncontrada.cliente || '')
        setClienteTelefone(osEncontrada.telefone || '')
        setVeiculoPlaca(osEncontrada.placa || '')
        setVeiculoModelo(
          osEncontrada.marcaModelo || `${osEncontrada.marca || ''} ${osEncontrada.modelo || ''}`.trim()
        )
        setAno(osEncontrada.ano || '')
        setKm(osEncontrada.km || '')
        setMecanicoNome(osEncontrada.mecanicoNome || '')
        setObservacoes(`Cotação de peças para a Ordem de Serviço #${osEncontrada.numeroOS}`)

        if (osEncontrada.pecasOS && osEncontrada.pecasOS.length > 0) {
          setItens(
            osEncontrada.pecasOS.map((p, idx) => ({
              id: `it-${Date.now()}-${idx}`,
              codigo: p.codigo || '',
              nome: p.nome,
              unidade: p.unidade || 'UN',
              quantidade: Number(p.quantidade || 1),
              marcaSugerida: p.marca || '',
              observacoes: '',
              fotoUrl: '',
            }))
          )
        } else if (nomeParam) {
          setItens([
            {
              id: `it-${Date.now()}-1`,
              codigo: itemParam !== 'SEM CODIGO' ? itemParam : '',
              nome: nomeParam,
              unidade: 'UN',
              quantidade: 1,
              marcaSugerida: '',
              observacoes: '',
              fotoUrl: '',
            },
          ])
        }
      }
    } else {
      setNumeroOS('')
      setClienteNome('')
      setClienteTelefone('')
      setVeiculoPlaca('')
      setVeiculoModelo('')
      setAno('')
      setKm('')
      setMecanicoNome('')
      setObservacoes('')
      setItens([])
    }

    setFornecedoresCotados(criarFornecedoresIniciaisPadrao(terceiros))
    setFornecedorVencedorId(null)
  }, [id, location.search, location.state])

  // Cria fornecedores iniciais padrão
  function criarFornecedoresIniciaisPadrao(terceiros) {
    if (!terceiros || terceiros.length === 0) return []
    const autoPecas = filtrarFornecedoresAutoPecas(terceiros)
    const selecionados = autoPecas.length > 0 ? autoPecas.slice(0, 3) : terceiros.slice(0, 3)

    return selecionados.map((t) => ({
      id: t.id,
      nome: t.nomeFantasia || t.razaoSocial || 'Auto Peças Parceira',
      telefone: extrairTelefoneExibicao(t),
      whatsapp: extrairTelefoneLimpo(t),
      cidade: t.cidade || t.endereco?.cidade || 'Apucarana - PR',
      status: 'AGUARDANDO',
      valorTotal: null,
      tempoEntrega: '1 a 2 horas',
      condicaoPagamento: 'Boleto 30 Dias',
      respostasItens: {},
    }))
  }

  // Opções para seleção de OS
  const opcoesOS = useMemo(() => {
    return [
      { value: '', label: 'Sem OS vinculada (Reposição de Almoxarifado)' },
      ...ordensAbertas.map((os) => ({
        value: String(os.numeroOS),
        label: `OS #${os.numeroOS} • ${os.placa} • ${os.marcaModelo || os.modelo || 'Veículo'} (${os.cliente})`,
        dadosOS: os,
      })),
    ]
  }, [ordensAbertas])

  const handleSelecionarOS = (opcao) => {
    if (!opcao || !opcao.value) {
      setNumeroOS('')
      return
    }
    const os = opcao.dadosOS
    setNumeroOS(String(os.numeroOS))
    setClienteNome(os.cliente || '')
    setClienteTelefone(os.telefone || '')
    setVeiculoPlaca(os.placa || '')
    setVeiculoModelo(os.marcaModelo || `${os.marca || ''} ${os.modelo || ''}`.trim())
    setAno(os.ano || '')
    setKm(os.km || '')
    setMecanicoNome(os.mecanicoNome || '')

    // Se estiver sem peças, importa as peças da OS
    if (itens.length === 0 && os.pecasOS && os.pecasOS.length > 0) {
      const novas = os.pecasOS.map((p, idx) => ({
        id: `it-${Date.now()}-${idx}`,
        codigo: p.codigo || '',
        nome: p.nome,
        unidade: p.unidade || 'UN',
        quantidade: Number(p.quantidade || 1),
        marcaSugerida: p.marca || '',
        observacoes: '',
        fotoUrl: '',
      }))
      setItens(novas)
      toast.info(`${novas.length} peças da OS #${os.numeroOS} foram importadas para a cotação.`)
    }
  }

  // Recarregar peças da OS
  const handleRecarregarPecasDaOS = () => {
    if (!numeroOS) {
      toast.warning('Selecione uma Ordem de Serviço primeiro.')
      return
    }
    const os = ordensAbertas.find((o) => String(o.numeroOS) === String(numeroOS))
    if (!os || !os.pecasOS || os.pecasOS.length === 0) {
      toast.warning('Esta Ordem de Serviço não possui peças registradas.')
      return
    }

    const novas = os.pecasOS.map((p, idx) => ({
      id: `it-${Date.now()}-${idx}`,
      codigo: p.codigo || '',
      nome: p.nome,
      unidade: p.unidade || 'UN',
      quantidade: Number(p.quantidade || 1),
      marcaSugerida: p.marca || '',
      observacoes: '',
      fotoUrl: '',
    }))

    setItens(novas)
    toast.success(`${novas.length} peças da OS #${numeroOS} recarregadas com sucesso!`)
  }

  // Gestão de Peças
  const handleAdicionarItem = (e) => {
    e?.preventDefault()
    if (!novoItemNome.trim()) {
      toast.error('Informe o nome ou descrição da peça.')
      return
    }

    const item = {
      id: `it-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      codigo: novoItemCodigo.trim() || 'SKU-S/N',
      nome: novoItemNome.trim(),
      quantidade: Number(novoItemQuantidade) || 1,
      unidade: novoItemUnidade || 'UN',
      marcaSugerida: novoItemMarcaSugerida.trim(),
      observacoes: novoItemObservacoes.trim(),
      fotoUrl: '',
    }

    setItens((prev) => [...prev, item])
    setNovoItemCodigo('')
    setNovoItemNome('')
    setNovoItemQuantidade(1)
    setNovoItemUnidade('UN')
    setNovoItemMarcaSugerida('')
    setNovoItemObservacoes('')
    setMostrarNovoItem(false)
    toast.success(`Peça "${item.nome}" incluída na cotação!`)
  }

  const handleRemoverItem = (itemId) => {
    setItens((prev) => prev.filter((it) => it.id !== itemId))
    setFornecedoresCotados((prev) =>
      prev.map((f) => {
        if (f.respostasItens && f.respostasItens[itemId]) {
          const copia = { ...f.respostasItens }
          delete copia[itemId]
          return { ...f, respostasItens: copia }
        }
        return f
      })
    )
    toast.info('Peça removida da lista.')
  }

  // Gestão de Fornecedores
  const opcoesFornecedoresDisponiveis = useMemo(() => {
    const idsJaAdicionados = fornecedoresCotados.map((f) => f.id)
    return fornecedoresCadastrados
      .filter((t) => !idsJaAdicionados.includes(t.id))
      .map((t) => ({
        value: t.id,
        label: `${t.nomeFantasia || t.razaoSocial} (${t.ramoAtividade || t.categoria || 'Fornecedor'})`,
        dados: t,
      }))
  }, [fornecedoresCadastrados, fornecedoresCotados])

  const handleAdicionarFornecedor = () => {
    if (!fornecedorSelecionadoParaAdicionar) return

    const t = fornecedorSelecionadoParaAdicionar.dados
    const novo = {
      id: t.id,
      nome: t.nomeFantasia || t.razaoSocial || 'Fornecedor',
      telefone: extrairTelefoneExibicao(t),
      whatsapp: extrairTelefoneLimpo(t),
      cidade: t.cidade || t.endereco?.cidade || 'Apucarana - PR',
      status: 'AGUARDANDO',
      valorTotal: null,
      tempoEntrega: '1 a 2 horas',
      condicaoPagamento: 'Boleto 30 Dias',
      respostasItens: {},
    }

    setFornecedoresCotados((prev) => [...prev, novo])
    setFornecedorSelecionadoParaAdicionar(null)
    toast.success(`Fornecedor ${novo.nome} incluído na cotação!`)
  }

  const handleRemoverFornecedor = (fornecedorId) => {
    setFornecedoresCotados((prev) => prev.filter((f) => f.id !== fornecedorId))
    if (fornecedorVencedorId === fornecedorId) {
      setFornecedorVencedorId(null)
    }
    if (fornecedorExpandidoId === fornecedorId) {
      setFornecedorExpandidoId(null)
    }
    toast.info('Fornecedor removido da cotação.')
  }

  // Preenchimento de Preços
  const handleAtualizarPrecoFornecedor = (fornecedorId, itemId, campo, valor) => {
    setFornecedoresCotados((prev) =>
      prev.map((f) => {
        if (f.id !== fornecedorId) return f

        const respostasAtuais = { ...(f.respostasItens || {}) }
        const itemAtual = { ...(respostasAtuais[itemId] || { preco: '', marca: '', disponivel: true }) }

        itemAtual[campo] = valor
        respostasAtuais[itemId] = itemAtual

        let soma = 0
        itens.forEach((it) => {
          const resp = respostasAtuais[it.id]
          if (resp && resp.preco !== '' && !isNaN(Number(resp.preco))) {
            soma += Number(resp.preco) * Number(it.quantidade || 1)
          }
        })

        return {
          ...f,
          respostasItens: respostasAtuais,
          valorTotal: soma > 0 ? soma : null,
          status: soma > 0 ? 'RESPONDIDA' : 'AGUARDANDO',
        }
      })
    )
  }

  const handleAtualizarDadosFornecedor = (fornecedorId, campo, valor) => {
    setFornecedoresCotados((prev) =>
      prev.map((f) => (f.id === fornecedorId ? { ...f, [campo]: valor } : f))
    )
  }

  // Disparar WhatsApp e Copiar Links
  const handleDispararWhatsApp = (fornecedor) => {
    const url = `${window.location.origin}/cotacao/${idCotacao}`
    let msg = `Olá *${fornecedor.nome}*, segue lista de cotação de autopeças da *Mecânica Gabriel*:%0A%0A`
    if (veiculoPlaca) msg += `*Veículo:* ${veiculoModelo} (Placa: ${veiculoPlaca})%0A`
    if (numeroOS) msg += `*OS:* #${numeroOS}%0A`
    msg += `%0A*Itens Solicitados:*%0A`

    itens.forEach((it, idx) => {
      msg += `${idx + 1}. *${it.nome}* - ${it.quantidade} ${it.unidade} (Marca: ${it.marcaSugerida || 'Original'})%0A`
    })

    msg += `%0A*Preencha seus valores pelo link rápido:*%0A${url}`

    const telefoneLimpo = extrairTelefoneLimpo(fornecedor)
    const linkWa = telefoneLimpo
      ? `https://wa.me/55${telefoneLimpo}?text=${msg}`
      : `https://wa.me/?text=${msg}`

    window.open(linkWa, '_blank')
  }

  const handleCopiarLinkWhatsApp = (fornecedor) => {
    const url = `${window.location.origin}/cotacao/${idCotacao}`
    let texto = `*COTAÇÃO DE AUTOPEÇAS - MECÂNICA GABRIEL*\n`
    texto += `Olá *${fornecedor.nome}*, precisamos cotar as seguintes peças:\n\n`
    if (veiculoPlaca || veiculoModelo) {
      texto += `🚗 *Veículo:* ${veiculoModelo || 'Veículo'} (Placa: *${veiculoPlaca}*)\n`
      if (ano) texto += `Ano: ${ano} • KM: ${km || 'Não informado'}\n`
    }
    if (numeroOS) {
      texto += `Aplicação: OS #${numeroOS}\n`
    }
    texto += `\n*ITENS SOLICITADOS (${itens.length} itens):*\n`

    itens.forEach((it, idx) => {
      texto += `${idx + 1}. [${it.codigo || 'SKU'}] *${it.nome}* - Qtd: *${it.quantidade} ${it.unidade}*`
      if (it.marcaSugerida) texto += ` (Marca sugerida: ${it.marcaSugerida})`
      if (it.observacoes) texto += ` - Obs: ${it.observacoes}`
      texto += `\n`
    })

    texto += `\n🔗 *Acesse e informe seus preços em 1 clique:*\n${url}\n\n`
    texto += `Agradecemos a parceria!`

    navigator.clipboard
      .writeText(texto)
      .then(() => {
        toast.success(`Mensagem e link copiados! Pronto para colar no WhatsApp de ${fornecedor.nome}.`)
      })
      .catch(() => {
        toast.error('Erro ao copiar mensagem.')
      })
  }

  // Navegar de volta à tela de origem (Requisito: ao salvar cotação, voltar na tela anterior)
  const handleVoltar = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(`${basePath}/compras`, { state: { aba: 'cotacoes' } })
    }
  }

  // Salvar a cotação
  const montarObjetoCotacao = () => {
    return {
      id: idCotacao || gerarProximoNumeroCotacao(),
      numeroOS,
      clienteNome,
      clienteTelefone,
      veiculoPlaca,
      veiculoModelo,
      ano,
      km,
      mecanicoNome,
      status: fornecedorVencedorId
        ? 'APROVADA'
        : fornecedoresCotados.some((f) => f.status === 'RESPONDIDA')
        ? 'RESPONDIDA'
        : 'EM_COTACAO',
      observacoes,
      itens,
      fornecedoresCotados,
      fornecedorVencedorId,
      dataCriacao: dataCriacao || new Date().toISOString(),
    }
  }

  const handleSalvarCotacao = () => {
    if (itens.length === 0) {
      toast.warning('Adicione ao menos uma peça na lista de cotação.')
      return
    }

    const cotacaoFormatada = montarObjetoCotacao()
    salvarCotacao(cotacaoFormatada)
    toast.success(`Cotação #${cotacaoFormatada.id} salva com sucesso!`)
    handleVoltar()
  }

  // Pré-visualizar como a autopeça enxerga a página de cotação
  const handleAbrirVisualizacao = () => {
    const cotacaoFormatada = montarObjetoCotacao()
    salvarCotacao(cotacaoFormatada)
    setModalVisualizarAberto(true)
  }

  // Aprovar cotação e gerar pedido de compra
  const handleAprovarEGerarPedido = () => {
    if (itens.length === 0) {
      toast.warning('A cotação precisa conter ao menos uma peça.')
      return
    }

    let fornecedorVencedor = fornecedoresCotados.find((f) => f.id === fornecedorVencedorId)
    if (!fornecedorVencedor) {
      const respondidos = fornecedoresCotados.filter((f) => f.status === 'RESPONDIDA' && f.valorTotal > 0)
      if (respondidos.length > 0) {
        respondidos.sort((a, b) => Number(a.valorTotal) - Number(b.valorTotal))
        fornecedorVencedor = respondidos[0]
      } else if (fornecedoresCotados.length > 0) {
        fornecedorVencedor = fornecedoresCotados[0]
      }
    }

    if (!fornecedorVencedor) {
      toast.warning('Inclua ao menos um fornecedor para aprovar a cotação.')
      return
    }

    try {
      const cotacaoFormatada = {
        ...montarObjetoCotacao(),
        status: 'APROVADA',
        fornecedorVencedorId: fornecedorVencedor.id,
        fornecedorVencedorNome: fornecedorVencedor.nome,
      }
      salvarCotacao(cotacaoFormatada)

      // Mapeia itens com os preços da proposta vencedora
      const itensMapeados = itens.map((it, idx) => {
        const resp = fornecedorVencedor.respostasItens?.[it.id] || {}
        const preco = Number(resp.preco) || 0
        return {
          id: `item-ped-${Date.now()}-${idx}`,
          codigo: it.codigo || '',
          nome: it.nome,
          unidade: it.unidade || 'UN',
          quantidade: Number(it.quantidade) || 1,
          precoCusto: preco,
          valorTotal: (Number(it.quantidade) || 1) * preco,
          marca: resp.marca || it.marcaSugerida || '',
        }
      })

      // Abre o modal de pedido de compra pré-preenchido para conferência final
      setDadosPedidoParaGerar({
        cotacaoId: cotacaoFormatada.id,
        fornecedorId: fornecedorVencedor.id,
        fornecedorNome: fornecedorVencedor.nome,
        origemTipo: cotacaoFormatada.numeroOS ? 'ORDEM_SERVICO' : 'REPOSICAO_ESTOQUE',
        numeroOS: cotacaoFormatada.numeroOS || '',
        clienteNome: cotacaoFormatada.clienteNome || '',
        veiculoPlaca: cotacaoFormatada.veiculoPlaca || '',
        veiculoModelo: cotacaoFormatada.veiculoModelo || '',
        formaPagamento: fornecedorVencedor.condicaoPagamento || 'Boleto 30 Dias',
        observacoes: `Pedido oficial gerado a partir da Cotação #${cotacaoFormatada.id}. Fornecedor vencedor: ${fornecedorVencedor.nome}.`,
        itens: itensMapeados,
      })
      setModalCompraAberto(true)

      toast.success(
        `Cotação #${cotacaoFormatada.id} aprovada! Revise e conclua a emissão do Pedido de Compra para ${fornecedorVencedor.nome}.`
      )
    } catch (err) {
      toast.error(err.message || 'Erro ao aprovar cotação.')
    }
  }

  // Ao salvar o pedido de compra a partir da cotação
  const handleConcluirPedidoCompra = (dadosPedido) => {
    setModalCompraAberto(false)

    // Fecha o ciclo com a OS de origem: aplica o preço final negociado nas peças que
    // estavam marcadas "Para Cotação" e avisa para mover a OS manualmente no Kanban —
    // igual a toda outra transição de status no sistema, a decisão fica com a secretaria.
    if (dadosPedido.numeroOS) {
      const osAtualizada = atualizarPecasAposCotacao(dadosPedido.numeroOS, dadosPedido.itens, dadosPedido.fornecedorNome)
      if (osAtualizada) {
        toast.success(
          `Pedido de Compra ${dadosPedido.numeroPedido} emitido! Preços atualizados na OS #${dadosPedido.numeroOS} — mova-a para "Aprovação" no Kanban quando as peças chegarem.`
        )
        navigate(`${basePath}/compras`)
        return
      }
    }

    toast.success(`Pedido de Compra ${dadosPedido.numeroPedido} emitido com sucesso!`)
    navigate(`${basePath}/compras`)
  }

  // Excluir cotação via diálogo na frente da tela
  const handleExcluirCotacaoAtual = () => {
    if (!idCotacao) return
    setConfirmandoExclusaoCotacao(true)
  }

  const confirmarExclusaoCotacao = () => {
    if (!idCotacao) return
    excluirCotacao(idCotacao)
    toast.success(`Cotação #${idCotacao} excluída com sucesso.`)
    setConfirmandoExclusaoCotacao(false)
    navigate(`${basePath}/compras`)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Top Header da Tela Dedicada */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleVoltar}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Retornar para a tela anterior"
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Voltar</span>
            </button>

            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center border border-sky-100 shrink-0">
              <ShareNetwork size={22} weight="bold" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Cotação de Peças com Autopeças Parceiras
                </h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                  {idCotacao}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    status === 'APROVADA'
                      ? 'bg-[#101828] text-white border-[#101828]'
                      : status === 'RESPONDIDA'
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {status === 'APROVADA'
                    ? 'Cotação Aprovada'
                    : status === 'RESPONDIDA'
                    ? 'Propostas Recebidas'
                    : 'Em Cotação'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {veiculoModelo
                  ? `${veiculoModelo} (${veiculoPlaca}) • Cliente: ${clienteNome || 'Balcão'}`
                  : 'Gestão da lista de peças, envio via WhatsApp para fornecedores e comparativo de preços'}
              </p>
            </div>
          </div>

          {/* Botões de Ação Principais no Topo */}
          <div className="flex items-center gap-2.5">
            {id && id !== 'nova' && (
              <button
                type="button"
                onClick={handleExcluirCotacaoAtual}
                className="p-2 border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                title="Excluir cotação"
              >
                <Trash size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={handleAbrirVisualizacao}
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Visualizar como as autopeças parceiras enxergam a página de cotação"
            >
              <Eye size={16} weight="bold" className="text-[#0284c7]" />
              <span>Visualizar Página</span>
            </button>

            <button
              type="button"
              onClick={handleSalvarCotacao}
              className="inline-flex items-center gap-2 px-4 py-2 border border-sky-300 bg-sky-50 hover:bg-sky-100 text-[#0284c7] rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <FloppyDisk size={16} weight="bold" />
              <span>Salvar Cotação</span>
            </button>

            <button
              type="button"
              onClick={handleAprovarEGerarPedido}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Aprovar a melhor proposta e emitir o Pedido de Compra oficial"
            >
              <CheckCircle size={16} weight="bold" />
              <span>Aprovar Cotação e Gerar Pedido</span>
            </button>
          </div>
        </div>
      </div>

      {/* Corpo da Tela Dedicada com Scrollbar Oculta (Regra 11) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-6 space-y-6">
        {/* PAINEL 1: DADOS DO VEÍCULO E DA ORDEM DE SERVIÇO */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Car size={20} className="text-[#0284c7]" weight="bold" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Veículo e Ordem de Serviço da Cotação
              </h2>
            </div>
            {numeroOS && (
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-[#0284c7] border border-sky-200">
                OS Vinculada: #{numeroOS}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vincular Ordem de Serviço (OS)
              </label>
              <Select
                value={opcoesOS.find((o) => o.value === numeroOS) || opcoesOS[0]}
                onChange={handleSelecionarOS}
                options={opcoesOS}
                styles={customSelectStyles}
                placeholder="Selecione uma OS aberta para puxar os dados..."
                isSearchable={true}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Placa do Veículo
              </label>
              <input
                type="text"
                value={veiculoPlaca}
                onChange={(e) => setVeiculoPlaca(e.target.value.toUpperCase())}
                placeholder="Ex: ASF6I46"
                className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Marca e Modelo do Carro
              </label>
              <input
                type="text"
                value={veiculoModelo}
                onChange={(e) => setVeiculoModelo(e.target.value)}
                placeholder="Ex: Fiat Doblo 1.8 Cargo"
                className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-semibold text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ano / Fabricação
              </label>
              <input
                type="text"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                placeholder="Ex: 2009/2010"
                className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                KM Atual
              </label>
              <input
                type="text"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                placeholder="Ex: 280.812 km"
                className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cliente Proprietário
              </label>
              <input
                type="text"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Nome do cliente"
                className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mecânico Responsável
              </label>
              <input
                type="text"
                value={mecanicoNome}
                onChange={(e) => setMecanicoNome(e.target.value)}
                placeholder="Ex: Carlos Eduardo"
                className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
              />
            </div>
          </div>
        </div>

        {/* PAINEL 2: A LISTA DE PEÇAS QUE ESTÁ EM COTAÇÃO (Requisito Principal do Usuário) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Package size={20} className="text-[#0284c7]" weight="bold" />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Lista de Peças que Estão em Cotação ({itens.length} {itens.length === 1 ? 'item' : 'itens'})
                </h2>
                <p className="text-xs text-slate-500">
                  Peças demandadas pelo diagnóstico para envio às autopeças parceiras
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {numeroOS && (
                <button
                  type="button"
                  onClick={handleRecarregarPecasDaOS}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-700 hover:text-[#0284c7] bg-slate-50 hover:bg-sky-50 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  title="Recarregar todas as peças desta Ordem de Serviço"
                >
                  <ListBullets size={15} />
                  <span>Recarregar Peças da OS</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setMostrarNovoItem(!mostrarNovoItem)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <Plus size={15} weight="bold" />
                <span>Adicionar Peça à Cotação</span>
              </button>
            </div>
          </div>

          {/* Formulário Inline de Inclusão Rápida de Peça */}
          {mostrarNovoItem && (
            <div className="p-4 bg-sky-50/50 border border-sky-200 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-900">
                  Cadastrar Peça para Cotação
                </span>
                <button
                  type="button"
                  onClick={() => setMostrarNovoItem(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    Código SKU / Fabricante
                  </label>
                  <input
                    type="text"
                    value={novoItemCodigo}
                    onChange={(e) => setNovoItemCodigo(e.target.value)}
                    placeholder="Ex: 0018969"
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    Nome / Descrição da Peça *
                  </label>
                  <input
                    type="text"
                    value={novoItemNome}
                    onChange={(e) => setNovoItemNome(e.target.value)}
                    placeholder="Ex: Tubo Suporte de Arrefecimento"
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={novoItemQuantidade}
                      onChange={(e) => setNovoItemQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full h-9 px-2 rounded-lg border border-slate-300 text-xs font-bold text-center text-slate-900 bg-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                      Unidade
                    </label>
                    <input
                      type="text"
                      value={novoItemUnidade}
                      onChange={(e) => setNovoItemUnidade(e.target.value.toUpperCase())}
                      placeholder="UN"
                      className="w-full h-9 px-2 rounded-lg border border-slate-300 text-xs font-bold text-center text-slate-900 bg-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    Marca Sugerida / Linha Preferencial
                  </label>
                  <input
                    type="text"
                    value={novoItemMarcaSugerida}
                    onChange={(e) => setNovoItemMarcaSugerida(e.target.value)}
                    placeholder="Ex: Valclei / Original Fiat"
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    Observação / Defeito Constatado pelo Mecânico
                  </label>
                  <input
                    type="text"
                    value={novoItemObservacoes}
                    onChange={(e) => setNovoItemObservacoes(e.target.value)}
                    placeholder="Ex: Fissura plástica com vazamento no arrefecimento"
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAdicionarItem}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <CheckCircle size={15} weight="bold" />
                  <span>Confirmar Peça na Cotação</span>
                </button>
              </div>
            </div>
          )}

          {/* Tabela da Lista de Peças em Cotação */}
          {itens.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <Package size={32} className="text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-700">
                Nenhuma peça cadastrada nesta cotação
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Selecione uma Ordem de Serviço acima para puxar os itens automaticamente ou clique em "Adicionar Peça à Cotação".
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Código SKU</th>
                    <th className="py-3 px-4">Peça / Descrição</th>
                    <th className="py-3 px-4 text-center">Qtd / Unidade</th>
                    <th className="py-3 px-4">Marca Sugerida</th>
                    <th className="py-3 px-4">Observação Técnica</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                  {itens.map((it, idx) => (
                    <tr key={it.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-slate-400 font-bold">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {it.codigo || 'S/N'}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {it.nome}
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-[#0284c7]">
                        {it.quantidade} {it.unidade}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {it.marcaSugerida ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-semibold">
                            <Tag size={12} className="text-slate-400" />
                            <span>{it.marcaSugerida}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Original / Primeira Linha</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-500 max-w-sm truncate">
                        {it.observacoes || '-'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoverItem(it.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remover peça desta cotação"
                        >
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAINEL 3: FORNECEDORES COTADOS E COMPARATIVO DE PREÇOS */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Buildings size={20} className="text-[#0284c7]" weight="bold" />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Autopeças e Fornecedores Participantes ({fornecedoresCotados.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Envie a lista de peças via WhatsApp para as autopeças ou insira as propostas recebidas
                </p>
              </div>
            </div>

            {/* Adicionar Fornecedor */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="w-full sm:w-72">
                <Select
                  value={fornecedorSelecionadoParaAdicionar}
                  onChange={setFornecedorSelecionadoParaAdicionar}
                  options={opcoesFornecedoresDisponiveis}
                  styles={customSelectStyles}
                  placeholder="Incluir fornecedor..."
                  isSearchable={true}
                  noOptionsMessage={() => 'Todos os parceiros já foram adicionados'}
                />
              </div>
              <button
                type="button"
                onClick={handleAdicionarFornecedor}
                disabled={!fornecedorSelecionadoParaAdicionar}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus size={15} weight="bold" />
              </button>
            </div>
          </div>

          {/* Cards dos Fornecedores Cotados */}
          <div className="space-y-4">
            {fornecedoresCotados.map((forn) => {
              const isVencedor = fornecedorVencedorId === forn.id
              const isExpandido = fornecedorExpandidoId === forn.id
              const isRespondida = forn.status === 'RESPONDIDA' && forn.valorTotal > 0

              return (
                <div
                  key={forn.id}
                  className={`border rounded-xl p-4 transition-all ${
                    isVencedor
                      ? 'border-[#0284c7] bg-sky-50/30 shadow-xs ring-1 ring-[#0284c7]'
                      : isRespondida
                      ? 'border-slate-300 bg-white'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">
                          {forn.nome}
                        </span>
                        {isVencedor && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0284c7] text-white">
                            <CheckCircle size={13} weight="fill" />
                            <span>Proposta Vencedora</span>
                          </span>
                        )}
                        {isRespondida && !isVencedor && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
                            <CheckCircle size={13} weight="bold" />
                            <span>Proposta Recebida</span>
                          </span>
                        )}
                        {!isRespondida && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock size={13} weight="bold" />
                            <span>Aguardando Resposta</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                        <span>{forn.telefone}</span>
                        <span>•</span>
                        <span>Prazo: <strong className="text-slate-800">{forn.tempoEntrega || '1 a 2 horas'}</strong></span>
                        <span>•</span>
                        <span>Condição: <strong className="text-slate-800">{forn.condicaoPagamento || 'Boleto 30 Dias'}</strong></span>
                      </div>
                    </div>

                    {/* Resumo de Valores e Ações */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-right mr-3">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">
                          Valor Total Cotado
                        </span>
                        <span className="text-base font-bold font-mono text-slate-900">
                          {forn.valorTotal
                            ? `R$ ${Number(forn.valorTotal).toFixed(2)}`
                            : 'Aguardando...'}
                        </span>
                      </div>

                      {/* Botão WhatsApp */}
                      <button
                        type="button"
                        onClick={() => handleDispararWhatsApp(forn)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] rounded-lg text-xs font-bold transition-colors cursor-pointer border border-[#25D366]/30"
                        title="Enviar lista de peças pelo WhatsApp da autopeça"
                      >
                        <WhatsappLogo size={16} weight="fill" className="text-[#25D366]" />
                        <span>WhatsApp</span>
                      </button>

                      {/* Copiar Link */}
                      <button
                        type="button"
                        onClick={() => handleCopiarLinkWhatsApp(forn)}
                        className="p-2 text-slate-600 hover:text-[#0284c7] hover:bg-sky-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        title="Copiar mensagem e link para WhatsApp"
                      >
                        <Copy size={16} />
                      </button>

                      {/* Portal Externo */}
                      <a
                        href={`/cotacao/${idCotacao}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-600 hover:text-[#0284c7] hover:bg-sky-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        title="Abrir tela pública que a autopeça preenche"
                      >
                        <ArrowSquareOut size={16} />
                      </a>

                      {/* Expandir / Inserir Preços */}
                      <button
                        type="button"
                        onClick={() => setFornecedorExpandidoId(isExpandido ? null : forn.id)}
                        className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          isExpandido
                            ? 'bg-sky-50 border-sky-300 text-[#0284c7]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <PencilSimple size={14} />
                        <span>Preços</span>
                        {isExpandido ? <CaretUp size={13} /> : <CaretDown size={13} />}
                      </button>

                      {/* Escolher Vencedor */}
                      <button
                        type="button"
                        onClick={() => setFornecedorVencedorId(isVencedor ? null : forn.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          isVencedor
                            ? 'bg-[#0284c7] text-white hover:bg-[#0369a1]'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                        title="Selecionar este fornecedor para gerar a compra oficial"
                      >
                        <CheckCircle size={15} weight={isVencedor ? 'fill' : 'bold'} />
                        <span>{isVencedor ? 'Vencedor' : 'Escolher'}</span>
                      </button>

                      {/* Remover Fornecedor */}
                      <button
                        type="button"
                        onClick={() => handleRemoverFornecedor(forn.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remover fornecedor da cotação"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Grade de Preenchimento dos Preços por Item */}
                  {isExpandido && (
                    <div className="mt-4 pt-3 border-t border-slate-200 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          Preços unitários e marcas informadas por {forn.nome}:
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Preencha os valores passados por telefone ou consulte as respostas do link
                        </span>
                      </div>

                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-semibold">
                              <th className="py-2.5 px-3">Peça em Cotação</th>
                              <th className="py-2.5 px-3 text-center">Qtd</th>
                              <th className="py-2.5 px-3">Marca Ofertada</th>
                              <th className="py-2.5 px-3 w-36 text-right">Preço Unitário (R$)</th>
                              <th className="py-2.5 px-3 w-36 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {itens.map((it) => {
                              const resp = forn.respostasItens?.[it.id] || {}
                              const precoUnit = resp.preco || ''
                              const subtotal =
                                precoUnit && !isNaN(Number(precoUnit))
                                  ? Number(precoUnit) * Number(it.quantidade || 1)
                                  : 0

                              return (
                                <tr key={it.id}>
                                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                                    {it.nome}
                                    {it.codigo && (
                                      <span className="text-[10px] text-slate-400 block font-mono">
                                        {it.codigo}
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                                    {it.quantidade} {it.unidade}
                                  </td>

                                  <td className="py-2.5 px-3">
                                    <input
                                      type="text"
                                      value={resp.marca || ''}
                                      onChange={(e) =>
                                        handleAtualizarPrecoFornecedor(forn.id, it.id, 'marca', e.target.value)
                                      }
                                      placeholder={it.marcaSugerida || 'Ex: Nakata / Viemar'}
                                      className="w-full h-8 px-2 rounded border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
                                    />
                                  </td>

                                  <td className="py-2.5 px-3 text-right">
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={precoUnit}
                                      onChange={(e) =>
                                        handleAtualizarPrecoFornecedor(forn.id, it.id, 'preco', e.target.value)
                                      }
                                      placeholder="0,00"
                                      className="w-full h-8 px-2 rounded border border-slate-200 text-xs font-mono font-bold text-right text-slate-900 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
                                    />
                                  </td>

                                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                                    R$ {subtotal.toFixed(2)}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            Prazo de Entrega
                          </label>
                          <input
                            type="text"
                            value={forn.tempoEntrega || ''}
                            onChange={(e) =>
                              handleAtualizarDadosFornecedor(forn.id, 'tempoEntrega', e.target.value)
                            }
                            placeholder="Ex: 45 minutos (Motoboy)"
                            className="w-full h-8.5 px-3 rounded border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            Condição de Pagamento
                          </label>
                          <input
                            type="text"
                            value={forn.condicaoPagamento || ''}
                            onChange={(e) =>
                              handleAtualizarDadosFornecedor(forn.id, 'condicaoPagamento', e.target.value)
                            }
                            placeholder="Ex: Boleto 28 Dias ou PIX com 5% desconto"
                            className="w-full h-8.5 px-3 rounded border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* PAINEL 4: OBSERVAÇÕES E NOTAS */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Observações Gerais da Cotação
          </label>
          <textarea
            rows={2}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Instruções para o comprador, urgência do veículo ou orientações para as autopeças parceiras..."
            className="w-full p-3 rounded-xl border border-[#d0d5dd] text-xs text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] resize-none"
          />
        </div>
      </div>

      {/* Barra Inferior Fixa de Ações (Single-Screen / Acima do Footer) */}
      <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleVoltar}
            className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Voltar
          </button>
          <span className="text-xs text-slate-500">
            {itens.length} {itens.length === 1 ? 'peça na cotação' : 'peças na cotação'} • {fornecedoresCotados.length} fornecedores
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleAbrirVisualizacao}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Visualizar como as autopeças parceiras enxergam a página de cotação"
          >
            <Eye size={16} weight="bold" className="text-[#0284c7]" />
            <span>Visualizar Página</span>
          </button>

          <button
            type="button"
            onClick={handleSalvarCotacao}
            className="inline-flex items-center gap-2 px-4 py-2 border border-sky-300 bg-sky-50 hover:bg-sky-100 text-[#0284c7] rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <FloppyDisk size={16} weight="bold" />
            <span>Salvar Cotação</span>
          </button>

          <button
            type="button"
            onClick={handleAprovarEGerarPedido}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <CheckCircle size={16} weight="bold" />
            <span>Aprovar Cotação e Gerar Pedido de Compra</span>
          </button>
        </div>
      </div>

      {/* Modal de Conclusão e Emissão do Pedido de Compra Oficial */}
      <CompraModalForm
        isOpen={modalCompraAberto}
        onClose={() => {
          setModalCompraAberto(false)
          setDadosPedidoParaGerar(null)
        }}
        onSalvar={handleConcluirPedidoCompra}
        demandaInicial={dadosPedidoParaGerar}
      />

      {/* Modal de Pré-visualização da Página de Cotação */}
      <VisualizarCotacaoModal
        isOpen={modalVisualizarAberto}
        onClose={() => setModalVisualizarAberto(false)}
        cotacaoId={idCotacao}
        cotacao={montarObjetoCotacao()}
      />

      {/* Diálogo de Confirmação de Exclusão na Frente da Tela */}
      <ModalConfirmacao
        isOpen={confirmandoExclusaoCotacao}
        onClose={() => setConfirmandoExclusaoCotacao(false)}
        onConfirm={confirmarExclusaoCotacao}
        titulo="Excluir esta cotação?"
        descricao="Esta ação removerá permanentemente a cotação e todas as cotações vinculadas aos fornecedores."
        itemDestaque={idCotacao ? `Cotação: #${idCotacao}` : ''}
        textoConfirmar="Sim, Excluir"
        textoCancelar="Cancelar"
        variante="perigo"
      />
    </div>
  )
}
