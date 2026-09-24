import React from 'react'
import { Printer, WhatsappLogo, Copy, CalendarCheck, CreditCard, ArrowUUpLeft } from '@phosphor-icons/react'
import { STATUS_ORCAMENTO, STATUS_PERMITE_FATURAMENTO } from '../../../pages/dashboard/orcamento/mockOrdensAbertas'
import { formatMoeda } from '../../../utils/ordemServico/osMensagens'

const BOTAO_ACAO = 'w-6 h-6 flex items-center justify-center rounded-md cursor-pointer transition-all hover:bg-white'

function LinhaBase({ selecionada, onClick, children }) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 grid grid-cols-12 gap-3 items-center text-xs transition-colors cursor-pointer border-l-3 ${
        selecionada ? 'bg-[#f0f9ff] border-l-[#0284c7]' : 'hover:bg-[#f8fafc] border-l-transparent'
      }`}
    >
      {children}
    </div>
  )
}

function ColunaVeiculo({ os, detalhe }) {
  return (
    <div className="col-span-2 min-w-0 pr-2">
      <div className="flex items-center gap-1.5">
        <span className="font-mono font-black text-[10px] px-1.5 py-0.5 rounded bg-[#101828] text-white tracking-wider shrink-0">
          {os.placa || 'PLACA'}
        </span>
        <span className="font-semibold text-[#101828] truncate text-xs">{os.marcaModelo}</span>
      </div>
      <span className="text-[10px] text-[#667085] block truncate mt-0.5">{detalhe}</span>
    </div>
  )
}

function PilulaAcoes({ children }) {
  return (
    <div className="col-span-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
      <div className="inline-flex items-center bg-[#f2f4f7] p-0.5 rounded-lg border border-[#e4e7ec] shadow-2xs">{children}</div>
    </div>
  )
}

/**
 * Linha de uma OS aberta: prioridade, entrada, cliente, veículo, mecânico/queixa, status,
 * valor e ações rápidas (imprimir, link, WhatsApp e faturar).
 * @param {{os: object, selecionada: boolean, onSelecionar: Function, acoes: object}} props
 */
export function OSLinhaAberta({ os, selecionada, onSelecionar, acoes }) {
  const statusInfo = STATUS_ORCAMENTO.find((s) => s.value === os.status) || STATUS_ORCAMENTO[1]

  return (
    <LinhaBase selecionada={selecionada} onClick={() => onSelecionar(os)}>
      <div className="col-span-1 min-w-0">
        <span className="font-mono font-black text-xs text-[#101828] block whitespace-nowrap">#{os.numeroOS}</span>
        {os.prioridade === 'urgente' && (
          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Urgente
          </span>
        )}
        {os.prioridade === 'retorno' && (
          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            Retorno
          </span>
        )}
      </div>

      <div className="col-span-1 text-[11px] text-[#667085] leading-tight">
        <span className="font-semibold text-[#344054] block">{os.dataEntrada}</span>
        <span className="text-[10px]">{os.horaEntrada}</span>
      </div>

      <div className="col-span-3 min-w-0 pr-2">
        <span className="font-bold text-[#101828] truncate block text-xs">{os.cliente}</span>
        <div className="flex items-center gap-1.5 text-[11px] text-[#667085] mt-0.5">
          <span>{os.telefone || 'Sem telefone'}</span>
          {os.telefone && (
            <button
              type="button"
              onClick={(e) => acoes.dispararWhatsApp(os, e)}
              className="text-[#25d366] hover:text-[#1ebd59] p-0.5 rounded cursor-pointer"
              title="Disparar no WhatsApp"
            >
              <WhatsappLogo size={14} weight="fill" />
            </button>
          )}
        </div>
      </div>

      <ColunaVeiculo os={os} detalhe={`${os.ano} • ${os.km ? `${os.km} km` : 'KM não informado'}`} />

      <div className="col-span-2 min-w-0 pr-2">
        <span className="font-semibold text-[#344054] text-[11px] block truncate">
          Téc: {os.mecanicoNome || 'Não atribuído'}
        </span>
        <p className="text-[10px] text-[#667085] truncate mt-0.5 italic" title={os.relatoCliente}>
          "{os.relatoCliente || 'Sem queixa detalhada'}"
        </p>
      </div>

      <div className="col-span-1 min-w-0">
        <span
          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border truncate max-w-full ${statusInfo.badgeBg} ${statusInfo.badgeText} ${statusInfo.border}`}
          title={statusInfo.label}
        >
          {statusInfo.label}
        </span>
      </div>

      <div className="col-span-1 text-right">
        <span className="font-black text-[#101828] text-xs block">R$ {formatMoeda(os.valorTotal)}</span>
        <span className="text-[9px] text-[#667085]">
          {os.pecasOS?.length || 0} pç • {os.servicosOS?.length || 0} srv
        </span>
      </div>

      <PilulaAcoes>
        <button
          type="button"
          onClick={() => acoes.abrirImpressao(os)}
          className={`${BOTAO_ACAO} text-[#475467] hover:text-[#101828]`}
          title="Imprimir Folha Oficial"
        >
          <Printer size={13} weight="bold" />
        </button>
        <button
          type="button"
          onClick={(e) => acoes.copiarLink(os, e)}
          className={`${BOTAO_ACAO} text-[#475467] hover:text-[#0284c7]`}
          title="Copiar Link do Cliente"
        >
          <Copy size={13} weight="bold" />
        </button>
        <button
          type="button"
          onClick={(e) => acoes.dispararWhatsApp(os, e)}
          className={`${BOTAO_ACAO} text-[#25d366] hover:text-[#20bd5a]`}
          title="Enviar via WhatsApp"
        >
          <WhatsappLogo size={14} weight="fill" />
        </button>
        {STATUS_PERMITE_FATURAMENTO.includes(os.status) && (
          <button
            type="button"
            onClick={() => acoes.faturarNoPDV(os)}
            className={`${BOTAO_ACAO} text-[#475467] hover:text-[#0284c7]`}
            title="Faturar e Finalizar no PDV"
          >
            <CreditCard size={13} weight="bold" />
          </button>
        )}
      </PilulaAcoes>
    </LinhaBase>
  )
}

/**
 * Linha de uma OS arquivada: conclusão, cliente, veículo, garantia/NF, valor pago,
 * reimpressão e reabertura.
 * @param {{os: object, selecionada: boolean, onSelecionar: Function, acoes: object}} props
 */
export function OSLinhaArquivada({ os, selecionada, onSelecionar, acoes }) {
  return (
    <LinhaBase selecionada={selecionada} onClick={() => onSelecionar(os)}>
      <div className="col-span-1 min-w-0">
        <span className="font-mono font-black text-xs text-[#101828] block whitespace-nowrap">#{os.numeroOS}</span>
        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#101828] text-white">
          Concluída
        </span>
      </div>

      <div className="col-span-2 text-[11px] text-[#475467] leading-tight">
        <div className="flex items-center gap-1.5 font-bold text-[#101828]">
          <CalendarCheck size={13} weight="fill" className="text-[#0284c7]" />
          <span>{os.dataFinalizacao || os.dataEntrada}</span>
        </div>
        <span className="text-[10px] text-[#667085] block mt-0.5">Entrada: {os.dataEntrada}</span>
      </div>

      <div className="col-span-3 min-w-0 pr-2">
        <span className="font-bold text-[#101828] truncate block text-xs">{os.cliente}</span>
        <span className="text-[11px] text-[#667085] mt-0.5 block">
          {os.telefone || 'Sem telefone'} • {os.documento || ''}
        </span>
      </div>

      <ColunaVeiculo os={os} detalhe={`${os.ano} • KM: ${os.km || '—'}`} />

      <div className="col-span-1 min-w-0">
        <span className="font-semibold text-[#344054] text-xs block truncate">{os.mecanicoNome || '—'}</span>
        <span className="text-[10px] text-[#667085]">Mecânica</span>
      </div>

      <div className="col-span-1 min-w-0">
        <span className="text-[10px] font-bold text-[#0284c7] block truncate">Até {os.garantiaAte || '90 dias'}</span>
        <span className="text-[10px] text-[#667085] block truncate">{os.notaFiscal || 'NFS-e Emitida'}</span>
      </div>

      <div className="col-span-1 text-right">
        <span className="font-black text-[#101828] text-xs block">R$ {formatMoeda(os.valorTotal)}</span>
        <span className="text-[9px] text-[#667085] block truncate">{os.formaPagamento || 'PIX'}</span>
      </div>

      <PilulaAcoes>
        <button
          type="button"
          onClick={() => acoes.abrirImpressao(os)}
          className={`${BOTAO_ACAO} text-[#475467] hover:text-[#101828]`}
          title="Reimprimir Folha Oficial da OS"
        >
          <Printer size={13} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => acoes.reabrirOrdem(os.numeroOS)}
          className={`${BOTAO_ACAO} text-[#475467] hover:text-[#0284c7]`}
          title="Reabrir esta OS e transferir de volta para as OS Abertas"
        >
          <ArrowUUpLeft size={13} weight="bold" />
        </button>
      </PilulaAcoes>
    </LinhaBase>
  )
}
