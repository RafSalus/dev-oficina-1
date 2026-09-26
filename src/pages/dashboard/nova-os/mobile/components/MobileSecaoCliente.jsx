import React, { useState, useMemo, useEffect } from 'react'
import Select from 'react-select'
import { IMaskInput } from 'react-imask'
import { useClientesCadastrados } from '../../../../../hooks/useClientesCadastrados'
import { obterMecanicosAtivos } from '../../../../../repositories/funcionariosRepository'
import { formatarTelefone } from '../../../../../utils/fiscalValidators'
import { mobileSelectStyles, inputBaseClass, labelBaseClass } from '../mobileSelectStyles'

export const NIVEIS_COMBUSTIVEL = [
  { value: 'reserva', label: 'Reserva' },
  { value: '1/4', label: '1/4' },
  { value: '1/2', label: '1/2' },
  { value: '3/4', label: '3/4' },
  { value: 'cheio', label: 'Cheio' },
]

export function MobileSecaoCliente({ formData, updateFormData }) {
  const { clientes: listaClientes, carregando: carregandoClientes } = useClientesCadastrados({ incluirVeiculos: true })

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
      veiculoId: primeiroVeic ? primeiroVeic.value || primeiroVeic.id : '',
      placa: primeiroVeic ? primeiroVeic.placa : '',
      marcaModelo: primeiroVeic
        ? primeiroVeic.marcaModelo || `${primeiroVeic.marca || ''} ${primeiroVeic.modelo || ''}`.trim()
        : '',
      km: primeiroVeic ? primeiroVeic.kmPadrao || primeiroVeic.kmAtual || '' : '',
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

  return (
    <div className="space-y-3">
      {/* Cliente */}
      <div className="bg-white p-3 rounded-2xl border border-[#d0d5dd] space-y-2">
        <label className={labelBaseClass}>Cliente do Atendimento</label>
        <Select
          options={clientesOptions}
          value={selectedClienteOption}
          onChange={handleSelectCliente}
          isLoading={carregandoClientes}
          placeholder={carregandoClientes ? 'Carregando clientes...' : 'Pesquise o cliente...'}
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
              <span className="font-bold text-xs text-[#101828]">{formData.marcaModelo}</span>
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
                    className={`h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
  )
}
