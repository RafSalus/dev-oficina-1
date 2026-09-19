import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import {
  ArrowsLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowsClockwise,
  Package,
  FloppyDisk,
  WarningCircle,
  FileText,
  User,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from './ModalRedimensionavel'
import { customSelectStyles } from './customSelectStyles'
import {
  carregarPecasCadastradas,
  registrarMovimentacaoEstoque,
} from '../../constants/cadastrosSuprimentosData'

const MOTIVOS_SUGERIDOS = {
  ENTRADA: [
    'Recebimento de Compra de Fornecedor',
    'Devolução de Peça de Ordem de Serviço',
    'Retorno de Garantia',
    'Entrada Avulsa de Almoxarifado',
  ],
  SAIDA: [
    'Aplicação em Ordem de Serviço',
    'Venda de Balcão (PDV)',
    'Avaria ou Danificação no Pátio',
    'Descarte Técnico Homologado',
  ],
  AJUSTE: [
    'Ajuste de Balanço e Inventário Físico',
    'Correção de Contagem do Almoxarifado',
    'Auditoria Semanal de Prateleiras',
    'Acerto Inicial de Cadastro',
  ],
}

export function EstoqueMovimentoModal({
  isOpen,
  onClose,
  pecaPreSelecionada = null,
  onSucesso = () => {},
}) {
  const [pecas, setPecas] = useState([])
  const [pecaId, setPecaId] = useState('')
  const [tipo, setTipo] = useState('ENTRADA')
  const [quantidade, setQuantidade] = useState('')
  const [documento, setDocumento] = useState('')
  const [motivo, setMotivo] = useState('')
  const [responsavel, setResponsavel] = useState('Rafael Almoxarife')

  useEffect(() => {
    if (isOpen) {
      const lista = carregarPecasCadastradas()
      setPecas(lista)

      if (pecaPreSelecionada && pecaPreSelecionada.id) {
        setPecaId(pecaPreSelecionada.id)
      } else if (lista.length > 0 && !pecaId) {
        setPecaId(lista[0].id)
      }

      setQuantidade('')
      setDocumento('')
      setMotivo('')
    }
  }, [isOpen, pecaPreSelecionada])

  const pecaSelecionada = useMemo(() => {
    return pecas.find((p) => p.id === pecaId) || null
  }, [pecas, pecaId])

  const opcoesPecas = useMemo(() => {
    return pecas.map((p) => ({
      value: p.id,
      label: `${p.codigo} - ${p.nome} (Estoque: ${p.estoqueAtual} ${p.unidade || 'UN'})`,
      peca: p,
    }))
  }, [pecas])

  const valorPecaSelecionadaOption = useMemo(() => {
    return opcoesPecas.find((opt) => opt.value === pecaId) || null
  }, [opcoesPecas, pecaId])

  const saldoAtual = pecaSelecionada ? Number(pecaSelecionada.estoqueAtual) || 0 : 0
  const qtdNumero = Number(quantidade) || 0

  const saldoProjetado = useMemo(() => {
    if (tipo === 'ENTRADA') return saldoAtual + qtdNumero
    if (tipo === 'SAIDA') return Math.max(0, saldoAtual - qtdNumero)
    if (tipo === 'AJUSTE') return Math.max(0, qtdNumero)
    return saldoAtual
  }, [saldoAtual, qtdNumero, tipo])

  const saidaMaiorQueSaldo = tipo === 'SAIDA' && qtdNumero > saldoAtual

  const handleAplicarMotivoSugerido = (texto) => {
    setMotivo(texto)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!pecaId) {
      toast.warning('Selecione uma peça ou produto do almoxarifado.')
      return
    }

    if (quantidade === '' || qtdNumero <= 0) {
      toast.warning('Informe uma quantidade válida superior a zero.')
      return
    }

    if (tipo === 'SAIDA' && saidaMaiorQueSaldo) {
      toast.error('A quantidade de saída informada é superior ao saldo atual em estoque.')
      return
    }

    try {
      const resultado = registrarMovimentacaoEstoque({
        pecaId,
        tipo,
        quantidade: qtdNumero,
        motivo: motivo.trim() || 'Movimentação manual do almoxarifado',
        documento: documento.trim() || 'Registro Avulso',
        responsavel: responsavel.trim() || 'Operador',
      })

      const acaoTexto =
        tipo === 'ENTRADA' ? 'Entrada registrada' : tipo === 'SAIDA' ? 'Saída registrada' : 'Ajuste concluído'

      toast.success(
        `${acaoTexto}: ${resultado.movimento.pecaNome}. Novo saldo: ${resultado.peca.estoqueAtual} ${resultado.peca.unidade || 'UN'}.`
      )

      onSucesso(resultado)
      onClose()
    } catch (err) {
      toast.error(err.message || 'Erro ao registrar a movimentação de estoque.')
    }
  }

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      titulo="Movimentação de Estoque e Almoxarifado"
      subtitulo="Lançamento de entradas, saídas técnicas e ajustes de inventário físico com auditoria"
      icone={ArrowsLeftRight}
      badge="Controle Operacional"
      larguraPadrao={760}
      alturaPadrao={640}
      chaveStorage="estoque_movimento_modal"
      storageKey="estoque_movimento_modal"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Seletor de Tipo de Movimento */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Tipo de Operação no Almoxarifado <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setTipo('ENTRADA')
                setMotivo('')
              }}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                tipo === 'ENTRADA'
                  ? 'border-sky-600 bg-sky-50 text-sky-950 ring-2 ring-sky-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">Entrada (+)</span>
                <ArrowDownLeft
                  size={18}
                  weight="bold"
                  className={tipo === 'ENTRADA' ? 'text-sky-600' : 'text-slate-400'}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Compras de fornecedores, devoluções de OS e reposições.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setTipo('SAIDA')
                setMotivo('')
              }}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                tipo === 'SAIDA'
                  ? 'border-sky-600 bg-sky-50 text-sky-950 ring-2 ring-sky-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">Saída (-)</span>
                <ArrowUpRight
                  size={18}
                  weight="bold"
                  className={tipo === 'SAIDA' ? 'text-sky-600' : 'text-slate-400'}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Aplicação em OS de clientes, vendas PDV e avarias.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setTipo('AJUSTE')
                setMotivo('')
              }}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                tipo === 'AJUSTE'
                  ? 'border-sky-600 bg-sky-50 text-sky-950 ring-2 ring-sky-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">Ajuste (=)</span>
                <ArrowsClockwise
                  size={18}
                  weight="bold"
                  className={tipo === 'AJUSTE' ? 'text-sky-600' : 'text-slate-400'}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Balanço periódico, inventário físico e auditoria de saldo.
              </p>
            </button>
          </div>
        </div>

        {/* Seleção do Item */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Peça ou Produto <span className="text-rose-500">*</span>
            </label>
            <Select
              value={valorPecaSelecionadaOption}
              onChange={(opt) => setPecaId(opt ? opt.value : '')}
              options={opcoesPecas}
              styles={customSelectStyles}
              placeholder="Pesquise por código SKU ou nome da peça..."
              isSearchable={true}
              noOptionsMessage={() => 'Nenhuma peça encontrada'}
            />
          </div>

          {/* Dados do Item Selecionado e Projeção de Estoque */}
          {pecaSelecionada && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-xs">
                  <Package size={22} />
                </div>
                <div>
                  <div className="font-semibold text-xs sm:text-sm text-slate-900">
                    {pecaSelecionada.nome}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                    <span>SKU: {pecaSelecionada.codigo}</span>
                    <span>•</span>
                    <span>Local: {pecaSelecionada.localizacao || 'Almoxarifado Central'}</span>
                  </div>
                </div>
              </div>

              {/* Indicador de Saldo */}
              <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
                <div className="text-right sm:text-left">
                  <span className="block text-[10px] uppercase font-semibold text-slate-500">
                    Saldo Atual
                  </span>
                  <span className="font-mono font-bold text-sm text-slate-800">
                    {saldoAtual} {pecaSelecionada.unidade || 'UN'}
                  </span>
                </div>

                <span className="text-slate-300 font-bold">→</span>

                <div className="text-right sm:text-left">
                  <span className="block text-[10px] uppercase font-semibold text-slate-500">
                    {tipo === 'AJUSTE' ? 'Novo Saldo Físico' : 'Saldo Projetado'}
                  </span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      saidaMaiorQueSaldo ? 'text-rose-600' : 'text-sky-700'
                    }`}
                  >
                    {saldoProjetado} {pecaSelecionada.unidade || 'UN'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Alerta de Saída Maior que Saldo */}
          {saidaMaiorQueSaldo && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
              <WarningCircle size={18} weight="bold" className="shrink-0" />
              <span>
                Atenção: A quantidade informada excede o saldo físico em estoque ({saldoAtual}{' '}
                {pecaSelecionada?.unidade || 'UN'}).
              </span>
            </div>
          )}

          {/* Grid de Quantidade e Documento */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-5">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {tipo === 'AJUSTE' ? 'Nova Quantidade Contada' : 'Quantidade a Movimentar'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder={tipo === 'AJUSTE' ? 'Ex: 15' : 'Ex: 4'}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none font-mono font-semibold"
              />
            </div>

            <div className="sm:col-span-7">
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText size={14} className="text-slate-400" />
                <span>Documento de Origem / Referência</span>
              </label>
              <input
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Ex: NF-e 045.291 ou Ordem de Serviço #1042"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>

            <div className="sm:col-span-12">
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <User size={14} className="text-slate-400" />
                <span>Responsável pelo Lançamento <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                placeholder="Nome do operador ou recepcionista responsável"
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>

            <div className="sm:col-span-12">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  Motivo ou Justificativa do Lançamento
                </label>
                <span className="text-[11px] text-slate-400">Sugestões rápidas abaixo</span>
              </div>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Descreva o motivo desta movimentação..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />

              {/* Botões de sugestão de motivo */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {MOTIVOS_SUGERIDOS[tipo].map((texto) => (
                  <button
                    key={texto}
                    type="button"
                    onClick={() => handleAplicarMotivoSugerido(texto)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 transition-colors cursor-pointer border border-slate-200/60"
                  >
                    {texto}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saidaMaiorQueSaldo}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer ${
              saidaMaiorQueSaldo
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white'
            }`}
          >
            <FloppyDisk size={16} weight="bold" />
            <span>Confirmar Movimentação</span>
          </button>
        </div>
      </form>
    </ModalRedimensionavel>
  )
}
