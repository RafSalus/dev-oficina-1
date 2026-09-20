import React, { useState, useMemo, useEffect } from 'react'
import { X, Car, MagnifyingGlass, PencilSimple, Copy, IdentificationBadge, Phone, MapPin } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { formatarCPF, formatarCNPJ, formatarTelefone } from '../../../../utils/fiscalValidators'
import { inputBaseClass } from '../../nova-os/mobile/mobileSelectStyles'

export function MobileClienteFrotaModal({ isOpen, onClose, cliente, onEditarCliente }) {
  const [busca, setBusca] = useState('')

  useEffect(() => {
    if (isOpen) setBusca('')
  }, [isOpen, cliente?.value, cliente?.id])

  const veiculos = useMemo(() => (Array.isArray(cliente?.veiculos) ? cliente.veiculos : []), [cliente?.veiculos])

  const veiculosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return veiculos
    return veiculos.filter((v) => {
      return (
        (v.placa || '').toLowerCase().includes(termo) ||
        (v.marca || '').toLowerCase().includes(termo) ||
        (v.modelo || '').toLowerCase().includes(termo) ||
        (v.marcaModelo || '').toLowerCase().includes(termo) ||
        (v.ano || '').toLowerCase?.().includes(termo) ||
        (v.cor || '').toLowerCase().includes(termo)
      )
    })
  }, [veiculos, busca])

  if (!isOpen || !cliente) return null

  const docLimpo = (cliente.documento || '').replace(/\D/g, '')
  const isPF = cliente.tipoPessoa === 'F' || (!cliente.tipoPessoa && docLimpo.length <= 11)
  const docFormatado = isPF ? formatarCPF(docLimpo) : formatarCNPJ(docLimpo)

  const handleCopiarPlaca = (placa) => {
    if (!placa) return
    navigator.clipboard.writeText(placa)
    toast.success(`Placa ${placa} copiada!`)
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#eaecf0] flex flex-col">
      <header className="shrink-0 bg-white border-b border-[#e4e7ec]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="h-14 px-2 flex items-center justify-between gap-2">
          <button type="button" onClick={onClose} aria-label="Fechar" className="p-2.5 rounded-xl text-[#475467] active:bg-[#f2f4f7] shrink-0">
            <X size={20} weight="bold" />
          </button>
          <span className="text-sm font-extrabold text-[#101828] truncate">Frota de {cliente.nome}</span>
          <div className="w-9 shrink-0" />
        </div>
      </header>

      <div className="shrink-0 bg-white border-b border-[#e4e7ec] px-4 py-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] text-[#667085]">
          <IdentificationBadge size={13} />
          <span>{isPF ? 'CPF:' : 'CNPJ:'}</span>
          <span className="font-mono font-bold text-[#344054]">{docFormatado || cliente.documento || 'Não informado'}</span>
        </div>
        {cliente.telefone && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#667085]">
            <Phone size={13} />
            <span className="font-mono font-bold text-[#344054]">{formatarTelefone(cliente.telefone)}</span>
          </div>
        )}
        {(cliente.cidade || cliente.uf) && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#667085]">
            <MapPin size={13} />
            <span className="font-bold text-[#344054]">{cliente.cidade || 'Apucarana'} - {cliente.uf || 'PR'}</span>
          </div>
        )}
      </div>

      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4">
        <div className="relative mb-3">
          <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por placa, marca, modelo ou cor..."
            className={`${inputBaseClass} pl-10`}
          />
        </div>

        <p className="text-[11px] text-[#667085] mb-2.5">
          Exibindo <strong className="text-[#101828]">{veiculosFiltrados.length}</strong> de <strong className="text-[#101828]">{veiculos.length}</strong> veículos
        </p>

        {veiculosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14">
            <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
              <Car size={22} weight="duotone" />
            </div>
            <p className="text-sm font-bold text-[#101828]">Nenhum veículo encontrado</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {veiculosFiltrados.map((v, idx) => (
              <div key={v.value || v.placa || idx} className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-[#f2f4f7] border border-[#e4e7ec] text-[#101828]">{v.placa}</span>
                    <button type="button" onClick={() => handleCopiarPlaca(v.placa)} className="p-1 text-[#98a2b3] active:text-[#0284c7]">
                      <Copy size={13} />
                    </button>
                  </div>
                  <span className="font-mono text-[10.5px] text-[#98a2b3]">{v.codigoVeiculo || '—'}</span>
                </div>
                <p className="text-sm font-extrabold text-[#101828] mt-1.5">{v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim() || 'Não especificado'}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10.5px] text-[#667085]">{v.ano || '—'}</span>
                  <span className="text-[10.5px] text-[#667085]">• {v.cor || '—'}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">{v.combustivel || 'FLEX'}</span>
                </div>
                {v.kmPadrao && <p className="text-[10.5px] font-mono text-[#667085] mt-1">{v.kmPadrao} km</p>}
              </div>
            ))}
          </div>
        )}
      </main>

      {onEditarCliente && (
        <footer className="shrink-0 bg-white border-t border-[#e4e7ec] px-4 py-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}>
          <button
            type="button"
            onClick={() => { onClose(); onEditarCliente(cliente) }}
            className="w-full h-12 rounded-xl border border-[#d0d5dd] bg-white text-[#344054] text-sm font-bold flex items-center justify-center gap-2"
          >
            <PencilSimple size={16} weight="bold" />
            Gerenciar Frota no Cadastro
          </button>
        </footer>
      )}
    </div>
  )
}
