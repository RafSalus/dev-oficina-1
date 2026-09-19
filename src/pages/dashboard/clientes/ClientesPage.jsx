import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import {
  Users,
  Plus,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  CheckCircle,
  Phone,
  EnvelopeSimple,
  MapPin,
  WhatsappLogo,
  User,
  Buildings,
  Car,
  Tag,
  ShieldCheck,
  ArrowSquareOut,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarClientesCadastrados,
  salvarClientesCadastrados,
} from '../../../constants/mockClientesVeiculos'
import { formatarCPF, formatarCNPJ, formatarTelefone } from '../../../utils/fiscalValidators'
import { ClienteModalForm } from '../../../components/clientes/ClienteModalForm'
import { ClienteFrotaModal } from '../../../components/clientes/ClienteFrotaModal'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'

const FILTRO_TIPO_OPCOES = [
  { value: 'TODOS', label: 'Todos os Tipos (PF e PJ)' },
  { value: 'F', label: 'Pessoa Física (CPF)' },
  { value: 'J', label: 'Pessoa Jurídica (CNPJ)' },
]

const FILTRO_STATUS_OPCOES = [
  { value: 'TODOS', label: 'Todos os Status' },
  { value: 'ATIVOS', label: 'Somente Ativos' },
  { value: 'INATIVOS', label: 'Somente Inativos' },
]

const FILTRO_VEICULOS_OPCOES = [
  { value: 'TODOS', label: 'Todos os Clientes' },
  { value: 'COM_VEICULOS', label: 'Com Veículos Vinculados' },
  { value: 'SEM_VEICULOS', label: 'Sem Veículo Cadastrado' },
]

export function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [filtroVeiculos, setFiltroVeiculos] = useState('TODOS')

  const [modalAberto, setModalAberto] = useState(false)
  const [clienteEmEdicao, setClienteEmEdicao] = useState(null)
  const [clienteFrotaModal, setClienteFrotaModal] = useState(null)

  // Carrega do localStorage ao montar
  useEffect(() => {
    const dados = carregarClientesCadastrados()
    setClientes(dados)

    const handleStorageChange = () => {
      setClientes(carregarClientesCadastrados())
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Métricas rápidas
  const metricas = useMemo(() => {
    const total = clientes.length
    const ativos = clientes.filter((c) => c.ativo !== false).length
    const totalPF = clientes.filter((c) => c.tipoPessoa === 'F' || (!c.tipoPessoa && (c.documento || '').replace(/\D/g, '').length <= 11)).length
    const totalPJ = clientes.filter((c) => c.tipoPessoa === 'J' || (!c.tipoPessoa && (c.documento || '').replace(/\D/g, '').length > 11)).length
    const totalVeiculos = clientes.reduce((acc, c) => acc + (c.veiculos?.length || 0), 0)

    return {
      total,
      ativos,
      totalPF,
      totalPJ,
      totalVeiculos,
    }
  }, [clientes])

  // Filtragem
  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cli) => {
      const termo = busca.toLowerCase().trim()
      const docLimpo = (cli.documento || '').replace(/\D/g, '')
      const isPF = cli.tipoPessoa === 'F' || (!cli.tipoPessoa && docLimpo.length <= 11)

      // Busca textual
      const matchBusca =
        !termo ||
        cli.nome?.toLowerCase().includes(termo) ||
        cli.nomeFantasia?.toLowerCase().includes(termo) ||
        cli.codigoCliente?.toLowerCase().includes(termo) ||
        cli.documento?.toLowerCase().includes(termo) ||
        cli.telefone?.toLowerCase().includes(termo) ||
        cli.cidade?.toLowerCase().includes(termo) ||
        cli.veiculos?.some((v) =>
          v.placa?.toLowerCase().includes(termo) ||
          v.marcaModelo?.toLowerCase().includes(termo)
        )

      // Filtro por Tipo de Pessoa
      const matchTipo =
        filtroTipo === 'TODOS' ||
        (filtroTipo === 'F' && isPF) ||
        (filtroTipo === 'J' && !isPF)

      // Filtro por Status
      const matchStatus =
        filtroStatus === 'TODOS' ||
        (filtroStatus === 'ATIVOS' && cli.ativo !== false) ||
        (filtroStatus === 'INATIVOS' && cli.ativo === false)

      // Filtro por Veículos
      const qteVeiculos = cli.veiculos?.length || 0
      const matchVeiculos =
        filtroVeiculos === 'TODOS' ||
        (filtroVeiculos === 'COM_VEICULOS' && qteVeiculos > 0) ||
        (filtroVeiculos === 'SEM_VEICULOS' && qteVeiculos === 0)

      return matchBusca && matchTipo && matchStatus && matchVeiculos
    })
  }, [clientes, busca, filtroTipo, filtroStatus, filtroVeiculos])

  // Abertura do formulário
  const handleAbrirNovo = () => {
    setClienteEmEdicao(null)
    setModalAberto(true)
  }

  const handleAbrirEditar = (cli) => {
    setClienteEmEdicao(cli)
    setModalAberto(true)
  }

  // Salvar cliente
  const handleSalvarCliente = (dadosCliente) => {
    let novaLista = []
    const existe = clientes.some((c) => c.value === dadosCliente.value || c.id === dadosCliente.id)

    if (existe) {
      novaLista = clientes.map((c) =>
        c.value === dadosCliente.value || c.id === dadosCliente.id ? dadosCliente : c
      )
      toast.success(`Cliente "${dadosCliente.nome}" atualizado com sucesso!`)
    } else {
      novaLista = [dadosCliente, ...clientes]
      toast.success(`Cliente "${dadosCliente.nome}" cadastrado com sucesso!`)
    }

    setClientes(novaLista)
    salvarClientesCadastrados(novaLista)
  }

  // Alternar status
  const handleAlternarStatus = (val) => {
    const novaLista = clientes.map((c) => {
      if (c.value === val || c.id === val) {
        const novoStatus = !(c.ativo !== false)
        toast.info(`Status do cliente alterado para ${novoStatus ? 'Ativo' : 'Inativo'}.`)
        return { ...c, ativo: novoStatus }
      }
      return c
    })
    setClientes(novaLista)
    salvarClientesCadastrados(novaLista)
  }

  // Excluir cliente
  const handleExcluirCliente = (val, nome) => {
    toast(`Excluir o cliente "${nome}"?`, {
      description: 'Esta operação removerá o cliente e seus veículos cadastrados.',
      action: {
        label: 'Confirmar',
        onClick: () => {
          setClientes((prev) => {
            const novaLista = prev.filter((c) => c.value !== val && c.id !== val)
            salvarClientesCadastrados(novaLista)
            return novaLista
          })
          toast.success(`Cliente "${nome}" excluído.`)
        },
      },
    })
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
              <Users size={22} weight="bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Clientes e Frotistas</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {metricas.total}
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Base cadastral de clientes, veículos vinculados, contatos e histórico para ordens de serviço
              </p>
            </div>
          </div>

          {/* Botão Único de Ação (Regra 12: Sem redundância) */}
          <button
            type="button"
            onClick={handleAbrirNovo}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            <span>Novo Cliente</span>
          </button>
        </div>

        {/* Resumo de Indicadores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Total de Clientes
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.total}</span>
            </div>
            <Users size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Pessoas Físicas (CPF)
              </span>
              <span className="text-base font-bold text-sky-700">{metricas.totalPF}</span>
            </div>
            <User size={20} className="text-sky-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Pessoas Jurídicas (CNPJ)
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.totalPJ}</span>
            </div>
            <Buildings size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Veículos na Base
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.totalVeiculos}</span>
            </div>
            <Car size={20} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center gap-3 shrink-0">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, CPF, CNPJ, telefone, placa do veículo ou cidade..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
          />
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-56">
            <Select
              value={FILTRO_TIPO_OPCOES.find((opt) => opt.value === filtroTipo)}
              onChange={(opt) => setFiltroTipo(opt ? opt.value : 'TODOS')}
              options={FILTRO_TIPO_OPCOES}
              styles={customSelectStyles}
              placeholder="Tipo de Pessoa"
              isSearchable={false}
            />
          </div>

          <div className="w-full md:w-56">
            <Select
              value={FILTRO_VEICULOS_OPCOES.find((opt) => opt.value === filtroVeiculos)}
              onChange={(opt) => setFiltroVeiculos(opt ? opt.value : 'TODOS')}
              options={FILTRO_VEICULOS_OPCOES}
              styles={customSelectStyles}
              placeholder="Veículos"
              isSearchable={false}
            />
          </div>

          <div className="w-full md:w-44">
            <Select
              value={FILTRO_STATUS_OPCOES.find((opt) => opt.value === filtroStatus)}
              onChange={(opt) => setFiltroStatus(opt ? opt.value : 'TODOS')}
              options={FILTRO_STATUS_OPCOES}
              styles={customSelectStyles}
              placeholder="Status"
              isSearchable={false}
            />
          </div>
        </div>
      </div>

      {/* Tabela de Clientes com Scroll Oculto (Regra 11) */}
      <div className="flex-1 overflow-auto no-scrollbar p-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {clientesFiltrados.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Users size={24} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Nenhum cliente encontrado</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {busca || filtroTipo !== 'TODOS' || filtroStatus !== 'TODOS' || filtroVeiculos !== 'TODOS'
                  ? 'Nenhum resultado corresponde aos filtros aplicados.'
                  : 'Nenhum cliente cadastrado na base ainda.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3 px-4">Código e Cliente</th>
                  <th className="py-3 px-4">Documento (CPF / CNPJ)</th>
                  <th className="py-3 px-4">Contato Principal</th>
                  <th className="py-3 px-4">Veículos Vinculados</th>
                  <th className="py-3 px-4">Localização</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {clientesFiltrados.map((cli) => {
                  const docLimpo = (cli.documento || '').replace(/\D/g, '')
                  const isPF = cli.tipoPessoa === 'F' || (!cli.tipoPessoa && docLimpo.length <= 11)
                  const foneOriginal = cli.telefone || ''
                  const foneNumeros = foneOriginal.replace(/\D/g, '')
                  const docFormatado = isPF ? formatarCPF(docLimpo) : formatarCNPJ(docLimpo)
                  const veiculosList = cli.veiculos || []

                  return (
                    <tr
                      key={cli.value || cli.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          {cli.codigoCliente && (
                            <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {cli.codigoCliente}
                            </span>
                          )}
                          <div className="font-semibold text-slate-900 truncate">
                            {cli.nome}
                          </div>
                        </div>
                        {cli.nomeFantasia && cli.nomeFantasia !== cli.nome && (
                          <div className="text-[11px] text-slate-500 truncate pl-0.5 mt-0.5">
                            Apelido/Fantasia: {cli.nomeFantasia}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-800">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isPF
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {isPF ? 'PF' : 'PJ'}
                          </span>
                          <span className="font-semibold">{docFormatado || cli.documento}</span>
                        </div>
                        {cli.rgIe && (
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            {isPF ? `RG: ${cli.rgIe}` : `IE: ${cli.rgIe}`}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-slate-700 font-medium">
                            {formatarTelefone(foneOriginal)}
                          </span>
                          {foneNumeros && (
                            <a
                              href={`https://wa.me/55${foneNumeros}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-sm"
                              title="Abrir WhatsApp"
                            >
                              <WhatsappLogo size={12} weight="fill" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                        {cli.email && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[170px]">
                            {cli.email}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 min-w-[210px] max-w-[280px]">
                        {veiculosList.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">
                            Nenhum veículo vinculado
                          </span>
                        ) : veiculosList.length === 1 ? (
                          /* Apenas 1 veículo vinculado: linha única executiva */
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[11px] text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                              {veiculosList[0].placa}
                            </span>
                            <div className="min-w-0">
                              <span
                                className="text-xs font-semibold text-slate-800 truncate block max-w-[170px]"
                                title={veiculosList[0].marcaModelo || `${veiculosList[0].marca || ''} ${veiculosList[0].modelo || ''}`.trim()}
                              >
                                {veiculosList[0].marcaModelo || `${veiculosList[0].marca || ''} ${veiculosList[0].modelo || ''}`.trim()}
                              </span>
                              {veiculosList[0].ano && (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Ano: {veiculosList[0].ano}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : veiculosList.length === 2 ? (
                          /* 2 veículos: estruturados verticalmente, um por linha (nunca na horizontal) */
                          <div className="space-y-1.5">
                            {veiculosList.map((v, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[10px] text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                  {v.placa}
                                </span>
                                <span
                                  className="text-xs font-medium text-slate-800 truncate max-w-[170px]"
                                  title={v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim()}
                                >
                                  {v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim()}
                                </span>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => setClienteFrotaModal(cli)}
                              className="text-[10px] text-sky-600 hover:text-sky-800 font-semibold underline block cursor-pointer transition-colors"
                            >
                              Ver detalhes da frota (2)
                            </button>
                          </div>
                        ) : (
                          /* Frota com 3 ou mais veículos: primeiro veículo destacado e botão de frota com contagem */
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[10px] text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                {veiculosList[0].placa}
                              </span>
                              <span
                                className="text-xs font-semibold text-slate-800 truncate max-w-[170px]"
                                title={veiculosList[0].marcaModelo || `${veiculosList[0].marca || ''} ${veiculosList[0].modelo || ''}`.trim()}
                              >
                                {veiculosList[0].marcaModelo || `${veiculosList[0].marca || ''} ${veiculosList[0].modelo || ''}`.trim()}
                              </span>
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => setClienteFrotaModal(cli)}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 active:bg-sky-200 border border-sky-200 transition-colors cursor-pointer group shadow-2xs"
                                title={`Ver todos os ${veiculosList.length} veículos da frota`}
                              >
                                <Car size={13} weight="bold" className="text-sky-600" />
                                <span>Frota com {veiculosList.length} veículos</span>
                                <ArrowSquareOut
                                  size={12}
                                  weight="bold"
                                  className="text-sky-500 group-hover:text-sky-700 group-hover:translate-x-0.5 transition-transform"
                                />
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1 font-medium text-slate-800">
                          <MapPin size={13} className="text-slate-400" />
                          <span>
                            {cli.cidade || 'Apucarana'} - {cli.uf || 'PR'}
                          </span>
                        </div>
                        {cli.bairro && (
                          <div className="text-slate-400 text-[10px] pl-4 truncate max-w-[160px]">
                            {cli.bairro}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleAlternarStatus(cli.value || cli.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                            cli.ativo !== false
                              ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Clique para alternar o status"
                        >
                          {cli.ativo !== false ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                              <span>Ativo</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              <span>Inativo</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => handleAbrirEditar(cli)}
                            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                            title="Editar Cliente"
                          >
                            <PencilSimple size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleExcluirCliente(cli.value || cli.id, cli.nome)
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Excluir Cliente"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Cadastro e Edição */}
      <ClienteModalForm
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSalvar={handleSalvarCliente}
        clienteParaEditar={clienteEmEdicao}
      />

      {/* Modal de Visualização da Frota de Veículos */}
      <ClienteFrotaModal
        isOpen={!!clienteFrotaModal}
        onClose={() => setClienteFrotaModal(null)}
        cliente={clienteFrotaModal}
        onEditarCliente={(cli) => {
          setClienteFrotaModal(null)
          handleAbrirEditar(cli)
        }}
      />
    </div>
  )
}
