import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { toPublicUser } from "../utils/publicUser.js";
import { revokeAllSessionsForUser } from "../utils/session.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { comparePassword } from "../utils/password.js";
import { env } from "../config/env.js";

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

export const deleteUserSchema = z.object({
  actionPassword: z.string().min(1, "Informe a senha de ações administrativas."),
});

// Confere a senha de ações administrativas do admin logado, com o mesmo
// limite de tentativas do login (contador próprio, guardado no admin).
// Devolve true se pode seguir; senão já respondeu o erro.
async function verifyAdminActionPassword(req, res) {
  if (!env.adminActionsPasswordHash) {
    res.status(503).json({
      error: "Ações administrativas desativadas: senha não configurada no servidor.",
    });
    return false;
  }

  const admin = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (admin.adminActionLockedUntil && admin.adminActionLockedUntil > new Date()) {
    const minutesLeft = Math.ceil((admin.adminActionLockedUntil.getTime() - Date.now()) / 60000);
    res.status(423).json({
      error: `Ações administrativas bloqueadas por excesso de tentativas. Tente novamente em ${minutesLeft} min.`,
    });
    return false;
  }

  const valid = await comparePassword(req.body.actionPassword, env.adminActionsPasswordHash);

  if (!valid) {
    const attempts = admin.adminActionFailedAttempts + 1;
    const lockout = attempts >= env.loginMaxAttempts;
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        adminActionFailedAttempts: lockout ? 0 : attempts,
        adminActionLockedUntil: lockout
          ? new Date(Date.now() + env.loginLockoutMinutes * 60 * 1000)
          : null,
      },
    });

    // 403 e não 401: a sessão continua válida, só a senha da ação errou.
    if (lockout) {
      res.status(423).json({
        error: `Muitas tentativas incorretas. Ações administrativas bloqueadas por ${env.loginLockoutMinutes} min.`,
      });
    } else {
      const left = env.loginMaxAttempts - attempts;
      res.status(403).json({
        error: `Senha de ações administrativas incorreta. ${left} tentativa(s) restante(s).`,
      });
    }
    return false;
  }

  if (admin.adminActionFailedAttempts > 0 || admin.adminActionLockedUntil) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { adminActionFailedAttempts: 0, adminActionLockedUntil: null },
    });
  }
  return true;
}

// Remove o usuário do banco. Os relatórios dele NÃO são apagados (são
// registros da empresa): o vínculo vira null pelo onDelete: SetNull e o
// nome do técnico continua em Report.authorName.
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

  const keptReports = await prisma.$transaction(async (tx) => {
    // Garante o nome no relatório antes de soltar o vínculo (relatórios
    // criados antes da coluna existir já foram preenchidos na migração).
    await tx.report.updateMany({
      where: { authorId: user.id, authorName: "" },
      data: { authorName: user.name },
    });
    const total = await tx.report.count({ where: { authorId: user.id } });
    await tx.user.delete({ where: { id: user.id } }); // sessões caem em cascata
    return total;
  });

  res.json({ deleted: { id: user.id, name: user.name, email: user.email }, keptReports });
});
