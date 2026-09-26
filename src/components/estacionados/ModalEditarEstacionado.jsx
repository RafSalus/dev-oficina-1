import React, { useState, useEffect } from 'react'
import { IMaskInput } from 'react-imask'
import {
  PencilSimple,
  Car,
  FloppyDisk,
  ShieldCheck,
  CalendarBlank,
  Gauge,
  ChatText,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { atualizarVeiculoEstacionado } from '../../repositories/veiculosEstacionadosRepository'

export function ModalEditarEstacionado({
  isOpen,
  onClose,
  veiculo,
  onEdicaoConcluida,
}) {
  const [formData, setFormData] = useState({
    kmAtual: '',
    dataEstacionamento: '',
    novoDonoNome: '',
    novoDonoTelefone: '',
    novoDonoDocumento: '',
    novoDonoEmail: '',
    motivoVenda: '',
    observacoes: '',
  })

  useEffect(() => {
    if (isOpen && veiculo) {
      setFormData({
        kmAtual: veiculo.kmAtual || '',
        dataEstacionamento: veiculo.dataEstacionamento || '',
        novoDonoNome: veiculo.novoDonoNome || '',
        novoDonoTelefone: veiculo.novoDonoTelefone || '',
        novoDonoDocumento: veiculo.novoDonoDocumento || '',
        novoDonoEmail: veiculo.novoDonoEmail || '',
        motivoVenda: veiculo.motivoVenda || '',
        observacoes: veiculo.observacoes || '',
      })
    }
  }, [isOpen, veiculo])

  if (!isOpen || !veiculo) return null

  const handleSalvar = async () => {
    try {
      const atualizado = {
        ...veiculo,
        ...formData,
      }
      await atualizarVeiculoEstacionado(atualizado)
      toast.success(`Informações do veículo ${veiculo.placa} atualizadas com sucesso!`)
      if (onEdicaoConcluida) {
        onEdicaoConcluida()
      }
      onClose()
    } catch (err) {
      toast.error('Erro ao atualizar informações do veículo estacionado.')
    }
  }

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      chaveStorage="modal_redimensionavel_editar_estacionado"
      larguraPadrao={740}
      alturaPadrao={560}
      larguraMinima={560}
      alturaMinima={440}
      larguraMaxima={1080}
      alturaMaxima={780}
      titulo="Editar Veículo Estacionado"
      subtitulo={`Atualização de anotações e dados do novo comprador`}
      badge="Pátio de Estacionados"
      icone={PencilSimple}
      rodape={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck size={16} className="text-sky-600" />
            <span>O histórico de ordens de serviço continuará intacto</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-300"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSalvar}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <FloppyDisk size={15} weight="bold" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pb-2">
        {/* Resumo do Veículo */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm shrink-0 border border-sky-200">
              <Car size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-white text-slate-900 border border-slate-300 px-2 py-0.5 rounded shadow-2xs">
                  {veiculo.placa}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {veiculo.marcaModelo || `${veiculo.marca || ''} ${veiculo.modelo || ''}`.trim()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Antigo Dono: <strong className="text-slate-700">{veiculo.antigoClienteNome || '—'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Campos Editáveis */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* KM Atual */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quilometragem Atual (KM)</label>
              <input
                type="text"
                value={formData.kmAtual}
                onChange={(e) => setFormData((prev) => ({ ...prev, kmAtual: e.target.value }))}
                placeholder="Ex: 75.000"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              />
            </div>

            {/* Data do Estacionamento */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Data da Venda / Estacionamento</label>
              <IMaskInput
                mask="00/00/0000"
                value={formData.dataEstacionamento}
                onAccept={(value) => setFormData((prev) => ({ ...prev, dataEstacionamento: value }))}
                placeholder="DD/MM/AAAA"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nome do Novo Dono */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Novo Comprador</label>
              <input
                type="text"
                value={formData.novoDonoNome}
                onChange={(e) => setFormData((prev) => ({ ...prev, novoDonoNome: e.target.value }))}
                placeholder="Nome do novo comprador (se souber)"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              />
            </div>

            {/* Telefone do Novo Dono */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telefone do Novo Comprador</label>
              <IMaskInput
                mask="(00) 00000-0000"
                value={formData.novoDonoTelefone}
                onAccept={(value) => setFormData((prev) => ({ ...prev, novoDonoTelefone: value }))}
                placeholder="(43) 99999-9999"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              />
            </div>
          </div>

          {/* Motivo e Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Observações da Venda</label>
            <textarea
              rows={3}
              value={formData.observacoes}
              onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Anotações gerais..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 resize-none"
            />
          </div>
        </div>
      </div>
    </ModalRedimensionavel>
  )
}
