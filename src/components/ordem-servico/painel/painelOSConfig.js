/**
 * Configuração do painel de detalhes da OS (Story 2.0 / ADR-003): opções de status,
 * estilos do seletor e abas visíveis por etapa do fluxo.
 */
import { STATUS_ORCAMENTO } from '../../../pages/dashboard/orcamento/mockOrdensAbertas'
import { SEQUENCIA_STATUS } from '../../../pages/dashboard/orcamento/statusTransicao'

export const OPCOES_STATUS_ORDENADAS = SEQUENCIA_STATUS.map((status) =>
  STATUS_ORCAMENTO.find((s) => s.value === status)
).filter(Boolean)

export const selectStatusStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '34px',
    height: '34px',
    backgroundColor: '#f8fafc',
    borderColor: state.isFocused ? '#0284c7' : '#d0d5dd',
    borderRadius: '0.625rem',
    boxShadow: state.isFocused ? '0 0 0 1px #0284c7' : 'none',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 8px',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    border: '1px solid #d0d5dd',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.75rem',
    fontWeight: state.isSelected ? '700' : '500',
    backgroundColor: state.isDisabled ? '#ffffff' : state.isSelected ? '#101828' : state.isFocused ? '#f2f4f7' : '#ffffff',
    color: state.isDisabled ? '#d0d5dd' : state.isSelected ? '#ffffff' : '#101828',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
  }),
}

// Além de Resumo, Itens e Vistoria/Diagnóstico (sempre visíveis), uma aba extra aparece de
// acordo com o status atual da OS — o painel fica focado no que importa na etapa atual.
export const ABA_ESTAGIO_POR_STATUS = {
  aguardando_pecas: 'cotacao',
  terceirizado: 'terceirizado',
  aguardando_aprovacao: 'aprovacao',
  aprovado_execucao: 'execucao',
  pronto_retirada: 'execucao',
}

export const LABEL_ABA_ESTAGIO = {
  cotacao: 'Cotação',
  terceirizado: 'Terceirizado',
  aprovacao: 'Aprovação do Cliente',
  execucao: 'Execução',
}

/**
 * Abas do painel para a OS: as três fixas mais a aba da etapa atual, se houver.
 * @param {object} os
 * @returns {Array<{id: string, label: string}>}
 */
export function montarAbasPainel(os) {
  const abaEstagio = ABA_ESTAGIO_POR_STATUS[os.status]
  const totalItens = (os.pecasOS?.length || 0) + (os.servicosOS?.length || 0) + (os.terceirosOS?.length || 0)
  return [
    { id: 'resumo', label: 'Resumo e Valores' },
    { id: 'itens', label: `Itens (${totalItens})` },
    { id: 'vistoria', label: 'Vistoria e Diagnóstico' },
    ...(abaEstagio ? [{ id: abaEstagio, label: LABEL_ABA_ESTAGIO[abaEstagio] }] : []),
  ]
}
