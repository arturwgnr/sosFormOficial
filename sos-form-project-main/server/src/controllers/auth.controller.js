import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import {
  createSession,
  revokeSession,
  revokeOtherSessionsForUser,
  sessionCookieOptions,
  clearSessionCookie,
} from "../utils/session.js";
import { toPublicUser } from "../utils/publicUser.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto.").max(120),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password: z.string().min(8, "Senha precisa de pelo menos 8 caracteres.").max(200),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password: z.string().min(1, "Senha obrigatória."),
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Já existe uma conta com este e-mail." });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "EMPLOYEE", status: "PENDING" },
  });

  res.status(201).json({
    message: "Cadastro enviado. Aguarde a aprovação de um administrador.",
    user: toPublicUser(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  // Mesma mensagem genérica para e-mail inexistente e senha errada:
  // não dar pista de quais e-mails têm conta cadastrada.
  const invalidCredentials = () => res.status(401).json({ error: "E-mail ou senha incorretos." });

  if (!user) return invalidCredentials();

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return res.status(423).json({
      error: `Conta temporariamente bloqueada por excesso de tentativas. Tente novamente em ${minutesLeft} min.`,
    });
  }

  const validPassword = await comparePassword(password, user.passwordHash);

  if (!validPassword) {
    const attempts = user.failedLoginAttempts + 1;
    const lockout = attempts >= env.loginMaxAttempts;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: lockout ? 0 : attempts,
        lockedUntil: lockout ? new Date(Date.now() + env.loginLockoutMinutes * 60 * 1000) : null,
      },
    });

    if (lockout) {
      return res.status(423).json({
        error: `Muitas tentativas incorretas. Conta bloqueada por ${env.loginLockoutMinutes} min.`,
      });
    }
    return invalidCredentials();
  }

  // Login certo: zera o contador de tentativas, se houver.
  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  if (user.status === "PENDING") {
    return res.status(403).json({ error: "Cadastro ainda aguardando aprovação de um administrador." });
  }
  if (user.status === "BLOCKED") {
    return res.status(403).json({ error: "Conta bloqueada. Fale com um administrador." });
  }

  const { token, expiresAt } = await createSession(user.id);
  res.cookie(env.sessionCookieName, token, sessionCookieOptions(expiresAt));

  res.json({ user: toPublicUser(user) });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[env.sessionCookieName];
  await revokeSession(token);
  clearSessionCookie(res);
  res.status(204).send();
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.publicUser });
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: z.string().min(8, "A nova senha precisa de pelo menos 8 caracteres.").max(200),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "A confirmação não é igual à nova senha.",
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    path: ["newPassword"],
    message: "A nova senha precisa ser diferente da atual.",
  });

// Troca a senha do próprio usuário logado (admin ou funcionário). Errar a
// senha atual conta no mesmo limite de tentativas do login, senão essa
// rota viraria um jeito de testar senhas sem bloqueio.
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return res.status(423).json({
      error: `Muitas tentativas incorretas. Tente novamente em ${minutesLeft} min.`,
    });
  }

  if (!(await comparePassword(currentPassword, user.passwordHash))) {
    const attempts = user.failedLoginAttempts + 1;
    const lockout = attempts >= env.loginMaxAttempts;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: lockout ? 0 : attempts,
        lockedUntil: lockout ? new Date(Date.now() + env.loginLockoutMinutes * 60 * 1000) : null,
      },
    });
    if (lockout) {
      return res.status(423).json({
        error: `Muitas tentativas incorretas. Troca de senha bloqueada por ${env.loginLockoutMinutes} min.`,
      });
    }
    // 403 e não 401: a sessão continua válida, só a senha atual errou.
    return res.status(403).json({
      error: `Senha atual incorreta. ${env.loginMaxAttempts - attempts} tentativa(s) restante(s).`,
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword), failedLoginAttempts: 0, lockedUntil: null },
  });
  const closedSessions = await revokeOtherSessionsForUser(
    user.id,
    req.cookies?.[env.sessionCookieName]
  );

  res.json({ message: "Senha alterada.", closedSessions });
});
