import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { IMaskInput } from 'react-imask'
import {
  UserPlus,
  FloppyDisk,
  IdentificationCard,
  Briefcase,
  Percent,
  Clock,
  ChatText,
} from '@phosphor-icons/react'
import { ModalRedimensionavel } from '../../../../components/suprimentos/ModalRedimensionavel'
import { customSelectStyles } from '../../../../components/suprimentos/customSelectStyles'
import { CARGOS_FUNCIONARIO_OPCOES } from '../../../../repositories/funcionariosRepository'
import { toast } from 'sonner'

const FORM_INICIAL = {
  nome: '',
  cpf: '',
  telefone: '',
  cargo: 'mecanico',
  especialidade: '',
  email: '',
  boxElevador: '',
  comissaoServicos: '10.0',
  comissaoPecas: '2.0',
  dataAdmissao: new Date().toISOString().slice(0, 10),
  horarioTrabalho: '08:00 às 19:00',
  ativo: true,
  observacoes: '',
}

export function FuncionarioModal({ isOpen, onClose, onSalvar, funcionarioParaEditar }) {
  const [formData, setFormData] = useState(FORM_INICIAL)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (funcionarioParaEditar) {
      setFormData({
        ...funcionarioParaEditar,
        comissaoServicos: String(funcionarioParaEditar.comissaoServicos ?? '10.0'),
        comissaoPecas: String(funcionarioParaEditar.comissaoPecas ?? '2.0'),
        dataAdmissao: funcionarioParaEditar.dataAdmissao || new Date().toISOString().slice(0, 10),
        horarioTrabalho: funcionarioParaEditar.horarioTrabalho || '08:00 às 19:00',
        ativo: funcionarioParaEditar.ativo !== false,
      })
    } else {
      setFormData(FORM_INICIAL)
    }
  }, [funcionarioParaEditar, isOpen])

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }))
  }

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()

    if (!formData.nome.trim()) {
      toast.warning('O nome completo do colaborador é obrigatório.')
      return
    }

    if (!formData.cargo) {
      toast.warning('Selecione o cargo do colaborador.')
      return
    }

    setSalvando(true)
    try {
      const cargoObj = CARGOS_FUNCIONARIO_OPCOES.find((c) => c.value === formData.cargo)
      const cargoLabel = cargoObj ? cargoObj.label : formData.cargo

      const payload = {
        ...formData,
        id: funcionarioParaEditar?.id || undefined,
        nome: formData.nome.trim(),
        cargoLabel,
        comissaoServicos: parseFloat(formData.comissaoServicos) || 0,
        comissaoPecas: parseFloat(formData.comissaoPecas) || 0,
      }

      await onSalvar(payload)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSalvando(false)
    }
  }

  const cargoSelecionado =
    CARGOS_FUNCIONARIO_OPCOES.find((opt) => opt.value === formData.cargo) || null

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      chaveStorage="dev_oficina_modal_funcionario_dims"
      larguraPadrao={840}
      alturaPadrao={660}
      larguraMinima={560}
      alturaMinima={480}
      larguraMaxima={1200}
      alturaMaxima={900}
      titulo={funcionarioParaEditar ? 'Editar Colaborador' : 'Novo Colaborador'}
      subtitulo="Cadastro completo de membro da equipe com parametrização de comissões e pátio"
      icone={UserPlus}
      badge={funcionarioParaEditar ? `ID: ${funcionarioParaEditar.id}` : 'Equipe Gabriel'}
      rodape={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="px-4 py-2 rounded-xl border border-[#d0d5dd] bg-white text-xs font-bold text-[#344054] hover:bg-[#f2f4f7] transition-all cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={salvando}
            className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FloppyDisk size={16} weight="bold" />
            <span>{salvando ? 'Salvando...' : 'Salvar Colaborador'}</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bloco 1: Identificação e Acesso */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#d0d5dd] shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#f2f4f7]">
            <div className="flex items-center gap-2">
              <IdentificationCard size={16} weight="bold" className="text-[#0284c7]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#101828]">
                Dados Pessoais & Identificação
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.ativo}
                onChange={(e) => handleChange('ativo', e.target.checked)}
                className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#0284c7] border-[#d0d5dd] cursor-pointer"
              />
              <span className="text-xs font-bold text-[#344054]">Colaborador Ativo</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Ex: Carlos Eduardo Silveira"
                className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-base sm:text-xs font-bold text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                CPF (com máscara)
              </label>
              <IMaskInput
                mask="000.000.000-00"
                value={formData.cpf}
                onAccept={(val) => handleChange('cpf', val)}
                placeholder="000.000.000-00"
                className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-base sm:text-xs font-bold font-mono text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                Telefone Celular / WhatsApp
              </label>
              <IMaskInput
                mask="(00) 00000-0000"
                value={formData.telefone}
                onAccept={(val) => handleChange('telefone', val)}
                placeholder="(00) 00000-0000"
                className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-base sm:text-xs font-bold text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                E-mail Corporativo
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="colaborador@mecanicagabriel.com.br"
                className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-base sm:text-xs font-bold text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Cargo & Atribuição de Oficina */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#d0d5dd] shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#f2f4f7]">
            <Briefcase size={16} weight="bold" className="text-[#0284c7]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#101828]">
              Cargo, Função & Oficina
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                Cargo Profissional <span className="text-red-500">*</span>
              </label>
              <Select
                options={CARGOS_FUNCIONARIO_OPCOES}
                value={cargoSelecionado}
                onChange={(opt) => handleChange('cargo', opt ? opt.value : 'mecanico')}
                placeholder="Selecione o cargo..."
                styles={customSelectStyles}
                isSearchable
              />
            </div>

            <div className="sm:col-span-6">
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                Especialidade Técnica
              </label>
              <input
                type="text"
                value={formData.especialidade}
                onChange={(e) => handleChange('especialidade', e.target.value)}
                placeholder="Ex: Suspensão, Injeção Eletrônica ou Câmbio"
                className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-base sm:text-xs font-bold text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                Box de Atendimento / Elevador Alocado
              </label>
              <input
                type="text"
                value={formData.boxElevador}
                onChange={(e) => handleChange('boxElevador', e.target.value)}
                placeholder="Ex: Box 01 (Elevador Hidráulico)"
                className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-base sm:text-xs font-bold text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                Data de Admissão
              </label>
              <input
                type="date"
                value={formData.dataAdmissao}
                onChange={(e) => handleChange('dataAdmissao', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-base sm:text-xs font-bold text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Bloco 3: Comissões & Jornada */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#d0d5dd] shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#f2f4f7]">
            <Percent size={16} weight="bold" className="text-[#0284c7]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#101828]">
              Parametrização de Comissões & Horário
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                Comissão Serviços (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.comissaoServicos}
                  onChange={(e) => handleChange('comissaoServicos', e.target.value)}
                  placeholder="0.0"
                  className="w-full h-10 pl-3 pr-8 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-base sm:text-xs font-bold font-mono text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-[#667085]">%</span>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-[#344054] block mb-1">
                Comissão Peças (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.comissaoPecas}
                  onChange={(e) => handleChange('comissaoPecas', e.target.value)}
                  placeholder="0.0"
                  className="w-full h-10 pl-3 pr-8 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-base sm:text-xs font-bold font-mono text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-[#667085]">%</span>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-[#344054] block mb-1 flex items-center gap-1">
                <Clock size={12} weight="bold" />
                <span>Horário de Trabalho</span>
              </label>
              <input
                type="text"
                value={formData.horarioTrabalho}
                onChange={(e) => handleChange('horarioTrabalho', e.target.value)}
                placeholder="08:00 às 19:00"
                className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-base sm:text-xs font-bold text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Bloco 4: Observações Gerais */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#d0d5dd] shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#f2f4f7]">
            <ChatText size={16} weight="bold" className="text-[#0284c7]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#101828]">
              Observações Internas
            </span>
          </div>

          <textarea
            rows={3}
            value={formData.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            placeholder="Anotações de certificações técnicas, histórico profissional ou observações internas..."
            className="w-full p-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] focus:bg-white text-base sm:text-xs font-medium text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all resize-none"
          />
        </div>
      </form>
    </ModalRedimensionavel>
  )
}
