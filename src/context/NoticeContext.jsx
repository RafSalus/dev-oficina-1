import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'
import { X } from '@phosphor-icons/react'

const NoticeContext = createContext(null)

const SEVERITY_STYLES = {
  info: 'bg-gray-800 border-gray-700 text-white',
  success: 'bg-green-800 border-green-700 text-white',
  error: 'bg-red-800 border-red-700 text-white',
  warning: 'bg-amber-800 border-amber-700 text-white',
}

const SEVERITY_ROLES = {
  info: 'status',
  success: 'status',
  error: 'alert',
  warning: 'status',
}

const AUTO_DISMISS_MS = 6000

export function NoticeProvider({ children }) {
  const [notice, setNotice] = useState(null)
  const noticeRef = useRef(null)
  const timerRef = useRef(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const closeNotice = useCallback(() => {
    clearTimer()
    setNotice(null)
  }, [clearTimer])

  const openNotice = useCallback((message) => {
    setNotice({ severity: 'info', message })
  }, [])

  const openFeedback = useCallback((feedback) => {
    setNotice(feedback)
  }, [])

  useEffect(() => {
    if (!notice || notice.persistent) return
    clearTimer()
    timerRef.current = setTimeout(closeNotice, AUTO_DISMISS_MS)
    return () => clearTimer()
  }, [notice, closeNotice, clearTimer])

  useEffect(() => {
    if (!notice) return
    noticeRef.current?.focus()
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeNotice()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [notice, closeNotice])

  const role = notice ? SEVERITY_ROLES[notice.severity] || 'status' : 'status'
  const style = notice ? SEVERITY_STYLES[notice.severity] || SEVERITY_STYLES.info : ''

  return (
    <NoticeContext.Provider value={{ openNotice, openFeedback, closeNotice }}>
      {children}
      {notice && (
        <div
          ref={noticeRef}
          role={role}
          aria-live={role === 'alert' ? 'assertive' : 'polite'}
          tabIndex={-1}
          onMouseEnter={clearTimer}
          onFocus={clearTimer}
          onMouseLeave={() => {
            if (!notice.persistent) {
              timerRef.current = setTimeout(closeNotice, AUTO_DISMISS_MS)
            }
          }}
          className={`fixed bottom-4 left-4 right-4 z-[60] flex items-center justify-between gap-4 border px-5 py-4 shadow-2xl rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md ${style}`}
        >
          <div className="min-w-0">
            {notice.title && <p className="font-bold text-sm mb-1">{notice.title}</p>}
            <p className="text-sm leading-snug">{notice.message}</p>
          </div>
          <button
            type="button"
            onClick={closeNotice}
            aria-label="Fechar notificação"
            className="shrink-0 p-1 hover:opacity-80 transition-opacity rounded-sm focus-visible:outline-2 focus-visible:outline-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </NoticeContext.Provider>
  )
}

export function useNotice() {
  const context = useContext(NoticeContext)
  if (!context) {
    throw new Error('useNotice must be used within a NoticeProvider')
  }
  return context
}
