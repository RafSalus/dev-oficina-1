import React, { useMemo } from 'react'
import Select from 'react-select'
import {
  User,
  Car,
  ChatText,
  Phone,
  EnvelopeSimple,
  MapPin,
  Speedometer,
  ArrowRight,
  IdentificationBadge,
  WhatsappLogo,
  FloppyDisk,
  X,
} from '@phosphor-icons/react'
import { useNotice } from '../../../../context/NoticeContext'
import { carregarClientesCadastrados } from '../../../../constants/mockClientesVeiculos'
import { MOCK_MECANICOS } from '../../../../constants/mecanicos'
import { GoogleMapsIcon } from '../../../../components/icons/GoogleMapsIcon'
import { toast } from 'sonner'

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '44px',
    height: '44px',
    backgroundColor: state.isDisabled ? '#f2f4f7' : state.isFocused ? '#ffffff' : '#f8fafc',
    borderColor: state.isFocused ? '#101828' : '#d0d5dd',
    borderWidth: '1px',
    borderRadius: '14px',
    boxShadow: state.isFocused ? '0 0 0 1px #101828' : 'none',
    fontSize: '13px',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    ':hover': {
      borderColor: state.isFocused ? '#101828' : '#98a2b3',
      backgroundColor: state.isDisabled ? '#f2f4f7' : '#ffffff',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    height: '44px',
    padding: '0 14px',
  }),
  input: (base) => ({
    ...base,
    margin: '0px',
    color: '#101828',
    fontSize: '13px',
    fontWeight: '600',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '44px',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '6px 10px',
    color: '#667085',
    ':hover': { color: '#101828' },
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '6px 8px',
    color: '#667085',
    ':hover': { color: '#101828' },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '16px',
    border: '1px solid #e4e7ec',
    boxShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.1), 0 6px 10px -3px rgba(0, 0, 0, 0.04)',
    zIndex: 50,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    padding: '6px',
  }),
  menuList: (base) => ({
    ...base,
    padding: '2px',
    maxHeight: '220px',
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: state.isSelected ? 700 : 500,
    backgroundColor: state.isSelected
      ? '#101828'
      : state.isFocused
      ? '#f2f4f7'
      : 'transparent',
    color: state.isSelected ? '#ffffff' : '#101828',
    cursor: 'pointer',
    padding: '10px 14px',
    transition: 'all 0.1s ease',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#101828',
    fontWeight: 700,
    fontSize: '13px',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#98a2b3',
    fontSize: '13px',
    fontWeight: 500,
  }),
}

const TIPO_ATENDIMENTO_OPTIONS = [
  { value: 'orcamento', label: 'Orçamento' },
  { value: 'corretiva', label: 'Manutenção Corretiva' },
  { value: 'preventiva', label: 'Revisão Preventiva' },
  { value: 'garantia', label: 'Retorno em Garantia' },
]

const PRIORIDADE_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
]

export function TabClienteVeiculo({ formData, updateFormData, onSaveStep, onCancel }) {
  const { openNotice } = useNotice()

  const {
    clienteId,
    cliente,
    telefone,
    documento,
    email,
    endereco,
    veiculoId,
    placa,
    marcaModelo,
    ano,
    cor,
    km,
    nivelCombustivel,
    tipoAtendimento = 'orcamento',
    prioridade = 'normal',
    relatoCliente = '',
    mecanicoId = '',
  } = formData

  const selectedMecanicoOption = useMemo(() => {
    return MOCK_MECANICOS.find((m) => m.value === mecanicoId) || MOCK_MECANICOS[0]
  }, [mecanicoId])

  const handleSelectMecanico = (option) => {
    updateFormData({
      mecanicoId: option?.value || '',
      mecanicoNome: option?.value ? option.nome : '',
    })
  }

  const handleSave = () => {
    if (!clienteId || !cliente?.trim()) {
      toast.warning('Por favor, selecione o cliente para continuar.')
      return
    }

    if (!veiculoId || !placa?.trim()) {
      toast.warning('Por favor, selecione o veículo do cliente para continuar.')
      return
    }

    if (!km || !km?.trim()) {
      toast.warning('Por favor, informe a quilometragem (KM) atual do veículo.')
      return
    }

    toast.success('Dados do cliente e veículo confirmados!')
    onSaveStep?.()
  }

  const listaClientes = useMemo(() => carregarClientesCadastrados(), [])

  // Cliente selecionado atualmente
  const selectedClienteOption = useMemo(() => {
    if (!clienteId && !cliente) return null
    return (
      listaClientes.find(
        (c) =>
          (clienteId && (c.value === clienteId || c.id === clienteId)) ||
          (cliente && c.nome?.toLowerCase() === cliente?.toLowerCase())
      ) || null
    )
  }, [clienteId, cliente, listaClientes])

  // Veículos vinculados estritamente ao cliente selecionado
  const veiculosDisponiveis = useMemo(() => {
    if (!selectedClienteOption) return []
    return selectedClienteOption.veiculos || []
  }, [selectedClienteOption])

  // Veículo selecionado atualmente
  const selectedVeiculoOption = useMemo(() => {
    if (!veiculosDisponiveis.length) return null
    return (
      veiculosDisponiveis.find(
        (v) =>
          (veiculoId && (v.value === veiculoId || v.id === veiculoId)) ||
          (placa && (v.placa || '').toUpperCase().trim() === (placa || '').toUpperCase().trim())
      ) || null
    )
  }, [veiculoId, placa, veiculosDisponiveis])

  // Iniciais do cliente para o avatar
  const clienteIniciais = useMemo(() => {
    if (!cliente) return 'CL'
    return cliente
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }, [cliente])

  // Handler de seleção de cliente
  const handleSelectCliente = (option) => {
    if (!option) {
      updateFormData({
        clienteId: '',
        cliente: '',
        telefone: '',
        documento: '',
        email: '',
        endereco: '',
        veiculoId: '',
        placa: '',
        marcaModelo: '',
        ano: '',
        cor: '',
        km: '',
      })
      return
    }

    const primeiroVeiculo = option.veiculos?.[0] || null

    updateFormData({
      clienteId: option.value,
      cliente: option.nome,
      telefone: option.telefone,
      documento: option.documento,
      email: option.email,
      endereco: option.endereco,
      veiculoId: primeiroVeiculo?.value || '',
      placa: primeiroVeiculo?.placa || '',
      marcaModelo: primeiroVeiculo?.marcaModelo || '',
      ano: primeiroVeiculo?.ano || '',
      cor: primeiroVeiculo?.cor || '',
      km: primeiroVeiculo?.kmPadrao || '',
    })
  }

  // Handler de seleção de veículo do cliente
  const handleSelectVeiculo = (option) => {
    if (!option) {
      updateFormData({
        veiculoId: '',
        placa: '',
        marcaModelo: '',
        ano: '',
        cor: '',
        km: '',
      })
      return
    }

    updateFormData({
      veiculoId: option.value,
      placa: option.placa,
      marcaModelo: option.marcaModelo,
      ano: option.ano,
      cor: option.cor,
      km: option.kmPadrao || km || '',
    })
  }

  return (
    <div className="h-full w-full flex flex-col justify-between gap-2.5 overflow-hidden">
      {/* Grid de 3 Cartões Proporcionais e Compactos */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3 overflow-hidden">
        {/* Cartão 1: Cliente (Primeiro na ordem) */}
        <div className="h-full bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#f2f4f7] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                <User size={18} weight="bold" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-[#101828] leading-tight">Dados do Cliente</h2>
                <p className="text-xs text-[#667085] mt-0.5">Titular cadastrado no sistema</p>
              </div>
            </div>

            {cliente && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#ecfdf3] text-[#027a48] border border-[#a6f4c5]">
                Cliente Ativo
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between py-2.5 space-y-2.5 overflow-hidden min-h-0">
            {/* Campo Select de Cliente */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#344054] mb-1.5">
                Localizar Cliente <span className="text-[#b42318]">*</span>
              </label>
              <Select
                value={selectedClienteOption}
                onChange={handleSelectCliente}
                options={listaClientes}
                isClearable
                isSearchable
                placeholder="Buscar por nome, telefone ou documento..."
                styles={customSelectStyles}
                noOptionsMessage={() => 'Nenhum cliente cadastrado com este termo'}
              />
            </div>

            {/* Painel Executivo do Cliente Selecionado */}
            {cliente ? (
              <div className="flex-1 bg-[#f8fafc] border border-[#d0d5dd] rounded-2xl p-3 flex flex-col justify-between overflow-hidden shadow-xs">
                {/* Linha Superior: Avatar, Nome e CPF/CNPJ */}
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#e2e8f0]">
                  <div className="w-13 h-13 rounded-2xl bg-[#101828] text-white flex items-center justify-center font-black text-base shrink-0 shadow-xs tracking-wider">
                    {clienteIniciais}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-extrabold text-[#101828] truncate leading-tight">
                      {cliente}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#475467] mt-1">
                      <IdentificationBadge size={16} className="text-[#667085] shrink-0" />
                      <span className="font-mono font-semibold bg-white px-2 py-0.5 rounded-md border border-[#d0d5dd]">
                        {documento || 'Documento não informado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contatos: Telefone e E-mail compactos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-1.5">
                  <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-[#d0d5dd] truncate">
                    <div className="w-7 h-7 rounded-lg bg-[#f2f4f7] flex items-center justify-center text-[#101828] shrink-0">
                      <Phone size={15} weight="bold" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-[#667085] block leading-none mb-0.5">Telefone</span>
                      <span className="font-bold text-xs truncate text-[#101828] block">
                        {telefone || 'Sem telefone'}
                      </span>
                    </div>
                    {telefone && (
                      <a
                        href={`https://wa.me/55${telefone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg bg-[#25D366] hover:bg-[#1da851] flex items-center justify-center text-white shrink-0 transition-colors cursor-pointer"
                        title="Abrir conversa no WhatsApp"
                      >
                        <WhatsappLogo size={16} weight="fill" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-[#d0d5dd] truncate">
                    <div className="w-7 h-7 rounded-lg bg-[#f2f4f7] flex items-center justify-center text-[#101828] shrink-0">
                      <EnvelopeSimple size={15} weight="bold" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-[#667085] block leading-none mb-0.5">E-mail</span>
                      <span className="font-semibold text-xs truncate text-[#344054] block">
                        {email || 'Sem e-mail'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bloco de Endereço Completo com Atalho para Google Maps */}
                <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    {endereco ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          endereco
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-xl bg-white hover:bg-[#f8f9fa] border border-[#d0d5dd] hover:border-[#4285F4] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs transition-all cursor-pointer group"
                        title="Clique para abrir endereço no Google Maps"
                      >
                        <GoogleMapsIcon className="w-4 h-5 transition-transform group-hover:scale-110" />
                      </a>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-white border border-[#d0d5dd] flex items-center justify-center text-[#667085] shrink-0 mt-0.5 shadow-2xs">
                        <MapPin size={18} weight="bold" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[10.5px] uppercase font-extrabold tracking-wider text-[#667085] leading-none mb-1">
                        Endereço Completo
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-[#101828] leading-relaxed line-clamp-2">
                        {endereco || 'Endereço residencial ou comercial não informado'}
                      </p>
                    </div>
                  </div>

                  {endereco && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        endereco
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-2.5 rounded-xl bg-white hover:bg-[#f8f9fa] active:bg-[#f2f4f7] border border-[#d0d5dd] hover:border-[#4285F4] flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-2xs group"
                      title="Abrir localização no Google Maps"
                    >
                      <GoogleMapsIcon className="w-3.5 h-4 shrink-0 transition-transform group-hover:scale-110" />
                      <span className="text-xs font-bold text-[#344054] group-hover:text-[#101828]">
                        Google Maps
                      </span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#d0d5dd] rounded-2xl bg-[#f8fafc]">
                <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] flex items-center justify-center text-[#667085] mb-3 shadow-2xs">
                  <User size={24} />
                </div>
                <p className="text-sm font-extrabold text-[#101828]">Nenhum cliente selecionado</p>
                <p className="text-xs text-[#667085] max-w-[260px] mt-1 leading-relaxed">
                  Pesquise pelo nome, telefone ou documento no campo acima para vincular o titular.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cartão 2: Veículo (Vinculado estritamente ao Cliente) */}
        <div className="h-full bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#f2f4f7] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                <Car size={18} weight="bold" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-[#101828] leading-tight">Veículo do Cliente</h2>
                <p className="text-xs text-[#667085] mt-0.5">Carro vinculado e dados de entrada</p>
              </div>
            </div>

            {placa && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#f2f4f7] text-[#344054] border border-[#d0d5dd]">
                Veículo Identificado
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between py-2.5 space-y-2.5 overflow-hidden min-h-0">
            {/* Campo Select de Veículo Vinculado */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#344054] mb-1.5">
                Selecionar Veículo do Cliente <span className="text-[#b42318]">*</span>
              </label>
              <Select
                value={selectedVeiculoOption}
                onChange={handleSelectVeiculo}
                options={veiculosDisponiveis}
                isDisabled={!clienteId || veiculosDisponiveis.length === 0}
                isClearable
                isSearchable
                placeholder={
                  !clienteId
                    ? 'Selecione o cliente primeiro...'
                    : veiculosDisponiveis.length === 0
                    ? 'Nenhum veículo vinculado ao cliente'
                    : 'Escolha o veículo cadastrado...'
                }
                styles={customSelectStyles}
                noOptionsMessage={() => 'Nenhum veículo vinculado a este cliente'}
              />
            </div>

            {/* Vitrine do Veículo Selecionado */}
            {placa ? (
              <div className="bg-[#f8fafc] border border-[#d0d5dd] rounded-2xl p-3 flex items-center gap-3 shadow-xs">
                {/* Emblema da Placa com Estilo Automotivo Mercosul */}
                <div className="flex flex-col items-center bg-white border-2 border-[#101828] rounded-xl px-3 py-1.5 shrink-0 shadow-xs">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#101828] leading-none mb-0.5">
                    BRASIL
                  </span>
                  <span className="font-mono font-black text-base text-[#101828] tracking-widest leading-none">
                    {placa}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-[#101828] truncate leading-tight">
                    {marcaModelo}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-[#667085]">
                    <span className="font-bold text-[#344054] bg-white px-2 py-0.5 rounded-md border border-[#d0d5dd]">
                      Ano {ano}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-[#475467]">Cor {cor}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-5 text-center border border-dashed border-[#d0d5dd] rounded-2xl bg-[#f8fafc]">
                <p className="text-sm font-extrabold text-[#101828]">
                  {!clienteId ? 'Aguardando cliente' : 'Nenhum veículo selecionado'}
                </p>
                <p className="text-xs text-[#667085] mt-1 px-4">
                  {!clienteId
                    ? 'Selecione o cliente ao lado para carregar os veículos vinculados.'
                    : 'Escolha um dos veículos cadastrados no seletor acima.'}
                </p>
              </div>
            )}

            {/* Únicos Campos a Preencher: KM e Nível de Combustível */}
            <div className="pt-2.5 border-t border-[#f2f4f7] space-y-2">
              {/* KM Anterior do Veículo */}
              {selectedVeiculoOption?.kmPadrao && (
                <div className="p-2 rounded-xl bg-[#f0f9ff] border border-[#bae6fd]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0369a1]">
                      KM Anterior Registrado
                    </span>
                    <span className="text-sm font-black text-[#0c4a6e]">
                      {selectedVeiculoOption.kmPadrao} km
                    </span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#344054]">
                    Quilometragem Atual (KM) <span className="text-[#b42318]">*</span>
                  </label>
                  <span className="text-xs text-[#667085]">Marcador de entrada</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: 64.250 km"
                    value={km}
                    onChange={(e) => updateFormData({ km: e.target.value })}
                    className="w-full bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-white border border-[#d0d5dd] focus:border-[#101828] rounded-xl px-4 h-11 text-base font-black text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all shadow-xs"
                  />
                  <Speedometer size={20} className="absolute right-3.5 top-3 text-[#98a2b3]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#344054]">
                    Nível de Combustível de Entrada
                  </label>
                  <span className="text-xs text-[#667085]">Marcador do painel</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {['Res.', '1/4', '1/2', '3/4', 'Cheio'].map((nivel) => {
                    const val = nivel === 'Res.' ? 'Reserva' : nivel
                    const isSelected = nivelCombustivel === val || nivelCombustivel === nivel
                    return (
                      <button
                        key={nivel}
                        type="button"
                        onClick={() => updateFormData({ nivelCombustivel: val })}
                        className={`h-10 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-black text-white border-black shadow-xs'
                            : 'bg-[#f8fafc] text-[#475467] border-[#d0d5dd] hover:border-[#98a2b3] hover:bg-[#f1f5f9]'
                        }`}
                      >
                        {nivel}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cartão 3: Relato do Cliente (Terceiro na ordem) */}
        <div className="h-full bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#f2f4f7] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                <ChatText size={18} weight="bold" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-[#101828] leading-tight">Relato do Cliente</h2>
                <p className="text-xs text-[#667085] mt-0.5">Queixa e condições iniciais do serviço</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-[#101828] text-white tracking-wider shadow-2xs">
                #{formData.numeroOS}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#f2f4f7] text-[#344054] border border-[#d0d5dd]">
                Recepção
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2.5 space-y-2.5 overflow-hidden min-h-0">
            {/* Tipo de Atendimento, Prioridade e Mecânico com react-select */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#344054] mb-1.5">
                  Tipo de Atendimento
                </label>
                <Select
                  value={
                    TIPO_ATENDIMENTO_OPTIONS.find((opt) => opt.value === tipoAtendimento) ||
                    TIPO_ATENDIMENTO_OPTIONS[0]
                  }
                  onChange={(opt) =>
                    updateFormData({ tipoAtendimento: opt?.value || 'orcamento' })
                  }
                  options={TIPO_ATENDIMENTO_OPTIONS}
                  isSearchable={false}
                  styles={customSelectStyles}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#344054] mb-1.5">
                  Prioridade
                </label>
                <Select
                  value={
                    PRIORIDADE_OPTIONS.find((opt) => opt.value === prioridade) ||
                    PRIORIDADE_OPTIONS[0]
                  }
                  onChange={(opt) =>
                    updateFormData({ prioridade: opt?.value || 'normal' })
                  }
                  options={PRIORIDADE_OPTIONS}
                  isSearchable={false}
                  styles={customSelectStyles}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#344054] mb-1.5">
                  Mecânico Responsável
                </label>
                <Select
                  value={selectedMecanicoOption}
                  onChange={handleSelectMecanico}
                  options={MOCK_MECANICOS}
                  isSearchable
                  placeholder="Selecionar mecânico..."
                  styles={customSelectStyles}
                />
              </div>
            </div>

            {/* Relato do Cliente / Queixa Principal */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#344054] mb-1.5">
                Relato do Cliente (Queixa Principal) <span className="text-[#b42318]">*</span>
              </label>
              <textarea
                value={relatoCliente}
                onChange={(e) => updateFormData({ relatoCliente: e.target.value })}
                placeholder="Descreva o que o cliente relatou: barulho na suspensão ao esterçar, luz acesa no painel, vazamento de óleo, revisão periódica..."
                className="flex-1 w-full bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-white border border-[#d0d5dd] focus:border-[#101828] rounded-xl p-3.5 text-sm font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all resize-none leading-relaxed shadow-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Barra Inferior de Ações da Etapa */}
      <div className="h-11 shrink-0 bg-white px-5 rounded-2xl border border-[#d0d5dd] shadow-sm flex items-center justify-between">
        <span className="text-xs font-medium text-[#667085]">
          Aba 1 de 7 • <strong className="text-[#101828] font-bold">Cliente e Veiculo</strong>
        </span>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <FloppyDisk size={15} weight="bold" />
          <span>Salvar e Continuar</span>
        </button>
      </div>
    </div>
  )
}
