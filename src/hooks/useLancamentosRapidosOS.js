import { useState, useRef, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import {
  carregarPecasCadastradas,
  carregarServicosCadastrados,
  carregarTerceirosCadastrados,
} from '../constants/cadastrosSuprimentosData'
import {
  montarPecaRapida,
  montarServicoRapido,
  montarTerceiroRapido,
  nomeDaSelecao,
  opcoesPecas,
  opcoesServicos,
  opcoesParceirosTerceirizados,
} from '../utils/ordemServico/osItensRapidos'
import { urlWhatsApp, mensagemSolicitacaoParceiro, mensagemItemAdicional } from '../utils/ordemServico/osMensagens'

const PECA_VAZIA = { selecao: null, qtd: '1' }
const SERVICO_VAZIO = { selecao: null, qtd: '1', preco: '' }
const TERCEIRO_VAZIO = { selecao: null, descricao: '', qtd: '1', valor: '' }
const ITEM_ADICIONAL_VAZIO = { descricao: '', categoria: 'peca', classificacao: 'seguranca', valor: '' }

/** Estado de formulário com `alterar(campo, valor)` e `redefinir(campos)`. */
function useFormulario(inicial) {
  const [valores, setValores] = useState(inicial)
  return {
    ...valores,
    alterar: (campo, valor) => setValores((prev) => ({ ...prev, [campo]: valor })),
    redefinir: (campos) => setValores((prev) => ({ ...prev, ...campos })),
  }
}

/**
 * Lançamentos rápidos direto no painel da OS (Story 2.0 / ADR-003): peça do almoxarifado
 * (com foto na hora), serviço do catálogo, serviço terceirizado (com pedido ao parceiro) e
 * item adicional encontrado na execução. Os formulários vivem no painel para não perder o
 * que foi digitado ao trocar de aba.
 *
 * @param {{os: object|null, linkCliente: string, onAdicionarItem: Function,
 *   onAtualizarFotoPeca: Function, onReportarItemAdicional: Function}} params
 * @returns {object}
 */
export function useLancamentosRapidosOS({ os, linkCliente, onAdicionarItem, onAtualizarFotoPeca, onReportarItemAdicional }) {
  const [catalogos, setCatalogos] = useState({ pecas: [], servicos: [], terceiros: [] })
  useEffect(() => {
    setCatalogos({
      pecas: carregarPecasCadastradas(),
      servicos: carregarServicosCadastrados(),
      terceiros: carregarTerceirosCadastrados(),
    })
  }, [])

  const opcoes = useMemo(
    () => ({
      pecas: opcoesPecas(catalogos.pecas),
      servicos: opcoesServicos(catalogos.servicos),
      parceiros: opcoesParceirosTerceirizados(catalogos.terceiros),
    }),
    [catalogos]
  )

  const peca = useFormulario(PECA_VAZIA)
  const servico = useFormulario(SERVICO_VAZIO)
  const terceiro = useFormulario(TERCEIRO_VAZIO)
  const itemAdicional = useFormulario(ITEM_ADICIONAL_VAZIO)

  // Última peça lançada nesta sessão — permite fotografá-la na hora com a câmera do celular
  const [ultimaPecaAdicionada, setUltimaPecaAdicionada] = useState(null)
  const inputFotoPecaRef = useRef(null)

  const adicionarPeca = () => {
    const { nome, paraCotacao, item } = montarPecaRapida(peca.selecao, peca.qtd)
    if (!nome) {
      toast.warning('Busque a peça no almoxarifado ou digite o nome dela.')
      return
    }
    onAdicionarItem?.(os.numeroOS, 'peca', item)
    if (paraCotacao) {
      toast.warning(
        `"${nome}" não tem saldo suficiente no almoxarifado e foi marcada para Cotação. Mova a OS para "Cotação" no Kanban para disparar a cotação com fornecedores.`
      )
    } else {
      toast.success(`Peça "${nome}" adicionada à OS #${os.numeroOS}.`)
    }
    setUltimaPecaAdicionada({ id: item.id, nome })
    peca.redefinir(PECA_VAZIA)
  }

  const fotoPecaSelecionada = (e) => {
    const file = e.target.files?.[0]
    if (!file || !ultimaPecaAdicionada) return
    const reader = new FileReader()
    reader.onload = (event) => {
      onAtualizarFotoPeca?.(os.numeroOS, ultimaPecaAdicionada.id, event.target.result)
      toast.success(`Foto de "${ultimaPecaAdicionada.nome}" anexada com sucesso!`)
      setUltimaPecaAdicionada(null)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Serviço do catálogo já traz o valor de mão de obra cadastrado
  const selecionarServico = (opt) => {
    servico.alterar('selecao', opt)
    if (opt?.servico) servico.alterar('preco', String(opt.servico.valorMaoDeObra || ''))
  }

  const adicionarServico = () => {
    const nome = nomeDaSelecao(servico.selecao, 'servico')
    if (!nome) {
      toast.warning('Busque o serviço no catálogo ou digite o nome dele.')
      return
    }
    const preco = parseFloat(servico.preco)
    if (!preco || preco <= 0) {
      toast.warning('Informe o valor da mão de obra.')
      return
    }
    onAdicionarItem?.(os.numeroOS, 'servico', montarServicoRapido(servico.selecao, servico.qtd, preco))
    toast.success(`Serviço "${nome}" adicionado à OS #${os.numeroOS}.`)
    servico.redefinir(SERVICO_VAZIO)
  }

  const adicionarTerceiro = () => {
    if (!terceiro.descricao.trim()) {
      toast.warning('Descreva o serviço que será terceirizado.')
      return
    }
    const valor = parseFloat(terceiro.valor)
    if (!valor || valor <= 0) {
      toast.warning('Informe o valor de venda deste serviço terceirizado.')
      return
    }
    const item = montarTerceiroRapido({ descricao: terceiro.descricao, selecao: terceiro.selecao, quantidade: terceiro.qtd, valor })
    onAdicionarItem?.(os.numeroOS, 'terceiro', item)
    toast.success(`Serviço terceirizado "${item.nome}" adicionado à OS #${os.numeroOS}.`)
    terceiro.redefinir(TERCEIRO_VAZIO)
  }

  const solicitarParceiroWhatsapp = () => {
    const parceiro = terceiro.selecao?.terceiro
    if (!parceiro) {
      toast.warning('Selecione o parceiro terceirizado para disparar a solicitação.')
      return
    }
    const telefone = parceiro.contatoTelefone || parceiro.contato?.telefone || ''
    if (!telefone.replace(/\D/g, '')) {
      toast.warning('Este parceiro não tem telefone cadastrado.')
      return
    }
    const msg = mensagemSolicitacaoParceiro(os, parceiro.nomeFantasia || parceiro.razaoSocial, terceiro.descricao)
    window.open(urlWhatsApp(telefone, msg), '_blank')
    toast.success('Solicitação preparada para envio ao parceiro via WhatsApp!')
  }

  // Itens de segurança bloqueiam o avanço da OS até o cliente responder, por isso o aviso sai na hora
  const reportarItemAdicional = () => {
    const descricao = itemAdicional.descricao.trim()
    if (!descricao) {
      toast.warning('Descreva o item encontrado durante a execução.')
      return
    }
    onReportarItemAdicional?.(os.numeroOS, {
      descricao,
      categoria: itemAdicional.categoria,
      classificacao: itemAdicional.classificacao,
      valorEstimado: parseFloat(itemAdicional.valor) || 0,
      criadoPor: { tipo: 'secretaria', nome: 'Secretaria/Gestão' },
    })
    window.open(urlWhatsApp(os.telefone, mensagemItemAdicional(os, descricao, itemAdicional.classificacao, linkCliente)), '_blank')
    toast.success('Item adicional registrado e cliente notificado via WhatsApp.')
    itemAdicional.redefinir({ descricao: '', valor: '' })
  }

  return {
    opcoes,
    peca: {
      ...peca,
      adicionar: adicionarPeca,
      ultimaAdicionada: ultimaPecaAdicionada,
      inputFotoRef: inputFotoPecaRef,
      tirarFoto: () => inputFotoPecaRef.current?.click(),
      fotoSelecionada: fotoPecaSelecionada,
    },
    servico: { ...servico, selecionar: selecionarServico, adicionar: adicionarServico },
    terceiro: { ...terceiro, adicionar: adicionarTerceiro, solicitarParceiro: solicitarParceiroWhatsapp },
    itemAdicional: { ...itemAdicional, reportar: reportarItemAdicional },
  }
}
