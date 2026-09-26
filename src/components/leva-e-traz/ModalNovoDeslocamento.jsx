import React, { useState, useEffect, useMemo } from 'react'
import {
  ArrowsLeftRight,
  ShieldCheck,
  FloppyDisk,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { calcularEstimativaTrajeto } from '../../utils/googleMapsRouting'
import {
  VEICULOS_APOIO_PADRAO,
  MOTORISTAS_PADRAO,
} from '../../constants/mockLevaETraz'
import {
  criarNovoDeslocamento,
  carregarVeiculosDeApoio,
} from '../../repositories/levaETrazRepository'
import { useClientesCadastrados } from '../../hooks/useClientesCadastrados'
import { SecaoTipoServico } from './novo-deslocamento/SecaoTipoServico'
import { SecaoClienteVeiculo } from './novo-deslocamento/SecaoClienteVeiculo'
import { SecaoFornecedorPecas } from './novo-deslocamento/SecaoFornecedorPecas'
import { SecaoEquipeApoio } from './novo-deslocamento/SecaoEquipeApoio'
import { SecaoRotaPrazosCobranca } from './novo-deslocamento/SecaoRotaPrazosCobranca'

export function ModalNovoDeslocamento({ isOpen, onClose, onSalvo }) {
  const [tipoServico, setTipoServico] = useState('busca_veiculo')
  const prioridade = 'normal'

  // Clientes e Veículos da Oficina
  const { clientes: clientesBase, carregando: carregandoClientes } = useClientesCadastrados({ incluirVeiculos: true })
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
  const cidade = 'Apucarana'
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
    if (!dest || !dest.trim()) {
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
      carregarVeiculosDeApoio()
        .then((listaApoio) => {
          const lista = Array.isArray(listaApoio) ? listaApoio : []
          setVeiculosApoioDisponiveis(lista.length > 0 ? lista : VEICULOS_APOIO_PADRAO)
          if (lista.length > 0) {
            setVeiculoApoio(lista[0])
          } else if (VEICULOS_APOIO_PADRAO.length > 0) {
            setVeiculoApoio(VEICULOS_APOIO_PADRAO[0])
          }
        })
        .catch(() => {})

      setMotoristaPrincipal(MOTORISTAS_PADRAO[0] || null)
      setAuxiliar(MOTORISTAS_PADRAO[1] || null)

      setData(new Date().toLocaleDateString('pt-BR'))
      setHorarioSaidaPrevisto('14:30')
      setTempoEstimadoMinutos(45)
      setKmEstimado('12')
      setResumoCalculoRota('')
      setTipoCobranca('cortesia')
      setValorTaxa('0,00')
      setObservacoes('')
      setClienteSelecionado(null)
      setVeiculoClienteSelecionado(null)
      setNumeroOS('')
      setFornecedorNome('')
      setFornecedorTelefone('')
      setPecasDescricao('')
      setEnderecoDestino('')
      setIdaEVolta(true)
      setLevarClienteEmbora(false)
    }
  }, [isOpen])

  // Opções para o select de clientes
  const opcoesClientes = useMemo(() => {
    return clientesBase.map((c) => ({
      value: c.id,
      label: `${c.nome} ${c.telefone ? `(${c.telefone})` : ''}`,
      cliente: c,
    }))
  }, [clientesBase])

  // Opções para o select de veículos do cliente
  const opcoesVeiculosCliente = useMemo(() => {
    if (!clienteSelecionado?.cliente?.veiculos) return []
    return clienteSelecionado.cliente.veiculos.map((v) => ({
      value: v.placa,
      label: `${v.placa} - ${v.marcaModelo || v.modelo} (${v.ano})`,
      veiculo: v,
    }))
  }, [clienteSelecionado])

  const handleSelectCliente = (opcao) => {
    setClienteSelecionado(opcao)
    if (opcao?.cliente) {
      if (opcao.cliente.enderecoPrincipal) {
        setEnderecoDestino(opcao.cliente.enderecoPrincipal)
        handleCalcularRota(opcao.cliente.enderecoPrincipal, cidade, idaEVolta)
      }
      if (opcao.cliente.veiculos && opcao.cliente.veiculos.length > 0) {
        const primVeic = opcao.cliente.veiculos[0]
        setVeiculoClienteSelecionado({
          value: primVeic.placa,
          label: `${primVeic.placa} - ${primVeic.marcaModelo || primVeic.modelo} (${primVeic.ano})`,
          veiculo: primVeic,
        })
      } else {
        setVeiculoClienteSelecionado(null)
      }
    } else {
      setVeiculoClienteSelecionado(null)
    }
  }

  const handleSalvar = async (e) => {
    e.preventDefault()

    if (!enderecoDestino.trim()) {
      toast.error('Informe o endereço de destino do deslocamento.')
      return
    }

    if (tipoServico !== 'busca_pecas' && !clienteSelecionado && !veiculoClienteSelecionado) {
      toast.error('Selecione ao menos um cliente ou veículo para o atendimento.')
      return
    }

    if (tipoServico === 'busca_pecas' && !fornecedorNome.trim()) {
      toast.error('Informe o nome do fornecedor ou distribuidora.')
      return
    }

    try {
      const kmInicialVeiculo = veiculoApoio?.kmAtual || '45.200'

      const dados = {
        tipoServico,
        prioridade,
        clienteId: clienteSelecionado?.value || '',
        clienteNome: clienteSelecionado?.cliente?.nome || '',
        clienteTelefone: clienteSelecionado?.cliente?.telefone || '',
        veiculoPlaca: veiculoClienteSelecionado?.veiculo?.placa || '',
        veiculoModelo:
          veiculoClienteSelecionado?.veiculo?.marcaModelo ||
          veiculoClienteSelecionado?.veiculo?.modelo ||
          '',
        numeroOS: numeroOS.trim(),
        quantidadeFuncionarios: Number(quantidadeFuncionarios),
        motoristaPrincipalNome: motoristaPrincipal?.value || 'Marcos Aurélio',
        auxiliarNome: quantidadeFuncionarios === 2 ? auxiliar?.value || '' : '',
        veiculoApoioId: veiculoApoio?.id || '',
        veiculoApoioNome: veiculoApoio ? `${veiculoApoio.nome} (${veiculoApoio.placa})` : '',
        levarClienteEmbora: Boolean(levarClienteEmbora),
        fornecedorNome: fornecedorNome.trim(),
        fornecedorTelefone: fornecedorTelefone.trim(),
        pecasDescricao: pecasDescricao.trim(),
        enderecoOrigem: enderecoOrigem.trim(),
        enderecoDestino: enderecoDestino.trim(),
        cidade: cidade.trim(),
        kmEstimado: kmEstimado.trim(),
        idaEVolta: Boolean(idaEVolta),
        kmInicial: kmInicialVeiculo,
        kmFinal: '',
        kmRealizado: '',
        data: data.trim(),
        horarioSaidaPrevisto: horarioSaidaPrevisto.trim(),
        horarioSaidaReal: '',
        horarioRetornoPrevisto: '',
        horarioRetornoReal: '',
        tempoEstimadoMinutos: Number(tempoEstimadoMinutos) || 45,
        tempoRealMinutos: null,
        tipoCobranca,
        valorTaxa:
          tipoCobranca === 'cortesia'
            ? 0
            : parseFloat(valorTaxa.replace(/\./g, '').replace(',', '.')) || 0,
        observacoes: observacoes.trim(),
      }

      await criarNovoDeslocamento(dados)
      toast.success('Deslocamento agendado com sucesso na escala de logística!')

      if (onSalvo) {
        onSalvo()
      }
      onClose()
    } catch {
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
        <SecaoTipoServico tipoServico={tipoServico} setTipoServico={setTipoServico} />

        {tipoServico !== 'busca_pecas' && (
          <SecaoClienteVeiculo
            clienteSelecionado={clienteSelecionado}
            handleSelectCliente={handleSelectCliente}
            opcoesClientes={opcoesClientes}
            veiculoClienteSelecionado={veiculoClienteSelecionado}
            setVeiculoClienteSelecionado={setVeiculoClienteSelecionado}
            opcoesVeiculosCliente={opcoesVeiculosCliente}
            numeroOS={numeroOS}
            setNumeroOS={setNumeroOS}
            levarClienteEmbora={levarClienteEmbora}
            setLevarClienteEmbora={setLevarClienteEmbora}
            carregandoClientes={carregandoClientes}
          />
        )}

        {tipoServico === 'busca_pecas' && (
          <SecaoFornecedorPecas
            fornecedorNome={fornecedorNome}
            setFornecedorNome={setFornecedorNome}
            fornecedorTelefone={fornecedorTelefone}
            setFornecedorTelefone={setFornecedorTelefone}
            numeroOS={numeroOS}
            setNumeroOS={setNumeroOS}
            pecasDescricao={pecasDescricao}
            setPecasDescricao={setPecasDescricao}
          />
        )}

        <SecaoEquipeApoio
          quantidadeFuncionarios={quantidadeFuncionarios}
          setQuantidadeFuncionarios={setQuantidadeFuncionarios}
          motoristaPrincipal={motoristaPrincipal}
          setMotoristaPrincipal={setMotoristaPrincipal}
          auxiliar={auxiliar}
          setAuxiliar={setAuxiliar}
          veiculoApoio={veiculoApoio}
          setVeiculoApoio={setVeiculoApoio}
          veiculosApoioDisponiveis={veiculosApoioDisponiveis}
        />

        <SecaoRotaPrazosCobranca
          enderecoOrigem={enderecoOrigem}
          setEnderecoOrigem={setEnderecoOrigem}
          enderecoDestino={enderecoDestino}
          setEnderecoDestino={setEnderecoDestino}
          cidade={cidade}
          idaEVolta={idaEVolta}
          setIdaEVolta={setIdaEVolta}
          handleCalcularRota={handleCalcularRota}
          resumoCalculoRota={resumoCalculoRota}
          data={data}
          setData={setData}
          horarioSaidaPrevisto={horarioSaidaPrevisto}
          setHorarioSaidaPrevisto={setHorarioSaidaPrevisto}
          tempoEstimadoMinutos={tempoEstimadoMinutos}
          setTempoEstimadoMinutos={setTempoEstimadoMinutos}
          kmEstimado={kmEstimado}
          setKmEstimado={setKmEstimado}
          tipoCobranca={tipoCobranca}
          setTipoCobranca={setTipoCobranca}
          valorTaxa={valorTaxa}
          setValorTaxa={setValorTaxa}
          observacoes={observacoes}
          setObservacoes={setObservacoes}
        />
      </div>
    </ModalRedimensionavel>
  )
}
