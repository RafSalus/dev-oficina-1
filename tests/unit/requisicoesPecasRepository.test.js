import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as supabaseLib from '../../src/lib/supabase'
import { setModoOperacaoOverride } from '../../src/repositories/supabaseHelpers'
import { ErroRepositorio } from '../../src/repositories/erroRepositorio'
import {
  carregarRequisicoesPecas,
  criarRequisicaoPeca,
  atualizarStatusRequisicao,
  STORAGE_KEY_REQUISICOES_PECAS,
} from '../../src/repositories/requisicoesPecasRepository'
import {
  mapearRequisicaoParaDominio,
  mapearNovaRequisicaoParaDb,
  statusParaCodigo,
  statusParaRotulo,
} from '../../src/repositories/mapeadores/requisicoesPecas'

const LINHA_DB = {
  id: 'req-uuid-1',
  ordem_servico_id: null,
  numero_os: '1042',
  veiculo: 'Fiat Uno (ABC1D23)',
  peca_id: null,
  peca_nome: 'Pastilha de freio',
  codigo_peca: 'PST-01',
  quantidade: 2,
  urgencia: 'urgente',
  solicitante_id: 'func-mec-1',
  solicitante_nome: 'João Mecânico',
  status: 'aguardando_separacao',
  created_at: '2026-09-26T13:05:00Z',
  updated_at: '2026-09-26T13:05:00Z',
}

const NOVA = {
  numeroOS: '1042',
  veiculo: 'Fiat Uno (ABC1D23)',
  pecaNome: '  Pastilha de freio ',
  codigoPeca: 'PST-01',
  quantidade: '2',
  urgencia: 'urgente',
  mecanicoNome: 'João Mecânico',
}

// Encadeamento do supabase-js: from().select().order() | insert().select().single() | update().eq().select().single()
function mockarSupabase(resposta) {
  const cadeia = {}
  const terminal = vi.fn().mockResolvedValue(resposta)
  cadeia.select = vi.fn(() => cadeia)
  cadeia.order = terminal
  cadeia.single = terminal
  cadeia.insert = vi.fn(() => cadeia)
  cadeia.update = vi.fn(() => cadeia)
  cadeia.eq = vi.fn(() => cadeia)
  const from = vi.fn(() => cadeia)
  vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from })
  setModoOperacaoOverride('remoto')
  return { from, cadeia, terminal }
}

describe('Requisições de peças (Story 2.15)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    setModoOperacaoOverride(null)
    vi.restoreAllMocks()
  })

  describe('mapeadores', () => {
    it('converte status entre código do banco e rótulo da UI, nos dois sentidos', () => {
      expect(statusParaRotulo('aguardando_separacao')).toBe('Aguardando Separação')
      expect(statusParaCodigo('Aguardando Separação')).toBe('aguardando_separacao')
      expect(statusParaCodigo('atendida')).toBe('atendida')
      expect(statusParaCodigo('inexistente')).toBeNull()
    })

    it('linha do banco vira o formato que a UI já usa', () => {
      const req = mapearRequisicaoParaDominio(LINHA_DB)
      expect(req).toMatchObject({
        id: 'req-uuid-1',
        numeroOS: '1042',
        pecaNome: 'Pastilha de freio',
        quantidade: 2,
        urgencia: 'urgente',
        mecanicoNome: 'João Mecânico',
        solicitanteId: 'func-mec-1',
        status: 'Aguardando Separação',
      })
      expect(req.dataHora).toBe('26/09/2026 10:05') // horário de Brasília
    })

    it('nova requisição não envia id, solicitante nem status: vêm do banco', () => {
      const linha = mapearNovaRequisicaoParaDb(NOVA)
      expect(linha).toMatchObject({ peca_nome: 'Pastilha de freio', quantidade: 2, urgencia: 'urgente', numero_os: '1042' })
      expect(linha).not.toHaveProperty('id')
      expect(linha).not.toHaveProperty('solicitante_id')
      expect(linha).not.toHaveProperty('status')
      expect(mapearNovaRequisicaoParaDb({ ...NOVA, urgencia: 'qualquer', quantidade: 0 })).toMatchObject({
        urgencia: 'normal',
        quantidade: 1,
      })
    })
  })

  describe('modo remoto (Supabase)', () => {
    it('carrega da tabela requisicoes_pecas, mais recentes primeiro', async () => {
      const { from, cadeia } = mockarSupabase({ data: [LINHA_DB], error: null })
      const lista = await carregarRequisicoesPecas()
      expect(from).toHaveBeenCalledWith('requisicoes_pecas')
      expect(cadeia.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(lista).toHaveLength(1)
      expect(lista[0].status).toBe('Aguardando Separação')
    })

    it('cria com solicitante resolvido pelo banco (sessão) e devolve a linha criada', async () => {
      const { cadeia } = mockarSupabase({ data: LINHA_DB, error: null })
      const criada = await criarRequisicaoPeca(NOVA)
      const enviado = cadeia.insert.mock.calls[0][0]
      expect(enviado).not.toHaveProperty('solicitante_id')
      expect(enviado).not.toHaveProperty('id')
      expect(criada).toMatchObject({ id: 'req-uuid-1', solicitanteId: 'func-mec-1' })
      expect(localStorage.getItem(STORAGE_KEY_REQUISICOES_PECAS)).toBeNull()
    })

    it('fail-closed: RLS negando o INSERT (mecânico sem vínculo) vira ErroRepositorio, sem gravar local', async () => {
      mockarSupabase({ data: null, error: { code: '42501', message: 'new row violates row-level security policy' } })
      await expect(criarRequisicaoPeca(NOVA)).rejects.toBeInstanceOf(ErroRepositorio)
      expect(localStorage.getItem(STORAGE_KEY_REQUISICOES_PECAS)).toBeNull()
    })

    it('fail-closed: erro na leitura não cai para o localStorage', async () => {
      localStorage.setItem(STORAGE_KEY_REQUISICOES_PECAS, JSON.stringify([{ id: 'local' }]))
      mockarSupabase({ data: null, error: { code: '08006', message: 'connection failure' } })
      await expect(carregarRequisicoesPecas()).rejects.toBeInstanceOf(ErroRepositorio)
    })

    it('atualiza só o status (com código do banco) e não toca no estoque', async () => {
      const { from, cadeia } = mockarSupabase({ data: { ...LINHA_DB, status: 'atendida' }, error: null })
      const atualizada = await atualizarStatusRequisicao('req-uuid-1', 'Atendida')
      expect(cadeia.update.mock.calls[0][0]).toMatchObject({ status: 'atendida' })
      expect(cadeia.eq).toHaveBeenCalledWith('id', 'req-uuid-1')
      expect(from.mock.calls.map((c) => c[0])).toEqual(['requisicoes_pecas'])
      expect(atualizada.status).toBe('Atendida')
    })

    it('UPDATE que não afeta linha (sem permissão) vira erro', async () => {
      mockarSupabase({ data: null, error: null })
      await expect(atualizarStatusRequisicao('req-uuid-1', 'recusada', { motivoRecusa: 'sem estoque' })).rejects.toBeInstanceOf(
        ErroRepositorio
      )
    })

    it('recusa status inválido ou ausente antes de chamar o banco', async () => {
      const { from } = mockarSupabase({ data: LINHA_DB, error: null })
      await expect(atualizarStatusRequisicao('req-uuid-1', 'Voando')).rejects.toBeInstanceOf(ErroRepositorio)
      await expect(atualizarStatusRequisicao('req-uuid-1')).rejects.toBeInstanceOf(ErroRepositorio)
      await expect(atualizarStatusRequisicao('req-uuid-1', '')).rejects.toBeInstanceOf(ErroRepositorio)
      expect(from).not.toHaveBeenCalled()
    })
  })

  describe('modo local (dev offline)', () => {
    beforeEach(() => setModoOperacaoOverride('local'))

    it('cria, lista (mais recente primeiro) e atualiza status no localStorage', async () => {
      const a = await criarRequisicaoPeca({ ...NOVA, pecaNome: 'Filtro de óleo' })
      await new Promise((r) => setTimeout(r, 2))
      const b = await criarRequisicaoPeca(NOVA)
      const lista = await carregarRequisicoesPecas()
      expect(lista.map((r) => r.id)).toEqual([b.id, a.id])
      expect(lista[0].status).toBe('Aguardando Separação')

      const atualizada = await atualizarStatusRequisicao(a.id, 'atendida')
      expect(atualizada.status).toBe('Atendida')
      expect((await carregarRequisicoesPecas()).find((r) => r.id === a.id).status).toBe('Atendida')
    })

    it('exige o nome da peça', async () => {
      await expect(criarRequisicaoPeca({ ...NOVA, pecaNome: '  ' })).rejects.toBeInstanceOf(ErroRepositorio)
    })
  })
})
