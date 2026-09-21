import React, { useState, useEffect, useMemo, useRef } from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import {
  User,
  FloppyDisk,
  Phone,
  EnvelopeSimple,
  MapPin,
  Car,
  Plus,
  Trash,
  CheckCircle,
  WarningCircle,
  MagnifyingGlass,
  CircleNotch,
  IdentificationCard,
  Notebook,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { ModalConfirmacao } from '../ModalConfirmacao'
import { customSelectStyles } from '../suprimentos/customSelectStyles'
import { ESTADOS_BRASIL_OPCOES } from '../../constants/cadastrosSuprimentosData'
import {
  gerarProximoCodigoCliente,
  gerarProximoCodigoVeiculo,
} from '../../constants/mockClientesVeiculos'
import { consultarCepApi } from '../../services/cepService'
import {
  buscarMarcasFipe,
  buscarModelosFipe,
  buscarAnosFipe,
  normalizarCombustivelFipe,
  extrairAnoFipe,
} from '../../services/fipeService'
import {
  validarCPF,
  formatarCPF,
  validarCNPJ,
  formatarCNPJ,
  formatarCEP,
  formatarTelefone,
} from '../../utils/fiscalValidators'
import { IMaskInput } from 'react-imask'

const customSelectStylesCompact = {
  ...customSelectStyles,
  control: (base, state) => ({
    ...customSelectStyles.control(base, state),
    minHeight: '36px',
    height: '36px',
    borderRadius: '6px',
    fontSize: '12px',
    backgroundColor: '#ffffff',
  }),
  valueContainer: (base) => ({
    ...customSelectStyles.valueContainer(base),
    height: '36px',
    padding: '0 8px',
  }),
  indicatorsContainer: (base) => ({
    ...customSelectStyles.indicatorsContainer(base),
    height: '36px',
  }),
  dropdownIndicator: (base) => ({
    ...customSelectStyles.dropdownIndicator(base),
    padding: '2px 4px',
  }),
}

const customSelectStylesUF = {
  ...customSelectStyles,
  control: (base, state) => ({
    ...customSelectStyles.control(base, state),
    minHeight: '38px',
    height: '38px',
    borderRadius: '6px',
    fontSize: '13px',
    backgroundColor: '#ffffff',
  }),
  valueContainer: (base) => ({
    ...customSelectStyles.valueContainer(base),
    height: '38px',
    padding: '0 8px',
  }),
  indicatorsContainer: (base) => ({
    ...customSelectStyles.indicatorsContainer(base),
    height: '38px',
  }),
  dropdownIndicator: (base) => ({
    ...customSelectStyles.dropdownIndicator(base),
    padding: '2px 4px',
  }),
}

const COMBUSTIVEL_OPCOES = [
  { value: 'FLEX', label: 'Flex (Álcool e Gasolina)' },
  { value: 'GASOLINA', label: 'Gasolina' },
  { value: 'ETANOL', label: 'Etanol / Álcool' },
  { value: 'DIESEL', label: 'Diesel S10 / S500' },
  { value: 'HIBRIDO', label: 'Híbrido' },
  { value: 'ELETRICO', label: 'Elétrico' },
  { value: 'GNV', label: 'GNV (Gás Natural Veicular)' },
]

const FORM_INICIAL = {
  codigoCliente: '',
  tipoPessoa: 'F', // 'F' para Física (CPF) ou 'J' para Jurídica (CNPJ)
  nome: '',
  nomeFantasia: '',
  documento: '',
  rgIe: '',
  telefone: '',
  telefoneFixo: '',
  email: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: 'Apucarana',
  uf: 'PR',
  observacoes: '',
  ativo: true,
  veiculos: [],
}

const NOVO_VEICULO_INICIAL = {
  codigoVeiculo: '',
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
}

export function ClienteModalForm({ isOpen, onClose, onSalvar, clienteParaEditar }) {
  const [formData, setFormData] = useState(FORM_INICIAL)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false)
  const numeroInputRef = useRef(null)

  // Estado para adicionar novo veículo
  const [novoVeiculo, setNovoVeiculo] = useState(NOVO_VEICULO_INICIAL)
  const [adicionandoVeiculo, setAdicionandoVeiculo] = useState(false)

  // Estados de integração com a Tabela FIPE (Sem preços, apenas dados técnicos)
  const [marcasFipe, setMarcasFipe] = useState([])
  const [carregandoMarcas, setCarregandoMarcas] = useState(false)
  const [modelosFipe, setModelosFipe] = useState([])
  const [carregandoModelos, setCarregandoModelos] = useState(false)
  const [anosFipe, setAnosFipe] = useState([])
  const [carregandoAnos, setCarregandoAnos] = useState(false)
  const [filtroVeiculosFrota, setFiltroVeiculosFrota] = useState('')

  const veiculosExibidos = useMemo(() => {
    const lista = formData.veiculos || []
    const termo = filtroVeiculosFrota.trim().toLowerCase()
    if (!termo) return lista

    return lista.filter((v) => {
      const placa = (v.placa || '').toLowerCase()
      const marca = (v.marca || '').toLowerCase()
      const modelo = (v.modelo || '').toLowerCase()
      const marcaModelo = (v.marcaModelo || '').toLowerCase()
      return (
        placa.includes(termo) ||
        marca.includes(termo) ||
        modelo.includes(termo) ||
        marcaModelo.includes(termo)
      )
    })
  }, [formData.veiculos, filtroVeiculosFrota])

  // Carrega as marcas da FIPE ao abrir o formulário de inclusão de veículo
  useEffect(() => {
    if (adicionandoVeiculo && marcasFipe.length === 0) {
      setCarregandoMarcas(true)
      buscarMarcasFipe()
        .then((lista) => {
          setMarcasFipe(lista)
        })
        .catch(() => {
          toast.error('Não foi possível carregar as marcas da Tabela FIPE.')
        })
        .finally(() => {
          setCarregandoMarcas(false)
        })
    }
  }, [adicionandoVeiculo, marcasFipe.length])

  // Handler de seleção de Marca na FIPE
  const handleSelecionarMarca = async (opcao) => {
    if (!opcao) {
      setNovoVeiculo((prev) => ({
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

    setNovoVeiculo((prev) => ({
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
      try {
        setCarregandoModelos(true)
        const listaModelos = await buscarModelosFipe(marcaCod)
        setModelosFipe(listaModelos)
      } catch {
        toast.error('Falha ao carregar modelos da marca na Tabela FIPE.')
      } finally {
        setCarregandoModelos(false)
      }
    }
  }

  // Handler de seleção de Modelo na FIPE
  const handleSelecionarModelo = async (opcao) => {
    if (!opcao) {
      setNovoVeiculo((prev) => ({
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

    setNovoVeiculo((prev) => ({
      ...prev,
      modelo: modeloNome,
      modeloCodigo: modeloCod,
      ano: '',
      anoCodigo: '',
    }))
    setAnosFipe([])

    if (novoVeiculo.marcaCodigo && modeloCod) {
      try {
        setCarregandoAnos(true)
        const listaAnos = await buscarAnosFipe(novoVeiculo.marcaCodigo, modeloCod)
        setAnosFipe(listaAnos)
      } catch {
        // silencioso
      } finally {
        setCarregandoAnos(false)
      }
    }
  }

  // Handler de seleção de Ano e Combustível na FIPE
  const handleSelecionarAno = (opcao) => {
    if (!opcao) {
      setNovoVeiculo((prev) => ({ ...prev, ano: '', anoCodigo: '' }))
      return
    }

    const anoSelecionado = opcao.ano || extrairAnoFipe(opcao.label) || opcao.value || ''
    const combustivelDetectado = opcao.combustivel || normalizarCombustivelFipe(opcao.label)

    setNovoVeiculo((prev) => ({
      ...prev,
      ano: anoSelecionado,
      anoCodigo: opcao.value || '',
      combustivel: combustivelDetectado || prev.combustivel,
    }))

    if (combustivelDetectado) {
      toast.info(`FIPE: Ano ${anoSelecionado} e Combustível ${combustivelDetectado} identificados.`)
    }
  }

  useEffect(() => {
    if (clienteParaEditar) {
      setFormData({
        ...clienteParaEditar,
        codigoCliente: clienteParaEditar.codigoCliente || gerarProximoCodigoCliente(),
        tipoPessoa: clienteParaEditar.tipoPessoa || (clienteParaEditar.documento?.length > 14 ? 'J' : 'F'),
        nome: clienteParaEditar.nome || '',
        nomeFantasia: clienteParaEditar.nomeFantasia || '',
        documento: clienteParaEditar.documento || '',
        rgIe: clienteParaEditar.rgIe || '',
        telefone: formatarTelefone(clienteParaEditar.telefone || ''),
        telefoneFixo: formatarTelefone(clienteParaEditar.telefoneFixo || ''),
        email: clienteParaEditar.email || '',
        cep: formatarCEP(clienteParaEditar.cep || ''),
        logradouro: clienteParaEditar.logradouro || '',
        numero: clienteParaEditar.numero || '',
        complemento: clienteParaEditar.complemento || '',
        bairro: clienteParaEditar.bairro || '',
        cidade: clienteParaEditar.cidade || 'Apucarana',
        uf: clienteParaEditar.uf || 'PR',
        observacoes: clienteParaEditar.observacoes || '',
        ativo: clienteParaEditar.ativo !== false,
        veiculos: Array.isArray(clienteParaEditar.veiculos) ? [...clienteParaEditar.veiculos] : [],
      })
    } else {
      setFormData({
        ...FORM_INICIAL,
        codigoCliente: gerarProximoCodigoCliente(),
      })
    }
    setNovoVeiculo(NOVO_VEICULO_INICIAL)
    setAdicionandoVeiculo(false)
  }, [clienteParaEditar, isOpen])

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }))
  }

  // Validação do Documento em tempo real
  const documentoValido = useMemo(() => {
    if (!formData.documento) return false
    if (formData.tipoPessoa === 'F') {
      return validarCPF(formData.documento)
    }
    return validarCNPJ(formData.documento)
  }, [formData.documento, formData.tipoPessoa])

  // Busca de CEP via API integrada com retorno e preenchimento automático
  const buscarEnderecoPorCep = async (cepOpcional) => {
    const cepParaConsultar = cepOpcional || formData.cep
    const cepLimpo = (cepParaConsultar || '').replace(/\D/g, '')
    if (cepLimpo.length !== 8) {
      if (!cepOpcional) {
        toast.warning('Informe um CEP válido com 8 dígitos.')
      }
      return
    }

    try {
      setBuscandoCep(true)
      const dados = await consultarCepApi(cepLimpo)

      setFormData((prev) => ({
        ...prev,
        logradouro: dados.logradouro || prev.logradouro,
        bairro: dados.bairro || prev.bairro,
        cidade: dados.cidade || prev.cidade,
        uf: dados.uf || prev.uf,
      }))
      toast.success('Endereço completado automaticamente via CEP!')
      setTimeout(() => {
        numeroInputRef.current?.focus()
      }, 100)
    } catch (err) {
      toast.error(err.message || 'Falha ao consultar o CEP. Preencha manualmente.')
    } finally {
      setBuscandoCep(false)
    }
  }

  // Adicionar veículo à lista do cliente com marca e modelo separados
  const handleAbrirAdicionarVeiculo = () => {
    const proxCodigo = gerarProximoCodigoVeiculo(formData.veiculos)
    setNovoVeiculo({
      ...NOVO_VEICULO_INICIAL,
      codigoVeiculo: proxCodigo,
    })
    setAdicionandoVeiculo(true)
  }

  // Adicionar novo veículo à lista local do cliente
  const handleAdicionarVeiculo = () => {
    if (!novoVeiculo.placa?.trim()) {
      toast.warning('Informe a placa do veículo.')
      return
    }
    if (!novoVeiculo.marca?.trim()) {
      toast.warning('Selecione ou informe a marca do veículo.')
      return
    }
    if (!novoVeiculo.modelo?.trim()) {
      toast.warning('Selecione ou informe o modelo do veículo.')
      return
    }

    const placaFormatada = novoVeiculo.placa.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
    const marcaFormatada = novoVeiculo.marca.trim()
    const modeloFormatado = novoVeiculo.modelo.trim()
    const marcaModeloCompleto = `${marcaFormatada} ${modeloFormatado}`.trim()
    const codigoFinal =
      novoVeiculo.codigoVeiculo || gerarProximoCodigoVeiculo(formData.veiculos)

    const veiculoItem = {
      value: `veic-${Date.now()}`,
      id: `veic-${Date.now()}`,
      codigoVeiculo: codigoFinal,
      label: `${placaFormatada} - ${marcaModeloCompleto} (${novoVeiculo.ano || 'N/D'} - ${novoVeiculo.cor || 'N/D'})`,
      placa: placaFormatada,
      marca: marcaFormatada,
      modelo: modeloFormatado,
      marcaModelo: marcaModeloCompleto,
      ano: novoVeiculo.ano?.trim() || '',
      cor: novoVeiculo.cor?.trim() || '',
      combustivel: novoVeiculo.combustivel || 'FLEX',
      kmPadrao: novoVeiculo.kmPadrao?.trim() || '',
    }

    setFormData((prev) => ({
      ...prev,
      veiculos: [...prev.veiculos, veiculoItem],
    }))

    setNovoVeiculo(NOVO_VEICULO_INICIAL)
    setModelosFipe([])
    setAnosFipe([])
    setAdicionandoVeiculo(false)
    toast.success('Veículo incluído com sucesso!')
  }

  // Remover veículo da lista do cliente
  const handleRemoverVeiculo = (index) => {
    setFormData((prev) => ({
      ...prev,
      veiculos: prev.veiculos.filter((_, idx) => idx !== index),
    }))
    toast.info('Veículo removido da lista.')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.nome?.trim()) {
      toast.warning('O nome do cliente é obrigatório.')
      return
    }
    if (!formData.documento?.trim()) {
      toast.warning(`Informe o ${formData.tipoPessoa === 'F' ? 'CPF' : 'CNPJ'} do cliente.`)
      return
    }
    if (!documentoValido) {
      toast.error(`${formData.tipoPessoa === 'F' ? 'CPF' : 'CNPJ'} inválido. Verifique os dígitos informados.`)
      return
    }
    if (!formData.telefone?.trim()) {
      toast.warning('Informe o telefone celular ou WhatsApp para contato.')
      return
    }

    const codigoFinal = formData.codigoCliente || gerarProximoCodigoCliente()

    const payload = {
      ...formData,
      codigoCliente: codigoFinal,
      value: clienteParaEditar?.value || `cli-${Date.now()}`,
      id: clienteParaEditar?.id || `cli-${Date.now()}`,
      label: `${codigoFinal ? `${codigoFinal} - ` : ''}${formData.nome.trim()} - ${formData.telefone.trim()}`,
      nome: formData.nome.trim(),
      nomeFantasia: formData.nomeFantasia?.trim() || formData.nome.trim(),
      documento: formData.documento.trim(),
      rgIe: formData.rgIe?.trim() || '',
      telefone: formData.telefone.trim(),
      telefoneFixo: formData.telefoneFixo?.trim() || '',
      email: formData.email?.trim() || '',
      cep: formData.cep?.trim() || '',
      logradouro: formData.logradouro?.trim() || '',
      numero: formData.numero?.trim() || '',
      complemento: formData.complemento?.trim() || '',
      bairro: formData.bairro?.trim() || '',
      cidade: formData.cidade?.trim() || '',
      uf: formData.uf || 'PR',
      endereco: `${formData.logradouro || ''}, ${formData.numero || 'S/N'}${formData.complemento ? ` (${formData.complemento})` : ''} - ${formData.bairro || ''}, ${formData.cidade || ''} - ${formData.uf || ''}`.trim(),
      observacoes: formData.observacoes?.trim() || '',
      ativo: Boolean(formData.ativo),
      veiculos: formData.veiculos || [],
    }

    onSalvar(payload)
    onClose()
  }

  const handleCancelar = () => {
    const temDados = Boolean(
      formData.nome?.trim() ||
      formData.documento?.trim() ||
      formData.telefone?.trim() ||
      (formData.veiculos && formData.veiculos.length > 0)
    )
    if (temDados) {
      setConfirmandoDescarte(true)
    } else {
      onClose()
    }
  }

  const confirmarDescarte = () => {
    setConfirmandoDescarte(false)
    toast.info('Alterações descartadas.')
    onClose()
  }

  const ufSelecionada = ESTADOS_BRASIL_OPCOES.find((opt) => opt.value === formData.uf) || null

  return (
    <>
      <ModalRedimensionavel
        isOpen={isOpen}
        onClose={handleCancelar}
      titulo={clienteParaEditar ? 'Editar Cadastro de Cliente' : 'Novo Cadastro de Cliente'}
      subtitulo="Dados cadastrais completos, contato, endereço e gestão de veículos vinculados"
      icone={User}
      larguraPadrao={880}
      alturaPadrao={740}
      larguraMinima={640}
      alturaMinima={480}
      larguraMaxima={1360}
      alturaMaxima={940}
      storageKey="cliente_modal"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identificação e Tipo de Pessoa */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <IdentificationCard size={16} className="text-sky-600" />
              <span>Identificação e Tipo de Pessoa</span>
            </div>
            <div className="flex items-center gap-1 bg-white border border-slate-300 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  handleChange('tipoPessoa', 'F')
                  handleChange('documento', '')
                }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  formData.tipoPessoa === 'F'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pessoa Física (CPF)
              </button>
              <button
                type="button"
                onClick={() => {
                  handleChange('tipoPessoa', 'J')
                  handleChange('documento', '')
                }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  formData.tipoPessoa === 'J'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pessoa Jurídica (CNPJ)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  Código do Cliente
                </label>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                  Automático
                </span>
              </div>
              <input
                type="text"
                value={formData.codigoCliente}
                readOnly
                placeholder="0000166"
                title="Código gerado automaticamente pelo sistema"
                className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-300 rounded-md font-mono font-bold text-slate-700 select-none cursor-not-allowed outline-none mt-auto"
              />
            </div>

            <div className="md:col-span-6 flex flex-col">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {formData.tipoPessoa === 'F' ? 'Nome Completo do Cliente' : 'Razão Social da Empresa'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder={formData.tipoPessoa === 'F' ? 'Ex: Carlos Alberto da Silva' : 'Ex: Transportes e Logística Silva Ltda'}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-medium mt-auto"
              />
            </div>

            <div className="md:col-span-3 flex flex-col">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {formData.tipoPessoa === 'F' ? 'Apelido / Como Chamar' : 'Nome Fantasia'}
              </label>
              <input
                type="text"
                value={formData.nomeFantasia}
                onChange={(e) => handleChange('nomeFantasia', e.target.value)}
                placeholder={formData.tipoPessoa === 'F' ? 'Ex: Beto' : 'Ex: Silva Transportes'}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none mt-auto"
              />
            </div>

            <div className="md:col-span-4 flex flex-col">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {formData.tipoPessoa === 'F' ? 'CPF' : 'CNPJ'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-auto">
                <IMaskInput
                  mask={formData.tipoPessoa === 'F' ? '000.000.000-00' : '00.000.000/0000-00'}
                  value={formData.documento}
                  onAccept={(val) => handleChange('documento', val)}
                  placeholder={formData.tipoPessoa === 'F' ? '000.000.000-00' : '00.000.000/0000-00'}
                  required
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono ${
                    documentoValido ? 'border-sky-500' : 'border-slate-300'
                  }`}
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  {documentoValido ? (
                    <CheckCircle size={16} className="text-sky-600" weight="fill" />
                  ) : formData.documento.length >= (formData.tipoPessoa === 'F' ? 11 : 14) ? (
                    <WarningCircle size={16} className="text-rose-500" weight="fill" />
                  ) : null}
                </div>
              </div>
              <span className="block text-[11px] text-slate-500 mt-1">
                {documentoValido
                  ? `${formData.tipoPessoa === 'F' ? 'CPF' : 'CNPJ'} validado oficialmente`
                  : `Informe o ${formData.tipoPessoa === 'F' ? 'CPF com 11 dígitos' : 'CNPJ com 14 dígitos'}`}
              </span>
            </div>

            <div className="md:col-span-4 flex flex-col">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {formData.tipoPessoa === 'F' ? 'RG (Registro Geral)' : 'Inscrição Estadual (IE)'}
              </label>
              <input
                type="text"
                value={formData.rgIe}
                onChange={(e) => handleChange('rgIe', e.target.value.toUpperCase())}
                placeholder={formData.tipoPessoa === 'F' ? 'Ex: 12.345.678-9' : 'Ex: 987654321 ou ISENTO'}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono mt-auto"
              />
              <span className="block h-[19px]"></span>
            </div>

            <div className="md:col-span-4 flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => handleChange('ativo', e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-700">Cliente Ativo para Ordens de Serviço</span>
              </label>
            </div>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <Phone size={16} className="text-sky-600" />
            <span>Dados de Contato e Comunicação</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Celular ou WhatsApp <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-auto">
                <IMaskInput
                  mask="(00) 00000-0000"
                  value={formData.telefone}
                  onAccept={(val) => handleChange('telefone', val)}
                  placeholder="(43) 99999-9999"
                  required
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono font-medium"
                />
                <Phone size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <span className="block text-[11px] text-slate-500 mt-1">Usado para envio de orçamento e WhatsApp</span>
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Telefone Fixo / Recado
              </label>
              <div className="relative mt-auto">
                <IMaskInput
                  mask="(00) 0000-0000"
                  value={formData.telefoneFixo}
                  onAccept={(val) => handleChange('telefoneFixo', val)}
                  placeholder="(43) 3333-3333"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono"
                />
                <Phone size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <span className="block h-[19px]"></span>
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                E-mail do Cliente
              </label>
              <div className="relative mt-auto">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
                />
                <EnvelopeSimple size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <span className="block text-[11px] text-slate-500 mt-1">Para envio de notas fiscais e laudo</span>
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <MapPin size={16} className="text-sky-600" />
              <span>Endereço Residencial ou Comercial</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Usado para faturamento e ordens de serviço</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3 flex flex-col">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                CEP
              </label>
              <div className="relative flex items-center mt-auto">
                <IMaskInput
                  mask="00000-000"
                  value={formData.cep}
                  onAccept={(val) => {
                    handleChange('cep', val)
                    const limpo = val.replace(/\D/g, '')
                    if (limpo.length === 8) {
                      buscarEnderecoPorCep(val)
                    }
                  }}
                  onBlur={() => {
                    const limpo = (formData.cep || '').replace(/\D/g, '')
                    if (limpo.length === 8) {
                      buscarEnderecoPorCep(formData.cep)
                    }
                  }}
                  placeholder="00000-000"
                  className="w-full pr-8 pl-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => buscarEnderecoPorCep(formData.cep)}
                  disabled={buscandoCep}
                  title="Consultar CEP e preencher endereço"
                  className="absolute right-2 text-slate-400 hover:text-sky-600 disabled:text-slate-300 transition-colors p-1 cursor-pointer"
                >
                  {buscandoCep ? (
                    <CircleNotch size={15} className="animate-spin text-sky-600" />
                  ) : (
                    <MagnifyingGlass size={15} />
                  )}
                </button>
              </div>
            </div>

            <div className="md:col-span-7 flex flex-col">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Logradouro (Rua, Avenida)
              </label>
              <input
                type="text"
                value={formData.logradouro}
                onChange={(e) => handleChange('logradouro', e.target.value)}
                placeholder="Rua das Flores, Avenida Central..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none mt-auto"
              />
            </div>

            <div className="md:col-span-2 flex flex-col">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Número
              </label>
              <input
                ref={numeroInputRef}
                type="text"
                value={formData.numero}
                onChange={(e) => handleChange('numero', e.target.value)}
                placeholder="Nº ou S/N"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-medium mt-auto"
              />
            </div>

            <div className="md:col-span-3 flex flex-col">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Complemento
              </label>
              <input
                type="text"
                value={formData.complemento}
                onChange={(e) => handleChange('complemento', e.target.value)}
                placeholder="Apto, Casa, Bloco..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none mt-auto"
              />
            </div>

            <div className="md:col-span-4 flex flex-col">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Bairro
              </label>
              <input
                type="text"
                value={formData.bairro}
                onChange={(e) => handleChange('bairro', e.target.value)}
                placeholder="Bairro"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none mt-auto"
              />
            </div>

            <div className="md:col-span-3 flex flex-col">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
                placeholder="Apucarana"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none mt-auto"
              />
            </div>

            <div className="md:col-span-2 flex flex-col">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                UF
              </label>
              <div className="mt-auto">
                <Select
                  value={ufSelecionada}
                  onChange={(opt) => handleChange('uf', opt ? opt.value : 'PR')}
                  options={ESTADOS_BRASIL_OPCOES}
                  styles={customSelectStylesUF}
                  placeholder="UF"
                  isSearchable
                />
              </div>
            </div>
          </div>
        </div>

        {/* Gestão de Veículos Vinculados */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <Car size={16} className="text-sky-600" />
              <span>Veículos Vinculados ({formData.veiculos.length})</span>
            </div>
            {!adicionandoVeiculo && (
              <button
                type="button"
                onClick={handleAbrirAdicionarVeiculo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={14} weight="bold" />
                <span>Incluir Veículo</span>
              </button>
            )}
          </div>

          {/* Mini-Formulário para inclusão de veículo */}
          {adicionandoVeiculo && (
            <div className="bg-white border border-sky-200 rounded-lg p-3.5 space-y-3 shadow-xs">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2 text-sky-700">
                  <Car size={15} weight="bold" />
                  <span>Novo Veículo para o Cliente</span>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    Tabela FIPE Integrada
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAdicionandoVeiculo(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                {/* Código do Veículo (Automático e Separado) */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Código Veículo
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={novoVeiculo.codigoVeiculo || ''}
                      readOnly
                      tabIndex={-1}
                      className="w-full h-9 px-2 text-xs bg-slate-100 border border-slate-300 rounded-md text-slate-600 font-mono font-bold cursor-not-allowed select-none"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-sky-600 bg-sky-50 px-1 py-0.2 rounded border border-sky-200">
                      AUTO
                    </span>
                  </div>
                </div>

                {/* Placa com máscara Mercosul e Antiga */}
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Placa <span className="text-rose-500">*</span>
                  </label>
                  <IMaskInput
                    mask={[
                      { mask: 'aaa0a00' },
                      { mask: 'aaa-0000' },
                    ]}
                    prepareChar={(str) => str.toUpperCase()}
                    definitions={{
                      'a': /[A-Za-z]/,
                      '0': /[0-9]/,
                    }}
                    value={novoVeiculo.placa}
                    onAccept={(val) =>
                      setNovoVeiculo((prev) => ({
                        ...prev,
                        placa: val.toUpperCase(),
                      }))
                    }
                    placeholder="ABC1D23"
                    className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono uppercase font-bold text-slate-900"
                  />
                </div>

                {/* Marca (Separada de Modelo) via FIPE */}
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Marca (FIPE) <span className="text-rose-500">*</span>
                  </label>
                  <CreatableSelect
                    value={
                      marcasFipe.find(
                        (m) =>
                          m.value === novoVeiculo.marcaCodigo ||
                          m.label.toLowerCase() === (novoVeiculo.marca || '').toLowerCase()
                      ) ||
                      (novoVeiculo.marca
                        ? { value: novoVeiculo.marca, label: novoVeiculo.marca }
                        : null)
                    }
                    onChange={handleSelecionarMarca}
                    options={marcasFipe}
                    isLoading={carregandoMarcas}
                    styles={customSelectStylesCompact}
                    placeholder={carregandoMarcas ? 'Buscando marcas...' : 'Selecione a marca...'}
                    isSearchable
                    isClearable
                    noOptionsMessage={() =>
                      carregandoMarcas ? 'Carregando FIPE...' : 'Nenhuma marca encontrada'
                    }
                    formatCreateLabel={(val) => `Usar: "${val}"`}
                  />
                </div>

                {/* Modelo (Separado de Marca) via FIPE */}
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Modelo (FIPE) <span className="text-rose-500">*</span>
                  </label>
                  <CreatableSelect
                    value={
                      modelosFipe.find(
                        (m) =>
                          m.value === novoVeiculo.modeloCodigo ||
                          m.label.toLowerCase() === (novoVeiculo.modelo || '').toLowerCase()
                      ) ||
                      (novoVeiculo.modelo
                        ? { value: novoVeiculo.modelo, label: novoVeiculo.modelo }
                        : null)
                    }
                    onChange={handleSelecionarModelo}
                    options={modelosFipe}
                    isLoading={carregandoModelos}
                    isDisabled={!novoVeiculo.marca || carregandoModelos}
                    styles={customSelectStylesCompact}
                    placeholder={
                      !novoVeiculo.marca
                        ? 'Selecione a marca primeiro...'
                        : carregandoModelos
                        ? 'Carregando modelos FIPE...'
                        : 'Selecione o modelo...'
                    }
                    isSearchable
                    isClearable
                    noOptionsMessage={() =>
                      !novoVeiculo.marca
                        ? 'Selecione a marca primeiro'
                        : carregandoModelos
                        ? 'Carregando FIPE...'
                        : 'Nenhum modelo encontrado'
                    }
                    formatCreateLabel={(val) => `Usar: "${val}"`}
                  />
                </div>

                {/* Ano / Versão FIPE */}
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Ano / Mod.{' '}
                    {anosFipe.length > 0 && (
                      <span className="text-[10px] text-sky-600 font-semibold">(FIPE)</span>
                    )}
                  </label>
                  {anosFipe.length > 0 ? (
                    <CreatableSelect
                      value={
                        anosFipe.find(
                          (a) =>
                            a.value === novoVeiculo.anoCodigo ||
                            a.ano === novoVeiculo.ano ||
                            a.label.includes(novoVeiculo.ano)
                        ) ||
                        (novoVeiculo.ano
                          ? { value: novoVeiculo.ano, label: novoVeiculo.ano }
                          : null)
                      }
                      onChange={handleSelecionarAno}
                      options={anosFipe}
                      isLoading={carregandoAnos}
                      styles={customSelectStylesCompact}
                      placeholder="Ano FIPE..."
                      isSearchable
                      isClearable
                      formatCreateLabel={(val) => `Ano: "${val}"`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={novoVeiculo.ano}
                      onChange={(e) =>
                        setNovoVeiculo((prev) => ({
                          ...prev,
                          ano: e.target.value,
                        }))
                      }
                      placeholder="2021/2022"
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono"
                    />
                  )}
                </div>

                {/* Cor */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Cor
                  </label>
                  <input
                    type="text"
                    value={novoVeiculo.cor}
                    onChange={(e) =>
                      setNovoVeiculo((prev) => ({
                        ...prev,
                        cor: e.target.value,
                      }))
                    }
                    placeholder="Branca"
                    className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

                {/* Combustível */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Combustível
                  </label>
                  <Select
                    value={COMBUSTIVEL_OPCOES.find(
                      (opt) => opt.value === novoVeiculo.combustivel
                    )}
                    onChange={(opt) =>
                      setNovoVeiculo((prev) => ({
                        ...prev,
                        combustivel: opt ? opt.value : 'FLEX',
                      }))
                    }
                    options={COMBUSTIVEL_OPCOES}
                    styles={customSelectStylesCompact}
                    placeholder="Combustível"
                    isSearchable={false}
                  />
                </div>

                {/* Quilometragem (KM) */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    KM
                  </label>
                  <input
                    type="text"
                    value={novoVeiculo.kmPadrao}
                    onChange={(e) =>
                      setNovoVeiculo((prev) => ({
                        ...prev,
                        kmPadrao: e.target.value,
                      }))
                    }
                    placeholder="280.812"
                    className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono"
                  />
                </div>

                {/* Botão Incluir Veículo */}
                <div className="sm:col-span-3 flex flex-col justify-end">
                  <label className="block text-[11px] font-medium text-transparent mb-1 select-none pointer-events-none">
                    Ação
                  </label>
                  <button
                    type="button"
                    onClick={handleAdicionarVeiculo}
                    className="w-full h-9 px-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={15} weight="bold" />
                    <span>Incluir Veículo</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de veículos cadastrados */}
          {formData.veiculos.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-slate-300 rounded-lg bg-white">
              <Car size={24} className="mx-auto text-slate-400 mb-1" />
              <p className="text-xs text-slate-500">
                Nenhum veículo vinculado a este cliente ainda. Clique em "Incluir Veículo" acima.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Barra de pesquisa rápida para frotistas (3 ou mais veículos) */}
              {formData.veiculos.length >= 3 && (
                <div className="relative">
                  <MagnifyingGlass
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={filtroVeiculosFrota}
                    onChange={(e) => setFiltroVeiculosFrota(e.target.value)}
                    placeholder="Filtrar veículos da frota por placa, marca ou modelo..."
                    className="w-full h-7.5 pl-8 pr-3 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 outline-none placeholder:text-slate-400"
                  />
                </div>
              )}

              {/* Tabela vertical de veículos vinculados */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-56 overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                      <th className="py-2 px-3">Código</th>
                      <th className="py-2 px-3">Placa</th>
                      <th className="py-2 px-3">Marca e Modelo</th>
                      <th className="py-2 px-3">Ano / Mod.</th>
                      <th className="py-2 px-3">Cor</th>
                      <th className="py-2 px-3">Combustível</th>
                      <th className="py-2 px-3">KM Padrão</th>
                      <th className="py-2 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {veiculosExibidos.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-4 text-center text-xs text-slate-400 italic">
                          Nenhum veículo encontrado com o filtro "{filtroVeiculosFrota}".
                        </td>
                      </tr>
                    ) : (
                      veiculosExibidos.map((v, index) => {
                        const idxOriginal = formData.veiculos.findIndex(
                          (item) => item === v || (item.placa === v.placa && item.placa)
                        )
                        const idxRemover = idxOriginal !== -1 ? idxOriginal : index

                        return (
                          <tr
                            key={v.value || v.placa || index}
                            className="hover:bg-slate-50/70 transition-colors group"
                          >
                            <td className="py-2 px-3">
                              <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {v.codigoVeiculo || '—'}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {v.placa}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-semibold text-slate-800">
                                {v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim()}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-600">
                              {v.ano || '—'}
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {v.cor || '—'}
                            </td>
                            <td className="py-2 px-3">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                                {v.combustivel || 'FLEX'}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-600">
                              {v.kmPadrao ? `${v.kmPadrao} km` : '—'}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoverVeiculo(idxRemover)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Remover veículo"
                              >
                                <Trash size={14} />
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Observações Gerais */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <Notebook size={16} className="text-sky-600" />
            <span>Observações e Histórico do Cliente</span>
          </div>
          <textarea
            value={formData.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            rows={2}
            placeholder="Preferências de contato, frotista com faturamento quinzenal, etc..."
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        {/* Rodapé com botão único de confirmação (Regra 12) */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={handleCancelar}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md shadow-sm transition-colors cursor-pointer"
          >
            <FloppyDisk size={16} />
            <span>Salvar Cliente</span>
          </button>
        </div>
      </form>
    </ModalRedimensionavel>

    {/* Diálogo de Confirmação de Cancelamento na Frente do Formulário */}
    <ModalConfirmacao
      isOpen={confirmandoDescarte}
      onClose={() => setConfirmandoDescarte(false)}
      onConfirm={confirmarDescarte}
      titulo="Descartar alterações do cliente?"
      descricao="Os dados preenchidos deste cadastro não foram salvos e serão perdidos. Deseja realmente sair?"
      itemDestaque={formData.nome ? `Cliente: ${formData.nome}` : ''}
      textoConfirmar="Sim, Descartar"
      textoCancelar="Continuar Preenchendo"
      variante="perigo"
    />
  </>
  )
}
