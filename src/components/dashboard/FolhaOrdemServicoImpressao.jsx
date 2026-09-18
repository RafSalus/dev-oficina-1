import React, { useMemo } from 'react'

/**
 * Componente que reproduz com precisão milimétrica a Folha Oficial de Orçamento / Ordem de Serviço
 * Conforme o modelo de impressão real da Mecânica Gabriel (Ordem Serviço.jpg)
 * Suporta paginação inteligente automática (Folha 01/02, 02/02...) quando houver muitos itens
 * como 30 peças, serviços de oficina e serviços de terceiros.
 */
export function FolhaOrdemServicoImpressao({
  formData = {},
  exibirApenasImpressao = false,
  paginaSelecionada = 'todas',
  className = '',
  style = {},
}) {
  const {
    numeroOS = '002908',
    dataEmissao = new Date().toLocaleDateString('pt-BR', { year: '2-digit', month: '2-digit', day: '2-digit' }),
    horaEmissao = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    consultorResponsavel = 'BIANCA',
    cliente = 'EDGAR AMARAL DA SILVEIRA',
    codigoCliente = '0000161',
    documento = '033.687.739-09',
    endereco = 'R TUPINAMBA, 566',
    cidade = 'APUCARANA',
    uf = 'PR',
    cep = '86812-405',
    telefone = '(43) 98812-6874',
    email = '',
    placa = 'ASF6I46',
    marca = 'FIAT',
    modelo = 'DOBLO 1.8 CARGO',
    marcaModelo = 'FIAT DOBLO 1.8 CARGO',
    ano = '2009/2010',
    cor = 'BRANCA',
    combustivel = 'FLEX',
    km = '280.812',
    kmAnterior = '279.003',
    chassis = '',
    frota = '',
    pecasOS = [],
    servicosOS = [],
    terceirosOS = [],
    descontoGeralOS = 0,
    previsaoEntregaData = '',
    previsaoEntregaHora = '',
  } = formData

  // Formata número em moeda brasileira sem o R$
  const formatMoeda = (valor) => {
    const num = parseFloat(valor) || 0
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Lista consolidada de Peças
  const pecasParaExibir = useMemo(() => {
    if (pecasOS && pecasOS.length > 0) {
      return pecasOS.map((p, idx) => ({
        codigo: p.codigo || `PEC-${idx + 1}`,
        nome: p.nome,
        unidade: p.unidade || 'UN',
        quantidade: parseFloat(p.quantidade) || 1,
        precoUnitario: parseFloat(p.precoUnitario) || 0,
        desconto: parseFloat(p.desconto) || 0,
        marca: p.marca || '',
      }))
    }
    // Mock padrão do documento físico da Mecânica Gabriel
    return [
      {
        codigo: '10039B',
        nome: 'ANEL VEDADOR DA ADM',
        unidade: 'UN',
        quantidade: 4,
        precoUnitario: 15.0,
        desconto: 0,
      },
      {
        codigo: '0018969',
        nome: 'TUBO SUPORTE ARREFECIMENTO',
        unidade: 'PC',
        quantidade: 1,
        precoUnitario: 200.0,
        desconto: 0,
      },
      {
        codigo: '2682',
        nome: 'ABRACADEIRA 14X22',
        unidade: 'UN',
        quantidade: 2,
        precoUnitario: 10.0,
        desconto: 0,
      },
      {
        codigo: '010804',
        nome: 'ADITIVO A05 PRONTO USO',
        unidade: 'LT',
        quantidade: 1,
        precoUnitario: 40.0,
        desconto: 0,
      },
      {
        codigo: 'DIVERSAS',
        nome: 'PEÇAS - PARAFUSO C/ PORCA E ARRUELA',
        unidade: 'PC',
        quantidade: 1,
        precoUnitario: 10.0,
        desconto: 0,
      },
    ]
  }, [pecasOS])

  // Lista consolidada de Mão de Obra e Serviços da Oficina
  const maoObraParaExibir = useMemo(() => {
    if (servicosOS && servicosOS.length > 0) {
      return servicosOS.map((s, idx) => ({
        codigo: s.codigo || `0${1840 + idx}`,
        nome: s.nome,
        unidade: s.unidade || 'mo',
        quantidade: parseFloat(s.quantidade) || 1,
        precoUnitario: parseFloat(s.precoUnitario || s.valorUnitario) || 0,
        desconto: parseFloat(s.desconto) || 0,
        tempoHoras: s.tempoHoras || '',
      }))
    }
    return [
      {
        codigo: '01845',
        nome: 'TROCA TUBO DE AGUA DO COLETOR DE ADM',
        unidade: 'mo',
        quantidade: 1,
        precoUnitario: 300.0,
        desconto: 0,
      },
    ]
  }, [servicosOS])

  // Lista consolidada de Serviços de Terceiros Homologados
  const terceirosParaExibir = useMemo(() => {
    if (terceirosOS && terceirosOS.length > 0) {
      return terceirosOS.map((t, idx) => ({
        codigo: t.codigo || `TER-${String(idx + 1).padStart(2, '0')}`,
        nome: t.nome,
        unidade: 'sv',
        quantidade: parseFloat(t.quantidade) || 1,
        precoUnitario: parseFloat(t.valorVenda || t.precoFinal || t.precoUnitario) || 0,
        desconto: parseFloat(t.desconto) || 0,
        parceiroNome: t.parceiroNome || 'Fornecedor Terceirizado',
      }))
    }
    return []
  }, [terceirosOS])

  // Cálculos consolidados da Ordem de Serviço
  const totaisGerais = useMemo(() => {
    let totalBrutoPecas = 0
    let totalDescPecas = 0
    pecasParaExibir.forEach((p) => {
      const bruto = (p.precoUnitario || 0) * (p.quantidade || 1)
      totalBrutoPecas += bruto
      totalDescPecas += p.desconto || 0
    })
    const subTotalPecas = Math.max(0, totalBrutoPecas - totalDescPecas)

    let totalBrutoMaoObra = 0
    let totalDescMaoObra = 0
    maoObraParaExibir.forEach((s) => {
      const bruto = (s.precoUnitario || 0) * (s.quantidade || 1)
      totalBrutoMaoObra += bruto
      totalDescMaoObra += s.desconto || 0
    })
    const subTotalMaoObra = Math.max(0, totalBrutoMaoObra - totalDescMaoObra)

    let totalBrutoTerceiros = 0
    let totalDescTerceiros = 0
    terceirosParaExibir.forEach((t) => {
      const bruto = (t.precoUnitario || 0) * (t.quantidade || 1)
      totalBrutoTerceiros += bruto
      totalDescTerceiros += t.desconto || 0
    })
    const subTotalTerceiros = Math.max(0, totalBrutoTerceiros - totalDescTerceiros)

    const descGeral = parseFloat(descontoGeralOS) || 0
    const totalOrcamento = Math.max(0, subTotalPecas + subTotalMaoObra + subTotalTerceiros - descGeral)

    return {
      totalBrutoPecas,
      totalDescPecas,
      subTotalPecas,
      totalBrutoMaoObra,
      totalDescMaoObra,
      subTotalMaoObra,
      totalBrutoTerceiros,
      totalDescTerceiros,
      subTotalTerceiros,
      descGeral,
      totalOrcamento,
    }
  }, [pecasParaExibir, maoObraParaExibir, terceirosParaExibir, descontoGeralOS])

  // =========================================================================
  // SISTEMA DE PAGINAÇÃO INTELIGENTE A4
  // Distribui automaticamente itens separando Peças, Mão de Obra e Terceiros
  // =========================================================================
  const paginas = useMemo(() => {
    const totalItens = pecasParaExibir.length + maoObraParaExibir.length + terceirosParaExibir.length

    // Caso 1: Se couber perfeitamente em 1 única folha (até 15 itens)
    if (totalItens <= 15) {
      return [
        {
          numero: 1,
          isPrimeira: true,
          isUltima: true,
          pecas: pecasParaExibir,
          servicosMaoObra: maoObraParaExibir,
          servicosTerceiros: terceirosParaExibir,
          temCabecalhoCompleto: true,
          temClienteVeiculo: true,
          temTotaisEAssinaturas: true,
        },
      ]
    }

    // Caso 2: Múltiplas folhas (ex: muitas peças, serviços e terceiros)
    const LIMITE_FOLHA_1 = 18
    const LIMITE_FOLHA_MEIO = 24
    const LIMITE_FOLHA_FINAL = 16

    const listaPaginas = []
    let pecasRestantes = [...pecasParaExibir]
    let maoObraRestante = [...maoObraParaExibir]
    let terceirosRestante = [...terceirosParaExibir]
    let folhaAtual = 1

    const extrairItens = (limite) => {
      let vagas = limite
      const pecasAlocadas = pecasRestantes.splice(0, vagas)
      vagas -= pecasAlocadas.length

      const maoObraAlocada = vagas > 0 ? maoObraRestante.splice(0, vagas) : []
      vagas -= maoObraAlocada.length

      const terceirosAlocados = vagas > 0 ? terceirosRestante.splice(0, vagas) : []
      vagas -= terceirosAlocados.length

      return {
        pecas: pecasAlocadas,
        servicosMaoObra: maoObraAlocada,
        servicosTerceiros: terceirosAlocados,
      }
    }

    // Folha 1: Sempre contém cabeçalho principal e dados cadastrais completos
    const itensFolha1 = extrairItens(LIMITE_FOLHA_1)
    listaPaginas.push({
      numero: 1,
      isPrimeira: true,
      isUltima: false,
      ...itensFolha1,
      temCabecalhoCompleto: true,
      temClienteVeiculo: true,
      temTotaisEAssinaturas: false,
    })

    // Folhas subsequentes
    while (pecasRestantes.length > 0 || maoObraRestante.length > 0 || terceirosRestante.length > 0) {
      folhaAtual++
      const itensSobrando = pecasRestantes.length + maoObraRestante.length + terceirosRestante.length

      if (itensSobrando <= LIMITE_FOLHA_FINAL) {
        listaPaginas.push({
          numero: folhaAtual,
          isPrimeira: false,
          isUltima: true,
          pecas: pecasRestantes.splice(0, pecasRestantes.length),
          servicosMaoObra: maoObraRestante.splice(0, maoObraRestante.length),
          servicosTerceiros: terceirosRestante.splice(0, terceirosRestante.length),
          temCabecalhoCompleto: false,
          temClienteVeiculo: false,
          temTotaisEAssinaturas: true,
        })
        break
      }

      const itensMeio = extrairItens(LIMITE_FOLHA_MEIO)
      const ehUltima = pecasRestantes.length === 0 && maoObraRestante.length === 0 && terceirosRestante.length === 0

      listaPaginas.push({
        numero: folhaAtual,
        isPrimeira: false,
        isUltima: ehUltima,
        ...itensMeio,
        temCabecalhoCompleto: false,
        temClienteVeiculo: false,
        temTotaisEAssinaturas: ehUltima,
      })
    }

    return listaPaginas
  }, [pecasParaExibir, maoObraParaExibir, terceirosParaExibir])

  const totalPaginas = paginas.length

  return (
    <div className="w-full flex flex-col items-center select-text">
      {paginas.map((pag) => {
        // Se o usuário selecionou visualizar apenas uma página específica na tela (não afeta impressão)
        const ocultarNaTela =
          paginaSelecionada !== 'todas' &&
          Number(paginaSelecionada) !== pag.numero &&
          !exibirApenasImpressao

        if (ocultarNaTela) return null

        return (
          <div
            key={`folha-pagina-${pag.numero}`}
            className={`folha-pagina-a4 bg-white text-black font-mono text-[11px] leading-tight print:m-0 print:p-0 ${
              exibirApenasImpressao
                ? ''
                : 'p-4 sm:p-6 max-w-4xl w-full shadow-md border border-[#d0d5dd] rounded-xl mb-6 relative'
            } ${className}`}
            style={{ minWidth: '760px', ...style }}
          >
            {/* Tag visual de folha na tela (oculta na impressão) */}
            {totalPaginas > 1 && !exibirApenasImpressao && (
              <div className="print:hidden absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#101828] text-white text-[10px] font-bold shadow-xs flex items-center gap-1.5">
                <span>FOLHA {pag.numero} DE {totalPaginas}</span>
                {pag.isUltima && (
                  <span className="text-[#38bdf8] font-semibold">• Totais e Assinaturas</span>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 1. CABEÇALHO DA OFICINA */}
            {/* ========================================================================= */}
            {pag.temCabecalhoCompleto ? (
              // Cabeçalho Oficial Principal (Folha 1)
              <div className="border border-black flex mb-1">
                {/* Coluna 1: Logo da Oficina Mecânica Gabriel */}
                <div className="w-36 p-2 border-r border-black flex flex-col items-center justify-center shrink-0">
                  <img
                    src="/favicon-96x96.png"
                    alt="Mecânica Gabriel"
                    className="w-20 h-20 object-contain"
                  />
                  <span className="text-[8px] font-bold mt-1 text-center text-black">
                    43 99854-4106
                  </span>
                </div>

                {/* Coluna 2: Dados Cadastrais e Endereço */}
                <div className="flex-1 p-2 border-r border-black text-[10px] space-y-0.5">
                  <div className="font-extrabold text-xs uppercase tracking-tight">
                    GABRIEL AMARAL SALUSTIANO - MECANICA
                  </div>
                  <div className="flex justify-between">
                    <span>CNPJ:25.328.968/0001-72</span>
                    <span>I.E.:9081763671</span>
                  </div>
                  <div>AV. MINAS GERAIS, 3310</div>
                  <div className="flex justify-between">
                    <span>APUCARANA</span>
                    <span>PR CEP: 86812-490</span>
                  </div>
                  <div>43-3122-4545</div>
                  <div>Email:mecanicagabriel2016@gmail.com</div>
                  <div>Site:</div>
                </div>

                {/* Coluna 3: Número do Orçamento e Dados de Atendimento */}
                <div className="w-48 p-2 flex flex-col justify-between shrink-0 bg-[#f9fafb] print:bg-transparent">
                  <div className="whitespace-nowrap">
                    <div className="flex items-baseline gap-1.5 whitespace-nowrap my-0.5">
                      <span className="text-[11px] font-extrabold uppercase tracking-tight whitespace-nowrap">
                        ORÇAMENTO-
                      </span>
                      <span className="text-xl font-black tracking-wide text-[#101828] font-mono whitespace-nowrap">
                        {numeroOS || '002908'}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] space-y-0.5 border-t border-black/30 pt-1">
                    <div className="flex justify-between whitespace-nowrap">
                      <span>Data: {dataEmissao}</span>
                    </div>
                    <div className="flex justify-between whitespace-nowrap">
                      <span>Hora: {horaEmissao}</span>
                      <span className="font-bold text-black whitespace-nowrap">
                        Fl:{String(pag.numero).padStart(2, '0')}/{String(totalPaginas).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="whitespace-nowrap truncate">Atend.:{consultorResponsavel?.toUpperCase() || 'BIANCA'}</div>
                  </div>
                </div>
              </div>
            ) : (
              // Cabeçalho de Continuação Oficial (Folhas 2+)
              <div className="border border-black flex mb-1 bg-[#f9fafb] print:bg-transparent">
                <div className="w-24 p-1.5 border-r border-black flex items-center justify-center shrink-0">
                  <img
                    src="/favicon-96x96.png"
                    alt="Mecânica Gabriel"
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="flex-1 p-1.5 border-r border-black text-[10px] space-y-0.5">
                  <div className="font-extrabold text-[11px] uppercase tracking-tight">
                    GABRIEL AMARAL SALUSTIANO - MECANICA (CONTINUAÇÃO)
                  </div>
                  <div className="flex justify-between text-[9px] text-[#344054]">
                    <span>Cliente: <strong className="text-black uppercase">{cliente || 'CLIENTE'}</strong></span>
                    <span>Placa: <strong className="text-black font-mono font-bold">{placa?.toUpperCase() || 'SEM PLACA'}</strong></span>
                    <span>Veículo: <strong className="text-black">{marcaModelo?.toUpperCase() || ''}</strong></span>
                  </div>
                </div>
                <div className="w-48 p-1.5 flex flex-col justify-between shrink-0">
                  <div className="flex justify-between items-center whitespace-nowrap">
                    <span className="text-[10px] font-extrabold uppercase whitespace-nowrap">ORÇAMENTO-</span>
                    <span className="text-sm font-black font-mono whitespace-nowrap">{numeroOS || '002908'}</span>
                  </div>
                  <div className="flex justify-between text-[9px] border-t border-black/30 pt-0.5 whitespace-nowrap">
                    <span>Data: {dataEmissao}</span>
                    <span className="font-bold text-black whitespace-nowrap">
                      Fl:{String(pag.numero).padStart(2, '0')}/{String(totalPaginas).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. DADOS DO CLIENTE E DO VEÍCULO (FOLHA 1) */}
            {/* ========================================================================= */}
            {pag.temClienteVeiculo && (
              <div className="border border-black grid grid-cols-2 mb-1">
                {/* Box Esquerda: Dados do Cliente */}
                <div className="p-2 border-r border-black text-[10px] space-y-0.5">
                  <div className="font-bold truncate">
                    Cliente.: {codigoCliente ? `${codigoCliente}-` : ''}
                    {cliente?.toUpperCase() || 'CLIENTE NÃO INFORMADO'}
                  </div>
                  <div>CPF/CNPJ:{documento || 'Não informado'}</div>
                  <div className="truncate">Endereço:{endereco?.toUpperCase() || 'NÃO INFORMADO'}</div>
                  <div className="flex justify-between">
                    <span>Cidade..: {cidade?.toUpperCase() || 'APUCARANA'}</span>
                    <span>UF: {uf?.toUpperCase() || 'PR'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CEP.....: {cep || '86812-405'}</span>
                    <span>Fone: {telefone || 'Não informado'}</span>
                  </div>
                  <div className="truncate">E-mail..: {email || ''}</div>
                </div>

                {/* Box Direita: Dados do Veículo */}
                <div className="p-2 text-[10px] grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <div>Descr..:</div>
                    <div className="font-bold">Placa..: {placa?.toUpperCase() || 'SEM PLACA'}</div>
                    <div>Marca..: {marca?.toUpperCase() || (marcaModelo ? marcaModelo.split(' ')[0] : 'FIAT')}</div>
                    <div>Ano....: {ano || '2009/2010'}</div>
                    <div>Chassis: {chassis || ''}</div>
                    <div className="font-bold truncate">
                      Modelo.: {modelo?.toUpperCase() || (marcaModelo ? marcaModelo.toUpperCase() : 'DOBLO 1.8 CARGO')}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div>Frota..: {frota || ''}</div>
                    <div>Combus.: {combustivel?.toUpperCase() || 'FLEX'}</div>
                    <div>Cor....: {cor?.toUpperCase() || 'BRANCA'}</div>
                    <div>Km Ant.: {kmAnterior || '279.003'}</div>
                    <div className="font-bold">Km Atu.: {km || '280.812'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. TABELA DE PEÇAS DESTA FOLHA */}
            {/* ========================================================================= */}
            {pag.pecas.length > 0 && (
              <div className="border border-black mb-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black bg-[#f2f4f7] print:bg-[#f2f4f7] text-[10px] font-bold uppercase">
                      <th className="py-1 px-1.5 border-r border-black w-20">Código</th>
                      <th className="py-1 px-1.5 border-r border-black">Descrição da Peça</th>
                      <th className="py-1 px-1 border-r border-black text-center w-10">Uni</th>
                      <th className="py-1 px-1.5 border-r border-black text-right w-14">Qtde</th>
                      <th className="py-1 px-1.5 border-r border-black text-right w-16">Pr.Unit</th>
                      <th className="py-1 px-1.5 border-r border-black text-right w-16">Pr.Bruto</th>
                      <th className="py-1 px-1.5 border-r border-black text-right w-16">Desc R$</th>
                      <th className="py-1 px-1.5 text-right w-18">Pr.Líquido</th>
                    </tr>
                  </thead>
                  <tbody className="text-[10px] divide-y divide-black/40">
                    {pag.pecas.map((peca, idx) => {
                      const qtd = peca.quantidade || 1
                      const unit = peca.precoUnitario || 0
                      const bruto = unit * qtd
                      const desc = peca.desconto || 0
                      const liquido = Math.max(0, bruto - desc)

                      return (
                        <tr key={`folha-${pag.numero}-peca-${idx}`} className="hover:bg-gray-50 print:hover:bg-transparent">
                          <td className="py-0.5 px-1.5 border-r border-black font-semibold">
                            {peca.codigo}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-black uppercase font-medium truncate max-w-xs">
                            {peca.nome}
                            {peca.marca ? ` (${peca.marca})` : ''}
                          </td>
                          <td className="py-0.5 px-1 border-r border-black text-center uppercase">
                            {peca.unidade || 'UN'}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-black text-right">
                            {qtd.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-black text-right">
                            {formatMoeda(unit)}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-black text-right">
                            {formatMoeda(bruto)}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-black text-right">
                            {desc > 0 ? formatMoeda(desc) : ''}
                          </td>
                          <td className="py-0.5 px-1.5 text-right font-bold">
                            {formatMoeda(liquido)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. TABELA DE MÃO DE OBRA E SERVIÇOS DA OFICINA */}
            {/* ========================================================================= */}
            {pag.servicosMaoObra && pag.servicosMaoObra.length > 0 && (
              <div className="border border-black mb-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black bg-[#f2f4f7] print:bg-[#f2f4f7] text-[10px] font-bold uppercase">
                      <th className="py-1 px-1.5 border-r border-black w-20">Código</th>
                      <th className="py-1 px-1.5 border-r border-black">Mão de Obra e Serviços da Oficina</th>
                      <th className="py-1 px-1 border-r border-black text-center w-10">Uni</th>
                      <th className="py-1 px-1.5 border-r border-black text-right w-14">Qtde</th>
                      <th className="py-1 px-1.5 border-r border-black text-right w-16">Pr.Unit</th>
                      <th className="py-1 px-1.5 border-r border-black text-right w-16">Pr.Bruto</th>
                      <th className="py-1 px-1.5 border-r border-black text-right w-16">Desc R$</th>
                      <th className="py-1 px-1.5 text-right w-18">Pr.Líquido</th>
                    </tr>
                  </thead>
                  <tbody className="text-[10px] divide-y divide-black/40">
                    {pag.servicosMaoObra.map((serv, idx) => {
                      const qtd = serv.quantidade || 1
                      const unit = serv.precoUnitario || 0
                      const bruto = unit * qtd
                      const desc = serv.desconto || 0
                      const liquido = Math.max(0, bruto - desc)

                      return (
                        <tr
                          key={`folha-${pag.numero}-mo-${idx}`}
                          className="hover:bg-gray-50 print:hover:bg-transparent"
                        >
                          <td className="py-0.5 px-1.5 border-r border-black font-semibold">
                            {serv.codigo}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-black uppercase font-medium">
                            <div className="truncate max-w-md">
                              {serv.nome}
                            </div>
                          </td>
                          <td className="py-0.5 px-1 border-r border-black text-center uppercase">
                            {serv.unidade || 'mo'}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-black text-right">
                            {qtd.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-black text-right">
                            {formatMoeda(unit)}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-black text-right">
                            {formatMoeda(bruto)}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-black text-right">
                            {desc > 0 ? formatMoeda(desc) : ''}
                          </td>
                          <td className="py-0.5 px-1.5 text-right font-bold">
                            {formatMoeda(liquido)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. TABELA DE SERVIÇOS DE TERCEIROS HOMOLOGADOS */}
            {/* ========================================================================= */}
            {pag.servicosTerceiros && pag.servicosTerceiros.length > 0 && (
              <div className="border border-black mb-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black bg-[#f2f4f7] print:bg-[#f2f4f7] text-[10px] font-bold uppercase">
                      <th className="py-1 px-1.5 border-r border-black w-20">Código</th>
                      <th className="py-1 px-1.5 border-r border-black">Serviços de Terceiros (Parceiro / Fornecedor)</th>
                      <th className="py-1 px-1 border-r border-black text-center w-10">Uni</th>
                      <th className="py-1 px-1.5 border-r border-black text-right w-14">Qtde</th>
                      <th className="py-1 px-1.5 border-r border-black text-right w-16">Pr.Unit</th>
                      <th className="py-1 px-1.5 border-r border-black text-right w-16">Pr.Bruto</th>
                      <th className="py-1 px-1.5 border-r border-black text-right w-16">Desc R$</th>
                      <th className="py-1 px-1.5 text-right w-18">Pr.Líquido</th>
                    </tr>
                  </thead>
                  <tbody className="text-[10px] divide-y divide-black/40">
                    {pag.servicosTerceiros.map((terc, idx) => {
                      const qtd = terc.quantidade || 1
                      const unit = terc.precoUnitario || 0
                      const bruto = unit * qtd
                      const desc = terc.desconto || 0
                      const liquido = Math.max(0, bruto - desc)

                      return (
                        <tr
                          key={`folha-${pag.numero}-terc-${idx}`}
                          className="hover:bg-gray-50 print:hover:bg-transparent"
                        >
                          <td className="py-0.5 px-1.5 border-r border-black font-semibold">
                            {terc.codigo}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-black uppercase font-medium">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate">{terc.nome}</span>
                              {terc.parceiroNome && (
                                <span className="px-1.5 py-0.5 bg-gray-100 border border-black/40 rounded text-[8px] font-bold text-gray-700 uppercase shrink-0 print:bg-transparent print:border-black print:text-black">
                                  {terc.parceiroNome}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-0.5 px-1 border-r border-black text-center uppercase">
                            {terc.unidade || 'sv'}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-black text-right">
                            {qtd.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-black text-right">
                            {formatMoeda(unit)}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-black text-right">
                            {formatMoeda(bruto)}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-black text-right">
                            {desc > 0 ? formatMoeda(desc) : ''}
                          </td>
                          <td className="py-0.5 px-1.5 text-right font-bold">
                            {formatMoeda(liquido)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ========================================================================= */}
            {/* AVISO DE CONTINUAÇÃO (QUANDO NÃO FOR A ÚLTIMA FOLHA) */}
            {/* ========================================================================= */}
            {!pag.isUltima && (
              <div className="border border-black p-2 mt-2 bg-[#f9fafb] print:bg-transparent flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span>&gt;&gt;&gt; CONTINUA NA FOLHA {String(pag.numero + 1).padStart(2, '0')}/{String(totalPaginas).padStart(2, '0')} &gt;&gt;&gt;</span>
                </span>
                <span className="text-[9px] text-[#475467] print:text-black">
                  Subtotal transportado para a próxima folha
                </span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 6. FAIXA OFICIAL DE TOTAIS E SUBTOTAIS (SOMENTE NA ÚLTIMA FOLHA) */}
            {/* ========================================================================= */}
            {pag.temTotaisEAssinaturas && (
              <>
                <div className="border border-black flex mb-1 bg-[#fcfcfd] print:bg-transparent text-[9px] font-semibold">
                  <div className="flex-1 border-r border-black p-1 text-center bg-[#f2f4f7] print:bg-transparent">
                    <div className="text-[8px] uppercase text-gray-700">Sub.Total Peças</div>
                    <div className="font-bold text-[10px] mt-0.5">
                      {formatMoeda(totaisGerais.subTotalPecas)}
                    </div>
                  </div>

                  <div className="flex-1 border-r border-black p-1 text-center bg-[#f2f4f7] print:bg-transparent">
                    <div className="text-[8px] uppercase text-gray-700">Mão de Obra Oficina</div>
                    <div className="font-bold text-[10px] mt-0.5">
                      {formatMoeda(totaisGerais.subTotalMaoObra)}
                    </div>
                  </div>

                  <div className="flex-1 border-r border-black p-1 text-center bg-[#f2f4f7] print:bg-transparent">
                    <div className="text-[8px] uppercase text-gray-700">Serv. Terceiros</div>
                    <div className="font-bold text-[10px] mt-0.5">
                      {formatMoeda(totaisGerais.subTotalTerceiros)}
                    </div>
                  </div>

                  <div className="flex-1 border-r border-black p-1 text-center">
                    <div className="text-[8px] uppercase text-gray-700">Descontos</div>
                    <div className="font-bold text-[10px] mt-0.5">
                      {totaisGerais.totalDescPecas +
                        totaisGerais.totalDescMaoObra +
                        totaisGerais.totalDescTerceiros +
                        totaisGerais.descGeral >
                      0
                        ? formatMoeda(
                            totaisGerais.totalDescPecas +
                              totaisGerais.totalDescMaoObra +
                              totaisGerais.totalDescTerceiros +
                              totaisGerais.descGeral
                          )
                        : ''}
                    </div>
                  </div>

                  <div className="w-16 border-r border-black p-1 text-center">
                    <div className="text-[8px] uppercase text-gray-700">ISS Retido</div>
                    <div className="font-bold text-[10px] mt-0.5"></div>
                  </div>

                  {/* Total Geral da OS */}
                  <div className="w-48 p-1 px-2 flex flex-col justify-center text-right bg-black text-white print:bg-transparent print:text-black">
                    <div className="text-[8px] uppercase font-bold text-gray-300 print:text-black">
                      Total do Orçamento
                    </div>
                    <div className="text-xl font-black tracking-tight">
                      {formatMoeda(totaisGerais.totalOrcamento)}
                    </div>
                  </div>
                </div>

                {/* Detalhamento de Serviços de terceiros caso haja */}
                {totaisGerais.subTotalTerceiros > 0 && (
                  <div className="flex items-center justify-between text-[8px] text-[#475467] print:text-black px-1 mb-1 italic">
                    <span>
                      * Serviços de terceiros executados por parceiros homologados pela Mecânica Gabriel
                    </span>
                    <span>Garantia de 90 dias integrada</span>
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
