import { describe, it, expect } from 'vitest'
import {
  normalizarDigitos,
  formatarEnderecoString,
  clienteParaLinha,
  linhaParaCliente,
  veiculoParaLinha,
  linhaParaVeiculo,
} from '../../src/repositories/mapeadores/clientesVeiculos'

describe('Mapeadores Puros: Clientes e Veículos (Story 2.5)', () => {
  describe('normalizarDigitos', () => {
    it('remove caracteres não-numéricos', () => {
      expect(normalizarDigitos('123.456.789-00')).toBe('12345678900')
      expect(normalizarDigitos('(43) 99185-1501')).toBe('43991851501')
      expect(normalizarDigitos(null)).toBe('')
      expect(normalizarDigitos('')).toBe('')
    })
  })

  describe('formatarEnderecoString', () => {
    it('formata endereço completo a partir de objeto', () => {
      const end = {
        logradouro: 'Rua das Flores',
        numero: '123',
        complemento: 'Sala 4',
        bairro: 'Centro',
        cidade: 'Apucarana',
        uf: 'PR',
      }
      expect(formatarEnderecoString(end)).toBe('Rua das Flores, 123 (Sala 4) - Centro, Apucarana - PR')
    })

    it('utiliza S/N quando numero não for informado', () => {
      const end = {
        logradouro: 'Rodovia PR-444',
        bairro: 'Zona Rural',
        cidade: 'Mandaguari',
        uf: 'PR',
      }
      expect(formatarEnderecoString(end)).toBe('Rodovia PR-444, S/N - Zona Rural, Mandaguari - PR')
    })
  })

  describe('clienteParaLinha e linhaParaCliente', () => {
    it('converte cliente do formulário para linha do Postgres com tipo PF e campos normalizados', () => {
      const clienteFront = {
        id: 'cli-temp-123',
        nome: ' João da Silva ',
        tipoPessoa: 'F',
        documento: '123.456.789-00',
        rgIe: '12.345.678-9',
        telefone: '(43) 99999-1111',
        telefoneFixo: '(43) 3422-0000',
        email: 'joao@email.com',
        cep: '86800-000',
        logradouro: 'Rua Osvaldo Cruz',
        numero: '500',
        bairro: 'Centro',
        cidade: 'Apucarana',
        uf: 'PR',
        ativo: true,
      }

      const linha = clienteParaLinha(clienteFront)

      expect(linha.id).toBeUndefined() // ID temporário não deve ser enviado
      expect(linha.nome).toBe('João da Silva')
      expect(linha.tipo).toBe('PF')
      expect(linha.cpf_cnpj).toBe('12345678900')
      expect(linha.rg_ie).toBe('12.345.678-9')
      expect(linha.telefone).toBe('(43) 99999-1111')
      expect(linha.telefone_secundario).toBe('(43) 3422-0000')
      expect(linha.endereco.cep).toBe('86800000')
      expect(linha.endereco.logradouro).toBe('Rua Osvaldo Cruz')
      expect(linha.ativo).toBe(true)
    })

    it('converte PJ detectando tanto tipoPessoa J quanto documento com mais de 11 dígitos', () => {
      const clientePJ = {
        nome: 'Auto Peças Ltda',
        nomeFantasia: 'Oficina Central',
        tipoPessoa: 'J',
        documento: '12.345.678/0001-90',
        telefone: '(43) 3000-1111',
      }

      const linha = clienteParaLinha(clientePJ)
      expect(linha.tipo).toBe('PJ')
      expect(linha.cpf_cnpj).toBe('12345678000190')
      expect(linha.nome_fantasia).toBe('Oficina Central')
    })

    it('reconstitui cliente a partir da linha do Postgres (ida e volta)', () => {
      const linha = {
        id: 'uuid-cli-001',
        codigo_cliente: '0000166',
        nome: 'Maria Souza',
        nome_fantasia: 'Maria Souza',
        tipo: 'PF',
        cpf_cnpj: '98765432100',
        rg_ie: '10203040',
        telefone: '(43) 98888-2222',
        telefone_secundario: '(43) 3423-1111',
        email: 'maria@test.com',
        endereco: {
          cep: '86800100',
          logradouro: 'Av Curitiba',
          numero: '100',
          complemento: 'Apto 1',
          bairro: 'Centro',
          cidade: 'Apucarana',
          uf: 'PR',
        },
        ativo: true,
        observacoes: 'Cliente VIP',
        created_at: '2026-09-26T12:00:00Z',
        updated_at: '2026-09-26T12:00:00Z',
      }

      const cliente = linhaParaCliente(linha)

      expect(cliente.id).toBe('uuid-cli-001')
      expect(cliente.value).toBe('uuid-cli-001')
      expect(cliente.codigoCliente).toBe('0000166')
      expect(cliente.tipoPessoa).toBe('F')
      expect(cliente.documento).toBe('98765432100')
      expect(cliente.telefoneFixo).toBe('(43) 3423-1111')
      expect(cliente.logradouro).toBe('Av Curitiba')
      expect(cliente.numero).toBe('100')
      expect(cliente.endereco).toBe('Av Curitiba, 100 (Apto 1) - Centro, Apucarana - PR')
      expect(cliente.label).toBe('0000166 - Maria Souza - (43) 98888-2222')
    })
  })

  describe('veiculoParaLinha e linhaParaVeiculo', () => {
    it('converte veículo do formulário para linha do Postgres com km inteiro e códigos FIPE', () => {
      const veiculoFront = {
        id: 'veic-temp-999',
        clienteId: 'uuid-cli-001',
        placa: 'abc-1d23',
        marca: 'Fiat',
        marcaCodigo: '21',
        modelo: 'Palio Weekend',
        modeloCodigo: '1050',
        ano: '2015',
        anoCodigo: '2015-1',
        cor: 'Prata',
        combustivel: 'FLEX',
        kmPadrao: '125.000',
        chassi: '9BWZZZ377VT000000',
        renavam: '12345678901',
        ativo: true,
      }

      const linha = veiculoParaLinha(veiculoFront)

      expect(linha.id).toBeUndefined() // ID temporário não deve ser enviado
      expect(linha.cliente_id).toBe('uuid-cli-001')
      expect(linha.placa).toBe('ABC1D23')
      expect(linha.marca).toBe('Fiat')
      expect(linha.modelo).toBe('Palio Weekend')
      expect(linha.marca_codigo).toBe('21')
      expect(linha.modelo_codigo).toBe('1050')
      expect(linha.ano_codigo).toBe('2015-1')
      expect(linha.km_atual).toBe(125000)
      expect(linha.chassi).toBe('9BWZZZ377VT000000')
      expect(linha.renavam).toBe('12345678901')
    })

    it('reconstitui veículo com dados do proprietário da frota (ida e volta)', () => {
      const linha = {
        id: 'uuid-veic-001',
        cliente_id: 'uuid-cli-001',
        codigo_veiculo: 'VEIC-0001',
        placa: 'ABC1D23',
        marca: 'Fiat',
        modelo: 'Palio Weekend',
        ano: '2015',
        cor: 'Prata',
        combustivel: 'FLEX',
        km_atual: 125000,
        chassi: '9BWZZZ377VT000000',
        renavam: '12345678901',
        ativo: true,
        clientes: {
          id: 'uuid-cli-001',
          nome: 'Maria Souza',
          codigo_cliente: '0000166',
          cpf_cnpj: '98765432100',
          telefone: '(43) 98888-2222',
          tipo: 'PF',
          endereco: { cidade: 'Apucarana', uf: 'PR' },
        },
      }

      const veiculo = linhaParaVeiculo(linha)

      expect(veiculo.id).toBe('uuid-veic-001')
      expect(veiculo.codigoVeiculo).toBe('VEIC-0001')
      expect(veiculo.marcaModelo).toBe('Fiat Palio Weekend')
      expect(veiculo.kmPadrao).toBe('125000')
      expect(veiculo.label).toBe('ABC1D23 - Fiat Palio Weekend (2015 - Prata)')
      // Dados do proprietário enriquecidos
      expect(veiculo.clienteId).toBe('uuid-cli-001')
      expect(veiculo.clienteNome).toBe('Maria Souza')
      expect(veiculo.clienteCodigo).toBe('0000166')
      expect(veiculo.clienteDocumento).toBe('98765432100')
      expect(veiculo.clienteTipoPessoa).toBe('F')
      expect(veiculo.clienteCidade).toBe('Apucarana')
    })
  })
})
