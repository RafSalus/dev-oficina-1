import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Receipt, WarningCircle, Trash, ArrowsClockwise } from '@phosphor-icons/react'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { useOsDraft } from './useOsDraft'
import { ModalRedimensionavel } from '../../../components/suprimentos/ModalRedimensionavel'
import { OsFormularioAbertura } from './components/OsFormularioAbertura'
import { OsRodapeAcoes } from './components/OsRodapeAcoes'
import { ModalImpressaoOS } from '../orcamento/ModalImpressaoOS'
import { MobileNovaOrdemDeServicoPage } from './mobile/MobileNovaOrdemDeServicoPage'
import { adicionarOuAtualizarOrdem } from '../orcamento/mockOrdensAbertas'
import { carregarClientesCadastrados } from '../../../constants/mockClientesVeiculos'
import { carregarFilaEspera, salvarFilaEspera } from '../../../constants/agendaData'

// Abertura de Ordem de Servico como um formulario/modal, igual aos demais cadastros do
// sistema (Cliente, Veiculo, etc.) — sem tela ou rota dedicada. `dadosIniciais` aceita tanto
// um item da Fila de Espera da Agenda (clienteNome/veiculoPlaca/motivo/...) quanto uma OS ja
// existente sendo reaberta para edicao (mesmo formato salvo em mockOrdensAbertas).
export function NovaOrdemServicoModal({ isOpen, onClose, dadosIniciais, onSalvo }) {
  const isMobile = useIsMobile()
  const { formData, updateFormData, clearDraft, resetDraft } = useOsDraft()
  const [modalImpressaoAberta, setModalImpressaoAberta] = useState(false)
  const [modalConfirmacaoDescarte, setModalConfirmacaoDescarte] = useState(false)
  const [modalConfirmacaoLimpar, setModalConfirmacaoLimpar] = useState(false)
  const dadosAplicadosRef = useRef(false)

  // Aplica o prefill (fila de espera, edicao de OS existente etc.) uma unica vez por abertura
  useEffect(() => {
    if (!isOpen) {
      dadosAplicadosRef.current = false
      return
    }
    if (dadosAplicadosRef.current || !dadosIniciais) return
    dadosAplicadosRef.current = true

    const state = dadosIniciais
    const listaClientes = carregarClientesCadastrados()
    const veiculoParam = state.veiculo || {}
    const placaAlvo = (state.veiculoPlaca || state.placa || veiculoParam.placa || '').toUpperCase().trim()
    const clienteIdAlvo = state.clienteId || veiculoParam.clienteId
    const clienteNomeAlvo = state.clienteNome || veiculoParam.clienteNome

    let clienteEncontrado = null
    if (clienteIdAlvo) {
      clienteEncontrado = listaClientes.find((c) => c.value === clienteIdAlvo || c.id === clienteIdAlvo)
    }
    if (!clienteEncontrado && placaAlvo) {
      clienteEncontrado = listaClientes.find(
        (c) => Array.isArray(c.veiculos) && c.veiculos.some((v) => (v.placa || '').toUpperCase().trim() === placaAlvo)
      )
    }
    if (!clienteEncontrado && clienteNomeAlvo) {
      clienteEncontrado = listaClientes.find((c) => c.nome?.toLowerCase().trim() === clienteNomeAlvo.toLowerCase().trim())
    }

    let veiculoEncontrado = null
    if (clienteEncontrado && Array.isArray(clienteEncontrado.veiculos)) {
      if (state.veiculoId) {
        veiculoEncontrado = clienteEncontrado.veiculos.find((v) => v.value === state.veiculoId || v.id === state.veiculoId)
      }
      if (!veiculoEncontrado && placaAlvo) {
        veiculoEncontrado = clienteEncontrado.veiculos.find((v) => (v.placa || '').toUpperCase().trim() === placaAlvo)
      }
      if (!veiculoEncontrado && clienteEncontrado.veiculos.length > 0) {
        veiculoEncontrado = clienteEncontrado.veiculos[0]
      }
    }

    // Reabrindo uma OS ja existente (Editar OS): usa os dados dela quase inteiros
    const ehOsExistente = Boolean(state.numeroOS)

    const itens = state.itensPreventivosSugeridos || []
    let relatoTexto = state.relatoCliente || state.relatoPreventivo || state.motivo || ''

    if (!ehOsExistente && !relatoTexto && Array.isArray(itens) && itens.length > 0) {
      const linhas = itens
        .map((item) => {
          const nome = item.nome || item.itemNome || 'Item Preventivo'
          const motivo = item.motivoAlerta ? ` - ${item.motivoAlerta}` : ''
          return `• ${nome}${motivo}`
        })
        .join('\n')

      relatoTexto = [
        'REVISAO PREVENTIVA E PONTOS DE ATENCAO:',
        linhas,
        '',
        'Veiculo recepcionado para inspecao preventiva geral.',
      ].join('\n')
    }

    const patch = ehOsExistente
      ? { ...state }
      : {
          clienteId: clienteEncontrado ? clienteEncontrado.value || clienteEncontrado.id : clienteIdAlvo || '',
          cliente: clienteEncontrado ? clienteEncontrado.nome : clienteNomeAlvo || '',
          telefone: clienteEncontrado ? clienteEncontrado.telefone || '' : state.clienteTelefone || veiculoParam.clienteTelefone || '',
          documento: clienteEncontrado ? clienteEncontrado.documento || '' : veiculoParam.clienteDocumento || '',
          email: clienteEncontrado ? clienteEncontrado.email || '' : '',
          endereco: clienteEncontrado ? clienteEncontrado.endereco || '' : veiculoParam.clienteCidade || '',

          veiculoId: veiculoEncontrado ? veiculoEncontrado.value || veiculoEncontrado.id : state.veiculoId || veiculoParam.id || veiculoParam.value || '',
          placa: veiculoEncontrado ? veiculoEncontrado.placa : placaAlvo || veiculoParam.placa || '',
          marcaModelo: veiculoEncontrado
            ? veiculoEncontrado.marcaModelo || `${veiculoEncontrado.marca || ''} ${veiculoEncontrado.modelo || ''}`.trim()
            : state.veiculoModelo || veiculoParam.marcaModelo || `${veiculoParam.marca || ''} ${veiculoParam.modelo || ''}`.trim(),
          ano: veiculoEncontrado ? veiculoEncontrado.ano : veiculoParam.ano || '',
          cor: veiculoEncontrado ? veiculoEncontrado.cor : veiculoParam.cor || '',
          km: veiculoEncontrado ? veiculoEncontrado.kmPadrao || veiculoEncontrado.kmAtual || '' : veiculoParam.kmPadrao || veiculoParam.kmAtual || '',

          tipoAtendimento: state.tipoAtendimento || (itens.length > 0 ? 'preventiva' : 'orcamento'),
          relatoCliente: relatoTexto,
          filaEsperaId: state.filaEsperaId || '',
          mecanicoId: state.mecanicoPreferencialId || '',
        }

    updateFormData(patch)

    const nomeCurto = (patch.cliente || '').split(' ')[0] || 'Cliente'
    toast.success(
      ehOsExistente
        ? `OS #${state.numeroOS} carregada para edicao!`
        : `Dados de ${nomeCurto} carregados nesta Ordem de Servico!`
    )
  }, [isOpen, dadosIniciais])

  const validarDadosMinimos = () => {
    if (!formData.cliente?.trim()) {
      toast.warning('Por favor, selecione o cliente para abrir a Ordem de Servico.')
      return false
    }
    if (!formData.placa?.trim()) {
      toast.warning('Por favor, selecione o veiculo do cliente.')
      return false
    }
    if (!formData.km?.trim()) {
      toast.warning('Por favor, informe a quilometragem (KM) atual do veiculo.')
      return false
    }
    if (!formData.relatoCliente?.trim()) {
      toast.warning('Por favor, preencha o relato do cliente antes de salvar a Ordem de Servico.')
      return false
    }
    return true
  }

  // Remove o cliente atendido da Fila de Espera da Agenda assim que a OS é efetivamente salva —
  // se a secretária cancelar o atendimento antes disso, a pessoa continua aguardando normalmente.
  const removerDaFilaDeEsperaSeNecessario = () => {
    if (!formData.filaEsperaId) return
    const filaAtual = carregarFilaEspera()
    const novaFila = filaAtual.filter((item) => item.id !== formData.filaEsperaId)
    if (novaFila.length !== filaAtual.length) {
      salvarFilaEspera(novaFila)
    }
  }

  // Edicao de uma OS ja existente (aberta via "Editar OS") preserva o status/etapa atual dela
  // no Kanban — so uma OS nova entra obrigatoriamente na Fila.
  const ehEdicaoDeOsExistente = Boolean(dadosIniciais?.numeroOS)

  const handleSalvar = () => {
    if (!validarDadosMinimos()) return

    const payload = ehEdicaoDeOsExistente ? { ...formData } : { ...formData, status: 'fila' }

    try {
      adicionarOuAtualizarOrdem(payload)
    } catch (err) {
      console.error('Erro ao salvar ordem de servico:', err)
      toast.error('Erro ao salvar a ordem de servico.')
      return
    }

    removerDaFilaDeEsperaSeNecessario()
    clearDraft()

    toast.success(
      ehEdicaoDeOsExistente
        ? `Ordem de Servico #${formData.numeroOS} atualizada!`
        : `Ordem de Servico #${formData.numeroOS} enviada para a Fila!`
    )
    onSalvo?.()
    onClose()
  }

  const verificarTemDadosPreenchidos = () => {
    return Boolean(
      formData.cliente?.trim() ||
      formData.placa?.trim() ||
      formData.relatoCliente?.trim() ||
      formData.km?.trim() ||
      formData.telefone?.trim() ||
      (formData.servicosOS && formData.servicosOS.length > 0) ||
      (formData.pecasOS && formData.pecasOS.length > 0) ||
      (formData.checklistEntrada && Object.keys(formData.checklistEntrada).length > 0)
    )
  }

  const handleCancelar = () => {
    if (verificarTemDadosPreenchidos() || ehEdicaoDeOsExistente) {
      setModalConfirmacaoDescarte(true)
    } else {
      clearDraft()
      onClose()
    }
  }

  const confirmarDescarte = () => {
    setModalConfirmacaoDescarte(false)
    clearDraft()
    toast.info(ehEdicaoDeOsExistente ? 'Edição cancelada.' : 'Atendimento cancelado.')
    onClose()
  }

  const handleLimpar = () => {
    if (verificarTemDadosPreenchidos()) {
      setModalConfirmacaoLimpar(true)
    } else {
      resetDraft()
      toast.info('Formulário limpo. Pronto para um novo atendimento.')
    }
  }

  const confirmarLimpar = () => {
    setModalConfirmacaoLimpar(false)
    resetDraft()
    toast.info('Formulário limpo. Pronto para um novo atendimento.')
  }

  const handleImprimirEntrada = () => {
    if (!formData.cliente?.trim() || !formData.placa?.trim()) {
      toast.warning('Preencha ao menos o cliente e veiculo para gerar a folha de entrada.')
      return
    }
    setModalImpressaoAberta(true)
  }

  // Salva a OS (sem fechar o modal, a secretaria continua preenchendo) e dispara pelo
  // WhatsApp o link publico onde o cliente confere e assina digitalmente o checklist.
  const handleEnviarAssinatura = () => {
    if (!validarDadosMinimos()) return

    const foneLimpo = (formData.telefone || '').replace(/\D/g, '')
    if (!foneLimpo) {
      toast.warning('Este cliente nao tem telefone cadastrado para envio via WhatsApp.')
      return
    }

    const payload = ehEdicaoDeOsExistente ? { ...formData } : { ...formData, status: formData.status || 'fila' }
    try {
      adicionarOuAtualizarOrdem(payload)
    } catch (err) {
      console.error('Erro ao salvar ordem de servico para envio do checklist:', err)
      toast.error('Erro ao salvar a ordem de servico.')
      return
    }
    onSalvo?.()

    const link = `${window.location.origin}/vistoria/${formData.numeroOS}`
    const msg = `Olá, *${formData.cliente}*! Aqui é da *Mecânica Gabriel*.\n\nSegue o checklist de vistoria de entrada do seu veículo *${formData.marcaModelo || ''}* (Placa: *${formData.placa.toUpperCase()}*), referente à OS *#${formData.numeroOS}*.\n\nPor favor, confira os itens e assine digitalmente pelo link abaixo:\n👉 ${link}`
    const url = `https://api.whatsapp.com/send?phone=55${foneLimpo}&text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
    toast.success('Checklist salvo e link de assinatura enviado ao cliente pelo WhatsApp!')
  }

  if (!isOpen) return null

  return (
    <>
      {isMobile ? (
        <div className="fixed inset-0 z-100">
          <MobileNovaOrdemDeServicoPage
            formData={formData}
            updateFormData={updateFormData}
            onFechar={handleCancelar}
            onSalvarFila={handleSalvar}
          />
        </div>
      ) : (
        <ModalRedimensionavel
          isOpen={isOpen}
          onClose={handleCancelar}
          titulo="Abertura de Ordem de Servico"
          subtitulo={`OS #${formData.numeroOS} • Entrada ${formData.dataEntrada || 'hoje'} as ${formData.horaEntrada || 'agora'}`}
          badge="Recepcao"
          icone={Receipt}
          larguraPadrao={1040}
          alturaPadrao={800}
          // Este formulario tem linhas de ate 4 e 7 colunas (dados do veiculo, fotos de
          // entrada, checklist) — abaixo de ~940px essas colunas ficam apertadas demais
          // mesmo com os breakpoints de container. Travar um minimo maior aqui evita que o
          // usuario arraste o modal para uma largura onde os campos ficam amontoados.
          larguraMinima={940}
          alturaMinima={560}
          larguraMaxima={1440}
          alturaMaxima={940}
          storageKey="modal_nova_os"
          rodape={
            <OsRodapeAcoes
              formData={formData}
              onCancelar={handleCancelar}
              onLimpar={handleLimpar}
              onImprimirEntrada={handleImprimirEntrada}
              onSalvar={handleSalvar}
            />
          }
        >
          <OsFormularioAbertura
            formData={formData}
            updateFormData={updateFormData}
            onEnviarAssinatura={handleEnviarAssinatura}
          />
        </ModalRedimensionavel>
      )}

      {modalImpressaoAberta && (
        <ModalImpressaoOS
          isOpen={modalImpressaoAberta}
          onClose={() => setModalImpressaoAberta(false)}
          osData={formData}
        />
      )}

      {/* Diálogo Modal de Confirmação de Cancelamento / Descarte (renderizado na frente do formulário) */}
      {modalConfirmacaoDescarte && (
        <div
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
          onClick={() => setModalConfirmacaoDescarte(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 select-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 pb-4 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <WarningCircle size={22} weight="bold" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-extrabold text-[#101828]">
                  {ehEdicaoDeOsExistente ? 'Descartar alterações da OS?' : 'Descartar este atendimento?'}
                </h4>
                <p className="text-xs text-[#475467] mt-1 leading-relaxed">
                  {ehEdicaoDeOsExistente
                    ? `As alterações feitas na OS #${formData.numeroOS} não foram salvas. Deseja realmente sair e descartá-las?`
                    : 'Os dados preenchidos desta abertura de Ordem de Serviço serão cancelados e o rascunho será descartado. Deseja realmente sair?'}
                </p>
                {(formData.cliente || formData.placa) && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#f8fafc] border border-[#eaecf0] text-xs space-y-1">
                    {formData.cliente && (
                      <div className="flex items-center gap-1 text-[#101828] font-bold truncate">
                        <span className="text-[#667085] font-normal">Cliente:</span>
                        <span className="truncate">{formData.cliente}</span>
                      </div>
                    )}
                    {formData.placa && (
                      <div className="flex items-center gap-1 text-[#101828] font-bold truncate">
                        <span className="text-[#667085] font-normal">Veículo:</span>
                        <span className="truncate">{formData.placa.toUpperCase()} {formData.marcaModelo ? `(${formData.marcaModelo})` : ''}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3.5 bg-[#f8fafc] border-t border-[#eaecf0] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalConfirmacaoDescarte(false)}
                className="h-9 px-4 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f2f4f7] text-[#344054] text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                Continuar Preenchendo
              </button>
              <button
                type="button"
                onClick={confirmarDescarte}
                className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
              >
                <Trash size={14} weight="bold" />
                <span>{ehEdicaoDeOsExistente ? 'Sim, Descartar Alterações' : 'Sim, Descartar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo Modal de Confirmação de Limpeza (renderizado na frente do formulário) */}
      {modalConfirmacaoLimpar && (
        <div
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
          onClick={() => setModalConfirmacaoLimpar(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 select-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 pb-4 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <ArrowsClockwise size={22} weight="bold" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-extrabold text-[#101828]">
                  Limpar todos os campos?
                </h4>
                <p className="text-xs text-[#475467] mt-1 leading-relaxed">
                  Todos os dados e anotações deste formulário serão reiniciados para um novo atendimento em branco. Essa ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-[#f8fafc] border-t border-[#eaecf0] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalConfirmacaoLimpar(false)}
                className="h-9 px-4 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f2f4f7] text-[#344054] text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarLimpar}
                className="h-9 px-4 rounded-xl bg-[#101828] hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
              >
                <ArrowsClockwise size={14} weight="bold" />
                <span>Sim, Limpar Campos</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
