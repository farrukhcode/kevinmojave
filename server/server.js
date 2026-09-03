import http from "node:http";
import { createReadStream, statSync, existsSync, readFileSync } from "node:fs";
import { join, normalize, extname, resolve } from "node:path";
import { randomBytes, createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

import { openDb, insertAppointment, listAppointments, updateAppointment, countsByStatus, audit, purgeOlderThan, STATUSES } from "./lib/db.js";
import { makeMailer } from "./lib/mail.js";
import { validateAppointment } from "./lib/validate.js";
import { json, readJson, clientIp, rateLimiter, esc, csvCell, timingSafeEqual } from "./lib/util.js";

const __dir = fileURLToPath(new URL(".", import.meta.url));
const env = process.env;

const PORT        = Number(env.PORT || 3000);
const HOST        = env.HOST || "0.0.0.0";                 // must be 0.0.0.0 inside Docker
const PUBLIC_DIR  = resolve(env.PUBLIC_DIR || join(__dir, "public"));
const DATA_DIR    = resolve(env.DATA_DIR || join(__dir, "data"));
const DB_FILE     = join(DATA_DIR, "mojave.db");
const TRUST_PROXY = env.TRUST_PROXY !== "false";           // Coolify/Traefik sits in front
const ADMIN_USER  = env.ADMIN_USER || "";
const ADMIN_PASS  = env.ADMIN_PASS || "";
const IP_SALT     = env.IP_SALT || randomBytes(16).toString("hex");
const RETAIN_DAYS = Number(env.RETAIN_DAYS || 0);

const log = {
  info:  (m) => console.log(`[${new Date().toISOString()}] INFO  ${m}`),
  warn:  (m) => console.warn(`[${new Date().toISOString()}] WARN  ${m}`),
  error: (m) => console.error(`[${new Date().toISOString()}] ERROR ${m}`),
};

const db = openDb(DB_FILE);
const mailer = makeMailer(env, log);
const limitPost  = rateLimiter({ windowMs: 60 * 60 * 1000, max: Number(env.RATE_LIMIT_PER_HOUR || 8) });
const limitAdmin = rateLimiter({ windowMs: 15 * 60 * 1000, max: 40 });

const hashIp = ip => createHash("sha256").update(IP_SALT + ip).digest("hex").slice(0, 16);
const makeRef = () => "MM-" + randomBytes(3).toString("hex").toUpperCase();

/* ------------------------------------------------------------------ static */
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8", ".webmanifest": "application/manifest+json",
};

function securityHeaders(res, { html = false } = {}) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=(), interest-cohort=()");
  if (env.HSTS !== "false") res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  if (html) {
    res.setHeader("Content-Security-Policy", [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data:",
      "connect-src 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join("; "));
  }
}

function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath.split("?")[0]);
  if (rel.endsWith("/")) rel += "index.html";
  const full = join(PUBLIC_DIR, normalize(rel).replace(/^(\.\.[/\\])+/, ""));
  if (!full.startsWith(PUBLIC_DIR)) { res.writeHead(403).end("Forbidden"); return true; }
  if (!existsSync(full) || !statSync(full).isFile()) return false;

  const st = statSync(full);
  const etag = `W/"${st.size}-${st.mtimeMs.toString(36)}"`;
  const ext = extname(full).toLowerCase();
  const isHtml = ext === ".html";
  securityHeaders(res, { html: isHtml });
  res.setHeader("ETag", etag);
  res.setHeader("Cache-Control", isHtml ? "no-cache" : "public, max-age=31536000, immutable");
  if (req.headers["if-none-match"] === etag) { res.writeHead(304).end(); return true; }
  res.writeHead(200, { "content-type": MIME[ext] || "application/octet-stream", "content-length": st.size });
  if (req.method === "HEAD") { res.end(); return true; }
  createReadStream(full).pipe(res);
  return true;
}

/* ------------------------------------------------------------------- admin */
function adminAuth(req, res) {
  if (!ADMIN_USER || !ADMIN_PASS) {
    json(res, 503, { error: "Admin is not configured. Set ADMIN_USER and ADMIN_PASS." });
    return null;
  }
  const ip = clientIp(req, TRUST_PROXY);
  if (!limitAdmin(ip).ok) { json(res, 429, { error: "Too many attempts. Try again later." }); return null; }

  const h = req.headers.authorization || "";
  if (h.startsWith("Basic ")) {
    const [u, ...rest] = Buffer.from(h.slice(6), "base64").toString("utf8").split(":");
    const p = rest.join(":");
    if (timingSafeEqual(u, ADMIN_USER) && timingSafeEqual(p, ADMIN_PASS)) return u;
  }
  res.writeHead(401, {
    "WWW-Authenticate": 'Basic realm="Mojave Medical admin", charset="UTF-8"',
    "content-type": "text/plain; charset=utf-8",
  }).end("Authentication required");
  return null;
}

const ADMIN_HTML = () => readFileSync(join(__dir, "admin.html"), "utf8");

/* ------------------------------------------------------------------ routes */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const path = url.pathname;
  const ip = clientIp(req, TRUST_PROXY);

  try {
    if (path === "/healthz") { securityHeaders(res); return json(res, 200, { ok: true, uptime: Math.round(process.uptime()), requests: db.prepare("SELECT COUNT(*) c FROM appointments").get().c }); }

    /* ---- public: create an appointment request ---- */
    if (path === "/api/appointments" && req.method === "POST") {
      securityHeaders(res);
      const rl = limitPost(ip);
      if (!rl.ok) return json(res, 429, { error: "Too many requests from this connection. Please call the office at (760) 688-0084." }, { "Retry-After": String(rl.retryAfter) });

      let body;
      try { body = await readJson(req); }
      catch (e) { return json(res, 400, { error: e.message }); }

      // Spam traps: a hidden field a human never fills, and a form that was submitted impossibly fast.
      if (body.company) { audit(db, { actor: "bot", action: "honeypot", ip_hash: hashIp(ip) }); return json(res, 200, { ok: true, ref: "MM-" + randomBytes(3).toString("hex").toUpperCase() }); }
      if (typeof body.elapsed_ms === "number" && body.elapsed_ms < 2500) return json(res, 400, { error: "That was too quick. Please try again." });

      const { ok, errors, value } = validateAppointment(body);
      if (!ok) return json(res, 422, { error: "Please check the highlighted fields.", errors });

      let ref, row, tries = 0;
      do { ref = makeRef(); tries++; } while (db.prepare("SELECT 1 FROM appointments WHERE ref = ?").get(ref) && tries < 8);

      row = insertAppointment(db, {
        ...value, ref, created_at: new Date().toISOString(), status: "new",
        source: String(body.source || "website").slice(0, 40),
        user_agent: String(req.headers["user-agent"] || "").slice(0, 200),
        ip_hash: hashIp(ip),
      });
      audit(db, { actor: "public", action: "create", appt_ref: ref, ip_hash: hashIp(ip) });
      log.info(`appointment request ${ref} (${value.visit_type})`);

      // Never let a mail failure lose the request; it is already committed.
      mailer.notifyStaff(row).catch(e => log.error("notifyStaff: " + e.message));
      mailer.confirmPatient(row).catch(e => log.error("confirmPatient: " + e.message));

      return json(res, 201, { ok: true, ref, message: "Request received. Our office will confirm within one business day." });
    }

    /* ---- admin ---- */
    if (path === "/admin" || path === "/admin/") {
      const who = adminAuth(req, res); if (!who) return;
      securityHeaders(res, { html: true });
      const html = ADMIN_HTML();
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      return res.end(html);
    }

    if (path === "/api/admin/appointments" && req.method === "GET") {
      const who = adminAuth(req, res); if (!who) return;
      securityHeaders(res);
      const rows = listAppointments(db, {
        status: url.searchParams.get("status") || "all",
        q: url.searchParams.get("q") || "",
        limit: Math.min(500, Number(url.searchParams.get("limit") || 200)),
      });
      return json(res, 200, { rows, counts: countsByStatus(db), statuses: STATUSES }, { "cache-control": "no-store" });
    }

    if (path.startsWith("/api/admin/appointments/") && req.method === "POST") {
      const who = adminAuth(req, res); if (!who) return;
      securityHeaders(res);
      const ref = decodeURIComponent(path.split("/").pop());
      let body; try { body = await readJson(req); } catch { return json(res, 400, { error: "invalid JSON" }); }
      const row = updateAppointment(db, ref, { status: body.status, staff_notes: body.staff_notes, actor: who });
      if (!row) return json(res, 404, { error: "Not found" });
      audit(db, { actor: who, action: "update", appt_ref: ref, detail: `status=${row.status}`, ip_hash: hashIp(ip) });
      return json(res, 200, { ok: true, row });
    }

    if (path === "/api/admin/export.csv") {
      const who = adminAuth(req, res); if (!who) return;
      securityHeaders(res);
      const rows = listAppointments(db, { status: url.searchParams.get("status") || "all", limit: 5000 });
      const cols = ["ref","created_at","status","visit_label","requested_date","requested_time","first_name","last_name","dob","phone","email","insurance","patient_status","referred_by","reason","lang","staff_notes"];
      const csv = [cols.join(","), ...rows.map(r => cols.map(c => csvCell(r[c])).join(","))].join("\r\n");
      audit(db, { actor: who, action: "export", detail: `${rows.length} rows`, ip_hash: hashIp(ip) });
      res.writeHead(200, {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="mojave-requests-${new Date().toISOString().slice(0, 10)}.csv"`,
        "cache-control": "no-store",
      });
      return res.end("﻿" + csv);
    }

    if (path === "/api/admin/audit" && req.method === "GET") {
      const who = adminAuth(req, res); if (!who) return;
      securityHeaders(res);
      return json(res, 200, { rows: db.prepare("SELECT * FROM audit_log ORDER BY at DESC LIMIT 200").all() }, { "cache-control": "no-store" });
    }

    /* ---- static site ---- */
    if (req.method === "GET" || req.method === "HEAD") {
      if (serveStatic(req, res, path)) return;
      // Single-page app fallback, but only for route-shaped paths. A request for a
      // missing *file* (/server.js, /data/mojave.db) must 404, not return the shell.
      const looksLikeFile = /\.[a-z0-9]{1,8}$/i.test(path);
      if (!path.startsWith("/api/") && !looksLikeFile && serveStatic(req, res, "/index.html")) return;
    }

    securityHeaders(res);
    return json(res, 404, { error: "Not found" });
  } catch (e) {
    log.error(`${req.method} ${path}: ${e.stack || e.message}`);
    if (!res.headersSent) json(res, 500, { error: "Server error" });
    else res.end();
  }
});

server.headersTimeout = 20000;
server.requestTimeout = 30000;

server.listen(PORT, HOST, async () => {
  log.info(`Mojave Medical server on http://${HOST}:${PORT}`);
  log.info(`static: ${PUBLIC_DIR}`);
  log.info(`data:   ${DB_FILE}`);
  if (!ADMIN_USER || !ADMIN_PASS) log.warn("ADMIN_USER/ADMIN_PASS not set - /admin is disabled");
  if (mailer.enabled) mailer.verify();
  if (RETAIN_DAYS > 0) {
    const purge = () => { const n = purgeOlderThan(db, RETAIN_DAYS); if (n) log.info(`retention: purged ${n} closed requests older than ${RETAIN_DAYS} days`); };
    purge(); setInterval(purge, 24 * 60 * 60 * 1000).unref();
  }
});

for (const sig of ["SIGTERM", "SIGINT"]) {
  process.on(sig, () => {
    log.info(`${sig} received, shutting down`);
    server.close(() => { try { db.close(); } catch {} process.exit(0); });
    setTimeout(() => process.exit(0), 8000).unref();
  });
}
