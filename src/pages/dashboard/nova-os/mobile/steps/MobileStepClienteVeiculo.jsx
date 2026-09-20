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
  IdentificationBadge,
  WhatsappLogo,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { carregarClientesCadastrados } from '../../../../../constants/mockClientesVeiculos'
import { GoogleMapsIcon } from '../../../../../components/icons/GoogleMapsIcon'
import { MobileStepFooter } from '../MobileStepFooter'
import { mobileSelectStyles, inputBaseClass, textareaBaseClass, labelBaseClass } from '../mobileSelectStyles'

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

export function MobileStepClienteVeiculo({ formData, updateFormData, onContinue }) {
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

  const listaClientes = useMemo(() => carregarClientesCadastrados(), [])

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

  const veiculosDisponiveis = useMemo(() => selectedClienteOption?.veiculos || [], [selectedClienteOption])

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

  const clienteIniciais = useMemo(() => {
    if (!cliente) return 'CL'
    return cliente.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  }, [cliente])

  const handleSelectCliente = (option) => {
    if (!option) {
      updateFormData({
        clienteId: '', cliente: '', telefone: '', documento: '', email: '', endereco: '',
        veiculoId: '', placa: '', marcaModelo: '', ano: '', cor: '', km: '',
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

  const handleSelectVeiculo = (option) => {
    if (!option) {
      updateFormData({ veiculoId: '', placa: '', marcaModelo: '', ano: '', cor: '', km: '' })
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

  const handleContinuar = () => {
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
    onContinue()
  }

  return (
    <div>
      {/* Cliente */}
      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3">
        <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#f2f4f7]">
          <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0">
            <User size={18} weight="bold" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#101828] leading-tight">Dados do Cliente</h2>
            <p className="text-xs text-[#667085] mt-0.5">Titular cadastrado no sistema</p>
          </div>
        </div>

        <label className={labelBaseClass}>
          Localizar Cliente <span className="text-[#b42318]">*</span>
        </label>
        <Select
          value={selectedClienteOption}
          onChange={handleSelectCliente}
          options={listaClientes}
          isClearable
          isSearchable
          placeholder="Buscar por nome, telefone ou documento..."
          styles={mobileSelectStyles}
          noOptionsMessage={() => 'Nenhum cliente cadastrado com este termo'}
        />

        {cliente && (
          <div className="mt-3 bg-[#f8fafc] border border-[#d0d5dd] rounded-2xl p-3">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#e2e8f0]">
              <div className="w-11 h-11 rounded-2xl bg-[#101828] text-white flex items-center justify-center font-black text-sm shrink-0">
                {clienteIniciais}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-[#101828] truncate leading-tight">{cliente}</p>
                <div className="flex items-center gap-1.5 text-xs text-[#475467] mt-1">
                  <IdentificationBadge size={14} className="text-[#667085] shrink-0" />
                  <span className="font-mono font-semibold text-[11px]">
                    {documento || 'Documento não informado'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 py-2">
              <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-[#d0d5dd]">
                <div className="w-7 h-7 rounded-lg bg-[#f2f4f7] flex items-center justify-center shrink-0">
                  <Phone size={14} weight="bold" />
                </div>
                <span className="flex-1 font-bold text-xs text-[#101828] truncate">
                  {telefone || 'Sem telefone'}
                </span>
                {telefone && (
                  <a
                    href={`https://wa.me/55${telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg bg-[#25D366] flex items-center justify-center text-white shrink-0"
                  >
                    <WhatsappLogo size={15} weight="fill" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-[#d0d5dd]">
                <div className="w-7 h-7 rounded-lg bg-[#f2f4f7] flex items-center justify-center shrink-0">
                  <EnvelopeSimple size={14} weight="bold" />
                </div>
                <span className="flex-1 font-semibold text-xs text-[#344054] truncate">
                  {email || 'Sem e-mail'}
                </span>
              </div>
            </div>

            {endereco && (
              <div className="pt-2 border-t border-[#e2e8f0] flex items-start gap-2.5">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-white border border-[#d0d5dd] flex items-center justify-center shrink-0 mt-0.5"
                >
                  <GoogleMapsIcon className="w-4 h-5" />
                </a>
                <p className="text-xs font-semibold text-[#101828] leading-relaxed flex-1">{endereco}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Veículo */}
      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3">
        <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#f2f4f7]">
          <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0">
            <Car size={18} weight="bold" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#101828] leading-tight">Veículo do Cliente</h2>
            <p className="text-xs text-[#667085] mt-0.5">Carro vinculado e dados de entrada</p>
          </div>
        </div>

        <label className={labelBaseClass}>
          Selecionar Veículo <span className="text-[#b42318]">*</span>
        </label>
        <Select
          value={selectedVeiculoOption}
          onChange={handleSelectVeiculo}
          options={veiculosDisponiveis}
          isDisabled={!clienteId || veiculosDisponiveis.length === 0}
          isClearable
          isSearchable
          placeholder={!clienteId ? 'Selecione o cliente primeiro...' : 'Escolha o veículo cadastrado...'}
          styles={mobileSelectStyles}
          noOptionsMessage={() => 'Nenhum veículo vinculado a este cliente'}
        />

        {placa && (
          <div className="mt-3 bg-[#f8fafc] border border-[#d0d5dd] rounded-2xl p-3 flex items-center gap-3">
            <div className="flex flex-col items-center bg-white border-2 border-[#101828] rounded-xl px-2.5 py-1.5 shrink-0">
              <span className="text-[7px] font-black uppercase tracking-widest text-[#101828] leading-none mb-0.5">
                BRASIL
              </span>
              <span className="font-mono font-black text-sm text-[#101828] tracking-widest leading-none">
                {placa}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-[#101828] truncate leading-tight">{marcaModelo}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-[#667085]">
                <span className="font-bold text-[#344054]">Ano {ano}</span>
                <span>•</span>
                <span className="font-semibold">{cor}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3">
          <label className={labelBaseClass}>
            Quilometragem Atual (KM) <span className="text-[#b42318]">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ex: 64.250 km"
              value={km}
              onChange={(e) => updateFormData({ km: e.target.value })}
              className={inputBaseClass}
            />
            <Speedometer size={18} className="absolute right-3.5 top-3.5 text-[#98a2b3]" />
          </div>
        </div>

        <div className="mt-3">
          <label className={labelBaseClass}>Nível de Combustível</label>
          <div className="grid grid-cols-5 gap-1.5">
            {['Res.', '1/4', '1/2', '3/4', 'Cheio'].map((nivel) => {
              const val = nivel === 'Res.' ? 'Reserva' : nivel
              const isSelected = nivelCombustivel === val || nivelCombustivel === nivel
              return (
                <button
                  key={nivel}
                  type="button"
                  onClick={() => updateFormData({ nivelCombustivel: val })}
                  className={`h-11 rounded-xl text-[11px] font-bold text-center border transition-all ${
                    isSelected
                      ? 'bg-black text-white border-black'
                      : 'bg-[#f8fafc] text-[#475467] border-[#d0d5dd]'
                  }`}
                >
                  {nivel}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Relato do Cliente */}
      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4">
        <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#f2f4f7]">
          <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0">
            <ChatText size={18} weight="bold" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#101828] leading-tight">Relato do Cliente</h2>
            <p className="text-xs text-[#667085] mt-0.5">Queixa e condições iniciais</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div>
            <label className={labelBaseClass}>Tipo de Atendimento</label>
            <Select
              value={TIPO_ATENDIMENTO_OPTIONS.find((o) => o.value === tipoAtendimento) || TIPO_ATENDIMENTO_OPTIONS[0]}
              onChange={(opt) => updateFormData({ tipoAtendimento: opt?.value || 'orcamento' })}
              options={TIPO_ATENDIMENTO_OPTIONS}
              isSearchable={false}
              styles={mobileSelectStyles}
            />
          </div>
          <div>
            <label className={labelBaseClass}>Prioridade</label>
            <Select
              value={PRIORIDADE_OPTIONS.find((o) => o.value === prioridade) || PRIORIDADE_OPTIONS[0]}
              onChange={(opt) => updateFormData({ prioridade: opt?.value || 'normal' })}
              options={PRIORIDADE_OPTIONS}
              isSearchable={false}
              styles={mobileSelectStyles}
            />
          </div>
        </div>

        <label className={labelBaseClass}>
          Relato do Cliente (Queixa Principal) <span className="text-[#b42318]">*</span>
        </label>
        <textarea
          value={relatoCliente}
          onChange={(e) => updateFormData({ relatoCliente: e.target.value })}
          placeholder="Descreva o que o cliente relatou..."
          rows={4}
          className={textareaBaseClass}
        />
      </div>

      <MobileStepFooter onContinue={handleContinuar} />
    </div>
  )
}
