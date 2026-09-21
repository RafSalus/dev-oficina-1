import React, { useState, useEffect } from 'react'
import { Gauge, CheckCircle, X } from '@phosphor-icons/react'
import { IMaskInput } from 'react-imask'
import { toast } from 'sonner'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { atualizarHodometroVeiculo } from '../../constants/mockManutencaoPreventiva'

export function ModalAtualizarKmVeiculo({ isOpen, onClose, veiculo, onAtualizado }) {
  const [kmInput, setKmInput] = useState('')

  useEffect(() => {
    if (veiculo) {
      setKmInput(veiculo.kmPadrao || veiculo.kmAtual || '')
    }
  }, [veiculo])

  if (!isOpen || !veiculo) return null

  const handleSalvar = (e) => {
    e.preventDefault()
    if (!kmInput || !kmInput.trim()) {
      toast.error('Informe a quilometragem atual do veículo.')
      return
    }

    atualizarHodometroVeiculo(veiculo.placa, kmInput.trim())
    toast.success(`Quilometragem do veículo ${veiculo.placa} atualizada para ${kmInput} km!`)
    if (onAtualizado) onAtualizado()
    onClose()
  }

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      chaveStorage="modal_redimensionavel_atualizar_km_preventiva"
      larguraPadrao={500}
      alturaPadrao={380}
      larguraMinima={460}
      alturaMinima={340}
      larguraMaxima={720}
      alturaMaxima={600}
      titulo="Atualizar Hodômetro do Veículo"
      subtitulo={`${veiculo.placa} - ${veiculo.marcaModelo || veiculo.modelo}`}
      badge="Quilometragem"
      icone={Gauge}
      rodape={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle size={15} weight="bold" />
            <span>Salvar e Recalcular Saúde</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSalvar} className="space-y-4 py-1">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <p className="text-xs text-slate-600">
            Proprietário: <strong className="text-slate-900">{veiculo.clienteNome || 'Cliente cadastrado'}</strong>
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            KM anterior registrado: <strong className="font-mono text-slate-800">{veiculo.kmPadrao || veiculo.kmAtual || '0'} km</strong>
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Novo KM Atual (Hodômetro) *
          </label>
          <div className="relative">
            <Gauge size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <IMaskInput
              mask={Number}
              scale={0}
              thousandsSeparator="."
              padFractionalZeros={false}
              normalizeZeros={true}
              radix=","
              value={kmInput}
              onAccept={(val) => setKmInput(val)}
              placeholder="Ex: 42.500"
              autoFocus
              className="w-full h-11 pl-10 pr-12 text-sm font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              KM
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Ao salvar, o sistema atualizará automaticamente todos os prazos de óleo, freios, arrefecimento e revisões preventivas.
          </p>
        </div>
      </form>
    </ModalRedimensionavel>
  )
}
