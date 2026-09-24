import React from 'react'
import { CompraModalForm } from '../CompraModalForm'
import { PecaModalForm } from '../PecaModalForm'
import { VisualizarCotacaoModal } from '../VisualizarCotacaoModal'
import { ModalConfirmacao } from '../../ModalConfirmacao'

/**
 * Modais e diálogos de confirmação da tela de Compras: pedido de compra,
 * catalogação de peça avulsa, pré-visualização da cotação, exclusões e recebimento.
 * @param {{modais: object, acoes: object}} props - Estados e ações de `useComprasWorkflow()`.
 */
export function ComprasModais({ modais, acoes }) {
  const { cotacaoParaExcluir, pedidoParaReceber, pedidoParaExcluir, dadosCatalogar } = modais

  return (
    <>
      <CompraModalForm
        isOpen={modais.modalCompraAberto}
        onClose={modais.fecharModalCompra}
        onSalvar={acoes.salvarPedido}
        pedidoParaEditar={modais.pedidoParaEditar}
        demandaInicial={modais.demandaParaComprar}
      />

      <PecaModalForm
        isOpen={Boolean(dadosCatalogar)}
        onClose={modais.fecharCatalogar}
        onSalvar={acoes.salvarCatalogacaoPeca}
        pecaParaEditar={dadosCatalogar}
      />

      <VisualizarCotacaoModal
        isOpen={Boolean(modais.cotacaoParaVisualizar)}
        onClose={() => modais.setCotacaoParaVisualizar(null)}
        cotacaoId={modais.cotacaoParaVisualizar?.id}
        cotacao={modais.cotacaoParaVisualizar}
      />

      <ModalConfirmacao
        isOpen={Boolean(cotacaoParaExcluir)}
        onClose={() => modais.setCotacaoParaExcluir(null)}
        onConfirm={acoes.confirmarExclusaoCotacao}
        titulo="Excluir esta cotação?"
        descricao="Esta ação removerá permanentemente o registro da cotação selecionada."
        itemDestaque={cotacaoParaExcluir ? `Cotação: #${cotacaoParaExcluir.id}` : ''}
        textoConfirmar="Sim, Excluir"
        textoCancelar="Cancelar"
        variante="perigo"
      />

      <ModalConfirmacao
        isOpen={Boolean(pedidoParaReceber)}
        onClose={() => modais.setPedidoParaReceber(null)}
        onConfirm={acoes.confirmarRecebimentoPedido}
        titulo="Confirmar recebimento do pedido?"
        descricao="As peças darão entrada imediata no estoque e a OS vinculada será atualizada."
        itemDestaque={pedidoParaReceber ? `Pedido: ${pedidoParaReceber.numeroPedido}` : ''}
        textoConfirmar="Confirmar Entrada"
        textoCancelar="Cancelar"
        variante="primario"
      />

      <ModalConfirmacao
        isOpen={Boolean(pedidoParaExcluir)}
        onClose={() => modais.setPedidoParaExcluir(null)}
        onConfirm={acoes.confirmarExclusaoPedido}
        titulo="Excluir este pedido de compra?"
        descricao="Esta operação removerá o registro do pedido de compras."
        itemDestaque={pedidoParaExcluir ? `Pedido: ${pedidoParaExcluir.numeroPedido}` : ''}
        textoConfirmar="Sim, Excluir"
        textoCancelar="Cancelar"
        variante="perigo"
      />
    </>
  )
}
