import React from 'react'
import { Car, User, Phone, Speedometer, ArrowRight } from '@phosphor-icons/react'

export function TabClienteVeiculo({ formData, updateFormData, onNext }) {
  const {
    placa,
    marcaModelo,
    ano,
    cor,
    km,
    nivelCombustivel,
    cliente,
    telefone,
    documento,
    email,
  } = formData

  return (
    <div className="h-full w-full flex flex-col justify-between gap-2.5 overflow-hidden">
      {/* Grid de 2 Cartões: Veículo e Cliente */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-hidden">
        {/* Cartão 1: Veículo */}
        <div className="h-full bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#f2f4f7] shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Car size={16} weight="bold" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#101828]">Identificação do Veículo</h2>
              <p className="text-[10px] text-[#667085]">Dados do carro na entrada da oficina</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2 space-y-2 overflow-hidden">
            {/* Placa em Destaque */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Placa do Veículo <span className="text-[#b42318]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: ABC-1D23"
                value={placa}
                onChange={(e) => updateFormData({ placa: e.target.value.toUpperCase() })}
                className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3 h-9 text-sm font-black text-[#101828] uppercase tracking-wider placeholder-[#98a2b3] focus:outline-none transition-all"
              />
            </div>

            {/* Marca e Modelo */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Marca & Modelo
              </label>
              <input
                type="text"
                placeholder="Ex: Chevrolet Onix 1.0 Flex"
                value={marcaModelo}
                onChange={(e) => updateFormData({ marcaModelo: e.target.value })}
                className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3 h-8.5 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
              />
            </div>

            {/* Ano e Cor */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Ano / Modelo
                </label>
                <input
                  type="text"
                  placeholder="2021/2022"
                  value={ano}
                  onChange={(e) => updateFormData({ ano: e.target.value })}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3 h-8.5 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Cor
                </label>
                <input
                  type="text"
                  placeholder="Prata Metálico"
                  value={cor}
                  onChange={(e) => updateFormData({ cor: e.target.value })}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3 h-8.5 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Quilometragem */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Quilometragem Atual (KM)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: 64.250 km"
                  value={km}
                  onChange={(e) => updateFormData({ km: e.target.value })}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3 h-8.5 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                />
                <Speedometer size={16} className="absolute right-3 top-2.5 text-[#98a2b3]" />
              </div>
            </div>

            {/* Nível de Combustível */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Nível de Combustível
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {['Res.', '1/4', '1/2', '3/4', 'Cheio'].map((nivel) => {
                  const val = nivel === 'Res.' ? 'Reserva' : nivel
                  const isSelected = nivelCombustivel === val || nivelCombustivel === nivel
                  return (
                    <button
                      key={nivel}
                      type="button"
                      onClick={() => updateFormData({ nivelCombustivel: val })}
                      className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center border transition-all cursor-pointer ${
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

        {/* Cartão 2: Cliente */}
        <div className="h-full bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#f2f4f7] shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <User size={16} weight="bold" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#101828]">Dados do Cliente</h2>
              <p className="text-[10px] text-[#667085]">Contato e titular da ordem de serviço</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2 space-y-2 overflow-hidden">
            {/* Nome do Cliente */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Nome do Cliente / Razão Social <span className="text-[#b42318]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nome completo ou empresa"
                value={cliente}
                onChange={(e) => updateFormData({ cliente: e.target.value })}
                className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3 h-8.5 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
              />
            </div>

            {/* Telefone e CPF/CNPJ */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="(43) 90000-0000"
                    value={telefone}
                    onChange={(e) => updateFormData({ telefone: e.target.value })}
                    className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3 h-8.5 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                  />
                  <Phone size={15} className="absolute right-2.5 top-2.5 text-[#98a2b3]" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  CPF ou CNPJ
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={documento}
                  onChange={(e) => updateFormData({ documento: e.target.value })}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3 h-8.5 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                E-mail para Envio de Orçamento
              </label>
              <input
                type="email"
                placeholder="cliente@exemplo.com.br"
                value={email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3 h-8.5 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
              />
            </div>

            {/* Aviso informativo de vínculo */}
            <div className="p-3 bg-[#fafafa] border border-[#e4e7ec] rounded-xl text-[11px] text-[#667085] leading-relaxed">
              <span className="font-bold text-[#101828]">Histórico automático:</span>{' '}
              Se o cliente ou placa já constarem na base de dados, o histórico de manutenções e garantias anteriores será vinculado imediatamente.
            </div>
          </div>
        </div>
      </div>

      {/* Barra Inferior de Navegação Rápida entre Abas */}
      <div className="h-10 shrink-0 bg-white px-4 rounded-xl border border-[#e4e7ec] shadow-xs flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#667085]">
          Aba 1 de 7 • <strong className="text-[#101828]">Cliente e Veículo</strong>
        </span>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#101828] hover:text-black hover:underline cursor-pointer"
        >
          <span>Avançar para Diagnóstico</span>
          <ArrowRight size={14} weight="bold" />
        </button>
      </div>
    </div>
  )
}
