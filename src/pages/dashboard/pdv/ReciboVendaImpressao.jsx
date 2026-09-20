import React from 'react'
import { Printer, Receipt, WarningCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from '../../../components/suprimentos/ModalRedimensionavel'
import { COMPANY } from '../../../constants/company'
import { FORMAS_PAGAMENTO_OPCOES, formatMoeda } from './pdvData'

export function ReciboVendaImpressao({ isOpen, onClose, venda }) {
  const handleImprimir = () => {
    toast.info('Abrindo diálogo oficial de impressão do sistema...')
    window.print()
  }

  if (!isOpen || !venda) return null

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      chaveStorage="dev_oficina_pdv_modal_recibo"
      larguraPadrao={520}
      alturaPadrao={720}
      larguraMinima={420}
      alturaMinima={520}
      titulo={`Venda #${venda.numeroVenda} Concluída`}
      subtitulo={venda.numeroOSVinculada ? `Faturada a partir da OS #${venda.numeroOSVinculada}` : 'Venda avulsa de balcão'}
      badge={venda.tipoNota === 'nfe' ? 'NF-e Emitida' : 'NFC-e Emitida'}
      icone={Receipt}
      rodape={
        <div className="flex items-center justify-between w-full gap-3">
          <span className="text-[11px] font-semibold text-[#667085]">
            Total: <span className="text-[#101828] font-bold">R$ {formatMoeda(venda.totalGeral)}</span>
          </span>
          <button
            type="button"
            onClick={handleImprimir}
            className="h-10 px-5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <Printer size={16} weight="bold" />
            Imprimir Cupom
          </button>
        </div>
      }
    >
      <div className="bg-white border border-[#e4e7ec] rounded-sm p-5 font-mono text-[11px] text-black leading-relaxed folha-pagina-a4">
        {/* Cabecalho da oficina */}
        <div className="text-center border-b border-dashed border-black pb-3 mb-3">
          <p className="font-bold text-sm uppercase">{COMPANY.legalName}</p>
          <p>{COMPANY.cnpj}</p>
          <p className="uppercase">{COMPANY.city} - PR</p>
        </div>

        {/* Identificacao do documento */}
        <div className="border-b border-dashed border-black pb-3 mb-3 space-y-0.5">
          <p className="font-bold text-center uppercase">
            {venda.tipoNota === 'nfe' ? 'Nota Fiscal Eletronica - NF-e' : 'Cupom Fiscal Eletronico - NFC-e'}
          </p>
          <div className="flex justify-between">
            <span>Numero: {venda.numeroNota}</span>
            <span>Serie: {venda.serie}</span>
          </div>
          <div className="flex justify-between">
            <span>Venda: #{venda.numeroVenda}</span>
            <span>{venda.dataHora}</span>
          </div>
          {venda.numeroOSVinculada && <p>OS Vinculada: #{venda.numeroOSVinculada}</p>}
        </div>

        {/* Cliente */}
        <div className="border-b border-dashed border-black pb-3 mb-3">
          <p className="font-bold uppercase">Consumidor</p>
          <p>{venda.cliente?.nome || 'Consumidor Final / Nao Identificado'}</p>
          {venda.documentoNota && <p>CPF/CNPJ: {venda.documentoNota}</p>}
          {venda.veiculo?.placa && <p>Veiculo: {venda.veiculo.marcaModelo} - Placa {venda.veiculo.placa}</p>}
        </div>

        {/* Itens */}
        <div className="border-b border-dashed border-black pb-3 mb-3">
          <p className="font-bold uppercase mb-1">Itens</p>
          {venda.itens.map((item, idx) => (
            <div key={`${item.uid}-${idx}`} className="mb-1.5">
              <p className="truncate">{item.nome}</p>
              <div className="flex justify-between text-[10.5px]">
                <span>
                  {item.quantidade} {item.unidade || 'UN'} x R$ {formatMoeda(item.precoUnitario)}
                  {item.desconto > 0 ? ` (- R$ ${formatMoeda(item.desconto)})` : ''}
                </span>
                <span className="font-bold">
                  R$ {formatMoeda(Math.max(0, item.quantidade * item.precoUnitario - (item.desconto || 0)))}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Totais */}
        <div className="border-b border-dashed border-black pb-3 mb-3 space-y-0.5">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>R$ {formatMoeda(venda.subtotal)}</span>
          </div>
          {venda.descontoGeralValor > 0 && (
            <div className="flex justify-between">
              <span>Desconto</span>
              <span>- R$ {formatMoeda(venda.descontoGeralValor)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm pt-1">
            <span>TOTAL</span>
            <span>R$ {formatMoeda(venda.totalGeral)}</span>
          </div>
        </div>

        {/* Formas de pagamento */}
        <div className="border-b border-dashed border-black pb-3 mb-3 space-y-0.5">
          <p className="font-bold uppercase mb-1">Pagamento</p>
          {venda.formasPagamento.map((forma) => {
            const opcao = FORMAS_PAGAMENTO_OPCOES.find((o) => o.value === forma.metodo)
            const parcela = (forma.metodo === 'credito' || forma.metodo === 'boleto') && forma.parcelas > 1 ? ` em ${forma.parcelas}x` : ''
            return (
              <div key={forma.id} className="flex justify-between">
                <span>{opcao?.label || forma.metodo}{parcela}</span>
                <span>R$ {formatMoeda(forma.valor)}</span>
              </div>
            )
          })}
          {venda.troco > 0 && (
            <div className="flex justify-between font-bold">
              <span>Troco</span>
              <span>R$ {formatMoeda(venda.troco)}</span>
            </div>
          )}
        </div>

        {/* Chave de acesso simulada */}
        <div className="text-center space-y-1">
          <p className="break-all text-[10px] tracking-wide">{venda.chaveAcesso}</p>
          <p className="text-[10px]">Protocolo de Autorizacao: {venda.protocolo}</p>
          <div className="mx-auto w-20 h-20 border border-black flex items-center justify-center text-[9px] text-center my-2">
            QR Code (simulado)
          </div>
        </div>

        <div className="flex items-start gap-1.5 border border-black rounded-none p-2 mt-3 text-[10px]">
          <WarningCircle size={14} weight="bold" className="shrink-0 mt-0.5" />
          <span>Documento emitido em ambiente de demonstracao do sistema, sem integracao real com a SEFAZ e sem validade fiscal.</span>
        </div>
      </div>
    </ModalRedimensionavel>
  )
}
