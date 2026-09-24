export const SUGESTOES_PECAS = []

export const SUGESTOES_SERVICOS = []

export const CATALOGO_SERVICOS_TABELA = []

/**
 * Gera o Laudo Tecnico formal da Oficina a partir das Pecas identificadas (com fotos)
 * e dos Servicos recomendados pelo mecanico.
 */
export function gerarLaudoTecnico({
  cliente = '',
  placa = '',
  marcaModelo = '',
  km = '',
  relatoCliente = '',
  mecanicoNome = '',
  pecas = [],
  servicos = [],
}) {
  const dataFormatada = new Date().toLocaleDateString('pt-BR')
  const horaFormatada = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  let laudo = `LAUDO TÉCNICO DE DIAGNÓSTICO MECÂNICO\n`
  laudo += `Data da Inspeção: ${dataFormatada} às ${horaFormatada}\n`
  laudo += `======================================================================\n\n`

  laudo += `1. DADOS DE IDENTIFICAÇÃO:\n`
  laudo += `• Veículo: ${marcaModelo || 'Não informado'} | Placa: ${placa || 'Sem placa'}\n`
  laudo += `• Quilometragem de Entrada: ${km ? `${km} km` : 'Não informada'}\n`
  laudo += `• Titular / Cliente: ${cliente || 'Não identificado'}\n`
  laudo += `• Mecânico Responsável: ${mecanicoNome || 'Mecânico da Oficina'}\n\n`

  if (relatoCliente?.trim()) {
    laudo += `2. QUEIXA INICIAL RELATADA PELO CLIENTE:\n`
    laudo += `"${relatoCliente.trim()}"\n\n`
  }

  laudo += `3. PEÇAS IDENTIFICADAS PARA TROCA OU REPARO:\n`
  if (pecas.length === 0) {
    laudo += `• Nenhuma peça de reposição apontada no momento.\n\n`
  } else {
    pecas.forEach((peca, idx) => {
      const qtd = peca.quantidade ? `(Qtd: ${peca.quantidade})` : '(Qtd: 1)'
      const fotoStatus = peca.fotoUrl ? '[Registro Fotográfico Anexado]' : '[Sem foto]'
      const obs = peca.observacao ? ` - Detalhe: ${peca.observacao}` : ''
      laudo += `${idx + 1}. ${peca.nome} ${qtd} ${fotoStatus}${obs}\n`
    })
    laudo += `\n`
  }

  laudo += `4. SERVIÇOS TÉCNICOS A SEREM EXECUTADOS:\n`
  if (servicos.length === 0) {
    laudo += `• Nenhum serviço específico selecionado.\n\n`
  } else {
    servicos.forEach((servico, idx) => {
      const obs = servico.observacao ? ` (${servico.observacao})` : ''
      laudo += `${idx + 1}. ${servico.nome}${obs}\n`
    })
    laudo += `\n`
  }

  laudo += `======================================================================\n`
  laudo += `PARECER TÉCNICO FINAL:\n`
  laudo += `Após inspeção física e diagnóstica na oficina mecânica, as intervenções\n`
  laudo += `acima descritas foram julgadas necessárias para restaurar a perfeita\n`
  laudo += `segurança, dirigibilidade e vida útil dos componentes do veículo.\n`
  laudo += `Orçamento encaminhado para aprovação do cliente.`

  return laudo
}
