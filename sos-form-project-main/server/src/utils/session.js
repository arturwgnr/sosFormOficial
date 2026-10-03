// Sessão em cookie httpOnly, guardada no banco (não em memória, não em
// JWT): o navegador recebe um token aleatório, o banco guarda só o hash
// dele. Isso permite revogar sessões a qualquer momento (logout, bloqueio
// de conta) e sobrevive a reinícios do servidor.
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + env.sessionTtlDays * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt },
  });

  return { token, expiresAt };
}

export async function getSessionUser(token) {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    // Sessão expirada: limpa e trata como inexistente.
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session.user;
}

export async function revokeSession(token) {
  if (!token) return;
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

// Usado ao bloquear uma conta: derruba sessões ativas na hora, em vez de
// esperar elas expirarem sozinhas.
export async function revokeAllSessionsForUser(userId) {
  await prisma.session.deleteMany({ where: { userId } });
}

// Opções compartilhadas entre criar e limpar o cookie: precisam ser
// idênticas (domain/path/sameSite/secure), senão o navegador não
// reconhece como o mesmo cookie e o "clearCookie" não funciona de verdade.
function baseCookieOptions() {
  const opts = {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
  };
  if (env.cookieDomain) opts.domain = env.cookieDomain;
  return opts;
}

export function sessionCookieOptions(expiresAt) {
  return { ...baseCookieOptions(), expires: expiresAt };
}

export function clearSessionCookie(res) {
  res.clearCookie(env.sessionCookieName, baseCookieOptions());
}
