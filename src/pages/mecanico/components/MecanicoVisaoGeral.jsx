import {
  Package,
  Wrench,
  ShoppingCart,
  CheckSquareOffset,
  MagnifyingGlassPlus,
  WarningOctagon,
  CalendarDots,
} from '@phosphor-icons/react'
import { STATUS_ORCAMENTO } from '../../dashboard/orcamento/mockOrdensAbertas'
import { MecanicoExecucaoTimer } from './MecanicoExecucaoTimer'
import { AGENDA_DO_DIA } from './MecanicoAgenda'

export function MecanicoVisaoGeral({ osAtiva, requisicoesPecas, setActiveTab, recarregarOrdens, mecanicoNome }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Coluna 1: OS Ativa em Detalhes */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e4e7ec] mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#101828] text-white font-mono font-black text-xs">
                {osAtiva?.placa}
              </span>
              <h3 className="font-extrabold text-sm text-[#101828]">
                {osAtiva?.marcaModelo} ({osAtiva?.ano})
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
              {STATUS_ORCAMENTO.find((s) => s.value === osAtiva?.status)?.label || osAtiva?.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs mb-3">
            <div>
              <span className="text-[#667085] block text-[10px] font-bold uppercase">Cliente:</span>
              <strong className="text-[#101828]">{osAtiva?.cliente}</strong>
              <span className="text-[#475467] block mt-0.5">{osAtiva?.telefone}</span>
            </div>
            <div>
              <span className="text-[#667085] block text-[10px] font-bold uppercase">KM de Entrada:</span>
              <strong className="text-[#101828]">{osAtiva?.km} KM</strong>
              <span className="text-[#475467] block mt-0.5">Combustível: {osAtiva?.combustivel}</span>
            </div>
            <div>
              <span className="text-[#667085] block text-[10px] font-bold uppercase">Previsão de Entrega:</span>
              <strong className="text-[#0284c7]">
                {osAtiva?.previsaoEntregaData || 'A definir'} {osAtiva?.previsaoEntregaHora || ''}
              </strong>
            </div>
          </div>

          {/* Queixa do Cliente */}
          <div className="bg-white border border-[#e4e7ec] rounded-xl p-3 text-xs mb-3">
            <span className="text-[#667085] font-bold uppercase text-[10px] block mb-1">
              Relato do Cliente (Queixa):
            </span>
            <p className="text-[#101828] italic leading-relaxed">
              "{osAtiva?.relatoCliente || 'Nenhum relato informado na triagem.'}"
            </p>
          </div>

          {/* Laudo Técnico Atual */}
          <div className="bg-white border border-[#e4e7ec] rounded-xl p-3 text-xs">
            <span className="text-[#667085] font-bold uppercase text-[10px] block mb-1">
              Diagnóstico Técnico Registrado:
            </span>
            <p className="text-[#101828] leading-relaxed">
              {osAtiva?.laudoTecnico || 'Aguardando preenchimento do laudo na bancada.'}
            </p>
          </div>

          {/* Item Adicional Encontrado na Execução — só faz sentido com a OS já em
              execução (aprovado_execucao); itens de segurança bloqueiam o avanço da
              OS até o cliente responder (motivoImpedimentoAvancoPorItemAdicional) */}
          <MecanicoExecucaoTimer osAtiva={osAtiva} recarregarOrdens={recarregarOrdens} mecanicoNome={mecanicoNome} />
        </div>

        {/* Peças e Serviços da OS */}
        <div className="grid grid-cols-2 gap-4">
          {/* Peças Vinculadas */}
          <div className="border border-[#e4e7ec] rounded-2xl p-3 bg-[#fcfcfd]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#101828] flex items-center gap-1.5">
                <Package size={15} weight="bold" className="text-[#0284c7]" />
                Peças na OS ({osAtiva?.pecasOS?.length || 0})
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('pedir-pecas')}
                className="text-[11px] font-bold text-[#0284c7] hover:underline"
              >
                + Pedir Peça
              </button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
              {osAtiva?.pecasOS?.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#e4e7ec] rounded-xl p-2 text-xs flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-[#101828] truncate">{p.nome}</p>
                    <span className="text-[10px] text-[#667085]">
                      {p.quantidade} {p.unidade || 'UN'} • Cód: {p.codigo}
                    </span>
                  </div>
                  <span className="font-black text-[#101828] shrink-0 font-mono">
                    R$ {Number(p.precoUnitario || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Serviços e Mão de Obra */}
          <div className="border border-[#e4e7ec] rounded-2xl p-3 bg-[#fcfcfd]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#101828] flex items-center gap-1.5">
                <Wrench size={15} weight="bold" className="text-[#0284c7]" />
                Serviços na OS ({osAtiva?.servicosOS?.length || 0})
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('servicos')}
                className="text-[11px] font-bold text-[#0284c7] hover:underline"
              >
                + Lançar Serviço
              </button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
              {osAtiva?.servicosOS?.map((s, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#e4e7ec] rounded-xl p-2 text-xs flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-[#101828] truncate">{s.nome}</p>
                    <span className="text-[10px] text-[#667085]">
                      {s.tempoHoras ? `${s.tempoHoras}h` : 'Mão de obra'} • Cód: {s.codigo}
                    </span>
                  </div>
                  <span className="font-black text-[#101828] shrink-0 font-mono">
                    R$ {Number(s.precoUnitario || s.valorUnitario || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Coluna 2: Ações Rápidas, Requisições e Agenda */}
      <div className="space-y-4">
        {/* Ações Técnicas Imediatas */}
        <div className="border border-[#e4e7ec] rounded-2xl p-3.5 bg-white space-y-2">
          <h4 className="text-xs font-extrabold text-[#101828] uppercase tracking-wider">
            Ações na Bancada
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className="p-2.5 rounded-xl border border-[#d0d5dd] hover:bg-[#f8fafc] text-[#101828] text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 text-center"
            >
              <CheckSquareOffset size={20} weight="bold" className="text-[#0284c7]" />
              <span>Fazer Checklist</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('diagnostico')}
              className="p-2.5 rounded-xl border border-[#d0d5dd] hover:bg-[#f8fafc] text-[#101828] text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 text-center"
            >
              <MagnifyingGlassPlus size={20} weight="bold" className="text-[#0284c7]" />
              <span>Editar Laudo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pedir-pecas')}
              className="p-2.5 rounded-xl border border-[#d0d5dd] hover:bg-[#f8fafc] text-[#101828] text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 text-center"
            >
              <ShoppingCart size={20} weight="bold" className="text-[#0284c7]" />
              <span>Pedir Peça</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pecas-danificadas')}
              className="p-2.5 rounded-xl border border-[#d0d5dd] hover:bg-[#f8fafc] text-[#101828] text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 text-center"
            >
              <WarningOctagon size={20} weight="bold" className="text-amber-600" />
              <span>Peça Danificada</span>
            </button>
          </div>
        </div>

        {/* Requisições Recentes de Peças */}
        <div className="border border-[#e4e7ec] rounded-2xl p-3.5 bg-[#f8fafc]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-[#101828] uppercase tracking-wider">
              Requisições ao Almoxarifado
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#101828] text-white">
              {requisicoesPecas.length}
            </span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {requisicoesPecas.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-[#e4e7ec] rounded-xl p-2.5 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#101828]">{req.pecaNome}</span>
                  <span className="px-2 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                    {req.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#667085]">
                  <span>Qtd: {req.quantidade} un • OS #{req.numeroOS}</span>
                  <span>{req.dataHora}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agenda de Horários Hoje */}
        <div className="border border-[#e4e7ec] rounded-2xl p-3.5 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-[#101828] uppercase tracking-wider">
              Minha Escala Hoje
            </span>
            <CalendarDots size={16} weight="bold" className="text-[#0284c7]" />
          </div>
          <div className="space-y-1.5 text-xs">
            {AGENDA_DO_DIA.length === 0 && (
              <p className="text-[11px] text-[#667085]">Nenhum atendimento programado para hoje.</p>
            )}
            {AGENDA_DO_DIA.slice(0, 3).map((ag, i) => (
              <div
                key={i}
                className="p-2 rounded-xl bg-[#f8fafc] border border-[#e4e7ec] flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-[#101828] block">{ag.horario}</span>
                  <span className="text-[11px] text-[#475467] truncate block max-w-[180px]">
                    {ag.veiculo}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-sky-50 text-[#0284c7] shrink-0">
                  {ag.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
