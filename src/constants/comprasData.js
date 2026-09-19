// Dados e utilitários de persistência do módulo de Compras e Cotações
// Regra: Sem uso do caractere proibido ('&'), apenas a conjunção 'e'

import {
  carregarPecasCadastradas,
  salvarPecasCadastradas,
  registrarMovimentacaoEstoque,
} from './cadastrosSuprimentosData'
import {
  obterOrdensAbertas,
  salvarOrdensAbertas,
  STORAGE_KEY_ORDENS,
} from '../pages/dashboard/orcamento/mockOrdensAbertas'

export const CHAVE_STORAGE_COMPRAS = 'dev_oficina_pedidos_compra'

export const STATUS_COMPRA_OPCOES = [
  { value: 'TODOS', label: 'Todos os Status' },
  { value: 'EM_COTACAO', label: 'Em Cotação' },
  { value: 'AGUARDANDO_ENTREGA', label: 'Aguardando Entrega' },
  { value: 'RECEBIDO', label: 'Recebido no Estoque' },
  { value: 'RASCUNHO', label: 'Rascunho' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

export const FORMAS_PAGAMENTO_COMPRA_OPCOES = [
  { value: 'Boleto 30 Dias', label: 'Boleto 30 Dias' },
  { value: 'Boleto 14/28 Dias', label: 'Boleto 14/28 Dias' },
  { value: 'PIX Imediato', label: 'PIX Imediato' },
  { value: 'Cartão Corporativo', label: 'Cartão Corporativo' },
  { value: 'Faturado Mensal', label: 'Faturado Mensal' },
  { value: 'Dinheiro', label: 'Dinheiro' },
]

export const PEDIDOS_COMPRA_INICIAIS = [
  {
    id: 'ped-1',
    numeroPedido: 'PED-2026-001',
    fornecedorId: 'terc-5',
    fornecedorNome: 'Distribuidora Paranaense de Autopeças S/A',
    origemTipo: 'ORDEM_SERVICO',
    numeroOS: '002908',
    clienteNome: 'EDGAR AMARAL DA SILVEIRA',
    veiculoPlaca: 'ASF6I46',
    veiculoModelo: 'Fiat Doblo 1.8 Cargo',
    status: 'AGUARDANDO_ENTREGA',
    dataEmissao: '2026-09-18T11:00:00',
    previsaoEntrega: '2026-09-19',
    itens: [
      {
        id: 'item-c1',
        pecaId: 'pec-5',
        codigo: 'PEC-005',
        nome: 'Aditivo Concentrado Orgânico Paraflu A05',
        unidade: 'LT',
        quantidade: 2,
        precoCusto: 22.0,
        valorTotal: 44.0,
      },
      {
        id: 'item-c2',
        pecaId: 'pec-12',
        codigo: 'PEC-012',
        nome: 'Bomba de Água com Carcaça e Junta',
        unidade: 'UN',
        quantidade: 1,
        precoCusto: 130.0,
        valorTotal: 130.0,
      },
    ],
    valorTotal: 174.0,
    formaPagamento: 'Boleto 30 Dias',
    observacoes: 'Urgente para montagem do sistema de arrefecimento da Doblo',
    responsavel: 'Rafael Almoxarife',
  },
  {
    id: 'ped-2',
    numeroPedido: 'PED-2026-002',
    fornecedorId: 'terc-6',
    fornecedorNome: 'Apucarana Peças e Acessórios Automotivos Ltda',
    origemTipo: 'REPOSICAO_ESTOQUE',
    numeroOS: '',
    clienteNome: '',
    veiculoPlaca: '',
    veiculoModelo: '',
    status: 'RECEBIDO',
    dataEmissao: '2026-09-17T09:30:00',
    dataRecebimento: '2026-09-18T10:15:00',
    previsaoEntrega: '2026-09-18',
    itens: [
      {
        id: 'item-c3',
        pecaId: 'pec-1',
        codigo: 'PEC-001',
        nome: 'Filtro de Óleo Blindado',
        unidade: 'UN',
        quantidade: 30,
        precoCusto: 25.0,
        valorTotal: 750.0,
      },
    ],
    valorTotal: 750.0,
    formaPagamento: 'Faturado Mensal',
    observacoes: 'Reposição quinzenal de filtros de óleo blindados',
    responsavel: 'Rafael Almoxarife',
  },
  {
    id: 'ped-3',
    numeroPedido: 'PED-2026-003',
    fornecedorId: 'terc-1',
    fornecedorNome: 'Auto Elétrica Silva LTDA',
    origemTipo: 'ORDEM_SERVICO',
    numeroOS: '002909',
    clienteNome: 'CARLOS EDUARDO SILVEIRA',
    veiculoPlaca: 'BRA2E19',
    veiculoModelo: 'Chevrolet Onix 1.0 Turbo',
    status: 'EM_COTACAO',
    dataEmissao: '2026-09-19T08:45:00',
    previsaoEntrega: '2026-09-20',
    itens: [
      {
        id: 'item-c4',
        pecaId: 'pec-3',
        codigo: 'PEC-003',
        nome: 'Par de Amortecedores Dianteiros Pressurizados',
        unidade: 'PAR',
        quantidade: 1,
        precoCusto: 320.0,
        valorTotal: 320.0,
      },
      {
        id: 'item-c5',
        pecaId: 'pec-10',
        codigo: 'PEC-010',
        nome: 'Bieletas da Barra Estabilizadora Dianteira (Par)',
        unidade: 'PAR',
        quantidade: 1,
        precoCusto: 52.0,
        valorTotal: 52.0,
      },
    ],
    valorTotal: 372.0,
    formaPagamento: 'PIX Imediato',
    observacoes: 'Aguardando confirmação do prazo de entrega pelo fornecedor',
    responsavel: 'Bianca Recepção',
  },
]

export function carregarPedidosCompra() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_COMPRAS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return PEDIDOS_COMPRA_INICIAIS
}

export function salvarPedidosCompra(pedidos) {
  try {
    localStorage.setItem(CHAVE_STORAGE_COMPRAS, JSON.stringify(pedidos))
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('dev_oficina_compras_updated'))
  } catch {}
}

export function gerarProximoNumeroPedido() {
  const pedidos = carregarPedidosCompra()
  const ano = new Date().getFullYear()
  let maxSeq = 0
  pedidos.forEach((p) => {
    if (p && p.numeroPedido) {
      const match = String(p.numeroPedido).match(/PED-(?:\d{4}-)?(\d+)/i)
      if (match && match[1]) {
        const num = parseInt(match[1], 10)
        if (!isNaN(num) && num > maxSeq) maxSeq = num
      }
    }
  })
  const proximo = String(maxSeq + 1).padStart(3, '0')
  return `PED-${ano}-${proximo}`
}

export function salvarPedidoCompra(dadosPedido) {
  const pedidos = carregarPedidosCompra()
  const numero = dadosPedido.numeroPedido || gerarProximoNumeroPedido()
  const pedidoFormatado = {
    ...dadosPedido,
    numeroPedido: numero,
  }

  const existe = pedidos.some((p) => p.id === pedidoFormatado.id)

  let novaLista = []
  if (existe) {
    novaLista = pedidos.map((p) => (p.id === pedidoFormatado.id ? pedidoFormatado : p))
  } else {
    novaLista = [pedidoFormatado, ...pedidos]
  }

  salvarPedidosCompra(novaLista)
  return pedidoFormatado
}

export function excluirPedidoCompra(pedidoId) {
  const pedidos = carregarPedidosCompra()
  const novaLista = pedidos.filter((p) => p.id !== pedidoId)
  salvarPedidosCompra(novaLista)
  return novaLista
}

// Receber o pedido: dá entrada automática no Estoque e atualiza a OS se vinculada
export function receberPedidoCompra(pedidoId, { documento, responsavel = 'Rafael Almoxarife' } = {}) {
  const pedidos = carregarPedidosCompra()
  const pedidoIndex = pedidos.findIndex((p) => p.id === pedidoId)
  if (pedidoIndex === -1) {
    throw new Error('Pedido de compra não localizado.')
  }

  const pedido = pedidos[pedidoIndex]
  if (pedido.status === 'RECEBIDO') {
    throw new Error('Este pedido de compra já foi recebido anteriormente.')
  }

  const pecasAtuais = carregarPecasCadastradas()

  // 1. Dar entrada no estoque para cada item
  pedido.itens.forEach((item) => {
    // Procura por pecaId ou pelo codigo
    let pecaExistente = pecasAtuais.find(
      (p) => (item.pecaId && p.id === item.pecaId) || (item.codigo && p.codigo === item.codigo)
    )

    if (pecaExistente) {
      try {
        registrarMovimentacaoEstoque({
          pecaId: pecaExistente.id,
          tipo: 'ENTRADA',
          quantidade: item.quantidade,
          motivo: `Recebimento de Pedido de Compra #${pedido.numeroPedido}`,
          documento: documento || pedido.numeroPedido,
          responsavel: responsavel || pedido.responsavel || 'Almoxarifado',
        })
      } catch (err) {
        console.warn('Aviso ao movimentar peça no estoque:', err)
      }
    }
  })

  // 2. Se estiver vinculado a uma OS e a OS estiver aguardando peças, avança status
  if (pedido.numeroOS) {
    try {
      const ordens = obterOrdensAbertas()
      const osIndex = ordens.findIndex((o) => String(o.numeroOS) === String(pedido.numeroOS))
      if (osIndex !== -1) {
        const os = ordens[osIndex]
        if (os.status === 'aguardando_pecas') {
          ordens[osIndex] = {
            ...os,
            status: 'aprovado_execucao',
            observacoesGerais: `${os.observacoesGerais || ''} [Peças recebidas via ${pedido.numeroPedido} em ${new Date().toLocaleDateString('pt-BR')}].`.trim(),
          }
          salvarOrdensAbertas(ordens)
          window.dispatchEvent(new CustomEvent('dev_oficina_ordens_updated'))
        }
      }
    } catch (err) {
      console.warn('Aviso ao atualizar status da OS:', err)
    }
  }

  // 3. Atualizar status do pedido de compra para RECEBIDO
  const pedidoAtualizado = {
    ...pedido,
    status: 'RECEBIDO',
    dataRecebimento: new Date().toISOString(),
    documentoEntrada: documento || pedido.numeroPedido,
  }

  pedidos[pedidoIndex] = pedidoAtualizado
  salvarPedidosCompra(pedidos)

  // Disparar eventos de sincronização
  try {
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('dev_oficina_compras_updated'))
    window.dispatchEvent(new CustomEvent('dev_oficina_estoque_updated'))
  } catch {}

  return pedidoAtualizado
}

// Analisa todas as OSs abertas para identificar peças demandadas
export function obterDemandasDasOSs() {
  const ordens = obterOrdensAbertas()
  const pecasCatalogo = carregarPecasCadastradas()

  const demandas = []

  ordens.forEach((os) => {
    if (os.status === 'finalizada' || os.status === 'pronto_retirada') return

    const pecasOS = os.pecasOS || []
    pecasOS.forEach((item, idx) => {
      // Procura no catálogo
      const pecaNoCatalogo = pecasCatalogo.find(
        (p) => (p.codigo && item.codigo && p.codigo.toUpperCase() === item.codigo.toUpperCase()) ||
               (p.nome && item.nome && p.nome.toLowerCase() === item.nome.toLowerCase())
      )

      const estoqueAtual = pecaNoCatalogo ? Number(pecaNoCatalogo.estoqueAtual) || 0 : 0
      const qtdNecessaria = Number(item.quantidade) || 1

      const deficit = Math.max(0, qtdNecessaria - estoqueAtual)

      demandas.push({
        id: `dem-${os.numeroOS}-${idx}`,
        numeroOS: os.numeroOS,
        clienteNome: os.cliente,
        clienteTelefone: os.telefone,
        veiculoPlaca: os.placa,
        veiculoModelo: os.marcaModelo || `${os.marca || ''} ${os.modelo || ''}`.trim(),
        statusOS: os.status,
        itemCodigo: item.codigo || 'SEM CODIGO',
        itemNome: item.nome,
        itemMarcaSugerida: item.marca || '',
        unidade: item.unidade || 'UN',
        quantidadeNecessaria: qtdNecessaria,
        estoqueAtual,
        deficit,
        precisaComprar: deficit > 0 || os.status === 'aguardando_pecas',
        cadastradoNoCatalogo: Boolean(pecaNoCatalogo),
        pecaId: pecaNoCatalogo?.id || null,
        precoEstimado: Number(item.precoUnitario) || (pecaNoCatalogo ? Number(pecaNoCatalogo.precoCusto) : 0),
      })
    })
  })

  return demandas
}

// Cotações de Peças com Auto Peças e Fornecedores Parceiros
export const CHAVE_STORAGE_COTACOES = 'dev_oficina_cotacoes_pecas'

export const COTACOES_INICIAIS = [
  {
    id: 'COT-2026-9041',
    numeroOS: '002908',
    clienteNome: 'EDGAR AMARAL DA SILVEIRA',
    veiculoPlaca: 'ASF6I46',
    veiculoModelo: 'Fiat Doblo 1.8 Cargo',
    ano: '2009/2010',
    km: '280.812 km',
    mecanicoNome: 'Carlos Eduardo',
    dataCriacao: '2026-09-18T10:15:00',
    status: 'EM_COTACAO',
    observacoes: 'Urgente para liberação da van de entrega',
    fornecedoresCotados: [
      {
        id: 'forn-1',
        nome: 'Auto Peças Central',
        telefone: '(11) 3456-7890',
        whatsapp: '11987654321',
        status: 'RESPONDIDA',
        valorTotal: 250.0,
        tempoEntrega: '1 a 2 horas',
        respostasItens: {
          'it-1': { preco: 190.0, marca: 'Valclei', disponivel: true },
          'it-2': { preco: 40.0, marca: 'Paraflu', disponivel: true },
          'it-3': { preco: 20.0, marca: 'Sabo', disponivel: true },
        },
      },
      {
        id: 'forn-2',
        nome: 'Distribuidora União Autopeças',
        telefone: '(11) 3567-8901',
        whatsapp: '11976543210',
        status: 'AGUARDANDO',
        valorTotal: null,
        tempoEntrega: '2 a 3 horas',
        respostasItens: {},
      },
    ],
    itens: [
      {
        id: 'it-1',
        codigo: '0018969',
        nome: 'TUBO SUPORTE ARREFECIMENTO',
        unidade: 'PC',
        quantidade: 1,
        marcaSugerida: 'VALCLEI',
        observacoes: 'Fissura no tubo plástico original com vazamento',
        fotoUrl: 'https://images.unsplash.com/photo-1600790142055-619df03207e6?w=600',
      },
      {
        id: 'it-2',
        codigo: '010804',
        nome: 'ADITIVO A05 PRONTO USO',
        unidade: 'LT',
        quantidade: 1,
        marcaSugerida: 'PARAFLU',
        observacoes: 'Fluido orgânico rosa pronto para uso',
        fotoUrl: '',
      },
      {
        id: 'it-3',
        codigo: '10039B',
        nome: 'ANEL VEDADOR DA ADM',
        unidade: 'UN',
        quantidade: 4,
        marcaSugerida: 'SABO',
        observacoes: 'Vedação do coletor de admissão',
        fotoUrl: '',
      },
    ],
  },
  {
    id: 'COT-2026-9042',
    numeroOS: '002909',
    clienteNome: 'CARLOS EDUARDO SILVEIRA',
    veiculoPlaca: 'BRA2E19',
    veiculoModelo: 'Chevrolet Onix 1.0 Turbo',
    ano: '2022/2023',
    km: '34.100 km',
    mecanicoNome: 'Gabriel Amaral',
    dataCriacao: '2026-09-19T08:30:00',
    status: 'EM_COTACAO',
    observacoes: 'Aguardando cotação de amortecedores e bieletas',
    fornecedoresCotados: [
      {
        id: 'forn-1',
        nome: 'Auto Peças Central',
        telefone: '(11) 3456-7890',
        whatsapp: '11987654321',
        status: 'AGUARDANDO',
        valorTotal: null,
        tempoEntrega: '1 hora',
        respostasItens: {},
      },
      {
        id: 'forn-3',
        nome: 'Rei das Peças Express',
        telefone: '(11) 3678-9012',
        whatsapp: '11998871122',
        status: 'AGUARDANDO',
        valorTotal: null,
        tempoEntrega: '45 minutos',
        respostasItens: {},
      },
    ],
    itens: [
      {
        id: 'it-4',
        codigo: 'PEC-003',
        nome: 'Par de Amortecedores Dianteiros Pressurizados',
        unidade: 'PAR',
        quantidade: 1,
        marcaSugerida: 'Cofap / Monroe',
        observacoes: 'Haste com vazamento de fluido hidráulico',
        fotoUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600',
      },
      {
        id: 'it-5',
        codigo: 'PEC-010',
        nome: 'Bieletas da Barra Estabilizadora Dianteira (Par)',
        unidade: 'PAR',
        quantidade: 1,
        marcaSugerida: 'Nakata / Viemar',
        observacoes: 'Folga excessiva nos pivôs das pontas',
        fotoUrl: '',
      },
    ],
  },
]

export const CHAVE_STORAGE_COTACOES_PORTAL = 'dev_oficina_cotacoes'

export function carregarCotacoes() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_COTACOES)
    let lista = []
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        lista = parsed
      }
    }
    if (lista.length === 0) {
      lista = COTACOES_INICIAIS
    }

    // Sincroniza com as respostas enviadas externamente via portal público (/cotacao/:id)
    const portalRaw = localStorage.getItem(CHAVE_STORAGE_COTACOES_PORTAL)
    if (portalRaw) {
      try {
        const portalMap = JSON.parse(portalRaw)
        lista = lista.map((c) => {
          const dadosPortal = portalMap[c.id]
          if (dadosPortal) {
            // Se houver respostas externas de fornecedores, mescla
            const fornecedoresCotadosAtualizados = (c.fornecedoresCotados || []).map((f) => {
              if (dadosPortal.respostas && dadosPortal.respostas[f.nome]) {
                const resp = dadosPortal.respostas[f.nome]
                let valorFinal = f.valorTotal
                if (resp.total != null) {
                  if (typeof resp.total === 'number') {
                    valorFinal = resp.total
                  } else if (typeof resp.total === 'string') {
                    const limpo = resp.total.replace(/\./g, '').replace(',', '.')
                    const num = parseFloat(limpo)
                    if (!isNaN(num)) valorFinal = num
                  }
                }

                return {
                  ...f,
                  status: 'RESPONDIDA',
                  valorTotal: valorFinal,
                  tempoEntrega: resp.prazoEntrega || f.tempoEntrega,
                  respostasItens: resp.itens || f.respostasItens || {},
                }
              }
              return f
            })

            return {
              ...c,
              status: dadosPortal.status === 'respondida' ? 'RESPONDIDA' : c.status,
              fornecedoresCotados: fornecedoresCotadosAtualizados,
            }
          }
          return c
        })
      } catch {}
    }

    return lista
  } catch {}
  return COTACOES_INICIAIS
}

export function salvarCotacoes(cotacoes) {
  try {
    if (!Array.isArray(cotacoes)) return
    localStorage.setItem(CHAVE_STORAGE_COTACOES, JSON.stringify(cotacoes))

    // Sincroniza em formato mapa para o portal externo /cotacao/:id
    const portalMap = {}
    cotacoes.forEach((c) => {
      if (c && c.id) {
        portalMap[c.id] = {
          ...c,
          cliente: c.clienteNome || c.cliente || 'Almoxarifado Central',
          placa: c.veiculoPlaca || c.placa || 'OFICINA',
          marcaModelo: c.veiculoModelo || c.marcaModelo || 'Reposição de Estoque',
        }
      }
    })
    localStorage.setItem(CHAVE_STORAGE_COTACOES_PORTAL, JSON.stringify(portalMap))

    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('dev_oficina_cotacoes_updated'))
  } catch (err) {
    console.warn('Erro ao salvar cotações:', err)
  }
}

export function gerarProximoNumeroCotacao() {
  const cotacoes = carregarCotacoes()
  const ano = new Date().getFullYear()
  let maxSeq = 9040
  cotacoes.forEach((c) => {
    if (c && c.id) {
      const match = String(c.id).match(/COT-(?:\d{4}-)?(\d+)/i)
      if (match && match[1]) {
        const num = parseInt(match[1], 10)
        if (!isNaN(num) && num > maxSeq) maxSeq = num
      }
    }
  })
  return `COT-${ano}-${maxSeq + 1}`
}

export function salvarCotacao(dadosCotacao) {
  const cotacoes = carregarCotacoes()
  const id = dadosCotacao.id || gerarProximoNumeroCotacao()
  const cotacaoFormatada = {
    ...dadosCotacao,
    id,
    dataCriacao: dadosCotacao.dataCriacao || new Date().toISOString(),
  }

  const index = cotacoes.findIndex((c) => c.id === id)
  let novaLista = []
  if (index !== -1) {
    novaLista = cotacoes.map((c) => (c.id === id ? cotacaoFormatada : c))
  } else {
    novaLista = [cotacaoFormatada, ...cotacoes]
  }

  salvarCotacoes(novaLista)
  return cotacaoFormatada
}

export function excluirCotacao(cotacaoId) {
  const cotacoes = carregarCotacoes()
  const novaLista = cotacoes.filter((c) => c.id !== cotacaoId)
  salvarCotacoes(novaLista)
  return novaLista
}

export function obterCotacaoPorOS(numeroOS) {
  if (!numeroOS) return null
  const cotacoes = carregarCotacoes()
  return cotacoes.find(
    (c) => String(c.numeroOS) === String(numeroOS) && c.status !== 'CANCELADA'
  ) || null
}

export function aprovarCotacaoEGerarPedido(cotacaoId, fornecedorId) {
  const cotacoes = carregarCotacoes()
  const cotacaoIndex = cotacoes.findIndex((c) => c.id === cotacaoId)
  if (cotacaoIndex === -1) {
    throw new Error('Cotação não localizada.')
  }

  const cotacao = cotacoes[cotacaoIndex]
  const fornecedor = (cotacao.fornecedoresCotados || []).find((f) => f.id === fornecedorId) ||
    cotacao.fornecedoresCotados?.[0]

  if (!fornecedor) {
    throw new Error('Fornecedor não selecionado para a aprovação da cotação.')
  }

  // 1. Atualizar cotação para APROVADA
  const cotacaoAtualizada = {
    ...cotacao,
    status: 'APROVADA',
    fornecedorVencedorId: fornecedor.id,
    fornecedorVencedorNome: fornecedor.nome,
    dataAprovacao: new Date().toISOString(),
  }
  cotacoes[cotacaoIndex] = cotacaoAtualizada
  salvarCotacoes(cotacoes)

  // 2. Mapear itens da cotação com os preços cotados do fornecedor vencedor
  const itensPedido = (cotacao.itens || []).map((it, idx) => {
    const respostaItem = fornecedor.respostasItens?.[it.id] || {}
    const preco = Number(respostaItem.preco) || Number(it.precoEstimado) || 0
    const qtd = Number(it.quantidade) || 1

    return {
      id: `item-ped-${Date.now()}-${idx}`,
      pecaId: it.pecaId || '',
      codigo: it.codigo || '',
      nome: it.nome,
      unidade: it.unidade || 'UN',
      quantidade: qtd,
      precoCusto: preco,
      valorTotal: qtd * preco,
      marca: respostaItem.marca || it.marcaSugerida || '',
    }
  })

  const valorTotalPedido = itensPedido.reduce((acc, it) => acc + (it.valorTotal || 0), 0)

  // 3. Gerar pedido de compra oficial
  const amanha = new Date()
  amanha.setDate(amanha.getDate() + 1)

  const novoPedido = {
    id: `ped-${Date.now()}`,
    numeroPedido: gerarProximoNumeroPedido(),
    fornecedorId: fornecedor.id,
    fornecedorNome: fornecedor.nome,
    origemTipo: cotacao.numeroOS ? 'ORDEM_SERVICO' : 'REPOSICAO_ESTOQUE',
    numeroOS: cotacao.numeroOS || '',
    clienteNome: cotacao.clienteNome || '',
    veiculoPlaca: cotacao.veiculoPlaca || '',
    veiculoModelo: cotacao.veiculoModelo || '',
    status: 'AGUARDANDO_ENTREGA',
    dataEmissao: new Date().toISOString(),
    previsaoEntrega: amanha.toISOString().split('T')[0],
    formaPagamento: fornecedor.condicaoPagamento || 'Boleto 30 Dias',
    observacoes: `Pedido de compra gerado a partir da Cotação #${cotacao.id}. Fornecedor vencedor: ${fornecedor.nome}.`,
    responsavel: 'Rafael Almoxarife',
    itens: itensPedido,
    valorTotal: valorTotalPedido,
  }

  salvarPedidoCompra(novoPedido)

  return {
    cotacao: cotacaoAtualizada,
    pedido: novoPedido,
  }
}

