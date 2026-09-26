import { useState, useEffect, useCallback, useRef } from 'react'
import { carregarClientes } from '../repositories/clientesRepository'

/**
 * Hook compartilhado reativo para leitura de clientes cadastrados (Story 2.6 / AC1).
 * Expõe { dados, clientes, carregando, erro, recarregar } e atualiza automaticamente
 * quando qualquer parte do sistema dispara 'dev_oficina_cadastros_updated' ou evento 'storage'.
 *
 * @param {object} [opcoes]
 * @param {boolean} [opcoes.incluirVeiculos=true]
 * @returns {{ dados: Array, clientes: Array, carregando: boolean, erro: Error|null, recarregar: Function }}
 */
export function useClientesCadastrados({ incluirVeiculos = true } = {}) {
  const [dados, setDados] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const montadoRef = useRef(true)

  const recarregar = useCallback(async () => {
    try {
      setCarregando(true)
      setErro(null)
      const lista = await carregarClientes({ incluirVeiculos })
      if (montadoRef.current) {
        setDados(lista || [])
      }
    } catch (err) {
      if (montadoRef.current) {
        setErro(err)
      }
    } finally {
      if (montadoRef.current) {
        setCarregando(false)
      }
    }
  }, [incluirVeiculos])

  useEffect(() => {
    montadoRef.current = true
    recarregar()

    const onAtualizacao = () => {
      recarregar()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('dev_oficina_cadastros_updated', onAtualizacao)
      window.addEventListener('storage', onAtualizacao)
    }

    return () => {
      montadoRef.current = false
      if (typeof window !== 'undefined') {
        window.removeEventListener('dev_oficina_cadastros_updated', onAtualizacao)
        window.removeEventListener('storage', onAtualizacao)
      }
    }
  }, [recarregar])

  return {
    dados,
    clientes: dados,
    carregando,
    erro,
    recarregar,
  }
}
