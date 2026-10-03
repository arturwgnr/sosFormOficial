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
| 3     | Backend (API, banco, autenticação)       | concluída |
| 4     | Frontend novo (landing, auth, painel)    | concluída |
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
- 2026-10-03: Etapa 3 concluída. Backend criado em `server/` (Express +
  Prisma + PostgreSQL via Docker), projeto Node independente do
  frontend, estrutura de pastas aprovada antes de criar. Banco: `User`
  (nome, e-mail, senha com `bcryptjs`, papel ADMIN/EMPLOYEE, status
  PENDING/ACTIVE/BLOCKED, `canViewAllReports`, contador de tentativas de
  login com bloqueio temporário), `Session` (cookie httpOnly com token
  aleatório; só o hash fica no banco, permite revogar na hora em logout
  e bloqueio de conta, sem `express-session` nem JWT), `ReportCounter` +
  `Report` (ID público por contador atômico por tipo: PAL-0001,
  EMP-0001; dados do formulário em JSON; assinaturas em colunas
  próprias; autor e datas). Sem `Client`, como combinado. Rotas:
  `/api/auth` (register nasce PENDING, login com bloqueio por
  tentativas e recusa de PENDING/BLOCKED, logout, me), `/api/admin`
  (listar pendentes/todos, aprovar, recusar que marca BLOCKED - decisão
  do usuário -, bloquear, editar permissão), `/api/reports` (criar,
  listar com filtros respeitando permissão, ver um com 403 se não for
  dono nem tiver permissão). Toda rota valida entrada com `zod`
  (aprovado pelo usuário) antes do controller. Dependências novas
  aprovadas pelo usuário: `express`, `cors`, `cookie-parser`, `zod`,
  `@prisma/client`/`prisma`, e `bcryptjs` no lugar de `bcrypt` (evita
  falha de compilação nativa no Windows). Sem `dotenv`/`nodemon`: usa
  `--env-file` e `--watch` nativos do Node 22. Seed cria os 3 admins a
  partir do `.env` (nunca pela tela). `.env.example` documentado.
  Corrigido o `.gitignore` da raiz, que não bloqueava `.env` (só
  `*.local`); agora bloqueia `.env`/`.env.*` e libera `.env.example`.
  Testado com `server/test/routes.test.mjs` (9 casos) contra o servidor
  rodando de verdade: registro, PENDING sem acesso, senha errada,
  bloqueio por tentativas, fluxo completo de aprovação/permissão/
  bloqueio com acesso cruzado entre usuários negado, rotas de admin
  negadas para EMPLOYEE, logout invalidando sessão, e-mail duplicado
  recusado, prefixo de ID por tipo, 404 em relatório inexistente,
  validação de corpo inválido. Nenhuma mudança no frontend atual (fica
  para a Etapa 4).
- 2026-10-03: Etapa 4 concluída. Frontend novo completo. Abordagem
  aprovada pelo usuário: CSS puro com tokens de design centralizados
  (`src/styles/tokens.css`), sem framework CSS; `react-router-dom`
  (já instalado); gráfico do dashboard em SVG feito à mão, sem lib.
  Fundação: camada de API (`src/api/`, fetch wrapper com
  `credentials: include`), `AuthContext`/`useAuth` (hook e contexto em
  arquivos separados por causa da regra do Fast Refresh), `RouteGuards`
  (`RequireAuth`, `RequireRole`, `RedirectIfAuthed`, só UX), `AppShell`
  (sidebar fixa no desktop, barra inferior no celular). Fontes Inter e
  Material Symbols Outlined via Google Fonts, sem dependência nova.
  Landing page com as seções do CLAUDE.md. Telas de login, registro e
  aguardando aprovação. Painel por papel: funcionário vê atalhos pros
  2 formulários, relatórios recentes e total no mês; admin vê banner
  de pendentes, relatórios no mês por tipo, gráfico por mês, por
  técnico, serviços por tipo, clientes mais atendidos e últimos
  relatórios. Os dois formulários (Paleteira/Empilhadeira) e o
  Histórico foram reescritos: `localStorage` saiu, tudo fala com a
  API; PDF continua gerado no navegador (pdf-lib) a partir do
  `publicId` devolvido pela API, nunca armazenado pronto (decisão já
  tomada no CLAUDE.md). Admin: solicitações de acesso e usuários (com
  toggle de permissão e bloquear/reativar). Dois endpoints novos no
  backend, aprovados pelo usuário: `GET /api/reports/stats`
  (agregados do dashboard do admin) e `POST
  /api/admin/users/:id/unblock` (reativar conta bloqueada, gap
  percebido construindo a tela de usuários). Suite de testes do
  backend ampliada para 11 casos. Substituídos e removidos
  `Home.jsx`/`Home.css`, `Topbar.jsx`/`Topbar.css`,
  `PalletReport.jsx`/`ForkliftReport.jsx`/`History.jsx` (antigos) e
  `idGenerator.js` (confirmado pelo usuário).
  Verificação visual: sem skill de execução do projeto ainda
  cadastrada, então rodei o app de verdade com Playwright (headless,
  instalado só no scratchpad da sessão, fora do projeto) para tirar
  screenshots reais (desktop e celular, 390px) de todas as telas
  novas logado como admin e deslogado, e consultar erros de console.
  Achados e corrigidos 3 bugs visuais reais nesse processo: (1) o
  gráfico "Relatórios por mês" não aparecia porque o backend manda
  `{label, count}` e o componente `BarChart` lia `d.value` (ficava
  `undefined`, virava `NaN%` em CSS, navegador ignorava a altura) -
  corrigido no `AdminDashboard.jsx`, mapeando `count` para `value`.
  (2) A pílula "Chega de relatório de papel" no hero da landing
  esticava a largura inteira (item de grid sem `width` definido,
  comportamento padrão de stretch) - corrigido com `width: fit-content`.
  (3) Overflow horizontal real no celular (390px): a grade de 2
  colunas "Sobre a empresa" (`Contagem/MG`, `Empilhadeiras`) não tinha
  onde quebrar texto numa coluna estreita - corrigido empilhando em 1
  coluna abaixo de 420px e reduzindo o tamanho da fonte dos números.
  Confirmado sem overflow em nenhuma rota testada (`scrollWidth` ===
  390 em todas). Validado com `npm run build`, `npm run lint` e
  `npm run test:routes` (11/11) depois de cada ajuste.

### Ideias e pendências

- Existe um `CLAUDE.md` idêntico na raiz do repositório
  (`Ragnarok/sosFormOficial/CLAUDE.md`), fora desta pasta de projeto.
  Não foi tocado por estar fora do escopo. Decidir o que fazer com ele.
- `npm audit` no `server/` acusa 3 vulnerabilidades altas, todas na
  mesma cadeia: `prisma` (CLI, devDependency) -> `@prisma/config` ->
  `deepmerge-ts` (exaustão de pilha ao mesclar objetos recursivos). Não
  afeta o `@prisma/client` em produção, só a ferramenta de linha de
  comando usada em desenvolvimento. Sem correção disponível na versão
  mais recente do Prisma ainda. Rever quando o Prisma lançar um patch.
- `package.json#prisma` (chave usada para configurar o seed) está
  depreciada a partir do Prisma 7, que vai pedir um arquivo
  `prisma.config.ts`. Como o projeto é só JavaScript, rever a forma
  certa de configurar isso quando migrar para o Prisma 7 (ainda não
  lançado).
- O banco de desenvolvimento local (Postgres no Docker, porta 5434)
  ficou com dados de teste da suíte `routes.test.mjs` (contas e
  relatórios descartáveis), a pedido do usuário. Sem efeito em nada
  commitado; só limpar com `npx prisma migrate reset` se quiser (ação
  destrutiva, pede confirmação).
- Porta do Postgres do Docker deste projeto é 5434 (não a padrão 5432):
  essa máquina já tem um Postgres nativo do Windows ocupando a 5433 e
  outro container Docker (`innerverse-db`, de outro projeto) ocupando a
  5432.
- O primeiro commit da Etapa 4 (`feat(server): adiciona estatísticas...`)
  acabou incluindo também a remoção das páginas antigas (Home, Topbar,
  PalletReport/ForkliftReport/History antigos, idGenerator): esses
  `git rm` já estavam no index de uma etapa anterior do trabalho e
  entraram junto sem eu perceber antes de commitar. Sem problema de
  conteúdo (nada se perdeu, build/lint/testes passam), só a mensagem
  do commit não menciona essa parte.
- Não existe ainda uma skill de execução (`run`) específica deste
  projeto. Rodei o app manualmente com Playwright nesta sessão
  (instalado só no scratchpad, fora do repositório) para a verificação
  visual da Etapa 4. Considerar `/run-skill-generator` para cadastrar
  os passos (subir Postgres, migrar, seed, `npm run dev` nas duas
  pastas) como skill reaproveitável nas próximas etapas.

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
