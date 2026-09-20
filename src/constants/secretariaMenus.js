// Menus dedicados à Secretaria
// Regras: Sem uso do caractere proibido ('&'), apenas 'e'
// Idêntico ao menu administrativo, com remoção dos menus 'relatorios' e 'funcionarios'

export const SECRETARIA_MENU_CATEGORIES = [
  {
    id: 'operacoes',
    title: 'Operações',
    items: [
      {
        id: 'resumo',
        label: 'Resumo',
        path: '/secretaria/dashboard',
        icon: 'SquaresFour',
        description: 'Visão geral com indicadores principais, atendimentos e ordens em andamento.',
      },
      {
        id: 'agenda',
        label: 'Agenda',
        path: '/secretaria/agenda',
        icon: 'CalendarDots',
        description: 'Controle de agendamentos, horários de recepção e prazos de entrega.',
      },
      {
        id: 'ordem-de-servico',
        label: 'Ordem de Serviço',
        path: '/secretaria/ordem-de-servico',
        icon: 'ClipboardText',
        description: 'Abertura, acompanhamento e finalização de ordens de serviço e orçamentos.',
      },
      {
        id: 'pdv',
        label: 'PDV',
        path: '/secretaria/pdv',
        icon: 'CreditCard',
        description: 'Ponto de venda rápido para peças de balcão e pagamentos imediatos.',
      },
    ],
  },
  {
    id: 'atendimento-patio',
    title: 'Atendimento e Pátio',
    items: [
      {
        id: 'clientes',
        label: 'Clientes',
        path: '/secretaria/clientes',
        icon: 'Users',
        description: 'Base de clientes com histórico de serviços, dados de contato e veículos.',
      },
      {
        id: 'veiculos',
        label: 'Veículos',
        path: '/secretaria/veiculos',
        icon: 'CarProfile',
        description: 'Cadastro detalhado de veículos, placas, quilometragens e manutenções.',
      },
      {
        id: 'estacionados',
        label: 'Estacionados',
        path: '/secretaria/estacionados',
        icon: 'Garage',
        description: 'Veículos vendidos de clientes aguardando novo proprietário com histórico preservado.',
      },
      {
        id: 'leva-e-traz',
        label: 'Leva e Traz',
        path: '/secretaria/leva-e-traz',
        icon: 'ArrowsLeftRight',
        description: 'Logística de busca e entrega de veículos, translado de clientes e busca de peças.',
      },
    ],
  },
  {
    id: 'suprimentos',
    title: 'Suprimentos',
    items: [
      {
        id: 'compras',
        label: 'Compras',
        path: '/secretaria/compras',
        icon: 'ShoppingCart',
        description: 'Gestão de pedidos de compra de autopeças e insumos com fornecedores.',
      },
      {
        id: 'estoque',
        label: 'Estoque',
        path: '/secretaria/estoque',
        icon: 'Package',
        description: 'Almoxarifado, níveis de estoque mínimo, localização e inventário.',
      },
      {
        id: 'servicos',
        label: 'Serviços (Mão de Obra)',
        path: '/secretaria/servicos',
        icon: 'Hammer',
        description: 'Catálogo de serviços técnicos, tempo estimado e parâmetros fiscais de NFS-e.',
      },
      {
        id: 'pecas',
        label: 'Peças e Produtos',
        path: '/secretaria/pecas',
        icon: 'Cube',
        description: 'Cadastro de peças com código de barras GTIN/EAN, NCM, margens e estoque.',
      },
      {
        id: 'fornecedores',
        label: 'Fornecedores',
        path: '/secretaria/fornecedores',
        icon: 'Buildings',
        description: 'Cadastro de fornecedores de autopeças, insumos e parceiros de serviços externos.',
      },
    ],
  },
  {
    id: 'oficina-servicos',
    title: 'Oficina e Serviços',
    items: [
      {
        id: 'manutencao-preventiva',
        label: 'Manutenção Preventiva',
        path: '/secretaria/manutencao-preventiva',
        icon: 'ShieldCheck',
        description: 'Planos de revisão por quilometragem e alertas programados aos clientes.',
      },
      {
        id: 'garantias',
        label: 'Garantias',
        path: '/secretaria/garantias',
        icon: 'SealCheck',
        description: 'Acompanhamento de prazos de garantia de peças e serviços aplicados.',
      },
      {
        id: 'ferramentas',
        label: 'Ferramentas',
        path: '/secretaria/ferramentas',
        icon: 'Wrench',
        description: 'Controle de ferramentas especiais, equipamentos de bancada e scanners.',
      },
      {
        id: 'pecas-danificadas',
        label: 'Peças Danificadas',
        path: '/secretaria/pecas-danificadas',
        icon: 'WarningOctagon',
        description: 'Registro de peças substituídas, avarias e descarte ambiental responsável.',
      },
    ],
  },
  {
    id: 'financeiro-fiscal',
    title: 'Financeiro e Fiscal',
    items: [
      {
        id: 'despesas',
        label: 'Despesas',
        path: '/secretaria/despesas',
        icon: 'Money',
        description: 'Lançamento e controle de despesas operacionais, fixas e variáveis.',
      },
      {
        id: 'nota-fiscal',
        label: 'Nota Fiscal',
        path: '/secretaria/nota-fiscal',
        icon: 'FileText',
        description: 'Emissão e consulta de notas fiscais eletrônicas (NFS-e e NF-e).',
      },
      // NOTA: "relatorios" removido para o perfil Secretaria
    ],
  },
  {
    id: 'administracao',
    title: 'Administração',
    items: [
      // NOTA: "relatorios", "funcionarios" e "configuracoes" não são acessíveis pela Secretaria (Regra 14)
      {
        id: 'site',
        label: 'Site',
        path: '/',
        icon: 'Globe',
        description: 'Acessar o site institucional público da Mecânica Gabriel.',
        isExternal: true,
      },
    ],
  },
]
