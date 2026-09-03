/**
 * Availability engine.
 *
 * Everything here is clinic-local wall-clock time: a date is "YYYY-MM-DD" and a time is
 * minutes from midnight. That is the only representation that behaves correctly for a
 * single-location practice across DST, and it is what staff actually type.
 *
 *   schedule_rules      the recurring weekly grid (one row per open window per weekday)
 *   schedule_overrides  one date that differs: closed, or its own set of windows
 *   blocks              anything occupying time: busy holds, vacations, staff-entered visits
 *   appointments        patient requests that hold their slot until declined
 */
import { VISIT_TYPES } from "./validate.js";

export const DEFAULT_SETTINGS = {
  timezone: "America/Los_Angeles",
  lead_hours: "2",        // no online booking inside this many hours
  horizon_days: "60",     // how far ahead the calendar opens
  slot_min: "30",         // default granularity for new windows
};

/* ---------------------------------------------------------------- date utils */
export const tzToday = tz =>
  new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

export const tzNowMin = tz => {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false })
    .formatToParts(new Date());
  const g = k => Number(p.find(x => x.type === k).value);
  return (g("hour") % 24) * 60 + g("minute");
};

export const isYmd = s => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + "T12:00:00Z"));
export const dowOf = ymd => new Date(ymd + "T12:00:00Z").getUTCDay();
export const addDays = (ymd, n) => {
  const d = new Date(ymd + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const daysBetween = (a, b) => Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 864e5);
export const hhmm = m => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
export const minOf = s => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || "").trim());
  if (!m) return null;
  const v = Number(m[1]) * 60 + Number(m[2]);
  return v >= 0 && v <= 1440 ? v : null;
};

/* ------------------------------------------------------------------ settings */
export function getSettings(db) {
  const out = { ...DEFAULT_SETTINGS };
  for (const r of db.prepare("SELECT key, value FROM settings").all()) out[r.key] = r.value;
  return {
    ...out,
    lead_min: Math.max(0, Number(out.lead_hours) * 60 || 0),
    horizon_days: Math.max(1, Number(out.horizon_days) || 60),
    slot_min: Math.max(5, Number(out.slot_min) || 30),
  };
}

export function setSettings(db, patch) {
  const stmt = db.prepare("INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  for (const k of Object.keys(DEFAULT_SETTINGS)) {
    if (patch[k] !== undefined && patch[k] !== null) stmt.run(k, String(patch[k]).slice(0, 60));
  }
  return getSettings(db);
}

/* --------------------------------------------------------------- weekly grid */
const cleanWindow = w => {
  const s = Number(w.start_min), e = Number(w.end_min);
  if (!Number.isFinite(s) || !Number.isFinite(e) || s < 0 || e > 1440 || e - s < 5) return null;
  return {
    start_min: Math.round(s), end_min: Math.round(e),
    slot_min: Math.min(240, Math.max(5, Math.round(Number(w.slot_min) || 30))),
    capacity: Math.min(20, Math.max(1, Math.round(Number(w.capacity) || 1))),
  };
};

export const listRules = db => db.prepare("SELECT * FROM schedule_rules WHERE active = 1 ORDER BY dow, start_min").all();

/** Replace the whole weekly grid in one transaction. Partial edits invite half-saved weeks. */
export function replaceRules(db, rules) {
  const rows = [];
  for (const r of Array.isArray(rules) ? rules : []) {
    const dow = Number(r.dow);
    const w = cleanWindow(r);
    if (!w || !(dow >= 0 && dow <= 6)) continue;
    rows.push({ dow, ...w });
  }
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("DELETE FROM schedule_rules").run();
    const ins = db.prepare("INSERT INTO schedule_rules (dow,start_min,end_min,slot_min,capacity,active) VALUES (?,?,?,?,?,1)");
    for (const r of rows) ins.run(r.dow, r.start_min, r.end_min, r.slot_min, r.capacity);
    db.exec("COMMIT");
  } catch (e) { db.exec("ROLLBACK"); throw e; }
  return listRules(db);
}

/* ----------------------------------------------------------------- overrides */
export const listOverrides = (db, from) =>
  db.prepare("SELECT * FROM schedule_overrides WHERE date >= ? ORDER BY date").all(from || "0000-00-00")
    .map(r => ({ ...r, closed: !!r.closed, windows: r.windows ? JSON.parse(r.windows) : null }));

export function saveOverride(db, { date, closed, windows, note }) {
  if (!isYmd(date)) throw new Error("Invalid date");
  const w = closed ? null : (Array.isArray(windows) ? windows.map(cleanWindow).filter(Boolean) : null);
  db.prepare(`INSERT INTO schedule_overrides (date,closed,windows,note) VALUES (?,?,?,?)
              ON CONFLICT(date) DO UPDATE SET closed = excluded.closed, windows = excluded.windows, note = excluded.note`)
    .run(date, closed ? 1 : 0, w && w.length ? JSON.stringify(w) : null, note ? String(note).slice(0, 200) : null);
  return true;
}

export const deleteOverride = (db, date) => db.prepare("DELETE FROM schedule_overrides WHERE date = ?").run(date).changes > 0;

/* -------------------------------------------------------------------- blocks */
export function listBlocks(db, from, to) {
  return db.prepare("SELECT * FROM blocks WHERE end_date >= ? AND start_date <= ? ORDER BY start_date, all_day DESC, start_min")
    .all(from, to).map(b => ({ ...b, all_day: !!b.all_day }));
}

export function createBlock(db, b, actor) {
  const start_date = b.start_date, end_date = b.end_date && isYmd(b.end_date) ? b.end_date : b.start_date;
  if (!isYmd(start_date) || !isYmd(end_date) || daysBetween(start_date, end_date) < 0) throw new Error("Invalid dates");
  const all_day = b.all_day ? 1 : 0;
  let start_min = null, end_min = null;
  if (!all_day) {
    start_min = typeof b.start_min === "number" ? b.start_min : minOf(b.start_time);
    end_min = typeof b.end_min === "number" ? b.end_min : minOf(b.end_time);
    if (start_min == null || end_min == null || end_min <= start_min) throw new Error("Invalid times");
  }
  const kind = b.kind === "appointment" ? "appointment" : "busy";
  const info = db.prepare(`INSERT INTO blocks
      (kind,start_date,end_date,all_day,start_min,end_min,title,note,patient_name,patient_phone,visit_label,created_at,created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(kind, start_date, end_date, all_day, start_min, end_min,
      String(b.title || (kind === "appointment" ? "Appointment" : "Busy")).slice(0, 120),
      b.note ? String(b.note).slice(0, 500) : null,
      b.patient_name ? String(b.patient_name).slice(0, 120) : null,
      b.patient_phone ? String(b.patient_phone).slice(0, 40) : null,
      b.visit_label ? String(b.visit_label).slice(0, 80) : null,
      new Date().toISOString(), actor || "staff");
  return db.prepare("SELECT * FROM blocks WHERE id = ?").get(Number(info.lastInsertRowid));
}

export const deleteBlock = (db, id) => db.prepare("DELETE FROM blocks WHERE id = ?").run(Number(id)).changes > 0;

/* ------------------------------------------------------- occupancy for a date */
/** Every interval that consumes a slot on this date, from blocks and from held requests. */
export function busyOn(db, date, { excludeRef = null } = {}) {
  const out = [];
  for (const b of db.prepare("SELECT * FROM blocks WHERE start_date <= ? AND end_date >= ?").all(date, date)) {
    out.push({
      start: b.all_day ? 0 : b.start_min,
      end: b.all_day ? 1440 : b.end_min,
      kind: b.kind, id: b.id, all_day: !!b.all_day,
      title: b.title, note: b.note, patient_name: b.patient_name, patient_phone: b.patient_phone,
      visit_label: b.visit_label,
    });
  }
  const held = db.prepare(
    `SELECT ref, status, requested_time, duration_min, first_name, last_name, phone, visit_label
     FROM appointments
     WHERE requested_date = ? AND requested_time IS NOT NULL AND status NOT IN ('declined','spam')`).all(date);
  for (const a of held) {
    if (excludeRef && a.ref === excludeRef) continue;
    const s = minOf(a.requested_time);
    if (s == null) continue;
    out.push({
      start: s, end: s + (a.duration_min || 30), kind: "request", ref: a.ref, status: a.status,
      title: `${a.last_name}, ${a.first_name}`, patient_name: `${a.first_name} ${a.last_name}`,
      patient_phone: a.phone, visit_label: a.visit_label,
    });
  }
  return out;
}

/** Open windows for one date, after overrides. Empty array means the office is closed. */
export function windowsFor(db, date, rules, overrides) {
  const o = overrides ? overrides.get(date) : db.prepare("SELECT * FROM schedule_overrides WHERE date = ?").get(date);
  if (o) {
    const closed = o.closed === true || o.closed === 1;
    if (closed) return [];
    const w = typeof o.windows === "string" ? JSON.parse(o.windows || "null") : o.windows;
    if (w && w.length) return w;
  }
  const dow = dowOf(date);
  return (rules || listRules(db)).filter(r => r.dow === dow)
    .map(r => ({ start_min: r.start_min, end_min: r.end_min, slot_min: r.slot_min, capacity: r.capacity }));
}

const overlaps = (aS, aE, bS, bE) => aS < bE && bS < aE;

/**
 * Slots for one date.
 *
 * `duration` is the visit length, which can span several slots: a 45-minute new-patient
 * visit offered on a 30-minute grid must have both halves free and must still fit inside
 * the window. Capacity lets one time hold more than one visit (two exam rooms).
 */
export function slotsFor(db, date, { duration, rules, overrides, settings, busy, excludeRef, ignoreLead = false } = {}) {
  const S = settings || getSettings(db);
  const wins = windowsFor(db, date, rules, overrides);
  if (!wins.length) return { closed: true, slots: [] };

  const today = tzToday(S.timezone);
  const past = daysBetween(today, date) < 0;
  // The public calendar hides times that have passed or fall inside the notice window.
  // Staff views pass ignoreLead so the whole working day stays bookable - the front desk
  // has to be able to write down a visit that is happening this afternoon.
  const cutoff = date === today && !ignoreLead ? tzNowMin(S.timezone) + S.lead_min : -1;
  const occupied = busy || busyOn(db, date, { excludeRef });

  const slots = [];
  for (const w of wins) {
    const step = w.slot_min || S.slot_min;
    const dur = Math.max(step, duration || step);
    for (let m = w.start_min; m + dur <= w.end_min; m += step) {
      const hits = occupied.filter(b => overlaps(m, m + dur, b.start, b.end));
      // Capacity means "how many patients can be seen at once" - two exam rooms, say. A
      // busy block is the doctor being unavailable, so it closes the time outright no
      // matter how many rooms there are.
      const blocked = hits.some(h => h.kind === "busy");
      const booked = hits.filter(h => h.kind !== "busy").length;
      const full = blocked || booked >= (w.capacity || 1);
      slots.push({
        m, t: hhmm(m), end: hhmm(m + dur), capacity: w.capacity || 1, used: booked,
        open: !past && !full && m >= cutoff,
        reason: past ? "past" : blocked ? "blocked" : full ? "taken" : m < cutoff ? "lead" : null,
        hits: hits.map(h => ({ kind: h.kind, id: h.id, ref: h.ref, title: h.title, status: h.status, all_day: h.all_day })),
      });
    }
  }
  slots.sort((a, b) => a.m - b.m);
  return { closed: false, slots };
}

/** Is this exact date+time still bookable for this visit type? Used when a request comes in. */
export function slotIsOpen(db, date, time, visitType, opts = {}) {
  const dur = (VISIT_TYPES[visitType] || {}).dur || 30;
  const m = minOf(time);
  if (m == null) return false;
  const { closed, slots } = slotsFor(db, date, { duration: dur, ...opts });
  if (closed) return false;
  const s = slots.find(x => x.m === m);
  return !!(s && s.open);
}

/** Public availability for a date range: what the website's calendar draws. */
export function availability(db, { from, to, visitType }) {
  const S = getSettings(db);
  const today = tzToday(S.timezone);
  const dur = (VISIT_TYPES[visitType] || {}).dur || S.slot_min;
  const start = isYmd(from) && daysBetween(today, from) > 0 ? from : today;
  const maxTo = addDays(today, S.horizon_days);
  let end = isYmd(to) ? to : addDays(start, 30);
  if (daysBetween(end, maxTo) < 0) end = maxTo;
  if (daysBetween(start, end) > 92) end = addDays(start, 92);

  const rules = listRules(db);
  const overrides = new Map(db.prepare("SELECT * FROM schedule_overrides WHERE date BETWEEN ? AND ?").all(start, end).map(r => [r.date, r]));
  const blocksAll = listBlocks(db, start, end);

  const days = [];
  for (let d = start; daysBetween(d, end) >= 0; d = addDays(d, 1)) {
    const { closed, slots } = slotsFor(db, d, { duration: dur, rules, overrides, settings: S });
    days.push({
      date: d, closed,
      open: slots.filter(s => s.open).map(s => ({ m: s.m, t: s.t })),
      note: (overrides.get(d) || {}).note || null,
    });
  }
  return {
    tz: S.timezone, today, from: start, to: end, horizon_days: S.horizon_days,
    lead_hours: Number(S.lead_hours) || 0, duration_min: dur,
    hours: weeklyHours(rules),
    closures: blocksAll.filter(b => b.all_day).map(b => ({ from: b.start_date, to: b.end_date, title: b.title })),
    days,
  };
}

/** The weekly grid collapsed into "8:00 AM – 5:00 PM" strings the site can print. */
export function weeklyHours(rules) {
  const by = {};
  for (const r of rules) (by[r.dow] ||= []).push(r);
  const fmt = m => {
    const h = Math.floor(m / 60), mm = m % 60;
    const ampm = h >= 12 ? "PM" : "AM", h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
  };
  const fmt24 = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
  const out = [];
  for (let d = 0; d < 7; d++) {
    const ws = (by[d] || []).sort((a, b) => a.start_min - b.start_min);
    out.push({
      d,
      en: ws.length ? ws.map(w => `${fmt(w.start_min)} – ${fmt(w.end_min)}`).join(", ") : null,
      es: ws.length ? ws.map(w => `${fmt24(w.start_min)} – ${fmt24(w.end_min)}`).join(", ") : null,
    });
  }
  return out;
}
