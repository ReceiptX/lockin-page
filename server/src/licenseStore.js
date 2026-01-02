"use strict";

function nowIso() {
  return new Date().toISOString();
}

function createLicenseStore(db) {
  const insertStmt = db.prepare(
    "INSERT INTO licenses (license, status, email, bound_domain, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const getStmt = db.prepare("SELECT license, status, email, bound_domain FROM licenses WHERE license = ?");

  const bindStmt = db.prepare(
    "UPDATE licenses SET bound_domain = ?, updated_at = ? WHERE license = ? AND (bound_domain IS NULL OR bound_domain = '')"
  );

  return {
    get(licenseKey) {
      return getStmt.get(licenseKey);
    },

    insert({ license, status, email, bound_domain }) {
      const ts = nowIso();
      insertStmt.run(license, status, email || null, bound_domain || null, ts, ts);
      return { license, status, email: email || null, bound_domain: bound_domain || null };
    },

    bindIfEmpty(licenseKey, domain) {
      const ts = nowIso();
      const info = bindStmt.run(domain, ts, licenseKey);
      return info.changes > 0;
    },
  };
}

module.exports = {
  createLicenseStore,
};
