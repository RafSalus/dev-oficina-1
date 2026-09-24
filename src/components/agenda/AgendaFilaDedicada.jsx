import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Select from 'react-select'
import {
  Users,
  Plus,
  Clock,
  Car,
  User,
  Wrench,
  Trash,
  CalendarPlus,
  ShieldCheck,
  WarningCircle,
  MagnifyingGlass,
  CheckCircle,
  Receipt,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { customSelectStyles } from '../suprimentos/customSelectStyles'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { carregarClientesCadastrados } from '../../constants/mockClientesVeiculos'
import {
  PRIORIDADE_FILA,
  ordenarFilaPorPrioridadeEChegada,
} from '../../constants/agendaData'
import { useMecanicosAgenda } from '../../hooks/useMecanicosAgenda'

export function AgendaFilaDedicada({
  fila = [],
  onAtualizarFila,
  onAgendarClienteDaFila,
}) {
  const mecanicosAgenda = useMecanicosAgenda()
  const navigate = useNavigate()
  const location = useLocation()
  const [busca, setBusca] = useState('')
  const [filtroPrioridade, setFiltroPrioridade] = useState('TODOS')

  // Modal para Inserir Cliente na Fila
  const [isModalNovoClienteAberto, setIsModalNovoClienteAberto] = useState(false)

  // Campos do formulário de novo cliente na fila
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
  const opcoesClientes = useMemo(() => {
    return listaClientesCadastrados.map((c) => ({
      value: c.value || c.id,
      label: `${c.nome || c.razaoSocial} • ${c.telefone || 'Sem telefone'}`,
      clienteOriginal: c,
    }))
  }, [listaClientesCadastrados])

  const opcoesPrioridade = [
    {
      value: 'GARANTIA',
      label: '★ Garantia de Serviço (Prioridade 1 - Topo da Fila)',
    },
    {
      value: 'RETORNO',
      label: 'Retorno Técnico pós-serviço (Prioridade 2)',
    },
    {
      value: 'URGENTE',
      label: 'Pane Urgente / Socorro (Prioridade 3)',
    },
    {
      value: 'NORMAL',
      label: 'Ordem de Chegada Convencional (Prioridade 4)',
    },
  ]

  const opcoesMecanicos = [
    { value: '', label: 'Qualquer mecânico disponível' },
    ...mecanicosAgenda.map((m) => ({
      value: m.id,
      label: m.nome,
    })),
  ]

  // Fila rigorosamente ordenada
  const filaOrdenada = useMemo(() => {
    return ordenarFilaPorPrioridadeEChegada(fila)
  }, [fila])

  // Filtragem da Fila
  const filaFiltrada = useMemo(() => {
    return filaOrdenada.filter((item) => {
      if (filtroPrioridade !== 'TODOS' && item.prioridade !== filtroPrioridade) {
        return false
      }
      if (!busca.trim()) return true
      const termo = busca.toLowerCase().trim()
      return (
        item.clienteNome?.toLowerCase().includes(termo) ||
        item.veiculoPlaca?.toLowerCase().includes(termo) ||
        item.veiculoModelo?.toLowerCase().includes(termo) ||
        item.motivo?.toLowerCase().includes(termo)
      )
    })
  }, [filaOrdenada, busca, filtroPrioridade])

  // Métricas da Fila
  const metricasFila = useMemo(() => {
    const total = fila.length
    const garantias = fila.filter((f) => f.prioridade === 'GARANTIA').length
    const retornos = fila.filter((f) => f.prioridade === 'RETORNO').length
    const urgentes = fila.filter((f) => f.prioridade === 'URGENTE').length
    const normais = fila.filter((f) => f.prioridade === 'NORMAL').length
    return { total, garantias, retornos, urgentes, normais }
  }, [fila])

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

    const agora = new Date()
    const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`

    const novoItem = {
      id: `fila-${Date.now()}`,
      clienteNome: clienteNome.trim(),
      clienteTelefone: clienteTelefone.trim(),
      veiculoModelo: veiculoModelo.trim() || 'Veículo do Cliente',
      veiculoPlaca: (veiculoPlaca || '').toUpperCase().trim(),
      motivo: motivo.trim() || 'Atendimento presencial na oficina',
      prioridade,
      horaChegada: horaAtual,
      dataChegada: agora.toISOString().slice(0, 10),
      mecanicoPreferencialId: mecanicoPreferencialId || null,
      tempoEstimadoMinutos: Number(tempoEstimadoMinutos) || 45,
    }

    const novaLista = ordenarFilaPorPrioridadeEChegada([novoItem, ...fila])
    onAtualizarFila(novaLista)

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
    setIsModalNovoClienteAberto(false)
  }

  // Leva o cliente que já aguarda na fila direto para a tela de Ordens de Serviço, que abre o
  // modal de abertura de OS já preenchido (o item só sai da fila quando a OS for salva).
  const handleAbrirOS = (item) => {
    const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'
    navigate(`${basePath}/ordem-de-servico`, {
      state: {
        filaEsperaId: item.id,
        clienteNome: item.clienteNome,
        clienteTelefone: item.clienteTelefone,
        veiculoPlaca: item.veiculoPlaca,
        veiculoModelo: item.veiculoModelo,
        motivo: item.motivo,
        mecanicoPreferencialId: item.mecanicoPreferencialId,
      },
    })
  }

  // Remover cliente da fila
  const handleRemover = (id, nome) => {
    const novaFila = fila.filter((f) => f.id !== id)
    onAtualizarFila(novaFila)
    toast.info(`${nome} removido(a) da fila de atendimento.`)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* 1. Barra de Ações Superior com Padrão Executivo */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center border border-sky-100 shrink-0">
            <Users size={22} weight="bold" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Fila de Atendimento e Recepção</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {metricasFila.total} {metricasFila.total === 1 ? 'veículo' : 'veículos'}
              </span>
              {metricasFila.garantias > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#0f172a] text-white">
                  {metricasFila.garantias} Garantia (Prioridade 1)
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Ordem rigorosa de chegada com prioridade absoluta para Garantias e Retornos
            </p>
          </div>
        </div>

        {/* Botão de Ação no Padrão do Sistema */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsModalNovoClienteAberto(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            <span>Inserir Cliente na Fila</span>
          </button>
        </div>
      </div>

      {/* 2. Indicadores Rápidos da Fila */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-white border-b border-slate-200 shrink-0">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Total Aguardando
            </span>
            <span className="text-base font-bold text-slate-900">{metricasFila.total}</span>
          </div>
          <Users size={20} className="text-slate-400" />
        </div>

        <div className="bg-slate-900 text-white rounded-lg p-2.5 flex items-center justify-between shadow-xs">
          <div>
            <span className="block text-[10px] font-medium text-slate-300 uppercase tracking-wider">
              Garantias (Prioridade 1)
            </span>
            <span className="text-base font-bold text-white">{metricasFila.garantias}</span>
          </div>
          <ShieldCheck size={20} className="text-amber-400" weight="bold" />
        </div>

        <div className="bg-sky-50 border border-sky-200 rounded-lg p-2.5 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-medium text-sky-800 uppercase tracking-wider">
              Retornos Técnicos
            </span>
            <span className="text-base font-bold text-sky-900">{metricasFila.retornos}</span>
          </div>
          <Clock size={20} className="text-sky-600" />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-medium text-amber-800 uppercase tracking-wider">
              Panes Urgentes
            </span>
            <span className="text-base font-bold text-amber-900">{metricasFila.urgentes}</span>
          </div>
          <WarningCircle size={20} className="text-amber-600" />
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Ordem de Chegada
            </span>
            <span className="text-base font-bold text-slate-800">{metricasFila.normais}</span>
          </div>
          <Car size={20} className="text-slate-400" />
        </div>
      </div>

      {/* 3. Filtros e Campo de Busca */}
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlass size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar cliente, placa ou motivo..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
          />
        </div>

        {/* Filtro por Classificação */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {['TODOS', 'GARANTIA', 'RETORNO', 'URGENTE', 'NORMAL'].map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => setFiltroPrioridade(tipo)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                filtroPrioridade === tipo
                  ? 'bg-[#0f172a] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tipo === 'TODOS'
                ? 'Todos'
                : tipo === 'GARANTIA'
                ? 'Garantias'
                : tipo === 'RETORNO'
                ? 'Retornos'
                : tipo === 'URGENTE'
                ? 'Urgentes'
                : 'Ordem de Chegada'}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tabela Dedicada da Fila de Atendimento */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
        {filaFiltrada.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 shadow-xs">
            <Users size={42} className="mx-auto mb-3 opacity-40" />
            <h3 className="text-sm font-bold text-slate-700">Fila de atendimento vazia</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Nenhum cliente aguardando atendimento presencial no momento. Quando um cliente chegar, clique em "Inserir Cliente na Fila".
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4 text-center w-16">Posição</th>
                  <th className="py-3 px-4">Prioridade</th>
                  <th className="py-3 px-4">Horário Chegada</th>
                  <th className="py-3 px-4">Cliente e Contato</th>
                  <th className="py-3 px-4">Veículo e Placa</th>
                  <th className="py-3 px-4">Motivo / Diagnóstico Solicitado</th>
                  <th className="py-3 px-4">Mecânico Preferencial</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filaFiltrada.map((item, index) => {
                  const isGarantia = item.prioridade === 'GARANTIA'
                  const pInfo = PRIORIDADE_FILA[item.prioridade] || PRIORIDADE_FILA.NORMAL
                  const mecPref = mecanicosAgenda.find((m) => m.id === item.mecanicoPreferencialId)

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isGarantia
                          ? 'bg-slate-900/5 hover:bg-slate-900/10 font-medium'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Posição */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold ${
                            isGarantia
                              ? 'bg-[#0f172a] text-white'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {index + 1}º
                        </span>
                      </td>

                      {/* Prioridade */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded ${
                            isGarantia
                              ? 'bg-[#0f172a] text-white border border-[#0f172a]'
                              : pInfo.corBadge
                          }`}
                        >
                          {isGarantia && <ShieldCheck size={13} weight="bold" />}
                          {pInfo.rotulo}
                        </span>
                      </td>

                      {/* Chegada */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                          <Clock size={14} className="text-[#0284c7]" />
                          <span>{item.horaChegada}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Est.: ~{item.tempoEstimadoMinutos || 45} min
                        </span>
                      </td>

                      {/* Cliente */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.clienteNome}</div>
                        {item.clienteTelefone && (
                          <div className="text-[11px] text-slate-500">{item.clienteTelefone}</div>
                        )}
                      </td>

                      {/* Veículo */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{item.veiculoModelo}</div>
                        {item.veiculoPlaca && (
                          <span className="inline-block mt-0.5 text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-700">
                            {item.veiculoPlaca}
                          </span>
                        )}
                      </td>

                      {/* Motivo */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-700 line-clamp-2 leading-relaxed italic">
                          "{item.motivo}"
                        </p>
                      </td>

                      {/* Mecânico Preferencial */}
                      <td className="py-3.5 px-4">
                        {mecPref ? (
                          <span className="font-medium text-slate-800 flex items-center gap-1">
                            <Wrench size={13} className="text-[#0284c7]" />
                            {mecPref.nome}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Qualquer mecânico</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleAbrirOS(item)}
                            className="px-2.5 py-1.5 text-xs text-white bg-[#0284c7] hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1 font-semibold shadow-xs"
                            title="Abrir Ordem de Servico com os dados deste cliente"
                          >
                            <Receipt size={14} weight="bold" />
                            <span>Abrir OS</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemover(item.id, item.clienteNome)}
                            className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                            title="Remover da fila"
                          >
                            <Trash size={14} />
                            <span>Remover</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Modal para Inserir Novo Cliente na Fila */}
      {isModalNovoClienteAberto && (
        <ModalRedimensionavel
          isOpen={isModalNovoClienteAberto}
          onClose={() => setIsModalNovoClienteAberto(false)}
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
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Classificação / Prioridade *
                </label>
                <Select
                  options={opcoesPrioridade}
                  value={opcoesPrioridade.find((o) => o.value === prioridade)}
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
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Selecionar Cliente Cadastrado (Opcional)
                </label>
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
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    placeholder="Ex: Roberto Silva"
                    className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={clienteTelefone}
                    onChange={(e) => setClienteTelefone(e.target.value)}
                    placeholder="(43) 99999-9999"
                    className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Modelo do Veículo *
                  </label>
                  <input
                    type="text"
                    required
                    value={veiculoModelo}
                    onChange={(e) => setVeiculoModelo(e.target.value)}
                    placeholder="Ex: Fiat Strada 1.4"
                    className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Placa
                  </label>
                  <input
                    type="text"
                    value={veiculoPlaca}
                    onChange={(e) => setVeiculoPlaca(e.target.value)}
                    placeholder="Ex: BRA2E19"
                    className="w-full text-xs p-2 rounded border border-slate-300 uppercase focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Motivo da Visita / Diagnóstico Solicitado *
                </label>
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
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mecânico Preferencial
                  </label>
                  <Select
                    options={opcoesMecanicos}
                    value={opcoesMecanicos.find((o) => o.value === mecanicoPreferencialId)}
                    onChange={(opt) => setMecanicoPreferencialId(opt.value)}
                    styles={customSelectStyles}
                    isSearchable={false}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Estimativa de Tempo (Minutos)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={tempoEstimadoMinutos}
                    onChange={(e) => setTempoEstimadoMinutos(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>
              </div>
            </form>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 shrink-0 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsModalNovoClienteAberto(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
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
      )}
    </div>
  )
}
