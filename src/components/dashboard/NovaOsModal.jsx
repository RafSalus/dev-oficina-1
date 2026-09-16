import React, { useState, useEffect } from 'react'
import { X, Plus, Car, User, Phone, Wrench } from '@phosphor-icons/react'
import { useNotice } from '../../context/NoticeContext'

export function NovaOsModal({ isOpen, onClose }) {
  const { openNotice } = useNotice()
  const [placa, setPlaca] = useState('')
  const [cliente, setCliente] = useState('')
  const [telefone, setTelefone] = useState('')
  const [relato, setRelato] = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    openNotice(`Nova OS iniciada para o veículo ${placa || 'sem placa'}!`)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-nova-os-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs select-none"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#e4e7ec] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabeçalho do Modal */}
        <div className="px-6 py-4 border-b border-[#f2f4f7] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Plus size={16} weight="bold" />
            </div>
            <div>
              <h2 id="modal-nova-os-titulo" className="text-base font-bold text-[#101828]">
                Nova Ordem de Serviço
              </h2>
              <p className="text-xs text-[#667085]">
                Início de atendimento e abertura de diagnóstico
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#f2f4f7] transition-colors cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="os-placa" className="block text-xs font-semibold text-[#344054] mb-1.5 uppercase tracking-wider">
                Placa do Veículo
              </label>
              <div className="relative">
                <input
                  id="os-placa"
                  type="text"
                  required
                  placeholder="Ex: ABC-1D23"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                  className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3.5 h-11 text-sm font-bold text-[#101828] uppercase placeholder-[#98a2b3] focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="os-telefone" className="block text-xs font-semibold text-[#344054] mb-1.5 uppercase tracking-wider">
                Telefone / WhatsApp
              </label>
              <input
                id="os-telefone"
                type="tel"
                placeholder="(43) 90000-0000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3.5 h-11 text-sm font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="os-cliente" className="block text-xs font-semibold text-[#344054] mb-1.5 uppercase tracking-wider">
              Nome do Cliente
            </label>
            <input
              id="os-cliente"
              type="text"
              required
              placeholder="Nome completo ou Razão Social"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl px-3.5 h-11 text-sm font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="os-relato" className="block text-xs font-semibold text-[#344054] mb-1.5 uppercase tracking-wider">
              Relato do Cliente / Diagnóstico Inicial
            </label>
            <textarea
              id="os-relato"
              rows={3}
              placeholder="Descreva o motivo do atendimento, ruídos, luz da injeção acesa ou revisão programada..."
              value={relato}
              onChange={(e) => setRelato(e.target.value)}
              className="w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl p-3.5 text-sm font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-3 border-t border-[#f2f4f7] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#475467] hover:text-[#101828] hover:bg-[#f2f4f7] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#101828] hover:bg-black text-white rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              Criar Ordem de Serviço
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
