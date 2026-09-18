import React from 'react'
import { useLocation } from 'react-router-dom'
import { SquaresFour } from '@phosphor-icons/react'

export function MobilePortalComingSoon({ menuCategories, iconsMap, extraPathMatches = [] }) {
  const location = useLocation()

  let currentItem = null
  let currentCategory = null

  for (const cat of menuCategories) {
    const found = cat.items.find(
      (item) => item.path === location.pathname || extraPathMatches.includes(location.pathname)
    )
    if (found) {
      currentItem = found
      currentCategory = cat
      break
    }
  }

  const title = currentItem?.label || 'Módulo'
  const categoryTitle = currentCategory?.title || 'Operações'
  const description = currentItem?.description || 'Recurso em fase de estruturação e parametrização.'
  const IconComponent = (currentItem && iconsMap[currentItem.icon]) || SquaresFour

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center select-none">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#98a2b3] mb-6 uppercase tracking-wider">
        <span>{categoryTitle}</span>
        <span>•</span>
        <span className="text-[#101828]">{title}</span>
      </div>

      <div className="w-16 h-16 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center mb-5">
        <IconComponent size={30} weight="duotone" className="text-[#101828]" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e0f2fe] text-[#0369a1] text-xs font-bold mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
        Em breve no aplicativo
      </div>

      <h1 className="text-xl font-extrabold text-[#101828] tracking-tight mb-2.5">{title}</h1>
      <p className="text-xs text-[#475467] max-w-xs leading-relaxed">{description}</p>
    </div>
  )
}
