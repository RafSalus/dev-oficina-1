import React from 'react'
import Select from 'react-select'
import { Wrench } from '@phosphor-icons/react'
import { mobileSelectStyles, labelBaseClass } from '../../../nova-os/mobile/mobileSelectStyles'
import {
  OPCOES_DIAS,
  OPCOES_HORARIOS,
  OPCOES_DURACAO,
} from '../../../../../hooks/useAgendamentoFormWorkflow'
import { secaoMobileClass, TituloSecaoMobile } from './MobileSecaoClienteVeiculo'

function SelectMobile({ rotulo, opcoes, valor, onChange }) {
  return (
    <div>
      <label className={labelBaseClass}>{rotulo}</label>
      <Select
        options={opcoes}
        value={opcoes.find((o) => o.value === valor)}
        onChange={(opt) => onChange(opt.value)}
        styles={mobileSelectStyles}
        isSearchable={false}
      />
    </div>
  )
}

export function MobileSecaoMecanicoHorario({ form }) {
  return (
    <section className={secaoMobileClass}>
      <TituloSecaoMobile icone={Wrench}>Mecânico e Horário</TituloSecaoMobile>

      <SelectMobile
        rotulo="Mecânico *"
        opcoes={form.opcoesMecanicos}
        valor={form.mecanicoId}
        onChange={form.setMecanicoId}
      />

      <div className="grid grid-cols-2 gap-3">
        <SelectMobile rotulo="Dia *" opcoes={OPCOES_DIAS} valor={form.diaChave} onChange={form.setDiaChave} />
        <SelectMobile
          rotulo="Horário *"
          opcoes={OPCOES_HORARIOS}
          valor={form.horarioInicio}
          onChange={form.setHorarioInicio}
        />
      </div>

      <SelectMobile
        rotulo="Duração Estimada"
        opcoes={OPCOES_DURACAO}
        valor={form.duracaoHoras}
        onChange={form.setDuracaoHoras}
      />
    </section>
  )
}
