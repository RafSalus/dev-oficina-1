import React, { useState, useMemo, useRef } from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import {
  Wrench,
  Car,
  User,
  ChatText,
  ClipboardText,
  Plus,
  Trash,
  Camera,
  FileText,
  Sparkle,
  X,
  FloppyDisk,
  Eye,
  CheckCircle,
  ArrowsClockwise,
  Copy,
  Check,
  WhatsappLogo,
  WarningCircle,
  ArrowsOutSimple,
  ArrowsInSimple,
  Printer,
} from '@phosphor-icons/react'
import { MOCK_MECANICOS } from '../../../../constants/mecanicos'
import { ITENS_CHECKLIST_ENTRADA } from '../../../../constants/checklistItems'
import {
  SUGESTOES_PECAS,
  SUGESTOES_SERVICOS,
  gerarLaudoTecnico,
} from '../../../../constants/catalogoPecasServicos'
import { toast } from 'sonner'

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '40px',
    height: '40px',
    backgroundColor: state.isDisabled ? '#f2f4f7' : state.isFocused ? '#ffffff' : '#f8fafc',
    borderColor: state.isFocused ? '#101828' : '#d0d5dd',
    borderWidth: '1px',
    borderRadius: '12px',
    boxShadow: state.isFocused ? '0 0 0 1px #101828' : 'none',
    fontSize: '12.5px',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    ':hover': {
      borderColor: state.isFocused ? '#101828' : '#98a2b3',
      backgroundColor: state.isDisabled ? '#f2f4f7' : '#ffffff',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    height: '40px',
    padding: '0 12px',
  }),
  input: (base) => ({
    ...base,
    margin: '0px',
    color: '#101828',
    fontSize: '12.5px',
    fontWeight: '600',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '40px',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '4px 8px',
    color: '#667085',
    ':hover': { color: '#101828' },
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '4px 6px',
    color: '#667085',
    ':hover': { color: '#101828' },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '14px',
    border: '1px solid #d0d5dd',
    boxShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.1), 0 6px 10px -3px rgba(0, 0, 0, 0.04)',
    zIndex: 50,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    padding: '4px',
  }),
  menuList: (base) => ({
    ...base,
    padding: '2px',
    maxHeight: '220px',
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: state.isSelected ? 700 : 500,
    backgroundColor: state.isSelected
      ? '#101828'
      : state.isFocused
      ? '#f2f4f7'
      : 'transparent',
    color: state.isSelected ? '#ffffff' : '#101828',
    cursor: 'pointer',
    padding: '7px 12px',
    transition: 'all 0.1s ease',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#101828',
    fontWeight: 700,
    fontSize: '12.5px',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#98a2b3',
    fontSize: '12.5px',
    fontWeight: 500,
  }),
}

export function TabDiagnostico({ formData, updateFormData, onSaveStep, onCancel }) {
  const {
    cliente = '',
    documento = '',
    telefone = '',
    placa = '',
    marcaModelo = '',
    ano = '',
    cor = '',
    km = '',
    nivelCombustivel = '',
    relatoCliente = '',
    checklistEntrada = {},
    checklistEntradaObs = '',
    mecanicoId = '',
    mecanicoNome = '',
    pecasDiagnostico = [],
    servicosDiagnostico = [],
    laudoTecnico = '',
  } = formData

  // Modais de apoio
  const [modalDadosAberto, setModalDadosAberto] = useState(false)
  const [modalChecklistAberto, setModalChecklistAberto] = useState(false)
  const [modalLaudoAberto, setModalLaudoAberto] = useState(false)
  const [fotoZoomUrl, setFotoZoomUrl] = useState(null)
  const [copiado, setCopiado] = useState(false)
  const [modalLaudoMaximizada, setModalLaudoMaximizada] = useState(false)

  // Estados locais para adição de Peça
  const [pecaSelecionada, setPecaSelecionada] = useState(null)
  const [quantidadePeca, setQuantidadePeca] = useState('1')
  const [obsPeca, setObsPeca] = useState('')
  const [fotoTempPeca, setFotoTempPeca] = useState(null)
  const [fotoTempNome, setFotoTempNome] = useState('')
  const fileInputPecaRef = useRef(null)

  // Estados locais para adição de Serviço
  const [servicoSelecionado, setServicoSelecionado] = useState(null)
  const [obsServico, setObsServico] = useState('')

  // Referência para upload de foto direta em peça já existente
  const [idPecaUploadDireto, setIdPecaUploadDireto] = useState(null)
  const fileInputDiretoRef = useRef(null)

  // Mecânico selecionado
  const selectedMecanicoOption = useMemo(() => {
    return MOCK_MECANICOS.find((m) => m.value === mecanicoId) || MOCK_MECANICOS[0]
  }, [mecanicoId])

  // Contagem de Não Conformidades do Checklist
  const totalNaoConformes = useMemo(() => {
    return Object.values(checklistEntrada).filter((item) => item?.status === 'nao_conforme').length
  }, [checklistEntrada])

  // Handler de seleção do mecânico pela secretária
  const handleSelectMecanico = (option) => {
    updateFormData({
      mecanicoId: option?.value || '',
      mecanicoNome: option?.value ? option.nome : '',
    })
  }

  // Handler de foto temporária para o novo item de peça
  const handleFotoTempChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFotoTempNome(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      setFotoTempPeca(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  // Handler de adicionar nova peça à lista
  const handleAdicionarPeca = (e) => {
    e?.preventDefault()
    const nome = pecaSelecionada?.value || pecaSelecionada?.label
    if (!nome || !nome.trim()) return

    const novaPeca = {
      id: `peca-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nome: nome.trim(),
      quantidade: quantidadePeca || '1',
      observacao: obsPeca.trim(),
      fotoUrl: fotoTempPeca || null,
      fotoNome: fotoTempNome || null,
    }

    const novasPecas = [...pecasDiagnostico, novaPeca]
    updateFormData({ pecasDiagnostico: novasPecas })
    toast.success(`Peça "${nome.trim()}" adicionada ao diagnóstico!`)

    // Limpar campos
    setPecaSelecionada(null)
    setQuantidadePeca('1')
    setObsPeca('')
    setFotoTempPeca(null)
    setFotoTempNome('')
    if (fileInputPecaRef.current) {
      fileInputPecaRef.current.value = ''
    }
  }

  // Handler de remover peça
  const handleRemoverPeca = (id) => {
    const atualizadas = pecasDiagnostico.filter((p) => p.id !== id)
    updateFormData({ pecasDiagnostico: atualizadas })
    toast.info('Peça removida do diagnóstico.')
  }

  // Handler de upload direto de foto para peça já na lista
  const handleTriggerUploadDireto = (idPeca) => {
    setIdPecaUploadDireto(idPeca)
    if (fileInputDiretoRef.current) {
      fileInputDiretoRef.current.click()
    }
  }

  const handleFotoDiretaChange = (e) => {
    const file = e.target.files?.[0]
    if (!file || !idPecaUploadDireto) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const atualizadas = pecasDiagnostico.map((p) => {
        if (p.id === idPecaUploadDireto) {
          return {
            ...p,
            fotoUrl: event.target.result,
            fotoNome: file.name,
          }
        }
        return p
      })
      updateFormData({ pecasDiagnostico: atualizadas })
      toast.success('Foto da peça adicionada ao laudo com sucesso!')
      setIdPecaUploadDireto(null)
    }
    reader.readAsDataURL(file)
  }

  // Handler de adicionar novo serviço
  const handleAdicionarServico = (e) => {
    e?.preventDefault()
    const nome = servicoSelecionado?.value || servicoSelecionado?.label
    if (!nome || !nome.trim()) return

    const novoServico = {
      id: `serv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nome: nome.trim(),
      observacao: obsServico.trim(),
    }

    const novosServicos = [...servicosDiagnostico, novoServico]
    updateFormData({ servicosDiagnostico: novosServicos })
    toast.success(`Serviço "${nome.trim()}" adicionado ao diagnóstico!`)

    // Limpar campos
    setServicoSelecionado(null)
    setObsServico('')
  }

  // Handler de remover serviço
  const handleRemoverServico = (id) => {
    const atualizados = servicosDiagnostico.filter((s) => s.id !== id)
    updateFormData({ servicosDiagnostico: atualizados })
    toast.info('Serviço removido do diagnóstico.')
  }

  // Handler de Gerar Laudo Técnico
  const handleGerarLaudo = () => {
    const textoGerado = gerarLaudoTecnico({
      cliente,
      placa,
      marcaModelo,
      km,
      relatoCliente,
      mecanicoNome,
      pecas: pecasDiagnostico,
      servicos: servicosDiagnostico,
    })

    updateFormData({ laudoTecnico: textoGerado })
    setModalLaudoAberto(true)
    toast.success('Laudo técnico gerado com sucesso!')
  }

  // Handler de copiar laudo
  const handleCopiarLaudo = () => {
    if (!laudoTecnico) return
    navigator.clipboard.writeText(laudoTecnico)
    setCopiado(true)
    toast.success('Texto do laudo técnico copiado para a área de transferência!')
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="h-full w-full flex flex-col justify-between gap-2.5 overflow-hidden">
      {/* Input de arquivo invisível para adição direta de fotos na lista */}
      <input
        type="file"
        ref={fileInputDiretoRef}
        onChange={handleFotoDiretaChange}
        accept="image/*"
        className="hidden"
      />

      {/* Barra Superior Compacta: Botões de Acesso Rápido e Atribuição do Mecânico */}
      <div className="h-12 shrink-0 bg-white px-3 sm:px-4 rounded-2xl border border-[#d0d5dd] shadow-sm flex items-center justify-between gap-2">
        {/* Lado Esquerdo: Identificação e Botões Compactos (Cliente/Veículo e Checklist) */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Wrench size={16} weight="bold" />
          </div>

          <span className="text-xs font-bold text-[#101828] hidden xl:inline shrink-0">
            Diagnóstico
          </span>

          {/* Botão 1: Ver Dados do Cliente, Veículo e Queixa (Expande Modal) */}
          <button
            type="button"
            onClick={() => setModalDadosAberto(true)}
            className="h-8 px-2.5 sm:px-3 rounded-xl bg-[#f8fafc] hover:bg-[#f2f4f7] active:bg-[#eaecf0] border border-[#d0d5dd] text-[#101828] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            title="Visualizar dados cadastrais do cliente, ficha do veículo e relato da queixa"
          >
            <Car size={15} weight="bold" className="text-[#344054]" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">
              {placa ? `${placa} • ${marcaModelo || 'Veículo'}` : 'Dados do Veículo e Queixa'}
            </span>
          </button>

          {/* Botão 2: Ver Checklist (Substitui todo o bloco extenso anterior) */}
          <button
            type="button"
            onClick={() => setModalChecklistAberto(true)}
            className="h-8 px-2.5 sm:px-3 rounded-xl bg-[#f8fafc] hover:bg-[#f2f4f7] active:bg-[#eaecf0] border border-[#d0d5dd] text-[#101828] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            title="Visualizar checklist de entrada com os 22 itens vistoriados"
          >
            <ClipboardText size={15} weight="bold" className="text-[#344054]" />
            <span>Ver Checklist</span>
            {totalNaoConformes > 0 ? (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#fef3f2] text-[#b42318] border border-[#fecdca]">
                {totalNaoConformes} avarias
              </span>
            ) : (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#ecfdf3] text-[#027a48] border border-[#a6f4c5]">
                OK
              </span>
            )}
          </button>

          {/* Botão 3: Gerar Laudo Técnico (Posicionado ao lado de Ver Checklist) */}
          <button
            type="button"
            onClick={handleGerarLaudo}
            className="h-8 px-2.5 sm:px-3 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
            title="Gerar laudo técnico formal a partir das peças e serviços apontados"
          >
            <Sparkle size={14} weight="fill" className="text-amber-300" />
            <span>Gerar Laudo Técnico</span>
            {laudoTecnico && (
              <span className="w-2 h-2 rounded-full bg-[#0284c7]" title="Laudo gerado" />
            )}
          </button>
        </div>

        {/* Lado Direito: Atribuição do Mecânico Responsável */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#475467] shrink-0 hidden sm:block">
            Mecânico:
          </label>
          <div className="w-52 sm:w-64 xl:w-72">
            <Select
              value={selectedMecanicoOption}
              onChange={handleSelectMecanico}
              options={MOCK_MECANICOS}
              isSearchable
              placeholder="Selecionar mecânico..."
              styles={customSelectStyles}
            />
          </div>
        </div>
      </div>

      {/* Área Central: 2 Colunas Limpas (Peças com Fotos à esquerda e Serviços à direita) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-hidden">
        {/* COLUNA 1: Peças para Substituição ou Reparo (com campo de foto na frente) */}
        <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5 flex flex-col justify-between overflow-hidden min-h-0">
          {/* Topo do Card de Peças */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#f2f4f7] shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#f2f4f7] text-[#101828] flex items-center justify-center font-bold text-xs">
                <Wrench size={15} weight="bold" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#101828] leading-tight">
                  Peças Necessárias e Foto da Peça
                </h3>
                <p className="text-[10.5px] text-[#667085]">
                  Pesquise ou digite a peça e adicione a foto comprovando a avaria
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f2f4f7] text-[#344054] border border-[#d0d5dd]">
              {pecasDiagnostico.length} {pecasDiagnostico.length === 1 ? 'peça' : 'peças'}
            </span>
          </div>

          {/* Linha de Cadastro Rápido de Peça (Nome pesquisado/digitado + Foto na frente + Adicionar) */}
          <div className="py-2.5 flex flex-col gap-2 shrink-0 border-b border-[#f2f4f7]">
            <div className="flex items-center gap-2">
              {/* Campo CreatableSelect de Peça */}
              <div className="flex-1 min-w-0">
                <CreatableSelect
                  value={pecaSelecionada}
                  onChange={setPecaSelecionada}
                  options={SUGESTOES_PECAS}
                  isClearable
                  placeholder="Pesquise ou digite o nome da peça..."
                  styles={customSelectStyles}
                  formatCreateLabel={(input) => `Adicionar "${input}"`}
                  noOptionsMessage={() => 'Digite o nome da peça para cadastrar'}
                />
              </div>

              {/* Quantidade */}
              <div className="w-16 shrink-0">
                <input
                  type="number"
                  min="1"
                  value={quantidadePeca}
                  onChange={(e) => setQuantidadePeca(e.target.value)}
                  placeholder="Qtd"
                  className="w-full h-10 rounded-xl bg-[#f8fafc] focus:bg-white border border-[#d0d5dd] focus:border-[#101828] text-center font-bold text-xs text-[#101828] focus:outline-none"
                  title="Quantidade de peças"
                />
              </div>

              {/* Botão de Foto da Peça (Input File embutido) */}
              <input
                type="file"
                ref={fileInputPecaRef}
                onChange={handleFotoTempChange}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputPecaRef.current?.click()}
                className={`h-10 px-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  fotoTempPeca
                    ? 'bg-[#ecfdf3] text-[#027a48] border-[#a6f4c5]'
                    : 'bg-[#f8fafc] hover:bg-[#f2f4f7] text-[#344054] border-[#d0d5dd]'
                }`}
                title={fotoTempNome ? `Foto selecionada: ${fotoTempNome}` : 'Adicionar foto da peça'}
              >
                <Camera size={16} weight={fotoTempPeca ? 'fill' : 'bold'} />
                <span className="hidden sm:inline">
                  {fotoTempPeca ? 'Foto Pronta' : 'Foto'}
                </span>
              </button>

              {/* Botão Adicionar Peça */}
              <button
                type="button"
                onClick={handleAdicionarPeca}
                disabled={!pecaSelecionada}
                className="h-10 px-3.5 rounded-xl bg-[#101828] hover:bg-black disabled:bg-[#eaecf0] disabled:text-[#98a2b3] disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <Plus size={14} weight="bold" />
                <span>Adicionar</span>
              </button>
            </div>

            {/* Pré-visualização da foto selecionada (se houver antes de adicionar) */}
            {fotoTempPeca && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#f0fdf4] border border-[#a6f4c5] text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={fotoTempPeca}
                    alt="Pré-visualização"
                    className="w-8 h-8 rounded-lg object-cover border border-[#a6f4c5] shrink-0"
                  />
                  <span className="font-semibold text-[#027a48] truncate">
                    Foto pronta: {fotoTempNome || 'imagem_anexada.jpg'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFotoTempPeca(null)
                    setFotoTempNome('')
                    if (fileInputPecaRef.current) fileInputPecaRef.current.value = ''
                  }}
                  className="text-[#b42318] hover:underline font-bold text-[11px] cursor-pointer"
                >
                  Remover Foto
                </button>
              </div>
            )}

            {/* Observação rápida opcional sobre a peça */}
            <input
              type="text"
              value={obsPeca}
              onChange={(e) => setObsPeca(e.target.value)}
              placeholder="Detalhe opcional da peça (ex: dianteira direita, trincada, gasta no ferro)..."
              className="w-full h-8 px-2.5 rounded-xl bg-[#f8fafc] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] text-[11.5px] text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
            />
          </div>

          {/* Lista de Peças Adicionadas (Rolagem Suave Interna) */}
          <div className="flex-1 p-2 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] overflow-y-auto no-scrollbar flex flex-col gap-2 min-h-0 mt-2">
            {pecasDiagnostico.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#d0d5dd] flex items-center justify-center text-[#667085] mb-2 shadow-xs">
                  <Wrench size={20} weight="bold" />
                </div>
                <p className="text-xs font-bold text-[#101828]">Nenhuma peça adicionada ainda</p>
                <p className="text-[11px] text-[#667085] max-w-xs mt-0.5 leading-relaxed">
                  Pesquise a peça acima ou digite o nome e anexe a foto da peça danificada.
                </p>
              </div>
            ) : (
              pecasDiagnostico.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-2.5 rounded-xl bg-white border border-[#d0d5dd] shadow-2xs flex items-center justify-between gap-2.5 hover:border-[#98a2b3] transition-colors"
                >
                  {/* Foto da Peça em Destaque na Frente */}
                  <div className="shrink-0">
                    {item.fotoUrl ? (
                      <button
                        type="button"
                        onClick={() => setFotoZoomUrl(item.fotoUrl)}
                        className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#d0d5dd] group cursor-pointer shadow-2xs block"
                        title="Clique para ampliar foto"
                      >
                        <img
                          src={item.fotoUrl}
                          alt={item.nome}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Eye size={16} weight="bold" />
                        </div>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleTriggerUploadDireto(item.id)}
                        className="w-12 h-12 rounded-xl border border-dashed border-[#d0d5dd] hover:border-[#101828] bg-[#f8fafc] hover:bg-[#f2f4f7] flex flex-col items-center justify-center text-[#667085] hover:text-[#101828] transition-colors cursor-pointer"
                        title="Tirar ou anexar foto desta peça"
                      >
                        <Camera size={16} weight="bold" />
                        <span className="text-[8px] font-bold mt-0.5 uppercase">Foto</span>
                      </button>
                    )}
                  </div>

                  {/* Informações da Peça */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-extrabold text-[#101828] truncate">
                        {item.nome}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#f2f4f7] text-[#344054] border border-[#e4e7ec]">
                        Qtd: {item.quantidade || 1}
                      </span>
                      {item.fotoUrl && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#ecfdf3] text-[#027a48] border border-[#a6f4c5] flex items-center gap-1">
                          <Check size={10} weight="bold" />
                          <span>Com Foto</span>
                        </span>
                      )}
                    </div>

                    {item.observacao ? (
                      <p className="text-[11px] text-[#475467] truncate mt-0.5">
                        <strong className="text-[#101828]">Nota:</strong> {item.observacao}
                      </p>
                    ) : (
                      <p className="text-[10.5px] text-[#98a2b3] italic mt-0.5">
                        Sem observações adicionais
                      </p>
                    )}
                  </div>

                  {/* Botão de Exclusão */}
                  <button
                    type="button"
                    onClick={() => handleRemoverPeca(item.id)}
                    className="p-1.5 rounded-lg text-[#667085] hover:text-[#b42318] hover:bg-[#fef3f2] transition-colors cursor-pointer shrink-0"
                    title="Remover peça da lista"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUNA 2: Serviços a Executar (Seleção ou Adição) */}
        <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5 flex flex-col justify-between overflow-hidden min-h-0">
          {/* Topo do Card de Serviços */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#f2f4f7] shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#f2f4f7] text-[#101828] flex items-center justify-center font-bold text-xs">
                <FileText size={15} weight="bold" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#101828] leading-tight">
                  Serviços Técnicos a Executar
                </h3>
                <p className="text-[10.5px] text-[#667085]">
                  Selecione os procedimentos recomendados ou adicione serviços customizados
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f2f4f7] text-[#344054] border border-[#d0d5dd]">
              {servicosDiagnostico.length} {servicosDiagnostico.length === 1 ? 'serviço' : 'serviços'}
            </span>
          </div>

          {/* Linha de Seleção ou Adição de Serviço */}
          <div className="py-2.5 flex flex-col gap-2 shrink-0 border-b border-[#f2f4f7]">
            <div className="flex items-center gap-2">
              {/* Campo CreatableSelect de Serviço */}
              <div className="flex-1 min-w-0">
                <CreatableSelect
                  value={servicoSelecionado}
                  onChange={setServicoSelecionado}
                  options={SUGESTOES_SERVICOS}
                  isClearable
                  placeholder="Selecione o serviço ou digite um novo..."
                  styles={customSelectStyles}
                  formatCreateLabel={(input) => `Adicionar serviço "${input}"`}
                  noOptionsMessage={() => 'Digite o serviço para adicionar'}
                />
              </div>

              {/* Botão Adicionar Serviço */}
              <button
                type="button"
                onClick={handleAdicionarServico}
                disabled={!servicoSelecionado}
                className="h-10 px-3.5 rounded-xl bg-[#101828] hover:bg-black disabled:bg-[#eaecf0] disabled:text-[#98a2b3] disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <Plus size={14} weight="bold" />
                <span>Adicionar</span>
              </button>
            </div>

            {/* Observação rápida do serviço */}
            <input
              type="text"
              value={obsServico}
              onChange={(e) => setObsServico(e.target.value)}
              placeholder="Observação do serviço (ex: sangria inclusa, ajuste com torquímetro)..."
              className="w-full h-8 px-2.5 rounded-xl bg-[#f8fafc] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] text-[11.5px] text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
            />
          </div>

          {/* Lista de Serviços Adicionados */}
          <div className="flex-1 p-2 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] overflow-y-auto no-scrollbar flex flex-col gap-2 min-h-0 mt-2">
            {servicosDiagnostico.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#d0d5dd] flex items-center justify-center text-[#667085] mb-2 shadow-xs">
                  <FileText size={20} weight="bold" />
                </div>
                <p className="text-xs font-bold text-[#101828]">Nenhum serviço selecionado ainda</p>
                <p className="text-[11px] text-[#667085] max-w-xs mt-0.5 leading-relaxed">
                  Selecione os serviços mecânicos necessários no campo acima para compor a ordem.
                </p>
              </div>
            ) : (
              servicosDiagnostico.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-2.5 rounded-xl bg-white border border-[#d0d5dd] shadow-2xs flex items-center justify-between gap-2 hover:border-[#98a2b3] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-[#f2f4f7] text-[#101828] flex items-center justify-center font-bold text-xs shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-[#101828] block truncate">
                        {item.nome}
                      </span>
                      {item.observacao && (
                        <span className="text-[11px] text-[#475467] block truncate mt-0.5">
                          {item.observacao}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoverServico(item.id)}
                    className="p-1.5 rounded-lg text-[#667085] hover:text-[#b42318] hover:bg-[#fef3f2] transition-colors cursor-pointer shrink-0"
                    title="Remover serviço"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Barra Inferior de Ações da Etapa */}
      <div className="h-11 shrink-0 bg-white px-5 rounded-2xl border border-[#d0d5dd] shadow-sm flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#fef3f2] text-[#475467] hover:text-[#b42318] hover:border-[#fecdca] text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <X size={14} weight="bold" />
          <span>Cancelar</span>
        </button>

        <span className="text-xs font-medium text-[#667085]">
          Aba 3 de 8 • <strong className="text-[#101828] font-bold">Diagnóstico Técnico</strong>
        </span>

        <button
          type="button"
          onClick={onSaveStep}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <FloppyDisk size={15} weight="bold" />
          <span>Salvar e Continuar</span>
        </button>
      </div>

      {/* MODAL 1: Dados do Cliente, Veículo e Queixa (Expansível via Botão) */}
      {modalDadosAberto && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl border border-[#d0d5dd] shadow-2xl flex flex-col overflow-hidden">
            {/* Header do Modal */}
            <div className="px-5 py-3.5 border-b border-[#f2f4f7] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#101828] text-white flex items-center justify-center font-bold text-xs">
                  <Car size={16} weight="bold" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#101828]">
                    Dados do Veículo, Cliente e Queixa
                  </h3>
                  <p className="text-[11px] text-[#667085]">
                    Informações registradas na recepção da oficina
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalDadosAberto(false)}
                className="p-1.5 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#f2f4f7] transition-colors cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3 text-xs min-h-0">
              {/* Placa Mercosul e Veículo */}
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] flex items-center justify-between gap-3">
                <div>
                  <span className="text-[9.5px] uppercase font-bold text-[#667085] block">
                    Modelo e Ano
                  </span>
                  <span className="text-sm font-extrabold text-[#101828] block">
                    {marcaModelo || 'Modelo não informado'}
                  </span>
                  <span className="text-[11px] text-[#475467] block mt-0.5">
                    Ano: {ano || '-'} • Cor: {cor || '-'} • KM: {km ? `${km} km` : 'Não informado'}
                  </span>
                </div>

                {placa && (
                  <div className="flex flex-col items-center bg-white border border-[#101828] rounded-lg px-2.5 py-1 shadow-2xs shrink-0">
                    <span className="text-[7px] font-black uppercase tracking-widest text-[#101828] leading-none">
                      BRASIL
                    </span>
                    <span className="font-mono font-black text-sm text-[#101828] tracking-wider leading-none mt-0.5">
                      {placa}
                    </span>
                  </div>
                )}
              </div>

              {/* Titular e Contato */}
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[9.5px] uppercase font-bold text-[#667085] block">
                    Cliente / Titular
                  </span>
                  <span className="text-xs font-extrabold text-[#101828] block truncate">
                    {cliente || 'Não identificado'}
                  </span>
                  {documento && (
                    <span className="text-[11px] text-[#667085] block mt-0.5">
                      CPF / CNPJ: {documento}
                    </span>
                  )}
                </div>

                {telefone && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-[#475467]">{telefone}</span>
                    <a
                      href={`https://wa.me/55${telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-lg bg-[#25D366] hover:bg-[#1da851] text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="WhatsApp"
                    >
                      <WhatsappLogo size={16} weight="fill" />
                    </a>
                  </div>
                )}
              </div>

              {/* Queixa Inicial do Cliente */}
              <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#d0d5dd]">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#475467] mb-1.5">
                  <ChatText size={14} weight="bold" />
                  <span>Relato da Queixa Informada pelo Cliente:</span>
                </div>
                {relatoCliente ? (
                  <p className="text-xs font-medium text-[#101828] whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-[#e4e7ec]">
                    {relatoCliente}
                  </p>
                ) : (
                  <p className="text-xs text-[#667085] italic">
                    Nenhum relato específico registrado na recepção.
                  </p>
                )}
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="px-5 py-3 border-t border-[#f2f4f7] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setModalDadosAberto(false)}
                className="px-4 py-1.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Checklist de Entrada Completo (22 Itens) */}
      {modalChecklistAberto && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl border border-[#d0d5dd] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[#f2f4f7] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#101828] text-white flex items-center justify-center font-bold text-xs">
                  <ClipboardText size={16} weight="bold" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#101828]">
                    Checklist de Entrada • Vistoria Inicial
                  </h3>
                  <p className="text-[11px] text-[#667085]">
                    {placa || 'Sem placa'} • 22 itens vistoriados na recepção
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalChecklistAberto(false)}
                className="p-1.5 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#f2f4f7] transition-colors cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Itens do Checklist */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-2.5 text-xs min-h-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ITENS_CHECKLIST_ENTRADA.map((item) => {
                  const state = checklistEntrada[item.id] || {}
                  const isConforme = state.status === 'conforme' || state.ok === true
                  const isNaoConforme = state.status === 'nao_conforme'

                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                        isConforme
                          ? 'bg-[#f0fdf4] border-[#a6f4c5]'
                          : isNaoConforme
                          ? 'bg-[#fef3f2] border-[#fecdca]'
                          : 'bg-[#f8fafc] border-[#d0d5dd]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#101828] uppercase text-[10.5px]">
                          {item.label}
                        </span>
                        <span
                          className={`text-[8.5px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            isConforme
                              ? 'bg-[#027a48] text-white'
                              : isNaoConforme
                              ? 'bg-[#b42318] text-white'
                              : 'bg-[#344054] text-white'
                          }`}
                        >
                          {isConforme ? 'Conforme' : isNaoConforme ? 'Avaria' : 'Isento'}
                        </span>
                      </div>
                      {item.desc && (
                        <span className="text-[10px] text-[#667085] mt-0.5">{item.desc}</span>
                      )}
                      {state.obs && (
                        <div className="mt-1 pt-1 border-t border-black/5 text-[10px] font-medium text-[#101828]">
                          <strong>OBS:</strong> {state.obs}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {checklistEntradaObs && (
                <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] mt-2">
                  <span className="font-bold text-[#101828] block mb-0.5">
                    Observações Gerais da Vistoria:
                  </span>
                  <p className="text-[#475467] text-[11px] leading-relaxed">
                    {checklistEntradaObs}
                  </p>
                </div>
              )}
            </div>

            {/* Rodapé */}
            <div className="px-5 py-3 border-t border-[#f2f4f7] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setModalChecklistAberto(false)}
                className="px-4 py-1.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
              >
                Fechar Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Laudo Técnico Gerado (Visualização e Edição Ampla) */}
      {modalLaudoAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
          <div
            className={`bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
              modalLaudoMaximizada
                ? 'w-[99vw] h-[98vh] max-w-none'
                : 'w-full max-w-6xl h-[92vh]'
            }`}
          >
            {/* Header com Ações Rápidas */}
            <div className="px-5 py-3.5 border-b border-[#f2f4f7] flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-black text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <Sparkle size={20} weight="fill" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-[#101828] leading-none">
                      Laudo Técnico de Diagnóstico
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ecfdf3] text-[#027a48] border border-[#a6f4c5] shrink-0">
                      Documento Oficial
                    </span>
                  </div>
                  <p className="text-[11px] text-[#667085] mt-0.5 truncate">
                    Compilação técnica das peças apontadas, evidências fotográficas e serviços a executar
                  </p>
                </div>
              </div>

              {/* Botões do Topo */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCopiarLaudo}
                  className="h-8.5 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-xs font-bold text-[#101828] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Copiar texto completo do laudo para a área de transferência"
                >
                  {copiado ? (
                    <>
                      <Check size={14} weight="bold" className="text-[#027a48]" />
                      <span className="text-[#027a48]">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} weight="bold" />
                      <span className="hidden sm:inline">Copiar Texto</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGerarLaudo}
                  className="h-8.5 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-xs font-bold text-[#101828] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Regenerar laudo a partir das peças e serviços atuais"
                >
                  <ArrowsClockwise size={14} weight="bold" />
                  <span className="hidden sm:inline">Regenerar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalLaudoMaximizada(!modalLaudoMaximizada)}
                  className="h-8.5 w-8.5 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-[#101828] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  title={modalLaudoMaximizada ? 'Restaurar tamanho' : 'Maximizar tela cheia'}
                >
                  {modalLaudoMaximizada ? (
                    <ArrowsInSimple size={16} weight="bold" />
                  ) : (
                    <ArrowsOutSimple size={16} weight="bold" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setModalLaudoAberto(false)}
                  className="h-8.5 w-8.5 rounded-xl text-[#667085] hover:text-[#101828] hover:bg-[#f2f4f7] flex items-center justify-center transition-colors cursor-pointer"
                  title="Fechar visualização"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
            </div>

            {/* Corpo Espaçoso: Divisão em Resumo Lateral e Editor Amplo de Laudo */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-4 sm:p-5 overflow-hidden bg-[#eaecf0]">
              {/* Painel Lateral (4 de 12 colunas): Contexto Técnico, Evidências Fotográficas e Serviços */}
              <div className="lg:col-span-4 h-full flex flex-col gap-3 overflow-y-auto no-scrollbar min-h-0">
                {/* Card 1: Identificação do Veículo e Cliente */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex flex-col gap-2 shrink-0">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f2f4f7]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                      Dados da Ordem de Serviço
                    </span>
                    {placa ? (
                      <div className="flex flex-col items-center bg-white border border-[#101828] rounded-md px-2 py-0.5 shadow-2xs">
                        <span className="text-[6.5px] font-black uppercase tracking-widest text-[#101828] leading-none">
                          BRASIL
                        </span>
                        <span className="font-mono font-black text-[11px] text-[#101828] tracking-wider leading-none mt-0.5">
                          {placa}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#b42318] font-bold">Sem placa</span>
                    )}
                  </div>

                  <div className="text-xs space-y-1">
                    <div>
                      <span className="text-[9.5px] font-bold uppercase text-[#667085] block">
                        Veículo:
                      </span>
                      <span className="font-bold text-[#101828]">
                        {marcaModelo || 'Modelo não informado'}
                      </span>
                      <span className="text-[11px] text-[#475467] block">
                        Ano {ano || '-'} • Cor {cor || '-'} • KM: {km ? `${km} km` : 'Não informado'}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-[#f2f4f7]">
                      <span className="text-[9.5px] font-bold uppercase text-[#667085] block">
                        Cliente / Titular:
                      </span>
                      <span className="font-bold text-[#101828]">
                        {cliente || 'Não identificado'}
                      </span>
                      {telefone && (
                        <span className="text-[11px] text-[#475467] block">
                          Tel: {telefone}
                        </span>
                      )}
                    </div>

                    <div className="pt-1.5 border-t border-[#f2f4f7]">
                      <span className="text-[9.5px] font-bold uppercase text-[#667085] block">
                        Mecânico Responsável:
                      </span>
                      <span className="font-bold text-[#101828]">
                        {mecanicoNome || 'Não designado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Evidências Fotográficas das Peças */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex flex-col gap-2 shrink-0">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f2f4f7]">
                    <div className="flex items-center gap-1.5">
                      <Camera size={15} weight="bold" className="text-[#101828]" />
                      <span className="text-xs font-bold text-[#101828]">
                        Evidências das Peças
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f8fafc] text-[#344054] border border-[#d0d5dd]">
                      {pecasDiagnostico.length} {pecasDiagnostico.length === 1 ? 'peça' : 'peças'}
                    </span>
                  </div>

                  {pecasDiagnostico.length === 0 ? (
                    <p className="text-xs text-[#667085] italic py-1">
                      Nenhuma peça cadastrada.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {pecasDiagnostico.map((peca, idx) => (
                        <div
                          key={peca.id || idx}
                          className="p-2 rounded-xl bg-[#f8fafc] border border-[#e4e7ec] flex items-center gap-2.5"
                        >
                          {peca.fotoUrl ? (
                            <button
                              type="button"
                              onClick={() => setFotoZoomUrl(peca.fotoUrl)}
                              className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#d0d5dd] shrink-0 group cursor-pointer shadow-2xs block"
                              title="Clique para ampliar foto"
                            >
                              <img
                                src={peca.fotoUrl}
                                alt={peca.nome}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Eye size={16} weight="bold" />
                              </div>
                            </button>
                          ) : (
                            <div className="w-12 h-12 rounded-lg border border-dashed border-[#d0d5dd] bg-white flex flex-col items-center justify-center text-[#98a2b3] shrink-0">
                              <Camera size={16} weight="regular" />
                              <span className="text-[7.5px] uppercase font-bold mt-0.5">Sem foto</span>
                            </div>
                          )}

                          <div className="min-w-0 flex-1 text-xs">
                            <span className="font-bold text-[#101828] block truncate leading-tight">
                              {peca.nome}
                            </span>
                            <span className="text-[10.5px] text-[#667085] block mt-0.5">
                              Qtd: {peca.quantidade || 1}
                              {peca.observacao && ` • ${peca.observacao}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card 3: Serviços a Executar */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-sm flex flex-col gap-2 shrink-0">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f2f4f7]">
                    <div className="flex items-center gap-1.5">
                      <Wrench size={15} weight="bold" className="text-[#101828]" />
                      <span className="text-xs font-bold text-[#101828]">
                        Serviços Solicitados
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f8fafc] text-[#344054] border border-[#d0d5dd]">
                      {servicosDiagnostico.length} {servicosDiagnostico.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  {servicosDiagnostico.length === 0 ? (
                    <p className="text-xs text-[#667085] italic py-1">
                      Nenhum serviço selecionado.
                    </p>
                  ) : (
                    <ul className="space-y-1.5 text-xs">
                      {servicosDiagnostico.map((servico, idx) => (
                        <li
                          key={servico.id || idx}
                          className="flex items-start gap-2 p-1.5 rounded-lg bg-[#f8fafc] border border-[#e4e7ec]"
                        >
                          <span className="w-5 h-5 rounded-md bg-white border border-[#d0d5dd] text-[#101828] font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-[#101828] block leading-tight">
                              {servico.nome}
                            </span>
                            {servico.observacao && (
                              <span className="text-[10.5px] text-[#667085] block mt-0.5">
                                {servico.observacao}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Painel Principal (8 de 12 colunas): Editor Amplo e Espaçoso do Laudo Técnico */}
              <div className="lg:col-span-8 h-full flex flex-col min-h-0 bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 sm:p-5 overflow-hidden">
                {/* Toolbar do Editor */}
                <div className="flex items-center justify-between pb-3 border-b border-[#f2f4f7] shrink-0 mb-3">
                  <div className="flex items-center gap-2">
                    <FileText size={18} weight="bold" className="text-[#101828]" />
                    <div>
                      <span className="text-xs sm:text-sm font-extrabold text-[#101828] block leading-none">
                        Texto Oficial do Laudo Técnico (100% Editável)
                      </span>
                      <span className="text-[11px] text-[#667085] hidden sm:block mt-0.5">
                        Edite, complemente ou adicione recomendações antes de enviar ao cliente
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-[#667085] bg-[#f8fafc] px-2.5 py-1 rounded-lg border border-[#e4e7ec]">
                      {laudoTecnico.length} caracteres
                    </span>
                  </div>
                </div>

                {/* Textarea Espaçosa em Tela Cheia / Ampla */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <textarea
                    value={laudoTecnico}
                    onChange={(e) => updateFormData({ laudoTecnico: e.target.value })}
                    placeholder="O laudo técnico compilado será gerado aqui..."
                    className="w-full h-full bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-white border border-[#d0d5dd] focus:border-[#101828] rounded-xl p-4 sm:p-5 text-xs sm:text-[13px] font-mono font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all resize-none leading-relaxed shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="px-5 py-3.5 border-t border-[#f2f4f7] flex items-center justify-between shrink-0 bg-white">
              <span className="text-xs text-[#667085] hidden sm:inline">
                O laudo e quaisquer edições são sincronizados no rascunho da Ordem de Serviço.
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f8fafc] text-xs font-bold text-[#101828] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Printer size={15} weight="bold" />
                  <span>Imprimir Laudo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalLaudoAberto(false)}
                  className="px-5 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Concluir e Salvar Laudo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Zoom da Foto da Peça */}
      {fotoZoomUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setFotoZoomUrl(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fotoZoomUrl}
              alt="Foto da Peça Ampliada"
              className="max-h-[75vh] w-auto object-contain"
            />
            <div className="w-full bg-black/90 px-4 py-2.5 flex items-center justify-between text-white text-xs">
              <span className="font-semibold">Registro Fotográfico da Peça</span>
              <button
                type="button"
                onClick={() => setFotoZoomUrl(null)}
                className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
