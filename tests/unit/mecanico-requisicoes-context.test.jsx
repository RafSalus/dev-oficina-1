import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { MecanicoProvider, useMecanico } from '../../src/context/MecanicoContext'
import { setModoOperacaoOverride } from '../../src/repositories/supabaseHelpers'
import * as repo from '../../src/repositories/requisicoesPecasRepository'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))

const wrapper = ({ children }) => <MecanicoProvider>{children}</MecanicoProvider>

const PEDIDO = {
  numeroOS: '1042',
  veiculo: 'Fiat Uno (ABC1D23)',
  pecaNome: 'Pastilha de freio',
  codigoPeca: 'PST-01',
  quantidade: 2,
  urgencia: 'urgente',
}

describe('MecanicoContext — requisições de peças via repositório (Story 2.15)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    setModoOperacaoOverride('local')
  })

  afterEach(() => {
    setModoOperacaoOverride(null)
    vi.restoreAllMocks()
  })

  it('carrega as requisições do repositório de forma assíncrona', async () => {
    await repo.criarRequisicaoPeca({ ...PEDIDO, mecanicoNome: 'João' })
    const { result } = renderHook(() => useMecanico(), { wrapper })

    expect(result.current.carregandoRequisicoes).toBe(true)
    await waitFor(() => expect(result.current.carregandoRequisicoes).toBe(false))
    expect(result.current.requisicoesPecas).toHaveLength(1)
    expect(result.current.requisicoesPecas[0]).toMatchObject({ pecaNome: 'Pastilha de freio', status: 'Aguardando Separação' })
  })

  it('pedirPecaParaOS mantém a assinatura, grava pelo repositório e atualiza a lista', async () => {
    const { result } = renderHook(() => useMecanico(), { wrapper })
    await waitFor(() => expect(result.current.carregandoRequisicoes).toBe(false))

    await act(async () => {
      await result.current.pedirPecaParaOS(PEDIDO)
    })

    expect(result.current.requisicoesPecas).toHaveLength(1)
    expect(result.current.requisicoesPecas[0]).toMatchObject({ numeroOS: '1042', quantidade: 2, urgencia: 'urgente' })
    expect(await repo.carregarRequisicoesPecas()).toHaveLength(1)
    expect(toast.success).toHaveBeenCalled()
  })

  it('falha do repositório: mostra erro e não altera a lista (fail-closed)', async () => {
    const { result } = renderHook(() => useMecanico(), { wrapper })
    await waitFor(() => expect(result.current.carregandoRequisicoes).toBe(false))
    vi.spyOn(repo, 'criarRequisicaoPeca').mockRejectedValueOnce(new Error('Você não tem permissão para esta operação.'))

    let retorno
    await act(async () => {
      retorno = await result.current.pedirPecaParaOS(PEDIDO)
    })

    expect(retorno).toBeNull()
    expect(result.current.requisicoesPecas).toHaveLength(0)
    expect(toast.error).toHaveBeenCalledWith('Você não tem permissão para esta operação.')
  })

  it('duplo clique: o segundo pedido durante o envio é ignorado (uma requisição só)', async () => {
    const { result } = renderHook(() => useMecanico(), { wrapper })
    await waitFor(() => expect(result.current.carregandoRequisicoes).toBe(false))

    let primeiro, segundo
    await act(async () => {
      ;[primeiro, segundo] = await Promise.all([
        result.current.pedirPecaParaOS(PEDIDO),
        result.current.pedirPecaParaOS(PEDIDO),
      ])
    })

    expect(primeiro).not.toBeNull()
    expect(segundo).toBeNull()
    expect(await repo.carregarRequisicoesPecas()).toHaveLength(1)

    await act(async () => {
      await result.current.pedirPecaParaOS(PEDIDO)
    })
    expect(await repo.carregarRequisicoesPecas()).toHaveLength(2)
  })
})
