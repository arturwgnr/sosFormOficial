// Mantém como ADMIN só os e-mails definidos no .env (ADMIN_1_EMAIL,
// ADMIN_2_EMAIL, ...). Qualquer outro usuário com papel ADMIN é removido
// do banco; os relatórios dele NÃO são apagados (mesma regra da remoção
// de usuário pela tela, ver src/utils/removeUser.js).
//
// Por padrão só SIMULA e lista quem seria removido. Para executar de
// verdade: `npm run admins:cleanup -- --apply`.
// Linha de comando apenas, nunca exposto como rota.
import { PrismaClient } from "@prisma/client";
import { env } from "../src/config/env.js";
import { removeUserKeepingReports } from "../src/utils/removeUser.js";

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

async function main() {
  const allowed = env.admins.map((a) => a.email);
  console.log(`Admins do .env (${allowed.length}):`);
  allowed.forEach((email) => console.log(`  - ${email}`));

  // E-mail repetido no .env quase sempre é cópia de bloco esquecida: um
  // admin que deveria existir ficaria de fora. Melhor parar e avisar.
  const duplicated = allowed.filter((email, i) => allowed.indexOf(email) !== i);
  if (duplicated.length) {
    console.error(`\nE-mail repetido no .env: ${[...new Set(duplicated)].join(", ")}. Corrija antes de continuar.`);
    process.exitCode = 1;
    return;
  }

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true, email: true, _count: { select: { reports: true } } },
    orderBy: { createdAt: "asc" },
  });

  const missing = allowed.filter((email) => !admins.some((a) => a.email === email));
  if (missing.length) {
    console.log(`\nAtenção: admins do .env ainda não estão no banco (rode o seed): ${missing.join(", ")}`);
  }

  const extras = admins.filter((a) => !allowed.includes(a.email));
  if (extras.length === 0) {
    console.log("\nNenhum admin fora do .env. Nada a fazer.");
    return;
  }

  console.log(`\nAdmins fora do .env (${extras.length}):`);
  extras.forEach((a) => console.log(`  - ${a.name} <${a.email}> (${a._count.reports} relatório(s), serão mantidos)`));

  if (!apply) {
    console.log("\nSimulação: nada foi alterado. Rode com --apply para remover.");
    return;
  }

  for (const admin of extras) {
    const kept = await removeUserKeepingReports(prisma, admin);
    console.log(`Removido: ${admin.email} (${kept} relatório(s) mantido(s))`);
  }
}

main()
  .catch((err) => {
    console.error("Falha na limpeza de admins:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
