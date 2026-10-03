import { prisma } from "../lib/prisma.js";

const PREFIXES = {
  PALLET: "PAL",
  FORKLIFT: "EMP",
};

// Incrementa o contador do tipo dentro de uma transação, para dois
// relatórios criados ao mesmo tempo nunca saírem com o mesmo ID.
export async function nextReportPublicId(type) {
  const prefix = PREFIXES[type];
  if (!prefix) throw new Error(`Tipo de relatório desconhecido: ${type}`);

  const counter = await prisma.$transaction(async (tx) => {
    return tx.reportCounter.upsert({
      where: { type },
      create: { type, lastSeq: 1 },
      update: { lastSeq: { increment: 1 } },
    });
  });

  return `${prefix}-${String(counter.lastSeq).padStart(4, "0")}`;
}
