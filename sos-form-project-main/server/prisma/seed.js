// Cria (ou atualiza) os 3 administradores a partir do .env.
// Nunca rodar isso como parte de um fluxo de tela: é só linha de comando
// (`npm run db:seed`), como o CLAUDE.md exige.
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";
import { env } from "../src/config/env.js";

const prisma = new PrismaClient();

async function main() {
  for (const admin of env.admins) {
    const passwordHash = await hashPassword(admin.password);

    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: {
        name: admin.name,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
      create: {
        name: admin.name,
        email: admin.email,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        canViewAllReports: true,
      },
    });

    console.log(`Admin ok: ${user.email}`);
  }
}

main()
  .catch((err) => {
    console.error("Falha ao rodar o seed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
