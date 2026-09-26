import React, { useState, useMemo } from 'react'
import Select from 'react-select'
import { IMaskInput } from 'react-imask'
import { X, ShieldCheck, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { carregarClientesCadastrados } from '../../../../constants/mockClientesVeiculos'
import { construirItemFila, inserirNaFila } from '../../../../hooks/useFilaEsperaWorkflow'
import {
  mobileSelectStyles,
  inputBaseClass,
  textareaBaseClass,
  labelBaseClass,
} from '../../nova-os/mobile/mobileSelectStyles'
import { useMecanicosAgenda } from '../../../../hooks/useMecanicosAgenda'

const OPCOES_PRIORIDADE = [
  { value: 'GARANTIA', label: '★ Garantia de Serviço (Prioridade 1)' },
  { value: 'RETORNO', label: 'Retorno Técnico (Prioridade 2)' },
  { value: 'URGENTE', label: 'Pane Urgente / Socorro (Prioridade 3)' },
  { value: 'NORMAL', label: 'Ordem de Chegada Convencional' },
]

export function MobileAgendaFilaFormModal({ isOpen, onClose, fila = [], onAtualizarFila }) {
  const mecanicosAgenda = useMecanicosAgenda()
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

  const [clienteNome, setClienteNome] = useState('')
  const [clienteTelefone, setClienteTelefone] = useState('')
  const [veiculoModelo, setVeiculoModelo] = useState('')
  const [veiculoPlaca, setVeiculoPlaca] = useState('')
  const [motivo, setMotivo] = useState('')
  const [prioridade, setPrioridade] = useState('NORMAL')
  const [mecanicoPreferencialId, setMecanicoPreferencialId] = useState('')
  const [tempoEstimadoMinutos, setTempoEstimadoMinutos] = useState(45)

  if (!isOpen) return null

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

  const handleAdicionar = () => {
    if (!clienteNome.trim()) {
      toast.error('Informe o nome do cliente')
      return
    }
    if (!veiculoModelo.trim()) {
      toast.error('Informe o modelo do veículo')
      return
    }
    if (!motivo.trim()) {
      toast.error('Informe o motivo da visita')
      return
    }

    const { item, horaAtual } = construirItemFila({
      clienteNome,
      clienteTelefone,
      veiculoModelo,
      veiculoPlaca,
      motivo,
      prioridade,
      mecanicoPreferencialId,
      tempoEstimadoMinutos,
    })

    onAtualizarFila(inserirNaFila(fila, item))

    toast.success(
      prioridade === 'GARANTIA'
        ? 'Cliente inserido no topo da fila com PRIORIDADE 1 (Garantia)!'
        : `Cliente inserido na fila de atendimento às ${horaAtual}.`
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#eaecf0] flex flex-col">
      <header className="shrink-0 bg-white border-b border-[#e4e7ec]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="h-14 px-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-2.5 rounded-xl text-[#475467] active:bg-[#f2f4f7] transition-colors shrink-0"
          >
            <X size={20} weight="bold" />
          </button>
          <span className="text-sm font-extrabold text-[#101828] truncate">Inserir na Fila</span>
          <div className="w-9 shrink-0" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <div>
            <label className={labelBaseClass}>Classificação / Prioridade *</label>
            <Select
              options={OPCOES_PRIORIDADE}
              value={OPCOES_PRIORIDADE.find((o) => o.value === prioridade)}
              onChange={(opt) => setPrioridade(opt.value)}
              styles={mobileSelectStyles}
              isSearchable={false}
            />
            {prioridade === 'GARANTIA' && (
              <p className="text-[11px] text-[#0284c7] font-semibold mt-1.5 flex items-center gap-1">
                <ShieldCheck size={13} weight="bold" />
                Prioridade máxima assegurada no topo da fila
              </p>
            )}
          </div>

          <div>
            <label className={labelBaseClass}>Cliente Cadastrado (Opcional)</label>
            <Select
              options={opcoesClientes}
              onChange={handleSelecionarClienteCadastrado}
              styles={mobileSelectStyles}
              placeholder="Buscar por nome ou telefone..."
              isClearable
            />
          </div>

          <div>
            <label className={labelBaseClass}>Nome do Cliente *</label>
            <input
              type="text"
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              placeholder="Ex: Roberto Silva"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label className={labelBaseClass}>Telefone / WhatsApp</label>
            <IMaskInput
              mask="(00) 00000-0000"
              value={clienteTelefone}
              onAccept={(val) => setClienteTelefone(val)}
              placeholder="(00) 00000-0000"
              className={inputBaseClass}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <div>
            <label className={labelBaseClass}>Modelo do Veículo *</label>
            <input
              type="text"
              value={veiculoModelo}
              onChange={(e) => setVeiculoModelo(e.target.value)}
              placeholder="Ex: Fiat Strada 1.4"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label className={labelBaseClass}>Placa</label>
            <IMaskInput
              mask={[{ mask: 'aaa0a00' }, { mask: 'aaa-0000' }]}
              prepareChar={(str) => str.toUpperCase()}
              definitions={{ a: /[A-Za-z]/, 0: /[0-9]/ }}
              value={veiculoPlaca}
              onAccept={(val) => setVeiculoPlaca(val.toUpperCase())}
              placeholder="ABC1D23"
              className={`${inputBaseClass} font-mono uppercase`}
            />
          </div>

          <div>
            <label className={labelBaseClass}>Motivo da Visita *</label>
            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Ruído agudo na frenagem, falha de ignição, revisão..."
              className={textareaBaseClass}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <div>
            <label className={labelBaseClass}>Mecânico Preferencial</label>
            <Select
              options={opcoesMecanicos}
              value={opcoesMecanicos.find((o) => o.value === mecanicoPreferencialId)}
              onChange={(opt) => setMecanicoPreferencialId(opt.value)}
              styles={mobileSelectStyles}
              isSearchable={false}
            />
          </div>
          <div>
            <label className={labelBaseClass}>Estimativa de Tempo (minutos)</label>
            <input
              type="number"
              min="15"
              step="15"
              value={tempoEstimadoMinutos}
              onChange={(e) => setTempoEstimadoMinutos(e.target.value)}
              className={inputBaseClass}
            />
          </div>
        </div>
      </main>

      <footer
        className="shrink-0 bg-white border-t border-[#e4e7ec] px-4 py-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        <button
          type="button"
          onClick={handleAdicionar}
          className="w-full h-12 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-sm font-bold flex items-center justify-center gap-2"
        >
          <CheckCircle size={18} weight="bold" />
          Registrar na Fila
        </button>
      </footer>
    </div>
  )
}
