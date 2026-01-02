"use strict";

const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

function getEnv(name, fallback) {
  const value = process.env[name];
  return value == null || value === "" ? fallback : value;
}

function createDb() {
  const dbPath = getEnv("DB_PATH", "./data/lockin.db");
  const absPath = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath);

  fs.mkdirSync(path.dirname(absPath), { recursive: true });

  const db = new Database(absPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS licenses (
      license TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      email TEXT,
      bound_domain TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return db;
}

module.exports = {
  createDb,
};
