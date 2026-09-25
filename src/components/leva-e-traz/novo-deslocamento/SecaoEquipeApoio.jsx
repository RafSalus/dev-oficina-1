import React from 'react'
import Select from 'react-select'
import { Users } from '@phosphor-icons/react'
import { customSelectStyles } from '../../suprimentos/customSelectStyles'
import { MOTORISTAS_PADRAO } from '../../../constants/mockLevaETraz'

export function SecaoEquipeApoio({
  quantidadeFuncionarios,
  setQuantidadeFuncionarios,
  motoristaPrincipal,
  setMotoristaPrincipal,
  auxiliar,
  setAuxiliar,
  veiculoApoio,
  setVeiculoApoio,
  veiculosApoioDisponiveis,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Users size={14} className="text-sky-600" />
          <span>Configuração da Equipe e Veículo de Apoio da Oficina</span>
        </h4>

        {/* Alternador 1 vs 2 Funcionários */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => setQuantidadeFuncionarios(1)}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              quantidadeFuncionarios === 1
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1 Funcionário
          </button>
          <button
            type="button"
            onClick={() => setQuantidadeFuncionarios(2)}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              quantidadeFuncionarios === 2
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2 Funcionários (Carro de Apoio)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Motorista Principal */}
        <div className={quantidadeFuncionarios === 2 ? 'sm:col-span-4' : 'sm:col-span-6'}>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Motorista Principal / Mecânico *
          </label>
          <Select
            value={motoristaPrincipal}
            onChange={setMotoristaPrincipal}
            options={MOTORISTAS_PADRAO}
            styles={customSelectStyles}
            placeholder="Selecione o motorista..."
            isSearchable={false}
          />
        </div>

        {/* Segundo Motorista / Auxiliar (se 2 funcionários) */}
        {quantidadeFuncionarios === 2 && (
          <div className="sm:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              2º Funcionário (Apoio de Retorno) *
            </label>
            <Select
              value={auxiliar}
              onChange={setAuxiliar}
              options={MOTORISTAS_PADRAO.filter((m) => m.value !== motoristaPrincipal?.value)}
              styles={customSelectStyles}
              placeholder="Selecione o auxiliar..."
              isSearchable={false}
            />
          </div>
        )}

        {/* Veículo de Apoio da Oficina */}
        <div className={quantidadeFuncionarios === 2 ? 'sm:col-span-4' : 'sm:col-span-6'}>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Veículo de Apoio da Oficina Utilizado *
          </label>
          <Select
            value={
              veiculoApoio
                ? {
                    value: veiculoApoio.id,
                    label: `${veiculoApoio.nome} (${veiculoApoio.placa})`,
                    veiculo: veiculoApoio,
                  }
                : null
            }
            onChange={(opt) => setVeiculoApoio(opt?.veiculo || null)}
            options={veiculosApoioDisponiveis.map((v) => ({
              value: v.id,
              label: `${v.nome} (${v.placa}) - KM: ${v.kmAtual}`,
              veiculo: v,
            }))}
            styles={customSelectStyles}
            placeholder="Selecione o veículo de apoio..."
            isSearchable={false}
          />
        </div>
      </div>
    </div>
  )
}
