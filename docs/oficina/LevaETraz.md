# Leva e Traz - Documentação

## Visão Geral

Módulo para gestão de serviços de busca e entrega de veículos entre a oficina e o cliente. O serviço requer sempre duas pessoas da oficina (mecânico e secretária) deslocando-se juntas: uma retorna com o veículo do cliente, a outra com o carro da oficina. O sistema gerencia a seleção dos funcionários, notificações, acompanhamento do trajeto e registro completo do serviço.

---

## Objetivo

1. **Facilitar o atendimento** oferecendo serviço de busca e entrega de veículos ao cliente
2. **Organizar as duplas** definindo quem compõe cada equipe de deslocamento
3. **Rastrear o trajeto** registrando tempos, rotas e observações
4. **Notificar automaticamente** os funcionários atribuídos ao serviço
5. **Registrar todo o histórico** para consulta e controle
6. **Controlar custos** de deslocamento quando aplicável

---

## Cenários de Uso

### Cenário 1: Busca Padrão (Mecânico + Secretária → Veículo do Cliente + Carro da Oficina)

Duas pessoas da oficina saem juntas: o mecânico e a secretária. Deslocam-se até o cliente no carro da oficina. Na ida, ambos vão no carro da oficina. Na volta, o mecânico retorna com o veículo do cliente (para iniciar o serviço) e a secretária retorna com o carro da oficina.

**Exemplo:** Carlos Eduardo (mecânico) e Lucas (secretária) vão buscar o Fiat Doblo do cliente Edgar. Saem da oficina no carro da oficina. Chegando ao cliente, Carlos pega o Fiat Doblo e volta para a oficina, enquanto Lucas volta com o carro da oficina.

### Cenário 2: Busca com Devolução pelo Cliente

O mecânico e a secretária vão até o cliente buscar o veículo. O cliente, por conveniência, leva o mecânico de volta à oficina em seu veículo, enquanto a secretária retorna com o carro da oficina. Neste caso, o carro da oficina faz o trajeto somente na ida.

**Exemplo:** Carlos e Lucas vão buscar o carro do Edgar. Chegando lá, Edgar entra no carro do mecânico (seu próprio carro) e leva o Carlos de volta à oficina. Lucas retorna sozinho com o carro da oficina.

### Cenário 3: Entrega com Leva-Evolta do Mecânico

O cliente vai até a oficina para deixar o veículo. Quando o serviço é concluído, o mecânico leva o cliente de volta para sua casa no carro do cliente e retorna à oficina com o carro da oficina. A secretária não participa deste deslocamento.

**Exemplo:** Edgar vai à oficina deixar o carro. Quando o serviço é finalizado, Carlos leva o Edgar de volta para casa no Fiat Doblo e retorna à oficina com o carro da oficina.

### Cenário 4: Busca e Entrega Completas

Mecânico e secretária vão até o cliente buscar o veículo, realizam o serviço na oficina e depois devolvem o veículo ao cliente. Neste caso, o deslocamento é feito duas vezes: ida para buscar e volta para entregar.

**Exemplo:** Carlos e Lucas vão buscar o carro do Edgar pela manhã. O serviço é concluído no período da tarde. Carlos e Lucas levam o veículo de volta ao cliente.

---

## Fluxo do Negócio

### 1. Solicitação do Serviço

O serviço de leva e traz pode ser solicitado de três formas:

- **Pelo cliente** - Ao agendar ou abrir a OS, o cliente solicita busca/entrega do veículo
- **Pelo orçamento** - Ao aprovar o orçamento, o sistema oferece a opção de leva e traz
- **Pela oficina** - O atendente oferece o serviço como cortesia ou com valor adicional

### 2. Seleção da Dupla

O sistema apresenta a lista de funcionários disponíveis para o serviço, organizados por função:

- **Mecânico** - Profissional que realizará o diagnóstico/serviço no veículo
- **Secretária** - Profissional que acompanha o deslocamento e auxilia na logística

A dupla é selecionada de forma que ambos estejam disponíveis no horário solicitado. O sistema verifica automaticamente conflitos de agenda e OS atribuídas.

### 3. Notificação dos Funcionários

Ao confirmar a atribuição, o sistema envia notificação automática para ambos os funcionários contendo:

- Dados do cliente (nome, telefone, endereço completo)
- Dados do veículo (modelo, placa, cor, observações)
- Horário previsto para saída
- Observações especiais (portão, andar, documentos necessários)
- Mapa com rota sugerida
- Instruções sobre quem retorna com qual veículo

### 4. Acompanhamento do Trajeto

Enquanto a dupla estiver em deslocamento, o sistema exibe:

- Status: Saiu da oficina / Chegou ao cliente / Retornando
- Tempo estimado de chegada
- Possibilidade de atualização manual pelos funcionários

### 5. Conclusão do Serviço

Ao finalizar cada trecho, os funcionários registram:

- Hora efetiva de chegada ao cliente
- Quem retornou com qual veículo
- Observações sobre o atendimento
- Kilometragem dos veículos no momento da coleta

---

## Informações Envolvidas no Serviço

### Dados do Cliente

- Nome completo
- Telefone principal e secundário
- Endereço completo (rua, número, bairro, cidade, CEP)
- Ponto de referência
- Observações de acesso (portão, interfone, código, etc.)

### Dados do Veículo

- Marca, modelo e versão
- Ano e cor
- Placa (com máscara Mercosul ou antiga)
- Kilometragem atual
- Foto do veículo (para conferência)
- Observações (travas, alarme, documentos dentro, etc.)

### Dados do Trajeto

- Endereço de origem (oficina ou cliente)
- Endereço de destino (cliente ou oficina)
- Distância estimada em km
- Tempo estimado de deslocamento
- Rota sugerida
- Horário previsto de chegada
- Horário efetivo de chegada
- Horário de retorno à oficina
- Quem retornou com qual veículo

### Dados da Dupla

**Mecânico:**
- Nome e especialidade
- Telefone para contato
- Veículo que retornará (carro do cliente)

**Secretária:**
- Nome e cargo
- Telefone para contato
- Veículo que retornará (carro da oficina)

### Dados do Serviço

- Tipo: Busca ou Entrega
- OS vinculada
- Prioridade: Normal ou Urgente
- Valor do serviço (se cobrado)
- Observações especiais

---

## Funcionalidades

### Listagem de Serviços

A tela principal apresenta todos os serviços de leva e traz em andamento ou concluídos, com possibilidade de filtrar por período, dupla, status e cliente. Os cards exibem resumo do serviço com dados do veículo, cliente e status atual.

### Registro de Novo Serviço

O formulário permite selecionar o tipo de serviço (busca ou entrega), vincular a OS, preencher dados do cliente e veículo, selecionar a dupla (mecânico + secretária) e agendar horários. O sistema valida disponibilidade e conflitos de agenda.

### Acompanhamento em Tempo Real

O painel de acompanhamento exibe em tempo real o status de todos os serviços em andamento, com indicação visual de cada etapa (saiu da oficina, chegou ao cliente, retornando). Permite atualização manual pelos funcionários.

### Notificações Automáticas

O sistema envia notificações automáticas para:

- **Mecânico atribuído** - Quando recebe a atribuição do serviço
- **Secretária atribuída** - Quando recebe a atribuição do serviço
- **Cliente** - Quando a dupla saiu, quando chegou e quando está retornando
- **Gerente** - Quando há atrasos ou problemas no serviço

---

## Regras de Negócio

1. **Dupla obrigatória** - Todo serviço de leva e traz deve ter uma dupla atribuída (mecânico + secretária)
2. **Dois veículos** - Na busca padrão, o carro da oficina e o carro do cliente são utilizados
3. **Verificação de conflito** - O sistema verifica se ambos os funcionários não têm compromisso no horário
4. **Notificação automática** - Ambos os funcionários devem ser notificados imediatamente após a atribuição
5. **Registro de tempos** - Todo serviço deve registrar horário de saída, chegada e retorno
6. **Identificação do veículo** - A dupla deve confirmar que o veículo é o correto antes de iniciar o trajeto
7. **Documentação** - Veículos com documentos pendentes não podem ser buscados sem autorização
8. **Valor do serviço** - Se o leva e traz for cobrado, o valor deve estar claro antes da confirmação
9. **Prioridade urgente** - Serviços urgentes devem ser notificados com destaque e prioridade na fila
10. **Cancelamento** - O serviço pode ser cancelado antes do início, mas após saída deve ser registrado
11. **Histórico** - Todos os serviços devem ser mantidos no histórico do cliente e da OS

---

## Status do Serviço

| Status | Descrição | Ação do Sistema |
|--------|-----------|-----------------|
| Agendado | Serviço aguardando horário | Notifica dupla 30min antes |
| Saiu da Oficina | Dupla iniciou deslocamento | Notifica cliente "Estamos a caminho" |
| Chegou ao Cliente | Dupla chegou ao endereço | Notifica cliente "Chegamos" |
| Veículo Coletado | Veículo retirado do cliente | Registra km e inicia retorno |
| Em Trânsito | Dupla retornando à oficina | Exibe tempo estimado |
| Na Oficina | Veículo chegou à oficina | Notifica cliente e inicia serviço |
| Saiu para Entrega | Dupla saindo da oficina | Notifica cliente "Veículo a caminho" |
| Entregue | Veículo entregue ao cliente | Finaliza serviço e registra dados |
| Cancelado | Serviço cancelado | Remove da fila e notifica |

---

## Composição da Dupla

### Regra Geral

Para cada serviço de leva e traz, a oficina designa uma dupla composta por:

- **1 Mecânico** - Responsável técnico pelo veículo
- **1 Secretária** - Responsável pela logística e documentação

### Quem Retorna com Qual Veículo

| Cenário | Mecânico | Secretária |
|---------|----------|------------|
| Busca padrão | Volta com o carro do cliente | Volta com o carro da oficina |
| Cliente leva mecânico | Volta com o carro do cliente (junto com cliente) | Volta com o carro da oficina |
| Entrega com mecânico | Leva o carro do cliente ao cliente e volta com carro da oficina | Não participa |
| Busca e entrega completa | Volta com o carro do cliente (busca) e leva ao cliente (entrega) | Volta com o carro da oficina (busca) |

### Flexibilidade de Atribuição

O sistema permite flexibilidade na composição da dupla:

- A secretária pode ser substituída por outro funcionário administrativo
- Em casos especiais, dois funcionários da mesma função podem compor a dupla
- O mecânico pode ir sozinho apenas se houver justificativa registrada

---

## Rota

```
/gestao/leva-e-traz
```

---

**Data:** 19/09/2026
**Status:** Especificação
**Localização no menu:** Atendimento e Pátio > Leva e Traz
