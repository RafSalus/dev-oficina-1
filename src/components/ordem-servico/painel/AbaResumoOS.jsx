import React from 'react'
import { Printer, WhatsappLogo, Copy, Check, ShieldCheck, Clock, CreditCard } from '@phosphor-icons/react'
import { STATUS_PERMITE_FATURAMENTO } from '../../../pages/dashboard/orcamento/mockOrdensAbertas'
import { formatMoeda } from '../../../utils/ordemServico/osMensagens'

const BOTAO_PRIMARIO_ESCURO =
  'flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#101828] hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer'
const BOTAO_SECUNDARIO =
  'flex items-center justify-center gap-1.5 py-2 px-2 bg-white hover:bg-[#f2f4f7] text-[#101828] border border-[#d0d5dd] text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer'

function LinhaValor({ rotulo, valor }) {
  return (
    <div className="flex justify-between items-center text-[#475467] py-0.5">
      <span>{rotulo}</span>
      <span className="font-semibold text-[#101828]">R$ {formatMoeda(valor)}</span>
    </div>
  )
}

function Campo({ rotulo, children, destaque }) {
  return (
    <div>
      <span className="text-[#667085] font-bold block text-[10px] uppercase tracking-wider">{rotulo}</span>
      <span className={`font-bold text-xs ${destaque ? 'text-[#0284c7]' : 'text-[#101828]'} block mt-0.5`}>{children}</span>
    </div>
  )
}

function AcaoDaEtapa({ os, statusAtual, isArquivada, onAprovarRapido, onFaturarNoPDV }) {
  if (isArquivada) {
    return (
      <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-3 space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-[#0284c7] font-bold">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} weight="fill" />
            <span>Conclusão e Garantia</span>
          </div>
          <span className="text-[11px] font-bold text-[#475467]">{os.garantiaAte || 'Garantia: 90 dias'}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[#475467] text-[11px]">
          <div>
            <span className="text-[#667085] block text-[10px] uppercase font-bold">FINALIZADA EM</span>
            <span className="font-bold text-[#101828] text-xs">
              {os.dataFinalizacao || os.dataEntrada} às {os.horaFinalizacao || os.horaEntrada}
            </span>
          </div>
          <div>
            <span className="text-[#667085] block text-[10px] uppercase font-bold">DOCUMENTO / PGTO</span>
            <span className="font-bold text-[#101828] text-xs">{os.formaPagamento || 'PIX'} • {os.notaFiscal || 'NFS-e'}</span>
          </div>
        </div>
      </div>
    )
  }

  let acao
  if (os.status === 'aguardando_aprovacao') {
    acao = (
      <button
        type="button"
        onClick={onAprovarRapido}
        className={BOTAO_PRIMARIO_ESCURO}
        title="Aprovar orçamento e iniciar execução na oficina"
      >
        <ShieldCheck size={16} weight="bold" className="text-[#0284c7]" />
        <span className="truncate">Aprovar OS</span>
      </button>
    )
  } else if (STATUS_PERMITE_FATURAMENTO.includes(os.status)) {
    acao = (
      <button
        type="button"
        onClick={() => onFaturarNoPDV?.(os)}
        className={BOTAO_PRIMARIO_ESCURO}
        title="Concluir o checklist de saída, ir ao PDV, cobrar e emitir nota fiscal — a OS só é arquivada depois do pagamento confirmado"
      >
        <CreditCard size={16} weight="bold" className="text-[#38bdf8]" />
        <span className="truncate">Faturar e Finalizar no PDV</span>
      </button>
    )
  } else {
    acao = (
      <div className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#f8fafc] border border-[#e4e7ec] text-[#667085] text-xs font-bold rounded-xl">
        <Clock size={16} weight="bold" />
        <span className="truncate">Etapa Atual: {statusAtual.label}</span>
      </div>
    )
  }
  return <div className="grid grid-cols-1 gap-2">{acao}</div>
}

/**
 * Aba "Resumo e Valores": veículo e cliente, composição do orçamento, prazos,
 * compartilhamento e a ação da etapa atual (aprovar, faturar ou garantia).
 * @param {{
 *   os: object, statusAtual: object, isArquivada: boolean, copiado: boolean,
 *   onEnviarWhatsapp: Function, onAbrirImpressao: Function, onCopiarLink: Function,
 *   onAprovarRapido: Function, onFaturarNoPDV: Function
 * }} props
 */
export function AbaResumoOS({ os, statusAtual, isArquivada, copiado, onEnviarWhatsapp, onAbrirImpressao, onCopiarLink, onAprovarRapido, onFaturarNoPDV }) {
  return (
    <>
      <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-[#101828] text-white tracking-wider shadow-2xs">
              {os.placa || 'PLACA'}
            </span>
            <span className="font-bold text-sm text-[#101828] truncate">{os.marcaModelo}</span>
          </div>
          <span className="text-xs text-[#667085] font-medium">{os.ano} • {os.cor}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs pt-2.5 border-t border-[#e4e7ec]">
          <div>
            <span className="text-[#667085] block text-[10px] font-bold uppercase tracking-wider">CLIENTE</span>
            <span className="font-bold text-xs text-[#101828] truncate block mt-0.5">{os.cliente}</span>
            <span className="text-xs text-[#475467] block mt-0.5">{os.telefone || 'Sem telefone cadastrado'}</span>
          </div>
          <div>
            <span className="text-[#667085] block text-[10px] font-bold uppercase tracking-wider">KM DE ENTRADA</span>
            <span className="font-bold text-xs text-[#101828] block mt-0.5">{os.km || '—'} KM</span>
            <span className="text-xs text-[#475467] block mt-0.5">Mecânico: {os.mecanicoNome || 'Não definido'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#d0d5dd] rounded-2xl p-4 shadow-2xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085]">Composição do Orçamento</h4>

        <div className="space-y-2 text-xs">
          <LinhaValor rotulo={`Peças e Insumos (${os.pecasOS?.length || 0} itens)`} valor={os.totalPecas} />
          <LinhaValor rotulo={`Mão de Obra Oficina (${os.servicosOS?.length || 0} itens)`} valor={os.totalServicos} />
          <LinhaValor rotulo={`Serviços de Terceiros (${os.terceirosOS?.length || 0} itens)`} valor={os.totalTerceiros || 0} />
          {os.descontoTotal > 0 && (
            <div className="flex justify-between items-center text-rose-600 py-0.5">
              <span>Desconto Concedido</span>
              <span className="font-bold">- R$ {formatMoeda(os.descontoTotal)}</span>
            </div>
          )}

          <div className="pt-3 border-t border-[#e4e7ec] flex justify-between items-center">
            <span className="font-extrabold text-[#101828] text-sm">TOTAL DO ORÇAMENTO</span>
            <span className="text-lg font-black text-[#0284c7]">R$ {formatMoeda(os.valorTotal)}</span>
          </div>
        </div>

        {os.condicaoPagamentoOS && (
          <div className="pt-2.5 border-t border-[#e4e7ec]/70 text-xs text-[#667085] flex items-center justify-between bg-[#f8fafc] -mx-4 -mb-4 px-4 py-2.5 rounded-b-2xl">
            <span className="font-semibold text-[#344054]">Condição de Pagamento:</span>
            <span className="font-bold text-[#101828]">{os.condicaoPagamentoOS}</span>
          </div>
        )}
      </div>

      <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-4 grid grid-cols-2 gap-4 text-xs">
        <Campo rotulo="ENTRADA NA OFICINA">
          {os.dataEntrada} às {os.horaEntrada}
        </Campo>
        <Campo rotulo="PREVISÃO DE ENTREGA" destaque>
          {os.previsaoEntregaData || 'A definir'} {os.previsaoEntregaHora ? `às ${os.previsaoEntregaHora}` : ''}
        </Campo>
      </div>

      <div className="space-y-2 pt-1">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onEnviarWhatsapp}
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#25d366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Enviar Orçamento via WhatsApp"
          >
            <WhatsappLogo size={15} weight="fill" />
            <span className="truncate">WhatsApp</span>
          </button>

          <button type="button" onClick={onAbrirImpressao} className={BOTAO_SECUNDARIO} title="Imprimir Folha de Orçamento">
            <Printer size={15} weight="bold" />
            <span className="truncate">Imprimir</span>
          </button>

          <button type="button" onClick={onCopiarLink} className={BOTAO_SECUNDARIO} title="Copiar Link de Aprovação do Cliente">
            {copiado ? <Check size={15} weight="bold" className="text-[#0284c7]" /> : <Copy size={15} weight="bold" />}
            <span className="truncate">{copiado ? 'Copiado!' : 'Copiar Link'}</span>
          </button>
        </div>

        <AcaoDaEtapa
          os={os}
          statusAtual={statusAtual}
          isArquivada={isArquivada}
          onAprovarRapido={onAprovarRapido}
          onFaturarNoPDV={onFaturarNoPDV}
        />
      </div>
    </>
  )
}
