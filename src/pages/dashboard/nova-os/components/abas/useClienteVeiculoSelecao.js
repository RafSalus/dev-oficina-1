import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useClientesCadastrados } from '../../../../../hooks/useClientesCadastrados'
import * as clientesRepository from '../../../../../repositories/clientesRepository'
import * as veiculosRepository from '../../../../../repositories/veiculosRepository'
import { obterMarcaModeloSeparados } from '../formularioAberturaShared'

export function useClienteVeiculoSelecao(formData, updateFormData) {
  const [modalNovoClienteAberto, setModalNovoClienteAberto] = useState(false)
  const [modalNovoVeiculoAberto, setModalNovoVeiculoAberto] = useState(false)

  const { clientes: listaClientes, carregando: carregandoClientes } = useClientesCadastrados({ incluirVeiculos: true })

  const clientesOptions = useMemo(() => {
    return listaClientes.map((c) => {
      const placaStr =
        Array.isArray(c.veiculos) && c.veiculos.length > 0
          ? ` • Placa(s): ${c.veiculos.map((v) => v.placa).join(', ')}`
          : ''
      const docStr = c.documento ? ` • ${c.documento}` : ''
      const foneStr = c.telefone ? ` • ${c.telefone}` : ''
      return {
        value: c.value || c.id,
        label: `${c.nome}${docStr}${foneStr}${placaStr}`,
        dados: c,
      }
    })
  }, [listaClientes])

  const selectedClienteOption = useMemo(() => {
    if (!formData.clienteId && !formData.cliente) return null
    return (
      clientesOptions.find(
        (opt) =>
          (formData.clienteId && opt.value === formData.clienteId) ||
          (formData.cliente && opt.dados.nome?.toLowerCase() === formData.cliente?.toLowerCase())
      ) || null
    )
  }, [formData.clienteId, formData.cliente, clientesOptions])

  const veiculosDoCliente = useMemo(() => {
    if (!selectedClienteOption?.dados?.veiculos) return []
    return selectedClienteOption.dados.veiculos
  }, [selectedClienteOption])

  const veiculosOptions = useMemo(() => {
    return veiculosDoCliente.map((v) => ({
      value: v.value || v.id || v.placa,
      label: `${v.placa} • ${v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim()} (${v.ano || ''} - ${v.cor || ''})`,
      dados: v,
    }))
  }, [veiculosDoCliente])

  const selectedVeiculoOption = useMemo(() => {
    if (!formData.placa && !formData.veiculoId) return null
    return (
      veiculosOptions.find(
        (opt) =>
          (formData.veiculoId && opt.value === formData.veiculoId) ||
          (formData.placa &&
            opt.dados.placa?.toUpperCase().trim() === formData.placa?.toUpperCase().trim())
      ) || null
    )
  }, [formData.veiculoId, formData.placa, veiculosOptions])

  const handleSelectCliente = (option) => {
    if (!option) {
      updateFormData({
        clienteId: '',
        cliente: '',
        telefone: '',
        documento: '',
        email: '',
        endereco: '',
        cidade: '',
        uf: '',
        veiculoId: '',
        placa: '',
        marcaModelo: '',
        ano: '',
        cor: '',
        combustivel: 'FLEX',
        km: '',
        kmAnterior: '',
      })
      return
    }

    const c = option.dados
    const primeiroVeic = Array.isArray(c.veiculos) && c.veiculos.length > 0 ? c.veiculos[0] : null
    const { marca, modelo } = obterMarcaModeloSeparados(primeiroVeic)

    updateFormData({
      clienteId: c.value || c.id,
      cliente: c.nome,
      telefone: c.telefone || '',
      documento: c.documento || '',
      email: c.email || '',
      endereco: c.endereco || '',
      cidade: c.cidade || '',
      uf: c.uf || 'PR',
      veiculoId: primeiroVeic ? primeiroVeic.value || primeiroVeic.id : '',
      placa: primeiroVeic ? primeiroVeic.placa : '',
      marca,
      modelo,
      marcaModelo: primeiroVeic
        ? primeiroVeic.marcaModelo || `${marca} ${modelo}`.trim()
        : '',
      ano: primeiroVeic ? primeiroVeic.ano || '' : '',
      cor: primeiroVeic ? primeiroVeic.cor || '' : '',
      combustivel: primeiroVeic ? primeiroVeic.combustivel || 'FLEX' : 'FLEX',
      km: primeiroVeic ? primeiroVeic.kmPadrao || primeiroVeic.kmAtual || '' : '',
      kmAnterior: primeiroVeic ? primeiroVeic.kmAnterior || primeiroVeic.kmPadrao || '' : '',
    })
  }

  const handleSelectVeiculo = (option) => {
    if (!option) {
      updateFormData({
        veiculoId: '',
        placa: '',
        marca: '',
        modelo: '',
        marcaModelo: '',
        ano: '',
        cor: '',
        combustivel: 'FLEX',
        km: '',
        kmAnterior: '',
      })
      return
    }

    const v = option.dados
    const { marca, modelo } = obterMarcaModeloSeparados(v)
    updateFormData({
      veiculoId: v.value || v.id,
      placa: v.placa || '',
      marca,
      modelo,
      marcaModelo: v.marcaModelo || `${marca} ${modelo}`.trim(),
      ano: v.ano || '',
      cor: v.cor || '',
      combustivel: v.combustivel || 'FLEX',
      km: v.kmPadrao || v.kmAtual || formData.km || '',
      kmAnterior: v.kmAnterior || v.kmPadrao || '',
    })
  }

  const handleSalvarNovoCliente = async (clienteCriado) => {
    if (!clienteCriado) return
    try {
      const salvo = await clientesRepository.salvarCliente(clienteCriado)
      if (Array.isArray(clienteCriado.veiculos) && clienteCriado.veiculos.length > 0) {
        for (const v of clienteCriado.veiculos) {
          try {
            await veiculosRepository.salvarVeiculo({ ...v, clienteId: salvo.id })
          } catch (errV) {
            console.error('Erro ao salvar veículo do cliente:', errV)
          }
        }
      }
      const primeiroVeic =
        Array.isArray(clienteCriado.veiculos) && clienteCriado.veiculos.length > 0
          ? clienteCriado.veiculos[0]
          : null

      updateFormData({
        clienteId: salvo.value || salvo.id,
        cliente: salvo.nome,
        telefone: salvo.telefone || '',
        documento: salvo.documento || '',
        email: salvo.email || '',
        endereco: salvo.endereco || '',
        cidade: salvo.cidade || '',
        uf: salvo.uf || 'PR',
        veiculoId: primeiroVeic ? primeiroVeic.value || primeiroVeic.id : '',
        placa: primeiroVeic ? primeiroVeic.placa : '',
        marcaModelo: primeiroVeic
          ? primeiroVeic.marcaModelo || `${primeiroVeic.marca || ''} ${primeiroVeic.modelo || ''}`.trim()
          : '',
        ano: primeiroVeic ? primeiroVeic.ano : '',
        cor: primeiroVeic ? primeiroVeic.cor : '',
        combustivel: primeiroVeic ? primeiroVeic.combustivel || 'FLEX' : 'FLEX',
        km: primeiroVeic ? primeiroVeic.kmPadrao || primeiroVeic.kmAtual || '' : '',
      })

      setModalNovoClienteAberto(false)
      toast.success(`Cliente ${salvo.nome} cadastrado e vinculado a esta OS!`)
      return salvo
    } catch (err) {
      toast.error(err.message || 'Erro ao cadastrar cliente.')
      throw err
    }
  }

  const handleSalvarNovoVeiculo = async (veicCriado, clienteIdOriginal) => {
    if (!veicCriado) return
    try {
      const salvo = await veiculosRepository.salvarVeiculo(
        { ...veicCriado, clienteId: formData.clienteId || veicCriado.clienteId },
        clienteIdOriginal
      )
      const { marca, modelo } = obterMarcaModeloSeparados(salvo)
      updateFormData({
        veiculoId: salvo.value || salvo.id,
        placa: salvo.placa || '',
        marca,
        modelo,
        marcaModelo: salvo.marcaModelo || `${marca} ${modelo}`.trim(),
        ano: salvo.ano || '',
        cor: salvo.cor || '',
        combustivel: salvo.combustivel || 'FLEX',
        km: salvo.kmAtual || salvo.kmPadrao || '',
      })
      setModalNovoVeiculoAberto(false)
      toast.success(`Veículo placa ${salvo.placa} cadastrado e vinculado com sucesso!`)
      return salvo
    } catch (err) {
      toast.error(err.message || 'Erro ao cadastrar veículo.')
      throw err
    }
  }

  const somarDias = (dias) => {
    const data = new Date()
    data.setDate(data.getDate() + dias)
    const d = String(data.getDate()).padStart(2, '0')
    const m = String(data.getMonth() + 1).padStart(2, '0')
    const y = data.getFullYear()
    return `${d}/${m}/${y}`
  }

  const foneLimpo = (formData.telefone || '').replace(/\D/g, '')

  return {
    modalNovoClienteAberto,
    setModalNovoClienteAberto,
    modalNovoVeiculoAberto,
    setModalNovoVeiculoAberto,
    clientesOptions,
    selectedClienteOption,
    veiculosOptions,
    selectedVeiculoOption,
    handleSelectCliente,
    handleSelectVeiculo,
    handleSalvarNovoCliente,
    handleSalvarNovoVeiculo,
    somarDias,
    foneLimpo,
    carregandoClientes,
  }
}
