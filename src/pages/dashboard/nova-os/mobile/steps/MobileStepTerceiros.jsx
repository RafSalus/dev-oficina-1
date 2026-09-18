import React, { useMemo, useState } from 'react'
import CreatableSelect from 'react-select/creatable'
import Select from 'react-select'
import { Handshake, Trash, WhatsappLogo, Storefront, CheckSquare, Square } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  PARCEIROS_TERCEIROS,
  CATEGORIAS_TERCEIROS_OPCOES,
  PRAZO_TERCEIRO_OPCOES,
  CATALOGO_SERVICOS_TERCEIROS,
} from '../../../../../constants/catalogoTerceiros'
import { MobileStepFooter } from '../MobileStepFooter'
import { mobileSelectStyles, inputBaseClass, labelBaseClass } from '../mobileSelectStyles'

const FORM_DEFAULT = {
  categoria: 'Retífica de Motor e Cabeçote',
  status: 'aguardando_envio',
  parceiroId: 'parc-1',
  parceiroNome: 'Retífica Bandeirantes',
  custo: '0.00',
  valorVenda: '0.00',
  desconto: '0.00',
  prazoEstimado: '1 dia útil (24 horas)',
  garantia: '6 meses',
  observacoes: '',
}

const opcoesCatalogo = CATALOGO_SERVICOS_TERCEIROS.map((item) => ({
  value: item.nome,
  label: item.nome,
  dados: item,
}))

export function MobileStepTerceiros({ formData, updateFormData, onContinue }) {
  const { terceirosOS = [], cliente, placa, marcaModelo, ano, km } = formData
  const [servicoOpcao, setServicoOpcao] = useState(null)
  const [form, setForm] = useState(FORM_DEFAULT)
  const [cotacaoAberta, setCotacaoAberta] = useState(false)
  const [itensSelecionados, setItensSelecionados] = useState([])
  const [cotacaoAtivaId, setCotacaoAtivaId] = useState(null)

  const metricas = useMemo(() => {
    let totalVendaBruto = 0
    let totalDescontos = 0
    terceirosOS.forEach((item) => {
      totalVendaBruto += parseFloat(item.valorVenda) || 0
      totalDescontos += parseFloat(item.desconto) || 0
    })
    const totalLiquido = Math.max(0, totalVendaBruto - totalDescontos)
    return { totalLiquido: totalLiquido.toFixed(2) }
  }, [terceirosOS])

  const terceirosParaCotacao = terceirosOS.filter((t) => t.status === 'para_cotacao' || t.status === 'aguardando_envio')

  const handleSelecionarServico = (opt) => {
    setServicoOpcao(opt)
    const dados = opt?.dados
    const nome = opt?.value || opt?.label || ''
    if (dados) {
      setForm((prev) => ({
        ...prev,
        categoria: dados.categoria || prev.categoria,
        parceiroId: dados.parceiroPadraoId || prev.parceiroId,
        parceiroNome: dados.parceiroPadraoNome || prev.parceiroNome,
        custo: dados.custoPadrao ? dados.custoPadrao.toFixed(2) : prev.custo,
        valorVenda: dados.valorVendaPadrao ? dados.valorVendaPadrao.toFixed(2) : prev.valorVenda,
        prazoEstimado: dados.prazoPadrao || prev.prazoEstimado,
        garantia: dados.garantiaPadrao || prev.garantia,
        codigo: dados.codigo,
      }))
    }
    setForm((prev) => ({ ...prev, nome }))
  }

  const handleAdicionar = () => {
    const nome = servicoOpcao?.value || servicoOpcao?.label || form.nome
    if (!nome?.trim()) {
      toast.warning('Informe a descrição do serviço terceirizado.')
      return
    }
    const parceiro = PARCEIROS_TERCEIROS.find((p) => p.id === form.parceiroId)
    const item = {
      id: `terc-${Date.now()}`,
      codigo: form.codigo || `TER-${String(terceirosOS.length + 1).padStart(3, '0')}`,
      nome: nome.trim(),
      categoria: form.categoria,
      status: form.status,
      parceiroId: form.parceiroId,
      parceiroNome: parceiro?.nome || form.parceiroNome,
      custo: parseFloat(form.custo || 0).toFixed(2),
      valorVenda: parseFloat(form.valorVenda || 0).toFixed(2),
      desconto: parseFloat(form.desconto || 0).toFixed(2),
      prazoEstimado: form.prazoEstimado,
      garantia: form.garantia,
      observacoes: form.observacoes.trim(),
    }
    updateFormData({ terceirosOS: [...terceirosOS, item] })
    toast.success('Serviço de terceiro adicionado à Ordem de Serviço!')
    setServicoOpcao(null)
    setForm(FORM_DEFAULT)
  }

  const handleRemover = (id) => {
    updateFormData({ terceirosOS: terceirosOS.filter((t) => t.id !== id) })
  }

  const handleAbrirCotacao = () => {
    if (!terceirosParaCotacao.length) {
      toast.info('Nenhum serviço pendente de cotação externa.')
      return
    }
    setItensSelecionados(terceirosParaCotacao.map((t) => t.id))
    setCotacaoAtivaId(`COTT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`)
    setCotacaoAberta(true)
  }

  const toggleItemCotacao = (id) => {
    setItensSelecionados((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const urlCotacaoPublica = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dev-oficina.com'
    return `${origin}/cotacao/${cotacaoAtivaId || 'COTT-DEMO'}`
  }, [cotacaoAtivaId])

  const handleEnviarWhatsapp = (parceiro) => {
    if (!itensSelecionados.length) {
      toast.warning('Selecione ao menos um serviço para incluir na cotação.')
      return
    }
    const itens = terceirosOS.filter((t) => itensSelecionados.includes(t.id))
    const registro = {
      id: cotacaoAtivaId,
      dataCriacao: new Date().toISOString(),
      status: 'aguardando_resposta',
      cliente,
      placa: placa || '',
      marcaModelo: marcaModelo || 'Veículo em Atendimento',
      ano,
      km,
      itens: itens.map((item) => ({ id: item.id, codigo: item.codigo, nome: item.nome, categoria: item.categoria })),
      parceiros: [parceiro],
      respostas: {},
    }
    try {
      const raw = localStorage.getItem('dev_oficina_cotacoes_terceiros')
      const historico = raw ? JSON.parse(raw) : {}
      historico[cotacaoAtivaId] = registro
      localStorage.setItem('dev_oficina_cotacoes_terceiros', JSON.stringify(historico))
    } catch (e) {}
    updateFormData({ cotacoesTerceirosEnviadas: [...(formData.cotacoesTerceirosEnviadas || []), registro] })

    const veiculoTexto = placa ? `${placa} (${marcaModelo || 'Veículo'})` : marcaModelo || 'Veículo'
    const textoMsg = `Olá, equipe da *${parceiro.nome}*! 👋%0A%0AAqui é da *Mecânica Gabriel*. Solicitamos orçamento para o veículo:%0A🚗 *Veículo:* ${veiculoTexto}%0A📅 *Ano:* ${ano || 'Não informado'} | *KM:* ${km || 'Não informado'}%0A%0A🔧 *Serviços Solicitados:*%0A${itens
      .map((item, i) => `${i + 1}. *${item.nome}*`)
      .join('%0A')}%0A%0A🔗 Detalhes: ${urlCotacaoPublica}`
    const zapUrl = `https://wa.me/55${parceiro.whatsapp.replace(/\D/g, '')}?text=${textoMsg}`
    toast.info(`Abrindo WhatsApp para ${parceiro.nome}...`)
    window.open(zapUrl, '_blank')
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 text-center">
          <p className="text-[10px] font-bold text-[#667085] uppercase">Itens</p>
          <p className="text-sm font-extrabold text-[#101828]">{terceirosOS.length}</p>
        </div>
        <div className="bg-[#101828] rounded-xl p-2.5 text-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase">Total Líquido</p>
          <p className="text-sm font-extrabold text-white">R$ {metricas.totalLiquido}</p>
        </div>
      </div>

      {terceirosParaCotacao.length > 0 && (
        <button
          type="button"
          onClick={handleAbrirCotacao}
          className="w-full mb-3 h-11 rounded-xl bg-[#e0f2fe] text-[#0369a1] text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <Storefront size={15} weight="bold" />
          Solicitar Orçamento ({terceirosParaCotacao.length} serviço(s) pendente(s))
        </button>
      )}

      {cotacaoAberta && (
        <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3">
          <h3 className="text-xs font-extrabold text-[#101828] mb-2.5">Serviços na Solicitação</h3>
          <div className="space-y-1.5 mb-3">
            {terceirosParaCotacao.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleItemCotacao(t.id)}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-[#f8fafc] border border-[#d0d5dd] text-left"
              >
                {itensSelecionados.includes(t.id) ? (
                  <CheckSquare size={18} weight="fill" className="text-[#0284c7] shrink-0" />
                ) : (
                  <Square size={18} className="text-[#98a2b3] shrink-0" />
                )}
                <span className="text-xs font-semibold text-[#101828] truncate">{t.nome}</span>
              </button>
            ))}
          </div>

          <h3 className="text-xs font-extrabold text-[#101828] mb-2.5">Enviar Solicitação Para</h3>
          <div className="space-y-2">
            {PARCEIROS_TERCEIROS.filter((p) => p.ativo).map((p) => (
              <div key={p.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#d0d5dd]">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#101828] truncate">{p.nome}</p>
                  <p className="text-[10px] text-[#667085] truncate">{p.especialidade}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEnviarWhatsapp(p)}
                  className="w-9 h-9 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0"
                >
                  <WhatsappLogo size={17} weight="fill" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {terceirosOS.length > 0 && (
        <div className="space-y-2 mb-3">
          {terceirosOS.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-[#d0d5dd] p-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#f2f4f7] flex items-center justify-center shrink-0">
                <Handshake size={16} className="text-[#101828]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#101828] truncate">{t.nome}</p>
                <p className="text-[10.5px] text-[#667085] truncate">
                  {t.parceiroNome} • R$ {t.valorVenda}
                </p>
              </div>
              <button type="button" onClick={() => handleRemover(t.id)} className="p-1.5 text-[#98a2b3] active:text-[#b42318] shrink-0">
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4">
        <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#f2f4f7]">
          <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0">
            <Handshake size={18} weight="bold" />
          </div>
          <h2 className="text-sm font-extrabold text-[#101828] leading-tight">Adicionar Serviço de Terceiro</h2>
        </div>

        <label className={labelBaseClass}>Serviço</label>
        <CreatableSelect
          value={servicoOpcao}
          onChange={handleSelecionarServico}
          options={opcoesCatalogo}
          placeholder="Buscar ou digitar serviço..."
          styles={mobileSelectStyles}
          formatCreateLabel={(v) => `Usar "${v}"`}
        />

        <div className="mt-2.5">
          <label className={labelBaseClass}>Categoria</label>
          <Select
            value={CATEGORIAS_TERCEIROS_OPCOES.find((c) => c.value === form.categoria) || null}
            onChange={(opt) => setForm((p) => ({ ...p, categoria: opt?.value || p.categoria }))}
            options={CATEGORIAS_TERCEIROS_OPCOES}
            styles={mobileSelectStyles}
          />
        </div>

        <div className="mt-2.5">
          <label className={labelBaseClass}>Parceiro Terceirizado</label>
          <Select
            value={PARCEIROS_TERCEIROS.find((p) => p.id === form.parceiroId) ? { value: form.parceiroId, label: form.parceiroNome } : null}
            onChange={(opt) => {
              const p = PARCEIROS_TERCEIROS.find((pp) => pp.id === opt?.value)
              setForm((prev) => ({ ...prev, parceiroId: opt?.value || '', parceiroNome: p?.nome || '' }))
            }}
            options={PARCEIROS_TERCEIROS.map((p) => ({ value: p.id, label: p.nome }))}
            styles={mobileSelectStyles}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <div>
            <label className={labelBaseClass}>Custo R$</label>
            <input type="text" value={form.custo} onChange={(e) => setForm((p) => ({ ...p, custo: e.target.value }))} className={inputBaseClass} />
          </div>
          <div>
            <label className={labelBaseClass}>Venda R$</label>
            <input type="text" value={form.valorVenda} onChange={(e) => setForm((p) => ({ ...p, valorVenda: e.target.value }))} className={inputBaseClass} />
          </div>
        </div>

        <div className="mt-2.5">
          <label className={labelBaseClass}>Prazo Estimado</label>
          <Select
            value={PRAZO_TERCEIRO_OPCOES.find((o) => o.value === form.prazoEstimado) || null}
            onChange={(opt) => setForm((p) => ({ ...p, prazoEstimado: opt?.value || p.prazoEstimado }))}
            options={PRAZO_TERCEIRO_OPCOES}
            styles={mobileSelectStyles}
          />
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
