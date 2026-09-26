import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as supabaseLib from '../../src/lib/supabase'
import { setModoOperacaoOverride } from '../../src/repositories/supabaseHelpers'
import { ErroRepositorio } from '../../src/repositories/erroRepositorio'
import {
  obterMecanicosAtivos,
  STORAGE_KEY_FUNCIONARIOS,
} from '../../src/repositories/funcionariosRepository'

const CAMPOS_SENSIVEIS = ['cpf', 'telefone', 'email', 'comissaoServicos', 'comissaoPecas', 'observacoes', 'authUserId']
const CAMPOS_PERMITIDOS = ['id', 'nome', 'cargo', 'ativo', 'value', 'label']

describe('obterMecanicosAtivos — exposição mínima (Story 2.3 / Regra 14)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    setModoOperacaoOverride(null)
    vi.restoreAllMocks()
  })

  describe('modo remoto (Supabase)', () => {
    const mockarRpc = (resposta) => {
      const rpc = vi.fn().mockResolvedValue(resposta)
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ rpc, from: vi.fn() })
      setModoOperacaoOverride('remoto')
      return rpc
    }

    it('consulta a RPC obter_mecanicos_ativos em vez da tabela funcionarios', async () => {
      const rpc = mockarRpc({ data: [{ id: 'f-1', nome: 'João', cargo: 'mecanico' }], error: null })
      const client = supabaseLib.getSupabaseDataClient()

      const mecanicos = await obterMecanicosAtivos()

      expect(rpc).toHaveBeenCalledWith('obter_mecanicos_ativos')
      expect(client.from).not.toHaveBeenCalled()
      expect(mecanicos).toEqual([
        { id: 'f-1', nome: 'João', cargo: 'mecanico', ativo: true, value: 'f-1', label: 'João' },
      ])
    })

    it('nunca repassa CPF, telefone, comissão ou e-mail, mesmo que a resposta os contenha', async () => {
      mockarRpc({
        data: [
          {
            id: 'f-2',
            nome: 'Maria',
            cargo: 'gerente',
            cpf: '123.456.789-00',
            telefone: '(43) 99999-0000',
            email: 'maria@oficina.com',
            comissao_servicos: 15,
            comissaoPecas: 2,
          },
        ],
        error: null,
      })

      const [mecanico] = await obterMecanicosAtivos()

      expect(Object.keys(mecanico).sort()).toEqual([...CAMPOS_PERMITIDOS].sort())
      CAMPOS_SENSIVEIS.forEach((campo) => expect(mecanico).not.toHaveProperty(campo))
      expect(mecanico).not.toHaveProperty('comissao_servicos')
    })

    it('fail-closed: erro da RPC vira ErroRepositorio, sem cair para o localStorage', async () => {
      localStorage.setItem(
        STORAGE_KEY_FUNCIONARIOS,
        JSON.stringify([{ id: 'local-1', nome: 'Local', cargo: 'mecanico', ativo: true }])
      )
      mockarRpc({ data: null, error: { code: '42501', message: 'permission denied for function obter_mecanicos_ativos' } })

      await expect(obterMecanicosAtivos()).rejects.toBeInstanceOf(ErroRepositorio)
    })

    it('lista vazia quando a RPC não retorna linhas (ex.: papel sem acesso)', async () => {
      mockarRpc({ data: [], error: null })
      expect(await obterMecanicosAtivos()).toEqual([])
    })
  })

  describe('modo local (dev offline)', () => {
    it('aplica a mesma elegibilidade e a mesma projeção mínima', async () => {
      setModoOperacaoOverride('local')
      localStorage.setItem(
        STORAGE_KEY_FUNCIONARIOS,
        JSON.stringify([
          { id: 'a', nome: 'Ana', cargo: 'mecanico', ativo: true, cpf: '1', telefone: '2', comissaoServicos: 10 },
          { id: 'b', nome: 'Beto', cargo: 'aux_mecanico', ativo: true },
          { id: 'c', nome: 'Caio', cargo: 'gerente', ativo: true },
          { id: 'd', nome: 'Dora', cargo: 'secretaria', ativo: true },
          { id: 'e', nome: 'Edu', cargo: 'mecanico', ativo: false },
          { id: 'f', nome: 'Fabi', cargo: 'analista', ativo: true },
        ])
      )

      const mecanicos = await obterMecanicosAtivos()

      expect(mecanicos.map((m) => m.id)).toEqual(['a', 'b', 'c'])
      mecanicos.forEach((m) => {
        expect(Object.keys(m).sort()).toEqual([...CAMPOS_PERMITIDOS].sort())
      })
    })
  })
})
