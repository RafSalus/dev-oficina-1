import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowsClockwise,
  WarningCircle,
  CheckCircle,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarPecasCadastradas,
  registrarMovimentacaoEstoque,
} from '../../../../constants/cadastrosSuprimentosData'
import { mobileSelectStyles, inputBaseClass, labelBaseClass } from '../../nova-os/mobile/mobileSelectStyles'

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

const TIPOS = [
  { value: 'ENTRADA', label: 'Entrada (+)', icon: ArrowDownLeft, desc: 'Compras, devoluções e reposições' },
  { value: 'SAIDA', label: 'Saída (-)', icon: ArrowUpRight, desc: 'Aplicação em OS, PDV e avarias' },
  { value: 'AJUSTE', label: 'Ajuste (=)', icon: ArrowsClockwise, desc: 'Balanço e inventário físico' },
]

export function MobileEstoqueMovimentoModal({ isOpen, onClose, pecaPreSelecionada = null, onSucesso = () => {} }) {
  const [pecas, setPecas] = useState([])
  const [pecaId, setPecaId] = useState('')
  const [tipo, setTipo] = useState('ENTRADA')
  const [quantidade, setQuantidade] = useState('')
  const [documento, setDocumento] = useState('')
  const [motivo, setMotivo] = useState('')
  const [responsavel, setResponsavel] = useState('Rafael Almoxarife')

  useEffect(() => {
    if (!isOpen) return
    const lista = carregarPecasCadastradas()
    setPecas(lista)
    if (pecaPreSelecionada?.id) {
      setPecaId(pecaPreSelecionada.id)
    } else if (lista.length > 0) {
      setPecaId(lista[0].id)
    }
    setTipo('ENTRADA')
    setQuantidade('')
    setDocumento('')
    setMotivo('')
  }, [isOpen, pecaPreSelecionada])

  const pecaSelecionada = useMemo(() => pecas.find((p) => p.id === pecaId) || null, [pecas, pecaId])

  const opcoesPecas = useMemo(
    () =>
      pecas.map((p) => ({
        value: p.id,
        label: `${p.codigo} - ${p.nome} (${p.estoqueAtual} ${p.unidade || 'UN'})`,
      })),
    [pecas]
  )

  const saldoAtual = pecaSelecionada ? Number(pecaSelecionada.estoqueAtual) || 0 : 0
  const qtdNumero = Number(quantidade) || 0

  const saldoProjetado = useMemo(() => {
    if (tipo === 'ENTRADA') return saldoAtual + qtdNumero
    if (tipo === 'SAIDA') return Math.max(0, saldoAtual - qtdNumero)
    if (tipo === 'AJUSTE') return Math.max(0, qtdNumero)
    return saldoAtual
  }, [saldoAtual, qtdNumero, tipo])

  const saidaMaiorQueSaldo = tipo === 'SAIDA' && qtdNumero > saldoAtual

  if (!isOpen) return null

  const handleSalvar = () => {
    if (!pecaId) return toast.warning('Selecione uma peça ou produto do almoxarifado.')
    if (quantidade === '' || qtdNumero <= 0) return toast.warning('Informe uma quantidade válida superior a zero.')
    if (saidaMaiorQueSaldo) return toast.error('A quantidade de saída é superior ao saldo atual em estoque.')

    try {
      const resultado = registrarMovimentacaoEstoque({
        pecaId,
        tipo,
        quantidade: qtdNumero,
        motivo: motivo.trim() || 'Movimentação manual do almoxarifado',
        documento: documento.trim() || 'Registro Avulso',
        responsavel: responsavel.trim() || 'Operador',
      })
      const acaoTexto = tipo === 'ENTRADA' ? 'Entrada registrada' : tipo === 'SAIDA' ? 'Saída registrada' : 'Ajuste concluído'
      toast.success(`${acaoTexto}: ${resultado.movimento.pecaNome}. Novo saldo: ${resultado.peca.estoqueAtual} ${resultado.peca.unidade || 'UN'}.`)
      onSucesso(resultado)
      onClose()
    } catch (err) {
      toast.error(err.message || 'Erro ao registrar a movimentação de estoque.')
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#eaecf0] flex flex-col">
      <header className="shrink-0 bg-white border-b border-[#e4e7ec]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="h-14 px-2 flex items-center justify-between gap-2">
          <button type="button" onClick={onClose} aria-label="Fechar" className="p-2.5 rounded-xl text-[#475467] active:bg-[#f2f4f7] shrink-0">
            <X size={20} weight="bold" />
          </button>
          <span className="text-sm font-extrabold text-[#101828] truncate">Movimentar Estoque</span>
          <div className="w-9 shrink-0" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-4">
        <div>
          <label className={labelBaseClass}>Tipo de Operação *</label>
          <div className="grid grid-cols-3 gap-2">
            {TIPOS.map((t) => {
              const Icon = t.icon
              const isAtivo = tipo === t.value
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setTipo(t.value)
                    setMotivo('')
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 h-[76px] justify-between ${
                    isAtivo ? 'border-[#0284c7] bg-sky-50' : 'border-[#d0d5dd] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold uppercase text-[#101828]">{t.label}</span>
                    <Icon size={15} weight="bold" className={isAtivo ? 'text-[#0284c7]' : 'text-[#98a2b3]'} />
                  </div>
                  <p className="text-[9.5px] text-[#667085] leading-tight">{t.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <div>
            <label className={labelBaseClass}>Peça ou Produto *</label>
            <Select
              value={opcoesPecas.find((o) => o.value === pecaId) || null}
              onChange={(opt) => setPecaId(opt ? opt.value : '')}
              options={opcoesPecas}
              styles={mobileSelectStyles}
              placeholder="Pesquise por SKU ou nome..."
            />
          </div>

          {pecaSelecionada && (
            <div className="bg-[#f8fafc] border border-[#f2f4f7] rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#101828] truncate">{pecaSelecionada.nome}</p>
                <p className="text-[10.5px] text-[#667085] font-mono">SKU {pecaSelecionada.codigo}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <span className="block text-[9px] uppercase font-bold text-[#98a2b3]">Atual</span>
                  <span className="font-mono font-bold text-xs text-[#344054]">
                    {saldoAtual} {pecaSelecionada.unidade || 'UN'}
                  </span>
                </div>
                <span className="text-[#98a2b3] font-bold">→</span>
                <div className="text-right">
                  <span className="block text-[9px] uppercase font-bold text-[#98a2b3]">
                    {tipo === 'AJUSTE' ? 'Novo' : 'Projetado'}
                  </span>
                  <span className={`font-mono font-bold text-xs ${saidaMaiorQueSaldo ? 'text-rose-600' : 'text-[#0284c7]'}`}>
                    {saldoProjetado} {pecaSelecionada.unidade || 'UN'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {saidaMaiorQueSaldo && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px]">
              <WarningCircle size={16} weight="bold" className="shrink-0" />
              <span>Quantidade excede o saldo físico ({saldoAtual} {pecaSelecionada?.unidade || 'UN'}).</span>
            </div>
          )}

          <div>
            <label className={labelBaseClass}>
              {tipo === 'AJUSTE' ? 'Nova Quantidade Contada' : 'Quantidade'} *
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder={tipo === 'AJUSTE' ? 'Ex: 15' : 'Ex: 4'}
              className={`${inputBaseClass} font-mono font-bold`}
            />
          </div>

          <div>
            <label className={labelBaseClass}>Documento de Origem</label>
            <input
              type="text"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              placeholder="Ex: NF-e 045.291 ou OS #1042"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label className={labelBaseClass}>Responsável *</label>
            <input
              type="text"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              placeholder="Nome do operador"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label className={labelBaseClass}>Motivo / Justificativa</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva o motivo desta movimentação..."
              className={inputBaseClass}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {MOTIVOS_SUGERIDOS[tipo].map((texto) => (
                <button
                  key={texto}
                  type="button"
                  onClick={() => setMotivo(texto)}
                  className="text-[10.5px] px-2.5 py-1.5 rounded-lg bg-[#f2f4f7] active:bg-sky-50 text-[#475467] border border-[#e4e7ec]"
                >
                  {texto}
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="shrink-0 bg-white border-t border-[#e4e7ec] px-4 py-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}>
        <button
          type="button"
          onClick={handleSalvar}
          disabled={saidaMaiorQueSaldo}
          className={`w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${
            saidaMaiorQueSaldo ? 'bg-[#d0d5dd] text-[#98a2b3]' : 'bg-[#0284c7] active:bg-sky-700 text-white'
          }`}
        >
          <CheckCircle size={18} weight="bold" />
          Confirmar Movimentação
        </button>
      </footer>
    </div>
  )
}
