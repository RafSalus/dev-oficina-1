import React, { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useCliente } from '../../context/ClienteContext'
import { obterOrdensAbertas } from '../dashboard/orcamento/mockOrdensAbertas'
import { ClienteModulePlaceholder } from '../../components/cliente/ClienteModulePlaceholder'

// A rota /cliente/servicos costumava renderizar uma página própria com dados de demonstração
// fixos (OS #002908 fake), sem nunca tocar o estoque real de OS — enquanto a página pública
// de aprovação (/aprovacao/:id) já lê a OS de verdade. Em vez de manter dois portais de
// aprovação divergentes, esta rota agora só localiza a OS real e mais relevante do cliente
// logado e redireciona para a mesma página pública unificada.
export function ClienteServicosRedirect() {
  const { clienteAtivo } = useCliente()

  const numeroOSAtiva = useMemo(() => {
    const doCliente = obterOrdensAbertas().filter((os) => os.clienteId === clienteAtivo?.value)
    if (doCliente.length === 0) return null

    // Prioriza uma OS aguardando a aprovação do próprio cliente; sem isso, mostra a mais recente.
    const aguardando = doCliente.find((os) => os.status === 'aguardando_aprovacao')
    return (aguardando || doCliente[0]).numeroOS
  }, [clienteAtivo?.value])

  if (!numeroOSAtiva) return <ClienteModulePlaceholder />

  return <Navigate to={`/aprovacao/${numeroOSAtiva}`} replace />
}
