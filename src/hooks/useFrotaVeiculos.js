import { useState, useEffect, useCallback, useRef } from 'react'
import { carregarVeiculos } from '../repositories/veiculosRepository'

/**
 * Hook compartilhado reativo para leitura da frota de veículos (Story 2.6 / AC1).
 * Expõe { dados, veiculos, carregando, erro, recarregar } e atualiza automaticamente
 * quando qualquer parte do sistema dispara 'dev_oficina_cadastros_updated' ou evento 'storage'.
 *
 * @returns {{ dados: Array, veiculos: Array, carregando: boolean, erro: Error|null, recarregar: Function }}
 */
export function useFrotaVeiculos() {
  const [dados, setDados] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const montadoRef = useRef(true)

  const recarregar = useCallback(async () => {
    try {
      setCarregando(true)
      setErro(null)
      const lista = await carregarVeiculos()
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
  }, [])

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
    veiculos: dados,
    carregando,
    erro,
    recarregar,
  }
}
