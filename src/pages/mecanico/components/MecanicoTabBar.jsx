import {
  SquaresFour,
  ClipboardText,
  MagnifyingGlassPlus,
  CheckSquareOffset,
  ShoppingCart,
  Package,
  Wrench,
  Coins,
  WarningOctagon,
  Hammer,
  CalendarDots,
  ArrowsLeftRight,
  Users,
} from '@phosphor-icons/react'

const ABAS_MECANICO = [
  { id: 'dashboard', label: 'Minha Bancada', icon: SquaresFour },
  { id: 'ordens-servico', label: 'Minhas OS', icon: ClipboardText },
  { id: 'diagnostico', label: 'Diagnósticos', icon: MagnifyingGlassPlus },
  { id: 'checklist', label: 'Checklist da OS', icon: CheckSquareOffset },
  { id: 'pedir-pecas', label: 'Pedir Peças', icon: ShoppingCart },
  { id: 'estoque', label: 'Consulta Estoque', icon: Package },
  { id: 'servicos', label: 'Lançar Serviços', icon: Wrench },
  { id: 'comissoes', label: 'Minhas Comissões', icon: Coins },
  { id: 'pecas-danificadas', label: 'Peças Danificadas', icon: WarningOctagon },
  { id: 'ferramentas', label: 'Ferramentas', icon: Hammer },
  { id: 'agenda', label: 'Minha Agenda', icon: CalendarDots },
  { id: 'leva-e-traz', label: 'Leva e Traz', icon: ArrowsLeftRight },
  { id: 'clientes', label: 'Clientes e Veículos', icon: Users },
]

export function MecanicoTabBar({ activeTab, setActiveTab, navigate }) {
  return (
    <div className="shrink-0 bg-[#f8fafc] border-b border-[#e4e7ec] px-3 pt-2 flex items-center gap-1 overflow-x-auto no-scrollbar">
      {ABAS_MECANICO.map((tab) => {
        const Icon = tab.icon
        const isTabActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id)
              navigate(`/mecanico/${tab.id === 'dashboard' ? 'dashboard' : tab.id}`)
            }}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              isTabActive
                ? 'border-[#0284c7] text-[#0284c7] bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-[#667085] hover:text-[#101828] hover:bg-white/60'
            }`}
          >
            <Icon size={16} weight={isTabActive ? 'fill' : 'bold'} />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
