import { useState, useMemo } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { CATALOGO_SERVICOS_TABELA } from '../../../constants/catalogoPecasServicos'
import { salvarOrdemAberta } from '../../dashboard/orcamento/mockOrdensAbertas'
import { toast } from 'sonner'

export function MecanicoServicos({ osAtiva, mecanicoNome, recarregarOrdens }) {
  const [buscaServico, setBuscaServico] = useState('')

  const servicosFiltrados = useMemo(() => {
    return CATALOGO_SERVICOS_TABELA.filter((s) => {
      return (
        !buscaServico ||
        s.nome.toLowerCase().includes(buscaServico.toLowerCase()) ||
        s.codigo.toLowerCase().includes(buscaServico.toLowerCase())
      )
    })
  }, [buscaServico])

  const handleLancarServico = (serv) => {
    if (!osAtiva) {
      toast.error('Selecione uma Ordem de Serviço ativa primeiro.')
      return
    }

    const novoServico = {
      codigo: serv.codigo,
      nome: serv.nome,
      unidade: 'MO',
      quantidade: 1,
      precoUnitario: serv.precoPadrao || serv.valorUnitario || 0,
      desconto: 0,
      tempoHoras: serv.tempoEstimado || '1.0',
      mecanicoNome,
    }

    const servicosAtuais = osAtiva.servicosOS || []
    const atualizados = [...servicosAtuais, novoServico]
    salvarOrdemAberta({
      ...osAtiva,
      servicosOS: atualizados,
    })
    recarregarOrdens()
    toast.success(`Serviço "${serv.nome}" vinculado à OS #${osAtiva.numeroOS}!`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-[#101828]">
            Tabela de Serviços e Mão de Obra da Oficina
          </h3>
          <p className="text-xs text-[#667085]">
            Lançamento de mão de obra direta para a OS #{osAtiva?.numeroOS} ({osAtiva?.marcaModelo}).
          </p>
        </div>
        <div className="w-64 relative">
          <MagnifyingGlass
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
          />
          <input
            type="text"
            value={buscaServico}
            onChange={(e) => setBuscaServico(e.target.value)}
            placeholder="Buscar serviço..."
            className="w-full h-8.5 pl-8 pr-3 bg-white border border-[#d0d5dd] rounded-xl text-xs text-[#101828]"
          />
        </div>
      </div>

      <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden bg-white">
        <div className="bg-[#f8fafc] px-4 py-2.5 grid grid-cols-12 gap-3 text-[11px] font-bold uppercase tracking-wider text-[#667085]">
          <div className="col-span-2">Código</div>
          <div className="col-span-6">Descrição do Serviço</div>
          <div className="col-span-2 text-center">Tempo Padrão</div>
          <div className="col-span-1 text-right">Valor</div>
          <div className="col-span-1 text-right">Ação</div>
        </div>

        <div className="divide-y divide-[#f2f4f7] max-h-[450px] overflow-y-auto no-scrollbar">
          {servicosFiltrados.map((serv) => (
            <div
              key={serv.codigo}
              className="px-4 py-2.5 grid grid-cols-12 gap-3 items-center text-xs hover:bg-[#f8fafc]"
            >
              <div className="col-span-2 font-mono font-bold text-[#101828]">
                {serv.codigo}
              </div>
              <div className="col-span-6 font-semibold text-[#101828]">
                {serv.nome}
              </div>
              <div className="col-span-2 text-center text-[#667085]">
                {serv.tempoEstimado || '1.0'} hora(s)
              </div>
              <div className="col-span-1 text-right font-black font-mono text-[#101828]">
                R$ {Number(serv.precoPadrao || serv.valorUnitario || 0).toFixed(2)}
              </div>
              <div className="col-span-1 text-right">
                <button
                  type="button"
                  onClick={() => handleLancarServico(serv)}
                  className="px-2.5 py-1 bg-[#101828] hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer active:scale-95 transition-all"
                >
                  Lançar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
