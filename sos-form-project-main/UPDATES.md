# Updates: histórico, senha do usuário e limpeza de admins

Data: 2026-11-13
Status: em andamento (falta aplicar a limpeza de admins, ver abaixo)

## Histórico: excluir relatórios

- [x] Opção de excluir relatórios no histórico, no mesmo estilo das
      ações administrativas de Usuários
- [x] Exige a mesma senha de ações administrativas
      (ADMIN_ACTIONS_PASSWORD_HASH), verificada no backend, com o mesmo
      limite de tentativas
- [x] Disponível apenas para admins (checado no backend)
- [x] Permitir excluir um relatório ou vários selecionados
- [x] Modal de confirmação listando ID, cliente e data de cada
      relatório antes de excluir, deixando claro que é irreversível
- [x] Toaster e som de confirmação, no padrão já existente

## Perfil: alterar senha

- [x] Clicar na foto/avatar do usuário abre um menu com
      "Alterar senha"
- [x] Formulário com: senha atual, nova senha e confirmar nova senha
- [x] Validar que as duas novas senhas são iguais e que têm tamanho
      mínimo, com mensagem clara de erro
- [x] Botão de mostrar/ocultar senha nos campos
- [x] Após alterar: toaster de sucesso e encerrar as outras sessões
      abertas desse usuário
- [x] Funciona para admins e funcionários

## Limpeza de admins

- [ ] Manter como ADMIN apenas os 4 e-mails definidos no .env
- [ ] Qualquer outro usuário que estiver com papel ADMIN é removido
- [x] Relatórios criados por eles NÃO são apagados (mesma regra da
      remoção de usuários)
      Script pronto (`npm run admins:cleanup`, simula por padrão;
      `-- --apply` executa). Bloqueado: ADMIN_3 e ADMIN_4 do .env têm o
      mesmo e-mail.

## Critério de conclusão

Exclusão testada com senha certa, errada e com vários relatórios.
Troca de senha testada com senha atual errada, confirmação diferente
e caso de sucesso (login com a nova senha). Banco com apenas os 4
admins do .env.
