import { customSelectStyles } from '../../../../components/suprimentos/customSelectStyles'

// Os selects deste formulario vivem dentro de um painel com rolagem propria (aba "Dados") —
// sem portal, o menu aberto fica cortado pelo overflow do painel perto do fim da lista
// (caso do Mecanico Responsavel, a ultima secao). Renderizando via portal no body com
// posicao fixa, o menu sempre aparece por cima, inteiro, independente do scroll.
export const selectStylesPortal = {
  ...customSelectStyles,
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
}

export const NIVEIS_COMBUSTIVEL = [
  { value: 'reserva', label: 'Reserva' },
  { value: '1/4', label: '1/4' },
  { value: '1/2', label: '1/2' },
  { value: '3/4', label: '3/4' },
  { value: 'cheio', label: 'Cheio' },
]

export const TIPO_ATENDIMENTO_OPCOES = [
  { value: 'orcamento', label: 'Orcamento' },
  { value: 'preventiva', label: 'Revisao Preventiva' },
  { value: 'corretiva', label: 'Manutencao Corretiva' },
  { value: 'garantia', label: 'Retorno e Garantia' },
  { value: 'sinistro', label: 'Sinistro e Seguradora' },
]

export const PRIORIDADE_OPCOES = [
  { value: 'normal', label: 'Prioridade Normal' },
  { value: 'alta', label: 'Prioridade Alta' },
  { value: 'urgente', label: 'Prioridade Urgente' },
  { value: 'retorno', label: 'Retorno e Garantia' },
]

export const CANAL_ENTRADA_OPCOES = [
  { value: 'presencial', label: 'Balcao / Presencial' },
  { value: 'whatsapp', label: 'Canal WhatsApp' },
  { value: 'telefone', label: 'Ligacao Telefonica' },
  { value: 'leva_traz', label: 'Guincho / Leva e Traz' },
  { value: 'agendamento', label: 'Agendamento Previo' },
]

export const SINTOMAS_OPTIONS = [
  { value: 'Barulho na suspensao ao passar em desniveis', label: 'Barulho na suspensao ao passar em desniveis' },
  { value: 'Luz da injecao eletronica acesa no painel', label: 'Luz da injecao eletronica acesa no painel' },
  { value: 'Freio assobiando e vibrando ao frear', label: 'Freio assobiando e vibrando ao frear' },
  { value: 'Superaquecimento do motor e vazamento de agua', label: 'Superaquecimento do motor e vazamento de agua' },
  { value: 'Dificuldade na partida e bateria fraca', label: 'Dificuldade na partida e bateria fraca' },
  { value: 'Troca preventiva de oleo e todos os filtros', label: 'Troca preventiva de oleo e todos os filtros' },
  { value: 'Revisao periodica preventiva de quilometragem', label: 'Revisao periodica preventiva de quilometragem' },
  { value: 'Ar condicionado com perda de eficiencia / nao gela', label: 'Ar condicionado com perda de eficiencia / nao gela' },
  { value: 'Direcao puxando para o lado e desalinhamento', label: 'Direcao puxando para o lado e desalinhamento' },
  { value: 'Embreagem pesada e patinando nas marchas', label: 'Embreagem pesada e patinando nas marchas' },
  { value: 'Barulho metalico no compartimento do motor', label: 'Barulho metalico no compartimento do motor' },
  { value: 'Fumaca branca ou azulada no escapamento', label: 'Fumaca branca ou azulada no escapamento' },
  { value: 'Vazamento de oleo visivel sob o veiculo', label: 'Vazamento de oleo visivel sob o veiculo' },
  { value: 'Pedal de freio baixo ou esponjoso', label: 'Pedal de freio baixo ou esponjoso' },
  { value: 'Alinhamento 3D e balanceamento das 4 rodas', label: 'Alinhamento 3D e balanceamento das 4 rodas' },
  { value: 'Vibracao no volante em velocidades acima de 80 km/h', label: 'Vibracao no volante em velocidades acima de 80 km/h' },
  { value: 'Consumo excessivo de combustivel com falhas de aceleracao', label: 'Consumo excessivo de combustivel com falhas de aceleracao' },
]

export function SecaoForm({ icone: Icone, titulo, acessorio, children }) {
  const Ic = Icone
  return (
    <section className="bg-white p-4 rounded-2xl border border-[#d0d5dd] shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6.5 h-6.5 rounded-lg bg-[#f0f9ff] text-[#0284c7] flex items-center justify-center shrink-0">
            <Ic size={14} weight="bold" />
          </div>
          <h2 className="text-xs font-bold text-[#101828] uppercase tracking-wider">{titulo}</h2>
        </div>
        {acessorio}
      </div>
      {children}
    </section>
  )
}

export function Campo({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="text-[11px] font-bold text-[#344054] block mb-1">{label}</label>
      {children}
    </div>
  )
}

export const inputClass =
  'w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-semibold text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]'

// Nem todo veiculo cadastrado tem marca/modelo separados (alguns registros antigos so tem o
// texto combinado marcaModelo) — quando faltar, divide pela primeira palavra como fallback.
export function obterMarcaModeloSeparados(v) {
  if (v?.marca || v?.modelo) {
    return { marca: v.marca || '', modelo: v.modelo || '' }
  }
  const texto = (v?.marcaModelo || '').trim()
  if (!texto) return { marca: '', modelo: '' }
  const [marca, ...resto] = texto.split(' ')
  return { marca, modelo: resto.join(' ') }
}
