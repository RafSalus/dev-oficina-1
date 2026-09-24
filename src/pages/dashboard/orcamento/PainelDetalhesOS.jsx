import React, { useState } from 'react'
import { X, PencilSimple, Trash, Receipt, Archive, ArrowUUpLeft } from '@phosphor-icons/react'
import Select from 'react-select'
import { podeTransicionarPara } from './statusTransicao'
import { ModalConfirmacao } from '../../../components/ModalConfirmacao'
import { ModalRedimensionavel } from '../../../components/suprimentos/ModalRedimensionavel'
import { usePainelDetalhesOS } from '../../../hooks/usePainelDetalhesOS'
import { useLancamentosRapidosOS } from '../../../hooks/useLancamentosRapidosOS'
import { formatMoeda } from '../../../utils/ordemServico/osMensagens'
import {
  OPCOES_STATUS_ORDENADAS,
  selectStatusStyles,
  montarAbasPainel,
} from '../../../components/ordem-servico/painel/painelOSConfig'
import { AbaResumoOS } from '../../../components/ordem-servico/painel/AbaResumoOS'
import { AbaItensOS } from '../../../components/ordem-servico/painel/AbaItensOS'
import { AbaVistoriaOS } from '../../../components/ordem-servico/painel/AbaVistoriaOS'
import { AbaCotacaoOS, AbaTerceirizadoOS, AbaAprovacaoOS } from '../../../components/ordem-servico/painel/AbasEstagioOS'
import { AbaExecucaoOS } from '../../../components/ordem-servico/painel/AbaExecucaoOS'

const BOTAO_RODAPE =
  'inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#f2f4f7] text-[#101828] border border-[#d0d5dd] rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-2xs'

function Rodape({ os, isArquivada, onReabrir, onEditarOS, onPedirExclusao }) {
  let acaoPrincipal
  if (!isArquivada) {
    acaoPrincipal = (
      <button type="button" onClick={() => onEditarOS?.(os)} className={BOTAO_RODAPE}>
        <PencilSimple size={15} weight="bold" />
        <span>Editar OS</span>
      </button>
    )
  } else if (onReabrir) {
    acaoPrincipal = (
      <button type="button" onClick={() => onReabrir(os.numeroOS)} className={BOTAO_RODAPE}>
        <ArrowUUpLeft size={15} weight="bold" />
        <span>Reabrir OS</span>
      </button>
    )
  } else {
    acaoPrincipal = <span className="text-xs font-bold text-[#667085]">OS no Arquivo</span>
  }

  return (
    <div className="w-full flex items-center justify-between">
      {acaoPrincipal}
      {!isArquivada && (
        <button
          type="button"
          onClick={onPedirExclusao}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-medium cursor-pointer transition-colors"
          title="Excluir ou Cancelar Ordem de Serviço"
        >
          <Trash size={15} weight="bold" />
          <span>Excluir</span>
        </button>
      )}
    </div>
  )
}

/**
 * Painel (modal redimensionável) de detalhes da OS: seletor de status, abas fixas
 * (Resumo, Itens, Vistoria) e a aba da etapa atual (Cotação, Terceirizado, Aprovação
 * ou Execução). Estado e regras vivem em `usePainelDetalhesOS` e `useLancamentosRapidosOS`.
 */
export function PainelDetalhesOS({
  os,
  onClose,
  onAbrirImpressao,
  onAtualizarStatus,
  onExcluir,
  isArquivada = false,
  onFaturarNoPDV,
  onAdicionarItem,
  onAtualizarFotoPeca,
  onReabrir,
  onEditarOS,
  onAbrirCotacao,
  onReportarItemAdicional,
  initialSubTab = null,
}) {
  const painel = usePainelDetalhesOS({ os, initialSubTab, onClose, onAtualizarStatus, onExcluir })
  const lancamentos = useLancamentosRapidosOS({
    os,
    linkCliente: painel.linkCliente,
    onAdicionarItem,
    onAtualizarFotoPeca,
    onReportarItemAdicional,
  })
  const [fotoZoomUrl, setFotoZoomUrl] = useState(null)

  if (!os) return null

  const { statusAtual, activeSubTab, confirmacoes } = painel
  const abas = montarAbasPainel(os)
  const podeLancarItens = !isArquivada && (os.status === 'fila' || os.status === 'em_diagnostico')
  const compartilhamento = {
    copiado: painel.copiado,
    onEnviarWhatsapp: painel.enviarWhatsapp,
    onCopiarLink: painel.copiarLink,
    onAprovarRapido: confirmacoes.pedirAprovacaoRapida,
  }

  return (
    <>
      <ModalRedimensionavel
        isOpen={true}
        onClose={onClose}
        titulo={`OS #${os.numeroOS}`}
        subtitulo={`${os.cliente || 'Cliente'} • ${os.placa ? os.placa.toUpperCase() : 'Sem placa'}`}
        badge={statusAtual.label}
        icone={Receipt}
        larguraPadrao={900}
        alturaPadrao={760}
        larguraMinima={700}
        alturaMinima={520}
        storageKey="modal_detalhes_os"
        rodape={
          <Rodape
            os={os}
            isArquivada={isArquivada}
            onReabrir={onReabrir}
            onEditarOS={onEditarOS}
            onPedirExclusao={confirmacoes.pedirExclusao}
          />
        }
      >
        <div className="h-full flex flex-col max-w-4xl mx-auto w-full text-xs text-[#344054]">
          {isArquivada ? (
            <div className="shrink-0 mb-3 p-2.5 rounded-2xl bg-[#f0f9ff] border border-[#bae6fd] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0284c7] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Archive size={18} weight="bold" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#101828] block">Ordem Finalizada e Arquivada</span>
                  <span className="text-[11px] text-[#475467]">Entregue em {os.dataFinalizacao || os.dataEntrada}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="shrink-0 mb-3 flex items-center gap-3">
              <span className="text-xs font-bold text-[#475467] shrink-0">Alterar Status:</span>
              <div className="flex-1">
                <Select
                  styles={selectStatusStyles}
                  value={statusAtual}
                  onChange={painel.alterarStatus}
                  options={OPCOES_STATUS_ORDENADAS}
                  isOptionDisabled={(opt) => !podeTransicionarPara(os.status, opt.value)}
                  isSearchable={false}
                />
              </div>
            </div>
          )}

          <div className="shrink-0 mb-3 flex items-center gap-1.5 p-1 bg-[#f2f4f7] rounded-2xl border border-[#e4e7ec] overflow-x-auto no-scrollbar">
            {abas.map((aba) => (
              <button
                key={aba.id}
                type="button"
                onClick={() => painel.setActiveSubTab(aba.id)}
                className={`shrink-0 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeSubTab === aba.id
                    ? 'bg-[#101828] text-white shadow-2xs'
                    : 'text-[#475467] hover:bg-white hover:text-[#101828]'
                }`}
              >
                {aba.label}
              </button>
            ))}
          </div>

          {/* key reinicia a rolagem ao trocar de aba */}
          <div key={activeSubTab} className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-4 pb-1">
            {activeSubTab === 'resumo' && (
              <AbaResumoOS
                os={os}
                statusAtual={statusAtual}
                isArquivada={isArquivada}
                onAbrirImpressao={onAbrirImpressao}
                onFaturarNoPDV={onFaturarNoPDV}
                {...compartilhamento}
              />
            )}
            {activeSubTab === 'itens' && <AbaItensOS os={os} onVerFoto={setFotoZoomUrl} />}
            {activeSubTab === 'vistoria' && (
              <AbaVistoriaOS
                os={os}
                assinaturaVistoria={painel.assinaturaVistoria}
                podeLancarItens={podeLancarItens}
                lancamentos={lancamentos}
              />
            )}
            {activeSubTab === 'cotacao' && <AbaCotacaoOS os={os} onAbrirCotacao={onAbrirCotacao} />}
            {activeSubTab === 'terceirizado' && (
              <AbaTerceirizadoOS os={os} terceiro={lancamentos.terceiro} opcoesParceiros={lancamentos.opcoes.parceiros} />
            )}
            {activeSubTab === 'aprovacao' && <AbaAprovacaoOS {...compartilhamento} />}
            {activeSubTab === 'execucao' && <AbaExecucaoOS os={os} itemAdicional={lancamentos.itemAdicional} />}
          </div>
        </div>
      </ModalRedimensionavel>

      {fotoZoomUrl && (
        <div
          className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setFotoZoomUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={fotoZoomUrl} alt="Foto da peça ampliada" className="max-h-[80vh] w-auto object-contain" />
            <button
              type="button"
              onClick={() => setFotoZoomUrl(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      <ModalConfirmacao
        isOpen={confirmacoes.confirmandoAprovarRapido}
        onClose={confirmacoes.cancelarAprovacaoRapida}
        onConfirm={confirmacoes.confirmarAprovacaoRapida}
        titulo="Aprovar orçamento e iniciar execução?"
        descricao="Use esta opção quando o cliente já autorizou os serviços e peças por telefone, WhatsApp ou presencialmente."
        itemDestaque={`OS #${os.numeroOS} • ${os.cliente || 'Cliente'} • Total: R$ ${formatMoeda(os.valorTotal || 0)}`}
        textoConfirmar="Sim, Aprovar Agora"
        textoCancelar="Cancelar"
        variante="primario"
      />

      <ModalConfirmacao
        isOpen={confirmacoes.confirmandoExclusaoOS}
        onClose={confirmacoes.cancelarExclusao}
        onConfirm={confirmacoes.confirmarExclusaoOS}
        titulo="Cancelar e excluir esta OS?"
        descricao="Esta ação remove a ordem de serviço permanentemente do sistema e não pode ser desfeita."
        itemDestaque={`OS #${os.numeroOS} • ${os.cliente || 'Cliente'} (${os.placa || 'Sem placa'})`}
        textoConfirmar="Sim, Excluir Definitivamente"
        textoCancelar="Cancelar"
        variante="perigo"
      />
    </>
  )
}
