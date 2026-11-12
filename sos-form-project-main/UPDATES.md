# Updates: usuários e relatório de empilhadeira

Data: 2026-11-12
Status: concluído (2026-11-12)

## Usuários: ações administrativas

- [x] Ao lado dos filtros "Todos / Ativos / Pendentes / Bloqueados",
      adicionar uma área "Ações administrativas"
- [x] Ações sensíveis (começando por remover usuário do banco) exigem
      uma senha de ações administrativas antes de executar
- [x] A senha fica no .env do servidor como HASH bcrypt
      (ADMIN_ACTIONS_PASSWORD_HASH), nunca em texto puro. No
      .env.example, só um valor de exemplo
- [x] Verificação da senha feita no backend, com limite de tentativas
- [x] Antes de remover: modal de confirmação mostrando nome e e-mail
      do usuário
- [x] Ao remover um usuário, os relatórios criados por ele NÃO são
      apagados (são registros da empresa). O relatório continua
      mostrando o nome do técnico
- [x] Um admin não pode remover a si mesmo nem os outros admins

## Empilhadeira: "Outros serviços"

- [x] Campos "Das" e "Até" passam a ser horários (seletor de hora,
      formato HH:MM), podendo digitar ou escolher
- [x] Total calculado automaticamente e exibido com unidade
      (ex: 07:30 até 19:30 = 12h; 08:00 até 10:30 = 2h30)
- [x] Funcionar quando o serviço passa da meia-noite
      (ex: 22:00 até 02:00 = 4h)
- [x] Dica sutil no campo indicando o formato (placeholder ou texto
      pequeno abaixo)
- [x] Total aparece também no PDF

## Empilhadeira: "Viagem efetuada"

- [x] Mesma lógica de horários: usuário informa "Das", "Até" e km
      de UM trajeto (só a ida)
- [x] Sistema calcula automaticamente o total de ida e volta
      (horas x2 e km x2)
- [x] Indicação sutil de que a volta é calculada automaticamente
      (ex: texto pequeno "Total inclui ida e volta" ao lado do total)
- [x] PDF mostra o trajeto informado e o total de ida e volta

## Critério de conclusão

Cálculos testados com horários comuns, com minutos quebrados e
passando da meia-noite. Remoção de usuário testada com senha certa,
senha errada e usuário que tem relatórios.
