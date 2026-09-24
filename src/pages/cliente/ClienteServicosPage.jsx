import React, { useState } from 'react'
import { useAprovacaoOrcamento } from '../../hooks/useAprovacaoOrcamento'
import { ClienteModulePlaceholder } from '../../components/cliente/ClienteModulePlaceholder'
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
} from '../../components/aprovacao'

/**
 * Portal do Cliente — Visualização e Aprovação de Ordem de Serviço (/cliente/servicos).
 * Decomposta de monólito de 1.375L para container modular e responsivo (NFR17 / ADR-003).
 */
export function ClienteServicosPage() {
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
  } = useAprovacaoOrcamento()

  const [activeTab, setActiveTab] = useState('orcamento')
  const [modalAprovacaoAberto, setModalAprovacaoAberto] = useState(false)
  const [modalFolhaImpressaoAberta, setModalFolhaImpressaoAberta] = useState(false)
  const [fotoZoomUrl, setFotoZoomUrl] = useState(null)
  const [nomeResponsavel, setNomeResponsavel] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('pix')

  // Se o cliente logado não possuir nenhuma OS em andamento, exibe placeholder oficial
  if (!temOS) {
    return <ClienteModulePlaceholder />
  }

  const handleSubmeterAprovacao = (e) => {
    e.preventDefault()
    confirmarAprovacao({
      nomeResponsavel: nomeResponsavel || dadosOS.cliente,
      formaPagamento,
    })
    setModalAprovacaoAberto(false)
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
          setNomeResponsavel(nomeResponsavelAprovacao || dadosOS.cliente || '')
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

export default ClienteServicosPage
