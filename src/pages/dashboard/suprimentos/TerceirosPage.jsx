import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import {
  Buildings,
  Plus,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  CheckCircle,
  Phone,
  EnvelopeSimple,
  MapPin,
  WhatsappLogo,
  ShieldCheck,
  User,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarTerceirosCadastrados,
  salvarTerceirosCadastrados,
  TIPOS_SERVICO_TERCEIRO_OPCOES,
} from '../../../constants/cadastrosSuprimentosData'
import { formatarCNPJ, formatarTelefone } from '../../../utils/fiscalValidators'
import { TerceiroModalForm } from '../../../components/suprimentos/TerceiroModalForm'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'

export function TerceirosPage() {
  const [terceiros, setTerceiros] = useState([])
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')

  const [modalAberto, setModalAberto] = useState(false)
  const [terceiroEmEdicao, setTerceiroEmEdicao] = useState(null)

  // Carrega do localStorage ao montar
  useEffect(() => {
    const dados = carregarTerceirosCadastrados()
    setTerceiros(dados)

    const handleStorageChange = () => {
      setTerceiros(carregarTerceirosCadastrados())
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Métricas rápidas
  const metricas = useMemo(() => {
    const total = terceiros.length
    const ativos = terceiros.filter((t) => t.ativo).length
    const especialidades = new Set(terceiros.map((t) => t.tipoServico)).size
    const cidades = new Set(terceiros.filter((t) => t.cidade).map((t) => t.cidade)).size

    return {
      total,
      ativos,
      especialidades,
      cidades,
    }
  }, [terceiros])

  // Filtragem da listagem
  const terceirosFiltrados = useMemo(() => {
    return terceiros.filter((terceiro) => {
      // Filtro de busca textual
      const termo = busca.toLowerCase().trim()
      const matchBusca =
        !termo ||
        terceiro.razaoSocial?.toLowerCase().includes(termo) ||
        terceiro.nomeFantasia?.toLowerCase().includes(termo) ||
        terceiro.cnpj?.toLowerCase().includes(termo) ||
        terceiro.contatoNome?.toLowerCase().includes(termo) ||
        terceiro.contatoTelefone?.toLowerCase().includes(termo) ||
        terceiro.cidade?.toLowerCase().includes(termo)

      // Filtro por Especialidade
      const matchTipo =
        filtroTipo === 'TODOS' || terceiro.tipoServico === filtroTipo

      // Filtro por Status
      const matchStatus =
        filtroStatus === 'TODOS' ||
        (filtroStatus === 'ATIVOS' && terceiro.ativo) ||
        (filtroStatus === 'INATIVOS' && !terceiro.ativo)

      return matchBusca && matchTipo && matchStatus
    })
  }, [terceiros, busca, filtroTipo, filtroStatus])

  // Abertura do formulário
  const handleAbrirNovo = () => {
    setTerceiroEmEdicao(null)
    setModalAberto(true)
  }

  const handleAbrirEditar = (terceiro) => {
    setTerceiroEmEdicao(terceiro)
    setModalAberto(true)
  }

  // Salvar terceiro
  const handleSalvarTerceiro = (dadosTerceiro) => {
    let novaLista = []
    const existe = terceiros.some((t) => t.id === dadosTerceiro.id)

    if (existe) {
      novaLista = terceiros.map((t) => (t.id === dadosTerceiro.id ? dadosTerceiro : t))
      toast.success(`Parceiro "${dadosTerceiro.nomeFantasia || dadosTerceiro.razaoSocial}" atualizado com sucesso!`)
    } else {
      novaLista = [dadosTerceiro, ...terceiros]
      toast.success(`Parceiro "${dadosTerceiro.nomeFantasia || dadosTerceiro.razaoSocial}" cadastrado com sucesso!`)
    }

    setTerceiros(novaLista)
    salvarTerceirosCadastrados(novaLista)
  }

  // Alternar status
  const handleAlternarStatus = (id) => {
    const novaLista = terceiros.map((t) => {
      if (t.id === id) {
        const novoStatus = !t.ativo
        toast.info(`Status do parceiro alterado para ${novoStatus ? 'Ativo' : 'Inativo'}.`)
        return { ...t, ativo: novoStatus }
      }
      return t
    })
    setTerceiros(novaLista)
    salvarTerceirosCadastrados(novaLista)
  }

  // Excluir terceiro
  const handleExcluirTerceiro = (id, nome) => {
    toast(`Excluir o parceiro "${nome}"?`, {
      description: 'Esta operação removerá o parceiro homologado do cadastro.',
      action: {
        label: 'Confirmar',
        onClick: () => {
          setTerceiros((prev) => {
            const novaLista = prev.filter((t) => t.id !== id)
            salvarTerceirosCadastrados(novaLista)
            return novaLista
          })
          toast.success(`Parceiro "${nome}" excluído.`)
        },
      },
    })
  }

  const opcoesFiltroTipo = [
    { value: 'TODOS', label: 'Todas as Especialidades' },
    ...TIPOS_SERVICO_TERCEIRO_OPCOES,
  ]

  const opcoesFiltroStatus = [
    { value: 'TODOS', label: 'Todos os Status' },
    { value: 'ATIVOS', label: 'Somente Ativos' },
    { value: 'INATIVOS', label: 'Somente Inativos' },
  ]

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
              <Buildings size={22} weight="bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Terceiros e Parceiros</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {metricas.total}
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Cadastro de oficinas parceiras para prestação de serviços especializados e retífica externa
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
            <span>Novo Terceiro</span>
          </button>
        </div>

        {/* Resumo de Indicadores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Total de Parceiros
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.total}</span>
            </div>
            <Buildings size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Especialidades
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.especialidades}</span>
            </div>
            <ShieldCheck size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Parceiros Ativos
              </span>
              <span className="text-base font-bold text-sky-700">{metricas.ativos}</span>
            </div>
            <CheckCircle size={20} className="text-sky-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Cidades Atendidas
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.cidades}</span>
            </div>
            <MapPin size={20} className="text-slate-400" />
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
            placeholder="Buscar por razão social, nome fantasia, CNPJ, contato ou cidade..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
          />
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-60">
            <Select
              value={opcoesFiltroTipo.find((opt) => opt.value === filtroTipo)}
              onChange={(opt) => setFiltroTipo(opt ? opt.value : 'TODOS')}
              options={opcoesFiltroTipo}
              styles={customSelectStyles}
              placeholder="Especialidade"
              isSearchable={false}
            />
          </div>

          <div className="w-full md:w-48">
            <Select
              value={opcoesFiltroStatus.find((opt) => opt.value === filtroStatus)}
              onChange={(opt) => setFiltroStatus(opt ? opt.value : 'TODOS')}
              options={opcoesFiltroStatus}
              styles={customSelectStyles}
              placeholder="Status"
              isSearchable={false}
            />
          </div>
        </div>
      </div>

      {/* Tabela de Terceiros com Scroll Oculto (Regra 11) */}
      <div className="flex-1 overflow-auto no-scrollbar p-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {terceirosFiltrados.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Buildings size={24} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Nenhum parceiro encontrado</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {busca || filtroTipo !== 'TODOS' || filtroStatus !== 'TODOS'
                  ? 'Nenhum resultado corresponde aos filtros aplicados.'
                  : 'Nenhuma oficina ou parceiro terceiro homologado ainda.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3 px-4">Empresa Parceira</th>
                  <th className="py-3 px-4">CNPJ e Inscrição</th>
                  <th className="py-3 px-4">Especialidade</th>
                  <th className="py-3 px-4">Contato Principal</th>
                  <th className="py-3 px-4">Localização</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {terceirosFiltrados.map((terceiro) => {
                  const foneNumeros = (terceiro.contatoTelefone || '').replace(/\D/g, '')

                  return (
                    <tr
                      key={terceiro.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900">
                          {terceiro.nomeFantasia || terceiro.razaoSocial}
                        </div>
                        {terceiro.nomeFantasia && terceiro.nomeFantasia !== terceiro.razaoSocial && (
                          <div className="text-[11px] text-slate-500 truncate">
                            {terceiro.razaoSocial}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        <div className="font-semibold">{formatarCNPJ(terceiro.cnpj)}</div>
                        <div className="text-slate-400 text-[10px]">
                          IE: {terceiro.inscricaoEstadual || 'ISENTO'}
                          {terceiro.inscricaoMunicipal && ` • IM: ${terceiro.inscricaoMunicipal}`}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                          {terceiro.tipoServico}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-900">
                          <User size={13} className="text-slate-400" />
                          <span>{terceiro.contatoNome}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[11px] text-slate-600">
                            {formatarTelefone(terceiro.contatoTelefone)}
                          </span>
                          {foneNumeros && (
                            <a
                              href={`https://wa.me/55${foneNumeros}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-sm"
                              title="Abrir conversa no WhatsApp"
                            >
                              <WhatsappLogo size={12} weight="fill" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                        {terceiro.contatoEmail && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                            {terceiro.contatoEmail}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1 font-medium text-slate-800">
                          <MapPin size={13} className="text-slate-400" />
                          <span>
                            {terceiro.cidade || 'São Paulo'} - {terceiro.uf || 'SP'}
                          </span>
                        </div>
                        {terceiro.bairro && (
                          <div className="text-slate-400 text-[10px] pl-4">
                            {terceiro.bairro}
                            {terceiro.logradouro && `, ${terceiro.logradouro}`}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleAlternarStatus(terceiro.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                            terceiro.ativo
                              ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Clique para alternar o status"
                        >
                          {terceiro.ativo ? (
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
                            onClick={() => handleAbrirEditar(terceiro)}
                            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                            title="Editar Parceiro"
                          >
                            <PencilSimple size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleExcluirTerceiro(
                                terceiro.id,
                                terceiro.nomeFantasia || terceiro.razaoSocial
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Excluir Parceiro"
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
      <TerceiroModalForm
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSalvar={handleSalvarTerceiro}
        terceiroParaEditar={terceiroEmEdicao}
      />
    </div>
  )
}
