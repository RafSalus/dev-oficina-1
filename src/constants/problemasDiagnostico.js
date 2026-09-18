export const CATEGORIAS_PROBLEMAS = [
  'Todos os Sistemas',
  'Motor e Injeção Eletrônica',
  'Freios e Segurança',
  'Suspensão e Direção',
  'Transmissão, Câmbio e Embreagem',
  'Sistema de Arrefecimento',
  'Sistema Elétrico e Ignição',
  'Ar Condicionado e Climatização',
  'Escapamento e Emissões',
  'Pneus, Rodas e Geometria',
]

export const CATALOGO_PROBLEMAS = [
  // 1. Motor e Injeção Eletrônica
  {
    value: 'mot-01',
    label: 'Falha na aceleração e engasgos em baixa/média rotação',
    categoria: 'Motor e Injeção Eletrônica',
    gravidade: 'Alta',
    sintoma: 'Motor falha ou engasga ao pisar no acelerador, perda momentânea de resposta.',
    correcaoSugerida: 'Efetuar limpeza e equalização de bicos injetores, teste de vazão da bomba de combustível e substituição dos filtros de ar e combustível.',
  },
  {
    value: 'mot-02',
    label: 'Luz de injeção eletrônica acesa no painel',
    categoria: 'Motor e Injeção Eletrônica',
    gravidade: 'Alta',
    sintoma: 'Luz de anomalia acesa constantemente ou piscando em aceleração.',
    correcaoSugerida: 'Passar scanner automotivo para leitura de códigos DTC, checagem da sonda lambda, sensor MAP e teste de continuidade do chicote.',
  },
  {
    value: 'mot-03',
    label: 'Superaquecimento do motor em trânsito',
    categoria: 'Motor e Injeção Eletrônica',
    gravidade: 'Crítica',
    sintoma: 'Ponteiro de temperatura no vermelho ou luz de advertência de temperatura ativada.',
    correcaoSugerida: 'Verificar estanqueidade do circuito, teste da válvula termostática, acionamento do eletroventilador e checagem de junta do cabeçote.',
  },
  {
    value: 'mot-04',
    label: 'Vazamento de óleo lubrificante no motor',
    categoria: 'Motor e Injeção Eletrônica',
    gravidade: 'Média',
    sintoma: 'Manchas de óleo no chão da garagem e motor sujo de óleo na parte inferior ou tampa de válvulas.',
    correcaoSugerida: 'Substituição da junta da tampa de válvulas, junta do cárter e retentor do volante/árvore de manivelas.',
  },
  {
    value: 'mot-05',
    label: 'Ruído metálico no motor (Tuchos hidráulicos ou corrente)',
    categoria: 'Motor e Injeção Eletrônica',
    gravidade: 'Alta',
    sintoma: 'Batida de tuchos na primeira partida a frio ou ruído contínuo de corrente de sincronismo.',
    correcaoSugerida: 'Avaliação da pressão da bomba de óleo, descarbonização ou substituição do jogo de tuchos e kit de corrente/correia dentada.',
  },
  {
    value: 'mot-06',
    label: 'Perda de potência e motor fraco em subidas',
    categoria: 'Motor e Injeção Eletrônica',
    gravidade: 'Alta',
    sintoma: 'Veículo não desenvolve velocidade em aclives, aceleração lenta.',
    correcaoSugerida: 'Teste de compressão dos cilindros, checagem do ponto de ignição, corpo de borboleta (TBI) e pressão da linha de combustível.',
  },
  {
    value: 'mot-07',
    label: 'Fumaça excessiva no escapamento (Azulada ou preta)',
    categoria: 'Motor e Injeção Eletrônica',
    gravidade: 'Alta',
    sintoma: 'Fumaça azulada (queima de óleo) ou preta (excesso de combustível) saindo do escape.',
    correcaoSugerida: 'Verificar retentores de válvulas, anéis de segmento dos pistões e regulagem da mistura ar/combustível.',
  },
  {
    value: 'mot-08',
    label: 'Consumo excessivo de combustível acima da média',
    categoria: 'Motor e Injeção Eletrônica',
    gravidade: 'Média',
    sintoma: 'Veículo com média de consumo muito reduzida sem alteração na condução.',
    correcaoSugerida: 'Troca de velas de ignição, cabos de vela, limpeza de TBI e calibração dos parâmetros autoadaptativos via scanner.',
  },

  // 2. Freios e Segurança
  {
    value: 'fr-01',
    label: 'Pedal de freio baixo e borrachudo (Curso longo)',
    categoria: 'Freios e Segurança',
    gravidade: 'Crítica',
    sintoma: 'Pedal afunda quase até o final do curso para frear o carro.',
    correcaoSugerida: 'Inspeção do cilindro mestre de freio, cilindros de roda traseiros e sangria completa com fluido de freio DOT 4 novo.',
  },
  {
    value: 'fr-02',
    label: 'Ruído de chiado agudo ao acionar o pedal de freio',
    categoria: 'Freios e Segurança',
    gravidade: 'Média',
    sintoma: 'Apito agudo de metal com metal ao frear em qualquer velocidade.',
    correcaoSugerida: 'Substituição das pastilhas de freio dianteiras e medição de espessura/retífica dos discos de freio.',
  },
  {
    value: 'fr-03',
    label: 'Trepidação e vibração no volante ao frear',
    categoria: 'Freios e Segurança',
    gravidade: 'Alta',
    sintoma: 'Volante trepida fortemente ao frear em velocidades acima de 60 km/h.',
    correcaoSugerida: 'Troca dos discos de freio empenados, checagem de cubos de roda e instalação de pastilhas novas.',
  },
  {
    value: 'fr-04',
    label: 'Luz de advertência do ABS ou freio acesa',
    categoria: 'Freios e Segurança',
    gravidade: 'Alta',
    sintoma: 'Luz indicadora amarela do ABS ou vermelha de freio ativa no cluster.',
    correcaoSugerida: 'Diagnóstico dos sensores de velocidade de roda (ABS), medição do nível de fluido e teste elétrico do módulo de controle.',
  },
  {
    value: 'fr-05',
    label: 'Freio de mão desregulado com curso excessivo',
    categoria: 'Freios e Segurança',
    gravidade: 'Média',
    sintoma: 'Alavanca do freio de estacionamento sobe muitos dentes e não segura o veículo em rampas.',
    correcaoSugerida: 'Ajuste de curso nos cabos de acionamento e regulagem automática das sapatas/lonas do tambor traseiro.',
  },

  // 3. Suspensão e Direção
  {
    value: 'susp-01',
    label: 'Barulho de pancada seca e batidas metálicas em desníveis',
    categoria: 'Suspensão e Direção',
    gravidade: 'Alta',
    sintoma: 'Batidas ocas tipo "toc-toc" na parte dianteira ao passar por asfalto irregular.',
    correcaoSugerida: 'Substituição das bieletas da barra estabilizadora, buchas da barra e batentes superiores dos amortecedores.',
  },
  {
    value: 'susp-02',
    label: 'Veículo puxando para um lado e volante desalinhado',
    categoria: 'Suspensão e Direção',
    gravidade: 'Média',
    sintoma: 'O carro desvia a trajetória para a direita ou esquerda em retas ao soltar levemente o volante.',
    correcaoSugerida: 'Execução de alinhamento computadorizado 3D, ajuste de convergência e balanceamento das rodas dianteiras e traseiras.',
  },
  {
    value: 'susp-03',
    label: 'Amortecedores vazando óleo e veículo quicando em ondulações',
    categoria: 'Suspensão e Direção',
    gravidade: 'Alta',
    sintoma: 'Carro perde estabilidade em curvas e quica repetidamente após quebra-molas.',
    correcaoSugerida: 'Substituição do par de amortecedores com coifas, batentes de poliuretano e coxins de fixação.',
  },
  {
    value: 'susp-04',
    label: 'Estalos ao esterçar a direção para manobrar',
    categoria: 'Suspensão e Direção',
    gravidade: 'Alta',
    sintoma: 'Ruído de estalo "crec-crec" na roda ao girar o volante tracionando em primeira marcha ou marcha à ré.',
    correcaoSugerida: 'Troca da junta homocinética fixa de roda lado esquerdo/direito e verificação de rasgo na coifa de proteção.',
  },
  {
    value: 'susp-05',
    label: 'Folga na direção e sensação de volante solto',
    categoria: 'Suspensão e Direção',
    gravidade: 'Alta',
    sintoma: 'Pequenos movimentos do volante não respondem nas rodas dianteiras.',
    correcaoSugerida: 'Substituição dos terminais de direção, axiais da caixa e revisão de folga do setor de direção.',
  },

  // 4. Transmissão, Câmbio e Embreagem
  {
    value: 'trans-01',
    label: 'Pedal de embreagem duro e rangendo',
    categoria: 'Transmissão, Câmbio e Embreagem',
    gravidade: 'Média',
    sintoma: 'Esforço excessivo para acionar a embreagem, estalos ou rangido sob o painel.',
    correcaoSugerida: 'Troca do kit de embreagem (platô, disco e rolamento/atuador hidráulico) e lubrificação do cabo ou garfo.',
  },
  {
    value: 'trans-02',
    label: 'Embreagem patinando em aclives e arrancadas',
    categoria: 'Transmissão, Câmbio e Embreagem',
    gravidade: 'Alta',
    sintoma: 'Giro do motor se eleva rapidamente, mas o veículo não acelera proporcionalmente.',
    correcaoSugerida: 'Substituição do conjunto de embreagem e retífica com usinagem da face de atrito do volante do motor.',
  },
  {
    value: 'trans-03',
    label: 'Dificuldade ou arranhando para engatar marchas (1ª e ré)',
    categoria: 'Transmissão, Câmbio e Embreagem',
    gravidade: 'Média',
    sintoma: 'Câmbio duro para entrar a marcha ou emitindo arranhado metálico nos anéis sincronizadores.',
    correcaoSugerida: 'Ajuste e regulagem dos cabos trambuladores da alavanca e sangria do atuador hidráulico da embreagem.',
  },
  {
    value: 'trans-04',
    label: 'Trancos e solavancos na troca de marchas (Câmbio Automático)',
    categoria: 'Transmissão, Câmbio e Embreagem',
    gravidade: 'Crítica',
    sintoma: 'Tranco forte nas reduções ou atraso para engatar a posição Drive ou Ré.',
    correcaoSugerida: 'Troca do fluido ATF da transmissão automática por diálise, substituição do filtro interno e reset dos parâmetros.',
  },

  // 5. Sistema de Arrefecimento
  {
    value: 'arr-01',
    label: 'Vazamento visível de líquido de arrefecimento e gotejamento',
    categoria: 'Sistema de Arrefecimento',
    gravidade: 'Alta',
    sintoma: 'Poça de líquido colorido (rosa, verde ou azul) sob o cofre do motor.',
    correcaoSugerida: 'Teste de pressão estática no radiador, substituição de mangueiras ressecadas, abraçadeiras e carcaça plástica da válvula.',
  },
  {
    value: 'arr-02',
    label: 'Reservatório de expansão com água escura e ferrugem',
    categoria: 'Sistema de Arrefecimento',
    gravidade: 'Média',
    sintoma: 'Líquido amarronzado no reservatório com crostas de corrosão nas paredes.',
    correcaoSugerida: 'Limpeza e desincrustação completa do sistema de arrefecimento, troca do reservatório e aplicação de aditivo orgânico concentrado.',
  },
  {
    value: 'arr-03',
    label: 'Ventoinha do radiador inoperante ou ligada direto no máximo',
    categoria: 'Sistema de Arrefecimento',
    gravidade: 'Crítica',
    sintoma: 'Motor esquenta com o carro parado ou o ventilador nunca desliga gerando ruído de turbina.',
    correcaoSugerida: 'Substituição do sensor de temperatura da água (CTS), relé de acionamento do eletroventilador ou resistência da 1ª velocidade.',
  },

  // 6. Sistema Elétrico e Ignição
  {
    value: 'ele-01',
    label: 'Dificuldade na partida com motor de arranque pesado',
    categoria: 'Sistema Elétrico e Ignição',
    gravidade: 'Alta',
    sintoma: 'Ao girar a chave o motor de arranque gira lento, quase parando, ou apenas estala.',
    correcaoSugerida: 'Teste de condutância e CCA da bateria automotiva, revisão das escovas do motor de partida e aperto dos cabos de aterramento.',
  },
  {
    value: 'ele-02',
    label: 'Luz da bateria acesa no painel com motor funcionando',
    categoria: 'Sistema Elétrico e Ignição',
    gravidade: 'Crítica',
    sintoma: 'Luz vermelha de bateria acesa indicando falha de carga no sistema elétrico.',
    correcaoSugerida: 'Teste de voltagem do alternador (tensão abaixo de 13.8V ou acima de 14.5V) e troca do regulador de voltagem/placa de diodos.',
  },
  {
    value: 'ele-03',
    label: 'Lâmpadas externas e iluminação queimadas',
    categoria: 'Sistema Elétrico e Ignição',
    gravidade: 'Baixa',
    sintoma: 'Farol baixo, lanterna traseira, luz de freio ou seta inoperantes.',
    correcaoSugerida: 'Substituição das lâmpadas avariadas, revisão do soquete e alinhamento do foco dos faróis principais.',
  },

  // 7. Ar Condicionado e Climatização
  {
    value: 'ar-01',
    label: 'Ar condicionado não refrigera a cabine (Sopra apenas ar morno)',
    categoria: 'Ar Condicionado e Climatização',
    gravidade: 'Média',
    sintoma: 'Compressor arma mas a temperatura do ar que sai dos difusores não esfria.',
    correcaoSugerida: 'Teste de estanqueidade por nitrogênio para localização de vazamentos, recarga de gás ecológico R134a/R1234yf e óleo para compressor.',
  },
  {
    value: 'ar-02',
    label: 'Mau cheiro e odor de umidade na ventilação interna',
    categoria: 'Ar Condicionado e Climatização',
    gravidade: 'Baixa',
    sintoma: 'Cheiro desagradável de mofo ao ligar a ventilação do habitáculo.',
    correcaoSugerida: 'Troca do filtro de cabine (pólen) e higienização com aplicação de ozônio ou produto antibactericida na evaporadora.',
  },

  // 8. Escapamento e Emissões
  {
    value: 'esc-01',
    label: 'Ruído excessivo de escapamento furado ou quebrado',
    categoria: 'Escapamento e Emissões',
    gravidade: 'Média',
    sintoma: 'Barulho esportivo/grave não original com estalos sob o assoalho do veículo.',
    correcaoSugerida: 'Substituição do silencioso intermediário/traseiro e troca das borrachas e anéis de vedação de suporte do escape.',
  },

  // 9. Pneus, Rodas e Geometria
  {
    value: 'pneu-01',
    label: 'Vibração no volante e assoalho em velocidades de rodovia (80 a 110 km/h)',
    categoria: 'Pneus, Rodas e Geometria',
    gravidade: 'Média',
    sintoma: 'Volante ou carro vibra ritmicamente em velocidade constante na estrada.',
    correcaoSugerida: 'Balanceamento dinâmico das quatro rodas com checagem de empeno nas rodas de liga leve/aço e calibração de pressão.',
  },
  {
    value: 'pneu-02',
    label: 'Desgaste prematuro e irregular na borda interna dos pneus',
    categoria: 'Pneus, Rodas e Geometria',
    gravidade: 'Alta',
    sintoma: 'Pneu "careca" por dentro enquanto o restante da banda ainda possui sulco.',
    correcaoSugerida: 'Alinhamento completo dos ângulos de camber (cambagem), caster e convergência dianteira e traseira.',
  },
]

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
