import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ShieldCheck, Copy, Check, SignOut, QrCode, ArrowClockwise, WarningCircle } from '@phosphor-icons/react'
import { IMaskInput } from 'react-imask'
import QRCode from 'qrcode'
import { ManagementAuthLayout } from '../layouts/ManagementAuthLayout'
import { useAdminAuth, caminhoDashboardPorPapel } from '../context/AdminAuthContext'
import { toast } from 'sonner'

/**
 * Formata uma chave Base32 TOTP em blocos de 4 caracteres legíveis para facilitar digitação manual
 * @param {string} secret
 * @returns {string}
 */
function formatarSecretEmBlocos(secret) {
  if (!secret) return ''
  const clean = String(secret).replace(/\s+/g, '')
  return clean.match(/.{1,4}/g)?.join(' ') || clean
}

export function GestaoMfaConfigurarPage() {
  const { enrollMfa, verifyMfa, signOut, role } = useAdminAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [factorId, setFactorId] = useState(null)
  const [qrCodeData, setQrCodeData] = useState(null)
  const [secretKey, setSecretKey] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const hasInitializedRef = useRef(false)

  const initEnroll = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const res = await enrollMfa()
      if (res.ok) {
        setFactorId(res.factorId)
        setSecretKey(res.secret)

        // Gera QR Code de alta resolução com QRCode padrão (PNG 260px com quiet zone pura)
        if (res.uri) {
          try {
            const pngDataUrl = await QRCode.toDataURL(res.uri, {
              width: 260,
              margin: 2,
              errorCorrectionLevel: 'M',
              color: {
                dark: '#000000',
                light: '#ffffff',
              },
            })
            setQrCodeData(pngDataUrl)
          } catch (qrErr) {
            console.warn('[MFA] Fallback para QR code do Supabase:', qrErr)
            setQrCodeData(res.qrCode)
          }
        } else {
          setQrCodeData(res.qrCode)
        }
      } else {
        const msg = res.message || 'Falha ao inicializar configuração MFA.'
        setErrorMessage(msg)
        toast.error(msg)
      }
    } catch (err) {
      const msg = err.message || 'Erro inesperado ao gerar chave MFA.'
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [enrollMfa])

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      initEnroll()
    }
  }, [initEnroll])

  const handleCopySecret = async () => {
    if (!secretKey) return
    const cleanSecret = secretKey.replace(/\s+/g, '')
    try {
      await navigator.clipboard.writeText(cleanSecret)
      setCopied(true)
      toast.success('Chave secreta copiada para a área de transferência!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.info(`Chave: ${cleanSecret}`)
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
        navigate(returnUrl || caminhoDashboardPorPapel(role), { replace: true })
      } else {
        toast.error(res.message || 'Código inválido ou expirado.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const renderQrCode = () => {
    if (!qrCodeData) {
      return <QrCode size={72} className="text-[#0284c7]" />
    }
    // Caso 1: Data URL gerada via qrcode (PNG puro em base64) ou URL HTTP
    if (qrCodeData.startsWith('data:image/png') || qrCodeData.startsWith('http')) {
      return (
        <img
          src={qrCodeData}
          alt="QR Code MFA"
          className="w-full h-full object-contain select-none"
        />
      )
    }
    // Caso 2: String SVG nativa ou data URI contendo SVG
    if (qrCodeData.startsWith('data:image/svg+xml;utf-8,') || qrCodeData.includes('<svg')) {
      const rawSvg = qrCodeData.startsWith('data:image/svg+xml;utf-8,')
        ? decodeURIComponent(qrCodeData.replace('data:image/svg+xml;utf-8,', ''))
        : qrCodeData
      return (
        <div
          className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: rawSvg }}
        />
      )
    }
    // Caso 3: Fallback genérico para data URI
    if (qrCodeData.startsWith('data:')) {
      return (
        <img
          src={qrCodeData}
          alt="QR Code MFA"
          className="w-full h-full object-contain select-none"
        />
      )
    }
    return <QrCode size={72} className="text-[#0284c7]" />
  }

  return (
    <ManagementAuthLayout>
      <main className="w-full max-w-lg mx-auto px-4 sm:px-6 my-auto py-6 overflow-hidden">
        <div className="bg-white border border-gray-100/90 rounded-2xl shadow-sm overflow-hidden border-t-4 border-t-brand-blue transition-all p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
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

          <p className="text-xs text-[#475467] leading-relaxed mb-4">
            Abra seu aplicativo autenticador (Google Authenticator, Microsoft Authenticator ou 1Password) e aponte a câmera para o QR Code abaixo.
          </p>

          {loading ? (
            <div className="py-14 flex flex-col items-center justify-center text-xs text-[#667085]">
              <div className="w-10 h-10 border-3 border-[#e0f2fe] border-t-[#0284c7] rounded-full animate-spin mb-3" />
              <span className="font-medium">Gerando chave criptográfica de segurança...</span>
            </div>
          ) : errorMessage && !secretKey ? (
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
                <WarningCircle size={28} weight="duotone" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 mb-1">Não foi possível carregar a chave</h2>
              <p className="text-xs text-[#475467] leading-relaxed max-w-sm mb-5">
                {errorMessage}
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => initEnroll()}
                  className="flex-1 h-11 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  <ArrowClockwise size={16} weight="bold" />
                  Tentar novamente
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut()
                    navigate('/gestao/entrar', { replace: true })
                  }}
                  className="h-11 px-4 rounded-xl border border-[#d0d5dd] text-xs font-semibold text-[#344054] bg-white hover:bg-[#f8fafc] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <SignOut size={16} />
                  Voltar ao login
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerify} noValidate>
              {/* Card Central com QR Code em Alta Resolução */}
              <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-4 sm:p-5 mb-5 flex flex-col items-center">
                <div className="w-52 h-52 sm:w-60 sm:h-60 bg-white p-3 rounded-2xl border-2 border-[#d0d5dd] flex items-center justify-center shrink-0 shadow-sm mb-4">
                  {renderQrCode()}
                </div>

                <div className="w-full">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block mb-1 text-center">
                    Ou digite a chave manual no aplicativo
                  </span>
                  <div className="flex items-center gap-2 bg-white border border-[#d0d5dd] rounded-xl px-3 py-2">
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#101828] text-center tracking-wider flex-1 select-all break-all">
                      {formatarSecretEmBlocos(secretKey) || 'Chave indisponível'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="text-[#0284c7] hover:text-[#0369a1] p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Copiar chave secreta"
                      aria-label="Copiar chave secreta"
                    >
                      {copied ? <Check size={18} weight="bold" /> : <Copy size={18} weight="bold" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-[#667085] mt-1.5 block text-center">
                    Conta: <strong>Mecanica Gabriel</strong> • Tipo: TOTP • 30 segundos
                  </span>
                </div>
              </div>

              {/* Digitação do Token de 6 Dígitos */}
              <div className="mb-5">
                <label
                  htmlFor="totp-code"
                  className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider text-center"
                >
                  Digite o código de 6 dígitos gerado
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
