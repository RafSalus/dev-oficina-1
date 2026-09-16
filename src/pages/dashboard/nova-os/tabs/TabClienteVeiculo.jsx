import React, { useMemo } from 'react'
import Select from 'react-select'
import {
  User,
  Car,
  ChatText,
  Phone,
  IdentificationCard,
  EnvelopeSimple,
  MapPin,
  Speedometer,
  ArrowRight,
  Info,
} from '@phosphor-icons/react'
import { MOCK_CLIENTES_VEICULOS } from '../../../../constants/mockClientesVeiculos'

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '34px',
    height: '34px',
    backgroundColor: state.isDisabled ? '#f2f4f7' : '#f9fafb',
    borderColor: state.isFocused ? '#101828' : '#e4e7ec',
    borderRadius: '12px',
    boxShadow: 'none',
    fontSize: '11px',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    '&:hover': {
      borderColor: state.isFocused ? '#101828' : '#d0d5dd',
      backgroundColor: state.isDisabled ? '#f2f4f7' : '#ffffff',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    height: '34px',
    padding: '0 8px',
  }),
  input: (base) => ({
    ...base,
    margin: '0px',
    color: '#101828',
    fontSize: '11px',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '34px',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '4px 6px',
    color: '#667085',
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '4px 4px',
    color: '#667085',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '12px',
    border: '1px solid #e4e7ec',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    zIndex: 50,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
    maxHeight: '180px',
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: state.isSelected ? 600 : 500,
    backgroundColor: state.isSelected
      ? '#101828'
      : state.isFocused
      ? '#f2f4f7'
      : 'transparent',
    color: state.isSelected ? '#ffffff' : '#101828',
    cursor: 'pointer',
    padding: '6px 8px',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#101828',
    fontWeight: 600,
    fontSize: '11px',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#98a2b3',
    fontSize: '11px',
    fontWeight: 500,
  }),
}

export function TabClienteVeiculo({ formData, updateFormData, onNext }) {
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
  } = formData

  // Cliente selecionado atualmente
  const selectedClienteOption = useMemo(() => {
    if (!clienteId) return null
    return MOCK_CLIENTES_VEICULOS.find((c) => c.value === clienteId) || null
  }, [clienteId])

  // Veículos vinculados estritamente ao cliente selecionado
  const veiculosDisponiveis = useMemo(() => {
    if (!selectedClienteOption) return []
    return selectedClienteOption.veiculos || []
  }, [selectedClienteOption])

  // Veículo selecionado atualmente
  const selectedVeiculoOption = useMemo(() => {
    if (!veiculoId || !veiculosDisponiveis.length) return null
    return veiculosDisponiveis.find((v) => v.value === veiculoId) || null
  }, [veiculoId, veiculosDisponiveis])

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

    // Ao selecionar o cliente, se tiver veículos vinculados, podemos selecionar o primeiro por padrão
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
      {/* Grid de 3 Cartões: 1. Cliente (primeiro), 2. Veículo (vinculado), 3. Relato do Cliente */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3 overflow-hidden">
        {/* Cartão 1: Cliente (Primeiro na ordem) */}
        <div className="h-full bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-3.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-2 pb-2 border-b border-[#f2f4f7] shrink-0">
            <div className="w-6 h-6 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <User size={14} weight="bold" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#101828]">Dados do Cliente</h2>
              <p className="text-[10px] text-[#667085]">Selecione o titular cadastrado</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2 space-y-2 overflow-hidden min-h-0">
            {/* Campo Select de Cliente */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Localizar Cliente <span className="text-[#b42318]">*</span>
              </label>
              <Select
                value={selectedClienteOption}
                onChange={handleSelectCliente}
                options={MOCK_CLIENTES_VEICULOS}
                isClearable
                isSearchable
                placeholder="Buscar por nome, telefone ou CPF..."
                styles={customSelectStyles}
                noOptionsMessage={() => 'Nenhum cliente encontrado'}
              />
            </div>

            {/* Painel Compacto de Dados do Cliente Carregado */}
            <div className="flex-1 bg-[#f9fafb] border border-[#e4e7ec] rounded-xl p-2.5 flex flex-col justify-between overflow-hidden text-xs">
              {cliente ? (
                <div className="space-y-1.5 overflow-hidden">
                  <div className="flex items-center justify-between pb-1 border-b border-[#e4e7ec]/60">
                    <span className="font-extrabold text-[#101828] text-xs truncate">
                      {cliente}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#ecfdf3] text-[#027a48] shrink-0">
                      Cadastrado
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-[#344054] truncate">
                      <IdentificationCard size={13} className="text-[#667085] shrink-0" />
                      <span className="truncate">{documento || 'Sem documento'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#344054] truncate">
                      <Phone size={13} className="text-[#667085] shrink-0" />
                      <span className="truncate">{telefone || 'Sem telefone'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#344054] truncate">
                    <EnvelopeSimple size={13} className="text-[#667085] shrink-0" />
                    <span className="truncate">{email || 'Sem e-mail informado'}</span>
                  </div>

                  {/* Endereço do Cliente */}
                  <div className="pt-1 border-t border-[#e4e7ec]/60">
                    <div className="flex items-start gap-1.5 text-[10.5px] text-[#475467] leading-snug">
                      <MapPin size={13} className="text-[#667085] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{endereco || 'Endereço não cadastrado'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-2 text-[#98a2b3]">
                  <Info size={20} className="mb-1 text-[#98a2b3]" />
                  <p className="text-[11px] font-medium text-[#667085]">Nenhum cliente selecionado</p>
                  <p className="text-[10px] text-[#98a2b3] mt-0.5">
                    Utilize a busca acima para carregar o cadastro completo e veículos.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cartão 2: Veículo (Vinculado ao Cliente) */}
        <div className="h-full bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-3.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-2 pb-2 border-b border-[#f2f4f7] shrink-0">
            <div className="w-6 h-6 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Car size={14} weight="bold" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#101828]">Veículo do Cliente</h2>
              <p className="text-[10px] text-[#667085]">Carro vinculado e dados de entrada</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2 space-y-2 overflow-hidden min-h-0">
            {/* Campo Select de Veículo Vinculado */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
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

            {/* Dados Automáticos do Veículo Selecionado */}
            <div className="bg-[#f9fafb] border border-[#e4e7ec] rounded-xl p-2.5 text-xs">
              {placa ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs px-2 py-0.5 bg-white border border-[#d0d5dd] rounded-md text-[#101828] tracking-wider">
                      {placa}
                    </span>
                    <span className="text-[10px] font-semibold text-[#667085]">
                      {ano || 'Ano N/I'}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-[#101828] truncate mt-1">
                    {marcaModelo || 'Modelo do Veículo'}
                  </p>
                  <p className="text-[10px] text-[#667085]">
                    Cor: <span className="font-medium text-[#344054]">{cor || 'Padrão'}</span>
                  </p>
                </div>
              ) : (
                <div className="py-2 text-center text-[#98a2b3] text-[10.5px]">
                  Selecione o veículo do cliente para exibir os dados.
                </div>
              )}
            </div>

            {/* Únicos Campos a Preencher no Veículo: KM e Combustível */}
            <div className="pt-1 border-t border-[#f2f4f7] space-y-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Quilometragem Atual (KM) <span className="text-[#b42318]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: 64.250 km"
                    value={km}
                    onChange={(e) => updateFormData({ km: e.target.value })}
                    className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2.5 h-8 text-xs font-semibold text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                  />
                  <Speedometer size={15} className="absolute right-2.5 top-2 text-[#98a2b3]" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Nível de Combustível de Entrada
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {['Res.', '1/4', '1/2', '3/4', 'Cheio'].map((nivel) => {
                    const val = nivel === 'Res.' ? 'Reserva' : nivel
                    const isSelected = nivelCombustivel === val || nivelCombustivel === nivel
                    return (
                      <button
                        key={nivel}
                        type="button"
                        onClick={() => updateFormData({ nivelCombustivel: val })}
                        className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-black text-white border-black shadow-xs'
                            : 'bg-[#f9fafb] text-[#475467] border-[#e4e7ec] hover:border-[#d0d5dd] hover:bg-[#f2f4f7]'
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
        <div className="h-full bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-3.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-2 pb-2 border-b border-[#f2f4f7] shrink-0">
            <div className="w-6 h-6 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <ChatText size={14} weight="bold" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#101828]">Relato do Cliente</h2>
              <p className="text-[10px] text-[#667085]">Queixa e condições iniciais do serviço</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2 space-y-2 overflow-hidden min-h-0">
            {/* Tipo de Atendimento e Prioridade */}
            <div className="grid grid-cols-2 gap-2 shrink-0">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Tipo de Atendimento
                </label>
                <select
                  value={tipoAtendimento}
                  onChange={(e) => updateFormData({ tipoAtendimento: e.target.value })}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2 h-8 text-[11px] font-semibold text-[#101828] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="orcamento">Orçamento</option>
                  <option value="corretiva">Manutenção Corretiva</option>
                  <option value="preventiva">Revisão Preventiva</option>
                  <option value="garantia">Retorno em Garantia</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Prioridade
                </label>
                <select
                  value={prioridade}
                  onChange={(e) => updateFormData({ prioridade: e.target.value })}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2 h-8 text-[11px] font-semibold text-[#101828] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>

            {/* Relato do Cliente / Queixa Principal */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Relato do Cliente (Queixa Principal) <span className="text-[#b42318]">*</span>
              </label>
              <textarea
                value={relatoCliente}
                onChange={(e) => updateFormData({ relatoCliente: e.target.value })}
                placeholder="Descreva o que o cliente relatou: barulho na suspensão ao esterçar, luz acesa no painel, vazamento de óleo, revisão periódica..."
                className="flex-1 w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl p-2.5 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Barra Inferior de Navegação Rápida entre Abas */}
      <div className="h-10 shrink-0 bg-white px-4 rounded-xl border border-[#e4e7ec] shadow-xs flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#667085]">
          Aba 1 de 8 • <strong className="text-[#101828]">Cliente e Veiculo</strong>
        </span>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#101828] hover:text-black hover:underline cursor-pointer"
        >
          <span>Avançar para Checklist</span>
          <ArrowRight size={14} weight="bold" />
        </button>
      </div>
    </div>
  )
}
