/**
 * End-to-end check of the booking API, the schedule engine and the security controls.
 *
 * Run it against a THROWAWAY database, never production - it books, blocks and closes days:
 *
 *   ADMIN_USER=test ADMIN_PASS=secret123 PORT=3999 SITE_HOST=localhost \
 *   NODE_ENV=development DATA_DIR=/tmp/mm-test RATE_LIMIT_PER_HOUR=50 node server.js &
 *   npm test
 */
const B = process.env.TEST_URL || "http://localhost:3999";
const ORIGIN = B;
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { (cond ? pass++ : fail++); console.log((cond ? "  ok   " : "  FAIL ") + name + (extra ? "  " + extra : "")); };

const post = (path, body, headers = {}, raw) =>
  fetch(B + path, { method: "POST", headers: { "content-type": "application/json", origin: ORIGIN, ...headers }, body: raw !== undefined ? raw : JSON.stringify(body) });
const get = (path, headers = {}) => fetch(B + path, { headers });

const appt = (o = {}) => ({
  visit_type: "new", first_name: "A", last_name: "Test", dob: "1980-01-01",
  phone: "7605551111", consent: true, elapsed_ms: 9000, ...o,
});

console.log("\n— public booking —");
let r = await post("/api/appointments", appt({ first_name: "Alice", requested_date: "2026-09-08", requested_time: "9:00" }));
let d = await r.json();
ok("books a free slot", r.status === 201 && d.ref, d.ref || JSON.stringify(d));
const aliceRef = d.ref;

r = await post("/api/appointments", appt({ first_name: "Bob", phone: "7605552222", requested_date: "2026-09-08", requested_time: "9:00" }));
d = await r.json();
ok("refuses the same slot twice", r.status === 409 && d.code === "slot_taken", r.status + " " + JSON.stringify(d));

r = await post("/api/appointments", appt({ first_name: "Carl", phone: "7605553333", requested_date: "2026-09-08", requested_time: "9:30" }));
ok("refuses a slot overlapping a 45-min visit", r.status === 409, "got " + r.status);

r = await post("/api/appointments", appt({ visit_type: "follow", first_name: "Dana", phone: "7605554444", requested_date: "2026-09-08", requested_time: "10:00" }));
ok("books a later free slot", r.status === 201, "got " + r.status);

r = await post("/api/appointments", appt({ first_name: "Spam", phone: "7605555555", requested_date: "2026-09-09", requested_time: "14:00", mm_ref_code: "http://spam" }));
d = await r.json();
ok("spam trap stores instead of discarding", r.status === 201 && d.ref, JSON.stringify(d));
const spamRef = d.ref;

r = await post("/api/appointments", appt({ requested_date: "2026-09-08", requested_time: "11:00" }), { origin: "https://evil.example" });
ok("blocks a cross-site POST", r.status === 403, "got " + r.status);

r = await fetch(B + "/api/appointments", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", origin: ORIGIN }, body: "visit_type=new" });
ok("blocks a form-encoded POST", r.status === 415, "got " + r.status);

r = await post("/api/appointments", appt({ elapsed_ms: 100 }));
ok("blocks an instant submit", r.status === 400, "got " + r.status);

r = await post("/api/appointments", appt({ phone: "12" }));
d = await r.json();
ok("validates the phone number", r.status === 422 && d.errors.phone, JSON.stringify(d.errors || {}));

r = await get("/api/availability?visit_type=new");
d = await r.json();
const day8 = d.days.find(x => x.date === "2026-09-08");
ok("held slots disappear from availability", !day8.open.some(s => ["09:00", "09:30", "10:00"].includes(s.t)), day8.open.slice(0, 6).map(s => s.t).join(" "));

console.log("\n— admin auth —");
r = await get("/api/admin/appointments");
ok("rejects an anonymous read", r.status === 401, "got " + r.status);

r = await post("/api/admin/login", { user: process.env.ADMIN_USER || "test", pass: "wrong" });
ok("rejects a wrong password", r.status === 401, "got " + r.status);

r = await post("/api/admin/login", { user: process.env.ADMIN_USER || "test", pass: process.env.ADMIN_PASS || "secret123" });
d = await r.json();
const cookie = (r.headers.get("set-cookie") || "").split(";")[0];
const csrf = d.csrf;
ok("accepts the right password", r.status === 200 && cookie.startsWith("mm_sess="), cookie.slice(0, 20));
ok("cookie is HttpOnly + SameSite=Strict", /HttpOnly/i.test(r.headers.get("set-cookie")) && /SameSite=Strict/i.test(r.headers.get("set-cookie")));

const auth = { cookie };
const authW = { cookie, "x-csrf-token": csrf };

r = await post("/api/admin/appointments/" + aliceRef, { status: "scheduled" }, auth);
ok("a write without the CSRF token is refused", r.status === 403, "got " + r.status);

r = await post("/api/admin/appointments/" + aliceRef, { status: "scheduled" }, authW);
ok("a write with the CSRF token succeeds", r.status === 200, "got " + r.status);

r = await post("/api/admin/appointments/" + aliceRef, { status: "scheduled" }, { ...authW, origin: "https://evil.example" });
ok("a same-token cross-site write is refused", r.status === 403, "got " + r.status);

r = await post("/api/admin/appointments/" + aliceRef, { status: "hacked" }, authW);
ok("an unknown status is refused", r.status === 422, "got " + r.status);

r = await get("/api/admin/appointments?status=all", auth);
d = await r.json();
ok("the spam-trapped request is visible under Spam", d.rows.some(x => x.ref === spamRef && x.status === "spam"));
const total = Object.values(d.counts).reduce((a, b) => a + b, 0);
ok("the list is not truncated when no limit is given", d.rows.length === total, d.rows.length + " rows vs " + total + " counted");
r = await get("/api/admin/appointments?status=all&limit=2", auth);
ok("an explicit limit is honoured", (await r.json()).rows.length === 2);

console.log("\n— schedule management —");
r = await get("/api/admin/schedule", auth); d = await r.json();
ok("weekly grid is seeded", d.rules.length === 6, d.rules.length + " windows");

r = await post("/api/admin/schedule/rules", { rules: [
  { dow: 1, start_min: 480, end_min: 720, slot_min: 20, capacity: 1 },
  { dow: 1, start_min: 780, end_min: 1020, slot_min: 20, capacity: 2 },
  { dow: 2, start_min: 540, end_min: 1020, slot_min: 30, capacity: 1 },
]}, authW);
ok("weekly grid saves with a lunch gap", r.status === 200, "got " + r.status);

r = await get("/api/availability?visit_type=follow"); d = await r.json();
const mon = d.days.find(x => new Date(x.date + "T12:00:00Z").getUTCDay() === 1);
ok("lunch gap is respected", mon && !mon.open.some(s => s.t >= "12:00" && s.t < "13:00"), mon ? mon.open.map(s => s.t).join(" ").slice(0, 80) : "none");
const wed = d.days.find(x => new Date(x.date + "T12:00:00Z").getUTCDay() === 3);
ok("a weekday with no windows is closed", wed && wed.closed && wed.open.length === 0);

r = await post("/api/admin/schedule/override", { date: "2026-09-14", closed: true, note: "Holiday" }, authW);
ok("a day can be closed", r.status === 200, "got " + r.status);
d = await (await get("/api/availability")).json();
ok("the closed day shows no times", d.days.find(x => x.date === "2026-09-14").closed);

r = await post("/api/admin/blocks", { kind: "busy", all_day: true, start_date: "2026-09-21", end_date: "2026-09-25", title: "Conference" }, authW);
ok("a vacation range blocks every day in it", r.status === 201, "got " + r.status);
d = await (await get("/api/availability")).json();
ok("vacation days have no openings", ["2026-09-21","2026-09-23","2026-09-25"].every(x => (d.days.find(y => y.date === x) || {}).open.length === 0));
ok("the day after the vacation is open again", (d.days.find(y => y.date === "2026-09-28") || {}).open.length > 0);

r = await post("/api/admin/blocks", { kind: "busy", start_date: "2026-09-15", start_time: "09:00", end_time: "10:00", title: "Rounds" }, authW);
ok("an hour can be blocked", r.status === 201, "got " + r.status);
const blockId = (await r.json()).block.id;
d = await (await get("/api/availability?visit_type=follow")).json();
const d15 = d.days.find(x => x.date === "2026-09-15");
ok("blocked hour is gone from the calendar", !d15.open.some(s => s.t >= "09:00" && s.t < "10:00"), d15.open.map(s => s.t).join(" ").slice(0, 70));

r = await post("/api/admin/blocks", { op: "delete", id: blockId }, authW);
d = await (await get("/api/availability?visit_type=follow")).json();
ok("removing the block frees the hour", d.days.find(x => x.date === "2026-09-15").open.some(s => s.t === "09:00"));

r = await post("/api/admin/appointments", { visit_type: "follow", first_name: "Phone", last_name: "Booking", dob: "1975-05-05", phone: "7605559999", requested_date: "2026-09-15", requested_time: "11:00" }, authW);
ok("staff can book a visit taken by phone", r.status === 201, "got " + r.status);
d = await (await get("/api/availability?visit_type=follow")).json();
ok("a staff booking holds its slot publicly", !d.days.find(x => x.date === "2026-09-15").open.some(s => s.t === "11:00"));

r = await post("/api/admin/schedule/settings", { lead_hours: 48, horizon_days: 20 }, authW);
ok("booking rules save", r.status === 200, "got " + r.status);
d = await (await get("/api/availability")).json();
ok("the horizon shortens the calendar", d.days.length <= 21, d.days.length + " days");
ok("the notice window closes the next two days", d.days.slice(0, 2).every(x => x.open.length === 0));
r = await post("/api/admin/schedule/settings", { timezone: "Mars/Olympus" }, authW);
ok("an invalid time zone is refused", r.status === 422, "got " + r.status);
await post("/api/admin/schedule/settings", { lead_hours: 2, horizon_days: 60 }, authW);

console.log("\n— hardening —");
for (const p of ["/../server.js", "/..%2fserver.js", "/data/mojave.db", "/server.js", "/admin.html"]) {
  r = await get(p);
  ok("does not serve " + p, r.status === 404 || r.status === 403, "got " + r.status);
}
r = await get("/#/book");
ok("a route-shaped path returns the site", r.status === 200);
r = await get("/api/admin/audit?limit=500", auth); d = await r.json();
ok("the audit log records the logins and edits", d.rows.some(x => x.action === "login") && d.rows.some(x => x.action === "login_failed") && d.rows.some(x => x.action === "schedule_rules"), d.rows.length + " entries");
ok("the spam trap is recorded", d.rows.some(x => x.action === "create_flagged_spam"));
ok("the blocked cross-site write is recorded", d.rows.some(x => x.action === "csrf_blocked"));
r = await get("/api/admin/session", { cookie: "mm_sess=aaa.bbb" });
ok("a forged session cookie is rejected", r.status === 401, "got " + r.status);
r = await get("/healthz");
ok("healthz exposes no data", Object.keys(await r.json()).join() === "ok,uptime,requests");

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
