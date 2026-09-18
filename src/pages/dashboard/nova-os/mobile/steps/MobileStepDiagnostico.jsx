import React, { useRef, useState } from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { User, Wrench, Package, Camera, Trash, Sparkle, ArrowsClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { MOCK_MECANICOS } from '../../../../../constants/mecanicos'
import { SUGESTOES_PECAS, SUGESTOES_SERVICOS, gerarLaudoTecnico } from '../../../../../constants/catalogoPecasServicos'
import { MobileStepFooter } from '../MobileStepFooter'
import { MobileLaudoTecnicoModal } from '../MobileLaudoTecnicoModal'
import { mobileSelectStyles, inputBaseClass, labelBaseClass } from '../mobileSelectStyles'

// Reflui o texto do laudo (gerado no formato de impressão, com linha
// separadora larga e parágrafo final quebrado manualmente em 74 colunas)
// para uma leitura confortável em telas estreitas de celular.
function formatarLaudoParaMobile(textoBruto) {
  const marcador = 'PARECER TÉCNICO FINAL:'
  const posicao = textoBruto.indexOf(marcador)

  const cabecalho = (posicao === -1 ? textoBruto : textoBruto.slice(0, posicao))
    .split('\n')
    .filter((linha) => !/^=+$/.test(linha.trim()))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (posicao === -1) return cabecalho

  const parecer = textoBruto
    .slice(posicao + marcador.length)
    .split('\n')
    .map((linha) => linha.trim())
    .filter(Boolean)
    .join(' ')

  return `${cabecalho}\n\n${marcador}\n${parecer}`
}

export function MobileStepDiagnostico({ formData, updateFormData, onContinue }) {
  const {
    mecanicoId = '',
    pecasDiagnostico = [],
    servicosDiagnostico = [],
    laudoTecnico = '',
  } = formData

  const [pecaSelecionada, setPecaSelecionada] = useState(null)
  const [quantidadePeca, setQuantidadePeca] = useState('1')
  const [obsPeca, setObsPeca] = useState('')
  const [fotoTempPeca, setFotoTempPeca] = useState(null)
  const [fotoTempNome, setFotoTempNome] = useState('')
  const fileInputRef = useRef(null)

  const [servicoSelecionado, setServicoSelecionado] = useState(null)
  const [obsServico, setObsServico] = useState('')
  const [laudoModalAberto, setLaudoModalAberto] = useState(false)

  const selectedMecanicoOption = MOCK_MECANICOS.find((m) => m.value === mecanicoId) || MOCK_MECANICOS[0]

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoTempNome(file.name)
    const reader = new FileReader()
    reader.onload = (event) => setFotoTempPeca(event.target.result)
    reader.readAsDataURL(file)
  }

  const handleAdicionarPeca = () => {
    const nome = pecaSelecionada?.value || pecaSelecionada?.label
    if (!nome?.trim()) {
      toast.warning('Selecione ou digite o nome da peça.')
      return
    }
    const novaPeca = {
      id: `peca-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nome: nome.trim(),
      quantidade: quantidadePeca || '1',
      observacao: obsPeca.trim(),
      fotoUrl: fotoTempPeca || null,
      fotoNome: fotoTempNome || null,
    }
    updateFormData({ pecasDiagnostico: [...pecasDiagnostico, novaPeca] })
    toast.success(`Peça "${nome.trim()}" adicionada ao diagnóstico!`)
    setPecaSelecionada(null)
    setQuantidadePeca('1')
    setObsPeca('')
    setFotoTempPeca(null)
    setFotoTempNome('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoverPeca = (id) => {
    updateFormData({ pecasDiagnostico: pecasDiagnostico.filter((p) => p.id !== id) })
  }

  const handleAdicionarServico = () => {
    const nome = servicoSelecionado?.value || servicoSelecionado?.label
    if (!nome?.trim()) {
      toast.warning('Selecione ou digite o nome do serviço.')
      return
    }
    const novoServico = {
      id: `serv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nome: nome.trim(),
      observacao: obsServico.trim(),
    }
    updateFormData({ servicosDiagnostico: [...servicosDiagnostico, novoServico] })
    toast.success(`Serviço "${nome.trim()}" adicionado ao diagnóstico!`)
    setServicoSelecionado(null)
    setObsServico('')
  }

  const handleRemoverServico = (id) => {
    updateFormData({ servicosDiagnostico: servicosDiagnostico.filter((s) => s.id !== id) })
  }

  const construirLaudo = () =>
    formatarLaudoParaMobile(
      gerarLaudoTecnico({
        cliente: formData.cliente,
        documento: formData.documento,
        placa: formData.placa,
        marcaModelo: formData.marcaModelo,
        ano: formData.ano,
        km: formData.km,
        relatoCliente: formData.relatoCliente,
        mecanicoNome: formData.mecanicoNome,
        pecas: pecasDiagnostico,
        servicos: servicosDiagnostico,
      })
    )

  const handleGerarLaudo = () => {
    updateFormData({ laudoTecnico: construirLaudo() })
    setLaudoModalAberto(true)
  }

  return (
    <div>
      {/* Mecânico Responsável */}
      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3">
        <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#f2f4f7]">
          <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0">
            <User size={18} weight="bold" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#101828] leading-tight">Mecânico Responsável</h2>
            <p className="text-xs text-[#667085] mt-0.5">Atribuição do diagnóstico técnico</p>
          </div>
        </div>
        <Select
          value={selectedMecanicoOption}
          onChange={(opt) => updateFormData({ mecanicoId: opt?.value || '', mecanicoNome: opt?.value ? opt.nome : '' })}
          options={MOCK_MECANICOS}
          isSearchable
          styles={mobileSelectStyles}
          placeholder="Selecionar mecânico..."
        />
      </div>

      {/* Peças Diagnosticadas */}
      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3">
        <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#f2f4f7]">
          <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0">
            <Package size={18} weight="bold" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#101828] leading-tight">Peças Avariadas</h2>
            <p className="text-xs text-[#667085] mt-0.5">Identificadas na inspeção técnica</p>
          </div>
        </div>

        {pecasDiagnostico.length > 0 && (
          <div className="space-y-2 mb-3">
            {pecasDiagnostico.map((p) => (
              <div key={p.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#f8fafc] border border-[#d0d5dd]">
                {p.fotoUrl ? (
                  <img src={p.fotoUrl} alt={p.nome} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#f2f4f7] flex items-center justify-center shrink-0">
                    <Package size={16} className="text-[#98a2b3]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#101828] truncate">
                    {p.nome} <span className="text-[#667085] font-medium">x{p.quantidade}</span>
                  </p>
                  {p.observacao && <p className="text-[10px] text-[#667085] truncate">{p.observacao}</p>}
                </div>
                <button type="button" onClick={() => handleRemoverPeca(p.id)} className="p-1.5 text-[#98a2b3] active:text-[#b42318] shrink-0">
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <label className={labelBaseClass}>Adicionar Peça</label>
        <CreatableSelect
          value={pecaSelecionada}
          onChange={setPecaSelecionada}
          options={SUGESTOES_PECAS}
          placeholder="Buscar ou digitar peça..."
          styles={mobileSelectStyles}
          formatCreateLabel={(v) => `Usar "${v}"`}
        />
        <div className="grid grid-cols-3 gap-2 mt-2">
          <input
            type="text"
            value={quantidadePeca}
            onChange={(e) => setQuantidadePeca(e.target.value)}
            placeholder="Qtd"
            className={`${inputBaseClass} col-span-1 text-center`}
          />
          <input
            type="text"
            value={obsPeca}
            onChange={(e) => setObsPeca(e.target.value)}
            placeholder="Observação (opcional)"
            className={`${inputBaseClass} col-span-2`}
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <label className="flex-1 h-11 rounded-xl border border-dashed border-[#d0d5dd] flex items-center justify-center gap-1.5 text-xs font-semibold text-[#667085] cursor-pointer">
            <Camera size={16} />
            <span className="truncate">{fotoTempNome || 'Anexar foto'}</span>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFotoChange} className="hidden" />
          </label>
          <button
            type="button"
            onClick={handleAdicionarPeca}
            className="h-11 px-4 rounded-xl bg-black text-white text-xs font-bold shrink-0"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Serviços Sugeridos */}
      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3">
        <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#f2f4f7]">
          <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0">
            <Wrench size={18} weight="bold" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#101828] leading-tight">Serviços Sugeridos</h2>
            <p className="text-xs text-[#667085] mt-0.5">Intervenções recomendadas na triagem</p>
          </div>
        </div>

        {servicosDiagnostico.length > 0 && (
          <div className="space-y-2 mb-3">
            {servicosDiagnostico.map((s) => (
              <div key={s.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#f8fafc] border border-[#d0d5dd]">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#101828] truncate">{s.nome}</p>
                  {s.observacao && <p className="text-[10px] text-[#667085] truncate">{s.observacao}</p>}
                </div>
                <button type="button" onClick={() => handleRemoverServico(s.id)} className="p-1.5 text-[#98a2b3] active:text-[#b42318] shrink-0">
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <label className={labelBaseClass}>Adicionar Serviço</label>
        <CreatableSelect
          value={servicoSelecionado}
          onChange={setServicoSelecionado}
          options={SUGESTOES_SERVICOS}
          placeholder="Buscar ou digitar serviço..."
          styles={mobileSelectStyles}
          formatCreateLabel={(v) => `Usar "${v}"`}
        />
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={obsServico}
            onChange={(e) => setObsServico(e.target.value)}
            placeholder="Observação (opcional)"
            className={`${inputBaseClass} flex-1`}
          />
          <button
            type="button"
            onClick={handleAdicionarServico}
            className="h-11 px-4 rounded-xl bg-black text-white text-xs font-bold shrink-0"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Laudo Técnico */}
      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0">
          <Sparkle size={18} weight="fill" className="text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-extrabold text-[#101828] leading-tight">Laudo Técnico</h2>
          <p className="text-[10.5px] text-[#667085] truncate">
            {laudoTecnico ? 'Gerado a partir do diagnóstico' : 'Ainda não gerado'}
          </p>
        </div>

        {laudoTecnico ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setLaudoModalAberto(true)}
              className="h-9 px-3.5 rounded-lg bg-black active:bg-zinc-800 text-white text-xs font-bold"
            >
              Ver Laudo
            </button>
            <button
              type="button"
              onClick={handleGerarLaudo}
              aria-label="Regenerar laudo"
              className="h-9 w-9 rounded-lg border border-[#d0d5dd] text-[#344054] flex items-center justify-center shrink-0"
            >
              <ArrowsClockwise size={15} weight="bold" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGerarLaudo}
            className="h-9 px-3.5 rounded-lg bg-[#e0f2fe] text-[#0369a1] text-xs font-bold shrink-0"
          >
            Gerar
          </button>
        )}
      </div>

      <MobileStepFooter onContinue={onContinue} />

      <MobileLaudoTecnicoModal
        isOpen={laudoModalAberto}
        texto={laudoTecnico}
        onFechar={() => setLaudoModalAberto(false)}
        onRegenerar={construirLaudo}
        onSalvar={(texto) => {
          updateFormData({ laudoTecnico: texto })
          setLaudoModalAberto(false)
        }}
      />
    </div>
  )
}
