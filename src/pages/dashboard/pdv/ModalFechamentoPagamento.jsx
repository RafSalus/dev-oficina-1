import React, { useEffect, useMemo, useState } from 'react'
import Select from 'react-select'
import { IMaskInput } from 'react-imask'
import {
  Plus,
  Trash,
  Money,
  QrCode,
  CreditCard,
  Barcode,
  Receipt,
  CheckCircle,
  WarningCircle,
  User,
  FileText,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from '../../../components/suprimentos/ModalRedimensionavel'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'
import { FORMAS_PAGAMENTO_OPCOES, PARCELAS_OPCOES, TIPO_NOTA_OPCOES, formatMoeda } from './pdvData'

const ICONE_FORMA = {
  dinheiro: Money,
  pix: QrCode,
  debito: CreditCard,
  credito: CreditCard,
  boleto: Barcode,
}

let seqId = 0
function proximoId() {
  seqId += 1
  return `pgto-${Date.now()}-${seqId}`
}

export function ModalFechamentoPagamento({
  isOpen,
  onClose,
  totalGeral,
  cliente,
  numeroOSVinculada,
  onConfirmar,
  processando = false,
}) {
  const [formasPagamento, setFormasPagamento] = useState([])
  const [tipoNota, setTipoNota] = useState(TIPO_NOTA_OPCOES[0])
  const [documentoNota, setDocumentoNota] = useState('')

  useEffect(() => {
    if (isOpen) {
      setFormasPagamento([{ id: proximoId(), metodo: 'pix', valor: Number(totalGeral) || 0, parcelas: 1 }])
      setDocumentoNota(cliente?.documento || '')
      setTipoNota(TIPO_NOTA_OPCOES[0])
    }
  }, [isOpen])

  const somaFormas = useMemo(
    () => formasPagamento.reduce((acc, f) => acc + (Number(f.valor) || 0), 0),
    [formasPagamento]
  )

  const vendaGratuita = Number(totalGeral) <= 0
  const temDinheiro = formasPagamento.some((f) => f.metodo === 'dinheiro')
  const diferenca = Number((totalGeral - somaFormas).toFixed(2))
  const troco = diferenca < -0.009 && temDinheiro ? Math.abs(diferenca) : 0
  const faltante = !vendaGratuita && diferenca > 0.009 ? diferenca : 0
  const excedeSemTroco = !vendaGratuita && diferenca < -0.009 && !temDinheiro
  const fechamentoValido = vendaGratuita
    ? true
    : formasPagamento.length > 0 &&
      formasPagamento.every((f) => f.metodo && Number(f.valor) > 0) &&
      faltante === 0 &&
      !excedeSemTroco

  const handleAdicionarForma = () => {
    const restante = Math.max(0, Number((totalGeral - somaFormas).toFixed(2)))
    setFormasPagamento((prev) => [
      ...prev,
      { id: proximoId(), metodo: 'credito', valor: restante, parcelas: 1 },
    ])
  }

  const handleRemoverForma = (id) => {
    setFormasPagamento((prev) => prev.filter((f) => f.id !== id))
  }

  const handleAlterarForma = (id, campo, valor) => {
    setFormasPagamento((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [campo]: valor, ...(campo === 'metodo' && valor !== 'credito' && valor !== 'boleto' ? { parcelas: 1 } : {}) } : f))
    )
  }

  const handleConfirmar = () => {
    if (!fechamentoValido) {
      toast.warning('Confira as formas de pagamento: o total informado precisa fechar com o valor da venda.')
      return
    }
    onConfirmar({
      formasPagamento,
      tipoNota: tipoNota.value,
      documentoNota,
      troco,
    })
  }

  const resumoFormaPagamento = formasPagamento
    .map((f) => {
      const opcao = FORMAS_PAGAMENTO_OPCOES.find((o) => o.value === f.metodo)
      const parcela = (f.metodo === 'credito' || f.metodo === 'boleto') && f.parcelas > 1 ? ` ${f.parcelas}x` : ''
      return `${opcao?.label || f.metodo}${parcela}`
    })
    .join(' + ')

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      chaveStorage="dev_oficina_pdv_modal_pagamento"
      larguraPadrao={640}
      alturaPadrao={640}
      larguraMinima={520}
      alturaMinima={460}
      larguraMaxima={960}
      alturaMaxima={820}
      titulo="Fechamento da Venda"
      subtitulo={numeroOSVinculada ? `Vinculada à OS #${numeroOSVinculada}` : 'Venda avulsa de balcão'}
      badge="PDV"
      icone={Receipt}
      rodape={
        <div className="flex items-center justify-between w-full gap-3">
          <div className="text-xs">
            {faltante > 0 && (
              <span className="font-bold text-rose-600 flex items-center gap-1.5">
                <WarningCircle size={15} weight="fill" />
                Faltam R$ {formatMoeda(faltante)}
              </span>
            )}
            {excedeSemTroco && (
              <span className="font-bold text-rose-600 flex items-center gap-1.5">
                <WarningCircle size={15} weight="fill" />
                Valor informado excede o total. Adicione uma forma em Dinheiro para gerar troco.
              </span>
            )}
            {troco > 0 && (
              <span className="font-bold text-[#0284c7] flex items-center gap-1.5">
                <CheckCircle size={15} weight="fill" />
                Troco: R$ {formatMoeda(troco)}
              </span>
            )}
            {faltante === 0 && !excedeSemTroco && troco === 0 && (
              <span className="font-bold text-[#0284c7] flex items-center gap-1.5">
                <CheckCircle size={15} weight="fill" />
                Pagamento confere com o total da venda
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={!fechamentoValido || processando}
            className="h-10 px-5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] disabled:bg-[#d0d5dd] disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer shrink-0"
          >
            {processando ? (
              <ArrowsClockwise size={16} weight="bold" className="animate-spin" />
            ) : (
              <Receipt size={16} weight="bold" />
            )}
            Confirmar e Emitir Nota Fiscal
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Total da venda */}
        <div className="bg-[#101828] rounded-2xl p-4 flex items-center justify-between text-white shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-white/70">Total a Receber</span>
          <span className="text-2xl font-black">R$ {formatMoeda(totalGeral)}</span>
        </div>

        {/* Formas de pagamento */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Formas de Pagamento ({formasPagamento.length})
            </span>
            <button
              type="button"
              onClick={handleAdicionarForma}
              className="h-8 px-3 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f2f4f7] text-[#101828] text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Plus size={13} weight="bold" />
              Adicionar Forma
            </button>
          </div>

          <div className="space-y-2">
            {formasPagamento.map((forma) => {
              const Icone = ICONE_FORMA[forma.metodo] || Money
              const permiteParcelas = forma.metodo === 'credito' || forma.metodo === 'boleto'
              return (
                <div
                  key={forma.id}
                  className="bg-white border border-[#e4e7ec] rounded-2xl p-3 flex flex-wrap items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
                    <Icone size={16} weight="bold" />
                  </div>

                  <div className="min-w-[160px] flex-1">
                    <Select
                      value={FORMAS_PAGAMENTO_OPCOES.find((o) => o.value === forma.metodo)}
                      onChange={(opt) => handleAlterarForma(forma.id, 'metodo', opt.value)}
                      options={FORMAS_PAGAMENTO_OPCOES}
                      styles={customSelectStyles}
                      isSearchable={false}
                    />
                  </div>

                  <div className="w-32">
                    <IMaskInput
                      mask={Number}
                      scale={2}
                      radix=","
                      thousandsSeparator="."
                      padFractionalZeros
                      normalizeZeros
                      value={String(forma.valor ?? 0)}
                      unmask
                      onAccept={(val) => handleAlterarForma(forma.id, 'valor', val === '' ? 0 : Number(val))}
                      placeholder="0,00"
                      className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] text-right"
                    />
                  </div>

                  {permiteParcelas && (
                    <div className="w-36">
                      <Select
                        value={PARCELAS_OPCOES.find((o) => o.value === forma.parcelas) || PARCELAS_OPCOES[0]}
                        onChange={(opt) => handleAlterarForma(forma.id, 'parcelas', opt.value)}
                        options={PARCELAS_OPCOES}
                        styles={customSelectStyles}
                        isSearchable={false}
                      />
                    </div>
                  )}

                  {formasPagamento.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoverForma(forma.id)}
                      className="w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Remover forma de pagamento"
                    >
                      <Trash size={15} weight="bold" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-2 text-[11px] font-semibold text-[#667085] flex items-center justify-between px-1">
            <span>Total informado</span>
            <span className="font-bold text-[#101828]">R$ {formatMoeda(somaFormas)}</span>
          </div>
        </div>

        {/* Dados da nota fiscal */}
        <div className="bg-white border border-[#e4e7ec] rounded-2xl p-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <FileText size={15} weight="bold" className="text-[#0284c7]" />
            Emissão de Nota Fiscal
          </span>

          <div>
            <label className="block text-[11px] font-bold text-[#344054] mb-1">Documento Fiscal</label>
            <Select
              value={tipoNota}
              onChange={setTipoNota}
              options={TIPO_NOTA_OPCOES}
              styles={customSelectStyles}
              isSearchable={false}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#344054] mb-1 flex items-center gap-1.5">
              <User size={13} weight="bold" className="text-[#667085]" />
              CPF ou CNPJ na Nota {cliente ? '' : '(opcional para NFC-e sem identificação)'}
            </label>
            <IMaskInput
              mask={[
                { mask: '000.000.000-00' },
                { mask: '00.000.000/0000-00' },
              ]}
              value={documentoNota}
              onAccept={(val) => setDocumentoNota(val)}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
            />
          </div>

          {resumoFormaPagamento && (
            <div className="text-[11px] text-[#667085] pt-1 border-t border-[#f2f4f7]">
              Condição registrada na venda: <span className="font-bold text-[#101828]">{resumoFormaPagamento}</span>
            </div>
          )}
        </div>
      </div>
    </ModalRedimensionavel>
  )
}
