# SOS Transpaletes - API

Backend em Express + Prisma + PostgreSQL. Projeto Node independente do
frontend (`../`), com `package.json` próprio.

## Subir pela primeira vez

```bash
cp .env.example .env
# edite o .env com os dados reais (senhas dos 3 admins, etc.)

npm install

docker compose up -d          # sobe o Postgres local
npm run db:migrate            # cria as tabelas
npm run db:seed               # cria os 3 administradores

npm run dev                   # http://localhost:4000
```

## Scripts

- `npm run dev` - sobe o servidor com reload automático (`--watch`)
- `npm start` - sobe o servidor sem reload
- `npm run db:migrate` - aplica as migrations do Prisma
- `npm run db:generate` - regenera o Prisma Client (depois de mudar o schema)
- `npm run db:seed` - cria/atualiza os 3 admins a partir do `.env`
- `npm run db:studio` - abre o Prisma Studio (inspecionar o banco)
- `npm run test:routes` - roda o script de teste de rotas (precisa do
  servidor rodando em outro terminal)

## Variáveis de ambiente

Ver `.env.example`. Nenhum valor real deve ser commitado.
