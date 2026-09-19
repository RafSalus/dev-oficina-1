import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { IMaskInput } from 'react-imask'
import {
  Car,
  User,
  Plus,
  FloppyDisk,
  IdentificationCard,
  Hash,
  Gauge,
  Palette,
  GasPump,
  CalendarBlank,
  Notebook,
  CheckCircle,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { customSelectStyles } from '../suprimentos/customSelectStyles'
import {
  carregarClientesCadastrados,
  gerarProximoCodigoVeiculo,
} from '../../constants/mockClientesVeiculos'
import {
  buscarMarcasFipe,
  buscarModelosFipe,
  buscarAnosFipe,
} from '../../services/fipeService'

const customSelectStylesCompact = {
  ...customSelectStyles,
  control: (base, state) => ({
    ...base,
    minHeight: '36px',
    height: '36px',
    fontSize: '12px',
    backgroundColor: '#ffffff',
    borderColor: state.isFocused ? '#0284c7' : '#cbd5e1',
    boxShadow: state.isFocused ? '0 0 0 1px #0284c7' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#0284c7' : '#94a3b8',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    height: '36px',
    padding: '0 8px',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '36px',
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '12px',
    backgroundColor: state.isSelected
      ? '#0284c7'
      : state.isFocused
      ? '#f0f9ff'
      : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#1e293b',
    cursor: 'pointer',
  }),
}

const COMBUSTIVEL_OPCOES = [
  { value: 'FLEX', label: 'Flex (Álcool e Gasolina)' },
  { value: 'GASOLINA', label: 'Gasolina' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'HIBRIDO', label: 'Híbrido' },
  { value: 'ELETRICO', label: 'Elétrico' },
  { value: 'GNV', label: 'GNV' },
]

const FORM_VEICULO_INICIAL = {
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

export function VeiculoModalForm({
  isOpen,
  onClose,
  onSalvar,
  veiculoParaEditar,
  clientePredefinidoId,
}) {
  const [formData, setFormData] = useState(FORM_VEICULO_INICIAL)
  const [clientes, setClientes] = useState([])

  // Estados da API da Tabela FIPE (Dados Técnicos sem preços)
  const [marcasFipe, setMarcasFipe] = useState([])
  const [carregandoMarcas, setCarregandoMarcas] = useState(false)
  const [modelosFipe, setModelosFipe] = useState([])
  const [carregandoModelos, setCarregandoModelos] = useState(false)
  const [anosFipe, setAnosFipe] = useState([])
  const [carregandoAnos, setCarregandoAnos] = useState(false)

  // Carrega clientes para o select
  useEffect(() => {
    if (isOpen) {
      const listaClientes = carregarClientesCadastrados()
      setClientes(listaClientes)
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

      // Se há marca selecionada, carrega modelos da FIPE
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

  const opcoesClientes = useMemo(() => {
    return clientes.map((c) => ({
      value: c.value || c.id,
      label: `${c.codigoCliente ? `[${c.codigoCliente}] ` : ''}${c.nome} - ${c.telefone || c.documento || ''}`,
      nome: c.nome,
      codigoCliente: c.codigoCliente,
      documento: c.documento,
    }))
  }, [clientes])

  const clienteSelecionado = useMemo(() => {
    if (!formData.clienteId) return null
    return opcoesClientes.find((opt) => opt.value === formData.clienteId) || null
  }, [opcoesClientes, formData.clienteId])

  const handleSelecionarMarca = async (opcao) => {
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

    const marcaNome = opcao.label
    const marcaCod = opcao.value

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
  }

  const handleSelecionarModelo = async (opcao) => {
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

    const modeloNome = opcao.label
    const modeloCod = opcao.value

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
        // Silencioso se falhar
      } finally {
        setCarregandoAnos(false)
      }
    }
  }

  const handleSelecionarAno = (opcao) => {
    if (!opcao) {
      setFormData((prev) => ({ ...prev, ano: '', anoCodigo: '' }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      ano: opcao.ano || opcao.label,
      anoCodigo: opcao.value,
      combustivel: opcao.combustivel || prev.combustivel || 'FLEX',
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.clienteId) {
      toast.warning('Por favor, selecione o cliente proprietário do veículo.')
      return
    }

    if (!formData.placa?.trim()) {
      toast.warning('Por favor, informe a placa do veículo.')
      return
    }

    const placaLimpa = formData.placa.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
    if (placaLimpa.length < 7) {
      toast.warning('Placa incompleta. Digite uma placa válida (padrão Mercosul ou antigo).')
      return
    }

    if (!formData.marca?.trim()) {
      toast.warning('Por favor, selecione ou informe a marca do veículo.')
      return
    }

    if (!formData.modelo?.trim()) {
      toast.warning('Por favor, selecione ou informe o modelo do veículo.')
      return
    }

    const marcaFormatada = formData.marca.trim()
    const modeloFormatado = formData.modelo.trim()
    const marcaModeloCompleto = `${marcaFormatada} ${modeloFormatado}`.trim()
    const codigoFinal = formData.codigoVeiculo || gerarProximoCodigoVeiculo()

    const payload = {
      ...formData,
      id: veiculoParaEditar?.id || veiculoParaEditar?.value || `veic-${Date.now()}`,
      value: veiculoParaEditar?.value || veiculoParaEditar?.id || `veic-${Date.now()}`,
      codigoVeiculo: codigoFinal,
      placa: placaLimpa,
      marca: marcaFormatada,
      modelo: modeloFormatado,
      marcaModelo: marcaModeloCompleto,
      label: `${placaLimpa} - ${marcaModeloCompleto} (${formData.ano || 'N/D'} - ${formData.cor || 'N/D'})`,
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
    onClose()
  }

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      titulo={veiculoParaEditar ? 'Editar Veículo da Frota' : 'Novo Cadastro de Veículo'}
      subtitulo="Consulta técnica FIPE integrada e vínculo com o cliente proprietário"
      icone={Car}
      badge="Frota Oficial"
      larguraPadrao={840}
      alturaPadrao={660}
      storageKey="veiculo_modal_dimensoes"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Vínculo com o Cliente Proprietário */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <User size={16} className="text-sky-600" />
            <span>Cliente Proprietário / Frotista</span>
            <span className="text-rose-500">*</span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Localizar Cliente na Base <span className="text-rose-500">*</span>
            </label>
            <Select
              value={clienteSelecionado}
              onChange={(opt) =>
                setFormData((prev) => ({
                  ...prev,
                  clienteId: opt ? opt.value : '',
                }))
              }
              options={opcoesClientes}
              styles={customSelectStylesCompact}
              placeholder="Digite o nome, código ou telefone do cliente..."
              isSearchable
              isClearable
              noOptionsMessage={() => 'Nenhum cliente cadastrado'}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              O veículo será vinculado diretamente ao histórico cadastral do cliente selecionado.
            </p>
          </div>
        </div>

        {/* Identificação Básica do Veículo */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <IdentificationCard size={16} className="text-sky-600" />
              <span>Identificação e Placa</span>
            </div>
            {/* Status do Veículo */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Status na Frota:</span>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, ativo: !prev.ativo }))
                }
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                  formData.ativo
                    ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                    : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
                }`}
              >
                {formData.ativo ? 'Ativo na Frota' : 'Inativo'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Código do Veículo (Automático) */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Código do Veículo
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.codigoVeiculo}
                  readOnly
                  tabIndex={-1}
                  className="w-full h-9 px-2.5 text-xs bg-slate-100 border border-slate-300 rounded-md text-slate-600 font-mono font-bold cursor-not-allowed select-none"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                  AUTO
                </span>
              </div>
            </div>

            {/* Placa com Máscara Mercosul / Antiga */}
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
                value={formData.placa}
                onAccept={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    placa: val.toUpperCase(),
                  }))
                }
                placeholder="ABC1D23"
                className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono uppercase font-bold text-slate-900"
              />
            </div>

            {/* Chassi */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Chassi (Opcional)
              </label>
              <input
                type="text"
                value={formData.chassi}
                maxLength={17}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    chassi: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="9BWZZZ377VT..."
                className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono uppercase text-slate-800"
              />
            </div>

            {/* Renavam */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Renavam (Opcional)
              </label>
              <input
                type="text"
                value={formData.renavam}
                maxLength={11}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    renavam: e.target.value.replace(/\D/g, ''),
                  }))
                }
                placeholder="00123456789"
                className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Dados Técnicos e FIPE (Marca, Modelo, Ano e Versão) */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <Car size={16} className="text-sky-600" />
              <span>Especificações Técnicas e Tabela FIPE</span>
            </div>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              Apenas Especificações Técnicas (Sem Preços)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Marca FIPE (Separada) */}
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Marca (Montadora) <span className="text-rose-500">*</span>
              </label>
              <CreatableSelect
                value={
                  marcasFipe.find(
                    (m) =>
                      m.value === formData.marcaCodigo ||
                      m.label.toLowerCase() === (formData.marca || '').toLowerCase()
                  ) ||
                  (formData.marca
                    ? { value: formData.marca, label: formData.marca }
                    : null)
                }
                onChange={handleSelecionarMarca}
                options={marcasFipe}
                isLoading={carregandoMarcas}
                styles={customSelectStylesCompact}
                placeholder={carregandoMarcas ? 'Buscando marcas FIPE...' : 'Selecione a montadora...'}
                isSearchable
                isClearable
                noOptionsMessage={() =>
                  carregandoMarcas ? 'Carregando FIPE...' : 'Nenhuma marca encontrada'
                }
                formatCreateLabel={(val) => `Usar: "${val}"`}
              />
            </div>

            {/* Modelo FIPE (Separado) */}
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Modelo do Veículo <span className="text-rose-500">*</span>
              </label>
              <CreatableSelect
                value={
                  modelosFipe.find(
                    (m) =>
                      m.value === formData.modeloCodigo ||
                      m.label.toLowerCase() === (formData.modelo || '').toLowerCase()
                  ) ||
                  (formData.modelo
                    ? { value: formData.modelo, label: formData.modelo }
                    : null)
                }
                onChange={handleSelecionarModelo}
                options={modelosFipe}
                isLoading={carregandoModelos}
                isDisabled={!formData.marca || carregandoModelos}
                styles={customSelectStylesCompact}
                placeholder={
                  !formData.marca
                    ? 'Selecione a montadora primeiro...'
                    : carregandoModelos
                    ? 'Buscando modelos FIPE...'
                    : 'Selecione o modelo...'
                }
                isSearchable
                isClearable
                noOptionsMessage={() =>
                  !formData.marca
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
                Ano / Versão{' '}
                {anosFipe.length > 0 && (
                  <span className="text-[10px] text-sky-600 font-semibold">(FIPE)</span>
                )}
              </label>
              {anosFipe.length > 0 ? (
                <CreatableSelect
                  value={
                    anosFipe.find(
                      (a) =>
                        a.value === formData.anoCodigo ||
                        a.ano === formData.ano ||
                        a.label.includes(formData.ano)
                    ) ||
                    (formData.ano
                      ? { value: formData.ano, label: formData.ano }
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
                  value={formData.ano}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ano: e.target.value,
                    }))
                  }
                  placeholder="2021/2022"
                  className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono text-slate-900"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
            {/* Cor */}
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Cor do Veículo
              </label>
              <input
                type="text"
                value={formData.cor}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cor: e.target.value,
                  }))
                }
                placeholder="Ex: Branco Banchisa, Prata..."
                className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none text-slate-900"
              />
            </div>

            {/* Combustível */}
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Combustível
              </label>
              <Select
                value={COMBUSTIVEL_OPCOES.find(
                  (opt) => opt.value === formData.combustivel
                )}
                onChange={(opt) =>
                  setFormData((prev) => ({
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

            {/* Quilometragem Atual */}
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Quilometragem (KM Atual)
              </label>
              <input
                type="text"
                value={formData.kmPadrao}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    kmPadrao: e.target.value,
                  }))
                }
                placeholder="Ex: 89.300"
                className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Observações e Histórico de Manutenções */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <Notebook size={16} className="text-sky-600" />
            <span>Observações Técnicas e Histórico do Veículo</span>
          </div>
          <textarea
            value={formData.observacoes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                observacoes: e.target.value,
              }))
            }
            rows={2}
            placeholder="Avarias prévias na lataria, tipo de óleo recomendado, preferências de manutenção..."
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none text-slate-900"
          />
        </div>

        {/* Rodapé com botão único de confirmação (Regra 12) */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-md text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <FloppyDisk size={16} weight="bold" />
            <span>{veiculoParaEditar ? 'Salvar Alterações' : 'Cadastrar Veículo'}</span>
          </button>
        </div>
      </form>
    </ModalRedimensionavel>
  )
}
