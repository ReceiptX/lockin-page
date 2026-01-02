"use strict";

require("dotenv").config();

const crypto = require("crypto");
const { createDb } = require("../src/db");
const { createLicenseStore } = require("../src/licenseStore");

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
    for (let i = 0; i < n; i += 1) {
      out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return out;
  }
  return `LIC-${chunk(4)}-${chunk(4)}`;
}

function main() {
  const email = getArg("--email");
  const status = (getArg("--status") || "ACTIVE").toUpperCase();
  const domain = getArg("--domain");

  if (!email) {
    // eslint-disable-next-line no-console
    console.error("Usage: node tools/issue-license.js --email buyer@email.com [--status ACTIVE|INACTIVE] [--domain example.com]");
    process.exitCode = 1;
    return;
  }

  const db = createDb();
  const store = createLicenseStore(db);

  // Try a few times to avoid collisions.
  let license = null;
  for (let i = 0; i < 10; i += 1) {
    const candidate = randomKey();
    if (!store.get(candidate)) {
      license = candidate;
      break;
    }
  }

  if (!license) {
    throw new Error("Failed to generate unique license key");
  }

  store.insert({ license, status, email, bound_domain: domain || null });

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ license, status, email, domain: domain || null }, null, 2));
}

try {
  main();
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
}
