import React from 'react'
import { ModalConfirmacao } from '../../../components/ModalConfirmacao'
import { CompraModalForm } from '../../../components/suprimentos/CompraModalForm'
import { VisualizarCotacaoModal } from '../../../components/suprimentos/VisualizarCotacaoModal'
import { CotacaoHeader } from '../../../components/suprimentos/cotacao/CotacaoHeader'
import { CotacaoVeiculoPainel } from '../../../components/suprimentos/cotacao/CotacaoVeiculoPainel'
import { CotacaoItensPainel } from '../../../components/suprimentos/cotacao/CotacaoItensPainel'
import { CotacaoFornecedoresPainel } from '../../../components/suprimentos/cotacao/CotacaoFornecedoresPainel'
import { CotacaoRodape } from '../../../components/suprimentos/cotacao/CotacaoRodape'
import { useCotacaoWorkflow } from '../../../hooks/useCotacaoWorkflow'

/**
 * Tela dedicada de Cotação de Peças (`compras/cotacao/:id` e `compras/cotacao/nova`).
 * Orquestra os painéis de veículo, peças e fornecedores; a regra vive em
 * `useCotacaoWorkflow` (ADR-003).
 */
export function CotacaoPage() {
  const cotacao = useCotacaoWorkflow()
  const { idCotacao, dados, itens, fornecedores, modais, acoes } = cotacao

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <CotacaoHeader
        idCotacao={idCotacao}
        status={cotacao.status}
        dados={dados}
        podeExcluir={cotacao.isCotacaoExistente}
        onVoltar={acoes.voltar}
        onExcluir={acoes.pedirExclusao}
        onVisualizar={acoes.abrirVisualizacao}
        onSalvar={acoes.salvar}
        onAprovar={acoes.aprovarEGerarPedido}
      />

      {/* Corpo com Scrollbar Oculta (Regra 11) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-6 space-y-6">
        <CotacaoVeiculoPainel
          dados={dados}
          opcoesOS={cotacao.opcoesOS}
          onSelecionarOS={acoes.selecionarOS}
          onAtualizarCampo={acoes.atualizarCampo}
        />

        <CotacaoItensPainel
          itens={itens}
          temOS={Boolean(dados.numeroOS)}
          onRecarregarDaOS={acoes.recarregarPecasDaOS}
          onAdicionar={acoes.adicionarItem}
          onRemover={acoes.removerItem}
        />

        <CotacaoFornecedoresPainel
          fornecedores={fornecedores}
          itens={itens}
          idCotacao={idCotacao}
          onDispararWhatsApp={acoes.dispararWhatsApp}
          onCopiarWhatsApp={acoes.copiarMensagemWhatsApp}
        />

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Observações Gerais da Cotação
          </label>
          <textarea
            rows={2}
            value={dados.observacoes}
            onChange={(e) => acoes.atualizarCampo('observacoes', e.target.value)}
            placeholder="Instruções para o comprador, urgência do veículo ou orientações para as autopeças parceiras..."
            className="w-full p-3 rounded-xl border border-[#d0d5dd] text-xs text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] resize-none"
          />
        </div>
      </div>

      <CotacaoRodape
        totalItens={itens.length}
        totalFornecedores={fornecedores.fornecedoresCotados.length}
        onVoltar={acoes.voltar}
        onVisualizar={acoes.abrirVisualizacao}
        onSalvar={acoes.salvar}
        onAprovar={acoes.aprovarEGerarPedido}
      />

      <CompraModalForm
        isOpen={modais.modalCompraAberto}
        onClose={modais.fecharModalCompra}
        onSalvar={acoes.concluirPedidoCompra}
        demandaInicial={modais.dadosPedidoParaGerar}
      />

      <VisualizarCotacaoModal
        isOpen={modais.modalVisualizarAberto}
        onClose={modais.fecharVisualizacao}
        cotacaoId={idCotacao}
        cotacao={cotacao.montarObjetoCotacao()}
      />

      <ModalConfirmacao
        isOpen={modais.confirmandoExclusao}
        onClose={modais.fecharExclusao}
        onConfirm={acoes.confirmarExclusao}
        titulo="Excluir esta cotação?"
        descricao="Esta ação removerá permanentemente a cotação e todas as cotações vinculadas aos fornecedores."
        itemDestaque={idCotacao ? `Cotação: #${idCotacao}` : ''}
        textoConfirmar="Sim, Excluir"
        textoCancelar="Cancelar"
        variante="perigo"
      />
    </div>
  )
}
