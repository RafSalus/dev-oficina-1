import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import { IMaskInput } from 'react-imask'
import {
  ArrowsLeftRight,
  Car,
  User,
  Package,
  Wrench,
  Users,
  MapPin,
  CalendarBlank,
  Clock,
  Gauge,
  CurrencyDollar,
  FloppyDisk,
  ShieldCheck,
  CheckCircle,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { customSelectStyles } from '../suprimentos/customSelectStyles'
import { GoogleMapsIcon } from '../icons/GoogleMapsIcon'
import {
  gerarLinkGoogleMapsTrajeto,
  calcularEstimativaTrajeto,
} from '../../utils/googleMapsRouting'
import {
  TIPOS_SERVICO_LOGISTICA,
  VEICULOS_APOIO_PADRAO,
  MOTORISTAS_PADRAO,
  criarNovoDeslocamento,
  carregarVeiculosDeApoio,
} from '../../constants/mockLevaETraz'
import { carregarClientesCadastrados } from '../../constants/mockClientesVeiculos'

export function ModalNovoDeslocamento({ isOpen, onClose, onSalvo }) {
  const [tipoServico, setTipoServico] = useState('busca_veiculo')
  const [prioridade, setPrioridade] = useState('normal')

  // Clientes e Veículos da Oficina
  const [clientesBase, setClientesBase] = useState([])
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [veiculoClienteSelecionado, setVeiculoClienteSelecionado] = useState(null)
  const [numeroOS, setNumeroOS] = useState('')

  // Equipe
  const [quantidadeFuncionarios, setQuantidadeFuncionarios] = useState(2) // 1 ou 2
  const [motoristaPrincipal, setMotoristaPrincipal] = useState(null)
  const [auxiliar, setAuxiliar] = useState(null)
  const [veiculoApoio, setVeiculoApoio] = useState(null)
  const [veiculosApoioDisponiveis, setVeiculosApoioDisponiveis] = useState([])

  // Opção Levar Cliente Embora
  const [levarClienteEmbora, setLevarClienteEmbora] = useState(false)

  // Dados para Busca de Peças
  const [fornecedorNome, setFornecedorNome] = useState('')
  const [fornecedorTelefone, setFornecedorTelefone] = useState('')
  const [pecasDescricao, setPecasDescricao] = useState('')

  // Rotas e Endereços
  const [enderecoOrigem, setEnderecoOrigem] = useState('Oficina Gabriel - R Tupinamba, 566')
  const [enderecoDestino, setEnderecoDestino] = useState('')
  const [cidade, setCidade] = useState('Apucarana')
  const [kmEstimado, setKmEstimado] = useState('12')
  const [idaEVolta, setIdaEVolta] = useState(true)
  const [resumoCalculoRota, setResumoCalculoRota] = useState('')

  // Prazos e Tempos
  const [data, setData] = useState(new Date().toLocaleDateString('pt-BR'))
  const [horarioSaidaPrevisto, setHorarioSaidaPrevisto] = useState('14:30')
  const [tempoEstimadoMinutos, setTempoEstimadoMinutos] = useState(45)

  // Cobrança
  const [tipoCobranca, setTipoCobranca] = useState('cortesia')
  const [valorTaxa, setValorTaxa] = useState('0,00')
  const [observacoes, setObservacoes] = useState('')

  const handleCalcularRota = (dest = enderecoDestino, cid = cidade, volta = idaEVolta) => {
    if (!dest.trim()) {
      toast.error('Informe o endereço de destino para calcular a rota.')
      return
    }
    const est = calcularEstimativaTrajeto({
      origem: enderecoOrigem,
      destino: dest,
      cidade: cid,
      idaEVolta: volta,
      tipoVeiculo: tipoServico === 'busca_pecas' ? 'moto' : 'carro',
    })
    setKmEstimado(String(est.kmTotal))
    setTempoEstimadoMinutos(est.tempoMinutosTotal)
    setResumoCalculoRota(est.resumoTexto)
    toast.success(`Estimativa calculada: ${est.kmTotal} km • ~${est.tempoMinutosTotal} minutos`)
  }

  useEffect(() => {
    if (isOpen) {
      const listaClientes = carregarClientesCadastrados()
      setClientesBase(listaClientes)

      const listaApoio = carregarVeiculosDeApoio()
      setVeiculosApoioDisponiveis(listaApoio)
      setVeiculoApoio(listaApoio[0] || null)
    }
  }, [isOpen])

  // Ajusta automaticamente a quantidade de funcionários recomendada conforme o tipo
  useEffect(() => {
    if (tipoServico === 'busca_veiculo' || tipoServico === 'entrega_veiculo') {
      setQuantidadeFuncionarios(2)
      setVeiculoApoio(veiculosApoioDisponiveis[0] || null)
    } else if (tipoServico === 'busca_pecas') {
      setQuantidadeFuncionarios(1)
      const moto = veiculosApoioDisponiveis.find((v) => v.tipo.includes('Moto')) || veiculosApoioDisponiveis[0]
      if (moto) setVeiculoApoio(moto)
    } else if (tipoServico === 'translado_cliente') {
      setQuantidadeFuncionarios(1)
      setLevarClienteEmbora(true)
      const carroPasseio = veiculosApoioDisponiveis.find((v) => v.tipo.includes('Passeio')) || veiculosApoioDisponiveis[0]
      if (carroPasseio) setVeiculoApoio(carroPasseio)
    }
  }, [tipoServico, veiculosApoioDisponiveis])

  // Opções para react-select de Clientes
  const opcoesClientes = useMemo(() => {
    return clientesBase.map((c) => ({
      value: c.value || c.id,
      label: `${c.nome} (${c.telefone || 'Sem telefone'})`,
      cliente: c,
    }))
  }, [clientesBase])

  // Opções de Veículos do cliente selecionado
  const opcoesVeiculosCliente = useMemo(() => {
    if (!clienteSelecionado?.cliente?.veiculos) return []
    return clienteSelecionado.cliente.veiculos.map((v) => ({
      value: v.placa || v.value || v.id,
      label: `${v.placa} - ${v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim()}`,
      veiculo: v,
    }))
  }, [clienteSelecionado])

  const handleSelectCliente = (opt) => {
    setClienteSelecionado(opt)
    if (opt?.cliente) {
      if (opt.cliente.endereco) {
        setEnderecoDestino(opt.cliente.endereco)
      }
      if (opt.cliente.cidade) {
        setCidade(opt.cliente.cidade)
      }
      if (opt.cliente.veiculos && opt.cliente.veiculos.length > 0) {
        const primeiroVeic = opt.cliente.veiculos[0]
        setVeiculoClienteSelecionado({
          value: primeiroVeic.placa || primeiroVeic.value,
          label: `${primeiroVeic.placa} - ${primeiroVeic.marcaModelo || ''}`,
          veiculo: primeiroVeic,
        })
      } else {
        setVeiculoClienteSelecionado(null)
      }
    }
  }

  const handleSalvar = () => {
    if (!horarioSaidaPrevisto.trim()) {
      toast.error('Informe o horário previsto de saída.')
      return
    }

    if (tipoServico === 'busca_pecas' && !fornecedorNome.trim()) {
      toast.error('Informe o fornecedor para busca de peças.')
      return
    }

    if (
      (tipoServico === 'busca_veiculo' || tipoServico === 'entrega_veiculo' || tipoServico === 'translado_cliente') &&
      !clienteSelecionado &&
      !enderecoDestino.trim()
    ) {
      toast.error('Selecione o cliente ou informe o endereço de destino.')
      return
    }

    try {
      const kmInicialVeiculo = veiculoApoio?.kmAtual || ''

      const dados = {
        tipoServico,
        prioridade,
        status: 'agendado',
        // Cliente e Veículo
        clienteId: clienteSelecionado?.cliente?.value || clienteSelecionado?.cliente?.id || '',
        clienteNome: clienteSelecionado?.cliente?.nome || '',
        clienteTelefone: clienteSelecionado?.cliente?.telefone || '',
        veiculoPlaca: veiculoClienteSelecionado?.veiculo?.placa || '',
        veiculoModelo: veiculoClienteSelecionado?.veiculo?.marcaModelo || '',
        numeroOS: numeroOS.trim(),
        // Equipe
        quantidadeFuncionarios: Number(quantidadeFuncionarios),
        motoristaPrincipalNome: motoristaPrincipal?.value || 'Marcos Aurélio',
        auxiliarNome: quantidadeFuncionarios === 2 ? (auxiliar?.value || '') : '',
        veiculoApoioId: veiculoApoio?.id || '',
        veiculoApoioNome: veiculoApoio ? `${veiculoApoio.nome} (${veiculoApoio.placa})` : '',
        levarClienteEmbora: Boolean(levarClienteEmbora),
        // Fornecedor
        fornecedorNome: fornecedorNome.trim(),
        fornecedorTelefone: fornecedorTelefone.trim(),
        pecasDescricao: pecasDescricao.trim(),
        // Rotas
        enderecoOrigem: enderecoOrigem.trim(),
        enderecoDestino: enderecoDestino.trim(),
        cidade: cidade.trim(),
        kmEstimado: kmEstimado.trim(),
        idaEVolta: Boolean(idaEVolta),
        kmInicial: kmInicialVeiculo,
        kmFinal: '',
        kmRealizado: '',
        // Prazos
        data: data.trim(),
        horarioSaidaPrevisto: horarioSaidaPrevisto.trim(),
        horarioSaidaReal: '',
        horarioRetornoPrevisto: '',
        horarioRetornoReal: '',
        tempoEstimadoMinutos: Number(tempoEstimadoMinutos) || 45,
        tempoRealMinutos: null,
        // Cobrança
        tipoCobranca,
        valorTaxa: tipoCobranca === 'cortesia' ? 0 : parseFloat(valorTaxa.replace(/\./g, '').replace(',', '.')) || 0,
        observacoes: observacoes.trim(),
      }

      criarNovoDeslocamento(dados)
      toast.success('Deslocamento agendado com sucesso na escala de logística!')

      if (onSalvo) {
        onSalvo()
      }
      onClose()
    } catch (err) {
      toast.error('Erro ao agendar deslocamento.')
    }
  }

  if (!isOpen) return null

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      chaveStorage="modal_redimensionavel_novo_deslocamento"
      larguraPadrao={840}
      alturaPadrao={660}
      larguraMinima={600}
      alturaMinima={460}
      larguraMaxima={1200}
      alturaMaxima={880}
      titulo="Agendar Serviço Leva e Traz e Deslocamento"
      subtitulo="Escala operacional de busca, entrega de veículos, peças e translado de clientes"
      badge="Logística da Oficina"
      icone={ArrowsLeftRight}
      rodape={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-sky-600" />
            <span>Controle completo de horários, rota e quilometragem de apoio</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-300"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSalvar}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <FloppyDisk size={15} weight="bold" />
              <span>Agendar Deslocamento</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pb-2">
        {/* Seletor do Tipo de Missão / Serviço */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Tipo de Serviço de Logística *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'busca_veiculo', label: 'Busca de Carro', icon: Car },
              { id: 'entrega_veiculo', label: 'Entrega de Carro', icon: Car },
              { id: 'translado_cliente', label: 'Leva e Traz Cliente', icon: User },
              { id: 'busca_pecas', label: 'Busca de Peças', icon: Package },
              { id: 'socorro_externo', label: 'Socorro Mecânico', icon: Wrench },
            ].map((tipo) => {
              const IconeTipo = tipo.icon
              const ativo = tipoServico === tipo.id
              return (
                <button
                  key={tipo.id}
                  type="button"
                  onClick={() => setTipoServico(tipo.id)}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    ativo
                      ? 'bg-sky-50 border-sky-600 text-sky-800 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                >
                  <IconeTipo size={18} className={ativo ? 'text-sky-600' : 'text-slate-500'} />
                  <span className="text-[11px] leading-tight">{tipo.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Bloco 1: Cliente e Veículo (quando for busca/entrega/translado/socorro) */}
        {tipoServico !== 'busca_pecas' && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} className="text-sky-600" />
              <span>Dados do Cliente e Veículo Atendido</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">Cliente Proprietário</label>
                <Select
                  value={clienteSelecionado}
                  onChange={handleSelectCliente}
                  options={opcoesClientes}
                  styles={customSelectStyles}
                  placeholder="Pesquise por nome do cliente ou telefone..."
                  isSearchable
                  noOptionsMessage={() => 'Nenhum cliente encontrado'}
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">Veículo do Cliente</label>
                {opcoesVeiculosCliente.length > 0 ? (
                  <Select
                    value={veiculoClienteSelecionado}
                    onChange={setVeiculoClienteSelecionado}
                    options={opcoesVeiculosCliente}
                    styles={customSelectStyles}
                    placeholder="Selecione o veículo..."
                    isSearchable={false}
                  />
                ) : (
                  <input
                    type="text"
                    value={veiculoClienteSelecionado?.veiculo?.marcaModelo || ''}
                    onChange={(e) =>
                      setVeiculoClienteSelecionado({
                        value: e.target.value,
                        label: e.target.value,
                        veiculo: { marcaModelo: e.target.value, placa: '' },
                      })
                    }
                    placeholder="Placa ou modelo do veículo..."
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-600"
                  />
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Nº da OS (Opcional)</label>
                <input
                  type="text"
                  value={numeroOS}
                  onChange={(e) => setNumeroOS(e.target.value)}
                  placeholder="Ex: 002908"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600"
                />
              </div>
            </div>

            {/* Checkbox em Destaque: Levar Cliente Embora */}
            <div className="mt-2 bg-sky-50/60 border border-sky-100 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="chk-levar-cliente"
                  checked={levarClienteEmbora}
                  onChange={(e) => setLevarClienteEmbora(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="chk-levar-cliente" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Levar cliente embora / Dar carona de retorno após deixar o veículo na oficina
                </label>
              </div>
              <span className="text-[11px] font-semibold text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200 shrink-0">
                {levarClienteEmbora ? 'Carona Ativa' : 'Sem translado'}
              </span>
            </div>
          </div>
        )}

        {/* Bloco 2: Fornecedor e Peças (quando for busca de peças) */}
        {tipoServico === 'busca_pecas' && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Package size={14} className="text-sky-600" />
              <span>Dados do Fornecedor e Peças a Coletar</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">Fornecedor / Distribuidora *</label>
                <input
                  type="text"
                  value={fornecedorNome}
                  onChange={(e) => setFornecedorNome(e.target.value)}
                  placeholder="Ex: Radiadores Apucarana, Distribuidora Nakata..."
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefone Fornecedor</label>
                <IMaskInput
                  mask="(00) 00000-0000"
                  value={fornecedorTelefone}
                  onAccept={(value) => setFornecedorTelefone(value)}
                  placeholder="(43) 3333-0000"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Nº OS / Cotação</label>
                <input
                  type="text"
                  value={numeroOS}
                  onChange={(e) => setNumeroOS(e.target.value)}
                  placeholder="Ex: OS #002908"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="sm:col-span-12">
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição das Peças / Insumos</label>
                <input
                  type="text"
                  value={pecasDescricao}
                  onChange={(e) => setPecasDescricao(e.target.value)}
                  placeholder="Ex: 1x Tubo de água de arrefecimento, 2x Abraçadeiras, 1x Aditivo Paraflu..."
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bloco 3: Equipe Envolvida (1 Funcionário vs 2 Funcionários) e Veículo de Apoio */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-sky-600" />
              <span>Configuração da Equipe e Veículo de Apoio da Oficina</span>
            </h4>

            {/* Alternador 1 vs 2 Funcionários */}
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setQuantidadeFuncionarios(1)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  quantidadeFuncionarios === 1
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1 Funcionário
              </button>
              <button
                type="button"
                onClick={() => setQuantidadeFuncionarios(2)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  quantidadeFuncionarios === 2
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2 Funcionários (Carro de Apoio)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Motorista Principal */}
            <div className={quantidadeFuncionarios === 2 ? 'sm:col-span-4' : 'sm:col-span-6'}>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Motorista Principal / Mecânico *
              </label>
              <Select
                value={motoristaPrincipal}
                onChange={setMotoristaPrincipal}
                options={MOTORISTAS_PADRAO}
                styles={customSelectStyles}
                placeholder="Selecione o motorista..."
                isSearchable={false}
              />
            </div>

            {/* Segundo Motorista / Auxiliar (se 2 funcionários) */}
            {quantidadeFuncionarios === 2 && (
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2º Funcionário (Apoio de Retorno) *
                </label>
                <Select
                  value={auxiliar}
                  onChange={setAuxiliar}
                  options={MOTORISTAS_PADRAO.filter((m) => m.value !== motoristaPrincipal?.value)}
                  styles={customSelectStyles}
                  placeholder="Selecione o auxiliar..."
                  isSearchable={false}
                />
              </div>
            )}

            {/* Veículo de Apoio da Oficina */}
            <div className={quantidadeFuncionarios === 2 ? 'sm:col-span-4' : 'sm:col-span-6'}>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Veículo de Apoio da Oficina Utilizado *
              </label>
              <Select
                value={{
                  value: veiculoApoio?.id,
                  label: `${veiculoApoio?.nome} (${veiculoApoio?.placa})`,
                  veiculo: veiculoApoio,
                }}
                onChange={(opt) => setVeiculoApoio(opt?.veiculo)}
                options={veiculosApoioDisponiveis.map((v) => ({
                  value: v.id,
                  label: `${v.nome} (${v.placa}) - KM: ${v.kmAtual}`,
                  veiculo: v,
                }))}
                styles={customSelectStyles}
                placeholder="Selecione o veículo de apoio..."
                isSearchable={false}
              />
            </div>
          </div>
        </div>

        {/* Bloco 4: Endereço, Rota, Horários, KM e Cobrança */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={14} className="text-sky-600" />
              <span>Endereço, Rota e Trajeto no Google Maps</span>
            </h4>

            {/* Alternador Ida e Volta vs Apenas Ida */}
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => {
                  setIdaEVolta(true)
                  if (enderecoDestino) handleCalcularRota(enderecoDestino, cidade, true)
                }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                  idaEVolta
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ida e Volta à Oficina
              </button>
              <button
                type="button"
                onClick={() => {
                  setIdaEVolta(false)
                  if (enderecoDestino) handleCalcularRota(enderecoDestino, cidade, false)
                }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                  !idaEVolta
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Apenas Ida
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-slate-700 mb-1">Ponto de Origem</label>
              <input
                type="text"
                value={enderecoOrigem}
                onChange={(e) => setEnderecoOrigem(e.target.value)}
                placeholder="Oficina Gabriel..."
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-600"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-slate-700 mb-1">Endereço de Destino *</label>
              <input
                type="text"
                value={enderecoDestino}
                onChange={(e) => {
                  setEnderecoDestino(e.target.value)
                  if (e.target.value.length > 8) {
                    handleCalcularRota(e.target.value, cidade, idaEVolta)
                  }
                }}
                placeholder="Rua, Número, Bairro do cliente ou fornecedor..."
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-600"
              />
            </div>

            {/* Barra de Ações com Google Maps */}
            <div className="sm:col-span-12 flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleCalcularRota(enderecoDestino, cidade, idaEVolta)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                  title="Calcular estimativa de tempo e distância"
                >
                  <GoogleMapsIcon className="w-3.5 h-4.5" />
                  <span>Calcular Tempo e KM ({idaEVolta ? 'Ida e Volta' : 'Apenas Ida'})</span>
                </button>

                {resumoCalculoRota && (
                  <span className="text-[11px] font-medium text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                    {resumoCalculoRota}
                  </span>
                )}
              </div>

              {enderecoDestino && (
                <a
                  href={gerarLinkGoogleMapsTrajeto({
                    origem: enderecoOrigem,
                    destino: enderecoDestino,
                    idaEVolta,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                  title="Abrir rota no Google Maps e iniciar navegação GPS"
                >
                  <GoogleMapsIcon className="w-3.5 h-4.5" />
                  <span>Iniciar Trajeto no Google Maps</span>
                </a>
              )}
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">Data</label>
              <IMaskInput
                mask="00/00/0000"
                value={data}
                onAccept={(value) => setData(value)}
                placeholder="DD/MM/AAAA"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-sky-600"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">Horário Previsto Saída *</label>
              <IMaskInput
                mask="00:00"
                value={horarioSaidaPrevisto}
                onAccept={(value) => setHorarioSaidaPrevisto(value)}
                placeholder="14:00"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-sky-600"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">Tempo Estimado</label>
              <input
                type="number"
                min="10"
                max="360"
                value={tempoEstimadoMinutos}
                onChange={(e) => setTempoEstimadoMinutos(e.target.value)}
                placeholder="Minutos"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-sky-600"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">Distância Estimada (KM)</label>
              <input
                type="text"
                value={kmEstimado}
                onChange={(e) => setKmEstimado(e.target.value)}
                placeholder="Ex: 15 km"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-sky-600"
              />
            </div>

            {/* Cobrança / Taxa */}
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-slate-700 mb-1">Taxa de Leva e Traz</label>
              <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-50 h-9">
                <button
                  type="button"
                  onClick={() => setTipoCobranca('cortesia')}
                  className={`flex-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                    tipoCobranca === 'cortesia'
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cortesia da Oficina
                </button>
                <button
                  type="button"
                  onClick={() => setTipoCobranca('cobrado')}
                  className={`flex-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                    tipoCobranca === 'cobrado'
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cobrado do Cliente
                </button>
              </div>
            </div>

            {tipoCobranca === 'cobrado' ? (
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">Valor da Taxa (R$)</label>
                <input
                  type="text"
                  value={valorTaxa}
                  onChange={(e) => setValorTaxa(e.target.value)}
                  placeholder="50,00"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-sky-600"
                />
              </div>
            ) : (
              <div className="sm:col-span-6 flex items-center pt-5 text-xs text-slate-500 italic">
                * Serviço sem custo adicional para fidelização do cliente.
              </div>
            )}

            <div className="sm:col-span-12">
              <label className="block text-xs font-bold text-slate-700 mb-1">Observações da Viagem</label>
              <textarea
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Instruções de portaria, contato no local ou pontos de referência..."
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-600 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </ModalRedimensionavel>
  )
}
