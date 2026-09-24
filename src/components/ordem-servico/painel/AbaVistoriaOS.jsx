import React from 'react'
import { Wrench, Package, Plus, Camera, CheckCircle } from '@phosphor-icons/react'
import CreatableSelect from 'react-select/creatable'
import { customSelectStyles } from '../../suprimentos/customSelectStyles'
import { ITENS_CHECKLIST_ENTRADA, checklistCompleto } from '../../../constants/checklistItems'

const INPUT_NUMERO =
  'h-9 px-2.5 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7]'
const BOTAO_ADICIONAR =
  'w-full h-9 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer'

function SeloStatus({ concluido, rotuloConcluido }) {
  return concluido ? (
    <span className="px-2.5 py-1 rounded-full bg-[#101828] text-white text-[10px] font-bold">{rotuloConcluido}</span>
  ) : (
    <span className="px-2.5 py-1 rounded-full bg-[#fffaeb] text-[#b54708] border border-[#fedf89] text-[10px] font-bold">
      Pendente
    </span>
  )
}

function CartaoPendencia({ titulo, descricao, children }) {
  return (
    <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-4 text-xs flex items-center justify-between">
      <div>
        <span className="font-bold text-[#101828] block text-xs">{titulo}</span>
        <span className="text-[#667085] text-[11px]">{descricao}</span>
      </div>
      {children}
    </div>
  )
}

function FormPecaRapida({ peca, opcoes }) {
  const cadastro = peca.selecao?.peca
  return (
    <div className="bg-white border border-[#d0d5dd] rounded-2xl p-3.5 space-y-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
        <Package size={14} weight="bold" className="text-[#0284c7]" />
        Adicionar Peça do Almoxarifado
      </span>
      <CreatableSelect
        value={peca.selecao}
        onChange={(opt) => peca.alterar('selecao', opt)}
        options={opcoes}
        isClearable
        placeholder="Buscar peça cadastrada ou digitar nova..."
        styles={customSelectStyles}
        formatCreateLabel={(input) => `Peça não cadastrada: "${input}" (vai para cotação)`}
        noOptionsMessage={() => 'Nenhuma peça cadastrada com este termo'}
      />
      <input
        type="number"
        min="1"
        value={peca.qtd}
        onChange={(e) => peca.alterar('qtd', e.target.value)}
        placeholder="Quantidade"
        className={`w-full ${INPUT_NUMERO} text-center`}
      />
      {cadastro ? (
        <p className="text-[10.5px] text-[#667085]">
          R$ {Number(cadastro.precoVenda || 0).toFixed(2)} • Estoque: {cadastro.estoqueAtual ?? 0} {cadastro.unidade || 'UN'}
          {(parseFloat(peca.qtd) || 1) > (Number(cadastro.estoqueAtual) || 0) && (
            <span className="text-[#b54708] font-bold"> — estoque insuficiente, entrará para Cotação</span>
          )}
        </p>
      ) : peca.selecao ? (
        <p className="text-[10.5px] text-[#b54708] font-semibold">Peça não cadastrada — entrará para Cotação</p>
      ) : null}
      <button type="button" onClick={peca.adicionar} className={BOTAO_ADICIONAR}>
        <Plus size={14} weight="bold" />
        Adicionar Peça
      </button>

      {peca.ultimaAdicionada && (
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#ecfdf3] border border-[#a6f4c5]">
          <span className="text-[10.5px] font-bold text-[#027a48] truncate flex items-center gap-1">
            <CheckCircle size={13} weight="fill" />
            {peca.ultimaAdicionada.nome}
          </span>
          <button
            type="button"
            onClick={peca.tirarFoto}
            className="h-7 px-2.5 rounded-lg bg-[#027a48] hover:bg-[#026a3f] text-white text-[10.5px] font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Camera size={13} weight="bold" />
            Tirar Foto
          </button>
        </div>
      )}
      {/* Abre a câmera do celular (não a galeria) para fotografar a peça recém-adicionada */}
      <input
        type="file"
        ref={peca.inputFotoRef}
        onChange={peca.fotoSelecionada}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
    </div>
  )
}

function FormServicoRapido({ servico, opcoes }) {
  return (
    <div className="bg-white border border-[#d0d5dd] rounded-2xl p-3.5 space-y-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
        <Wrench size={14} weight="bold" className="text-[#0284c7]" />
        Adicionar Serviço do Catálogo
      </span>
      <CreatableSelect
        value={servico.selecao}
        onChange={servico.selecionar}
        options={opcoes}
        isClearable
        placeholder="Buscar serviço cadastrado ou digitar novo..."
        styles={customSelectStyles}
        formatCreateLabel={(input) => `Adicionar serviço "${input}"`}
        noOptionsMessage={() => 'Nenhum serviço cadastrado com este termo'}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          min="1"
          value={servico.qtd}
          onChange={(e) => servico.alterar('qtd', e.target.value)}
          placeholder="Qtd"
          className={`${INPUT_NUMERO} text-center`}
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={servico.preco}
          onChange={(e) => servico.alterar('preco', e.target.value)}
          placeholder="Valor R$"
          className={INPUT_NUMERO}
        />
      </div>
      <button type="button" onClick={servico.adicionar} className={BOTAO_ADICIONAR}>
        <Plus size={14} weight="bold" />
        Adicionar Serviço
      </button>
    </div>
  )
}

/**
 * Aba "Vistoria e Diagnóstico": relato do cliente, laudo, checklist de entrada, assinatura
 * da vistoria e, enquanto a OS está na fila ou em diagnóstico, o lançamento rápido de
 * peças e serviços.
 * @param {{os: object, assinaturaVistoria: object|null, podeLancarItens: boolean, lancamentos: object}} props
 */
export function AbaVistoriaOS({ os, assinaturaVistoria, podeLancarItens, lancamentos }) {
  return (
    <div className="space-y-4">
      <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-4 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#667085] block">Queixa e Relato Inicial do Cliente</span>
        <p className="text-xs text-[#101828] leading-relaxed italic bg-white p-3 rounded-xl border border-[#e4e7ec]/60">
          "{os.relatoCliente || 'Nenhum relato detalhado informado na abertura.'}"
        </p>
      </div>

      <div className="bg-white border border-[#d0d5dd] rounded-2xl p-4 space-y-2 shadow-2xs">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7] block">
          Laudo Técnico do Mecânico ({os.mecanicoNome || 'Oficina'})
        </span>
        <p className="text-xs text-[#344054] leading-relaxed whitespace-pre-line bg-[#f8fafc] p-3 rounded-xl border border-[#e4e7ec]/60">
          {os.laudoTecnico || 'Aguardando inserção de laudo técnico pelo mecânico.'}
        </p>
      </div>

      <CartaoPendencia
        titulo="Checklist de Entrada"
        descricao="22 itens inspecionados — pode ser preenchido pela secretaria ou pelo mecânico"
      >
        <SeloStatus concluido={checklistCompleto(os.checklistEntrada, ITENS_CHECKLIST_ENTRADA)} rotuloConcluido="Concluído" />
      </CartaoPendencia>

      {/* Assinatura digital do cliente via link público — obrigatória antes do Diagnóstico */}
      <CartaoPendencia
        titulo="Aprovação da Vistoria pelo Cliente"
        descricao={
          assinaturaVistoria
            ? `Assinado por ${assinaturaVistoria.nomeAssinante} em ${assinaturaVistoria.dataHora}`
            : 'Aguardando o cliente assinar o checklist enviado por WhatsApp'
        }
      >
        <SeloStatus concluido={Boolean(assinaturaVistoria)} rotuloConcluido="Aprovado" />
      </CartaoPendencia>

      {/* Só antes de Cotação/Terceirizado/Execução, etapas que já têm seus próprios fluxos */}
      {podeLancarItens && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormPecaRapida peca={lancamentos.peca} opcoes={lancamentos.opcoes.pecas} />
          <FormServicoRapido servico={lancamentos.servico} opcoes={lancamentos.opcoes.servicos} />
        </div>
      )}
    </div>
  )
}
