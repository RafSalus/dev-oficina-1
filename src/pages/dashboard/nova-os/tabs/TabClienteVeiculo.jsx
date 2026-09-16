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
} from '@phosphor-icons/react'
import { MOCK_CLIENTES_VEICULOS } from '../../../../constants/mockClientesVeiculos'

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '38px',
    height: '38px',
    backgroundColor: state.isDisabled ? '#f2f4f7' : state.isFocused ? '#ffffff' : '#f9fafb',
    borderColor: state.isFocused ? '#101828' : '#e4e7ec',
    borderWidth: '1px',
    borderRadius: '12px',
    boxShadow: state.isFocused ? '0 0 0 1px #101828' : 'none',
    fontSize: '12px',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
      borderColor: state.isFocused ? '#101828' : '#d0d5dd',
      backgroundColor: state.isDisabled ? '#f2f4f7' : '#ffffff',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    height: '38px',
    padding: '0 12px',
  }),
  input: (base) => ({
    ...base,
    margin: '0px',
    color: '#101828',
    fontSize: '12px',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '38px',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '4px 8px',
    color: '#667085',
    '&:hover': { color: '#101828' },
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '4px 6px',
    color: '#667085',
    '&:hover': { color: '#101828' },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '14px',
    border: '1px solid #e4e7ec',
    boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
    zIndex: 50,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    padding: '4px',
  }),
  menuList: (base) => ({
    ...base,
    padding: '2px',
    maxHeight: '190px',
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: state.isSelected ? 700 : 500,
    backgroundColor: state.isSelected
      ? '#101828'
      : state.isFocused
      ? '#f2f4f7'
      : 'transparent',
    color: state.isSelected ? '#ffffff' : '#101828',
    cursor: 'pointer',
    padding: '8px 12px',
    transition: 'all 0.1s ease',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#101828',
    fontWeight: 600,
    fontSize: '12px',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#98a2b3',
    fontSize: '12px',
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
      {/* Grid de 3 Cartões: 1. Cliente, 2. Veículo, 3. Relato do Cliente */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3 overflow-hidden">
        {/* Cartão 1: Cliente (Primeiro na ordem) */}
        <div className="h-full bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[#f2f4f7] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
                <User size={15} weight="bold" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#101828]">Dados do Cliente</h2>
                <p className="text-[10px] text-[#667085]">Titular cadastrado no sistema</p>
              </div>
            </div>

            {cliente && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ecfdf3] text-[#027a48] border border-[#a6f4c5]">
                Cliente Ativo
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between py-2 space-y-2.5 overflow-hidden min-h-0">
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
                placeholder="Buscar por nome, telefone ou documento..."
                styles={customSelectStyles}
                noOptionsMessage={() => 'Nenhum cliente cadastrado com este termo'}
              />
            </div>

            {/* Painel Executivo do Cliente Selecionado */}
            {cliente ? (
              <div className="flex-1 bg-[#fafafa] border border-[#e4e7ec] rounded-xl p-3 flex flex-col justify-between overflow-hidden shadow-2xs">
                {/* Linha Superior: Avatar, Nome e CPF/CNPJ */}
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#e4e7ec]/70">
                  <div className="w-10 h-10 rounded-xl bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs tracking-wider">
                    {clienteIniciais}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-[#101828] truncate leading-snug">
                      {cliente}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#475467] mt-0.5">
                      <IdentificationBadge size={13} className="text-[#667085] shrink-0" />
                      <span className="font-mono font-medium">{documento || 'Documento não informado'}</span>
                    </div>
                  </div>
                </div>

                {/* Contatos: Telefone e E-mail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-1 text-xs">
                  <div className="flex items-center gap-2 text-[#344054] truncate">
                    <div className="w-5 h-5 rounded-md bg-[#f2f4f7] flex items-center justify-center text-[#475467] shrink-0">
                      <Phone size={12} weight="bold" />
                    </div>
                    <span className="font-semibold text-[11.5px] truncate text-[#101828]">
                      {telefone || 'Sem telefone'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[#344054] truncate">
                    <div className="w-5 h-5 rounded-md bg-[#f2f4f7] flex items-center justify-center text-[#475467] shrink-0">
                      <EnvelopeSimple size={12} weight="bold" />
                    </div>
                    <span className="font-medium text-[11.5px] truncate text-[#475467]">
                      {email || 'Sem e-mail'}
                    </span>
                  </div>
                </div>

                {/* Bloco de Endereço Completo */}
                <div className="pt-2 border-t border-[#e4e7ec]/70 flex items-start gap-2 text-xs">
                  <div className="w-5 h-5 rounded-md bg-[#f2f4f7] flex items-center justify-center text-[#101828] shrink-0 mt-0.5">
                    <MapPin size={12} weight="bold" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9.5px] uppercase font-extrabold tracking-wider text-[#667085] leading-none mb-1">
                      Endereço Completo
                    </p>
                    <p className="text-[11px] font-medium text-[#101828] leading-snug line-clamp-2">
                      {endereco || 'Endereço residencial ou comercial não informado'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#d0d5dd] rounded-xl bg-[#fafafa]">
                <div className="w-9 h-9 rounded-xl bg-[#f2f4f7] flex items-center justify-center text-[#667085] mb-2">
                  <User size={18} />
                </div>
                <p className="text-xs font-bold text-[#101828]">Nenhum cliente selecionado</p>
                <p className="text-[10.5px] text-[#667085] max-w-[210px] mt-1 leading-snug">
                  Pesquise pelo nome, telefone ou documento no campo acima para vincular o titular.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cartão 2: Veículo (Vinculado estritamente ao Cliente) */}
        <div className="h-full bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[#f2f4f7] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
                <Car size={15} weight="bold" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#101828]">Veículo do Cliente</h2>
                <p className="text-[10px] text-[#667085]">Carro vinculado e condições de entrada</p>
              </div>
            </div>

            {placa && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f2f4f7] text-[#344054] border border-[#e4e7ec]">
                Veículo Identificado
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between py-2 space-y-2.5 overflow-hidden min-h-0">
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

            {/* Vitrine do Veículo Selecionado */}
            {placa ? (
              <div className="bg-[#fafafa] border border-[#e4e7ec] rounded-xl p-3 flex items-center gap-3 shadow-2xs">
                {/* Emblema da Placa com Estilo Automotivo Mercosul */}
                <div className="flex flex-col items-center bg-white border border-[#101828] rounded-md px-2.5 py-1 shrink-0 shadow-xs">
                  <span className="text-[7.5px] font-extrabold uppercase tracking-widest text-[#101828] leading-none">
                    BRASIL
                  </span>
                  <span className="font-mono font-black text-sm text-[#101828] tracking-widest leading-tight">
                    {placa}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-[#101828] truncate leading-tight">
                    {marcaModelo}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[#667085]">
                    <span className="font-semibold text-[#344054]">Ano {ano}</span>
                    <span>•</span>
                    <span className="font-medium text-[#475467]">Cor {cor}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-3 text-center border border-dashed border-[#d0d5dd] rounded-xl bg-[#fafafa]">
                <p className="text-xs font-bold text-[#101828]">
                  {!clienteId ? 'Aguardando cliente' : 'Nenhum veículo selecionado'}
                </p>
                <p className="text-[10.5px] text-[#667085] mt-0.5">
                  {!clienteId
                    ? 'Selecione o cliente ao lado para carregar os veículos vinculados.'
                    : 'Escolha um dos veículos cadastrados no seletor acima.'}
                </p>
              </div>
            )}

            {/* Únicos Campos a Preencher: KM e Nível de Combustível */}
            <div className="pt-2 border-t border-[#f2f4f7] space-y-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#344054]">
                    Quilometragem Atual (KM) <span className="text-[#b42318]">*</span>
                  </label>
                  <span className="text-[10px] text-[#667085]">Preenchimento de entrada</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: 64.250 km"
                    value={km}
                    onChange={(e) => updateFormData({ km: e.target.value })}
                    className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3 h-8.5 text-xs font-extrabold text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all shadow-2xs"
                  />
                  <Speedometer size={16} className="absolute right-3 top-2 text-[#98a2b3]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#344054]">
                    Nível de Combustível de Entrada
                  </label>
                  <span className="text-[10px] text-[#667085]">Marcador do painel</span>
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
                        className={`py-1.5 px-1 rounded-xl text-[10.5px] font-bold text-center border transition-all cursor-pointer ${
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
        <div className="h-full bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[#f2f4f7] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
                <ChatText size={15} weight="bold" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#101828]">Relato do Cliente</h2>
                <p className="text-[10px] text-[#667085]">Queixa e condições iniciais do serviço</p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f2f4f7] text-[#344054] border border-[#e4e7ec]">
              Recepção
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2 space-y-2.5 overflow-hidden min-h-0">
            {/* Tipo de Atendimento e Prioridade */}
            <div className="grid grid-cols-2 gap-2 shrink-0">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Tipo de Atendimento
                </label>
                <select
                  value={tipoAtendimento}
                  onChange={(e) => updateFormData({ tipoAtendimento: e.target.value })}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2.5 h-8.5 text-xs font-semibold text-[#101828] focus:outline-none transition-all cursor-pointer"
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
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2.5 h-8.5 text-xs font-semibold text-[#101828] focus:outline-none transition-all cursor-pointer"
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
                className="flex-1 w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl p-3 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all resize-none leading-relaxed"
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
