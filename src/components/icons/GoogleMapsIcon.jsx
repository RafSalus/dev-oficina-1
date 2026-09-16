import React from 'react'

export function GoogleMapsIcon({ className = 'w-4 h-4', ...props }) {
  return (
    <svg
      viewBox="0 0 92 134"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M46 0C20.59 0 0 20.59 0 46C0 58.07 4.54 69.07 12.02 77.41L46 134L79.98 77.41C87.46 69.07 92 58.07 92 46C92 20.59 71.41 0 46 0Z"
        fill="#34A853"
      />
      <path
        d="M46 0C20.59 0 0 20.59 0 46C0 58.07 4.54 69.07 12.02 77.41L46 134V0Z"
        fill="#4285F4"
      />
      <path
        d="M46 13C27.78 13 13 27.78 13 46C13 54.91 16.54 62.99 22.28 68.96L46 109.8L69.72 68.96C75.46 62.99 79 54.91 79 46C79 27.78 64.22 13 46 13Z"
        fill="#FBBC04"
      />
      <path
        d="M46 13C27.78 13 13 27.78 13 46C13 54.91 16.54 62.99 22.28 68.96L46 109.8V13Z"
        fill="#EA4335"
      />
      <circle cx="46" cy="46" r="15" fill="#FFFFFF" />
      <circle cx="46" cy="46" r="10" fill="#1A73E8" />
    </svg>
  )
}
