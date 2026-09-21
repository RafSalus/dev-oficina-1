import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { IMaskInput } from 'react-imask'
import {
  Car,
  FloppyDisk,
  Trash,
  ShieldCheck,
  Warning,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { customSelectStyles } from '../suprimentos/customSelectStyles'
import {
  criarVeiculoApoio,
  atualizarVeiculoApoio,
  excluirVeiculoApoio,
} from '../../constants/mockLevaETraz'

const OPCOES_TIPO = [
  { value: 'Furgão Utilitário', label: 'Furgão Utilitário' },
  { value: 'Veículo de Passeio e Carona', label: 'Veículo de Passeio e Carona' },
  { value: 'Moto Expressa para Peças', label: 'Moto Expressa para Peças' },
  { value: 'Van de Transporte', label: 'Van de Transporte' },
  { value: 'Caminhonete', label: 'Caminhonete' },
]

const OPCOES_COMBUSTIVEL = [
  { value: 'FLEX', label: 'FLEX' },
  { value: 'Gasolina', label: 'Gasolina' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Etanol', label: 'Etanol' },
  { value: 'Elétrico', label: 'Elétrico' },
  { value: 'Híbrido', label: 'Híbrido' },
]

export function ModalVeiculoApoio({ isOpen, onClose, onSalvo, veiculo = null }) {
  const modoEdicao = Boolean(veiculo?.id)

  const [nome, setNome] = useState('')
  const [placa, setPlaca] = useState('')
  const [tipo, setTipo] = useState(OPCOES_TIPO[0])
  const [ano, setAno] = useState('')
  const [combustivel, setCombustivel] = useState(OPCOES_COMBUSTIVEL[0])
  const [kmAtual, setKmAtual] = useState('')

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (veiculo?.id) {
        setNome(veiculo.nome || '')
        setPlaca(veiculo.placa || '')
        setTipo(OPCOES_TIPO.find((o) => o.value === veiculo.tipo) || OPCOES_TIPO[0])
        setAno(veiculo.ano || '')
        setCombustivel(OPCOES_COMBUSTIVEL.find((o) => o.value === veiculo.combustivel) || OPCOES_COMBUSTIVEL[0])
        setKmAtual(veiculo.kmAtual || '')
      } else {
        setNome('')
        setPlaca('')
        setTipo(OPCOES_TIPO[0])
        setAno('')
        setCombustivel(OPCOES_COMBUSTIVEL[0])
        setKmAtual('')
      }
      setModalExcluirAberto(false)
    }
  }, [isOpen, veiculo])

  const handleSalvar = () => {
    if (!nome.trim()) {
      toast.error('Informe o nome do veículo.')
      return
    }
    if (!placa.trim()) {
      toast.error('Informe a placa do veículo.')
      return
    }

    const dados = {
      nome: nome.trim(),
      placa: placa.trim().toUpperCase(),
      tipo: tipo.value,
      ano: ano.trim(),
      combustivel: combustivel.value,
      kmAtual: kmAtual.trim(),
    }

    try {
      if (modoEdicao) {
        atualizarVeiculoApoio({ id: veiculo.id, ...dados })
        toast.success(`Veículo ${dados.placa} atualizado com sucesso!`)
      } else {
        criarVeiculoApoio(dados)
        toast.success(`Veículo ${dados.placa} cadastrado na frota de apoio!`)
      }
      if (onSalvo) onSalvo()
      onClose()
    } catch (err) {
      toast.error('Erro ao salvar veículo de apoio.')
    }
  }

  const handleExcluir = () => {
    try {
      excluirVeiculoApoio(veiculo.id)
      toast.success(`Veículo ${veiculo.placa} removido da frota de apoio.`)
      if (onSalvo) onSalvo()
      onClose()
    } catch (err) {
      toast.error('Erro ao excluir veículo de apoio.')
    }
  }

  if (!isOpen) return null

  return (
    <>
      <ModalRedimensionavel
        isOpen={isOpen}
        onClose={onClose}
        chaveStorage={modoEdicao ? 'modal_editar_veiculo_apoio' : 'modal_novo_veiculo_apoio'}
        larguraPadrao={580}
        alturaPadrao={500}
        larguraMinima={480}
        alturaMinima={400}
        larguraMaxima={860}
        alturaMaxima={720}
        titulo={modoEdicao ? 'Editar Veículo de Apoio' : 'Cadastrar Novo Veículo de Apoio'}
        subtitulo={modoEdicao ? 'Atualize os dados do veículo da frota de apoio' : 'Adicione um veículo ou moto à frota de apoio da oficina'}
        badge="Frota de Apoio"
        icone={Car}
        rodape={
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              {modoEdicao ? (
                <>
                  <ShieldCheck size={16} className="text-sky-600" />
                  <span>Veículo vinculado a deslocamentos não pode ser excluído</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} className="text-sky-600" />
                  <span>O veículo será cadastrado como disponível na frota</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {modoEdicao && (
                <button
                  type="button"
                  onClick={() => setModalExcluirAberto(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-rose-200"
                >
                  <Trash size={14} weight="bold" />
                  <span>Excluir</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvar}
                className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <FloppyDisk size={15} weight="bold" />
                <span>{modoEdicao ? 'Salvar Alterações' : 'Cadastrar Veículo'}</span>
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Dados do Veículo */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Car size={14} className="text-sky-600" />
              <span>Dados do Veículo de Apoio</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome / Descrição do Veículo *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Fiat Fiorino 1.4 Hard Working"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">Placa *</label>
                <IMaskInput
                  mask={/^[A-Z]{3}[0-9][A-Z0-9]{2}$/.test(placa.replace(/[^A-Z0-9]/gi, '').toUpperCase()) && placa.replace(/[^A-Z0-9]/gi, '').length === 5 ? 'ABC-1D23' : 'ABC1D23'}
                  value={placa}
                  onAccept={(value) => setPlaca(value)}
                  placeholder="ABC1D23"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold uppercase text-slate-900 bg-white focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Veículo *</label>
                <Select
                  value={tipo}
                  onChange={(opt) => setTipo(opt || OPCOES_TIPO[0])}
                  options={OPCOES_TIPO}
                  styles={customSelectStyles}
                  placeholder="Selecione o tipo..."
                  isSearchable={false}
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Ano / Modelo</label>
                <input
                  type="text"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  placeholder="2021/2022"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Combustível</label>
                <Select
                  value={combustivel}
                  onChange={(opt) => setCombustivel(opt || OPCOES_COMBUSTIVEL[0])}
                  options={OPCOES_COMBUSTIVEL}
                  styles={customSelectStyles}
                  placeholder="Combustível..."
                  isSearchable={false}
                />
              </div>

              <div className="sm:col-span-12">
                <label className="block text-xs font-bold text-slate-700 mb-1">Hodômetro Atual (KM)</label>
                <IMaskInput
                  mask="000.000"
                  value={kmAtual}
                  onAccept={(value) => setKmAtual(value)}
                  placeholder="000.000"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-sky-600"
                />
              </div>
            </div>
          </div>
        </div>
      </ModalRedimensionavel>

      {/* Modal de Confirmação de Exclusão */}
      {modalExcluirAberto && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <Warning size={20} className="text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Excluir Veículo de Apoio</h3>
                <p className="text-xs text-slate-500">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 mb-5">
              Tem certeza que deseja excluir o veículo <strong className="font-bold">{veiculo?.nome}</strong> (placa <strong className="font-mono font-bold">{veiculo?.placa}</strong>) da frota de apoio?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalExcluirAberto(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-300"
              >
                Manter Veículo
              </button>
              <button
                type="button"
                onClick={handleExcluir}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Trash size={14} weight="bold" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
