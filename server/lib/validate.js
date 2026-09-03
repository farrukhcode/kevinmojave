const VISIT_TYPES = {
  new:    { label: "New patient consultation", dur: 45 },
  post:   { label: "After a hospital stay",    dur: 30 },
  follow: { label: "Follow-up visit",          dur: 20 },
  video:  { label: "Video visit",              dur: 20 },
  wound:  { label: "Wound check",              dur: 30 },
  travel: { label: "Travel consultation",      dur: 30 },
};

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

export function validateAppointment(body) {
  const errors = {};
  const out = {};

  const type = str(body.visit_type, 20);
  if (!VISIT_TYPES[type]) errors.visit_type = "Choose a visit type";
  else { out.visit_type = type; out.visit_label = VISIT_TYPES[type].label; out.duration_min = VISIT_TYPES[type].dur; }

  out.first_name = str(body.first_name, 60);
  if (out.first_name.length < 1) errors.first_name = "Required";
  out.last_name = str(body.last_name, 60);
  if (out.last_name.length < 1) errors.last_name = "Required";

  const digits = str(body.phone, 30).replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) errors.phone = "Enter a 10-digit phone number";
  else out.phone = digits.length === 10
    ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    : "+" + digits;

  const email = str(body.email, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Enter a valid email";
  else out.email = email || null;

  const dob = str(body.dob, 10);
  if (dob) {
    if (!isDate(dob)) errors.dob = "Use YYYY-MM-DD";
    else {
      const d = new Date(dob), now = new Date();
      if (d > now) errors.dob = "Date of birth cannot be in the future";
      else if (now.getFullYear() - d.getFullYear() > 130) errors.dob = "Check the year";
      else out.dob = dob;
    }
  } else errors.dob = "Required";

  const rd = str(body.requested_date, 10);
  if (rd) {
    if (!isDate(rd)) errors.requested_date = "Invalid date";
    else out.requested_date = rd;
  }
  const rt = str(body.requested_time, 8);
  if (rt && !/^\d{1,2}:\d{2}$/.test(rt)) errors.requested_time = "Invalid time";
  else out.requested_time = rt || null;

  out.insurance = str(body.insurance, 80) || null;
  out.patient_status = ["new", "est"].includes(str(body.patient_status, 5)) ? str(body.patient_status, 5) : "new";
  out.referred_by = str(body.referred_by, 120) || null;
  out.reason = str(body.reason, 300) || null;
  out.lang = ["en", "es"].includes(str(body.lang, 2)) ? str(body.lang, 2) : "en";

  if (body.consent !== true) errors.consent = "Please confirm you understand this is a request";

  return { ok: Object.keys(errors).length === 0, errors, value: out };
}

export { VISIT_TYPES };
