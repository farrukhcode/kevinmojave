export const json = (res, code, body, extra = {}) => {
  const b = JSON.stringify(body);
  res.writeHead(code, { "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(b), ...extra });
  res.end(b);
};

export const readJson = (req, limit = 32 * 1024) =>
  new Promise((resolve, reject) => {
    let n = 0; const chunks = [];
    req.on("data", c => {
      n += c.length;
      if (n > limit) { reject(new Error("payload too large")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch { reject(new Error("invalid JSON")); }
    });
    req.on("error", reject);
  });

/** Trust the proxy's client IP only when TRUST_PROXY is on (Coolify/Traefik sets x-forwarded-for). */
export const clientIp = (req, trustProxy) => {
  if (trustProxy) {
    const f = req.headers["x-forwarded-for"];
    if (f) return String(f).split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
};

/** Fixed-window rate limiter, in memory. Good enough for one container. */
export function rateLimiter({ windowMs, max }) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
  }, windowMs).unref();
  return key => {
    const now = Date.now();
    let e = hits.get(key);
    if (!e || now > e.reset) { e = { count: 0, reset: now + windowMs }; hits.set(key, e); }
    e.count++;
    return { ok: e.count <= max, remaining: Math.max(0, max - e.count), retryAfter: Math.ceil((e.reset - now) / 1000) };
  };
}

export const esc = s => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const csvCell = v => {
  const s = String(v == null ? "" : v);
  // Guard against CSV/formula injection when the export is opened in Excel.
  const safe = /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
  return '"' + safe.replace(/"/g, '""') + '"';
};

/** Constant-time string compare, length-safe. */
export const timingSafeEqual = (a, b) => {
  const A = Buffer.from(String(a)), B = Buffer.from(String(b));
  if (A.length !== B.length) {
    // still burn the comparison so length isn't a fast path
    let z = 0; for (let i = 0; i < Math.max(A.length, B.length); i++) z |= (A[i] || 0) ^ (B[i] || 0);
    return false;
  }
  let d = 0; for (let i = 0; i < A.length; i++) d |= A[i] ^ B[i];
  return d === 0;
};
