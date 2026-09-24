import React from 'react'
import { Archive, CreditCard, ShieldCheck, Receipt, Package, Wrench } from '@phosphor-icons/react'
import { formatMoeda } from '../../../utils/ordemServico/osMensagens'

function Indicador({ rotulo, rotuloCor = 'text-[#667085]', valor, valorCor = 'text-[#101828]', icone, iconeCor }) {
  return (
    <div className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 shadow-2xs flex items-center justify-between">
      <div>
        <span className={`text-[10px] font-bold ${rotuloCor} uppercase tracking-wider block`}>{rotulo}</span>
        <span className={`text-base font-black ${valorCor} mt-0.5 block`}>{valor}</span>
      </div>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconeCor}`}>{icone}</div>
    </div>
  )
}

/**
 * Indicadores das OS arquivadas: volume, faturamento, garantias, ticket médio, peças e mão de obra.
 * @param {{metricas: object}} props - Resultado de `calcularMetricasFinalizadas()`.
 */
export function OSMetricasArquivo({ metricas }) {
  return (
    <section className="shrink-0 grid grid-cols-6 gap-2">
      <Indicador
        rotulo="OS no Arquivo"
        valor={`${metricas.total} ordens`}
        icone={<Archive size={17} weight="bold" />}
        iconeCor="bg-[#101828] text-[#0284c7]"
      />
      <Indicador
        rotulo="Faturamento Concluído"
        rotuloCor="text-[#0369a1]"
        valor={`R$ ${formatMoeda(metricas.somaValorTotal)}`}
        valorCor="text-[#0284c7]"
        icone={<CreditCard size={17} weight="bold" />}
        iconeCor="bg-[#e0f2fe] text-[#0284c7]"
      />
      <Indicador
        rotulo="Garantias Ativas"
        rotuloCor="text-[#101828]"
        valor={`${metricas.garantiasAtivas} veículos`}
        icone={<ShieldCheck size={17} weight="bold" />}
        iconeCor="bg-[#f2f4f7] text-[#101828]"
      />
      <Indicador
        rotulo="Ticket Médio"
        valor={`R$ ${formatMoeda(metricas.ticketMedio)}`}
        icone={<Receipt size={17} weight="bold" />}
        iconeCor="bg-[#f2f4f7] text-[#475467]"
      />
      <Indicador
        rotulo="Peças Faturadas"
        valor={`R$ ${formatMoeda(metricas.somaPecas)}`}
        icone={<Package size={17} weight="bold" />}
        iconeCor="bg-[#f2f4f7] text-[#475467]"
      />
      <Indicador
        rotulo="Mão de Obra Faturada"
        valor={`R$ ${formatMoeda(metricas.somaServicos)}`}
        icone={<Wrench size={17} weight="bold" />}
        iconeCor="bg-[#f2f4f7] text-[#475467]"
      />
    </section>
  )
}
