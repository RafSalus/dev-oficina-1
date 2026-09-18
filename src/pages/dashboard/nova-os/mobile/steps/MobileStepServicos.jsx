import React, { useMemo, useState } from 'react'
import CreatableSelect from 'react-select/creatable'
import Select from 'react-select'
import { Wrench, Trash, ArrowsClockwise, CurrencyDollar } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { MOCK_MECANICOS } from '../../../../../constants/mecanicos'
import { CATALOGO_SERVICOS_TABELA, SUGESTOES_SERVICOS } from '../../../../../constants/catalogoPecasServicos'
import { MobileStepFooter } from '../MobileStepFooter'
import { mobileSelectStyles, inputBaseClass, labelBaseClass } from '../mobileSelectStyles'

const FORM_DEFAULT = {
  nome: '',
  mecanicoId: '',
  mecanicoNome: '',
  tempoEstimado: '1.0',
  valorUnitario: '150.00',
  quantidade: '1',
  desconto: '0.00',
  observacoes: '',
}

export function MobileStepServicos({ formData, updateFormData, onContinue }) {
  const { servicosOS = [], servicosDiagnostico = [] } = formData
  const [servicoOpcao, setServicoOpcao] = useState(null)
  const [form, setForm] = useState(FORM_DEFAULT)

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
    return { totalHoras: totalHoras.toFixed(1), subtotalBruto: subtotalBruto.toFixed(2), totalLiquido: totalLiquido.toFixed(2) }
  }, [servicosOS])

  const servicosDiagnosticoDisponiveis = servicosDiagnostico.filter(
    (sd) => !servicosOS.some((so) => so.nome?.trim().toLowerCase() === sd.nome?.trim().toLowerCase())
  )

  const handleSelecionarServico = (opt) => {
    setServicoOpcao(opt)
    const nome = opt?.value || opt?.label || ''
    const itemCatalogo = CATALOGO_SERVICOS_TABELA.find((c) => c.nome.toLowerCase() === nome.toLowerCase())
    if (itemCatalogo) {
      setForm((prev) => ({
        ...prev,
        nome,
        tempoEstimado: itemCatalogo.tempoEstimado || prev.tempoEstimado,
        valorUnitario: itemCatalogo.precoPadrao ? itemCatalogo.precoPadrao.toFixed(2) : prev.valorUnitario,
      }))
    } else {
      setForm((prev) => ({ ...prev, nome }))
    }
  }

  const handleAdicionar = () => {
    if (!form.nome.trim()) {
      toast.warning('Selecione ou digite o nome do serviço.')
      return
    }
    const item = {
      id: `srv-${Date.now()}`,
      codigo: `SRV-${String(servicosOS.length + 1).padStart(3, '0')}`,
      nome: form.nome.trim(),
      categoria: 'Mecânica Geral',
      mecanicoId: form.mecanicoId,
      mecanicoNome: form.mecanicoNome || 'A definir',
      tempoEstimado: form.tempoEstimado || '1.0',
      valorUnitario: parseFloat(form.valorUnitario || 0).toFixed(2),
      quantidade: form.quantidade || '1',
      desconto: parseFloat(form.desconto || 0).toFixed(2),
      observacoes: form.observacoes.trim(),
    }
    updateFormData({ servicosOS: [...servicosOS, item] })
    toast.success('Serviço adicionado à Ordem de Serviço!')
    setServicoOpcao(null)
    setForm(FORM_DEFAULT)
  }

  const handleImportarDiagnostico = () => {
    if (!servicosDiagnosticoDisponiveis.length) {
      toast.info('Nenhum serviço novo para importar do diagnóstico.')
      return
    }
    const novos = servicosDiagnosticoDisponiveis.map((sd, idx) => ({
      id: `srv-imp-${Date.now()}-${idx}`,
      codigo: `SRV-${String(servicosOS.length + idx + 1).padStart(3, '0')}`,
      nome: sd.nome,
      categoria: 'Mecânica Geral',
      mecanicoId: '',
      mecanicoNome: 'A definir',
      tempoEstimado: '1.0',
      valorUnitario: '150.00',
      quantidade: '1',
      desconto: '0.00',
      observacoes: sd.observacao || 'Serviço sugerido na triagem e diagnóstico',
      origem: 'diagnostico',
    }))
    updateFormData({ servicosOS: [...servicosOS, ...novos] })
    toast.success(`${novos.length} serviço(s) importado(s) do diagnóstico!`)
  }

  const handleRemover = (id) => {
    updateFormData({ servicosOS: servicosOS.filter((s) => s.id !== id) })
  }

  return (
    <div>
      {/* Métricas */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 text-center">
          <p className="text-[10px] font-bold text-[#667085] uppercase">Itens</p>
          <p className="text-sm font-extrabold text-[#101828]">{servicosOS.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 text-center">
          <p className="text-[10px] font-bold text-[#667085] uppercase">Horas</p>
          <p className="text-sm font-extrabold text-[#101828]">{metricas.totalHoras}h</p>
        </div>
        <div className="bg-[#101828] rounded-xl p-2.5 text-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase">Total</p>
          <p className="text-sm font-extrabold text-white">R$ {metricas.totalLiquido}</p>
        </div>
      </div>

      {servicosDiagnosticoDisponiveis.length > 0 && (
        <button
          type="button"
          onClick={handleImportarDiagnostico}
          className="w-full mb-3 h-11 rounded-xl bg-[#e0f2fe] text-[#0369a1] text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <ArrowsClockwise size={15} weight="bold" />
          Importar {servicosDiagnosticoDisponiveis.length} serviço(s) do diagnóstico
        </button>
      )}

      {/* Lista de serviços adicionados */}
      {servicosOS.length > 0 && (
        <div className="space-y-2 mb-3">
          {servicosOS.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-[#d0d5dd] p-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#f2f4f7] flex items-center justify-center shrink-0">
                <Wrench size={16} className="text-[#101828]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#101828] truncate">{s.nome}</p>
                <p className="text-[10.5px] text-[#667085]">
                  {s.mecanicoNome} • {s.tempoEstimado}h • R$ {s.valorUnitario}
                </p>
              </div>
              <button type="button" onClick={() => handleRemover(s.id)} className="p-1.5 text-[#98a2b3] active:text-[#b42318] shrink-0">
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulário de novo serviço */}
      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4">
        <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#f2f4f7]">
          <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0">
            <CurrencyDollar size={18} weight="bold" />
          </div>
          <h2 className="text-sm font-extrabold text-[#101828] leading-tight">Adicionar Serviço</h2>
        </div>

        <label className={labelBaseClass}>Serviço</label>
        <CreatableSelect
          value={servicoOpcao}
          onChange={handleSelecionarServico}
          options={SUGESTOES_SERVICOS}
          placeholder="Buscar ou digitar serviço..."
          styles={mobileSelectStyles}
          formatCreateLabel={(v) => `Usar "${v}"`}
        />

        <div className="mt-2.5">
          <label className={labelBaseClass}>Mecânico</label>
          <Select
            value={MOCK_MECANICOS.find((m) => m.value === form.mecanicoId) || null}
            onChange={(opt) => setForm((prev) => ({ ...prev, mecanicoId: opt?.value || '', mecanicoNome: opt?.nome || '' }))}
            options={MOCK_MECANICOS}
            placeholder="Selecionar mecânico..."
            styles={mobileSelectStyles}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2.5">
          <div>
            <label className={labelBaseClass}>Horas</label>
            <input type="text" value={form.tempoEstimado} onChange={(e) => setForm((p) => ({ ...p, tempoEstimado: e.target.value }))} className={inputBaseClass} />
          </div>
          <div>
            <label className={labelBaseClass}>Qtd</label>
            <input type="text" value={form.quantidade} onChange={(e) => setForm((p) => ({ ...p, quantidade: e.target.value }))} className={inputBaseClass} />
          </div>
          <div>
            <label className={labelBaseClass}>Valor R$</label>
            <input type="text" value={form.valorUnitario} onChange={(e) => setForm((p) => ({ ...p, valorUnitario: e.target.value }))} className={inputBaseClass} />
          </div>
        </div>

        <div className="mt-2.5">
          <label className={labelBaseClass}>Desconto R$</label>
          <input type="text" value={form.desconto} onChange={(e) => setForm((p) => ({ ...p, desconto: e.target.value }))} className={inputBaseClass} />
        </div>

        <div className="mt-2.5">
          <label className={labelBaseClass}>Observações</label>
          <input type="text" value={form.observacoes} onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))} placeholder="Opcional" className={inputBaseClass} />
        </div>

        <button
          type="button"
          onClick={handleAdicionar}
          className="w-full h-11 mt-3 rounded-xl bg-black text-white text-xs font-bold"
        >
          Adicionar à Ordem de Serviço
        </button>
      </div>

      <MobileStepFooter onContinue={onContinue} />
    </div>
  )
}
