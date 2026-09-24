import { useEffect, useMemo, useState } from 'react'
import Select from 'react-select'
import { Wrench } from '@phosphor-icons/react'
import { MOCK_MECANICOS } from '../../../../../constants/mecanicos' // kept for backward compat, no longer seeded
import { obterMecanicosAtivos } from '../../../../../repositories/funcionariosRepository'
import { obterOrdensAbertas } from '../../../orcamento/mockOrdensAbertas'
import { SecaoForm, Campo, inputClass, selectStylesPortal } from '../formularioAberturaShared'

export function AbaItensAtribuicao({ formData, updateFormData }) {
  const [mecanicosDinamicos, setMecanicosDinamicos] = useState([
    { value: '', label: 'Selecione o mecânico', nome: '' },
  ])

  useEffect(() => {
    let cancelado = false
    const carregar = async () => {
      try {
        const ativos = await obterMecanicosAtivos()
        if (!cancelado && ativos && ativos.length > 0) {
          const formatados = [
            { value: '', label: 'Selecione o mecânico', nome: '' },
            ...ativos.map((a) => ({
              value: a.id,
              label: a.nome,
              nome: a.nome,
              cargo: a.cargoLabel || a.cargo,
              especialidade: a.especialidade,
              boxElevador: a.boxElevador,
              comissaoPerc: a.comissaoServicos,
              telefone: a.telefone,
            })),
          ]
          setMecanicosDinamicos(formatados)
        }
      } catch (e) {
        console.error('Erro ao carregar mecânicos ativos para nova OS:', e)
      }
    }
    carregar()

    window.addEventListener('dev_oficina_funcionarios_updated', carregar)
    return () => {
      cancelado = true
      window.removeEventListener('dev_oficina_funcionarios_updated', carregar)
    }
  }, [])

  const mecanicosOptions = useMemo(
    () => mecanicosDinamicos.map((m) => ({ value: m.value, label: m.nome, nome: m.nome })),
    [mecanicosDinamicos]
  )
  const selectedMecanicoOption = useMemo(
    () =>
      mecanicosOptions.find((m) => m.value === formData.mecanicoId) ||
      mecanicosOptions.find(
        (m) =>
          formData.mecanicoNome &&
          m.nome.trim().toLowerCase() === formData.mecanicoNome.trim().toLowerCase()
      ) ||
      mecanicosOptions[0],
    [formData.mecanicoId, formData.mecanicoNome, mecanicosOptions]
  )

  const ordensAbertas = useMemo(() => obterOrdensAbertas(), [])
  const empenhoPorMecanico = useMemo(() => {
    return mecanicosDinamicos
      .filter((m) => Boolean(m.value))
      .map((mec) => {
        const totalOs = ordensAbertas.filter((o) => {
          const matchNome =
            o.mecanicoNome && o.mecanicoNome.trim().toLowerCase() === mec.nome.trim().toLowerCase()
          const matchId =
            o.mecanicoId &&
            (o.mecanicoId === mec.value ||
              o.mecanicoId === mec.value.replace('func-', 'mec-') ||
              o.mecanicoId === mec.value.replace('mec-', 'func-'))
          return (matchNome || matchId) && o.status !== 'finalizada'
        }).length
        return { ...mec, totalOs }
      })
      .sort((a, b) => a.totalOs - b.totalOs)
  }, [mecanicosDinamicos, ordensAbertas])

  return (
    <SecaoForm icone={Wrench} titulo="Equipe Responsavel">
      <div className="grid grid-cols-1 @sm:grid-cols-3 gap-3">
        <Campo label="Mecanico Responsavel">
          <Select
            options={mecanicosOptions}
            value={selectedMecanicoOption}
            onChange={(opt) => updateFormData({ mecanicoId: opt?.value || '', mecanicoNome: opt?.value ? opt.nome : '' })}
            styles={selectStylesPortal}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            isSearchable={false}
          />
        </Campo>
        <Campo label="Consultor">
          <input
            type="text"
            value={formData.consultorResponsavel || 'BIANCA'}
            onChange={(e) => updateFormData({ consultorResponsavel: e.target.value })}
            placeholder="Ex: Bianca"
            className={inputClass}
          />
        </Campo>
        <Campo label="Hora Prevista">
          <input
            type="time"
            value={formData.previsaoEntregaHora || '18:00'}
            onChange={(e) => updateFormData({ previsaoEntregaHora: e.target.value })}
            className={inputClass}
          />
        </Campo>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {empenhoPorMecanico.map((mec) => {
          const isSelecionado =
            formData.mecanicoId === mec.value ||
            (formData.mecanicoNome && formData.mecanicoNome.trim().toLowerCase() === mec.nome.trim().toLowerCase())
          return (
            <button
              key={mec.value}
              type="button"
              onClick={() => updateFormData({ mecanicoId: mec.value, mecanicoNome: mec.nome })}
              className={`px-2 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                isSelecionado
                  ? 'bg-[#f0f9ff] border-[#0284c7] text-[#0369a1] ring-1 ring-[#0284c7]'
                  : 'bg-[#f8fafc] border-[#e4e7ec] text-[#475467] hover:border-[#98a2b3] hover:bg-white'
              }`}
              title={`${mec.totalOs} OS em andamento`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${mec.totalOs === 0 ? 'bg-[#0284c7]' : 'bg-[#98a2b3]'}`} />
              <span>{mec.nome.split(' ')[0]}</span>
              <span className="text-[9px] opacity-70">{mec.totalOs}</span>
            </button>
          )
        })}
      </div>
    </SecaoForm>
  )
}
