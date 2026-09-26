import React, { useState, useMemo } from 'react'
import Select from 'react-select'
import { CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { customSelectStyles } from '../../suprimentos/customSelectStyles'
import { ModalRedimensionavel } from '../../suprimentos/ModalRedimensionavel'
import { carregarClientesCadastrados } from '../../../constants/mockClientesVeiculos'
import { construirItemFila, inserirNaFila } from '../../../hooks/useFilaEsperaWorkflow'
import { inputClass, inputPlacaClass, labelClass } from '../agendamento-form/estilosAgendamentoForm'

const OPCOES_PRIORIDADE = [
  { value: 'GARANTIA', label: '★ Garantia de Serviço (Prioridade 1 - Topo da Fila)' },
  { value: 'RETORNO', label: 'Retorno Técnico pós-serviço (Prioridade 2)' },
  { value: 'URGENTE', label: 'Pane Urgente / Socorro (Prioridade 3)' },
  { value: 'NORMAL', label: 'Ordem de Chegada Convencional (Prioridade 4)' },
]

/**
 * Modal desktop para inserir um cliente na fila de atendimento.
 * Fica sempre montado para preservar o rascunho entre aberturas (como no original).
 */
export function ModalInserirFila({ isOpen, onClose, fila, onAtualizarFila, mecanicosAgenda }) {
  const [clienteNome, setClienteNome] = useState('')
  const [clienteTelefone, setClienteTelefone] = useState('')
  const [veiculoModelo, setVeiculoModelo] = useState('')
  const [veiculoPlaca, setVeiculoPlaca] = useState('')
  const [motivo, setMotivo] = useState('')
  const [prioridade, setPrioridade] = useState('NORMAL')
  const [mecanicoPreferencialId, setMecanicoPreferencialId] = useState('')
  const [tempoEstimadoMinutos, setTempoEstimadoMinutos] = useState(45)

  // Clientes cadastrados para autocompletar na fila se desejar
  const listaClientesCadastrados = useMemo(() => carregarClientesCadastrados(), [])
  const opcoesClientes = useMemo(
    () =>
      listaClientesCadastrados.map((c) => ({
        value: c.value || c.id,
        label: `${c.nome || c.razaoSocial} • ${c.telefone || 'Sem telefone'}`,
        clienteOriginal: c,
      })),
    [listaClientesCadastrados]
  )

  const opcoesMecanicos = [
    { value: '', label: 'Qualquer mecânico disponível' },
    ...mecanicosAgenda.map((m) => ({ value: m.id, label: m.nome })),
  ]

  // Ao selecionar cliente pré-cadastrado no modal da fila
  const handleSelecionarClienteCadastrado = (opt) => {
    if (!opt) return
    const c = opt.clienteOriginal
    setClienteNome(c.nome || c.razaoSocial)
    setClienteTelefone(c.telefone || '')
    if (c.veiculos && c.veiculos.length > 0) {
      const v = c.veiculos[0]
      setVeiculoModelo(v.marcaModelo || v.modelo || '')
      setVeiculoPlaca(v.placa || '')
    }
  }

  // Submissão do novo cliente na fila
  const handleAdicionarFila = (e) => {
    e.preventDefault()

    if (!clienteNome.trim()) {
      toast.error('Informe o nome do cliente')
      return
    }

    const { item, horaAtual } = construirItemFila(
      { clienteNome, clienteTelefone, veiculoModelo, veiculoPlaca, motivo, prioridade, mecanicoPreferencialId, tempoEstimadoMinutos },
      { veiculoModelo: 'Veículo do Cliente', motivo: 'Atendimento presencial na oficina' }
    )

    onAtualizarFila(inserirNaFila(fila, item))

    toast.success(
      prioridade === 'GARANTIA'
        ? `Cliente inserido no topo da fila com PRIORIDADE 1 (Garantia)!`
        : `Cliente inserido na fila de atendimento com sucesso às ${horaAtual}.`
    )

    // Limpeza
    setClienteNome('')
    setClienteTelefone('')
    setVeiculoModelo('')
    setVeiculoPlaca('')
    setMotivo('')
    setPrioridade('NORMAL')
    setMecanicoPreferencialId('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      titulo="Inserir Cliente na Fila de Atendimento"
      larguraPadrao={680}
      alturaPadrao={560}
      larguraMinima={520}
      alturaMinima={440}
      larguraMaxima={1000}
      alturaMaxima={780}
      storageKey="modal_agenda_inserir_fila"
    >
      <div className="flex flex-col h-full bg-white text-slate-800">
        <form onSubmit={handleAdicionarFila} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
          {/* Prioridade com destaque para Garantia */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Classificação / Prioridade *</label>
            <Select
              options={OPCOES_PRIORIDADE}
              value={OPCOES_PRIORIDADE.find((o) => o.value === prioridade)}
              onChange={(opt) => setPrioridade(opt.value)}
              styles={customSelectStyles}
              isSearchable={false}
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Clientes de Garantia têm prioridade máxima assegurada no topo da fila.
            </span>
          </div>

          {/* Seleção de cliente cadastrado ou preenchimento avulso */}
          <div>
            <label className={labelClass}>Selecionar Cliente Cadastrado (Opcional)</label>
            <Select
              options={opcoesClientes}
              onChange={handleSelecionarClienteCadastrado}
              styles={customSelectStyles}
              placeholder="Pesquise por nome ou telefone..."
              isClearable
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nome do Cliente *</label>
              <input type="text" required value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} placeholder="Ex: Roberto Silva" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Telefone / WhatsApp</label>
              <input type="text" value={clienteTelefone} onChange={(e) => setClienteTelefone(e.target.value)} placeholder="(43) 99999-9999" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Modelo do Veículo *</label>
              <input type="text" required value={veiculoModelo} onChange={(e) => setVeiculoModelo(e.target.value)} placeholder="Ex: Fiat Strada 1.4" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Placa</label>
              <input type="text" value={veiculoPlaca} onChange={(e) => setVeiculoPlaca(e.target.value)} placeholder="Ex: BRA2E19" className={inputPlacaClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Motivo da Visita / Diagnóstico Solicitado *</label>
            <textarea
              rows={2}
              required
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Ruído agudo na frenagem, falha de ignição, revisão..."
              className="w-full text-xs p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Mecânico Preferencial</label>
              <Select
                options={opcoesMecanicos}
                value={opcoesMecanicos.find((o) => o.value === mecanicoPreferencialId)}
                onChange={(opt) => setMecanicoPreferencialId(opt.value)}
                styles={customSelectStyles}
                isSearchable={false}
              />
            </div>
            <div>
              <label className={labelClass}>Estimativa de Tempo (Minutos)</label>
              <input type="number" min="15" step="15" value={tempoEstimadoMinutos} onChange={(e) => setTempoEstimadoMinutos(e.target.value)} className={inputClass} />
            </div>
          </div>
        </form>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 shrink-0 flex items-center justify-between">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAdicionarFila}
            className="px-4 py-2 bg-[#0284c7] hover:bg-sky-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CheckCircle size={16} weight="bold" />
            Registrar na Fila
          </button>
        </div>
      </div>
    </ModalRedimensionavel>
  )
}
