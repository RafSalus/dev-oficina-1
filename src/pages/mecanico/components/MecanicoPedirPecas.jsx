import Select from 'react-select'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'

const OPCOES_URGENCIA_PEDIR = [
  { value: 'normal', label: 'Normal (Fluxo Padrão)' },
  { value: 'urgente', label: 'Urgente (Veículo no Elevador)' },
]

// buscaEstoque/estoqueFiltrado são estado compartilhado com a aba "Consulta Estoque"
// (MecanicoEstoque) — vêm do orquestrador para preservar o filtro cruzado entre as duas
// abas exatamente como no arquivo monolítico original.
export function MecanicoPedirPecas({
  osAtiva,
  buscaEstoque,
  setBuscaEstoque,
  qtdPedir,
  setQtdPedir,
  urgenciaPedir,
  setUrgenciaPedir,
  estoqueFiltrado,
  handleRequisitarPeca,
}) {
  return (
    <div className="space-y-4">
      <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-[#101828]">
            Pedir Peça para a OS #{osAtiva?.numeroOS} ({osAtiva?.marcaModelo})
          </h4>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#475467]">Urgência:</label>
            <div className="w-52">
              <Select
                options={OPCOES_URGENCIA_PEDIR}
                value={OPCOES_URGENCIA_PEDIR.find((o) => o.value === urgenciaPedir) || OPCOES_URGENCIA_PEDIR[0]}
                onChange={(opt) => setUrgenciaPedir(opt ? opt.value : 'normal')}
                styles={customSelectStyles}
                isSearchable={false}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
            />
            <input
              type="text"
              value={buscaEstoque}
              onChange={(e) => setBuscaEstoque(e.target.value)}
              placeholder="Buscar peça por código ou nome (ex: Pastilha, Óleo, Tubo)..."
              className="w-full h-9 pl-9 pr-3 bg-white border border-[#d0d5dd] rounded-xl text-xs text-[#101828] focus:ring-1 focus:ring-[#0284c7]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#475467]">Qtd:</label>
            <input
              type="number"
              min={1}
              max={99}
              value={qtdPedir}
              onChange={(e) => setQtdPedir(Number(e.target.value))}
              className="w-16 h-9 px-2 bg-white border border-[#d0d5dd] rounded-xl text-xs font-bold text-center text-[#101828]"
            />
          </div>
        </div>
      </div>

      {/* Tabela de Peças Disponíveis para Pedido */}
      <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden bg-white">
        <div className="bg-[#f8fafc] px-4 py-2.5 grid grid-cols-12 gap-3 text-[11px] font-bold uppercase tracking-wider text-[#667085]">
          <div className="col-span-2">Código</div>
          <div className="col-span-5">Descrição da Peça</div>
          <div className="col-span-2">Categoria</div>
          <div className="col-span-1 text-center">Estoque</div>
          <div className="col-span-2 text-right">Ação</div>
        </div>

        <div className="divide-y divide-[#f2f4f7] max-h-96 overflow-y-auto no-scrollbar">
          {estoqueFiltrado.slice(0, 15).map((peca) => (
            <div
              key={peca.codigo}
              className="px-4 py-2.5 grid grid-cols-12 gap-3 items-center text-xs hover:bg-[#f8fafc]"
            >
              <div className="col-span-2 font-mono font-bold text-[#101828]">
                {peca.codigo}
              </div>
              <div className="col-span-5 font-semibold text-[#101828]">
                {peca.nome}
              </div>
              <div className="col-span-2 text-[#667085]">{peca.categoria}</div>
              <div className="col-span-1 text-center font-bold font-mono">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] ${
                    peca.estoqueAtual > 0
                      ? 'bg-sky-50 text-[#0284c7]'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {peca.estoqueAtual}
                </span>
              </div>
              <div className="col-span-2 text-right">
                <button
                  type="button"
                  onClick={() => handleRequisitarPeca(peca)}
                  className="px-3 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer active:scale-95 transition-all"
                >
                  Pedir Peça
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
