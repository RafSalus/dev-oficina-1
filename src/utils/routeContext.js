// Resolve o contexto de navegação (categoria + nome da tela) para exibição no cabeçalho,
// a partir da rota atual e da árvore de menus (MENU_CATEGORIES / SECRETARIA_MENU_CATEGORIES).

// Sub-rotas que não são itens de menu independentes, e sim modos/telas filhas de um item já existente.
const SUB_ROTAS_CONHECIDAS = [
  { corresponde: (rota) => rota.startsWith('ordem-de-servico/nova'), itemId: 'ordem-de-servico', subRotulo: 'Nova OS' },
  { corresponde: (rota) => rota.startsWith('compras/cotacao'), itemId: 'compras', subRotulo: 'Cotação de Peças' },
]

export function obterContextoDeTela(pathname, categorias, basePath) {
  if (!pathname || !pathname.startsWith(basePath)) return null

  const rota = pathname.slice(basePath.length).replace(/^\/+/, '')
  if (!rota || rota === 'dashboard') return null

  for (const sub of SUB_ROTAS_CONHECIDAS) {
    if (sub.corresponde(rota)) {
      for (const categoria of categorias) {
        const item = categoria.items.find((i) => i.id === sub.itemId)
        if (item) {
          return { categoria: categoria.title, rotulo: item.label, subRotulo: sub.subRotulo }
        }
      }
    }
  }

  for (const categoria of categorias) {
    const item = categoria.items.find((i) => i.path === pathname)
    if (item) {
      return { categoria: categoria.title, rotulo: item.label, subRotulo: null }
    }
  }

  return null
}
