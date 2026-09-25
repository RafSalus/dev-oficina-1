import React from 'react'
import {
  Car,
  User,
  Package,
  Wrench,
  Users,
  MapPin,
  Clock,
  Gauge,
  Play,
  CheckCircle,
  Eye,
  WhatsappLogo,
  Trash,
} from '@phosphor-icons/react'
import { GoogleMapsIcon } from '../../../../../components/icons/GoogleMapsIcon'
import { gerarLinkGoogleMapsTrajeto } from '../../../../../utils/googleMapsRouting'

export function DeslocamentoCardMobile({
  deslocamento,
  onIniciar,
  onFinalizar,
  onDetalhes,
  onExcluir,
}) {
  const foneLimpo = (deslocamento.clienteTelefone || deslocamento.fornecedorTelefone || '').replace(/\D/g, '')

  const mapsUrl = gerarLinkGoogleMapsTrajeto({
    origem: deslocamento.enderecoOrigem,
    destino: deslocamento.enderecoDestino,
    retornarOficina: deslocamento.tipoTrajeto === 'ida_e_volta' || deslocamento.retornarOficina !== false,
  })

  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-2xs p-3.5 space-y-2.5">
      {/* Topo do Card */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-[#f2f4f7] border border-[#e4e7ec] text-[#101828]">
            {deslocamento.codigo}
          </span>
          <span className="text-[11px] font-semibold text-slate-500">{deslocamento.data}</span>
        </div>

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
            ? 'Em Rota'
            : 'Agendado'}
        </span>
      </div>

      {/* Tipo de Missão e Título */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#101828]">
          {deslocamento.tipoServico === 'busca_veiculo' && <Car size={15} className="text-sky-600" />}
          {deslocamento.tipoServico === 'entrega_veiculo' && <Car size={15} className="text-sky-600" />}
          {deslocamento.tipoServico === 'translado_cliente' && <User size={15} className="text-sky-600" />}
          {deslocamento.tipoServico === 'busca_pecas' && <Package size={15} className="text-sky-600" />}
          {deslocamento.tipoServico === 'socorro_externo' && <Wrench size={15} className="text-sky-600" />}
          <span>
            {deslocamento.tipoServico === 'busca_veiculo'
              ? 'Busca de Veículo'
              : deslocamento.tipoServico === 'entrega_veiculo'
              ? 'Entrega de Veículo'
              : deslocamento.tipoServico === 'translado_cliente'
              ? 'Leva e Traz de Cliente'
              : deslocamento.tipoServico === 'busca_pecas'
              ? 'Coleta de Peças'
              : 'Socorro Externo'}
          </span>
        </div>

        {/* Cliente / Fornecedor / Veículo */}
        <h4 className="text-sm font-extrabold text-[#101828] mt-1 leading-snug">
          {deslocamento.clienteNome || deslocamento.fornecedorNome || 'Destino Operacional'}
        </h4>

        {deslocamento.veiculoPlaca && (
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            <span className="font-mono font-bold text-slate-800">{deslocamento.veiculoPlaca}</span> •{' '}
            {deslocamento.veiculoModelo}
          </p>
        )}

        {deslocamento.pecasDescricao && (
          <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-1">
            {deslocamento.pecasDescricao}
          </p>
        )}
      </div>

      {/* Equipe e Apoio */}
      <div className="bg-slate-50 rounded-xl p-2.5 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Users size={14} className="text-slate-500" />
            <span className="font-semibold">{deslocamento.motoristaPrincipalNome}</span>
            {deslocamento.auxiliarNome && (
              <span className="text-slate-500">+ {deslocamento.auxiliarNome}</span>
            )}
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
            {deslocamento.quantidadeFuncionarios === 2 ? '2 Funcs' : '1 Func'}
          </span>
        </div>

        {deslocamento.veiculoApoioNome && (
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Car size={13} className="text-slate-400" />
            <span>Apoio: {deslocamento.veiculoApoioNome}</span>
          </div>
        )}
      </div>

      {/* Rota, Endereço e GPS */}
      <div className="border border-slate-200 rounded-xl p-2.5 space-y-2">
        <div className="flex items-start gap-1.5">
          <MapPin size={14} className="text-sky-600 shrink-0 mt-0.5" />
          <span className="text-xs text-slate-800 font-medium leading-tight line-clamp-2">
            {deslocamento.enderecoDestino || 'Oficina Gabriel'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <Clock size={13} />
            <span>Saída: {deslocamento.horarioSaidaReal || deslocamento.horarioSaidaPrevisto}</span>
          </div>
          <div className="flex items-center gap-1 font-mono font-bold text-slate-700">
            <Gauge size={13} />
            <span>{deslocamento.kmRealizado ? `${deslocamento.kmRealizado} km` : `${deslocamento.kmEstimado || '—'} km`}</span>
          </div>
        </div>

        {/* Botão de Abrir no Google Maps */}
        {deslocamento.enderecoDestino && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-8.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <GoogleMapsIcon className="w-3.5 h-3.5" />
            <span>Navegar no Google Maps</span>
          </a>
        )}
      </div>

      {/* Ações Mobile */}
      <div className="grid grid-cols-3 gap-1.5 pt-1">
        {deslocamento.status === 'agendado' && (
          <button
            type="button"
            onClick={() => onIniciar(deslocamento)}
            className="h-10 rounded-xl bg-[#101828] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
          >
            <Play size={13} weight="fill" />
            <span>Iniciar</span>
          </button>
        )}

        {deslocamento.status === 'em_deslocamento' && (
          <button
            type="button"
            onClick={() => onFinalizar(deslocamento)}
            className="h-10 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
          >
            <CheckCircle size={14} weight="bold" />
            <span>Concluir</span>
          </button>
        )}

        {deslocamento.status === 'concluido' && (
          <div className="h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center gap-1">
            <CheckCircle size={14} />
            <span>Concluído</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => onDetalhes(deslocamento)}
          className="h-10 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
        >
          <Eye size={14} />
          <span>Ficha</span>
        </button>

        {foneLimpo ? (
          <a
            href={`https://wa.me/55${foneLimpo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
          >
            <WhatsappLogo size={14} weight="fill" />
            <span>WhatsApp</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => onExcluir(deslocamento)}
            className="h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
          >
            <Trash size={14} />
            <span>Excluir</span>
          </button>
        )}
      </div>
    </div>
  )
}
