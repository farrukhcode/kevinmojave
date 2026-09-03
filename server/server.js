import http from "node:http";
import { createReadStream, statSync, existsSync, readFileSync } from "node:fs";
import { join, normalize, extname, resolve, sep } from "node:path";
import { randomBytes, createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

import {
  openDb, insertAppointment, listAppointments, updateAppointment, countsByStatus,
  audit, purgeOlderThan, STATUSES,
} from "./lib/db.js";
import {
  getSettings, setSettings, listRules, replaceRules, listOverrides, saveOverride, deleteOverride,
  listBlocks, createBlock, deleteBlock, slotsFor, slotIsOpen, availability, busyOn,
  tzToday, addDays, daysBetween, isYmd, minOf, hhmm,
} from "./lib/schedule.js";
import { makeMailer } from "./lib/mail.js";
import { validateAppointment, VISIT_TYPES } from "./lib/validate.js";
import { json, readJson, clientIp, rateLimiter, csvCell, timingSafeEqual } from "./lib/util.js";
import { makeSessions, parseCookies, cookie, sameOrigin, loginGuard, s as str, int } from "./lib/security.js";

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
const SITE_HOST   = (env.SITE_HOST || "").toLowerCase();
const SECURE_COOKIE = env.SECURE_COOKIE ? env.SECURE_COOKIE === "true" : env.NODE_ENV !== "development";

// Sessions survive a restart without a session table: the key is derived from secrets the
// operator already sets. Changing ADMIN_PASS therefore signs everyone out, which is right.
const SESSION_SECRET = env.SESSION_SECRET ||
  createHash("sha256").update("mm-session|" + ADMIN_PASS + "|" + IP_SALT).digest("hex");

const log = {
  info:  (m) => console.log(`[${new Date().toISOString()}] INFO  ${m}`),
  warn:  (m) => console.warn(`[${new Date().toISOString()}] WARN  ${m}`),
  error: (m) => console.error(`[${new Date().toISOString()}] ERROR ${m}`),
};

const db = openDb(DB_FILE);
const mailer = makeMailer(env, log);
const sessions = makeSessions(SESSION_SECRET, { ttlHours: Number(env.SESSION_HOURS || 8) });
const guard = loginGuard({ max: Number(env.LOGIN_ATTEMPTS || 8) });

const limitPost      = rateLimiter({ windowMs: 60 * 60 * 1000, max: Number(env.RATE_LIMIT_PER_HOUR || 8) });
const limitAvail     = rateLimiter({ windowMs: 5 * 60 * 1000, max: Number(env.RATE_LIMIT_AVAILABILITY || 120) });
const limitAdminApi  = rateLimiter({ windowMs: 5 * 60 * 1000, max: 400 });

const ALLOWED_HOSTS = new Set(
  [SITE_HOST, SITE_HOST && "www." + SITE_HOST, "localhost", "127.0.0.1", `localhost:${PORT}`, `127.0.0.1:${PORT}`]
    .filter(Boolean)
);

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
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()");
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
      "frame-ancestors 'none'",
      "base-uri 'none'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "));
  }
}

function serveStatic(req, res, urlPath) {
  let rel;
  try { rel = decodeURIComponent(urlPath.split("?")[0]); } catch { return false; }
  if (rel.includes("\0")) return false;
  if (rel.endsWith("/")) rel += "index.html";
  const full = join(PUBLIC_DIR, normalize(rel).replace(/^(\.\.[/\\])+/, ""));
  // startsWith alone would also accept a sibling directory named "public-old".
  if (full !== PUBLIC_DIR && !full.startsWith(PUBLIC_DIR + sep)) { res.writeHead(403).end("Forbidden"); return true; }
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
const configured = () => !!(ADMIN_USER && ADMIN_PASS);

/** Returns { user, csrf } for a signed session, or a Basic-auth user, else null. */
function identify(req) {
  if (!configured()) return null;
  const c = parseCookies(req.headers.cookie);
  if (c.mm_sess) {
    const sess = sessions.verify(c.mm_sess);
    if (sess && timingSafeEqual(sess.user, ADMIN_USER)) return { user: sess.user, csrf: sess.csrf, via: "session" };
  }
  const h = req.headers.authorization || "";
  if (h.startsWith("Basic ")) {
    const [u, ...rest] = Buffer.from(h.slice(6), "base64").toString("utf8").split(":");
    if (timingSafeEqual(u, ADMIN_USER) && timingSafeEqual(rest.join(":"), ADMIN_PASS)) return { user: u, via: "basic" };
  }
  return null;
}

/**
 * Gate for every /api/admin route. Order matters: configuration, then rate limit, then
 * identity, then CSRF for anything that writes.
 */
function requireAdmin(req, res, ip, { write = false } = {}) {
  if (!configured()) { json(res, 503, { error: "Admin is not configured. Set ADMIN_USER and ADMIN_PASS." }); return null; }
  if (!limitAdminApi(ip).ok) { json(res, 429, { error: "Too many requests." }); return null; }

  const who = identify(req);
  if (!who) { json(res, 401, { error: "Sign in required." }, { "cache-control": "no-store" }); return null; }

  if (write) {
    if (!sameOrigin(req, ALLOWED_HOSTS)) {
      audit(db, { actor: who.user, action: "csrf_blocked", detail: str(req.headers.origin || req.headers.referer, 120), ip_hash: hashIp(ip) });
      json(res, 403, { error: "Cross-site request blocked." });
      return null;
    }
    // A session in a browser must also present the token; a Basic-auth API client cannot
    // be driven from another site because of the check above.
    if (who.via === "session" && req.headers["x-csrf-token"] !== who.csrf) {
      json(res, 403, { error: "Stale session. Reload the page and try again." });
      return null;
    }
  }
  return who;
}

const ADMIN_HTML = readFileSync(join(__dir, "admin.html"), "utf8");

/* ------------------------------------------------------------------ helpers */
const wantsJson = req => String(req.headers["content-type"] || "").toLowerCase().includes("application/json");

const dayView = (date) => {
  const S = getSettings(db);
  const busy = busyOn(db, date);
  const { closed, slots } = slotsFor(db, date, { settings: S, busy, ignoreLead: true });
  const rows = db.prepare(
    `SELECT ref,status,requested_time,duration_min,first_name,last_name,phone,email,visit_label,staff_notes,created_at
     FROM appointments WHERE requested_date = ? AND status NOT IN ('declined','spam')
     ORDER BY requested_time`).all(date);
  return {
    date, closed, slots, settings: S,
    appointments: rows,
    blocks: listBlocks(db, date, date),
    override: listOverrides(db, date).find(o => o.date === date) || null,
  };
};

/* ------------------------------------------------------------------ routes */
const server = http.createServer(async (req, res) => {
  let url;
  try { url = new URL(req.url, `http://${req.headers.host || "localhost"}`); }
  catch { res.writeHead(400).end("Bad request"); return; }
  const path = url.pathname;
  const ip = clientIp(req, TRUST_PROXY);
  const q = k => str(url.searchParams.get(k), 120);

  try {
    if (path === "/healthz") {
      securityHeaders(res);
      return json(res, 200, {
        ok: true,
        uptime: Math.round(process.uptime()),
        requests: db.prepare("SELECT COUNT(*) c FROM appointments").get().c,
      }, { "cache-control": "no-store" });
    }

    /* Every write in the app is JSON over POST. Rejecting anything else up front removes
       the classic cross-site form attack, which can only send urlencoded or multipart. */
    if (req.method !== "GET" && req.method !== "HEAD" && path.startsWith("/api/")) {
      if (req.method !== "POST") { securityHeaders(res); return json(res, 405, { error: "Method not allowed" }, { allow: "GET, POST" }); }
      if (!wantsJson(req)) { securityHeaders(res); return json(res, 415, { error: "Send application/json" }); }
      if (!sameOrigin(req, ALLOWED_HOSTS)) {
        securityHeaders(res);
        audit(db, { actor: "anon", action: "csrf_blocked", detail: `${path} from ${str(req.headers.origin || req.headers.referer, 100) || "unknown"}`, ip_hash: hashIp(ip) });
        return json(res, 403, { error: "Cross-site request blocked." });
      }
    }

    /* ---- public: availability the booking calendar draws from ---- */
    if (path === "/api/availability" && (req.method === "GET" || req.method === "HEAD")) {
      securityHeaders(res);
      if (!limitAvail(ip).ok) return json(res, 429, { error: "Too many requests." });
      const vt = q("visit_type");
      return json(res, 200, availability(db, {
        from: q("from"), to: q("to"),
        visitType: Object.hasOwn(VISIT_TYPES, vt) ? vt : null,
      }), { "cache-control": "no-store" });
    }

    /* ---- public: create an appointment request ---- */
    if (path === "/api/appointments" && req.method === "POST") {
      securityHeaders(res);
      const rl = limitPost(ip);
      if (!rl.ok) return json(res, 429, { error: "Too many requests from this connection. Please call the office at (760) 688-0084." }, { "Retry-After": String(rl.retryAfter) });

      let body;
      try { body = await readJson(req); }
      catch (e) { return json(res, 400, { error: e.message }); }
      if (!body || typeof body !== "object" || Array.isArray(body)) return json(res, 400, { error: "Invalid request" });

      if (typeof body.elapsed_ms === "number" && body.elapsed_ms >= 0 && body.elapsed_ms < 2500) {
        return json(res, 400, { error: "That was too quick. Please try again." });
      }

      const { ok, errors, value } = validateAppointment(body);
      if (!ok) return json(res, 422, { error: "Please check the highlighted fields.", errors });

      /* The spam trap flags, it never deletes. A hidden field can be filled by a password
         manager or an autofill profile as easily as by a bot, and a request silently
         thrown away is a patient who thinks they have an appointment. Suspected spam is
         stored with status 'spam' so it is one click away in the dashboard. */
      const trapped = !!str(body.mm_ref_code, 100);

      let row, ref;
      db.exec("BEGIN IMMEDIATE");
      try {
        // Re-check the slot inside the transaction so two people cannot take the same time.
        if (value.requested_date && value.requested_time && !trapped) {
          if (!slotIsOpen(db, value.requested_date, value.requested_time, value.visit_type)) {
            db.exec("ROLLBACK");
            return json(res, 409, {
              error: "That time was just taken. Please choose another.",
              code: "slot_taken",
              date: value.requested_date,
            });
          }
        }
        let tries = 0;
        do { ref = makeRef(); tries++; } while (db.prepare("SELECT 1 FROM appointments WHERE ref = ?").get(ref) && tries < 8);
        row = insertAppointment(db, {
          ...value, ref, created_at: new Date().toISOString(),
          status: trapped ? "spam" : "new",
          source: str(body.source, 40) || "website",
          user_agent: str(req.headers["user-agent"], 200),
          ip_hash: hashIp(ip),
        });
        db.exec("COMMIT");
      } catch (e) {
        try { db.exec("ROLLBACK"); } catch {}
        throw e;
      }

      audit(db, { actor: "public", action: trapped ? "create_flagged_spam" : "create", appt_ref: ref, detail: `${value.visit_type} ${value.requested_date || "-"} ${value.requested_time || "-"}`, ip_hash: hashIp(ip) });
      log.info(`appointment request ${ref} (${value.visit_type})${trapped ? " [flagged as spam]" : ""}`);

      if (!trapped) {
        // Never let a mail failure lose the request; it is already committed.
        mailer.notifyStaff(row).catch(e => log.error("notifyStaff: " + e.message));
        mailer.confirmPatient(row).catch(e => log.error("confirmPatient: " + e.message));
      }

      return json(res, 201, { ok: true, ref, message: "Request received. Our office will confirm within one business day." });
    }

    /* ---- admin session ---- */
    if (path === "/api/admin/login" && req.method === "POST") {
      securityHeaders(res);
      if (!configured()) return json(res, 503, { error: "Admin is not configured." });
      const g = guard.check(ip);
      if (!g.ok) {
        audit(db, { actor: "anon", action: "login_locked", ip_hash: hashIp(ip) });
        return json(res, 429, { error: `Too many attempts. Try again in ${Math.ceil(g.retryAfter / 60)} minutes.` }, { "Retry-After": String(g.retryAfter) });
      }
      let body; try { body = await readJson(req, 4096); } catch { return json(res, 400, { error: "Invalid request" }); }
      const okUser = timingSafeEqual(str(body.user, 100), ADMIN_USER);
      const okPass = timingSafeEqual(str(body.pass, 200), ADMIN_PASS);
      if (!okUser || !okPass) {
        const n = guard.fail(ip);
        audit(db, { actor: str(body.user, 40) || "anon", action: "login_failed", detail: `attempt ${n}`, ip_hash: hashIp(ip) });
        log.warn(`failed admin login from ${hashIp(ip)}`);
        return json(res, 401, { error: "Wrong username or password." });
      }
      guard.succeed(ip);
      const sess = sessions.issue(ADMIN_USER);
      audit(db, { actor: ADMIN_USER, action: "login", ip_hash: hashIp(ip) });
      return json(res, 200, { ok: true, user: ADMIN_USER, csrf: sess.csrf }, {
        "set-cookie": cookie("mm_sess", sess.token, { maxAge: sess.maxAge, secure: SECURE_COOKIE }),
        "cache-control": "no-store",
      });
    }

    if (path === "/api/admin/logout" && req.method === "POST") {
      securityHeaders(res);
      const who = identify(req);
      if (who) audit(db, { actor: who.user, action: "logout", ip_hash: hashIp(ip) });
      return json(res, 200, { ok: true }, { "set-cookie": cookie("mm_sess", "", { clear: true, secure: SECURE_COOKIE }), "cache-control": "no-store" });
    }

    if (path === "/api/admin/session" && req.method === "GET") {
      securityHeaders(res);
      if (!configured()) return json(res, 503, { error: "Admin is not configured. Set ADMIN_USER and ADMIN_PASS." });
      const who = identify(req);
      if (!who) return json(res, 401, { error: "Sign in required." }, { "cache-control": "no-store" });
      return json(res, 200, { user: who.user, csrf: who.csrf || null, tz: getSettings(db).timezone }, { "cache-control": "no-store" });
    }

    /* ---- admin page ---- */
    if (path === "/admin" || path === "/admin/") {
      securityHeaders(res, { html: true });
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex, nofollow, noarchive",
      });
      return res.end(req.method === "HEAD" ? "" : ADMIN_HTML);
    }

    /* ---- admin: requests ---- */
    if (path === "/api/admin/appointments" && req.method === "GET") {
      const who = requireAdmin(req, res, ip); if (!who) return;
      securityHeaders(res);
      const status = q("status");
      const rows = listAppointments(db, {
        status: STATUSES.includes(status) ? status : "all",
        q: q("q"),
        limit: int(url.searchParams.get("limit"), 1, 500, 200),
      });
      return json(res, 200, { rows, counts: countsByStatus(db), statuses: STATUSES }, { "cache-control": "no-store" });
    }

    if (path === "/api/admin/appointments" && req.method === "POST") {
      /* Staff booking a visit taken over the phone. It is stored as a real appointment so
         it holds its slot against the public calendar. */
      const who = requireAdmin(req, res, ip, { write: true }); if (!who) return;
      securityHeaders(res);
      let body; try { body = await readJson(req); } catch { return json(res, 400, { error: "Invalid JSON" }); }
      const { ok, errors, value } = validateAppointment({ ...body, consent: true });
      if (!ok) return json(res, 422, { error: "Please check the fields.", errors });

      let ref, row;
      db.exec("BEGIN IMMEDIATE");
      try {
        if (value.requested_date && value.requested_time && !body.force) {
          if (!slotIsOpen(db, value.requested_date, value.requested_time, value.visit_type, { ignoreLead: true })) {
            db.exec("ROLLBACK");
            return json(res, 409, { error: "That time is already taken. Send force:true to double-book.", code: "slot_taken" });
          }
        }
        let tries = 0;
        do { ref = makeRef(); tries++; } while (db.prepare("SELECT 1 FROM appointments WHERE ref = ?").get(ref) && tries < 8);
        row = insertAppointment(db, {
          ...value, ref, created_at: new Date().toISOString(), status: "scheduled",
          source: "staff", user_agent: null, ip_hash: null,
        });
        db.exec("COMMIT");
      } catch (e) { try { db.exec("ROLLBACK"); } catch {} throw e; }

      audit(db, { actor: who.user, action: "create_staff", appt_ref: ref, detail: `${value.requested_date || "-"} ${value.requested_time || "-"}`, ip_hash: hashIp(ip) });
      return json(res, 201, { ok: true, row });
    }

    if (path.startsWith("/api/admin/appointments/") && req.method === "POST") {
      const who = requireAdmin(req, res, ip, { write: true }); if (!who) return;
      securityHeaders(res);
      let ref; try { ref = decodeURIComponent(path.slice("/api/admin/appointments/".length)); } catch { return json(res, 400, { error: "Bad reference" }); }
      if (!/^[A-Za-z0-9-]{1,40}$/.test(ref)) return json(res, 400, { error: "Bad reference" });

      let body; try { body = await readJson(req); } catch { return json(res, 400, { error: "Invalid JSON" }); }

      const patch = { actor: who.user };
      if (body.status !== undefined) {
        if (!STATUSES.includes(body.status)) return json(res, 422, { error: "Unknown status" });
        patch.status = body.status;
      }
      if (body.staff_notes !== undefined) patch.staff_notes = str(body.staff_notes, 2000);

      // Rescheduling moves the hold with the appointment.
      if (body.requested_date !== undefined || body.requested_time !== undefined) {
        const cur = db.prepare("SELECT * FROM appointments WHERE ref = ?").get(ref);
        if (!cur) return json(res, 404, { error: "Not found" });
        const date = body.requested_date === undefined ? cur.requested_date : (str(body.requested_date, 10) || null);
        const time = body.requested_time === undefined ? cur.requested_time : (str(body.requested_time, 8) || null);
        if (date && !isYmd(date)) return json(res, 422, { error: "Invalid date" });
        if (time && minOf(time) == null) return json(res, 422, { error: "Invalid time" });
        if (date && time && !body.force &&
            !slotIsOpen(db, date, time, cur.visit_type, { excludeRef: ref, ignoreLead: true })) {
          return json(res, 409, { error: "That time is already taken. Send force:true to double-book.", code: "slot_taken" });
        }
        patch.requested_date = date;
        patch.requested_time = time;
      }

      const row = updateAppointment(db, ref, patch);
      if (!row) return json(res, 404, { error: "Not found" });
      audit(db, {
        actor: who.user, action: "update", appt_ref: ref,
        detail: [patch.status && `status=${row.status}`,
                 patch.requested_date !== undefined && `when=${row.requested_date || "-"} ${row.requested_time || "-"}`,
                 patch.staff_notes !== undefined && "notes edited"].filter(Boolean).join(" "),
        ip_hash: hashIp(ip),
      });
      return json(res, 200, { ok: true, row });
    }

    /* ---- admin: schedule ---- */
    if (path === "/api/admin/schedule" && req.method === "GET") {
      const who = requireAdmin(req, res, ip); if (!who) return;
      securityHeaders(res);
      const S = getSettings(db);
      const from = tzToday(S.timezone);
      return json(res, 200, {
        settings: S,
        rules: listRules(db),
        overrides: listOverrides(db, from),
        blocks: listBlocks(db, from, addDays(from, S.horizon_days + 30)),
        visit_types: Object.entries(VISIT_TYPES).map(([id, v]) => ({ id, ...v })),
        today: from,
      }, { "cache-control": "no-store" });
    }

    if (path === "/api/admin/schedule/rules" && req.method === "POST") {
      const who = requireAdmin(req, res, ip, { write: true }); if (!who) return;
      securityHeaders(res);
      let body; try { body = await readJson(req, 64 * 1024); } catch { return json(res, 400, { error: "Invalid JSON" }); }
      if (!Array.isArray(body.rules) || body.rules.length > 60) return json(res, 422, { error: "Send up to 60 windows." });
      const rules = replaceRules(db, body.rules);
      audit(db, { actor: who.user, action: "schedule_rules", detail: `${rules.length} windows`, ip_hash: hashIp(ip) });
      return json(res, 200, { ok: true, rules });
    }

    if (path === "/api/admin/schedule/settings" && req.method === "POST") {
      const who = requireAdmin(req, res, ip, { write: true }); if (!who) return;
      securityHeaders(res);
      let body; try { body = await readJson(req, 8192); } catch { return json(res, 400, { error: "Invalid JSON" }); }
      const tz = str(body.timezone, 60);
      if (tz) { try { new Intl.DateTimeFormat("en-CA", { timeZone: tz }); } catch { return json(res, 422, { error: "Unknown time zone" }); } }
      const S = setSettings(db, {
        timezone: tz || undefined,
        lead_hours: body.lead_hours === undefined ? undefined : int(body.lead_hours, 0, 720, 2),
        horizon_days: body.horizon_days === undefined ? undefined : int(body.horizon_days, 1, 365, 60),
        slot_min: body.slot_min === undefined ? undefined : int(body.slot_min, 5, 240, 30),
      });
      audit(db, { actor: who.user, action: "schedule_settings", detail: `lead=${S.lead_hours}h horizon=${S.horizon_days}d`, ip_hash: hashIp(ip) });
      return json(res, 200, { ok: true, settings: S });
    }

    if (path === "/api/admin/schedule/override" && req.method === "POST") {
      const who = requireAdmin(req, res, ip, { write: true }); if (!who) return;
      securityHeaders(res);
      let body; try { body = await readJson(req, 16 * 1024); } catch { return json(res, 400, { error: "Invalid JSON" }); }
      const date = str(body.date, 10);
      if (!isYmd(date)) return json(res, 422, { error: "Invalid date" });
      if (body.op === "delete") {
        deleteOverride(db, date);
        audit(db, { actor: who.user, action: "override_delete", detail: date, ip_hash: hashIp(ip) });
        return json(res, 200, { ok: true });
      }
      if (Array.isArray(body.windows) && body.windows.length > 12) return json(res, 422, { error: "Too many windows" });
      try { saveOverride(db, { date, closed: !!body.closed, windows: body.windows, note: str(body.note, 200) }); }
      catch (e) { return json(res, 422, { error: e.message }); }
      audit(db, { actor: who.user, action: "override_save", detail: `${date} ${body.closed ? "closed" : "custom hours"}`, ip_hash: hashIp(ip) });
      return json(res, 200, { ok: true, override: listOverrides(db, date).find(o => o.date === date) || null });
    }

    if (path === "/api/admin/blocks" && req.method === "POST") {
      const who = requireAdmin(req, res, ip, { write: true }); if (!who) return;
      securityHeaders(res);
      let body; try { body = await readJson(req, 16 * 1024); } catch { return json(res, 400, { error: "Invalid JSON" }); }
      if (body.op === "delete") {
        const id = int(body.id, 1, 2 ** 31, null);
        if (id == null) return json(res, 422, { error: "Invalid id" });
        const gone = deleteBlock(db, id);
        audit(db, { actor: who.user, action: "block_delete", detail: `#${id}`, ip_hash: hashIp(ip) });
        return json(res, gone ? 200 : 404, gone ? { ok: true } : { error: "Not found" });
      }
      let block;
      try {
        block = createBlock(db, {
          kind: body.kind, start_date: str(body.start_date, 10), end_date: str(body.end_date, 10),
          all_day: !!body.all_day, start_time: str(body.start_time, 5), end_time: str(body.end_time, 5),
          start_min: typeof body.start_min === "number" ? int(body.start_min, 0, 1440, null) : undefined,
          end_min: typeof body.end_min === "number" ? int(body.end_min, 0, 1440, null) : undefined,
          title: str(body.title, 120), note: str(body.note, 500),
          patient_name: str(body.patient_name, 120), patient_phone: str(body.patient_phone, 40),
          visit_label: str(body.visit_label, 80),
        }, who.user);
      } catch (e) { return json(res, 422, { error: e.message }); }
      audit(db, { actor: who.user, action: "block_create", detail: `${block.kind} ${block.start_date}${block.all_day ? " all day" : " " + hhmm(block.start_min) + "-" + hhmm(block.end_min)}`, ip_hash: hashIp(ip) });
      return json(res, 201, { ok: true, block });
    }

    if (path === "/api/admin/day" && req.method === "GET") {
      const who = requireAdmin(req, res, ip); if (!who) return;
      securityHeaders(res);
      const S = getSettings(db);
      const date = isYmd(q("date")) ? q("date") : tzToday(S.timezone);
      return json(res, 200, dayView(date), { "cache-control": "no-store" });
    }

    if (path === "/api/admin/agenda" && req.method === "GET") {
      const who = requireAdmin(req, res, ip); if (!who) return;
      securityHeaders(res);
      const S = getSettings(db);
      const from = isYmd(q("from")) ? q("from") : tzToday(S.timezone);
      let to = isYmd(q("to")) ? q("to") : addDays(from, 13);
      if (daysBetween(from, to) > 92) to = addDays(from, 92);
      if (daysBetween(from, to) < 0) to = from;
      const rows = db.prepare(
        `SELECT ref,status,requested_date,requested_time,duration_min,first_name,last_name,phone,visit_label,source
         FROM appointments
         WHERE requested_date BETWEEN ? AND ? AND status NOT IN ('declined','spam')
         ORDER BY requested_date, requested_time`).all(from, to);
      return json(res, 200, { from, to, appointments: rows, blocks: listBlocks(db, from, to), tz: S.timezone }, { "cache-control": "no-store" });
    }

    /* ---- admin: export and audit ---- */
    if (path === "/api/admin/export.csv" && (req.method === "GET" || req.method === "HEAD")) {
      const who = requireAdmin(req, res, ip); if (!who) return;
      securityHeaders(res);
      const status = q("status");
      const rows = listAppointments(db, { status: STATUSES.includes(status) ? status : "all", limit: 5000 });
      const cols = ["ref","created_at","status","visit_label","requested_date","requested_time","first_name","last_name","dob","phone","email","insurance","patient_status","referred_by","reason","lang","staff_notes"];
      const csv = [cols.join(","), ...rows.map(r => cols.map(c => csvCell(r[c])).join(","))].join("\r\n");
      audit(db, { actor: who.user, action: "export", detail: `${rows.length} rows`, ip_hash: hashIp(ip) });
      res.writeHead(200, {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="mojave-requests-${new Date().toISOString().slice(0, 10)}.csv"`,
        "cache-control": "no-store",
      });
      return res.end(req.method === "HEAD" ? "" : "﻿" + csv);
    }

    if (path === "/api/admin/audit" && req.method === "GET") {
      const who = requireAdmin(req, res, ip); if (!who) return;
      securityHeaders(res);
      const limit = int(url.searchParams.get("limit"), 1, 500, 200);
      return json(res, 200, {
        rows: db.prepare("SELECT * FROM audit_log ORDER BY at DESC LIMIT ?").all(limit),
      }, { "cache-control": "no-store" });
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
    // Never echo an internal message to the client; it can leak paths and SQL.
    if (!res.headersSent) json(res, 500, { error: "Server error" });
    else res.end();
  }
});

server.headersTimeout = 20000;
server.requestTimeout = 30000;
server.maxHeadersCount = 60;

server.listen(PORT, HOST, async () => {
  log.info(`Mojave Medical server on http://${HOST}:${PORT}`);
  log.info(`static: ${PUBLIC_DIR}`);
  log.info(`data:   ${DB_FILE}`);
  if (!configured()) log.warn("ADMIN_USER/ADMIN_PASS not set - /admin is disabled");
  if (!SITE_HOST) log.warn("SITE_HOST not set - cross-site request checks fall back to Sec-Fetch-Site only");
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
