import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { toPublicUser } from "../utils/publicUser.js";
import { revokeAllSessionsForUser } from "../utils/session.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { verifyAdminActionPassword, actionPasswordField } from "../utils/adminActionPassword.js";
import { removeUserKeepingReports } from "../utils/removeUser.js";

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
  const users = await prisma.user.findMany({ where: status ? { status } : undefined });

  // Admins primeiro, depois funcionários; cada grupo em ordem alfabética.
  // Ordenado aqui (e não no banco) pra ignorar acento e maiúscula do jeito
  // do português, sem depender da collation do Postgres.
  const roleOrder = { ADMIN: 0, EMPLOYEE: 1 };
  users.sort(
    (a, b) =>
      (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9) ||
      a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
  );

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

export const deleteUserSchema = z.object({ actionPassword: actionPasswordField });

// Remove o usuário do banco. Os relatórios dele NÃO são apagados (ver
// utils/removeUser.js).
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await findUserOr404(req.params.id, res);
  if (!user) return;

  if (user.id === req.user.id) {
    return res.status(403).json({ error: "Você não pode remover a própria conta." });
  }
  if (user.role === "ADMIN") {
    return res.status(403).json({ error: "Administradores não podem ser removidos." });
  }

  if (!(await verifyAdminActionPassword(req, res))) return;

  const keptReports = await removeUserKeepingReports(prisma, user);

  res.json({ deleted: { id: user.id, name: user.name, email: user.email }, keptReports });
});
