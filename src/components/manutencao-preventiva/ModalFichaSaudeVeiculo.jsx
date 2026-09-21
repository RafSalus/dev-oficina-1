import React, { useState } from 'react'
import {
  ShieldCheck,
  WarningCircle,
  Clock,
  CheckCircle,
  Gauge,
  CalendarBlank,
  User,
  WhatsappLogo,
  ClipboardText,
  PencilSimple,
  Printer,
  FileText,
  SealCheck,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { formatarTelefone } from '../../utils/fiscalValidators'

export function ModalFichaSaudeVeiculo({
  isOpen,
  onClose,
  saudeVeiculo,
  onAtualizarKm,
  onGerarOrdemServico,
}) {
  const [filtroItens, setFiltroItens] = useState('todos')

  if (!isOpen || !saudeVeiculo) return null

  const { veiculo, healthScore, itensAvaliados, receitaPotencialTotal, itensVencidos, itensAtencao, temGarantiaPendente } = saudeVeiculo
  const foneLimpo = (veiculo.clienteTelefone || '').replace(/\D/g, '')

  // Filtragem dos itens na visualização interna da ficha
  const itensExibidos = itensAvaliados.filter((item) => {
    if (filtroItens === 'vencidos') return item.status === 'vencido'
    if (filtroItens === 'atencao') return item.status === 'atencao'
    if (filtroItens === 'garantia') return item.id === 'revisao_garantia' || item.garantiaPendente
    return true
  })

  // Disparo de mensagem personalizada via WhatsApp
  const handleEnviarWhatsApp = () => {
    if (!foneLimpo) return

    const vencidos = itensAvaliados.filter((i) => i.status === 'vencido')
    const emAtencao = itensAvaliados.filter((i) => i.status === 'atencao')
    const garantia = itensAvaliados.find((i) => i.id === 'revisao_garantia' && (i.status === 'vencido' || i.status === 'atencao'))

    let listaTexto = ''
    if (vencidos.length > 0) {
      listaTexto += `\n*Itens com revisão recomendada vencida:*\n`
      vencidos.forEach((v) => {
        listaTexto += `• ${v.nome} (${v.motivoAlerta})\n`
      })
    }
    if (emAtencao.length > 0) {
      listaTexto += `\n*Itens que vencem nos próximos dias / km:*\n`
      emAtencao.forEach((a) => {
        listaTexto += `• ${a.nome} (${a.motivoAlerta})\n`
      })
    }
    if (garantia) {
      listaTexto += `\n*Aviso de Garantia:* A revisão de garantia do seu veículo (${garantia.servicoOrigem || 'serviço anterior'}) precisa ser realizada até *${garantia.proximaRecomendadaData}* para manter a garantia ativa!\n`
    }

    const mensagem =
      `Olá, *${veiculo.clienteNome}*! Tudo bem?\n\n` +
      `Aqui é da *Mecânica Gabriel*. No nosso sistema de saúde preventiva e cuidado com o seu veículo (*${veiculo.marcaModelo || veiculo.modelo}* - Placa: *${veiculo.placa}*, KM atual: *${veiculo.kmPadrao || veiculo.kmAtual}*), identificamos os seguintes pontos de atenção preventiva:` +
      `${listaTexto}\n` +
      `Gostaria de agendar um horário para cuidarmos do seu carro? Temos serviço de leva e traz disponível e facilitamos o pagamento em até 10x sem juros!`

    const url = `https://wa.me/55${foneLimpo}?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank')
  }

  const handleImprimir = () => {
    window.print()
  }

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      chaveStorage="modal_redimensionavel_ficha_saude_veiculo"
      larguraPadrao={980}
      alturaPadrao={700}
      larguraMinima={680}
      alturaMinima={480}
      larguraMaxima={1360}
      alturaMaxima={920}
      titulo="Prontuário de Saúde Preventiva do Veículo"
      subtitulo={`${veiculo.placa} - ${veiculo.marcaModelo || veiculo.modelo} (${veiculo.ano || 'Ano N/I'})`}
      badge="Saúde da Frota"
      icone={ShieldCheck}
      rodape={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAtualizarKm(veiculo)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
            >
              <Gauge size={15} />
              <span>Atualizar KM</span>
            </button>
            <button
              type="button"
              onClick={handleImprimir}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
            >
              <Printer size={15} />
              <span>Imprimir Ficha</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {foneLimpo && (
              <button
                type="button"
                onClick={handleEnviarWhatsApp}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <WhatsappLogo size={16} weight="fill" />
                <span>Notificar via WhatsApp</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const itensAlerta = itensAvaliados.filter((i) => i.status !== 'em_dia')
                onGerarOrdemServico(
                  veiculo,
                  itensAlerta.length > 0 ? itensAlerta : itensAvaliados.slice(0, 3)
                )
                onClose?.()
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <ClipboardText size={16} weight="bold" />
              <span>Gerar Orçamento / Abrir OS</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="flex-1 min-h-0 flex flex-col space-y-3.5 pb-1">
        {/* Bloco Superior: Identificação e Pontuação de Saúde */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm px-2.5 py-0.5 rounded bg-[#101828] text-white">
                {veiculo.placa}
              </span>
              <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                {veiculo.combustivel || 'FLEX'}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {veiculo.cor} • {veiculo.ano}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              {veiculo.marcaModelo || veiculo.modelo}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <User size={14} className="text-sky-600" />
              <span>
                Cliente: <strong className="text-slate-900">{veiculo.clienteNome}</strong>
              </span>
              {veiculo.clienteTelefone && (
                <span className="text-slate-400">({formatarTelefone(veiculo.clienteTelefone)})</span>
              )}
            </div>
          </div>

          {/* Termômetro de Saúde e Receita Potencial */}
          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
            <div className="text-center min-w-[100px]">
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl font-black text-xl font-mono shadow-2xs ${
                  healthScore >= 80
                    ? 'bg-sky-50 text-sky-700 border-2 border-sky-300'
                    : healthScore >= 50
                    ? 'bg-amber-50 text-amber-800 border-2 border-amber-300'
                    : 'bg-[#101828] text-white border-2 border-slate-800'
                }`}
              >
                {healthScore}%
              </div>
              <span className="text-[10.5px] font-bold text-slate-600 block mt-1 uppercase tracking-wider">
                {healthScore >= 80 ? 'Saúde Ótima' : healthScore >= 50 ? 'Atenção' : 'Crítico'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="bg-white border border-slate-200 rounded-xl p-2.5 min-w-[150px]">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Hodômetro Atual
                </span>
                <span className="font-mono text-base font-extrabold text-slate-900">
                  {veiculo.kmPadrao || veiculo.kmAtual || '0'} km
                </span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-2.5 min-w-[150px]">
                <span className="text-[10px] text-sky-700 font-bold uppercase tracking-wider block">
                  Oportunidade Oficina
                </span>
                <span className="font-mono text-sm font-extrabold text-sky-900">
                  R$ {receitaPotencialTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerta de Garantia Pendente se houver */}
        {temGarantiaPendente && (
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-3 shrink-0">
            <SealCheck size={22} className="text-sky-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-sky-950 font-bold block">
                Revisão Obrigatória de Retorno para Manutenção de Garantia
              </strong>
              <p className="text-sky-800 mt-0.5">
                Este veículo possui garantia ativa de serviço anterior que requer conferência e reaperto na oficina.
                Entre em contato com o cliente para agendamento e preservação da garantia.
              </p>
            </div>
          </div>
        )}

        {/* Filtros de Visualização dos Itens */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFiltroItens('todos')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                filtroItens === 'todos'
                  ? 'bg-[#101828] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos os Itens ({itensAvaliados.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroItens('vencidos')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                filtroItens === 'vencidos'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              Vencidos ({itensVencidos})
            </button>
            <button
              type="button"
              onClick={() => setFiltroItens('atencao')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                filtroItens === 'atencao'
                  ? 'bg-sky-600 text-white'
                  : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
              }`}
            >
              Em Atenção ({itensAtencao})
            </button>
            <button
              type="button"
              onClick={() => setFiltroItens('garantia')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                filtroItens === 'garantia'
                  ? 'bg-sky-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Garantia
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            {itensExibidos.length} de {itensAvaliados.length} sistemas rastreados
          </span>
        </div>

        {/* Grade de Itens e Sistemas Rastreados - Ocupa todo o espaço e se expande dinamicamente com o redimensionamento */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-1 pb-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 pb-2">
            {itensExibidos.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl border p-4 flex flex-col justify-between space-y-3 transition-all shadow-2xs hover:shadow-xs ${
                  item.status === 'vencido'
                    ? 'border-amber-300 bg-amber-50/20'
                    : item.status === 'atencao'
                    ? 'border-sky-300 bg-sky-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                    {item.categoria}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5">{item.nome}</h4>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    item.status === 'vencido'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : item.status === 'atencao'
                      ? 'bg-sky-100 text-sky-800 border border-sky-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {item.status === 'vencido'
                    ? 'Revisão Vencida'
                    : item.status === 'atencao'
                    ? 'Vence em Breve'
                    : 'Em Dia'}
                </span>
              </div>

              {/* Status do Diagnóstico */}
              <p
                className={`text-[11px] font-medium ${
                  item.status === 'vencido'
                    ? 'text-amber-800 font-bold'
                    : item.status === 'atencao'
                    ? 'text-sky-800 font-semibold'
                    : 'text-slate-500'
                }`}
              >
                {item.motivoAlerta}
              </p>

              {/* Dados de Troca: Última x Próxima */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-lg p-2 text-[11px] border border-slate-100">
                <div>
                  <span className="text-slate-600 block text-[10px]">Última Realização:</span>
                  <strong className="text-slate-800 font-mono">
                    {item.ultimaExecucaoKm ? `${item.ultimaExecucaoKm.toLocaleString('pt-BR')} km` : '—'}
                  </strong>
                  <span className="text-slate-500 block text-[10px]">{item.ultimaExecucaoData}</span>
                </div>

                <div>
                  <span className="text-slate-600 block text-[10px]">Próximo Vencimento:</span>
                  <strong
                    className={`font-mono ${
                      item.status === 'vencido' ? 'text-amber-800 font-extrabold' : 'text-slate-900'
                    }`}
                  >
                    {item.proximaRecomendadaKm.toLocaleString('pt-BR')} km
                  </strong>
                  <span className="text-slate-500 block text-[10px]">{item.proximaRecomendadaData}</span>
                </div>
              </div>

              {/* Rodapé do Card do Item - Previsão orçamentária e tempo técnico estimado */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Previsão no Orçamento:</span>
                  <strong className="text-slate-900 font-bold font-mono">
                    {item.valorEstimadoMedio > 0
                      ? `R$ ${item.valorEstimadoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : 'Inspeção / Cortesia'}
                  </strong>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-semibold">Tempo Técnico:</span>
                  <span className="font-semibold text-slate-700 text-[11px] font-mono">
                    ~{item.tempoEstimadoMinutos || 30} min
                  </span>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </ModalRedimensionavel>
  )
}
