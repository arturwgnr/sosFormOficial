# Updates: ajustes de layout e design (rodada 2)

Data: 2026-10-08
Status: concluído

## Geral

- [x] Revisar o `.gitignore` e garantir que ficam fora do commit:
      arquivos sensíveis e gerados (`.env` em todas as pastas,
      `node_modules`, `dist`, logs) e os itens que eu já adicionei nele
- [x] Verificar se algum desses arquivos já foi commitado antes. Se sim,
      remover do rastreamento (sem apagar do disco) e me avisar,
      principalmente se for algum `.env`

## Layout

- [x] Cada seção da landing ocupa no mínimo a altura total da tela
      (`min-height` com `100svh`, para funcionar bem no celular)
- [x] Rolagem suave entre seções, sem travar ou "prender" o scroll
- [x] Remover a seção "Como funciona"

## Design

- [x] Hero (`.landing__hero`): reposicionar o conteúdo, um dos lados está
      vazio demais. Deixar a composição equilibrada e mais bonita
- [x] Botões ghost (`.btn.btn--ghost.btn--lg`): no hover, texto e borda
      ficam azul neon #60a5fa (hoje ficam brancos)
- [x] Seções "Sobre a SOS Transpaletes" e "Pronto para tirar o relatório
      do papel?": melhorar o visual, juntas elas estão destoando
- [x] Login e Registro: as telas continuam com a estética quebrada.
      Refazer seguindo o padrão premium do CLAUDE.md

## Critério de conclusão

Todos os itens testados no desktop e no modo celular (F12), com a
rolagem fluida nos dois.
