/**
 * Estrutura padronizada de erros de repositório (ADR-005 §2.2).
 * Normaliza erros do PostgREST/Postgres e falhas de rede em códigos previsíveis
 * acompanhados de mensagens amigáveis para exibição via sonner.
 */

export const CODIGOS_ERRO = {
  SEM_PERMISSAO: 'SEM_PERMISSAO',
  DUPLICADO: 'DUPLICADO',
  CONFLITO_EDICAO: 'CONFLITO_EDICAO',
  FORA_DO_HORARIO: 'FORA_DO_HORARIO',
  REFERENCIA_INVALIDA: 'REFERENCIA_INVALIDA',
  INDISPONIVEL: 'INDISPONIVEL',
  ERRO_DESCONHECIDO: 'ERRO_DESCONHECIDO',
}

export const MENSAGENS_PADRAO = {
  [CODIGOS_ERRO.SEM_PERMISSAO]: 'Você não tem permissão para esta operação.',
  [CODIGOS_ERRO.DUPLICADO]: 'Registro já existente ou duplicado no sistema.',
  [CODIGOS_ERRO.CONFLITO_EDICAO]: 'Este registro foi alterado por outra pessoa. Recarregue a página.',
  [CODIGOS_ERRO.FORA_DO_HORARIO]: 'Operação permitida apenas das 08h às 19h.',
  [CODIGOS_ERRO.REFERENCIA_INVALIDA]: 'Referência a registro inexistente ou inválida.',
  [CODIGOS_ERRO.INDISPONIVEL]: 'Sem conexão com o servidor. Nada foi salvo.',
  [CODIGOS_ERRO.ERRO_DESCONHECIDO]: 'Ocorreu um erro inesperado na operação.',
}

export class ErroRepositorio extends Error {
  /**
   * @param {string} codigo - Código de erro normalizado (ver CODIGOS_ERRO)
   * @param {string} [mensagem] - Mensagem amigável para exibição
   * @param {Object} [opcoes]
   * @param {Error|Object|null} [opcoes.erroOriginal] - Erro original retornado pelo Supabase/PostgREST
   * @param {Object|null} [opcoes.contexto] - Metadados da operação ({ entidade, operacao, ... })
   */
  constructor(codigo, mensagem, { erroOriginal = null, contexto = null } = {}) {
    const mensagemFinal = mensagem || MENSAGENS_PADRAO[codigo] || MENSAGENS_PADRAO[CODIGOS_ERRO.ERRO_DESCONHECIDO]
    super(mensagemFinal)
    this.name = 'ErroRepositorio'
    this.codigo = codigo
    this.mensagemAmigavel = mensagemFinal
    this.erroOriginal = erroOriginal
    this.contexto = contexto
  }
}

/**
 * Mapeia erros do PostgREST/Postgres para instâncias de ErroRepositorio com código normalizado.
 * @param {any} err - Objeto de erro retornado pelo Supabase ou capturado em try/catch
 * @param {Object} [contexto] - { entidade: string, operacao: string, ... }
 * @returns {ErroRepositorio}
 */
export function mapearErroPostgres(err, contexto = null) {
  if (err instanceof ErroRepositorio) {
    return err
  }

  const code = String(err?.code || '')
  const message = String(err?.message || '').toLowerCase()
  const details = String(err?.details || '').toLowerCase()

  // 1. Permissão negada no Postgres (42501) ou RLS
  if (code === '42501' || message.includes('permission denied') || message.includes('row-level security')) {
    return new ErroRepositorio(
      CODIGOS_ERRO.SEM_PERMISSAO,
      MENSAGENS_PADRAO[CODIGOS_ERRO.SEM_PERMISSAO],
      { erroOriginal: err, contexto }
    )
  }

  // 2. Chave duplicada / violação de constraint UNIQUE (23505)
  if (code === '23505' || message.includes('unique constraint') || message.includes('duplicate key')) {
    let msg = MENSAGENS_PADRAO[CODIGOS_ERRO.DUPLICADO]
    if (contexto?.mensagensCustomizadas?.[CODIGOS_ERRO.DUPLICADO]) {
      msg = contexto.mensagensCustomizadas[CODIGOS_ERRO.DUPLICADO]
    } else if (details.includes('cpf') || message.includes('cpf')) {
      msg = 'CPF já cadastrado no sistema.'
    } else if (details.includes('placa') || message.includes('placa')) {
      msg = 'Placa já cadastrada no sistema.'
    }
    return new ErroRepositorio(
      CODIGOS_ERRO.DUPLICADO,
      msg,
      { erroOriginal: err, contexto }
    )
  }

  // 3. Violação de chave estrangeira (23503)
  if (code === '23503' || message.includes('foreign key constraint')) {
    return new ErroRepositorio(
      CODIGOS_ERRO.REFERENCIA_INVALIDA,
      contexto?.mensagensCustomizadas?.[CODIGOS_ERRO.REFERENCIA_INVALIDA] || MENSAGENS_PADRAO[CODIGOS_ERRO.REFERENCIA_INVALIDA],
      { erroOriginal: err, contexto }
    )
  }

  // 4. Fora de horário operacional (FR20 / trigger / check constraint)
  if (
    message.includes('fora do horario') ||
    message.includes('horario operacional') ||
    message.includes('em_horario_operacional') ||
    details.includes('horario_operacional')
  ) {
    return new ErroRepositorio(
      CODIGOS_ERRO.FORA_DO_HORARIO,
      MENSAGENS_PADRAO[CODIGOS_ERRO.FORA_DO_HORARIO],
      { erroOriginal: err, contexto }
    )
  }

  // 5. Conflito de edição / concorrência otimista (updated_at)
  if (code === 'CONFLITO_EDICAO' || message.includes('conflito de edicao') || message.includes('registro desatualizado')) {
    return new ErroRepositorio(
      CODIGOS_ERRO.CONFLITO_EDICAO,
      MENSAGENS_PADRAO[CODIGOS_ERRO.CONFLITO_EDICAO],
      { erroOriginal: err, contexto }
    )
  }

  // 6. Indisponibilidade de rede ou conexão
  if (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('timeout') ||
    message.includes('abort') ||
    code === 'PGRST000' ||
    err?.name === 'FetchError' ||
    err?.name === 'AbortError'
  ) {
    return new ErroRepositorio(
      CODIGOS_ERRO.INDISPONIVEL,
      MENSAGENS_PADRAO[CODIGOS_ERRO.INDISPONIVEL],
      { erroOriginal: err, contexto }
    )
  }

  // 7. Genérico / desconhecido
  return new ErroRepositorio(
    CODIGOS_ERRO.ERRO_DESCONHECIDO,
    err?.message || MENSAGENS_PADRAO[CODIGOS_ERRO.ERRO_DESCONHECIDO],
    { erroOriginal: err, contexto }
  )
}
