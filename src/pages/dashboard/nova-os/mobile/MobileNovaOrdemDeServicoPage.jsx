import React, { useState, useMemo, useEffect } from 'react'
import {
  Receipt,
  User,
  Car,
  ChatText,
  ShieldCheck,
  Wrench,
  X,
  Lightning,
  Sparkle,
  Phone,
  WhatsappLogo,
  Speedometer,
  GasPump,
  Plus,
} from '@phosphor-icons/react'
import Select from 'react-select'
import { IMaskInput } from 'react-imask'
import { toast } from 'sonner'
import { carregarClientesCadastrados } from '../../../../constants/mockClientesVeiculos'
import { MOCK_MECANICOS } from '../../../../constants/mecanicos' // kept for backward compat, no longer seeded
import { obterMecanicosAtivos } from '../../../../repositories/funcionariosRepository'
import { ITENS_CHECKLIST_ENTRADA } from '../../../../constants/checklistItems'
import { formatarCPF, formatarCNPJ, formatarTelefone } from '../../../../utils/fiscalValidators'
import { mobileSelectStyles, inputBaseClass, labelBaseClass } from './mobileSelectStyles'

const NIVEIS_COMBUSTIVEL = [
  { value: 'reserva', label: 'Reserva' },
  { value: '1/4', label: '1/4' },
  { value: '1/2', label: '1/2' },
  { value: '3/4', label: '3/4' },
  { value: 'cheio', label: 'Cheio' },
]

export function MobileNovaOrdemDeServicoPage({
  formData,
  updateFormData,
  onFechar,
  onSalvarFila,
}) {
  const [secaoAtiva, setSecaoAtiva] = useState('cliente') // 'cliente' | 'relato' | 'checklist'

  const listaClientes = useMemo(() => carregarClientesCadastrados(), [])

  const clientesOptions = useMemo(() => {
    return listaClientes.map((c) => ({
      value: c.value || c.id,
      label: `${c.nome} • ${c.telefone || ''}`,
      dados: c,
    }))
  }, [listaClientes])

  const selectedClienteOption = useMemo(() => {
    if (!formData.clienteId && !formData.cliente) return null
    return (
      clientesOptions.find(
        (opt) =>
          (formData.clienteId && opt.value === formData.clienteId) ||
          (formData.cliente && opt.dados.nome?.toLowerCase() === formData.cliente?.toLowerCase())
      ) || null
    )
  }, [formData.clienteId, formData.cliente, clientesOptions])

  const veiculosDoCliente = useMemo(() => {
    if (!selectedClienteOption?.dados?.veiculos) return []
    return selectedClienteOption.dados.veiculos
  }, [selectedClienteOption])

  const veiculosOptions = useMemo(() => {
    return veiculosDoCliente.map((v) => ({
      value: v.value || v.id || v.placa,
      label: `${v.placa} • ${v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim()}`,
      dados: v,
    }))
  }, [veiculosDoCliente])

  const selectedVeiculoOption = useMemo(() => {
    if (!formData.placa && !formData.veiculoId) return null
    return (
      veiculosOptions.find(
        (opt) =>
          (formData.veiculoId && opt.value === formData.veiculoId) ||
          (formData.placa && opt.dados.placa?.toUpperCase().trim() === formData.placa?.toUpperCase().trim())
      ) || null
    )
  }, [formData.veiculoId, formData.placa, veiculosOptions])

  const [mecanicosLista, setMecanicosLista] = useState([
    { value: '', label: 'Selecione o mecânico', nome: '' },
  ])

  useEffect(() => {
    let cancelado = false
    const carregarMecs = async () => {
      try {
        const ativos = await obterMecanicosAtivos()
        if (!cancelado && ativos && ativos.length > 0) {
          setMecanicosLista([
            { value: '', label: 'Selecione o mecânico', nome: '' },
            ...ativos.map((a) => ({
              value: a.id,
              label: a.nome,
              nome: a.nome,
              cargo: a.cargoLabel || a.cargo,
            })),
          ])
        }
      } catch (e) {
        console.error('Erro ao carregar mecânicos ativos no mobile:', e)
      }
    }
    carregarMecs()
    window.addEventListener('dev_oficina_funcionarios_updated', carregarMecs)
    return () => {
      cancelado = true
      window.removeEventListener('dev_oficina_funcionarios_updated', carregarMecs)
    }
  }, [])

  const handleSelectCliente = (option) => {
    if (!option) {
      updateFormData({
        clienteId: '',
        cliente: '',
        telefone: '',
        documento: '',
        veiculoId: '',
        placa: '',
        marcaModelo: '',
        km: '',
      })
      return
    }
    const c = option.dados
    const primeiroVeic = Array.isArray(c.veiculos) && c.veiculos.length > 0 ? c.veiculos[0] : null
    updateFormData({
      clienteId: c.value || c.id,
      cliente: c.nome,
      telefone: c.telefone || '',
      documento: c.documento || '',
      veiculoId: primeiroVeic ? (primeiroVeic.value || primeiroVeic.id) : '',
      placa: primeiroVeic ? primeiroVeic.placa : '',
      marcaModelo: primeiroVeic
        ? primeiroVeic.marcaModelo || `${primeiroVeic.marca || ''} ${primeiroVeic.modelo || ''}`.trim()
        : '',
      km: primeiroVeic ? (primeiroVeic.kmPadrao || primeiroVeic.kmAtual || '') : '',
    })
  }

  const handleSelectVeiculo = (option) => {
    if (!option) {
      updateFormData({ veiculoId: '', placa: '', marcaModelo: '', km: '' })
      return
    }
    const v = option.dados
    updateFormData({
      veiculoId: v.value || v.id,
      placa: v.placa || '',
      marcaModelo: v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim(),
      km: v.kmPadrao || v.kmAtual || formData.km || '',
    })
  }

  const handleMarcarTodosConformes = () => {
    const todosOk = {}
    ITENS_CHECKLIST_ENTRADA.forEach((item) => {
      todosOk[item.id] = { status: 'conforme', obs: '' }
    })
    updateFormData({ checklistEntrada: todosOk })
    toast.success('Todos os itens do Checklist foram marcados como Conforme!')
  }

  const checklistEntrada = formData.checklistEntrada || {}
  const preenchidosCount = ITENS_CHECKLIST_ENTRADA.filter(
    (item) => Boolean(checklistEntrada[item.id]?.status)
  ).length

  return (
    <div className="h-full w-full flex flex-col bg-[#f8fafc] overflow-hidden select-none">
      {/* Top Header Mobile */}
      <div className="shrink-0 bg-[#101828] text-white px-3.5 py-2.5 flex items-center justify-between border-b border-black">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#0284c7] flex items-center justify-center text-white">
            <Receipt size={16} weight="bold" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-[#98a2b3] uppercase tracking-wider block">
              NOVA ORDEM DE SERVICO
            </span>
            <span className="font-mono font-black text-sm text-white">#{formData.numeroOS}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onFechar}
          className="p-1.5 rounded-lg text-[#98a2b3] hover:text-white bg-white/10"
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      {/* Seletor de Seções Mobile */}
      <div className="shrink-0 bg-white border-b border-[#e4e7ec] p-1.5 flex gap-1">
        <button
          type="button"
          onClick={() => setSecaoAtiva('cliente')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
            secaoAtiva === 'cliente'
              ? 'bg-[#101828] text-white shadow-2xs'
              : 'text-[#475467] bg-[#f8fafc]'
          }`}
        >
          1. Cliente e Veiculo
        </button>

        <button
          type="button"
          onClick={() => setSecaoAtiva('relato')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
            secaoAtiva === 'relato'
              ? 'bg-[#101828] text-white shadow-2xs'
              : 'text-[#475467] bg-[#f8fafc]'
          }`}
        >
          <span>2. Relato e Queixa</span>
          {!formData.relatoCliente?.trim() && (
            <span
              className={`w-1.5 h-1.5 rounded-full ${secaoAtiva === 'relato' ? 'bg-rose-400' : 'bg-rose-500'}`}
              title="Obrigatorio para salvar a OS"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSecaoAtiva('checklist')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
            secaoAtiva === 'checklist'
              ? 'bg-[#101828] text-white shadow-2xs'
              : 'text-[#475467] bg-[#f8fafc]'
          }`}
        >
          <span>3. Vistoria</span>
          <span className="text-[9px] px-1 rounded-full bg-[#0284c7] text-white font-extrabold">
            {preenchidosCount}/22
          </span>
        </button>
      </div>

      {/* Conteúdo com Scroll Mobile */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        {secaoAtiva === 'cliente' && (
          <div className="space-y-3">
            {/* Cliente */}
            <div className="bg-white p-3 rounded-2xl border border-[#d0d5dd] space-y-2">
              <label className={labelBaseClass}>Cliente do Atendimento</label>
              <Select
                options={clientesOptions}
                value={selectedClienteOption}
                onChange={handleSelectCliente}
                placeholder="Pesquise o cliente..."
                styles={mobileSelectStyles}
                isSearchable
              />
              {formData.cliente && (
                <div className="p-2 rounded-xl bg-[#f8fafc] border border-[#e4e7ec] text-xs">
                  <p className="font-bold text-[#101828]">{formData.cliente}</p>
                  <p className="text-[#667085]">{formatarTelefone(formData.telefone)}</p>
                </div>
              )}
            </div>

            {/* Veículo */}
            <div className="bg-white p-3 rounded-2xl border border-[#d0d5dd] space-y-2">
              <label className={labelBaseClass}>Veiculo da Frota</label>
              <Select
                options={veiculosOptions}
                value={selectedVeiculoOption}
                onChange={handleSelectVeiculo}
                placeholder="Selecione o veiculo..."
                styles={mobileSelectStyles}
                isDisabled={!formData.clienteId}
              />

              {formData.placa && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#f8fafc] border border-[#e4e7ec]">
                    <span className="font-mono font-black text-sm text-[#101828] bg-white px-2 py-0.5 rounded border">
                      {formData.placa.toUpperCase()}
                    </span>
                    <span className="font-bold text-xs text-[#101828]">
                      {formData.marcaModelo}
                    </span>
                  </div>

                  <div>
                    <label className={labelBaseClass}>KM Atual (Obrigatorio)</label>
                    <IMaskInput
                      mask="000.000"
                      value={formData.km || ''}
                      onAccept={(val) => updateFormData({ km: val })}
                      placeholder="Ex: 280.812"
                      className={`${inputBaseClass} font-mono font-bold text-base`}
                    />
                  </div>

                  <div>
                    <label className={labelBaseClass}>Nivel de Combustivel</label>
                    <div className="grid grid-cols-5 gap-1 bg-[#f8fafc] p-1 rounded-xl border border-[#d0d5dd]">
                      {NIVEIS_COMBUSTIVEL.map((nv) => (
                        <button
                          key={nv.value}
                          type="button"
                          onClick={() => updateFormData({ nivelCombustivel: nv.value })}
                          className={`h-8 rounded-lg text-xs font-bold transition-all ${
                            formData.nivelCombustivel === nv.value
                              ? 'bg-[#101828] text-white'
                              : 'text-[#667085]'
                          }`}
                        >
                          {nv.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mecânico */}
            <div className="bg-white p-3 rounded-2xl border border-[#d0d5dd] space-y-1">
              <label className={labelBaseClass}>Mecanico Responsavel</label>
              <Select
                options={mecanicosLista}
                value={mecanicosLista.find((m) => m.value === formData.mecanicoId) || mecanicosLista[0]}
                onChange={(opt) =>
                  updateFormData({
                    mecanicoId: opt?.value || '',
                    mecanicoNome: opt?.value ? opt.nome : '',
                  })
                }
                styles={mobileSelectStyles}
                isSearchable={false}
              />
            </div>
          </div>
        )}

        {secaoAtiva === 'relato' && (
          <div className="bg-white p-3 rounded-2xl border border-[#d0d5dd] space-y-3">
            <label className={labelBaseClass}>Relato do Cliente / Sintomas Informados (Obrigatorio)</label>
            <textarea
              value={formData.relatoCliente || ''}
              onChange={(e) => updateFormData({ relatoCliente: e.target.value })}
              placeholder="Descreva detalhadamente o defeito informado pelo cliente..."
              rows={6}
              className="w-full p-3 rounded-xl border border-[#d0d5dd] text-base font-medium text-[#101828] bg-[#f8fafc] focus:bg-white focus:outline-none focus:border-[#0284c7]"
            />

            <div>
              <label className={labelBaseClass}>Objetos Deixados no Veiculo</label>
              <input
                type="text"
                value={formData.objetosVeiculo || ''}
                onChange={(e) => updateFormData({ objetosVeiculo: e.target.value })}
                placeholder="Ex: Estepe, macaco, ferramentas..."
                className={inputBaseClass}
              />
            </div>

            <div>
              <label className={labelBaseClass}>Avarias Pre-existentes</label>
              <input
                type="text"
                value={formData.avariasVisual || ''}
                onChange={(e) => updateFormData({ avariasVisual: e.target.value })}
                placeholder="Ex: Risco na porta, mossa para-lama..."
                className={inputBaseClass}
              />
            </div>
          </div>
        )}

        {secaoAtiva === 'checklist' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between bg-[#f0f9ff] p-2.5 rounded-xl border border-[#bae6fd]">
              <span className="text-xs font-bold text-[#0369a1]">
                Vistoria de Entrada (22 Itens)
              </span>
              <button
                type="button"
                onClick={handleMarcarTodosConformes}
                className="h-8 px-2.5 rounded-lg bg-[#0284c7] text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
              >
                <Sparkle size={12} weight="fill" />
                <span>Todos OK</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {ITENS_CHECKLIST_ENTRADA.map((item) => {
                const itemState = checklistEntrada[item.id] || { status: '' }
                const isConforme = itemState.status === 'conforme'
                const isNao = itemState.status === 'nao_conforme'

                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      isConforme
                        ? 'bg-[#f0f9ff] border-[#bae6fd]'
                        : isNao
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-white border-[#e4e7ec]'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-[#101828]">{item.label}</p>
                      <p className="text-[10px] text-[#667085]">{item.desc}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          updateFormData({
                            checklistEntrada: {
                              ...checklistEntrada,
                              [item.id]: { status: isConforme ? '' : 'conforme', obs: '' },
                            },
                          })
                        }
                        className={`h-7 px-2.5 rounded-lg text-xs font-bold ${
                          isConforme ? 'bg-[#0284c7] text-white' : 'bg-[#f2f4f7] text-[#475467]'
                        }`}
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateFormData({
                            checklistEntrada: {
                              ...checklistEntrada,
                              [item.id]: { status: isNao ? '' : 'nao_conforme', obs: '' },
                            },
                          })
                        }
                        className={`h-7 px-2 rounded-lg text-xs font-bold ${
                          isNao ? 'bg-rose-600 text-white' : 'bg-[#f2f4f7] text-[#475467]'
                        }`}
                      >
                        Nao
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Rodapé Fixo Mobile */}
      <div className="shrink-0 bg-white p-2.5 border-t border-[#e4e7ec] flex gap-2">
        <button
          type="button"
          onClick={onFechar}
          className="h-10 px-3 rounded-xl border border-[#d0d5dd] text-[#475467] font-bold text-xs"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={onSalvarFila}
          className="flex-1 h-10 rounded-xl bg-[#0284c7] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
        >
          <Lightning size={16} weight="fill" />
          <span>Salvar e Enviar para a Fila</span>
        </button>
      </div>
    </div>
  )
}
