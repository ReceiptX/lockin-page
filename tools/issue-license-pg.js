"use strict";

const { Pool } = require("pg");

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

function randomKey() {
  // License template: LIC-XXXX-XXXX
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoids O/0 and I/1
  function chunk(n) {
    let out = "";
    for (let i = 0; i < n; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
  }
  return `LIC-${chunk(4)}-${chunk(4)}`;
}

async function main() {
  const email = getArg("--email");
  const status = (getArg("--status") || "ACTIVE").toUpperCase();
  const domain = getArg("--domain");

  if (!email) {
    // eslint-disable-next-line no-console
    console.error(
      "Usage: node tools/issue-license-pg.js --email buyer@email.com [--status ACTIVE|INACTIVE] [--domain example.com]"
    );
    process.exitCode = 1;
    return;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // eslint-disable-next-line no-console
    console.error("Missing DATABASE_URL");
    process.exitCode = 1;
    return;
  }

  const pool = new Pool({
    connectionString,
    ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS licenses (
        license TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        email TEXT,
        bound_domain TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    let license = null;
    for (let i = 0; i < 10; i += 1) {
      const candidate = randomKey();
      const exists = await pool.query("SELECT 1 FROM licenses WHERE license = $1", [candidate]);
      if (exists.rowCount === 0) {
        license = candidate;
        break;
      }
    }

    if (!license) throw new Error("Failed to generate unique license key");

    await pool.query(
      "INSERT INTO licenses (license, status, email, bound_domain) VALUES ($1, $2, $3, $4)",
      [license, status, email, domain || null]
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ license, status, email, domain: domain || null }, null, 2));
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
