import React, { useState } from 'react'
import {
  CarProfile,
  Package,
  Wrench,
  GearSix,
  Lock,
  Check,
  Clock,
  CheckCircle,
  Camera,
  MagnifyingGlassPlus,
  Sparkle,
  Copy,
  Printer,
  WhatsappLogo,
  FileText,
} from '@phosphor-icons/react'
import { MobileAprovacaoModal } from './MobileAprovacaoModal'
import { MobileFotoZoomModal } from './MobileFotoZoomModal'
import { MobileSecaoItens } from './MobileSecaoItens'

const TABS = [
  { id: 'orcamento', label: 'Orçamento', icon: Package },
  { id: 'laudo', label: 'Laudo', icon: Sparkle },
  { id: 'fotos', label: 'Fotos', icon: Camera },
]

/**
 * Versão mobile do Portal do Cliente (/cliente/servicos): orçamento por categoria, laudo,
 * fotos das peças e barra fixa de aprovação. Recebe os dados já adaptados do
 * `useAprovacaoOrcamento` por `ClienteServicosMobile` (NFR18).
 * @param {object} props - `servico`, `itensMarcados`, `totais` e handlers de aprovação.
 */
export function MobileClienteServicosPage({
  servico = {},
  clienteAtivo,
  itensMarcados = new Set(),
  aprovado = false,
  totais = { pixDesconto: 0, parcelaCartao6x: 0, totalAprovado: 0 },
  laudoOficialPadraoOS = '',
  linkWhatsApp = '',
  modalAprovacaoAberto = false,
  setModalAprovacaoAberto = () => {},
  formaPagamento = 'pix',
  setFormaPagamento = () => {},
  nomeResponsavel = '',
  setNomeResponsavel = () => {},
  onToggleItem = () => {},
  onCopiarLaudo = () => {},
  onConfirmarAprovacao = () => {},
}) {
  const [abaAtiva, setAbaAtiva] = useState('orcamento')
  const [copiado, setCopiado] = useState(false)
  const [fotoZoom, setFotoZoom] = useState(null)

  const handleCopiar = () => {
    onCopiarLaudo()
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 4.5rem)' }}>
      <div className="px-4 pt-4">
        {/* Status e identificação da OS */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-[#98a2b3] uppercase tracking-wider">
            OS #{servico.numeroOS || 'N/D'}
          </span>
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
              aprovado ? 'bg-[#e0f2fe] text-[#0284c7]' : 'bg-amber-50 text-amber-800'
            }`}
          >
            {aprovado ? (
              <>
                <CheckCircle size={12} weight="fill" />
                <span>Aprovado</span>
              </>
            ) : (
              <>
                <Clock size={12} weight="bold" />
                <span>Aguardando Aprovação</span>
              </>
            )}
          </div>
        </div>

        <h1 className="text-lg font-extrabold text-[#101828] tracking-tight mb-2">
          Aprovação de Orçamento
        </h1>

        <div className="flex items-center gap-2.5 bg-white border border-[#e4e7ec] rounded-xl px-3 py-2.5 mb-3">
          <CarProfile size={20} weight="bold" className="text-[#0284c7] shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-extrabold text-[#101828] block truncate">
              {servico.veiculo || 'Veículo'} ({servico.placa || 'Sem placa'})
            </span>
            <span className="text-[10.5px] text-[#667085] block">
              KM: {servico.km || 'N/D'} • Consultora: {servico.consultor || 'Oficina'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#f2f4f7] p-1 rounded-xl mb-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAbaAtiva(tab.id)}
              className={`flex-1 h-9 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 ${
                abaAtiva === tab.id ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'
              }`}
            >
              <tab.icon size={13} weight={abaAtiva === tab.id ? 'bold' : 'regular'} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {abaAtiva === 'orcamento' && (
          <>
            <MobileSecaoItens
              titulo="Peças e Componentes"
              icone={Package}
              itens={servico.pecas || []}
              aprovado={aprovado}
              itensMarcados={itensMarcados}
              onToggleItem={onToggleItem}
            />
            <MobileSecaoItens
              titulo="Mão de Obra"
              icone={Wrench}
              itens={servico.servicos || []}
              aprovado={aprovado}
              itensMarcados={itensMarcados}
              onToggleItem={onToggleItem}
            />
            <MobileSecaoItens
              titulo="Serviços Terceirizados"
              icone={GearSix}
              itens={servico.terceiros || []}
              aprovado={aprovado}
              itensMarcados={itensMarcados}
              onToggleItem={onToggleItem}
            />

            {/* Condições de pagamento */}
            <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-2xs p-4">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-[#101828] mb-2.5">
                Condições de Pagamento
              </h3>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e4e7ec] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#101828] block">À Vista no PIX</span>
                    <span className="text-[10px] text-[#0284c7] font-bold">5% de desconto</span>
                  </div>
                  <span className="font-extrabold text-[#101828]">
                    R$ {Number(totais.pixDesconto || 0).toFixed(2)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e4e7ec] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#101828] block">Cartão de Crédito</span>
                    <span className="text-[10px] text-[#667085] font-semibold">Até 6x sem juros</span>
                  </div>
                  <span className="font-extrabold text-[#101828]">
                    6x de R$ {totais.parcelaCartao6x || '0,00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dúvidas via WhatsApp */}
            <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-2xs p-4 text-center">
              <p className="text-xs font-bold text-[#101828] mb-1">Dúvidas sobre o orçamento?</p>
              <p className="text-[11px] text-[#667085] leading-snug mb-3">
                Fale com a consultora <strong className="text-[#101828]">{servico.consultor || 'da oficina'}</strong>.
              </p>
              <a
                href={linkWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 bg-[#25D366] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <WhatsappLogo size={17} weight="fill" />
                <span>Chamar no WhatsApp</span>
              </a>
            </div>
          </>
        )}

        {abaAtiva === 'laudo' && (
          <div className="bg-white border border-[#d0d5dd] rounded-2xl shadow-2xs overflow-hidden">
            <div className="px-4 py-3 border-b border-[#f2f4f7] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkle size={16} weight="fill" className="text-[#38bdf8] shrink-0" />
                <span className="text-xs font-extrabold text-[#101828] truncate">
                  Laudo Técnico Oficial
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCopiar}
                  className="h-8 px-2.5 rounded-lg border border-[#d0d5dd] text-[10.5px] font-bold text-[#101828] flex items-center gap-1 cursor-pointer"
                >
                  {copiado ? (
                    <Check size={13} weight="bold" className="text-[#0284c7]" />
                  ) : (
                    <Copy size={13} weight="bold" />
                  )}
                  {copiado ? 'Copiado' : 'Copiar'}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-8 w-8 rounded-lg border border-[#d0d5dd] text-[#101828] flex items-center justify-center cursor-pointer"
                  aria-label="Imprimir"
                >
                  <Printer size={13} weight="bold" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e4e7ec] text-xs space-y-1">
                <div>
                  <span className="text-[9.5px] font-bold uppercase text-[#667085] block">Veículo</span>
                  <span className="font-bold text-[#101828]">{servico.veiculo}</span>
                  <span className="text-[11px] text-[#475467] block">Placa {servico.placa} • Ano {servico.ano}</span>
                </div>
                <div className="pt-1.5 border-t border-[#f2f4f7] flex items-center justify-between">
                  <span>Cliente: <strong className="text-[#101828]">{clienteAtivo?.nome || 'Cliente'}</strong></span>
                  <span>Mecânico: <strong className="text-[#101828]">{servico.mecanico}</strong></span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e4e7ec]">
                <span className="text-[9.5px] font-extrabold uppercase text-[#667085] block mb-1">
                  Queixa Inicial do Cliente
                </span>
                <p className="text-xs text-[#344054] italic leading-relaxed">"{servico.relatoCliente}"</p>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#667085] uppercase tracking-wider">
                <FileText size={13} />
                Texto Oficial do Laudo
              </div>
              <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] font-mono text-[11px] text-[#101828] whitespace-pre-wrap leading-relaxed">
                {laudoOficialPadraoOS}
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'fotos' && (
          <div className="space-y-3">
            {(servico.pecas || []).filter((peca) => peca.foto).map((peca) => {
              const isSelected = itensMarcados.has(peca.id)
              const isEssencial = peca.tipo === 'essencial'
              return (
                <div
                  key={peca.id}
                  className={`rounded-2xl border overflow-hidden ${
                    isSelected
                      ? 'border-[#d0d5dd] bg-white'
                      : 'border-dashed border-zinc-300 bg-zinc-50/70 opacity-70'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setFotoZoom({
                        url: peca.foto,
                        titulo: peca.nome,
                        descricao: peca.fotoLegenda,
                        estadoPeca: peca.estadoPeca,
                      })
                    }
                    className="w-full h-40 bg-[#f8fafc] border-b border-[#e4e7ec] relative block cursor-pointer"
                  >
                    <img src={peca.foto} alt={peca.nome} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 text-[9.5px] font-extrabold rounded-full bg-[#101828]/90 text-white">
                        {peca.estadoPeca}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/70 text-white text-[9.5px] font-bold">
                      <MagnifyingGlassPlus size={11} weight="bold" />
                      Ampliar
                    </div>
                  </button>

                  <div className="p-3.5 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-extrabold text-[#101828] text-sm leading-tight">
                        {peca.nome}
                      </h4>
                      <span className="font-extrabold text-[#101828] shrink-0">
                        R$ {(peca.preco * peca.quantidade).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-[#667085]">
                      {peca.marca} • Qtd {peca.quantidade}
                    </p>
                    <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e4e7ec] text-[10.5px] text-[#475467] leading-relaxed">
                      {peca.fotoLegenda}
                    </div>

                    <div className="pt-1.5 border-t border-[#f2f4f7] flex items-center justify-between">
                      {isEssencial ? (
                        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#0284c7]">
                          <Lock size={12} weight="bold" />
                          Obrigatório de Segurança
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={aprovado}
                          onClick={() => onToggleItem(peca.id, peca.tipo)}
                          className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border cursor-pointer ${
                            isSelected
                              ? 'bg-[#f2f4f7] border-[#d0d5dd] text-[#344054]'
                              : 'bg-[#e0f2fe] border-[#bae6fd] text-[#0284c7]'
                          }`}
                        >
                          {isSelected ? 'Dispensar' : 'Incluir'}
                        </button>
                      )}
                      <span
                        className={`text-[10.5px] font-extrabold ${
                          isSelected ? 'text-[#101828]' : 'text-zinc-400 line-through'
                        }`}
                      >
                        {isSelected ? 'Incluído' : 'Dispensado'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Barra fixa de total e aprovação */}
      <div
        className="fixed left-0 right-0 z-30 bg-white border-t border-[#e4e7ec] px-4 py-3"
        style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#98a2b3] block">
              Total {aprovado ? 'Aprovado' : ''}
            </span>
            <span className="text-base font-black text-[#101828]">
              R$ {Number(totais.totalAprovado || 0).toFixed(2)}
            </span>
          </div>
          {aprovado ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#e0f2fe] text-[#0284c7] text-xs font-bold shrink-0">
              <CheckCircle size={15} weight="fill" />
              Aprovado
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setModalAprovacaoAberto(true)}
              className="px-4 py-2.5 rounded-xl bg-[#0284c7] active:bg-[#0369a1] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Check size={15} weight="bold" />
              Aprovar Orçamento
            </button>
          )}
        </div>
      </div>

      <MobileAprovacaoModal
        isOpen={modalAprovacaoAberto}
        onFechar={() => setModalAprovacaoAberto(false)}
        servico={servico}
        totais={totais}
        formaPagamento={formaPagamento}
        setFormaPagamento={setFormaPagamento}
        nomeResponsavel={nomeResponsavel}
        setNomeResponsavel={setNomeResponsavel}
        onConfirmar={onConfirmarAprovacao}
      />

      <MobileFotoZoomModal fotoZoom={fotoZoom} onFechar={() => setFotoZoom(null)} />
    </div>
  )
}
