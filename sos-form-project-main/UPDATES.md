# Updates: dashboard

Data: 2026-10-08
Status: concluído

## Feedback de ações

- [x] Toaster (notificação flutuante) ao aprovar e ao recusar usuários
- [x] Visual do toaster alinhado ao restante do sistema: cores da
      identidade, fonte Inter, ícones Material Symbols, animação suave
      de entrada e saída. Variações para sucesso, erro e aviso
- [x] Efeito sonoro curto e discreto na aprovação e na recusa (sons
      diferentes para cada uma)
- [x] Toaster reutilizável para outras ações do sistema no futuro

## Layout desktop

- [x] Reorganizar o dashboard no computador: hoje sobra espaço em branco
      na direita e a centralização ficou ruim
- [x] Usar a largura da tela com um grid bem distribuído (cards, gráfico
      e listas), mantendo a versão celular como está

## Dados de teste (somente banco LOCAL)

- [x] Apagar todos os usuários de teste, mantendo apenas os 3 admins
      do .env
- [x] Antes de apagar, listar os usuários que serão removidos e o que
      acontece com relatórios criados por eles, e esperar confirmação
- [x] Apagar testes relatorios

## Critério de conclusão

Toaster e sons testados nas duas ações, dashboard conferido no desktop
e no modo celular (F12), e banco local apenas com os 3 admins.
