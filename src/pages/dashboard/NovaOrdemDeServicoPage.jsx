import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  Car,
  User,
  Phone,
  Wrench,
  Clock,
  CalendarBlank,
  GasPump,
  Speedometer,
  FloppyDisk,
  CheckSquare,
  IdentificationCard,
  Hash,
} from '@phosphor-icons/react'
import { useNotice } from '../../context/NoticeContext'

export function NovaOrdemDeServicoPage() {
  const navigate = useNavigate()
  const { openNotice } = useNotice()

  // Dados do Veículo
  const [placa, setPlaca] = useState('')
  const [marcaModelo, setMarcaModelo] = useState('')
  const [ano, setAno] = useState('')
  const [cor, setCor] = useState('')
  const [km, setKm] = useState('')
  const [nivelCombustivel, setNivelCombustivel] = useState('1/2')

  // Dados do Cliente
  const [cliente, setCliente] = useState('')
  const [telefone, setTelefone] = useState('')
  const [documento, setDocumento] = useState('')
  const [email, setEmail] = useState('')

  // Atendimento e Diagnóstico
  const [tipoAtendimento, setTipoAtendimento] = useState('orcamento')
  const [prioridade, setPrioridade] = useState('normal')
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState('Gabriel')
  const [previsaoData, setPrevisaoData] = useState('')
  const [previsaoHora, setPrevisaoHora] = useState('')
  const [relatoCliente, setRelatoCliente] = useState('')
  const [diagnosticoInicial, setDiagnosticoInicial] = useState('')

  // Checklist de Entrada
  const [checklist, setChecklist] = useState({
    estepe: true,
    macaco: true,
    chaveRoda: true,
    semPertences: true,
  })

  const handleChecklistChange = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!placa.trim()) {
      openNotice('Por favor, informe a placa do veículo.')
      return
    }

    if (!cliente.trim()) {
      openNotice('Por favor, informe o nome do cliente.')
      return
    }

    openNotice(`Ordem de Serviço para o veículo ${placa.toUpperCase()} aberta com sucesso!`)
    navigate('/gestao/ordem-de-servico')
  }

  return (
    <div className="h-full w-full flex flex-col gap-2.5 overflow-hidden select-none">
      {/* Topo Compacto: Breadcrumb, Título e Ações Rápidas */}
      <div className="h-12 shrink-0 bg-white px-4 py-2 rounded-2xl border border-[#e4e7ec] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/gestao/ordem-de-servico"
            className="p-1 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#f2f4f7] transition-colors"
            title="Voltar para Ordens de Serviço"
          >
            <ArrowLeft size={16} weight="bold" />
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#667085]">Ordem de Serviço</span>
            <span className="text-xs text-[#98a2b3]">/</span>
            <h1 className="text-sm font-extrabold text-[#101828] tracking-tight">
              Nova Ordem de Serviço
            </h1>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#f2f4f7] text-[#344054] border border-[#e4e7ec]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#101828]" />
            Em Abertura
          </span>
        </div>

        {/* Ações Rápidas do Topo */}
        <div className="flex items-center gap-2">
          <Link
            to="/gestao/ordem-de-servico"
            className="px-3 py-1.5 text-xs font-semibold text-[#475467] hover:text-[#101828] hover:bg-[#f2f4f7] rounded-xl border border-[#d0d5dd] transition-all"
          >
            Cancelar
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <FloppyDisk size={14} weight="bold" />
            <span>Salvar OS</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: 3 Colunas proporcionais que ocupam exatamente 100% da altura restante sem scroll */}
      <form onSubmit={handleSubmit} className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2.5 overflow-hidden">
        {/* Coluna 1: Dados do Veículo */}
        <div className="lg:col-span-4 h-full bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-3.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#f2f4f7] shrink-0">
            <div className="w-6 h-6 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Car size={14} weight="bold" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#101828]">Identificação do Veículo</h2>
              <p className="text-[10px] text-[#667085]">Dados técnicos e situação de entrada</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2 space-y-2 overflow-hidden">
            {/* Placa em destaque */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Placa <span className="text-[#b42318]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: ABC-1D23"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3 h-8 text-xs font-black text-[#101828] uppercase tracking-wider placeholder-[#98a2b3] focus:outline-none transition-all"
              />
            </div>

            {/* Marca e Modelo */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Marca & Modelo
              </label>
              <input
                type="text"
                placeholder="Ex: Chevrolet Onix 1.0"
                value={marcaModelo}
                onChange={(e) => setMarcaModelo(e.target.value)}
                className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3 h-8 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
              />
            </div>

            {/* Grid Ano e Cor */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Ano / Modelo
                </label>
                <input
                  type="text"
                  placeholder="2021/2022"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2.5 h-8 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Cor
                </label>
                <input
                  type="text"
                  placeholder="Prata"
                  value={cor}
                  onChange={(e) => setCor(e.target.value)}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2.5 h-8 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Quilometragem */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Quilometragem (KM)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: 64.250 km"
                  value={km}
                  onChange={(e) => setKm(e.target.value)}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3 h-8 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                />
                <Speedometer
                  size={15}
                  className="absolute right-2.5 top-2 text-[#98a2b3]"
                />
              </div>
            </div>

            {/* Nível de Combustível */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Nível de Combustível
              </label>
              <div className="grid grid-cols-5 gap-1">
                {['Res.', '1/4', '1/2', '3/4', 'Cheio'].map((nivel) => {
                  const val = nivel === 'Res.' ? 'Reserva' : nivel
                  const isSelected = nivelCombustivel === val || nivelCombustivel === nivel
                  return (
                    <button
                      key={nivel}
                      type="button"
                      onClick={() => setNivelCombustivel(val)}
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

        {/* Coluna 2: Dados do Cliente & Checklist */}
        <div className="lg:col-span-4 h-full bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-3.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#f2f4f7] shrink-0">
            <div className="w-6 h-6 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <User size={14} weight="bold" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#101828]">Dados do Cliente</h2>
              <p className="text-[10px] text-[#667085]">Contato e checklist de entrada</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2 space-y-2 overflow-hidden">
            {/* Nome do Cliente */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Cliente / Razão Social <span className="text-[#b42318]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nome completo ou empresa"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3 h-8 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
              />
            </div>

            {/* Grid Telefone e CPF/CNPJ */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="(43) 90000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2.5 h-8 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                  />
                  <Phone size={14} className="absolute right-2 top-2 text-[#98a2b3]" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  CPF / CNPJ
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2.5 h-8 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                E-mail para Notificações
              </label>
              <input
                type="email"
                placeholder="cliente@exemplo.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3 h-8 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
              />
            </div>

            {/* Checklist de Entrada Compacto */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Checklist de Entrada
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <label className="flex items-center gap-2 p-1.5 rounded-lg bg-[#f9fafb] border border-[#e4e7ec] cursor-pointer hover:bg-[#f2f4f7] transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.estepe}
                    onChange={() => handleChecklistChange('estepe')}
                    className="rounded text-black focus:ring-black accent-black w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-[11px] text-[#344054] font-medium">Estepe</span>
                </label>

                <label className="flex items-center gap-2 p-1.5 rounded-lg bg-[#f9fafb] border border-[#e4e7ec] cursor-pointer hover:bg-[#f2f4f7] transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.macaco}
                    onChange={() => handleChecklistChange('macaco')}
                    className="rounded text-black focus:ring-black accent-black w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-[11px] text-[#344054] font-medium">Macaco</span>
                </label>

                <label className="flex items-center gap-2 p-1.5 rounded-lg bg-[#f9fafb] border border-[#e4e7ec] cursor-pointer hover:bg-[#f2f4f7] transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.chaveRoda}
                    onChange={() => handleChecklistChange('chaveRoda')}
                    className="rounded text-black focus:ring-black accent-black w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-[11px] text-[#344054] font-medium">Chave de roda</span>
                </label>

                <label className="flex items-center gap-2 p-1.5 rounded-lg bg-[#f9fafb] border border-[#e4e7ec] cursor-pointer hover:bg-[#f2f4f7] transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.semPertences}
                    onChange={() => handleChecklistChange('semPertences')}
                    className="rounded text-black focus:ring-black accent-black w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-[11px] text-[#344054] font-medium">Sem pertences</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 3: Diagnóstico, Parâmetros e Prazos */}
        <div className="lg:col-span-4 h-full bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-3.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#f2f4f7] shrink-0">
            <div className="w-6 h-6 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Wrench size={14} weight="bold" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#101828]">Diagnóstico & Prazos</h2>
              <p className="text-[10px] text-[#667085]">Parâmetros técnicos e relato de avaria</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2 space-y-2 overflow-hidden min-h-0">
            {/* Grid 2x2: Tipo, Prioridade, Mecânico, Prazo */}
            <div className="grid grid-cols-2 gap-2 shrink-0">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Tipo
                </label>
                <select
                  value={tipoAtendimento}
                  onChange={(e) => setTipoAtendimento(e.target.value)}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2.5 h-8 text-[11px] font-semibold text-[#101828] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="orcamento">Orçamento</option>
                  <option value="corretiva">Corretiva</option>
                  <option value="preventiva">Preventiva</option>
                  <option value="garantia">Garantia</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Prioridade
                </label>
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value)}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2.5 h-8 text-[11px] font-semibold text-[#101828] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Mecânico
                </label>
                <input
                  type="text"
                  placeholder="Gabriel"
                  value={tecnicoResponsavel}
                  onChange={(e) => setTecnicoResponsavel(e.target.value)}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2.5 h-8 text-[11px] font-semibold text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Previsão Entrega
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="date"
                    value={previsaoData}
                    onChange={(e) => setPrevisaoData(e.target.value)}
                    className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-1.5 h-8 text-[10px] font-medium text-[#101828] focus:outline-none transition-all"
                  />
                  <input
                    type="time"
                    value={previsaoHora}
                    onChange={(e) => setPrevisaoHora(e.target.value)}
                    className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-1.5 h-8 text-[10px] font-medium text-[#101828] focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Relato do Cliente (Textarea flexível) */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Relato do Cliente (Queixa Principal)
              </label>
              <textarea
                value={relatoCliente}
                onChange={(e) => setRelatoCliente(e.target.value)}
                placeholder="Ex: Barulho na suspensão ao esterçar, verificar pastilhas e vibração no pedal..."
                className="flex-1 w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl p-2 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all resize-none leading-snug"
              />
            </div>

            {/* Diagnóstico Inicial (Textarea flexível) */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Diagnóstico Inicial / Observações Técnicas
              </label>
              <textarea
                value={diagnosticoInicial}
                onChange={(e) => setDiagnosticoInicial(e.target.value)}
                placeholder="Ex: Checar folga na barra estabilizadora, espessura dos discos e nível do fluido..."
                className="flex-1 w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl p-2 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all resize-none leading-snug"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
