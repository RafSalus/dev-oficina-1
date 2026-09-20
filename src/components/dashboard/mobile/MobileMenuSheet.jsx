import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  SquaresFour,
  CalendarDots,
  ClipboardText,
  CreditCard,
  Users,
  CarProfile,
  Garage,
  ArrowsLeftRight,
  ShieldCheck,
  SealCheck,
  Wrench,
  WarningOctagon,
  Package,
  ShoppingCart,
  Receipt,
  FileText,
  ChartLineUp,
  IdentificationBadge,
  GearSix,
  Globe,
  SignOut,
  CaretRight,
  Buildings,
  Money,
  Hammer,
  Cube,
} from '@phosphor-icons/react'
import { MENU_CATEGORIES } from '../../../constants/dashboardMenus'
import { useAdminAuth } from '../../../context/AdminAuthContext'

const ICONS_MAP = {
  SquaresFour,
  CalendarDots,
  ClipboardText,
  CreditCard,
  Users,
  CarProfile,
  Garage,
  ArrowsLeftRight,
  ShieldCheck,
  SealCheck,
  Wrench,
  WarningOctagon,
  Package,
  ShoppingCart,
  Receipt,
  FileText,
  ChartLineUp,
  IdentificationBadge,
  GearSix,
  Globe,
  Money,
  Hammer,
  Cube,
}

export function MobileMenuSheet({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { signOut } = useAdminAuth()

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleNavigate = (path) => {
    onClose()
    navigate(path)
  }

  const handleSignOut = async () => {
    onClose()
    await signOut()
    navigate('/gestao/entrar', { replace: true })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/40 animate-in fade-in duration-150"
        onClick={onClose}
      />

      <div
        className="relative bg-white rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200 max-h-[86dvh]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#f2f4f7] shrink-0">
          <div>
            <h2 className="text-sm font-extrabold text-[#101828] tracking-tight">Todos os Módulos</h2>
            <p className="text-[11px] text-[#667085] font-medium">Navegue por toda a gestão da oficina</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="p-2 rounded-xl text-[#475467] active:bg-[#f2f4f7] transition-colors"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-3 space-y-4">
          {MENU_CATEGORIES.map((category) => (
            <div key={category.id}>
              <span className="block px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#98a2b3]">
                {category.title}
              </span>
              <div className="space-y-0.5">
                {category.items.map((item) => {
                  const IconComponent = ICONS_MAP[item.icon] || SquaresFour
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.path)}
                      className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left active:bg-[#f2f4f7] transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#f2f4f7] flex items-center justify-center shrink-0">
                        <IconComponent size={18} weight="regular" className="text-[#101828]" />
                      </div>
                      <span className="flex-1 text-xs font-semibold text-[#344054] truncate">
                        {item.label}
                      </span>
                      <CaretRight size={14} className="text-[#d0d5dd] shrink-0" />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="px-3 pt-2 pb-3 border-t border-[#f2f4f7] shrink-0">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#fef3f2] text-[#b42318] text-xs font-bold active:bg-[#fee4e2] transition-colors"
          >
            <SignOut size={16} weight="bold" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </div>
    </div>
  )
}
