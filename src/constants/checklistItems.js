// Itens oficiais do Check List de Entrada e Saída - Mecânica Gabriel (dev-oficina)

export const ITENS_CHECKLIST_ENTRADA = []

export const FOTOS_VEICULO_TIPOS = []

export const ITENS_CHECKLIST_SAIDA = []

// Confere se todos os itens de um checklist (entrada ou saída) já têm um status marcado
export function checklistCompleto(checklist, itens) {
  if (!checklist) return false
  return itens.every((item) => Boolean(checklist[item.id]?.status))
}

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
