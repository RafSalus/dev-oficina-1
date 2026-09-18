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
        id: 'orcamento',
        label: 'Orçamento',
        path: '/secretaria/orcamento',
        icon: 'Receipt',
        description: 'Acompanhamento de orçamentos e ordens de serviço abertas no pátio.',
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
        description: 'Gestão de vagas e veículos no pátio interno da oficina.',
      },
      {
        id: 'leva-e-traz',
        label: 'Leva e Traz',
        path: '/secretaria/leva-e-traz',
        icon: 'ArrowsLeftRight',
        description: 'Rastreio e organização de serviços de busca e entrega de veículos.',
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
        icon: 'Receipt',
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
      // NOTA: "funcionarios" removido para o perfil Secretaria
      {
        id: 'configuracoes',
        label: 'Configurações',
        path: '/secretaria/configuracoes',
        icon: 'GearSix',
        description: 'Parâmetros do sistema, dados da empresa e preferências de operação.',
      },
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
