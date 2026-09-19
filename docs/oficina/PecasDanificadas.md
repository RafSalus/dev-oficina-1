# Peças Danificadas - Documentação

## Visão Geral

Módulo para registro, acompanhamento e gestão de peças danificadas, substituídas ou descartadas durante a prestação de serviços na oficina. O sistema permite rastrear a origem do dano, o destino final (descarte, devolução ou reciclagem) e o impacto financeiro, garantindo conformidade ambiental e transparência no atendimento ao cliente.

---

## Objetivo

1. **Registrar cada peça danificada** com detalhes completos (origem, motivo, responsável)
2. **Vincular à OS** para rastreabilidade total do histórico do veículo
3. **Controlar o destino** da peça (descarte ambiental, devolução ao cliente, reciclagem)
4. **Gerar impacto financeiro** sobre custos de mão de obra e peças novas
5. **Manter conformidade ambiental** com descarte de resíduos automotivos (óleo, baterias, pneus, etc.)
6. **Auxiliar na tomada de decisão** sobre reparos vs. substituições

---

## Fluxo do Negócio

### 1. Identificação da Peça Danificada

O mecânico identifica uma peça danificada durante o diagnóstico ou a execução do serviço na OS. A peça pode estar danificada por desgaste natural, acidente, defeito de fabricação ou mau uso. Neste momento, o mecânico deve registrar a peça no sistema com todos os detalhes.

### 2. Registro no Sistema

O registro inclui os dados da peça (código, nome, categoria), o motivo do dano, o grau do dano (parcial, total ou irrecuperável), o veículo e a OS vinculada, além do responsável pelo registro. Uma foto da peça danificada é obrigatória para fins de documentação.

### 3. Análise Técnica

O sistema solicita um laudo técnico descrevendo detalhadamente o problema encontrado, a possível causa do dano e o prazo de vida útil da peça (se aplicável). Essa análise é fundamental para decisões sobre garantia, descarte ou reparo.

### 4. Definição do Destino

Cada peça danificada deve ter um destino final registrado:

- **Cliente** - Peça removida, cliente leva consigo
- **Descarte Ambiental** - Resíduo perigoso (óleo, bateria, filtro) encaminhado a coletor autorizado
- **Reciclagem** - Ferro-velho ou parceiros de reciclagem
- **Garantia** - Devolução ao fabricante ou fornecedor quando a peça está em garantia
- **Fornecedor** - Devolução por defeito de fabricação
- **Estoque Devolvido** - Peça recondicionável retorna ao estoque

### 5. Impacto Financeiro

O sistema calcula automaticamente o custo total do dano, somando o valor da peça nova substituída e o custo adicional de mão de obra (se houver). O status de cobrança define se o valor será faturado ao cliente, abatido ou se não haverá custo.

### 6. Controle de Garantia

Se a peça danificada estava em garantia, o sistema alerta sobre a possibilidade de processo de garantia junto ao fabricante ou fornecedor. O registro inclui o prazo de garantia, o protocolo e o status do processo (pendente, aprovada ou negada).

---

## Funcionalidades

### Listagem e Filtros

A tela principal apresenta uma listagem de todas as peças danificadas registradas, com possibilidade de filtrar por OS, veículo, categoria da peça, status, motivo do dano, grau do dano, período e responsável. A ordenação pode ser feita por data de registro, OS, veículo ou custo total.

### Registro de Peça Danificada

O formulário de registro permite vincular a peça a uma OS existente, selecionar a peça do catálogo (preenchimento automático do código, nome e categoria), anexar fotos (máximo de 5 imagens), preencher a análise técnica e definir o destino e os custos envolvidos.

### Visualização de Detalhes

O modal de detalhes exibe todas as informações da peça danificada de forma organizada: dados da peça, análise do dano, destino e logística, dados financeiros e informações de garantia (quando aplicável). Permite editar ou registrar o destino diretamente neste modal.

### Controle de Destino

O sistema permite registrar o destino de cada peça de forma independente, incluindo data, responsável, destinatário e comprovante de descarte ou devolução. Peças com destino ambiental obrigatório devem apresentar documentação comprobatória.

---

## Categorias de Motivos de Dano

| Motivo | Descrição | Exemplo |
|--------|-----------|---------|
| Desgaste Natural | Peça atingiu vida útil esperada | Pastilhas, filtros, correias |
| Acidente/Colisão | Dano por evento externo | Amortecedor, para-choque |
| Defeito de Fabricação | Problema de qualidade do fabricante | Bomba d'água, bobina |
| Mau Uso/Negligência | Uso incorreto ou falta de manutenção | Motor, câmbio |
| Inundação/Alagamento | Dano por entrada de água | Elétrica, motor |
| Incêndio | Dano por calor extremo | Fiação, plásticos |
| Outro | Especificar no laudo | - |

---

## Categorias de Destino Final

| Destino | Descrição | Obriga Documento |
|---------|-----------|------------------|
| Cliente | Peça removida, cliente leva consigo | Não |
| Descarte Ambiental | Resíduo perigoso (óleo, bateria) | Sim - Cupom de descarte |
| Reciclagem | Ferro-velho, parceiros de reciclagem | Sim - Nota de recebimento |
| Garantia | Devolução ao fabricante/fornecedor | Sim - Protocolo de garantia |
| Fornecedor | Devolução por defeito | Sim - NF de devolução |
| Estoque Devolvido | Retorna ao estoque (se recondicionável) | Sim - Laudo de recondicionamento |

---

## Relatórios e Indicadores

### Indicadores Disponíveis

- **Total de Peças Danificadas** - Quantidade registrada no período
- **Custo Total de Danos** - Soma dos custos de todas as peças danificadas
- **Tempo Médio de Resolução** - Dias entre o registro e a definição do destino
- **Peças em Garantia** - Quantidade com garantia ativa
- **Taxa de Descarte** - Percentual de peças que vão para descarte
- **Top 5 Peças Danificadas** - Peças que mais foram danificadas

### Relatórios Disponíveis

1. **Relatório de Danos por Período** - Peças danificadas em um período específico
2. **Relatório de Custos** - Impacto financeiro dos danos registrados
3. **Relatório de Garantias** - Peças em garantia e status dos processos
4. **Relatório de Destino** - Para onde as peças estão sendo encaminhadas
5. **Relatório por Mecânico** - Danos registrados por funcionário

---

## Regras de Negócio

1. **Foto obrigatória** - Toda peça danificada deve ter ao menos 1 foto
2. **Vinculação à OS** - Peça danificada sempre deve estar vinculada a uma OS
3. **Edição restrita** - Apenas peças com status "Pendente" podem ser editadas
4. **Exclusão restrita** - Apenas peças com status "Pendente" podem ser excluídas
5. **Destino obrigatório** - Toda peça deve ter um destino final registrado
6. **Conformidade ambiental** - Peças perigosas (óleo, bateria) devem ter comprovante de descarte
7. **Garantia automática** - Se a peça tinha garantia, sistema deve alertar sobre processo
8. **Impacto no estoque** - Registrar peça danificada decrementa estoque automaticamente
9. **Rastreabilidade** - Cada mudança de status é logada com data e responsável
10. **Impressão** - Relatório de peça danificada pode ser impresso para arquivo

---

## Conformidade Ambiental

### Resíduos que Obrigam Descarte Especial

| Resíduo | Risco | Destino Obrigatório |
|---------|-------|---------------------|
| Óleo de motor usado | Contaminação do solo | Coletor autorizado |
| Bateria automotiva | Chumbo, ácido | Cooperativa de reciclagem |
| Fluido de freio | Tóxico | Destino especial |
| Refrigerante | Tóxico | Coletor autorizado |
| Filtro de óleo | Contaminação | Cooperativa de reciclagem |
| Pneus usados | Acúmulo | Destino ambiental |
| Metais pesados | Contaminação | Reciclagem especial |

### Documentos de Descarte

- **Cupom de descarte** - Comprovante de entrega ao coletor
- **Nota fiscal de recebimento** - Documento do destinatário
- **Termo de responsabilidade** - Assinatura do responsável

---

**Data:** 19/09/2026  
**Status:** Especificação  
**Localização no menu:** Oficina e Serviços > Peças Danificadas
