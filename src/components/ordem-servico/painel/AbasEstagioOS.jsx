import React from 'react'
import { Package, ArrowSquareOut, Handshake, ShieldCheck, WhatsappLogo, Copy, Check, Plus } from '@phosphor-icons/react'
import Select from 'react-select'
import { customSelectStyles } from '../../suprimentos/customSelectStyles'
import { formatMoeda } from '../../../utils/ordemServico/osMensagens'

const INPUT_NUMERO =
  'h-9 px-2.5 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7]'
const BOTAO_ESCURO_LARGO =
  'w-full h-10 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer'

function Aviso({ className, tituloClassName, textoClassName, Icone, titulo, texto }) {
  return (
    <div className={`${className} rounded-2xl p-4 space-y-1.5`}>
      <span className={`text-xs font-bold uppercase tracking-wider ${tituloClassName} flex items-center gap-1.5`}>
        <Icone size={14} weight="bold" />
        {titulo}
      </span>
      <p className={`text-[11px] ${textoClassName}`}>{texto}</p>
    </div>
  )
}

function ListaSimples({ vazio, itens, renderItem }) {
  return (
    <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden divide-y divide-[#f2f4f7] bg-white shadow-2xs">
      {!itens || itens.length === 0 ? <p className="p-4 text-center text-[#98a2b3] italic text-xs">{vazio}</p> : itens.map(renderItem)}
    </div>
  )
}

/**
 * Aba "Cotação" (OS aguardando peças): peças marcadas Para Cotação e atalho para a tela de cotação.
 * @param {{os: object, onAbrirCotacao?: Function}} props
 */
export function AbaCotacaoOS({ os, onAbrirCotacao }) {
  const pecasParaCotacao = (os.pecasOS || []).filter((p) => p.statusEstoque === 'para_cotacao')
  return (
    <div className="space-y-4">
      <Aviso
        className="bg-[#fffaeb] border border-[#fedf89]"
        tituloClassName="text-[#b54708]"
        textoClassName="text-[#7a4504]"
        Icone={Package}
        titulo="Peças Aguardando Cotação com Fornecedores"
        texto="Esta etapa é da secretaria/gestão — envie os itens abaixo para cotação com os fornecedores cadastrados e volte para atualizar o preço final antes de seguir para Aprovação."
      />

      <ListaSimples
        vazio="Nenhuma peça marcada para cotação nesta OS."
        itens={pecasParaCotacao}
        renderItem={(p, idx) => (
          <div key={idx} className="p-3 text-xs flex items-center justify-between">
            <div className="min-w-0 pr-3">
              <p className="font-bold text-[#101828] truncate">{p.nome}</p>
              <span className="text-[#667085] text-[11px]">Cód: {p.codigo || 'A COTAR'} • {p.quantidade} {p.unidade || 'UN'}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#fffaeb] text-[#b54708] border border-[#fedf89] text-[9px] font-bold shrink-0">
              Para Cotação
            </span>
          </div>
        )}
      />

      {onAbrirCotacao && (
        <button type="button" onClick={() => onAbrirCotacao(os)} className={BOTAO_ESCURO_LARGO}>
          <ArrowSquareOut size={15} weight="bold" />
          <span>Abrir Cotação de Peças com Fornecedores</span>
        </button>
      )}
    </div>
  )
}

/**
 * Aba "Terceirizado": escolha do parceiro, pedido de prazo/valor por WhatsApp e lançamento na OS.
 * @param {{os: object, terceiro: object, opcoesParceiros: Array<object>}} props
 */
export function AbaTerceirizadoOS({ os, terceiro, opcoesParceiros }) {
  return (
    <div className="space-y-4">
      <Aviso
        className="bg-violet-50 border border-violet-200"
        tituloClassName="text-violet-700"
        textoClassName="text-violet-800"
        Icone={Handshake}
        titulo="Serviço Terceirizado"
        texto="Esta etapa é da secretaria/gestão — negocie com o parceiro externo e registre o serviço terceirizado nesta OS."
      />

      <div className="bg-white border border-[#d0d5dd] rounded-2xl p-3.5 space-y-2 shadow-2xs">
        <span className="text-[11px] font-bold text-[#344054] block">Parceiro Terceirizado</span>
        <Select
          value={terceiro.selecao}
          onChange={(opt) => terceiro.alterar('selecao', opt)}
          options={opcoesParceiros}
          isClearable
          placeholder="Selecione o parceiro cadastrado..."
          styles={customSelectStyles}
          noOptionsMessage={() => 'Nenhum parceiro terceirizado cadastrado'}
        />

        <span className="text-[11px] font-bold text-[#344054] block pt-1">Descrição do Serviço</span>
        <input
          type="text"
          value={terceiro.descricao}
          onChange={(e) => terceiro.alterar('descricao', e.target.value)}
          placeholder="Ex: Teste de estanqueidade do radiador"
          className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-semibold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7]"
        />

        <div className="grid grid-cols-2 gap-2 pt-1">
          <input
            type="number"
            min="1"
            value={terceiro.qtd}
            onChange={(e) => terceiro.alterar('qtd', e.target.value)}
            placeholder="Qtd"
            className={`${INPUT_NUMERO} text-center`}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={terceiro.valor}
            onChange={(e) => terceiro.alterar('valor', e.target.value)}
            placeholder="Valor de Venda R$"
            className={INPUT_NUMERO}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={terceiro.solicitarParceiro}
            className="h-9 rounded-xl bg-[#25d366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <WhatsappLogo size={14} weight="fill" />
            Solicitar ao Parceiro
          </button>
          <button
            type="button"
            onClick={terceiro.adicionar}
            className="h-9 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Plus size={14} weight="bold" />
            Adicionar à OS
          </button>
        </div>
      </div>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#667085] block mb-2">
          Terceiros Já Lançados ({os.terceirosOS?.length || 0})
        </span>
        <ListaSimples
          vazio="Nenhum serviço de terceiros vinculado ainda."
          itens={os.terceirosOS}
          renderItem={(t, idx) => (
            <div key={idx} className="p-3 text-xs flex items-center justify-between bg-violet-50/20">
              <div className="min-w-0 pr-3">
                <p className="font-bold text-[#101828] truncate">{t.nome}</p>
                <span className="text-[#667085] text-[11px]">Parceiro: {t.parceiroNome || 'A definir'}</span>
              </div>
              <span className="font-black text-[#101828] shrink-0 text-xs font-mono">
                R$ {formatMoeda((parseFloat(t.valorVenda) || 0) * (parseFloat(t.quantidade) || 1) - (parseFloat(t.desconto) || 0))}
              </span>
            </div>
          )}
        />
      </div>
    </div>
  )
}

/**
 * Aba "Aprovação do Cliente": envio do link por WhatsApp, cópia do link e aprovação
 * manual quando o cliente já autorizou por outro canal.
 * @param {{copiado: boolean, onEnviarWhatsapp: Function, onCopiarLink: Function, onAprovarRapido: Function}} props
 */
export function AbaAprovacaoOS({ copiado, onEnviarWhatsapp, onCopiarLink, onAprovarRapido }) {
  return (
    <div className="space-y-4">
      <Aviso
        className="bg-[#e0f2fe] border border-[#bae6fd]"
        tituloClassName="text-[#0369a1]"
        textoClassName="text-[#0369a1]"
        Icone={ShieldCheck}
        titulo="Aguardando Aprovação do Cliente"
        texto="Envie o link para o cliente conferir peças, serviços e laudo técnico, e autorizar a execução do orçamento."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onEnviarWhatsapp}
          className="flex items-center justify-center gap-1.5 h-10 bg-[#25d366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <WhatsappLogo size={15} weight="fill" />
          <span>Enviar via WhatsApp</span>
        </button>
        <button
          type="button"
          onClick={onCopiarLink}
          className="flex items-center justify-center gap-1.5 h-10 bg-white hover:bg-[#f2f4f7] text-[#101828] border border-[#d0d5dd] text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
        >
          {copiado ? <Check size={15} weight="bold" className="text-[#0284c7]" /> : <Copy size={15} weight="bold" />}
          <span>{copiado ? 'Copiado!' : 'Copiar Link'}</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onAprovarRapido}
        className={BOTAO_ESCURO_LARGO}
        title="Use quando o cliente já autorizou por telefone, WhatsApp ou presencialmente"
      >
        <ShieldCheck size={15} weight="bold" className="text-[#0284c7]" />
        <span>Cliente já aprovou (telefone/presencial) — Aprovar Agora</span>
      </button>
    </div>
  )
}
