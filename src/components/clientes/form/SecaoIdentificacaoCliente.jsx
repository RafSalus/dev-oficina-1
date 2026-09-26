import React from 'react'
import { IMaskInput } from 'react-imask'
import { CheckCircle, WarningCircle, IdentificationCard } from '@phosphor-icons/react'
import { rotuloDocumento } from '../../../utils/clientes/clienteFormulario'

const INPUT = 'w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none mt-auto'

function BotaoTipo({ ativo, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
        ativo ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

/**
 * Seção "Identificação e Tipo de Pessoa": PF/PJ, código automático, nome, apelido/fantasia,
 * CPF/CNPJ com validação em tempo real, RG/IE e situação ativa.
 * @param {{cliente: object}} props - Retorno de `useClienteForm()`.
 */
export function SecaoIdentificacaoCliente({ cliente }) {
  const { form, alterar, trocarTipoPessoa, documentoValido } = cliente
  const pf = form.tipoPessoa === 'F'
  const doc = rotuloDocumento(form.tipoPessoa)

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <IdentificationCard size={16} className="text-sky-600" />
          <span>Identificação e Tipo de Pessoa</span>
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-300 p-0.5 rounded-lg">
          <BotaoTipo ativo={pf} onClick={() => trocarTipoPessoa('F')}>
            Pessoa Física (CPF)
          </BotaoTipo>
          <BotaoTipo ativo={!pf} onClick={() => trocarTipoPessoa('J')}>
            Pessoa Jurídica (CNPJ)
          </BotaoTipo>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-3 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-700">Código do Cliente</label>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
              Automático
            </span>
          </div>
          <input
            type="text"
            value={form.codigoCliente || 'Gerado ao salvar'}
            readOnly
            placeholder="Gerado ao salvar"
            title="Código gerado automaticamente pelo sistema"
            className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-300 rounded-md font-mono font-bold text-slate-700 select-none cursor-not-allowed outline-none mt-auto"
          />
        </div>

        <div className="md:col-span-6 flex flex-col">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            {pf ? 'Nome Completo do Cliente' : 'Razão Social da Empresa'} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => alterar('nome', e.target.value)}
            placeholder={pf ? 'Ex: Carlos Alberto da Silva' : 'Ex: Transportes e Logística Silva Ltda'}
            required
            className={`${INPUT} font-medium`}
          />
        </div>

        <div className="md:col-span-3 flex flex-col">
          <label className="block text-xs font-medium text-slate-700 mb-1">{pf ? 'Apelido / Como Chamar' : 'Nome Fantasia'}</label>
          <input
            type="text"
            value={form.nomeFantasia}
            onChange={(e) => alterar('nomeFantasia', e.target.value)}
            placeholder={pf ? 'Ex: Beto' : 'Ex: Silva Transportes'}
            className={INPUT}
          />
        </div>

        <div className="md:col-span-4 flex flex-col">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            {doc} <span className="text-rose-500">*</span>
          </label>
          <div className="relative mt-auto">
            <IMaskInput
              mask={pf ? '000.000.000-00' : '00.000.000/0000-00'}
              value={form.documento}
              onAccept={(val) => alterar('documento', val)}
              placeholder={pf ? '000.000.000-00' : '00.000.000/0000-00'}
              required
              className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono ${
                documentoValido ? 'border-sky-500' : 'border-slate-300'
              }`}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              {documentoValido ? (
                <CheckCircle size={16} className="text-sky-600" weight="fill" />
              ) : form.documento.length >= (pf ? 11 : 14) ? (
                <WarningCircle size={16} className="text-rose-500" weight="fill" />
              ) : null}
            </div>
          </div>
          <span className="block text-[11px] text-slate-500 mt-1">
            {documentoValido
              ? `${doc} validado oficialmente`
              : `Informe o ${pf ? 'CPF com 11 dígitos' : 'CNPJ com 14 dígitos'}`}
          </span>
        </div>

        <div className="md:col-span-4 flex flex-col">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            {pf ? 'RG (Registro Geral)' : 'Inscrição Estadual (IE)'}
          </label>
          <input
            type="text"
            value={form.rgIe}
            onChange={(e) => alterar('rgIe', e.target.value.toUpperCase())}
            placeholder={pf ? 'Ex: 12.345.678-9' : 'Ex: 987654321 ou ISENTO'}
            className={`${INPUT} font-mono`}
          />
          <span className="block h-[19px]"></span>
        </div>

        <div className="md:col-span-4 flex items-end pb-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => alterar('ativo', e.target.checked)}
              className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-700">Cliente Ativo para Ordens de Serviço</span>
          </label>
        </div>
      </div>
    </div>
  )
}
