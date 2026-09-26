import Select from 'react-select'
import { Tag, User, Car, Phone, WhatsappLogo, MapPin, Plus, CalendarBlank } from '@phosphor-icons/react'
import { formatarCPF, formatarCNPJ, formatarTelefone } from '../../../../../utils/fiscalValidators'
import { ClienteModalForm } from '../../../../../components/clientes/ClienteModalForm'
import { VeiculoModalForm } from '../../../../../components/veiculos/VeiculoModalForm'
import {
  SecaoForm,
  Campo,
  inputClass,
  selectStylesPortal,
  NIVEIS_COMBUSTIVEL,
  TIPO_ATENDIMENTO_OPCOES,
  PRIORIDADE_OPCOES,
  CANAL_ENTRADA_OPCOES,
} from '../formularioAberturaShared'
import { useClienteVeiculoSelecao } from './useClienteVeiculoSelecao'

export function AbaClienteVeiculo({ formData, updateFormData }) {
  const {
    modalNovoClienteAberto,
    setModalNovoClienteAberto,
    modalNovoVeiculoAberto,
    setModalNovoVeiculoAberto,
    clientesOptions,
    selectedClienteOption,
    veiculosOptions,
    selectedVeiculoOption,
    handleSelectCliente,
    handleSelectVeiculo,
    handleSalvarNovoCliente,
    handleSalvarNovoVeiculo,
    somarDias,
    foneLimpo,
    carregandoClientes,
  } = useClienteVeiculoSelecao(formData, updateFormData)

  return (
    <>
      {/* 1. CLASSIFICACAO DO ATENDIMENTO */}
      <SecaoForm icone={Tag} titulo="Classificacao do Atendimento">
        <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4 gap-3">
          <Campo label="Tipo de Atendimento">
            <Select
              options={TIPO_ATENDIMENTO_OPCOES}
              value={TIPO_ATENDIMENTO_OPCOES.find((o) => o.value === formData.tipoAtendimento) || TIPO_ATENDIMENTO_OPCOES[0]}
              onChange={(opt) => updateFormData({ tipoAtendimento: opt?.value || 'orcamento' })}
              styles={selectStylesPortal}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              isSearchable={false}
            />
          </Campo>
          <Campo label="Prioridade">
            <Select
              options={PRIORIDADE_OPCOES}
              value={PRIORIDADE_OPCOES.find((o) => o.value === formData.prioridade) || PRIORIDADE_OPCOES[0]}
              onChange={(opt) => updateFormData({ prioridade: opt?.value || 'normal' })}
              styles={selectStylesPortal}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              isSearchable={false}
            />
          </Campo>
          <Campo label="Canal de Entrada">
            <Select
              options={CANAL_ENTRADA_OPCOES}
              value={CANAL_ENTRADA_OPCOES.find((o) => o.value === formData.canalEntrada) || CANAL_ENTRADA_OPCOES[0]}
              onChange={(opt) => updateFormData({ canalEntrada: opt?.value || 'presencial' })}
              styles={selectStylesPortal}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              isSearchable={false}
            />
          </Campo>
          <Campo label="Previsao de Entrega">
            <div className="flex items-center gap-1">
              <div className="relative flex-1">
                <CalendarBlank size={14} weight="bold" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#0284c7]" />
                <input
                  type="text"
                  value={formData.previsaoEntregaData}
                  onChange={(e) => updateFormData({ previsaoEntregaData: e.target.value })}
                  placeholder="DD/MM/AAAA"
                  className={`${inputClass} pl-8`}
                />
              </div>
              <button
                type="button"
                onClick={() => updateFormData({ previsaoEntregaData: somarDias(1) })}
                title="Amanha"
                className="h-9.5 px-2 rounded-xl bg-[#f8fafc] hover:bg-[#e0f2fe] text-[#0284c7] font-black text-[10px] border border-[#d0d5dd] cursor-pointer shrink-0"
              >
                +1d
              </button>
            </div>
          </Campo>
        </div>
      </SecaoForm>

      {/* 2. CLIENTE */}
      <SecaoForm
        icone={User}
        titulo="Cliente"
        acessorio={
          <button
            type="button"
            onClick={() => setModalNovoClienteAberto(true)}
            className="h-7 px-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs transition-all active:scale-95"
          >
            <Plus size={11} weight="bold" />
            <span>Novo Cliente</span>
          </button>
        }
      >
        <Select
          options={clientesOptions}
          value={selectedClienteOption}
          onChange={handleSelectCliente}
          isLoading={carregandoClientes}
          placeholder={carregandoClientes ? 'Carregando clientes...' : 'Pesquise por nome, telefone, CPF ou placa...'}
          isClearable
          isSearchable
          styles={selectStylesPortal}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          noOptionsMessage={() => (carregandoClientes ? 'Carregando clientes...' : 'Nenhum cliente localizado')}
        />

        {formData.cliente && (
          <div className="grid grid-cols-1 @sm:grid-cols-3 gap-3 pt-1">
            <Campo label="Nome">
              <div className="h-9.5 px-3 rounded-xl border border-[#e4e7ec] bg-[#f8fafc] flex items-center text-xs font-bold text-[#101828] truncate">
                {formData.cliente}
              </div>
            </Campo>
            <Campo label="Documento">
              <div className="h-9.5 px-3 rounded-xl border border-[#e4e7ec] bg-[#f8fafc] flex items-center text-xs font-mono font-semibold text-[#475467]">
                {formData.documento
                  ? formData.documento.length > 14
                    ? formatarCNPJ(formData.documento)
                    : formatarCPF(formData.documento)
                  : 'Nao informado'}
              </div>
            </Campo>
            <Campo label="Telefone">
              <div className="h-9.5 px-3 rounded-xl border border-[#e4e7ec] bg-[#f8fafc] flex items-center justify-between text-xs font-semibold text-[#475467]">
                <span className="flex items-center gap-1 truncate">
                  <Phone size={12} weight="bold" className="text-[#0284c7] shrink-0" />
                  {formatarTelefone(formData.telefone) || 'Sem telefone'}
                </span>
                {foneLimpo && (
                  <a
                    href={`https://wa.me/55${foneLimpo}?text=${encodeURIComponent(
                      `Ola ${formData.cliente}, confirmamos o recebimento do seu veiculo para abertura da Ordem de Servico #${formData.numeroOS} na Mecanica Gabriel.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Conversar no WhatsApp"
                    className="text-[#25D366] hover:text-[#1EBE5D] shrink-0"
                  >
                    <WhatsappLogo size={16} weight="fill" />
                  </a>
                )}
              </div>
            </Campo>
            {formData.endereco && (
              <div className="col-span-3 flex items-center gap-1 text-[11px] text-[#667085]">
                <MapPin size={12} weight="bold" className="shrink-0 text-[#98a2b3]" />
                <span className="truncate">{formData.endereco}</span>
              </div>
            )}
          </div>
        )}
      </SecaoForm>

      {/* 3. VEICULO */}
      <SecaoForm
        icone={Car}
        titulo="Veiculo"
        acessorio={
          <button
            type="button"
            disabled={!formData.clienteId}
            onClick={() => setModalNovoVeiculoAberto(true)}
            title={formData.clienteId ? 'Cadastrar novo veiculo para este cliente' : 'Selecione o cliente primeiro'}
            className={`h-7 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
              formData.clienteId
                ? 'bg-[#101828] hover:bg-black text-white cursor-pointer shadow-2xs'
                : 'bg-[#f2f4f7] text-[#98a2b3] cursor-not-allowed'
            }`}
          >
            <Plus size={11} weight="bold" />
            <span>Novo Veiculo</span>
          </button>
        }
      >
        <Select
          options={veiculosOptions}
          value={selectedVeiculoOption}
          onChange={handleSelectVeiculo}
          placeholder={
            !formData.clienteId
              ? 'Selecione o cliente primeiro...'
              : veiculosOptions.length === 0
              ? 'Nenhum veiculo cadastrado para este cliente'
              : 'Selecione o veiculo do cliente...'
          }
          isDisabled={!formData.clienteId}
          isClearable
          isSearchable
          styles={selectStylesPortal}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          noOptionsMessage={() => 'Nenhum veiculo cadastrado para este cliente'}
        />

        {formData.placa && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3">
              <Campo label="Placa">
                <div className="h-9.5 px-3 rounded-xl border border-[#e4e7ec] bg-[#f8fafc] flex items-center">
                  <span className="font-mono font-black text-xs text-[#101828] tracking-wider">
                    {formData.placa.toUpperCase()}
                  </span>
                </div>
              </Campo>
              <Campo label="Marca">
                <div className="h-9.5 px-3 rounded-xl border border-[#e4e7ec] bg-[#f8fafc] flex items-center text-xs font-bold text-[#101828] truncate">
                  {formData.marca || '—'}
                </div>
              </Campo>
              <Campo label="Modelo">
                <div className="h-9.5 px-3 rounded-xl border border-[#e4e7ec] bg-[#f8fafc] flex items-center text-xs font-bold text-[#101828] truncate">
                  {formData.modelo || '—'}
                </div>
              </Campo>
              <Campo label="Ano">
                <div className="h-9.5 px-3 rounded-xl border border-[#e4e7ec] bg-[#f8fafc] flex items-center text-xs font-bold text-[#101828] truncate">
                  {formData.ano || '—'}
                </div>
              </Campo>
            </div>

            <Campo label="Nivel do Tanque">
              <div className="grid grid-cols-5 gap-0.5 bg-white p-0.5 rounded-xl border border-[#d0d5dd]">
                {NIVEIS_COMBUSTIVEL.map((nv) => {
                  const isSelected = formData.nivelCombustivel === nv.value
                  return (
                    <button
                      key={nv.value}
                      type="button"
                      onClick={() => updateFormData({ nivelCombustivel: nv.value })}
                      className={`h-8 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        isSelected ? 'bg-[#101828] text-white shadow-2xs' : 'text-[#667085] hover:bg-[#f2f4f7] hover:text-[#101828]'
                      }`}
                    >
                      {nv.label}
                    </button>
                  )
                })}
              </div>
            </Campo>
          </div>
        )}
      </SecaoForm>

      <ClienteModalForm
        isOpen={modalNovoClienteAberto}
        onClose={() => setModalNovoClienteAberto(false)}
        onSalvar={handleSalvarNovoCliente}
      />

      <VeiculoModalForm
        isOpen={modalNovoVeiculoAberto}
        onClose={() => setModalNovoVeiculoAberto(false)}
        onSalvar={handleSalvarNovoVeiculo}
        clientePredefinidoId={formData.clienteId}
      />
    </>
  )
}
