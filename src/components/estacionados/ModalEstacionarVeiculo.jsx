import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import { IMaskInput } from 'react-imask'
import {
  Garage,
  Car,
  User,
  FloppyDisk,
  CalendarBlank,
  Gauge,
  ChatText,
  ShieldCheck,
  WarningCircle,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { customSelectStyles } from '../suprimentos/customSelectStyles'
import { carregarTodosVeiculosDaFrota } from '../../constants/mockClientesVeiculos'
import { estacionarVeiculo } from '../../constants/mockVeiculosEstacionados'

export function ModalEstacionarVeiculo({
  isOpen,
  onClose,
  veiculoInicial = null,
  onEstacionadoConcluido,
}) {
  const [frotaAtiva, setFrotaAtiva] = useState([])
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null)

  const [dadosVenda, setDadosVenda] = useState({
    dataVenda: new Date().toLocaleDateString('pt-BR'),
    kmNaVenda: '',
    motivoVenda: 'Cliente vendeu o veículo e novo proprietário ainda não é cliente da oficina',
    novoDonoNome: '',
    novoDonoTelefone: '',
    novoDonoEmail: '',
    observacoes: '',
  })

  // Carrega a frota de veículos ativos
  useEffect(() => {
    if (isOpen) {
      const lista = carregarTodosVeiculosDaFrota()
      setFrotaAtiva(lista)

      if (veiculoInicial) {
        const encontrado = lista.find(
          (v) => (v.placa || '').toUpperCase() === (veiculoInicial.placa || '').toUpperCase()
        )
        if (encontrado) {
          setVeiculoSelecionado({
            value: encontrado.id || encontrado.value,
            label: `${encontrado.placa} - ${encontrado.marcaModelo || ''} (${encontrado.clienteNome || ''})`,
            veiculo: encontrado,
          })
          setDadosVenda((prev) => ({
            ...prev,
            kmNaVenda: encontrado.kmPadrao || encontrado.km || '',
          }))
        }
      } else {
        setVeiculoSelecionado(null)
      }
    }
  }, [isOpen, veiculoInicial])

  // Opções para o react-select
  const opcoesVeiculos = useMemo(() => {
    return frotaAtiva.map((v) => ({
      value: v.id || v.value,
      label: `${v.placa} - ${v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim()} • Cliente: ${v.clienteNome || 'Não identificado'}`,
      veiculo: v,
    }))
  }, [frotaAtiva])

  if (!isOpen) return null

  const handleSelectVeiculo = (opt) => {
    setVeiculoSelecionado(opt)
    if (opt?.veiculo) {
      setDadosVenda((prev) => ({
        ...prev,
        kmNaVenda: opt.veiculo.kmPadrao || opt.veiculo.km || prev.kmNaVenda,
      }))
    }
  }

  const handleSalvar = () => {
    if (!veiculoSelecionado || !veiculoSelecionado.veiculo) {
      toast.error('Selecione um veículo da frota ativa para estacionar.')
      return
    }

    try {
      const veic = veiculoSelecionado.veiculo
      estacionarVeiculo({
        veiculo: veic,
        dadosVenda,
      })

      toast.success(
        `Veículo placa ${veic.placa} estacionado com sucesso! Todo o histórico de manutenção foi preservado.`
      )

      if (onEstacionadoConcluido) {
        onEstacionadoConcluido()
      }
      onClose()
    } catch (err) {
      toast.error(err.message || 'Erro ao estacionar veículo.')
    }
  }

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      chaveStorage="modal_redimensionavel_estacionar_veiculo"
      larguraPadrao={760}
      alturaPadrao={580}
      larguraMinima={480}
      alturaMinima={380}
      titulo="Estacionar Veículo (Registrar Venda)"
      subtitulo="Desvincula o carro do cliente atual e preserva 100% do histórico de manutenções"
      badge="Pátio de Estacionados"
      icone={Garage}
      rodape={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck size={16} className="text-sky-600" />
            <span>Nenhum dado técnico ou histórico de serviço será perdido</span>
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
              <span>Estacionar Veículo</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pb-2">
        {/* Seleção do Veículo da Frota Ativa */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Selecione o Veículo da Frota Ativa que foi Vendido *
          </label>
          <Select
            value={veiculoSelecionado}
            onChange={handleSelectVeiculo}
            options={opcoesVeiculos}
            styles={customSelectStyles}
            placeholder="Pesquise por placa, marca, modelo ou cliente..."
            isSearchable
            noOptionsMessage={() => 'Nenhum veículo encontrado na frota ativa'}
          />

          {veiculoSelecionado?.veiculo && (
            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <Car size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                      {veiculoSelecionado.veiculo.placa}
                    </span>
                    <span>{veiculoSelecionado.veiculo.marcaModelo}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Cliente atual: <strong className="text-slate-800">{veiculoSelecionado.veiculo.clienteNome}</strong> •
                    Ano: {veiculoSelecionado.veiculo.ano || '—'} • Cor: {veiculoSelecionado.veiculo.cor || '—'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Informações da Venda e Novo Comprador */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Dados da Venda e Novo Comprador (Opcional)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Data da Venda */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Data da Venda / Estacionamento *</label>
              <IMaskInput
                mask="00/00/0000"
                value={dadosVenda.dataVenda}
                onAccept={(value) => setDadosVenda((prev) => ({ ...prev, dataVenda: value }))}
                placeholder="DD/MM/AAAA"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              />
            </div>

            {/* Quilometragem na Venda */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quilometragem na Venda (KM)</label>
              <input
                type="text"
                value={dadosVenda.kmNaVenda}
                onChange={(e) => setDadosVenda((prev) => ({ ...prev, kmNaVenda: e.target.value }))}
                placeholder="Ex: 85.000"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nome do Novo Dono */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Novo Dono / Comprador</label>
              <input
                type="text"
                value={dadosVenda.novoDonoNome}
                onChange={(e) => setDadosVenda((prev) => ({ ...prev, novoDonoNome: e.target.value }))}
                placeholder="Ex: Rodrigo Pires (se já souber)"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              />
            </div>

            {/* Telefone do Novo Dono */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telefone do Novo Dono</label>
              <IMaskInput
                mask="(00) 00000-0000"
                value={dadosVenda.novoDonoTelefone}
                onAccept={(value) => setDadosVenda((prev) => ({ ...prev, novoDonoTelefone: value }))}
                placeholder="(43) 99999-9999"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              />
            </div>
          </div>

          {/* Motivo e Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Observações da Venda</label>
            <textarea
              rows={2}
              value={dadosVenda.observacoes}
              onChange={(e) => setDadosVenda((prev) => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Anotações sobre a venda, contato do comprador ou intenção de revisão..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 resize-none"
            />
          </div>
        </div>
      </div>
    </ModalRedimensionavel>
  )
}
