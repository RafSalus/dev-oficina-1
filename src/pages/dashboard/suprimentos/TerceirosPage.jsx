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
  Tag,
  Package,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarTerceirosCadastrados,
  salvarTerceirosCadastrados,
  CATEGORIAS_FORNECEDOR_OPCOES,
  RAMOS_FORNECEDOR_OPCOES,
} from '../../../constants/cadastrosSuprimentosData'
import { formatarCNPJ, formatarTelefone } from '../../../utils/fiscalValidators'
import { TerceiroModalForm } from '../../../components/suprimentos/TerceiroModalForm'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { MobileTerceirosPage } from './mobile/MobileTerceirosPage'

export function TerceirosPage() {
  const isMobile = useIsMobile()
  const [fornecedores, setFornecedores] = useState([])
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('TODOS')
  const [filtroRamo, setFiltroRamo] = useState('TODOS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')

  const [modalAberto, setModalAberto] = useState(false)
  const [fornecedorEmEdicao, setFornecedorEmEdicao] = useState(null)

  // Carrega do localStorage ao montar
  useEffect(() => {
    const dados = carregarTerceirosCadastrados()
    setFornecedores(dados)

    const handleStorageChange = () => {
      setFornecedores(carregarTerceirosCadastrados())
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Métricas rápidas
  const metricas = useMemo(() => {
    const total = fornecedores.length
    const ativos = fornecedores.filter((t) => t.ativo).length
    const totalAutoPecas = fornecedores.filter(
      (t) =>
        t.categoriaFornecedor === 'Autopeças' ||
        t.categoriaFornecedor === 'Distribuidora' ||
        t.categoriaFornecedor === 'Ambos' ||
        t.tipoServico?.toLowerCase().includes('peça') ||
        t.tipoServico?.toLowerCase().includes('distribuidora')
    ).length
    const totalServicos = fornecedores.filter(
      (t) =>
        t.categoriaFornecedor === 'Serviços Externos' ||
        (!t.categoriaFornecedor && !t.tipoServico?.toLowerCase().includes('peça'))
    ).length
    const cidades = new Set(
      fornecedores
        .map((t) => t.cidade || t.endereco?.cidade)
        .filter(Boolean)
    ).size

    return {
      total,
      ativos,
      totalAutoPecas,
      totalServicos,
      cidades,
    }
  }, [fornecedores])

  // Filtragem da listagem
  const fornecedoresFiltrados = useMemo(() => {
    return fornecedores.filter((forn) => {
      // Filtro de busca textual
      const termo = busca.toLowerCase().trim()
      const matchBusca =
        !termo ||
        forn.razaoSocial?.toLowerCase().includes(termo) ||
        forn.nomeFantasia?.toLowerCase().includes(termo) ||
        forn.cnpj?.toLowerCase().includes(termo) ||
        forn.contatoNome?.toLowerCase().includes(termo) ||
        forn.contato?.nome?.toLowerCase().includes(termo) ||
        forn.contatoTelefone?.toLowerCase().includes(termo) ||
        forn.cidade?.toLowerCase().includes(termo) ||
        forn.endereco?.cidade?.toLowerCase().includes(termo)

      // Filtro por Categoria
      const cat = forn.categoriaFornecedor || 'Serviços Externos'
      const matchCategoria =
        filtroCategoria === 'TODOS' || cat === filtroCategoria

      // Filtro por Ramo
      const matchRamo =
        filtroRamo === 'TODOS' || forn.tipoServico === filtroRamo

      // Filtro por Status
      const matchStatus =
        filtroStatus === 'TODOS' ||
        (filtroStatus === 'ATIVOS' && forn.ativo) ||
        (filtroStatus === 'INATIVOS' && !forn.ativo)

      return matchBusca && matchCategoria && matchRamo && matchStatus
    })
  }, [fornecedores, busca, filtroCategoria, filtroRamo, filtroStatus])

  // Abertura do formulário
  const handleAbrirNovo = () => {
    setFornecedorEmEdicao(null)
    setModalAberto(true)
  }

  const handleAbrirEditar = (fornecedor) => {
    setFornecedorEmEdicao(fornecedor)
    setModalAberto(true)
  }

  // Salvar fornecedor
  const handleSalvarFornecedor = (dadosFornecedor) => {
    let novaLista = []
    const existe = fornecedores.some((t) => t.id === dadosFornecedor.id)

    if (existe) {
      novaLista = fornecedores.map((t) => (t.id === dadosFornecedor.id ? dadosFornecedor : t))
      toast.success(
        `Fornecedor "${dadosFornecedor.nomeFantasia || dadosFornecedor.razaoSocial}" atualizado com sucesso!`
      )
    } else {
      novaLista = [dadosFornecedor, ...fornecedores]
      toast.success(
        `Fornecedor "${dadosFornecedor.nomeFantasia || dadosFornecedor.razaoSocial}" cadastrado com sucesso!`
      )
    }

    setFornecedores(novaLista)
    salvarTerceirosCadastrados(novaLista)
  }

  // Alternar status
  const handleAlternarStatus = (id) => {
    const novaLista = fornecedores.map((t) => {
      if (t.id === id) {
        const novoStatus = !t.ativo
        toast.info(`Status do fornecedor alterado para ${novoStatus ? 'Ativo' : 'Inativo'}.`)
        return { ...t, ativo: novoStatus }
      }
      return t
    })
    setFornecedores(novaLista)
    salvarTerceirosCadastrados(novaLista)
  }

  // Excluir fornecedor
  const handleExcluirFornecedor = (id, nome) => {
    toast(`Excluir o fornecedor "${nome}"?`, {
      description: 'Esta operação removerá o fornecedor homologado do cadastro.',
      action: {
        label: 'Confirmar',
        onClick: () => {
          setFornecedores((prev) => {
            const novaLista = prev.filter((t) => t.id !== id)
            salvarTerceirosCadastrados(novaLista)
            return novaLista
          })
          toast.success(`Fornecedor "${nome}" excluído.`)
        },
      },
    })
  }

  const opcoesFiltroCategoria = [
    { value: 'TODOS', label: 'Todas as Categorias' },
    ...CATEGORIAS_FORNECEDOR_OPCOES,
  ]

  const opcoesFiltroRamo = [
    { value: 'TODOS', label: 'Todos os Ramos' },
    ...RAMOS_FORNECEDOR_OPCOES,
  ]

  const opcoesFiltroStatus = [
    { value: 'TODOS', label: 'Todos os Status' },
    { value: 'ATIVOS', label: 'Somente Ativos' },
    { value: 'INATIVOS', label: 'Somente Inativos' },
  ]

  if (isMobile) {
    return <MobileTerceirosPage />
  }

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
                <span>Fornecedores</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {metricas.total}
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Cadastro e gestão de fornecedores de autopeças, distribuidores e parceiros terceirizados de serviços
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
            <span>Novo Fornecedor</span>
          </button>
        </div>

        {/* Resumo de Indicadores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Total de Fornecedores
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.total}</span>
            </div>
            <Buildings size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Autopeças e Insumos
              </span>
              <span className="text-base font-bold text-sky-700">{metricas.totalAutoPecas}</span>
            </div>
            <Package size={20} className="text-sky-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Serviços Terceirizados
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.totalServicos}</span>
            </div>
            <ShieldCheck size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Fornecedores Ativos
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.ativos}</span>
            </div>
            <CheckCircle size={20} className="text-slate-400" />
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
          <div className="w-full md:w-56">
            <Select
              value={opcoesFiltroCategoria.find((opt) => opt.value === filtroCategoria)}
              onChange={(opt) => setFiltroCategoria(opt ? opt.value : 'TODOS')}
              options={opcoesFiltroCategoria}
              styles={customSelectStyles}
              placeholder="Categoria"
              isSearchable={false}
            />
          </div>

          <div className="w-full md:w-56">
            <Select
              value={opcoesFiltroRamo.find((opt) => opt.value === filtroRamo)}
              onChange={(opt) => setFiltroRamo(opt ? opt.value : 'TODOS')}
              options={opcoesFiltroRamo}
              styles={customSelectStyles}
              placeholder="Ramo"
              isSearchable={false}
            />
          </div>

          <div className="w-full md:w-44">
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

      {/* Tabela de Fornecedores com Scroll Oculto (Regra 11) */}
      <div className="flex-1 overflow-auto no-scrollbar p-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {fornecedoresFiltrados.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Buildings size={24} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Nenhum fornecedor encontrado</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {busca || filtroCategoria !== 'TODOS' || filtroRamo !== 'TODOS' || filtroStatus !== 'TODOS'
                  ? 'Nenhum resultado corresponde aos filtros aplicados.'
                  : 'Nenhum fornecedor ou parceiro cadastrado ainda.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3 px-4">Empresa Fornecedora</th>
                  <th className="py-3 px-4">Categoria e Ramo</th>
                  <th className="py-3 px-4">CNPJ e Inscrição</th>
                  <th className="py-3 px-4">Contato Principal</th>
                  <th className="py-3 px-4">Localização</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {fornecedoresFiltrados.map((forn) => {
                  const foneOriginal = forn.contatoTelefone || forn.contato?.telefone || ''
                  const foneNumeros = foneOriginal.replace(/\D/g, '')
                  const nomeContato = forn.contatoNome || forn.contato?.nome || '-'
                  const emailContato = forn.contatoEmail || forn.contato?.email || ''
                  const cidadeContato = forn.cidade || forn.endereco?.cidade || 'Apucarana'
                  const ufContato = forn.uf || forn.endereco?.uf || 'PR'
                  const bairroContato = forn.bairro || forn.endereco?.bairro || ''
                  const logradouroContato = forn.logradouro || forn.endereco?.logradouro || ''
                  const categoriaForn = forn.categoriaFornecedor || 'Serviços Externos'
                  const isAutoPeca =
                    categoriaForn === 'Autopeças' ||
                    categoriaForn === 'Distribuidora' ||
                    forn.tipoServico?.toLowerCase().includes('peça')

                  return (
                    <tr
                      key={forn.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900">
                          {forn.nomeFantasia || forn.razaoSocial}
                        </div>
                        {forn.nomeFantasia && forn.nomeFantasia !== forn.razaoSocial && (
                          <div className="text-[11px] text-slate-500 truncate">
                            {forn.razaoSocial}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                              isAutoPeca
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {categoriaForn}
                          </span>
                          <span className="text-[11px] font-medium text-slate-600">
                            {forn.tipoServico || 'Geral'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        <div className="font-semibold">{formatarCNPJ(forn.cnpj)}</div>
                        <div className="text-slate-400 text-[10px]">
                          IE: {forn.inscricaoEstadual || 'ISENTO'}
                          {forn.inscricaoMunicipal && ` • IM: ${forn.inscricaoMunicipal}`}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-900">
                          <User size={13} className="text-slate-400" />
                          <span>{nomeContato}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[11px] text-slate-600">
                            {formatarTelefone(foneOriginal)}
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
                        {emailContato && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                            {emailContato}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1 font-medium text-slate-800">
                          <MapPin size={13} className="text-slate-400" />
                          <span>
                            {cidadeContato} - {ufContato}
                          </span>
                        </div>
                        {bairroContato && (
                          <div className="text-slate-400 text-[10px] pl-4 truncate max-w-[180px]">
                            {bairroContato}
                            {logradouroContato && `, ${logradouroContato}`}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleAlternarStatus(forn.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                            forn.ativo
                              ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Clique para alternar o status"
                        >
                          {forn.ativo ? (
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
                            onClick={() => handleAbrirEditar(forn)}
                            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                            title="Editar Fornecedor"
                          >
                            <PencilSimple size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleExcluirFornecedor(
                                forn.id,
                                forn.nomeFantasia || forn.razaoSocial
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Excluir Fornecedor"
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
        onSalvar={handleSalvarFornecedor}
        terceiroParaEditar={fornecedorEmEdicao}
      />
    </div>
  )
}
