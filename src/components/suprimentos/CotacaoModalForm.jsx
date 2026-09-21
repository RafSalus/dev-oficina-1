import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import {
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
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from './ModalRedimensionavel'
import { ModalConfirmacao } from '../ModalConfirmacao'
import { customSelectStyles } from './customSelectStyles'
import {
  carregarPecasCadastradas,
  carregarTerceirosCadastrados,
} from '../../constants/cadastrosSuprimentosData'
import {
  carregarCotacoes,
  salvarCotacao,
  salvarCotacoes,
  gerarProximoNumeroCotacao,
  aprovarCotacaoEGerarPedido,
  excluirCotacao,
} from '../../constants/comprasData'
import { obterOrdensAbertas } from '../../pages/dashboard/orcamento/mockOrdensAbertas'
import { TerceiroModalForm } from './TerceiroModalForm'
// Helpers seguros de contatos e autopeças (Regra 5: sem & em labels)
const extrairTelefoneLimpo = (t) => {
  if (!t) return '43998544106'
  const tel = t.whatsapp || t.contatoTelefone || t.telefone || t.contato?.telefone || ''
  const limpo = String(tel).replace(/\D/g, '')
  return limpo.length >= 8 ? limpo : '43998544106'
}

const extrairTelefoneExibicao = (t) => {
  if (!t) return '(43) 3456-7890'
  return String(t.telefone || t.contatoTelefone || t.contato?.telefone || '(43) 3456-7890')
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

export function CotacaoModalForm({
  isOpen,
  onClose,
  onSalvar,
  onAprovarParaPedido,
  cotacaoParaEditar = null,
  demandaInicial = null,
}) {
  const [pecasCatalogo, setPecasCatalogo] = useState([])
  const [fornecedoresCadastrados, setFornecedoresCadastrados] = useState([])
  const [ordensAbertas, setOrdensAbertas] = useState([])

  // Modais aninhados
  const [modalFornecedorAberto, setModalFornecedorAberto] = useState(false)
  const [modalPecaAberto, setModalPecaAberto] = useState(false)
  const [confirmandoExclusaoCotacao, setConfirmandoExclusaoCotacao] = useState(false)

  // Estado do formulário
  const [idCotacao, setIdCotacao] = useState('')
  const [numeroOS, setNumeroOS] = useState('')
  const [clienteNome, setClienteNome] = useState('')
  const [clienteTelefone, setClienteTelefone] = useState('')
  const [veiculoPlaca, setVeiculoPlaca] = useState('')
  const [veiculoModelo, setVeiculoModelo] = useState('')
  const [ano, setAno] = useState('')
  const [km, setKm] = useState('')
  const [mecanicoNome, setMecanicoNome] = useState('Carlos Eduardo')
  const [status, setStatus] = useState('EM_COTACAO')
  const [observacoes, setObservacoes] = useState('')

  // Lista de peças em cotação
  const [itens, setItens] = useState([])

  // Lista de fornecedores cotados
  const [fornecedoresCotados, setFornecedoresCotados] = useState([])

  // Fornecedor vencedor selecionado
  const [fornecedorVencedorId, setFornecedorVencedorId] = useState(null)

  // Estado para expandir edição de preços de um fornecedor
  const [fornecedorExpandidoId, setFornecedorExpandidoId] = useState(null)

  // Novo item em adição rápida
  const [mostrarNovoItem, setMostrarNovoItem] = useState(false)
  const [novoItemCodigo, setNovoItemCodigo] = useState('')
  const [novoItemNome, setNovoItemNome] = useState('')
  const [novoItemQuantidade, setNovoItemQuantidade] = useState(1)
  const [novoItemUnidade, setNovoItemUnidade] = useState('UN')
  const [novoItemMarcaSugerida, setNovoItemMarcaSugerida] = useState('')
  const [novoItemObservacoes, setNovoItemObservacoes] = useState('')

  // Fornecedor para adicionar à cotação
  const [fornecedorSelecionadoParaAdicionar, setFornecedorSelecionadoParaAdicionar] = useState(null)

  // Carregamento e sincronização dos dados ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      const pecas = carregarPecasCadastradas()
      const terceiros = carregarTerceirosCadastrados()
      const ordens = obterOrdensAbertas()

      setPecasCatalogo(pecas)
      setFornecedoresCadastrados(terceiros)
      setOrdensAbertas(ordens)

      if (cotacaoParaEditar) {
        setIdCotacao(cotacaoParaEditar.id || gerarProximoNumeroCotacao())
        setNumeroOS(cotacaoParaEditar.numeroOS || '')
        setClienteNome(cotacaoParaEditar.clienteNome || '')
        setClienteTelefone(cotacaoParaEditar.clienteTelefone || '')
        setVeiculoPlaca(cotacaoParaEditar.veiculoPlaca || '')
        setVeiculoModelo(cotacaoParaEditar.veiculoModelo || '')
        setAno(cotacaoParaEditar.ano || '')
        setKm(cotacaoParaEditar.km || '')
        setMecanicoNome(cotacaoParaEditar.mecanicoNome || 'Carlos Eduardo')
        setStatus(cotacaoParaEditar.status || 'EM_COTACAO')
        setObservacoes(cotacaoParaEditar.observacoes || '')
        setItens(cotacaoParaEditar.itens && cotacaoParaEditar.itens.length > 0 ? cotacaoParaEditar.itens : [])
        setFornecedoresCotados(
          cotacaoParaEditar.fornecedoresCotados && cotacaoParaEditar.fornecedoresCotados.length > 0
            ? cotacaoParaEditar.fornecedoresCotados
            : criarFornecedoresIniciaisPadrao(terceiros)
        )
        setFornecedorVencedorId(cotacaoParaEditar.fornecedorVencedorId || null)
      } else if (demandaInicial) {
        // Inicialização vinda de uma demanda de OS
        const osEncontrada = ordens.find((o) => String(o.numeroOS) === String(demandaInicial.numeroOS))

        setIdCotacao(gerarProximoNumeroCotacao())
        setNumeroOS(demandaInicial.numeroOS || '')
        setClienteNome(demandaInicial.clienteNome || osEncontrada?.cliente || '')
        setClienteTelefone(demandaInicial.clienteTelefone || osEncontrada?.telefone || '')
        setVeiculoPlaca(demandaInicial.veiculoPlaca || osEncontrada?.placa || '')
        setVeiculoModelo(
          demandaInicial.veiculoModelo ||
          osEncontrada?.marcaModelo ||
          `${osEncontrada?.marca || ''} ${osEncontrada?.modelo || ''}`.trim()
        )
        setAno(osEncontrada?.ano || '')
        setKm(osEncontrada?.km || '')
        setMecanicoNome(osEncontrada?.mecanicoNome || 'Carlos Eduardo')
        setStatus('EM_COTACAO')
        setObservacoes(
          demandaInicial.observacoes ||
          (demandaInicial.numeroOS
            ? `Cotação de peças para a Ordem de Serviço #${demandaInicial.numeroOS}`
            : 'Cotação de peças para almoxarifado')
        )

        // Se veio com múltiplos itens
        if (demandaInicial.itens && demandaInicial.itens.length > 0) {
          setItens(
            demandaInicial.itens.map((it, idx) => ({
              id: it.id || `it-${Date.now()}-${idx}`,
              codigo: it.codigo || it.itemCodigo || '',
              nome: it.nome || it.itemNome || '',
              unidade: it.unidade || 'UN',
              quantidade: Number(it.quantidade || it.quantidadeNecessaria || 1),
              marcaSugerida: it.marcaSugerida || it.marca || it.itemMarcaSugerida || '',
              observacoes: it.observacoes || '',
              fotoUrl: it.fotoUrl || '',
            }))
          )
        } else if (demandaInicial.itemNome || demandaInicial.nome) {
          setItens([
            {
              id: `it-${Date.now()}-1`,
              codigo: demandaInicial.itemCodigo || demandaInicial.codigo || '',
              nome: demandaInicial.itemNome || demandaInicial.nome,
              unidade: demandaInicial.unidade || 'UN',
              quantidade: Number(demandaInicial.quantidadeNecessaria || demandaInicial.sugestaoCompra || 1),
              marcaSugerida: demandaInicial.itemMarcaSugerida || demandaInicial.marca || '',
              observacoes: demandaInicial.observacoes || '',
              fotoUrl: demandaInicial.fotoUrl || '',
            },
          ])
        } else if (osEncontrada && osEncontrada.pecasOS && osEncontrada.pecasOS.length > 0) {
          // Carrega todas as peças da OS encontrada
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
        } else {
          setItens([])
        }

        setFornecedoresCotados(criarFornecedoresIniciaisPadrao(terceiros))
        setFornecedorVencedorId(null)
      } else {
        // Nova cotação limpa
        setIdCotacao(gerarProximoNumeroCotacao())
        setNumeroOS('')
        setClienteNome('')
        setClienteTelefone('')
        setVeiculoPlaca('')
        setVeiculoModelo('')
        setAno('')
        setKm('')
        setMecanicoNome('Carlos Eduardo')
        setStatus('EM_COTACAO')
        setObservacoes('')
        setItens([])
        setFornecedoresCotados(criarFornecedoresIniciaisPadrao(terceiros))
        setFornecedorVencedorId(null)
      }
    }
  }, [isOpen, cotacaoParaEditar, demandaInicial])

  // Cria fornecedores iniciais padrão a partir dos cadastros de terceiros
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

  // Opções para vincular OS
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

  // Seleção de OS preenche dados do veículo e oferece importar peças da OS
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
    setMecanicoNome(os.mecanicoNome || 'Carlos Eduardo')

    // Se a cotação estiver sem itens e a OS tiver peças, importa
    if (itens.length === 0 && os.pecasOS && os.pecasOS.length > 0) {
      const pecasImportadas = os.pecasOS.map((p, idx) => ({
        id: `it-${Date.now()}-${idx}`,
        codigo: p.codigo || '',
        nome: p.nome,
        unidade: p.unidade || 'UN',
        quantidade: Number(p.quantidade || 1),
        marcaSugerida: p.marca || '',
        observacoes: '',
        fotoUrl: '',
      }))
      setItens(pecasImportadas)
      toast.info(`${pecasImportadas.length} peças da OS #${os.numeroOS} foram importadas para a cotação.`)
    }
  }

  // Importar explicitamente peças da OS
  const handleImportarPecasDaOS = () => {
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
    toast.success(`${novas.length} peças da OS #${numeroOS} carregadas na cotação com sucesso!`)
  }

  // Adição de nova peça na lista de cotação
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
    toast.success(`Peça "${item.nome}" adicionada à cotação!`)
  }

  const handleRemoverItem = (itemId) => {
    setItens((prev) => prev.filter((it) => it.id !== itemId))
    // Limpa respostas desse item nos fornecedores
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
    toast.info('Item removido da cotação.')
  }

  // Gestão de Fornecedores Cotados
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

  // Preenchimento manual de preços cotados por um fornecedor
  const handleAtualizarPrecoFornecedor = (fornecedorId, itemId, campo, valor) => {
    setFornecedoresCotados((prev) =>
      prev.map((f) => {
        if (f.id !== fornecedorId) return f

        const respostasAtuais = { ...(f.respostasItens || {}) }
        const itemAtual = { ...(respostasAtuais[itemId] || { preco: '', marca: '', disponivel: true }) }

        itemAtual[campo] = valor
        respostasAtuais[itemId] = itemAtual

        // Recalcula total do fornecedor
        let soma = 0
        let todosPreenchidos = true
        itens.forEach((it) => {
          const resp = respostasAtuais[it.id]
          if (resp && resp.preco !== '' && !isNaN(Number(resp.preco))) {
            soma += Number(resp.preco) * Number(it.quantidade || 1)
          } else {
            todosPreenchidos = false
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

  // Copiar link público da cotação para WhatsApp
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

    texto += `\n🔗 *Acesse o portal e informe seus preços em 1 clique:*\n${url}\n\n`
    texto += `Agradecemos a parceria!`

    navigator.clipboard
      .writeText(texto)
      .then(() => {
        toast.success(`Mensagem e link de cotação copiados! Pronto para colar no WhatsApp de ${fornecedor.nome}.`)
      })
      .catch(() => {
        toast.error('Erro ao copiar a mensagem de cotação.')
      })
  }

  // Disparar WhatsApp diretamente
  const handleDispararWhatsApp = (fornecedor) => {
    const url = `${window.location.origin}/cotacao/${idCotacao}`
    let msg = `Olá *${fornecedor.nome}*, segue lista de cotação de autopeças da *Mecânica Gabriel*:%0A%0A`
    if (veiculoPlaca) msg += `*Veículo:* ${veiculoModelo} (Placa: ${veiculoPlaca})%0A`
    if (numeroOS) msg += `*OS:* #${numeroOS}%0A`
    msg += `%0A*Itens Solicitados:*%0A`

    itens.forEach((it, idx) => {
      msg += `${idx + 1}. *${it.nome}* - ${it.quantidade} ${it.unidade} (Marca: ${it.marcaSugerida || 'Original'})%0A`
    })

    msg += `%0A*Preencha os valores pelo link rápido:*%0A${url}`

    const telefoneLimpo = (fornecedor.whatsapp || fornecedor.telefone || '').replace(/\D/g, '')
    const linkWa = telefoneLimpo
      ? `https://wa.me/55${telefoneLimpo}?text=${msg}`
      : `https://wa.me/?text=${msg}`

    window.open(linkWa, '_blank')
  }

  // Salvar cotação no estado persistido
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
      status: fornecedorVencedorId ? 'APROVADA' : fornecedoresCotados.some((f) => f.status === 'RESPONDIDA') ? 'RESPONDIDA' : 'EM_COTACAO',
      observacoes,
      itens,
      fornecedoresCotados,
      fornecedorVencedorId,
      dataCriacao: cotacaoParaEditar?.dataCriacao || new Date().toISOString(),
    }
  }

  const handleSalvarCotacaoInterna = () => {
    if (itens.length === 0) {
      toast.warning('Adicione ao menos uma peça na lista de cotação.')
      return
    }

    const cotacaoFormatada = montarObjetoCotacao()
    salvarCotacao(cotacaoFormatada)
    if (onSalvar) onSalvar(cotacaoFormatada)
    toast.success(`Cotação #${cotacaoFormatada.id} salva com sucesso!`)
    onClose()
  }

  // Aprovar cotação e gerar pedido de compra oficial
  const handleAprovarEGerarPedidoCompra = () => {
    if (itens.length === 0) {
      toast.warning('A cotação precisa conter ao menos uma peça.')
      return
    }

    // Se não selecionou fornecedor vencedor, seleciona o que tiver melhor preço ou o primeiro respondido
    let fornecedorVencedor = fornecedoresCotados.find((f) => f.id === fornecedorVencedorId)
    if (!fornecedorVencedor) {
      const respondidos = fornecedoresCotados.filter((f) => f.status === 'RESPONDIDA' && f.valorTotal > 0)
      if (respondidos.length > 0) {
        // Ordena pelo menor valor total
        respondidos.sort((a, b) => Number(a.valorTotal) - Number(b.valorTotal))
        fornecedorVencedor = respondidos[0]
      } else if (fornecedoresCotados.length > 0) {
        fornecedorVencedor = fornecedoresCotados[0]
      }
    }

    if (!fornecedorVencedor) {
      toast.warning('Adicione ao menos um fornecedor para aprovar a cotação.')
      return
    }

    try {
      // Salva a cotação primeiro
      const cotacaoFormatada = {
        ...montarObjetoCotacao(),
        status: 'APROVADA',
        fornecedorVencedorId: fornecedorVencedor.id,
        fornecedorVencedorNome: fornecedorVencedor.nome,
      }
      salvarCotacao(cotacaoFormatada)

      // Se foi passada função callback para abrir o CompraModalForm com os dados preenchidos
      if (onAprovarParaPedido) {
        // Mapeia itens com os preços respondidos pelo fornecedor vencedor
        const itensMapeados = itens.map((it) => {
          const resp = fornecedorVencedor.respostasItens?.[it.id] || {}
          const preco = Number(resp.preco) || 0
          return {
            id: `item-${Date.now()}-${it.id}`,
            codigo: it.codigo || '',
            nome: it.nome,
            unidade: it.unidade || 'UN',
            quantidade: Number(it.quantidade) || 1,
            precoCusto: preco,
            valorTotal: (Number(it.quantidade) || 1) * preco,
            marca: resp.marca || it.marcaSugerida || '',
          }
        })

        onAprovarParaPedido({
          cotacaoId: cotacaoFormatada.id,
          fornecedorId: fornecedorVencedor.id,
          fornecedorNome: fornecedorVencedor.nome,
          origemTipo: cotacaoFormatada.numeroOS ? 'ORDEM_SERVICO' : 'REPOSICAO_ESTOQUE',
          numeroOS: cotacaoFormatada.numeroOS || '',
          clienteNome: cotacaoFormatada.clienteNome || '',
          veiculoPlaca: cotacaoFormatada.veiculoPlaca || '',
          veiculoModelo: cotacaoFormatada.veiculoModelo || '',
          formaPagamento: fornecedorVencedor.condicaoPagamento || 'Boleto 30 Dias',
          observacoes: `Pedido oficial gerado a partir da Cotação #${cotacaoFormatada.id}. Fornecedor: ${fornecedorVencedor.nome}.`,
          itens: itensMapeados,
        })
      } else {
        // Gera direto
        const resultado = aprovarCotacaoEGerarPedido(cotacaoFormatada.id, fornecedorVencedor.id)
        toast.success(
          `Cotação #${cotacaoFormatada.id} aprovada! Pedido de Compra ${resultado.pedido.numeroPedido} gerado com sucesso.`
        )
      }

      onClose()
    } catch (err) {
      toast.error(err.message || 'Erro ao aprovar cotação e gerar pedido.')
    }
  }

  // Excluir cotação via diálogo na frente do formulário
  const handleExcluirCotacaoAtual = () => {
    if (!cotacaoParaEditar?.id) return
    setConfirmandoExclusaoCotacao(true)
  }

  const confirmarExclusaoCotacao = () => {
    if (!cotacaoParaEditar?.id) return
    excluirCotacao(cotacaoParaEditar.id)
    toast.success(`Cotação ${cotacaoParaEditar.id} excluída com sucesso.`)
    setConfirmandoExclusaoCotacao(false)
    onClose()
  }

  return (
    <>
      <ModalRedimensionavel
        isOpen={isOpen}
        onClose={onClose}
        chaveStorage="dev_oficina_cotacao_modal_dimensoes"
        larguraPadrao={1040}
        alturaPadrao={760}
        larguraMinima={840}
        alturaMinima={520}
        larguraMaxima={1440}
        alturaMaxima={940}
        titulo={cotacaoParaEditar ? `Cotação de Peças #${idCotacao}` : 'Nova Cotação de Peças'}
        subtitulo="Lista de peças em cotação, cotação com autopeças parceiras e geração do pedido de compra"
        badge={
          status === 'APROVADA'
            ? 'Cotação Aprovada'
            : status === 'RESPONDIDA'
            ? 'Propostas Recebidas'
            : 'Em Cotação'
        }
        icone={ShareNetwork}
        rodape={
          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {cotacaoParaEditar && (
                <button
                  type="button"
                  onClick={handleExcluirCotacaoAtual}
                  className="px-3 py-2 border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="Excluir esta cotação"
                >
                  <Trash size={15} />
                </button>
              )}
              <span className="text-xs text-slate-500 font-mono">
                {itens.length} {itens.length === 1 ? 'peça na lista' : 'peças na lista'}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSalvarCotacaoInterna}
                className="inline-flex items-center gap-2 px-4 py-2 border border-sky-300 bg-sky-50 hover:bg-sky-100 text-[#0284c7] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <FloppyDisk size={16} weight="bold" />
                <span>Salvar Cotação</span>
              </button>

              <button
                type="button"
                onClick={handleAprovarEGerarPedidoCompra}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title="Aprovar cotação e gerar o Pedido de Compra oficial"
              >
                <CheckCircle size={16} weight="bold" />
                <span>Aprovar Cotação e Gerar Pedido</span>
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {/* PAINEL 1: CABEÇALHO DO VEÍCULO E ORDEM DE SERVIÇO */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Car size={18} className="text-[#0284c7]" weight="bold" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Aplicação e Veículo da Cotação
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Código: <strong className="text-slate-900 font-bold">{idCotacao}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Vincular Ordem de Serviço (OS)
                </label>
                <Select
                  value={opcoesOS.find((o) => o.value === numeroOS) || opcoesOS[0]}
                  onChange={handleSelecionarOS}
                  options={opcoesOS}
                  styles={customSelectStyles}
                  placeholder="Selecione uma OS ou deixe avulso..."
                  isSearchable={true}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Placa do Veículo
                </label>
                <input
                  type="text"
                  value={veiculoPlaca}
                  onChange={(e) => setVeiculoPlaca(e.target.value.toUpperCase())}
                  placeholder="Ex: ASF6I46"
                  className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Ano / Modelo
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
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

          {/* PAINEL 2: A LISTA DE PEÇAS QUE ESTÁ EM COTAÇÃO */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-[#0284c7]" weight="bold" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Lista de Peças que Estão em Cotação ({itens.length} itens)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {numeroOS && (
                  <button
                    type="button"
                    onClick={handleImportarPecasDaOS}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-700 hover:text-[#0284c7] bg-slate-50 hover:bg-sky-50 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    title="Recarregar todas as peças cadastradas nesta Ordem de Serviço"
                  >
                    <ListBullets size={14} />
                    <span>Recarregar Peças da OS</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setMostrarNovoItem(!mostrarNovoItem)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus size={14} weight="bold" />
                  <span>Adicionar Peça</span>
                </button>
              </div>
            </div>

            {/* Formulário Inline de Nova Peça */}
            {mostrarNovoItem && (
              <div className="p-3.5 bg-sky-50/50 border border-sky-200 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-900">
                    Incluir Peça para Cotação
                  </span>
                  <button
                    type="button"
                    onClick={() => setMostrarNovoItem(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Fechar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                      Código SKU / Original
                    </label>
                    <input
                      type="text"
                      value={novoItemCodigo}
                      onChange={(e) => setNovoItemCodigo(e.target.value)}
                      placeholder="Ex: 0018969"
                      className="w-full h-8.5 px-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                      Nome / Descrição da Peça *
                    </label>
                    <input
                      type="text"
                      value={novoItemNome}
                      onChange={(e) => setNovoItemNome(e.target.value)}
                      placeholder="Ex: Tubo Suporte Arrefecimento"
                      className="w-full h-8.5 px-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Quantidade
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={novoItemQuantidade}
                        onChange={(e) => setNovoItemQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full h-8.5 px-2 rounded-lg border border-slate-300 text-xs font-bold text-center text-slate-900 bg-white focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Unidade
                      </label>
                      <input
                        type="text"
                        value={novoItemUnidade}
                        onChange={(e) => setNovoItemUnidade(e.target.value.toUpperCase())}
                        placeholder="UN"
                        className="w-full h-8.5 px-2 rounded-lg border border-slate-300 text-xs font-bold text-center text-slate-900 bg-white focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                      Marca Sugerida / Linha Preferencial
                    </label>
                    <input
                      type="text"
                      value={novoItemMarcaSugerida}
                      onChange={(e) => setNovoItemMarcaSugerida(e.target.value)}
                      placeholder="Ex: Valclei / Original Fiat"
                      className="w-full h-8.5 px-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                      Observação / Defeito Constatado pelo Mecânico
                    </label>
                    <input
                      type="text"
                      value={novoItemObservacoes}
                      onChange={(e) => setNovoItemObservacoes(e.target.value)}
                      placeholder="Ex: Fissura plástica com vazamento de água"
                      className="w-full h-8.5 px-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAdicionarItem}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <CheckCircle size={14} weight="bold" />
                    <span>Confirmar Peça na Cotação</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tabela da Lista de Peças em Cotação */}
            {itens.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <Package size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  Nenhuma peça incluída nesta cotação ainda.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Vincule uma Ordem de Serviço acima para importar as peças ou clique em "Adicionar Peça".
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
                      <th className="py-2.5 px-3 w-8 text-center">#</th>
                      <th className="py-2.5 px-3">Código SKU</th>
                      <th className="py-2.5 px-3">Peça / Descrição</th>
                      <th className="py-2.5 px-3 text-center">Qtd / Unidade</th>
                      <th className="py-2.5 px-3">Marca Sugerida</th>
                      <th className="py-2.5 px-3">Observação do Mecânico</th>
                      <th className="py-2.5 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {itens.map((it, idx) => (
                      <tr key={it.id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-400">
                          {idx + 1}
                        </td>

                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {it.codigo || 'S/N'}
                        </td>

                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {it.nome}
                        </td>

                        <td className="py-2.5 px-3 text-center font-mono font-bold text-[#0284c7]">
                          {it.quantidade} {it.unidade}
                        </td>

                        <td className="py-2.5 px-3 text-slate-600">
                          {it.marcaSugerida ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              <Tag size={10} className="text-slate-400" />
                              <span>{it.marcaSugerida}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Original / Primeira Linha</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-[11px] text-slate-500 max-w-xs truncate">
                          {it.observacoes || '-'}
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoverItem(it.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Remover peça da cotação"
                          >
                            <Trash size={14} />
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
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Buildings size={18} className="text-[#0284c7]" weight="bold" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Fornecedores e Autopeças em Cotação ({fornecedoresCotados.length})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Envie a cotação via WhatsApp ou preencha os preços ofertados pelos parceiros
                  </span>
                </div>
              </div>

              {/* Seletor para adicionar mais fornecedores */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="w-full sm:w-64">
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
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus size={14} weight="bold" />
                </button>
              </div>
            </div>

            {/* Cards dos Fornecedores Cotados */}
            <div className="space-y-3">
              {fornecedoresCotados.map((forn) => {
                const isVencedor = fornecedorVencedorId === forn.id
                const isExpandido = fornecedorExpandidoId === forn.id
                const isRespondida = forn.status === 'RESPONDIDA' && forn.valorTotal > 0

                return (
                  <div
                    key={forn.id}
                    className={`border rounded-xl p-3.5 transition-all ${
                      isVencedor
                        ? 'border-[#0284c7] bg-sky-50/40 shadow-xs ring-1 ring-[#0284c7]'
                        : isRespondida
                        ? 'border-slate-300 bg-white'
                        : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {forn.nome}
                          </span>
                          {isVencedor && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0284c7] text-white">
                              <CheckCircle size={12} weight="fill" />
                              <span>Fornecedor Vencedor</span>
                            </span>
                          )}
                          {isRespondida && !isVencedor && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                              <CheckCircle size={11} weight="bold" />
                              <span>Proposta Recebida</span>
                            </span>
                          )}
                          {!isRespondida && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock size={11} weight="bold" />
                              <span>Aguardando Resposta</span>
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                          <span>{forn.telefone}</span>
                          <span>•</span>
                          <span>Prazo: <strong className="text-slate-800">{forn.tempoEntrega || 'Imediato'}</strong></span>
                          <span>•</span>
                          <span>Condição: <strong className="text-slate-800">{forn.condicaoPagamento || 'Boleto 30 Dias'}</strong></span>
                        </div>
                      </div>

                      {/* Total e Ações Rápidas */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-right mr-2">
                          <span className="block text-[10px] uppercase font-bold text-slate-400">
                            Valor Total Cotado
                          </span>
                          <span className="text-sm font-bold font-mono text-slate-900">
                            {forn.valorTotal
                              ? `R$ ${Number(forn.valorTotal).toFixed(2)}`
                              : 'Aguardando...'}
                          </span>
                        </div>

                        {/* Botão WhatsApp */}
                        <button
                          type="button"
                          onClick={() => handleDispararWhatsApp(forn)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] rounded-lg text-xs font-bold transition-colors cursor-pointer border border-[#25D366]/30"
                          title="Enviar lista de peças via WhatsApp para a autopeça"
                        >
                          <WhatsappLogo size={15} weight="fill" className="text-[#25D366]" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </button>

                        {/* Botão Copiar Mensagem */}
                        <button
                          type="button"
                          onClick={() => handleCopiarLinkWhatsApp(forn)}
                          className="p-1.5 text-slate-600 hover:text-[#0284c7] hover:bg-sky-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          title="Copiar link e lista de peças formatada"
                        >
                          <Copy size={15} />
                        </button>

                        {/* Botão Link do Portal Externo */}
                        <a
                          href={`/cotacao/${idCotacao}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-600 hover:text-[#0284c7] hover:bg-sky-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          title="Abrir tela de cotação externa que a autopeça acessa"
                        >
                          <ArrowSquareOut size={15} />
                        </a>

                        {/* Botão Expandir / Inserir Preços */}
                        <button
                          type="button"
                          onClick={() => setFornecedorExpandidoId(isExpandido ? null : forn.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            isExpandido
                              ? 'bg-sky-50 border-sky-300 text-[#0284c7]'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <PencilSimple size={13} />
                          <span>Preços</span>
                          {isExpandido ? <CaretUp size={12} /> : <CaretDown size={12} />}
                        </button>

                        {/* Botão Escolher Como Vencedor */}
                        <button
                          type="button"
                          onClick={() => setFornecedorVencedorId(isVencedor ? null : forn.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            isVencedor
                              ? 'bg-[#0284c7] text-white hover:bg-[#0369a1]'
                              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                          title="Selecionar este fornecedor para gerar o pedido de compra"
                        >
                          <CheckCircle size={14} weight={isVencedor ? 'fill' : 'bold'} />
                          <span>{isVencedor ? 'Vencedor' : 'Escolher'}</span>
                        </button>

                        {/* Remover */}
                        <button
                          type="button"
                          onClick={() => handleRemoverFornecedor(forn.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remover fornecedor da cotação"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Grade de Preenchimento de Preços por Item */}
                    {isExpandido && (
                      <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700">
                            Preços ofertados por {forn.nome} para cada peça:
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Valores podem ser preenchidos diretamente aqui ou pelo link externo
                          </span>
                        </div>

                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-semibold">
                                <th className="py-2 px-3">Peça Solicitada</th>
                                <th className="py-2 px-3 text-center">Qtd</th>
                                <th className="py-2 px-3">Marca Ofertada</th>
                                <th className="py-2 px-3 w-32 text-right">Preço Unitário (R$)</th>
                                <th className="py-2 px-3 w-32 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {itens.map((it) => {
                                const resp = forn.respostasItens?.[it.id] || {}
                                const precoUnit = resp.preco || ''
                                const subtotal = precoUnit && !isNaN(Number(precoUnit))
                                  ? Number(precoUnit) * Number(it.quantidade || 1)
                                  : 0

                                return (
                                  <tr key={it.id}>
                                    <td className="py-2 px-3 font-semibold text-slate-900">
                                      {it.nome}
                                      {it.codigo && (
                                        <span className="text-[10px] text-slate-400 block font-mono">
                                          {it.codigo}
                                        </span>
                                      )}
                                    </td>

                                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">
                                      {it.quantidade} {it.unidade}
                                    </td>

                                    <td className="py-2 px-3">
                                      <input
                                        type="text"
                                        value={resp.marca || ''}
                                        onChange={(e) =>
                                          handleAtualizarPrecoFornecedor(forn.id, it.id, 'marca', e.target.value)
                                        }
                                        placeholder={it.marcaSugerida || 'Ex: Nakata'}
                                        className="w-full h-7.5 px-2 rounded border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
                                      />
                                    </td>

                                    <td className="py-2 px-3 text-right">
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={precoUnit}
                                        onChange={(e) =>
                                          handleAtualizarPrecoFornecedor(forn.id, it.id, 'preco', e.target.value)
                                        }
                                        placeholder="0,00"
                                        className="w-full h-7.5 px-2 rounded border border-slate-200 text-xs font-mono font-bold text-right text-slate-900 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
                                      />
                                    </td>

                                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                                      R$ {subtotal.toFixed(2)}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Prazo e Condições de Pagamento deste Fornecedor */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                              Prazo de Entrega Informado
                            </label>
                            <input
                              type="text"
                              value={forn.tempoEntrega || ''}
                              onChange={(e) =>
                                handleAtualizarDadosFornecedor(forn.id, 'tempoEntrega', e.target.value)
                              }
                              placeholder="Ex: 45 minutos (Motoboy)"
                              className="w-full h-8 px-2.5 rounded border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                              Condição de Pagamento Ofertada
                            </label>
                            <input
                              type="text"
                              value={forn.condicaoPagamento || ''}
                              onChange={(e) =>
                                handleAtualizarDadosFornecedor(forn.id, 'condicaoPagamento', e.target.value)
                              }
                              placeholder="Ex: Boleto 28 Dias ou PIX com 5% desconto"
                              className="w-full h-8 px-2.5 rounded border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
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

          {/* PAINEL 4: OBSERVAÇÕES E NOTAS INTERNAS */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Observações Gerais da Cotação
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Instruções para o comprador, urgência do veículo ou orientações para as autopeças parceiras..."
              className="w-full p-2.5 rounded-xl border border-[#d0d5dd] text-xs text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] resize-none"
            />
          </div>
        </div>
      </ModalRedimensionavel>

      {/* Diálogo de Confirmação de Exclusão na Frente do Formulário */}
      <ModalConfirmacao
        isOpen={confirmandoExclusaoCotacao}
        onClose={() => setConfirmandoExclusaoCotacao(false)}
        onConfirm={confirmarExclusaoCotacao}
        titulo="Excluir esta cotação?"
        descricao="Esta operação removerá o histórico e todas as respostas de fornecedores desta cotação."
        itemDestaque={cotacaoParaEditar?.id ? `Cotação: #${cotacaoParaEditar.id}` : ''}
        textoConfirmar="Sim, Excluir"
        textoCancelar="Cancelar"
        variante="perigo"
      />
    </>
  )
}
