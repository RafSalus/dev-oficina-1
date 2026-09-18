import React, { createContext, useContext, useState, useEffect } from 'react'
import { MOCK_MECANICOS } from '../constants/mecanicos'
import { obterOrdensAbertas, atualizarStatusOrdem } from '../pages/dashboard/orcamento/mockOrdensAbertas'
import { toast } from 'sonner'

const STORAGE_KEY_MECANICO_ATIVO = 'dev_oficina_mecanico_ativo'
const STORAGE_KEY_PECAS_DANIFICADAS = 'dev_oficina_pecas_danificadas'
const STORAGE_KEY_FERRAMENTAS_DANIFICADAS = 'dev_oficina_ferramentas_danificadas'
const STORAGE_KEY_REQUISICOES_PECAS = 'dev_oficina_requisicoes_pecas'

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
    // Padrão: Carlos Eduardo (Chefe de oficina com OS atribuídas)
    return MOCK_MECANICOS[1] || MOCK_MECANICOS[0]
  })

  // Peças Danificadas
  const [pecasDanificadas, setPecasDanificadas] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_PECAS_DANIFICADAS)
      if (salvo) return JSON.parse(salvo)
    } catch {}
    return [
      {
        id: 'dan-1',
        dataRegistro: '19/08/2026 14:15',
        numeroOS: '002908',
        veiculo: 'Fiat Doblo 1.8 Cargo (ASF6I46)',
        peca: 'Tubo de Arrefecimento com Fissura',
        codigoPeca: '0018969',
        mecanicoNome: 'Carlos Eduardo',
        motivo: 'Trinca no corpo plástico por ressecamento térmico',
        tipoDestino: 'Descarte Ambiental',
        status: 'Registrado na Bancada',
      },
      {
        id: 'dan-2',
        dataRegistro: '18/08/2026 16:30',
        numeroOS: '002909',
        veiculo: 'VW Gol 1.6 Trend (ABC1D23)',
        peca: 'Disco de Freio Dianteiro Empenado e Trincado',
        codigoPeca: '011291',
        mecanicoNome: 'Carlos Eduardo',
        motivo: 'Empenamento térmico excessivo e desgaste abaixo da espessura mínima',
        tipoDestino: 'Devolução ao Cliente para Visualização',
        status: 'Em Análise',
      },
    ]
  })

  // Ferramentas Danificadas ou em Manutenção
  const [ferramentasDanificadas, setFerramentasDanificadas] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_FERRAMENTAS_DANIFICADAS)
      if (salvo) return JSON.parse(salvo)
    } catch {}
    return [
      {
        id: 'ferr-1',
        dataRegistro: '18/08/2026 09:10',
        ferramenta: 'Torquímetro de Estalo 1/2 Pol (40 a 200 Nm)',
        box: 'Box 01',
        mecanicoNome: 'Carlos Eduardo',
        problema: 'Trava do tambor de regulagem folgada, necessita aferição e calibração',
        urgencia: 'alta',
        status: 'Em Manutenção Externa',
      },
      {
        id: 'ferr-2',
        dataRegistro: '17/08/2026 15:40',
        ferramenta: 'Pistola Pneumática 1/2 Pol Chicago',
        box: 'Box 02',
        mecanicoNome: 'Gabriel Amaral',
        problema: 'Escape de ar no gatilho e torque reduzido na reversão',
        urgencia: 'media',
        status: 'Aguardando Kit de Reparo',
      },
    ]
  })

  // Requisições de Peças ao Almoxarifado
  const [requisicoesPecas, setRequisicoesPecas] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_REQUISICOES_PECAS)
      if (salvo) return JSON.parse(salvo)
    } catch {}
    return [
      {
        id: 'req-1',
        dataHora: '19/08/2026 13:45',
        numeroOS: '002908',
        veiculo: 'Fiat Doblo 1.8 Cargo (ASF6I46)',
        pecaNome: 'Tubo Suporte Arrefecimento',
        codigoPeca: '0018969',
        quantidade: 1,
        urgencia: 'urgente',
        mecanicoNome: 'Carlos Eduardo',
        status: 'Separado no Balcão',
      },
    ]
  })

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

  // Pedir peça para a OS (Requisitar ao almoxarifado)
  const pedirPecaParaOS = ({ numeroOS, veiculo, pecaNome, codigoPeca, quantidade = 1, urgencia = 'normal' }) => {
    const novaReq = {
      id: `req-${Date.now()}`,
      dataHora: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      numeroOS,
      veiculo,
      pecaNome,
      codigoPeca,
      quantidade,
      urgencia,
      mecanicoNome: mecanicoAtivo.nome,
      status: 'Aguardando Separação',
    }
    setRequisicoesPecas((prev) => {
      const updated = [novaReq, ...prev]
      try {
        localStorage.setItem(STORAGE_KEY_REQUISICOES_PECAS, JSON.stringify(updated))
      } catch {}
      return updated
    })
    toast.success(`Requisição da peça "${pecaNome}" enviada ao Almoxarifado para a OS #${numeroOS}!`)
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
