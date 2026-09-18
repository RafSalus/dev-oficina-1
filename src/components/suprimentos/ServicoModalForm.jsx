import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { Wrench, FloppyDisk, Receipt, ShieldCheck } from '@phosphor-icons/react'
import { ModalRedimensionavel } from './ModalRedimensionavel'
import { customSelectStyles } from './customSelectStyles'
import { CATEGORIAS_SERVICOS_OPCOES } from '../../constants/cadastrosSuprimentosData'
import { toast } from 'sonner'

const FORM_INICIAL = {
  codigo: '',
  nome: '',
  descricao: '',
  categoria: 'Motor',
  valorMaoDeObra: '',
  tempoEstimado: '',
  cnae: '45201-04',
  codigoServicoIBPT: '14.01',
  aliquotaISS: 5.0,
  ativo: true,
}

export function ServicoModalForm({ isOpen, onClose, onSalvar, servicoParaEditar }) {
  const [formData, setFormData] = useState(FORM_INICIAL)

  useEffect(() => {
    if (servicoParaEditar) {
      setFormData({
        ...servicoParaEditar,
        valorMaoDeObra: servicoParaEditar.valorMaoDeObra ?? '',
        tempoEstimado: servicoParaEditar.tempoEstimado ?? '',
        aliquotaISS: servicoParaEditar.aliquotaISS ?? 5.0,
      })
    } else {
      setFormData({
        ...FORM_INICIAL,
        codigo: `SRV-${String(Math.floor(100 + Math.random() * 900))}`,
      })
    }
  }, [servicoParaEditar, isOpen])

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.codigo?.trim()) {
      toast.warning('O código SKU do serviço é obrigatório.')
      return
    }
    if (!formData.nome?.trim()) {
      toast.warning('O nome do serviço é obrigatório.')
      return
    }
    if (!formData.categoria) {
      toast.warning('Selecione a categoria técnica do serviço.')
      return
    }
    if (formData.valorMaoDeObra === '' || Number(formData.valorMaoDeObra) < 0) {
      toast.warning('Informe um valor válido para a mão de obra.')
      return
    }
    if (!formData.cnae?.trim()) {
      toast.warning('O código CNAE é obrigatório para emissão fiscal de NFS-e.')
      return
    }
    if (!formData.codigoServicoIBPT?.trim()) {
      toast.warning('O código do serviço IBPT é obrigatório para emissão de NFS-e.')
      return
    }
    if (formData.aliquotaISS === '' || Number(formData.aliquotaISS) < 0) {
      toast.warning('Informe a alíquota de ISS válida.')
      return
    }

    const payload = {
      ...formData,
      id: servicoParaEditar?.id || `srv-${Date.now()}`,
      codigo: formData.codigo.trim().toUpperCase(),
      nome: formData.nome.trim(),
      descricao: formData.descricao?.trim() || '',
      valorMaoDeObra: Number(formData.valorMaoDeObra),
      tempoEstimado: formData.tempoEstimado ? Number(formData.tempoEstimado) : null,
      aliquotaISS: Number(formData.aliquotaISS),
      cnae: formData.cnae.trim(),
      codigoServicoIBPT: formData.codigoServicoIBPT.trim(),
      ativo: Boolean(formData.ativo),
    }

    onSalvar(payload)
    onClose()
  }

  const categoriaSelecionada =
    CATEGORIAS_SERVICOS_OPCOES.find((opt) => opt.value === formData.categoria) || null

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      chaveStorage="dev_oficina_modal_servico_dims"
      larguraPadrao={840}
      alturaPadrao={620}
      titulo={servicoParaEditar ? 'Editar Serviço de Mão de Obra' : 'Novo Serviço de Mão de Obra'}
      subtitulo="Cadastro técnico de serviços da oficina com parametrização fiscal para NFS-e"
      icone={Wrench}
      badge={servicoParaEditar ? `Código: ${servicoParaEditar.codigo}` : 'Novo Cadastro'}
      rodape={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#d0d5dd] bg-white text-xs font-bold text-[#344054] hover:bg-[#f2f4f7] transition-all cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <FloppyDisk size={16} weight="bold" />
            <span>Salvar Serviço</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bloco 1: Dados Técnicos Principais */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#d0d5dd] shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#f2f4f7]">
            <div className="flex items-center gap-2">
              <Wrench size={16} weight="bold" className="text-[#0284c7]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#101828]">
                1. Especificação Técnica do Serviço
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ativo}
                onChange={(e) => handleChange('ativo', e.target.checked)}
                className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#0284c7] border-[#d0d5dd] cursor-pointer"
              />
              <span className="text-xs font-bold text-[#344054]">Serviço Ativo</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                Código SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => handleChange('codigo', e.target.value)}
                placeholder="Ex: SRV-001"
                className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-xs font-bold font-mono text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
            </div>

            <div className="sm:col-span-8">
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                Nome do Serviço <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Ex: Troca de Óleo e Filtro de Motor"
                className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-xs font-bold text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                Categoria Técnica <span className="text-red-500">*</span>
              </label>
              <Select
                options={CATEGORIAS_SERVICOS_OPCOES}
                value={categoriaSelecionada}
                onChange={(opt) => handleChange('categoria', opt ? opt.value : '')}
                placeholder="Selecione a categoria..."
                styles={customSelectStyles}
                isSearchable
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                Valor Mão de Obra (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.valorMaoDeObra}
                onChange={(e) => handleChange('valorMaoDeObra', e.target.value)}
                placeholder="0.00"
                className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-xs font-bold text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                Tempo Estimado (h)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.tempoEstimado}
                onChange={(e) => handleChange('tempoEstimado', e.target.value)}
                placeholder="Ex: 1.5"
                className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-xs font-bold text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#344054] block mb-1">
              Descrição e Procedimento do Serviço
            </label>
            <textarea
              rows={2}
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descreva as etapas técnicas e observações operacionais..."
              className="w-full px-3 py-2 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-xs text-[#344054] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 resize-none transition-all"
            />
          </div>
        </div>

        {/* Bloco 2: Parâmetros Fiscais para Emissão de NFS-e */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#d0d5dd] shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#f2f4f7]">
            <div className="flex items-center gap-2">
              <Receipt size={16} weight="bold" className="text-[#0284c7]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#101828]">
                2. Parâmetros Fiscais (NFS-e Municipal)
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#0284c7] border border-sky-200">
              Obrigatório para Faturamento
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                Código CNAE <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.cnae}
                onChange={(e) => handleChange('cnae', e.target.value)}
                placeholder="Ex: 45201-04"
                className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-xs font-mono font-bold text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
              <span className="text-[10px] text-[#667085] mt-0.5 block">Manutenção mecânica</span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                Código Serviço IBPT <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.codigoServicoIBPT}
                onChange={(e) => handleChange('codigoServicoIBPT', e.target.value)}
                placeholder="Ex: 14.01"
                className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-xs font-mono font-bold text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
              <span className="text-[10px] text-[#667085] mt-0.5 block">Tabela LC 116/2003</span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                Alíquota ISS (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.aliquotaISS}
                onChange={(e) => handleChange('aliquotaISS', e.target.value)}
                placeholder="5.00"
                className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-xs font-bold text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
              <span className="text-[10px] text-[#667085] mt-0.5 block">Tributo municipal</span>
            </div>
          </div>
        </div>
      </form>
    </ModalRedimensionavel>
  )
}
