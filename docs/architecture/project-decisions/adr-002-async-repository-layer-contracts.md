# ADR-002: Arquitetura da Camada de Repositórios — Padrão Async Contract First

- **Status:** Aprovado  
- **Data:** 2026-09-21  
- **Autor:** Aria (@architect, Holistic System Architect)  
- **Contexto:** Story 1.5, Story 1.10 e Epic 2 do PRD v1.2  

---

## 1. Contexto e Problema

No estado atual do codebase (`docs/brownfield-architecture.md`), mais de 50 componentes de UI acessam diretamente o `localStorage` com chamadas síncronas espalhadas (`localStorage.getItem('dev_oficina_...')`). Os arquivos `constants/*` atuam simultaneamente como seed estático, repositório de dados e regras de negócio.

Se o desenvolvedor continuar escrevendo chamadas síncronas na Story 1.5 e no novo módulo de Funcionários (Story 1.10), a migração para o Supabase Postgres no Epic 2 exigirá **reescrever todas as telas da aplicação**, pois chamadas a banco remoto são inerentemente assíncronas (`async/await` com Promises).

---

## 2. Decisão Arquitetural: *Async Contract First*

Instituir formalmente o padrão **Async Contract First** para todos os repositórios em `src/repositories/`:

1. **Assinaturas Estritamente Assíncronas:**  
   Toda função de leitura (`obter*`, `buscar*`), escrita (`salvar*`, `atualizar*`) ou mutação (`excluir*`) deve retornar uma `Promise<T>`.
2. **Implementação em Duas Fases sem Mudança na UI:**
   - **No Epic 1 (MVP 1):** O repositório lê e grava no `localStorage`, resolvendo a Promise imediatamente com `Promise.resolve(dados)` ou funções `async`.
   - **No Epic 2 (Supabase Postgres):** A implementação interna do repositório passa a chamar `supabase.from('tabela').select()` ou `.insert()`.
   - **Impacto na Interface:** **ZERO linhas de código alteradas nas telas** entre o Epic 1 e o Epic 2!

---

## 3. Contratos Canônicos dos Repositórios (Interfaces)

### 3.1 `funcionariosRepository.js` (Novo Módulo — Story 1.10)
```javascript
/**
 * @typedef {Object} Funcionario
 * @property {string} id
 * @property {string} nome
 * @property {string} cpf
 * @property {string} telefone
 * @property {'mecanico'|'secretaria'|'gerente'|'eletricista'|'auxiliar'} cargo
 * @property {number} comissaoServicos - Percentual (ex: 10.0)
 * @property {number} comissaoPecas - Percentual (ex: 2.5)
 * @property {string} dataAdmissao - Formato YYYY-MM-DD
 * @property {string} horarioTrabalho - Ex: "08:00 às 19:00"
 * @property {boolean} ativo
 * @property {string} [observacoes]
 */

export async function carregarFuncionarios(): Promise<Funcionario[]>
export async function obterFuncionarioPorId(id: string): Promise<Funcionario | null>
export async function obterMecanicosAtivos(): Promise<Funcionario[]>
export async function salvarFuncionario(funcionario: Omit<Funcionario, 'id'> | Funcionario): Promise<Funcionario>
export async function alternarStatusFuncionario(id: string, ativo: boolean): Promise<Funcionario>
```

### 3.2 `ordensServicoRepository.js` (Antigo `mockOrdensAbertas.js` — Story 1.7)
```javascript
export async function carregarOrdensServico(): Promise<OrdemServico[]>
export async function obterOrdemServicoPorId(id: string): Promise<OrdemServico | null>
export async function salvarOrdemServico(os: OrdemServico): Promise<OrdemServico>
export async function transicionarStatusOS(id: string, novoStatus: string, dadosTransição?: object): Promise<OrdemServico>
export async function vincularMecanicoOS(id: string, mecanicoId: string): Promise<OrdemServico>
```

### 3.3 `clientesRepository.js`
```javascript
export async function carregarClientes(): Promise<Cliente[]>
export async function obterClientePorId(id: string): Promise<Cliente | null>
export async function salvarCliente(cliente: Cliente): Promise<Cliente>
export async function obterVeiculosDoCliente(clienteId: string): Promise<Veiculo[]>
```

### 3.4 `estoqueRepository.js` & `comprasRepository.js`
```javascript
export async function carregarCatalogoPecas(): Promise<Peca[]>
export async function registrarEntradaCompra(compra: CompraPayload): Promise<CompraResultado>
export async function darBaixaEstoquePorOS(osId: string, pecasUtilizadas: PecaConsumida[]): Promise<void>
```

---

## 4. Consequências

- **Desacoplamento Total:** A UI não sabe e não se importa de onde vêm os dados (seja de um array em memória, `localStorage` ou Supabase Postgres).
- **Testabilidade:** Repositórios podem ser facilmente mockados ou testados isoladamente no Vitest.
- **Preparação Imediata para o Epic 2:** A transição para o banco relacional não causará quebra de contratos visuais.
