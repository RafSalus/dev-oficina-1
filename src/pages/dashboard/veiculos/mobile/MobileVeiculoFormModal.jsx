import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { IMaskInput } from 'react-imask'
import { X, Car, User, IdentificationCard, Notebook, CheckCircle, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { carregarClientesCadastrados, gerarProximoCodigoVeiculo } from '../../../../constants/mockClientesVeiculos'
import { buscarMarcasFipe, buscarModelosFipe, buscarAnosFipe } from '../../../../services/fipeService'
import {
  mobileSelectStyles,
  inputBaseClass,
  textareaBaseClass,
  labelBaseClass,
} from '../../nova-os/mobile/mobileSelectStyles'

const COMBUSTIVEL_OPCOES = [
  { value: 'FLEX', label: 'Flex (Álcool e Gasolina)' },
  { value: 'GASOLINA', label: 'Gasolina' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'HIBRIDO', label: 'Híbrido' },
  { value: 'ELETRICO', label: 'Elétrico' },
  { value: 'GNV', label: 'GNV' },
]

const FORM_VEICULO_INICIAL = {
  codigoVeiculo: '',
  clienteId: '',
  placa: '',
  marca: '',
  marcaCodigo: '',
  modelo: '',
  modeloCodigo: '',
  ano: '',
  anoCodigo: '',
  cor: '',
  combustivel: 'FLEX',
  kmPadrao: '',
  chassi: '',
  renavam: '',
  observacoes: '',
  ativo: true,
}

export function MobileVeiculoFormModal({ isOpen, onClose, onSalvar, onExcluir, veiculoParaEditar, clientePredefinidoId }) {
  const [formData, setFormData] = useState(FORM_VEICULO_INICIAL)
  const [clientes, setClientes] = useState([])
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)

  const [marcasFipe, setMarcasFipe] = useState([])
  const [carregandoMarcas, setCarregandoMarcas] = useState(false)
  const [modelosFipe, setModelosFipe] = useState([])
  const [carregandoModelos, setCarregandoModelos] = useState(false)
  const [anosFipe, setAnosFipe] = useState([])
  const [carregandoAnos, setCarregandoAnos] = useState(false)

  useEffect(() => {
    if (isOpen) setClientes(carregarClientesCadastrados())
  }, [isOpen])

  useEffect(() => {
    if (isOpen && marcasFipe.length === 0) {
      setCarregandoMarcas(true)
      buscarMarcasFipe()
        .then((lista) => setMarcasFipe(lista))
        .catch(() => toast.error('Não foi possível carregar as marcas da Tabela FIPE.'))
        .finally(() => setCarregandoMarcas(false))
    }
  }, [isOpen, marcasFipe.length])

  useEffect(() => {
    if (!isOpen) return
    setConfirmandoExclusao(false)

    if (veiculoParaEditar) {
      setFormData({
        codigoVeiculo: veiculoParaEditar.codigoVeiculo || '',
        clienteId: veiculoParaEditar.clienteId || clientePredefinidoId || '',
        placa: veiculoParaEditar.placa || '',
        marca: veiculoParaEditar.marca || '',
        marcaCodigo: veiculoParaEditar.marcaCodigo || '',
        modelo: veiculoParaEditar.modelo || '',
        modeloCodigo: veiculoParaEditar.modeloCodigo || '',
        ano: veiculoParaEditar.ano || '',
        anoCodigo: veiculoParaEditar.anoCodigo || '',
        cor: veiculoParaEditar.cor || '',
        combustivel: veiculoParaEditar.combustivel || 'FLEX',
        kmPadrao: veiculoParaEditar.kmPadrao || '',
        chassi: veiculoParaEditar.chassi || '',
        renavam: veiculoParaEditar.renavam || '',
        observacoes: veiculoParaEditar.observacoes || '',
        ativo: veiculoParaEditar.ativo !== false,
      })
      if (veiculoParaEditar.marcaCodigo) {
        setCarregandoModelos(true)
        buscarModelosFipe(veiculoParaEditar.marcaCodigo)
          .then((modList) => setModelosFipe(modList))
          .catch(() => {})
          .finally(() => setCarregandoModelos(false))
      }
    } else {
      setFormData({ ...FORM_VEICULO_INICIAL, codigoVeiculo: gerarProximoCodigoVeiculo(), clienteId: clientePredefinidoId || '' })
      setModelosFipe([])
      setAnosFipe([])
    }
  }, [isOpen, veiculoParaEditar, clientePredefinidoId])

  const opcoesClientes = useMemo(
    () => clientes.map((c) => ({ value: c.value || c.id, label: `${c.codigoCliente ? `[${c.codigoCliente}] ` : ''}${c.nome} - ${c.telefone || c.documento || ''}` })),
    [clientes]
  )

  const clienteSelecionado = useMemo(() => opcoesClientes.find((o) => o.value === formData.clienteId) || null, [opcoesClientes, formData.clienteId])

  const handleSelecionarMarca = async (opcao) => {
    if (!opcao) {
      setFormData((prev) => ({ ...prev, marca: '', marcaCodigo: '', modelo: '', modeloCodigo: '', ano: '', anoCodigo: '' }))
      setModelosFipe([])
      setAnosFipe([])
      return
    }
    const marcaNome = opcao.label
    const marcaCod = opcao.value
    setFormData((prev) => ({ ...prev, marca: marcaNome, marcaCodigo: marcaCod, modelo: '', modeloCodigo: '', ano: '', anoCodigo: '' }))
    setModelosFipe([])
    setAnosFipe([])
    if (marcaCod) {
      setCarregandoModelos(true)
      try {
        setModelosFipe(await buscarModelosFipe(marcaCod))
      } catch {
        toast.error('Erro ao consultar modelos da marca na FIPE.')
      } finally {
        setCarregandoModelos(false)
      }
    }
  }

  const handleSelecionarModelo = async (opcao) => {
    if (!opcao) {
      setFormData((prev) => ({ ...prev, modelo: '', modeloCodigo: '', ano: '', anoCodigo: '' }))
      setAnosFipe([])
      return
    }
    const modeloNome = opcao.label
    const modeloCod = opcao.value
    setFormData((prev) => ({ ...prev, modelo: modeloNome, modeloCodigo: modeloCod, ano: '', anoCodigo: '' }))
    setAnosFipe([])
    if (formData.marcaCodigo && modeloCod) {
      setCarregandoAnos(true)
      try {
        setAnosFipe(await buscarAnosFipe(formData.marcaCodigo, modeloCod))
      } catch {
        // silencioso
      } finally {
        setCarregandoAnos(false)
      }
    }
  }

  const handleSelecionarAno = (opcao) => {
    if (!opcao) {
      setFormData((prev) => ({ ...prev, ano: '', anoCodigo: '' }))
      return
    }
    setFormData((prev) => ({ ...prev, ano: opcao.ano || opcao.label, anoCodigo: opcao.value, combustivel: opcao.combustivel || prev.combustivel || 'FLEX' }))
  }

  if (!isOpen) return null

  const handleSalvar = () => {
    if (!formData.clienteId) return toast.warning('Selecione o cliente proprietário do veículo.')
    if (!formData.placa?.trim()) return toast.warning('Informe a placa do veículo.')
    const placaLimpa = formData.placa.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
    if (placaLimpa.length < 7) return toast.warning('Placa incompleta. Digite uma placa válida.')
    if (!formData.marca?.trim()) return toast.warning('Selecione ou informe a marca do veículo.')
    if (!formData.modelo?.trim()) return toast.warning('Selecione ou informe o modelo do veículo.')

    const marcaFormatada = formData.marca.trim()
    const modeloFormatado = formData.modelo.trim()
    const marcaModeloCompleto = `${marcaFormatada} ${modeloFormatado}`.trim()
    const codigoFinal = formData.codigoVeiculo || gerarProximoCodigoVeiculo()

    const payload = {
      ...formData,
      id: veiculoParaEditar?.id || veiculoParaEditar?.value || `veic-${Date.now()}`,
      value: veiculoParaEditar?.value || veiculoParaEditar?.id || `veic-${Date.now()}`,
      codigoVeiculo: codigoFinal,
      placa: placaLimpa,
      marca: marcaFormatada,
      modelo: modeloFormatado,
      marcaModelo: marcaModeloCompleto,
      label: `${placaLimpa} - ${marcaModeloCompleto} (${formData.ano || 'N/D'} - ${formData.cor || 'N/D'})`,
      ano: formData.ano?.trim() || '',
      cor: formData.cor?.trim() || '',
      combustivel: formData.combustivel || 'FLEX',
      kmPadrao: formData.kmPadrao?.trim() || '',
      chassi: formData.chassi?.trim().toUpperCase() || '',
      renavam: formData.renavam?.trim() || '',
      observacoes: formData.observacoes?.trim() || '',
      ativo: Boolean(formData.ativo),
    }

    onSalvar(payload, veiculoParaEditar?.clienteId || null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#eaecf0] flex flex-col">
      <header className="shrink-0 bg-white border-b border-[#e4e7ec]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="h-14 px-2 flex items-center justify-between gap-2">
          <button type="button" onClick={onClose} aria-label="Fechar" className="p-2.5 rounded-xl text-[#475467] active:bg-[#f2f4f7] shrink-0">
            <X size={20} weight="bold" />
          </button>
          <span className="text-sm font-extrabold text-[#101828] truncate">
            {veiculoParaEditar ? 'Editar Veículo' : 'Novo Veículo'}
          </span>
          <div className="w-9 shrink-0" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-4">
        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <User size={14} weight="bold" className="text-[#0284c7]" />
            Cliente Proprietário
          </h3>
          <div>
            <label className={labelBaseClass}>Localizar Cliente *</label>
            <Select
              value={clienteSelecionado}
              onChange={(opt) => setFormData((prev) => ({ ...prev, clienteId: opt ? opt.value : '' }))}
              options={opcoesClientes}
              styles={mobileSelectStyles}
              placeholder="Nome, código ou telefone..."
              isClearable
              noOptionsMessage={() => 'Nenhum cliente cadastrado'}
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
              <IdentificationCard size={14} weight="bold" className="text-[#0284c7]" />
              Identificação
            </h3>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ativo}
                onChange={(e) => setFormData((prev) => ({ ...prev, ativo: e.target.checked }))}
                className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#0284c7] border-[#d0d5dd]"
              />
              <span className="text-[11px] font-bold text-[#344054]">Ativo na Frota</span>
            </label>
          </div>

          <div>
            <label className={labelBaseClass}>Placa *</label>
            <IMaskInput
              mask={[{ mask: 'aaa0a00' }, { mask: 'aaa-0000' }]}
              prepareChar={(str) => str.toUpperCase()}
              definitions={{ a: /[A-Za-z]/, 0: /[0-9]/ }}
              value={formData.placa}
              onAccept={(val) => setFormData((prev) => ({ ...prev, placa: val.toUpperCase() }))}
              placeholder="ABC1D23"
              className={`${inputBaseClass} font-mono uppercase`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBaseClass}>Chassi</label>
              <input
                type="text"
                value={formData.chassi}
                maxLength={17}
                onChange={(e) => setFormData((prev) => ({ ...prev, chassi: e.target.value.toUpperCase() }))}
                placeholder="9BWZZZ377VT..."
                className={`${inputBaseClass} font-mono uppercase`}
              />
            </div>
            <div>
              <label className={labelBaseClass}>Renavam</label>
              <input
                type="text"
                value={formData.renavam}
                maxLength={11}
                onChange={(e) => setFormData((prev) => ({ ...prev, renavam: e.target.value.replace(/\D/g, '') }))}
                placeholder="00123456789"
                className={`${inputBaseClass} font-mono`}
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <Car size={14} weight="bold" className="text-[#0284c7]" />
            Especificações e Tabela FIPE
          </h3>

          <div>
            <label className={labelBaseClass}>Marca (Montadora) *</label>
            <CreatableSelect
              value={
                marcasFipe.find((m) => m.value === formData.marcaCodigo || m.label.toLowerCase() === (formData.marca || '').toLowerCase()) ||
                (formData.marca ? { value: formData.marca, label: formData.marca } : null)
              }
              onChange={handleSelecionarMarca}
              options={marcasFipe}
              isLoading={carregandoMarcas}
              styles={mobileSelectStyles}
              placeholder={carregandoMarcas ? 'Buscando marcas FIPE...' : 'Selecione a montadora...'}
              isClearable
              formatCreateLabel={(val) => `Usar: "${val}"`}
            />
          </div>

          <div>
            <label className={labelBaseClass}>Modelo *</label>
            <CreatableSelect
              value={
                modelosFipe.find((m) => m.value === formData.modeloCodigo || m.label.toLowerCase() === (formData.modelo || '').toLowerCase()) ||
                (formData.modelo ? { value: formData.modelo, label: formData.modelo } : null)
              }
              onChange={handleSelecionarModelo}
              options={modelosFipe}
              isLoading={carregandoModelos}
              isDisabled={!formData.marca || carregandoModelos}
              styles={mobileSelectStyles}
              placeholder={!formData.marca ? 'Selecione a montadora primeiro...' : carregandoModelos ? 'Buscando modelos...' : 'Selecione o modelo...'}
              isClearable
              formatCreateLabel={(val) => `Usar: "${val}"`}
            />
          </div>

          <div>
            <label className={labelBaseClass}>Ano/Versão {anosFipe.length > 0 && '(FIPE)'}</label>
            {anosFipe.length > 0 ? (
              <CreatableSelect
                value={
                  anosFipe.find((a) => a.value === formData.anoCodigo || a.ano === formData.ano || a.label.includes(formData.ano)) ||
                  (formData.ano ? { value: formData.ano, label: formData.ano } : null)
                }
                onChange={handleSelecionarAno}
                options={anosFipe}
                isLoading={carregandoAnos}
                styles={mobileSelectStyles}
                placeholder="Ano FIPE..."
                isClearable
                formatCreateLabel={(val) => `Ano: "${val}"`}
              />
            ) : (
              <input
                type="text"
                value={formData.ano}
                onChange={(e) => setFormData((prev) => ({ ...prev, ano: e.target.value }))}
                placeholder="2021/2022"
                className={`${inputBaseClass} font-mono`}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBaseClass}>Cor</label>
              <input
                type="text"
                value={formData.cor}
                onChange={(e) => setFormData((prev) => ({ ...prev, cor: e.target.value }))}
                placeholder="Branco Banchisa"
                className={inputBaseClass}
              />
            </div>
            <div>
              <label className={labelBaseClass}>Combustível</label>
              <Select
                value={COMBUSTIVEL_OPCOES.find((o) => o.value === formData.combustivel)}
                onChange={(opt) => setFormData((prev) => ({ ...prev, combustivel: opt ? opt.value : 'FLEX' }))}
                options={COMBUSTIVEL_OPCOES}
                styles={mobileSelectStyles}
                isSearchable={false}
              />
            </div>
          </div>

          <div>
            <label className={labelBaseClass}>Quilometragem (KM Atual)</label>
            <input
              type="text"
              value={formData.kmPadrao}
              onChange={(e) => setFormData((prev) => ({ ...prev, kmPadrao: e.target.value }))}
              placeholder="Ex: 89.300"
              className={`${inputBaseClass} font-mono`}
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <Notebook size={14} weight="bold" className="text-[#0284c7]" />
            Observações
          </h3>
          <textarea
            rows={3}
            value={formData.observacoes}
            onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))}
            placeholder="Avarias prévias, tipo de óleo recomendado..."
            className={textareaBaseClass}
          />
        </section>

        {veiculoParaEditar && onExcluir && (
          <section>
            {confirmandoExclusao ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 flex items-center gap-2">
                <span className="flex-1 text-xs font-bold text-[#101828]">Excluir este veículo?</span>
                <button type="button" onClick={() => setConfirmandoExclusao(false)} className="h-9 px-3 rounded-lg border border-[#d0d5dd] bg-white text-[#344054] text-xs font-bold">
                  Cancelar
                </button>
                <button type="button" onClick={() => onExcluir(veiculoParaEditar)} className="h-9 px-3 rounded-lg bg-[#b42318] text-white text-xs font-bold">
                  Confirmar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmandoExclusao(true)}
                className="w-full h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Trash size={15} weight="bold" />
                Excluir Veículo
              </button>
            )}
          </section>
        )}
      </main>

      <footer className="shrink-0 bg-white border-t border-[#e4e7ec] px-4 py-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}>
        <button type="button" onClick={handleSalvar} className="w-full h-12 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-sm font-bold flex items-center justify-center gap-2">
          <CheckCircle size={18} weight="bold" />
          {veiculoParaEditar ? 'Salvar Alterações' : 'Cadastrar Veículo'}
        </button>
      </footer>
    </div>
  )
}
