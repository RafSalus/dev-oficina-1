import React from 'react'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { useEstoqueWorkflow } from '../../../hooks/useEstoqueWorkflow'
import { PecaModalForm } from '../../../components/suprimentos/PecaModalForm'
import { EstoqueMovimentoModal } from '../../../components/suprimentos/EstoqueMovimentoModal'
import { EstoqueHeader } from '../../../components/estoque/EstoqueHeader'
import { AbaPosicaoEstoque } from '../../../components/estoque/AbaPosicaoEstoque'
import { AbaKardexEstoque } from '../../../components/estoque/AbaKardexEstoque'
import { AbaReposicaoEstoque } from '../../../components/estoque/AbaReposicaoEstoque'
import { MobileEstoquePage } from './mobile/MobileEstoquePage'

/**
 * Tela desktop do Estoque e Almoxarifado: orquestra cabeçalho, abas e modais.
 * A regra vive em `useEstoqueWorkflow` (ADR-003).
 */
function EstoqueDesktop() {
  const estoque = useEstoqueWorkflow()
  const { abaAtiva, modais, acoes } = estoque

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <EstoqueHeader estoque={estoque} />

      {abaAtiva === 'posicao' && <AbaPosicaoEstoque estoque={estoque} />}
      {abaAtiva === 'kardex' && <AbaKardexEstoque estoque={estoque} />}
      {abaAtiva === 'reposicao' && <AbaReposicaoEstoque estoque={estoque} />}

      <EstoqueMovimentoModal
        isOpen={modais.modalMovimentoAberto}
        onClose={modais.fecharMovimento}
        pecaPreSelecionada={modais.pecaParaMovimento}
        onSucesso={acoes.recarregar}
      />

      <PecaModalForm
        isOpen={modais.modalPecaAberto}
        onClose={modais.fecharPeca}
        onSalvar={acoes.salvarPeca}
        pecaParaEditar={modais.pecaParaEditar}
      />
    </div>
  )
}

/**
 * Rota `/{gestao|secretaria}/estoque`: versão mobile ou desktop conforme a viewport.
 */
export function EstoquePage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileEstoquePage /> : <EstoqueDesktop />
}
