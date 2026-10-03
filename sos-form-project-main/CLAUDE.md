# SOS Transpaletes: Sistema de Gestão de Relatórios

## Visão geral

Sistema interno da SOS Transpaletes (manutenção, venda e locação de paleteiras
e empilhadeiras, Contagem/MG, mais de 30 anos de mercado). Hoje é um app
frontend que substitui relatórios de serviço em papel (Paleteira e
Empilhadeira), com assinatura na tela e geração de PDF.

Objetivo final: app full-stack com visual premium e moderno, com cara de
sistema de empresa grande e pronto para crescer. Inclui landing page
profissional, login/registro com aprovação, papéis e permissões, backend com
banco de dados e histórico centralizado.

## Regras de trabalho (obrigatórias)

- Trabalhar UMA etapa por vez, na ordem definida abaixo.
- Antes de executar qualquer tarefa com mais de um passo, apresentar o plano
  e esperar aprovação.
- Antes de apagar, sobrescrever ou renomear qualquer arquivo existente,
  mostrar o que vai mudar e esperar confirmação.
- Nunca modificar arquivos fora desta pasta do projeto.
- Após cada passo importante: resumir o que foi feito e o que vem a seguir.
- Ao final de cada tarefa: listar todos os arquivos criados ou modificados.
- Novos arquivos de documentação ou notas usam o formato
  AAAA-MM-DD-nome-descritivo. Arquivos de código seguem as convenções normais.
- Nunca usar o caractere "—" em mensagens.
- Não adicionar bibliotecas novas sem justificar e pedir aprovação.
- Não "melhorar" coisas fora do escopo da etapa atual. Se notar algo, anotar
  na seção "Ideias e pendências" em vez de fazer.
- Responder em português.

## Controle de progresso

Ao concluir cada etapa, o Claude deve:

1. Atualizar a tabela "Status das etapas" abaixo.
2. Adicionar uma linha no "Registro" com data e resumo.
3. Sugerir a mensagem de commit e a tag git (ex: `etapa-1-concluida`).

Fluxo de git: trabalhar na branch `upgrade-app`, um commit por etapa (ou por
bloco lógico dentro da etapa), mensagens no padrão
`tipo: descrição` (feat, fix, refactor, docs, chore).

### Status das etapas

| Etapa | Descrição                                | Status    |
| ----- | ---------------------------------------- | --------- |
| 0     | Preparação (git, branch, CLAUDE.md)      | concluída |
| 1     | Conversão TypeScript para JavaScript     | concluída |
| 2     | Correção de bugs e reestruturação do PDF | concluída |
| 3     | Backend (API, banco, autenticação)       | pendente  |
| 4     | Frontend novo (landing, auth, painel)    | pendente  |
| 5     | Importação dos relatórios antigos        | pendente  |
| 6     | Deploy                                   | pendente  |

### Registro

- 2026-10-03: Etapa 1 concluída. Todo o `src` convertido de `.tsx`/`.ts`
  para `.jsx`/`.js`. Removidos `tsconfig.json`, `tsconfig.app.json`,
  `tsconfig.node.json`, `src/vite-env.d.ts` e `src/types/trim-canvas.d.ts`.
  `vite.config.ts` virou `vite.config.js`. `package.json`: build sem
  `tsc -b`, removidas as devDependencies `typescript`, `typescript-eslint`,
  `@types/react`, `@types/react-dom`. Corrigido de passagem o typo
  `vimport` em `ForkliftReport.tsx` linha 1 (impedia o build; aprovado
  pelo usuário). Tipos das interfaces `ReportData` e `ForkliftReportData`
  viraram JSDoc `@typedef` nos geradores de PDF (aprovado pelo usuário);
  as demais interfaces (`SignaturePadProps`, `Report` do histórico) saíram
  sem substituto. Adicionada a devDependency `eslint-plugin-react`
  (aprovada pelo usuário) para a regra `jsx-uses-vars`, que o parser puro
  do ESLint não tem e o `@typescript-eslint/parser` tinha; sem ela, todo
  import de componente usado só via JSX virava falso-positivo de
  `no-unused-vars`. Ajustado `eslint.config.js` (parser JSX, presets
  `react.configs.flat.recommended` e `jsx-runtime`, `react/prop-types`
  desligada por o projeto não usar a lib `prop-types`). Removida a pasta
  `sosFormOficial/` (clone completo do repositório dentro do projeto) e o
  arquivo `EXECUTE.md` (cópia do CLAUDE.md), ambos não rastreados
  (aprovado pelo usuário). `npm run build`, `npm run lint` e `npm run dev`
  validados.
- 2026-10-03: Etapa 2 concluída. Bug 1 (PDF de Empilhadeira incompleto):
  adicionada seção "Rodapé do atendimento" com teste efetuado, motivo,
  resultado, observações e tipo de serviço. Bug 2 (valores incompatíveis):
  radios de resultado e estado inicial unificados em português
  (`"positivo"/"negativo"`); select de tipo de serviço com estado inicial
  `"garantia"` (antes `"warranty"`, que não existia nas opções). Bug 3
  (PDF de uma página só): criado `src/utils/pdfLayout.js` com paginação
  automática compartilhada pelos dois geradores (cabeçalho completo só na
  primeira página, reduzido nas seguintes, assinaturas sempre na última
  página, rodapé "Página X de Y" calculado numa segunda passada). Também
  adicionada a data de geração no cabeçalho dos dois PDFs (exigida pela
  seção "Relatórios e PDF" mas ausente até então). Testado com poucos e
  muitos itens nos dois geradores (ver registro de testes abaixo). Bug 4
  (`generateForkliftReportId` duplicada): removida a cópia morta que
  existia dentro do gerador de PDF; a versão realmente usada
  (`src/utils/idGenerator.js`) não foi alterada. Bug 5 (sem reset/download):
  os dois formulários agora limpam campos e assinaturas após salvar
  (remonte do `<form>` via `key`) e disparam o download do PDF
  automaticamente, além de salvar no histórico. Bug 6 (arquivos sem uso):
  removidos `ReportForm.jsx`, `ThemeToggle.jsx` e `App.css` (e seu import
  morto em `App.jsx`), confirmados sem nenhuma referência no projeto.
  `SignReport.jsx` mantido: tem rota ativa `/sign/:id`, não é código morto
  (decisão do usuário). Validado com `npm run build`, `npm run lint` e
  scripts de teste de paginação (poucos/muitos itens, texto curto/longo)
  gerando e inspecionando os PDFs reais; arquivos de teste descartados,
  não fazem parte do projeto.

### Ideias e pendências

- Existe um `CLAUDE.md` idêntico na raiz do repositório
  (`Ragnarok/sosFormOficial/CLAUDE.md`), fora desta pasta de projeto.
  Não foi tocado por estar fora do escopo. Decidir o que fazer com ele.

## Identidade visual

Respeitar sempre a identidade da empresa (site: sostranspaletes.com.br,
repositório de referência só leitura: github.com/arturwgnr/sosWebsite).

- Cor primária: #152c4b (azul-marinho)
- Cor secundária: #1f3f69
- Destaque: #60a5fa
- WhatsApp: #25d366
- Neutros (slate): #f8fafc #f1f5f9 #e2e8f0 #cbd5e1 #94a3b8 #64748b #475569
- Fonte: Inter (pesos 400 a 900)
- Ícones: Material Symbols Outlined
- Logo: src/assets/sos-logo.png (usar sempre a original, nunca recriar)
- Estilo: profissional, industrial, limpo, sério. Nada de visual genérico de
  template.

Dados oficiais da empresa (já usados no cabeçalho do PDF, manter iguais):
Rua Sinval Alves da Cunha, 126, Jardim Bandeirantes, Contagem/MG, 32371-330.
Telefones: (31) 9340-0419 e (31) 2559-3533.

## Skills

Antes de tarefas de interface (landing page, telas, componentes), consultar as
skills disponíveis em `C:\Users\User\.claude\skills`, especialmente as de
design de frontend, e seguir suas orientações junto com a identidade visual
acima. Antes de cada etapa, verificar se alguma skill se aplica à tarefa.

## Stack

- Frontend: React + Vite, JavaScript (sem TypeScript)
- Backend: Node.js + Express + Prisma + PostgreSQL
- PDF: pdf-lib (gerado no frontend a partir dos dados salvos)
- Banco local de desenvolvimento: PostgreSQL via Docker

## Decisões já tomadas

### Acesso e segurança

- 3 administradores (chefes), criados por script de seed. Nunca pela tela.
- Registro livre, mas toda conta nova nasce com status PENDING e não acessa
  nada até um admin aprovar. Status possíveis: PENDING, ACTIVE, BLOCKED.
- Modelo de papéis + permissões, pensado para crescer. Papéis: ADMIN e
  EMPLOYEE. Funcionário começa só vendo os próprios relatórios; admin pode
  liberar "ver todos os relatórios" por usuário com um clique.
- Toda permissão é verificada no backend. Esconder botão no frontend não
  conta como segurança.
- Senhas com bcrypt, sessão em cookie httpOnly, limite de tentativas no
  login, validação de entrada em todas as rotas, CORS restrito, variáveis
  sensíveis só em `.env` (nunca commitado).

### Relatórios e PDF

- O banco guarda os DADOS do relatório, não o PDF pronto.
- IDs únicos gerados pelo banco, com contador por tipo: PAL-0001, EMP-0001.
- PDF: manter o cabeçalho atual (logo, dados da empresa, ID, data).
- Corpo do PDF com tabelas para serviços, viagens e materiais.
- Multipágina automática: 1 página por padrão, nova página quando não couber,
  com cabeçalho reduzido nas páginas seguintes.
- Assinaturas sempre no fim da última página.
- Rodapé "Página X de Y" calculado no final.

### Landing page

Focada no sistema, com um bloco sobre a empresa. Seções: hero com acesso ao
login, problema e solução (papel para digital), funcionalidades, como funciona
em 3 passos, segurança e controle de acesso, sobre a SOS Transpaletes, chamada
final e footer com contatos e endereço.

## Etapas detalhadas

### Etapa 1: Conversão TypeScript para JavaScript

Objetivo: mudar só a linguagem. Nenhum comportamento muda.

- Renomear `.tsx` para `.jsx` e `.ts` para `.js`, removendo tipos e interfaces.
- Remover `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`.
- Remover `src/types` (ou converter para comentários JSDoc, perguntar antes).
- Converter `vite.config.ts` para `vite.config.js`.
- Ajustar `package.json` (remover `tsc -b` do build e dependências de TS).
- Ajustar `eslint.config.js` e imports.
  Concluída quando: `npm run dev` e `npm run build` funcionam, e os dois
  formulários, assinaturas, PDF e histórico funcionam igual a antes.

### Etapa 2: Correção de bugs e PDF

Bugs conhecidos:

1. PDF de Empilhadeira não inclui teste efetuado, motivo, resultado,
   observações e tipo de serviço.
2. Radios de resultado comparam "positive/negative" mas o valor salvo é
   "positivo/negativo". Select de tipo de serviço começa com "warranty", que
   não existe nas opções.
3. PDF de Empilhadeira tem uma página só e o conteúdo invade as assinaturas.
   "Página 1 de 1" fixo.
4. Função `generateForkliftReportId` duplicada no gerador de PDF.
5. Formulário não limpa após salvar; não há download do PDF logo após gerar.
6. Arquivos vazios ou sem uso: `ReportForm`, `App.css`, `SignReport`,
   `ThemeToggle` (confirmar antes de remover).
   Também: reestruturar o PDF conforme "Relatórios e PDF" acima.
   (Armazenamento e IDs ficam para a Etapa 3.)
   Concluída quando: todos os bugs corrigidos e PDF testado com poucos e com
   muitos itens.

### Etapa 3: Backend

- Criar a API em `server/` (Express + Prisma + PostgreSQL via Docker).
  Propor a estrutura de pastas antes de criar.
- Modelos: User (nome, e-mail, senha hash, papel, status, permissões),
  Report (ID por tipo, tipo, dados do formulário, assinaturas, autor, datas).
  Client fica para depois.
- Rotas: autenticação (registro, login, logout, sessão atual), admin
  (listar pendentes, aprovar, recusar, bloquear, editar permissões),
  relatórios (criar, listar com filtros, ver um, respeitando permissões).
- Seed com os 3 admins (dados vindos do `.env`).
- Criar `.env.example` documentado.
  Concluída quando: todas as rotas testadas, incluindo tentativas de acesso
  sem permissão sendo recusadas.

### Etapa 4: Frontend novo

- Propor a abordagem de estilo e roteamento antes de começar.
- Landing page completa (seções acima) com footer.
- Telas de login, registro e "conta aguardando aprovação".
- Área interna: painel inicial, formulários (Paleteira e Empilhadeira),
  histórico com busca e filtros, download do PDF.
- Área do admin: solicitações de acesso, usuários e permissões.
- Responsivo, pensado primeiro para celular (técnicos em campo).
  Concluída quando: fluxo completo testado com um admin e um funcionário.

### Etapa 5: Importação dos relatórios antigos

- Os relatórios atuais estão no localStorage dos aparelhos, no domínio do app
  antigo. Planejar com o usuário como exportar (ex: botão de exportação em
  JSON na versão atual) e importar para o banco mantendo os IDs antigos.

### Etapa 6: Deploy

- Definir hospedagem com o usuário antes de qualquer configuração.
- Variáveis de ambiente, banco de produção, HTTPS, domínio.

### Padrão de qualidade do sistema

Isto é um sistema completo de empresa, não um formulário. Toda tela deve
ter acabamento premium: hierarquia visual clara, espaçamento generoso,
estados de carregamento, vazio e erro bem resolvidos, feedback em cada ação
e transições suaves. Nada de tela "crua" ou com cara de protótipo.

Navegação:

- Desktop: menu lateral fixo. Celular: barra de navegação inferior.
- Ações principais (novo relatório, histórico) acessíveis em 1 toque de
  qualquer tela.
- Busca rápida de relatórios por cliente, ID ou equipamento.

Dashboard do admin:

- Relatórios no mês, por tipo (Paleteira e Empilhadeira) e por técnico
- Gráfico de relatórios por semana ou mês
- Serviços por tipo: garantia, contrato e a faturar
- Clientes mais atendidos
- Solicitações de acesso pendentes (com destaque)
- Últimos relatórios criados

Dashboard do funcionário:

- Atalho grande para "Novo relatório"
- Meus relatórios recentes
- Meu total no mês
