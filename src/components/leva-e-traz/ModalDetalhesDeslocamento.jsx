import React from 'react'
import {
  ArrowsLeftRight,
  Car,
  User,
  Package,
  Wrench,
  Users,
  MapPin,
  CalendarBlank,
  Clock,
  Gauge,
  WhatsappLogo,
  Printer,
  ShieldCheck,
  CheckCircle,
  ClockCounterClockwise,
} from '@phosphor-icons/react'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { formatarTelefone } from '../../utils/fiscalValidators'
import { GoogleMapsIcon } from '../icons/GoogleMapsIcon'
import { gerarLinkGoogleMapsTrajeto } from '../../utils/googleMapsRouting'

export function ModalDetalhesDeslocamento({ isOpen, onClose, deslocamento }) {
  if (!isOpen || !deslocamento) return null

  const foneLimpo = (deslocamento.clienteTelefone || deslocamento.fornecedorTelefone || '').replace(/\D/g, '')

  const mapsUrl = gerarLinkGoogleMapsTrajeto({
    origem: deslocamento.enderecoOrigem,
    destino: deslocamento.enderecoDestino,
    retornarOficina: deslocamento.tipoTrajeto === 'ida_e_volta' || deslocamento.retornarOficina !== false,
  })

  const handleImprimir = () => {
    window.print()
  }

  const handleEnviarWhatsApp = () => {
    if (!foneLimpo) return

    let mensagem = ''
    if (deslocamento.tipoServico === 'busca_veiculo') {
      mensagem = `Olá, *${deslocamento.clienteNome}*! Aqui é da *Mecânica Gabriel*.\nNosso motorista *${deslocamento.motoristaPrincipalNome}* está a caminho para buscar seu veículo (*${deslocamento.veiculoModelo || ''}* - Placa: *${deslocamento.veiculoPlaca || ''}*).\nPrevisão de chegada no local: *${deslocamento.horarioSaidaPrevisto}*. Qualquer dúvida estamos à disposição!`
    } else if (deslocamento.tipoServico === 'entrega_veiculo') {
      mensagem = `Olá, *${deslocamento.clienteNome}*! Seu veículo (*${deslocamento.veiculoModelo || ''}* - Placa: *${deslocamento.veiculoPlaca || ''}*) está pronto e a caminho para entrega.\nMotorista responsável: *${deslocamento.motoristaPrincipalNome}*.`
    } else if (deslocamento.tipoServico === 'translado_cliente') {
      mensagem = `Olá, *${deslocamento.clienteNome}*! Nosso motorista *${deslocamento.motoristaPrincipalNome}* está a caminho para seu translado / leva e traz da *Mecânica Gabriel*.`
    } else {
      mensagem = `Olá! Contato da logística da Mecânica Gabriel referente ao atendimento #${deslocamento.codigo}.`
    }

    const url = `https://wa.me/55${foneLimpo}?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank')
  }

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      chaveStorage="modal_redimensionavel_detalhes_deslocamento"
      larguraPadrao={760}
      alturaPadrao={600}
      larguraMinima={500}
      alturaMinima={400}
      titulo="Ficha de Deslocamento e Rota"
      subtitulo={`Atendimento #${deslocamento.codigo} - ${deslocamento.data}`}
      badge="Ordem de Logística"
      icone={ArrowsLeftRight}
      rodape={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-sky-600" />
            <span>Registro operacional rastreado pela central da oficina</span>
          </div>
          <div className="flex items-center gap-2">
            {deslocamento.enderecoDestino && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-slate-300 shadow-2xs"
                title="Abrir rota no Google Maps e iniciar navegação GPS"
              >
                <GoogleMapsIcon size={16} />
                <span>Google Maps</span>
              </a>
            )}
            {foneLimpo && (
              <button
                type="button"
                onClick={handleEnviarWhatsApp}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <WhatsappLogo size={15} weight="fill" />
                <span>Notificar WhatsApp</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleImprimir}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-300 shadow-2xs"
            >
              <Printer size={15} />
              <span>Imprimir Ordem</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              Fechar
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pb-2">
        {/* Cabeçalho do Atendimento */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded">
                #{deslocamento.codigo}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  deslocamento.status === 'concluido'
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : deslocamento.status === 'em_deslocamento'
                    ? 'bg-[#101828] text-white'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {deslocamento.status === 'concluido'
                  ? 'Concluído'
                  : deslocamento.status === 'em_deslocamento'
                  ? 'Em Rota e Deslocamento'
                  : 'Agendado na Fila'}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {deslocamento.data}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              {deslocamento.tipoServico === 'busca_veiculo'
                ? 'Busca de Veículo de Cliente'
                : deslocamento.tipoServico === 'entrega_veiculo'
                ? 'Entrega de Veículo de Cliente'
                : deslocamento.tipoServico === 'translado_cliente'
                ? 'Leva e Traz de Cliente (Carona e Translado)'
                : deslocamento.tipoServico === 'busca_pecas'
                ? 'Busca e Coleta de Peças em Fornecedor'
                : 'Socorro Mecânico Externo'}
            </h3>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
            <span className="text-[11px] text-slate-500 block">Tipo de Cobrança</span>
            <span className="text-xs font-bold text-slate-900">
              {deslocamento.tipoCobranca === 'cortesia'
                ? 'Cortesia da Oficina Gabriel'
                : `R$ ${Number(deslocamento.valorTaxa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        {/* Bloco 1: Detalhes do Cliente ou Peças */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            {deslocamento.tipoServico === 'busca_pecas' ? (
              <Package size={14} className="text-sky-600" />
            ) : (
              <User size={14} className="text-sky-600" />
            )}
            <span>
              {deslocamento.tipoServico === 'busca_pecas'
                ? 'Dados do Fornecedor e Peças'
                : 'Dados do Cliente e Veículo'}
            </span>
          </h4>

          {deslocamento.tipoServico === 'busca_pecas' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Fornecedor / Loja:</span>
                <strong className="text-slate-900">{deslocamento.fornecedorNome || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Telefone:</span>
                <strong className="text-slate-900">{formatarTelefone(deslocamento.fornecedorTelefone) || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">OS Vinculada:</span>
                <strong className="text-slate-900">{deslocamento.numeroOS ? `OS #${deslocamento.numeroOS}` : 'Sem OS direta'}</strong>
              </div>
              <div className="col-span-2 sm:col-span-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-semibold mb-0.5">Descrição das Peças / Insumos:</span>
                <span className="text-slate-800 font-medium">{deslocamento.pecasDescricao || 'Peças diversas'}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Cliente Proprietário:</span>
                <strong className="text-slate-900">{deslocamento.clienteNome || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Telefone:</span>
                <strong className="text-slate-900">{formatarTelefone(deslocamento.clienteTelefone) || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">OS da Oficina:</span>
                <strong className="text-slate-900">{deslocamento.numeroOS ? `OS #${deslocamento.numeroOS}` : 'Sem OS direta'}</strong>
              </div>
              {deslocamento.veiculoPlaca && (
                <div className="col-span-2 sm:col-span-3 flex items-center gap-2 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="font-mono font-bold text-xs bg-white text-slate-900 border border-slate-300 px-2 py-0.5 rounded">
                    {deslocamento.veiculoPlaca}
                  </span>
                  <span className="font-semibold text-slate-800">{deslocamento.veiculoModelo}</span>
                  {deslocamento.levarClienteEmbora && (
                    <span className="ml-auto text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      Translado / Carona Ativa
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bloco 2: Equipe e Veículo de Apoio */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Users size={14} className="text-sky-600" />
            <span>Equipe Escala e Veículo de Apoio</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Formato da Equipe:</span>
              <strong className="text-slate-900">
                {deslocamento.quantidadeFuncionarios === 2
                  ? '2 Funcionários (Apoio de Retorno)'
                  : '1 Funcionário (Individual)'}
              </strong>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Motorista Principal:</span>
              <strong className="text-slate-900">{deslocamento.motoristaPrincipalNome}</strong>
              {deslocamento.auxiliarNome && (
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Auxiliar: <strong>{deslocamento.auxiliarNome}</strong>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Veículo de Apoio da Oficina:</span>
              <strong className="text-slate-900">{deslocamento.veiculoApoioNome || 'Não informado'}</strong>
            </div>
          </div>
        </div>

        {/* Bloco 3: Rota, Prazos e Quilometragem */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={14} className="text-sky-600" />
            <span>Rota, Prazos e Deslocamento</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Origem:</span>
              <span className="text-slate-800 font-medium">{deslocamento.enderecoOrigem || 'Oficina Gabriel'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Destino:</span>
              <span className="text-slate-900 font-bold">{deslocamento.enderecoDestino || '—'}</span>
            </div>
          </div>

          {/* Navegação Direta via Google Maps */}
          {deslocamento.enderecoDestino && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-sky-50 border border-sky-200 rounded-lg">
              <div className="flex items-center gap-2.5">
                <GoogleMapsIcon size={22} />
                <div>
                  <p className="text-xs font-bold text-sky-950">Trajeto e Navegação GPS</p>
                  <p className="text-[11px] text-sky-800">
                    Modo: {deslocamento.tipoTrajeto === 'somente_ida' ? 'Somente Ida' : 'Circuito Ida e Volta (Retorno à Oficina)'}
                  </p>
                </div>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-sky-100/60 active:bg-sky-200 text-sky-900 text-xs font-bold rounded-lg border border-sky-300 shadow-2xs transition-colors"
              >
                <GoogleMapsIcon size={16} />
                <span>Iniciar no Google Maps</span>
              </a>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Horário de Saída</span>
              <strong className="text-slate-900">
                {deslocamento.horarioSaidaReal || deslocamento.horarioSaidaPrevisto || '—'}
              </strong>
            </div>

            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Horário de Retorno</span>
              <strong className="text-slate-900">
                {deslocamento.horarioRetornoReal || deslocamento.horarioRetornoPrevisto || 'Em andamento'}
              </strong>
            </div>

            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Duração</span>
              <strong className="text-sky-700">
                {deslocamento.tempoRealMinutos
                  ? `${deslocamento.tempoRealMinutos} min`
                  : `${deslocamento.tempoEstimadoMinutos || 45} min (est)`}
              </strong>
            </div>

            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Distância Total</span>
              <strong className="text-slate-900">
                {deslocamento.kmRealizado
                  ? `${deslocamento.kmRealizado} km`
                  : `${deslocamento.kmEstimado || '—'} km`}
              </strong>
            </div>
          </div>

          {deslocamento.observacoes && (
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 mt-2">
              <strong className="block text-[11px] uppercase tracking-wider text-slate-800 mb-0.5">
                Observações Operacionais:
              </strong>
              {deslocamento.observacoes}
            </div>
          )}
        </div>
      </div>
    </ModalRedimensionavel>
  )
}
