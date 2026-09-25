import React, { useState, useEffect, useMemo, useRef } from 'react'
import { X, Notebook, CheckCircle, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { gerarProximoCodigoCliente } from '../../../../constants/mockClientesVeiculos'
import { consultarCepApi } from '../../../../services/cepService'
import {
  validarCPF,
  validarCNPJ,
  formatarCEP,
  formatarTelefone,
} from '../../../../utils/fiscalValidators'
import { textareaBaseClass } from '../../nova-os/mobile/mobileSelectStyles'
import { MobileSecaoIdentificacao } from './form/MobileSecaoIdentificacao'
import { MobileSecaoContato } from './form/MobileSecaoContato'
import { MobileSecaoEndereco } from './form/MobileSecaoEndereco'
import { MobileSecaoVeiculos } from './form/MobileSecaoVeiculos'

const FORM_INICIAL = {
  codigoCliente: '',
  tipoPessoa: 'F',
  nome: '',
  nomeFantasia: '',
  documento: '',
  rgIe: '',
  telefone: '',
  telefoneFixo: '',
  email: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: 'Apucarana',
  uf: 'PR',
  observacoes: '',
  ativo: true,
  veiculos: [],
}

export function MobileClienteFormModal({
  isOpen,
  onClose,
  onSalvar,
  onExcluir,
  clienteParaEditar,
}) {
  const [formData, setFormData] = useState(FORM_INICIAL)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const numeroInputRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    setConfirmandoExclusao(false)
    if (clienteParaEditar) {
      setFormData({
        ...clienteParaEditar,
        codigoCliente:
          clienteParaEditar.codigoCliente || gerarProximoCodigoCliente(),
        tipoPessoa:
          clienteParaEditar.tipoPessoa ||
          (clienteParaEditar.documento?.length > 14 ? 'J' : 'F'),
        nome: clienteParaEditar.nome || '',
        nomeFantasia: clienteParaEditar.nomeFantasia || '',
        documento: clienteParaEditar.documento || '',
        rgIe: clienteParaEditar.rgIe || '',
        telefone: formatarTelefone(clienteParaEditar.telefone || ''),
        telefoneFixo: formatarTelefone(clienteParaEditar.telefoneFixo || ''),
        email: clienteParaEditar.email || '',
        cep: formatarCEP(clienteParaEditar.cep || ''),
        logradouro: clienteParaEditar.logradouro || '',
        numero: clienteParaEditar.numero || '',
        complemento: clienteParaEditar.complemento || '',
        bairro: clienteParaEditar.bairro || '',
        cidade: clienteParaEditar.cidade || 'Apucarana',
        uf: clienteParaEditar.uf || 'PR',
        observacoes: clienteParaEditar.observacoes || '',
        ativo: clienteParaEditar.ativo !== false,
        veiculos: Array.isArray(clienteParaEditar.veiculos)
          ? [...clienteParaEditar.veiculos]
          : [],
      })
    } else {
      setFormData({ ...FORM_INICIAL, codigoCliente: gerarProximoCodigoCliente() })
    }
  }, [clienteParaEditar, isOpen])

  const handleChange = (campo, valor) =>
    setFormData((prev) => ({ ...prev, [campo]: valor }))

  const documentoValido = useMemo(() => {
    if (!formData.documento) return false
    return formData.tipoPessoa === 'F'
      ? validarCPF(formData.documento)
      : validarCNPJ(formData.documento)
  }, [formData.documento, formData.tipoPessoa])

  const buscarEnderecoPorCep = async (cepOpcional) => {
    const cepParaConsultar = cepOpcional || formData.cep
    const cepLimpo = (cepParaConsultar || '').replace(/\D/g, '')
    if (cepLimpo.length !== 8) {
      if (!cepOpcional) toast.warning('Informe um CEP válido com 8 dígitos.')
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
      toast.success('Endereço completado automaticamente via CEP!')
      setTimeout(() => numeroInputRef.current?.focus(), 100)
    } catch (err) {
      toast.error(err.message || 'Falha ao consultar o CEP. Preencha manualmente.')
    } finally {
      setBuscandoCep(false)
    }
  }

  const handleAdicionarVeiculo = (veiculoItem) => {
    setFormData((prev) => ({
      ...prev,
      veiculos: [...prev.veiculos, veiculoItem],
    }))
  }

  const handleRemoverVeiculo = (index) => {
    setFormData((prev) => ({
      ...prev,
      veiculos: prev.veiculos.filter((_, idx) => idx !== index),
    }))
    toast.info('Veículo removido da lista.')
  }

  if (!isOpen) return null

  const handleSalvar = () => {
    if (!formData.nome?.trim())
      return toast.warning('O nome do cliente é obrigatório.')
    if (!formData.documento?.trim())
      return toast.warning(
        `Informe o ${formData.tipoPessoa === 'F' ? 'CPF' : 'CNPJ'} do cliente.`
      )
    if (!documentoValido)
      return toast.error(
        `${
          formData.tipoPessoa === 'F' ? 'CPF' : 'CNPJ'
        } inválido. Verifique os dígitos.`
      )
    if (!formData.telefone?.trim())
      return toast.warning('Informe o telefone celular ou WhatsApp para contato.')

    const codigoFinal = formData.codigoCliente || gerarProximoCodigoCliente()

    onSalvar({
      ...formData,
      codigoCliente: codigoFinal,
      value: clienteParaEditar?.value || `cli-${Date.now()}`,
      id: clienteParaEditar?.id || `cli-${Date.now()}`,
      label: `${codigoFinal ? `${codigoFinal} - ` : ''}${formData.nome.trim()} - ${formData.telefone.trim()}`,
      nome: formData.nome.trim(),
      nomeFantasia: formData.nomeFantasia?.trim() || formData.nome.trim(),
      documento: formData.documento.trim(),
      rgIe: formData.rgIe?.trim() || '',
      telefone: formData.telefone.trim(),
      telefoneFixo: formData.telefoneFixo?.trim() || '',
      email: formData.email?.trim() || '',
      cep: formData.cep?.trim() || '',
      logradouro: formData.logradouro?.trim() || '',
      numero: formData.numero?.trim() || '',
      complemento: formData.complemento?.trim() || '',
      bairro: formData.bairro?.trim() || '',
      cidade: formData.cidade?.trim() || '',
      uf: formData.uf || 'PR',
      endereco: `${formData.logradouro || ''}, ${formData.numero || 'S/N'}${
        formData.complemento ? ` (${formData.complemento})` : ''
      } - ${formData.bairro || ''}, ${formData.cidade || ''} - ${formData.uf || ''}`.trim(),
      observacoes: formData.observacoes?.trim() || '',
      ativo: Boolean(formData.ativo),
      veiculos: formData.veiculos || [],
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#eaecf0] flex flex-col">
      <header
        className="shrink-0 bg-white border-b border-[#e4e7ec]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="h-14 px-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-2.5 rounded-xl text-[#475467] active:bg-[#f2f4f7] shrink-0 cursor-pointer"
          >
            <X size={20} weight="bold" />
          </button>
          <span className="text-sm font-extrabold text-[#101828] truncate">
            {clienteParaEditar ? 'Editar Cliente' : 'Novo Cliente'}
          </span>
          <div className="w-9 shrink-0" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-4">
        <MobileSecaoIdentificacao
          formData={formData}
          handleChange={handleChange}
          documentoValido={documentoValido}
        />

        <MobileSecaoContato
          formData={formData}
          handleChange={handleChange}
        />

        <MobileSecaoEndereco
          formData={formData}
          handleChange={handleChange}
          buscandoCep={buscandoCep}
          buscarEnderecoPorCep={buscarEnderecoPorCep}
          numeroInputRef={numeroInputRef}
        />

        <MobileSecaoVeiculos
          veiculos={formData.veiculos}
          onAdicionarVeiculo={handleAdicionarVeiculo}
          onRemoverVeiculo={handleRemoverVeiculo}
        />

        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <Notebook size={14} weight="bold" className="text-[#0284c7]" />
            Observações
          </h3>
          <textarea
            rows={3}
            value={formData.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            placeholder="Preferências de contato, frotista com faturamento quinzenal..."
            className={textareaBaseClass}
          />
        </section>

        {clienteParaEditar && onExcluir && (
          <section>
            {confirmandoExclusao ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 flex items-center gap-2">
                <span className="flex-1 text-xs font-bold text-[#101828]">
                  Excluir este cliente?
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmandoExclusao(false)}
                  className="h-9 px-3 rounded-lg border border-[#d0d5dd] bg-white text-[#344054] text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onExcluir(clienteParaEditar.value || clienteParaEditar.id)
                  }
                  className="h-9 px-3 rounded-lg bg-[#b42318] text-white text-xs font-bold cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmandoExclusao(true)}
                className="w-full h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash size={15} weight="bold" />
                Excluir Cliente
              </button>
            )}
          </section>
        )}
      </main>

      <footer
        className="shrink-0 bg-white border-t border-[#e4e7ec] px-4 py-3"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)',
        }}
      >
        <button
          type="button"
          onClick={handleSalvar}
          className="w-full h-12 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle size={18} weight="bold" />
          {clienteParaEditar ? 'Atualizar Cliente' : 'Salvar Cliente'}
        </button>
      </footer>
    </div>
  )
}
