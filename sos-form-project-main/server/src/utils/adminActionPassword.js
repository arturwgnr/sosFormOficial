// Senha de ações administrativas (ADMIN_ACTIONS_PASSWORD_HASH), usada em
// ações sensíveis: remover usuário, excluir relatórios. Conferida sempre
// no backend, com o mesmo limite de tentativas do login (contador próprio,
// guardado no admin logado).
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { comparePassword } from "./password.js";
import { env } from "../config/env.js";

export const actionPasswordField = z.string().min(1, "Informe a senha de ações administrativas.");

// Devolve true se pode seguir; senão já respondeu o erro.
export async function verifyAdminActionPassword(req, res) {
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
