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

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: int("PORT", 4000),
  databaseUrl: required("DATABASE_URL"),
  corsOrigin: required("CORS_ORIGIN"),

  sessionCookieName: process.env.SESSION_COOKIE_NAME || "sos_session",
  sessionTtlDays: int("SESSION_TTL_DAYS", 7),

  loginMaxAttempts: int("LOGIN_MAX_ATTEMPTS", 5),
  loginLockoutMinutes: int("LOGIN_LOCKOUT_MINUTES", 15),

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
