import { useState, useEffect } from 'react'
import { FloppyDisk } from '@phosphor-icons/react'
import { salvarOrdemAberta } from '../../dashboard/orcamento/mockOrdensAbertas'
import { CATEGORIAS_PROBLEMAS } from '../../../constants/problemasDiagnostico'
import { toast } from 'sonner'

export function MecanicoDiagnosticoView({ osAtiva, recarregarOrdens }) {
  const [textoLaudo, setTextoLaudo] = useState(osAtiva?.laudoTecnico || '')

  useEffect(() => {
    setTextoLaudo(osAtiva?.laudoTecnico || '')
  }, [osAtiva?.numeroOS])

  const handleSalvarLaudo = () => {
    if (!osAtiva) return
    salvarOrdemAberta({
      ...osAtiva,
      laudoTecnico: textoLaudo,
    })
    recarregarOrdens()
    toast.success('Laudo técnico salvo na Ordem de Serviço!')
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-[#101828]">
            Laudo Técnico da OS #{osAtiva?.numeroOS} - {osAtiva?.marcaModelo}
          </h4>
          <button
            type="button"
            onClick={handleSalvarLaudo}
            className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <FloppyDisk size={16} weight="bold" />
            <span>Salvar Laudo Técnico</span>
          </button>
        </div>

        <textarea
          value={textoLaudo}
          onChange={(e) => setTextoLaudo(e.target.value)}
          rows={6}
          placeholder="Descreva detalhadamente o parecer técnico, falhas encontradas nos testes de bancada e recomendações de serviço..."
          className="w-full p-3 bg-white border border-[#d0d5dd] rounded-xl text-xs text-[#101828] font-mono leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[#0284c7]"
        />
      </div>

      {/* Catálogo de Falhas Frequentes para Consulta Rápida */}
      <div className="border border-[#e4e7ec] rounded-2xl p-4 bg-white">
        <h4 className="font-bold text-xs uppercase tracking-wider text-[#667085] mb-3">
          Consultar Sintomas e Falhas Típicas por Sistema
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIAS_PROBLEMAS.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setTextoLaudo((prev) => `${prev}\n• Sistema ${cat.nome}: Identificada necessidade de revisão nos componentes de desgaste.`)
                toast.info(`Nota adicionada sobre ${cat.nome}`)
              }}
              className="p-3 rounded-xl border border-[#e4e7ec] hover:border-[#0284c7] hover:bg-sky-50/50 cursor-pointer transition-all"
            >
              <span className="font-bold text-xs text-[#101828] block">{cat.nome}</span>
              <span className="text-[11px] text-[#667085] block mt-1">{cat.descricao}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
