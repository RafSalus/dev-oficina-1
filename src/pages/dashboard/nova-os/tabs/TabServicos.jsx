import React, { useState, useMemo } from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import {
  Wrench,
  Car,
  Plus,
  Trash,
  PencilSimple,
  X,
  FloppyDisk,
  CheckCircle,
  FileText,
  ArrowsClockwise,
  Clock,
  CurrencyDollar,
  Tag,
  Package,
  ArrowDownRight,
  Sparkle,
  User,
  ChatText,
  WhatsappLogo,
  Copy,
  Check,
  ArrowsOutSimple,
  ArrowsInSimple,
  Printer,
  Camera,
  Eye,
  MagnifyingGlass,
  FunnelSimple,
} from '@phosphor-icons/react'
import { MOCK_MECANICOS } from '../../../../constants/mecanicos'
import {
  CATALOGO_SERVICOS_TABELA,
  SUGESTOES_PECAS,
  SUGESTOES_SERVICOS,
  gerarLaudoTecnico,
} from '../../../../constants/catalogoPecasServicos'
import { toast } from 'sonner'

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '40px',
    height: '40px',
    backgroundColor: state.isDisabled ? '#f2f4f7' : state.isFocused ? '#ffffff' : '#f8fafc',
    borderColor: state.isFocused ? '#101828' : '#d0d5dd',
    borderWidth: '1px',
    borderRadius: '12px',
    boxShadow: state.isFocused ? '0 0 0 1px #101828' : 'none',
    fontSize: '12.5px',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    ':hover': {
      borderColor: state.isFocused ? '#101828' : '#98a2b3',
      backgroundColor: state.isDisabled ? '#f2f4f7' : '#ffffff',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    height: '40px',
    padding: '0 12px',
  }),
  input: (base) => ({
    ...base,
    margin: '0px',
    color: '#101828',
    fontSize: '12.5px',
    fontWeight: '600',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '40px',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '4px 8px',
    color: '#667085',
    ':hover': { color: '#101828' },
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '4px 6px',
    color: '#667085',
    ':hover': { color: '#101828' },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '14px',
    border: '1px solid #d0d5dd',
    boxShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.1), 0 6px 10px -3px rgba(0, 0, 0, 0.04)',
    zIndex: 50,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    padding: '4px',
  }),
  menuList: (base) => ({
    ...base,
    padding: '2px',
    maxHeight: '220px',
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: state.isSelected ? 700 : 500,
    backgroundColor: state.isSelected
      ? '#101828'
      : state.isFocused
      ? '#f2f4f7'
      : 'transparent',
    color: state.isSelected ? '#ffffff' : '#101828',
    cursor: 'pointer',
    padding: '7px 12px',
    transition: 'all 0.1s ease',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#101828',
    fontWeight: 700,
    fontSize: '12.5px',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#98a2b3',
    fontSize: '12.5px',
    fontWeight: 500,
  }),
}

export function TabServicos({ formData, updateFormData, onSaveStep, onCancel }) {
  const {
    cliente = '',
    documento = '',
    telefone = '',
    placa = '',
    marcaModelo = '',
    ano = '',
    cor = '',
    km = '',
    relatoCliente = '',
    mecanicoId = '',
    mecanicoNome = '',
    pecasDiagnostico = [],
    servicosDiagnostico = [],
    laudoTecnico = '',
    servicosOS = [],
  } = formData

  // Modais de apoio
  const [modalDadosAberto, setModalDadosAberto] = useState(false)
  const [modalLaudoAberto, setModalLaudoAberto] = useState(false)
  const [modalServicoAberto, setModalServicoAberto] = useState(false)
  const [modalServicoMaximizada, setModalServicoMaximizada] = useState(false)
  const [modalLaudoMaximizada, setModalLaudoMaximizada] = useState(false)
  const [fotoZoomUrl, setFotoZoomUrl] = useState(null)
  const [copiado, setCopiado] = useState(false)
  const [editandoServicoId, setEditandoServicoId] = useState(null)

  // Filtros e busca na tabela de serviços
  const [termoBusca, setTermoBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')

  // Opções de Categorias de Serviços
  const CATEGORIAS_SERVICOS_OPCOES = [
    { value: 'Mecânica Geral', label: 'Mecânica Geral' },
    { value: 'Freios', label: 'Freios' },
    { value: 'Suspensão', label: 'Suspensão' },
    { value: 'Motor', label: 'Motor' },
    { value: 'Transmissão', label: 'Transmissão' },
    { value: 'Arrefecimento', label: 'Arrefecimento' },
    { value: 'Elétrica', label: 'Elétrica' },
    { value: 'Injeção Eletrônica', label: 'Injeção Eletrônica' },
    { value: 'Geometria e Alinhamento', label: 'Geometria e Alinhamento' },
    { value: 'Ar Condicionado', label: 'Ar Condicionado' },
    { value: 'Revisão Preventiva', label: 'Revisão Preventiva' },
  ]

  // Estado do formulário de serviço
  const FORM_SERVICO_DEFAULT = {
    codigo: '',
    nome: '',
    categoria: 'Mecânica Geral',
    codigoPeca: '',
    nomePeca: '',
    mecanicoId: mecanicoId || '',
    mecanicoNome: mecanicoNome || '',
    tempoEstimado: '1.0',
    valorUnitario: '150.00',
    quantidade: '1',
    desconto: '0.00',
    observacoes: '',
  }

  const [formServico, setFormServico] = useState(FORM_SERVICO_DEFAULT)

  // Opções para vincular Peças (criadas a partir do diagnóstico e catálogo)
  const opcoesPecasVinculo = useMemo(() => {
    const lista = [
      {
        value: 'SEM-PECA',
        label: 'Sem peça vinculada (Mão de obra avulsa)',
        codigoPeca: 'PEC-DIV-00',
        nomePeca: 'Mão de Obra Avulsa',
      },
    ]

    // Peças vindas da aba de Diagnóstico (com prioridade)
    pecasDiagnostico.forEach((p, idx) => {
      lista.push({
        value: p.id || `diag-peca-${idx}`,
        label: `[Do Diagnóstico] ${p.nome} (Qtd: ${p.quantidade || 1})`,
        codigoPeca: `PEC-DG-${String(idx + 1).padStart(2, '0')}`,
        nomePeca: p.nome,
      })
    })

    // Peças do catálogo geral de sugestões
    SUGESTOES_PECAS.forEach((p, idx) => {
      lista.push({
        value: `cat-peca-${idx}`,
        label: `[Catálogo] ${p.label}`,
        codigoPeca: `PEC-CAT-${String(idx + 1).padStart(2, '0')}`,
        nomePeca: p.label,
      })
    })

    return lista
  }, [pecasDiagnostico])

  // Contagem de serviços diagnosticados pendentes de importação
  const servicosDiagnosticoDisponiveis = useMemo(() => {
    return servicosDiagnostico.filter((sd) => {
      const nomeSd = sd.nome?.trim().toLowerCase()
      return !servicosOS.some((so) => so.nome?.trim().toLowerCase() === nomeSd)
    })
  }, [servicosDiagnostico, servicosOS])

  // Métricas financeiras e de tempo dos serviços adicionados
  const metricas = useMemo(() => {
    let totalHoras = 0
    let subtotalBruto = 0
    let totalDescontos = 0

    servicosOS.forEach((item) => {
      const horas = parseFloat(item.tempoEstimado) || 0
      const valorUnit = parseFloat(item.valorUnitario) || 0
      const qtd = parseFloat(item.quantidade) || 1
      const desc = parseFloat(item.desconto) || 0

      totalHoras += horas * qtd
      subtotalBruto += valorUnit * qtd
      totalDescontos += desc
    })

    const totalLiquido = Math.max(0, subtotalBruto - totalDescontos)

    return {
      quantidadeServicos: servicosOS.length,
      totalHoras: totalHoras.toFixed(1),
      subtotalBruto: subtotalBruto.toFixed(2),
      totalDescontos: totalDescontos.toFixed(2),
      totalLiquido: totalLiquido.toFixed(2),
    }
  }, [servicosOS])

  // Serviços filtrados pela barra de busca e categoria selecionada
  const servicosFiltrados = useMemo(() => {
    const termo = termoBusca.trim().toLowerCase()
    return servicosOS.filter((item) => {
      const matchBusca =
        !termo ||
        (item.nome && item.nome.toLowerCase().includes(termo)) ||
        (item.codigo && item.codigo.toLowerCase().includes(termo)) ||
        (item.codigoPeca && item.codigoPeca.toLowerCase().includes(termo)) ||
        (item.nomePeca && item.nomePeca.toLowerCase().includes(termo)) ||
        (item.mecanicoNome && item.mecanicoNome.toLowerCase().includes(termo)) ||
        (item.observacoes && item.observacoes.toLowerCase().includes(termo))

      const matchCategoria =
        filtroCategoria === 'todas' || item.categoria === filtroCategoria

      return matchBusca && matchCategoria
    })
  }, [servicosOS, termoBusca, filtroCategoria])

  // Handler para importar serviços da tela de diagnóstico
  const handlePuxarDoDiagnostico = () => {
    if (!servicosDiagnostico.length) {
      toast.warning('Não há serviços registrados na aba de diagnóstico para importar.')
      return
    }

    const novosItens = servicosDiagnostico.map((itemDiag, idx) => {
      const indexTotal = servicosOS.length + idx + 1
      const codigoGerado = `SRV-${String(indexTotal).padStart(3, '0')}`

      // Tenta encontrar parâmetros no catálogo padrão
      const itemCatalogo = CATALOGO_SERVICOS_TABELA.find(
        (c) => c.nome.toLowerCase() === itemDiag.nome.toLowerCase()
      )

      // Tenta vincular à peça correspondente do diagnóstico
      const pecaCorrespondente = pecasDiagnostico[idx] || pecasDiagnostico[0]
      const codigoPeca = itemCatalogo?.codigoPeca || (pecaCorrespondente ? `PEC-DG-01` : 'PEC-DIV-00')
      const nomePeca = itemCatalogo?.nomePeca || pecaCorrespondente?.nome || 'Mão de Obra Geral'

      return {
        id: `srv-imp-${Date.now()}-${idx}`,
        codigo: codigoGerado,
        nome: itemDiag.nome,
        categoria: itemCatalogo?.categoria || 'Mecânica Geral',
        codigoPeca,
        nomePeca,
        mecanicoId: mecanicoId || '',
        mecanicoNome: mecanicoNome || 'A definir',
        tempoEstimado: itemCatalogo?.tempoEstimado || '1.0',
        valorUnitario: itemCatalogo?.precoPadrao ? itemCatalogo.precoPadrao.toFixed(2) : '150.00',
        quantidade: '1',
        desconto: '0.00',
        observacoes: itemDiag.observacao || 'Serviço sugerido na triagem e diagnóstico',
        origem: 'diagnostico',
      }
    })

    // Adiciona apenas os que ainda não foram importados
    const novosFiltrados = novosItens.filter(
      (n) => !servicosOS.some((existente) => existente.nome.toLowerCase() === n.nome.toLowerCase())
    )

    if (novosFiltrados.length === 0) {
      toast.info('Todos os serviços da tela de diagnóstico já foram importados para a tabela.')
      return
    }

    const listaAtualizada = [...servicosOS, ...novosFiltrados]
    updateFormData({ servicosOS: listaAtualizada })
    toast.success(`${novosFiltrados.length} serviço(s) importado(s) do diagnóstico técnico!`)
  }

  // Cálculo do subtotal da linha do serviço no modal em tempo real
  const subtotalLinhaAtual = useMemo(() => {
    const v = parseFloat(formServico.valorUnitario) || 0
    const q = parseFloat(formServico.quantidade) || 1
    const d = parseFloat(formServico.desconto) || 0
    return Math.max(0, v * q - d).toFixed(2)
  }, [formServico.valorUnitario, formServico.quantidade, formServico.desconto])

  // Handler de copiar texto do laudo
  const handleCopiarLaudo = () => {
    if (!laudoTecnico) return
    navigator.clipboard.writeText(laudoTecnico)
    setCopiado(true)
    toast.success('Texto do laudo técnico copiado para a área de transferência!')
    setTimeout(() => setCopiado(false), 2000)
  }

  // Handler de gerar/regenerar laudo a partir dos dados do cliente, veículo e diagnóstico
  const handleGerarLaudo = () => {
    const textoGerado = gerarLaudoTecnico({
      cliente,
      documento,
      placa,
      marcaModelo,
      ano,
      km,
      relatoCliente,
      mecanicoNome,
      pecas: pecasDiagnostico,
      servicos: servicosDiagnostico,
    })
    updateFormData({ laudoTecnico: textoGerado })
    toast.success('Laudo técnico atualizado com base nos dados atuais!')
  }

  // Handler de abrir modal para novo serviço manual
  const handleAbrirNovoServico = () => {
    setEditandoServicoId(null)
    setModalServicoMaximizada(false)
    const proximoNumero = servicosOS.length + 1
    setFormServico({
      ...FORM_SERVICO_DEFAULT,
      codigo: `SRV-${String(proximoNumero).padStart(3, '0')}`,
      mecanicoId: mecanicoId || '',
      mecanicoNome: mecanicoNome || '',
    })
    setModalServicoAberto(true)
  }

  // Handler de abrir modal para editar serviço
  const handleAbrirEdicaoServico = (servico) => {
    setEditandoServicoId(servico.id)
    setModalServicoMaximizada(false)
    setFormServico({
      codigo: servico.codigo || '',
      nome: servico.nome || '',
      categoria: servico.categoria || 'Mecânica Geral',
      codigoPeca: servico.codigoPeca || '',
      nomePeca: servico.nomePeca || '',
      mecanicoId: servico.mecanicoId || '',
      mecanicoNome: servico.mecanicoNome || '',
      tempoEstimado: servico.tempoEstimado || '1.0',
      valorUnitario: servico.valorUnitario || '150.00',
      quantidade: servico.quantidade || '1',
      desconto: servico.desconto || '0.00',
      observacoes: servico.observacoes || '',
    })
    setModalServicoAberto(true)
  }

  // Handler de salvar serviço (novo ou edição)
  const handleSalvarServico = (e) => {
    e?.preventDefault()
    if (!formServico.nome.trim()) return

    const itemSalvo = {
      id: editandoServicoId || `srv-${Date.now()}`,
      codigo: formServico.codigo.trim() || `SRV-${String(servicosOS.length + 1).padStart(3, '0')}`,
      nome: formServico.nome.trim(),
      categoria: formServico.categoria || 'Mecânica Geral',
      codigoPeca: formServico.codigoPeca.trim() || 'PEC-DIV-00',
      nomePeca: formServico.nomePeca.trim() || 'Mão de Obra Avulsa',
      mecanicoId: formServico.mecanicoId || '',
      mecanicoNome: formServico.mecanicoNome || 'A definir',
      tempoEstimado: formServico.tempoEstimado || '1.0',
      valorUnitario: parseFloat(formServico.valorUnitario || 0).toFixed(2),
      quantidade: formServico.quantidade || '1',
      desconto: parseFloat(formServico.desconto || 0).toFixed(2),
      observacoes: formServico.observacoes.trim(),
    }

    let listaAtualizada = []
    if (editandoServicoId) {
      listaAtualizada = servicosOS.map((s) => (s.id === editandoServicoId ? itemSalvo : s))
    } else {
      listaAtualizada = [...servicosOS, itemSalvo]
    }

    updateFormData({ servicosOS: listaAtualizada })
    toast.success(editandoServicoId ? 'Serviço atualizado com sucesso!' : 'Serviço adicionado à Ordem de Serviço!')
    setModalServicoAberto(false)
  }

  // Handler de remover serviço da tabela
  const handleRemoverServico = (id) => {
    const atualizada = servicosOS.filter((s) => s.id !== id)
    updateFormData({ servicosOS: atualizada })
    toast.info('Serviço removido da Ordem de Serviço.')
  }

  // Handler de alteração rápida inline do valor unitário
  const handleUpdateInline = (id, campo, valor) => {
    const atualizada = servicosOS.map((s) => {
      if (s.id === id) {
        return { ...s, [campo]: valor }
      }
      return s
    })
    updateFormData({ servicosOS: atualizada })
  }

  return (
    <div className="h-full w-full flex flex-col justify-between gap-2.5 overflow-hidden">
      {/* Barra Superior: Acesso ao Contexto, Importação do Diagnóstico e Adicionar Serviço */}
      <div className="h-12 shrink-0 bg-white px-3 sm:px-4 rounded-2xl border border-[#d0d5dd] shadow-sm flex items-center justify-between gap-2">
        {/* Lado Esquerdo: Identificação e Botões de Apoio */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Wrench size={16} weight="bold" />
          </div>

          <span className="text-xs font-bold text-[#101828] hidden xl:inline shrink-0">
            Serviços e Mão de Obra
          </span>

          {/* Botão de Dados do Veículo e Queixa */}
          <button
            type="button"
            onClick={() => setModalDadosAberto(true)}
            className="h-8 px-2.5 sm:px-3 rounded-xl bg-[#f8fafc] hover:bg-[#f2f4f7] active:bg-[#eaecf0] border border-[#d0d5dd] text-[#101828] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            title="Visualizar dados do cliente e queixa"
          >
            <Car size={15} weight="bold" className="text-[#344054]" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">
              {placa ? `${placa} • ${marcaModelo || 'Veículo'}` : 'Dados do Veículo'}
            </span>
          </button>

          {/* Botão de Ver Laudo Técnico do Diagnóstico */}
          <button
            type="button"
            onClick={() => setModalLaudoAberto(true)}
            className="h-8 px-2.5 sm:px-3 rounded-xl bg-[#f8fafc] hover:bg-[#f2f4f7] active:bg-[#eaecf0] border border-[#d0d5dd] text-[#101828] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            title="Visualizar ou editar o laudo técnico do diagnóstico"
          >
            <Sparkle size={15} weight="fill" className={laudoTecnico ? 'text-amber-500' : 'text-[#667085]'} />
            <span className="hidden sm:inline">Ver Laudo do Diagnóstico</span>
            {laudoTecnico && (
              <span className="w-2 h-2 rounded-full bg-[#027a48]" title="Laudo gerado" />
            )}
          </button>
        </div>

        {/* Lado Direito: Ações de Importação do Diagnóstico e Novo Serviço */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Botão: Puxar do Diagnóstico */}
          <button
            type="button"
            onClick={handlePuxarDoDiagnostico}
            className={`h-8.5 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
              servicosDiagnosticoDisponiveis.length > 0
                ? 'bg-[#ecfdf3] text-[#027a48] border-[#a6f4c5] hover:bg-[#d1fadf]'
                : 'bg-[#f8fafc] text-[#344054] border-[#d0d5dd] hover:bg-[#f2f4f7]'
            }`}
            title="Importar serviços apontados na aba de diagnóstico técnico"
          >
            <ArrowDownRight size={15} weight="bold" />
            <span>Puxar do Diagnóstico</span>
            {servicosDiagnosticoDisponiveis.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#027a48] text-white">
                {servicosDiagnosticoDisponiveis.length}
              </span>
            )}
          </button>

          {/* Botão: Adicionar Novo Serviço */}
          <button
            type="button"
            onClick={handleAbrirNovoServico}
            className="h-8.5 px-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
          >
            <Plus size={14} weight="bold" />
            <span>Adicionar Serviço</span>
          </button>
        </div>
      </div>

      {/* Faixa de Métricas Rápidas e Resumo Financeiro da Mão de Obra */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 shrink-0">
        <div className="p-2.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#f2f4f7] text-[#101828] flex items-center justify-center font-bold text-xs shrink-0">
            <Wrench size={16} weight="bold" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-[#667085] block leading-none">
              Serviços na OS
            </span>
            <span className="text-sm font-extrabold text-[#101828] mt-0.5 block truncate">
              {metricas.quantidadeServicos} {metricas.quantidadeServicos === 1 ? 'item' : 'itens'}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#f0f9ff] text-[#026aa2] flex items-center justify-center font-bold text-xs shrink-0">
            <Clock size={16} weight="bold" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-[#667085] block leading-none">
              Horas Estimadas
            </span>
            <span className="text-sm font-extrabold text-[#026aa2] mt-0.5 block truncate">
              {metricas.totalHoras} h
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#f8fafc] text-[#344054] flex items-center justify-center font-bold text-xs shrink-0">
            <CurrencyDollar size={16} weight="bold" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-[#667085] block leading-none">
              Subtotal Bruto
            </span>
            <span className="text-sm font-extrabold text-[#344054] mt-0.5 block truncate">
              R$ {metricas.subtotalBruto}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#fef3f2] text-[#b42318] flex items-center justify-center font-bold text-xs shrink-0">
            <Tag size={16} weight="bold" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-[#667085] block leading-none">
              Descontos
            </span>
            <span className="text-sm font-extrabold text-[#b42318] mt-0.5 block truncate">
              R$ {metricas.totalDescontos}
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-2xl bg-[#101828] text-white shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0284c7]/20 text-[#38bdf8] flex items-center justify-center font-bold text-xs shrink-0">
            <CurrencyDollar size={16} weight="bold" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-white/70 block leading-none">
              Total Mão de Obra
            </span>
            <span className="text-sm font-extrabold text-[#38bdf8] mt-0.5 block truncate">
              R$ {metricas.totalLiquido}
            </span>
          </div>
        </div>
      </div>

      {/* Área Central: Tabela Completa e Responsiva de Serviços da OS */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-[#d0d5dd] shadow-sm flex flex-col overflow-hidden">
        {/* Barra de Ferramentas Superior da Tabela: Título, Contadores e Busca Responsiva */}
        <div className="px-4 py-2.5 border-b border-[#d0d5dd] bg-[#fcfcfd] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#101828] text-white flex items-center justify-center shrink-0">
              <Wrench size={14} weight="bold" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-[#101828] whitespace-nowrap">
                Serviços e Mão de Obra
              </h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#f2f4f7] text-[#344054] border border-[#e4e7ec] whitespace-nowrap">
                {servicosOS.length} {servicosOS.length === 1 ? 'item' : 'itens'}
              </span>
              {termoBusca && (
                <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-[#eff8ff] text-[#175cd3] border border-[#b2ddff] whitespace-nowrap">
                  Filtrados: {servicosFiltrados.length}
                </span>
              )}
            </div>
          </div>

          {/* Campo de Busca Rápida e Filtro por Categoria */}
          <div className="flex items-center gap-2 flex-1 max-w-lg justify-end">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Buscar por serviço, código ou peça..."
                className="w-full h-8.5 pl-8 pr-7 rounded-xl bg-white border border-[#d0d5dd] text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none focus:border-[#101828] shadow-2xs transition-all"
              />
              <MagnifyingGlass
                size={14}
                weight="bold"
                className="absolute left-2.5 top-2.5 text-[#667085]"
              />
              {termoBusca && (
                <button
                  type="button"
                  onClick={() => setTermoBusca('')}
                  className="absolute right-2 top-2 p-0.5 rounded text-[#98a2b3] hover:text-[#101828] cursor-pointer"
                  title="Limpar busca"
                >
                  <X size={12} weight="bold" />
                </button>
              )}
            </div>

            {/* Filtro Rápido por Categoria */}
            <div className="w-40 hidden md:block">
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full h-8.5 px-2.5 rounded-xl bg-white border border-[#d0d5dd] text-xs font-medium text-[#101828] focus:outline-none focus:border-[#101828] cursor-pointer shadow-2xs"
              >
                <option value="todas">Todas as Categorias</option>
                {CATEGORIAS_SERVICOS_OPCOES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Container com Scroll Responsivo Horizontal e Vertical */}
        <div className="flex-1 overflow-auto min-h-0 relative select-text">
          <table className="w-full min-w-[980px] text-left border-collapse">
            {/* Cabeçalho da Tabela com Tipografia Ampliada (9 Colunas) */}
            <thead className="sticky top-0 z-10 bg-[#f8fafc] border-b-2 border-[#d0d5dd] text-[#344054] uppercase font-black text-[11px] tracking-wider shadow-2xs">
              <tr>
                <th className="py-3 px-3.5 w-28 text-center whitespace-nowrap">Código</th>
                <th className="py-3 px-4 min-w-[300px] whitespace-nowrap">Descrição do Serviço</th>
                <th className="py-3 px-3.5 w-44 whitespace-nowrap">Mecânico Executor</th>
                <th className="py-3 px-3 text-center w-28 whitespace-nowrap">Tempo Est.</th>
                <th className="py-3 px-3.5 text-right w-32 whitespace-nowrap">Valor Unit.</th>
                <th className="py-3 px-2 text-center w-20 whitespace-nowrap">Qtd</th>
                <th className="py-3 px-3 text-right w-28 whitespace-nowrap">Desconto</th>
                <th className="py-3 px-4 text-right w-36 whitespace-nowrap">Subtotal Líquido</th>
                <th className="py-3 px-3 text-center w-28 whitespace-nowrap">Ações</th>
              </tr>
            </thead>

            {/* Corpo da Tabela com Linhas Maiores e Confortáveis */}
            <tbody className="divide-y divide-[#e4e7ec]">
              {servicosOS.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto p-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#f8fafc] border border-[#d0d5dd] flex items-center justify-center text-[#667085] shadow-xs">
                        <Wrench size={28} weight="bold" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#101828]">
                          Nenhum serviço adicionado a esta OS
                        </h4>
                        <p className="text-xs text-[#667085] leading-relaxed mt-1">
                          Importe os procedimentos sugeridos no diagnóstico ou adicione manualmente os serviços de mão de obra.
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 mt-1">
                        {servicosDiagnostico.length > 0 && (
                          <button
                            type="button"
                            onClick={handlePuxarDoDiagnostico}
                            className="px-3.5 py-2 rounded-xl bg-[#ecfdf3] hover:bg-[#d1fadf] border border-[#a6f4c5] text-[#027a48] text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            Puxar {servicosDiagnostico.length} do Diagnóstico
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleAbrirNovoServico}
                          className="px-3.5 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          + Adicionar Serviço
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : servicosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <p className="text-xs font-bold text-[#101828]">
                        Nenhum serviço corresponde à pesquisa
                      </p>
                      <p className="text-[11px] text-[#667085]">
                        Tente ajustar o termo digitado ou a categoria selecionada.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setTermoBusca('')
                          setFiltroCategoria('todas')
                        }}
                        className="mt-2 px-3 py-1.5 rounded-xl border border-[#d0d5dd] bg-white text-xs font-semibold text-[#344054] hover:bg-[#f8fafc] cursor-pointer"
                      >
                        Limpar Filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                servicosFiltrados.map((item, index) => {
                  const valorUnit = parseFloat(item.valorUnitario) || 0
                  const qtd = parseFloat(item.quantidade) || 1
                  const desc = parseFloat(item.desconto) || 0
                  const totalLinha = Math.max(0, valorUnit * qtd - desc)

                  return (
                    <tr
                      key={item.id || index}
                      className="hover:bg-[#f8fafc] transition-colors group"
                    >
                      {/* Código do Serviço - Sem quebra de linha */}
                      <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-[#f2f4f7] text-[#101828] border border-[#d0d5dd] shadow-2xs inline-block whitespace-nowrap">
                          {item.codigo || `SRV-${String(index + 1).padStart(3, '0')}`}
                        </span>
                      </td>

                      {/* Descrição do Serviço */}
                      <td className="py-3.5 px-4">
                        <div className="min-w-0 flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-[#101828] leading-tight">
                              {item.nome}
                            </span>
                            {item.categoria && (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#f2f4f7] text-[#475467] border border-[#e4e7ec] shrink-0 whitespace-nowrap">
                                {item.categoria}
                              </span>
                            )}
                          </div>
                          {item.observacoes && (
                            <span className="text-xs text-[#667085] leading-snug line-clamp-1">
                              {item.observacoes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Mecânico Executor */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-[#f2f4f7] border border-[#d0d5dd] flex items-center justify-center text-[#667085] shrink-0">
                            <User size={11} weight="bold" />
                          </div>
                          <span className="text-xs font-bold text-[#101828] truncate block whitespace-nowrap">
                            {item.mecanicoNome || 'A definir'}
                          </span>
                        </div>
                      </td>

                      {/* Tempo Estimado */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-[#f0f9ff] text-[#026aa2] border border-[#b9e6fe] whitespace-nowrap">
                          <Clock size={12} weight="bold" />
                          {item.tempoEstimado || '1.0'} h
                        </span>
                      </td>

                      {/* Valor Unitário */}
                      <td className="py-3.5 px-3.5 text-right font-mono font-bold text-sm text-[#101828] whitespace-nowrap">
                        R$ {valorUnit.toFixed(2)}
                      </td>

                      {/* Quantidade */}
                      <td className="py-3.5 px-2 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-[#f8fafc] border border-[#d0d5dd] text-[#101828] inline-block whitespace-nowrap">
                          {qtd}
                        </span>
                      </td>

                      {/* Desconto */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-xs whitespace-nowrap">
                        {desc > 0 ? (
                          <span className="text-[#b42318] whitespace-nowrap">- R$ {desc.toFixed(2)}</span>
                        ) : (
                          <span className="text-[#98a2b3] whitespace-nowrap">R$ 0,00</span>
                        )}
                      </td>

                      {/* Subtotal Líquido */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-sm sm:text-base text-[#101828] whitespace-nowrap">
                        R$ {totalLinha.toFixed(2)}
                      </td>

                      {/* Ações: Botões Ampliados e Mais Confortáveis */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAbrirEdicaoServico(item)}
                            className="w-8 h-8 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#101828] hover:text-white text-[#344054] transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
                            title="Editar este serviço"
                          >
                            <PencilSimple size={15} weight="bold" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoverServico(item.id)}
                            className="w-8 h-8 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#fef3f2] text-[#667085] hover:text-[#b42318] hover:border-[#fecdca] transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
                            title="Remover serviço"
                          >
                            <Trash size={15} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>

            {/* Rodapé Totalizador Fixo na Tabela */}
            {servicosOS.length > 0 && (
              <tfoot className="sticky bottom-0 z-10 bg-[#f8fafc] border-t-2 border-[#d0d5dd] text-xs shadow-xs font-bold">
                <tr>
                  <td
                    colSpan={3}
                    className="py-3.5 px-4 text-right font-extrabold uppercase text-[#475467] tracking-wider text-[11px]"
                  >
                    Totais da Mão de Obra ({servicosFiltrados.length} {servicosFiltrados.length === 1 ? 'item' : 'itens'}):
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-[#f0f9ff] text-[#026aa2] border border-[#b9e6fe]">
                      {metricas.totalHoras} h
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-mono font-bold text-xs text-[#344054]">
                    R$ {metricas.subtotalBruto}
                  </td>
                  <td className="py-3.5 px-2 text-center font-mono font-bold text-xs text-[#667085]">
                    —
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-xs text-[#b42318]">
                    {parseFloat(metricas.totalDescontos) > 0
                      ? `- R$ ${metricas.totalDescontos}`
                      : 'R$ 0,00'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-sm sm:text-base text-[#0284c7] bg-[#e0f2fe]/60 border-l border-r border-[#bae6fd]">
                    R$ {metricas.totalLiquido}
                  </td>
                  <td className="py-3.5 px-3"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Barra Inferior Fixa de Navegação da Etapa */}
      <div className="h-11 shrink-0 bg-white px-5 rounded-2xl border border-[#d0d5dd] shadow-sm flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#fef3f2] text-[#475467] hover:text-[#b42318] hover:border-[#fecdca] text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <X size={14} weight="bold" />
          <span>Cancelar</span>
        </button>

        <span className="text-xs font-medium text-[#667085]">
          Aba 4 de 8 • <strong className="text-[#101828] font-bold">Serviços e Mão de Obra</strong>
        </span>

        <button
          type="button"
          onClick={onSaveStep}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <FloppyDisk size={15} weight="bold" />
          <span>Salvar e Continuar</span>
        </button>
      </div>

      {/* MODAL 1: Adicionar ou Editar Serviço da OS (Maior e com Opção de Expandir) */}
      {modalServicoAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleSalvarServico}
            className={`bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
              modalServicoMaximizada
                ? 'w-[99vw] h-[98vh] max-w-none'
                : 'w-full max-w-4xl max-h-[92vh]'
            }`}
          >
            {/* Header do Modal com Botão de Maximizar / Restaurar */}
            <div className="px-5 py-3.5 border-b border-[#f2f4f7] flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <Wrench size={18} weight="bold" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-[#101828]">
                      {editandoServicoId ? 'Editar Serviço da OS' : 'Adicionar Serviço à Ordem de Serviço'}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f2f4f7] text-[#344054] border border-[#e4e7ec] shrink-0 font-mono">
                      {formServico.codigo || 'SRV-000'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#667085] truncate mt-0.5">
                    Defina descrição, vínculo com peça, alocação do mecânico, tempo estimado e precificação
                  </p>
                </div>
              </div>

              {/* Ações do Header */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalServicoMaximizada(!modalServicoMaximizada)}
                  className="h-8.5 w-8.5 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-[#101828] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  title={modalServicoMaximizada ? 'Restaurar tamanho' : 'Maximizar formulário em tela cheia'}
                >
                  {modalServicoMaximizada ? (
                    <ArrowsInSimple size={16} weight="bold" />
                  ) : (
                    <ArrowsOutSimple size={16} weight="bold" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setModalServicoAberto(false)}
                  className="h-8.5 w-8.5 rounded-xl text-[#667085] hover:text-[#101828] hover:bg-[#f2f4f7] flex items-center justify-center transition-colors cursor-pointer"
                  title="Fechar formulário"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
            </div>

            {/* Corpo do Formulário: Estruturado, Espaçoso e Confortável */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-xs min-h-0 bg-[#fcfcfd]">
              {/* Bloco 1: Identificação e Classificação do Serviço */}
              <div className="p-4 rounded-2xl bg-white border border-[#d0d5dd] shadow-xs flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[#f2f4f7]">
                  <Tag size={15} weight="bold" className="text-[#101828]" />
                  <span className="font-bold text-[#101828] uppercase text-[11px] tracking-wide">
                    Identificação e Classificação do Serviço
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Código do Serviço */}
                  <div className="sm:col-span-3">
                    <label className="block font-bold text-[#344054] mb-1">
                      Código do Serviço <span className="text-[#b42318]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formServico.codigo}
                      onChange={(e) => setFormServico((prev) => ({ ...prev, codigo: e.target.value }))}
                      placeholder="SRV-001"
                      className="w-full h-10 rounded-xl bg-[#f8fafc] focus:bg-white border border-[#d0d5dd] px-3 font-mono font-bold text-[#101828] focus:outline-none focus:border-[#101828] shadow-2xs"
                    />
                  </div>

                  {/* Categoria do Sistema */}
                  <div className="sm:col-span-4">
                    <label className="block font-bold text-[#344054] mb-1">Categoria do Sistema</label>
                    <Select
                      value={
                        CATEGORIAS_SERVICOS_OPCOES.find((c) => c.value === formServico.categoria) || {
                          value: formServico.categoria,
                          label: formServico.categoria,
                        }
                      }
                      onChange={(opt) =>
                        setFormServico((prev) => ({ ...prev, categoria: opt?.value || 'Mecânica Geral' }))
                      }
                      options={CATEGORIAS_SERVICOS_OPCOES}
                      styles={customSelectStyles}
                    />
                  </div>

                  {/* Descrição do Serviço com CreatableSelect */}
                  <div className="sm:col-span-5">
                    <label className="block font-bold text-[#344054] mb-1">
                      Descrição do Serviço <span className="text-[#b42318]">*</span>
                    </label>
                    <CreatableSelect
                      value={
                        formServico.nome
                          ? { value: formServico.nome, label: formServico.nome }
                          : null
                      }
                      onChange={(opt) => {
                        if (!opt) {
                          setFormServico((prev) => ({ ...prev, nome: '' }))
                          return
                        }
                        const itemCat = CATALOGO_SERVICOS_TABELA.find(
                          (c) => c.nome.toLowerCase() === opt.value.toLowerCase()
                        )
                        setFormServico((prev) => ({
                          ...prev,
                          nome: opt.value,
                          categoria: itemCat?.categoria || prev.categoria,
                          codigoPeca: itemCat?.codigoPeca || prev.codigoPeca,
                          nomePeca: itemCat?.nomePeca || prev.nomePeca,
                          tempoEstimado: itemCat?.tempoEstimado || prev.tempoEstimado,
                          valorUnitario: itemCat?.precoPadrao ? itemCat.precoPadrao.toFixed(2) : prev.valorUnitario,
                        }))
                      }}
                      options={CATALOGO_SERVICOS_TABELA.map((c) => ({
                        value: c.nome,
                        label: `${c.codigo} • ${c.nome} (R$ ${c.precoPadrao.toFixed(2)})`,
                      }))}
                      isClearable
                      placeholder="Pesquise do catálogo ou digite..."
                      styles={customSelectStyles}
                      formatCreateLabel={(input) => `Cadastrar serviço "${input}"`}
                    />
                  </div>
                </div>
              </div>

              {/* Bloco 2: Vínculo Técnico de Peça e Responsabilidade */}
              <div className="p-4 rounded-2xl bg-white border border-[#d0d5dd] shadow-xs flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[#f2f4f7]">
                  <Package size={15} weight="bold" className="text-[#101828]" />
                  <span className="font-bold text-[#101828] uppercase text-[11px] tracking-wide">
                    Vínculo Técnico de Peça e Responsável Técnico
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Peça Vinculada e Código da Peça */}
                  <div>
                    <label className="block font-bold text-[#344054] mb-1">
                      Peça Vinculada / Código do Item
                    </label>
                    <Select
                      value={
                        formServico.codigoPeca
                          ? {
                              value: formServico.codigoPeca,
                              label: `${formServico.codigoPeca} • ${formServico.nomePeca}`,
                            }
                          : null
                      }
                      onChange={(opt) => {
                        setFormServico((prev) => ({
                          ...prev,
                          codigoPeca: opt?.codigoPeca || 'PEC-DIV-00',
                          nomePeca: opt?.nomePeca || 'Sem peça vinculada',
                        }))
                      }}
                      options={opcoesPecasVinculo}
                      isClearable
                      placeholder="Selecione a peça apontada no diagnóstico ou do catálogo..."
                      styles={customSelectStyles}
                    />
                    <span className="text-[10.5px] text-[#667085] mt-1 block">
                      Prioriza peças cadastradas e fotografadas no diagnóstico.
                    </span>
                  </div>

                  {/* Mecânico Executor */}
                  <div>
                    <label className="block font-bold text-[#344054] mb-1">Mecânico Executor</label>
                    <Select
                      value={
                        formServico.mecanicoId
                          ? MOCK_MECANICOS.find((m) => m.value === formServico.mecanicoId)
                          : null
                      }
                      onChange={(opt) =>
                        setFormServico((prev) => ({
                          ...prev,
                          mecanicoId: opt?.value || '',
                          mecanicoNome: opt?.value ? opt.nome : '',
                        }))
                      }
                      options={MOCK_MECANICOS}
                      placeholder="Selecione o mecânico responsável..."
                      styles={customSelectStyles}
                    />
                    <span className="text-[10.5px] text-[#667085] mt-1 block">
                      Profissional encarregado da execução e apontamento de horas.
                    </span>
                  </div>
                </div>
              </div>

              {/* Bloco 3: Precificação, Horas e Cálculo em Tempo Real */}
              <div className="p-4 rounded-2xl bg-white border border-[#d0d5dd] shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#f2f4f7]">
                  <div className="flex items-center gap-2">
                    <CurrencyDollar size={16} weight="bold" className="text-[#101828]" />
                    <span className="font-bold text-[#101828] uppercase text-[11px] tracking-wide">
                      Dimensionamento Operacional e Precificação
                    </span>
                  </div>
                  <span className="text-[10.5px] font-bold text-[#667085]">
                    Cálculo automático: (Valor × Qtd) - Desconto
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Tempo Estimado */}
                  <div>
                    <label className="block font-bold text-[#344054] mb-1">
                      Tempo Estimado (Horas)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={formServico.tempoEstimado}
                        onChange={(e) =>
                          setFormServico((prev) => ({ ...prev, tempoEstimado: e.target.value }))
                        }
                        placeholder="1.5"
                        className="w-full h-10 rounded-xl bg-[#f8fafc] focus:bg-white border border-[#d0d5dd] pl-9 pr-3 font-mono font-bold text-[#101828] focus:outline-none focus:border-[#101828] shadow-2xs"
                      />
                      <Clock size={16} weight="bold" className="absolute left-3 top-3 text-[#667085]" />
                    </div>
                  </div>

                  {/* Valor Unitário */}
                  <div>
                    <label className="block font-bold text-[#344054] mb-1">
                      Valor Unitário (R$) <span className="text-[#b42318]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formServico.valorUnitario}
                        onChange={(e) =>
                          setFormServico((prev) => ({ ...prev, valorUnitario: e.target.value }))
                        }
                        placeholder="150.00"
                        className="w-full h-10 rounded-xl bg-[#f8fafc] focus:bg-white border border-[#d0d5dd] pl-9 pr-3 font-mono font-bold text-[#101828] focus:outline-none focus:border-[#101828] shadow-2xs"
                      />
                      <CurrencyDollar size={16} weight="bold" className="absolute left-3 top-3 text-[#667085]" />
                    </div>
                  </div>

                  {/* Quantidade */}
                  <div>
                    <label className="block font-bold text-[#344054] mb-1">Quantidade</label>
                    <input
                      type="number"
                      min="1"
                      value={formServico.quantidade}
                      onChange={(e) =>
                        setFormServico((prev) => ({ ...prev, quantidade: e.target.value }))
                      }
                      placeholder="1"
                      className="w-full h-10 rounded-xl bg-[#f8fafc] focus:bg-white border border-[#d0d5dd] px-3 font-mono font-bold text-center text-[#101828] focus:outline-none focus:border-[#101828] shadow-2xs"
                    />
                  </div>

                  {/* Desconto */}
                  <div>
                    <label className="block font-bold text-[#344054] mb-1">Desconto (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formServico.desconto}
                      onChange={(e) =>
                        setFormServico((prev) => ({ ...prev, desconto: e.target.value }))
                      }
                      placeholder="0.00"
                      className="w-full h-10 rounded-xl bg-[#f8fafc] focus:bg-white border border-[#d0d5dd] px-3 font-mono font-bold text-right text-[#b42318] focus:outline-none focus:border-[#101828] shadow-2xs"
                    />
                  </div>
                </div>

                {/* Card de Resumo Financeiro da Linha */}
                <div className="p-3 rounded-xl bg-[#101828] text-white flex items-center justify-between gap-3 mt-1 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase font-bold text-white/70">
                      Subtotal Calculado Deste Serviço:
                    </span>
                    <span className="text-[11px] text-white/50 hidden sm:inline">
                      ({formServico.quantidade || 1} un × R$ {parseFloat(formServico.valorUnitario || 0).toFixed(2)}) - R$ {parseFloat(formServico.desconto || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-[#38bdf8] font-mono">
                      R$ {subtotalLinhaAtual}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bloco 4: Observações Técnicas e Instruções de Execução */}
              <div className="p-4 rounded-2xl bg-white border border-[#d0d5dd] shadow-xs flex flex-col gap-2">
                <label className="block font-bold text-[#344054]">
                  Observações Técnicas e Instruções de Execução
                </label>
                <textarea
                  rows={modalServicoMaximizada ? 6 : 3}
                  value={formServico.observacoes}
                  onChange={(e) =>
                    setFormServico((prev) => ({ ...prev, observacoes: e.target.value }))
                  }
                  placeholder="Instruções adicionais de montagem, tipo de fluido, sangria, torques específicos recomendados pela montadora..."
                  className="w-full rounded-xl bg-[#f8fafc] focus:bg-white border border-[#d0d5dd] p-3 font-medium text-[#101828] focus:outline-none focus:border-[#101828] resize-none shadow-2xs leading-relaxed"
                />
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="px-5 py-3.5 border-t border-[#f2f4f7] flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalServicoAberto(false)}
                  className="px-4 py-2 rounded-xl border border-[#d0d5dd] text-xs font-semibold text-[#475467] hover:bg-[#f2f4f7] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <span className="text-xs text-[#667085] hidden md:inline">
                  Subtotal: <strong className="text-[#101828] font-bold">R$ {subtotalLinhaAtual}</strong>
                </span>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                {editandoServicoId ? 'Atualizar Serviço' : 'Adicionar à Tabela'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Dados do Cliente, Veículo e Queixa (Idêntico ao da tela de Diagnóstico) */}
      {modalDadosAberto && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl border border-[#d0d5dd] shadow-2xl flex flex-col overflow-hidden">
            {/* Header do Modal */}
            <div className="px-5 py-3.5 border-b border-[#f2f4f7] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#101828] text-white flex items-center justify-center font-bold text-xs">
                  <Car size={16} weight="bold" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#101828]">
                    Dados do Veículo, Cliente e Queixa
                  </h3>
                  <p className="text-[11px] text-[#667085]">
                    Informações registradas na recepção da oficina
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalDadosAberto(false)}
                className="p-1.5 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#f2f4f7] transition-colors cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3 text-xs min-h-0">
              {/* Placa Mercosul e Veículo */}
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] flex items-center justify-between gap-3">
                <div>
                  <span className="text-[9.5px] uppercase font-bold text-[#667085] block">
                    Modelo e Ano
                  </span>
                  <span className="text-sm font-extrabold text-[#101828] block">
                    {marcaModelo || 'Modelo não informado'}
                  </span>
                  <span className="text-[11px] text-[#475467] block mt-0.5">
                    Ano: {ano || '-'} • Cor: {cor || '-'} • KM: {km ? `${km} km` : 'Não informado'}
                  </span>
                </div>

                {placa && (
                  <div className="flex flex-col items-center bg-white border border-[#101828] rounded-lg px-2.5 py-1 shadow-2xs shrink-0">
                    <span className="text-[7px] font-black uppercase tracking-widest text-[#101828] leading-none">
                      BRASIL
                    </span>
                    <span className="font-mono font-black text-sm text-[#101828] tracking-wider leading-none mt-0.5">
                      {placa}
                    </span>
                  </div>
                )}
              </div>

              {/* Titular e Contato */}
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[9.5px] uppercase font-bold text-[#667085] block">
                    Cliente / Titular
                  </span>
                  <span className="text-xs font-extrabold text-[#101828] block truncate">
                    {cliente || 'Não identificado'}
                  </span>
                  {documento && (
                    <span className="text-[11px] text-[#667085] block mt-0.5">
                      CPF / CNPJ: {documento}
                    </span>
                  )}
                </div>

                {telefone && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-[#475467]">{telefone}</span>
                    <a
                      href={`https://wa.me/55${telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-lg bg-[#25D366] hover:bg-[#1da851] text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="WhatsApp"
                    >
                      <WhatsappLogo size={16} weight="fill" />
                    </a>
                  </div>
                )}
              </div>

              {/* Queixa Inicial do Cliente */}
              <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#d0d5dd]">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#475467] mb-1.5">
                  <ChatText size={14} weight="bold" />
                  <span>Relato da Queixa Informada pelo Cliente:</span>
                </div>
                {relatoCliente ? (
                  <p className="text-xs font-medium text-[#101828] whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-[#e4e7ec]">
                    {relatoCliente}
                  </p>
                ) : (
                  <p className="text-xs text-[#667085] italic">
                    Nenhum relato específico registrado na recepção.
                  </p>
                )}
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="px-5 py-3 border-t border-[#f2f4f7] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setModalDadosAberto(false)}
                className="px-4 py-1.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Laudo Técnico Gerado (Visualização e Edição Ampla, Idêntico ao da tela de Diagnóstico) */}
      {modalLaudoAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
          <div
            className={`bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
              modalLaudoMaximizada
                ? 'w-[99vw] h-[98vh] max-w-none'
                : 'w-full max-w-6xl h-[92vh]'
            }`}
          >
            {/* Header com Ações Rápidas */}
            <div className="px-5 py-3.5 border-b border-[#f2f4f7] flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-black text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <Sparkle size={20} weight="fill" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-[#101828] leading-none">
                      Laudo Técnico de Diagnóstico
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ecfdf3] text-[#027a48] border border-[#a6f4c5] shrink-0">
                      Documento Oficial
                    </span>
                  </div>
                  <p className="text-[11px] text-[#667085] mt-0.5 truncate">
                    Compilação técnica das peças apontadas, evidências fotográficas e serviços a executar
                  </p>
                </div>
              </div>

              {/* Botões do Topo */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCopiarLaudo}
                  className="h-8.5 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-xs font-bold text-[#101828] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Copiar texto completo do laudo para a área de transferência"
                >
                  {copiado ? (
                    <>
                      <Check size={14} weight="bold" className="text-[#027a48]" />
                      <span className="text-[#027a48]">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} weight="bold" />
                      <span className="hidden sm:inline">Copiar Texto</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGerarLaudo}
                  className="h-8.5 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-xs font-bold text-[#101828] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Regenerar laudo a partir das peças e serviços atuais"
                >
                  <ArrowsClockwise size={14} weight="bold" />
                  <span className="hidden sm:inline">Regenerar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalLaudoMaximizada(!modalLaudoMaximizada)}
                  className="h-8.5 w-8.5 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-[#101828] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  title={modalLaudoMaximizada ? 'Restaurar tamanho' : 'Maximizar tela cheia'}
                >
                  {modalLaudoMaximizada ? (
                    <ArrowsInSimple size={16} weight="bold" />
                  ) : (
                    <ArrowsOutSimple size={16} weight="bold" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setModalLaudoAberto(false)}
                  className="h-8.5 w-8.5 rounded-xl text-[#667085] hover:text-[#101828] hover:bg-[#f2f4f7] flex items-center justify-center transition-colors cursor-pointer"
                  title="Fechar visualização"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
            </div>

            {/* Corpo Espaçoso: Divisão em Resumo Lateral e Editor Amplo de Laudo */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-4 sm:p-5 overflow-hidden bg-[#eaecf0]">
              {/* Painel Lateral (4 de 12 colunas): Contexto Técnico, Evidências Fotográficas e Serviços */}
              <div className="lg:col-span-4 h-full flex flex-col gap-3 overflow-y-auto no-scrollbar min-h-0">
                {/* Card 1: Identificação do Veículo e Cliente */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex flex-col gap-2 shrink-0">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f2f4f7]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                      Dados da Ordem de Serviço
                    </span>
                    {placa ? (
                      <div className="flex flex-col items-center bg-white border border-[#101828] rounded-md px-2 py-0.5 shadow-2xs">
                        <span className="text-[6.5px] font-black uppercase tracking-widest text-[#101828] leading-none">
                          BRASIL
                        </span>
                        <span className="font-mono font-black text-[11px] text-[#101828] tracking-wider leading-none mt-0.5">
                          {placa}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#b42318] font-bold">Sem placa</span>
                    )}
                  </div>

                  <div className="text-xs space-y-1">
                    <div>
                      <span className="text-[9.5px] font-bold uppercase text-[#667085] block">
                        Veículo:
                      </span>
                      <span className="font-bold text-[#101828]">
                        {marcaModelo || 'Modelo não informado'}
                      </span>
                      <span className="text-[11px] text-[#475467] block">
                        Ano {ano || '-'} • Cor {cor || '-'} • KM: {km ? `${km} km` : 'Não informado'}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-[#f2f4f7]">
                      <span className="text-[9.5px] font-bold uppercase text-[#667085] block">
                        Cliente / Titular:
                      </span>
                      <span className="font-bold text-[#101828]">
                        {cliente || 'Não identificado'}
                      </span>
                      {telefone && (
                        <span className="text-[11px] text-[#475467] block">
                          Tel: {telefone}
                        </span>
                      )}
                    </div>

                    <div className="pt-1.5 border-t border-[#f2f4f7]">
                      <span className="text-[9.5px] font-bold uppercase text-[#667085] block">
                        Mecânico Responsável:
                      </span>
                      <span className="font-bold text-[#101828]">
                        {mecanicoNome || 'Não designado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Evidências Fotográficas das Peças */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex flex-col gap-2 shrink-0">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f2f4f7]">
                    <div className="flex items-center gap-1.5">
                      <Camera size={15} weight="bold" className="text-[#101828]" />
                      <span className="text-xs font-bold text-[#101828]">
                        Evidências das Peças
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f8fafc] text-[#344054] border border-[#d0d5dd]">
                      {pecasDiagnostico.length} {pecasDiagnostico.length === 1 ? 'peça' : 'peças'}
                    </span>
                  </div>

                  {pecasDiagnostico.length === 0 ? (
                    <p className="text-xs text-[#667085] italic py-1">
                      Nenhuma peça cadastrada.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {pecasDiagnostico.map((peca, idx) => (
                        <div
                          key={peca.id || idx}
                          className="p-2 rounded-xl bg-[#f8fafc] border border-[#e4e7ec] flex items-center gap-2.5"
                        >
                          {peca.fotoUrl ? (
                            <button
                              type="button"
                              onClick={() => setFotoZoomUrl(peca.fotoUrl)}
                              className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#d0d5dd] shrink-0 group cursor-pointer shadow-2xs block"
                              title="Clique para ampliar foto"
                            >
                              <img
                                src={peca.fotoUrl}
                                alt={peca.nome}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Eye size={16} weight="bold" />
                              </div>
                            </button>
                          ) : (
                            <div className="w-12 h-12 rounded-lg border border-dashed border-[#d0d5dd] bg-white flex flex-col items-center justify-center text-[#98a2b3] shrink-0">
                              <Camera size={16} weight="regular" />
                              <span className="text-[7.5px] uppercase font-bold mt-0.5">Sem foto</span>
                            </div>
                          )}

                          <div className="min-w-0 flex-1 text-xs">
                            <span className="font-bold text-[#101828] block truncate leading-tight">
                              {peca.nome}
                            </span>
                            <span className="text-[10.5px] text-[#667085] block mt-0.5">
                              Qtd: {peca.quantidade || 1}
                              {peca.observacao && ` • ${peca.observacao}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card 3: Serviços Solicitados */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex flex-col gap-2 shrink-0">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f2f4f7]">
                    <div className="flex items-center gap-1.5">
                      <Wrench size={15} weight="bold" className="text-[#101828]" />
                      <span className="text-xs font-bold text-[#101828]">
                        Serviços Solicitados
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f8fafc] text-[#344054] border border-[#d0d5dd]">
                      {servicosDiagnostico.length} {servicosDiagnostico.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  {servicosDiagnostico.length === 0 ? (
                    <p className="text-xs text-[#667085] italic py-1">
                      Nenhum serviço selecionado.
                    </p>
                  ) : (
                    <ul className="space-y-1.5 text-xs">
                      {servicosDiagnostico.map((servico, idx) => (
                        <li
                          key={servico.id || idx}
                          className="flex items-start gap-2 p-1.5 rounded-lg bg-[#f8fafc] border border-[#e4e7ec]"
                        >
                          <span className="w-5 h-5 rounded-md bg-white border border-[#d0d5dd] text-[#101828] font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-[#101828] block leading-tight">
                              {servico.nome}
                            </span>
                            {servico.observacao && (
                              <span className="text-[10.5px] text-[#667085] block mt-0.5">
                                {servico.observacao}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Painel Principal (8 de 12 colunas): Editor Amplo e Espaçoso do Laudo Técnico */}
              <div className="lg:col-span-8 h-full flex flex-col min-h-0 bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 sm:p-5 overflow-hidden">
                {/* Toolbar do Editor */}
                <div className="flex items-center justify-between pb-3 border-b border-[#f2f4f7] shrink-0 mb-3">
                  <div className="flex items-center gap-2">
                    <FileText size={18} weight="bold" className="text-[#101828]" />
                    <div>
                      <span className="text-xs sm:text-sm font-extrabold text-[#101828] block leading-none">
                        Texto Oficial do Laudo Técnico (100% Editável)
                      </span>
                      <span className="text-[11px] text-[#667085] hidden sm:block mt-0.5">
                        Edite, complemente ou adicione recomendações antes de enviar ao cliente
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-[#667085] bg-[#f8fafc] px-2.5 py-1 rounded-lg border border-[#e4e7ec]">
                      {(laudoTecnico || '').length} caracteres
                    </span>
                  </div>
                </div>

                {/* Textarea Espaçosa em Tela Cheia / Ampla */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <textarea
                    value={laudoTecnico || ''}
                    onChange={(e) => updateFormData({ laudoTecnico: e.target.value })}
                    placeholder="O laudo técnico compilado será gerado aqui..."
                    className="w-full h-full bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-white border border-[#d0d5dd] focus:border-[#101828] rounded-xl p-4 sm:p-5 text-xs sm:text-[13px] font-mono font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all resize-none leading-relaxed shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="px-5 py-3.5 border-t border-[#f2f4f7] flex items-center justify-between shrink-0 bg-white">
              <span className="text-xs text-[#667085] hidden sm:inline">
                O laudo e quaisquer edições são sincronizados no rascunho da Ordem de Serviço.
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f8fafc] text-xs font-bold text-[#101828] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Printer size={15} weight="bold" />
                  <span>Imprimir Laudo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalLaudoAberto(false)}
                  className="px-5 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Concluir e Salvar Laudo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Zoom da Foto da Peça */}
      {fotoZoomUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setFotoZoomUrl(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fotoZoomUrl}
              alt="Foto da Peça Ampliada"
              className="max-h-[75vh] w-auto object-contain"
            />
            <div className="w-full bg-black/90 px-4 py-2.5 flex items-center justify-between text-white text-xs">
              <span className="font-semibold">Registro Fotográfico da Peça</span>
              <button
                type="button"
                onClick={() => setFotoZoomUrl(null)}
                className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
