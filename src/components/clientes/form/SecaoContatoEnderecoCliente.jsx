import React from 'react'
import Select from 'react-select'
import { IMaskInput } from 'react-imask'
import { Phone, EnvelopeSimple, MapPin, MagnifyingGlass, CircleNotch } from '@phosphor-icons/react'
import { ESTADOS_BRASIL_OPCOES } from '../../../constants/cadastrosSuprimentosData'
import { selectStylesUF } from './clienteSelectStyles'

const INPUT = 'w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none'
const INPUT_ICONE = 'w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none'
const ROTULO = 'block text-xs font-medium text-slate-700 mb-1'

function CampoTexto({ rotulo, campo, form, alterar, placeholder, span, className = '', inputRef }) {
  return (
    <div className={`${span} flex flex-col`}>
      <label className={ROTULO}>{rotulo}</label>
      <input
        ref={inputRef}
        type="text"
        value={form[campo]}
        onChange={(e) => alterar(campo, e.target.value)}
        placeholder={placeholder}
        className={[INPUT, className, 'mt-auto'].filter(Boolean).join(' ')}
      />
    </div>
  )
}

/**
 * Seção "Dados de Contato e Comunicação": celular/WhatsApp, telefone fixo e e-mail.
 * @param {{cliente: object}} props - Retorno de `useClienteForm()`.
 */
export function SecaoContatoCliente({ cliente }) {
  const { form, alterar } = cliente
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
        <Phone size={16} className="text-sky-600" />
        <span>Dados de Contato e Comunicação</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className={ROTULO}>
            Celular ou WhatsApp <span className="text-rose-500">*</span>
          </label>
          <div className="relative mt-auto">
            <IMaskInput
              mask="(00) 00000-0000"
              value={form.telefone}
              onAccept={(val) => alterar('telefone', val)}
              placeholder="(43) 99999-9999"
              required
              className={`${INPUT_ICONE} font-mono font-medium`}
            />
            <Phone size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <span className="block text-[11px] text-slate-500 mt-1">Usado para envio de orçamento e WhatsApp</span>
        </div>

        <div className="flex flex-col">
          <label className={ROTULO}>Telefone Fixo / Recado</label>
          <div className="relative mt-auto">
            <IMaskInput
              mask="(00) 0000-0000"
              value={form.telefoneFixo}
              onAccept={(val) => alterar('telefoneFixo', val)}
              placeholder="(43) 3333-3333"
              className={`${INPUT_ICONE} font-mono`}
            />
            <Phone size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <span className="block h-[19px]"></span>
        </div>

        <div className="flex flex-col">
          <label className={ROTULO}>E-mail do Cliente</label>
          <div className="relative mt-auto">
            <input
              type="email"
              value={form.email}
              onChange={(e) => alterar('email', e.target.value)}
              placeholder="cliente@email.com"
              className={INPUT_ICONE}
            />
            <EnvelopeSimple size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <span className="block text-[11px] text-slate-500 mt-1">Para envio de notas fiscais e laudo</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Seção "Endereço Residencial ou Comercial": CEP com preenchimento automático e demais campos.
 * @param {{cliente: object}} props - Retorno de `useClienteForm()`.
 */
export function SecaoEnderecoCliente({ cliente }) {
  const { form, alterar, buscandoCep, buscarEnderecoPorCep, numeroInputRef } = cliente
  const cepCompleto = (valor) => (valor || '').replace(/\D/g, '').length === 8

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <MapPin size={16} className="text-sky-600" />
          <span>Endereço Residencial ou Comercial</span>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">Usado para faturamento e ordens de serviço</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-3 flex flex-col">
          <label className={ROTULO}>CEP</label>
          <div className="relative flex items-center mt-auto">
            <IMaskInput
              mask="00000-000"
              value={form.cep}
              onAccept={(val) => {
                alterar('cep', val)
                if (cepCompleto(val)) buscarEnderecoPorCep(val)
              }}
              onBlur={() => {
                if (cepCompleto(form.cep)) buscarEnderecoPorCep(form.cep)
              }}
              placeholder="00000-000"
              className="w-full pr-8 pl-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono"
            />
            <button
              type="button"
              onClick={() => buscarEnderecoPorCep(form.cep)}
              disabled={buscandoCep}
              title="Consultar CEP e preencher endereço"
              className="absolute right-2 text-slate-400 hover:text-sky-600 disabled:text-slate-300 transition-colors p-1 cursor-pointer"
            >
              {buscandoCep ? <CircleNotch size={15} className="animate-spin text-sky-600" /> : <MagnifyingGlass size={15} />}
            </button>
          </div>
        </div>

        <CampoTexto span="md:col-span-7" rotulo="Logradouro (Rua, Avenida)" campo="logradouro" form={form} alterar={alterar} placeholder="Rua das Flores, Avenida Central..." />
        <CampoTexto span="md:col-span-2" rotulo="Número" campo="numero" form={form} alterar={alterar} placeholder="Nº ou S/N" className="font-medium" inputRef={numeroInputRef} />
        <CampoTexto span="md:col-span-3" rotulo="Complemento" campo="complemento" form={form} alterar={alterar} placeholder="Apto, Casa, Bloco..." />
        <CampoTexto span="md:col-span-4" rotulo="Bairro" campo="bairro" form={form} alterar={alterar} placeholder="Bairro" />
        <CampoTexto span="md:col-span-3" rotulo="Cidade" campo="cidade" form={form} alterar={alterar} placeholder="Apucarana" />

        <div className="md:col-span-2 flex flex-col">
          <label className={ROTULO}>UF</label>
          <div className="mt-auto">
            <Select
              value={ESTADOS_BRASIL_OPCOES.find((opt) => opt.value === form.uf) || null}
              onChange={(opt) => alterar('uf', opt ? opt.value : 'PR')}
              options={ESTADOS_BRASIL_OPCOES}
              styles={selectStylesUF}
              placeholder="UF"
              isSearchable
            />
          </div>
        </div>
      </div>
    </div>
  )
}
