"use strict";

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) return xff.split(",")[0].trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

function createRateLimiter({ windowMs, max }) {
  const buckets = new Map();

  return function rateLimit(req, res) {
    const ip = getClientIp(req);
    const now = Date.now();
    const bucket = buckets.get(ip);

    if (!bucket || now >= bucket.resetAt) {
      buckets.set(ip, { count: 1, resetAt: now + windowMs });
      return { ok: true };
    }

    bucket.count += 1;
    if (bucket.count > max) {
      res.statusCode = 429;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: false, code: "RATE_LIMITED", message: "Too many requests" }));
      return { ok: false };
    }

    return { ok: true };
  };
}

module.exports = { createRateLimiter };
