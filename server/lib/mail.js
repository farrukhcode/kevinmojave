import nodemailer from "nodemailer";

/**
 * Email is deliberately PHI-light.
 *
 * MAIL_INCLUDE_DETAILS=false (the default) sends staff only a reference number and
 * the visit type. Names, dates of birth and reasons for visit stay in the dashboard,
 * behind a login. That keeps identifiable health information out of mail servers you
 * may not have a BAA with. Set it to true only once a BAA is signed with the mail
 * provider AND the mailbox provider.
 */
export function makeMailer(env, log) {
  if (!env.SMTP_HOST) {
    log.warn("SMTP_HOST not set - email notifications are disabled; requests are still saved to the database.");
    return { enabled: false, async notifyStaff() {}, async confirmPatient() {}, async verify() { return false; } };
  }
  const port = Number(env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: env.SMTP_SECURE ? env.SMTP_SECURE === "true" : port === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    requireTLS: port !== 465,
    tls: { minVersion: "TLSv1.2" },
    pool: true,
    maxConnections: 2,
  });

  const from = env.MAIL_FROM || `Mojave Medical <no-reply@${(env.SITE_HOST || "example.com").replace(/^www\./, "")}>`;
  const to = (env.MAIL_TO || "").split(",").map(s => s.trim()).filter(Boolean);
  const includeDetails = env.MAIL_INCLUDE_DETAILS === "true";
  const site = env.SITE_URL || "";

  const verify = async () => {
    try { await transport.verify(); log.info("SMTP connection verified"); return true; }
    catch (e) { log.error("SMTP verify failed: " + e.message); return false; }
  };

  async function notifyStaff(a) {
    if (!to.length) { log.warn("MAIL_TO not set - staff notification skipped"); return; }
    const when = a.requested_date ? `${a.requested_date} at ${a.requested_time || "no time given"}` : "no preference given";
    const lines = includeDetails
      ? [
          `New appointment request ${a.ref}`, "",
          `Visit:      ${a.visit_label || a.visit_type}`,
          `Requested:  ${when}`,
          `Patient:    ${a.first_name} ${a.last_name}`,
          `DOB:        ${a.dob || "-"}`,
          `Phone:      ${a.phone}`,
          `Email:      ${a.email || "-"}`,
          `Insurance:  ${a.insurance || "-"}`,
          `Status:     ${a.patient_status === "est" ? "Established patient" : "New patient"}`,
          `Referred:   ${a.referred_by || "-"}`,
          `Reason:     ${a.reason || "-"}`, "",
          `Open the dashboard: ${site}/admin`,
        ]
      : [
          `New appointment request ${a.ref}`, "",
          `Visit:      ${a.visit_label || a.visit_type}`,
          `Requested:  ${when}`,
          "",
          "Patient details are not included in this email by design.",
          `Open the dashboard to view and respond: ${site}/admin`,
        ];
    await transport.sendMail({
      from, to,
      subject: `[Mojave Medical] Appointment request ${a.ref}`,
      text: lines.join("\n"),
      headers: { "X-Entity-Ref-ID": a.ref, "Auto-Submitted": "auto-generated" },
    });
    log.info(`staff notification sent for ${a.ref}`);
  }

  async function confirmPatient(a) {
    if (!a.email || env.MAIL_CONFIRM_PATIENT === "false") return;
    const es = a.lang === "es";
    const subject = es ? `Recibimos su solicitud de cita (${a.ref})` : `We received your appointment request (${a.ref})`;
    const body = es
      ? [`Gracias, ${a.first_name}.`, "",
         `Recibimos su solicitud de cita. Número de referencia: ${a.ref}.`,
         "Nuestro consultorio le llamará o enviará un mensaje de texto en un día hábil para confirmar la hora.",
         "", "Esto no es una confirmación de cita.",
         "Si esto es una emergencia, llame al 911.", "",
         "Mojave Medical · Kevin N. Ganesh, MD", "16041 Kamana Rd, Apple Valley, CA 92307", "(760) 688-0084"]
      : [`Thank you, ${a.first_name}.`, "",
         `We received your appointment request. Your reference number is ${a.ref}.`,
         "Our office will call or text you within one business day to confirm a time.",
         "", "This is not an appointment confirmation.",
         "If this is an emergency, call 911.", "",
         "Mojave Medical · Kevin N. Ganesh, MD", "16041 Kamana Rd, Apple Valley, CA 92307", "(760) 688-0084"];
    await transport.sendMail({
      from, to: a.email, subject, text: body.join("\n"),
      headers: { "Auto-Submitted": "auto-generated" },
    });
    log.info(`patient acknowledgement sent for ${a.ref}`);
  }

  return { enabled: true, notifyStaff, confirmPatient, verify };
}
