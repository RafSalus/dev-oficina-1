import React, { useState, useEffect, useMemo, useRef } from 'react'
import Select from 'react-select'
import { IMaskInput } from 'react-imask'
import {
  X,
  Buildings,
  User,
  MapPin,
  Tag,
  CheckCircle,
  WarningCircle,
  MagnifyingGlass,
  CircleNotch,
  Trash,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  CATEGORIAS_FORNECEDOR_OPCOES,
  RAMOS_FORNECEDOR_OPCOES,
  ESTADOS_BRASIL_OPCOES,
} from '../../../../constants/cadastrosSuprimentosData'
import { consultarCepApi } from '../../../../services/cepService'
import { validarCNPJ, formatarCEP } from '../../../../utils/fiscalValidators'
import {
  mobileSelectStyles,
  inputBaseClass,
  labelBaseClass,
} from '../../nova-os/mobile/mobileSelectStyles'

const FORM_INICIAL = {
  codigo: '',
  razaoSocial: '',
  nomeFantasia: '',
  cnpj: '',
  inscricaoEstadual: '',
  inscricaoMunicipal: '',
  categoriaFornecedor: 'Autopeças',
  tipoServico: 'Autopeças em Geral',
  contatoNome: '',
  contatoTelefone: '',
  contatoEmail: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: 'SP',
  ativo: true,
}

export function MobileTerceiroFormModal({ isOpen, onClose, onSalvar, onExcluir, terceiroParaEditar }) {
  const [formData, setFormData] = useState(FORM_INICIAL)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const numeroInputRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    setConfirmandoExclusao(false)
    if (terceiroParaEditar) {
      setFormData({
        ...terceiroParaEditar,
        razaoSocial: terceiroParaEditar.razaoSocial || terceiroParaEditar.nome || '',
        nomeFantasia: terceiroParaEditar.nomeFantasia || terceiroParaEditar.nome || '',
        inscricaoEstadual: terceiroParaEditar.inscricaoEstadual || '',
        inscricaoMunicipal: terceiroParaEditar.inscricaoMunicipal || '',
        categoriaFornecedor: terceiroParaEditar.categoriaFornecedor || 'Autopeças',
        tipoServico: terceiroParaEditar.tipoServico || 'Autopeças em Geral',
        cep: formatarCEP(terceiroParaEditar.cep || terceiroParaEditar.endereco?.cep || ''),
        logradouro: terceiroParaEditar.logradouro || terceiroParaEditar.endereco?.logradouro || '',
        numero: terceiroParaEditar.numero || terceiroParaEditar.endereco?.numero || '',
        complemento: terceiroParaEditar.complemento || terceiroParaEditar.endereco?.complemento || '',
        bairro: terceiroParaEditar.bairro || terceiroParaEditar.endereco?.bairro || '',
        cidade: terceiroParaEditar.cidade || terceiroParaEditar.endereco?.cidade || '',
        uf: terceiroParaEditar.uf || terceiroParaEditar.endereco?.uf || 'SP',
        ativo: terceiroParaEditar.ativo !== false,
      })
    } else {
      setFormData({ ...FORM_INICIAL, codigo: `FORN-${Math.floor(100 + Math.random() * 900)}` })
    }
  }, [terceiroParaEditar, isOpen])

  const handleChange = (campo, valor) => setFormData((prev) => ({ ...prev, [campo]: valor }))

  const cnpjValido = useMemo(() => !!formData.cnpj && validarCNPJ(formData.cnpj), [formData.cnpj])

  const buscarEnderecoPorCep = async (cepOpcional) => {
    const cepParaConsultar = cepOpcional || formData.cep
    const cepLimpo = (cepParaConsultar || '').replace(/\D/g, '')
    if (cepLimpo.length !== 8) {
      if (!cepOpcional) toast.warning('Informe um CEP completo com 8 dígitos.')
      return
    }
    try {
      setBuscandoCep(true)
      const dados = await consultarCepApi(cepLimpo)
      setFormData((prev) => ({
        ...prev,
        logradouro: dados.logradouro || prev.logradouro,
        bairro: dados.bairro || prev.bairro,
        cidade: dados.cidade || prev.cidade,
        uf: dados.uf || prev.uf,
      }))
      toast.success('Endereço completado com sucesso via CEP!')
      setTimeout(() => numeroInputRef.current?.focus(), 100)
    } catch (err) {
      toast.error(err.message || 'Não foi possível consultar o CEP. Preencha manualmente.')
    } finally {
      setBuscandoCep(false)
    }
  }

  if (!isOpen) return null

  const handleSalvar = () => {
    if (!formData.razaoSocial?.trim()) return toast.warning('A Razão Social do fornecedor é obrigatória.')
    if (!formData.cnpj?.trim()) return toast.warning('O CNPJ do fornecedor é obrigatório.')
    if (!validarCNPJ(formData.cnpj)) return toast.error('CNPJ inválido. Verifique os dígitos informados.')
    if (!formData.categoriaFornecedor) return toast.warning('Selecione a categoria do fornecedor.')
    if (!formData.tipoServico) return toast.warning('Selecione a especialidade ou ramo do fornecedor.')
    if (!formData.contatoNome?.trim()) return toast.warning('Informe o nome do contato principal.')
    if (!formData.contatoTelefone?.trim()) return toast.warning('Informe o telefone ou WhatsApp para contato.')

    onSalvar({
      ...formData,
      id: terceiroParaEditar?.id || `forn-${Date.now()}`,
      razaoSocial: formData.razaoSocial.trim(),
      nomeFantasia: formData.nomeFantasia?.trim() || formData.razaoSocial.trim(),
      cnpj: formData.cnpj.replace(/\D/g, ''),
      inscricaoEstadual: formData.inscricaoEstadual?.trim() || 'ISENTO',
      inscricaoMunicipal: formData.inscricaoMunicipal?.trim() || '',
      categoriaFornecedor: formData.categoriaFornecedor,
      tipoServico: formData.tipoServico,
      contatoNome: formData.contatoNome.trim(),
      contatoTelefone: formData.contatoTelefone.trim(),
      contatoEmail: formData.contatoEmail?.trim() || '',
      cep: formData.cep.replace(/\D/g, ''),
      logradouro: formData.logradouro?.trim() || '',
      numero: formData.numero?.trim() || '',
      complemento: formData.complemento?.trim() || '',
      bairro: formData.bairro?.trim() || '',
      cidade: formData.cidade?.trim() || '',
      uf: formData.uf || 'SP',
      ativo: Boolean(formData.ativo),
    })
  }

  const categoriaSelecionada = CATEGORIAS_FORNECEDOR_OPCOES.find((o) => o.value === formData.categoriaFornecedor) || null
  const ramoSelecionado = RAMOS_FORNECEDOR_OPCOES.find((o) => o.value === formData.tipoServico) || null
  const ufSelecionada = ESTADOS_BRASIL_OPCOES.find((o) => o.value === formData.uf) || null

  return (
    <div className="fixed inset-0 z-50 bg-[#eaecf0] flex flex-col">
      <header className="shrink-0 bg-white border-b border-[#e4e7ec]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="h-14 px-2 flex items-center justify-between gap-2">
          <button type="button" onClick={onClose} aria-label="Fechar" className="p-2.5 rounded-xl text-[#475467] active:bg-[#f2f4f7] shrink-0">
            <X size={20} weight="bold" />
          </button>
          <span className="text-sm font-extrabold text-[#101828] truncate">
            {terceiroParaEditar ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </span>
          <div className="w-9 shrink-0" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-4">
        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
              <Tag size={14} weight="bold" className="text-[#0284c7]" />
              Classificação
            </h3>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ativo}
                onChange={(e) => handleChange('ativo', e.target.checked)}
                className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#0284c7] border-[#d0d5dd]"
              />
              <span className="text-[11px] font-bold text-[#344054]">Ativo</span>
            </label>
          </div>

          <div>
            <label className={labelBaseClass}>Categoria do Fornecedor *</label>
            <Select
              value={categoriaSelecionada}
              onChange={(opt) => handleChange('categoriaFornecedor', opt ? opt.value : 'Autopeças')}
              options={CATEGORIAS_FORNECEDOR_OPCOES}
              styles={mobileSelectStyles}
              placeholder="Selecione a categoria"
            />
          </div>

          <div>
            <label className={labelBaseClass}>Ramo ou Especialidade *</label>
            <Select
              value={ramoSelecionado}
              onChange={(opt) => handleChange('tipoServico', opt ? opt.value : 'Autopeças em Geral')}
              options={RAMOS_FORNECEDOR_OPCOES}
              styles={mobileSelectStyles}
              placeholder="Selecione o ramo"
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <Buildings size={14} weight="bold" className="text-[#0284c7]" />
            Identificação Cadastral
          </h3>

          <div>
            <label className={labelBaseClass}>Razão Social *</label>
            <input
              type="text"
              value={formData.razaoSocial}
              onChange={(e) => handleChange('razaoSocial', e.target.value)}
              placeholder="Ex: Distribuidora de Peças Brasil Ltda"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label className={labelBaseClass}>Nome Fantasia</label>
            <input
              type="text"
              value={formData.nomeFantasia}
              onChange={(e) => handleChange('nomeFantasia', e.target.value)}
              placeholder="Ex: Brasil Auto Peças"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label className={labelBaseClass}>CNPJ *</label>
            <div className="relative">
              <IMaskInput
                mask="00.000.000/0000-00"
                value={formData.cnpj}
                onAccept={(val) => handleChange('cnpj', val)}
                placeholder="00.000.000/0000-00"
                className={`${inputBaseClass} font-mono pr-10`}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {cnpjValido ? (
                  <CheckCircle size={16} className="text-[#0284c7]" weight="fill" />
                ) : formData.cnpj?.length >= 14 ? (
                  <WarningCircle size={16} className="text-rose-500" weight="fill" />
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBaseClass}>Inscrição Estadual</label>
              <input
                type="text"
                value={formData.inscricaoEstadual}
                onChange={(e) => handleChange('inscricaoEstadual', e.target.value.toUpperCase())}
                placeholder="Ou ISENTO"
                className={`${inputBaseClass} font-mono`}
              />
            </div>
            <div>
              <label className={labelBaseClass}>Inscrição Municipal</label>
              <input
                type="text"
                value={formData.inscricaoMunicipal}
                onChange={(e) => handleChange('inscricaoMunicipal', e.target.value)}
                placeholder="Ex: 9876543"
                className={`${inputBaseClass} font-mono`}
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <User size={14} weight="bold" className="text-[#0284c7]" />
            Contato Principal
          </h3>

          <div>
            <label className={labelBaseClass}>Nome do Responsável *</label>
            <input
              type="text"
              value={formData.contatoNome}
              onChange={(e) => handleChange('contatoNome', e.target.value)}
              placeholder="Ex: Carlos Oliveira"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label className={labelBaseClass}>Telefone ou WhatsApp *</label>
            <IMaskInput
              mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]}
              value={formData.contatoTelefone}
              onAccept={(val) => handleChange('contatoTelefone', val)}
              placeholder="(11) 99999-9999"
              className={`${inputBaseClass} font-mono`}
            />
          </div>

          <div>
            <label className={labelBaseClass}>E-mail Comercial</label>
            <input
              type="email"
              value={formData.contatoEmail}
              onChange={(e) => handleChange('contatoEmail', e.target.value)}
              placeholder="pedidos@fornecedor.com.br"
              className={inputBaseClass}
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <MapPin size={14} weight="bold" className="text-[#0284c7]" />
            Endereço e Localização
          </h3>

          <div>
            <label className={labelBaseClass}>CEP</label>
            <div className="relative">
              <IMaskInput
                mask="00000-000"
                value={formData.cep}
                onAccept={(val) => {
                  handleChange('cep', val)
                  if (val.replace(/\D/g, '').length === 8) buscarEnderecoPorCep(val)
                }}
                placeholder="00000-000"
                className={`${inputBaseClass} font-mono pr-10`}
              />
              <button
                type="button"
                onClick={() => buscarEnderecoPorCep(formData.cep)}
                disabled={buscandoCep}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]"
              >
                {buscandoCep ? <CircleNotch size={16} className="animate-spin text-[#0284c7]" /> : <MagnifyingGlass size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className={labelBaseClass}>Logradouro</label>
            <input
              type="text"
              value={formData.logradouro}
              onChange={(e) => handleChange('logradouro', e.target.value)}
              placeholder="Rua, Avenida, Alameda..."
              className={inputBaseClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBaseClass}>Número</label>
              <input
                ref={numeroInputRef}
                type="text"
                value={formData.numero}
                onChange={(e) => handleChange('numero', e.target.value)}
                placeholder="Nº"
                className={inputBaseClass}
              />
            </div>
            <div>
              <label className={labelBaseClass}>Complemento</label>
              <input
                type="text"
                value={formData.complemento}
                onChange={(e) => handleChange('complemento', e.target.value)}
                placeholder="Galpão, Sala..."
                className={inputBaseClass}
              />
            </div>
          </div>

          <div>
            <label className={labelBaseClass}>Bairro</label>
            <input
              type="text"
              value={formData.bairro}
              onChange={(e) => handleChange('bairro', e.target.value)}
              placeholder="Bairro"
              className={inputBaseClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBaseClass}>Cidade</label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
                placeholder="Cidade"
                className={inputBaseClass}
              />
            </div>
            <div>
              <label className={labelBaseClass}>UF</label>
              <Select
                value={ufSelecionada}
                onChange={(opt) => handleChange('uf', opt ? opt.value : 'SP')}
                options={ESTADOS_BRASIL_OPCOES}
                styles={mobileSelectStyles}
                placeholder="UF"
              />
            </div>
          </div>
        </section>

        {terceiroParaEditar && onExcluir && (
          <section>
            {confirmandoExclusao ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 flex items-center gap-2">
                <span className="flex-1 text-xs font-bold text-[#101828]">Excluir este fornecedor?</span>
                <button type="button" onClick={() => setConfirmandoExclusao(false)} className="h-9 px-3 rounded-lg border border-[#d0d5dd] bg-white text-[#344054] text-xs font-bold">
                  Cancelar
                </button>
                <button type="button" onClick={() => onExcluir(terceiroParaEditar.id)} className="h-9 px-3 rounded-lg bg-[#b42318] text-white text-xs font-bold">
                  Confirmar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmandoExclusao(true)}
                className="w-full h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Trash size={15} weight="bold" />
                Excluir Fornecedor
              </button>
            )}
          </section>
        )}
      </main>

      <footer className="shrink-0 bg-white border-t border-[#e4e7ec] px-4 py-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}>
        <button
          type="button"
          onClick={handleSalvar}
          className="w-full h-12 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-sm font-bold flex items-center justify-center gap-2"
        >
          <CheckCircle size={18} weight="bold" />
          {terceiroParaEditar ? 'Atualizar Fornecedor' : 'Salvar Fornecedor'}
        </button>
      </footer>
    </div>
  )
}
