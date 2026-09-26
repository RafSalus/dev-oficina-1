import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useFrotaVeiculos } from '../../src/hooks/useFrotaVeiculos'
import * as veiculosRepo from '../../src/repositories/veiculosRepository'

describe('useFrotaVeiculos (Story 2.6 / AC1)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('carrega frota inicialmente e expõe estados de carregamento', async () => {
    const mockVeiculos = [
      { id: 'v-1', placa: 'ABC1234', marcaModelo: 'Fiat Uno', codigoVeiculo: 'VEIC-0001' },
      { id: 'v-2', placa: 'XYZ9876', marcaModelo: 'VW Gol', codigoVeiculo: 'VEIC-0002' },
    ]
    vi.spyOn(veiculosRepo, 'carregarVeiculos').mockResolvedValue(mockVeiculos)

    const { result } = renderHook(() => useFrotaVeiculos())

    expect(result.current.carregando).toBe(true)

    await waitFor(() => {
      expect(result.current.carregando).toBe(false)
    })

    expect(result.current.dados).toEqual(mockVeiculos)
    expect(result.current.veiculos).toEqual(mockVeiculos)
    expect(result.current.erro).toBeNull()
  })

  it('captura e expõe erro se a carga falhar', async () => {
    const erroMock = new Error('Falha no banco')
    vi.spyOn(veiculosRepo, 'carregarVeiculos').mockRejectedValue(erroMock)

    const { result } = renderHook(() => useFrotaVeiculos())

    await waitFor(() => {
      expect(result.current.carregando).toBe(false)
    })

    expect(result.current.erro).toEqual(erroMock)
    expect(result.current.dados).toEqual([])
  })

  it('recarrega automaticamente ao receber evento dev_oficina_cadastros_updated', async () => {
    const spy = vi.spyOn(veiculosRepo, 'carregarVeiculos')
      .mockResolvedValueOnce([{ id: 'v-1', placa: 'ABC1234' }])
      .mockResolvedValueOnce([{ id: 'v-1', placa: 'ABC1234' }, { id: 'v-2', placa: 'NOVO001' }])

    const { result } = renderHook(() => useFrotaVeiculos())

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
