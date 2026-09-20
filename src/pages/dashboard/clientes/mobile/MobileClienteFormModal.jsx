import React, { useState, useEffect, useMemo, useRef } from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { IMaskInput } from 'react-imask'
import {
  X,
  User,
  Phone,
  MapPin,
  Car,
  Plus,
  Trash,
  CheckCircle,
  WarningCircle,
  MagnifyingGlass,
  CircleNotch,
  Notebook,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ESTADOS_BRASIL_OPCOES } from '../../../../constants/cadastrosSuprimentosData'
import { gerarProximoCodigoCliente, gerarProximoCodigoVeiculo } from '../../../../constants/mockClientesVeiculos'
import { consultarCepApi } from '../../../../services/cepService'
import {
  buscarMarcasFipe,
  buscarModelosFipe,
  buscarAnosFipe,
  normalizarCombustivelFipe,
  extrairAnoFipe,
} from '../../../../services/fipeService'
import { validarCPF, validarCNPJ, formatarCEP, formatarTelefone } from '../../../../utils/fiscalValidators'
import {
  mobileSelectStyles,
  inputBaseClass,
  textareaBaseClass,
  labelBaseClass,
} from '../../nova-os/mobile/mobileSelectStyles'

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
  tipoPessoa: 'F',
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

export function MobileClienteFormModal({ isOpen, onClose, onSalvar, onExcluir, clienteParaEditar }) {
  const [formData, setFormData] = useState(FORM_INICIAL)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const numeroInputRef = useRef(null)

  const [novoVeiculo, setNovoVeiculo] = useState(NOVO_VEICULO_INICIAL)
  const [adicionandoVeiculo, setAdicionandoVeiculo] = useState(false)

  const [marcasFipe, setMarcasFipe] = useState([])
  const [carregandoMarcas, setCarregandoMarcas] = useState(false)
  const [modelosFipe, setModelosFipe] = useState([])
  const [carregandoModelos, setCarregandoModelos] = useState(false)
  const [anosFipe, setAnosFipe] = useState([])
  const [carregandoAnos, setCarregandoAnos] = useState(false)

  useEffect(() => {
    if (adicionandoVeiculo && marcasFipe.length === 0) {
      setCarregandoMarcas(true)
      buscarMarcasFipe()
        .then((lista) => setMarcasFipe(lista))
        .catch(() => toast.error('Não foi possível carregar as marcas da Tabela FIPE.'))
        .finally(() => setCarregandoMarcas(false))
    }
  }, [adicionandoVeiculo, marcasFipe.length])

  useEffect(() => {
    if (!isOpen) return
    setConfirmandoExclusao(false)
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
      setFormData({ ...FORM_INICIAL, codigoCliente: gerarProximoCodigoCliente() })
    }
    setNovoVeiculo(NOVO_VEICULO_INICIAL)
    setAdicionandoVeiculo(false)
  }, [clienteParaEditar, isOpen])

  const handleChange = (campo, valor) => setFormData((prev) => ({ ...prev, [campo]: valor }))

  const documentoValido = useMemo(() => {
    if (!formData.documento) return false
    return formData.tipoPessoa === 'F' ? validarCPF(formData.documento) : validarCNPJ(formData.documento)
  }, [formData.documento, formData.tipoPessoa])

  const buscarEnderecoPorCep = async (cepOpcional) => {
    const cepParaConsultar = cepOpcional || formData.cep
    const cepLimpo = (cepParaConsultar || '').replace(/\D/g, '')
    if (cepLimpo.length !== 8) {
      if (!cepOpcional) toast.warning('Informe um CEP válido com 8 dígitos.')
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
      setTimeout(() => numeroInputRef.current?.focus(), 100)
    } catch (err) {
      toast.error(err.message || 'Falha ao consultar o CEP. Preencha manualmente.')
    } finally {
      setBuscandoCep(false)
    }
  }

  const handleSelecionarMarca = async (opcao) => {
    if (!opcao) {
      setNovoVeiculo((prev) => ({ ...prev, marca: '', marcaCodigo: '', modelo: '', modeloCodigo: '', ano: '', anoCodigo: '' }))
      setModelosFipe([])
      setAnosFipe([])
      return
    }
    const marcaNome = opcao.label || opcao.value
    const marcaCod = opcao.value !== opcao.label ? opcao.value : ''
    setNovoVeiculo((prev) => ({ ...prev, marca: marcaNome, marcaCodigo: marcaCod, modelo: '', modeloCodigo: '', ano: '', anoCodigo: '' }))
    setModelosFipe([])
    setAnosFipe([])
    if (marcaCod) {
      try {
        setCarregandoModelos(true)
        setModelosFipe(await buscarModelosFipe(marcaCod))
      } catch {
        toast.error('Falha ao carregar modelos da marca na Tabela FIPE.')
      } finally {
        setCarregandoModelos(false)
      }
    }
  }

  const handleSelecionarModelo = async (opcao) => {
    if (!opcao) {
      setNovoVeiculo((prev) => ({ ...prev, modelo: '', modeloCodigo: '', ano: '', anoCodigo: '' }))
      setAnosFipe([])
      return
    }
    const modeloNome = opcao.label || opcao.value
    const modeloCod = opcao.value !== opcao.label ? opcao.value : ''
    setNovoVeiculo((prev) => ({ ...prev, modelo: modeloNome, modeloCodigo: modeloCod, ano: '', anoCodigo: '' }))
    setAnosFipe([])
    if (novoVeiculo.marcaCodigo && modeloCod) {
      try {
        setCarregandoAnos(true)
        setAnosFipe(await buscarAnosFipe(novoVeiculo.marcaCodigo, modeloCod))
      } catch {
        // silencioso
      } finally {
        setCarregandoAnos(false)
      }
    }
  }

  const handleSelecionarAno = (opcao) => {
    if (!opcao) {
      setNovoVeiculo((prev) => ({ ...prev, ano: '', anoCodigo: '' }))
      return
    }
    const anoSelecionado = opcao.ano || extrairAnoFipe(opcao.label) || opcao.value || ''
    const combustivelDetectado = opcao.combustivel || normalizarCombustivelFipe(opcao.label)
    setNovoVeiculo((prev) => ({ ...prev, ano: anoSelecionado, anoCodigo: opcao.value || '', combustivel: combustivelDetectado || prev.combustivel }))
  }

  const handleAbrirAdicionarVeiculo = () => {
    setNovoVeiculo({ ...NOVO_VEICULO_INICIAL, codigoVeiculo: gerarProximoCodigoVeiculo(formData.veiculos) })
    setAdicionandoVeiculo(true)
  }

  const handleAdicionarVeiculo = () => {
    if (!novoVeiculo.placa?.trim()) return toast.warning('Informe a placa do veículo.')
    if (!novoVeiculo.marca?.trim()) return toast.warning('Selecione ou informe a marca do veículo.')
    if (!novoVeiculo.modelo?.trim()) return toast.warning('Selecione ou informe o modelo do veículo.')

    const placaFormatada = novoVeiculo.placa.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
    const marcaFormatada = novoVeiculo.marca.trim()
    const modeloFormatado = novoVeiculo.modelo.trim()
    const marcaModeloCompleto = `${marcaFormatada} ${modeloFormatado}`.trim()
    const codigoFinal = novoVeiculo.codigoVeiculo || gerarProximoCodigoVeiculo(formData.veiculos)

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

    setFormData((prev) => ({ ...prev, veiculos: [...prev.veiculos, veiculoItem] }))
    setNovoVeiculo(NOVO_VEICULO_INICIAL)
    setModelosFipe([])
    setAnosFipe([])
    setAdicionandoVeiculo(false)
    toast.success('Veículo incluído com sucesso!')
  }

  const handleRemoverVeiculo = (index) => {
    setFormData((prev) => ({ ...prev, veiculos: prev.veiculos.filter((_, idx) => idx !== index) }))
    toast.info('Veículo removido da lista.')
  }

  if (!isOpen) return null

  const handleSalvar = () => {
    if (!formData.nome?.trim()) return toast.warning('O nome do cliente é obrigatório.')
    if (!formData.documento?.trim()) return toast.warning(`Informe o ${formData.tipoPessoa === 'F' ? 'CPF' : 'CNPJ'} do cliente.`)
    if (!documentoValido) return toast.error(`${formData.tipoPessoa === 'F' ? 'CPF' : 'CNPJ'} inválido. Verifique os dígitos.`)
    if (!formData.telefone?.trim()) return toast.warning('Informe o telefone celular ou WhatsApp para contato.')

    const codigoFinal = formData.codigoCliente || gerarProximoCodigoCliente()

    onSalvar({
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
    })
  }

  const ufSelecionada = ESTADOS_BRASIL_OPCOES.find((o) => o.value === formData.uf) || null

  return (
    <div className="fixed inset-0 z-50 bg-[#eaecf0] flex flex-col">
      <header className="shrink-0 bg-white border-b border-[#e4e7ec]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="h-14 px-2 flex items-center justify-between gap-2">
          <button type="button" onClick={onClose} aria-label="Fechar" className="p-2.5 rounded-xl text-[#475467] active:bg-[#f2f4f7] shrink-0">
            <X size={20} weight="bold" />
          </button>
          <span className="text-sm font-extrabold text-[#101828] truncate">
            {clienteParaEditar ? 'Editar Cliente' : 'Novo Cliente'}
          </span>
          <div className="w-9 shrink-0" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-4">
        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
              <User size={14} weight="bold" className="text-[#0284c7]" />
              Identificação
            </h3>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ativo}
                onChange={(e) => handleChange('ativo', e.target.checked)}
                className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#0284c7] border-[#d0d5dd]"
              />
              <span className="text-[11px] font-bold text-[#344054]">Ativo</span>
            </label>
          </div>

          <div className="flex items-center bg-[#f2f4f7] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { handleChange('tipoPessoa', 'F'); handleChange('documento', '') }}
              className={`flex-1 h-9 rounded-lg text-xs font-bold ${formData.tipoPessoa === 'F' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'}`}
            >
              Pessoa Física (CPF)
            </button>
            <button
              type="button"
              onClick={() => { handleChange('tipoPessoa', 'J'); handleChange('documento', '') }}
              className={`flex-1 h-9 rounded-lg text-xs font-bold ${formData.tipoPessoa === 'J' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'}`}
            >
              Pessoa Jurídica (CNPJ)
            </button>
          </div>

          <div>
            <label className={labelBaseClass}>{formData.tipoPessoa === 'F' ? 'Nome Completo' : 'Razão Social'} *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder={formData.tipoPessoa === 'F' ? 'Ex: Carlos Alberto da Silva' : 'Ex: Transportes Silva Ltda'}
              className={inputBaseClass}
            />
          </div>

          <div>
            <label className={labelBaseClass}>{formData.tipoPessoa === 'F' ? 'Apelido' : 'Nome Fantasia'}</label>
            <input
              type="text"
              value={formData.nomeFantasia}
              onChange={(e) => handleChange('nomeFantasia', e.target.value)}
              placeholder={formData.tipoPessoa === 'F' ? 'Ex: Beto' : 'Ex: Silva Transportes'}
              className={inputBaseClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBaseClass}>{formData.tipoPessoa === 'F' ? 'CPF' : 'CNPJ'} *</label>
              <div className="relative">
                <IMaskInput
                  mask={formData.tipoPessoa === 'F' ? '000.000.000-00' : '00.000.000/0000-00'}
                  value={formData.documento}
                  onAccept={(val) => handleChange('documento', val)}
                  placeholder={formData.tipoPessoa === 'F' ? '000.000.000-00' : '00.000.000/0000-00'}
                  className={`${inputBaseClass} font-mono pr-10`}
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {documentoValido ? (
                    <CheckCircle size={16} className="text-[#0284c7]" weight="fill" />
                  ) : formData.documento.length >= (formData.tipoPessoa === 'F' ? 11 : 14) ? (
                    <WarningCircle size={16} className="text-rose-500" weight="fill" />
                  ) : null}
                </div>
              </div>
            </div>
            <div>
              <label className={labelBaseClass}>{formData.tipoPessoa === 'F' ? 'RG' : 'Inscrição Estadual'}</label>
              <input
                type="text"
                value={formData.rgIe}
                onChange={(e) => handleChange('rgIe', e.target.value.toUpperCase())}
                placeholder={formData.tipoPessoa === 'F' ? '12.345.678-9' : 'ISENTO'}
                className={`${inputBaseClass} font-mono`}
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <Phone size={14} weight="bold" className="text-[#0284c7]" />
            Contato
          </h3>
          <div>
            <label className={labelBaseClass}>Celular ou WhatsApp *</label>
            <IMaskInput
              mask="(00) 00000-0000"
              value={formData.telefone}
              onAccept={(val) => handleChange('telefone', val)}
              placeholder="(43) 99999-9999"
              className={`${inputBaseClass} font-mono`}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBaseClass}>Telefone Fixo</label>
              <IMaskInput
                mask="(00) 0000-0000"
                value={formData.telefoneFixo}
                onAccept={(val) => handleChange('telefoneFixo', val)}
                placeholder="(43) 3333-3333"
                className={`${inputBaseClass} font-mono`}
              />
            </div>
            <div>
              <label className={labelBaseClass}>E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="cliente@email.com"
                className={inputBaseClass}
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <MapPin size={14} weight="bold" className="text-[#0284c7]" />
            Endereço
          </h3>
          <div>
            <label className={labelBaseClass}>CEP</label>
            <div className="relative">
              <IMaskInput
                mask="00000-000"
                value={formData.cep}
                onAccept={(val) => {
                  handleChange('cep', val)
                  if (val.replace(/\D/g, '').length === 8) buscarEnderecoPorCep(val)
                }}
                placeholder="00000-000"
                className={`${inputBaseClass} font-mono pr-10`}
              />
              <button
                type="button"
                onClick={() => buscarEnderecoPorCep(formData.cep)}
                disabled={buscandoCep}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]"
              >
                {buscandoCep ? <CircleNotch size={16} className="animate-spin text-[#0284c7]" /> : <MagnifyingGlass size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className={labelBaseClass}>Logradouro</label>
            <input
              type="text"
              value={formData.logradouro}
              onChange={(e) => handleChange('logradouro', e.target.value)}
              placeholder="Rua, Avenida..."
              className={inputBaseClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBaseClass}>Número</label>
              <input
                ref={numeroInputRef}
                type="text"
                value={formData.numero}
                onChange={(e) => handleChange('numero', e.target.value)}
                placeholder="Nº ou S/N"
                className={inputBaseClass}
              />
            </div>
            <div>
              <label className={labelBaseClass}>Complemento</label>
              <input
                type="text"
                value={formData.complemento}
                onChange={(e) => handleChange('complemento', e.target.value)}
                placeholder="Apto, Casa..."
                className={inputBaseClass}
              />
            </div>
          </div>
          <div>
            <label className={labelBaseClass}>Bairro</label>
            <input
              type="text"
              value={formData.bairro}
              onChange={(e) => handleChange('bairro', e.target.value)}
              placeholder="Bairro"
              className={inputBaseClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBaseClass}>Cidade</label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
                placeholder="Apucarana"
                className={inputBaseClass}
              />
            </div>
            <div>
              <label className={labelBaseClass}>UF</label>
              <Select
                value={ufSelecionada}
                onChange={(opt) => handleChange('uf', opt ? opt.value : 'PR')}
                options={ESTADOS_BRASIL_OPCOES}
                styles={mobileSelectStyles}
                placeholder="UF"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
              <Car size={14} weight="bold" className="text-[#0284c7]" />
              Veículos ({formData.veiculos.length})
            </h3>
            {!adicionandoVeiculo && (
              <button type="button" onClick={handleAbrirAdicionarVeiculo} className="text-[10.5px] font-bold text-[#0284c7]">
                + Incluir Veículo
              </button>
            )}
          </div>

          {adicionandoVeiculo && (
            <div className="bg-[#f8fafc] border border-sky-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-[#0284c7]">Novo Veículo (Tabela FIPE)</span>
                <button type="button" onClick={() => setAdicionandoVeiculo(false)} className="text-[10.5px] font-bold text-[#98a2b3]">
                  Cancelar
                </button>
              </div>

              <div>
                <label className={labelBaseClass}>Placa *</label>
                <IMaskInput
                  mask={[{ mask: 'aaa0a00' }, { mask: 'aaa-0000' }]}
                  prepareChar={(str) => str.toUpperCase()}
                  definitions={{ a: /[A-Za-z]/, 0: /[0-9]/ }}
                  value={novoVeiculo.placa}
                  onAccept={(val) => setNovoVeiculo((prev) => ({ ...prev, placa: val.toUpperCase() }))}
                  placeholder="ABC1D23"
                  className={`${inputBaseClass} font-mono uppercase`}
                />
              </div>

              <div>
                <label className={labelBaseClass}>Marca (FIPE) *</label>
                <CreatableSelect
                  value={
                    marcasFipe.find((m) => m.value === novoVeiculo.marcaCodigo || m.label.toLowerCase() === (novoVeiculo.marca || '').toLowerCase()) ||
                    (novoVeiculo.marca ? { value: novoVeiculo.marca, label: novoVeiculo.marca } : null)
                  }
                  onChange={handleSelecionarMarca}
                  options={marcasFipe}
                  isLoading={carregandoMarcas}
                  styles={mobileSelectStyles}
                  placeholder={carregandoMarcas ? 'Buscando marcas...' : 'Selecione a marca...'}
                  isClearable
                  formatCreateLabel={(val) => `Usar: "${val}"`}
                />
              </div>

              <div>
                <label className={labelBaseClass}>Modelo (FIPE) *</label>
                <CreatableSelect
                  value={
                    modelosFipe.find((m) => m.value === novoVeiculo.modeloCodigo || m.label.toLowerCase() === (novoVeiculo.modelo || '').toLowerCase()) ||
                    (novoVeiculo.modelo ? { value: novoVeiculo.modelo, label: novoVeiculo.modelo } : null)
                  }
                  onChange={handleSelecionarModelo}
                  options={modelosFipe}
                  isLoading={carregandoModelos}
                  isDisabled={!novoVeiculo.marca || carregandoModelos}
                  styles={mobileSelectStyles}
                  placeholder={!novoVeiculo.marca ? 'Selecione a marca primeiro...' : carregandoModelos ? 'Carregando...' : 'Selecione o modelo...'}
                  isClearable
                  formatCreateLabel={(val) => `Usar: "${val}"`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelBaseClass}>Ano/Mod. {anosFipe.length > 0 && '(FIPE)'}</label>
                  {anosFipe.length > 0 ? (
                    <CreatableSelect
                      value={
                        anosFipe.find((a) => a.value === novoVeiculo.anoCodigo || a.ano === novoVeiculo.ano || a.label.includes(novoVeiculo.ano)) ||
                        (novoVeiculo.ano ? { value: novoVeiculo.ano, label: novoVeiculo.ano } : null)
                      }
                      onChange={handleSelecionarAno}
                      options={anosFipe}
                      isLoading={carregandoAnos}
                      styles={mobileSelectStyles}
                      placeholder="Ano..."
                      isClearable
                    />
                  ) : (
                    <input
                      type="text"
                      value={novoVeiculo.ano}
                      onChange={(e) => setNovoVeiculo((prev) => ({ ...prev, ano: e.target.value }))}
                      placeholder="2021/2022"
                      className={`${inputBaseClass} font-mono`}
                    />
                  )}
                </div>
                <div>
                  <label className={labelBaseClass}>Cor</label>
                  <input
                    type="text"
                    value={novoVeiculo.cor}
                    onChange={(e) => setNovoVeiculo((prev) => ({ ...prev, cor: e.target.value }))}
                    placeholder="Branca"
                    className={inputBaseClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelBaseClass}>Combustível</label>
                  <Select
                    value={COMBUSTIVEL_OPCOES.find((o) => o.value === novoVeiculo.combustivel)}
                    onChange={(opt) => setNovoVeiculo((prev) => ({ ...prev, combustivel: opt ? opt.value : 'FLEX' }))}
                    options={COMBUSTIVEL_OPCOES}
                    styles={mobileSelectStyles}
                    isSearchable={false}
                  />
                </div>
                <div>
                  <label className={labelBaseClass}>KM</label>
                  <input
                    type="text"
                    value={novoVeiculo.kmPadrao}
                    onChange={(e) => setNovoVeiculo((prev) => ({ ...prev, kmPadrao: e.target.value }))}
                    placeholder="280.812"
                    className={`${inputBaseClass} font-mono`}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAdicionarVeiculo}
                className="w-full h-11 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Plus size={14} weight="bold" />
                Incluir Veículo
              </button>
            </div>
          )}

          {formData.veiculos.length === 0 ? (
            <p className="text-xs text-[#98a2b3] italic text-center py-3">Nenhum veículo vinculado ainda.</p>
          ) : (
            <div className="space-y-2">
              {formData.veiculos.map((v, index) => (
                <div key={v.value || v.placa || index} className="flex items-center justify-between gap-2 p-3 bg-[#f8fafc] border border-[#e4e7ec] rounded-xl">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[10.5px] px-1.5 py-0.5 rounded bg-white border border-[#e4e7ec] text-[#101828]">{v.placa}</span>
                      <span className="text-xs font-bold text-[#101828] truncate">{v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim()}</span>
                    </div>
                    <p className="text-[10.5px] text-[#667085] mt-0.5">{v.ano || '—'} • {v.cor || '—'} • {v.combustivel || 'FLEX'}</p>
                  </div>
                  <button type="button" onClick={() => handleRemoverVeiculo(index)} className="p-1.5 text-[#98a2b3] active:text-rose-600 shrink-0">
                    <Trash size={15} weight="bold" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <Notebook size={14} weight="bold" className="text-[#0284c7]" />
            Observações
          </h3>
          <textarea
            rows={3}
            value={formData.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            placeholder="Preferências de contato, frotista com faturamento quinzenal..."
            className={textareaBaseClass}
          />
        </section>

        {clienteParaEditar && onExcluir && (
          <section>
            {confirmandoExclusao ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 flex items-center gap-2">
                <span className="flex-1 text-xs font-bold text-[#101828]">Excluir este cliente?</span>
                <button type="button" onClick={() => setConfirmandoExclusao(false)} className="h-9 px-3 rounded-lg border border-[#d0d5dd] bg-white text-[#344054] text-xs font-bold">
                  Cancelar
                </button>
                <button type="button" onClick={() => onExcluir(clienteParaEditar.value || clienteParaEditar.id)} className="h-9 px-3 rounded-lg bg-[#b42318] text-white text-xs font-bold">
                  Confirmar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmandoExclusao(true)}
                className="w-full h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Trash size={15} weight="bold" />
                Excluir Cliente
              </button>
            )}
          </section>
        )}
      </main>

      <footer className="shrink-0 bg-white border-t border-[#e4e7ec] px-4 py-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}>
        <button type="button" onClick={handleSalvar} className="w-full h-12 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-sm font-bold flex items-center justify-center gap-2">
          <CheckCircle size={18} weight="bold" />
          {clienteParaEditar ? 'Atualizar Cliente' : 'Salvar Cliente'}
        </button>
      </footer>
    </div>
  )
}
