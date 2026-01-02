"use strict";

const { Pool } = require("pg");
const { createRateLimiter } = require("../_shared/rateLimit");

function getEnv(name, fallback) {
  const value = process.env[name];
  return value == null || value === "" ? fallback : value;
}

function parseBool(value, fallback) {
  if (value == null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
}

function getHostFromOrigin(origin) {
  const url = new URL(origin);
  return url.host;
}

function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const candidates = [
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ].filter((v) => typeof v === "string" && v.trim() !== "");

  if (candidates.length > 0) return candidates[0];

  const host = process.env.POSTGRES_HOST;
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE;
  const port = process.env.POSTGRES_PORT || "5432";

  if (host && user && password && database) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(
      database
    )}`;
  }

  return null;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.length > 0) {
    return JSON.parse(req.body);
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return null;
  return JSON.parse(raw);
}

let pool = null;
let schemaReadyPromise = null;

const rateLimit = createRateLimiter({
  windowMs: Number(getEnv("RATE_LIMIT_WINDOW_MS", "60000")),
  max: Number(getEnv("RATE_LIMIT_MAX", "120")),
});

function getPool() {
  if (pool) return pool;

  const connectionString = resolveDatabaseUrl();
  if (!connectionString) {
    const err = new Error(
      "Missing database configuration. Set DATABASE_URL or connect Vercel Postgres (POSTGRES_URL)."
    );
    err.code = "MISSING_DATABASE_URL";
    throw err;
  }

  pool = new Pool({
    connectionString,
    ssl: getEnv("PGSSLMODE", "require") === "disable" ? false : { rejectUnauthorized: false },
  });

  return pool;
}

async function ensureSchema() {
  if (schemaReadyPromise) return schemaReadyPromise;

  schemaReadyPromise = (async () => {
    const p = getPool();
    await p.query(`
      CREATE TABLE IF NOT EXISTS licenses (
        license TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        email TEXT,
        bound_domain TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  })();

  return schemaReadyPromise;
}

module.exports = async (req, res) => {
  const allowOrigin = getEnv("CORS_ALLOW_ORIGIN", "*");
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Lockin-Version");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, code: "METHOD_NOT_ALLOWED", message: "Method not allowed" }));
    return;
  }

  const rl = rateLimit(req, res);
  if (!rl.ok) return;

  try {
    await ensureSchema();
  } catch (err) {
    const code = err && err.code ? String(err.code) : "DB_ERROR";
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    const message =
      code === "MISSING_DATABASE_URL" && err && err.message
        ? String(err.message)
        : "Backend database is not configured";
    res.end(JSON.stringify({ ok: false, code, message }));
    return;
  }

  let body = null;
  try {
    body = await readJsonBody(req);
  } catch (_err) {
    body = null;
  }

  const license = typeof body?.license === "string" ? body.license.trim() : "";
  if (!license) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, code: "MISSING_LICENSE", message: "Missing license" }));
    return;
  }

  const origin = req.headers.origin;
  if (!origin) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, code: "MISSING_ORIGIN", message: "Missing Origin header" }));
    return;
  }

  let host;
  try {
    host = getHostFromOrigin(origin);
  } catch (_err) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, code: "INVALID_ORIGIN", message: "Invalid Origin header" }));
    return;
  }

  const autoBind = parseBool(getEnv("AUTO_BIND_DOMAIN", "true"), true);

  const p = getPool();

  let record;
  try {
    const result = await p.query(
      "SELECT license, status, email, bound_domain FROM licenses WHERE license = $1",
      [license]
    );
    record = result.rows[0] || null;
  } catch (_err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, code: "DB_ERROR", message: "Database query failed" }));
    return;
  }

  if (!record) {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, code: "LICENSE_NOT_FOUND", message: "Invalid license" }));
    return;
  }

  if (String(record.status).toUpperCase() !== "ACTIVE") {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, code: "LICENSE_INACTIVE", message: "Inactive license" }));
    return;
  }

  const bound = record.bound_domain ? String(record.bound_domain) : "";

  if (!bound) {
    if (!autoBind) {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: false, code: "LICENSE_NOT_BOUND", message: "License not bound to a domain" }));
      return;
    }

    try {
      const info = await p.query(
        "UPDATE licenses SET bound_domain = $1, updated_at = NOW() WHERE license = $2 AND (bound_domain IS NULL OR bound_domain = '')",
        [host, license]
      );
      const changed = (info.rowCount || 0) > 0;
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: true, license, domain: host, bound: changed }));
      return;
    } catch (_err) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: false, code: "DB_ERROR", message: "Database update failed" }));
      return;
    }
  }

  if (bound !== host) {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, code: "DOMAIN_MISMATCH", message: "License not valid for this domain" }));
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ ok: true, license, domain: host, bound: true }));
};
