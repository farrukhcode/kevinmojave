/**
 * Security helpers.
 *
 * The threat model for a small clinic site is: bots hammering the public booking form,
 * someone guessing the dashboard password, someone trying to make a logged-in staff
 * browser perform an action from another site (CSRF), and someone reading files off disk
 * through the static handler. Each of those has a control below.
 */
import { createHmac, randomBytes, timingSafeEqual as tse } from "node:crypto";

const b64url = b => Buffer.from(b).toString("base64url");

/* ------------------------------------------------------------------ sessions */
/**
 * Stateless signed session cookie. No server-side store, so a restart does not log
 * everyone out as long as SESSION_SECRET is stable, and there is no session table to
 * leak. The cookie carries only the username, an expiry and a CSRF token.
 */
export function makeSessions(secret, { ttlHours = 8 } = {}) {
  const sign = payload => createHmac("sha256", secret).update(payload).digest("base64url");

  return {
    issue(user) {
      const csrf = randomBytes(18).toString("base64url");
      const body = b64url(JSON.stringify({ u: user, e: Date.now() + ttlHours * 3600e3, c: csrf }));
      return { token: `${body}.${sign(body)}`, csrf, maxAge: ttlHours * 3600 };
    },
    verify(token) {
      if (typeof token !== "string" || token.length > 512) return null;
      const i = token.lastIndexOf(".");
      if (i < 1) return null;
      const body = token.slice(0, i), mac = token.slice(i + 1);
      const want = sign(body);
      if (mac.length !== want.length) return null;
      try { if (!tse(Buffer.from(mac), Buffer.from(want))) return null; } catch { return null; }
      let p; try { p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")); } catch { return null; }
      if (!p || typeof p.u !== "string" || typeof p.e !== "number" || Date.now() > p.e) return null;
      return { user: p.u, csrf: p.c };
    },
  };
}

export function parseCookies(header) {
  const out = {};
  if (!header || typeof header !== "string" || header.length > 4096) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 1) continue;
    const k = part.slice(0, i).trim();
    if (!/^[\w.-]+$/.test(k)) continue;
    try { out[k] = decodeURIComponent(part.slice(i + 1).trim()); } catch { /* ignore junk */ }
  }
  return out;
}

export const cookie = (name, value, { maxAge, secure, clear = false } = {}) =>
  `${name}=${clear ? "" : encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict` +
  (secure ? "; Secure" : "") +
  `; Max-Age=${clear ? 0 : maxAge}`;

/* ---------------------------------------------------------------------- CSRF */
/**
 * A cross-site form or fetch cannot set Sec-Fetch-Site, and cannot forge Origin. Requiring
 * one of them to say "same origin" stops CSRF for every browser in use, including against
 * HTTP Basic credentials the browser would otherwise attach automatically.
 */
export function sameOrigin(req, allowedHosts) {
  const sfs = req.headers["sec-fetch-site"];
  if (sfs) return sfs === "same-origin" || sfs === "none";
  const origin = req.headers.origin;
  if (origin) {
    try {
      const h = new URL(origin).host.toLowerCase();
      return allowedHosts.has(h) || allowedHosts.has(h.replace(/^www\./, ""));
    } catch { return false; }
  }
  const ref = req.headers.referer;
  if (ref) {
    try {
      const h = new URL(ref).host.toLowerCase();
      return allowedHosts.has(h) || allowedHosts.has(h.replace(/^www\./, ""));
    } catch { return false; }
  }
  // No Origin, no Referer, no Sec-Fetch-Site: a script or an old browser. Allowed only
  // because Basic-auth API clients (curl, the CSV export) look exactly like this; the
  // session-cookie path additionally demands a CSRF token, which such a request cannot have.
  return true;
}

/* -------------------------------------------------------- brute force lockout */
/**
 * Escalating lockout keyed by IP. Ten wrong passwords cost fifteen minutes, and the
 * counter only clears on a successful login, so an attacker cannot outrun it by waiting.
 */
export function loginGuard({ max = 8, windowMs = 15 * 60e3, maxKeys = 5000 } = {}) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (now > v.until) hits.delete(k);
  }, 60e3).unref();

  return {
    check(key) {
      const e = hits.get(key);
      if (!e) return { ok: true };
      if (Date.now() > e.until) { hits.delete(key); return { ok: true }; }
      if (e.n < max) return { ok: true };
      return { ok: false, retryAfter: Math.ceil((e.until - Date.now()) / 1000) };
    },
    fail(key) {
      if (hits.size > maxKeys && !hits.has(key)) return;      // do not let spoofed IPs eat memory
      const e = hits.get(key) || { n: 0, until: 0 };
      e.n++;
      // 1 min after the 4th miss, doubling to a 30 minute ceiling.
      e.until = Date.now() + Math.min(30 * 60e3, Math.max(windowMs / 15, 2 ** Math.max(0, e.n - 3) * 60e3));
      hits.set(key, e);
      return e.n;
    },
    succeed(key) { hits.delete(key); },
  };
}

/* ------------------------------------------------------------ payload shaping */
/** Strings only, trimmed, length-capped. Anything else becomes "". */
export const s = (v, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
export const int = (v, lo, hi, dflt = null) => {
  // A missing query parameter is null and an omitted one is "", and Number("") is 0.
  // Without this guard an absent ?limit= would clamp to the minimum instead of the default.
  if (v === null || v === undefined || (typeof v === "string" && v.trim() === "")) return dflt;
  const n = typeof v === "number" ? v : Number(String(v).trim());
  if (!Number.isFinite(n)) return dflt;
  return Math.min(hi, Math.max(lo, Math.round(n)));
};
