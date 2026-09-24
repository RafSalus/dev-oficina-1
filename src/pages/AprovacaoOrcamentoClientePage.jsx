import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAprovacaoOrcamento } from '../hooks/useAprovacaoOrcamento'
import {
  AprovacaoHeader,
  AprovacaoTabsNav,
  AprovacaoOrcamentoTab,
  AprovacaoLaudoTab,
  AprovacaoFotosTab,
  AprovacaoFooter,
  AprovacaoModalConfirmacao,
  AprovacaoModalImpressao,
  AprovacaoFotoZoomModal,
} from '../components/aprovacao'

/**
 * Página pública de aprovação de orçamento pelo cliente (/aprovacao/:id).
 * Decomposta de monólito de 1.123L para container enxuto de responsabilidade única (NFR17 / ADR-003).
 */
export function AprovacaoOrcamentoClientePage() {
  const { id } = useParams()
  const {
    temOS,
    dadosOS,
    estaAprovado,
    dataHoraAprovacao,
    nomeResponsavelAprovacao,
    formaPagamentoEscolhida,
    itensAprovaveis,
    respostasLocais,
    totais,
    fotosDasPecas,
    handleToggleItem,
    confirmarAprovacao,
    responderItemAdicionalOS,
    enviarConfirmacaoWhatsApp,
    tirarDuvidasWhatsApp,
  } = useAprovacaoOrcamento(id, { origem: 'publica' })

  const [activeTab, setActiveTab] = useState('orcamento')
  const [modalAprovacaoAberto, setModalAprovacaoAberto] = useState(false)
  const [modalFolhaImpressaoAberta, setModalFolhaImpressaoAberta] = useState(false)
  const [fotoZoomUrl, setFotoZoomUrl] = useState(null)
  const [nomeResponsavel, setNomeResponsavel] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('pix')

  const handleSubmeterAprovacao = (e) => {
    e.preventDefault()
    confirmarAprovacao({
      nomeResponsavel: nomeResponsavel || dadosOS.cliente,
      formaPagamento,
    })
    setModalAprovacaoAberto(false)
  }

  if (!temOS) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-[#d0d5dd] shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#101828]">Orçamento não localizado</h2>
          <p className="text-xs text-[#667085] leading-relaxed">
            Não encontramos um orçamento válido com o identificador #{id || 'N/D'}.
            Verifique o link recebido ou entre em contato com nossa equipe.
          </p>
          <button
            type="button"
            onClick={tirarDuvidasWhatsApp}
            className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#1eb956] transition-all cursor-pointer shadow-xs"
          >
            Falar no WhatsApp da Oficina
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#101828] flex flex-col pb-24 select-none">
      <AprovacaoHeader
        dadosOS={dadosOS}
        estaAprovado={estaAprovado}
        dataHoraAprovacao={dataHoraAprovacao}
        onAbrirFolhaImpressao={() => setModalFolhaImpressaoAberta(true)}
        onTirarDuvidasWhatsApp={tirarDuvidasWhatsApp}
      />

      <AprovacaoTabsNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fotosCount={fotosDasPecas.length}
      />

      <main className="max-w-4xl mx-auto w-full p-4 space-y-4 flex-1">
        {activeTab === 'orcamento' && (
          <AprovacaoOrcamentoTab
            totais={totais}
            itensAprovaveis={itensAprovaveis}
            itensAdicionaisOS={dadosOS.itensAdicionaisOS}
            respostasLocais={respostasLocais}
            estaAprovado={estaAprovado}
            onToggleItem={handleToggleItem}
            onVerFoto={setFotoZoomUrl}
            onResponderItemAdicional={responderItemAdicionalOS}
          />
        )}

        {activeTab === 'laudo' && <AprovacaoLaudoTab dadosOS={dadosOS} />}

        {activeTab === 'fotos' && (
          <AprovacaoFotosTab fotosDasPecas={fotosDasPecas} onVerFoto={setFotoZoomUrl} />
        )}
      </main>

      <AprovacaoFooter
        totais={totais}
        estaAprovado={estaAprovado}
        onAbrirModalAprovacao={() => {
          // Página pública: o nome só vem preenchido se já houver aprovação registrada
          setNomeResponsavel(nomeResponsavelAprovacao || '')
          setFormaPagamento(formaPagamentoEscolhida || 'pix')
          setModalAprovacaoAberto(true)
        }}
        onEnviarWhatsApp={enviarConfirmacaoWhatsApp}
      />

      <AprovacaoModalConfirmacao
        isOpen={modalAprovacaoAberto}
        onClose={() => setModalAprovacaoAberto(false)}
        onConfirm={handleSubmeterAprovacao}
        dadosOS={dadosOS}
        totalGeral={totais.totalGeral}
        nomeResponsavel={nomeResponsavel}
        setNomeResponsavel={setNomeResponsavel}
        formaPagamento={formaPagamento}
        setFormaPagamento={setFormaPagamento}
      />

      <AprovacaoModalImpressao
        isOpen={modalFolhaImpressaoAberta}
        onClose={() => setModalFolhaImpressaoAberta(false)}
        dadosOS={dadosOS}
      />

      <AprovacaoFotoZoomModal
        fotoUrl={fotoZoomUrl}
        onClose={() => setFotoZoomUrl(null)}
      />
    </div>
  )
}
