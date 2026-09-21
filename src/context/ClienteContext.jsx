import React, { createContext, useContext, useState } from 'react'
import { MOCK_CLIENTES_VEICULOS } from '../constants/mockClientesVeiculos'
import { toast } from 'sonner'

const STORAGE_KEY_CLIENTE_ATIVO = 'dev_oficina_cliente_ativo'

const ClienteContext = createContext(null)

export function ClienteProvider({ children }) {
  const [clienteAtivo, setClienteAtivo] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_CLIENTE_ATIVO)
      if (salvo) {
        const found = MOCK_CLIENTES_VEICULOS.find((c) => c.value === salvo)
        if (found) return found
      }
    } catch {}
    // Sem identidade autenticada por padrão (elimina vazamento de dados anônimos - AC4 Story 1.1)
    return null
  })

  // Veículo selecionado pelo cliente
  const [veiculoAtivo, setVeiculoAtivo] = useState(() => {
    return clienteAtivo?.veiculos?.[0] || null
  })

  const definirClienteAtivo = (cliente) => {
    if (!cliente) {
      setClienteAtivo(null)
      setVeiculoAtivo(null)
      try {
        localStorage.removeItem(STORAGE_KEY_CLIENTE_ATIVO)
      } catch {}
      return
    }
    setClienteAtivo(cliente)
    setVeiculoAtivo(cliente?.veiculos?.[0] || null)
    try {
      localStorage.setItem(STORAGE_KEY_CLIENTE_ATIVO, cliente.value)
    } catch {}
  }

  const trocarVeiculo = (veiculoValor) => {
    const found = clienteAtivo?.veiculos?.find((v) => v.value === veiculoValor)
    if (found) {
      setVeiculoAtivo(found)
      toast.info(`Veículo selecionado: ${found.marcaModelo}`)
    }
  }

  const logoutCliente = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_CLIENTE_ATIVO)
    } catch {}
    setClienteAtivo(null)
    setVeiculoAtivo(null)
    toast.info('Sessão encerrada com sucesso.')
  }

  return (
    <ClienteContext.Provider
      value={{
        clienteAtivo,
        veiculoAtivo,
        isClienteAutenticado: Boolean(clienteAtivo),
        definirClienteAtivo,
        trocarVeiculo,
        logoutCliente,
      }}
    >
      {children}
    </ClienteContext.Provider>
  )
}

export function useCliente() {
  const context = useContext(ClienteContext)
  if (!context) {
    return {
      clienteAtivo: null,
      veiculoAtivo: null,
      isClienteAutenticado: false,
      definirClienteAtivo: () => {},
      trocarVeiculo: () => {},
      logoutCliente: () => {},
    }
  }
  return context
}
