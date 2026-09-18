// Menus dedicados ao Portal e Espaço de Trabalho do Mecânico
// Regras: Sem uso do caractere proibido ('&'), apenas 'e'

export const MECANICO_MENU_CATEGORIES = [
  {
    id: 'operacoes',
    title: 'Operações',
    items: [
      {
        id: 'dashboard',
        label: 'Resumo',
        path: '/mecanico/dashboard',
        icon: 'SquaresFour',
        description: 'Visão geral da bancada de trabalho, métricas do dia e resumo rápido.',
      },
      {
        id: 'agenda',
        label: 'Agenda',
        path: '/mecanico/agenda',
        icon: 'CalendarDots',
        description: 'Controle de agendamentos, distribuição de boxes e horários marcados.',
      },
      {
        id: 'ordens-servico',
        label: 'Ordem OS',
        path: '/mecanico/ordens-servico',
        icon: 'ClipboardText',
        description: 'Ordens de serviço sob sua responsabilidade, status e execução.',
      },
      {
        id: 'diagnostico',
        label: 'Diagnósticos',
        path: '/mecanico/diagnostico',
        icon: 'MagnifyingGlassPlus',
        description: 'Inspeção técnica, apontamento de falhas e emissão de laudo técnico.',
      },
      {
        id: 'checklist',
        label: 'Checklist',
        path: '/mecanico/checklist',
        icon: 'CheckSquareOffset',
        description: 'Vistoria detalhada de entrada e saída do veículo com apontamentos.',
      },
      {
        id: 'servicos',
        label: 'Serviços',
        path: '/mecanico/servicos',
        icon: 'Wrench',
        description: 'Tabela de mão de obra e serviços padrão para lançar diretamente na OS.',
      },
    ],
  },
  {
    id: 'pecas-ferramentas',
    title: 'Peças e Ferramentas',
    items: [
      {
        id: 'pedir-pecas',
        label: 'Pedir Peças',
        path: '/mecanico/pedir-pecas',
        icon: 'ShoppingCart',
        description: 'Requisitar peças ao almoxarifado ou balcão para veículos em atendimento.',
      },
      {
        id: 'estoque',
        label: 'Estoque',
        path: '/mecanico/estoque',
        icon: 'Package',
        description: 'Consulta de peças disponíveis, localização no almoxarifado e códigos.',
      },
      {
        id: 'pecas-danificadas',
        label: 'Peças Danificadas',
        path: '/mecanico/pecas-danificadas',
        icon: 'WarningOctagon',
        description: 'Registro de peças avariadas substituídas, garantia de fábrica e descarte.',
      },
      {
        id: 'ferramentas',
        label: 'Ferramentas',
        path: '/mecanico/ferramentas',
        icon: 'Hammer',
        description: 'Controle de ferramentas danificadas, solicitações de reparo e especiais.',
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
        path: '/mecanico/clientes',
        icon: 'Users',
        description: 'Consulta rápida de clientes, histórico do veículo, placa e contato.',
      },
      {
        id: 'leva-e-traz',
        label: 'Leva e Traz',
        path: '/mecanico/leva-e-traz',
        icon: 'ArrowsLeftRight',
        description: 'Acompanhar veículos em deslocamento, busca e entrega aos clientes.',
      },
    ],
  },
  {
    id: 'rendimentos',
    title: 'Rendimentos',
    items: [
      {
        id: 'comissoes',
        label: 'Comissões',
        path: '/mecanico/comissoes',
        icon: 'Coins',
        description: 'Acompanhamento diário e mensal de comissão sobre serviços executados.',
      },
    ],
  },
]

