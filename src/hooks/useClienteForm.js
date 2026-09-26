import { useState, useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { consultarCepApi } from '../services/cepService'
import {
  FORM_CLIENTE_INICIAL,
  formDoCliente,
  documentoEhValido,
  validarCliente,
  montarPayloadCliente,
  temDadosPreenchidos,
  validarVeiculo,
  montarVeiculoCliente,
  filtrarVeiculos,
} from '../utils/clientes/clienteFormulario'
import { useVeiculoFipe } from './useVeiculoFipe'

/**
 * Estado e regras do formulário de cliente (Story 2.0 / ADR-003): carga para edição,
 * validação de CPF/CNPJ, busca de endereço por CEP, veículos vinculados (com FIPE),
 * salvar e descartar com confirmação.
 *
 * @param {{isOpen: boolean, clienteParaEditar: object|null, onSalvar: Function, onClose: Function}} params
 * @returns {object}
 */
export function useClienteForm({ isOpen, clienteParaEditar, onSalvar, onClose }) {
  const [form, setForm] = useState(FORM_CLIENTE_INICIAL)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false)
  const [adicionandoVeiculo, setAdicionandoVeiculo] = useState(false)
  const [filtroVeiculos, setFiltroVeiculos] = useState('')
  const numeroInputRef = useRef(null)
  const fipe = useVeiculoFipe(adicionandoVeiculo)

  useEffect(() => {
    setForm(
      clienteParaEditar
        ? formDoCliente(clienteParaEditar, '')
        : { ...FORM_CLIENTE_INICIAL, codigoCliente: '' }
    )
    fipe.reiniciar()
    setAdicionandoVeiculo(false)
    // `fipe.reiniciar` só usa setters estáveis; reinicia quando o modal abre ou troca de cliente
  }, [clienteParaEditar, isOpen])

  const alterar = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }))

  const trocarTipoPessoa = (tipo) => setForm((prev) => ({ ...prev, tipoPessoa: tipo, documento: '' }))

  const documentoValido = useMemo(
    () => documentoEhValido(form.documento, form.tipoPessoa),
    [form.documento, form.tipoPessoa]
  )

  const veiculosExibidos = useMemo(() => filtrarVeiculos(form.veiculos || [], filtroVeiculos), [form.veiculos, filtroVeiculos])

  /** Completa o endereço pelo CEP e leva o foco para o número. Sem argumento, avisa se o CEP é inválido. */
  const buscarEnderecoPorCep = async (cepOpcional) => {
    const cepLimpo = (cepOpcional || form.cep || '').replace(/\D/g, '')
    if (cepLimpo.length !== 8) {
      if (!cepOpcional) toast.warning('Informe um CEP válido com 8 dígitos.')
      return
    }
    try {
      setBuscandoCep(true)
      const dados = await consultarCepApi(cepLimpo)
      setForm((prev) => ({
        ...prev,
        logradouro: dados.logradouro || prev.logradouro,
        bairro: dados.bairro || prev.bairro,
        cidade: dados.cidade || prev.cidade,
        uf: dados.uf || prev.uf,
      }))
      toast.success('Endereço completado automaticamente via CEP!')
      setTimeout(() => numeroInputRef.current?.focus(), 100)
    } catch (err) {
      toast.error(err.message || 'Falha ao consultar o CEP. Preencha manualmente.')
    } finally {
      setBuscandoCep(false)
    }
  }

  const abrirInclusaoVeiculo = () => {
    fipe.reiniciar('')
    setAdicionandoVeiculo(true)
  }

  const incluirVeiculo = () => {
    const pendencia = validarVeiculo(fipe.veiculo)
    if (pendencia) {
      toast.warning(pendencia)
      return
    }
    const codigo = fipe.veiculo.codigoVeiculo || ''
    const novo = montarVeiculoCliente(fipe.veiculo, codigo)
    setForm((prev) => ({ ...prev, veiculos: [...prev.veiculos, novo] }))
    fipe.reiniciar()
    setAdicionandoVeiculo(false)
    toast.success('Veículo incluído com sucesso!')
  }

  const removerVeiculo = (index) => {
    setForm((prev) => ({ ...prev, veiculos: prev.veiculos.filter((_, idx) => idx !== index) }))
    toast.info('Veículo removido da lista.')
  }

  const salvar = async (e) => {
    e.preventDefault()
    const pendencia = validarCliente(form)
    if (pendencia) {
      toast[pendencia.tipo](pendencia.mensagem)
      return
    }
    try {
      await onSalvar(montarPayloadCliente(form, clienteParaEditar, form.codigoCliente || ''))
      onClose()
    } catch {
      // Erro reportado pelo repositório/workflow. Mantém o formulário aberto para correção (AC6).
    }
  }

  const cancelar = () => {
    if (temDadosPreenchidos(form)) setConfirmandoDescarte(true)
    else onClose()
  }

  const confirmarDescarte = () => {
    setConfirmandoDescarte(false)
    toast.info('Alterações descartadas.')
    onClose()
  }

  return {
    form,
    alterar,
    trocarTipoPessoa,
    documentoValido,
    buscandoCep,
    buscarEnderecoPorCep,
    numeroInputRef,
    veiculos: {
      fipe,
      adicionando: adicionandoVeiculo,
      abrirInclusao: abrirInclusaoVeiculo,
      fecharInclusao: () => setAdicionandoVeiculo(false),
      incluir: incluirVeiculo,
      remover: removerVeiculo,
      filtro: filtroVeiculos,
      setFiltro: setFiltroVeiculos,
      exibidos: veiculosExibidos,
    },
    salvar,
    cancelar,
    descarte: {
      confirmando: confirmandoDescarte,
      fechar: () => setConfirmandoDescarte(false),
      confirmar: confirmarDescarte,
    },
  }
}
