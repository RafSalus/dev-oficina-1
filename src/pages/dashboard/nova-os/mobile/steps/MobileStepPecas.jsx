import React, { useMemo, useState } from 'react'
import CreatableSelect from 'react-select/creatable'
import Select from 'react-select'
import { Package, Trash, WhatsappLogo, Storefront, CheckSquare, Square, ArrowsClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  AUTO_PECAS_FORNECEDORES,
  CATEGORIAS_PECAS_OPCOES,
  CATALOGO_PECAS_ESTOQUE,
} from '../../../../../constants/catalogoPecasEstoque'
import { MobileStepFooter } from '../MobileStepFooter'
import { mobileSelectStyles, inputBaseClass, labelBaseClass } from '../mobileSelectStyles'

const FORM_DEFAULT = {
  categoria: 'Outros Componentes',
  statusEstoque: 'para_cotacao',
  fornecedorNome: 'Cotação Externa',
  marcaSugerida: '',
  precoUnitario: '0.00',
  quantidade: '1',
  desconto: '0.00',
  observacoes: '',
}

const opcoesCatalogo = CATALOGO_PECAS_ESTOQUE.map((item) => ({
  value: item.nome,
  label: `${item.nome} ${item.estoqueAtual > 0 ? '(Em estoque)' : '(Sem estoque)'}`,
  dados: item,
}))

export function MobileStepPecas({ formData, updateFormData, onContinue }) {
  const { pecasOS = [], pecasDiagnostico = [], cliente, placa, marcaModelo, ano, km, mecanicoNome } = formData
  const [pecaOpcao, setPecaOpcao] = useState(null)
  const [form, setForm] = useState(FORM_DEFAULT)
  const [cotacaoAberta, setCotacaoAberta] = useState(false)
  const [itensSelecionados, setItensSelecionados] = useState([])
  const [cotacaoAtivaId, setCotacaoAtivaId] = useState(null)

  const metricas = useMemo(() => {
    let subtotalBruto = 0
    let totalDescontos = 0
    pecasOS.forEach((item) => {
      const valorUnit = parseFloat(item.precoUnitario) || 0
      const qtd = parseFloat(item.quantidade) || 1
      const desc = parseFloat(item.desconto) || 0
      subtotalBruto += valorUnit * qtd
      totalDescontos += desc
    })
    const totalLiquido = Math.max(0, subtotalBruto - totalDescontos)
    return { subtotalBruto: subtotalBruto.toFixed(2), totalLiquido: totalLiquido.toFixed(2) }
  }, [pecasOS])

  const pecasParaCotacao = pecasOS.filter((p) => p.statusEstoque !== 'em_estoque')

  const pecasDiagnosticoDisponiveis = pecasDiagnostico.filter(
    (pd) => !pecasOS.some((po) => po.nome?.trim().toLowerCase() === pd.nome?.trim().toLowerCase())
  )

  const handleImportarDiagnostico = () => {
    if (!pecasDiagnosticoDisponiveis.length) {
      toast.info('Nenhuma peça nova para importar do diagnóstico.')
      return
    }
    const novas = pecasDiagnosticoDisponiveis.map((pd, idx) => ({
      id: `peca-imp-${Date.now()}-${idx}`,
      codigo: `PEC-${String(pecasOS.length + idx + 1).padStart(3, '0')}`,
      nome: pd.nome,
      categoria: 'Outros Componentes',
      statusEstoque: 'para_cotacao',
      fornecedorNome: 'Cotação Externa',
      marcaSugerida: '',
      precoUnitario: '0.00',
      quantidade: pd.quantidade || '1',
      desconto: '0.00',
      observacoes: pd.observacao || 'Peça identificada no diagnóstico',
      origem: 'diagnostico',
    }))
    updateFormData({ pecasOS: [...pecasOS, ...novas] })
    toast.success(`${novas.length} peça(s) importada(s) do diagnóstico!`)
  }

  const handleSelecionarPeca = (opt) => {
    setPecaOpcao(opt)
    const dados = opt?.dados
    const nome = opt?.value || opt?.label || ''
    if (dados) {
      setForm((prev) => ({
        ...prev,
        categoria: dados.categoria || prev.categoria,
        statusEstoque: dados.estoqueAtual > 0 ? 'em_estoque' : 'para_cotacao',
        fornecedorNome: dados.fornecedorNome || prev.fornecedorNome,
        marcaSugerida: dados.marcaSugerida || prev.marcaSugerida,
        precoUnitario: dados.precoUnitario ? dados.precoUnitario.toFixed(2) : prev.precoUnitario,
        codigo: dados.codigo,
      }))
    }
    setForm((prev) => ({ ...prev, nome }))
  }

  const handleAdicionar = () => {
    const nome = pecaOpcao?.value || pecaOpcao?.label || form.nome
    if (!nome?.trim()) {
      toast.warning('Selecione ou digite o nome da peça.')
      return
    }
    const item = {
      id: `peca-os-${Date.now()}`,
      codigo: form.codigo || `PEC-${String(pecasOS.length + 1).padStart(3, '0')}`,
      nome: nome.trim(),
      categoria: form.categoria,
      statusEstoque: form.statusEstoque,
      fornecedorNome: form.fornecedorNome,
      marcaSugerida: form.marcaSugerida,
      precoUnitario: parseFloat(form.precoUnitario || 0).toFixed(2),
      quantidade: form.quantidade || '1',
      desconto: parseFloat(form.desconto || 0).toFixed(2),
      observacoes: form.observacoes.trim(),
    }
    updateFormData({ pecasOS: [...pecasOS, item] })
    toast.success('Peça adicionada à Ordem de Serviço!')
    setPecaOpcao(null)
    setForm(FORM_DEFAULT)
  }

  const handleRemover = (id) => {
    updateFormData({ pecasOS: pecasOS.filter((p) => p.id !== id) })
  }

  const handleAbrirCotacao = () => {
    if (!pecasParaCotacao.length) {
      toast.info('Nenhuma peça pendente de cotação externa.')
      return
    }
    setItensSelecionados(pecasParaCotacao.map((p) => p.id))
    setCotacaoAtivaId(`COT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`)
    setCotacaoAberta(true)
  }

  const toggleItemCotacao = (id) => {
    setItensSelecionados((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const urlCotacaoPublica = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dev-oficina.com'
    return `${origin}/cotacao/${cotacaoAtivaId || 'COT-DEMO'}`
  }, [cotacaoAtivaId])

  const salvarCotacaoNoStorage = (fornecedoresAlvo) => {
    const itens = pecasOS.filter((p) => itensSelecionados.includes(p.id))
    const registro = {
      id: cotacaoAtivaId,
      dataCriacao: new Date().toISOString(),
      status: 'aguardando_resposta',
      cliente,
      placa: placa || '',
      marcaModelo: marcaModelo || 'Veículo em Atendimento',
      ano,
      km,
      mecanicoNome: mecanicoNome || 'Oficina Mecânica',
      itens: itens.map((item) => ({
        id: item.id,
        codigo: item.codigo,
        nome: item.nome,
        categoria: item.categoria,
        quantidade: item.quantidade,
        marcaSugerida: item.marcaSugerida,
        observacoes: item.observacoes,
      })),
      fornecedores: fornecedoresAlvo,
      respostas: {},
    }
    try {
      const raw = localStorage.getItem('dev_oficina_cotacoes')
      const historico = raw ? JSON.parse(raw) : {}
      historico[cotacaoAtivaId] = registro
      localStorage.setItem('dev_oficina_cotacoes', JSON.stringify(historico))
    } catch (e) {}
    updateFormData({ cotacoesEnviadas: [...(formData.cotacoesEnviadas || []), registro] })
  }

  const handleEnviarWhatsapp = (fornecedor) => {
    if (!itensSelecionados.length) {
      toast.warning('Selecione ao menos uma peça para incluir na cotação.')
      return
    }
    salvarCotacaoNoStorage([fornecedor])
    const itens = pecasOS.filter((p) => itensSelecionados.includes(p.id))
    const veiculoTexto = placa ? `${placa} (${marcaModelo || 'Veículo'})` : marcaModelo || 'Veículo'
    const textoMsg = `Olá, equipe da *${fornecedor.nome}*! 👋%0A%0AAqui é da *Mecânica Gabriel*. Solicitamos cotação para o veículo:%0A🚗 *Veículo:* ${veiculoTexto}%0A📅 *Ano:* ${ano || 'Não informado'} | *KM:* ${km || 'Não informado'}%0A%0A📦 *Peças Solicitadas:*%0A${itens
      .map((item, i) => `${i + 1}. *${item.nome}* - Qtd: ${item.quantidade}`)
      .join('%0A')}%0A%0A📸 *Acesse o link abaixo para ver detalhes e enviar o preço:*%0A🔗 ${urlCotacaoPublica}`
    const zapUrl = `https://wa.me/55${fornecedor.whatsapp.replace(/\D/g, '')}?text=${textoMsg}`
    toast.info(`Abrindo WhatsApp para ${fornecedor.nome}...`)
    window.open(zapUrl, '_blank')
  }

  return (
    <div>
      {/* Métricas */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 text-center">
          <p className="text-[10px] font-bold text-[#667085] uppercase">Itens</p>
          <p className="text-sm font-extrabold text-[#101828]">{pecasOS.length}</p>
        </div>
        <div className="bg-[#101828] rounded-xl p-2.5 text-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase">Total Líquido</p>
          <p className="text-sm font-extrabold text-white">R$ {metricas.totalLiquido}</p>
        </div>
      </div>

      {pecasDiagnosticoDisponiveis.length > 0 && (
        <button
          type="button"
          onClick={handleImportarDiagnostico}
          className="w-full mb-3 h-11 rounded-xl bg-[#e0f2fe] text-[#0369a1] text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <ArrowsClockwise size={15} weight="bold" />
          Importar {pecasDiagnosticoDisponiveis.length} peça(s) do diagnóstico
        </button>
      )}

      {pecasParaCotacao.length > 0 && (
        <button
          type="button"
          onClick={handleAbrirCotacao}
          className="w-full mb-3 h-11 rounded-xl bg-white border border-[#d0d5dd] text-[#344054] text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <Storefront size={15} weight="bold" />
          Solicitar Cotação ({pecasParaCotacao.length} peça(s) pendente(s))
        </button>
      )}

      {cotacaoAberta && (
        <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3">
          <h3 className="text-xs font-extrabold text-[#101828] mb-2.5">Peças na Cotação</h3>
          <div className="space-y-1.5 mb-3">
            {pecasParaCotacao.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleItemCotacao(p.id)}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-[#f8fafc] border border-[#d0d5dd] text-left"
              >
                {itensSelecionados.includes(p.id) ? (
                  <CheckSquare size={18} weight="fill" className="text-[#0284c7] shrink-0" />
                ) : (
                  <Square size={18} className="text-[#98a2b3] shrink-0" />
                )}
                <span className="text-xs font-semibold text-[#101828] truncate">
                  {p.nome} (Qtd: {p.quantidade})
                </span>
              </button>
            ))}
          </div>

          <h3 className="text-xs font-extrabold text-[#101828] mb-2.5">Enviar Solicitação Para</h3>
          <div className="space-y-2">
            {AUTO_PECAS_FORNECEDORES.filter((f) => f.ativo).map((f) => (
              <div key={f.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#d0d5dd]">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#101828] truncate">{f.nome}</p>
                  <p className="text-[10px] text-[#667085] truncate">{f.especialidade}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEnviarWhatsapp(f)}
                  className="w-9 h-9 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0"
                >
                  <WhatsappLogo size={17} weight="fill" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {pecasOS.length > 0 && (
        <div className="space-y-2 mb-3">
          {pecasOS.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-[#d0d5dd] p-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#f2f4f7] flex items-center justify-center shrink-0">
                <Package size={16} className="text-[#101828]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#101828] truncate">{p.nome}</p>
                <p className="text-[10.5px] text-[#667085]">
                  Qtd {p.quantidade} • R$ {p.precoUnitario}{' '}
                  {p.statusEstoque === 'em_estoque' ? '• Em estoque' : '• Para cotação'}
                </p>
              </div>
              <button type="button" onClick={() => handleRemover(p.id)} className="p-1.5 text-[#98a2b3] active:text-[#b42318] shrink-0">
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4">
        <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#f2f4f7]">
          <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0">
            <Package size={18} weight="bold" />
          </div>
          <h2 className="text-sm font-extrabold text-[#101828] leading-tight">Adicionar Peça</h2>
        </div>

        <label className={labelBaseClass}>Peça</label>
        <CreatableSelect
          value={pecaOpcao}
          onChange={handleSelecionarPeca}
          options={opcoesCatalogo}
          placeholder="Buscar ou digitar peça..."
          styles={mobileSelectStyles}
          formatCreateLabel={(v) => `Usar "${v}"`}
        />

        <div className="mt-2.5">
          <label className={labelBaseClass}>Categoria</label>
          <Select
            value={CATEGORIAS_PECAS_OPCOES.find((c) => c.value === form.categoria) || null}
            onChange={(opt) => setForm((p) => ({ ...p, categoria: opt?.value || 'Outros Componentes' }))}
            options={CATEGORIAS_PECAS_OPCOES}
            styles={mobileSelectStyles}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2.5">
          <div>
            <label className={labelBaseClass}>Qtd</label>
            <input type="text" value={form.quantidade} onChange={(e) => setForm((p) => ({ ...p, quantidade: e.target.value }))} className={inputBaseClass} />
          </div>
          <div>
            <label className={labelBaseClass}>Valor R$</label>
            <input type="text" value={form.precoUnitario} onChange={(e) => setForm((p) => ({ ...p, precoUnitario: e.target.value }))} className={inputBaseClass} />
          </div>
          <div>
            <label className={labelBaseClass}>Desc. R$</label>
            <input type="text" value={form.desconto} onChange={(e) => setForm((p) => ({ ...p, desconto: e.target.value }))} className={inputBaseClass} />
          </div>
        </div>

        <div className="mt-2.5">
          <label className={labelBaseClass}>Observações</label>
          <input type="text" value={form.observacoes} onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))} placeholder="Opcional" className={inputBaseClass} />
        </div>

        <button type="button" onClick={handleAdicionar} className="w-full h-11 mt-3 rounded-xl bg-black text-white text-xs font-bold">
          Adicionar à Ordem de Serviço
        </button>
      </div>

      <MobileStepFooter onContinue={onContinue} />
    </div>
  )
}
