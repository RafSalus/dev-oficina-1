import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  buscarMarcasFipe,
  buscarModelosFipe,
  buscarAnosFipe,
  normalizarCombustivelFipe,
  extrairAnoFipe,
} from '../services/fipeService'
import { NOVO_VEICULO_INICIAL } from '../utils/clientes/clienteFormulario'

const SEM_MODELO = { modelo: '', modeloCodigo: '', ano: '', anoCodigo: '' }

/** Nome e código de uma opção do CreatableSelect (opção criada não tem código FIPE). */
const lerOpcao = (opcao) => ({
  nome: opcao.label || opcao.value,
  codigo: opcao.value !== opcao.label ? opcao.value : '',
})

/**
 * Veículo em inclusão no cadastro do cliente, com a cascata Marca → Modelo → Ano da
 * Tabela FIPE (só dados técnicos, sem preços). As marcas carregam quando o formulário abre.
 *
 * @param {boolean} ativo - O formulário de inclusão está aberto.
 * @returns {object} `veiculo`, listas/estados FIPE e handlers de seleção.
 */
export function useVeiculoFipe(ativo) {
  const [veiculo, setVeiculo] = useState(NOVO_VEICULO_INICIAL)
  const [marcas, setMarcas] = useState([])
  const [modelos, setModelos] = useState([])
  const [anos, setAnos] = useState([])
  const [carregando, setCarregando] = useState({ marcas: false, modelos: false, anos: false })

  const marcarCarregando = (lista, valor) => setCarregando((prev) => ({ ...prev, [lista]: valor }))
  const alterar = (campo, valor) => setVeiculo((prev) => ({ ...prev, [campo]: valor }))

  useEffect(() => {
    if (!ativo || marcas.length > 0) return
    marcarCarregando('marcas', true)
    buscarMarcasFipe()
      .then(setMarcas)
      .catch(() => toast.error('Não foi possível carregar as marcas da Tabela FIPE.'))
      .finally(() => marcarCarregando('marcas', false))
  }, [ativo, marcas.length])

  /** Reinicia o veículo (opcionalmente com o próximo código) e as listas dependentes. */
  const reiniciar = (codigoVeiculo = '') => {
    setVeiculo({ ...NOVO_VEICULO_INICIAL, codigoVeiculo })
    setModelos([])
    setAnos([])
  }

  const selecionarMarca = async (opcao) => {
    setModelos([])
    setAnos([])
    if (!opcao) {
      setVeiculo((prev) => ({ ...prev, marca: '', marcaCodigo: '', ...SEM_MODELO }))
      return
    }
    const { nome, codigo } = lerOpcao(opcao)
    setVeiculo((prev) => ({ ...prev, marca: nome, marcaCodigo: codigo, ...SEM_MODELO }))
    if (!codigo) return
    try {
      marcarCarregando('modelos', true)
      setModelos(await buscarModelosFipe(codigo))
    } catch {
      toast.error('Falha ao carregar modelos da marca na Tabela FIPE.')
    } finally {
      marcarCarregando('modelos', false)
    }
  }

  const selecionarModelo = async (opcao) => {
    setAnos([])
    if (!opcao) {
      setVeiculo((prev) => ({ ...prev, ...SEM_MODELO }))
      return
    }
    const { nome, codigo } = lerOpcao(opcao)
    setVeiculo((prev) => ({ ...prev, modelo: nome, modeloCodigo: codigo, ano: '', anoCodigo: '' }))
    if (!veiculo.marcaCodigo || !codigo) return
    try {
      marcarCarregando('anos', true)
      setAnos(await buscarAnosFipe(veiculo.marcaCodigo, codigo))
    } catch {
      // Sem anos da FIPE o campo vira texto livre
    } finally {
      marcarCarregando('anos', false)
    }
  }

  const selecionarAno = (opcao) => {
    if (!opcao) {
      setVeiculo((prev) => ({ ...prev, ano: '', anoCodigo: '' }))
      return
    }
    const ano = opcao.ano || extrairAnoFipe(opcao.label) || opcao.value || ''
    const combustivel = opcao.combustivel || normalizarCombustivelFipe(opcao.label)
    setVeiculo((prev) => ({ ...prev, ano, anoCodigo: opcao.value || '', combustivel: combustivel || prev.combustivel }))
    if (combustivel) toast.info(`FIPE: Ano ${ano} e Combustível ${combustivel} identificados.`)
  }

  return {
    veiculo,
    alterar,
    reiniciar,
    marcas,
    modelos,
    anos,
    carregando,
    selecionarMarca,
    selecionarModelo,
    selecionarAno,
  }
}
