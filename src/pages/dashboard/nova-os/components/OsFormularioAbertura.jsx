import React, { useMemo, useRef, useState } from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { IMaskInput } from 'react-imask'
import {
  Tag,
  User,
  Car,
  Phone,
  WhatsappLogo,
  MapPin,
  Plus,
  WarningCircle,
  ShieldCheck,
  ChatText,
  Sparkle,
  Wrench,
  CalendarBlank,
  Info,
  Camera,
  Trash,
  PaperPlaneTilt,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { carregarClientesCadastrados } from '../../../../constants/mockClientesVeiculos'
import { MOCK_MECANICOS } from '../../../../constants/mecanicos'
import { obterMecanicosAtivos } from '../../../../repositories/funcionariosRepository'
import { obterOrdensAbertas } from '../../orcamento/mockOrdensAbertas'
import { customSelectStyles } from '../../../../components/suprimentos/customSelectStyles'
import { formatarCPF, formatarCNPJ, formatarTelefone } from '../../../../utils/fiscalValidators'
import { ClienteModalForm } from '../../../../components/clientes/ClienteModalForm'
import { VeiculoModalForm } from '../../../../components/veiculos/VeiculoModalForm'
import { ITENS_CHECKLIST_ENTRADA, FOTOS_VEICULO_TIPOS } from '../../../../constants/checklistItems'

// Os selects deste formulario vivem dentro de um painel com rolagem propria (aba "Dados") —
// sem portal, o menu aberto fica cortado pelo overflow do painel perto do fim da lista
// (caso do Mecanico Responsavel, a ultima secao). Renderizando via portal no body com
// posicao fixa, o menu sempre aparece por cima, inteiro, independente do scroll.
const selectStylesPortal = {
  ...customSelectStyles,
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
}

const NIVEIS_COMBUSTIVEL = [
  { value: 'reserva', label: 'Reserva' },
  { value: '1/4', label: '1/4' },
  { value: '1/2', label: '1/2' },
  { value: '3/4', label: '3/4' },
  { value: 'cheio', label: 'Cheio' },
]

const TIPO_ATENDIMENTO_OPCOES = [
  { value: 'orcamento', label: 'Orcamento' },
  { value: 'preventiva', label: 'Revisao Preventiva' },
  { value: 'corretiva', label: 'Manutencao Corretiva' },
  { value: 'garantia', label: 'Retorno e Garantia' },
  { value: 'sinistro', label: 'Sinistro e Seguradora' },
]

const PRIORIDADE_OPCOES = [
  { value: 'normal', label: 'Prioridade Normal' },
  { value: 'alta', label: 'Prioridade Alta' },
  { value: 'urgente', label: 'Prioridade Urgente' },
  { value: 'retorno', label: 'Retorno e Garantia' },
]

const CANAL_ENTRADA_OPCOES = [
  { value: 'presencial', label: 'Balcao / Presencial' },
  { value: 'whatsapp', label: 'Canal WhatsApp' },
  { value: 'telefone', label: 'Ligacao Telefonica' },
  { value: 'leva_traz', label: 'Guincho / Leva e Traz' },
  { value: 'agendamento', label: 'Agendamento Previo' },
]

const SINTOMAS_OPTIONS = [
  { value: 'Barulho na suspensao ao passar em desniveis', label: 'Barulho na suspensao ao passar em desniveis' },
  { value: 'Luz da injecao eletronica acesa no painel', label: 'Luz da injecao eletronica acesa no painel' },
  { value: 'Freio assobiando e vibrando ao frear', label: 'Freio assobiando e vibrando ao frear' },
  { value: 'Superaquecimento do motor e vazamento de agua', label: 'Superaquecimento do motor e vazamento de agua' },
  { value: 'Dificuldade na partida e bateria fraca', label: 'Dificuldade na partida e bateria fraca' },
  { value: 'Troca preventiva de oleo e todos os filtros', label: 'Troca preventiva de oleo e todos os filtros' },
  { value: 'Revisao periodica preventiva de quilometragem', label: 'Revisao periodica preventiva de quilometragem' },
  { value: 'Ar condicionado com perda de eficiencia / nao gela', label: 'Ar condicionado com perda de eficiencia / nao gela' },
  { value: 'Direcao puxando para o lado e desalinhamento', label: 'Direcao puxando para o lado e desalinhamento' },
  { value: 'Embreagem pesada e patinando nas marchas', label: 'Embreagem pesada e patinando nas marchas' },
  { value: 'Barulho metalico no compartimento do motor', label: 'Barulho metalico no compartimento do motor' },
  { value: 'Fumaca branca ou azulada no escapamento', label: 'Fumaca branca ou azulada no escapamento' },
  { value: 'Vazamento de oleo visivel sob o veiculo', label: 'Vazamento de oleo visivel sob o veiculo' },
  { value: 'Pedal de freio baixo ou esponjoso', label: 'Pedal de freio baixo ou esponjoso' },
  { value: 'Alinhamento 3D e balanceamento das 4 rodas', label: 'Alinhamento 3D e balanceamento das 4 rodas' },
  { value: 'Vibracao no volante em velocidades acima de 80 km/h', label: 'Vibracao no volante em velocidades acima de 80 km/h' },
  { value: 'Consumo excessivo de combustivel com falhas de aceleracao', label: 'Consumo excessivo de combustivel com falhas de aceleracao' },
]

function SecaoForm({ icone: Icone, titulo, acessorio, children }) {
  const Ic = Icone
  return (
    <section className="bg-white p-4 rounded-2xl border border-[#d0d5dd] shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6.5 h-6.5 rounded-lg bg-[#f0f9ff] text-[#0284c7] flex items-center justify-center shrink-0">
            <Ic size={14} weight="bold" />
          </div>
          <h2 className="text-xs font-bold text-[#101828] uppercase tracking-wider">{titulo}</h2>
        </div>
        {acessorio}
      </div>
      {children}
    </section>
  )
}

function Campo({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="text-[11px] font-bold text-[#344054] block mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-semibold text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]'

// Nem todo veiculo cadastrado tem marca/modelo separados (alguns registros antigos so tem o
// texto combinado marcaModelo) — quando faltar, divide pela primeira palavra como fallback.
function obterMarcaModeloSeparados(v) {
  if (v?.marca || v?.modelo) {
    return { marca: v.marca || '', modelo: v.modelo || '' }
  }
  const texto = (v?.marcaModelo || '').trim()
  if (!texto) return { marca: '', modelo: '' }
  const [marca, ...resto] = texto.split(' ')
  return { marca, modelo: resto.join(' ') }
}

const ABAS_FORMULARIO = [
  { id: 'dados', label: 'Dados do Atendimento' },
  { id: 'relato', label: 'Relato do Cliente' },
  { id: 'vistoria', label: 'Vistoria de Entrada' },
]

export function OsFormularioAbertura({ formData, updateFormData, onEnviarAssinatura }) {
  const [abaAtiva, setAbaAtiva] = useState('dados')
  const [modalNovoClienteAberto, setModalNovoClienteAberto] = useState(false)
  const [modalNovoVeiculoAberto, setModalNovoVeiculoAberto] = useState(false)

  const listaClientes = useMemo(() => carregarClientesCadastrados(), [modalNovoClienteAberto])

  const clientesOptions = useMemo(() => {
    return listaClientes.map((c) => {
      const placaStr =
        Array.isArray(c.veiculos) && c.veiculos.length > 0
          ? ` • Placa(s): ${c.veiculos.map((v) => v.placa).join(', ')}`
          : ''
      const docStr = c.documento ? ` • ${c.documento}` : ''
      const foneStr = c.telefone ? ` • ${c.telefone}` : ''
      return {
        value: c.value || c.id,
        label: `${c.nome}${docStr}${foneStr}${placaStr}`,
        dados: c,
      }
    })
  }, [listaClientes])

  const selectedClienteOption = useMemo(() => {
    if (!formData.clienteId && !formData.cliente) return null
    return (
      clientesOptions.find(
        (opt) =>
          (formData.clienteId && opt.value === formData.clienteId) ||
          (formData.cliente && opt.dados.nome?.toLowerCase() === formData.cliente?.toLowerCase())
      ) || null
    )
  }, [formData.clienteId, formData.cliente, clientesOptions])

  const veiculosDoCliente = useMemo(() => {
    if (!selectedClienteOption?.dados?.veiculos) return []
    return selectedClienteOption.dados.veiculos
  }, [selectedClienteOption])

  const veiculosOptions = useMemo(() => {
    return veiculosDoCliente.map((v) => ({
      value: v.value || v.id || v.placa,
      label: `${v.placa} • ${v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim()} (${v.ano || ''} - ${v.cor || ''})`,
      dados: v,
    }))
  }, [veiculosDoCliente])

  const selectedVeiculoOption = useMemo(() => {
    if (!formData.placa && !formData.veiculoId) return null
    return (
      veiculosOptions.find(
        (opt) =>
          (formData.veiculoId && opt.value === formData.veiculoId) ||
          (formData.placa &&
            opt.dados.placa?.toUpperCase().trim() === formData.placa?.toUpperCase().trim())
      ) || null
    )
  }, [formData.veiculoId, formData.placa, veiculosOptions])

  const [mecanicosDinamicos, setMecanicosDinamicos] = useState(MOCK_MECANICOS)

  useEffect(() => {
    let cancelado = false
    const carregar = async () => {
      try {
        const ativos = await obterMecanicosAtivos()
        if (!cancelado && ativos && ativos.length > 0) {
          const formatados = [
            MOCK_MECANICOS[0],
            ...ativos.map((a) => ({
              value: a.id,
              label: a.nome,
              nome: a.nome,
              cargo: a.cargoLabel || a.cargo,
              especialidade: a.especialidade,
              boxElevador: a.boxElevador,
              comissaoPerc: a.comissaoServicos,
              telefone: a.telefone,
            })),
          ]
          setMecanicosDinamicos(formatados)
        }
      } catch (e) {
        console.error('Erro ao carregar mecânicos ativos para nova OS:', e)
      }
    }
    carregar()

    window.addEventListener('dev_oficina_funcionarios_updated', carregar)
    return () => {
      cancelado = true
      window.removeEventListener('dev_oficina_funcionarios_updated', carregar)
    }
  }, [])

  const mecanicosOptions = useMemo(
    () => mecanicosDinamicos.map((m) => ({ value: m.value, label: m.nome, nome: m.nome })),
    [mecanicosDinamicos]
  )
  const selectedMecanicoOption = useMemo(
    () =>
      mecanicosOptions.find((m) => m.value === formData.mecanicoId) ||
      mecanicosOptions.find(
        (m) =>
          formData.mecanicoNome &&
          m.nome.trim().toLowerCase() === formData.mecanicoNome.trim().toLowerCase()
      ) ||
      mecanicosOptions[0],
    [formData.mecanicoId, formData.mecanicoNome, mecanicosOptions]
  )

  const ordensAbertas = useMemo(() => obterOrdensAbertas(), [])
  const empenhoPorMecanico = useMemo(() => {
    return mecanicosDinamicos
      .filter((m) => Boolean(m.value))
      .map((mec) => {
        const totalOs = ordensAbertas.filter((o) => {
          const matchNome =
            o.mecanicoNome && o.mecanicoNome.trim().toLowerCase() === mec.nome.trim().toLowerCase()
          const matchId =
            o.mecanicoId &&
            (o.mecanicoId === mec.value ||
              o.mecanicoId === mec.value.replace('func-', 'mec-') ||
              o.mecanicoId === mec.value.replace('mec-', 'func-'))
          return (matchNome || matchId) && o.status !== 'finalizada'
        }).length
        return { ...mec, totalOs }
      })
      .sort((a, b) => a.totalOs - b.totalOs)
  }, [mecanicosDinamicos, ordensAbertas])

  const handleSelectCliente = (option) => {
    if (!option) {
      updateFormData({
        clienteId: '',
        cliente: '',
        telefone: '',
        documento: '',
        email: '',
        endereco: '',
        cidade: '',
        uf: '',
        veiculoId: '',
        placa: '',
        marcaModelo: '',
        ano: '',
        cor: '',
        combustivel: 'FLEX',
        km: '',
        kmAnterior: '',
      })
      return
    }

    const c = option.dados
    const primeiroVeic = Array.isArray(c.veiculos) && c.veiculos.length > 0 ? c.veiculos[0] : null
    const { marca, modelo } = obterMarcaModeloSeparados(primeiroVeic)

    updateFormData({
      clienteId: c.value || c.id,
      cliente: c.nome,
      telefone: c.telefone || '',
      documento: c.documento || '',
      email: c.email || '',
      endereco: c.endereco || '',
      cidade: c.cidade || '',
      uf: c.uf || 'PR',
      veiculoId: primeiroVeic ? primeiroVeic.value || primeiroVeic.id : '',
      placa: primeiroVeic ? primeiroVeic.placa : '',
      marca,
      modelo,
      marcaModelo: primeiroVeic
        ? primeiroVeic.marcaModelo || `${marca} ${modelo}`.trim()
        : '',
      ano: primeiroVeic ? primeiroVeic.ano || '' : '',
      cor: primeiroVeic ? primeiroVeic.cor || '' : '',
      combustivel: primeiroVeic ? primeiroVeic.combustivel || 'FLEX' : 'FLEX',
      km: primeiroVeic ? primeiroVeic.kmPadrao || primeiroVeic.kmAtual || '' : '',
      kmAnterior: primeiroVeic ? primeiroVeic.kmAnterior || primeiroVeic.kmPadrao || '' : '',
    })
  }

  const handleSelectVeiculo = (option) => {
    if (!option) {
      updateFormData({
        veiculoId: '',
        placa: '',
        marca: '',
        modelo: '',
        marcaModelo: '',
        ano: '',
        cor: '',
        combustivel: 'FLEX',
        km: '',
        kmAnterior: '',
      })
      return
    }

    const v = option.dados
    const { marca, modelo } = obterMarcaModeloSeparados(v)
    updateFormData({
      veiculoId: v.value || v.id,
      placa: v.placa || '',
      marca,
      modelo,
      marcaModelo: v.marcaModelo || `${marca} ${modelo}`.trim(),
      ano: v.ano || '',
      cor: v.cor || '',
      combustivel: v.combustivel || 'FLEX',
      km: v.kmPadrao || v.kmAtual || formData.km || '',
      kmAnterior: v.kmAnterior || v.kmPadrao || '',
    })
  }

  const handleSalvarNovoCliente = (clienteCriado) => {
    if (!clienteCriado) return
    const primeiroVeic =
      Array.isArray(clienteCriado.veiculos) && clienteCriado.veiculos.length > 0
        ? clienteCriado.veiculos[0]
        : null

    updateFormData({
      clienteId: clienteCriado.value || clienteCriado.id,
      cliente: clienteCriado.nome,
      telefone: clienteCriado.telefone || '',
      documento: clienteCriado.documento || '',
      email: clienteCriado.email || '',
      endereco: clienteCriado.endereco || '',
      cidade: clienteCriado.cidade || '',
      uf: clienteCriado.uf || 'PR',
      veiculoId: primeiroVeic ? primeiroVeic.value || primeiroVeic.id : '',
      placa: primeiroVeic ? primeiroVeic.placa : '',
      marcaModelo: primeiroVeic
        ? primeiroVeic.marcaModelo || `${primeiroVeic.marca || ''} ${primeiroVeic.modelo || ''}`.trim()
        : '',
      ano: primeiroVeic ? primeiroVeic.ano : '',
      cor: primeiroVeic ? primeiroVeic.cor : '',
      combustivel: primeiroVeic ? primeiroVeic.combustivel || 'FLEX' : 'FLEX',
      km: primeiroVeic ? primeiroVeic.kmPadrao || primeiroVeic.kmAtual || '' : '',
    })

    setModalNovoClienteAberto(false)
    toast.success(`Cliente ${clienteCriado.nome} cadastrado e vinculado a esta OS!`)
  }

  const handleSalvarNovoVeiculo = (veicCriado) => {
    if (!veicCriado) return
    const { marca, modelo } = obterMarcaModeloSeparados(veicCriado)
    updateFormData({
      veiculoId: veicCriado.value || veicCriado.id,
      placa: veicCriado.placa || '',
      marca,
      modelo,
      marcaModelo: veicCriado.marcaModelo || `${marca} ${modelo}`.trim(),
      ano: veicCriado.ano || '',
      cor: veicCriado.cor || '',
      combustivel: veicCriado.combustivel || 'FLEX',
      km: veicCriado.kmAtual || veicCriado.kmPadrao || '',
    })
    setModalNovoVeiculoAberto(false)
    toast.success(`Veiculo placa ${veicCriado.placa} vinculado com sucesso!`)
  }

  const handleSelecionarProblema = (option) => {
    if (!option) return
    const textoProblema = option.value?.trim() || option.label?.trim()
    if (!textoProblema) return

    const atual = (formData.relatoCliente || '').trim()
    if (!atual) {
      updateFormData({ relatoCliente: `• ${textoProblema}` })
    } else if (!atual.toLowerCase().includes(textoProblema.toLowerCase())) {
      updateFormData({ relatoCliente: `${atual}\n• ${textoProblema}` })
    }
  }

  const checklistEntrada = formData.checklistEntrada || {}
  const totalItens = ITENS_CHECKLIST_ENTRADA.length
  const preenchidosCount = ITENS_CHECKLIST_ENTRADA.filter((item) => Boolean(checklistEntrada[item.id]?.status)).length
  const naoConformesCount = ITENS_CHECKLIST_ENTRADA.filter((item) => checklistEntrada[item.id]?.status === 'nao_conforme').length

  const handleMarcarTodosConformes = () => {
    const todosOk = {}
    ITENS_CHECKLIST_ENTRADA.forEach((item) => {
      todosOk[item.id] = { status: 'conforme', obs: '' }
    })
    updateFormData({ checklistEntrada: todosOk })
  }

  const handleLimparChecklist = () => {
    const limpo = {}
    ITENS_CHECKLIST_ENTRADA.forEach((item) => {
      limpo[item.id] = { status: '', obs: '' }
    })
    updateFormData({ checklistEntrada: limpo })
  }

  const handleStatusItem = (itemId, status) => {
    const atual = checklistEntrada[itemId] || { status: '', obs: '' }
    const novoStatus = atual.status === status ? '' : status
    updateFormData({ checklistEntrada: { ...checklistEntrada, [itemId]: { ...atual, status: novoStatus } } })
  }

  const handleObsItem = (itemId, obs) => {
    const atual = checklistEntrada[itemId] || { status: '', obs: '' }
    updateFormData({ checklistEntrada: { ...checklistEntrada, [itemId]: { ...atual, obs } } })
  }

  const somarDias = (dias) => {
    const data = new Date()
    data.setDate(data.getDate() + dias)
    const d = String(data.getDate()).padStart(2, '0')
    const m = String(data.getMonth() + 1).padStart(2, '0')
    const y = data.getFullYear()
    return `${d}/${m}/${y}`
  }

  const foneLimpo = (formData.telefone || '').replace(/\D/g, '')
  const kmNumericoAtual = parseInt(String(formData.km || '').replace(/\D/g, ''), 10) || 0
  const kmNumericoAnterior = parseInt(String(formData.kmAnterior || '').replace(/\D/g, ''), 10) || 0
  const kmInconsistente = kmNumericoAnterior > 0 && kmNumericoAtual > 0 && kmNumericoAtual < kmNumericoAnterior

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
      {/* Aviso quando esta OS foi aberta atendendo alguem da Fila de Atendimento da Agenda */}
      {formData.filaEsperaId && (
        <div className="shrink-0 mb-3 p-2.5 rounded-2xl bg-[#f0f9ff] border border-[#bae6fd] text-[10.5px] text-[#0369a1] font-semibold flex items-center gap-1.5">
          <ShieldCheck size={14} weight="fill" className="shrink-0" />
          <span>Atendendo cliente da Fila de Atendimento (Agenda) — sai de la ao salvar esta OS.</span>
        </div>
      )}

      {/* Abas do Formulario: Dados do Atendimento, Relato do Cliente e Vistoria de Entrada */}
      <div className="shrink-0 mb-3 flex items-center gap-1.5 p-1 bg-[#f2f4f7] rounded-2xl border border-[#e4e7ec]">
        {ABAS_FORMULARIO.map((aba) => (
          <button
            key={aba.id}
            type="button"
            onClick={() => setAbaAtiva(aba.id)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              abaAtiva === aba.id
                ? 'bg-[#101828] text-white shadow-2xs'
                : 'text-[#475467] hover:bg-white hover:text-[#101828]'
            }`}
          >
            <span>{aba.label}</span>
            {aba.id === 'relato' && !formData.relatoCliente?.trim() && (
              <span
                title="Obrigatorio para salvar a OS"
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  abaAtiva === 'relato' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                }`}
              >
                Obrigatorio
              </span>
            )}
            {aba.id === 'vistoria' && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  abaAtiva === 'vistoria' ? 'bg-[#0284c7] text-white' : 'bg-[#e4e7ec] text-[#475467]'
                } ${naoConformesCount > 0 ? '!bg-amber-500 !text-white' : ''}`}
              >
                {preenchidosCount}/{totalItens}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Painel da aba ativa — key reinicia a rolagem ao trocar de aba */}
      <div key={abaAtiva} className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3 pb-1">
        {abaAtiva === 'dados' && (
          <SecaoDados
            formData={formData}
            updateFormData={updateFormData}
            somarDias={somarDias}
            selectedClienteOption={selectedClienteOption}
            clientesOptions={clientesOptions}
            handleSelectCliente={handleSelectCliente}
            setModalNovoClienteAberto={setModalNovoClienteAberto}
            foneLimpo={foneLimpo}
            selectedVeiculoOption={selectedVeiculoOption}
            veiculosOptions={veiculosOptions}
            handleSelectVeiculo={handleSelectVeiculo}
            setModalNovoVeiculoAberto={setModalNovoVeiculoAberto}
            kmInconsistente={kmInconsistente}
            selectedMecanicoOption={selectedMecanicoOption}
            mecanicosOptions={mecanicosOptions}
            empenhoPorMecanico={empenhoPorMecanico}
          />
        )}

        {abaAtiva === 'relato' && (
          <SecaoRelato
            formData={formData}
            updateFormData={updateFormData}
            handleSelecionarProblema={handleSelecionarProblema}
          />
        )}

        {abaAtiva === 'vistoria' && (
          <SecaoVistoria
            checklistEntrada={checklistEntrada}
            preenchidosCount={preenchidosCount}
            totalItens={totalItens}
            naoConformesCount={naoConformesCount}
            handleMarcarTodosConformes={handleMarcarTodosConformes}
            handleLimparChecklist={handleLimparChecklist}
            handleStatusItem={handleStatusItem}
            handleObsItem={handleObsItem}
            fotosVeiculoEntrada={formData.fotosVeiculoEntrada}
            updateFormData={updateFormData}
            onEnviarAssinatura={onEnviarAssinatura}
          />
        )}
      </div>

      <ClienteModalForm
        isOpen={modalNovoClienteAberto}
        onClose={() => setModalNovoClienteAberto(false)}
        onSalvar={handleSalvarNovoCliente}
      />

      <VeiculoModalForm
        isOpen={modalNovoVeiculoAberto}
        onClose={() => setModalNovoVeiculoAberto(false)}
        onSalvar={handleSalvarNovoVeiculo}
        clientePredefinidoId={formData.clienteId}
      />
    </div>
  )
}

function SecaoDados({
  formData,
  updateFormData,
  somarDias,
  selectedClienteOption,
  clientesOptions,
  handleSelectCliente,
  setModalNovoClienteAberto,
  foneLimpo,
  selectedVeiculoOption,
  veiculosOptions,
  handleSelectVeiculo,
  setModalNovoVeiculoAberto,
  kmInconsistente,
  selectedMecanicoOption,
  mecanicosOptions,
  empenhoPorMecanico,
}) {
  return (
    <>
      {/* 1. CLASSIFICACAO DO ATENDIMENTO */}
      <SecaoForm icone={Tag} titulo="Classificacao do Atendimento">
        <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4 gap-3">
          <Campo label="Tipo de Atendimento">
            <Select
              options={TIPO_ATENDIMENTO_OPCOES}
              value={TIPO_ATENDIMENTO_OPCOES.find((o) => o.value === formData.tipoAtendimento) || TIPO_ATENDIMENTO_OPCOES[0]}
              onChange={(opt) => updateFormData({ tipoAtendimento: opt?.value || 'orcamento' })}
              styles={selectStylesPortal}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              isSearchable={false}
            />
          </Campo>
          <Campo label="Prioridade">
            <Select
              options={PRIORIDADE_OPCOES}
              value={PRIORIDADE_OPCOES.find((o) => o.value === formData.prioridade) || PRIORIDADE_OPCOES[0]}
              onChange={(opt) => updateFormData({ prioridade: opt?.value || 'normal' })}
              styles={selectStylesPortal}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              isSearchable={false}
            />
          </Campo>
          <Campo label="Canal de Entrada">
            <Select
              options={CANAL_ENTRADA_OPCOES}
              value={CANAL_ENTRADA_OPCOES.find((o) => o.value === formData.canalEntrada) || CANAL_ENTRADA_OPCOES[0]}
              onChange={(opt) => updateFormData({ canalEntrada: opt?.value || 'presencial' })}
              styles={selectStylesPortal}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              isSearchable={false}
            />
          </Campo>
          <Campo label="Previsao de Entrega">
            <div className="flex items-center gap-1">
              <div className="relative flex-1">
                <CalendarBlank size={14} weight="bold" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#0284c7]" />
                <input
                  type="text"
                  value={formData.previsaoEntregaData}
                  onChange={(e) => updateFormData({ previsaoEntregaData: e.target.value })}
                  placeholder="DD/MM/AAAA"
                  className={`${inputClass} pl-8`}
                />
              </div>
              <button
                type="button"
                onClick={() => updateFormData({ previsaoEntregaData: somarDias(1) })}
                title="Amanha"
                className="h-9.5 px-2 rounded-xl bg-[#f8fafc] hover:bg-[#e0f2fe] text-[#0284c7] font-black text-[10px] border border-[#d0d5dd] cursor-pointer shrink-0"
              >
                +1d
              </button>
            </div>
          </Campo>
        </div>
      </SecaoForm>

      {/* 2. CLIENTE */}
      <SecaoForm
        icone={User}
        titulo="Cliente"
        acessorio={
          <button
            type="button"
            onClick={() => setModalNovoClienteAberto(true)}
            className="h-7 px-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs transition-all active:scale-95"
          >
            <Plus size={11} weight="bold" />
            <span>Novo Cliente</span>
          </button>
        }
      >
        <Select
          options={clientesOptions}
          value={selectedClienteOption}
          onChange={handleSelectCliente}
          placeholder="Pesquise por nome, telefone, CPF ou placa..."
          isClearable
          isSearchable
          styles={selectStylesPortal}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          noOptionsMessage={() => 'Nenhum cliente localizado'}
        />

        {formData.cliente && (
          <div className="grid grid-cols-1 @sm:grid-cols-3 gap-3 pt-1">
            <Campo label="Nome">
              <div className="h-9.5 px-3 rounded-xl border border-[#e4e7ec] bg-[#f8fafc] flex items-center text-xs font-bold text-[#101828] truncate">
                {formData.cliente}
              </div>
            </Campo>
            <Campo label="Documento">
              <div className="h-9.5 px-3 rounded-xl border border-[#e4e7ec] bg-[#f8fafc] flex items-center text-xs font-mono font-semibold text-[#475467]">
                {formData.documento
                  ? formData.documento.length > 14
                    ? formatarCNPJ(formData.documento)
                    : formatarCPF(formData.documento)
                  : 'Nao informado'}
              </div>
            </Campo>
            <Campo label="Telefone">
              <div className="h-9.5 px-3 rounded-xl border border-[#e4e7ec] bg-[#f8fafc] flex items-center justify-between text-xs font-semibold text-[#475467]">
                <span className="flex items-center gap-1 truncate">
                  <Phone size={12} weight="bold" className="text-[#0284c7] shrink-0" />
                  {formatarTelefone(formData.telefone) || 'Sem telefone'}
                </span>
                {foneLimpo && (
                  <a
                    href={`https://wa.me/55${foneLimpo}?text=${encodeURIComponent(
                      `Ola ${formData.cliente}, confirmamos o recebimento do seu veiculo para abertura da Ordem de Servico #${formData.numeroOS} na Mecanica Gabriel.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Conversar no WhatsApp"
                    className="text-[#25D366] hover:text-[#1EBE5D] shrink-0"
                  >
                    <WhatsappLogo size={16} weight="fill" />
                  </a>
                )}
              </div>
            </Campo>
            {formData.endereco && (
              <div className="col-span-3 flex items-center gap-1 text-[11px] text-[#667085]">
                <MapPin size={12} weight="bold" className="shrink-0 text-[#98a2b3]" />
                <span className="truncate">{formData.endereco}</span>
              </div>
            )}
          </div>
        )}
      </SecaoForm>

      {/* 3. VEICULO */}
      <SecaoForm
        icone={Car}
        titulo="Veiculo"
        acessorio={
          <button
            type="button"
            disabled={!formData.clienteId}
            onClick={() => setModalNovoVeiculoAberto(true)}
            title={formData.clienteId ? 'Cadastrar novo veiculo para este cliente' : 'Selecione o cliente primeiro'}
            className={`h-7 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
              formData.clienteId
                ? 'bg-[#101828] hover:bg-black text-white cursor-pointer shadow-2xs'
                : 'bg-[#f2f4f7] text-[#98a2b3] cursor-not-allowed'
            }`}
          >
            <Plus size={11} weight="bold" />
            <span>Novo Veiculo</span>
          </button>
        }
      >
        <Select
          options={veiculosOptions}
          value={selectedVeiculoOption}
          onChange={handleSelectVeiculo}
          placeholder={
            !formData.clienteId
              ? 'Selecione o cliente primeiro...'
              : veiculosOptions.length === 0
              ? 'Nenhum veiculo cadastrado para este cliente'
              : 'Selecione o veiculo do cliente...'
          }
          isDisabled={!formData.clienteId}
          isClearable
          isSearchable
          styles={selectStylesPortal}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          noOptionsMessage={() => 'Nenhum veiculo cadastrado para este cliente'}
        />

        {formData.placa && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3">
              <Campo label="Placa">
                <div className="h-9.5 px-3 rounded-xl border border-[#e4e7ec] bg-[#f8fafc] flex items-center">
                  <span className="font-mono font-black text-xs text-[#101828] tracking-wider">
                    {formData.placa.toUpperCase()}
                  </span>
                </div>
              </Campo>
              <Campo label="Marca">
                <div className="h-9.5 px-3 rounded-xl border border-[#e4e7ec] bg-[#f8fafc] flex items-center text-xs font-bold text-[#101828] truncate">
                  {formData.marca || '—'}
                </div>
              </Campo>
              <Campo label="Modelo">
                <div className="h-9.5 px-3 rounded-xl border border-[#e4e7ec] bg-[#f8fafc] flex items-center text-xs font-bold text-[#101828] truncate">
                  {formData.modelo || '—'}
                </div>
              </Campo>
              <Campo label="Ano">
                <div className="h-9.5 px-3 rounded-xl border border-[#e4e7ec] bg-[#f8fafc] flex items-center text-xs font-bold text-[#101828] truncate">
                  {formData.ano || '—'}
                </div>
              </Campo>
            </div>

            <div className="grid grid-cols-1 @sm:grid-cols-3 gap-3 items-end">
              <Campo label="KM Atual *">
                <IMaskInput
                  mask="000.000"
                  value={formData.km || ''}
                  onAccept={(val) => updateFormData({ km: val })}
                  placeholder="Ex: 280.812"
                  className={`${inputClass} font-mono ${
                    kmInconsistente
                      ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500 bg-amber-50/40'
                      : !formData.km
                      ? 'border-rose-300'
                      : ''
                  }`}
                />
                {kmInconsistente && (
                  <p className="text-[9.5px] text-amber-700 font-semibold mt-0.5 flex items-center gap-0.5">
                    <WarningCircle size={10} weight="fill" />
                    <span>Menor que KM anterior ({formData.kmAnterior})</span>
                  </p>
                )}
              </Campo>

              <Campo label="Nivel do Tanque" className="@sm:col-span-2">
                <div className="grid grid-cols-5 gap-0.5 bg-white p-0.5 rounded-xl border border-[#d0d5dd]">
                  {NIVEIS_COMBUSTIVEL.map((nv) => {
                    const isSelected = formData.nivelCombustivel === nv.value
                    return (
                      <button
                        key={nv.value}
                        type="button"
                        onClick={() => updateFormData({ nivelCombustivel: nv.value })}
                        className={`h-8 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isSelected ? 'bg-[#101828] text-white shadow-2xs' : 'text-[#667085] hover:bg-[#f2f4f7] hover:text-[#101828]'
                        }`}
                      >
                        {nv.label}
                      </button>
                    )
                  })}
                </div>
              </Campo>
            </div>
          </div>
        )}
      </SecaoForm>

      {/* 4. EQUIPE RESPONSAVEL */}
      <SecaoForm icone={Wrench} titulo="Equipe Responsavel">
        <div className="grid grid-cols-1 @sm:grid-cols-3 gap-3">
          <Campo label="Mecanico Responsavel">
            <Select
              options={mecanicosOptions}
              value={selectedMecanicoOption}
              onChange={(opt) => updateFormData({ mecanicoId: opt?.value || '', mecanicoNome: opt?.value ? opt.nome : '' })}
              styles={selectStylesPortal}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              isSearchable={false}
            />
          </Campo>
          <Campo label="Consultor">
            <input
              type="text"
              value={formData.consultorResponsavel || 'BIANCA'}
              onChange={(e) => updateFormData({ consultorResponsavel: e.target.value })}
              placeholder="Ex: Bianca"
              className={inputClass}
            />
          </Campo>
          <Campo label="Hora Prevista">
            <input
              type="time"
              value={formData.previsaoEntregaHora || '18:00'}
              onChange={(e) => updateFormData({ previsaoEntregaHora: e.target.value })}
              className={inputClass}
            />
          </Campo>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {empenhoPorMecanico.map((mec) => {
            const isSelecionado =
              formData.mecanicoId === mec.value ||
              (formData.mecanicoNome && formData.mecanicoNome.trim().toLowerCase() === mec.nome.trim().toLowerCase())
            return (
              <button
                key={mec.value}
                type="button"
                onClick={() => updateFormData({ mecanicoId: mec.value, mecanicoNome: mec.nome })}
                className={`px-2 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                  isSelecionado
                    ? 'bg-[#f0f9ff] border-[#0284c7] text-[#0369a1] ring-1 ring-[#0284c7]'
                    : 'bg-[#f8fafc] border-[#e4e7ec] text-[#475467] hover:border-[#98a2b3] hover:bg-white'
                }`}
                title={`${mec.totalOs} OS em andamento`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${mec.totalOs === 0 ? 'bg-[#0284c7]' : 'bg-[#98a2b3]'}`} />
                <span>{mec.nome.split(' ')[0]}</span>
                <span className="text-[9px] opacity-70">{mec.totalOs}</span>
              </button>
            )
          })}
        </div>
      </SecaoForm>
    </>
  )
}

function SecaoRelato({ formData, updateFormData, handleSelecionarProblema }) {
  return (
    <SecaoForm icone={ChatText} titulo="Relato do Cliente e Sintomas *">
      <CreatableSelect
        options={SINTOMAS_OPTIONS}
        value={null}
        onChange={handleSelecionarProblema}
        placeholder="Selecione ou digite um sintoma para adicionar ao relato..."
        isClearable={false}
        isSearchable
        styles={selectStylesPortal}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        formatCreateLabel={(inputValue) => `Adicionar no relato: "${inputValue}"`}
        noOptionsMessage={() => 'Nenhum sintoma correspondente (digite para criar)'}
      />

      <textarea
        value={formData.relatoCliente || ''}
        onChange={(e) => updateFormData({ relatoCliente: e.target.value })}
        placeholder="Descreva o que o cliente relatou ou use o seletor acima..."
        rows={6}
        className="w-full p-2.5 rounded-xl border border-[#d0d5dd] text-xs font-medium text-[#101828] bg-[#f8fafc] focus:bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] resize-none leading-relaxed"
      />

      <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
        <Campo label="Pertences no Veiculo">
          <input
            type="text"
            value={formData.objetosVeiculo || ''}
            onChange={(e) => updateFormData({ objetosVeiculo: e.target.value })}
            placeholder="Estepe, macaco, cadeirinha..."
            className={inputClass}
          />
        </Campo>
        <Campo label="Avarias Pre-existentes">
          <input
            type="text"
            value={formData.avariasVisual || ''}
            onChange={(e) => updateFormData({ avariasVisual: e.target.value })}
            placeholder="Risco na porta, mossa..."
            className={inputClass}
          />
        </Campo>
      </div>
    </SecaoForm>
  )
}

function SecaoVistoria({
  checklistEntrada,
  preenchidosCount,
  totalItens,
  naoConformesCount,
  handleMarcarTodosConformes,
  handleLimparChecklist,
  handleStatusItem,
  handleObsItem,
  fotosVeiculoEntrada,
  updateFormData,
  onEnviarAssinatura,
}) {
  const inputRefsFoto = useRef({})

  const handleSelecionarFoto = (tipoId, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      updateFormData({
        fotosVeiculoEntrada: { ...(fotosVeiculoEntrada || {}), [tipoId]: ev.target.result },
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemoverFoto = (tipoId) => {
    const copia = { ...(fotosVeiculoEntrada || {}) }
    delete copia[tipoId]
    updateFormData({ fotosVeiculoEntrada: copia })
  }

  const totalFotos = FOTOS_VEICULO_TIPOS.length
  const fotosPreenchidas = FOTOS_VEICULO_TIPOS.filter((t) => fotosVeiculoEntrada?.[t.id]).length

  return (
    <>
      {/* FOTOS DO VEICULO NA ENTRADA */}
      <SecaoForm
        icone={Camera}
        titulo="Fotos do Veiculo na Entrada"
        acessorio={
          <span className="text-[10px] font-bold text-[#475467]">
            {fotosPreenchidas}/{totalFotos} fotos
          </span>
        }
      >
        <div className="grid grid-cols-3 @sm:grid-cols-4 @md:grid-cols-7 gap-2">
          {FOTOS_VEICULO_TIPOS.map((tipo) => {
            const foto = fotosVeiculoEntrada?.[tipo.id]
            return (
              <div key={tipo.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => !foto && inputRefsFoto.current[tipo.id]?.click()}
                  className={`relative w-full aspect-square rounded-xl border overflow-hidden flex flex-col items-center justify-center gap-1 transition-all ${
                    foto
                      ? 'border-[#0284c7] cursor-default'
                      : 'border-dashed border-[#d0d5dd] bg-[#f8fafc] hover:border-[#0284c7] hover:bg-[#f0f9ff] cursor-pointer'
                  }`}
                >
                  {foto ? (
                    <img src={foto} alt={tipo.label} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera size={16} weight="bold" className="text-[#98a2b3]" />
                      <span className="text-[8px] font-bold text-[#98a2b3]">Tirar Foto</span>
                    </>
                  )}
                  {foto && (
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoverFoto(tipo.id)
                      }}
                      title="Remover foto"
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                    >
                      <Trash size={11} weight="bold" />
                    </span>
                  )}
                </button>
                <p className="text-[9px] font-bold text-[#475467] text-center truncate">{tipo.label}</p>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={(el) => (inputRefsFoto.current[tipo.id] = el)}
                  onChange={(e) => handleSelecionarFoto(tipo.id, e)}
                  className="hidden"
                />
              </div>
            )
          })}
        </div>
      </SecaoForm>

      <SecaoForm
        icone={ShieldCheck}
        titulo="Vistoria de Entrada"
        acessorio={
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#475467]">
            {preenchidosCount}/{totalItens}
            {naoConformesCount > 0 && (
              <span className="text-amber-700"> • {naoConformesCount} nao conforme</span>
            )}
          </span>
          <button
            type="button"
            onClick={handleMarcarTodosConformes}
            title="Marcar todos os itens como Conforme"
            className="h-7 px-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-all active:scale-95"
          >
            <Sparkle size={11} weight="fill" />
            <span>Tudo OK</span>
          </button>
          <button
            type="button"
            onClick={handleLimparChecklist}
            className="h-7 px-2 rounded-lg bg-white text-[#475467] hover:text-rose-600 border border-[#d0d5dd] text-[10px] font-semibold cursor-pointer"
          >
            Limpar
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-1.5">
        {ITENS_CHECKLIST_ENTRADA.map((item) => {
          const itemState = checklistEntrada[item.id] || { status: '', obs: '' }
          const isConforme = itemState.status === 'conforme'
          const isNaoConforme = itemState.status === 'nao_conforme'
          const isIsento = itemState.status === 'isento'

          return (
            <div
              key={item.id}
              className={`p-1.5 rounded-lg border transition-all ${
                isConforme
                  ? 'bg-[#f0f9ff]/60 border-[#bae6fd]'
                  : isNaoConforme
                  ? 'bg-rose-50/60 border-rose-200'
                  : isIsento
                  ? 'bg-[#f8fafc] border-[#e4e7ec]'
                  : 'bg-white border-[#e4e7ec] hover:border-[#d0d5dd]'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <p className="text-[10.5px] font-bold text-[#101828] truncate" title={item.desc}>
                  {item.label}
                </p>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStatusItem(item.id, 'conforme')}
                    title="Conforme"
                    className={`h-5.5 px-1.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                      isConforme ? 'bg-[#0284c7] text-white' : 'bg-white text-[#475467] border border-[#d0d5dd] hover:bg-[#f0f9ff]'
                    }`}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusItem(item.id, 'nao_conforme')}
                    title="Nao Conforme"
                    className={`h-5.5 px-1.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                      isNaoConforme ? 'bg-rose-600 text-white' : 'bg-white text-[#475467] border border-[#d0d5dd] hover:bg-rose-50'
                    }`}
                  >
                    Nao
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusItem(item.id, 'isento')}
                    title="Nao se Aplica"
                    className={`h-5.5 px-1 rounded text-[9px] font-bold transition-all cursor-pointer ${
                      isIsento ? 'bg-[#101828] text-white' : 'bg-white text-[#667085] border border-[#d0d5dd] hover:bg-[#f2f4f7]'
                    }`}
                  >
                    N/A
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={itemState.obs || ''}
                onChange={(e) => handleObsItem(item.id, e.target.value)}
                placeholder="Observacao (opcional)..."
                className={`mt-1 w-full h-6 px-1.5 text-[9.5px] rounded border bg-white focus:outline-none focus:ring-1 font-medium ${
                  isNaoConforme
                    ? 'border-rose-300 text-rose-900 focus:ring-rose-500'
                    : 'border-[#e4e7ec] text-[#344054] focus:ring-[#0284c7] focus:border-[#0284c7]'
                }`}
              />
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-1.5 text-[9.5px] text-[#667085]">
        <Info size={12} weight="bold" className="text-[#0284c7] shrink-0" />
        <span>O Checklist de Saida acontece na entrega do veiculo, antes do faturamento no PDV.</span>
      </div>

      {onEnviarAssinatura && (
        <button
          type="button"
          onClick={onEnviarAssinatura}
          title="Salva a OS e envia o link do checklist pelo WhatsApp para o cliente assinar digitalmente"
          className="w-full h-10 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <PaperPlaneTilt size={15} weight="bold" />
          <span>Enviar Checklist para o Cliente Assinar</span>
        </button>
      )}
    </SecaoForm>
    </>
  )
}
