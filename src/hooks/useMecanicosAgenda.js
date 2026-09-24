import { useEffect, useState } from 'react'
import { obterMecanicosAtivos } from '../repositories/funcionariosRepository'

/**
 * Lista de mecânicos ativos (cadastro de Funcionários) para a Agenda.
 * Recarrega sempre que o cadastro de funcionários é atualizado.
 * @returns {Array<{id: string, nome: string}>}
 */
export function useMecanicosAgenda() {
  const [mecanicos, setMecanicos] = useState([])

  useEffect(() => {
    let cancelado = false
    const carregar = async () => {
      try {
        const ativos = await obterMecanicosAtivos()
        if (!cancelado) setMecanicos(Array.isArray(ativos) ? ativos : [])
      } catch (err) {
        console.error('Erro ao carregar mecânicos para agenda:', err)
      }
    }

    carregar()
    window.addEventListener('dev_oficina_funcionarios_updated', carregar)
    return () => {
      cancelado = true
      window.removeEventListener('dev_oficina_funcionarios_updated', carregar)
    }
  }, [])

  return mecanicos
}
