import {
  carregarPecasCadastradas,
  salvarPecasCadastradas,
  carregarServicosCadastrados,
  salvarServicosCadastrados,
  carregarTerceirosCadastrados,
  salvarTerceirosCadastrados,
} from '../constants/cadastrosSuprimentosData'

// --- PEÇAS ---

export async function carregarPecas() {
  return Promise.resolve(carregarPecasCadastradas())
}

export async function obterPecaPorId(id) {
  const lista = carregarPecasCadastradas()
  const found = lista.find((p) => String(p.id) === String(id) || String(p.codigo) === String(id))
  return Promise.resolve(found || null)
}

export async function salvarPeca(peca) {
  const lista = carregarPecasCadastradas()
  const id = peca.id || `peca-${Date.now()}`
  const index = lista.findIndex((p) => String(p.id) === String(id) || String(p.codigo) === String(peca.codigo))

  const pecaAtualizada = {
    ...peca,
    id,
    dataAtualizacao: new Date().toISOString(),
  }

  if (index >= 0) {
    lista[index] = pecaAtualizada
  } else {
    pecaAtualizada.dataCadastro = new Date().toISOString()
    lista.unshift(pecaAtualizada)
  }

  salvarPecasCadastradas(lista)
  return Promise.resolve(pecaAtualizada)
}

export async function excluirPeca(id) {
  const lista = carregarPecasCadastradas()
  const filtrada = lista.filter((p) => String(p.id) !== String(id))
  if (filtrada.length !== lista.length) {
    salvarPecasCadastradas(filtrada)
    return Promise.resolve(true)
  }
  return Promise.resolve(false)
}

// --- SERVIÇOS ---

export async function carregarServicos() {
  return Promise.resolve(carregarServicosCadastrados())
}

export async function obterServicoPorId(id) {
  const lista = carregarServicosCadastrados()
  const found = lista.find((s) => String(s.id) === String(id) || String(s.codigo) === String(id))
  return Promise.resolve(found || null)
}

export async function salvarServico(servico) {
  const lista = carregarServicosCadastrados()
  const id = servico.id || `serv-${Date.now()}`
  const index = lista.findIndex((s) => String(s.id) === String(id) || String(s.codigo) === String(servico.codigo))

  const servicoAtualizado = {
    ...servico,
    id,
    dataAtualizacao: new Date().toISOString(),
  }

  if (index >= 0) {
    lista[index] = servicoAtualizado
  } else {
    servicoAtualizado.dataCadastro = new Date().toISOString()
    lista.unshift(servicoAtualizado)
  }

  salvarServicosCadastrados(lista)
  return Promise.resolve(servicoAtualizado)
}

export async function excluirServico(id) {
  const lista = carregarServicosCadastrados()
  const filtrada = lista.filter((s) => String(s.id) !== String(id))
  if (filtrada.length !== lista.length) {
    salvarServicosCadastrados(filtrada)
    return Promise.resolve(true)
  }
  return Promise.resolve(false)
}

// --- TERCEIROS / FORNECEDORES ---

export async function carregarTerceiros() {
  return Promise.resolve(carregarTerceirosCadastrados())
}

export async function obterTerceiroPorId(id) {
  const lista = carregarTerceirosCadastrados()
  const found = lista.find((t) => String(t.id) === String(id))
  return Promise.resolve(found || null)
}

export async function salvarTerceiro(terceiro) {
  const lista = carregarTerceirosCadastrados()
  const id = terceiro.id || `terc-${Date.now()}`
  const index = lista.findIndex((t) => String(t.id) === String(id))

  const terceiroAtualizado = {
    ...terceiro,
    id,
    dataAtualizacao: new Date().toISOString(),
  }

  if (index >= 0) {
    lista[index] = terceiroAtualizado
  } else {
    terceiroAtualizado.dataCadastro = new Date().toISOString()
    lista.unshift(terceiroAtualizado)
  }

  salvarTerceirosCadastrados(lista)
  return Promise.resolve(terceiroAtualizado)
}

export async function excluirTerceiro(id) {
  const lista = carregarTerceirosCadastrados()
  const filtrada = lista.filter((t) => String(t.id) !== String(id))
  if (filtrada.length !== lista.length) {
    salvarTerceirosCadastrados(filtrada)
    return Promise.resolve(true)
  }
  return Promise.resolve(false)
}
