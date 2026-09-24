import React, { useState } from 'react'
import Select from 'react-select'
import {
  Users,
  Plus,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  CheckCircle,
  XCircle,
  Briefcase,
  Wrench,
  Percent,
  Clock,
  Phone,
  EnvelopeSimple,
  ShieldCheck,
} from '@phosphor-icons/react'
import { useFuncionarios } from './hooks/useFuncionarios'
import { FuncionarioModal } from './components/FuncionarioModal'
import { ModalConfirmacao } from '../../../components/ModalConfirmacao'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'
import { CARGOS_FUNCIONARIO_OPCOES } from '../../../repositories/funcionariosRepository'

export function FuncionariosPage() {
  const {
    funcionariosFiltrados,
    carregando,
    filtroCargo,
    setFiltroCargo,
    filtroStatus,
    setFiltroStatus,
    termoBusca,
    setTermoBusca,
    metricas,
    salvar,
    alternarStatus,
    excluir,
    criarAcesso,
    criandoAcessoId,
  } = useFuncionarios()

  const [modalAberto, setModalAberto] = useState(false)
  const [funcionarioEmEdicao, setFuncionarioEmEdicao] = useState(null)
  const [funcionarioParaExcluir, setFuncionarioParaExcluir] = useState(null)

  const handleAbrirNovo = () => {
    setFuncionarioEmEdicao(null)
    setModalAberto(true)
  }

  const handleEditar = (funcionario) => {
    setFuncionarioEmEdicao(funcionario)
    setModalAberto(true)
  }

  const handleConfirmarExclusao = async () => {
    if (!funcionarioParaExcluir) return
    await excluir(funcionarioParaExcluir.id, funcionarioParaExcluir.nome)
    setFuncionarioParaExcluir(null)
  }

  // Opções para os selects de filtro
  const opcoesFiltroCargo = [
    { value: 'TODOS', label: 'Todos os Cargos' },
    ...CARGOS_FUNCIONARIO_OPCOES,
  ]

  const opcoesFiltroStatus = [
    { value: 'TODOS', label: 'Todos os Status' },
    { value: 'ATIVO', label: 'Somente Ativos' },
    { value: 'INATIVO', label: 'Somente Inativos' },
  ]

  const cargoSelecionado = opcoesFiltroCargo.find((opt) => opt.value === filtroCargo)
  const statusSelecionado = opcoesFiltroStatus.find((opt) => opt.value === filtroStatus)

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center border border-sky-100 shrink-0">
              <Users size={22} weight="bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Quadro de Colaboradores</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {metricas.total}
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Gestão da equipe técnica, administrativa e gerencial da Mecânica Gabriel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAbrirNovo}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            <span>Novo Colaborador</span>
          </button>
        </div>

        {/* Resumo de Indicadores */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Total na Equipe
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.total}</span>
            </div>
            <Users size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Mecânicos no Pátio
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.mecanicos} ativos</span>
            </div>
            <Wrench size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Atendimento & Recepção
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.secretarias} ativos</span>
            </div>
            <Briefcase size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Média Comissões (MO)
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.mediaComissaoServicos}%</span>
            </div>
            <Percent size={20} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass
              size={16}
              weight="bold"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Buscar por nome, CPF, cargo, telefone ou especialidade..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-base sm:text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
            />
            {termoBusca && (
              <button
                type="button"
                onClick={() => setTermoBusca('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="w-full sm:w-56">
            <Select
              options={opcoesFiltroCargo}
              value={cargoSelecionado}
              onChange={(opt) => setFiltroCargo(opt ? opt.value : 'TODOS')}
              styles={customSelectStyles}
              isSearchable={false}
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              options={opcoesFiltroStatus}
              value={statusSelecionado}
              onChange={(opt) => setFiltroStatus(opt ? opt.value : 'TODOS')}
              styles={customSelectStyles}
              isSearchable={false}
            />
          </div>
        </div>
      </div>

      {/* Conteúdo Principal Rolável (sem scroll horizontal ou global na página) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 sm:p-6">
        {carregando ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
            <div className="w-8 h-8 border-2 border-[#0284c7] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Carregando quadro de colaboradores...</span>
          </div>
        ) : funcionariosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Users size={24} weight="bold" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Nenhum colaborador encontrado</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Não encontramos nenhum funcionário com os filtros atuais. Tente ajustar o termo de busca ou adicione um novo membro à equipe.
            </p>
            <button
              type="button"
              onClick={handleAbrirNovo}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus size={14} weight="bold" />
              <span>Cadastrar Colaborador</span>
            </button>
          </div>
        ) : (
          <>
            {/* Visão Desktop: Tabela de Dados Completa */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Colaborador</th>
                    <th className="py-3 px-4">Função / Cargo</th>
                    <th className="py-3 px-4">Box / Posto</th>
                    <th className="py-3 px-4">Contato</th>
                    <th className="py-3 px-4 text-center">Comissões</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {funcionariosFiltrados.map((func) => (
                    <tr
                      key={func.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Colaborador */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200 group-hover:border-[#0284c7]/40 group-hover:text-[#0284c7] transition-colors">
                            {func.nome.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">
                              {func.nome}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              CPF: {func.cpf || 'Não informado'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cargo / Especialidade */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {func.cargoLabel || func.cargo}
                        </span>
                        {func.especialidade ? (
                          <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                            {func.especialidade}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Geral</span>
                        )}
                      </td>

                      {/* Box / Pátio */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 font-medium">
                          {func.boxElevador || 'Geral'}
                        </span>
                        {func.horarioTrabalho && (
                          <span className="text-[11px] text-slate-400 block">
                            {func.horarioTrabalho}
                          </span>
                        )}
                      </td>

                      {/* Contato */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {func.telefone && (
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Phone size={12} className="text-slate-400 shrink-0" />
                              <span>{func.telefone}</span>
                            </div>
                          )}
                          {func.email && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <EnvelopeSimple size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate max-w-[180px]">{func.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Comissões */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-700">
                          <span>MO: {Number(func.comissaoServicos || 0)}%</span>
                          <span className="text-slate-300">|</span>
                          <span>Peças: {Number(func.comissaoPecas || 0)}%</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => alternarStatus(func.id, func.ativo)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            func.ativo
                              ? 'bg-sky-50 text-[#0284c7] border border-sky-200 hover:bg-sky-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Clique para alternar o status do colaborador"
                        >
                          {func.ativo ? (
                            <CheckCircle size={13} weight="fill" />
                          ) : (
                            <XCircle size={13} weight="fill" />
                          )}
                          <span>{func.ativo ? 'Ativo' : 'Inativo'}</span>
                        </button>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {func.authUserId ? (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200"
                              title="Este colaborador já possui acesso de login"
                            >
                              <ShieldCheck size={13} weight="fill" />
                              <span>Acesso ativo</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => criarAcesso(func)}
                              disabled={criandoAcessoId === func.id}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] font-bold text-[#0284c7] bg-sky-50 border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                              title={func.email ? 'Enviar convite de acesso por e-mail' : 'Cadastre um e-mail para habilitar'}
                            >
                              <ShieldCheck size={13} weight="bold" />
                              <span>{criandoAcessoId === func.id ? 'Enviando...' : 'Criar acesso'}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleEditar(func)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#0284c7] hover:bg-sky-50 transition-colors cursor-pointer"
                            title="Editar colaborador"
                          >
                            <PencilSimple size={16} weight="bold" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setFuncionarioParaExcluir(func)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remover colaborador"
                          >
                            <Trash size={16} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Visão Mobile: Cards Compactos e Responsivos (Single Logic Adaptive UI) */}
            <div className="block md:hidden space-y-3">
              {funcionariosFiltrados.map((func) => (
                <div
                  key={func.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                        {func.nome.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {func.nome}
                        </h4>
                        <span className="text-[11px] font-semibold text-[#0284c7] block">
                          {func.cargoLabel || func.cargo}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => alternarStatus(func.id, func.ativo)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        func.ativo
                          ? 'bg-sky-50 text-[#0284c7] border border-sky-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {func.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>

                  {/* Detalhes rápidos */}
                  <div className="bg-slate-50 rounded-xl p-2.5 space-y-1 text-xs text-slate-600 border border-slate-100">
                    {func.cpf && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">CPF:</span>
                        <span className="font-mono font-medium">{func.cpf}</span>
                      </div>
                    )}
                    {func.telefone && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Telefone:</span>
                        <span className="font-medium">{func.telefone}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Comissão:</span>
                      <span className="font-bold text-slate-800">
                        MO {Number(func.comissaoServicos || 0)}% / Peças {Number(func.comissaoPecas || 0)}%
                      </span>
                    </div>
                  </div>

                  {/* Ações no Card */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 flex-wrap">
                    {func.authUserId ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        <ShieldCheck size={14} weight="fill" />
                        <span>Acesso ativo</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => criarAcesso(func)}
                        disabled={criandoAcessoId === func.id}
                        className="px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50 text-xs font-bold text-[#0284c7] hover:bg-sky-100 flex items-center gap-1 disabled:opacity-50"
                      >
                        <ShieldCheck size={14} weight="bold" />
                        <span>{criandoAcessoId === func.id ? 'Enviando...' : 'Criar acesso'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleEditar(func)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                    >
                      <PencilSimple size={14} weight="bold" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFuncionarioParaExcluir(func)}
                      className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-600 hover:bg-red-100 flex items-center gap-1"
                    >
                      <Trash size={14} weight="bold" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de Cadastro / Edição Categoria B */}
      <FuncionarioModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSalvar={salvar}
        funcionarioParaEditar={funcionarioEmEdicao}
      />

      {/* Diálogo de Confirmação de Exclusão (Regra 16) */}
      <ModalConfirmacao
        isOpen={Boolean(funcionarioParaExcluir)}
        onClose={() => setFuncionarioParaExcluir(null)}
        onConfirm={handleConfirmarExclusao}
        titulo="Excluir Colaborador"
        descricao="Tem certeza que deseja remover este membro da equipe? Esta ação não pode ser desfeita."
        itemDestaque={funcionarioParaExcluir?.nome}
        textoConfirmar="Sim, Excluir Colaborador"
        textoCancelar="Cancelar"
        variante="perigo"
      />
    </div>
  )
}
