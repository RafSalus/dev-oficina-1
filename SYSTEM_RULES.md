# Diretrizes e Regras do Sistema - Mecânica Gabriel (dev-oficina)

> **REGRA CRÍTICA DE INTERFACE E ARQUITETURA DE TELAS:**
> 1. **Limite Fixo até o Footer:** A tela principal (`<main>`) tem como limite inferior obrigatório o Footer. Nada pode ultrapassar ou ficar abaixo dele.
> 2. **Sem Scroll na Tela Principal:** É expressamente proibida a criação de scroll vertical na tela principal do sistema (`overflow-hidden` mandatório no container principal).
> 3. **Design de Tela Única (Single-Screen Workspace):** Todos os módulos, cadastros, formulários e listagens devem ser concebidos para caber e operar com 100% de aproveitamento da altura útil (`h-full`, `min-h-0`), utilizando grids inteligentes, colunas proporcionais, painéis ou abas compactas quando necessário.
> 4. **Estilo Visual e Identidade da Marca (Branco, Preto e Azul):** As cores oficiais do sistema são exclusivamente Branco, Preto e Azul. O visual deve seguir uma linguagem sóbria, limpa e moderna: fundo neutro (#f3f4f6 / #f8fafc), sidebar preta (bg-black), cartões e painéis brancos (#ffffff) com bordas finas (#e4e7ec / #d0d5dd), tipografia nítida e contrastante em preto/navy (#101828 / #000000), e o azul oficial da marca (#0284c7, com suas variações #0369a1 e #e0f2fe) aplicado com harmonia e elegância em botões de ação, abas ativas, tags, seleções, indicadores e destaques visuais, sem "árvore de natal" e sem vibe-code.
> 5. **Proibição do Caractere '&':** Em todo o sistema, não usar '&' em títulos, menus, rótulos, subtítulos e textos visíveis. Usar sempre a conjunção 'e'.
> 6. **Uso Obrigatório do 'react-select':** Todos os campos de seleção (select/dropdown) no sistema devem obrigatoriamente utilizar a biblioteca 'react-select', padronizados com o tema sóbrio da aplicação. É proibido o uso da tag nativa HTML `<select>`.
> 7. **Paleta de Cores e Identidade Visual (Trio Oficial: Branco, Preto e Azul da Logo - Sem Verde):** É proibido o uso da cor verde (green/emerald) nos elementos de destaque, botões, selos, totais e estados positivos do sistema. A identidade cromática é rigorosamente pautada no trio Branco (#ffffff), Preto/Navy (#000000, #0f172a, #101828) e o Azul oficial da marca e logo (#0284c7 / --color-brand-blue: #0284c7, com suas variações #0369a1 e #e0f2fe). A cor verde fica reservada única e exclusivamente para a marca oficial do WhatsApp nos botões de disparo externo.
> 8. **Padronização de Notificações ('sonner') e Diálogos de Interação (In-Modal):**
> - **Notificações de Salvamento e Eventos do Sistema (Topo à Direita):** Notificações de salvamento bem-sucedido (ex: "OS salva com sucesso", "Dados cadastrados", "Alterações salvas"), avisos assíncronos e eventos informativos do sistema devem ser disparados internamente utilizando a biblioteca 'sonner' obrigatoriamente posicionados no **topo à direita** (`top-right`), padronizados com a identidade visual do sistema (fundo sóbrio #0f172a ou branco com bordas sutis e acentos no azul oficial #0284c7, sem tons de verde).
> - **Mensagens de Interação, Cancelamento, Descarte e Edição (Na Frente do Formulário):** Mensagens que exijam decisão ou confirmação do usuário — tais como cancelamento de atendimento, descarte de alterações de formulário, confirmação de limpeza de campos, exclusão ou edição de dados críticos — **devem obrigatoriamente aparecer na frente do formulário** (em diálogo modal / card de confirmação com overlay posicionado diretamente sobre o formulário em uso). É proibido exibir mensagens de confirmação de cancelamento ou interação no topo da tela via toasts, pois essa prática não é responsiva e dispersa a atenção visual do operador em telas de qualquer resolução.
> - **Proibição de APIs Nativas:** É expressamente proibido o uso de `alert()`, `confirm()` ou APIs nativas do navegador.
> 9. **Formulários e Modais Redimensionáveis com Persistência, Ancoragem Estrita e Limites Mínimos/Máximos Padronizados:**
> Todos os formulários e janelas modais do sistema devem obrigatoriamente permitir redimensionamento livre por arrasto (bordas laterais, inferiores e canto inferior direito com cursor específico), suporte a maximizar, restaurar e movimentação de posição pelo cabeçalho, com persistência automática no `localStorage`.
> - **Princípio de Ancoragem Estrita de Topo e Esquerda (Proibição do Deslocamento Vertical do Cabeçalho):**
>   Ao redimensionar a janela para baixo (arrastando a borda inferior ou canto inferior direito), o cabeçalho, o título e os botões de ação ("Tamanho Padrão", "Maximizar" e "Fechar") devem permanecer **rigorosamente ancorados e fixos** no mesmo pixel visual da tela. É terminantemente proibido qualquer comportamento onde o cabeçalho suba gradativamente ao puxar a janela para baixo. O topo do modal nunca pode ser empurrado para fora da viewport superior.
> - **Travas de Segurança de Viewport (Clamp de Tela):**
>   O topo do modal nunca pode ultrapassar o limite superior da tela (`top >= 16px`), garantindo que os botões de controle e o cabeçalho estejam 100% visíveis e acessíveis em qualquer resolução ou movimentação por arrasto. Ao atingir a borda inferior da janela, a expansão deve ser interrompida sem deformar a posição superior.
> - **Padronização Oficial de Limites Mínimos e Máximos (Preservação de Estética e Integridade de Layout):**
>   Para impedir que formulários sejam encolhidos a ponto de esmagar campos, quebrar grids de 2 a 4 colunas ou degradar o design da aplicação, os modais devem respeitar estritamente a matriz de dimensões por complexidade:
>   - **Categoria A — Modais Compactos / Ações Rápidas** *(ex: Atualizar Km, Vincular Cliente, Finalizar Deslocamento, Tratar Atraso, Recibo PDV)*:
>     - Largura: Padrão `520px - 640px` | Mínima `460px` | Máxima `800px` (ou `94vw`)
>     - Altura: Padrão `440px - 540px` | Mínima `360px` | Máxima `720px` (ou `90vh`)
>   - **Categoria B — Cadastros Padrão (1 a 2 colunas)** *(ex: Peças, Serviços, Veículos, Terceiros/Fornecedores, Estacionar Veículo, Movimentação de Estoque)*:
>     - Largura: Padrão `800px - 860px` | Mínima `600px` | Máxima `1200px` (ou `96vw`)
>     - Altura: Padrão `640px - 720px` | Mínima `460px` | Máxima `92vh`
>   - **Categoria C — Workspaces Complexos e Multicolunas** *(ex: Nova Ordem de Serviço, Cotação de Autopeças, Ficha de Saúde Veicular, Cliente com Veículos Vinculados, Compras com Itens)*:
>     - Largura: Padrão `1040px - 1100px` | Mínima `880px` *(Nova OS: `940px`)* | Máxima `1440px` (ou `95vw`)
>     - Altura: Padrão `760px - 820px` | Mínima `540px` | Máxima `95vh`
>   - **Botão de Restauração Padrão:** Sempre que o usuário alterar o tamanho ou posição, o modal deve exibir o botão "Tamanho Padrão" para restaurar instantaneamente as dimensões canônicas.
> 10. **Proibição de Zoom Automático no Mobile (PWA de Comportamento Nativo):** É expressamente proibido permitir que o navegador aplique zoom automático na interface, seja pelo gesto de pinça/duplo toque, seja pelo zoom que o Safari do iPhone (e navegadores baseados em Chromium no Android) disparam sozinhos ao focar um campo de formulário. A tag `viewport` em `index.html` deve manter obrigatoriamente `maximum-scale=1` e `user-scalable=no`, e todo campo de texto, `<textarea>` e o input interno dos componentes 'react-select' renderizados em telas mobile devem ter `font-size` mínimo de `16px` (abaixo disso o Safari força o zoom ao focar o campo). Essa regra vale para qualquer navegador atual ou futuro que venha a introduzir esse comportamento de zoom automático — a interface deve permanecer estável e fixa como a de um aplicativo nativo instalado.
> 11. **Barras de Rolagem Invisíveis em Todo o Sistema (Scrollbar Oculta/Invisível):** É expressamente obrigatório que toda e qualquer barra de rolagem (scrollbar vertical ou horizontal) seja estritamente invisível em todos os componentes, listas, tabelas, modais, painéis laterais, campos de texto e áreas roláveis do sistema (`scrollbar-width: none`, `-ms-overflow-style: none` e `::-webkit-scrollbar { display: none }`). A rolagem funcional deve continuar operando de forma fluida e natural (via roda do mouse/touchpad, gestos de arrasto ou toque no mobile), mas a barra gráfica ou trilho visual da scrollbar nunca deve ser visível na interface, preservando um design ultra limpo, executivo, moderno e sem poluição visual.
> 12. **Proibição de Botões Redundantes na Mesma Tela:** É expressamente proibido colocar botões duplicados ou redundantes na mesma tela que realizem a exata mesma ação ou abram o mesmo modal/função. Cada ação do sistema deve ter um único ponto focal de acionamento claro, objetivo e contextualizado, evitando repetições desnecessárias que poluam a interface e causem confusão ao usuário.
> 13. **Máscaras de Input Obrigatórias em Campos Específicos:** Todos os campos de formulário que recebem dados formatados (telefone, CPF, CNPJ, CEP, placa, etc.) devem obrigatoriamente utilizar máscaras de input para garantir consistência e facilitar a digitação do usuário. É proibido o uso de campos de texto simples para dados que possuem formato padrão. A biblioteca recomendada para máscaras é 'imask' (ou 'react-imask' para React). As máscaras devem ser aplicadas da seguinte forma:

| Campo | Máscara | Exemplo | Biblioteca |
|-------|---------|---------|------------|
| Telefone Fixo | `(00) 0000-0000` | `(43) 3322-1100` | imask |
| Telefone Celular | `(00) 00000-0000` | `(43) 99888-7766` | imask |
| CPF | `000.000.000-00` | `123.456.789-09` | imask |
| CNPJ | `00.000.000/0000-00` | `12.345.678/0001-90` | imask |
| CEP | `00000-000` | `86812-405` | imask |
| Placa Mercosul | `ABC1D23` | `ASF6I46` | imask |
| Placa Antiga | `ABC-1234` | `ABC-1234` | imask |
| CNH | `000.000.000-00` | `123.456.789-09` | imask |
| RG | `00.000.000-0` | `12.345.678-9` | imask |
| Data | `00/00/0000` | `18/09/2026` | imask |
| Hora | `00:00` | `14:30` | imask |
| Valor Monetário | `000.000.000,00` | `1.250,00` | imask |
| NCM | `0000.00.00` | `8421.23.00` | imask |
| CFOP | `0.000` | `5.102` | imask |
| GTIN/EAN | `0000000000000` | `7891234567890` | imask |

**Exemplo de uso com react-imask:**
```jsx
import { IMaskInput } from 'react-imask'

<IMaskInput
  mask="(00) 00000-0000"
  value={telefone}
  onAccept={(value) => setTelefone(value)}
  placeholder="(00) 00000-0000"
  className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
/>
```

**Regras adicionais:**
- Máscaras devem ser aplicadas tanto no input quanto na exibição de dados
- Campos com máscaras devem ter `placeholder` informativo
- Validação deve considerar apenas os dígitos (sem formatação) ao salvar
- Ao carregar dados do banco, aplicar máscara na exibição

> 14. **Compartilhamento de Telas e Módulos entre Administrador (Gestão) e Secretária (Recepção):**
> O perfil da **Secretária** compartilha rigorosamente as mesmas telas, módulos, componentes, cadastros e fluxos operacionais desenvolvidos para o perfil do **Administrador (Gestão)**. Não deve haver telas paralelas ou placeholders para funcionalidades já criadas no módulo de gestão — toda tela implementada no painel administrativo deve ser compartilhada e replicada integralmente no painel da secretária.
> As **únicas telas às quais a secretária NÃO terá acesso** são:
> - **Relatórios** (restrito à administração);
> - **Funcionários** (restrito à administração);
> - **Configurações** (restrito à administração).
> Todas as demais telas do sistema (Dashboard/Resumo, Agenda, Ordens de Serviço, Orçamentos, PDV, Clientes, Veículos da Frota, Estacionados, Leva e Traz, Manutenção Preventiva, Garantias, Ferramentas, Peças Danificadas, Compras, Estoque, Serviços, Peças, Fornecedores e Terceiros, Despesas e Notas Fiscais) são compartilhadas diretamente com a secretária, utilizando os mesmos componentes executivos, cadastros e fluxos operacionais.

> 15. **Botão Obrigatório de Fechar Aba em Telas Abertas em Nova Aba (Suporte a Tela Cheia / Fullscreen):**
> Sempre que qualquer tela, documento de impressão, visualização pública, portal de cliente ou cotação de autopeças for aberta em uma nova aba do navegador (seja via link com `target="_blank"` ou chamada `window.open()`), essa tela deve obrigatoriamente conter um botão visível e de fácil acesso para **"Fechar Aba"** (ou **"Voltar ao Sistema"**) posicionado no cabeçalho ou barra de topo da página.
> **Justificativa e Requisito de Usabilidade:** Em modo de tela cheia (*fullscreen* / F11 / PWA), as abas e controles nativos da janela do navegador ficam totalmente ocultos. Se uma nova aba for aberta sem esse botão, o usuário é obrigado a sair da tela cheia, minimizar ou restaurar a janela apenas para fechar a aba, o que prejudica severamente a experiência de uso. O botão de fechar aba deve:
> - Executar `window.close()` para encerrar a aba instantaneamente;
> - Possuir fallback automático: caso a política de segurança do navegador impeça o fechamento via script (quando a aba não foi aberta diretamente por script da mesma origem), deve redirecionar de volta para a tela de origem do sistema (`window.history.back()` ou rota correspondente);
> - Ser claramente identificado com ícone e texto legível (ex: botão com ícone de fechar e texto "Fechar Aba"), garantindo retorno ágil ao sistema principal.

> 16. **Posicionamento de Notificações vs. Mensagens de Interação com Formulários (Responsividade e Foco Visual):**
> Toda a comunicação do sistema com o usuário deve respeitar rigorosamente a separação entre notificações de eventos e mensagens de interação direta:
> - **Notificações de Salvamento e Eventos do Sistema (Sempre no Topo à Direita):** Mensagens de confirmação de salvamento ("Ordem de Serviço salva com sucesso", "Dados cadastrados", "Veículo vinculado"), alertas informativos e eventos em segundo plano devem sempre ser exibidos como toasts no **topo à direita** (`top-right`) utilizando a biblioteca 'sonner', com duração automática e sem travar a navegação do operador.
> - **Mensagens de Interação, Cancelamento, Descarte e Edição (Sempre na Frente do Formulário):** Qualquer fluxo que demande ação direta ou confirmação do usuário — como cancelar o preenchimento, descartar dados não salvos, limpar formulário, confirmar edição crítica ou excluir registros — **deve obrigatoriamente abrir um diálogo/modal de confirmação posicionado na frente do formulário ativo** (com backdrop escurecido, `z-index` superior ao modal/tela em foco e botões claros de decisão).
> - **Justificativa Técnica e de Responsividade:** Em monitores widescreen, resoluções variadas e telas móveis, o operador mantém sua atenção focada no centro do formulário ou na barra de ações inferior. Exibir caixas de confirmação ou ações de cancelamento no topo da tela não é responsivo e gera quebra grave de usabilidade, pois a mensagem fica fora do campo visual do usuário. Diálogos de interação devem sempre sobrepor o formulário ativo.
