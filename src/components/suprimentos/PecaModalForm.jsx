import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import { Package, FloppyDisk, Barcode, ShieldCheck, TrendUp, WarningCircle, CheckCircle } from '@phosphor-icons/react'
import { ModalRedimensionavel } from './ModalRedimensionavel'
import { customSelectStyles } from './customSelectStyles'
import {
  CATEGORIAS_PECAS_OPCOES,
  UNIDADES_MEDIDA_OPCOES,
  CST_CSOSN_OPCOES,
  CFOP_OPCOES,
} from '../../constants/cadastrosSuprimentosData'
import { validarGTIN, validarNCM, formatarNCM, validarCFOP } from '../../utils/fiscalValidators'
import { IMaskInput } from 'react-imask'
import { toast } from 'sonner'

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

export function PecaModalForm({ isOpen, onClose, onSalvar, pecaParaEditar }) {
  const [formData, setFormData] = useState(FORM_INICIAL)

  useEffect(() => {
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
      setFormData({
        ...FORM_INICIAL,
        codigo: `PEC-${String(Math.floor(1000 + Math.random() * 9000))}`,
      })
    }
  }, [pecaParaEditar, isOpen])

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }))
  }

  // Margem de Lucro calculada
  const margemLucro = useMemo(() => {
    const custo = Number(formData.precoCusto) || 0
    const venda = Number(formData.precoVenda) || 0
    if (custo <= 0 || venda <= 0) return 0
    const margem = ((venda - custo) / custo) * 100
    return Number(margem.toFixed(2))
  }, [formData.precoCusto, formData.precoVenda])

  // Validação em tempo real do GTIN
  const gtinValido = useMemo(() => {
    if (!formData.gtin || formData.gtin.trim() === '') return false
    return validarGTIN(formData.gtin)
  }, [formData.gtin])

  // Validação em tempo real do NCM
  const ncmValido = useMemo(() => {
    return validarNCM(formData.ncm)
  }, [formData.ncm])

  // Validação em tempo real do CFOP
  const cfopValido = useMemo(() => {
    return validarCFOP(formData.cfop)
  }, [formData.cfop])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.codigo?.trim()) {
      toast.warning('O código SKU da peça ou produto é obrigatório.')
      return
    }
    if (!formData.nome?.trim()) {
      toast.warning('O nome da peça ou produto é obrigatório.')
      return
    }
    if (!formData.unidade) {
      toast.warning('Selecione a unidade de medida do item.')
      return
    }

    // Validações fiscais obrigatórias conforme especificação
    if (!formData.gtin?.trim()) {
      toast.warning('Informe o código GTIN/EAN ou utilize "SEM GTIN".')
      return
    }
    if (!validarGTIN(formData.gtin)) {
      toast.error('Código GTIN/EAN inválido. Deve conter 8, 12, 13 ou 14 dígitos numéricos válidos ou "SEM GTIN".')
      return
    }

    if (!formData.ncm?.trim()) {
      toast.warning('O código NCM (8 dígitos numéricos) é obrigatório para emissão fiscal.')
      return
    }
    if (!validarNCM(formData.ncm)) {
      toast.error('NCM inválido. Deve possuir 8 dígitos numéricos.')
      return
    }

    if (!formData.cfop?.trim() || !validarCFOP(formData.cfop)) {
      toast.error('CFOP inválido. Deve conter 4 dígitos numéricos válidos (ex: 5102, 5405, 1102).')
      return
    }

    if (!formData.cstCsosn?.trim()) {
      toast.warning('Selecione a tributação CST ou CSOSN.')
      return
    }

    if (formData.precoCusto === '' || Number(formData.precoCusto) < 0) {
      toast.warning('Informe um preço de custo válido (maior ou igual a zero).')
      return
    }
    if (formData.precoVenda === '' || Number(formData.precoVenda) <= 0) {
      toast.warning('Informe um preço de venda válido maior que zero.')
      return
    }

    const payload = {
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
      margemLucro: margemLucro,
      estoqueMinimo: Number(formData.estoqueMinimo) || 0,
      estoqueAtual: Number(formData.estoqueAtual) || 0,
      localizacao: formData.localizacao?.trim() || '',
      ativo: Boolean(formData.ativo),
    }

    onSalvar(payload)
    onClose()
  }

  const categoriaSelecionada = CATEGORIAS_PECAS_OPCOES.find((opt) => opt.value === formData.categoria) || {
    value: formData.categoria || 'Outros Componentes',
    label: formData.categoria || 'Outros Componentes',
  }
  const unidadeSelecionada = UNIDADES_MEDIDA_OPCOES.find((opt) => opt.value === formData.unidade) || null
  const cstSelecionado = CST_CSOSN_OPCOES.find((opt) => opt.value === formData.cstCsosn) || null
  const cfopSelecionado = CFOP_OPCOES.find((opt) => opt.value === formData.cfop) || null

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      titulo={pecaParaEditar ? 'Editar Peça ou Produto' : 'Nova Peça ou Produto'}
      subtitulo="Cadastro técnico, fiscal e controle de estoque com conformidade tributária"
      icone={Package}
      larguraPadrao={800}
      alturaPadrao={680}
      chaveStorage="peca_modal"
      storageKey="peca_modal"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identificação Geral */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <Package size={16} className="text-sky-600" />
            <span>Identificação Geral do Item</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Código SKU <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => handleChange('codigo', e.target.value.toUpperCase())}
                placeholder="Ex: OLEO-5W30"
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none uppercase font-mono font-medium"
              />
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nome do Produto <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Ex: Óleo Sintético 5W30 API SP"
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Cód. Fabricante
              </label>
              <input
                type="text"
                value={formData.codigoFabricante}
                onChange={(e) => handleChange('codigoFabricante', e.target.value)}
                placeholder="Ex: MOB-5W30-1L"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none font-mono"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Categoria da Peça <span className="text-rose-500">*</span>
              </label>
              <Select
                value={categoriaSelecionada}
                onChange={(opt) => handleChange('categoria', opt ? opt.value : 'Outros Componentes')}
                options={CATEGORIAS_PECAS_OPCOES}
                styles={customSelectStyles}
                placeholder="Selecione a categoria"
                isSearchable={true}
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Unidade de Medida <span className="text-rose-500">*</span>
              </label>
              <Select
                value={unidadeSelecionada}
                onChange={(opt) => handleChange('unidade', opt ? opt.value : 'UN')}
                options={UNIDADES_MEDIDA_OPCOES}
                styles={customSelectStyles}
                placeholder="Selecione a unidade"
                isSearchable={false}
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Localização no Almoxarifado
              </label>
              <input
                type="text"
                value={formData.localizacao}
                onChange={(e) => handleChange('localizacao', e.target.value)}
                placeholder="Ex: Prateleira B3, Gaveta 12"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>

            <div className="md:col-span-12 flex items-center pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => handleChange('ativo', e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-700">Item Ativo no Almoxarifado para Venda e Ordem de Serviço</span>
              </label>
            </div>
          </div>
        </div>

        {/* Parâmetros Fiscais Obrigatórios */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <ShieldCheck size={16} className="text-sky-600" />
              <span>Conformidade Fiscal (NF-e de Peças)</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Obrigatório para emissão de nota</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  Código de Barras GTIN / EAN <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleChange('gtin', 'SEM GTIN')}
                  className="text-[10px] text-sky-600 hover:text-sky-700 font-medium underline"
                >
                  Usar "SEM GTIN"
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.gtin}
                  onChange={(e) => handleChange('gtin', e.target.value.trim().toUpperCase())}
                  placeholder="13 dígitos numéricos ou SEM GTIN"
                  required
                  className={`w-full pl-8 pr-8 py-2 text-sm bg-white border rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono ${
                    gtinValido ? 'border-sky-500' : 'border-rose-400'
                  }`}
                />
                <Barcode size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  {gtinValido ? (
                    <CheckCircle size={16} className="text-sky-600" weight="fill" />
                  ) : (
                    <WarningCircle size={16} className="text-rose-500" weight="fill" />
                  )}
                </div>
              </div>
              <span className="block text-[11px] text-slate-500 mt-1">
                {formData.gtin === 'SEM GTIN'
                  ? 'Isento de código de barras comercial oficial'
                  : gtinValido
                  ? 'Código GTIN válido com dígito verificador módulo 10'
                  : 'Informe um GTIN válido (8, 12, 13 ou 14 dígitos) ou SEM GTIN'}
              </span>
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                NCM (Nomenclatura Comum do Mercosul) <span className="text-rose-500">*</span>
              </label>
              <IMaskInput
                mask="0000.00.00"
                value={formData.ncm}
                onAccept={(val) => handleChange('ncm', val)}
                placeholder="0000.00.00"
                required
                className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono ${
                  ncmValido ? 'border-slate-300' : 'border-rose-300'
                }`}
              />
              <span className="block text-[11px] text-slate-500 mt-1">
                8 dígitos numéricos conforme tabela oficial da Receita (ex: 2710.19.32)
              </span>
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                CFOP (Código Fiscal de Operações) <span className="text-rose-500">*</span>
              </label>
              <Select
                value={cfopSelecionado}
                onChange={(opt) => handleChange('cfop', opt ? opt.value : '5102')}
                options={CFOP_OPCOES}
                styles={customSelectStyles}
                placeholder="Selecione o CFOP"
              />
              <span className="block text-[11px] text-slate-500 mt-1">
                5102 (Padrão Venda) ou 5405 (Substituição Tributária)
              </span>
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tributação CST ou CSOSN <span className="text-rose-500">*</span>
              </label>
              <Select
                value={cstSelecionado}
                onChange={(opt) => handleChange('cstCsosn', opt ? opt.value : '500')}
                options={CST_CSOSN_OPCOES}
                styles={customSelectStyles}
                placeholder="Selecione CST ou CSOSN"
              />
              <span className="block text-[11px] text-slate-500 mt-1">
                Regime tributário da peça para o Simples Nacional ou Regime Normal
              </span>
            </div>
          </div>
        </div>

        {/* Preços e Margem de Lucro */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <TrendUp size={16} className="text-sky-600" />
              <span>Precificação e Margem de Lucro</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-sky-100 text-sky-800">
              <span>Margem Calculada:</span>
              <span>{margemLucro}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Preço de Custo (R$) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precoCusto}
                  onChange={(e) => handleChange('precoCusto', e.target.value)}
                  placeholder="0,00"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-medium"
                />
              </div>
              <span className="block text-[11px] text-slate-500 mt-1">Valor pago ao fornecedor</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Preço de Venda (R$) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.precoVenda}
                  onChange={(e) => handleChange('precoVenda', e.target.value)}
                  placeholder="0,00"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-medium"
                />
              </div>
              <span className="block text-[11px] text-slate-500 mt-1">Valor final cobrado na OS</span>
            </div>

            <div className="flex flex-col justify-end">
              <div className="p-2.5 rounded-md border border-slate-200 bg-white flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Lucro Bruto Unitário:</span>
                <span className="text-sm font-bold text-slate-900">
                  R$ {((Number(formData.precoVenda) || 0) - (Number(formData.precoCusto) || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Níveis de Estoque */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <Package size={16} className="text-sky-600" />
              <span>Controle de Estoque Físico</span>
            </div>
            {Number(formData.estoqueAtual) <= Number(formData.estoqueMinimo) && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                Atenção: Estoque igual ou abaixo do mínimo
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Estoque Mínimo (Ponto de Reposição) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.estoqueMinimo}
                onChange={(e) => handleChange('estoqueMinimo', e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <span className="block text-[11px] text-slate-500 mt-1">Gera alerta de compra preventiva</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Estoque Atual em Prateleira <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.estoqueAtual}
                onChange={(e) => handleChange('estoqueAtual', e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-semibold text-slate-900"
              />
              <span className="block text-[11px] text-slate-500 mt-1">Quantidade disponível física</span>
            </div>
          </div>
        </div>

        {/* Rodapé de Ações - Botão único de confirmação */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md shadow-sm transition-colors"
          >
            <FloppyDisk size={16} />
            <span>Salvar Peça ou Produto</span>
          </button>
        </div>
      </form>
    </ModalRedimensionavel>
  )
}
