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
    manual: false,
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

    // Feedback e redirecionamento profissional
    openNotice(`Ordem de Serviço para o veículo ${placa.toUpperCase()} aberta com sucesso!`)
    navigate('/gestao/ordem-de-servico')
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-8 animate-in fade-in duration-200 select-none">
      {/* Topo da Tela: Breadcrumbs e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-[#e4e7ec] shadow-xs">
        <div className="flex flex-col gap-1">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#667085]">
            <Link
              to="/gestao/ordem-de-servico"
              className="hover:text-[#101828] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft size={14} weight="bold" />
              <span>Ordem de Serviço</span>
            </Link>
            <span>/</span>
            <span className="text-[#101828] font-bold">Nova OS</span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#101828] tracking-tight">
              Nova Ordem de Serviço
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f2f4f7] text-[#344054] border border-[#e4e7ec]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#101828]" />
              Em Abertura
            </span>
          </div>
        </div>

        {/* Botões do Topo */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <Link
            to="/gestao/ordem-de-servico"
            className="px-4 py-2 text-xs font-semibold text-[#475467] hover:text-[#101828] hover:bg-[#f2f4f7] rounded-xl border border-[#d0d5dd] transition-all"
          >
            Cancelar
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <FloppyDisk size={16} weight="bold" />
            <span>Salvar OS</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloco 1: Veículo e Cliente em 2 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Dados do Veículo */}
          <div className="bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#f2f4f7]">
              <div className="w-8 h-8 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
                <Car size={18} weight="bold" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#101828]">Identificação do Veículo</h2>
                <p className="text-[11px] text-[#667085]">Dados técnicos e situação na entrada</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Placa */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Placa <span className="text-[#b42318]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: ABC-1D23"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3.5 h-10 text-sm font-extrabold text-[#101828] uppercase tracking-wider placeholder-[#98a2b3] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Marca e Modelo */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Marca & Modelo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Chevrolet Onix 1.0 Flex"
                  value={marcaModelo}
                  onChange={(e) => setMarcaModelo(e.target.value)}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3.5 h-10 text-sm font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                />
              </div>

              {/* Ano */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Ano / Modelo
                </label>
                <input
                  type="text"
                  placeholder="Ex: 2021/2022"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3.5 h-10 text-sm font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                />
              </div>

              {/* Cor */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Cor
                </label>
                <input
                  type="text"
                  placeholder="Ex: Prata Metálico"
                  value={cor}
                  onChange={(e) => setCor(e.target.value)}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3.5 h-10 text-sm font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                />
              </div>

              {/* Km Atual */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Quilometragem (KM)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: 64.250 km"
                    value={km}
                    onChange={(e) => setKm(e.target.value)}
                    className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3.5 h-10 text-sm font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                  />
                  <Speedometer
                    size={18}
                    className="absolute right-3.5 top-2.5 text-[#98a2b3]"
                  />
                </div>
              </div>

              {/* Nível de Combustível */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-2">
                  Nível de Combustível
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['Reserva', '1/4', '1/2', '3/4', 'Cheio'].map((nivel) => {
                    const isSelected = nivelCombustivel === nivel
                    return (
                      <button
                        key={nivel}
                        type="button"
                        onClick={() => setNivelCombustivel(nivel)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
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

          {/* Card: Dados do Cliente */}
          <div className="bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#f2f4f7]">
              <div className="w-8 h-8 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
                <User size={18} weight="bold" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#101828]">Dados do Cliente</h2>
                <p className="text-[11px] text-[#667085]">Contato e faturamento da ordem de serviço</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Nome do Cliente */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  Nome do Cliente / Razão Social <span className="text-[#b42318]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo ou empresa"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3.5 h-10 text-sm font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Telefone / WhatsApp */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                    Telefone / WhatsApp
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="(43) 90000-0000"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3.5 h-10 text-sm font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                    />
                    <Phone size={16} className="absolute right-3.5 top-3 text-[#98a2b3]" />
                  </div>
                </div>

                {/* CPF / CNPJ */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                    CPF ou CNPJ
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3.5 h-10 text-sm font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                  E-mail para envio de orçamento
                </label>
                <input
                  type="email"
                  placeholder="cliente@exemplo.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3.5 h-10 text-sm font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
                />
              </div>

              {/* Checklist de Entrada Rápido */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-2">
                  Checklist de Entrada
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-[#f9fafb] border border-[#e4e7ec] cursor-pointer hover:bg-[#f2f4f7] transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.estepe}
                      onChange={() => handleChecklistChange('estepe')}
                      className="rounded text-black focus:ring-black accent-black w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[#344054] font-medium">Estepe</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-[#f9fafb] border border-[#e4e7ec] cursor-pointer hover:bg-[#f2f4f7] transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.macaco}
                      onChange={() => handleChecklistChange('macaco')}
                      className="rounded text-black focus:ring-black accent-black w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[#344054] font-medium">Macaco</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-[#f9fafb] border border-[#e4e7ec] cursor-pointer hover:bg-[#f2f4f7] transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.chaveRoda}
                      onChange={() => handleChecklistChange('chaveRoda')}
                      className="rounded text-black focus:ring-black accent-black w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[#344054] font-medium">Chave de roda</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 2: Relato, Diagnóstico e Parâmetros */}
        <div className="bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#f2f4f7]">
            <div className="w-8 h-8 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Wrench size={18} weight="bold" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#101828]">Diagnóstico & Condições do Atendimento</h2>
              <p className="text-[11px] text-[#667085]">Relato do condutor, sintomas e prazos técnicos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tipo de Atendimento */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Tipo de Atendimento
              </label>
              <select
                value={tipoAtendimento}
                onChange={(e) => setTipoAtendimento(e.target.value)}
                className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3.5 h-10 text-xs font-semibold text-[#101828] focus:outline-none transition-all cursor-pointer"
              >
                <option value="orcamento">Orçamento Preliminar</option>
                <option value="corretiva">Manutenção Corretiva</option>
                <option value="preventiva">Revisão Preventiva</option>
                <option value="garantia">Retorno em Garantia</option>
              </select>
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Prioridade
              </label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value)}
                className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3.5 h-10 text-xs font-semibold text-[#101828] focus:outline-none transition-all cursor-pointer"
              >
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente (Veículo parado)</option>
              </select>
            </div>

            {/* Técnico Responsável */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Mecânico Responsável
              </label>
              <input
                type="text"
                placeholder="Ex: Gabriel (Mestre Mecânico)"
                value={tecnicoResponsavel}
                onChange={(e) => setTecnicoResponsavel(e.target.value)}
                className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3.5 h-10 text-xs font-semibold text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
              />
            </div>

            {/* Previsão de Entrega */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Previsão de Entrega
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={previsaoData}
                  onChange={(e) => setPrevisaoData(e.target.value)}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2.5 h-10 text-xs font-medium text-[#101828] focus:outline-none transition-all"
                />
                <input
                  type="time"
                  value={previsaoHora}
                  onChange={(e) => setPrevisaoHora(e.target.value)}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-2.5 h-10 text-xs font-medium text-[#101828] focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Relato do Cliente */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-1.5">
                Relato do Cliente (Queixa Principal)
              </label>
              <textarea
                rows={4}
                placeholder="Ex: Cliente relata ruído agudo na frenagem em baixa velocidade e vibração no pedal de freio. Luz de injeção acendeu no painel..."
                value={relatoCliente}
                onChange={(e) => setRelatoCliente(e.target.value)}
                className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl p-3.5 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Diagnóstico Inicial */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-1.5">
                Diagnóstico Inicial / Observações da Recepção
              </label>
              <textarea
                rows={4}
                placeholder="Ex: Desgaste visual nas pastilhas dianteiras. Testar espessura dos discos e passar scanner na injeção para verificar códigos de falha armazenados..."
                value={diagnosticoInicial}
                onChange={(e) => setDiagnosticoInicial(e.target.value)}
                className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl p-3.5 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Rodapé do Formulário: Ações de Finalização */}
        <div className="bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#667085]">
            Ao abrir a OS, o atendimento entrará na fila operacional da oficina.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link
              to="/gestao/ordem-de-servico"
              className="px-5 py-2.5 text-xs font-semibold text-[#475467] hover:text-[#101828] hover:bg-[#f2f4f7] rounded-xl border border-[#d0d5dd] transition-all text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle size={16} weight="bold" />
              <span>Criar Ordem de Serviço</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
