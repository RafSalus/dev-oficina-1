import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  CheckCircle,
  Eye,
  X,
  WhatsappLogo,
  PaperPlaneTilt,
  ArrowsClockwise,
  Camera,
  Storefront,
  Car,
  Tag,
  Clock,
  ShieldCheck,
  User,
  PhoneCall,
  Check,
  Buildings,
} from '@phosphor-icons/react'
import { COMPANY, WHATSAPP_ACCESS } from '../constants/company'
import { toast } from 'sonner'
import Select from 'react-select'
import { customSelectStyles } from '../components/suprimentos/customSelectStyles'

const PRAZO_ENTREGA_OPCOES = [
  { value: 'Pronta Entrega (Imediato)', label: 'Pronta Entrega (Imediato)' },
  { value: 'Em até 1 hora (Moto Express)', label: 'Em até 1 hora (Moto Express)' },
  { value: 'Em até 2 horas', label: 'Em até 2 horas' },
  { value: 'Hoje até o fim do dia', label: 'Hoje até o fim do dia' },
  { value: 'Para amanhã pela manhã', label: 'Para amanhã pela manhã' },
  { value: 'Retirada no balcão da loja', label: 'Retirada no balcão da loja' },
]

// Dados padrao de demonstracao
const MOCK_COTACAO = {
  id: 'COT-2026-9041',
  cliente: 'Marcos Vinícius Silveira',
  placa: 'BRA-2E19',
  marcaModelo: 'Chevrolet Onix Plus 1.0 Turbo LTZ',
  ano: '2022 / 2023',
  cor: 'Prata Metálico',
  km: '48.350 km',
  combustivel: 'Flex',
  mecanicoNome: 'Carlos Eduardo',
  fornecedorNome: 'Auto Peças Central',
  itens: [
    {
      id: 'item-1',
      codigo: 'PEC-002',
      nome: 'Discos de Freio Ventilados Dianteiros (Par)',
      quantidade: '1',
      marcaSugerida: 'Fremax / Hipper Freios',
      fotoUrl: 'https://images.unsplash.com/photo-1600790142055-619df03207e6?w=600',
      observacoes: 'Desgaste abaixo da espessura mínima com rebarba cortante',
    },
    {
      id: 'item-2',
      codigo: 'PEC-001',
      nome: 'Jogo de Pastilhas de Freio Dianteiras',
      quantidade: '1',
      marcaSugerida: 'Fras-le / Bosch',
      fotoUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600',
      observacoes: 'Material de atrito no limite do sensor metálico',
    },
    {
      id: 'item-3',
      codigo: 'PEC-003',
      nome: 'Amortecedores Dianteiros Pressurizados (Par)',
      quantidade: '2',
      marcaSugerida: 'Cofap / Monroe',
      fotoUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600',
      observacoes: 'Haste com vazamento de fluido hidráulico',
    },
  ],
}

export function CotacaoAutoPecaPage() {
  const { id } = useParams()

  const [cotacao, setCotacao] = useState(null)
  const [carregando, setCarregando] = useState(true)

  // Respostas de cada peca
  const [respostas, setRespostas] = useState({})

  // Identificacao da auto peca: loja ja preenchida pelo sistema
  const [autoPecaNome, setAutoPecaNome] = useState('Auto Peças Central')
  const [vendedorNome, setVendedorNome] = useState('')
  const [vendedorTelefone, setVendedorTelefone] = useState('')
  const [prazoEntrega, setPrazoEntrega] = useState('Pronta Entrega (Imediato)')

  // Controle de tela de sucesso e zoom de foto
  const [enviado, setEnviado] = useState(false)
  const [fotoZoom, setFotoZoom] = useState(null)

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const fornecedorParam = queryParams.get('fornecedor')

    try {
      // 1. Tenta carregar do mapa do portal de cotações
      const historicoRaw = localStorage.getItem('dev_oficina_cotacoes')
      if (historicoRaw) {
        const historico = JSON.parse(historicoRaw)
        if (id && historico[id]) {
          const itemStorage = historico[id]
          setCotacao(itemStorage)
          if (fornecedorParam) {
            setAutoPecaNome(fornecedorParam)
          } else if (itemStorage.fornecedorNome) {
            setAutoPecaNome(itemStorage.fornecedorNome)
          } else if (itemStorage.fornecedoresCotados && itemStorage.fornecedoresCotados[0]?.nome) {
            setAutoPecaNome(itemStorage.fornecedoresCotados[0].nome)
          } else if (itemStorage.fornecedores && itemStorage.fornecedores[0]?.nome) {
            setAutoPecaNome(itemStorage.fornecedores[0].nome)
          }
          iniciarRespostas(itemStorage)
          setCarregando(false)
          return
        }
      }

      // 2. Fallback: carregar da lista dev_oficina_cotacoes_pecas
      const listaRaw = localStorage.getItem('dev_oficina_cotacoes_pecas')
      if (listaRaw) {
        const lista = JSON.parse(listaRaw)
        if (Array.isArray(lista)) {
          const encontrada = lista.find((c) => String(c.id) === String(id))
          if (encontrada) {
            const formatada = {
              ...encontrada,
              cliente: encontrada.clienteNome || encontrada.cliente,
              placa: encontrada.veiculoPlaca || encontrada.placa,
              marcaModelo: encontrada.veiculoModelo || encontrada.marcaModelo,
            }
            setCotacao(formatada)
            if (fornecedorParam) {
              setAutoPecaNome(fornecedorParam)
            } else if (formatada.fornecedoresCotados && formatada.fornecedoresCotados[0]?.nome) {
              setAutoPecaNome(formatada.fornecedoresCotados[0].nome)
            }
            iniciarRespostas(formatada)
            setCarregando(false)
            return
          }
        }
      }
    } catch (e) {
      console.error(e)
    }

    const demo = { ...MOCK_COTACAO, id: id || MOCK_COTACAO.id }
    setCotacao(demo)
    setAutoPecaNome(fornecedorParam || demo.fornecedorNome)
    iniciarRespostas(demo)
    setCarregando(false)
  }, [id])

  const iniciarRespostas = (data) => {
    const obj = {}
    if (data && Array.isArray(data.itens)) {
      data.itens.forEach((item) => {
        obj[item.id] = {
          status: 'disponivel', // 'disponivel', 'encomenda', 'indisponivel'
          marca: item.marcaSugerida ? item.marcaSugerida.split('/')[0].trim() : '',
          preco: '',
        }
      })
    }
    setRespostas(obj)
  }

  const handleAtualizarItem = (itemId, campo, valor) => {
    setRespostas((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [campo]: valor,
      },
    }))
  }

  // Calculo de totais em tempo real
  const totais = useMemo(() => {
    if (!cotacao) return { totalItens: 0, cotados: 0, valor: '0,00', valorNum: 0 }

    let cotados = 0
    let soma = 0

    cotacao.itens.forEach((item) => {
      const r = respostas[item.id]
      if (r && r.status !== 'indisponivel') {
        const p = parseFloat(String(r.preco).replace(',', '.')) || 0
        const q = parseFloat(item.quantidade) || 1
        if (p > 0) {
          cotados += 1
          soma += p * q
        }
      }
    })

    return {
      totalItens: cotacao.itens.length,
      cotados,
      valor: soma.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      valorNum: soma,
    }
  }, [cotacao, respostas])

  const handleEnviar = (e) => {
    e.preventDefault()

    if (!vendedorNome.trim()) {
      toast.error('Por favor, informe o seu nome (vendedor ou atendente responsável).')
      return
    }

    try {
      const historicoRaw = localStorage.getItem('dev_oficina_cotacoes')
      const historico = historicoRaw ? JSON.parse(historicoRaw) : {}
      const atual = historico[cotacao.id] || cotacao

      atual.status = 'respondida'
      if (!atual.respostas) atual.respostas = {}
      atual.respostas[autoPecaNome] = {
        autoPecaNome,
        vendedorNome,
        vendedorTelefone,
        prazoEntrega,
        dataEnvio: new Date().toISOString(),
        itens: respostas,
        total: totais.valor,
      }

      historico[cotacao.id] = atual
      localStorage.setItem('dev_oficina_cotacoes', JSON.stringify(historico))
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new CustomEvent('dev_oficina_cotacoes_updated'))
    } catch (err) {
      console.error(err)
    }

    toast.success('Proposta de cotação enviada com sucesso para a oficina!')
    setEnviado(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAvisarOficina = () => {
    toast.info('Abrindo WhatsApp oficial da oficina...')
    const msg = `Olá, oficina! Aqui é o(a) *${vendedorNome}* da *${autoPecaNome}*.%0A%0ARespondemos a cotação *#${cotacao.id}* do veículo *${cotacao.placa}* (${cotacao.marcaModelo}).%0A%0A*Total Ofertado:* R$ ${totais.valor}%0A*Itens Ofertados:* ${totais.cotados} de ${totais.totalItens}%0A*Prazo:* ${prazoEntrega}`
    window.open(`https://wa.me/5543998544106?text=${msg}`, '_blank')
  }

  // Fechar aba e retornar ao sistema principal (Regra 15 - Suporte a Fullscreen)
  const handleFecharAba = () => {
    if (window.self !== window.top) {
      try {
        window.parent.postMessage({ tipo: 'FECHAR_MODAL_PREVIEW' }, '*')
      } catch {}
      return
    }

    window.close()
    setTimeout(() => {
      if (!window.closed) {
        if (window.history.length > 1) {
          window.history.back()
        } else {
          window.location.href = '/gestao/compras'
        }
      }
    }, 150)
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="w-9 h-9 border-3 border-[#0284c7] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#0f172a] w-full overflow-x-hidden pb-40">
      {/* Topo Oficial: Branco com Destaques Preto e Azul da Marca */}
      <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Logo e Nome da Oficina */}
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/favicon-96x96.png"
              alt="Mecânica Gabriel"
              className="w-10 h-10 object-contain rounded-xl border border-slate-300 shadow-2xs shrink-0"
            />
            <div className="min-w-0">
              <span className="font-extrabold text-sm sm:text-base leading-tight block truncate text-black">
                {COMPANY.shortName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10.5px] font-black px-2 py-0.2 rounded-md bg-[#0284c7] text-white tracking-wide uppercase">
                  Cotação #{cotacao.id}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Botao WhatsApp Direto com a Oficina */}
            <a
              href={WHATSAPP_ACCESS.href}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3 rounded-xl bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0369a1] border border-[#bae6fd] text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              title="Falar com a oficina pelo WhatsApp"
            >
              <WhatsappLogo size={16} weight="fill" className="text-[#0284c7]" />
              <span className="hidden sm:inline">WhatsApp Oficina</span>
            </a>

            {/* Botão Fechar Aba e Voltar ao Sistema (Regra 15 - Suporte a Fullscreen) */}
            <button
              type="button"
              onClick={handleFecharAba}
              className="h-9 px-3.5 rounded-xl bg-[#0f172a] hover:bg-black text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-2xs"
              title="Fechar esta aba e voltar para a tela do sistema"
            >
              <X size={15} weight="bold" />
              <span>Fechar Aba</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteudo Principal com Separacao Nitida */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 pt-4 space-y-4">
        {/* TELA DE SUCESSO APOS ENVIO */}
        {enviado ? (
          <div className="bg-white rounded-2xl border-2 border-[#0284c7] p-6 text-center space-y-4 shadow-md animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-2xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle size={38} weight="fill" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-black">
                Proposta Enviada com Sucesso!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                A oficina <strong className="text-black font-bold">{COMPANY.shortName}</strong> já recebeu os preços enviados por{' '}
                <strong className="text-[#0284c7] font-bold">{vendedorNome}</strong> da{' '}
                <strong className="text-black font-bold">{autoPecaNome}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2.5">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Auto Peças:</span>
                <span className="font-bold text-black">{autoPecaNome}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Vendedor:</span>
                <span className="font-bold text-[#0284c7]">{vendedorNome}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Veículo:</span>
                <span className="font-bold text-black">{cotacao.placa} • {cotacao.marcaModelo}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Previsão:</span>
                <span className="font-bold text-slate-800">{prazoEntrega}</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t border-slate-200">
                <span className="font-black text-black">Valor Total Ofertado:</span>
                <span className="font-mono font-black text-[#0284c7]">R$ {totais.valor}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleAvisarOficina}
                className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#1da851] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
              >
                <WhatsappLogo size={20} weight="fill" />
                <span>Avisar a Oficina no WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setEnviado(false)}
                className="w-full h-10 rounded-xl border-2 border-slate-300 bg-white text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50"
              >
                <ArrowsClockwise size={15} weight="bold" />
                <span>Revisar / Alterar Preços</span>
              </button>

              <button
                type="button"
                onClick={handleFecharAba}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
              >
                <X size={16} weight="bold" />
                <span>Fechar Esta Aba e Voltar ao Sistema</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEnviar} className="space-y-4">
            {/* CARD 1: DADOS DO VEICULO (Fundo Preto com Detalhes em Azul e Branco) */}
            <div className="bg-[#0f172a] text-white rounded-2xl border-t-4 border-t-[#0284c7] p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-[#38bdf8] tracking-widest">
                      Veículo em Manutenção
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white leading-tight mt-1 truncate">
                    {cotacao.marcaModelo}
                  </h2>
                </div>

                {/* Placa Mercosul com Contraste Branco Real */}
                {cotacao.placa && (
                  <div className="flex flex-col items-center bg-white text-black border-2 border-slate-900 rounded-lg px-3 py-1 shadow-xs shrink-0 self-start sm:self-auto">
                    <div className="w-full flex items-center justify-between gap-2 border-b border-slate-300 pb-0.5 mb-0.5">
                      <span className="text-[7px] font-black uppercase tracking-widest text-[#003399] leading-none">
                        BRASIL
                      </span>
                      <div className="w-2.5 h-1.5 rounded-[1px] bg-gradient-to-r from-green-600 via-yellow-400 to-blue-600" />
                    </div>
                    <span className="font-mono font-black text-base sm:text-lg text-slate-950 tracking-widest leading-none pt-0.5">
                      {cotacao.placa}
                    </span>
                  </div>
                )}
              </div>

              {/* Chips Informativos do Carro em Azul Escuro e Branco */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-[#1e293b] text-[#bae6fd] border border-[#334155] font-semibold">
                  Ano: <strong className="text-white font-bold">{cotacao.ano || 'Não informado'}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#1e293b] text-[#bae6fd] border border-[#334155] font-semibold">
                  KM: <strong className="text-white font-bold">{cotacao.km || 'Não informado'}</strong>
                </span>
                {cotacao.cor && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#1e293b] text-[#bae6fd] border border-[#334155] font-semibold">
                    Cor: <strong className="text-white font-bold">{cotacao.cor}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* SEPARADOR DE SECAO */}
            <div className="flex items-center justify-between px-1 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-5 rounded-r-md bg-[#0284c7]" />
                <h3 className="text-xs sm:text-sm font-black text-black uppercase tracking-wider">
                  Peças Solicitadas para Cotação ({cotacao.itens.length})
                </h3>
              </div>
              <span className="text-[11px] font-bold text-[#0284c7] bg-[#e0f2fe] px-2 py-0.5 rounded-full border border-[#bae6fd]">
                Toque na foto para ampliar
              </span>
            </div>

            {/* LISTA DAS PECAS: Borda Visivel e Separacao Clara dos Campos */}
            <div className="space-y-3.5">
              {cotacao.itens.map((item, idx) => {
                const r = respostas[item.id] || {}
                const pNum = parseFloat(String(r.preco).replace(',', '.')) || 0
                const qNum = parseFloat(item.quantidade) || 1
                const subtotal = (pNum * qNum).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
                const indisponivel = r.status === 'indisponivel'

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border-2 transition-all p-3.5 sm:p-4.5 shadow-xs space-y-3.5 ${
                      indisponivel
                        ? 'border-slate-300 bg-slate-50/60 opacity-60'
                        : pNum > 0
                        ? 'border-[#0284c7] ring-2 ring-[#0284c7]/20'
                        : 'border-slate-300'
                    }`}
                  >
                    {/* Topo do Card: Identificacao e Quantidade */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-[#0f172a] text-white text-xs font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-slate-500 uppercase truncate">
                          {item.codigo}
                        </span>
                      </div>

                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] shrink-0">
                        Qtd: {item.quantidade || 1} un
                      </span>
                    </div>

                    {/* Linha da Foto e Nome da Peca */}
                    <div className="flex items-start gap-3.5">
                      {/* Foto do Mecanico */}
                      {item.fotoUrl ? (
                        <button
                          type="button"
                          onClick={() => setFotoZoom(item.fotoUrl)}
                          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-slate-300 shrink-0 group cursor-pointer bg-slate-100 block shadow-2xs"
                          title="Clique para ampliar a foto tirada pelo mecânico"
                        >
                          <img
                            src={item.fotoUrl}
                            alt={item.nome}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-90 group-hover:opacity-100 transition-opacity">
                            <Eye size={20} weight="bold" />
                          </div>
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-white text-[8px] font-bold">
                            Zoom
                          </span>
                        </button>
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 shrink-0">
                          <Camera size={22} />
                          <span className="text-[8.5px] font-bold mt-0.5">Sem foto</span>
                        </div>
                      )}

                      {/* Descricao da Peca */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="font-black text-sm sm:text-base text-black leading-snug">
                          {item.nome}
                        </h4>

                        {item.marcaSugerida && (
                          <div className="text-xs text-slate-700">
                            <span className="text-slate-500 font-medium">Marca Sugerida: </span>
                            <span className="font-extrabold text-[#0284c7]">{item.marcaSugerida}</span>
                          </div>
                        )}

                        {item.observacoes && (
                          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-snug">
                            <strong>Obs Mecânico:</strong> {item.observacoes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botoes de Disponibilidade (Separacao Nitida) */}
                    <div className="pt-1">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                        Disponibilidade desta Peça:
                      </label>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleAtualizarItem(item.id, 'status', 'disponivel')}
                          className={`h-9 px-1 rounded-xl text-xs font-black border-2 transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            r.status === 'disponivel'
                              ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-xs scale-100'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {r.status === 'disponivel' && <Check size={14} weight="bold" />}
                          <span>Tem na Loja</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAtualizarItem(item.id, 'status', 'encomenda')}
                          className={`h-9 px-1 rounded-xl text-xs font-black border-2 transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            r.status === 'encomenda'
                              ? 'bg-amber-500 text-black border-amber-500 shadow-xs scale-100'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {r.status === 'encomenda' && <Check size={14} weight="bold" />}
                          <span>Encomenda</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAtualizarItem(item.id, 'status', 'indisponivel')}
                          className={`h-9 px-1 rounded-xl text-xs font-black border-2 transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            r.status === 'indisponivel'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-xs scale-100'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {r.status === 'indisponivel' && <Check size={14} weight="bold" />}
                          <span>Não Temos</span>
                        </button>
                      </div>
                    </div>

                    {/* Campos de Marca e Preco com Separacao Forte */}
                    {!indisponivel ? (
                      <div className="pt-2 border-t-2 border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                        <div className="sm:col-span-6">
                          <label className="block text-[11px] font-black text-slate-800 mb-1">
                            Marca que você vai fornecer *
                          </label>
                          <input
                            type="text"
                            value={r.marca || ''}
                            onChange={(e) => handleAtualizarItem(item.id, 'marca', e.target.value)}
                            placeholder="Ex: Fras-le, Bosch, Nakata..."
                            className="w-full h-11 px-3 rounded-xl bg-slate-50 border-2 border-slate-300 text-sm font-bold text-black focus:bg-white focus:outline-none focus:border-[#0284c7] transition-colors"
                          />
                        </div>

                        <div className="sm:col-span-6">
                          <label className="block text-[11px] font-black text-slate-800 mb-1">
                            Preço Unitário (R$) *
                          </label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 font-bold text-xs text-slate-500">
                              R$
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={r.preco || ''}
                              onChange={(e) => handleAtualizarItem(item.id, 'preco', e.target.value)}
                              placeholder="0,00"
                              className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-50 border-2 border-slate-300 font-mono text-base font-black text-black focus:bg-white focus:outline-none focus:border-[#0284c7] transition-colors"
                            />
                          </div>
                        </div>

                        {/* Bloco de Subtotal com Contraste Superior */}
                        {pNum > 0 && (
                          <div className="sm:col-span-12 p-2.5 rounded-xl bg-[#0f172a] text-white flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase text-[#bae6fd]">
                              Subtotal ({item.quantidade || 1} un):
                            </span>
                            <span className="font-mono font-black text-base text-[#38bdf8]">
                              R$ {subtotal}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center text-xs font-bold text-rose-700">
                        Item marcado como não disponível
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* CARD 2: DADOS DA LOJA E NOME DO VENDEDOR (Loja Ja Preenchida) */}
            <div className="bg-white rounded-2xl border-2 border-slate-300 p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0284c7] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <Storefront size={16} weight="bold" />
                  </div>
                  <span className="text-xs sm:text-sm font-black text-black uppercase tracking-wide">
                    Identificação da Auto Peças
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd]">
                  Loja Confirmada
                </span>
              </div>

              {/* Nome da Loja (Ja Preenchido) */}
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Auto Peças Fornecedora:
                  </span>
                  <span className="text-sm sm:text-base font-black text-[#0f172a] block">
                    {autoPecaNome || 'Auto Peças Central'}
                  </span>
                </div>
                <Buildings size={22} weight="bold" className="text-[#0284c7] shrink-0" />
              </div>

              {/* Campo para o Vendedor Preencher (Destaque Principal) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-black text-slate-900 mb-1">
                    Seu Nome (Vendedor / Atendente) *
                  </label>
                  <input
                    type="text"
                    required
                    value={vendedorNome}
                    onChange={(e) => setVendedorNome(e.target.value)}
                    placeholder="Digite seu nome aqui..."
                    className="w-full h-11 px-3.5 rounded-xl bg-white border-2 border-slate-400 text-sm font-bold text-black focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-900 mb-1">
                    Prazo de Entrega
                  </label>
                  <Select
                    options={PRAZO_ENTREGA_OPCOES}
                    value={PRAZO_ENTREGA_OPCOES.find((opt) => opt.value === prazoEntrega) || PRAZO_ENTREGA_OPCOES[0]}
                    onChange={(opt) => setPrazoEntrega(opt ? opt.value : 'Pronta Entrega (Imediato)')}
                    styles={customSelectStyles}
                    isSearchable={false}
                  />
                </div>
              </div>
            </div>

            {/* BARRA FIXA INFERIOR: Preto com Topo Azul da Marca e Total em Destaque */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f172a] text-white border-t-2 border-t-[#0284c7] p-3 sm:p-4 shadow-xl">
              <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase text-[#bae6fd] block leading-none">
                    Total ({totais.cotados} de {totais.totalItens} peças)
                  </span>
                  <span className="font-mono font-black text-xl sm:text-2xl text-[#38bdf8] mt-1 block truncate">
                    R$ {totais.valor}
                  </span>
                </div>

                <button
                  type="submit"
                  className="h-12 px-6 sm:px-8 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#0284c7] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 shrink-0 transition-all border border-[#38bdf8]/40"
                >
                  <PaperPlaneTilt size={18} weight="bold" />
                  <span>Enviar Cotação</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Modal Zoom Foto */}
      {fotoZoom && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-100"
          onClick={() => setFotoZoom(null)}
        >
          <div
            className="relative max-w-2xl max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setFotoZoom(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer"
            >
              <X size={20} weight="bold" />
            </button>
            <img
              src={fotoZoom}
              alt="Foto da peça ampliada"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
