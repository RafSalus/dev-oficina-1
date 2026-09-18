// Menus dedicados ao Portal do Cliente
// Regras: Sem uso do caractere proibido ('&'), apenas 'e'

export const CLIENTE_MENU_CATEGORIES = [
  {
    id: 'principal',
    title: 'Meu Veículo e Atendimento',
    items: [
      {
        id: 'resumo',
        label: 'Resumo',
        path: '/cliente/resumo',
        icon: 'SquaresFour',
        description: 'Visão geral do veículo, status dos serviços em andamento e avisos.',
      },
      {
        id: 'veiculos',
        label: 'Veículos',
        path: '/cliente/veiculos',
        icon: 'CarProfile',
        description: 'Seus veículos cadastrados na oficina, placas, quilometragem e especificações.',
      },
      {
        id: 'servicos',
        label: 'Serviços',
        path: '/cliente/servicos',
        icon: 'Wrench',
        description: 'Ordens de serviço abertas, orçamentos aguardando sua aprovação e laudos.',
      },
      {
        id: 'manutencoes',
        label: 'Manutenções',
        path: '/cliente/manutencoes',
        icon: 'Toolbox',
        description: 'Plano de revisões periódicas por quilometragem e manutenção preventiva.',
      },
      {
        id: 'garantias',
        label: 'Garantias',
        path: '/cliente/garantias',
        icon: 'Certificate',
        description: 'Certificados e prazos de garantia de peças instaladas e serviços executados.',
      },
      {
        id: 'historico',
        label: 'Histórico',
        path: '/cliente/historico',
        icon: 'ClockCounterClockwise',
        description: 'Histórico completo de atendimentos anteriores, peças substituídas e notas.',
      },
      {
        id: 'posto',
        label: 'Posto',
        path: '/cliente/posto',
        icon: 'GasPump',
        description: 'Controle de abastecimentos, média de consumo de combustível e quilometragem.',
      },
      {
        id: 'agenda',
        label: 'Agenda',
        path: '/cliente/agenda',
        icon: 'CalendarDots',
        description: 'Agendamentos de revisão, horários disponíveis e previsão de entrega.',
      },
    ],
  },
]
