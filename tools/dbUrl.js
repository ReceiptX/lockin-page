"use strict";

function resolveDatabaseUrl(env = process.env) {
  if (env.DATABASE_URL) return env.DATABASE_URL;

  const candidates = [
    env.POSTGRES_URL,
    env.POSTGRES_PRISMA_URL,
    env.POSTGRES_URL_NON_POOLING,
  ].filter((v) => typeof v === "string" && v.trim() !== "");

  if (candidates.length > 0) return candidates[0];

  const host = env.POSTGRES_HOST;
  const user = env.POSTGRES_USER;
  const password = env.POSTGRES_PASSWORD;
  const database = env.POSTGRES_DATABASE;
  const port = env.POSTGRES_PORT || "5432";

  if (host && user && password && database) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(
      database
    )}`;
  }

  return null;
}

module.exports = { resolveDatabaseUrl };
