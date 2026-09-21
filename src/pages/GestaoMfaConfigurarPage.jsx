import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Copy, Check, SignOut, QrCode } from '@phosphor-icons/react'
import { IMaskInput } from 'react-imask'
import { ManagementAuthLayout } from '../layouts/ManagementAuthLayout'
import { useAdminAuth } from '../context/AdminAuthContext'
import { toast } from 'sonner'

export function GestaoMfaConfigurarPage() {
  const { enrollMfa, verifyMfa, signOut } = useAdminAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [factorId, setFactorId] = useState(null)
  const [qrCodeData, setQrCodeData] = useState(null)
  const [secretKey, setSecretKey] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function initEnroll() {
      setLoading(true)
      const res = await enrollMfa()
      if (isMounted) {
        if (res.ok) {
          setFactorId(res.factorId)
          setQrCodeData(res.qrCode)
          setSecretKey(res.secret)
        } else {
          toast.error(res.message || 'Falha ao inicializar configuração MFA.')
        }
        setLoading(false)
      }
    }
    initEnroll()
    return () => {
      isMounted = false
    }
  }, [enrollMfa])

  const handleCopySecret = async () => {
    if (!secretKey) return
    try {
      await navigator.clipboard.writeText(secretKey)
      setCopied(true)
      toast.success('Chave secreta copiada para a área de transferência!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.info(`Chave: ${secretKey}`)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const clean = totpCode.replace(/\D/g, '')
    if (clean.length !== 6) {
      toast.error('Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador.')
      return
    }

    setSubmitting(true)
    try {
      const res = await verifyMfa(factorId, clean)
      if (res.ok) {
        toast.success('Autenticação de dois fatores ativada com sucesso! Acesso liberado.')
        navigate('/gestao/dashboard', { replace: true })
      } else {
        toast.error(res.message || 'Código inválido ou expirado.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ManagementAuthLayout>
      <main className="w-full max-w-lg mx-auto px-4 sm:px-6 my-auto py-6 overflow-hidden">
        <div className="bg-white border border-gray-100/90 rounded-2xl shadow-sm overflow-hidden border-t-4 border-t-brand-blue transition-all p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#e0f2fe] flex items-center justify-center text-[#0284c7] shrink-0">
              <ShieldCheck size={28} weight="duotone" />
            </div>
            <div>
              <span aria-hidden="true" className="block w-8 h-1 bg-brand-blue rounded-full mb-1" />
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
                Configurar Segundo Fator (MFA)
              </h1>
            </div>
          </div>

          <p className="text-xs text-[#475467] leading-relaxed mb-5">
            Escaneie o QR Code abaixo com seu aplicativo autenticador (Google Authenticator, Microsoft Authenticator ou 1Password) para proteger o acesso administrativo.
          </p>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-xs text-[#667085]">
              <div className="w-8 h-8 border-2 border-[#e0f2fe] border-t-[#0284c7] rounded-full animate-spin mb-3" />
              <span>Gerando chave criptográfica de segurança...</span>
            </div>
          ) : (
            <form onSubmit={handleVerify} noValidate>
              {/* Card Central com QR Code e Chave */}
              <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-4 mb-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-32 h-32 bg-white p-2 rounded-xl border border-[#d0d5dd] flex items-center justify-center shrink-0 shadow-2xs">
                  {qrCodeData?.startsWith('data:') || qrCodeData?.startsWith('http') ? (
                    <img src={qrCodeData} alt="QR Code MFA" className="w-full h-full object-contain" />
                  ) : qrCodeData?.includes('<svg') ? (
                    <div
                      className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: qrCodeData }}
                    />
                  ) : (
                    <QrCode size={64} className="text-[#0284c7]" />
                  )}
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block mb-1">
                    Chave para Entrada Manual
                  </span>
                  <div className="flex items-center gap-2 bg-white border border-[#d0d5dd] rounded-xl px-3 py-2">
                    <span className="font-mono text-xs font-bold text-[#101828] truncate flex-1 select-all">
                      {secretKey || 'Chave indisponível'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="text-[#0284c7] hover:text-[#0369a1] p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Copiar chave secreta"
                    >
                      {copied ? <Check size={16} weight="bold" /> : <Copy size={16} weight="bold" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-[#667085] mt-1.5 block">
                    Tipo: Base32 TOTP • Tempo: 30 segundos
                  </span>
                </div>
              </div>

              {/* Digitação do Token de 6 Dígitos */}
              <div className="mb-6">
                <label
                  htmlFor="totp-code"
                  className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider text-center"
                >
                  Digite o código de 6 dígitos
                </label>
                <IMaskInput
                  id="totp-code"
                  name="totp-code"
                  mask="000000"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={totpCode}
                  onAccept={(val) => setTotpCode(val)}
                  placeholder="000000"
                  autoFocus
                  className="w-full h-14 text-center tracking-[0.4em] font-mono text-2xl font-bold bg-[#f8fafc] focus:bg-white border-2 border-[#d0d5dd] focus:border-[#0284c7] rounded-xl text-[#101828] focus:outline-none transition-all"
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col gap-2.5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] active:scale-[0.99] text-xs font-bold text-white transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#0284c7] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Verificando chave...' : 'Confirmar e Ativar Segundo Fator'}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await signOut()
                    navigate('/gestao/entrar', { replace: true })
                  }}
                  className="w-full h-10 px-4 rounded-xl border border-[#d0d5dd] text-xs font-semibold text-[#344054] bg-white hover:bg-[#f8fafc] transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0284c7] cursor-pointer"
                >
                  <SignOut size={16} />
                  Cancelar e Sair
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </ManagementAuthLayout>
  )
}
