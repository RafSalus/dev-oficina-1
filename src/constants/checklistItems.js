// Itens oficiais do Check List de Entrada e Saída - Mecânica Gabriel (dev-oficina)
// Transcritos diretamente da ficha física de vistoria da oficina

export const ITENS_CHECKLIST_ENTRADA = [
  { id: 'esguicho', label: 'Esguicho', desc: 'Posição / Água' },
  { id: 'vidros', label: 'Vidros', desc: 'Integridade e funcionamento' },
  { id: 'pecas', label: 'Peças', desc: 'Mal posicionada / Faltantes' },
  { id: 'bancos', label: 'Bancos', desc: 'Funcionamento e regulagens' },
  { id: 'painel', label: 'Painel', desc: 'Luzes / Hora / Idioma / Porta-luvas / Difusores' },
  { id: 'oleoGeral', label: 'Óleo em Geral', desc: 'Validade / Nível' },
  { id: 'sensorRe', label: 'Sensor / Câmera de Ré', desc: 'Operação e alerta' },
  { id: 'freioMaoManopla', label: 'Freio de Mão e Manopla', desc: 'Posição / Coifa / Acabamento' },
  { id: 'cintoSeguranca', label: 'Cinto de Segurança', desc: 'Travamento e retração' },
  { id: 'quebraSolPqp', label: 'Quebra-sol / PQP', desc: 'Articulação e alças de teto' },
  { id: 'retrovisores', label: 'Retrovisores', desc: 'Elétricos / Manual e acabamento' },
  { id: 'lampadasGeral', label: 'Lâmpadas em Geral', desc: 'Internas e externas' },
  { id: 'palhetas', label: 'Palhetas', desc: 'Dianteiras / Traseiras' },
  { id: 'portas', label: 'Portas', desc: 'Barulho / Borrachas / Maçanetas' },
  { id: 'agua', label: 'Água', desc: 'Nível / Limpeza arrefecimento' },
  { id: 'vazamentos', label: 'Vazamentos', desc: 'Óleo / Água aparentes' },
  { id: 'rodas', label: 'Rodas', desc: 'Estado / Calotas / Parafusos' },
  { id: 'alinhamento', label: 'Alinhamento', desc: 'Direção e geometria aparente' },
  { id: 'buzina', label: 'Buzina', desc: 'Acionamento e sonoridade' },
  { id: 'portinholaTanque', label: 'Portinhola do Tanque', desc: 'Abertura e trava' },
  { id: 'bateria', label: 'Bateria', desc: 'Verificar polos / Posição e suporte' },
  { id: 'testeDdp', label: 'Teste DDP', desc: 'Diferença de Potencial / Carga' },
]

// Angulos obrigatorios do registro fotografico de entrada — usado na Vistoria de Entrada
// (formulario de abertura de OS) e exibido ao cliente na pagina publica de assinatura.
export const FOTOS_VEICULO_TIPOS = [
  { id: 'frente', label: 'Frente' },
  { id: 'traseira', label: 'Traseira' },
  { id: 'lateral_esquerda', label: 'Lateral Esquerda' },
  { id: 'lateral_direita', label: 'Lateral Direita' },
  { id: 'painel', label: 'Painel' },
  { id: 'motor', label: 'Motor' },
  { id: 'porta_malas', label: 'Porta-Malas' },
]

export const ITENS_CHECKLIST_SAIDA = [
  { id: 'nivelFluidos', label: 'Nível de Fluídos', desc: 'Conferência final de todos os fluidos' },
  { id: 'apertoRodas', label: 'Aperto das Rodas', desc: 'Torque e fixação dos parafusos' },
  { id: 'calibragemPneus', label: 'Calibragem dos Pneus', desc: 'Pressão nos 4 pneus e estepe' },
  { id: 'testeVeiculo', label: 'Teste do Veículo', desc: 'Rodagem e validação final de pista' },
  { id: 'etiquetaOleo', label: 'Etiqueta de Óleo', desc: 'Preenchida e afixada no para-brisa' },
]

// Confere se todos os itens de um checklist (entrada ou saída) já têm um status marcado
// (conforme / não conforme / isento). Usado para travar avanço de etapa e liberar o PDV.
export function checklistCompleto(checklist, itens) {
  if (!checklist) return false
  return itens.every((item) => Boolean(checklist[item.id]?.status))
}

// Assinatura digital do cliente na Vistoria de Entrada (pagina publica /vistoria/:id) —
// guardada à parte da OS, por numeroOS, pois é preenchida pelo cliente fora do sistema
// interno. Compartilhado entre a pagina publica (que grava) e o fluxo de Diagnostico
// (que exige a aprovação antes de liberar a etapa seguinte).
const STORAGE_KEY_ASSINATURA_VISTORIA = 'dev_oficina_assinaturas_checklist'

export function carregarAssinaturaVistoria(numeroOS) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASSINATURA_VISTORIA)
    if (!raw) return null
    const todas = JSON.parse(raw)
    return todas[numeroOS] || null
  } catch {
    return null
  }
}

export function salvarAssinaturaVistoria(numeroOS, registro) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASSINATURA_VISTORIA)
    const todas = raw ? JSON.parse(raw) : {}
    todas[numeroOS] = registro
    localStorage.setItem(STORAGE_KEY_ASSINATURA_VISTORIA, JSON.stringify(todas))
  } catch (e) {
    console.error('Erro ao gravar assinatura do checklist:', e)
  }
}
