import React, { useState, useEffect, useMemo, useRef } from 'react'
import Select from 'react-select'
import {
  Buildings,
  FloppyDisk,
  User,
  Phone,
  EnvelopeSimple,
  MapPin,
  ShieldCheck,
  CheckCircle,
  WarningCircle,
  MagnifyingGlass,
  CircleNotch,
  Tag,
} from '@phosphor-icons/react'
import { ModalRedimensionavel } from './ModalRedimensionavel'
import { customSelectStyles } from './customSelectStyles'
import {
  CATEGORIAS_FORNECEDOR_OPCOES,
  RAMOS_FORNECEDOR_OPCOES,
  ESTADOS_BRASIL_OPCOES,
} from '../../constants/cadastrosSuprimentosData'
import { consultarCepApi } from '../../services/cepService'
import {
  validarCNPJ,
  formatarCNPJ,
  formatarCEP,
  formatarTelefone,
} from '../../utils/fiscalValidators'
import { IMaskInput } from 'react-imask'
import { toast } from 'sonner'

const FORM_INICIAL = {
  codigo: '',
  razaoSocial: '',
  nomeFantasia: '',
  cnpj: '',
  inscricaoEstadual: '',
  telefone: '',
  telefoneSecundario: '',
  email: '',
  contatoResponsavel: '',
  categoria: 'Autopeças',
  tipoServico: 'Autopeças em Geral',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: 'SP',
  observacoes: '',
  chavePix: '',
  banco: '',
  agencia: '',
  conta: '',
  ativo: true,
}

export function TerceiroModalForm({ isOpen, onClose, onSalvar, terceiroParaEditar }) {
  const [formData, setFormData] = useState(FORM_INICIAL)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const numeroInputRef = useRef(null)

  useEffect(() => {
    if (terceiroParaEditar) {
      setFormData({
        ...terceiroParaEditar,
        codigo: terceiroParaEditar.codigo || '',
        razaoSocial: terceiroParaEditar.razaoSocial || terceiroParaEditar.nome || '',
        nomeFantasia: terceiroParaEditar.nomeFantasia || terceiroParaEditar.nome || '',
        cnpj: formatarCNPJ(terceiroParaEditar.cnpj || ''),
        inscricaoEstadual: terceiroParaEditar.inscricaoEstadual || '',
        telefone: formatarTelefone(terceiroParaEditar.telefone || ''),
        telefoneSecundario: formatarTelefone(terceiroParaEditar.telefoneSecundario || ''),
        email: terceiroParaEditar.email || '',
        contatoResponsavel: terceiroParaEditar.contatoResponsavel || '',
        categoria: terceiroParaEditar.categoria || terceiroParaEditar.categoriaFornecedor || 'Autopeças',
        tipoServico: terceiroParaEditar.tipoServico || 'Autopeças em Geral',
        cep: formatarCEP(terceiroParaEditar.cep || (terceiroParaEditar.endereco?.cep || '')),
        logradouro: terceiroParaEditar.logradouro || (terceiroParaEditar.endereco?.logradouro || ''),
        numero: terceiroParaEditar.numero || (terceiroParaEditar.endereco?.numero || ''),
        complemento: terceiroParaEditar.complemento || (terceiroParaEditar.endereco?.complemento || ''),
        bairro: terceiroParaEditar.bairro || (terceiroParaEditar.endereco?.bairro || ''),
        cidade: terceiroParaEditar.cidade || (terceiroParaEditar.endereco?.cidade || ''),
        uf: terceiroParaEditar.uf || (terceiroParaEditar.endereco?.uf || 'SP'),
        observacoes: terceiroParaEditar.observacoes || '',
        chavePix: terceiroParaEditar.chavePix || '',
        banco: terceiroParaEditar.banco || '',
        agencia: terceiroParaEditar.agencia || '',
        conta: terceiroParaEditar.conta || '',
        ativo: terceiroParaEditar.ativo !== false,
      })
    } else {
      const codigoSorteado = `FORN-${Math.floor(100 + Math.random() * 900)}`
      setFormData({
        ...FORM_INICIAL,
        codigo: codigoSorteado,
      })
    }
  }, [terceiroParaEditar, isOpen])

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }))
  }

  // Validação em tempo real do CNPJ
  const cnpjValido = useMemo(() => {
    if (!formData.cnpj) return false
    return validarCNPJ(formData.cnpj)
  }, [formData.cnpj])

  // Busca rápida de CEP via API integrada
  const buscarEnderecoPorCep = async (cepOpcional) => {
    const cepParaConsultar = cepOpcional || formData.cep
    const cepLimpo = (cepParaConsultar || '').replace(/\D/g, '')
    if (cepLimpo.length !== 8) {
      if (!cepOpcional) {
        toast.warning('Informe um CEP completo com 8 dígitos.')
      }
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
      setTimeout(() => {
        numeroInputRef.current?.focus()
      }, 100)
    } catch (err) {
      toast.error(err.message || 'Não foi possível consultar o CEP automaticamente. Preencha os campos manualmente.')
    } finally {
      setBuscandoCep(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.razaoSocial?.trim()) {
      toast.warning('A Razão Social do fornecedor é obrigatória.')
      return
    }
    if (!formData.cnpj?.trim()) {
      toast.warning('O CNPJ do fornecedor é obrigatório.')
      return
    }
    if (!validarCNPJ(formData.cnpj)) {
      toast.error('CNPJ inválido. Verifique os dígitos informados.')
      return
    }
    if (!formData.categoriaFornecedor) {
      toast.warning('Selecione a categoria do fornecedor.')
      return
    }
    if (!formData.tipoServico) {
      toast.warning('Selecione a especialidade ou ramo do fornecedor.')
      return
    }
    if (!formData.contatoNome?.trim()) {
      toast.warning('Informe o nome do contato principal.')
      return
    }
    if (!formData.contatoTelefone?.trim()) {
      toast.warning('Informe o telefone ou WhatsApp para contato.')
      return
    }

    const payload = {
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
    }

    onSalvar(payload)
    onClose()
  }

  const categoriaSelecionada =
    CATEGORIAS_FORNECEDOR_OPCOES.find((opt) => opt.value === formData.categoriaFornecedor) || null

  const ramoSelecionado =
    RAMOS_FORNECEDOR_OPCOES.find((opt) => opt.value === formData.tipoServico) || null

  const ufSelecionada =
    ESTADOS_BRASIL_OPCOES.find((opt) => opt.value === formData.uf) || null

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      titulo={terceiroParaEditar ? 'Editar Fornecedor' : 'Novo Fornecedor'}
      subtitulo="Cadastro de empresas fornecedoras de autopeças, componentes e parceiros de serviços externos homologados"
      icone={Buildings}
      larguraPadrao={860}
      alturaPadrao={720}
      larguraMinima={600}
      alturaMinima={480}
      larguraMaxima={1200}
      alturaMaxima={880}
      storageKey="fornecedor_modal"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Classificação e Categoria do Fornecedor */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <Tag size={16} className="text-sky-600" />
            <span>Classificação e Ramo de Fornecimento</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Categoria do Fornecedor <span className="text-rose-500">*</span>
              </label>
              <Select
                value={categoriaSelecionada}
                onChange={(opt) =>
                  handleChange('categoriaFornecedor', opt ? opt.value : 'Autopeças')
                }
                options={CATEGORIAS_FORNECEDOR_OPCOES}
                styles={customSelectStyles}
                placeholder="Selecione a categoria"
              />
            </div>

            <div className="md:col-span-5">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Ramo ou Especialidade Técnica <span className="text-rose-500">*</span>
              </label>
              <Select
                value={ramoSelecionado}
                onChange={(opt) =>
                  handleChange('tipoServico', opt ? opt.value : 'Autopeças em Geral')
                }
                options={RAMOS_FORNECEDOR_OPCOES}
                styles={customSelectStyles}
                placeholder="Selecione o ramo"
              />
            </div>

            <div className="md:col-span-2 flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => handleChange('ativo', e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-700">Ativo</span>
              </label>
            </div>
          </div>
        </div>

        {/* Dados da Empresa */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <Buildings size={16} className="text-sky-600" />
            <span>Identificação Cadastral da Empresa</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Razão Social <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.razaoSocial}
                onChange={(e) => handleChange('razaoSocial', e.target.value)}
                placeholder="Ex: Distribuidora de Peças Brasil Ltda"
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nome Fantasia
              </label>
              <input
                type="text"
                value={formData.nomeFantasia}
                onChange={(e) => handleChange('nomeFantasia', e.target.value)}
                placeholder="Ex: Brasil Auto Peças"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                CNPJ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <IMaskInput
                  mask="00.000.000/0000-00"
                  value={formData.cnpj}
                  onAccept={(val) => handleChange('cnpj', val)}
                  placeholder="00.000.000/0000-00"
                  required
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono ${
                    cnpjValido ? 'border-sky-500' : 'border-slate-300'
                  }`}
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  {cnpjValido ? (
                    <CheckCircle size={16} className="text-sky-600" weight="fill" />
                  ) : formData.cnpj.length >= 14 ? (
                    <WarningCircle size={16} className="text-rose-500" weight="fill" />
                  ) : null}
                </div>
              </div>
              <span className="block text-[11px] text-slate-500 mt-1">
                {cnpjValido
                  ? 'CNPJ validado com dígitos verificadores'
                  : '14 dígitos com validação da Receita'}
              </span>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Inscrição Estadual (IE)
              </label>
              <input
                type="text"
                value={formData.inscricaoEstadual}
                onChange={(e) => handleChange('inscricaoEstadual', e.target.value.toUpperCase())}
                placeholder="Ou digite ISENTO"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Inscrição Municipal (IM)
              </label>
              <input
                type="text"
                value={formData.inscricaoMunicipal}
                onChange={(e) => handleChange('inscricaoMunicipal', e.target.value)}
                placeholder="Ex: 9876543"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Contato Principal */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <User size={16} className="text-sky-600" />
            <span>Contato Principal</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nome do Responsável / Vendedor <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.contatoNome}
                  onChange={(e) => handleChange('contatoNome', e.target.value)}
                  placeholder="Ex: Carlos Oliveira"
                  required
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
                />
                <User size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Telefone ou WhatsApp <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <IMaskInput
                  mask={[
                    { mask: '(00) 0000-0000' },
                    { mask: '(00) 00000-0000' },
                  ]}
                  value={formData.contatoTelefone}
                  onAccept={(val) => handleChange('contatoTelefone', val)}
                  placeholder="(11) 99999-9999"
                  required
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono"
                />
                <Phone size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                E-mail Comercial
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.contatoEmail}
                  onChange={(e) => handleChange('contatoEmail', e.target.value)}
                  placeholder="pedidos@fornecedor.com.br"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
                />
                <EnvelopeSimple size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Endereço Físico */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <MapPin size={16} className="text-sky-600" />
              <span>Endereço e Localização</span>
            </div>
            <span className="text-[11px] text-slate-500">Usado para faturamento e entrega de peças</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                CEP
              </label>
              <div className="relative flex items-center">
                <IMaskInput
                  mask="00000-000"
                  value={formData.cep}
                  onAccept={(val) => {
                    handleChange('cep', val)
                    const limpo = val.replace(/\D/g, '')
                    if (limpo.length === 8) {
                      buscarEnderecoPorCep(val)
                    }
                  }}
                  onBlur={() => {
                    const limpo = (formData.cep || '').replace(/\D/g, '')
                    if (limpo.length === 8) {
                      buscarEnderecoPorCep(formData.cep)
                    }
                  }}
                  placeholder="00000-000"
                  className="w-full pr-8 pl-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => buscarEnderecoPorCep(formData.cep)}
                  disabled={buscandoCep}
                  title="Consultar CEP e preencher endereço"
                  className="absolute right-2 text-slate-400 hover:text-sky-600 disabled:text-slate-300 transition-colors p-1 cursor-pointer"
                >
                  {buscandoCep ? (
                    <CircleNotch size={15} className="animate-spin text-sky-600" />
                  ) : (
                    <MagnifyingGlass size={15} />
                  )}
                </button>
              </div>
            </div>

            <div className="md:col-span-7">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Logradouro
              </label>
              <input
                type="text"
                value={formData.logradouro}
                onChange={(e) => handleChange('logradouro', e.target.value)}
                placeholder="Rua, Avenida, Alameda..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Número
              </label>
              <input
                ref={numeroInputRef}
                type="text"
                value={formData.numero}
                onChange={(e) => handleChange('numero', e.target.value)}
                placeholder="Nº"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-medium"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Complemento
              </label>
              <input
                type="text"
                value={formData.complemento}
                onChange={(e) => handleChange('complemento', e.target.value)}
                placeholder="Galpão, Pavilhão, Sala..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Bairro
              </label>
              <input
                type="text"
                value={formData.bairro}
                onChange={(e) => handleChange('bairro', e.target.value)}
                placeholder="Bairro"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
                placeholder="Cidade"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                UF
              </label>
              <Select
                value={ufSelecionada}
                onChange={(opt) => handleChange('uf', opt ? opt.value : 'SP')}
                options={ESTADOS_BRASIL_OPCOES}
                styles={customSelectStyles}
                placeholder="UF"
                isSearchable
              />
            </div>
          </div>
        </div>

        {/* Rodapé de Ações - Botão único de confirmação */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md shadow-sm transition-colors"
          >
            <FloppyDisk size={16} />
            <span>Salvar Fornecedor</span>
          </button>
        </div>
      </form>
    </ModalRedimensionavel>
  )
}
