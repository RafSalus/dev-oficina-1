import React from 'react'
import { COMPANY } from '../constants/company'

export function BrandLogo({
  size = 'header',
  showName = true,
  nameClassName = '',
  markClassName = '',
}) {
  const isFooter = size === 'footer'

  return (
    <span className="flex items-center gap-2">
      <img
        src="/favicon-96x96.png"
        alt=""
        aria-hidden="true"
        data-testid="brand-mark"
        className={`${isFooter ? 'w-12 h-12' : 'w-10 h-10'} shrink-0 object-contain ${markClassName}`}
      />
      {showName && (
        <span
          className={`font-bold tracking-tight ${
            isFooter ? 'text-2xl' : 'text-xl'
          } ${nameClassName}`}
        >
          {COMPANY.shortName}
        </span>
      )}
    </span>
  )
}
