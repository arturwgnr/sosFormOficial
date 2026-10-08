// Cria (ou atualiza) os 3 administradores a partir do .env.
// Nunca rodar isso como parte de um fluxo de tela: é só linha de comando
// (`npm run db:seed`), como o CLAUDE.md exige.
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";
import { env } from "../src/config/env.js";

const prisma = new PrismaClient();

async function main() {
  for (const admin of env.admins) {
    // Mesma normalização do registro/login (zod: trim + toLowerCase); sem
    // isso, um e-mail com maiúscula no .env viraria conta que nunca loga.
    const email = admin.email.trim().toLowerCase();
    const name = admin.name.trim();
    const passwordHash = await hashPassword(admin.password);

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });

    await prisma.user.upsert({
      where: { email },
      update: {
        name,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        // Rodar o seed também destrava um admin bloqueado por tentativas.
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
      create: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        canViewAllReports: true,
      },
    });

    console.log(`Admin ${existing ? "atualizado" : "criado"}: ${email}`);
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
