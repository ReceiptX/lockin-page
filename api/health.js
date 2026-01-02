"use strict";

module.exports = (req, res) => {
  // Basic CORS for browser-based checks.
  const allowOrigin = process.env.CORS_ALLOW_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Lockin-Version");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, code: "METHOD_NOT_ALLOWED", message: "Method not allowed" }));
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ ok: true }));
};
