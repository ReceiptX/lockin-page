"use strict";

require("dotenv").config();

const express = require("express");
const helmet = require("helmet");

const { createDb } = require("./db");
const { createLicenseStore } = require("./licenseStore");

function getEnv(name, fallback) {
  const value = process.env[name];
  return value == null || value === "" ? fallback : value;
}

function parseBool(value, fallback) {
  if (value == null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
}

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) return xff.split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

function createRateLimiter({ windowMs, max }) {
  const buckets = new Map();

  return function rateLimit(req, res, next) {
    const ip = getClientIp(req);
    const now = Date.now();
    const bucket = buckets.get(ip);

    if (!bucket || now >= bucket.resetAt) {
      buckets.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > max) {
      res.status(429).json({ ok: false, code: "RATE_LIMITED", message: "Too many requests" });
      return;
    }

    return next();
  };
}

function getHostFromOrigin(origin) {
  const url = new URL(origin);
  return url.host;
}

const app = express();
app.disable("x-powered-by");

app.use(helmet());
app.use(express.json({ limit: "32kb" }));

const corsAllowOrigin = getEnv("CORS_ALLOW_ORIGIN", "*");
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", corsAllowOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Lockin-Version");
  res.setHeader("Vary", "Origin");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

const windowMs = Number(getEnv("RATE_LIMIT_WINDOW_MS", "60000"));
const max = Number(getEnv("RATE_LIMIT_MAX", "120"));
app.use(createRateLimiter({ windowMs, max }));

const db = createDb();
const store = createLicenseStore(db);

const autoBind = parseBool(getEnv("AUTO_BIND_DOMAIN", "true"), true);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/v1/validate", (req, res) => {
  const license = typeof req.body?.license === "string" ? req.body.license.trim() : "";
  if (!license) {
    res.status(400).json({ ok: false, code: "MISSING_LICENSE", message: "Missing license" });
    return;
  }

  const origin = req.headers.origin;
  if (!origin) {
    res.status(400).json({ ok: false, code: "MISSING_ORIGIN", message: "Missing Origin header" });
    return;
  }

  let host;
  try {
    host = getHostFromOrigin(origin);
  } catch (_err) {
    res.status(400).json({ ok: false, code: "INVALID_ORIGIN", message: "Invalid Origin header" });
    return;
  }

  const record = store.get(license);
  if (!record) {
    res.status(403).json({ ok: false, code: "LICENSE_NOT_FOUND", message: "Invalid license" });
    return;
  }

  if (String(record.status).toUpperCase() !== "ACTIVE") {
    res.status(403).json({ ok: false, code: "LICENSE_INACTIVE", message: "Inactive license" });
    return;
  }

  const bound = record.bound_domain ? String(record.bound_domain) : "";
  if (!bound) {
    if (autoBind) {
      store.bindIfEmpty(license, host);
      res.json({ ok: true, license, domain: host, bound: true });
      return;
    }

    res.status(403).json({ ok: false, code: "LICENSE_NOT_BOUND", message: "License not bound to a domain" });
    return;
  }

  if (bound !== host) {
    res.status(403).json({ ok: false, code: "DOMAIN_MISMATCH", message: "License not valid for this domain" });
    return;
  }

  res.json({ ok: true, license, domain: host, bound: true });
});

const port = Number(getEnv("PORT", "8787"));
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`LockIn.page backend listening on http://localhost:${port}`);
});
