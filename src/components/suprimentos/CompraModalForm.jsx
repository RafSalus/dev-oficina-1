import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import {
  ShoppingCart,
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
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from './ModalRedimensionavel'
import { customSelectStyles } from './customSelectStyles'
import {
  carregarPecasCadastradas,
  carregarTerceirosCadastrados,
  salvarTerceirosCadastrados,
} from '../../constants/cadastrosSuprimentosData'
import {
  STATUS_COMPRA_OPCOES,
  FORMAS_PAGAMENTO_COMPRA_OPCOES,
  gerarProximoNumeroPedido,
} from '../../constants/comprasData'
import { obterOrdensAbertas } from '../../pages/dashboard/orcamento/mockOrdensAbertas'
import { PecaModalForm } from './PecaModalForm'
import { TerceiroModalForm } from './TerceiroModalForm'

export function CompraModalForm({
  isOpen,
  onClose,
  onSalvar,
  pedidoParaEditar = null,
  demandaInicial = null,
}) {
  const [pecasCatalogo, setPecasCatalogo] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [ordensAbertas, setOrdensAbertas] = useState([])

  // Nested modals state
  const [modalPecaAberto, setModalPecaAberto] = useState(false)
  const [indiceLinhaPecaNova, setIndiceLinhaPecaNova] = useState(null)
  const [modalFornecedorAberto, setModalFornecedorAberto] = useState(false)

  // Form state
  const [numeroPedido, setNumeroPedido] = useState('')
  const [fornecedorId, setFornecedorId] = useState('')
  const [status, setStatus] = useState('AGUARDANDO_ENTREGA')
  const [vinculoOS, setVinculoOS] = useState('NENHUM')
  const [formaPagamento, setFormaPagamento] = useState('Boleto 30 Dias')
  const [previsaoEntrega, setPrevisaoEntrega] = useState('')
  const [responsavel, setResponsavel] = useState('Rafael Almoxarife')
  const [observacoes, setObservacoes] = useState('')
  const [itens, setItens] = useState([])

  // Recarrega cadastros ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      const pecas = carregarPecasCadastradas()
      const terc = carregarTerceirosCadastrados()
      const ordens = obterOrdensAbertas()

      setPecasCatalogo(pecas)
      setFornecedores(terc)
      setOrdensAbertas(ordens)

      if (pedidoParaEditar) {
        setNumeroPedido(pedidoParaEditar.numeroPedido || '')
        setFornecedorId(pedidoParaEditar.fornecedorId || '')
        setStatus(pedidoParaEditar.status || 'AGUARDANDO_ENTREGA')
        setVinculoOS(pedidoParaEditar.numeroOS || 'NENHUM')
        setFormaPagamento(pedidoParaEditar.formaPagamento || 'Boleto 30 Dias')
        setPrevisaoEntrega(pedidoParaEditar.previsaoEntrega || '')
        setResponsavel(pedidoParaEditar.responsavel || 'Rafael Almoxarife')
        setObservacoes(pedidoParaEditar.observacoes || '')
        setItens(
          pedidoParaEditar.itens && pedidoParaEditar.itens.length > 0
            ? pedidoParaEditar.itens
            : [criarLinhaItemVazia()]
        )
      } else if (demandaInicial) {
        // Pré-preenchimento vindo de uma demanda de OS ou estoque
        setNumeroPedido(gerarProximoNumeroPedido())
        setFornecedorId(demandaInicial.fornecedorId || (terc.length > 0 ? terc[0].id : ''))
        setStatus('AGUARDANDO_ENTREGA')
        setVinculoOS(demandaInicial.numeroOS || 'NENHUM')
        setFormaPagamento('Boleto 30 Dias')

        const amanha = new Date()
        amanha.setDate(amanha.getDate() + 1)
        setPrevisaoEntrega(amanha.toISOString().split('T')[0])
        setResponsavel('Rafael Almoxarife')
        setObservacoes(
          demandaInicial.observacoes ||
            (demandaInicial.numeroOS
              ? `Pedido de compra gerado a partir da OS #${demandaInicial.numeroOS}`
              : 'Pedido de reposição de estoque')
        )

        if (demandaInicial.itens && demandaInicial.itens.length > 0) {
          setItens(demandaInicial.itens)
        } else if (demandaInicial.itemCodigo || demandaInicial.codigo) {
          setItens([
            {
              id: `item-${Date.now()}`,
              pecaId: demandaInicial.pecaId || '',
              codigo: demandaInicial.itemCodigo || demandaInicial.codigo || '',
              nome: demandaInicial.itemNome || demandaInicial.nome || '',
              unidade: demandaInicial.unidade || 'UN',
              quantidade: Number(demandaInicial.quantidadeNecessaria || demandaInicial.sugestaoCompra || 1),
              precoCusto: Number(demandaInicial.precoEstimado || demandaInicial.precoCusto || 0),
              valorTotal:
                Number(demandaInicial.quantidadeNecessaria || demandaInicial.sugestaoCompra || 1) *
                Number(demandaInicial.precoEstimado || demandaInicial.precoCusto || 0),
            },
          ])
        } else {
          setItens([criarLinhaItemVazia()])
        }
      } else {
        // Novo pedido limpo
        setNumeroPedido(gerarProximoNumeroPedido())
        setFornecedorId(terc.length > 0 ? terc[0].id : '')
        setStatus('AGUARDANDO_ENTREGA')
        setVinculoOS('NENHUM')
        setFormaPagamento('Boleto 30 Dias')

        const amanha = new Date()
        amanha.setDate(amanha.getDate() + 1)
        setPrevisaoEntrega(amanha.toISOString().split('T')[0])
        setResponsavel('Rafael Almoxarife')
        setObservacoes('')
        setItens([criarLinhaItemVazia()])
      }
    }
  }, [isOpen, pedidoParaEditar, demandaInicial])

  function criarLinhaItemVazia() {
    return {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      pecaId: '',
      codigo: '',
      nome: '',
      unidade: 'UN',
      quantidade: 1,
      precoCusto: 0,
      valorTotal: 0,
    }
  }

  // Opções para react-select
  const opcoesFornecedores = useMemo(() => {
    return fornecedores.map((f) => ({
      value: f.id,
      label: `${f.nomeFantasia || f.razaoSocial} (${f.categoria || f.tipoServico || 'Fornecedor'})`,
      fornecedor: f,
    }))
  }, [fornecedores])

  const opcoesOS = useMemo(() => {
    const lista = [
      {
        value: 'NENHUM',
        label: 'Sem Vínculo com OS (Reposição de Almoxarifado / Estoque)',
        os: null,
      },
    ]

    ordensAbertas.forEach((os) => {
      lista.push({
        value: String(os.numeroOS),
        label: `OS #${os.numeroOS} - ${os.cliente} (${os.marcaModelo || os.placa})`,
        os,
      })
    })

    return lista
  }, [ordensAbertas])

  const opcoesPecas = useMemo(() => {
    return pecasCatalogo.map((p) => ({
      value: p.id,
      label: `[${p.codigo}] ${p.nome} - Atual: ${p.estoqueAtual} ${p.unidade} (Custo: R$ ${Number(
        p.precoCusto || 0
      ).toFixed(2)})`,
      peca: p,
    }))
  }, [pecasCatalogo])

  // Manipulação de Linhas de Itens
  const handleAdicionarLinha = () => {
    setItens((prev) => [...prev, criarLinhaItemVazia()])
  }

  const handleRemoverLinha = (index) => {
    if (itens.length <= 1) {
      toast.warning('O pedido deve conter pelo menos uma peça ou produto.')
      return
    }
    setItens((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSelecionarPecaLinha = (index, opcao) => {
    if (!opcao) {
      setItens((prev) =>
        prev.map((item, i) =>
          i === index
            ? { ...item, pecaId: '', codigo: '', nome: '', precoCusto: 0, valorTotal: 0 }
            : item
        )
      )
      return
    }

    const peca = opcao.peca
    const custo = Number(peca.precoCusto) || 0

    setItens((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const qtd = Number(item.quantidade) || 1
          return {
            ...item,
            pecaId: peca.id,
            codigo: peca.codigo,
            nome: peca.nome,
            unidade: peca.unidade || 'UN',
            precoCusto: custo,
            valorTotal: qtd * custo,
          }
        }
        return item
      })
    )
  }

  const handleAlterarQuantidadeLinha = (index, valor) => {
    const qtd = Math.max(0.01, Number(valor) || 0)
    setItens((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const custo = Number(item.precoCusto) || 0
          return {
            ...item,
            quantidade: valor,
            valorTotal: qtd * custo,
          }
        }
        return item
      })
    )
  }

  const handleAlterarPrecoLinha = (index, valor) => {
    const custo = Math.max(0, Number(valor) || 0)
    setItens((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const qtd = Number(item.quantidade) || 0
          return {
            ...item,
            precoCusto: valor,
            valorTotal: qtd * custo,
          }
        }
        return item
      })
    )
  }

  // Callback de sucesso ao salvar nova peça pelo modal interno
  const handleNovaPecaCadastrada = (novaPeca) => {
    const listaAtualizada = carregarPecasCadastradas()
    setPecasCatalogo(listaAtualizada)

    if (indiceLinhaPecaNova !== null) {
      const custo = Number(novaPeca.precoCusto) || 0
      setItens((prev) =>
        prev.map((item, i) => {
          if (i === indiceLinhaPecaNova) {
            const qtd = Number(item.quantidade) || 1
            return {
              ...item,
              pecaId: novaPeca.id,
              codigo: novaPeca.codigo,
              nome: novaPeca.nome,
              unidade: novaPeca.unidade || 'UN',
              precoCusto: custo,
              valorTotal: qtd * custo,
            }
          }
          return item
        })
      )
    }

    setModalPecaAberto(false)
    setIndiceLinhaPecaNova(null)
    toast.success(`Peça "${novaPeca.nome}" adicionada ao catálogo e vinculada ao pedido!`)
  }

  // Callback de sucesso ao salvar novo fornecedor pelo modal interno
  const handleNovoFornecedorCadastrado = (novoFornecedor) => {
    const listaAtualizada = carregarTerceirosCadastrados()
    setFornecedores(listaAtualizada)
    setFornecedorId(novoFornecedor.id)
    setModalFornecedorAberto(false)
    toast.success(`Fornecedor "${novoFornecedor.nomeFantasia || novoFornecedor.razaoSocial}" cadastrado com sucesso!`)
  }

  // Cálculos de Totais
  const resumoTotal = useMemo(() => {
    const totalItens = itens.length
    const totalUnidades = itens.reduce((acc, item) => acc + (Number(item.quantidade) || 0), 0)
    const valorTotal = itens.reduce((acc, item) => acc + (Number(item.valorTotal) || 0), 0)
    return {
      totalItens,
      totalUnidades,
      valorTotal: valorTotal.toFixed(2),
      valorTotalFormatado: valorTotal.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    }
  }, [itens])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!fornecedorId) {
      toast.warning('Selecione o fornecedor ou distribuidora de autopeças.')
      return
    }

    const itensValidos = itens.filter((i) => i.nome && Number(i.quantidade) > 0)
    if (itensValidos.length === 0) {
      toast.warning('Adicione ao menos uma peça ou produto válido ao pedido de compra.')
      return
    }

    const fornecedorObj = fornecedores.find((f) => f.id === fornecedorId)
    const osObj = ordensAbertas.find((o) => String(o.numeroOS) === String(vinculoOS))

    const payload = {
      id: pedidoParaEditar?.id || `ped-${Date.now()}`,
      numeroPedido: (numeroPedido || gerarProximoNumeroPedido()).trim().toUpperCase(),
      fornecedorId,
      fornecedorNome: fornecedorObj ? (fornecedorObj.nomeFantasia || fornecedorObj.razaoSocial) : 'Fornecedor',
      fornecedorTelefone: fornecedorObj?.contatoTelefone || fornecedorObj?.telefone || '',
      origemTipo: vinculoOS !== 'NENHUM' ? 'ORDEM_SERVICO' : 'REPOSICAO_ESTOQUE',
      numeroOS: vinculoOS !== 'NENHUM' ? vinculoOS : '',
      clienteNome: osObj ? osObj.cliente : '',
      veiculoPlaca: osObj ? osObj.placa : '',
      veiculoModelo: osObj ? (osObj.marcaModelo || `${osObj.marca || ''} ${osObj.modelo || ''}`.trim()) : '',
      status,
      dataEmissao: pedidoParaEditar?.dataEmissao || new Date().toISOString(),
      previsaoEntrega: previsaoEntrega || '',
      formaPagamento,
      responsavel: responsavel.trim() || 'Operador',
      observacoes: observacoes.trim(),
      itens: itensValidos.map((it) => ({
        ...it,
        quantidade: Number(it.quantidade) || 1,
        precoCusto: Number(it.precoCusto) || 0,
        valorTotal: (Number(it.quantidade) || 1) * (Number(it.precoCusto) || 0),
      })),
      valorTotal: Number(resumoTotal.valorTotal),
    }

    onSalvar(payload)
    onClose()
  }

  return (
    <>
      <ModalRedimensionavel
        isOpen={isOpen}
        onClose={onClose}
        titulo={pedidoParaEditar ? `Editar Pedido ${pedidoParaEditar.numeroPedido}` : 'Novo Pedido de Compra de Peças'}
        subtitulo="Integração de compras com Ordens de Serviço, fornecedores e entrada automática no estoque"
        icone={ShoppingCart}
        badge="Suprimentos e Aquisições"
        larguraPadrao={880}
        alturaPadrao={720}
        chaveStorage="compra_modal_dimensoes"
        storageKey="compra_modal_dimensoes"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cabeçalho do Pedido */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <ShoppingCart size={16} className="text-[#0284c7]" />
              <span>Identificação e Fornecedor</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Número do Pedido
                  </label>
                  <span className="text-[10px] font-bold text-[#0284c7] bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                    Automático
                  </span>
                </div>
                <input
                  type="text"
                  value={numeroPedido || 'Gerando...'}
                  readOnly
                  disabled
                  tabIndex={-1}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-100 border border-slate-300 text-slate-700 rounded-md cursor-not-allowed select-none"
                  title="Código sequencial gerado automaticamente pelo sistema"
                />
              </div>

              <div className="md:col-span-6">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Fornecedor / Autopeças <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setModalFornecedorAberto(true)}
                    className="text-[11px] font-bold text-[#0284c7] hover:text-[#0369a1] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} weight="bold" />
                    <span>Novo Fornecedor</span>
                  </button>
                </div>
                <Select
                  value={opcoesFornecedores.find((opt) => opt.value === fornecedorId)}
                  onChange={(opt) => setFornecedorId(opt ? opt.value : '')}
                  options={opcoesFornecedores}
                  styles={customSelectStyles}
                  placeholder="Selecione a distribuidora de autopeças..."
                  isSearchable={true}
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Status do Pedido <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={STATUS_COMPRA_OPCOES.find((opt) => opt.value === status)}
                  onChange={(opt) => setStatus(opt ? opt.value : 'AGUARDANDO_ENTREGA')}
                  options={STATUS_COMPRA_OPCOES.filter((opt) => opt.value !== 'TODOS')}
                  styles={customSelectStyles}
                  isSearchable={false}
                />
              </div>

              {/* Vínculo com Ordem de Serviço */}
              <div className="md:col-span-6">
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <Car size={14} className="text-slate-500" />
                  <span>Vincular à Ordem de Serviço (Opcional)</span>
                </label>
                <Select
                  value={opcoesOS.find((opt) => opt.value === vinculoOS)}
                  onChange={(opt) => setVinculoOS(opt ? opt.value : 'NENHUM')}
                  options={opcoesOS}
                  styles={customSelectStyles}
                  placeholder="Selecione a OS ou escolha compra para estoque..."
                  isSearchable={true}
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-slate-500" />
                  <span>Condição de Pagamento</span>
                </label>
                <Select
                  value={FORMAS_PAGAMENTO_COMPRA_OPCOES.find((opt) => opt.value === formaPagamento)}
                  onChange={(opt) => setFormaPagamento(opt ? opt.value : 'Boleto 30 Dias')}
                  options={FORMAS_PAGAMENTO_COMPRA_OPCOES}
                  styles={customSelectStyles}
                  isSearchable={false}
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <CalendarBlank size={14} className="text-slate-500" />
                  <span>Previsão de Entrega</span>
                </label>
                <input
                  type="date"
                  value={previsaoEntrega}
                  onChange={(e) => setPrevisaoEntrega(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Grade de Peças e Produtos do Pedido */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
                <Package size={16} className="text-[#0284c7]" />
                <span>Itens e Peças Solicitadas no Pedido</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIndiceLinhaPecaNova(itens.length)
                    handleAdicionarLinha()
                    setModalPecaAberto(true)
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#0284c7] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition-colors cursor-pointer"
                  title="Cadastrar uma nova peça que ainda não existe no catálogo"
                >
                  <Plus size={12} weight="bold" />
                  <span>Cadastrar Nova Peça no Catálogo</span>
                </button>

                <button
                  type="button"
                  onClick={handleAdicionarLinha}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  <Plus size={12} weight="bold" />
                  <span>Adicionar Linha</span>
                </button>
              </div>
            </div>

            {/* Tabela de Itens */}
            <div className="space-y-2.5">
              {itens.map((item, index) => {
                const opcaoSelecionada = opcoesPecas.find((opt) => opt.value === item.pecaId) || null

                return (
                  <div
                    key={item.id || index}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row items-stretch md:items-center gap-3 transition-all"
                  >
                    {/* Seleção da Peça no Catálogo */}
                    <div className="flex-1 min-w-[240px]">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-600">
                          Peça / Produto #{index + 1}
                        </label>
                        {!item.pecaId && (
                          <button
                            type="button"
                            onClick={() => {
                              setIndiceLinhaPecaNova(index)
                              setModalPecaAberto(true)
                            }}
                            className="text-[10px] font-bold text-[#0284c7] hover:underline"
                          >
                            + Não está no catálogo? Cadastrar
                          </button>
                        )}
                      </div>
                      <Select
                        value={opcaoSelecionada}
                        onChange={(opt) => handleSelecionarPecaLinha(index, opt)}
                        options={opcoesPecas}
                        styles={customSelectStyles}
                        placeholder="Pesquise a peça por código ou nome..."
                        isSearchable={true}
                        noOptionsMessage={() => 'Nenhuma peça encontrada no almoxarifado'}
                      />
                    </div>

                    {/* Quantidade */}
                    <div className="w-full md:w-28">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Qtd ({item.unidade || 'UN'})
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={item.quantidade}
                        onChange={(e) => handleAlterarQuantidadeLinha(index, e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-center"
                      />
                    </div>

                    {/* Preço de Custo Unitário */}
                    <div className="w-full md:w-32">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Custo Unit. (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.precoCusto}
                        onChange={(e) => handleAlterarPrecoLinha(index, e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-right font-medium"
                      />
                    </div>

                    {/* Subtotal da Linha */}
                    <div className="w-full md:w-32 text-right">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Subtotal (R$)
                      </label>
                      <div className="px-2 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-md">
                        R$ {Number(item.valorTotal || 0).toFixed(2)}
                      </div>
                    </div>

                    {/* Botão Remover Linha */}
                    <div className="flex items-end justify-end md:justify-center pt-2 md:pt-4">
                      <button
                        type="button"
                        onClick={() => handleRemoverLinha(index)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remover esta peça do pedido"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Dados Complementares e Observações */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <User size={14} className="text-slate-500" />
                  <span>Responsável pelo Pedido</span>
                </label>
                <input
                  type="text"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  required
                  placeholder="Nome do comprador ou operador"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div className="md:col-span-8">
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileText size={14} className="text-slate-500" />
                  <span>Observações e Instruções para o Fornecedor</span>
                </label>
                <input
                  type="text"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Entregar com nota fiscal na oficina até as 14h, aos cuidados de Gabriel"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Rodapé com Totais e Ações */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="block text-[10px] uppercase font-semibold text-slate-500">
                  Total de Itens
                </span>
                <span className="font-mono font-bold text-sm text-slate-900">
                  {resumoTotal.totalItens} {resumoTotal.totalItens === 1 ? 'item' : 'itens'} ({resumoTotal.totalUnidades} un)
                </span>
              </div>

              <div className="border-l border-slate-200 pl-6">
                <span className="block text-[10px] uppercase font-semibold text-slate-500">
                  Valor Total do Pedido
                </span>
                <span className="font-mono font-black text-base sm:text-lg text-slate-950">
                  R$ {resumoTotal.valorTotalFormatado}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <FloppyDisk size={16} weight="bold" />
                <span>Salvar Pedido de Compra</span>
              </button>
            </div>
          </div>
        </form>
      </ModalRedimensionavel>

      {/* Modal Interno de Cadastro Rápido de Peça */}
      <PecaModalForm
        isOpen={modalPecaAberto}
        onClose={() => {
          setModalPecaAberto(false)
          setIndiceLinhaPecaNova(null)
        }}
        onSalvar={handleNovaPecaCadastrada}
        pecaParaEditar={null}
      />

      {/* Modal Interno de Cadastro Rápido de Fornecedor */}
      <TerceiroModalForm
        isOpen={modalFornecedorAberto}
        onClose={() => setModalFornecedorAberto(false)}
        onSalvar={handleNovoFornecedorCadastrado}
        terceiroParaEditar={null}
      />
    </>
  )
}
