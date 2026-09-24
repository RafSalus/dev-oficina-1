import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { WHATSAPP_ACCESS } from '../../../constants/company'
import { montarServicoMobile, itensMarcadosMobile, totaisMobile } from '../../../utils/aprovacao/aprovacaoMobile'
import { MobileClienteServicosPage } from './MobileClienteServicosPage'

/**
 * Liga a versão mobile do Portal do Cliente ao `useAprovacaoOrcamento` (NFR18): converte
 * OS, itens e totais para o formato da `MobileClienteServicosPage` e trata cópia do laudo
 * e confirmação da aprovação.
 * @param {{aprovacao: object, clienteAtivo: object|null}} props - `aprovacao` é o retorno do hook.
 */
export function ClienteServicosMobile({ aprovacao, clienteAtivo }) {
  const { dadosOS, itensAprovaveis, respostasLocais, totais, laudoOficial, estaAprovado } = aprovacao
  const [modalAprovacaoAberto, setModalAprovacaoAberto] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState('pix')
  const [nomeResponsavel, setNomeResponsavel] = useState(clienteAtivo?.nome || '')

  const servico = useMemo(() => montarServicoMobile(dadosOS, itensAprovaveis), [dadosOS, itensAprovaveis])
  const itensMarcados = useMemo(() => itensMarcadosMobile(itensAprovaveis, respostasLocais), [itensAprovaveis, respostasLocais])

  const linkWhatsApp = `${WHATSAPP_ACCESS.href}?text=${encodeURIComponent(
    `Olá! Sou ${clienteAtivo?.nome || 'cliente'}, proprietário do ${servico.veiculo} (${servico.placa}). Estou no Portal do Cliente analisando a OS #${servico.numeroOS} e gostaria de tirar uma dúvida.`
  )}`

  const copiarLaudo = () => {
    try {
      navigator.clipboard.writeText(laudoOficial)
      toast.success('Texto do laudo técnico copiado para a área de transferência!')
    } catch {
      toast.error('Não foi possível copiar o laudo.')
    }
  }

  const confirmarAprovacao = () => {
    if (!nomeResponsavel.trim()) {
      toast.warning('Por favor, confirme o nome do titular responsável.')
      return
    }
    aprovacao.confirmarAprovacao({ nomeResponsavel, formaPagamento })
    setModalAprovacaoAberto(false)
  }

  return (
    <MobileClienteServicosPage
      servico={servico}
      clienteAtivo={clienteAtivo}
      itensMarcados={itensMarcados}
      aprovado={estaAprovado}
      totais={totaisMobile(totais, itensAprovaveis)}
      laudoOficialPadraoOS={laudoOficial}
      linkWhatsApp={linkWhatsApp}
      modalAprovacaoAberto={modalAprovacaoAberto}
      setModalAprovacaoAberto={setModalAprovacaoAberto}
      formaPagamento={formaPagamento}
      setFormaPagamento={setFormaPagamento}
      nomeResponsavel={nomeResponsavel}
      setNomeResponsavel={setNomeResponsavel}
      onToggleItem={aprovacao.handleToggleItem}
      onCopiarLaudo={copiarLaudo}
      onConfirmarAprovacao={confirmarAprovacao}
    />
  )
}
