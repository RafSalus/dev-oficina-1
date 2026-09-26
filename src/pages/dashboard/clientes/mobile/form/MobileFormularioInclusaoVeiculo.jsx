import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { IMaskInput } from 'react-imask'
import { Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  buscarMarcasFipe,
  buscarModelosFipe,
  buscarAnosFipe,
  normalizarCombustivelFipe,
  extrairAnoFipe,
} from '../../../../../services/fipeService'
import {
  mobileSelectStyles,
  inputBaseClass,
  labelBaseClass,
} from '../../../nova-os/mobile/mobileSelectStyles'

export const COMBUSTIVEL_OPCOES = [
  { value: 'FLEX', label: 'Flex (Álcool e Gasolina)' },
  { value: 'GASOLINA', label: 'Gasolina' },
  { value: 'ETANOL', label: 'Etanol / Álcool' },
  { value: 'DIESEL', label: 'Diesel S10 / S500' },
  { value: 'HIBRIDO', label: 'Híbrido' },
  { value: 'ELETRICO', label: 'Elétrico' },
  { value: 'GNV', label: 'GNV (Gás Natural Veicular)' },
]

const NOVO_VEICULO_INICIAL = {
  codigoVeiculo: '',
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
}

export function MobileFormularioInclusaoVeiculo({
  _veiculos,
  onConfirmar,
  onCancelar,
}) {
  const [novoVeiculo, setNovoVeiculo] = useState(() => ({
    ...NOVO_VEICULO_INICIAL,
    codigoVeiculo: '',
  }))

  const [marcasFipe, setMarcasFipe] = useState([])
  const [carregandoMarcas, setCarregandoMarcas] = useState(false)
  const [modelosFipe, setModelosFipe] = useState([])
  const [carregandoModelos, setCarregandoModelos] = useState(false)
  const [anosFipe, setAnosFipe] = useState([])
  const [carregandoAnos, setCarregandoAnos] = useState(false)

  useEffect(() => {
    let cancelado = false
    setCarregandoMarcas(true)
    buscarMarcasFipe()
      .then((lista) => {
        if (!cancelado) setMarcasFipe(lista)
      })
      .catch(() => toast.error('Não foi possível carregar as marcas da Tabela FIPE.'))
      .finally(() => {
        if (!cancelado) setCarregandoMarcas(false)
      })
    return () => {
      cancelado = true
    }
  }, [])

  const handleSelecionarMarca = async (opcao) => {
    if (!opcao) {
      setNovoVeiculo((prev) => ({
        ...prev,
        marca: '',
        marcaCodigo: '',
        modelo: '',
        modeloCodigo: '',
        ano: '',
        anoCodigo: '',
      }))
      setModelosFipe([])
      setAnosFipe([])
      return
    }
    const marcaNome = opcao.label || opcao.value
    const marcaCod = opcao.value !== opcao.label ? opcao.value : ''
    setNovoVeiculo((prev) => ({
      ...prev,
      marca: marcaNome,
      marcaCodigo: marcaCod,
      modelo: '',
      modeloCodigo: '',
      ano: '',
      anoCodigo: '',
    }))
    setModelosFipe([])
    setAnosFipe([])
    if (marcaCod) {
      try {
        setCarregandoModelos(true)
        setModelosFipe(await buscarModelosFipe(marcaCod))
      } catch {
        toast.error('Falha ao carregar modelos da marca na Tabela FIPE.')
      } finally {
        setCarregandoModelos(false)
      }
    }
  }

  const handleSelecionarModelo = async (opcao) => {
    if (!opcao) {
      setNovoVeiculo((prev) => ({
        ...prev,
        modelo: '',
        modeloCodigo: '',
        ano: '',
        anoCodigo: '',
      }))
      setAnosFipe([])
      return
    }
    const modeloNome = opcao.label || opcao.value
    const modeloCod = opcao.value !== opcao.label ? opcao.value : ''
    setNovoVeiculo((prev) => ({
      ...prev,
      modelo: modeloNome,
      modeloCodigo: modeloCod,
      ano: '',
      anoCodigo: '',
    }))
    setAnosFipe([])
    if (novoVeiculo.marcaCodigo && modeloCod) {
      try {
        setCarregandoAnos(true)
        setAnosFipe(await buscarAnosFipe(novoVeiculo.marcaCodigo, modeloCod))
      } catch {
        // silencioso
      } finally {
        setCarregandoAnos(false)
      }
    }
  }

  const handleSelecionarAno = (opcao) => {
    if (!opcao) {
      setNovoVeiculo((prev) => ({ ...prev, ano: '', anoCodigo: '' }))
      return
    }
    const anoSelecionado =
      opcao.ano || extrairAnoFipe(opcao.label) || opcao.value || ''
    const combustivelDetectado =
      opcao.combustivel || normalizarCombustivelFipe(opcao.label)
    setNovoVeiculo((prev) => ({
      ...prev,
      ano: anoSelecionado,
      anoCodigo: opcao.value || '',
      combustivel: combustivelDetectado || prev.combustivel,
    }))
  }

  const handleSubmeter = () => {
    if (!novoVeiculo.placa?.trim()) return toast.warning('Informe a placa do veículo.')
    if (!novoVeiculo.marca?.trim())
      return toast.warning('Selecione ou informe a marca do veículo.')
    if (!novoVeiculo.modelo?.trim())
      return toast.warning('Selecione ou informe o modelo do veículo.')

    const placaFormatada = novoVeiculo.placa
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '')
    const marcaFormatada = novoVeiculo.marca.trim()
    const modeloFormatado = novoVeiculo.modelo.trim()
    const marcaModeloCompleto = `${marcaFormatada} ${modeloFormatado}`.trim()
    const codigoFinal = novoVeiculo.codigoVeiculo || ''

    const veiculoItem = {
      value: `veic-${Date.now()}`,
      id: `veic-${Date.now()}`,
      codigoVeiculo: codigoFinal,
      label: `${placaFormatada} - ${marcaModeloCompleto} (${
        novoVeiculo.ano || 'N/D'
      } - ${novoVeiculo.cor || 'N/D'})`,
      placa: placaFormatada,
      marca: marcaFormatada,
      modelo: modeloFormatado,
      marcaModelo: marcaModeloCompleto,
      ano: novoVeiculo.ano?.trim() || '',
      cor: novoVeiculo.cor?.trim() || '',
      combustivel: novoVeiculo.combustivel || 'FLEX',
      kmPadrao: novoVeiculo.kmPadrao?.trim() || '',
    }

    onConfirmar(veiculoItem)
  }

  return (
    <div className="bg-[#f8fafc] border border-sky-200 rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] font-bold text-[#0284c7]">
          Novo Veículo (Tabela FIPE)
        </span>
        <button
          type="button"
          onClick={onCancelar}
          className="text-[10.5px] font-bold text-[#98a2b3] cursor-pointer"
        >
          Cancelar
        </button>
      </div>

      <div>
        <label className={labelBaseClass}>Placa *</label>
        <IMaskInput
          mask={[{ mask: 'aaa0a00' }, { mask: 'aaa-0000' }]}
          prepareChar={(str) => str.toUpperCase()}
          definitions={{ a: /[A-Za-z]/, 0: /[0-9]/ }}
          value={novoVeiculo.placa}
          onAccept={(val) =>
            setNovoVeiculo((prev) => ({ ...prev, placa: val.toUpperCase() }))
          }
          placeholder="ABC1D23"
          className={`${inputBaseClass} font-mono uppercase`}
        />
      </div>

      <div>
        <label className={labelBaseClass}>Marca (FIPE) *</label>
        <CreatableSelect
          value={
            marcasFipe.find(
              (m) =>
                m.value === novoVeiculo.marcaCodigo ||
                m.label.toLowerCase() === (novoVeiculo.marca || '').toLowerCase()
            ) ||
            (novoVeiculo.marca
              ? { value: novoVeiculo.marca, label: novoVeiculo.marca }
              : null)
          }
          onChange={handleSelecionarMarca}
          options={marcasFipe}
          isLoading={carregandoMarcas}
          styles={mobileSelectStyles}
          placeholder={
            carregandoMarcas ? 'Buscando marcas...' : 'Selecione a marca...'
          }
          isClearable
          formatCreateLabel={(val) => `Usar: "${val}"`}
        />
      </div>

      <div>
        <label className={labelBaseClass}>Modelo (FIPE) *</label>
        <CreatableSelect
          value={
            modelosFipe.find(
              (m) =>
                m.value === novoVeiculo.modeloCodigo ||
                m.label.toLowerCase() === (novoVeiculo.modelo || '').toLowerCase()
            ) ||
            (novoVeiculo.modelo
              ? { value: novoVeiculo.modelo, label: novoVeiculo.modelo }
              : null)
          }
          onChange={handleSelecionarModelo}
          options={modelosFipe}
          isLoading={carregandoModelos}
          isDisabled={!novoVeiculo.marca || carregandoModelos}
          styles={mobileSelectStyles}
          placeholder={
            !novoVeiculo.marca
              ? 'Selecione a marca primeiro...'
              : carregandoModelos
              ? 'Carregando...'
              : 'Selecione o modelo...'
          }
          isClearable
          formatCreateLabel={(val) => `Usar: "${val}"`}
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className={labelBaseClass}>
            Ano/Mod. {anosFipe.length > 0 && '(FIPE)'}
          </label>
          {anosFipe.length > 0 ? (
            <CreatableSelect
              value={
                anosFipe.find(
                  (a) =>
                    a.value === novoVeiculo.anoCodigo ||
                    a.ano === novoVeiculo.ano ||
                    a.label.includes(novoVeiculo.ano)
                ) ||
                (novoVeiculo.ano
                  ? { value: novoVeiculo.ano, label: novoVeiculo.ano }
                  : null)
              }
              onChange={handleSelecionarAno}
              options={anosFipe}
              isLoading={carregandoAnos}
              styles={mobileSelectStyles}
              placeholder="Ano..."
              isClearable
            />
          ) : (
            <input
              type="text"
              value={novoVeiculo.ano}
              onChange={(e) =>
                setNovoVeiculo((prev) => ({ ...prev, ano: e.target.value }))
              }
              placeholder="2021/2022"
              className={`${inputBaseClass} font-mono`}
            />
          )}
        </div>
        <div>
          <label className={labelBaseClass}>Cor</label>
          <input
            type="text"
            value={novoVeiculo.cor}
            onChange={(e) =>
              setNovoVeiculo((prev) => ({ ...prev, cor: e.target.value }))
            }
            placeholder="Branca"
            className={inputBaseClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className={labelBaseClass}>Combustível</label>
          <Select
            value={COMBUSTIVEL_OPCOES.find(
              (o) => o.value === novoVeiculo.combustivel
            )}
            onChange={(opt) =>
              setNovoVeiculo((prev) => ({
                ...prev,
                combustivel: opt ? opt.value : 'FLEX',
              }))
            }
            options={COMBUSTIVEL_OPCOES}
            styles={mobileSelectStyles}
            isSearchable={false}
          />
        </div>
        <div>
          <label className={labelBaseClass}>KM</label>
          <input
            type="text"
            value={novoVeiculo.kmPadrao}
            onChange={(e) =>
              setNovoVeiculo((prev) => ({ ...prev, kmPadrao: e.target.value }))
            }
            placeholder="280.812"
            className={`${inputBaseClass} font-mono`}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmeter}
        className="w-full h-11 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Plus size={14} weight="bold" />
        Incluir Veículo
      </button>
    </div>
  )
}
