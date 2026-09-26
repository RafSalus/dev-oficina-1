import React, { createContext, useContext, useState, useEffect } from 'react'
import { MOCK_MECANICOS } from '../constants/mecanicos'
import { obterOrdensAbertas, atualizarStatusOrdem } from '../pages/dashboard/orcamento/mockOrdensAbertas'
import { toast } from 'sonner'
import {
  carregarRequisicoesPecas,
  criarRequisicaoPeca,
} from '../repositories/requisicoesPecasRepository'

const STORAGE_KEY_MECANICO_ATIVO = 'dev_oficina_mecanico_ativo'
const STORAGE_KEY_PECAS_DANIFICADAS = 'dev_oficina_pecas_danificadas'
const STORAGE_KEY_FERRAMENTAS_DANIFICADAS = 'dev_oficina_ferramentas_danificadas'

const MecanicoContext = createContext(null)

export function MecanicoProvider({ children }) {
  // Mecânico ativo selecionado
  const [mecanicoAtivo, setMecanicoAtivo] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_MECANICO_ATIVO)
      if (salvo) {
        const found = MOCK_MECANICOS.find((m) => m.value === salvo)
        if (found) return found
      }
    } catch {}
    return null
  })

  // Peças Danificadas
  const [pecasDanificadas, setPecasDanificadas] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_PECAS_DANIFICADAS)
      if (salvo) return JSON.parse(salvo)
    } catch {}
    return []
  })

  // Ferramentas Danificadas ou em Manutenção
  const [ferramentasDanificadas, setFerramentasDanificadas] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_FERRAMENTAS_DANIFICADAS)
      if (salvo) return JSON.parse(salvo)
    } catch {}
    return []
  })

  // Requisições de Peças ao Almoxarifado (Story 2.15: repositório assíncrono, D5 no banco)
  const [requisicoesPecas, setRequisicoesPecas] = useState([])
  const [carregandoRequisicoes, setCarregandoRequisicoes] = useState(true)

  useEffect(() => {
    let cancelado = false
    carregarRequisicoesPecas()
      .then((lista) => {
        if (!cancelado) setRequisicoesPecas(lista)
      })
      .catch((err) => {
        console.error('Erro ao carregar requisições de peças:', err)
        if (!cancelado) toast.error(err?.message || 'Não foi possível carregar as requisições de peças.')
      })
      .finally(() => {
        if (!cancelado) setCarregandoRequisicoes(false)
      })
    return () => {
      cancelado = true
    }
  }, [])

  // Trocar mecânico logado
  const trocarMecanico = (mecanicoValor) => {
    const found = MOCK_MECANICOS.find((m) => m.value === mecanicoValor)
    if (found) {
      setMecanicoAtivo(found)
      try {
        localStorage.setItem(STORAGE_KEY_MECANICO_ATIVO, found.value)
      } catch {}
      toast.success(`Sessão alternada para o mecânico ${found.nome}`)
    }
  }

  // Registrar peça danificada
  const adicionarPecaDanificada = (item) => {
    const nova = {
      id: `dan-${Date.now()}`,
      dataRegistro: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      mecanicoNome: mecanicoAtivo.nome,
      ...item,
    }
    setPecasDanificadas((prev) => {
      const updated = [nova, ...prev]
      try {
        localStorage.setItem(STORAGE_KEY_PECAS_DANIFICADAS, JSON.stringify(updated))
      } catch {}
      return updated
    })
    toast.success('Peça danificada registrada com sucesso no histórico da oficina!')
  }

  // Registrar ferramenta com defeito
  const adicionarFerramentaDanificada = (item) => {
    const nova = {
      id: `ferr-${Date.now()}`,
      dataRegistro: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      mecanicoNome: mecanicoAtivo.nome,
      box: mecanicoAtivo.boxElevador || 'Bancada',
      status: 'Aguardando Avaliação da Oficina',
      ...item,
    }
    setFerramentasDanificadas((prev) => {
      const updated = [nova, ...prev]
      try {
        localStorage.setItem(STORAGE_KEY_FERRAMENTAS_DANIFICADAS, JSON.stringify(updated))
      } catch {}
      return updated
    })
    toast.success('Chamado de ferramenta com defeito aberto com sucesso!')
  }

  // Pedir peça para a OS (Requisitar ao almoxarifado). No Supabase o solicitante é resolvido
  // pela sessão (funcionario_atual_id); em falha nada é gravado localmente (fail-closed).
  const pedirPecaParaOS = async ({ numeroOS, veiculo, pecaNome, codigoPeca, quantidade = 1, urgencia = 'normal' }) => {
    try {
      const novaReq = await criarRequisicaoPeca({
        numeroOS,
        veiculo,
        pecaNome,
        codigoPeca,
        quantidade,
        urgencia,
        mecanicoNome: mecanicoAtivo?.nome || '',
      })
      setRequisicoesPecas((prev) => [novaReq, ...prev])
      toast.success(`Requisição da peça "${pecaNome}" enviada ao Almoxarifado para a OS #${numeroOS}!`)
      return novaReq
    } catch (err) {
      console.error('Erro ao requisitar peça:', err)
      toast.error(err?.message || 'Não foi possível enviar a requisição. Nada foi salvo.')
      return null
    }
  }

  return (
    <MecanicoContext.Provider
      value={{
        mecanicoAtivo,
        trocarMecanico,
        listaMecanicos: MOCK_MECANICOS.filter((m) => m.value !== ''),
        pecasDanificadas,
        adicionarPecaDanificada,
        ferramentasDanificadas,
        adicionarFerramentaDanificada,
        requisicoesPecas,
        carregandoRequisicoes,
        pedirPecaParaOS,
      }}
    >
      {children}
    </MecanicoContext.Provider>
  )
}

export function useMecanico() {
  const context = useContext(MecanicoContext)
  if (!context) {
    throw new Error('useMecanico deve ser usado dentro de um MecanicoProvider')
  }
  return context
}
