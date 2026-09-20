import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { X, Wrench, Receipt, CheckCircle, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { CATEGORIAS_SERVICOS_OPCOES } from '../../../../constants/cadastrosSuprimentosData'
import {
  mobileSelectStyles,
  inputBaseClass,
  textareaBaseClass,
  labelBaseClass,
} from '../../nova-os/mobile/mobileSelectStyles'

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

export function MobileServicoFormModal({ isOpen, onClose, onSalvar, onExcluir, servicoParaEditar }) {
  const [formData, setFormData] = useState(FORM_INICIAL)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setConfirmandoExclusao(false)
    if (servicoParaEditar) {
      setFormData({
        ...servicoParaEditar,
        valorMaoDeObra: servicoParaEditar.valorMaoDeObra ?? '',
        tempoEstimado: servicoParaEditar.tempoEstimado ?? '',
        aliquotaISS: servicoParaEditar.aliquotaISS ?? 5.0,
      })
    } else {
      setFormData({ ...FORM_INICIAL, codigo: `SRV-${String(Math.floor(100 + Math.random() * 900))}` })
    }
  }, [servicoParaEditar, isOpen])

  if (!isOpen) return null

  const handleChange = (campo, valor) => setFormData((prev) => ({ ...prev, [campo]: valor }))

  const handleSalvar = () => {
    if (!formData.codigo?.trim()) return toast.warning('O código SKU do serviço é obrigatório.')
    if (!formData.nome?.trim()) return toast.warning('O nome do serviço é obrigatório.')
    if (!formData.categoria) return toast.warning('Selecione a categoria técnica do serviço.')
    if (formData.valorMaoDeObra === '' || Number(formData.valorMaoDeObra) < 0)
      return toast.warning('Informe um valor válido para a mão de obra.')
    if (!formData.cnae?.trim()) return toast.warning('O código CNAE é obrigatório para emissão fiscal de NFS-e.')
    if (!formData.codigoServicoIBPT?.trim())
      return toast.warning('O código do serviço IBPT é obrigatório para emissão de NFS-e.')
    if (formData.aliquotaISS === '' || Number(formData.aliquotaISS) < 0)
      return toast.warning('Informe a alíquota de ISS válida.')

    onSalvar({
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
    })
  }

  const categoriaSelecionada = CATEGORIAS_SERVICOS_OPCOES.find((o) => o.value === formData.categoria) || null

  return (
    <div className="fixed inset-0 z-50 bg-[#eaecf0] flex flex-col">
      <header className="shrink-0 bg-white border-b border-[#e4e7ec]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="h-14 px-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-2.5 rounded-xl text-[#475467] active:bg-[#f2f4f7] transition-colors shrink-0"
          >
            <X size={20} weight="bold" />
          </button>
          <span className="text-sm font-extrabold text-[#101828] truncate">
            {servicoParaEditar ? 'Editar Serviço' : 'Novo Serviço'}
          </span>
          <div className="w-9 shrink-0" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-4">
        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
              <Wrench size={14} weight="bold" className="text-[#0284c7]" />
              Especificação Técnica
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

          <div>
            <label className={labelBaseClass}>Código SKU *</label>
            <input
              type="text"
              value={formData.codigo}
              onChange={(e) => handleChange('codigo', e.target.value)}
              placeholder="Ex: SRV-001"
              className={`${inputBaseClass} font-mono`}
            />
          </div>

          <div>
            <label className={labelBaseClass}>Nome do Serviço *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Troca de Óleo e Filtro de Motor"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label className={labelBaseClass}>Categoria Técnica *</label>
            <Select
              options={CATEGORIAS_SERVICOS_OPCOES}
              value={categoriaSelecionada}
              onChange={(opt) => handleChange('categoria', opt ? opt.value : '')}
              placeholder="Selecione a categoria..."
              styles={mobileSelectStyles}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBaseClass}>Mão de Obra (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.valorMaoDeObra}
                onChange={(e) => handleChange('valorMaoDeObra', e.target.value)}
                placeholder="0.00"
                className={inputBaseClass}
              />
            </div>
            <div>
              <label className={labelBaseClass}>Tempo Estimado (h)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.tempoEstimado}
                onChange={(e) => handleChange('tempoEstimado', e.target.value)}
                placeholder="Ex: 1.5"
                className={inputBaseClass}
              />
            </div>
          </div>

          <div>
            <label className={labelBaseClass}>Descrição e Procedimento</label>
            <textarea
              rows={3}
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descreva as etapas técnicas e observações operacionais..."
              className={textareaBaseClass}
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <Receipt size={14} weight="bold" className="text-[#0284c7]" />
            Parâmetros Fiscais (NFS-e)
          </h3>

          <div>
            <label className={labelBaseClass}>Código CNAE *</label>
            <input
              type="text"
              value={formData.cnae}
              onChange={(e) => handleChange('cnae', e.target.value)}
              placeholder="Ex: 45201-04"
              className={`${inputBaseClass} font-mono`}
            />
          </div>

          <div>
            <label className={labelBaseClass}>Código Serviço IBPT *</label>
            <input
              type="text"
              value={formData.codigoServicoIBPT}
              onChange={(e) => handleChange('codigoServicoIBPT', e.target.value)}
              placeholder="Ex: 14.01"
              className={`${inputBaseClass} font-mono`}
            />
          </div>

          <div>
            <label className={labelBaseClass}>Alíquota ISS (%) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.aliquotaISS}
              onChange={(e) => handleChange('aliquotaISS', e.target.value)}
              placeholder="5.00"
              className={inputBaseClass}
            />
          </div>
        </section>

        {servicoParaEditar && onExcluir && (
          <section>
            {confirmandoExclusao ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 flex items-center gap-2">
                <span className="flex-1 text-xs font-bold text-[#101828]">Excluir este serviço?</span>
                <button
                  type="button"
                  onClick={() => setConfirmandoExclusao(false)}
                  className="h-9 px-3 rounded-lg border border-[#d0d5dd] bg-white text-[#344054] text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => onExcluir(servicoParaEditar.id)}
                  className="h-9 px-3 rounded-lg bg-[#b42318] text-white text-xs font-bold"
                >
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
                Excluir Serviço
              </button>
            )}
          </section>
        )}
      </main>

      <footer
        className="shrink-0 bg-white border-t border-[#e4e7ec] px-4 py-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        <button
          type="button"
          onClick={handleSalvar}
          className="w-full h-12 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-sm font-bold flex items-center justify-center gap-2"
        >
          <CheckCircle size={18} weight="bold" />
          {servicoParaEditar ? 'Atualizar Serviço' : 'Salvar Serviço'}
        </button>
      </footer>
    </div>
  )
}
