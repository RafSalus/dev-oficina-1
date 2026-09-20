import React, { useState, useEffect, useMemo } from 'react'
import {
  ArrowsLeftRight,
  Plus,
  MagnifyingGlass,
  Play,
  CheckCircle,
  Car,
  User,
  Package,
  Wrench,
  Users,
  MapPin,
  Clock,
  Gauge,
  WhatsappLogo,
  Eye,
  Trash,
  X,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarDeslocamentos,
  carregarVeiculosDeApoio,
  iniciarDeslocamento,
  excluirDeslocamento,
} from '../../../../constants/mockLevaETraz'
import { formatarTelefone } from '../../../../utils/fiscalValidators'
import { ModalNovoDeslocamento } from '../../../../components/leva-e-traz/ModalNovoDeslocamento'
import { ModalFinalizarDeslocamento } from '../../../../components/leva-e-traz/ModalFinalizarDeslocamento'
import { ModalDetalhesDeslocamento } from '../../../../components/leva-e-traz/ModalDetalhesDeslocamento'
import { GoogleMapsIcon } from '../../../../components/icons/GoogleMapsIcon'
import { gerarLinkGoogleMapsTrajeto } from '../../../../utils/googleMapsRouting'

function StatChip({ label, value, dark }) {
  return (
    <div
      className={`shrink-0 min-w-[104px] rounded-xl border p-2.5 ${
        dark ? 'bg-[#101828] border-[#101828]' : 'bg-white border-[#d0d5dd]'
      }`}
    >
      <p className={`text-[9.5px] font-bold uppercase tracking-wider ${dark ? 'text-zinc-400' : 'text-[#667085]'}`}>
        {label}
      </p>
      <p className={`text-sm font-extrabold mt-0.5 ${dark ? 'text-white' : 'text-[#101828]'}`}>{value}</p>
    </div>
  )
}

function DeslocamentoCard({
  deslocamento,
  onIniciar,
  onFinalizar,
  onDetalhes,
  onExcluir,
}) {
  const foneLimpo = (deslocamento.clienteTelefone || deslocamento.fornecedorTelefone || '').replace(/\D/g, '')

  const mapsUrl = gerarLinkGoogleMapsTrajeto({
    origem: deslocamento.enderecoOrigem,
    destino: deslocamento.enderecoDestino,
    retornarOficina: deslocamento.tipoTrajeto === 'ida_e_volta' || deslocamento.retornarOficina !== false,
  })

  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-2xs p-3.5 space-y-2.5">
      {/* Topo do Card */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-[#f2f4f7] border border-[#e4e7ec] text-[#101828]">
            {deslocamento.codigo}
          </span>
          <span className="text-[11px] font-semibold text-slate-500">{deslocamento.data}</span>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            deslocamento.status === 'concluido'
              ? 'bg-sky-50 text-sky-700 border border-sky-200'
              : deslocamento.status === 'em_deslocamento'
              ? 'bg-[#101828] text-white'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {deslocamento.status === 'concluido'
            ? 'Concluído'
            : deslocamento.status === 'em_deslocamento'
            ? 'Em Rota'
            : 'Agendado'}
        </span>
      </div>

      {/* Tipo de Missão e Título */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#101828]">
          {deslocamento.tipoServico === 'busca_veiculo' && <Car size={15} className="text-sky-600" />}
          {deslocamento.tipoServico === 'entrega_veiculo' && <Car size={15} className="text-sky-600" />}
          {deslocamento.tipoServico === 'translado_cliente' && <User size={15} className="text-sky-600" />}
          {deslocamento.tipoServico === 'busca_pecas' && <Package size={15} className="text-sky-600" />}
          {deslocamento.tipoServico === 'socorro_externo' && <Wrench size={15} className="text-sky-600" />}
          <span>
            {deslocamento.tipoServico === 'busca_veiculo'
              ? 'Busca de Veículo'
              : deslocamento.tipoServico === 'entrega_veiculo'
              ? 'Entrega de Veículo'
              : deslocamento.tipoServico === 'translado_cliente'
              ? 'Translado de Cliente'
              : deslocamento.tipoServico === 'busca_pecas'
              ? 'Busca de Peças'
              : 'Socorro Mecânico'}
          </span>
        </div>

        <p className="text-sm font-extrabold text-slate-900 mt-1 truncate">
          {deslocamento.clienteNome || deslocamento.fornecedorNome || 'Destino da logística'}
        </p>

        {deslocamento.veiculoPlaca && (
          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
            Carro: <strong className="font-mono text-slate-800">{deslocamento.veiculoPlaca}</strong> ({deslocamento.veiculoModelo})
          </p>
        )}

        {deslocamento.levarClienteEmbora && (
          <span className="inline-block mt-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
            Translado / Carona Ativa
          </span>
        )}
      </div>

      {/* Equipe e Veículo de Apoio */}
      <div className="bg-slate-50 rounded-xl p-2.5 text-xs space-y-1 border border-slate-100">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Equipe:</span>
          <strong className="text-slate-800">
            {deslocamento.quantidadeFuncionarios === 2 ? '2 Funcionários' : '1 Funcionário'} (
            {deslocamento.motoristaPrincipalNome}
            {deslocamento.auxiliarNome ? ` e ${deslocamento.auxiliarNome}` : ''})
          </strong>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Destino:</span>
          <span className="text-slate-800 font-medium truncate max-w-[170px]" title={deslocamento.enderecoDestino}>
            {deslocamento.enderecoDestino || '—'}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
          <span className="text-slate-500">Saída / Duração:</span>
          <span className="font-mono text-slate-800">
            {deslocamento.horarioSaidaReal || deslocamento.horarioSaidaPrevisto} (
            {deslocamento.tempoRealMinutos ? `${deslocamento.tempoRealMinutos} min` : `${deslocamento.tempoEstimadoMinutos || 45} min`}
            )
          </span>
        </div>
      </div>

      {/* Botão de Navegação GPS Google Maps */}
      {deslocamento.enderecoDestino && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 px-3 bg-sky-50 hover:bg-sky-100 active:bg-sky-200 border border-sky-200 rounded-xl flex items-center justify-between text-xs font-bold text-sky-900 transition-colors shadow-2xs"
          title="Abrir rota no Google Maps e iniciar GPS"
        >
          <div className="flex items-center gap-2">
            <GoogleMapsIcon size={18} />
            <span className="truncate">Iniciar no Google Maps</span>
          </div>
          <span className="text-[10px] bg-white border border-sky-300 text-sky-800 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
            {deslocamento.tipoTrajeto === 'somente_ida' ? 'Ida' : 'Ida e Volta'}
          </span>
        </a>
      )}

      {/* Botões de Ação */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
        {deslocamento.status === 'agendado' && (
          <button
            type="button"
            onClick={() => onIniciar(deslocamento)}
            className="h-10 rounded-xl bg-[#101828] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
          >
            <Play size={13} weight="fill" />
            <span>Iniciar</span>
          </button>
        )}

        {deslocamento.status === 'em_deslocamento' && (
          <button
            type="button"
            onClick={() => onFinalizar(deslocamento)}
            className="h-10 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
          >
            <CheckCircle size={14} weight="bold" />
            <span>Concluir</span>
          </button>
        )}

        {deslocamento.status === 'concluido' && (
          <div className="h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center gap-1">
            <CheckCircle size={14} />
            <span>Concluído</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => onDetalhes(deslocamento)}
          className="h-10 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
        >
          <Eye size={14} />
          <span>Ficha</span>
        </button>

        {foneLimpo ? (
          <a
            href={`https://wa.me/55${foneLimpo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
          >
            <WhatsappLogo size={14} weight="fill" />
            <span>WhatsApp</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => onExcluir(deslocamento)}
            className="h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
          >
            <Trash size={14} />
            <span>Excluir</span>
          </button>
        )}
      </div>
    </div>
  )
}

export function MobileLevaETrazPage() {
  const [deslocamentos, setDeslocamentos] = useState([])
  const [veiculosApoio, setVeiculosApoio] = useState([])
  const [busca, setBusca] = useState('')
  const [abaAtiva, setAbaAtiva] = useState('roteiro')

  // Modais
  const [modalNovoAberto, setModalNovoAberto] = useState(false)
  const [modalFinalizarAberto, setModalFinalizarAberto] = useState(false)
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false)
  const [deslocamentoSelecionado, setDeslocamentoSelecionado] = useState(null)

  const recarregar = () => {
    setDeslocamentos(carregarDeslocamentos())
    setVeiculosApoio(carregarVeiculosDeApoio())
  }

  useEffect(() => {
    recarregar()
    window.addEventListener('storage', recarregar)
    return () => window.removeEventListener('storage', recarregar)
  }, [])

  const metricas = useMemo(() => {
    const total = deslocamentos.length
    const emRota = deslocamentos.filter((d) => d.status === 'em_deslocamento').length
    const agendados = deslocamentos.filter((d) => d.status === 'agendado').length
    const concluidos = deslocamentos.filter((d) => d.status === 'concluido').length
    const kmTotal = deslocamentos.reduce((acc, curr) => {
      const km = parseFloat(String(curr.kmRealizado || curr.kmEstimado || 0).replace(/\./g, '').replace(',', '.')) || 0
      return acc + km
    }, 0)
    return { total, emRota, agendados, concluidos, kmTotal: Math.round(kmTotal) }
  }, [deslocamentos])

  const filtrados = useMemo(() => {
    return deslocamentos.filter((d) => {
      const termo = busca.trim().toLowerCase()
      const matchBusca =
        !termo ||
        (d.codigo || '').toLowerCase().includes(termo) ||
        (d.clienteNome || '').toLowerCase().includes(termo) ||
        (d.veiculoPlaca || '').toLowerCase().includes(termo) ||
        (d.fornecedorNome || '').toLowerCase().includes(termo) ||
        (d.motoristaPrincipalNome || '').toLowerCase().includes(termo)

      if (abaAtiva === 'roteiro') {
        return matchBusca && (d.status === 'agendado' || d.status === 'em_deslocamento')
      }
      return matchBusca
    })
  }, [deslocamentos, busca, abaAtiva])

  const handleIniciar = (d) => {
    iniciarDeslocamento(d.id)
    recarregar()
    toast.success(`Deslocamento #${d.codigo} iniciado!`)
  }

  const handleExcluir = (d) => {
    excluirDeslocamento(d.id)
    recarregar()
    toast.success(`Deslocamento #${d.codigo} removido.`)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Topo Mobile */}
      <div className="bg-white border-b border-[#e4e7ec] px-4 pt-3 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-black text-[#101828] tracking-tight">Leva e Traz</h1>
            <p className="text-[11px] text-[#667085]">Logística, busca de carros e peças</p>
          </div>
          <button
            type="button"
            onClick={() => setModalNovoAberto(true)}
            className="h-9 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus size={15} weight="bold" />
            <span>Novo</span>
          </button>
        </div>

        {/* Chips de Indicadores */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
          <StatChip label="Em Rota" value={`${metricas.emRota} ativas`} dark />
          <StatChip label="Agendados" value={metricas.agendados} />
          <StatChip label="Concluídos" value={metricas.concluidos} />
          <StatChip label="KM Total" value={`${metricas.kmTotal} km`} />
        </div>

        {/* Alternador de Abas Mobile */}
        <div className="flex rounded-xl bg-slate-100 p-1 mt-3 border border-slate-200">
          <button
            type="button"
            onClick={() => setAbaAtiva('roteiro')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
              abaAtiva === 'roteiro'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600'
            }`}
          >
            Fila Ativa
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('historico')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
              abaAtiva === 'historico'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600'
            }`}
          >
            Histórico
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('apoio')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
              abaAtiva === 'apoio'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600'
            }`}
          >
            Veículos Apoio
          </button>
        </div>

        {/* Campo de Busca Rápida (Font-size 16px min para evitar zoom no mobile - Regra 10) */}
        {abaAtiva !== 'apoio' && (
          <div className="mt-3 relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por cliente, fornecedor ou placa..."
              style={{ fontSize: '16px' }}
              className="w-full h-11 pl-9 pr-8 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lista de Atendimentos */}
      <div className="flex-1 p-3 overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-h-0 space-y-3">
        {abaAtiva === 'apoio' ? (
          <div className="space-y-3">
            {veiculosApoio.map((v) => (
              <div key={v.id} className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-200">
                    {v.placa}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      v.status === 'em_rota' ? 'bg-[#101828] text-white' : 'bg-sky-50 text-sky-700 border border-sky-200'
                    }`}
                  >
                    {v.status === 'em_rota' ? 'Em Rota' : 'Disponível'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{v.nome}</h4>
                <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>Hodômetro:</span>
                  <strong className="font-mono text-slate-800">{v.kmAtual} km</strong>
                </div>
              </div>
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              <ArrowsLeftRight size={24} />
            </div>
            <p className="text-xs font-bold text-slate-800">Nenhum atendimento na fila</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Toque em "Novo" acima para registrar um serviço de busca, entrega ou carona.
            </p>
          </div>
        ) : (
          filtrados.map((d) => (
            <DeslocamentoCard
              key={d.id}
              deslocamento={d}
              onIniciar={handleIniciar}
              onFinalizar={(item) => {
                setDeslocamentoSelecionado(item)
                setModalFinalizarAberto(true)
              }}
              onDetalhes={(item) => {
                setDeslocamentoSelecionado(item)
                setModalDetalhesAberto(true)
              }}
              onExcluir={handleExcluir}
            />
          ))
        )}
      </div>

      {/* Modais */}
      <ModalNovoDeslocamento
        isOpen={modalNovoAberto}
        onClose={() => setModalNovoAberto(false)}
        onSalvo={recarregar}
      />

      <ModalFinalizarDeslocamento
        isOpen={modalFinalizarAberto}
        onClose={() => setModalFinalizarAberto(false)}
        deslocamento={deslocamentoSelecionado}
        onFinalizado={recarregar}
      />

      <ModalDetalhesDeslocamento
        isOpen={modalDetalhesAberto}
        onClose={() => setModalDetalhesAberto(false)}
        deslocamento={deslocamentoSelecionado}
      />
    </div>
  )
}
