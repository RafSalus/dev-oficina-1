import { describe, it, expect, beforeEach } from 'vitest'
import {
  salvarFuncionario,
  alternarStatusFuncionario,
  excluirFuncionario,
  obterMecanicosAtivos,
  obterFuncionarioPorId,
} from '../../src/repositories/funcionariosRepository'

describe('Story 1.10: Módulo de Cadastro de Funcionários & Integração Viva', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('IV1: deve cadastrar um novo funcionário "Mecânico Ricardo" com status ativo', async () => {
    const novo = await salvarFuncionario({
      nome: 'Mecânico Ricardo',
      cpf: '123.456.789-00',
      telefone: '(43) 99876-9999',
      cargo: 'mecanico',
      especialidade: 'Câmbio Automático e CVT',
      comissaoServicos: 15,
      comissaoPecas: 2.5,
      ativo: true,
    })

    expect(novo.id).toBeDefined()
    expect(novo.nome).toBe('Mecânico Ricardo')
    expect(novo.ativo).toBe(true)

    const buscado = await obterFuncionarioPorId(novo.id)
    expect(buscado).not.toBeNull()
    expect(buscado.nome).toBe('Mecânico Ricardo')
    expect(buscado.comissaoServicos).toBe(15)
  })

  it('IV2: novo mecânico cadastrado deve aparecer imediatamente em obterMecanicosAtivos (Agenda e Nova OS)', async () => {
    const ricardo = await salvarFuncionario({
      nome: 'Mecânico Ricardo',
      cpf: '123.456.789-00',
      cargo: 'mecanico',
      ativo: true,
    })

    const mecanicosAtivos = await obterMecanicosAtivos()
    const encontrado = mecanicosAtivos.find((m) => m.id === ricardo.id)

    expect(encontrado).toBeDefined()
    expect(encontrado.label).toBe('Mecânico Ricardo')
    expect(encontrado.value).toBe(ricardo.id)
  })

  it('não deve incluir colaboradores com cargos administrativos ou inativos na escala técnica', async () => {
    // Cadastrar secretária
    const mariana = await salvarFuncionario({
      nome: 'Mariana Silva',
      cargo: 'secretaria',
      ativo: true,
    })

    // Cadastrar mecânico inativo
    const inativo = await salvarFuncionario({
      nome: 'Mecânico Afastado',
      cargo: 'mecanico',
      ativo: false,
    })

    const mecanicosAtivos = await obterMecanicosAtivos()

    expect(mecanicosAtivos.some((m) => m.id === mariana.id)).toBe(false)
    expect(mecanicosAtivos.some((m) => m.id === inativo.id)).toBe(false)
  })

  it('ao inativar um colaborador mecânico, ele deve sair imediatamente da escala ativa', async () => {
    const ricardo = await salvarFuncionario({
      nome: 'Mecânico Ricardo',
      cargo: 'mecanico',
      ativo: true,
    })

    let ativos = await obterMecanicosAtivos()
    expect(ativos.some((m) => m.id === ricardo.id)).toBe(true)

    // Inativar
    await alternarStatusFuncionario(ricardo.id, false)

    ativos = await obterMecanicosAtivos()
    expect(ativos.some((m) => m.id === ricardo.id)).toBe(false)

    // Reativar
    await alternarStatusFuncionario(ricardo.id, true)
    ativos = await obterMecanicosAtivos()
    expect(ativos.some((m) => m.id === ricardo.id)).toBe(true)
  })

  it('deve excluir um colaborador e atualizar persistência', async () => {
    const ricardo = await salvarFuncionario({
      nome: 'Mecânico Temporário',
      cargo: 'aux_mecanico',
      ativo: true,
    })

    const antes = await obterFuncionarioPorId(ricardo.id)
    expect(antes).not.toBeNull()

    const excluido = await excluirFuncionario(ricardo.id)
    expect(excluido).toBe(true)

    const depois = await obterFuncionarioPorId(ricardo.id)
    expect(depois).toBeNull()
  })
})
