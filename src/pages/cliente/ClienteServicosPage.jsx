import React, { useState } from 'react'
import { CarProfile } from '@phosphor-icons/react'
import { useCliente } from '../../context/ClienteContext'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useAprovacaoOrcamento } from '../../hooks/useAprovacaoOrcamento'
import { ClienteServicosMobile } from './mobile/ClienteServicosMobile'
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

/** Estado vazio do portal quando o cliente não tem OS em andamento. */
function SemOrdemEmAndamento() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-[#e4e7ec] p-8 text-center max-w-sm">
        <CarProfile size={32} className="mx-auto mb-3 text-[#98a2b3]" />
        <p className="text-sm font-bold text-[#101828]">Nenhuma ordem de serviço em andamento</p>
        <p className="text-xs text-[#667085] mt-1">
          Assim que sua oficina abrir uma OS para o seu veículo, o orçamento e o laudo técnico aparecerão aqui.
        </p>
      </div>
    </div>
  )
}

/**
 * Portal do Cliente — Visualização e Aprovação de Ordem de Serviço (/cliente/servicos).
 * Container leve sobre `useAprovacaoOrcamento`, o mesmo hook da rota pública e da versão
 * mobile (NFR17 / NFR18 / ADR-003). Dentro do portal, a tela fica embutida: sem botão
 * "Fechar" e com o rodapé preso ao container, sem cobrir a barra lateral.
 */
export function ClienteServicosPage() {
  const isMobile = useIsMobile()
  const { clienteAtivo } = useCliente()
  const aprovacao = useAprovacaoOrcamento(undefined, { origem: 'portal' })
  const { temOS, dadosOS, estaAprovado, totais, fotosDasPecas } = aprovacao

  const [activeTab, setActiveTab] = useState('orcamento')
  const [modalAprovacaoAberto, setModalAprovacaoAberto] = useState(false)
  const [modalFolhaImpressaoAberta, setModalFolhaImpressaoAberta] = useState(false)
  const [fotoZoomUrl, setFotoZoomUrl] = useState(null)
  const [nomeResponsavel, setNomeResponsavel] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('pix')

  if (!temOS) return <SemOrdemEmAndamento />
  if (isMobile) return <ClienteServicosMobile aprovacao={aprovacao} clienteAtivo={clienteAtivo} />

  const handleSubmeterAprovacao = (e) => {
    e.preventDefault()
    aprovacao.confirmarAprovacao({ nomeResponsavel: nomeResponsavel || dadosOS.cliente, formaPagamento })
    setModalAprovacaoAberto(false)
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar bg-[#f8fafc] text-[#101828] flex flex-col select-none">
      <AprovacaoHeader
        dadosOS={dadosOS}
        estaAprovado={estaAprovado}
        dataHoraAprovacao={aprovacao.dataHoraAprovacao}
        onAbrirFolhaImpressao={() => setModalFolhaImpressaoAberta(true)}
        onTirarDuvidasWhatsApp={aprovacao.tirarDuvidasWhatsApp}
        mostrarFechar={false}
      />

      <AprovacaoTabsNav activeTab={activeTab} setActiveTab={setActiveTab} fotosCount={fotosDasPecas.length} />

      <main className="max-w-4xl mx-auto w-full p-4 space-y-4 flex-1">
        {activeTab === 'orcamento' && (
          <AprovacaoOrcamentoTab
            totais={totais}
            itensAprovaveis={aprovacao.itensAprovaveis}
            itensAdicionaisOS={dadosOS.itensAdicionaisOS}
            respostasLocais={aprovacao.respostasLocais}
            estaAprovado={estaAprovado}
            onToggleItem={aprovacao.handleToggleItem}
            onVerFoto={setFotoZoomUrl}
            onResponderItemAdicional={aprovacao.responderItemAdicionalOS}
          />
        )}
        {activeTab === 'laudo' && <AprovacaoLaudoTab dadosOS={dadosOS} />}
        {activeTab === 'fotos' && <AprovacaoFotosTab fotosDasPecas={fotosDasPecas} onVerFoto={setFotoZoomUrl} />}
      </main>

      <AprovacaoFooter
        totais={totais}
        estaAprovado={estaAprovado}
        fixo={false}
        onAbrirModalAprovacao={() => {
          setNomeResponsavel(aprovacao.nomeResponsavelAprovacao || dadosOS.cliente || '')
          setFormaPagamento(aprovacao.formaPagamentoEscolhida || 'pix')
          setModalAprovacaoAberto(true)
        }}
        onEnviarWhatsApp={aprovacao.enviarConfirmacaoWhatsApp}
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

      <AprovacaoFotoZoomModal fotoUrl={fotoZoomUrl} onClose={() => setFotoZoomUrl(null)} />
    </div>
  )
}

export default ClienteServicosPage
