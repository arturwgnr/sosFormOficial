import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { toPublicUser } from "../utils/publicUser.js";
import { revokeAllSessionsForUser } from "../utils/session.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const idParamSchema = z.object({ id: z.string().min(1) });
export const permissionsSchema = z.object({ canViewAllReports: z.boolean() });
export const listUsersQuerySchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "BLOCKED"]).optional(),
});

async function findUserOr404(id, res) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado." });
    return null;
  }
  return user;
}

export const listPendingUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });
  res.json({ users: users.map(toPublicUser) });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const users = await prisma.user.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "asc" },
  });
  res.json({ users: users.map(toPublicUser) });
});

export const approveUser = asyncHandler(async (req, res) => {
  const user = await findUserOr404(req.params.id, res);
  if (!user) return;

  const updated = await prisma.user.update({ where: { id: user.id }, data: { status: "ACTIVE" } });
  res.json({ user: toPublicUser(updated) });
});

// "Recusar" marca como BLOCKED (mantém histórico de quem foi recusado,
// em vez de apagar o cadastro).
export const rejectUser = asyncHandler(async (req, res) => {
  const user = await findUserOr404(req.params.id, res);
  if (!user) return;

  const updated = await prisma.user.update({ where: { id: user.id }, data: { status: "BLOCKED" } });
  await revokeAllSessionsForUser(user.id);
  res.json({ user: toPublicUser(updated) });
});

export const blockUser = asyncHandler(async (req, res) => {
  const user = await findUserOr404(req.params.id, res);
  if (!user) return;

  const updated = await prisma.user.update({ where: { id: user.id }, data: { status: "BLOCKED" } });
  await revokeAllSessionsForUser(user.id);
  res.json({ user: toPublicUser(updated) });
});

// Reativa uma conta BLOCKED (volta pra ACTIVE). Sem isso, bloquear alguém
// seria uma ação sem volta pela tela.
export const unblockUser = asyncHandler(async (req, res) => {
  const user = await findUserOr404(req.params.id, res);
  if (!user) return;

  const updated = await prisma.user.update({ where: { id: user.id }, data: { status: "ACTIVE" } });
  res.json({ user: toPublicUser(updated) });
});

export const updatePermissions = asyncHandler(async (req, res) => {
  const user = await findUserOr404(req.params.id, res);
  if (!user) return;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { canViewAllReports: req.body.canViewAllReports },
  });
  res.json({ user: toPublicUser(updated) });
});
