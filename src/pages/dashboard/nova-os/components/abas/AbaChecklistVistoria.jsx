import { useRef } from 'react'
import { Camera, Info, PaperPlaneTilt, ShieldCheck, Sparkle, Trash } from '@phosphor-icons/react'
import { FOTOS_VEICULO_TIPOS, ITENS_CHECKLIST_ENTRADA } from '../../../../../constants/checklistItems'
import { SecaoForm } from '../formularioAberturaShared'

export function AbaChecklistVistoria({
  checklistEntrada,
  preenchidosCount,
  totalItens,
  naoConformesCount,
  fotosVeiculoEntrada,
  updateFormData,
  onEnviarAssinatura,
}) {
  const inputRefsFoto = useRef({})

  const handleMarcarTodosConformes = () => {
    const todosOk = {}
    ITENS_CHECKLIST_ENTRADA.forEach((item) => {
      todosOk[item.id] = { status: 'conforme', obs: '' }
    })
    updateFormData({ checklistEntrada: todosOk })
  }

  const handleLimparChecklist = () => {
    const limpo = {}
    ITENS_CHECKLIST_ENTRADA.forEach((item) => {
      limpo[item.id] = { status: '', obs: '' }
    })
    updateFormData({ checklistEntrada: limpo })
  }

  const handleStatusItem = (itemId, status) => {
    const atual = checklistEntrada[itemId] || { status: '', obs: '' }
    const novoStatus = atual.status === status ? '' : status
    updateFormData({ checklistEntrada: { ...checklistEntrada, [itemId]: { ...atual, status: novoStatus } } })
  }

  const handleObsItem = (itemId, obs) => {
    const atual = checklistEntrada[itemId] || { status: '', obs: '' }
    updateFormData({ checklistEntrada: { ...checklistEntrada, [itemId]: { ...atual, obs } } })
  }

  const handleSelecionarFoto = (tipoId, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      updateFormData({
        fotosVeiculoEntrada: { ...(fotosVeiculoEntrada || {}), [tipoId]: ev.target.result },
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemoverFoto = (tipoId) => {
    const copia = { ...(fotosVeiculoEntrada || {}) }
    delete copia[tipoId]
    updateFormData({ fotosVeiculoEntrada: copia })
  }

  const totalFotos = FOTOS_VEICULO_TIPOS.length
  const fotosPreenchidas = FOTOS_VEICULO_TIPOS.filter((t) => fotosVeiculoEntrada?.[t.id]).length

  return (
    <>
      {/* FOTOS DO VEICULO NA ENTRADA */}
      <SecaoForm
        icone={Camera}
        titulo="Fotos do Veiculo na Entrada"
        acessorio={
          <span className="text-[10px] font-bold text-[#475467]">
            {fotosPreenchidas}/{totalFotos} fotos
          </span>
        }
      >
        <div className="grid grid-cols-3 @sm:grid-cols-4 @md:grid-cols-7 gap-2">
          {FOTOS_VEICULO_TIPOS.map((tipo) => {
            const foto = fotosVeiculoEntrada?.[tipo.id]
            return (
              <div key={tipo.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => !foto && inputRefsFoto.current[tipo.id]?.click()}
                  className={`relative w-full aspect-square rounded-xl border overflow-hidden flex flex-col items-center justify-center gap-1 transition-all ${
                    foto
                      ? 'border-[#0284c7] cursor-default'
                      : 'border-dashed border-[#d0d5dd] bg-[#f8fafc] hover:border-[#0284c7] hover:bg-[#f0f9ff] cursor-pointer'
                  }`}
                >
                  {foto ? (
                    <img src={foto} alt={tipo.label} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera size={16} weight="bold" className="text-[#98a2b3]" />
                      <span className="text-[8px] font-bold text-[#98a2b3]">Tirar Foto</span>
                    </>
                  )}
                  {foto && (
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoverFoto(tipo.id)
                      }}
                      title="Remover foto"
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                    >
                      <Trash size={11} weight="bold" />
                    </span>
                  )}
                </button>
                <p className="text-[9px] font-bold text-[#475467] text-center truncate">{tipo.label}</p>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={(el) => (inputRefsFoto.current[tipo.id] = el)}
                  onChange={(e) => handleSelecionarFoto(tipo.id, e)}
                  className="hidden"
                />
              </div>
            )
          })}
        </div>
      </SecaoForm>

      <SecaoForm
        icone={ShieldCheck}
        titulo="Vistoria de Entrada"
        acessorio={
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#475467]">
              {preenchidosCount}/{totalItens}
              {naoConformesCount > 0 && (
                <span className="text-amber-700"> • {naoConformesCount} nao conforme</span>
              )}
            </span>
            <button
              type="button"
              onClick={handleMarcarTodosConformes}
              title="Marcar todos os itens como Conforme"
              className="h-7 px-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-all active:scale-95"
            >
              <Sparkle size={11} weight="fill" />
              <span>Tudo OK</span>
            </button>
            <button
              type="button"
              onClick={handleLimparChecklist}
              className="h-7 px-2 rounded-lg bg-white text-[#475467] hover:text-rose-600 border border-[#d0d5dd] text-[10px] font-semibold cursor-pointer"
            >
              Limpar
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-1.5">
          {ITENS_CHECKLIST_ENTRADA.map((item) => {
            const itemState = checklistEntrada[item.id] || { status: '', obs: '' }
            const isConforme = itemState.status === 'conforme'
            const isNaoConforme = itemState.status === 'nao_conforme'
            const isIsento = itemState.status === 'isento'

            return (
              <div
                key={item.id}
                className={`p-1.5 rounded-lg border transition-all ${
                  isConforme
                    ? 'bg-[#f0f9ff]/60 border-[#bae6fd]'
                    : isNaoConforme
                    ? 'bg-rose-50/60 border-rose-200'
                    : isIsento
                    ? 'bg-[#f8fafc] border-[#e4e7ec]'
                    : 'bg-white border-[#e4e7ec] hover:border-[#d0d5dd]'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[10.5px] font-bold text-[#101828] truncate" title={item.desc}>
                    {item.label}
                  </p>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStatusItem(item.id, 'conforme')}
                      title="Conforme"
                      className={`h-5.5 px-1.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                        isConforme ? 'bg-[#0284c7] text-white' : 'bg-white text-[#475467] border border-[#d0d5dd] hover:bg-[#f0f9ff]'
                      }`}
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusItem(item.id, 'nao_conforme')}
                      title="Nao Conforme"
                      className={`h-5.5 px-1.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                        isNaoConforme ? 'bg-rose-600 text-white' : 'bg-white text-[#475467] border border-[#d0d5dd] hover:bg-rose-50'
                      }`}
                    >
                      Nao
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusItem(item.id, 'isento')}
                      title="Nao se Aplica"
                      className={`h-5.5 px-1 rounded text-[9px] font-bold transition-all cursor-pointer ${
                        isIsento ? 'bg-[#101828] text-white' : 'bg-white text-[#667085] border border-[#d0d5dd] hover:bg-[#f2f4f7]'
                      }`}
                    >
                      N/A
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={itemState.obs || ''}
                  onChange={(e) => handleObsItem(item.id, e.target.value)}
                  placeholder="Observacao (opcional)..."
                  className={`mt-1 w-full h-6 px-1.5 text-[9.5px] rounded border bg-white focus:outline-none focus:ring-1 font-medium ${
                    isNaoConforme
                      ? 'border-rose-300 text-rose-900 focus:ring-rose-500'
                      : 'border-[#e4e7ec] text-[#344054] focus:ring-[#0284c7] focus:border-[#0284c7]'
                  }`}
                />
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-1.5 text-[9.5px] text-[#667085]">
          <Info size={12} weight="bold" className="text-[#0284c7] shrink-0" />
          <span>O Checklist de Saida acontece na entrega do veiculo, antes do faturamento no PDV.</span>
        </div>

        {onEnviarAssinatura && (
          <button
            type="button"
            onClick={onEnviarAssinatura}
            title="Salva a OS e envia o link do checklist pelo WhatsApp para o cliente assinar digitalmente"
            className="w-full h-10 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <PaperPlaneTilt size={15} weight="bold" />
            <span>Enviar Checklist para o Cliente Assinar</span>
          </button>
        )}
      </SecaoForm>
    </>
  )
}
