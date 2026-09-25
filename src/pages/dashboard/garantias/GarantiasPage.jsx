import React, { useState, useEffect, useMemo } from 'react'
import { SealCheck } from '@phosphor-icons/react'
import {
  carregarGarantias,
  salvarGarantias,
  calcularMetricasGarantias,
} from '../../../constants/mockGarantias'
import { GarantiasKPIs } from '../../../components/garantias/GarantiasKPIs'
import { GarantiasFiltros } from '../../../components/garantias/GarantiasFiltros'
import { GarantiasTabela } from '../../../components/garantias/GarantiasTabela'
import { ModalDetalhesGarantia } from '../../../components/garantias/ModalDetalhesGarantia'
import { ModalAcionamentoGarantia } from '../../../components/garantias/ModalAcionamentoGarantia'
import { MobileGarantiasPage } from './mobile/MobileGarantiasPage'
import { useIsMobile } from '../../../hooks/useIsMobile'

export function GarantiasPage() {
  const isMobile = useIsMobile()
  const [garantias, setGarantias] = useState([])
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODAS')

  // Modais
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false)
  const [garantiaSelecionada, setGarantiaSelecionada] = useState(null)
  const [modalAcionamentoAberto, setModalAcionamentoAberto] = useState(false)
  const [garantiaParaAcionar, setGarantiaParaAcionar] = useState(null)

  const recarregar = () => {
    const lista = carregarGarantias()
    setGarantias(lista)
  }

  useEffect(() => {
    recarregar()
    const handleStorage = () => recarregar()
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Métricas calculadas
  const metricas = useMemo(() => {
    return calcularMetricasGarantias(garantias)
  }, [garantias])

  // Contadores para as tabs
  const contadores = useMemo(() => {
    return {
      total: garantias.length,
      ativas: garantias.filter((g) => g.status === 'ATIVA').length,
      aVencer: garantias.filter((g) => g.status === 'A_VENCER').length,
      expiradas: garantias.filter((g) => g.status === 'EXPIRADA').length,
      acionadas: garantias.filter((g) => g.status === 'ACIONADA').length,
    }
  }, [garantias])

  // Filtragem e busca
  const garantiasFiltradas = useMemo(() => {
    return garantias.filter((item) => {
      // Filtro de status
      if (filtroStatus !== 'TODAS' && item.status !== filtroStatus) {
        return false
      }

      // Busca textual
      if (busca.trim()) {
        const termo = busca.toLowerCase().trim()
        const matchId = (item.id || '').toLowerCase().includes(termo)
        const matchOS = (item.numeroOS || '').toLowerCase().includes(termo)
        const matchCliente = (item.clienteNome || '').toLowerCase().includes(termo)
        const matchPlaca = (item.placa || '').toLowerCase().includes(termo)
        const matchVeiculo = (item.veiculo || '').toLowerCase().includes(termo)
        const matchDesc = (item.descricao || '').toLowerCase().includes(termo)

        return (
          matchId ||
          matchOS ||
          matchCliente ||
          matchPlaca ||
          matchVeiculo ||
          matchDesc
        )
      }

      return true
    })
  }, [garantias, filtroStatus, busca])

  // Handlers de Ações
  const handleVerDetalhes = (garantia) => {
    setGarantiaSelecionada(garantia)
    setModalDetalhesAberto(true)
  }

  const handleAcionarGarantia = (garantia) => {
    setGarantiaParaAcionar(garantia)
    setModalAcionamentoAberto(true)
  }

  const handleNovoAcionamentoLivre = () => {
    setGarantiaParaAcionar(null)
    setModalAcionamentoAberto(true)
  }

  const handleConfirmarAcionamento = (idGarantia, dadosAcionamento) => {
    const novaLista = garantias.map((g) => {
      if (g.id === idGarantia) {
        const acionamentosExistentes = g.acionamentos || []
        return {
          ...g,
          status: 'ACIONADA',
          acionamentos: [dadosAcionamento, ...acionamentosExistentes],
          observacoes: `Retorno em garantia registrado em ${dadosAcionamento.dataAcionamento}.`,
        }
      }
      return g
    })

    salvarGarantias(novaLista)
    setGarantias(novaLista)
  }

  if (isMobile) {
    return (
      <>
        <MobileGarantiasPage
          garantias={garantiasFiltradas}
          metricas={metricas}
          busca={busca}
          onBuscaChange={setBusca}
          filtroStatus={filtroStatus}
          onFiltroStatusChange={setFiltroStatus}
          contadores={contadores}
          onVerDetalhes={handleVerDetalhes}
          onAcionarGarantia={handleAcionarGarantia}
          onNovoAcionamento={handleNovoAcionamentoLivre}
        />

        <ModalDetalhesGarantia
          garantia={garantiaSelecionada}
          isOpen={modalDetalhesAberto}
          onClose={() => setModalDetalhesAberto(false)}
          onAcionar={handleAcionarGarantia}
        />

        <ModalAcionamentoGarantia
          garantia={garantiaParaAcionar}
          todasGarantias={garantias}
          isOpen={modalAcionamentoAberto}
          onClose={() => setModalAcionamentoAberto(false)}
          onConfirmarAcionamento={handleConfirmarAcionamento}
        />
      </>
    )
  }

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden select-none">
      {/* Top Header da Tela Desktop */}
      <div className="bg-white rounded-xl px-4 py-3 border border-zinc-200/80 shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 border border-sky-200/60">
            <SealCheck size={24} weight="duotone" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-zinc-900 tracking-tight">
                Garantias
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-full border border-zinc-200">
                Pós-Venda & Qualidade
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Acompanhamento de prazos de garantia de peças e serviços aplicados com controle de retornos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500">
            Total monitorado: <strong className="text-zinc-900">{contadores.total}</strong>
          </span>
        </div>
      </div>

      {/* Cards de Métricas e KPIs */}
      <GarantiasKPIs metricas={metricas} />

      {/* Barra de Filtros e Busca */}
      <GarantiasFiltros
        busca={busca}
        onBuscaChange={setBusca}
        filtroStatus={filtroStatus}
        onFiltroStatusChange={setFiltroStatus}
        contadores={contadores}
        onNovoAcionamento={handleNovoAcionamentoLivre}
      />

      {/* Tabela de Listagem com scroll interno */}
      <GarantiasTabela
        garantias={garantiasFiltradas}
        onVerDetalhes={handleVerDetalhes}
        onAcionarGarantia={handleAcionarGarantia}
      />

      {/* Modais */}
      <ModalDetalhesGarantia
        garantia={garantiaSelecionada}
        isOpen={modalDetalhesAberto}
        onClose={() => setModalDetalhesAberto(false)}
        onAcionar={handleAcionarGarantia}
      />

      <ModalAcionamentoGarantia
        garantia={garantiaParaAcionar}
        todasGarantias={garantias}
        isOpen={modalAcionamentoAberto}
        onClose={() => setModalAcionamentoAberto(false)}
        onConfirmarAcionamento={handleConfirmarAcionamento}
      />
    </div>
  )
}
export default GarantiasPage
