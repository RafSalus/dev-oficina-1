import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import { IMaskInput } from 'react-imask'
import { X, Package, ShieldCheck, TrendUp, CheckCircle, WarningCircle, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  CATEGORIAS_PECAS_OPCOES,
  UNIDADES_MEDIDA_OPCOES,
  CST_CSOSN_OPCOES,
  CFOP_OPCOES,
} from '../../../../constants/cadastrosSuprimentosData'
import { validarGTIN, validarNCM, validarCFOP } from '../../../../utils/fiscalValidators'
import {
  mobileSelectStyles,
  inputBaseClass,
  labelBaseClass,
} from '../../nova-os/mobile/mobileSelectStyles'

const FORM_INICIAL = {
  codigo: '',
  nome: '',
  categoria: 'Lubrificantes e Filtros',
  codigoFabricante: '',
  gtin: 'SEM GTIN',
  ncm: '',
  cfop: '5102',
  cstCsosn: '500',
  unidade: 'UN',
  precoCusto: '',
  precoVenda: '',
  estoqueMinimo: 5,
  estoqueAtual: 0,
  localizacao: '',
  ativo: true,
}

export function MobilePecaFormModal({ isOpen, onClose, onSalvar, onExcluir, pecaParaEditar }) {
  const [formData, setFormData] = useState(FORM_INICIAL)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setConfirmandoExclusao(false)
    if (pecaParaEditar) {
      setFormData({
        ...pecaParaEditar,
        categoria: pecaParaEditar.categoria || 'Outros Componentes',
        precoCusto: pecaParaEditar.precoCusto ?? '',
        precoVenda: pecaParaEditar.precoVenda ?? '',
        estoqueMinimo: pecaParaEditar.estoqueMinimo ?? 5,
        estoqueAtual: pecaParaEditar.estoqueAtual ?? 0,
      })
    } else {
      setFormData({ ...FORM_INICIAL, codigo: `PEC-${String(Math.floor(1000 + Math.random() * 9000))}` })
    }
  }, [pecaParaEditar, isOpen])

  const handleChange = (campo, valor) => setFormData((prev) => ({ ...prev, [campo]: valor }))

  const margemLucro = useMemo(() => {
    const custo = Number(formData.precoCusto) || 0
    const venda = Number(formData.precoVenda) || 0
    if (custo <= 0 || venda <= 0) return 0
    return Number((((venda - custo) / custo) * 100).toFixed(2))
  }, [formData.precoCusto, formData.precoVenda])

  const gtinValido = useMemo(() => !!formData.gtin?.trim() && validarGTIN(formData.gtin), [formData.gtin])
  const estoqueBaixo = Number(formData.estoqueAtual) <= Number(formData.estoqueMinimo)

  if (!isOpen) return null

  const handleSalvar = () => {
    if (!formData.codigo?.trim()) return toast.warning('O código SKU da peça é obrigatório.')
    if (!formData.nome?.trim()) return toast.warning('O nome da peça é obrigatório.')
    if (!formData.unidade) return toast.warning('Selecione a unidade de medida do item.')
    if (!formData.gtin?.trim()) return toast.warning('Informe o GTIN/EAN ou utilize "SEM GTIN".')
    if (!validarGTIN(formData.gtin))
      return toast.error('Código GTIN/EAN inválido. Deve conter 8, 12, 13 ou 14 dígitos ou "SEM GTIN".')
    if (!formData.ncm?.trim()) return toast.warning('O código NCM é obrigatório para emissão fiscal.')
    if (!validarNCM(formData.ncm)) return toast.error('NCM inválido. Deve possuir 8 dígitos numéricos.')
    if (!formData.cfop?.trim() || !validarCFOP(formData.cfop)) return toast.error('CFOP inválido.')
    if (!formData.cstCsosn?.trim()) return toast.warning('Selecione a tributação CST ou CSOSN.')
    if (formData.precoCusto === '' || Number(formData.precoCusto) < 0)
      return toast.warning('Informe um preço de custo válido.')
    if (formData.precoVenda === '' || Number(formData.precoVenda) <= 0)
      return toast.warning('Informe um preço de venda válido maior que zero.')

    onSalvar({
      ...formData,
      id: pecaParaEditar?.id || `pec-${Date.now()}`,
      codigo: formData.codigo.trim().toUpperCase(),
      nome: formData.nome.trim(),
      categoria: formData.categoria || 'Outros Componentes',
      codigoFabricante: formData.codigoFabricante?.trim() || '',
      gtin: formData.gtin.trim().toUpperCase(),
      ncm: formData.ncm.replace(/\D/g, ''),
      cfop: formData.cfop.replace(/\D/g, ''),
      cstCsosn: formData.cstCsosn,
      unidade: formData.unidade,
      precoCusto: Number(formData.precoCusto),
      precoVenda: Number(formData.precoVenda),
      margemLucro,
      estoqueMinimo: Number(formData.estoqueMinimo) || 0,
      estoqueAtual: Number(formData.estoqueAtual) || 0,
      localizacao: formData.localizacao?.trim() || '',
      ativo: Boolean(formData.ativo),
    })
  }

  const categoriaSelecionada = CATEGORIAS_PECAS_OPCOES.find((o) => o.value === formData.categoria) || {
    value: formData.categoria || 'Outros Componentes',
    label: formData.categoria || 'Outros Componentes',
  }
  const unidadeSelecionada = UNIDADES_MEDIDA_OPCOES.find((o) => o.value === formData.unidade) || null
  const cstSelecionado = CST_CSOSN_OPCOES.find((o) => o.value === formData.cstCsosn) || null
  const cfopSelecionado = CFOP_OPCOES.find((o) => o.value === formData.cfop) || null

  return (
    <div className="fixed inset-0 z-50 bg-[#eaecf0] flex flex-col">
      <header className="shrink-0 bg-white border-b border-[#e4e7ec]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="h-14 px-2 flex items-center justify-between gap-2">
          <button type="button" onClick={onClose} aria-label="Fechar" className="p-2.5 rounded-xl text-[#475467] active:bg-[#f2f4f7] shrink-0">
            <X size={20} weight="bold" />
          </button>
          <span className="text-sm font-extrabold text-[#101828] truncate">
            {pecaParaEditar ? 'Editar Peça' : 'Nova Peça'}
          </span>
          <div className="w-9 shrink-0" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-4">
        {/* Identificação */}
        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
              <Package size={14} weight="bold" className="text-[#0284c7]" />
              Identificação
            </h3>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ativo}
                onChange={(e) => handleChange('ativo', e.target.checked)}
                className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#0284c7] border-[#d0d5dd]"
              />
              <span className="text-[11px] font-bold text-[#344054]">Ativo</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBaseClass}>Código SKU *</label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => handleChange('codigo', e.target.value.toUpperCase())}
                placeholder="Ex: OLEO-5W30"
                className={`${inputBaseClass} font-mono uppercase`}
              />
            </div>
            <div>
              <label className={labelBaseClass}>Cód. Fabricante</label>
              <input
                type="text"
                value={formData.codigoFabricante}
                onChange={(e) => handleChange('codigoFabricante', e.target.value)}
                placeholder="Ex: MOB-5W30-1L"
                className={`${inputBaseClass} font-mono`}
              />
            </div>
          </div>

          <div>
            <label className={labelBaseClass}>Nome do Produto *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Óleo Sintético 5W30 API SP"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label className={labelBaseClass}>Categoria *</label>
            <Select
              value={categoriaSelecionada}
              onChange={(opt) => handleChange('categoria', opt ? opt.value : 'Outros Componentes')}
              options={CATEGORIAS_PECAS_OPCOES}
              styles={mobileSelectStyles}
              placeholder="Selecione a categoria"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBaseClass}>Unidade *</label>
              <Select
                value={unidadeSelecionada}
                onChange={(opt) => handleChange('unidade', opt ? opt.value : 'UN')}
                options={UNIDADES_MEDIDA_OPCOES}
                styles={mobileSelectStyles}
                isSearchable={false}
              />
            </div>
            <div>
              <label className={labelBaseClass}>Localização</label>
              <input
                type="text"
                value={formData.localizacao}
                onChange={(e) => handleChange('localizacao', e.target.value)}
                placeholder="Ex: Prateleira B3"
                className={inputBaseClass}
              />
            </div>
          </div>
        </section>

        {/* Fiscal */}
        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <ShieldCheck size={14} weight="bold" className="text-[#0284c7]" />
            Conformidade Fiscal
          </h3>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`${labelBaseClass} mb-0`}>GTIN / EAN *</label>
              <button
                type="button"
                onClick={() => handleChange('gtin', 'SEM GTIN')}
                className="text-[10.5px] text-[#0284c7] font-bold"
              >
                Usar "SEM GTIN"
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={formData.gtin}
                onChange={(e) => handleChange('gtin', e.target.value.trim().toUpperCase())}
                placeholder="13 dígitos ou SEM GTIN"
                className={`${inputBaseClass} font-mono pr-10`}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {gtinValido ? (
                  <CheckCircle size={16} className="text-[#0284c7]" weight="fill" />
                ) : (
                  <WarningCircle size={16} className="text-rose-500" weight="fill" />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className={labelBaseClass}>NCM *</label>
            <IMaskInput
              mask="0000.00.00"
              value={formData.ncm}
              onAccept={(val) => handleChange('ncm', val)}
              placeholder="0000.00.00"
              className={`${inputBaseClass} font-mono`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBaseClass}>CFOP *</label>
              <Select
                value={cfopSelecionado}
                onChange={(opt) => handleChange('cfop', opt ? opt.value : '5102')}
                options={CFOP_OPCOES}
                styles={mobileSelectStyles}
                placeholder="CFOP"
              />
            </div>
            <div>
              <label className={labelBaseClass}>CST / CSOSN *</label>
              <Select
                value={cstSelecionado}
                onChange={(opt) => handleChange('cstCsosn', opt ? opt.value : '500')}
                options={CST_CSOSN_OPCOES}
                styles={mobileSelectStyles}
                placeholder="CST/CSOSN"
              />
            </div>
          </div>
        </section>

        {/* Preços */}
        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
              <TrendUp size={14} weight="bold" className="text-[#0284c7]" />
              Precificação
            </h3>
            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#0284c7]">
              Margem: {margemLucro}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBaseClass}>Preço Custo (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.precoCusto}
                onChange={(e) => handleChange('precoCusto', e.target.value)}
                placeholder="0.00"
                className={inputBaseClass}
              />
            </div>
            <div>
              <label className={labelBaseClass}>Preço Venda (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.precoVenda}
                onChange={(e) => handleChange('precoVenda', e.target.value)}
                placeholder="0.00"
                className={inputBaseClass}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#f2f4f7] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667085]">Lucro Bruto Unitário</span>
            <span className="text-sm font-bold text-[#101828]">
              R$ {((Number(formData.precoVenda) || 0) - (Number(formData.precoCusto) || 0)).toFixed(2)}
            </span>
          </div>
        </section>

        {/* Estoque */}
        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
              <Package size={14} weight="bold" className="text-[#0284c7]" />
              Controle de Estoque
            </h3>
            {estoqueBaixo && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Abaixo do mínimo
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBaseClass}>Estoque Mínimo *</label>
              <input
                type="number"
                min="0"
                value={formData.estoqueMinimo}
                onChange={(e) => handleChange('estoqueMinimo', e.target.value)}
                className={inputBaseClass}
              />
            </div>
            <div>
              <label className={labelBaseClass}>Estoque Atual *</label>
              <input
                type="number"
                min="0"
                value={formData.estoqueAtual}
                onChange={(e) => handleChange('estoqueAtual', e.target.value)}
                className={`${inputBaseClass} font-bold`}
              />
            </div>
          </div>
        </section>

        {pecaParaEditar && onExcluir && (
          <section>
            {confirmandoExclusao ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 flex items-center gap-2">
                <span className="flex-1 text-xs font-bold text-[#101828]">Excluir esta peça?</span>
                <button type="button" onClick={() => setConfirmandoExclusao(false)} className="h-9 px-3 rounded-lg border border-[#d0d5dd] bg-white text-[#344054] text-xs font-bold">
                  Cancelar
                </button>
                <button type="button" onClick={() => onExcluir(pecaParaEditar.id)} className="h-9 px-3 rounded-lg bg-[#b42318] text-white text-xs font-bold">
                  Confirmar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmandoExclusao(true)}
                className="w-full h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Trash size={15} weight="bold" />
                Excluir Peça
              </button>
            )}
          </section>
        )}
      </main>

      <footer className="shrink-0 bg-white border-t border-[#e4e7ec] px-4 py-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}>
        <button
          type="button"
          onClick={handleSalvar}
          className="w-full h-12 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-sm font-bold flex items-center justify-center gap-2"
        >
          <CheckCircle size={18} weight="bold" />
          {pecaParaEditar ? 'Atualizar Peça' : 'Salvar Peça'}
        </button>
      </footer>
    </div>
  )
}
