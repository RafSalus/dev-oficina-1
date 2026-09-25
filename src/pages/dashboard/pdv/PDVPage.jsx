import React from 'react'
import { ModalConfirmacao } from '../../../components/ModalConfirmacao'
import { ModalFechamentoPagamento } from './ModalFechamentoPagamento'
import { ReciboVendaImpressao } from './ReciboVendaImpressao'
import { PDVHeader } from './components/PDVHeader'
import { PDVCatalogo } from './components/PDVCatalogo'
import { PDVCarrinho } from './components/PDVCarrinho'
import { usePDVWorkflow } from '../../../hooks/usePDVWorkflow'

/**
 * PDVPage - Tela do Ponto de Venda (PDV).
 * Orquestra catálogo, cupom/carrinho e modais de fechamento.
 * Toda a regra de negócio e estado residem em `usePDVWorkflow` (Story 2.0b / ADR-003).
 */
export function PDVPage({ workflow: workflowProp } = {}) {
  const hookWorkflow = usePDVWorkflow()
  const pdv = workflowProp || hookWorkflow

  const {
    abaCatalogo,
    setAbaCatalogo,
    buscaCatalogo,
    setBuscaCatalogo,
    pecasFiltradas,
    servicosFiltrados,
    itensCarrinho,
    osVinculada,
    clienteSelecionado,
    setClienteSelecionado,
    veiculoSelecionado,
    setVeiculoSelecionado,
    buscaOS,
    setBuscaOS,
    descontoGeral,
    setDescontoGeral,
    tipoDescontoGeral,
    setTipoDescontoGeral,
    totais,
    clienteInfo,
    modais,
    acoes,
  } = pdv

  return (
    <div className="h-full w-full flex flex-col gap-3 overflow-hidden select-none">
      <PDVHeader
        osVinculada={osVinculada}
        buscaOS={buscaOS}
        onBuscaOSChange={setBuscaOS}
        onBuscarOS={acoes.buscarOS}
        onDesvincularOS={acoes.desvincularOS}
        onNovaVenda={acoes.solicitarNovaVenda}
      />

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-3 overflow-hidden">
        <PDVCatalogo
          abaCatalogo={abaCatalogo}
          onTrocarAba={setAbaCatalogo}
          buscaCatalogo={buscaCatalogo}
          onBuscaCatalogoChange={setBuscaCatalogo}
          pecas={pecasFiltradas}
          servicos={servicosFiltrados}
          onAdicionarPeca={acoes.adicionarPeca}
          onAdicionarServico={acoes.adicionarServico}
        />

        <PDVCarrinho
          itensCarrinho={itensCarrinho}
          osVinculada={osVinculada}
          clienteSelecionado={clienteSelecionado}
          onClienteSelecionadoChange={setClienteSelecionado}
          veiculoSelecionado={veiculoSelecionado}
          onVeiculoSelecionadoChange={setVeiculoSelecionado}
          descontoGeral={descontoGeral}
          onDescontoGeralChange={setDescontoGeral}
          tipoDescontoGeral={tipoDescontoGeral}
          onTipoDescontoGeralChange={setTipoDescontoGeral}
          totais={totais}
          onAlterarQuantidade={acoes.alterarQuantidade}
          onAlterarDescontoItem={acoes.alterarDescontoItem}
          onRemoverItem={acoes.removerItem}
          onFinalizarVenda={acoes.abrirPagamento}
        />
      </div>

      <ModalFechamentoPagamento
        isOpen={modais.modalPagamentoAberto}
        onClose={() => modais.setModalPagamentoAberto(false)}
        totalGeral={totais.totalGeral}
        cliente={clienteInfo}
        numeroOSVinculada={osVinculada?.numeroOS}
        onConfirmar={acoes.confirmarPagamento}
        processando={modais.processandoPagamento}
      />

      <ReciboVendaImpressao
        isOpen={modais.reciboAberto}
        onClose={() => modais.setReciboAberto(false)}
        venda={modais.vendaFinalizada}
      />

      <ModalConfirmacao
        isOpen={modais.confirmandoNovaVenda}
        onClose={() => modais.setConfirmandoNovaVenda(false)}
        onConfirm={acoes.confirmarNovaVenda}
        titulo="Iniciar nova venda e limpar carrinho?"
        descricao="Todos os itens adicionados e dados não concluídos serão descartados do PDV."
        itemDestaque={`Itens no carrinho: ${itensCarrinho.length} item(ns)`}
        textoConfirmar="Sim, Limpar e Iniciar"
        textoCancelar="Cancelar"
        variante="aviso"
      />
    </div>
  )
}
