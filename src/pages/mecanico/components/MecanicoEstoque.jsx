import Select from 'react-select'
import { CATEGORIAS_PECAS } from '../../../constants/catalogoPecasEstoque'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'

// categoriaEstoque/estoqueFiltrado são estado compartilhado com a aba "Pedir Peças"
// (MecanicoPedirPecas) — vêm do orquestrador, ver nota lá.
export function MecanicoEstoque({ categoriaEstoque, setCategoriaEstoque, estoqueFiltrado }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-[#101828]">
            Almoxarifado e Catálogo de Peças da Oficina
          </h3>
          <p className="text-xs text-[#667085]">
            Consulte localização física de prateleira, quantidade em estoque e valores unitários.
          </p>
        </div>
        <div className="w-56">
          <Select
            options={[{ value: 'Todas', label: 'Todas as Categorias' }, ...CATEGORIAS_PECAS.map((c) => ({ value: c, label: c }))]}
            value={{ value: categoriaEstoque, label: categoriaEstoque === 'Todas' ? 'Todas as Categorias' : categoriaEstoque }}
            onChange={(opt) => setCategoriaEstoque(opt ? opt.value : 'Todas')}
            styles={customSelectStyles}
            isSearchable={false}
          />
        </div>
      </div>

      <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden bg-white">
        <div className="bg-[#f8fafc] px-4 py-2.5 grid grid-cols-12 gap-3 text-[11px] font-bold uppercase tracking-wider text-[#667085]">
          <div className="col-span-2">Código</div>
          <div className="col-span-4">Descrição da Peça</div>
          <div className="col-span-2">Categoria</div>
          <div className="col-span-2 text-center">Localização / Prateleira</div>
          <div className="col-span-1 text-center">Estoque</div>
          <div className="col-span-1 text-right">Preço Unit.</div>
        </div>

        <div className="divide-y divide-[#f2f4f7] max-h-[450px] overflow-y-auto no-scrollbar">
          {estoqueFiltrado.map((peca, idx) => (
            <div
              key={peca.codigo}
              className="px-4 py-2.5 grid grid-cols-12 gap-3 items-center text-xs hover:bg-[#f8fafc]"
            >
              <div className="col-span-2 font-mono font-bold text-[#101828]">
                {peca.codigo}
              </div>
              <div className="col-span-4 font-semibold text-[#101828]">
                {peca.nome}
              </div>
              <div className="col-span-2 text-[#667085]">{peca.categoria}</div>
              <div className="col-span-2 text-center text-[#475467] font-medium text-[11px]">
                Prateleira A{idx % 5 + 1} - Gav. {String(idx + 1).padStart(2, '0')}
              </div>
              <div className="col-span-1 text-center font-bold font-mono">
                {peca.estoqueAtual}
              </div>
              <div className="col-span-1 text-right font-black font-mono text-[#101828]">
                R$ {peca.precoUnitario.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
