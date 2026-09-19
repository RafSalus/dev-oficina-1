# Veículos Estacionados - Documentação

## Visão Geral

Tela para gerenciar veículos que foram vendidos pelos clientes, mas que a oficina mantém o histórico completo de manutenção. O veículo permanece "estacionado" no sistema até ser vinculado a um novo proprietário.

---

## Objetivo

1. **Manter histórico completo** de todas as manutenções realizadas no veículo
2. **Facilitar transferência** quando um novo cliente compra o carro
3. **Consultar histórico** antes de realizar novos serviços
4. **Controle de veículos** que não pertencem mais ao cliente original

---

## Fluxo do Negócio

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENTE VENDE O VEÍCULO                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  VEÍCULO SAI DO CLIENTE ATUAL                                   │
│  - Remove vinculo com cliente                                   │
│  - Move para "Veículos Estacionados"                            │
│  - Mantém todo histórico de manutenção                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  AGUARDANDO NOVO PROPRIETÁRIO                                   │
│  - Veículo fica estacionado no sistema                          │
│  - Histórico disponível para consulta                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  NOVO CLIENTE COMPRA O VEÍCULO                                  │
│  - Busca veículo por placa                                      │
│  - Vincula ao novo cliente                                      │
│  - Histórico continua vinculado ao veículo                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estrutura da Tela

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Header: Veículos Estacionados                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Filtros: [Placa] [Modelo] [Marca] [Ano] [Buscar] [Limpar]        │
├─────────────────────────────────────────────────────────────────────┤
│  Resumo: Total: 12 veículos | Aguardando: 8 | Vinculados: 4        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  [Card Veículo 1]                                           │   │
│  │  ┌─────────┬─────────────────────────────────────────────┐  │   │
│  │  │ FOTO    │ Placa: ASF6I46                              │  │   │
│  │  │         │ Modelo: Fiat Doblo 1.8 Cargo                │  │   │
│  │  │         │ Ano: 2009/2010 | Cor: Branca                │  │   │
│  │  │         │ Última manutenção: 19/08/2026               │  │   │
│  │  │         │ Status: Aguardando novo proprietário        │  │   │
│  │  └─────────┴─────────────────────────────────────────────┘  │   │
│  │  [Histórico] [Vincular Cliente] [Excluir]                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  [Card Veículo 2]                                           │   │
│  │  ...                                                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Footer                                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Dados do Veículo Estacionado

### Campos Principais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| ID | Number | ID interno do veículo |
| Placa | Text (máscara) | Placa do veículo (ABC1D23 ou ABC-1234) |
| Marca | Text | Marca do veículo |
| Modelo | Text | Modelo do veículo |
| Ano Fabricação | Number | Ano de fabricação |
| Ano Modelo | Number | Ano do modelo |
| Cor | Text | Cor do veículo |
| Combustível | Select | Flex, Gasolina, Etanol, Diesel |
| KM Atual | Number | Quilometragem atual |
| Chassi | Text | Número do chassi (opcional) |
| Motor | Text | Código do motor (opcional) |
| Data Entrada | Date | Data em que entrou no sistema |
| Última Manutenção | Date | Data da última manutenção |
| Total Manutenções | Number | Quantidade total de manutenções |
| Valor Total Gasto | Currency | Soma de todos os serviços |

### Campos de Vinculação

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Status | Select | Aguardando / Vinculado |
| Cliente Anterior | Object | Último cliente dono do veículo |
| Cliente Atual | Object | Novo dono (quando vinculado) |
| Data Vinculação | Date | Data em que foi vinculado ao novo cliente |

---

## Funcionalidades

### 1. Listagem com Filtros

**Filtros disponíveis:**
- Placa (busca parcial)
- Modelo (busca parcial)
- Marca (select)
- Ano (range)
- Status (Aguardando / Vinculado)

**Ordenação:**
- Data de entrada (mais recente primeiro)
- Placa (A-Z)
- Modelo (A-Z)
- Última manutenção

### 2. Card do Veículo

**Informações exibidas:**
- Foto do veículo (se houver)
- Placa (destaque)
- Modelo completo
- Ano/Cor
- Última manutenção
- Status (Aguardando/Vinculado)
- Total de manutenções
- Valor total gasto

**Ações:**
- **Histórico** → Abre modal com todas as manutenções
- **Vincular Cliente** → Abre modal para vincular novo dono
- **Editar** → Edita dados do veículo
- **Excluir** → Remove veículo (apenas se sem histórico)

### 3. Modal de Histórico

```
┌─────────────────────────────────────────────────────────────┐
│  Histórico de Manutenção - Fiat Doblo (ASF6I46)            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 19/08/2026 - OS #002908                             │   │
│  │ Cliente: Edgar Amaral                                │   │
│  │ Serviços: Troca de óleo, filtro, velas              │   │
│  │ Peças: Filtro de óleo, vela × 4                     │   │
│  │ Valor: R$ 450,00                                     │   │
│  │ Mecânico: Carlos Eduardo                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 15/03/2026 - OS #002845                             │   │
│  │ Cliente: Edgar Amaral                                │   │
│  │ Serviços: Alinhamento e balanceamento                │   │
│  │ Peças: Nenhuma                                       │   │
│  │ Valor: R$ 180,00                                     │   │
│  │ Mecânico: Carlos Eduardo                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Resumo: 5 manutenções | Total gasto: R$ 2.350,00          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4. Modal de Vinculação a Novo Cliente

```
┌─────────────────────────────────────────────────────────────┐
│  Vincular Veículo a Novo Cliente                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Veículo: Fiat Doblo 1.8 Cargo (ASF6I46)                   │
│  Último proprietário: Edgar Amaral da Silveira              │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Novo Proprietário:                                         │
│  [  Buscar cliente...                          ] [Buscar]  │
│                                                             │
│  Cliente encontrado:                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  João da Silva                                       │   │
│  │  CPF: 123.456.789-09                                 │   │
│  │  Telefone: (43) 99999-1234                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Data da Venda: [  18/09/2026  ]                           │
│  Valor da Venda: [  R$ 25.000,00 ]                         │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ⚠️  O histórico completo será mantido e vinculado          │
│     ao veículo, independente do proprietário.               │
│                                                             │
│  [Cancelar]                              [Vincular Cliente] │
└─────────────────────────────────────────────────────────────┘
```

### 5. Busca por Placa (para vinculação)

Quando um novo cliente chega com um veículo já cadastrado:

```
┌─────────────────────────────────────────────────────────────┐
│  Buscar Veículo por Placa                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [  ASF6I46  ] [Buscar]                                     │
│                                                             │
│  Resultado:                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ✓ Veículo encontrado!                               │   │
│  │                                                      │   │
│  │  Fiat Doblo 1.8 Cargo                                 │   │
│  │  Placa: ASF6I46                                       │   │
│  │  Último dono: Edgar Amaral                            │   │
│  │  Manutenções: 5 | Total: R$ 2.350,00                  │   │
│  │                                                      │   │
│  │  [Vincular a Este Veículo]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Dados

### localStorage

```javascript
// Veículos estacionados
const chave = 'dev_oficina_veiculos_estacionados'

const veiculosEstacionados = {
  'ASF6I46': {
    placa: 'ASF6I46',
    marca: 'FIAT',
    modelo: 'DOBLO 1.8 CARGO',
    anoFabricacao: 2009,
    anoModelo: 2010,
    cor: 'Branca',
    combustivel: 'FLEX',
    kmAtual: 280812,
    chassi: 'XYZ123456789',
    dataEntrada: '2026-08-19T10:00:00',
    ultimaManutencao: '2026-08-19T13:05:00',
    totalManutencoes: 5,
    valorTotalGasto: 2350.00,
    status: 'aguardando', // 'aguardando' | 'vinculado'
    clienteAnterior: {
      id: 161,
      nome: 'EDGAR AMARAL DA SILVEIRA',
      cpf: '033.687.739-09'
    },
    clienteAtual: null,
    dataVinculacao: null,
    historico: [
      {
        os: '002908',
        data: '2026-08-19',
        cliente: 'EDGAR AMARAL DA SILVEIRA',
        servicos: ['Troca de óleo', 'Troca de filtro'],
        pecas: ['Filtro de óleo', 'Vela × 4'],
        valor: 450.00,
        mecanico: 'Carlos Eduardo'
      }
    ]
  }
}
```

---

## Integração com Outras Telas

### Ao vender veículo (na tela de OS)

```javascript
// Quando OS é finalizada e veículo é vendido
function venderVeiculo(placa, novoCliente) {
  // 1. Buscar veículo no cadastro de clientes
  const veiculo = buscarVeiculoPorPlaca(placa)
  
  // 2. Mover para estacionados
  const estacionados = JSON.parse(localStorage.getItem('dev_oficina_veiculos_estacionados') || '{}')
  estacionados[placa] = {
    ...veiculo,
    status: 'aguardando',
    clienteAnterior: veiculo.cliente,
    clienteAtual: null,
    dataEntrada: new Date().toISOString()
  }
  localStorage.setItem('dev_oficina_veiculos_estacionados', JSON.stringify(estacionados))
  
  // 3. Remover vínculo com cliente antigo
  removerVeiculoDoCliente(placa, veiculo.cliente.id)
  
  // 4. Se novo cliente informado, vincular
  if (novoCliente) {
    vincularVeiculo(placa, novoCliente)
  }
}
```

### Ao cadastrar novo cliente com veículo existente

```javascript
// Quando cliente traz veículo já cadastrado
function vincularVeiculo(placa, novoCliente) {
  const estacionados = JSON.parse(localStorage.getItem('dev_oficina_veiculos_estacionados') || '{}')
  
  if (estacionados[placa]) {
    estacionados[placa].status = 'vinculado'
    estacionados[placa].clienteAtual = novoCliente
    estacionados[placa].dataVinculacao = new Date().toISOString()
    
    localStorage.setItem('dev_oficina_veiculos_estacionados', JSON.stringify(estacionados))
    
    // Adicionar veículo ao cadastro do novo cliente
    adicionarVeiculoAoCliente(placa, novoCliente.id)
    
    return { sucesso: true, historico: estacionados[placa].historico }
  }
  
  return { sucesso: false, erro: 'Veículo não encontrado' }
}
```

---

## Regras de Negócio

1. **Histórico é imutável** - Manutenções não podem ser editadas ou excluídas
2. **Veículo pode ter vários donos** - Cada transferência é registrada
3. **Exclusão só sem histórico** - Veículos com manutenções não podem ser excluídos
4. **Placa é única** - Não pode haver dois veículos com a mesma placa
5. **Dados do veículo são mantidos** - Mesmo sem dono, dados permanecem

---

## Rota

```
/gestao/veiculos-estacionados
```

---

## Componentes

```
src/
├── pages/dashboard/
│   └── VeiculosEstacionadosPage.jsx
├── components/veiculos-estacionados/
│   ├── VeiculoEstacionadoCard.jsx
│   ├── HistoricoManutencaoModal.jsx
│   ├── VincularClienteModal.jsx
│   ├── BuscarVeiculoPorPlaca.jsx
│   └── FiltrosVeiculosEstacionados.jsx
```

---

## Checklist de Implementação

- [ ] Criar `VeiculosEstacionadosPage.jsx`
- [ ] Criar `VeiculoEstacionadoCard.jsx`
- [ ] Criar `HistoricoManutencaoModal.jsx`
- [ ] Criar `VincularClienteModal.jsx`
- [ ] Criar `BuscarVeiculoPorPlaca.jsx`
- [ ] Criar `FiltrosVeiculosEstacionados.jsx`
- [ ] Adicionar rota no React Router
- [ ] Atualizar `dashboardMenus.js`
- [ ] Integrar com tela de OS (função vender)
- [ ] Integrar com cadastro de clientes
- [ ] Testar fluxo completo

---

**Data:** 18/09/2026  
**Status:** Especificação  
**Próximo passo:** Implementação da tela
