/**
 * LockIn.page
 * Client-side page access gating script.
 *
 * Install (single tag):
 * <script
 *   src="https://receiptx.github.io/lockin-page/lockin.js"
 *   data-license="YOUR_LICENSE_KEY"
 *   data-password="YOUR_PASSWORD"
 *   data-text="Optional custom message">
 * </script>
 *
 * Notes:
 * - Intended for lightweight access control.
 * - Not a replacement for server-side authentication.
 * - No backend required.
 *
 * Upgrade points:
 * - Replace manual license allowlist with a remote license check.
 * - Add hash-based passwords / rate limiting / audit logging (requires backend).
 */
(function () {
  "use strict";

  // Prevent double-init if the script is included twice.
  if (window.__LOCKIN_PAGE_INITIALIZED__) return;
  window.__LOCKIN_PAGE_INITIALIZED__ = true;

  const PRODUCT_NAME = "LockIn.page";
  const OVERLAY_ID = "lockin-overlay";
  const STYLE_ID = "lockin-style";
  const LOCKED_CLASS = "lockin-locked";
  const VERSION = "1.0.0";

  /**
   * Manual license activation hook (no backend).
   *
   * How to use (seller-only): add active licenses here before publishing.
   * - If this allowlist is empty, the script runs in honor-mode (no enforcement).
   * - If it contains entries, `data-license` must be present and match.
   */
  const ACTIVE_LICENSES = new Set([
    // "LIC-123",
  ]);

  function fail(message, details) {
    try {
      const full = `${PRODUCT_NAME}: ${message}`;
      // Console for developers.
      console.error(full, details || "");
      // Visible message for page owners.
      alert(full);
    } catch (_err) {
      // If even alert fails, there's nothing else we can do.
    }
  }

  function getCurrentScript() {
    // document.currentScript is best, but fall back if running in unusual contexts.
    return document.currentScript || (function () {
      const scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1] || null;
    })();
  }

  function normalizeString(value) {
    if (typeof value !== "string") return "";
    return value.trim();
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.type = "text/css";
    style.textContent = `
      /* Hide page content while locked (overlay is outside <body>). */
      html.${LOCKED_CLASS} body { visibility: hidden !important; }
      html.${LOCKED_CLASS} { overflow: hidden !important; }

      /* Overlay */
      #${OVERLAY_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        background: #0b0f1a;
        color: #cbd5e1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }

      #${OVERLAY_ID} .lockin-card {
        width: 100%;
        max-width: 420px;
        background: #0f172a;
        border: 1px solid #1f2937;
        border-radius: 16px;
        padding: 18px 16px;
        box-sizing: border-box;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
      }

      #${OVERLAY_ID} .lockin-brand {
        display: inline-block;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #94a3b8;
        margin: 0 0 10px;
      }

      #${OVERLAY_ID} h2 {
        margin: 0 0 10px;
        color: #e5e7eb;
        font-size: 20px;
        line-height: 1.2;
      }

      #${OVERLAY_ID} .lockin-text {
        margin: 0 0 12px;
        color: #cbd5e1;
        font-size: 14px;
        line-height: 1.5;
      }

      #${OVERLAY_ID} .lockin-status {
        margin: 0 0 12px;
        color: #94a3b8;
        font-size: 13px;
        line-height: 1.4;
      }

      #${OVERLAY_ID} label {
        display: block;
        font-size: 13px;
        color: #94a3b8;
        margin: 0 0 6px;
      }

      #${OVERLAY_ID} input[type="password"] {
        width: 100%;
        box-sizing: border-box;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid #1f2937;
        background: #0b1220;
        color: #e5e7eb;
        outline: none;
        font-size: 14px;
      }

      #${OVERLAY_ID} input[type="password"]:focus {
        border-color: #22d3ee;
        box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15);
      }

      #${OVERLAY_ID} .lockin-actions {
        display: grid;
        gap: 10px;
        margin-top: 12px;
      }

      #${OVERLAY_ID} button {
        width: 100%;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid #22d3ee;
        background: #22d3ee;
        color: #0b0f1a;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
      }

      #${OVERLAY_ID} button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      #${OVERLAY_ID} button:hover {
        background: #60a5fa;
        border-color: #60a5fa;
      }

      #${OVERLAY_ID} .lockin-error {
        display: none;
        margin-top: 10px;
        font-size: 13px;
        color: #fca5a5;
      }

      #${OVERLAY_ID} .lockin-error[aria-hidden="false"] {
        display: block;
      }
    `;
    document.head.appendChild(style);
  }

  function setLocked(locked) {
    const root = document.documentElement;
    if (locked) root.classList.add(LOCKED_CLASS);
    else root.classList.remove(LOCKED_CLASS);
  }

  function removeExistingOverlay() {
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) existing.remove();
  }

  function createOverlay(customText) {
    removeExistingOverlay();

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", `${PRODUCT_NAME} Access Gate`);

    const card = document.createElement("div");
    card.className = "lockin-card";

    const brand = document.createElement("div");
    brand.className = "lockin-brand";
    brand.textContent = PRODUCT_NAME;

    const title = document.createElement("h2");
    title.textContent = "Private Page";

    const text = document.createElement("p");
    text.className = "lockin-text";
    text.textContent = customText || "Enter the password to continue.";

    const status = document.createElement("div");
    status.className = "lockin-status";
    status.textContent = "";

    const label = document.createElement("label");
    label.htmlFor = "lockin-password";
    label.textContent = "Password";

    const input = document.createElement("input");
    input.type = "password";
    input.id = "lockin-password";
    input.autocomplete = "current-password";
    input.inputMode = "text";
    input.placeholder = "Enter password";

    const actions = document.createElement("div");
    actions.className = "lockin-actions";

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Unlock";

    const error = document.createElement("div");
    error.className = "lockin-error";
    error.setAttribute("role", "alert");
    error.setAttribute("aria-hidden", "true");
    error.textContent = "Incorrect password";

    actions.appendChild(button);

    card.appendChild(brand);
    card.appendChild(title);
    card.appendChild(text);
    card.appendChild(status);
    card.appendChild(label);
    card.appendChild(input);
    card.appendChild(actions);
    card.appendChild(error);

    overlay.appendChild(card);

    // Append to <html> so `body { visibility:hidden }` does not hide the overlay.
    document.documentElement.appendChild(overlay);

    return { overlay, input, button, error, status };
  }

  function normalizeEndpoint(endpoint) {
    const trimmed = normalizeString(endpoint);
    if (!trimmed) return "";
    return trimmed.replace(/\/$/, "");
  }

  async function validateLicenseWithBackend({ endpoint, license }) {
    const url = `${endpoint}/v1/validate`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Lockin-Version": VERSION,
      },
      body: JSON.stringify({ license }),
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (_err) {
      payload = null;
    }

    if (!response.ok || !payload || payload.ok !== true) {
      const message = payload && payload.message ? String(payload.message) : "License validation failed";
      const code = payload && payload.code ? String(payload.code) : "VALIDATION_FAILED";
      const err = new Error(message);
      err.code = code;
      throw err;
    }

    return payload;
  }

  function run() {
    const scriptTag = getCurrentScript();
    if (!scriptTag) {
      fail("Unable to locate the current <script> tag.");
      return;
    }

    const license = normalizeString(scriptTag.getAttribute("data-license"));
    const password = normalizeString(scriptTag.getAttribute("data-password"));
    const customText = normalizeString(scriptTag.getAttribute("data-text"));
    const endpoint = normalizeEndpoint(scriptTag.getAttribute("data-endpoint"));

    if (!license) {
      fail("Missing data-license.");
      return;
    }
    if (!password) {
      fail("Missing data-password.");
      return;
    }

    // Manual license enforcement (optional).
    if (ACTIVE_LICENSES.size > 0 && !ACTIVE_LICENSES.has(license)) {
      fail("Invalid or inactive license key.", { license });
      return;
    }
    if (ACTIVE_LICENSES.size === 0) {
      // Honor-mode: no enforcement, but make it obvious for future upgrades.
      console.warn(`${PRODUCT_NAME}: License allowlist is empty (honor-mode).`);
    }

    ensureStyles();
    setLocked(true);

    const ui = createOverlay(customText);

    let licenseValidated = false;
    let validationPromise = null;

    function setStatus(message) {
      ui.status.textContent = message || "";
    }

    function showError(show) {
      ui.error.setAttribute("aria-hidden", show ? "false" : "true");
    }

    function setFormEnabled(enabled) {
      ui.input.disabled = !enabled;
      ui.button.disabled = !enabled;
    }

    async function ensureLicenseValidated() {
      if (!endpoint) {
        // No backend configured: keep current behavior.
        return { ok: true, mode: "no-backend" };
      }

      if (licenseValidated) return { ok: true, mode: "backend" };
      if (!validationPromise) {
        setFormEnabled(false);
        showError(false);
        setStatus("Verifying license...");
        validationPromise = validateLicenseWithBackend({ endpoint, license })
          .then((payload) => {
            licenseValidated = true;
            setStatus("License verified");
            setFormEnabled(true);
            return payload;
          })
          .catch((err) => {
            const msg = err && err.message ? String(err.message) : "License validation failed";
            ui.error.textContent = msg;
            showError(true);
            setStatus("License required");
            setFormEnabled(false);
            throw err;
          });
      }
      return validationPromise;
    }

    async function attemptUnlock() {
      try {
        await ensureLicenseValidated();
      } catch (_err) {
        return;
      }

      const entered = normalizeString(ui.input.value);
      if (entered === password) {
        showError(false);
        ui.overlay.remove();
        setLocked(false);
        return;
      }

      ui.error.textContent = "Incorrect password";
      showError(true);
      ui.input.focus();
      ui.input.select();
    }

    ui.button.addEventListener("click", attemptUnlock);
    ui.input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        attemptUnlock();
      }
    });

    // If backend is configured, validate immediately to enforce licensing.
    if (endpoint) {
      setFormEnabled(false);
      ensureLicenseValidated().catch(() => {
        // Error is displayed in the UI.
      });
    }

    // Focus management.
    setTimeout(function () {
      if (!ui.input.disabled) ui.input.focus();
    }, 0);
  }

  try {
    run();
  } catch (err) {
    fail("Unexpected error", err);
  }
})();
