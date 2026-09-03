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

    /* ---- scheduling ---- */
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- The recurring weekly grid. One row per open window per weekday, so a day with a
    -- lunch break is simply two rows.
    CREATE TABLE IF NOT EXISTS schedule_rules (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      dow       INTEGER NOT NULL,          -- 0 = Sunday
      start_min INTEGER NOT NULL,          -- minutes from midnight, clinic local time
      end_min   INTEGER NOT NULL,
      slot_min  INTEGER NOT NULL DEFAULT 30,
      capacity  INTEGER NOT NULL DEFAULT 1,
      active    INTEGER NOT NULL DEFAULT 1
    );

    -- One date that does not follow the weekly grid: closed, or its own windows.
    CREATE TABLE IF NOT EXISTS schedule_overrides (
      date    TEXT PRIMARY KEY,
      closed  INTEGER NOT NULL DEFAULT 0,
      windows TEXT,                        -- JSON array of {start_min,end_min,slot_min,capacity}
      note    TEXT
    );

    -- Anything else that occupies time: a busy hold, a vacation, a visit booked by phone.
    CREATE TABLE IF NOT EXISTS blocks (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      kind          TEXT NOT NULL DEFAULT 'busy',   -- 'busy' | 'appointment'
      start_date    TEXT NOT NULL,
      end_date      TEXT NOT NULL,                  -- inclusive
      all_day       INTEGER NOT NULL DEFAULT 0,
      start_min     INTEGER,
      end_min       INTEGER,
      title         TEXT,
      note          TEXT,
      patient_name  TEXT,
      patient_phone TEXT,
      visit_label   TEXT,
      created_at    TEXT,
      created_by    TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_blocks_range ON blocks(start_date, end_date);
    CREATE INDEX IF NOT EXISTS idx_appt_slot ON appointments(requested_date, requested_time);
  `);
  seedSchedule(db);
  return db;
}

/**
 * First run only: publish the hours the practice already advertises, so the calendar is
 * never empty on a fresh database. Staff can change all of it in the dashboard afterwards.
 */
function seedSchedule(db) {
  if (db.prepare("SELECT COUNT(*) c FROM schedule_rules").get().c > 0) return;
  const ins = db.prepare("INSERT INTO schedule_rules (dow,start_min,end_min,slot_min,capacity,active) VALUES (?,?,?,?,?,1)");
  for (const dow of [1, 2, 3, 4, 5]) ins.run(dow, 8 * 60, 17 * 60, 30, 1);   // Mon-Fri 8:00-5:00
  ins.run(6, 13 * 60, 17 * 60, 30, 1);                                       // Sat 1:00-5:00
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

export function updateAppointment(db, ref, { status, staff_notes, requested_date, requested_time, actor }) {
  const cur = db.prepare("SELECT * FROM appointments WHERE ref = ?").get(ref);
  if (!cur) return null;
  const next = {
    status: status && STATUSES.includes(status) ? status : cur.status,
    staff_notes: staff_notes === undefined ? cur.staff_notes : String(staff_notes).slice(0, 2000),
    requested_date: requested_date === undefined ? cur.requested_date : (requested_date || null),
    requested_time: requested_time === undefined ? cur.requested_time : (requested_time || null),
  };
  db.prepare(`UPDATE appointments SET status = ?, staff_notes = ?, requested_date = ?, requested_time = ?,
              handled_at = ?, handled_by = ? WHERE ref = ?`)
    .run(next.status, next.staff_notes, next.requested_date, next.requested_time,
         new Date().toISOString(), actor || "staff", ref);
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
