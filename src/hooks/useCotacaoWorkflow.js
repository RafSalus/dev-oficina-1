import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { carregarTerceirosCadastrados } from '../constants/cadastrosSuprimentosData'
import {
  carregarCotacoes,
  salvarCotacao,
  gerarProximoNumeroCotacao,
  excluirCotacao,
  CHAVE_STORAGE_COTACOES,
} from '../constants/comprasData'
import { obterOrdensAbertas, atualizarPecasAposCotacao } from '../pages/dashboard/orcamento/mockOrdensAbertas'
import { criarFornecedoresIniciais, extrairTelefoneLimpo, itensCotacaoDaOS } from '../utils/compras/cotacaoHelpers'
import {
  DADOS_COTACAO_VAZIOS,
  dadosVeiculoDaOS,
  dadosDaCotacaoSalva,
  derivarStatusCotacao,
  resolverFornecedorVencedor,
  montarPedidoDaCotacao,
} from '../utils/compras/cotacaoPedido'
import {
  urlPublicaCotacao,
  textoCotacaoParaFornecedor,
  linkWhatsAppCotacao,
  copiarTexto,
} from '../utils/compras/mensagensWhatsApp'
import { useCotacaoFornecedores } from './useCotacaoFornecedores'

const NOME_FORNECEDOR_PADRAO = 'Auto Peças Parceira'

/** Procura a cotação pelo id nas cotações carregadas e, em último caso, direto no storage. */
function buscarCotacaoSalva(id) {
  const encontrada = carregarCotacoes().find((c) => String(c.id) === String(id))
  if (encontrada) return encontrada
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE_STORAGE_COTACOES) || '[]')
    return lista.find((c) => String(c.id) === String(id))
  } catch {
    return undefined
  }
}

/**
 * Workflow da tela dedicada de Cotação de Peças (Story 2.0 / ADR-003): carrega a
 * cotação (navigation state, id salvo ou nova com `?os=`/`?item=`/`?nome=`),
 * mantém veículo, peças e fornecedores, envia a lista por WhatsApp, salva,
 * aprova gerando o pedido de compra e exclui.
 *
 * @returns {object} Estado da cotação, `fornecedores` (de `useCotacaoFornecedores`),
 *   `modais` e `acoes` da tela.
 */
export function useCotacaoWorkflow() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'
  const isCotacaoExistente = Boolean(id && id !== 'nova')

  const [fornecedoresCadastrados, setFornecedoresCadastrados] = useState([])
  const [ordensAbertas, setOrdensAbertas] = useState([])

  const [idCotacao, setIdCotacao] = useState('')
  const [dados, setDados] = useState(DADOS_COTACAO_VAZIOS)
  const [status, setStatus] = useState('EM_COTACAO')
  const [dataCriacao, setDataCriacao] = useState('')
  const [itens, setItens] = useState([])
  const fornecedores = useCotacaoFornecedores({ itens, fornecedoresCadastrados })

  const [modalCompraAberto, setModalCompraAberto] = useState(false)
  const [dadosPedidoParaGerar, setDadosPedidoParaGerar] = useState(null)
  const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)

  useEffect(() => {
    const terceiros = carregarTerceirosCadastrados()
    const ordens = obterOrdensAbertas()
    setFornecedoresCadastrados(terceiros)
    setOrdensAbertas(ordens)

    // 1. Cotação pronta no navigation state; 2. cotação salva pelo id
    const encontrada = location.state?.cotacao || (isCotacaoExistente ? buscarCotacaoSalva(id) : null)
    if (encontrada) {
      setIdCotacao(encontrada.id)
      setDados(dadosDaCotacaoSalva(encontrada))
      setStatus(encontrada.status || 'EM_COTACAO')
      setDataCriacao(encontrada.dataCriacao || new Date().toISOString())
      setItens(Array.isArray(encontrada.itens) ? encontrada.itens : [])
      fornecedores.carregar(
        Array.isArray(encontrada.fornecedoresCotados)
          ? encontrada.fornecedoresCotados
          : criarFornecedoresIniciais(terceiros, NOME_FORNECEDOR_PADRAO),
        encontrada.fornecedorVencedorId || null
      )
      return
    }

    // 3. Cotação nova, opcionalmente pré-preenchida pela OS da query string
    const query = new URLSearchParams(location.search)
    const osParam = query.get('os') || ''
    const itemParam = query.get('item') || ''
    const nomeParam = query.get('nome') || ''

    setIdCotacao(isCotacaoExistente ? id : gerarProximoNumeroCotacao())
    setDataCriacao(new Date().toISOString())
    setStatus('EM_COTACAO')

    if (osParam) {
      const os = ordens.find((o) => String(o.numeroOS) === String(osParam))
      if (os) {
        setDados({ ...dadosVeiculoDaOS(os), observacoes: `Cotação de peças para a Ordem de Serviço #${os.numeroOS}` })
        if (os.pecasOS?.length > 0) {
          setItens(itensCotacaoDaOS(os))
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
      setDados(DADOS_COTACAO_VAZIOS)
      setItens([])
    }

    fornecedores.carregar(criarFornecedoresIniciais(terceiros, NOME_FORNECEDOR_PADRAO), null)
    // `fornecedores.carregar` só usa setters estáveis; recarrega apenas quando a rota muda.
  }, [id, location.search, location.state])

  const opcoesOS = useMemo(
    () => [
      { value: '', label: 'Sem OS vinculada (Reposição de Almoxarifado)' },
      ...ordensAbertas.map((os) => ({
        value: String(os.numeroOS),
        label: `OS #${os.numeroOS} • ${os.placa} • ${os.marcaModelo || os.modelo || 'Veículo'} (${os.cliente})`,
        dadosOS: os,
      })),
    ],
    [ordensAbertas]
  )

  const atualizarCampo = (campo, valor) => setDados((prev) => ({ ...prev, [campo]: valor }))

  const selecionarOS = (opcao) => {
    if (!opcao || !opcao.value) {
      atualizarCampo('numeroOS', '')
      return
    }
    const os = opcao.dadosOS
    setDados((prev) => ({ ...prev, ...dadosVeiculoDaOS(os) }))
    // Se a cotação ainda não tem peças, importa as peças da OS
    if (itens.length === 0 && os.pecasOS?.length > 0) {
      const novas = itensCotacaoDaOS(os)
      setItens(novas)
      toast.info(`${novas.length} peças da OS #${os.numeroOS} foram importadas para a cotação.`)
    }
  }

  const recarregarPecasDaOS = () => {
    if (!dados.numeroOS) {
      toast.warning('Selecione uma Ordem de Serviço primeiro.')
      return
    }
    const os = ordensAbertas.find((o) => String(o.numeroOS) === String(dados.numeroOS))
    if (!os?.pecasOS?.length) {
      toast.warning('Esta Ordem de Serviço não possui peças registradas.')
      return
    }
    const novas = itensCotacaoDaOS(os)
    setItens(novas)
    toast.success(`${novas.length} peças da OS #${dados.numeroOS} recarregadas com sucesso!`)
  }

  /**
   * Inclui uma peça digitada no formulário rápido.
   * @returns {boolean} true quando a peça foi incluída (o formulário deve ser limpo).
   */
  const adicionarItem = (form) => {
    if (!form.nome.trim()) {
      toast.error('Informe o nome ou descrição da peça.')
      return false
    }
    const item = {
      id: `it-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      codigo: form.codigo.trim() || 'SKU-S/N',
      nome: form.nome.trim(),
      quantidade: Number(form.quantidade) || 1,
      unidade: form.unidade || 'UN',
      marcaSugerida: form.marcaSugerida.trim(),
      observacoes: form.observacoes.trim(),
      fotoUrl: '',
    }
    setItens((prev) => [...prev, item])
    toast.success(`Peça "${item.nome}" incluída na cotação!`)
    return true
  }

  const removerItem = (itemId) => {
    setItens((prev) => prev.filter((it) => it.id !== itemId))
    fornecedores.removerRespostasDoItem(itemId)
    toast.info('Peça removida da lista.')
  }

  const montarObjetoCotacao = () => ({
    id: idCotacao || gerarProximoNumeroCotacao(),
    ...dados,
    status: derivarStatusCotacao(fornecedores.fornecedoresCotados, fornecedores.fornecedorVencedorId),
    itens,
    fornecedoresCotados: fornecedores.fornecedoresCotados,
    fornecedorVencedorId: fornecedores.fornecedorVencedorId,
    dataCriacao: dataCriacao || new Date().toISOString(),
  })

  const dadosMensagem = { ...dados, itens }
  const dispararWhatsApp = (fornecedor) =>
    window.open(
      linkWhatsAppCotacao(extrairTelefoneLimpo(fornecedor), fornecedor, dadosMensagem, urlPublicaCotacao(idCotacao)),
      '_blank'
    )

  const copiarMensagemWhatsApp = (fornecedor) =>
    copiarTexto(textoCotacaoParaFornecedor(fornecedor, dadosMensagem, urlPublicaCotacao(idCotacao)), {
      sucesso: () => toast.success(`Mensagem e link copiados! Pronto para colar no WhatsApp de ${fornecedor.nome}.`),
      erro: () => toast.error('Erro ao copiar mensagem.'),
    })

  // Ao salvar a cotação, volta para a tela de origem
  const voltar = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate(`${basePath}/compras`, { state: { aba: 'cotacoes' } })
  }

  const salvar = () => {
    if (itens.length === 0) {
      toast.warning('Adicione ao menos uma peça na lista de cotação.')
      return
    }
    const cotacao = montarObjetoCotacao()
    salvarCotacao(cotacao)
    toast.success(`Cotação #${cotacao.id} salva com sucesso!`)
    voltar()
  }

  const abrirVisualizacao = () => {
    salvarCotacao(montarObjetoCotacao())
    setModalVisualizarAberto(true)
  }

  const aprovarEGerarPedido = () => {
    if (itens.length === 0) {
      toast.warning('A cotação precisa conter ao menos uma peça.')
      return
    }
    const vencedor = resolverFornecedorVencedor(fornecedores.fornecedoresCotados, fornecedores.fornecedorVencedorId)
    if (!vencedor) {
      toast.warning('Inclua ao menos um fornecedor para aprovar a cotação.')
      return
    }
    try {
      const cotacao = {
        ...montarObjetoCotacao(),
        status: 'APROVADA',
        fornecedorVencedorId: vencedor.id,
        fornecedorVencedorNome: vencedor.nome,
      }
      salvarCotacao(cotacao)
      // Abre o pedido de compra pré-preenchido para conferência final
      setDadosPedidoParaGerar(montarPedidoDaCotacao(cotacao, vencedor))
      setModalCompraAberto(true)
      toast.success(
        `Cotação #${cotacao.id} aprovada! Revise e conclua a emissão do Pedido de Compra para ${vencedor.nome}.`
      )
    } catch (err) {
      toast.error(err.message || 'Erro ao aprovar cotação.')
    }
  }

  const concluirPedidoCompra = (dadosPedido) => {
    setModalCompraAberto(false)
    // Fecha o ciclo com a OS de origem: aplica o preço final negociado nas peças que
    // estavam marcadas "Para Cotação" e avisa para mover a OS manualmente no Kanban —
    // igual a toda outra transição de status no sistema, a decisão fica com a secretaria.
    const osAtualizada =
      dadosPedido.numeroOS &&
      atualizarPecasAposCotacao(dadosPedido.numeroOS, dadosPedido.itens, dadosPedido.fornecedorNome)
    toast.success(
      osAtualizada
        ? `Pedido de Compra ${dadosPedido.numeroPedido} emitido! Preços atualizados na OS #${dadosPedido.numeroOS} — mova-a para "Aprovação" no Kanban quando as peças chegarem.`
        : `Pedido de Compra ${dadosPedido.numeroPedido} emitido com sucesso!`
    )
    navigate(`${basePath}/compras`)
  }

  const confirmarExclusao = () => {
    if (!idCotacao) return
    excluirCotacao(idCotacao)
    toast.success(`Cotação #${idCotacao} excluída com sucesso.`)
    setConfirmandoExclusao(false)
    navigate(`${basePath}/compras`)
  }

  return {
    idCotacao,
    isCotacaoExistente,
    dados,
    status,
    itens,
    opcoesOS,
    fornecedores,
    montarObjetoCotacao,
    modais: {
      modalCompraAberto,
      dadosPedidoParaGerar,
      fecharModalCompra: () => {
        setModalCompraAberto(false)
        setDadosPedidoParaGerar(null)
      },
      modalVisualizarAberto,
      fecharVisualizacao: () => setModalVisualizarAberto(false),
      confirmandoExclusao,
      fecharExclusao: () => setConfirmandoExclusao(false),
    },
    acoes: {
      atualizarCampo,
      selecionarOS,
      recarregarPecasDaOS,
      adicionarItem,
      removerItem,
      dispararWhatsApp,
      copiarMensagemWhatsApp,
      voltar,
      salvar,
      abrirVisualizacao,
      aprovarEGerarPedido,
      concluirPedidoCompra,
      pedirExclusao: () => idCotacao && setConfirmandoExclusao(true),
      confirmarExclusao,
    },
  }
}
