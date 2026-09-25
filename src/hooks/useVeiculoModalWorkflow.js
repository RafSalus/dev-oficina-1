import { useState, useEffect, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import {
  carregarClientesCadastrados,
  gerarProximoCodigoVeiculo,
} from '../constants/mockClientesVeiculos'
import {
  buscarMarcasFipe,
  buscarModelosFipe,
  buscarAnosFipe,
  normalizarCombustivelFipe,
  extrairAnoFipe,
} from '../services/fipeService'

export const COMBUSTIVEL_OPCOES = [
  { value: 'FLEX', label: 'Flex (Álcool e Gasolina)' },
  { value: 'GASOLINA', label: 'Gasolina' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'HIBRIDO', label: 'Híbrido' },
  { value: 'ELETRICO', label: 'Elétrico' },
  { value: 'GNV', label: 'GNV' },
]

export const FORM_VEICULO_INICIAL = {
  codigoVeiculo: '',
  clienteId: '',
  placa: '',
  marca: '',
  marcaCodigo: '',
  modelo: '',
  modeloCodigo: '',
  ano: '',
  anoCodigo: '',
  cor: '',
  combustivel: 'FLEX',
  kmPadrao: '',
  chassi: '',
  renavam: '',
  observacoes: '',
  ativo: true,
}

/**
 * Domain Hook para o formulário de cadastro e edição de veículos (ADR-003 / NFR18).
 * Compartilhado entre Desktop (VeiculoModalForm) e Mobile (MobileVeiculoFormModal).
 */
export function useVeiculoModalWorkflow({
  isOpen,
  onClose,
  onSalvar,
  onExcluir,
  veiculoParaEditar,
  clientePredefinidoId,
}) {
  const [formData, setFormData] = useState(FORM_VEICULO_INICIAL)
  const [clientes, setClientes] = useState([])
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)

  const [marcasFipe, setMarcasFipe] = useState([])
  const [carregandoMarcas, setCarregandoMarcas] = useState(false)
  const [modelosFipe, setModelosFipe] = useState([])
  const [carregandoModelos, setCarregandoModelos] = useState(false)
  const [anosFipe, setAnosFipe] = useState([])
  const [carregandoAnos, setCarregandoAnos] = useState(false)

  // Carrega clientes para o select ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      setClientes(carregarClientesCadastrados())
    }
  }, [isOpen])

  // Carrega marcas da FIPE ao abrir o modal
  useEffect(() => {
    if (isOpen && marcasFipe.length === 0) {
      setCarregandoMarcas(true)
      buscarMarcasFipe()
        .then((lista) => setMarcasFipe(lista))
        .catch(() => toast.error('Não foi possível carregar as marcas da Tabela FIPE.'))
        .finally(() => setCarregandoMarcas(false))
    }
  }, [isOpen, marcasFipe.length])

  // Inicializa dados ao abrir ou editar
  useEffect(() => {
    if (!isOpen) return
    setConfirmandoExclusao(false)

    if (veiculoParaEditar) {
      setFormData({
        codigoVeiculo: veiculoParaEditar.codigoVeiculo || '',
        clienteId: veiculoParaEditar.clienteId || clientePredefinidoId || '',
        placa: veiculoParaEditar.placa || '',
        marca: veiculoParaEditar.marca || '',
        marcaCodigo: veiculoParaEditar.marcaCodigo || '',
        modelo: veiculoParaEditar.modelo || '',
        modeloCodigo: veiculoParaEditar.modeloCodigo || '',
        ano: veiculoParaEditar.ano || '',
        anoCodigo: veiculoParaEditar.anoCodigo || '',
        cor: veiculoParaEditar.cor || '',
        combustivel: veiculoParaEditar.combustivel || 'FLEX',
        kmPadrao: veiculoParaEditar.kmPadrao || '',
        chassi: veiculoParaEditar.chassi || '',
        renavam: veiculoParaEditar.renavam || '',
        observacoes: veiculoParaEditar.observacoes || '',
        ativo: veiculoParaEditar.ativo !== false,
      })

      if (veiculoParaEditar.marcaCodigo) {
        setCarregandoModelos(true)
        buscarModelosFipe(veiculoParaEditar.marcaCodigo)
          .then((modList) => setModelosFipe(modList))
          .catch(() => {})
          .finally(() => setCarregandoModelos(false))
      }
    } else {
      setFormData({
        ...FORM_VEICULO_INICIAL,
        codigoVeiculo: gerarProximoCodigoVeiculo(),
        clienteId: clientePredefinidoId || '',
      })
      setModelosFipe([])
      setAnosFipe([])
    }
  }, [isOpen, veiculoParaEditar, clientePredefinidoId])

  const alterar = useCallback((campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }))
  }, [])

  const toggleAtivo = useCallback(() => {
    setFormData((prev) => ({ ...prev, ativo: !prev.ativo }))
  }, [])

  const opcoesClientes = useMemo(() => {
    return clientes.map((c) => ({
      value: c.value || c.id,
      label: `${c.codigoCliente ? `[${c.codigoCliente}] ` : ''}${c.nome} - ${
        c.telefone || c.documento || ''
      }`,
      nome: c.nome,
      codigoCliente: c.codigoCliente,
      documento: c.documento,
    }))
  }, [clientes])

  const clienteSelecionado = useMemo(() => {
    if (!formData.clienteId) return null
    return opcoesClientes.find((opt) => opt.value === formData.clienteId) || null
  }, [opcoesClientes, formData.clienteId])

  const selecionarCliente = useCallback((opt) => {
    setFormData((prev) => ({
      ...prev,
      clienteId: opt ? opt.value : '',
    }))
  }, [])

  const selecionarMarca = useCallback(async (opcao) => {
    if (!opcao) {
      setFormData((prev) => ({
        ...prev,
        marca: '',
        marcaCodigo: '',
        modelo: '',
        modeloCodigo: '',
        ano: '',
        anoCodigo: '',
      }))
      setModelosFipe([])
      setAnosFipe([])
      return
    }

    const marcaNome = opcao.label || opcao.value
    const marcaCod = opcao.value !== opcao.label ? opcao.value : ''

    setFormData((prev) => ({
      ...prev,
      marca: marcaNome,
      marcaCodigo: marcaCod,
      modelo: '',
      modeloCodigo: '',
      ano: '',
      anoCodigo: '',
    }))
    setModelosFipe([])
    setAnosFipe([])

    if (marcaCod) {
      setCarregandoModelos(true)
      try {
        const lista = await buscarModelosFipe(marcaCod)
        setModelosFipe(lista)
      } catch {
        toast.error('Erro ao consultar modelos da marca na FIPE.')
      } finally {
        setCarregandoModelos(false)
      }
    }
  }, [])

  const selecionarModelo = useCallback(
    async (opcao) => {
      if (!opcao) {
        setFormData((prev) => ({
          ...prev,
          modelo: '',
          modeloCodigo: '',
          ano: '',
          anoCodigo: '',
        }))
        setAnosFipe([])
        return
      }

      const modeloNome = opcao.label || opcao.value
      const modeloCod = opcao.value !== opcao.label ? opcao.value : ''

      setFormData((prev) => ({
        ...prev,
        modelo: modeloNome,
        modeloCodigo: modeloCod,
        ano: '',
        anoCodigo: '',
      }))
      setAnosFipe([])

      if (formData.marcaCodigo && modeloCod) {
        setCarregandoAnos(true)
        try {
          const listaAnos = await buscarAnosFipe(formData.marcaCodigo, modeloCod)
          setAnosFipe(listaAnos)
        } catch {
          // Silencioso
        } finally {
          setCarregandoAnos(false)
        }
      }
    },
    [formData.marcaCodigo]
  )

  const selecionarAno = useCallback((opcao) => {
    if (!opcao) {
      setFormData((prev) => ({ ...prev, ano: '', anoCodigo: '' }))
      return
    }

    const anoSelecionado =
      opcao.ano || extrairAnoFipe(opcao.label) || opcao.value || ''
    const combustivelDetectado =
      opcao.combustivel || normalizarCombustivelFipe(opcao.label)

    setFormData((prev) => ({
      ...prev,
      ano: anoSelecionado,
      anoCodigo: opcao.value || '',
      combustivel: combustivelDetectado || prev.combustivel || 'FLEX',
    }))
  }, [])

  const salvar = useCallback(
    (e) => {
      if (e && e.preventDefault) e.preventDefault()

      if (!formData.clienteId) {
        toast.warning('Por favor, selecione o cliente proprietário do veículo.')
        return false
      }

      if (!formData.placa?.trim()) {
        toast.warning('Por favor, informe a placa do veículo.')
        return false
      }

      const placaLimpa = formData.placa
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, '')
      if (placaLimpa.length < 7) {
        toast.warning(
          'Placa incompleta. Digite uma placa válida (padrão Mercosul ou antigo).'
        )
        return false
      }

      if (!formData.marca?.trim()) {
        toast.warning('Por favor, selecione ou informe a marca do veículo.')
        return false
      }

      if (!formData.modelo?.trim()) {
        toast.warning('Por favor, selecione ou informe o modelo do veículo.')
        return false
      }

      const marcaFormatada = formData.marca.trim()
      const modeloFormatado = formData.modelo.trim()
      const marcaModeloCompleto = `${marcaFormatada} ${modeloFormatado}`.trim()
      const codigoFinal = formData.codigoVeiculo || gerarProximoCodigoVeiculo()

      const payload = {
        ...formData,
        id:
          veiculoParaEditar?.id ||
          veiculoParaEditar?.value ||
          `veic-${Date.now()}`,
        value:
          veiculoParaEditar?.value ||
          veiculoParaEditar?.id ||
          `veic-${Date.now()}`,
        codigoVeiculo: codigoFinal,
        placa: placaLimpa,
        marca: marcaFormatada,
        modelo: modeloFormatado,
        marcaModelo: marcaModeloCompleto,
        label: `${placaLimpa} - ${marcaModeloCompleto} (${
          formData.ano || 'N/D'
        } - ${formData.cor || 'N/D'})`,
        ano: formData.ano?.trim() || '',
        cor: formData.cor?.trim() || '',
        combustivel: formData.combustivel || 'FLEX',
        kmPadrao: formData.kmPadrao?.trim() || '',
        chassi: formData.chassi?.trim().toUpperCase() || '',
        renavam: formData.renavam?.trim() || '',
        observacoes: formData.observacoes?.trim() || '',
        ativo: Boolean(formData.ativo),
      }

      const clienteOriginalId = veiculoParaEditar?.clienteId || null
      onSalvar(payload, clienteOriginalId)
      if (onClose) onClose()
      return true
    },
    [formData, veiculoParaEditar, onSalvar, onClose]
  )

  const confirmarExclusao = useCallback(() => {
    if (onExcluir && veiculoParaEditar) {
      onExcluir(veiculoParaEditar)
      setConfirmandoExclusao(false)
    }
  }, [onExcluir, veiculoParaEditar])

  return {
    formData,
    alterar,
    toggleAtivo,
    clientes,
    opcoesClientes,
    clienteSelecionado,
    selecionarCliente,
    marcasFipe,
    carregandoMarcas,
    modelosFipe,
    carregandoModelos,
    anosFipe,
    carregandoAnos,
    selecionarMarca,
    selecionarModelo,
    selecionarAno,
    salvar,
    confirmandoExclusao,
    setConfirmandoExclusao,
    confirmarExclusao,
  }
}
