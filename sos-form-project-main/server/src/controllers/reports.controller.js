import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { nextReportPublicId } from "../utils/reportId.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { verifyAdminActionPassword, actionPasswordField } from "../utils/adminActionPassword.js";

export const idParamSchema = z.object({ id: z.string().min(1) });

export const createReportSchema = z.object({
  type: z.enum(["PALLET", "FORKLIFT"]),
  // Campos do formulário variam por tipo de relatório (ver pages/*Report.jsx
  // no frontend); guardados como estão, sem um schema rígido por campo.
  data: z.record(z.any()),
  clientSignature: z.string().optional(),
  sosSignature: z.string().optional(),
});

export const listReportsQuerySchema = z.object({
  type: z.enum(["PALLET", "FORKLIFT"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

function canSeeAllReports(user) {
  return user.role === "ADMIN" || user.canViewAllReports;
}

export const createReport = asyncHandler(async (req, res) => {
  const { type, data, clientSignature, sosSignature } = req.body;

  const publicId = await nextReportPublicId(type);

  const report = await prisma.report.create({
    data: {
      publicId,
      type,
      data,
      clientSignature,
      sosSignature,
      authorId: req.user.id,
      authorName: req.user.name,
    },
  });

  res.status(201).json({ report });
});

export const listReports = asyncHandler(async (req, res) => {
  const { type, from, to, q, page, pageSize } = req.query;

  const where = {
    ...(canSeeAllReports(req.user) ? {} : { authorId: req.user.id }),
    ...(type ? { type } : {}),
    ...(from || to
      ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
      : {}),
    ...(q
      ? {
          OR: [
            { publicId: { contains: q, mode: "insensitive" } },
            { data: { path: ["client"], string_contains: q } },
          ],
        }
      : {}),
  };

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.report.count({ where }),
  ]);

  res.json({ reports, total, page, pageSize });
});

const MONTH_LABELS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const SERVICE_TYPE_KEYS = ["garantia", "contrato", "a faturar"];

// Agregados pro dashboard do admin. Usuário comum nunca chama isto (rota
// é admin-only), então não precisa filtrar por autor.
export const getStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const [byTypeThisMonth, byTechnicianRaw, allReportsForBreakdown, pendingUsersCount] = await Promise.all([
    prisma.report.groupBy({
      by: ["type"],
      where: { createdAt: { gte: monthStart, lt: nextMonthStart } },
      _count: true,
    }),
    prisma.report.groupBy({
      // authorName entra no agrupamento: técnico removido (authorId null)
      // continua aparecendo com o nome gravado no relatório.
      by: ["authorId", "authorName"],
      where: { createdAt: { gte: monthStart, lt: nextMonthStart } },
      _count: true,
    }),
    // Só dá pra agregar "cliente" e "tipo de serviço" (dentro do JSON de
    // dados) em JS: Prisma não agrupa por caminho de JSON no Postgres.
    prisma.report.findMany({ select: { type: true, data: true } }),
    prisma.user.count({ where: { status: "PENDING" } }),
  ]);

  const totalThisMonth = byTypeThisMonth.reduce((sum, row) => sum + row._count, 0);
  const byType = { PALLET: 0, FORKLIFT: 0 };
  byTypeThisMonth.forEach((row) => {
    byType[row.type] = row._count;
  });

  const authorIds = byTechnicianRaw.map((row) => row.authorId).filter(Boolean);
  const authors = authorIds.length
    ? await prisma.user.findMany({ where: { id: { in: authorIds } }, select: { id: true, name: true } })
    : [];
  const authorNameById = new Map(authors.map((a) => [a.id, a.name]));

  // Junta por técnico: usuário ativo pelo id (nome atual), removido pelo
  // nome gravado. Um mesmo id pode vir em mais de uma linha se o nome
  // gravado mudou entre relatórios.
  const technicianMap = new Map();
  byTechnicianRaw.forEach((row) => {
    const key = row.authorId ? `id:${row.authorId}` : `name:${row.authorName}`;
    const name = authorNameById.get(row.authorId) || row.authorName || "Desconhecido";
    const current = technicianMap.get(key);
    if (current) current.count += row._count;
    else technicianMap.set(key, { authorId: row.authorId ?? key, name, removed: !row.authorId, count: row._count });
  });
  const byTechnician = [...technicianMap.values()].sort((a, b) => b.count - a.count);

  // Série dos últimos 6 meses (incluindo o atual).
  const monthlySeries = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1));
    monthlySeries.push({ start, end, label: MONTH_LABELS[start.getUTCMonth()] });
  }
  const monthlyCounts = await Promise.all(
    monthlySeries.map(({ start, end }) => prisma.report.count({ where: { createdAt: { gte: start, lt: end } } }))
  );
  const monthlySeriesResult = monthlySeries.map((m, i) => ({ label: m.label, count: monthlyCounts[i] }));

  const serviceTypeBreakdown = Object.fromEntries(SERVICE_TYPE_KEYS.map((k) => [k, 0]));
  const clientCounts = new Map();
  allReportsForBreakdown.forEach((report) => {
    const client = typeof report.data?.client === "string" ? report.data.client.trim() : "";
    if (client) clientCounts.set(client, (clientCounts.get(client) || 0) + 1);

    if (report.type === "FORKLIFT") {
      const serviceType = report.data?.serviceType;
      if (serviceType && serviceType in serviceTypeBreakdown) {
        serviceTypeBreakdown[serviceType] += 1;
      }
    }
  });

  const topClients = [...clientCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([client, count]) => ({ client, count }));

  res.json({
    monthLabel: now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
    totalThisMonth,
    byTypeThisMonth: byType,
    byTechnician,
    monthlySeries: monthlySeriesResult,
    serviceTypeBreakdown,
    topClients,
    pendingUsersCount,
  });
});

export const getReport = asyncHandler(async (req, res) => {
  const report = await prisma.report.findUnique({ where: { id: req.params.id } });

  if (!report) {
    return res.status(404).json({ error: "Relatório não encontrado." });
  }

  // authorId null (técnico removido) nunca bate com o usuário: só quem
  // vê todos os relatórios acessa.
  if (report.authorId !== req.user.id && !canSeeAllReports(req.user)) {
    return res.status(403).json({ error: "Sem permissão para ver este relatório." });
  }

  res.json({ report });
});

export const deleteReportsSchema = z.object({
  ids: z
    .array(z.string().min(1))
    .min(1, "Selecione ao menos um relatório.")
    .max(100, "No máximo 100 relatórios por vez.")
    .transform((ids) => [...new Set(ids)]),
  actionPassword: actionPasswordField,
});

// Exclusão definitiva de um ou vários relatórios. Só ADMIN (checado na
// rota) e com a senha de ações administrativas. Tudo ou nada: se algum
// ID não existir, nada é apagado.
export const deleteReports = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  const found = await prisma.report.findMany({
    where: { id: { in: ids } },
    select: { id: true, publicId: true },
  });
  if (found.length !== ids.length) {
    return res.status(404).json({ error: "Um ou mais relatórios não foram encontrados. Nada foi excluído." });
  }

  if (!(await verifyAdminActionPassword(req, res))) return;

  const { count } = await prisma.report.deleteMany({ where: { id: { in: ids } } });
  res.json({ deleted: count, publicIds: found.map((r) => r.publicId) });
});
