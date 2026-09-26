import React from 'react'
import Select from 'react-select'
import { Wrench } from '@phosphor-icons/react'
import { customSelectStyles } from '../../suprimentos/customSelectStyles'
import { OPCOES_DIAS, OPCOES_HORARIOS, OPCOES_DURACAO } from '../../../hooks/useAgendamentoFormWorkflow'
import { labelClass, TituloSecao } from './estilosAgendamentoForm'

export function SecaoMecanicoHorarioAgendamento({ form }) {
  const campos = [
    { rotulo: 'Dia da Semana *', opcoes: OPCOES_DIAS, valor: form.diaChave, setter: form.setDiaChave },
    { rotulo: 'Horário de Início *', opcoes: OPCOES_HORARIOS, valor: form.horarioInicio, setter: form.setHorarioInicio },
    { rotulo: 'Duração Estimada', opcoes: OPCOES_DURACAO, valor: form.duracaoHoras, setter: form.setDuracaoHoras },
  ]

  return (
    <div className="space-y-3">
      <TituloSecao icone={Wrench}>3. Mecânico e Horário</TituloSecao>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Mecânico: SOMENTE O NOME DO MECÂNICO */}
        <div className="md:col-span-1">
          <label className={labelClass}>Mecânico *</label>
          <Select
            options={form.opcoesMecanicos}
            value={form.opcoesMecanicos.find((o) => o.value === form.mecanicoId)}
            onChange={(opt) => form.setMecanicoId(opt.value)}
            styles={customSelectStyles}
            isSearchable={false}
          />
        </div>

        {campos.map((campo) => (
          <div key={campo.rotulo}>
            <label className={labelClass}>{campo.rotulo}</label>
            <Select
              options={campo.opcoes}
              value={campo.opcoes.find((o) => o.value === campo.valor)}
              onChange={(opt) => campo.setter(opt.value)}
              styles={customSelectStyles}
              isSearchable={false}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
