import React, { createContext, useContext, useCallback } from 'react'
import { toast } from 'sonner'

const NoticeContext = createContext(null)

export function NoticeProvider({ children }) {
  const closeNotice = useCallback(() => {
    toast.dismiss()
  }, [])

  const openNotice = useCallback((message) => {
    toast.info(message)
  }, [])

  const openFeedback = useCallback((feedback) => {
    if (!feedback) return
    const msg = feedback.message || ''
    const title = feedback.title

    switch (feedback.severity) {
      case 'success':
        toast.success(title ? `${title}: ${msg}` : msg)
        break
      case 'error':
        toast.error(title ? `${title}: ${msg}` : msg)
        break
      case 'warning':
        toast.warning(title ? `${title}: ${msg}` : msg)
        break
      default:
        toast.info(title ? `${title}: ${msg}` : msg)
        break
    }
  }, [])

  return (
    <NoticeContext.Provider value={{ openNotice, openFeedback, closeNotice }}>
      {children}
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
