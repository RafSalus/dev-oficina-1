import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMecanicosAgenda } from '../../hooks/useMecanicosAgenda'
import { useFilaEsperaWorkflow } from '../../hooks/useFilaEsperaWorkflow'
import { FilaHeader } from './fila/FilaHeader'
import { FilaFiltros } from './fila/FilaFiltros'
import { TabelaFila } from './fila/TabelaFila'
import { ModalInserirFila } from './fila/ModalInserirFila'

/**
 * Tela dedicada da Fila de Atendimento (desktop) — ADR-003.
 * Ordenação, filtros, métricas e remoção vêm de `useFilaEsperaWorkflow`.
 */
export function AgendaFilaDedicada({ fila = [], onAtualizarFila }) {
  const mecanicosAgenda = useMecanicosAgenda()
  const navigate = useNavigate()
  const location = useLocation()
  const filaWorkflow = useFilaEsperaWorkflow({ fila, onAtualizarFila })
  const [isModalNovoClienteAberto, setIsModalNovoClienteAberto] = useState(false)

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

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      <FilaHeader
        metricasFila={filaWorkflow.metricasFila}
        onInserirCliente={() => setIsModalNovoClienteAberto(true)}
      />

      <FilaFiltros filaWorkflow={filaWorkflow} />

      <TabelaFila
        filaFiltrada={filaWorkflow.filaFiltrada}
        mecanicosAgenda={mecanicosAgenda}
        onAbrirOS={handleAbrirOS}
        onRemover={filaWorkflow.removerDaFila}
      />

      <ModalInserirFila
        isOpen={isModalNovoClienteAberto}
        onClose={() => setIsModalNovoClienteAberto(false)}
        fila={fila}
        onAtualizarFila={onAtualizarFila}
        mecanicosAgenda={mecanicosAgenda}
      />
    </div>
  )
}
