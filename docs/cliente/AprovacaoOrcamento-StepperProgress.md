# Esteira de Progresso - Aprovação de Orçamento (Cliente)

## Visão Geral

Componente visual que mostra a jornada do veículo na oficina, desde o recebimento até a finalização. Interface destinada ao **cliente**, exibindo o progresso do atendimento em tempo real.

## Fluxo das Etapas

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  ✓ Fila    ✓ Diagnóstico    ◉ Cotação    ○ Aprovação    ○ Execução    ○ Finalizado  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Definição das Etapas

| # | Etapa | Ícone (Phosphor) | Cor Concluído | Cor Atual | Cor Pendente |
|---|-------|-------------------|---------------|-----------|--------------|
| 1 | **Fila** | `Clock` | Azul (#0284c7) | - | Cinza (#d0d5dd) |
| 2 | **Diagnóstico** | `Wrench` | Azul (#0284c7) | - | Cinza (#d0d5dd) |
| 3 | **Cotação** | `Receipt` | Azul (#0284c7) | Azul pulsante | Cinza (#d0d5dd) |
| 4 | **Aprovação** | `CheckCircle` | Azul (#0284c7) | Azul pulsante | Cinza (#d0d5dd) |
| 5 | **Execução** | `Gear` | Azul (#0284c7) | Azul pulsante | Cinza (#d0d5dd) |
| 6 | **Finalizado** | `Trophy` | Azul (#0284c7) | - | Cinza (#d0d5dd) |

## Descrição de Cada Etapa

### 1. Fila
- **Descrição:** Veículo recebido na oficina, aguardando vaga
- **Visível para cliente:** Sim
- **Dados exibidos:** Data/hora de chegada, previsão de início

### 2. Diagnóstico
- **Descrição:** Mecânico está analisando o veículo
- **Visível para cliente:** Sim
- **Dados exibidos:** Nome do mecânico,Observações iniciais

### 3. Cotação
- **Descrição:** Orçamento está sendo montado com peças e serviços
- **Visível para cliente:** Sim (após iniciar)
- **Dados exibidos:** Quantidade de itens, previsão de conclusão

### 4. Aprovação
- **Descrição:** Orçamento pronto, aguardando autorização do cliente
- **Visível para cliente:** Sim
- **Dados exibidos:** Valor total, condições de pagamento
- **Ação do cliente:** Aprovar ou entrar em contato

### 5. Execução
- **Descrição:** Serviços em andamento
- **Visível para cliente:** Sim
- **Dados exibidos:** Serviços em andamento, previsão de conclusão

### 6. Finalizado
- **Descrição:** Veículo pronto para retirada
- **Visível para cliente:** Sim
- **Dados exibidos:** Valores pagos, data de retirada

## Comportamento por Aba

### Aba "Orçamento"
| Status da Esteira | Comportamento |
|-------------------|---------------|
| Etapa < Aprovação | Mensagem: "Seu orçamento está sendo preparado" + Estado vazio |
| Etapa = Aprovação | Lista de peças/serviços + Botão de aprovação |
| Etapa > Aprovação | Resumo do aprovado + Status da execução |

### Aba "Laudo Técnico"
| Status da Esteira | Comportamento |
|-------------------|---------------|
| Etapa < Diagnóstico | Mensagem: "Diagnóstico ainda não iniciado" |
| Etapa ≥ Diagnóstico | Laudo técnico completo |

### Aba "Fotos"
| Status da Esteira | Comportamento |
|-------------------|---------------|
| Etapa < Diagnóstico | Mensagem: "Fotos disponíveis após diagnóstico" |
| Etapa ≥ Diagnóstico | Galeria de fotos (se houver) |

## Dados Necessários

```javascript
// Objeto de controle da esteira
const stepperData = {
  etapaAtual: 'aprovacao', // 'fila' | 'diagnostico' | 'cotacao' | 'aprovacao' | 'execucao' | 'finalizado'
  etapas: [
    { id: 'fila', concluida: true, dataConclusao: '2026-08-19T10:00:00' },
    { id: 'diagnostico', concluida: true, dataConclusao: '2026-08-19T13:05:00' },
    { id: 'cotacao', concluida: false, dataConclusao: null },
    { id: 'aprovacao', concluida: false, dataConclusao: null },
    { id: 'execucao', concluida: false, dataConclusao: null },
    { id: 'finalizado', concluida: false, dataConclusao: null },
  ]
}
```

## Especificação Visual

### Layout Desktop
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [ÍCONE] Fila ──── [ÍCONE] Diagnóstico ──── [ÍCONE] Cotação ──── ...  │
│     ✓               ✓                    ◉ (pulsante)                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Layout Mobile
```
┌─────────────────────────────────┐
│  ✓ Fila                         │
│  ↓                              │
│  ✓ Diagnóstico                  │
│  ↓                              │
│  ◉ Cotação (atual)              │
│  ↓                              │
│  ○ Aprovação                    │
│  ↓                              │
│  ○ Execução                     │
│  ↓                              │
│  ○ Finalizado                   │
└─────────────────────────────────┘
```

## Cores e Identidade Visual

| Elemento | Cor | Uso |
|----------|-----|-----|
| Fundo da esteira | Branco (#ffffff) | Container principal |
| Etapa concluída | Azul (#0284c7) | Ícone + linha |
| Etapa atual | Azul (#0284c7) pulsante | Ícone animado |
| Etapa pendente | Cinza (#d0d5dd) | Ícone + linha |
| Texto etapa concluída | Preto (#101828) | Nome da etapa |
| Texto etapa atual | Azul (#0369a1) | Nome destacado |
| Texto etapa pendente | Cinza (#667085) | Nome desbotado |

## Regras de Negócio

1. **Ordem fixa:** As etapas sempre seguem a ordem: Fila → Diagnóstico → Cotação → Aprovação → Execução → Finalizado
2. **Sem pulo:** Não é possível pular etapas (exceto em casos especiais)
3. **Atual visível:** Apenas uma etapa pode estar "atual" por vez
4. **Retorno:** Em caso de retrabalho, volta para etapa anterior (ex: reprovação volta para Cotação)
5. **Notificação:** Cliente recebe notificação ao avançar etapa

## Integração com Sistema

### localStorage
```javascript
// Chave para controle da esteira por OS
const key = `stepper_${numeroOS}`
localStorage.setItem(key, JSON.stringify(stepperData))
```

### Eventos
- `onEtapaChange(etapa, dados)` - Chamado ao mudar de etapa
- `onAprovacao(dados)` - Chamado ao aprovar orçamento
- `onContato(tipo)` - Chamado ao clicar em contato

## Componente React (Estrutura)

```jsx
// Caminho sugerido: src/components/cliente/StepperProgress.jsx

export function StepperProgress({ etapaAtual, etapas, orientacao = 'horizontal' }) {
  // orientacao: 'horizontal' (desktop) | 'vertical' (mobile)
  
  return (
    <div className={orientacao === 'horizontal' ? 'flex items-center' : 'flex flex-col'}>
      {etapas.map((etapa, index) => (
        <StepItem
          key={etapa.id}
          etapa={etapa}
          isAtual={etapa.id === etapaAtual}
          isConcluida={etapa.concluida}
          isUltima={index === etapas.length - 1}
        />
      ))}
    </div>
  )
}
```

## Estados da Tela

| Estado | Esteira | Aba Orçamento | Footer |
|--------|---------|---------------|--------|
| Aguardando diagnóstico | Etapa 2 (atual) | Mensagem informativa | Oculto |
| Cotação em andamento | Etapa 3 (atual) | Mensagem informativa | Oculto |
| **Aprovação pendente** | Etapa 4 (atual) | Lista + Botão aprovar | Visível |
| Serviço em execução | Etapa 5 (atual) | Resumo do aprovado | Oculto |
| Finalizado | Etapa 6 (atual) | Resumo completo | Oculto |

## Notas de Implementação

- [ ] Criar componente `StepperProgress.jsx`
- [ ] Integrar com dados da OS
- [ ] Responsivo (horizontal desktop, vertical mobile)
- [ ] Animação sutil na etapa atual
- [ ] Acessibilidade (aria-labels, roles)


---

**Data:** 18/09/2026  
**Status:** Especificação  
**Próximo passo:** Implementação do componente
