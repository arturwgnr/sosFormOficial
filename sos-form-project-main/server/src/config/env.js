// Lê e valida as variáveis de ambiente uma única vez, na subida do servidor.
// Falhar cedo (e com mensagem clara) é melhor do que falhar no meio de um
// request por causa de uma variável faltando.

function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

function int(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Variável de ambiente ${name} deveria ser um número, recebeu: "${raw}"`);
  }
  return parsed;
}

// Hash bcrypt opcional. Tira aspas das pontas (comum ao colar o valor
// com aspas no painel do Render, onde elas viram parte do valor) e avisa
// no log se o formato não for de um hash bcrypt, em vez de falhar calado.
function bcryptHash(name) {
  const raw = process.env[name]?.trim().replace(/^(['"])(.*)\1$/, "$2").trim();
  if (!raw) return undefined;
  if (!/^\$2[aby]\$\d{2}\$[A-Za-z0-9./]{53}$/.test(raw)) {
    console.warn(
      `[env] ${name} não parece um hash bcrypt válido (gere com npm run hash:password). Ação desativada.`
    );
    return undefined;
  }
  return raw;
}

// Admins numerados em sequência: ADMIN_1_*, ADMIN_2_*, ... até o primeiro
// número sem ADMIN_N_EMAIL. Pelo menos um é obrigatório.
function readAdmins() {
  const admins = [];
  for (let n = 1; process.env[`ADMIN_${n}_EMAIL`]?.trim(); n += 1) {
    admins.push({
      name: required(`ADMIN_${n}_NAME`),
      email: required(`ADMIN_${n}_EMAIL`).trim().toLowerCase(),
      password: required(`ADMIN_${n}_PASSWORD`),
    });
  }
  if (admins.length === 0) required("ADMIN_1_EMAIL");
  return admins;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: int("PORT", 4000),
  databaseUrl: required("DATABASE_URL"),
  // Sem "/" no fim: o navegador manda a origem sem barra, e um valor
  // colado com barra no painel faria o CORS recusar tudo.
  corsOrigin: required("CORS_ORIGIN").trim().replace(/\/+$/, ""),

  sessionCookieName: process.env.SESSION_COOKIE_NAME || "sos_session",
  sessionTtlDays: int("SESSION_TTL_DAYS", 7),
  // Só em produção: permite o cookie circular entre subdomínios do mesmo
  // domínio (ex: sistema.sostranspaletes.com.br e api.sostranspaletes.com.br).
  // Em dev, fica undefined e o cookie vira host-only (certo pra localhost).
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,

  loginMaxAttempts: int("LOGIN_MAX_ATTEMPTS", 5),
  loginLockoutMinutes: int("LOGIN_LOCKOUT_MINUTES", 15),

  // Hash bcrypt (nunca a senha em texto) da senha exigida em ações
  // administrativas sensíveis, como remover um usuário. Gerar com
  // `npm run hash:password`. Opcional: sem ela, essas ações ficam
  // desativadas (o servidor sobe normalmente).
  adminActionsPasswordHash: bcryptHash("ADMIN_ACTIONS_PASSWORD_HASH"),

  // Os únicos e-mails que podem ser ADMIN (ver scripts/cleanup-admins.js).
  admins: readAdmins(),
};

export const isProduction = env.nodeEnv === "production";
