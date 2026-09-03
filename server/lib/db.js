import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function openDb(file) {
  mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("PRAGMA busy_timeout = 5000");
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      ref           TEXT NOT NULL UNIQUE,
      created_at    TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'new',
      visit_type    TEXT NOT NULL,
      visit_label   TEXT,
      requested_date TEXT,
      requested_time TEXT,
      duration_min  INTEGER,
      first_name    TEXT NOT NULL,
      last_name     TEXT NOT NULL,
      dob           TEXT,
      phone         TEXT NOT NULL,
      email         TEXT,
      insurance     TEXT,
      patient_status TEXT,
      referred_by   TEXT,
      reason        TEXT,
      lang          TEXT,
      source        TEXT,
      user_agent    TEXT,
      ip_hash       TEXT,
      staff_notes   TEXT,
      handled_at    TEXT,
      handled_by    TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_appt_created ON appointments(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_appt_status  ON appointments(status);

    CREATE TABLE IF NOT EXISTS audit_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      at         TEXT NOT NULL,
      actor      TEXT NOT NULL,
      action     TEXT NOT NULL,
      appt_ref   TEXT,
      detail     TEXT,
      ip_hash    TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_audit_at ON audit_log(at DESC);
  `);
  return db;
}

export const STATUSES = ["new", "contacted", "scheduled", "declined", "spam"];

export function insertAppointment(db, a) {
  const cols = ["ref","created_at","status","visit_type","visit_label","requested_date","requested_time",
    "duration_min","first_name","last_name","dob","phone","email","insurance","patient_status",
    "referred_by","reason","lang","source","user_agent","ip_hash"];
  const stmt = db.prepare(
    `INSERT INTO appointments (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`
  );
  stmt.run(...cols.map(c => (a[c] === undefined ? null : a[c])));
  return db.prepare("SELECT * FROM appointments WHERE ref = ?").get(a.ref);
}

export function listAppointments(db, { status, q, limit = 200, offset = 0 } = {}) {
  const where = [], args = [];
  if (status && status !== "all") { where.push("status = ?"); args.push(status); }
  if (q) {
    where.push("(first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR ref LIKE ? OR email LIKE ?)");
    const like = `%${q}%`; args.push(like, like, like, like, like);
  }
  const sql = `SELECT * FROM appointments ${where.length ? "WHERE " + where.join(" AND ") : ""}
               ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  return db.prepare(sql).all(...args, limit, offset);
}

export const countsByStatus = db =>
  Object.fromEntries(db.prepare("SELECT status, COUNT(*) n FROM appointments GROUP BY status").all().map(r => [r.status, r.n]));

export function updateAppointment(db, ref, { status, staff_notes, actor }) {
  const cur = db.prepare("SELECT * FROM appointments WHERE ref = ?").get(ref);
  if (!cur) return null;
  const next = {
    status: status && STATUSES.includes(status) ? status : cur.status,
    staff_notes: staff_notes === undefined ? cur.staff_notes : String(staff_notes).slice(0, 2000),
  };
  db.prepare("UPDATE appointments SET status = ?, staff_notes = ?, handled_at = ?, handled_by = ? WHERE ref = ?")
    .run(next.status, next.staff_notes, new Date().toISOString(), actor || "staff", ref);
  return db.prepare("SELECT * FROM appointments WHERE ref = ?").get(ref);
}

export function audit(db, { actor, action, appt_ref, detail, ip_hash }) {
  db.prepare("INSERT INTO audit_log (at,actor,action,appt_ref,detail,ip_hash) VALUES (?,?,?,?,?,?)")
    .run(new Date().toISOString(), actor || "system", action, appt_ref || null, detail || null, ip_hash || null);
}

/** Delete request rows older than N days. Retention is a HIPAA-hygiene control, not a legal record. */
export function purgeOlderThan(db, days) {
  if (!days || days <= 0) return 0;
  const cutoff = new Date(Date.now() - days * 864e5).toISOString();
  const n = db.prepare("SELECT COUNT(*) c FROM appointments WHERE created_at < ? AND status IN ('scheduled','declined','spam')").get(cutoff).c;
  db.prepare("DELETE FROM appointments WHERE created_at < ? AND status IN ('scheduled','declined','spam')").run(cutoff);
  return n;
}
