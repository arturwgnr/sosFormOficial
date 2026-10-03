import { env } from "../config/env.js";
import { getSessionUser } from "../utils/session.js";
import { toPublicUser } from "../utils/publicUser.js";

// Lê o cookie de sessão, valida no banco e anexa o usuário em req.user.
// Toda rota protegida passa por aqui: permissão nunca é só do frontend.
export async function requireAuth(req, res, next) {
  const token = req.cookies?.[env.sessionCookieName];
  const user = await getSessionUser(token);

  if (!user) {
    res.clearCookie(env.sessionCookieName);
    return res.status(401).json({ error: "Não autenticado." });
  }

  // Defensivo: se a conta foi bloqueada/voltou a PENDING depois da sessão
  // criada (ex: corrida com uma ação de admin), nega o acesso mesmo assim.
  if (user.status !== "ACTIVE") {
    res.clearCookie(env.sessionCookieName);
    return res.status(403).json({ error: "Conta sem acesso liberado." });
  }

  req.user = user;
  req.publicUser = toPublicUser(user);
  next();
}
