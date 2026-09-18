# Cadastros Base - Menu Suprimentos

## Estrutura do Menu Atualizada

```
├── Operações
├── Atendimento e Pátio
├── Oficina e Serviços
├── Suprimentos
│   ├── Compras
│   ├── Estoque
│   ├── Serviços (Mão de Obra)  ← NOVO
│   ├── Peças e Produtos        ← NOVO
│   └── Terceiros/Parceiros     ← NOVO
├── Financeiro e Fiscal
└── Administração
```

---

## Itens a Implementar

### 1. Serviços (Mão de Obra)

**Rota:** `/gestao/servicos`  
**Ícone:** `Wrench`  
**Descrição:** Cadastro de serviços prestados pela oficina com dados para emissão de NFS-e.

**Campos:**

| Campo | Tipo | Obrigatório | Para NF-e |
|-------|------|-------------|-----------|
| Código | Texto (SKU) | Sim | - |
| Nome | Texto | Sim | - |
| Descrição | Textarea | Não | - |
| Categoria | Select | Sim | - |
| Valor Mão de Obra | Numérico | Sim | - |
| Tempo Estimado (horas) | Numérico | Não | - |
| Código CNAE | Texto | Sim | Obrigatório |
| Código Serviço IBPT | Texto | Sim | Obrigatório |
| Alíquota ISS (%) | Numérico | Sim | Obrigatório |
| Ativo | Checkbox | Sim | - |

**Categorias pré-definidas:**
- Motor
- Freios
- Arrefecimento
- Elétrica
- Suspensão
- Transmissão
- Injeção Eletrônica
- Ar-Condicionado
- Funilaria/Pintura
- Mecânica Geral

**Exemplo de cadastro:**
```javascript
{
  codigo: 'SRV-001',
  nome: 'Troca de Óleo e Filtro',
  descricao: 'Troca de óleo do motor com filtro',
  categoria: 'Motor',
  valorMaoDeObra: 150.00,
  tempoEstimado: 1.5,
  cnae: '45201-04',
  codigoServicoIBPT: '14.01',
  aliquotaISS: 5.00,
  ativo: true
}
```

---

### 2. Peças e Produtos

**Rota:** `/gestao/pecas`  
**Ícone:** `Package`  
**Descrição:** Cadastro de peças, produtos e materiais com dados para emissão de NF-e.

**Campos:**

| Campo | Tipo | Obrigatório | Para NF-e |
|-------|------|-------------|-----------|
| Código | Texto (SKU) | Sim | - |
| Nome | Texto | Sim | - |
| Código Fabricante | Texto | Não | - |
| GTIN/EAN | Texto (13 dígitos) | Sim | Obrigatório |
| NCM | Texto (8 dígitos) | Sim | Obrigatório |
| CFOP | Texto (4 dígitos) | Sim | Obrigatório |
| CST/CSOSN | Texto | Sim | Obrigatório |
| Unidade | Select | Sim | - |
| Preço Custo | Numérico | Sim | - |
| Preço Venda | Numérico | Sim | - |
| Margem Lucro (%) | Numérico | Calculado | - |
| Estoque Mínimo | Numérico | Não | - |
| Estoque Atual | Numérico | Sim | - |
| Localização | Texto | Não | - |
| Ativo | Checkbox | Sim | - |

**Unidades de medida:**
- UN (Unidade)
- PC (Peça)
- CX (Caixa)
- LT (Litro)
- KG (Quilograma)
- MT (Metro)
- PAR (Par)
- JG (Jogo)

**CST/CSOSN comuns:**
- 060 - Tributação sem permissão de crédito
- 102 - Tributação sem permissão de crédito
- 202 - Tributação sem permissão de crédito
- 500 - Substituição Tributária

**CFOP comuns:**
- 5102 - Venda de mercadoria adquirida de terceiros
- 5405 - Venda de mercadoria sub stituição tributária
- 1102 - Compra para comercialização

**Exemplo de cadastro:**
```javascript
{
  codigo: 'PEC-001',
  nome: 'Filtro de Óleo',
  codigoFabricante: 'FL-3012',
  gtin: '7891234567890',
  ncm: '84212300',
  cfop: '5102',
  cst: '060',
  unidade: 'UN',
  precoCusto: 25.00,
  precoVenda: 45.00,
  margemLucro: 80,
  estoqueMinimo: 10,
  estoqueAtual: 50,
  localizacao: 'Prateleira A3',
  ativo: true
}
```

---

### 3. Terceiros/Parceiros

**Rota:** `/gestao/terceiros`  
**Íicone:** `Buildings`  
**Descrição:** Cadastro de empresas terceiras que prestam serviços especializados.

**Campos:**

| Campo | Tipo | Obrigatório | Para NF-e |
|-------|------|-------------|-----------|
| Razão Social | Texto | Sim | Obrigatório |
| Nome Fantasia | Texto | Não | - |
| **CNPJ** | Texto (14 dígitos) | Sim | Obrigatório |
| **Inscrição Estadual** | Texto | Sim | Obrigatório |
| Inscrição Municipal | Texto | Não | Para NFS-e |
| Tipo de Serviço | Select | Sim | - |
| Contato Nome | Texto | Não | - |
| Contato Telefone | Texto | Não | - |
| Contato Email | Texto | Não | - |
| **Endereço** | Objeto | Sim | Obrigatório |
| → Logradouro | Texto | Sim | - |
| → Número | Texto | Sim | - |
| → Complemento | Texto | Não | - |
| → Bairro | Texto | Sim | - |
| → Cidade | Texto | Sim | - |
| → UF | Select (2 dígitos) | Sim | - |
| → CEP | Texto (8 dígitos) | Sim | - |
| Ativo | Checkbox | Sim | - |

**Tipos de serviço de terceiros:**
- Elétrica Automotiva
- Funilaria e Pintura
- Mecânica Diesel
- Vidraçaria
- Bancarrots/Estofados
- Borracharia
- Alinhamento e Balanceamento
- Lavagem e Higienização
- Remoção de Pintura/Cola
- Serviços de Guariba (Usinagem)

**Exemplo de cadastro:**
```javascript
{
  razaoSocial: 'Auto Elétrica Silva LTDA',
  nomeFantasia: 'Elétrica Silva',
  cnpj: '12345678000190',
  inscricaoEstadual: '123456789',
  inscricaoMunicipal: '',
  tipoServico: 'Elétrica Automotiva',
  contato: {
    nome: 'João Silva',
    telefone: '(43) 99999-1234',
    email: 'contato@eletricasilva.com.br'
  },
  endereco: {
    logradouro: 'Rua das Flores',
    numero: '123',
    complemento: '',
    bairro: 'Centro',
    cidade: 'Apucarana',
    uf: 'PR',
    cep: '86812405'
  },
  ativo: true
}
```

---

## Integração com Nota Fiscal Eletrônica

### NFS-e (Nota Fiscal de Serviço Eletrônica)

**Campos obrigatórios para emissão:**
- Código do serviço (tabela IBPT)
- Descrição do serviço
- Valor do serviço
- Alíquota ISS
- Código CNAE
- Dados do tomador (cliente)

**Fluxo:**
1. Cadastro do serviço → Dados fiscais preenchidos
2. Na OS → Serviço selecionado puxa dados fiscais
3. Na aprovação → Gera NFS-e com dados completos

### NF-e (Nota Fiscal de Produto Eletrônica)

**Campos obrigatórios para emissão:**
- GTIN (código de barras)
- NCM (Nomenclatura Comum do Mercosul)
- CFOP (Código Fiscal de Operações e Prestações)
- CST/CSOSN (Código de Situação Tributária)
- Unidade comercial
- Quantidade
- Valor unitário
- Valor total

**Fluxo:**
1. Cadastro da peça → Dados fiscais preenchidos
2. Na OS → Peça selecionada puxa dados fiscais
3. Na venda → Gera NF-e com dados completos

### Dados do Terceiro (para referência)

Quando a oficina contrata serviço de terceiros:
- Dados cadastrais completos para consulta
- Referência para futuras NF-e recebidas
- Controle de pagamentos

---

## Estrutura de Componentes

```
src/
├── pages/
│   └── dashboard/
│       └── suprimentos/
│           ├── ServicosPage.jsx      ← NOVO
│           ├── PecasPage.jsx         ← NOVO
│           └── TerceirosPage.jsx     ← NOVO
├── components/
│   └── suprimentos/
│       ├── ServicoForm.jsx           ← NOVO
│       ├── PecaForm.jsx              ← NOVO
│       ├── TerceiroForm.jsx          ← NOVO
│       └── TabelaFiscal.jsx          ← NOVO (campos NF-e)
```

---

## Checklist de Implementação

### Fase 1: Cadastros Básicos
- [ ] Criar `ServicosPage.jsx` com listagem e formulário
- [ ] Criar `PecasPage.jsx` com listagem e formulário
- [ ] Criar `TerceirosPage.jsx` com listagem e formulário
- [ ] Adicionar rotas no React Router
- [ ] Atualizar `dashboardMenus.js` com novos itens

### Fase 2: Validação Fiscal
- [ ] Validar GTIN (dígito verificador)
- [ ] Validar CNPJ (dígito verificador)
- [ ] Validar NCM (8 dígitos)
- [ ] Validar CFOP (4 dígitos)
- [ ] Validar CEP (8 dígitos)

### Fase 3: Integração
- [ ] Integrar com tela de OS (pega dados fiscais)
- [ ] Integrar com tela de orçamento
- [ ] Preparar estrutura para emissão de NFS-e
- [ ] Preparar estrutura para emissão de NF-e

### Fase 4: Relatórios
- [ ] Relatório de serviços prestados
- [ ] Relatório de peças utilizadas
- [ ] Relatório de terceiros contratados

---

## Validações Importantes

### GTIN (Código de Barras)
```javascript
function validarGTIN(gtin) {
  // Deve ter 8, 12, 13 ou 14 dígitos
  if (!/^\d{8}(\d{4}(\d{1})?)?$/.test(gtin)) return false
  
  // Cálculo do dígito verificador
  const pesos = [1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1]
  const digitos = gtin.split('').map(Number)
  
  let soma = 0
  for (let i = 0; i < 12; i++) {
    soma += digitos[i] * pesos[i]
  }
  
  const resto = soma % 10
  const digitoVerificador = resto === 0 ? 0 : 10 - resto
  
  return digitos[12] === digitoVerificador
}
```

### CNPJ
```javascript
function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]+/g, '')
  
  if (cnpj.length !== 14) return false
  if (/^(\d)\1+$/.test(cnpj)) return false
  
  let soma = 0
  let peso = 2
  
  for (let i = 11; i >= 0; i--) {
    soma += parseInt(cnpj.charAt(i)) * peso
    peso = peso === 9 ? 2 : peso + 1
  }
  
  const resto = soma % 11
  const digito1 = resto < 2 ? 0 : 11 - resto
  
  soma = 0
  peso = 2
  
  for (let i = 12; i >= 0; i--) {
    soma += parseInt(cnpj.charAt(i)) * peso
    peso = peso === 9 ? 2 : peso + 1
  }
  
  const resto2 = soma % 11
  const digito2 = resto2 < 2 ? 0 : 11 - resto2
  
  return cnpj.charAt(12) == digito1 && cnpj.charAt(13) == digito2
}
```

---

**Data:** 18/09/2026  
**Status:** Especificação  
**Localização no menu:** Suprimentos (itens 3, 4 e 5)
