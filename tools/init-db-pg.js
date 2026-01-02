"use strict";

const { Pool } = require("pg");
const { resolveDatabaseUrl } = require("./dbUrl");

async function main() {
  const connectionString = resolveDatabaseUrl();
  if (!connectionString) {
    // eslint-disable-next-line no-console
    console.error("Missing database URL. Set DATABASE_URL or POSTGRES_URL.");
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

    // eslint-disable-next-line no-console
    console.log("ok");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
