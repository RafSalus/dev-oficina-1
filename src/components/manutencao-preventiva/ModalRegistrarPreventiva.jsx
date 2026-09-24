import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import { IMaskInput } from 'react-imask'
import {
  Wrench,
  CheckCircle,
  CalendarBlank,
  Gauge,
  User,
  ShieldCheck,
  SealCheck,
  FileText,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { customSelectStyles } from '../suprimentos/customSelectStyles'
import {
  ITENS_PREVENTIVOS_CATALOGO,
  registrarExecucaoPreventiva,
} from '../../constants/mockManutencaoPreventiva'

const MECANICOS_OPCOES = []

export function ModalRegistrarPreventiva({
  isOpen,
  onClose,
  veiculoInicial = null,
  veiculosDisponiveis = [],
  itemIdInicial = null,
  onSalvo,
}) {
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null)
  const [itemSelecionado, setItemSelecionado] = useState(null)
  const [kmExecucao, setKmExecucao] = useState('')
  const [dataExecucao, setDataExecucao] = useState('')
  const [intervaloKm, setIntervaloKm] = useState('10000')
  const [intervaloMeses, setIntervaloMeses] = useState('6')
  const [mecanico, setMecanico] = useState(null)
  const [observacoes, setObservacoes] = useState('')
  const [atualizarKmVeiculo, setAtualizarKmVeiculo] = useState(true)

  // Opções de Garantia
  const [garantiaPendente, setGarantiaPendente] = useState(false)
  const [servicoOrigem, setServicoOrigem] = useState('')
  const [prazoGarantiaLimite, setPrazoGarantiaLimite] = useState('')

  // Opções de Veículos para o select
  const opcoesVeiculos = useMemo(() => {
    return (veiculosDisponiveis || []).map((v) => ({
      value: v.placa,
      label: `${v.placa} - ${v.marcaModelo || v.modelo} (${v.clienteNome || 'Sem cliente'})`,
      veiculoOriginal: v,
    }))
  }, [veiculosDisponiveis])

  // Opções de Itens Preventivos
  const opcoesItens = useMemo(() => {
    return ITENS_PREVENTIVOS_CATALOGO.map((item) => ({
      value: item.id,
      label: `${item.nome} (${item.categoria})`,
      itemOriginal: item,
    }))
  }, [])

  useEffect(() => {
    if (isOpen) {
      // Veículo
      if (veiculoInicial) {
        setVeiculoSelecionado({
          value: veiculoInicial.placa,
          label: `${veiculoInicial.placa} - ${veiculoInicial.marcaModelo || veiculoInicial.modelo}`,
          veiculoOriginal: veiculoInicial,
        })
        setKmExecucao(veiculoInicial.kmPadrao || veiculoInicial.kmAtual || '')
      } else if (opcoesVeiculos.length > 0) {
        setVeiculoSelecionado(opcoesVeiculos[0])
        setKmExecucao(opcoesVeiculos[0].veiculoOriginal?.kmPadrao || '')
      }

      // Item
      const itemEncontrado = ITENS_PREVENTIVOS_CATALOGO.find(
        (i) => i.id === (itemIdInicial || 'oleo_filtros')
      )
      if (itemEncontrado) {
        setItemSelecionado({
          value: itemEncontrado.id,
          label: `${itemEncontrado.nome} (${itemEncontrado.categoria})`,
          itemOriginal: itemEncontrado,
        })
        setIntervaloKm(String(itemEncontrado.intervaloKmPadrao))
        setIntervaloMeses(String(itemEncontrado.intervaloMesesPadrao))
      }

      setDataExecucao(new Date().toLocaleDateString('pt-BR'))
      setObservacoes('')
      setGarantiaPendente(false)
      setServicoOrigem('')
      setPrazoGarantiaLimite('')
    }
  }, [isOpen, veiculoInicial, itemIdInicial, opcoesVeiculos])

  if (!isOpen) return null

  const handleItemChange = (opcao) => {
    setItemSelecionado(opcao)
    if (opcao?.itemOriginal) {
      setIntervaloKm(String(opcao.itemOriginal.intervaloKmPadrao))
      setIntervaloMeses(String(opcao.itemOriginal.intervaloMesesPadrao))
      if (opcao.itemOriginal.id === 'revisao_garantia') {
        setGarantiaPendente(true)
      }
    }
  }

  const handleVeiculoChange = (opcao) => {
    setVeiculoSelecionado(opcao)
    if (opcao?.veiculoOriginal) {
      setKmExecucao(opcao.veiculoOriginal.kmPadrao || opcao.veiculoOriginal.kmAtual || '')
    }
  }

  const handleSalvar = (e) => {
    e.preventDefault()

    if (!veiculoSelecionado) {
      toast.error('Selecione o veículo atendido.')
      return
    }

    if (!itemSelecionado) {
      toast.error('Selecione o item de manutenção preventiva.')
      return
    }

    if (!kmExecucao || !kmExecucao.trim()) {
      toast.error('Informe a quilometragem de realização.')
      return
    }

    if (!dataExecucao || dataExecucao.length < 10) {
      toast.error('Informe a data completa no formato DD/MM/AAAA.')
      return
    }

    registrarExecucaoPreventiva({
      placa: veiculoSelecionado.value,
      itemId: itemSelecionado.value,
      km: kmExecucao,
      data: dataExecucao,
      intervaloKm,
      intervaloMeses,
      mecanicoNome: mecanico?.value || '',
      observacoes,
      atualizarKmVeiculo,
      garantiaPendente,
      servicoOrigem,
      prazoGarantiaLimite,
    })

    toast.success(
      `Manutenção preventiva registrada com sucesso para o veículo ${veiculoSelecionado.value}!`
    )
    if (onSalvo) onSalvo()
    onClose()
  }

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      chaveStorage="modal_redimensionavel_registrar_preventiva"
      larguraPadrao={740}
      alturaPadrao={600}
      larguraMinima={560}
      alturaMinima={440}
      larguraMaxima={1100}
      alturaMaxima={820}
      titulo="Registrar Manutenção Preventiva e Revisão"
      subtitulo="Lançamento técnico de substituição, troca periódica e garantia"
      badge="Saúde do Veículo"
      icone={Wrench}
      rodape={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-sky-600" />
            <span>Atualiza instantaneamente os alertas e a pontuação de saúde da frota</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSalvar}
              className="px-4 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle size={15} weight="bold" />
              <span>Salvar Registro</span>
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSalvar} className="space-y-4 pb-2">
        {/* Veículo e Item */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Veículo Ativo da Frota *
            </label>
            <Select
              value={veiculoSelecionado}
              onChange={handleVeiculoChange}
              options={opcoesVeiculos}
              styles={customSelectStyles}
              placeholder="Selecione o veículo..."
              isSearchable
              noOptionsMessage={() => 'Nenhum veículo ativo'}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Item / Serviço Preventivo *
            </label>
            <Select
              value={itemSelecionado}
              onChange={handleItemChange}
              options={opcoesItens}
              styles={customSelectStyles}
              placeholder="Selecione o serviço preventivo..."
              isSearchable
              noOptionsMessage={() => 'Nenhum item cadastrado'}
            />
          </div>
        </div>

        {/* KM, Data e Mecânico */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
              <Gauge size={14} className="text-sky-600" />
              <span>KM Realizada *</span>
            </label>
            <IMaskInput
              mask={Number}
              scale={0}
              thousandsSeparator="."
              padFractionalZeros={false}
              normalizeZeros={true}
              radix=","
              value={kmExecucao}
              onAccept={(val) => setKmExecucao(val)}
              placeholder="Ex: 40.000"
              className="w-full h-9.5 px-3 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
              <CalendarBlank size={14} className="text-sky-600" />
              <span>Data de Execução *</span>
            </label>
            <IMaskInput
              mask="00/00/0000"
              value={dataExecucao}
              onAccept={(val) => setDataExecucao(val)}
              placeholder="DD/MM/AAAA"
              className="w-full h-9.5 px-3 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
              <User size={14} className="text-sky-600" />
              <span>Mecânico Executor</span>
            </label>
            <Select
              value={mecanico}
              onChange={(opcao) => setMecanico(opcao)}
              options={MECANICOS_OPCOES}
              styles={customSelectStyles}
              isSearchable={false}
            />
          </div>
        </div>

        {/* Intervalos Recomendados para a Próxima Troca */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Parâmetros de Recorrência para o Próximo Vencimento
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Intervalo de Quilometragem (KM)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={intervaloKm}
                  onChange={(e) => setIntervaloKm(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                  KM
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Intervalo de Tempo (Meses)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={intervaloMeses}
                  onChange={(e) => setIntervaloMeses(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                  Meses
                </span>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={atualizarKmVeiculo}
              onChange={(e) => setAtualizarKmVeiculo(e.target.checked)}
              className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
            />
            <span className="text-xs font-medium text-slate-700">
              Atualizar também o hodômetro geral do veículo para este KM
            </span>
          </label>
        </div>

        {/* Garantia do Serviço */}
        <div className="border border-sky-200 bg-sky-50/50 rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SealCheck size={18} className="text-sky-700" />
              <div>
                <strong className="text-xs text-sky-950 block">Revisão Periódica para Garantia</strong>
                <span className="text-[11px] text-sky-700">
                  Exigir retorno na oficina em data estipulada para inspeção e manutenção de garantia
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={garantiaPendente}
                onChange={(e) => setGarantiaPendente(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>

          {garantiaPendente && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-sky-200/60">
              <div>
                <label className="block text-[11px] font-semibold text-sky-900 mb-1">
                  Serviço / Peça de Origem da Garantia
                </label>
                <input
                  type="text"
                  value={servicoOrigem}
                  onChange={(e) => setServicoOrigem(e.target.value)}
                  placeholder="Ex: Troca de kit de embreagem / Amortecedores"
                  className="w-full h-8.5 px-2.5 rounded-lg border border-sky-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-sky-900 mb-1">
                  Data Limite de Retorno (Revisão de Garantia)
                </label>
                <IMaskInput
                  mask="00/00/0000"
                  value={prazoGarantiaLimite}
                  onAccept={(val) => setPrazoGarantiaLimite(val)}
                  placeholder="DD/MM/AAAA"
                  className="w-full h-8.5 px-2.5 rounded-lg border border-sky-300 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Observações / Peças Utilizadas */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
            <FileText size={14} className="text-sky-600" />
            <span>Peças Aplicadas e Observações Técnicas</span>
          </label>
          <textarea
            rows={2}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Ex: Óleo 5W30 100% sintético Petronas Syntium, filtro de óleo Fram, conferido nível de fluido de freio."
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none"
          />
        </div>
      </form>
    </ModalRedimensionavel>
  )
}
