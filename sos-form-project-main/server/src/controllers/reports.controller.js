import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { nextReportPublicId } from "../utils/reportId.js";
import { asyncHandler } from "../middleware/errorHandler.js";

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

export const getReport = asyncHandler(async (req, res) => {
  const report = await prisma.report.findUnique({ where: { id: req.params.id } });

  if (!report) {
    return res.status(404).json({ error: "Relatório não encontrado." });
  }

  if (report.authorId !== req.user.id && !canSeeAllReports(req.user)) {
    return res.status(403).json({ error: "Sem permissão para ver este relatório." });
  }

  res.json({ report });
});
