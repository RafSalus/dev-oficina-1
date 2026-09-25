import React, { useState } from 'react'
import Select from 'react-select'
import {
  Users,
  Plus,
  MagnifyingGlass,
  FunnelSimple,
  Car,
  MapPin,
  WhatsappLogo,
  ArrowSquareOut,
} from '@phosphor-icons/react'
import { formatarCPF, formatarCNPJ, formatarTelefone } from '../../../../utils/fiscalValidators'
import { mobileSelectStyles, inputBaseClass } from '../../nova-os/mobile/mobileSelectStyles'
import {
  useClientesWorkflow,
  FILTRO_TIPO_OPCOES,
  FILTRO_STATUS_OPCOES,
  FILTRO_VEICULOS_OPCOES,
} from '../../../../hooks/useClientesWorkflow'
import { MobileClienteFormModal } from './MobileClienteFormModal'
import { MobileClienteFrotaModal } from './MobileClienteFrotaModal'

function StatChip({ label, value, dark }) {
  return (
    <div
      className={`shrink-0 min-w-[104px] rounded-xl border p-2.5 ${
        dark ? 'bg-[#101828] border-[#101828]' : 'bg-white border-[#d0d5dd]'
      }`}
    >
      <p
        className={`text-[9.5px] font-bold uppercase tracking-wider ${
          dark ? 'text-zinc-400' : 'text-[#667085]'
        }`}
      >
        {label}
      </p>
      <p
        className={`text-sm font-extrabold mt-0.5 ${
          dark ? 'text-white' : 'text-[#101828]'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function ClienteCard({ cliente, onClick, onVerFrota }) {
  const docLimpo = (cliente.documento || '').replace(/\D/g, '')
  const isPF =
    cliente.tipoPessoa === 'F' || (!cliente.tipoPessoa && docLimpo.length <= 11)
  const docFormatado = isPF ? formatarCPF(docLimpo) : formatarCNPJ(docLimpo)
  const foneNumeros = (cliente.telefone || '').replace(/\D/g, '')
  const veiculosList = cliente.veiculos || []

  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5">
      <button type="button" onClick={onClick} className="w-full text-left">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {cliente.codigoCliente && (
              <span className="font-mono text-[10px] font-bold text-[#344054] bg-[#f2f4f7] px-1.5 py-0.5 rounded border border-[#e4e7ec] shrink-0">
                {cliente.codigoCliente}
              </span>
            )}
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isPF
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'bg-[#f2f4f7] text-[#344054] border border-[#e4e7ec]'
              }`}
            >
              {isPF ? 'PF' : 'PJ'}
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
              cliente.ativo !== false
                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                : 'bg-[#f2f4f7] text-[#667085] border border-[#e4e7ec]'
            }`}
          >
            {cliente.ativo !== false ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <p className="text-sm font-extrabold text-[#101828] truncate">{cliente.nome}</p>
        {cliente.nomeFantasia && cliente.nomeFantasia !== cliente.nome && (
          <p className="text-[10.5px] text-[#667085] truncate">{cliente.nomeFantasia}</p>
        )}
        <p className="font-mono text-[10.5px] text-[#344054] mt-1">{docFormatado || cliente.documento}</p>

        <div className="flex items-center gap-1 text-[10.5px] text-[#667085] mt-1.5">
          <MapPin size={11} />
          {cliente.cidade || 'Apucarana'} - {cliente.uf || 'PR'}
        </div>
      </button>

      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#f2f4f7]">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-mono text-[11px] font-semibold text-[#344054]">
            {formatarTelefone(cliente.telefone)}
          </span>
        </div>
        {foneNumeros && (
          <a
            href={`https://wa.me/55${foneNumeros}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#25D366] text-white text-[10.5px] font-bold shrink-0"
          >
            <WhatsappLogo size={12} weight="fill" />
            WhatsApp
          </a>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-[#f2f4f7]">
        {veiculosList.length === 0 ? (
          <span className="text-[10.5px] text-[#98a2b3] italic">Nenhum veículo vinculado</span>
        ) : veiculosList.length === 1 ? (
          <div className="flex items-center gap-1.5">
            <Car size={13} className="text-[#0284c7]" />
            <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-[#f2f4f7] border border-[#e4e7ec] text-[#344054]">
              {veiculosList[0].placa}
            </span>
            <span className="text-[10.5px] font-semibold text-[#344054] truncate">
              {veiculosList[0].marcaModelo || `${veiculosList[0].marca || ''} ${veiculosList[0].modelo || ''}`.trim()}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onVerFrota(cliente)
            }}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10.5px] font-bold text-sky-700 bg-sky-50 border border-sky-200"
          >
            <Car size={13} weight="bold" />
            Frota com {veiculosList.length} veículos
            <ArrowSquareOut size={11} weight="bold" />
          </button>
        )}
      </div>
    </div>
  )
}

export function MobileClientesPage() {
  const workflow = useClientesWorkflow()
  const {
    metricas,
    busca,
    setBusca,
    filtroTipo,
    setFiltroTipo,
    filtroStatus,
    setFiltroStatus,
    filtroVeiculos,
    setFiltroVeiculos,
    filtrosAtivos,
    clientesFiltrados,
    modalAberto,
    abrirNovo,
    abrirEditar,
    fecharModal,
    clienteEmEdicao,
    clienteFrotaModal,
    abrirFrota,
    fecharFrota,
    salvarCliente,
    excluirDireto,
  } = workflow

  const [filtrosAbertos, setFiltrosAbertos] = useState(false)

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-extrabold text-[#101828] flex items-center gap-1.5">
            <Users size={16} className="text-[#0284c7]" weight="bold" />
            Clientes e Frotistas
          </h1>
          <p className="text-[11px] text-[#667085] truncate">Base cadastral, veículos e contatos</p>
        </div>
        <button
          type="button"
          onClick={abrirNovo}
          aria-label="Novo Cliente"
          className="w-11 h-11 rounded-xl bg-black active:bg-zinc-800 text-white flex items-center justify-center shrink-0"
        >
          <Plus size={18} weight="bold" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 -mx-4 px-4">
        <StatChip label="Total" value={metricas.total} dark />
        <StatChip label="Pessoa Física" value={metricas.totalPF} />
        <StatChip label="Pessoa Jurídica" value={metricas.totalPJ} />
        <StatChip label="Veículos" value={metricas.totalVeiculos} />
      </div>

      <div className="relative mb-2.5">
        <MagnifyingGlass
          size={16}
          weight="bold"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none"
        />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar nome, CPF/CNPJ, telefone ou placa..."
          className={`${inputBaseClass} pl-10`}
        />
      </div>

      <button
        type="button"
        onClick={() => setFiltrosAbertos((v) => !v)}
        className={`w-full h-10 mb-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
          filtrosAtivos
            ? 'border-[#0284c7] text-[#0284c7] bg-[#e0f2fe]'
            : 'border-[#d0d5dd] text-[#344054] bg-white'
        }`}
      >
        <FunnelSimple size={15} weight="bold" />
        Filtros {filtrosAtivos ? '(ativos)' : ''}
      </button>

      {filtrosAbertos && (
        <div className="space-y-2 mb-3">
          <Select
            value={FILTRO_TIPO_OPCOES.find((o) => o.value === filtroTipo)}
            onChange={(opt) => setFiltroTipo(opt ? opt.value : 'TODOS')}
            options={FILTRO_TIPO_OPCOES}
            isSearchable={false}
            styles={mobileSelectStyles}
            placeholder="Tipo de Pessoa"
          />
          <Select
            value={FILTRO_VEICULOS_OPCOES.find((o) => o.value === filtroVeiculos)}
            onChange={(opt) => setFiltroVeiculos(opt ? opt.value : 'TODOS')}
            options={FILTRO_VEICULOS_OPCOES}
            isSearchable={false}
            styles={mobileSelectStyles}
            placeholder="Veículos"
          />
          <Select
            value={FILTRO_STATUS_OPCOES.find((o) => o.value === filtroStatus)}
            onChange={(opt) => setFiltroStatus(opt ? opt.value : 'TODOS')}
            options={FILTRO_STATUS_OPCOES}
            isSearchable={false}
            styles={mobileSelectStyles}
            placeholder="Status"
          />
        </div>
      )}

      {clientesFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
            <Users size={22} weight="duotone" />
          </div>
          <p className="text-sm font-bold text-[#101828]">Nenhum cliente encontrado</p>
          <p className="text-xs text-[#667085] max-w-[260px] mt-1">
            {busca || filtrosAtivos
              ? 'Ajuste a busca ou os filtros aplicados.'
              : 'Nenhum cliente cadastrado na base ainda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {clientesFiltrados.map((cli) => (
            <ClienteCard
              key={cli.value || cli.id}
              cliente={cli}
              onClick={() => abrirEditar(cli)}
              onVerFrota={abrirFrota}
            />
          ))}
        </div>
      )}

      <MobileClienteFormModal
        isOpen={modalAberto}
        onClose={fecharModal}
        onSalvar={salvarCliente}
        onExcluir={excluirDireto}
        clienteParaEditar={clienteEmEdicao}
      />

      <MobileClienteFrotaModal
        isOpen={Boolean(clienteFrotaModal)}
        onClose={fecharFrota}
        cliente={clienteFrotaModal}
        onEditarCliente={(cli) => {
          fecharFrota()
          abrirEditar(cli)
        }}
      />
    </div>
  )
}
