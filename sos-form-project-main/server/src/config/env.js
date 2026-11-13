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

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: int("PORT", 4000),
  databaseUrl: required("DATABASE_URL"),
  corsOrigin: required("CORS_ORIGIN"),

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

  admins: [
    {
      name: required("ADMIN_1_NAME"),
      email: required("ADMIN_1_EMAIL"),
      password: required("ADMIN_1_PASSWORD"),
    },
    {
      name: required("ADMIN_2_NAME"),
      email: required("ADMIN_2_EMAIL"),
      password: required("ADMIN_2_PASSWORD"),
    },
    {
      name: required("ADMIN_3_NAME"),
      email: required("ADMIN_3_EMAIL"),
      password: required("ADMIN_3_PASSWORD"),
    },
  ],
};

export const isProduction = env.nodeEnv === "production";
