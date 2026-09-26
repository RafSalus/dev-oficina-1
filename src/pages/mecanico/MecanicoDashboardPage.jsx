import { useState, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useMecanico } from '../../context/MecanicoContext'
import {
  obterOrdensAbertas,
  atualizarStatusOrdem,
  salvarOrdemAberta,
  assumirOrdemSemMecanico,
} from '../dashboard/orcamento/mockOrdensAbertas'
import { CATALOGO_PECAS_ESTOQUE } from '../../constants/catalogoPecasEstoque'
import { MobileMecanicoHomeScreen } from '../../components/mecanico/mobile/MobileMecanicoHomeScreen'
import { MobileMecanicoOrdensPage } from '../../components/mecanico/mobile/MobileMecanicoOrdensPage'
import { MobileMecanicoComingSoon } from '../../components/mecanico/mobile/MobileMecanicoComingSoon'
import { toast } from 'sonner'
import { MecanicoHeaderMetricas } from './components/MecanicoHeaderMetricas'
import { MecanicoTabBar } from './components/MecanicoTabBar'
import { MecanicoVisaoGeral } from './components/MecanicoVisaoGeral'
import { MecanicoOSFila } from './components/MecanicoOSFila'
import { MecanicoComissoes } from './components/MecanicoComissoes'
import { MecanicoDiagnosticoView } from './components/MecanicoDiagnosticoView'
import { MecanicoChecklistEntrada } from './components/MecanicoChecklistEntrada'
import { MecanicoPedirPecas } from './components/MecanicoPedirPecas'
import { MecanicoEstoque } from './components/MecanicoEstoque'
import { MecanicoServicos } from './components/MecanicoServicos'
import { MecanicoPecasDanificadas } from './components/MecanicoPecasDanificadas'
import { MecanicoFerramentas } from './components/MecanicoFerramentas'
import { MecanicoAgenda } from './components/MecanicoAgenda'
import { MecanicoLevaETraz } from './components/MecanicoLevaETraz'
import { MecanicoClientes } from './components/MecanicoClientes'
import { MecanicoModalPecaDanificada, FORM_PECA_DANIFICADA_INICIAL } from './components/MecanicoModalPecaDanificada'
import { MecanicoModalFerramenta, FORM_FERRAMENTA_INICIAL } from './components/MecanicoModalFerramenta'

export function MecanicoDashboardPage() {
  const {
    mecanicoAtivo,
    pecasDanificadas,
    adicionarPecaDanificada,
    ferramentasDanificadas,
    adicionarFerramentaDanificada,
    requisicoesPecas,
    pedirPecaParaOS,
  } = useMecanico()

  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  // Determina a aba ativa baseada na rota da URL
  const activeTabFromUrl = useMemo(() => {
    const path = location.pathname
    if (path.includes('/mecanico/ordens-servico')) return 'ordens-servico'
    if (path.includes('/mecanico/comissoes')) return 'comissoes'
    if (path.includes('/mecanico/diagnostico')) return 'diagnostico'
    if (path.includes('/mecanico/checklist')) return 'checklist'
    if (path.includes('/mecanico/servicos')) return 'servicos'
    if (path.includes('/mecanico/pedir-pecas')) return 'pedir-pecas'
    if (path.includes('/mecanico/estoque')) return 'estoque'
    if (path.includes('/mecanico/pecas-danificadas')) return 'pecas-danificadas'
    if (path.includes('/mecanico/ferramentas')) return 'ferramentas'
    if (path.includes('/mecanico/clientes')) return 'clientes'
    if (path.includes('/mecanico/leva-e-traz')) return 'leva-e-traz'
    if (path.includes('/mecanico/agenda')) return 'agenda'
    return 'dashboard'
  }, [location.pathname])

  const [activeTab, setActiveTab] = useState(activeTabFromUrl)

  useEffect(() => {
    setActiveTab(activeTabFromUrl)
  }, [activeTabFromUrl])

  // Lista de Ordens de Serviço carregadas do sistema
  const [ordens, setOrdens] = useState(() => obterOrdensAbertas())

  // OS atualmente selecionada para trabalho em bancada
  const [osSelecionadaId, setOsSelecionadaId] = useState(() => {
    const abertas = obterOrdensAbertas()
    const minha = abertas.find((o) => o.mecanicoNome === mecanicoAtivo.nome)
    return minha ? minha.numeroOS : (abertas[0]?.numeroOS || null)
  })

  // Recarregar ordens
  const recarregarOrdens = () => {
    const lista = obterOrdensAbertas()
    setOrdens(lista)
  }

  // OS ativa no workspace
  const osAtiva = useMemo(() => {
    return ordens.find((o) => String(o.numeroOS) === String(osSelecionadaId)) || ordens[0]
  }, [ordens, osSelecionadaId])

  // Ordens atribuídas ao mecânico ativo
  const ordensDoMecanico = useMemo(() => {
    return ordens.filter((o) => o.mecanicoNome === mecanicoAtivo.nome)
  }, [ordens, mecanicoAtivo.nome])

  // OS na Fila sem nenhum mecânico atribuído — qualquer mecânico pode "puxar" uma delas para
  // si e assumir o diagnóstico, sem depender da secretária escalar previamente.
  const ordensDisponiveis = useMemo(() => {
    return ordens.filter((o) => o.status === 'fila' && !(o.mecanicoId || (o.mecanicoNome && o.mecanicoNome !== 'Não atribuído')))
  }, [ordens])

  // Assume uma OS sem mecânico para o mecânico ativo
  const handlePuxarOrdem = (numeroOS) => {
    const resultado = assumirOrdemSemMecanico(numeroOS, mecanicoAtivo.value, mecanicoAtivo.nome)
    if (resultado.erro) {
      toast.warning(resultado.erro)
      return
    }
    recarregarOrdens()
    setOsSelecionadaId(numeroOS)
    setActiveTab('dashboard')
    toast.success(`OS #${numeroOS} atribuída a você! Preencha a vistoria e o diagnóstico para avançar.`)
  }

  // Métricas do Mecânico
  const metricasMecanico = useMemo(() => {
    const totalAtribuidas = ordensDoMecanico.length
    const emExecucao = ordensDoMecanico.filter(
      (o) => o.status === 'aprovado_execucao' || o.status === 'em_diagnostico'
    ).length
    const aguardandoPecas = ordensDoMecanico.filter(
      (o) => o.status === 'aguardando_pecas'
    ).length
    const concluidasHoje = ordensDoMecanico.filter(
      (o) => o.status === 'pronto_retirada'
    ).length

    // Cálculo da comissão sobre serviços executados
    const percComissao = (mecanicoAtivo.comissaoPerc || 15) / 100
    let totalMaoObra = 0

    ordensDoMecanico.forEach((o) => {
      const servicos = o.servicosOS || []
      servicos.forEach((s) => {
        const preco = parseFloat(s.precoUnitario || s.valorUnitario) || 0
        const qtd = parseFloat(s.quantidade) || 1
        const desc = parseFloat(s.desconto) || 0
        totalMaoObra += Math.max(0, preco * qtd - desc)
      })
    })

    const comissaoAcumulada = totalMaoObra * percComissao

    return {
      totalAtribuidas,
      emExecucao,
      aguardandoPecas,
      concluidasHoje,
      totalMaoObra,
      comissaoAcumulada,
      percComissao: mecanicoAtivo.comissaoPerc || 15,
    }
  }, [ordensDoMecanico, mecanicoAtivo])

  // Atualizar status de uma OS
  const handleAtualizarStatus = (numeroOS, novoStatus) => {
    atualizarStatusOrdem(numeroOS, novoStatus)
    recarregarOrdens()
    toast.success(`Status da OS #${numeroOS} atualizado com sucesso!`)
  }

  // =========================================================================
  // MODAIS DE PEÇA/FERRAMENTA DANIFICADA — o estado e os modais em si vivem no
  // orquestrador (não nas abas "Peças Danificadas"/"Ferramentas") para que
  // permaneçam abertos mesmo que o mecânico troque de aba antes de concluir o
  // registro, preservando o comportamento original.
  // =========================================================================
  const [modalNovaPecaDanificada, setModalNovaPecaDanificada] = useState(false)
  const [formPecaDanificada, setFormPecaDanificada] = useState(FORM_PECA_DANIFICADA_INICIAL)

  const handleCriarPecaDanificada = (e) => {
    e.preventDefault()
    if (!formPecaDanificada.peca) {
      toast.error('Informe a descrição da peça danificada.')
      return
    }
    adicionarPecaDanificada({
      numeroOS: osAtiva?.numeroOS || 'Geral',
      veiculo: osAtiva ? `${osAtiva.marcaModelo} (${osAtiva.placa})` : 'Oficina',
      ...formPecaDanificada,
    })
    setFormPecaDanificada(FORM_PECA_DANIFICADA_INICIAL)
    setModalNovaPecaDanificada(false)
  }

  const [modalNovaFerramenta, setModalNovaFerramenta] = useState(false)
  const [formFerramenta, setFormFerramenta] = useState(FORM_FERRAMENTA_INICIAL)

  const handleCriarFerramentaDanificada = (e) => {
    e.preventDefault()
    if (!formFerramenta.ferramenta) {
      toast.error('Informe o nome da ferramenta.')
      return
    }
    adicionarFerramentaDanificada({
      ...formFerramenta,
    })
    setFormFerramenta(FORM_FERRAMENTA_INICIAL)
    setModalNovaFerramenta(false)
  }

  // =========================================================================
  // ESTOQUE E PEDIDO DE PEÇAS — estado compartilhado entre as abas "Pedir Peças"
  // e "Consulta Estoque" (ver notas em MecanicoPedirPecas/MecanicoEstoque): o filtro
  // de busca/categoria é o mesmo em ambas, por isso fica no orquestrador.
  // =========================================================================
  const [buscaEstoque, setBuscaEstoque] = useState('')
  const [categoriaEstoque, setCategoriaEstoque] = useState('Todas')
  const [qtdPedir, setQtdPedir] = useState(1)
  const [urgenciaPedir, setUrgenciaPedir] = useState('normal')

  const estoqueFiltrado = useMemo(() => {
    return CATALOGO_PECAS_ESTOQUE.filter((p) => {
      const matchBusca =
        !buscaEstoque ||
        p.nome.toLowerCase().includes(buscaEstoque.toLowerCase()) ||
        p.codigo.toLowerCase().includes(buscaEstoque.toLowerCase())
      const matchCat =
        categoriaEstoque === 'Todas' || p.categoria === categoriaEstoque
      return matchBusca && matchCat
    })
  }, [buscaEstoque, categoriaEstoque])

  const handleRequisitarPeca = async (peca) => {
    if (!osAtiva) {
      toast.error('Selecione uma Ordem de Serviço ativa primeiro.')
      return
    }

    // Só marca a peça na OS se a requisição foi de fato gravada (fail-closed, Story 2.15)
    const requisicao = await pedirPecaParaOS({
      numeroOS: osAtiva.numeroOS,
      veiculo: `${osAtiva.marcaModelo} (${osAtiva.placa})`,
      pecaNome: peca.nome,
      codigoPeca: peca.codigo,
      quantidade: qtdPedir,
      urgencia: urgenciaPedir,
    })
    if (!requisicao) return

    // Adiciona também na lista de peças da OS ativa se não existir
    const novaPecaOS = {
      codigo: peca.codigo,
      nome: peca.nome,
      unidade: 'UN',
      quantidade: qtdPedir,
      precoUnitario: peca.precoUnitario,
      desconto: 0,
      marca: peca.marcaSugerida || 'Original',
      statusRequisicao: 'Requisitada pelo Mecânico',
    }

    const pecasAtuais = osAtiva.pecasOS || []
    const atualizadas = [...pecasAtuais, novaPecaOS]
    salvarOrdemAberta({
      ...osAtiva,
      pecasOS: atualizadas,
    })
    recarregarOrdens()
  }

  // No mobile a experiência é outra (telas dedicadas, sem esta bancada em abas) — mesma
  // decisão de roteamento que já existia em MecanicoModulePlaceholder.jsx: a home vai para
  // MobileMecanicoHomeScreen, as demais rotas ainda caem no "Em breve" mobile.
  if (isMobile) {
    const isHome = location.pathname === '/mecanico/dashboard' || location.pathname === '/mecanico'
    if (isHome) return <MobileMecanicoHomeScreen />
    if (location.pathname === '/mecanico/ordens-servico') return <MobileMecanicoOrdensPage />
    return <MobileMecanicoComingSoon />
  }

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden select-text">
      <MecanicoHeaderMetricas
        metricasMecanico={metricasMecanico}
        requisicoesPecas={requisicoesPecas}
        osAtiva={osAtiva}
        ordensDoMecanico={ordensDoMecanico}
        osSelecionadaId={osSelecionadaId}
        setOsSelecionadaId={setOsSelecionadaId}
        handleAtualizarStatus={handleAtualizarStatus}
      />

      {/* Área de Trabalho Modular Principal (Abas Técnicas) */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-[#d0d5dd] shadow-xs flex flex-col overflow-hidden">
        <MecanicoTabBar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} />

        {/* Conteúdo Dinâmico da Aba Selecionada */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 min-h-0">
          {activeTab === 'dashboard' && (
            <MecanicoVisaoGeral
              osAtiva={osAtiva}
              requisicoesPecas={requisicoesPecas}
              setActiveTab={setActiveTab}
              recarregarOrdens={recarregarOrdens}
              mecanicoNome={mecanicoAtivo.nome}
            />
          )}

          {activeTab === 'ordens-servico' && (
            <MecanicoOSFila
              ordensDisponiveis={ordensDisponiveis}
              ordensDoMecanico={ordensDoMecanico}
              osSelecionadaId={osSelecionadaId}
              mecanicoNome={mecanicoAtivo.nome}
              handlePuxarOrdem={handlePuxarOrdem}
              handleAtualizarStatus={handleAtualizarStatus}
              setOsSelecionadaId={setOsSelecionadaId}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'comissoes' && (
            <MecanicoComissoes metricasMecanico={metricasMecanico} ordensDoMecanico={ordensDoMecanico} />
          )}

          {activeTab === 'diagnostico' && (
            <MecanicoDiagnosticoView osAtiva={osAtiva} recarregarOrdens={recarregarOrdens} />
          )}

          {activeTab === 'checklist' && (
            <MecanicoChecklistEntrada osAtiva={osAtiva} recarregarOrdens={recarregarOrdens} />
          )}

          {activeTab === 'pedir-pecas' && (
            <MecanicoPedirPecas
              osAtiva={osAtiva}
              buscaEstoque={buscaEstoque}
              setBuscaEstoque={setBuscaEstoque}
              qtdPedir={qtdPedir}
              setQtdPedir={setQtdPedir}
              urgenciaPedir={urgenciaPedir}
              setUrgenciaPedir={setUrgenciaPedir}
              estoqueFiltrado={estoqueFiltrado}
              handleRequisitarPeca={handleRequisitarPeca}
            />
          )}

          {activeTab === 'estoque' && (
            <MecanicoEstoque
              categoriaEstoque={categoriaEstoque}
              setCategoriaEstoque={setCategoriaEstoque}
              estoqueFiltrado={estoqueFiltrado}
            />
          )}

          {activeTab === 'servicos' && (
            <MecanicoServicos osAtiva={osAtiva} mecanicoNome={mecanicoAtivo.nome} recarregarOrdens={recarregarOrdens} />
          )}

          {activeTab === 'pecas-danificadas' && (
            <MecanicoPecasDanificadas
              pecasDanificadas={pecasDanificadas}
              onAbrirModal={() => setModalNovaPecaDanificada(true)}
            />
          )}

          {activeTab === 'ferramentas' && (
            <MecanicoFerramentas
              ferramentasDanificadas={ferramentasDanificadas}
              onAbrirModal={() => setModalNovaFerramenta(true)}
            />
          )}

          {activeTab === 'agenda' && (
            <MecanicoAgenda mecanicoNome={mecanicoAtivo.nome} setOsSelecionadaId={setOsSelecionadaId} setActiveTab={setActiveTab} />
          )}

          {activeTab === 'leva-e-traz' && <MecanicoLevaETraz />}

          {activeTab === 'clientes' && <MecanicoClientes />}
        </div>
      </div>

      <MecanicoModalPecaDanificada
        aberto={modalNovaPecaDanificada}
        form={formPecaDanificada}
        setForm={setFormPecaDanificada}
        onFechar={() => setModalNovaPecaDanificada(false)}
        onSubmit={handleCriarPecaDanificada}
      />

      <MecanicoModalFerramenta
        aberto={modalNovaFerramenta}
        form={formFerramenta}
        setForm={setFormFerramenta}
        onFechar={() => setModalNovaFerramenta(false)}
        onSubmit={handleCriarFerramentaDanificada}
      />
    </div>
  )
}
