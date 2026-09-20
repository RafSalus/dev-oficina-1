import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ShieldCheck,
  MagnifyingGlass,
  Gauge,
  User,
  WhatsappLogo,
  ClipboardText,
  Wrench,
  PencilSimple,
  SealCheck,
  CalendarBlank,
  CurrencyDollar,
  X,
  Eye,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarVeiculosAtivosPreventiva,
  calcularSaudeVeiculo,
  carregarManutencoesPreventivas,
  ITENS_PREVENTIVOS_CATALOGO,
} from '../../../../constants/mockManutencaoPreventiva'
import { formatarTelefone } from '../../../../utils/fiscalValidators'
import { ModalFichaSaudeVeiculo } from '../../../../components/manutencao-preventiva/ModalFichaSaudeVeiculo'
import { ModalAtualizarKmVeiculo } from '../../../../components/manutencao-preventiva/ModalAtualizarKmVeiculo'

function StatChip({ label, value, dark, highlight }) {
  return (
    <div
      className={`shrink-0 min-w-[104px] rounded-xl border p-2.5 ${
        dark
          ? 'bg-[#101828] border-[#101828] text-white'
          : highlight
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-white border-[#d0d5dd] text-[#101828]'
      }`}
    >
      <p className={`text-[9.5px] font-bold uppercase tracking-wider ${dark ? 'text-zinc-400' : 'text-[#667085]'}`}>
        {label}
      </p>
      <p className="text-sm font-extrabold mt-0.5 font-mono">{value}</p>
    </div>
  )
}

function VeiculoCardMobile({
  vSaude,
  onDetalhes,
  onAtualizarKm,
  onCriarOS,
  onWhatsApp,
}) {
  const v = vSaude.veiculo
  const foneLimpo = (v.clienteTelefone || '').replace(/\D/g, '')
  const vencidos = vSaude.itensAvaliados.filter((i) => i.status === 'vencido')
  const emAtencao = vSaude.itensAvaliados.filter((i) => i.status === 'atencao')

  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-2xs p-3.5 space-y-2.5">
      {/* Topo do Card */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-[#101828] text-white">
            {vSaude.placa}
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            {v.ano} • {v.cor}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`font-mono font-black text-xs px-2 py-0.5 rounded-full ${
              vSaude.healthScore >= 80
                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                : vSaude.healthScore >= 50
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-[#101828] text-white'
            }`}
          >
            {vSaude.healthScore}% Saúde
          </span>
        </div>
      </div>

      {/* Modelo e Proprietário */}
      <div>
        <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
          {v.marcaModelo || v.modelo}
        </h4>
        <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
          <User size={13} className="text-sky-600 shrink-0" />
          <strong className="text-slate-800 truncate">{v.clienteNome}</strong>
          {v.clienteTelefone && (
            <span className="text-slate-400 text-[11px] shrink-0">
              ({formatarTelefone(v.clienteTelefone)})
            </span>
          )}
        </div>
      </div>

      {/* Hodômetro e Oportunidade Financeira */}
      <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xs border border-slate-100">
        <div className="flex items-center gap-1.5">
          <Gauge size={15} className="text-slate-500" />
          <div>
            <span className="text-[10px] text-slate-500 block">Hodômetro</span>
            <span className="font-mono font-bold text-slate-900">
              {v.kmPadrao || v.kmAtual || '0'} km
            </span>
          </div>
          <button
            type="button"
            onClick={() => onAtualizarKm(v)}
            className="text-slate-400 hover:text-sky-600 p-1 cursor-pointer"
            title="Atualizar KM"
          >
            <PencilSimple size={13} />
          </button>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-sky-700 font-bold block">Oportunidade</span>
          <span className="font-mono font-extrabold text-sky-900 text-xs">
            {vSaude.receitaPotencialTotal > 0
              ? `R$ ${vSaude.receitaPotencialTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
              : 'Em Dia'}
          </span>
        </div>
      </div>

      {/* Tags de Itens Vencidos / Atenção */}
      <div className="flex flex-wrap gap-1">
        {vencidos.map((item) => (
          <span
            key={item.id}
            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300"
          >
            {item.nome}
          </span>
        ))}
        {emAtencao.map((item) => (
          <span
            key={item.id}
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200"
          >
            {item.nome}
          </span>
        ))}
        {vSaude.temGarantiaPendente && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
            Revisão Garantia
          </span>
        )}
        {vencidos.length === 0 && emAtencao.length === 0 && !vSaude.temGarantiaPendente && (
          <span className="text-[10px] text-slate-500 font-medium">
            Todos os itens monitorados estão em dia
          </span>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onDetalhes(vSaude)}
          className="h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
        >
          <Eye size={14} />
          <span>Ficha</span>
        </button>

        {foneLimpo ? (
          <button
            type="button"
            onClick={() => onWhatsApp(vSaude)}
            className="h-9 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
          >
            <WhatsappLogo size={14} weight="fill" />
            <span>WhatsApp</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onAtualizarKm(v)}
            className="h-9 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
          >
            <Gauge size={14} />
            <span>KM</span>
          </button>
        )}

        <button
          type="button"
          onClick={() =>
            onCriarOS(v, [
              ...vencidos,
              ...emAtencao,
              ...(vSaude.temGarantiaPendente
                ? [vSaude.itensAvaliados.find((i) => i.id === 'revisao_garantia')].filter(Boolean)
                : []),
            ])
          }
          className="h-9 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
        >
          <ClipboardText size={14} weight="bold" />
          <span>Criar OS</span>
        </button>
      </div>
    </div>
  )
}

export function MobileManutencaoPreventivaPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'

  const [veiculosAtivos, setVeiculosAtivos] = useState([])
  const [preventivas, setPreventivas] = useState([])
  const [busca, setBusca] = useState('')
  const [abaAtiva, setAbaAtiva] = useState('frota') // 'frota' | 'campanhas' | 'garantias'

  // Modais
  const [modalFichaAberto, setModalFichaAberto] = useState(false)
  const [modalAtualizarKmAberto, setModalAtualizarKmAberto] = useState(false)
  const [saudeSelecionada, setSaudeSelecionada] = useState(null)
  const [veiculoParaAtualizar, setVeiculoParaAtualizar] = useState(null)

  const recarregar = () => {
    setVeiculosAtivos(carregarVeiculosAtivosPreventiva())
    setPreventivas(carregarManutencoesPreventivas())
  }

  useEffect(() => {
    recarregar()
    window.addEventListener('storage', recarregar)
    return () => window.removeEventListener('storage', recarregar)
  }, [])

  const veiculosAvaliados = useMemo(() => {
    return veiculosAtivos.map((v) => calcularSaudeVeiculo(v, preventivas))
  }, [veiculosAtivos, preventivas])

  const metricas = useMemo(() => {
    const total = veiculosAvaliados.length
    const criticos = veiculosAvaliados.filter((v) => v.statusGeral === 'critico').length
    const atencao = veiculosAvaliados.filter((v) => v.statusGeral === 'atencao').length
    const garantias = veiculosAvaliados.filter((v) => v.temGarantiaPendente).length
    const receitaPotencial = veiculosAvaliados.reduce(
      (acc, curr) => acc + curr.receitaPotencialTotal,
      0
    )
    return { total, criticos, atencao, garantias, receitaPotencial }
  }, [veiculosAvaliados])

  const filtrados = useMemo(() => {
    return veiculosAvaliados.filter((vSaude) => {
      const v = vSaude.veiculo
      const termo = busca.trim().toLowerCase()
      const match =
        !termo ||
        (v.placa || '').toLowerCase().includes(termo) ||
        (v.marcaModelo || v.modelo || '').toLowerCase().includes(termo) ||
        (v.clienteNome || '').toLowerCase().includes(termo)

      if (abaAtiva === 'garantias') {
        return match && vSaude.temGarantiaPendente
      }
      return match
    })
  }, [veiculosAvaliados, busca, abaAtiva])

  const handleCriarOS = (veiculo, itens = []) => {
    let itensSelecionados = itens
    if (!itensSelecionados || itensSelecionados.length === 0) {
      const vSaude = veiculosAvaliados.find(
        (va) => (va.placa || '').toUpperCase().trim() === (veiculo.placa || '').toUpperCase().trim()
      )
      if (vSaude) {
        const vencidos = vSaude.itensAvaliados.filter((i) => i.status === 'vencido')
        const emAtencao = vSaude.itensAvaliados.filter((i) => i.status === 'atencao')
        itensSelecionados = [...vencidos, ...emAtencao]
        if (vSaude.temGarantiaPendente) {
          const itemGarantia = vSaude.itensAvaliados.find((i) => i.id === 'revisao_garantia')
          if (itemGarantia && !itensSelecionados.some((it) => it.id === 'revisao_garantia')) {
            itensSelecionados.push(itemGarantia)
          }
        }
      }
    }

    navigate(`${basePath}/ordem-de-servico/nova`, {
      state: {
        clienteId: veiculo.clienteId,
        veiculoPlaca: veiculo.placa,
        veiculo: veiculo,
        itensPreventivosSugeridos: itensSelecionados,
      },
    })
  }

  const handleWhatsApp = (vSaude) => {
    const foneLimpo = (vSaude.veiculo.clienteTelefone || '').replace(/\D/g, '')
    if (!foneLimpo) return

    const vencidos = vSaude.itensAvaliados.filter((i) => i.status === 'vencido')
    let lista = ''
    vencidos.forEach((v) => {
      lista += `• ${v.nome}\n`
    })

    const mensagem =
      `Olá, *${vSaude.veiculo.clienteNome}*! Tudo bem?\n` +
      `Aqui é da *Mecânica Gabriel*. Lembramos que o seu *${vSaude.veiculo.marcaModelo || vSaude.veiculo.modelo}* (Placa: *${vSaude.veiculo.placa}*) está no momento de revisar:\n` +
      `${lista}` +
      `Deseja agendar um horário com a gente? Temos serviço de leva e traz disponível!`

    window.open(`https://wa.me/55${foneLimpo}?text=${encodeURIComponent(mensagem)}`, '_blank')
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Topo Mobile */}
      <div className="bg-white border-b border-[#e4e7ec] px-4 pt-3 pb-3 shrink-0">
        <div className="mb-3">
          <h1 className="text-base font-black text-[#101828] tracking-tight">
            Manutenção Preventiva
          </h1>
          <p className="text-[11px] text-[#667085]">Saúde veicular e retenção de clientes</p>
        </div>

        {/* Chips de Métricas com rolagem invisível */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
          <StatChip label="Frota Ativa" value={`${metricas.total} carros`} dark />
          <StatChip label="Vencidos" value={metricas.criticos} highlight />
          <StatChip label="Em Atenção" value={metricas.atencao} />
          <StatChip label="Garantias" value={metricas.garantias} />
          <StatChip
            label="Oportunidade"
            value={`R$ ${metricas.receitaPotencial.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          />
        </div>

        {/* Alternador de Abas Mobile */}
        <div className="flex rounded-xl bg-slate-100 p-1 mt-3 border border-slate-200">
          <button
            type="button"
            onClick={() => setAbaAtiva('frota')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
              abaAtiva === 'frota'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600'
            }`}
          >
            Frota Ativa
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('campanhas')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
              abaAtiva === 'campanhas'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600'
            }`}
          >
            Campanhas
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('garantias')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
              abaAtiva === 'garantias'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600'
            }`}
          >
            Garantias ({metricas.garantias})
          </button>
        </div>

        {/* Campo de Busca Rápida (Font-size 16px min para evitar zoom no mobile - Regra 10) */}
        {abaAtiva !== 'campanhas' && (
          <div className="mt-3 relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por placa, cliente ou modelo..."
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

      {/* Lista de Veículos ou Campanhas */}
      <div className="flex-1 p-3 overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-h-0 space-y-3">
        {abaAtiva === 'campanhas' ? (
          <div className="space-y-3">
            {ITENS_PREVENTIVOS_CATALOGO.map((item) => {
              const alvos = veiculosAvaliados.filter((vSaude) => {
                const itemAval = vSaude.itensAvaliados.find((i) => i.id === item.id)
                return itemAval && itemAval.status !== 'em_dia'
              })

              return (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.categoria}
                    </span>
                    <span className="font-mono font-bold text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      R$ {item.valorEstimadoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{item.nome}</h4>
                  <p className="text-[11px] text-slate-500">{item.descricao}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-semibold">
                      Veículos que precisam deste serviço:
                    </span>
                    <strong className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {alvos.length} carros
                    </strong>
                  </div>
                </div>
              )
            })}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              <ShieldCheck size={24} />
            </div>
            <p className="text-xs font-bold text-slate-800">Nenhum veículo encontrado</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tente alterar os termos da busca acima.
            </p>
          </div>
        ) : (
          filtrados.map((vSaude) => (
            <VeiculoCardMobile
              key={vSaude.placa}
              vSaude={vSaude}
              onDetalhes={(item) => {
                setSaudeSelecionada(item)
                setModalFichaAberto(true)
              }}
              onAtualizarKm={(veic) => {
                setVeiculoParaAtualizar(veic)
                setModalAtualizarKmAberto(true)
              }}
              onCriarOS={handleCriarOS}
              onWhatsApp={handleWhatsApp}
            />
          ))
        )}
      </div>

      {/* Modais */}
      <ModalFichaSaudeVeiculo
        isOpen={modalFichaAberto}
        onClose={() => setModalFichaAberto(false)}
        saudeVeiculo={saudeSelecionada}
        onAtualizarKm={(veic) => {
          setVeiculoParaAtualizar(veic)
          setModalAtualizarKmAberto(true)
        }}
        onGerarOrdemServico={handleCriarOS}
      />

      <ModalAtualizarKmVeiculo
        isOpen={modalAtualizarKmAberto}
        onClose={() => setModalAtualizarKmAberto(false)}
        veiculo={veiculoParaAtualizar}
        onAtualizado={recarregar}
      />
    </div>
  )
}
