import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import {
  X,
  ShoppingCart,
  Package,
  Plus,
  Trash,
  CheckCircle,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarPecasCadastradas,
  carregarTerceirosCadastrados,
} from '../../../../constants/cadastrosSuprimentosData'
import {
  STATUS_COMPRA_OPCOES,
  FORMAS_PAGAMENTO_COMPRA_OPCOES,
  gerarProximoNumeroPedido,
} from '../../../../constants/comprasData'
import { obterOrdensAbertas } from '../../orcamento/mockOrdensAbertas'
import {
  mobileSelectStyles,
  inputBaseClass,
  labelBaseClass,
} from '../../nova-os/mobile/mobileSelectStyles'
import { MobilePecaFormModal } from './MobilePecaFormModal'
import { MobileTerceiroFormModal } from './MobileTerceiroFormModal'

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

export function MobileCompraFormModal({ isOpen, onClose, onSalvar, onExcluir, pedidoParaEditar = null, demandaInicial = null }) {
  const [pecasCatalogo, setPecasCatalogo] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [ordensAbertas, setOrdensAbertas] = useState([])

  const [modalPecaAberto, setModalPecaAberto] = useState(false)
  const [indiceLinhaPecaNova, setIndiceLinhaPecaNova] = useState(null)
  const [modalFornecedorAberto, setModalFornecedorAberto] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)

  const [numeroPedido, setNumeroPedido] = useState('')
  const [fornecedorId, setFornecedorId] = useState('')
  const [status, setStatus] = useState('AGUARDANDO_ENTREGA')
  const [vinculoOS, setVinculoOS] = useState('NENHUM')
  const [formaPagamento, setFormaPagamento] = useState('Boleto 30 Dias')
  const [previsaoEntrega, setPrevisaoEntrega] = useState('')
  const [responsavel, setResponsavel] = useState('Rafael Almoxarife')
  const [observacoes, setObservacoes] = useState('')
  const [itens, setItens] = useState([])

  useEffect(() => {
    if (!isOpen) return
    const pecas = carregarPecasCadastradas()
    const terc = carregarTerceirosCadastrados()
    const ordens = obterOrdensAbertas()
    setPecasCatalogo(pecas)
    setFornecedores(terc)
    setOrdensAbertas(ordens)
    setConfirmandoExclusao(false)

    if (pedidoParaEditar) {
      setNumeroPedido(pedidoParaEditar.numeroPedido || '')
      setFornecedorId(pedidoParaEditar.fornecedorId || '')
      setStatus(pedidoParaEditar.status || 'AGUARDANDO_ENTREGA')
      setVinculoOS(pedidoParaEditar.numeroOS || 'NENHUM')
      setFormaPagamento(pedidoParaEditar.formaPagamento || 'Boleto 30 Dias')
      setPrevisaoEntrega(pedidoParaEditar.previsaoEntrega || '')
      setResponsavel(pedidoParaEditar.responsavel || 'Rafael Almoxarife')
      setObservacoes(pedidoParaEditar.observacoes || '')
      setItens(pedidoParaEditar.itens?.length > 0 ? pedidoParaEditar.itens : [criarLinhaItemVazia()])
    } else if (demandaInicial) {
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
          (demandaInicial.numeroOS ? `Pedido de compra gerado a partir da OS #${demandaInicial.numeroOS}` : 'Pedido de reposição de estoque')
      )
      if (demandaInicial.itens?.length > 0) {
        setItens(demandaInicial.itens)
      } else if (demandaInicial.itemCodigo || demandaInicial.codigo) {
        const qtd = Number(demandaInicial.quantidadeNecessaria || demandaInicial.sugestaoCompra || 1)
        const custo = Number(demandaInicial.precoEstimado || demandaInicial.precoCusto || 0)
        setItens([{
          id: `item-${Date.now()}`,
          pecaId: demandaInicial.pecaId || '',
          codigo: demandaInicial.itemCodigo || demandaInicial.codigo || '',
          nome: demandaInicial.itemNome || demandaInicial.nome || '',
          unidade: demandaInicial.unidade || 'UN',
          quantidade: qtd,
          precoCusto: custo,
          valorTotal: qtd * custo,
        }])
      } else {
        setItens([criarLinhaItemVazia()])
      }
    } else {
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
  }, [isOpen, pedidoParaEditar, demandaInicial])

  const opcoesFornecedores = useMemo(
    () => fornecedores.map((f) => ({ value: f.id, label: `${f.nomeFantasia || f.razaoSocial} (${f.categoria || f.tipoServico || 'Fornecedor'})` })),
    [fornecedores]
  )

  const opcoesOS = useMemo(() => {
    const lista = [{ value: 'NENHUM', label: 'Sem Vínculo com OS (Reposição de Estoque)' }]
    ordensAbertas.forEach((os) => {
      lista.push({ value: String(os.numeroOS), label: `OS #${os.numeroOS} - ${os.cliente} (${os.marcaModelo || os.placa})` })
    })
    return lista
  }, [ordensAbertas])

  const opcoesPecas = useMemo(
    () =>
      pecasCatalogo.map((p) => ({
        value: p.id,
        label: `[${p.codigo}] ${p.nome} - Atual: ${p.estoqueAtual} ${p.unidade}`,
        peca: p,
      })),
    [pecasCatalogo]
  )

  const handleAdicionarLinha = () => setItens((prev) => [...prev, criarLinhaItemVazia()])

  const handleRemoverLinha = (index) => {
    if (itens.length <= 1) return toast.warning('O pedido deve conter pelo menos uma peça.')
    setItens((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSelecionarPecaLinha = (index, opcao) => {
    if (!opcao) {
      setItens((prev) => prev.map((item, i) => (i === index ? { ...item, pecaId: '', codigo: '', nome: '', precoCusto: 0, valorTotal: 0 } : item)))
      return
    }
    const peca = opcao.peca
    const custo = Number(peca.precoCusto) || 0
    setItens((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item
        const qtd = Number(item.quantidade) || 1
        return { ...item, pecaId: peca.id, codigo: peca.codigo, nome: peca.nome, unidade: peca.unidade || 'UN', precoCusto: custo, valorTotal: qtd * custo }
      })
    )
  }

  const handleAlterarQuantidadeLinha = (index, valor) => {
    const qtd = Math.max(0.01, Number(valor) || 0)
    setItens((prev) => prev.map((item, i) => (i === index ? { ...item, quantidade: valor, valorTotal: qtd * (Number(item.precoCusto) || 0) } : item)))
  }

  const handleAlterarPrecoLinha = (index, valor) => {
    const custo = Math.max(0, Number(valor) || 0)
    setItens((prev) => prev.map((item, i) => (i === index ? { ...item, precoCusto: valor, valorTotal: (Number(item.quantidade) || 0) * custo } : item)))
  }

  const handleNovaPecaCadastrada = (novaPeca) => {
    setPecasCatalogo(carregarPecasCadastradas())
    if (indiceLinhaPecaNova !== null) {
      const custo = Number(novaPeca.precoCusto) || 0
      setItens((prev) =>
        prev.map((item, i) => {
          if (i !== indiceLinhaPecaNova) return item
          const qtd = Number(item.quantidade) || 1
          return { ...item, pecaId: novaPeca.id, codigo: novaPeca.codigo, nome: novaPeca.nome, unidade: novaPeca.unidade || 'UN', precoCusto: custo, valorTotal: qtd * custo }
        })
      )
    }
    setModalPecaAberto(false)
    setIndiceLinhaPecaNova(null)
    toast.success(`Peça "${novaPeca.nome}" cadastrada e vinculada ao pedido!`)
  }

  const handleNovoFornecedorCadastrado = (novoFornecedor) => {
    setFornecedores(carregarTerceirosCadastrados())
    setFornecedorId(novoFornecedor.id)
    setModalFornecedorAberto(false)
    toast.success(`Fornecedor "${novoFornecedor.nomeFantasia || novoFornecedor.razaoSocial}" cadastrado!`)
  }

  const resumoTotal = useMemo(() => {
    const totalItens = itens.length
    const totalUnidades = itens.reduce((acc, item) => acc + (Number(item.quantidade) || 0), 0)
    const valorTotal = itens.reduce((acc, item) => acc + (Number(item.valorTotal) || 0), 0)
    return { totalItens, totalUnidades, valorTotal, valorTotalFormatado: valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
  }, [itens])

  if (!isOpen) return null

  const handleSalvar = () => {
    if (!fornecedorId) return toast.warning('Selecione o fornecedor ou distribuidora de autopeças.')
    const itensValidos = itens.filter((i) => i.nome && Number(i.quantidade) > 0)
    if (itensValidos.length === 0) return toast.warning('Adicione ao menos uma peça válida ao pedido.')

    const fornecedorObj = fornecedores.find((f) => f.id === fornecedorId)
    const osObj = ordensAbertas.find((o) => String(o.numeroOS) === String(vinculoOS))

    onSalvar({
      id: pedidoParaEditar?.id || `ped-${Date.now()}`,
      numeroPedido: (numeroPedido || gerarProximoNumeroPedido()).trim().toUpperCase(),
      fornecedorId,
      fornecedorNome: fornecedorObj ? fornecedorObj.nomeFantasia || fornecedorObj.razaoSocial : 'Fornecedor',
      fornecedorTelefone: fornecedorObj?.contatoTelefone || fornecedorObj?.telefone || '',
      origemTipo: vinculoOS !== 'NENHUM' ? 'ORDEM_SERVICO' : 'REPOSICAO_ESTOQUE',
      numeroOS: vinculoOS !== 'NENHUM' ? vinculoOS : '',
      clienteNome: osObj ? osObj.cliente : '',
      veiculoPlaca: osObj ? osObj.placa : '',
      veiculoModelo: osObj ? osObj.marcaModelo || `${osObj.marca || ''} ${osObj.modelo || ''}`.trim() : '',
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
      valorTotal: resumoTotal.valorTotal,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#eaecf0] flex flex-col">
      <header className="shrink-0 bg-white border-b border-[#e4e7ec]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="h-14 px-2 flex items-center justify-between gap-2">
          <button type="button" onClick={onClose} aria-label="Fechar" className="p-2.5 rounded-xl text-[#475467] active:bg-[#f2f4f7] shrink-0">
            <X size={20} weight="bold" />
          </button>
          <span className="text-sm font-extrabold text-[#101828] truncate">
            {pedidoParaEditar ? `Editar Pedido ${pedidoParaEditar.numeroPedido}` : 'Novo Pedido de Compra'}
          </span>
          <div className="w-9 shrink-0" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-4">
        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <ShoppingCart size={14} weight="bold" className="text-[#0284c7]" />
            Identificação e Fornecedor
          </h3>

          <div>
            <label className={labelBaseClass}>Número do Pedido</label>
            <input type="text" value={numeroPedido || 'Gerando...'} readOnly disabled className={`${inputBaseClass} font-mono opacity-70`} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`${labelBaseClass} mb-0`}>Fornecedor / Autopeças *</label>
              <button type="button" onClick={() => setModalFornecedorAberto(true)} className="text-[10.5px] font-bold text-[#0284c7]">
                + Novo Fornecedor
              </button>
            </div>
            <Select
              value={opcoesFornecedores.find((o) => o.value === fornecedorId) || null}
              onChange={(opt) => setFornecedorId(opt ? opt.value : '')}
              options={opcoesFornecedores}
              styles={mobileSelectStyles}
              placeholder="Selecione a distribuidora..."
            />
          </div>

          <div>
            <label className={labelBaseClass}>Status do Pedido *</label>
            <Select
              value={STATUS_COMPRA_OPCOES.find((o) => o.value === status)}
              onChange={(opt) => setStatus(opt ? opt.value : 'AGUARDANDO_ENTREGA')}
              options={STATUS_COMPRA_OPCOES.filter((o) => o.value !== 'TODOS')}
              styles={mobileSelectStyles}
              isSearchable={false}
            />
          </div>

          <div>
            <label className={labelBaseClass}>Vincular à Ordem de Serviço</label>
            <Select
              value={opcoesOS.find((o) => o.value === vinculoOS)}
              onChange={(opt) => setVinculoOS(opt ? opt.value : 'NENHUM')}
              options={opcoesOS}
              styles={mobileSelectStyles}
              placeholder="Selecione a OS ou reposição de estoque..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBaseClass}>Pagamento</label>
              <Select
                value={FORMAS_PAGAMENTO_COMPRA_OPCOES.find((o) => o.value === formaPagamento)}
                onChange={(opt) => setFormaPagamento(opt ? opt.value : 'Boleto 30 Dias')}
                options={FORMAS_PAGAMENTO_COMPRA_OPCOES}
                styles={mobileSelectStyles}
                isSearchable={false}
              />
            </div>
            <div>
              <label className={labelBaseClass}>Previsão de Entrega</label>
              <input type="date" value={previsaoEntrega} onChange={(e) => setPrevisaoEntrega(e.target.value)} className={inputBaseClass} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
              <Package size={14} weight="bold" className="text-[#0284c7]" />
              Itens do Pedido
            </h3>
            <button
              type="button"
              onClick={() => {
                setIndiceLinhaPecaNova(itens.length)
                handleAdicionarLinha()
                setModalPecaAberto(true)
              }}
              className="text-[10.5px] font-bold text-[#0284c7]"
            >
              + Cadastrar Peça
            </button>
          </div>

          <div className="space-y-2.5">
            {itens.map((item, index) => {
              const opcaoSelecionada = opcoesPecas.find((o) => o.value === item.pecaId) || null
              return (
                <div key={item.id || index} className="p-3 bg-[#f8fafc] border border-[#e4e7ec] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-[#667085]">Peça #{index + 1}</span>
                    <button type="button" onClick={() => handleRemoverLinha(index)} className="p-1 text-[#98a2b3] active:text-rose-600">
                      <Trash size={15} weight="bold" />
                    </button>
                  </div>
                  <Select
                    value={opcaoSelecionada}
                    onChange={(opt) => handleSelecionarPecaLinha(index, opt)}
                    options={opcoesPecas}
                    styles={mobileSelectStyles}
                    placeholder="Pesquise a peça por código ou nome..."
                    noOptionsMessage={() => 'Nenhuma peça encontrada'}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelBaseClass}>Qtd ({item.unidade || 'UN'})</label>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={item.quantidade}
                        onChange={(e) => handleAlterarQuantidadeLinha(index, e.target.value)}
                        className={`${inputBaseClass} text-center font-mono`}
                      />
                    </div>
                    <div>
                      <label className={labelBaseClass}>Custo Unit. (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.precoCusto}
                        onChange={(e) => handleAlterarPrecoLinha(index, e.target.value)}
                        className={`${inputBaseClass} text-right font-mono`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-[#e4e7ec]">
                    <span className="text-[10.5px] font-semibold text-[#667085]">Subtotal</span>
                    <span className="font-mono font-bold text-sm text-[#101828]">R$ {Number(item.valorTotal || 0).toFixed(2)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            onClick={handleAdicionarLinha}
            className="w-full h-10 rounded-xl border border-dashed border-[#d0d5dd] text-[#344054] text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Plus size={14} weight="bold" />
            Adicionar Linha
          </button>
        </section>

        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <div>
            <label className={labelBaseClass}>Responsável pelo Pedido</label>
            <input type="text" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Nome do comprador" className={inputBaseClass} />
          </div>
          <div>
            <label className={labelBaseClass}>Observações para o Fornecedor</label>
            <input
              type="text"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Entregar com nota fiscal até as 14h"
              className={inputBaseClass}
            />
          </div>
        </section>

        <section className="bg-[#101828] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase font-bold text-zinc-400">Total ({resumoTotal.totalItens} itens)</span>
            <span className="text-lg font-black text-white font-mono">R$ {resumoTotal.valorTotalFormatado}</span>
          </div>
        </section>

        {pedidoParaEditar && onExcluir && (
          <section>
            {confirmandoExclusao ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 flex items-center gap-2">
                <span className="flex-1 text-xs font-bold text-[#101828]">Excluir este pedido?</span>
                <button type="button" onClick={() => setConfirmandoExclusao(false)} className="h-9 px-3 rounded-lg border border-[#d0d5dd] bg-white text-[#344054] text-xs font-bold">
                  Cancelar
                </button>
                <button type="button" onClick={() => onExcluir(pedidoParaEditar)} className="h-9 px-3 rounded-lg bg-[#b42318] text-white text-xs font-bold">
                  Confirmar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmandoExclusao(true)}
                className="w-full h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Trash size={15} weight="bold" />
                Excluir Pedido
              </button>
            )}
          </section>
        )}
      </main>

      <footer className="shrink-0 bg-white border-t border-[#e4e7ec] px-4 py-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}>
        <button type="button" onClick={handleSalvar} className="w-full h-12 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-sm font-bold flex items-center justify-center gap-2">
          <CheckCircle size={18} weight="bold" />
          Salvar Pedido de Compra
        </button>
      </footer>

      <MobilePecaFormModal
        isOpen={modalPecaAberto}
        onClose={() => { setModalPecaAberto(false); setIndiceLinhaPecaNova(null) }}
        onSalvar={handleNovaPecaCadastrada}
        pecaParaEditar={null}
      />

      <MobileTerceiroFormModal
        isOpen={modalFornecedorAberto}
        onClose={() => setModalFornecedorAberto(false)}
        onSalvar={handleNovoFornecedorCadastrado}
        terceiroParaEditar={null}
      />
    </div>
  )
}
