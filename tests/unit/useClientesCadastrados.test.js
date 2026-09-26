import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useClientesCadastrados } from '../../src/hooks/useClientesCadastrados'
import * as clientesRepo from '../../src/repositories/clientesRepository'

describe('useClientesCadastrados (Story 2.6 / AC1)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('carrega clientes inicialmente e expõe estados de carregamento', async () => {
    const mockClientes = [
      { id: 'c-1', nome: 'Cliente 1', codigoCliente: '0000166' },
      { id: 'c-2', nome: 'Cliente 2', codigoCliente: '0000167' },
    ]
    vi.spyOn(clientesRepo, 'carregarClientes').mockResolvedValue(mockClientes)

    const { result } = renderHook(() => useClientesCadastrados())

    expect(result.current.carregando).toBe(true)

    await waitFor(() => {
      expect(result.current.carregando).toBe(false)
    })

    expect(result.current.dados).toEqual(mockClientes)
    expect(result.current.clientes).toEqual(mockClientes)
    expect(result.current.erro).toBeNull()
  })

  it('captura e expõe erro se a carga falhar', async () => {
    const erroMock = new Error('Falha de conexão')
    vi.spyOn(clientesRepo, 'carregarClientes').mockRejectedValue(erroMock)

    const { result } = renderHook(() => useClientesCadastrados())

    await waitFor(() => {
      expect(result.current.carregando).toBe(false)
    })

    expect(result.current.erro).toEqual(erroMock)
    expect(result.current.dados).toEqual([])
  })

  it('recarrega automaticamente ao receber evento dev_oficina_cadastros_updated', async () => {
    const spy = vi.spyOn(clientesRepo, 'carregarClientes')
      .mockResolvedValueOnce([{ id: 'c-1', nome: 'Cliente Inicial' }])
      .mockResolvedValueOnce([{ id: 'c-1', nome: 'Cliente Inicial' }, { id: 'c-2', nome: 'Novo Cliente' }])

    const { result } = renderHook(() => useClientesCadastrados())

    await waitFor(() => {
      expect(result.current.dados.length).toBe(1)
    })

    act(() => {
      window.dispatchEvent(new CustomEvent('dev_oficina_cadastros_updated'))
    })

    await waitFor(() => {
      expect(result.current.dados.length).toBe(2)
    })

    expect(spy).toHaveBeenCalledTimes(2)
  })
})
