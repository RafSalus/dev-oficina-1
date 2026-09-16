export const COMPANY = {
  name: 'MG Mecânica Gabriel',
  symbol: 'MG',
  shortName: 'Mecânica Gabriel',
  city: 'Apucarana',
  foundationDate: '01 de Agosto de 2016',
  legalName: 'Gabriel Amaral Salustiano - Mecanica',
  cnpj: 'CNPJ: 25.328.968/0001-72',
}

export const WHATSAPP_ACCESS = {
  label: 'Solicite seu acesso via WhatsApp',
  href: 'https://wa.me/5543998544106',
  display: '(43) 99854-4106',
}

export const NAV_LINKS = [
  { label: 'Serviços', href: '#servicos' },
  { label: 'App do Cliente', href: '#app' },
  { label: 'A Oficina', href: '#sobre' },
  { label: 'Localização', href: '#localizacao' },
  { label: 'Contato', href: '#redes-sociais' },
]

export const HERO_DATA = {
  title: 'A precisão que o seu veículo exige.',
  subtitle: 'Tecnologia de ponta, transparência total e manutenção automotiva de alto padrão em Apucarana.',
  primaryCta: {
    label: 'Nossos Serviços',
    href: '#servicos',
  },
  secondaryCta: {
    label: 'Agendar Visita',
    href: '#localizacao',
  },
  badge: {
    value: '10+ Anos',
    label: 'de Excelência',
  },
}

export const BRANDS = [
  'Volkswagen',
  'Chevrolet',
  'Fiat',
  'Toyota',
  'Honda',
  'Ford',
  'Hyundai',
  'BMW',
  'Audi',
  'Mercedes-Benz',
]

export const SERVICES_SECTION = {
  headingIntro: 'Excelência automotiva.',
  headingOutro: 'Cuidado que vai além do esperado.',
  description: 'Oferecemos uma gama completa de serviços para garantir a performance e segurança do seu veículo.',
  viewAllLabel: 'Ver todos os serviços',
  viewAllHref: '#localizacao',
  items: [
    {
      title: 'Diagnóstico Computadorizado',
      description: 'Scanners de última geração para identificar problemas elétricos e de injeção com precisão absoluta.',
      iconName: 'Engine',
    },
    {
      title: 'Revisão Preventiva',
      description: 'Troca de óleo, filtros e checagem de mais de 40 itens de segurança para viagens tranquilas.',
      iconName: 'CheckCircle',
    },
    {
      title: 'Suspensão e Freios',
      description: 'Manutenção especializada em amortecedores, pastilhas e discos, garantindo estabilidade.',
      iconName: 'CarProfile',
    },
    {
      title: 'Mecânica Geral',
      description: 'Reparos em motores, embreagem, correias dentadas e sistemas de arrefecimento.',
      iconName: 'Wrench',
    },
    {
      title: 'Higienização do ar-condicionado',
      description: 'Limpeza do sistema para melhorar a qualidade do ar no interior do veículo.',
      iconName: 'Thermometer',
    },
    {
      title: 'Diagnóstico de falhas elétricas',
      description: 'Identificação de falhas elétricas com o auxílio de equipamentos de diagnóstico.',
      iconName: 'BatteryHigh',
    },
  ],
}

export const APP_TEASER = {
  badge: 'Exclusivo para clientes',
  title: 'Sua oficina, na palma da sua mão.',
  description: 'Total transparência. Acesse nossa plataforma exclusiva para clientes e acompanhe em tempo real tudo o que acontece com o seu veículo.',
  benefits: [
    {
      title: 'Check-list Digital',
      description: 'Fotos e vídeos do diagnóstico direto no seu painel.',
      iconName: 'ListChecks',
    },
    {
      title: 'Aprovação de Orçamentos',
      description: 'Aprove ou recuse serviços com um clique, sem surpresas no final.',
      iconName: 'FileText',
    },
    {
      title: 'Histórico Completo',
      description: 'Acesso a todas as manutenções, peças trocadas e garantias ativas.',
      iconName: 'Clock',
    },
  ],
  cta: {
    label: 'Acessar Portal do Cliente',
  },
  mockup: {
    appName: 'MG Mecânica',
    vehicleLabel: 'Veículo Atual',
    vehicle: 'VW Nivus Highline 2023',
    plate: 'ABC-1234',
    items: [
      {
        title: 'Orçamento Pendente',
        subtitle: 'Revisão 40.000km',
        iconName: 'FileText',
        highlighted: true,
      },
      {
        title: 'Histórico',
        subtitle: 'Última visita: 12/05/2025',
        iconName: 'ClockCounterClockwise',
        highlighted: false,
      },
      {
        title: 'Garantias',
        subtitle: '2 peças ativas',
        iconName: 'ShieldCheck',
        highlighted: false,
      },
    ],
    actionLabel: 'Aprovar Orçamento',
  },
}

export const ABOUT_SECTION = {
  title: 'Redefinindo a manutenção automotiva.',
  paragraphs: [
    `Fundada em ${COMPANY.foundationDate}, a ${COMPANY.name} nasceu com o propósito de elevar o padrão do setor automotivo em ${COMPANY.city} e região.`,
    'Esqueça a velha imagem de oficinas desorganizadas. Construímos um ambiente limpo, tecnológico e processos rigorosos para garantir que você tenha a melhor experiência possível. Onde a ética, pontualidade e conhecimento técnico caminham juntos.',
  ],
}

export const LOCATION_SECTION = {
  introTitle: 'Sua visita é bem-vinda.',
  introText: 'Conserto de automóveis de excelência em Apucarana. Venha conhecer nossa estrutura e tomar um café conosco.',
  contactItems: [
    {
      title: 'Endereço',
      lines: ['Avenida Minas Gerais, 3310', 'Apucarana, Paraná', 'CEP 86812-490'],
      iconName: 'MapPin',
    },
    {
      title: 'Horário de Funcionamento',
      lines: ['Segunda a Sexta', 'Aberto até as 18:00'],
      iconName: 'Clock',
    },
  ],
  map: {
    title: 'Mapa - MG Mecânica Gabriel',
    hint: 'Passe o mouse para mapa interativo',
    src: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3663.7849646450626!2d-51.45892552378949!3d-23.50331405943714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ebc33cf7a9b0c7%3A0x8e8334a1ceeb96b3!2sAv.%20Minas%20Gerais%2C%203310%20-%20Vila%20Nova%2C%20Apucarana%20-%20PR%2C%2086812-490!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr',
  },
}

export const FOOTER_DATA = {
  copyright: `© 2026 ${COMPANY.name}. Todos os direitos reservados.`,
  legalLinks: [
    { label: 'Termos de Serviço', message: 'Conteúdo em desenvolvimento.' },
    { label: 'Privacidade', message: 'Conteúdo em desenvolvimento.' },
  ],
  social: {
    title: 'Siga a Mecânica Gabriel',
    instagram: {
      label: 'Instagram',
      href: 'https://www.instagram.com/mecanicagabriel2016/',
      accessibleName: 'Abrir Instagram da Mecânica Gabriel',
    },
    whatsapp: {
      label: 'WhatsApp',
      href: 'https://wa.me/5543998544106',
      accessibleName: 'Abrir conversa com a Mecânica Gabriel no WhatsApp',
    },
    facebook: {
      label: 'Facebook',
      status: 'Em breve',
      message: 'Facebook — em breve.',
      accessibleName: 'Abrir Facebook da Mecânica Gabriel',
    },
    youtube: {
      label: 'YouTube',
      status: 'Em breve',
      message: 'YouTube — em breve.',
      accessibleName: 'Abrir YouTube da Mecânica Gabriel',
    },
  },
}

export const MESSAGES = {
  emailRequired: 'Informe seu e-mail.',
  emailInvalid: 'Informe um e-mail válido.',
  passwordRequired: 'Digite sua senha.',
  recoveryEmailRequired: 'Informe seu e-mail para recuperar a senha.',
  mfaCodeRequired: 'Informe o código de 6 dígitos.',
  mfaCodeInvalid: 'O código deve conter apenas números.',
  cpfCnpjRequired: 'Informe seu CPF ou CNPJ.',
  cpfCnpjInvalid: 'Confira o CPF ou CNPJ informado.',
  passwordMin: (min) => `A nova senha deve ter pelo menos ${min} caracteres.`,
  passwordsMismatch: 'As senhas não coincidem.',
  accessGranted: 'Acesso realizado.',
  passwordUpdated: 'Senha atualizada.',
  requestSent: 'Solicitação enviada.',
  changesSaved: 'Alterações salvas.',
  verificationComplete: 'Verificação concluída.',
  sessionEnded: 'Sessão encerrada.',
  mfaActivated: 'A verificação em duas etapas foi ativada.',
  recoveryInstructions: 'Se o endereço estiver cadastrado, você receberá as instruções para redefinir a senha.',
  passwordReset: 'Senha redefinida com sucesso. Entre novamente com a nova senha.',
  secretCopied: 'Código copiado.',
  invalidCredentials: 'E-mail ou senha incorretos.',
  emailNotConfirmed: 'Confirme seu e-mail antes de entrar.',
  accountBlocked: 'Não foi possível acessar esta conta. Entre em contato com a administração.',
  tooManyAttempts: 'Muitas tentativas foram realizadas. Aguarde alguns minutos e tente novamente.',
  sessionExpired: 'Sua sessão expirou. Entre novamente para continuar.',
  serviceUnavailable: 'O sistema está temporariamente indisponível. Tente novamente em alguns minutos.',
  customerInvalidCredentials: 'CPF/CNPJ ou senha incorretos.',
  accessUnavailable: 'O acesso do cliente ainda não está disponível.',
  plannedNotice: 'O acesso ao Portal do Cliente estará disponível em breve.',
  recoveryPlanned: 'A recuperação de senha ainda não está disponível.',
  recoveryContact: 'A recuperação de senha ainda não está disponível. Contate-nos para mais informações.',
  whatsappHelp: 'Precisa de ajuda? Fale com a oficina pelo WhatsApp.',
}
