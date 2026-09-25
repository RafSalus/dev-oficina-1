import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  camelParaSnake,
  snakeParaCamel,
  paraSnakeCase,
  paraCamelCase,
  executarOperacao,
  executarRepositorio,
  obterModoOperacao,
  isModoRemoto,
  setModoOperacaoOverride,
} from '../../src/repositories/supabaseHelpers'
import {
  CODIGOS_ERRO,
  MENSAGENS_PADRAO,
  ErroRepositorio,
  mapearErroPostgres,
} from '../../src/repositories/erroRepositorio'
import {
  limparDadosDominioLocalStorage,
} from '../../src/utils/storageCleaners'
import * as supabaseLib from '../../src/lib/supabase'
import {
  salvarFuncionario,
  obterFuncionarioPorId,
  alternarStatusFuncionario,
  excluirFuncionario,
  STORAGE_KEY_FUNCIONARIOS,
} from '../../src/repositories/funcionariosRepository'

describe('Story 2.1: Fundação Supabase & Helpers de Repositório (ADR-005)', () => {
  beforeEach(() => {
    localStorage.clear()
    setModoOperacaoOverride(null)
    vi.restoreAllMocks()
  })

  afterEach(() => {
    setModoOperacaoOverride(null)
    vi.restoreAllMocks()
  })

  describe('1. Conversão bidirecional camelCase ↔ snake_case (AC1)', () => {
    it('deve converter strings simples entre camelCase e snake_case', () => {
      expect(camelParaSnake('nomeCompleto')).toBe('nome_completo')
      expect(camelParaSnake('dataHoraAgendamento')).toBe('data_hora_agendamento')
      expect(camelParaSnake('cpf')).toBe('cpf')

      expect(snakeParaCamel('nome_completo')).toBe('nomeCompleto')
      expect(snakeParaCamel('data_hora_agendamento')).toBe('dataHoraAgendamento')
      expect(snakeParaCamel('cpf')).toBe('cpf')
    })

    it('deve converter chaves de objetos para snake_case preservando campos JSONB (raso)', () => {
      const objetoJS = {
        nomeCliente: 'Oficina Central',
        limiteCredito: 5000,
        snapshotCliente: {
          ruaInterna: 'Rua das Flores',
          numeroPredio: 123,
        },
      }

      // Preservando snapshotCliente como JSONB
      const resultado = paraSnakeCase(objetoJS, { preservarCampos: ['snapshotCliente'] })

      expect(resultado.nome_cliente).toBe('Oficina Central')
      expect(resultado.limite_credito).toBe(5000)
      // O objeto interno preserva suas chaves originais
      expect(resultado.snapshotCliente).toEqual({
        ruaInterna: 'Rua das Flores',
        numeroPredio: 123,
      })
    })

    it('deve converter chaves de objetos para camelCase preservando campos JSONB', () => {
      const objetoBanco = {
        nome_cliente: 'Oficina Central',
        limite_credito: 5000,
        snapshot_cliente: {
          rua_interna: 'Rua das Flores',
          numero_predio: 123,
        },
      }

      const resultado = paraCamelCase(objetoBanco, { preservarCampos: ['snapshot_cliente'] })

      expect(resultado.nomeCliente).toBe('Oficina Central')
      expect(resultado.limiteCredito).toBe(5000)
      expect(resultado.snapshot_cliente).toEqual({
        rua_interna: 'Rua das Flores',
        numero_predio: 123,
      })
    })

    it('deve converter arrays de objetos de forma consistente', () => {
      const itensBanco = [
        { id: '1', preco_unitario: 10 },
        { id: '2', preco_unitario: 25 },
      ]
      const itensJS = paraCamelCase(itensBanco)
      expect(itensJS).toEqual([
        { id: '1', precoUnitario: 10 },
        { id: '2', precoUnitario: 25 },
      ])

      const voltando = paraSnakeCase(itensJS)
      expect(voltando).toEqual(itensBanco)
    })

    it('deve preservar primitivos, null, undefined e instâncias de Date', () => {
      expect(paraCamelCase(null)).toBeNull()
      expect(paraSnakeCase(undefined)).toBeUndefined()
      expect(paraCamelCase(42)).toBe(42)

      const hoje = new Date()
      expect(paraSnakeCase(hoje)).toBe(hoje)
      expect(paraCamelCase(hoje)).toBe(hoje)
    })
  })

  describe('2. Mapeamento de erros Postgres para ErroRepositorio (AC3)', () => {
    it('deve mapear código 42501 para SEM_PERMISSAO', () => {
      const erro = mapearErroPostgres({ code: '42501', message: 'permission denied for table funcionarios' })
      expect(erro).toBeInstanceOf(ErroRepositorio)
      expect(erro.codigo).toBe(CODIGOS_ERRO.SEM_PERMISSAO)
      expect(erro.message).toBe(MENSAGENS_PADRAO[CODIGOS_ERRO.SEM_PERMISSAO])
    })

    it('deve mapear código 23505 para DUPLICADO', () => {
      const erro = mapearErroPostgres({ code: '23505', message: 'unique constraint violation' })
      expect(erro.codigo).toBe(CODIGOS_ERRO.DUPLICADO)
      expect(erro.message).toBe(MENSAGENS_PADRAO[CODIGOS_ERRO.DUPLICADO])
    })

    it('deve mapear código 23503 para REFERENCIA_INVALIDA', () => {
      const erro = mapearErroPostgres({ code: '23503', message: 'foreign key constraint' })
      expect(erro.codigo).toBe(CODIGOS_ERRO.REFERENCIA_INVALIDA)
    })

    it('deve mapear mensagens de timeout / rede para INDISPONIVEL', () => {
      const erro = mapearErroPostgres({ message: 'Failed to fetch / network timeout' })
      expect(erro.codigo).toBe(CODIGOS_ERRO.INDISPONIVEL)
      expect(erro.message).toBe(MENSAGENS_PADRAO[CODIGOS_ERRO.INDISPONIVEL])
    })

    it('deve aceitar mensagens customizadas de acordo com o contexto', () => {
      const contexto = {
        mensagensCustomizadas: {
          [CODIGOS_ERRO.DUPLICADO]: 'CPF ou CNPJ já está cadastrado para outro cliente.',
        },
      }
      const erro = mapearErroPostgres({ code: '23505' }, contexto)
      expect(erro.message).toBe('CPF ou CNPJ já está cadastrado para outro cliente.')
    })
  })

  describe('3. Wrapper executarOperacao com política fail-closed e logs (AC2, AC3, AC6)', () => {
    it('deve desempacotar e retornar data quando o Supabase responde sem erro', async () => {
      const query = Promise.resolve({ data: [{ id: '123', nome: 'Teste' }], error: null })
      const resultado = await executarOperacao(query, { entidade: 'clientes', operacao: 'listar' })
      expect(resultado).toEqual([{ id: '123', nome: 'Teste' }])
    })

    it('deve logar no console.error com entidade e operacao ao capturar erro do Supabase', async () => {
      const spyConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const query = Promise.resolve({
        data: null,
        error: { code: '42501', message: 'permission denied' },
      })

      await expect(
        executarOperacao(query, { entidade: 'funcionarios', operacao: 'salvar' })
      ).rejects.toThrow(ErroRepositorio)

      expect(spyConsoleError).toHaveBeenCalledWith(
        '[Repositorio][funcionarios][salvar] Erro retornado pelo Supabase:',
        expect.objectContaining({ code: '42501' })
      )
    })

    it('deve lançar ErroRepositorio(SEM_PERMISSAO) se esperaLinhasAfetadas for true e 0 linhas forem afetadas', async () => {
      const spyConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      // UPDATE bloqueado por RLS retorna data: [] sem error
      const query = Promise.resolve({ data: [], error: null })

      await expect(
        executarOperacao(
          query,
          { entidade: 'veiculos', operacao: 'atualizar' },
          { esperaLinhasAfetadas: true }
        )
      ).rejects.toThrow(ErroRepositorio)

      expect(spyConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('[Repositorio][veiculos][atualizar] Falha de autorização ou concorrência: 0 linhas afetadas')
      )
    })

    it('deve lançar ErroRepositorio(SEM_PERMISSAO) se esperaLinhasAfetadas for true e data for null', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const query = Promise.resolve({ data: null, error: null })

      await expect(
        executarOperacao(
          query,
          { entidade: 'veiculos', operacao: 'atualizar' },
          { esperaLinhasAfetadas: true }
        )
      ).rejects.toThrow(ErroRepositorio)
    })
  })

  describe('4. Executor executarRepositorio (Modo Remoto vs. Modo Local) (AC2, AC6)', () => {
    it('no modo remoto: executa remoto e NUNCA faz fallback para o local em caso de erro', async () => {
      setModoOperacaoOverride('remoto')
      expect(isModoRemoto()).toBe(true)

      const spyLocal = vi.fn(() => ({ id: 'fallback-indesejado' }))
      vi.spyOn(console, 'error').mockImplementation(() => {})

      const operacao = () =>
        executarRepositorio({
          remoto: () => Promise.resolve({ data: null, error: { code: '42501' } }),
          local: spyLocal,
          contexto: { entidade: 'estoque', operacao: 'ajuste' },
        })

      await expect(operacao()).rejects.toThrow(ErroRepositorio)
      // Garante que o fallback para localStorage NÃO foi executado
      expect(spyLocal).not.toHaveBeenCalled()
    })

    it('no modo local: executa exclusivamente o fluxo local', async () => {
      setModoOperacaoOverride('local')
      expect(isModoRemoto()).toBe(false)
      expect(obterModoOperacao()).toBe('local')

      const spyRemoto = vi.fn()
      const resultadoLocal = { id: 'item-local', salvo: true }

      const resultado = await executarRepositorio({
        remoto: spyRemoto,
        local: () => resultadoLocal,
        contexto: { entidade: 'estoque', operacao: 'ajuste' },
      })

      expect(resultado).toEqual(resultadoLocal)
      expect(spyRemoto).not.toHaveBeenCalled()
    })
  })

  describe('5. Rotina de limpeza de chaves dev_oficina_* no login/logout (AC8, REL-002, REQ-001)', () => {
    it('deve remover apenas as chaves migradas (funcionarios) e preservar entidades não migradas e preferências de UI', () => {
      // Chave de entidade já migrada para o Supabase
      localStorage.setItem('dev_oficina_funcionarios', 'dados_funcionarios')

      // Chaves de domínio AINDA NÃO migradas (devem ser PRESERVADAS para não perder dados locais)
      localStorage.setItem('dev_oficina_clientes', 'dados_clientes_locais')
      localStorage.setItem('dev_oficina_cliente_ativo', 'sessao_portal_cliente')
      localStorage.setItem('dev_oficina_ordens_servico', 'dados_os_locais')

      // Seta chaves de UI e tema que devem ser preservadas
      localStorage.setItem('dev_oficina_tema', 'dark')
      localStorage.setItem('dev_oficina_sidebar_colapsada', 'true')
      localStorage.setItem('chave_qualquer_externa', 'valor')

      limparDadosDominioLocalStorage()

      // Chave migrada deve ser removida
      expect(localStorage.getItem('dev_oficina_funcionarios')).toBeNull()

      // Entidades não migradas devem permanecer intactas (REL-002 / REQ-001)
      expect(localStorage.getItem('dev_oficina_clientes')).toBe('dados_clientes_locais')
      expect(localStorage.getItem('dev_oficina_cliente_ativo')).toBe('sessao_portal_cliente')
      expect(localStorage.getItem('dev_oficina_ordens_servico')).toBe('dados_os_locais')

      // Verifica se preferências de UI foram preservadas
      expect(localStorage.getItem('dev_oficina_tema')).toBe('dark')
      expect(localStorage.getItem('dev_oficina_sidebar_colapsada')).toBe('true')
      expect(localStorage.getItem('chave_qualquer_externa')).toBe('valor')
    })
  })

  describe('6. Testes remotos de funcionariosRepository (TEST-001, REL-001, SEC-001)', () => {
    it('obterFuncionarioPorId remoto: retorna objeto normalizado quando encontrado e null quando inexistente', async () => {
      setModoOperacaoOverride('remoto')
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'f-1', nome: 'Colaborador Remoto', cargo: 'mecanico', ativo: true },
        error: null,
      })
      const mockClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: mockSingle,
            })),
          })),
        })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const f = await obterFuncionarioPorId('f-1')
      expect(f).not.toBeNull()
      expect(f.id).toBe('f-1')
      expect(f.nome).toBe('Colaborador Remoto')

      mockSingle.mockResolvedValueOnce({ data: null, error: null })
      const inexistente = await obterFuncionarioPorId('f-999')
      expect(inexistente).toBeNull()
    })

    it('salvarFuncionario remoto: persiste no Supabase e NÃO grava no localStorage', async () => {
      setModoOperacaoOverride('remoto')
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'f-2', nome: 'Novo Remoto', cargo: 'gerente', ativo: true },
        error: null,
      })
      const mockClient = {
        from: vi.fn(() => ({
          upsert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: mockSingle,
            })),
          })),
        })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      localStorage.clear()
      const salvo = await salvarFuncionario({
        id: 'f-2',
        nome: 'Novo Remoto',
        cargo: 'gerente',
        cpf: '123.456.789-00',
      })

      expect(salvo.id).toBe('f-2')
      expect(salvo.nome).toBe('Novo Remoto')
      // Garante que o localStorage permaneceu vazio no modo remoto (SEC-001 / ADR-005)
      expect(localStorage.getItem(STORAGE_KEY_FUNCIONARIOS)).toBeNull()
    })

    it('alternarStatusFuncionario remoto: atualiza ativo e retorna registro atualizado', async () => {
      setModoOperacaoOverride('remoto')
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'f-3', nome: 'Colaborador Status', cargo: 'mecanico', ativo: false },
        error: null,
      })
      const mockClient = {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: mockSingle,
              })),
            })),
          })),
        })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const atualizado = await alternarStatusFuncionario('f-3', false)
      expect(atualizado.ativo).toBe(false)
    })

    it('excluirFuncionario remoto: retorna true em sucesso e lança ErroRepositorio se 0 linhas afetadas', async () => {
      setModoOperacaoOverride('remoto')
      const mockSelect = vi.fn().mockResolvedValue({
        data: [{ id: 'f-4' }],
        error: null,
      })
      const mockClient = {
        from: vi.fn(() => ({
          delete: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: mockSelect,
            })),
          })),
        })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const excluiu = await excluirFuncionario('f-4')
      expect(excluiu).toBe(true)

      // Falha se 0 linhas foram afetadas (ex.: bloqueado por RLS)
      mockSelect.mockResolvedValueOnce({ data: [], error: null })
      vi.spyOn(console, 'error').mockImplementation(() => {})
      await expect(excluirFuncionario('f-4')).rejects.toThrow(ErroRepositorio)
    })
  })
})

