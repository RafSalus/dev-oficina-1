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
    // Padrão: Edgar Amaral da Silveira
    return MOCK_CLIENTES_VEICULOS[0]
  })

  // Veículo selecionado pelo cliente
  const [veiculoAtivo, setVeiculoAtivo] = useState(() => {
    return clienteAtivo?.veiculos?.[0] || null
  })

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
    toast.info('Sessão encerrada com sucesso.')
  }

  return (
    <ClienteContext.Provider
      value={{
        clienteAtivo,
        veiculoAtivo,
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
    throw new Error('useCliente deve ser usado dentro de um ClienteProvider')
  }
  return context
}
