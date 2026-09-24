export const CATEGORIAS_PROBLEMAS = []

export const CATALOGO_PROBLEMAS = []

/**
 * Sintetiza o texto formal do laudo técnico e plano de correções
 * a partir da lista de problemas selecionados e do relato do cliente.
 */
export function gerarRelatoCorrecoes(problemasSelecionados = [], relatoCliente = '') {
  if (!problemasSelecionados.length) {
    return ''
  }

  const dataAtual = new Date().toLocaleDateString('pt-BR')
  let texto = `LAUDO TÉCNICO DE DIAGNÓSTICO E PLANO DE CORREÇÕES (${dataAtual})\n`
  texto += `==============================================================\n\n`

  if (relatoCliente?.trim()) {
    texto += `QUEIXA INICIAL DO CLIENTE:\n"${relatoCliente.trim()}"\n\n`
    texto += `ANÁLISE E APONTAMENTOS DA OFICINA:\n`
  }

  problemasSelecionados.forEach((item, index) => {
    texto += `\n${index + 1}. [${item.categoria.toUpperCase()}] - ${item.label}\n`
    texto += `   • Nível de Gravidade: ${item.gravidade}\n`
    texto += `   • Sintoma Constatado: ${item.sintoma}\n`
    texto += `   • Intervenção / Correção Recomendada: ${item.correcaoSugerida}\n`
  })

  texto += `\n==============================================================\n`
  texto += `RECOMENDAÇÃO TÉCNICA:\n`
  texto += `Recomenda-se a aprovação dos itens e envio para cotação das peças de reposição necessárias.`

  return texto
}
