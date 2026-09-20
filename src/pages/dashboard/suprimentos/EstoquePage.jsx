import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Select from 'react-select'
import {
  Package,
  Plus,
  MagnifyingGlass,
  ArrowsLeftRight,
  PencilSimple,
  Archive,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowsClockwise,
  WarningCircle,
  CurrencyDollar,
  TrendUp,
  ShoppingCart,
  Copy,
  CheckCircle,
  ClockCounterClockwise,
  ListBullets,
  SquaresFour,
  MapPin,
  Tag,
  ShareNetwork,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarPecasCadastradas,
  salvarPecasCadastradas,
  carregarMovimentacoesEstoque,
  carregarTerceirosCadastrados,
  CATEGORIAS_PECAS_OPCOES,
} from '../../../constants/cadastrosSuprimentosData'
import {
  gerarProximoNumeroCotacao,
  salvarCotacao,
} from '../../../constants/comprasData'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'
import { PecaModalForm } from '../../../components/suprimentos/PecaModalForm'
import { EstoqueMovimentoModal } from '../../../components/suprimentos/EstoqueMovimentoModal'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { MobileEstoquePage } from './mobile/MobileEstoquePage'

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

export function EstoquePage() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'

  const [abaAtiva, setAbaAtiva] = useState('posicao') // 'posicao' | 'kardex' | 'reposicao'

  // Dados sincronizados
  const [pecas, setPecas] = useState([])
  const [movimentacoes, setMovimentacoes] = useState([])

  // Filtros da aba de Posição
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS')
  const [filtroStatusEstoque, setFiltroStatusEstoque] = useState('TODOS')
  const [filtroOrdenacao, setFiltroOrdenacao] = useState('NOME_ASC')

  // Filtros da aba de Movimentações (Kardex)
  const [buscaKardex, setBuscaKardex] = useState('')
  const [filtroTipoMovimento, setFiltroTipoMovimento] = useState('TODOS')

  // Modais
  const [modalNovaPecaAberto, setModalNovaPecaAberto] = useState(false)
  const [pecaParaEditar, setPecaParaEditar] = useState(null)
  const [modalMovimentoAberto, setModalMovimentoAberto] = useState(false)
  const [pecaParaMovimento, setPecaParaMovimento] = useState(null)

  // Carrega e sincroniza dados em tempo real
  useEffect(() => {
    const carregarTudo = () => {
      setPecas(carregarPecasCadastradas())
      setMovimentacoes(carregarMovimentacoesEstoque())
    }
    carregarTudo()

    window.addEventListener('storage', carregarTudo)
    window.addEventListener('dev_oficina_pecas_updated', carregarTudo)
    window.addEventListener('dev_oficina_estoque_updated', carregarTudo)
    window.addEventListener('dev_oficina_movimentacoes_updated', carregarTudo)

    return () => {
      window.removeEventListener('storage', carregarTudo)
      window.removeEventListener('dev_oficina_pecas_updated', carregarTudo)
      window.removeEventListener('dev_oficina_estoque_updated', carregarTudo)
      window.removeEventListener('dev_oficina_movimentacoes_updated', carregarTudo)
    }
  }, [])

  // Indicadores Executivos Gerais
  const metricas = useMemo(() => {
    const totalItens = pecas.length
    const totalUnidades = pecas.reduce((acc, p) => acc + (Number(p.estoqueAtual) || 0), 0)
    const valorCustoTotal = pecas.reduce(
      (acc, p) => acc + (Number(p.precoCusto) || 0) * (Number(p.estoqueAtual) || 0),
      0
    )
    const valorVendaTotal = pecas.reduce(
      (acc, p) => acc + (Number(p.precoVenda) || 0) * (Number(p.estoqueAtual) || 0),
      0
    )
    const itensAbaixoMinimo = pecas.filter((p) => {
      const atual = Number(p.estoqueAtual) || 0
      const min = Number(p.estoqueMinimo) || 0
      return atual <= min && atual > 0
    }).length
    const itensZerados = pecas.filter((p) => (Number(p.estoqueAtual) || 0) <= 0).length
    const itensReposicaoTotal = itensAbaixoMinimo + itensZerados

    return {
      totalItens,
      totalUnidades,
      valorCustoTotal: valorCustoTotal.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      valorVendaTotal: valorVendaTotal.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      itensAbaixoMinimo,
      itensZerados,
      itensReposicaoTotal,
    }
  }, [pecas])

  // Filtragem da Lista de Posição de Estoque
  const pecasFiltradas = useMemo(() => {
    return pecas
      .filter((peca) => {
        const termo = busca.toLowerCase().trim()
        const matchBusca =
          !termo ||
          peca.nome?.toLowerCase().includes(termo) ||
          peca.codigo?.toLowerCase().includes(termo) ||
          peca.codigoFabricante?.toLowerCase().includes(termo) ||
          peca.categoria?.toLowerCase().includes(termo) ||
          peca.localizacao?.toLowerCase().includes(termo) ||
          peca.gtin?.toLowerCase().includes(termo)

        const matchCategoria =
          filtroCategoria === 'TODAS' || peca.categoria === filtroCategoria

        const atual = Number(peca.estoqueAtual) || 0
        const min = Number(peca.estoqueMinimo) || 0

        let matchStatus = true
        if (filtroStatusEstoque === 'ADEQUADO') {
          matchStatus = atual > min
        } else if (filtroStatusEstoque === 'REPOSICAO') {
          matchStatus = atual <= min && atual > 0
        } else if (filtroStatusEstoque === 'ZERADO') {
          matchStatus = atual <= 0
        } else if (filtroStatusEstoque === 'ALERTA_GERAL') {
          matchStatus = atual <= min
        }

        return matchBusca && matchCategoria && matchStatus
      })
      .sort((a, b) => {
        const atualA = Number(a.estoqueAtual) || 0
        const atualB = Number(b.estoqueAtual) || 0
        const custoA = (Number(a.precoCusto) || 0) * atualA
        const custoB = (Number(b.precoCusto) || 0) * atualB

        if (filtroOrdenacao === 'NOME_ASC') return a.nome.localeCompare(b.nome)
        if (filtroOrdenacao === 'NOME_DESC') return b.nome.localeCompare(a.nome)
        if (filtroOrdenacao === 'MAIOR_ESTOQUE') return atualB - atualA
        if (filtroOrdenacao === 'MENOR_ESTOQUE') return atualA - atualB
        if (filtroOrdenacao === 'MAIOR_VALOR') return custoB - custoA
        return 0
      })
  }, [pecas, busca, filtroCategoria, filtroStatusEstoque, filtroOrdenacao])

  // Lista de Reposição Sugerida
  const itensReposicao = useMemo(() => {
    return pecas
      .filter((p) => {
        const atual = Number(p.estoqueAtual) || 0
        const min = Number(p.estoqueMinimo) || 0
        return atual <= min
      })
      .map((p) => {
        const atual = Number(p.estoqueAtual) || 0
        const min = Number(p.estoqueMinimo) || 0
        const deficit = Math.max(0, min - atual)
        // Quantidade sugerida para dobrar a segurança ou cobrir o mínimo
        const sugestaoCompra = deficit > 0 ? deficit + min : min
        const custoEstimado = sugestaoCompra * (Number(p.precoCusto) || 0)

        return {
          ...p,
          atual,
          min,
          deficit,
          sugestaoCompra,
          custoEstimado,
        }
      })
      .sort((a, b) => a.atual - b.atual)
  }, [pecas])

  const totalInvestimentoReposicao = useMemo(() => {
    const soma = itensReposicao.reduce((acc, item) => acc + item.custoEstimado, 0)
    return soma.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }, [itensReposicao])

  // Filtragem das Movimentações (Kardex)
  const movimentacoesFiltradas = useMemo(() => {
    return movimentacoes.filter((mov) => {
      const termo = buscaKardex.toLowerCase().trim()
      const matchBusca =
        !termo ||
        mov.pecaNome?.toLowerCase().includes(termo) ||
        mov.pecaCodigo?.toLowerCase().includes(termo) ||
        mov.documento?.toLowerCase().includes(termo) ||
        mov.motivo?.toLowerCase().includes(termo) ||
        mov.responsavel?.toLowerCase().includes(termo)

      const matchTipo =
        filtroTipoMovimento === 'TODOS' || mov.tipo === filtroTipoMovimento

      return matchBusca && matchTipo
    })
  }, [movimentacoes, buscaKardex, filtroTipoMovimento])

  // Opções para Dropdowns (Regra 6: react-select obrigatório)
  const opcoesCategorias = [
    { value: 'TODAS', label: 'Todas as Categorias' },
    ...CATEGORIAS_PECAS_OPCOES,
  ]

  const opcoesStatusEstoque = [
    { value: 'TODOS', label: 'Todos os Níveis' },
    { value: 'ADEQUADO', label: 'Estoque Adequado' },
    { value: 'ALERTA_GERAL', label: 'Alerta de Reposição e Zerados' },
    { value: 'REPOSICAO', label: 'No ou Abaixo do Mínimo' },
    { value: 'ZERADO', label: 'Esgotados / Zerados' },
  ]

  const opcoesOrdenacao = [
    { value: 'NOME_ASC', label: 'Nome (A - Z)' },
    { value: 'NOME_DESC', label: 'Nome (Z - A)' },
    { value: 'MAIOR_ESTOQUE', label: 'Maior Quantidade' },
    { value: 'MENOR_ESTOQUE', label: 'Menor Quantidade' },
    { value: 'MAIOR_VALOR', label: 'Maior Valor em Estoque' },
  ]

  const opcoesTipoMovimento = [
    { value: 'TODOS', label: 'Todos os Tipos' },
    { value: 'ENTRADA', label: 'Entradas (+)' },
    { value: 'SAIDA', label: 'Saídas (-)' },
    { value: 'AJUSTE', label: 'Ajustes de Balanço (=)' },
  ]

  // Handlers de Ações
  const handleAbrirMovimentoGeral = () => {
    setPecaParaMovimento(null)
    setModalMovimentoAberto(true)
  }

  const handleMovimentarPeca = (peca) => {
    setPecaParaMovimento(peca)
    setModalMovimentoAberto(true)
  }

  const handleAbrirKardexPeca = (codigoPeca) => {
    setBuscaKardex(codigoPeca)
    setAbaAtiva('kardex')
  }

  const handleAbrirEditarPeca = (peca) => {
    setPecaParaEditar(peca)
    setModalNovaPecaAberto(true)
  }

  const handleSalvarPeca = (dadosPeca) => {
    let novaLista = []
    const existe = pecas.some((p) => p.id === dadosPeca.id)

    if (existe) {
      novaLista = pecas.map((p) => (p.id === dadosPeca.id ? dadosPeca : p))
      toast.success(`Peça "${dadosPeca.nome}" atualizada com sucesso!`)
    } else {
      novaLista = [dadosPeca, ...pecas]
      toast.success(`Peça "${dadosPeca.nome}" cadastrada com sucesso!`)
    }

    setPecas(novaLista)
    salvarPecasCadastradas(novaLista)
  }

  const handleCopiarListaReposicao = () => {
    if (itensReposicao.length === 0) {
      toast.info('Não há itens com necessidade de reposição no momento.')
      return
    }

    let texto = `*PEDIDO DE REPOSIÇÃO DE ESTOQUE - MECÂNICA GABRIEL*\nData: ${new Date().toLocaleDateString(
      'pt-BR'
    )}\n\n`

    itensReposicao.forEach((item, idx) => {
      texto += `${idx + 1}. [${item.codigo}] ${item.nome}\n   - Atual: ${item.atual} | Mín: ${
        item.min
      }\n   - Sugestão de Compra: *${item.sugestaoCompra} ${item.unidade || 'UN'}*\n\n`
    })

    texto += `Total de Itens: ${itensReposicao.length}\nEstimativa de Investimento: R$ ${totalInvestimentoReposicao}`

    navigator.clipboard
      .writeText(texto)
      .then(() => {
        toast.success('Lista de reposição copiada para a área de transferência com sucesso!')
      })
      .catch(() => {
        toast.error('Erro ao copiar a lista de reposição.')
      })
  }

  // Ação da Aba de Reposição - Redireciona para Tela Dedicada de Cotação
  const handleCotarReposicao = (item) => {
    try {
      if (!item) {
        toast.warning('Item não informado para cotação.')
        return
      }

      const novaId = gerarProximoNumeroCotacao()
      const terceiros = carregarTerceirosCadastrados()
      const autoPecas = filtrarFornecedoresAutoPecas(terceiros)
      const fornecedoresBase = autoPecas.length > 0 ? autoPecas.slice(0, 3) : terceiros.slice(0, 3)

      const fornecedoresIniciais = fornecedoresBase.map((t) => ({
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

      const novaCotacao = {
        id: novaId,
        numeroOS: '',
        clienteNome: 'Almoxarifado Central',
        clienteTelefone: '(43) 3456-7890',
        veiculoPlaca: 'OFICINA',
        veiculoModelo: 'Reposição de Almoxarifado',
        ano: '',
        km: '',
        mecanicoNome: 'Rafael Almoxarife',
        status: 'EM_COTACAO',
        observacoes: `Cotação de reposição de estoque mínimo (${item.nome || 'Item'})`,
        itens: [
          {
            id: `it-${Date.now()}`,
            codigo: item.codigo || item.sku || '',
            nome: item.nome || item.descricao || 'Item de Reposição',
            unidade: item.unidade || 'UN',
            quantidade: Number(item.sugestaoCompra || item.sugestao || item.deficit || 1),
            marcaSugerida: item.marca || item.fabricante || '',
            observacoes: `Reposição de almoxarifado (Estoque atual: ${item.atual ?? item.estoqueAtual ?? 0} ${item.unidade || 'UN'})`,
            fotoUrl: '',
          },
        ],
        fornecedoresCotados: fornecedoresIniciais,
        fornecedorVencedorId: null,
        dataCriacao: new Date().toISOString(),
      }

      salvarCotacao(novaCotacao)
      toast.info(`Abrindo tela dedicada para cotar reposição de ${item.nome}.`)
      navigate(`${basePath}/compras/cotacao/${novaId}`, { state: { cotacao: novaCotacao } })
    } catch (err) {
      console.error('Erro ao abrir cotação de reposição no estoque:', err)
      toast.error('Erro ao abrir a tela de cotação.')
    }
  }

  const handleCotarTodasReposicoes = () => {
    try {
      if (itensReposicao.length === 0) {
        toast.info('Não há itens com necessidade de reposição no momento.')
        return
      }

      const novaId = gerarProximoNumeroCotacao()
      const terceiros = carregarTerceirosCadastrados()
      const autoPecas = filtrarFornecedoresAutoPecas(terceiros)
      const fornecedoresBase = autoPecas.length > 0 ? autoPecas.slice(0, 3) : terceiros.slice(0, 3)

      const fornecedoresIniciais = fornecedoresBase.map((t) => ({
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

      const itensFormatados = itensReposicao.map((item, idx) => ({
        id: `it-${Date.now()}-${idx}`,
        codigo: item.codigo || item.sku || '',
        nome: item.nome || item.descricao || 'Item de Reposição',
        unidade: item.unidade || 'UN',
        quantidade: Number(item.sugestaoCompra || item.sugestao || item.deficit || 1),
        marcaSugerida: item.marca || item.fabricante || '',
        observacoes: `Reposição de almoxarifado (Estoque atual: ${item.atual ?? item.estoqueAtual ?? 0} ${item.unidade || 'UN'})`,
        fotoUrl: '',
      }))

      const novaCotacao = {
        id: novaId,
        numeroOS: '',
        clienteNome: 'Almoxarifado Central',
        clienteTelefone: '(43) 3456-7890',
        veiculoPlaca: 'OFICINA',
        veiculoModelo: 'Reposição Completa de Almoxarifado',
        ano: '',
        km: '',
        mecanicoNome: 'Rafael Almoxarife',
        status: 'EM_COTACAO',
        observacoes: `Cotação de reposição do almoxarifado (${itensFormatados.length} itens)`,
        itens: itensFormatados,
        fornecedoresCotados: fornecedoresIniciais,
        fornecedorVencedorId: null,
        dataCriacao: new Date().toISOString(),
      }

      salvarCotacao(novaCotacao)
      toast.info(`Abrindo cotação agrupada com ${itensFormatados.length} peças para reposição.`)
      navigate(`${basePath}/compras/cotacao/${novaId}`, { state: { cotacao: novaCotacao } })
    } catch (err) {
      console.error('Erro ao abrir cotação agrupada no estoque:', err)
      toast.error('Erro ao abrir tela de cotação.')
    }
  }

  if (isMobile) {
    return <MobileEstoquePage />
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Top Header Executivo */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center border border-sky-100 shrink-0">
              <Archive size={22} weight="bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Estoque e Almoxarifado</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {metricas.totalItens} itens
                </span>
                {metricas.itensReposicaoTotal > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {metricas.itensReposicaoTotal} repor
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500">
                Inventário físico, movimentações auditadas de entrada e saída, localização e sugestão de reposição
              </p>
            </div>
          </div>

          {/* Botões de Ação Únicos e Não Redundantes (Regra 12) */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate(`${basePath}/pecas`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Acessar catálogo completo de Peças e Produtos"
            >
              <Package size={16} className="text-slate-500" />
              <span className="hidden md:inline">Catálogo de Peças</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPecaParaEditar(null)
                setModalNovaPecaAberto(true)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Cadastrar nova peça no almoxarifado"
            >
              <Plus size={16} weight="bold" className="text-sky-600" />
              <span>Nova Peça</span>
            </button>

            <button
              type="button"
              onClick={handleAbrirMovimentoGeral}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Registrar entrada, saída ou ajuste de inventário"
            >
              <ArrowsLeftRight size={16} weight="bold" />
              <span>Movimentar Estoque</span>
            </button>
          </div>
        </div>

        {/* Resumo de Indicadores Financeiros e Quantitativos (Sem verde - Regra 7) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Unidades Físicas
              </span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {metricas.totalUnidades} un
              </span>
            </div>
            <Package size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Valor em Estoque (Custo)
              </span>
              <span className="text-base font-bold text-slate-900 font-mono">
                R$ {metricas.valorCustoTotal}
              </span>
            </div>
            <CurrencyDollar size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Potencial de Venda
              </span>
              <span className="text-base font-bold text-sky-700 font-mono">
                R$ {metricas.valorVendaTotal}
              </span>
            </div>
            <TrendUp size={20} className="text-sky-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Alerta de Reposição
              </span>
              <span
                className={`text-base font-bold ${
                  metricas.itensAbaixoMinimo > 0 ? 'text-amber-600' : 'text-slate-900'
                }`}
              >
                {metricas.itensAbaixoMinimo} {metricas.itensAbaixoMinimo === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <WarningCircle
              size={20}
              className={metricas.itensAbaixoMinimo > 0 ? 'text-amber-500' : 'text-slate-400'}
            />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Itens Zerados
              </span>
              <span
                className={`text-base font-bold ${
                  metricas.itensZerados > 0 ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {metricas.itensZerados} {metricas.itensZerados === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <WarningCircle
              size={20}
              className={metricas.itensZerados > 0 ? 'text-rose-500' : 'text-slate-400'}
            />
          </div>
        </div>

        {/* Abas de Navegação do Módulo */}
        <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setAbaAtiva('posicao')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              abaAtiva === 'posicao'
                ? 'bg-sky-50 text-[#0284c7] border border-sky-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ListBullets size={15} weight="bold" />
            <span>Posição do Almoxarifado</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white border border-slate-200">
              {pecasFiltradas.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('kardex')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              abaAtiva === 'kardex'
                ? 'bg-sky-50 text-[#0284c7] border border-sky-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ClockCounterClockwise size={15} weight="bold" />
            <span>Histórico de Movimentações (Kardex)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white border border-slate-200">
              {movimentacoes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('reposicao')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              abaAtiva === 'reposicao'
                ? 'bg-sky-50 text-[#0284c7] border border-sky-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingCart size={15} weight="bold" />
            <span>Sugestão de Reposição e Compras</span>
            {itensReposicao.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
                {itensReposicao.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ABA 1: POSIÇÃO DO ALMOXARIFADO */}
      {abaAtiva === 'posicao' && (
        <>
          {/* Barra de Filtros */}
          <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col lg:flex-row items-center gap-3 shrink-0">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por código SKU, nome, GTIN/EAN, código de fabricante ou localização física..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              />
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="w-full sm:w-44">
                <Select
                  value={opcoesCategorias.find((opt) => opt.value === filtroCategoria)}
                  onChange={(opt) => setFiltroCategoria(opt ? opt.value : 'TODAS')}
                  options={opcoesCategorias}
                  styles={customSelectStyles}
                  placeholder="Categoria"
                  isSearchable={true}
                />
              </div>

              <div className="w-full sm:w-48">
                <Select
                  value={opcoesStatusEstoque.find((opt) => opt.value === filtroStatusEstoque)}
                  onChange={(opt) => setFiltroStatusEstoque(opt ? opt.value : 'TODOS')}
                  options={opcoesStatusEstoque}
                  styles={customSelectStyles}
                  placeholder="Nível de Estoque"
                  isSearchable={false}
                />
              </div>

              <div className="w-full sm:w-48">
                <Select
                  value={opcoesOrdenacao.find((opt) => opt.value === filtroOrdenacao)}
                  onChange={(opt) => setFiltroOrdenacao(opt ? opt.value : 'NOME_ASC')}
                  options={opcoesOrdenacao}
                  styles={customSelectStyles}
                  placeholder="Ordenar por"
                  isSearchable={false}
                />
              </div>
            </div>
          </div>

          {/* Tabela de Estoque com Scroll Invisível (Regra 11) */}
          <div className="flex-1 overflow-auto no-scrollbar p-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              {pecasFiltradas.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Package size={24} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">Nenhum item localizado no estoque</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {busca || filtroCategoria !== 'TODAS' || filtroStatusEstoque !== 'TODOS'
                      ? 'Nenhum item corresponde aos critérios de pesquisa e filtros selecionados.'
                      : 'Nenhuma peça cadastrada no almoxarifado até o momento.'}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                      <th className="py-3 px-4">Código SKU / Fab.</th>
                      <th className="py-3 px-4">Peça e Categoria</th>
                      <th className="py-3 px-4">Local no Almoxarifado</th>
                      <th className="py-3 px-4 text-center">Nível de Estoque</th>
                      <th className="py-3 px-4 text-center">Situação</th>
                      <th className="py-3 px-4 text-right">Custo Unit.</th>
                      <th className="py-3 px-4 text-right">Total em Estoque</th>
                      <th className="py-3 px-4 text-right">Venda Unit.</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {pecasFiltradas.map((peca) => {
                      const estoqueAtual = Number(peca.estoqueAtual) || 0
                      const estoqueMinimo = Number(peca.estoqueMinimo) || 0
                      const valorTotalItem = estoqueAtual * (Number(peca.precoCusto) || 0)
                      const estaZerado = estoqueAtual <= 0
                      const estaNoMinimoOuAbaixo = estoqueAtual <= estoqueMinimo && !estaZerado

                      // Porcentagem para preenchimento visual elegante
                      const proporcao = estoqueMinimo > 0 ? Math.min(100, Math.round((estoqueAtual / (estoqueMinimo * 2)) * 100)) : 100

                      return (
                        <tr
                          key={peca.id}
                          className="hover:bg-slate-50/70 transition-colors group"
                        >
                          <td className="py-3 px-4 font-mono">
                            <div className="font-semibold text-slate-900">{peca.codigo}</div>
                            {peca.codigoFabricante && (
                              <div className="text-[11px] text-slate-400">
                                Fab: {peca.codigoFabricante}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-semibold text-slate-900">{peca.nome}</div>
                            <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                                {peca.categoria || 'Geral'}
                              </span>
                              <span className="font-mono font-medium text-slate-600">[{peca.unidade || 'UN'}]</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                              <MapPin size={14} className="text-slate-400 shrink-0" />
                              <span>{peca.localizacao || 'Almoxarifado Central'}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center min-w-[140px]">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-mono font-bold text-slate-900 text-sm">
                                {estoqueAtual}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                / mín {estoqueMinimo} {peca.unidade || 'UN'}
                              </span>
                            </div>
                            {/* Barra de progresso visual sutil */}
                            <div className="w-24 mx-auto mt-1.5 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${proporcao}%` }}
                                className={`h-full rounded-full transition-all ${
                                  estaZerado
                                    ? 'bg-rose-500'
                                    : estaNoMinimoOuAbaixo
                                    ? 'bg-amber-500'
                                    : 'bg-[#0284c7]'
                                }`}
                              />
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            {estaZerado ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Zerado
                              </span>
                            ) : estaNoMinimoOuAbaixo ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Reposição
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-[#0284c7] border border-sky-200">
                                Adequado
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right font-mono text-slate-600">
                            R$ {Number(peca.precoCusto || 0).toFixed(2)}
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            R$ {valorTotalItem.toFixed(2)}
                          </td>

                          <td className="py-3 px-4 text-right font-mono text-slate-700">
                            R$ {Number(peca.precoVenda || 0).toFixed(2)}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1 justify-end">
                              <button
                                type="button"
                                onClick={() => handleMovimentarPeca(peca)}
                                className="p-1.5 text-slate-700 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                                title="Movimentar estoque (Entrada, Saída ou Ajuste)"
                              >
                                <ArrowsLeftRight size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAbrirKardexPeca(peca.codigo)}
                                className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                                title="Ver histórico de movimentações (Kardex)"
                              >
                                <ClockCounterClockwise size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAbrirEditarPeca(peca)}
                                className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                                title="Editar dados cadastrais no catálogo"
                              >
                                <PencilSimple size={16} />
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
        </>
      )}

      {/* ABA 2: HISTÓRICO DE MOVIMENTAÇÕES (KARDEX) */}
      {abaAtiva === 'kardex' && (
        <>
          {/* Filtros do Kardex */}
          <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={buscaKardex}
                onChange={(e) => setBuscaKardex(e.target.value)}
                placeholder="Buscar por código SKU, nome do item, documento, motivo ou responsável..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              />
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="w-full sm:w-56">
              <Select
                value={opcoesTipoMovimento.find((opt) => opt.value === filtroTipoMovimento)}
                onChange={(opt) => setFiltroTipoMovimento(opt ? opt.value : 'TODOS')}
                options={opcoesTipoMovimento}
                styles={customSelectStyles}
                placeholder="Tipo de Movimento"
                isSearchable={false}
              />
            </div>
          </div>

          {/* Tabela de Kardex */}
          <div className="flex-1 overflow-auto no-scrollbar p-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              {movimentacoesFiltradas.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <ClockCounterClockwise size={24} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">Nenhuma movimentação registrada</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {buscaKardex || filtroTipoMovimento !== 'TODOS'
                      ? 'Nenhum lançamento corresponde aos filtros aplicados.'
                      : 'O histórico de movimentações do almoxarifado aparecerá aqui.'}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                      <th className="py-3 px-4">Data e Hora</th>
                      <th className="py-3 px-4 text-center">Operação</th>
                      <th className="py-3 px-4">Item / Código SKU</th>
                      <th className="py-3 px-4 text-center">Qtd.</th>
                      <th className="py-3 px-4 text-center">Saldo Resultante</th>
                      <th className="py-3 px-4">Documento / Ref.</th>
                      <th className="py-3 px-4">Motivo / Justificativa</th>
                      <th className="py-3 px-4">Responsável</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {movimentacoesFiltradas.map((mov) => {
                      const dataFormatada = new Date(mov.dataHora).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })

                      const isEntrada = mov.tipo === 'ENTRADA'
                      const isSaida = mov.tipo === 'SAIDA'

                      return (
                        <tr key={mov.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                            {dataFormatada}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {isEntrada ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-[#0284c7] border border-sky-200">
                                <ArrowDownLeft size={13} weight="bold" />
                                <span>Entrada</span>
                              </span>
                            ) : isSaida ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                <ArrowUpRight size={13} weight="bold" />
                                <span>Saída</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <ArrowsClockwise size={13} weight="bold" />
                                <span>Ajuste</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{mov.pecaNome}</div>
                            <div className="font-mono text-[11px] text-slate-500">
                              {mov.pecaCodigo}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-bold">
                            <span
                              className={
                                isEntrada ? 'text-sky-700' : isSaida ? 'text-slate-900' : 'text-amber-700'
                              }
                            >
                              {isEntrada ? `+${mov.quantidade}` : isSaida ? `-${mov.quantidade}` : `=${mov.quantidade}`}{' '}
                              {mov.unidade || 'UN'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center font-mono text-[11px]">
                            <span className="text-slate-400">{mov.saldoAnterior}</span>
                            <span className="text-slate-300 mx-1">→</span>
                            <span className="font-bold text-slate-900">{mov.saldoNovo}</span>
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                            {mov.documento || 'Sem documento'}
                          </td>

                          <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={mov.motivo}>
                            {mov.motivo || 'Lançamento manual'}
                          </td>

                          <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                            {mov.responsavel || 'Operador'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* ABA 3: SUGESTÃO DE REPOSIÇÃO E COMPRAS */}
      {abaAtiva === 'reposicao' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar da Reposição */}
          <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart size={18} className="text-[#0284c7]" />
                <span>Lista Sugerida para Cotação e Reposição de Estoque</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Itens com saldo igual ou abaixo do estoque mínimo estabelecido para operação da oficina
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <span className="block text-[10px] uppercase font-semibold text-slate-400">
                  Estimativa de Investimento
                </span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  R$ {totalInvestimentoReposicao}
                </span>
              </div>

              {itensReposicao.length > 0 && (
                <button
                  type="button"
                  onClick={handleCotarTodasReposicoes}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  title="Abrir tela dedicada para cotar todas as peças sugeridas para reposição"
                >
                  <ShareNetwork size={15} weight="bold" />
                  <span>Cotar Todas as Reposições ({itensReposicao.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopiarListaReposicao}
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
                title="Copiar lista de compras para orçamento via WhatsApp"
              >
                <Copy size={15} />
                <span>Copiar Lista de Compras</span>
              </button>
            </div>
          </div>

          {/* Tabela de Reposição */}
          <div className="flex-1 overflow-auto no-scrollbar p-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              {itensReposicao.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-sky-50 text-[#0284c7] flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={24} weight="fill" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">Almoxarifado com Níveis Adequados</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Nenhum item do catálogo está abaixo ou no nível de estoque mínimo configurado.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                      <th className="py-3 px-4">Código / SKU</th>
                      <th className="py-3 px-4">Peça ou Produto</th>
                      <th className="py-3 px-4 text-center">Estoque Atual</th>
                      <th className="py-3 px-4 text-center">Estoque Mínimo</th>
                      <th className="py-3 px-4 text-center">Déficit</th>
                      <th className="py-3 px-4 text-center">Sugestão de Compra</th>
                      <th className="py-3 px-4 text-right">Custo Unit.</th>
                      <th className="py-3 px-4 text-right">Investimento Estimado</th>
                      <th className="py-3 px-4">Fornecedor Preferencial</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {itensReposicao.map((item) => {
                      const isZerado = item.atual === 0

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                            {item.codigo}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{item.nome}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {item.categoria} • Local: {item.localizacao || 'Almoxarifado'}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-bold">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                                isZerado
                                  ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 font-bold border border-amber-200'
                              }`}
                            >
                              {item.atual} {item.unidade || 'UN'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center font-mono text-slate-600">
                            {item.min} {item.unidade || 'UN'}
                          </td>

                          <td className="py-3 px-4 text-center font-mono text-rose-600 font-semibold">
                            {item.deficit > 0 ? `-${item.deficit}` : '0'}
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-extrabold text-[#0284c7]">
                            {item.sugestaoCompra} {item.unidade || 'UN'}
                          </td>

                          <td className="py-3 px-4 text-right font-mono text-slate-600">
                            R$ {Number(item.precoCusto || 0).toFixed(2)}
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            R$ {item.custoEstimado.toFixed(2)}
                          </td>

                          <td className="py-3 px-4 text-slate-700 text-[11px]">
                            {item.fornecedorPreferencial || 'Auto Peças Central'}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <button
                                type="button"
                                onClick={() => handleCotarReposicao(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-md text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                                title="Abrir tela dedicada para cotar reposição deste item"
                              >
                                <ShareNetwork size={13} weight="bold" />
                                <span>Cotar Reposição</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleMovimentarPeca(item)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 hover:bg-sky-100 text-[#0284c7] border border-sky-200 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
                                title="Registrar entrada imediata deste item"
                              >
                                <ArrowDownLeft size={13} weight="bold" />
                                <span>Entrada</span>
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
        </div>
      )}

      {/* Modal de Movimentação de Estoque */}
      <EstoqueMovimentoModal
        isOpen={modalMovimentoAberto}
        onClose={() => {
          setModalMovimentoAberto(false)
          setPecaParaMovimento(null)
        }}
        pecaPreSelecionada={pecaParaMovimento}
        onSucesso={() => {
          setPecas(carregarPecasCadastradas())
          setMovimentacoes(carregarMovimentacoesEstoque())
        }}
      />

      {/* Modal de Cadastro e Edição de Peça no Catálogo */}
      <PecaModalForm
        isOpen={modalNovaPecaAberto}
        onClose={() => {
          setModalNovaPecaAberto(false)
          setPecaParaEditar(null)
        }}
        onSalvar={handleSalvarPeca}
        pecaParaEditar={pecaParaEditar}
      />
    </div>
  )
}
