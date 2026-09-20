import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import { IMaskInput } from 'react-imask'
import {
  UserPlus,
  Users,
  Car,
  FloppyDisk,
  CheckCircle,
  X,
  IdentificationCard,
  Phone,
  Envelope,
  MapPin,
  ShieldCheck,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { customSelectStyles } from '../suprimentos/customSelectStyles'
import { carregarClientesCadastrados } from '../../constants/mockClientesVeiculos'
import { vincularVeiculoEstacionadoAoCliente } from '../../constants/mockVeiculosEstacionados'

export function ModalVincularCliente({ isOpen, onClose, veiculo, onVinculoConcluido }) {
  const [abaAtiva, setAbaAtiva] = useState('existente') // 'existente' ou 'novo'
  const [clientesDisponiveis, setClientesDisponiveis] = useState([])
  const [clienteSelecionado, setClienteSelecionado] = useState(null)

  // Dados do formulário para novo cliente
  const [novoCliente, setNovoCliente] = useState({
    tipoPessoa: 'F',
    nome: '',
    documento: '',
    rgIe: '',
    telefone: '',
    email: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: 'Apucarana',
    uf: 'PR',
  })

  // Carrega clientes da oficina para o select
  useEffect(() => {
    if (isOpen) {
      const lista = carregarClientesCadastrados()
      setClientesDisponiveis(lista)

      // Se o veículo já possui nome/telefone do novo dono provisório, inicializa os campos
      if (veiculo) {
        setNovoCliente({
          tipoPessoa: 'F',
          nome: veiculo.novoDonoNome || '',
          documento: veiculo.novoDonoDocumento || '',
          rgIe: '',
          telefone: veiculo.novoDonoTelefone || '',
          email: veiculo.novoDonoEmail || '',
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: 'Apucarana',
          uf: 'PR',
        })

        // Se houver nome de novo dono, pode sugerir cadastrar novo
        if (veiculo.novoDonoNome && !clienteSelecionado) {
          setAbaAtiva('novo')
        } else {
          setAbaAtiva('existente')
        }
      }
    }
  }, [isOpen, veiculo])

  // Opções para o select react-select
  const opcoesClientes = useMemo(() => {
    return clientesDisponiveis.map((c) => ({
      value: c.value || c.id,
      label: `${c.codigoCliente || '000000'} - ${c.nome} - ${c.telefone || 'Sem telefone'}`,
      cliente: c,
    }))
  }, [clientesDisponiveis])

  if (!isOpen || !veiculo) return null

  const handleConfirmarVinculo = () => {
    try {
      if (abaAtiva === 'existente') {
        if (!clienteSelecionado) {
          toast.error('Selecione um cliente da lista para vincular o veículo.')
          return
        }

        const resultado = vincularVeiculoEstacionadoAoCliente({
          veiculoEstacionadoId: veiculo.id,
          clienteDestinoId: clienteSelecionado.value,
        })

        toast.success(
          `Veículo placa ${veiculo.placa} vinculado com sucesso a ${resultado.clienteNome}! Histórico preservado.`
        )
      } else {
        if (!novoCliente.nome.trim()) {
          toast.error('O nome completo do novo cliente é obrigatório.')
          return
        }
        if (!novoCliente.telefone.trim()) {
          toast.error('O telefone de contato do novo cliente é obrigatório.')
          return
        }

        const resultado = vincularVeiculoEstacionadoAoCliente({
          veiculoEstacionadoId: veiculo.id,
          novoClienteData: novoCliente,
        })

        toast.success(
          `Novo cliente ${resultado.clienteNome} cadastrado e veículo ${veiculo.placa} vinculado com sucesso!`
        )
      }

      if (onVinculoConcluido) {
        onVinculoConcluido()
      }
      onClose()
    } catch (err) {
      toast.error(err.message || 'Erro ao vincular veículo ao cliente.')
    }
  }

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      chaveStorage="modal_redimensionavel_vincular_cliente"
      larguraPadrao={760}
      alturaPadrao={580}
      larguraMinima={480}
      alturaMinima={380}
      titulo="Vincular Veículo a Proprietário"
      subtitulo={`Transferência de propriedade com manutenção integral do histórico`}
      badge="Atendimento e Frota"
      icone={UserPlus}
      rodape={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck size={16} className="text-sky-600" />
            <span>O veículo sairá dos Estacionados e entrará na Frota Ativa</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-300"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmarVinculo}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <FloppyDisk size={15} weight="bold" />
              <span>Confirmar Vínculo</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pb-2">
        {/* Bloco Resumo do Veículo */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm shrink-0 border border-sky-200">
              <Car size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-white text-slate-900 border border-slate-300 px-2 py-0.5 rounded shadow-2xs">
                  {veiculo.placa}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {veiculo.marcaModelo || `${veiculo.marca || ''} ${veiculo.modelo || ''}`.trim()}
                </span>
                <span className="text-[11px] text-slate-500">({veiculo.ano || '—'})</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Antigo Dono: <strong className="text-slate-700">{veiculo.antigoClienteNome || '—'}</strong> • Manutenções no Histórico:{' '}
                <strong className="text-sky-700">{veiculo.historicoManutencoes?.length || 0} registradas</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Abas de Escolha: Cliente Já Cadastrado vs Cadastrar Novo */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setAbaAtiva('existente')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              abaAtiva === 'existente'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={15} className={abaAtiva === 'existente' ? 'text-sky-600' : ''} />
            <span>Cliente Já Cadastrado</span>
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('novo')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              abaAtiva === 'novo'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus size={15} className={abaAtiva === 'novo' ? 'text-sky-600' : ''} />
            <span>Cadastrar Novo Cliente</span>
          </button>
        </div>

        {/* Conteúdo Aba 1: Selecionar Cliente Existente */}
        {abaAtiva === 'existente' && (
          <div className="space-y-3 bg-white border border-slate-200 rounded-xl p-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Selecione o Cliente Proprietário na Base da Oficina
              </label>
              <Select
                value={clienteSelecionado}
                onChange={setClienteSelecionado}
                options={opcoesClientes}
                styles={customSelectStyles}
                placeholder="Pesquise por nome, telefone ou código de cliente..."
                isSearchable
                noOptionsMessage={() => 'Nenhum cliente encontrado'}
              />
            </div>

            {clienteSelecionado && (
              <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{clienteSelecionado.cliente.nome}</span>
                  <span className="font-mono font-semibold text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200">
                    Cód: {clienteSelecionado.cliente.codigoCliente || '—'}
                  </span>
                </div>
                <div className="text-slate-600 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    Telefone: <strong className="text-slate-800">{clienteSelecionado.cliente.telefone || '—'}</strong>
                  </div>
                  <div>
                    Documento: <strong className="text-slate-800">{clienteSelecionado.cliente.documento || '—'}</strong>
                  </div>
                  <div className="col-span-2">
                    Endereço: <span className="text-slate-700">{clienteSelecionado.cliente.endereco || '—'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conteúdo Aba 2: Formulário para Cadastrar Novo Cliente */}
        {abaAtiva === 'novo' && (
          <div className="space-y-3 bg-white border border-slate-200 rounded-xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Tipo de Pessoa */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Cliente</label>
                <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-50 h-9">
                  <button
                    type="button"
                    onClick={() => setNovoCliente((prev) => ({ ...prev, tipoPessoa: 'F' }))}
                    className={`flex-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                      novoCliente.tipoPessoa === 'F' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Física (PF)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNovoCliente((prev) => ({ ...prev, tipoPessoa: 'J' }))}
                    className={`flex-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                      novoCliente.tipoPessoa === 'J' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Jurídica (PJ)
                  </button>
                </div>
              </div>

              {/* Nome Completo / Razão Social */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo / Razão Social *
                </label>
                <input
                  type="text"
                  value={novoCliente.nome}
                  onChange={(e) => setNovoCliente((prev) => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Rodrigo Pires Alencar"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* CPF / CNPJ */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {novoCliente.tipoPessoa === 'J' ? 'CNPJ' : 'CPF'}
                </label>
                <IMaskInput
                  mask={novoCliente.tipoPessoa === 'J' ? '00.000.000/0000-00' : '000.000.000-00'}
                  value={novoCliente.documento}
                  onAccept={(value) => setNovoCliente((prev) => ({ ...prev, documento: value }))}
                  placeholder={novoCliente.tipoPessoa === 'J' ? '00.000.000/0000-00' : '000.000.000-00'}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                />
              </div>

              {/* Telefone / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / WhatsApp *</label>
                <IMaskInput
                  mask="(00) 00000-0000"
                  value={novoCliente.telefone}
                  onAccept={(value) => setNovoCliente((prev) => ({ ...prev, telefone: value }))}
                  placeholder="(43) 99999-9999"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                />
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={novoCliente.email}
                  onChange={(e) => setNovoCliente((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="cliente@email.com"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* CEP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CEP</label>
                <IMaskInput
                  mask="00000-000"
                  value={novoCliente.cep}
                  onAccept={(value) => setNovoCliente((prev) => ({ ...prev, cep: value }))}
                  placeholder="86800-000"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                />
              </div>

              {/* Endereço / Rua */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Logradouro / Rua</label>
                <input
                  type="text"
                  value={novoCliente.logradouro}
                  onChange={(e) => setNovoCliente((prev) => ({ ...prev, logradouro: e.target.value }))}
                  placeholder="Rua, Avenida..."
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                />
              </div>

              {/* Cidade */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cidade</label>
                <input
                  type="text"
                  value={novoCliente.cidade}
                  onChange={(e) => setNovoCliente((prev) => ({ ...prev, cidade: e.target.value }))}
                  placeholder="Apucarana"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalRedimensionavel>
  )
}
