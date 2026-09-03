# Deploying Mojave Medical on Coolify

The whole site is one small Node container: it serves the static site, takes appointment
requests, stores them in SQLite on a persistent volume, emails the front desk, and gives
staff a dashboard at `/admin`. No database server, no Redis, no build step at runtime.

## 1. What runs where

| Path | What it is | Access |
|---|---|---|
| `/` | the website | public |
| `/api/appointments` | `POST` an appointment request | public, rate limited |
| `/admin` | staff dashboard: view, filter, mark contacted, add notes, export CSV | HTTP Basic auth |
| `/api/admin/*` | dashboard data, CSV export, audit log | HTTP Basic auth |
| `/healthz` | health check Coolify polls | public, no data |

Requests live in `/app/data/mojave.db` inside the container, which is a Docker volume, so
redeploys do not lose anything.

## 2. Deploy

Use the **Dockerfile build pack**, not Docker Compose. Compose apps in Coolify give up
rolling updates and force storage, env and health config into the compose file. The
Dockerfile pack keeps all of that in the Coolify UI, and lets you pin the exact Node
version. A `docker-compose.yml` is included as a fallback for plain Docker hosts.

1. Push this repository to GitHub or GitLab.
2. In Coolify: **+ New** → **Resource** → **Application** → your repo → build pack
   **Dockerfile**.
3. Set **Ports Exposes** to `3000`. Leave **Ports Mappings** empty: publishing a host port
   bypasses the proxy and silently disables rolling updates.
4. **Domains**: `https://mojavemedical.org,https://www.mojavemedical.org`, direction
   *Allow www & non-www*. Point an A record at the server. That is the whole Let's Encrypt
   setup; keep port 80 open for the ACME challenge.
5. **Persistent Storage** tab: name `mojave-data`, leave Source Path empty, Destination
   Path `/app/data`. Use a named volume, never a bind mount.
6. **Advanced** tab: turn on **Consistent Container Name**. This deliberately disables
   rolling updates so two containers never hold the same SQLite file open at once. You
   trade five to fifteen seconds of downtime per deploy for not corrupting the database.
7. **Environment Variables**: paste from `.env.example` with real values. Mark
   `ADMIN_PASS`, `SMTP_PASS` and `IP_SALT` as secrets.
8. **Health Check** tab: path `/healthz`, port 3000, start period 20s, interval 5s,
   timeout 3s, retries 12. The Dockerfile also declares a `HEALTHCHECK`; if you prefer to
   drive it from the UI, delete that line first, because a Dockerfile `HEALTHCHECK` wins
   and makes the UI settings inert.
9. Deploy. Watch the logs for `Mojave Medical server on http://0.0.0.0:3000`.

Generate the two secrets first:

```
openssl rand -base64 24   # ADMIN_PASS
openssl rand -hex 16      # IP_SALT
```

Auto-deploy on push: enable the webhook in Coolify's **Webhooks** tab and add it to the
repo. Every push to the default branch rebuilds and restarts the container.

### Things that bite people on Coolify

- **Bind to `0.0.0.0`, never `127.0.0.1`.** A container on loopback is invisible to the
  proxy. This is the most common cause of *502 Bad Gateway* and *No available server* on
  Coolify. `HOST=0.0.0.0` is already set, and Coolify injects it too.
- **Ports Exposes must match `PORT`.** Traefik never reads your `PORT` variable; it routes
  using the label Coolify generates from Ports Exposes. Coolify logs a warning when they
  disagree, and the result is a bad gateway.
- **Use a named volume, not a bind mount,** for `/app/data`. Bind mounts inherit host
  permissions, the container runs as uid 10001, and you get an `EACCES` that comes back on
  every redeploy. The Dockerfile chowns `/app/data` before dropping privileges.
- **`TRUST_PROXY=true`** so rate limiting sees the real client IP from `X-Forwarded-For`,
  not the proxy's address, which would rate-limit every visitor as if they were one person.
- **Give the health check a real start period.** A 0 second start period marks a booting
  Node process unhealthy and rolls the deploy back.
- **Check Traefik is v3.6.1 or newer** under Servers → Proxy → Configuration. Older builds
  pin a Docker API version and report *No available server* against a healthy container.

## 3. Email

`SMTP_HOST` unset means email is simply disabled. Requests are still saved and visible in
`/admin`; nothing is lost. Set it when you are ready.

**By default, staff notification emails contain only a reference number and the visit type.**
Names, dates of birth and reasons for visit stay behind the `/admin` login. That keeps
identifiable health information out of mail servers, which matters because a US medical
practice needs a signed Business Associate Agreement with anyone who handles that data.
Set `MAIL_INCLUDE_DETAILS=true` only once a BAA is signed with both the SMTP provider and
the mailbox provider.

Providers that will sign a BAA:

| Provider | SMTP host | BAA | Notes |
|---|---|---|---|
| **Paubox** | `smtp.paubox.com:587` | Yes, on every account including the free tier | Username is the literal string `apikey`, password is your API key. Easiest correct answer for a solo practice. |
| Google Workspace | `smtp.gmail.com:587` | Yes, on any paid edition | Use an App Password. Good if the practice already uses Workspace. Legacy free editions cannot accept a BAA. |
| Amazon SES | `email-smtp.<region>.amazonaws.com:587` | Yes, accept it in AWS Artifact | Cheapest at volume. Needs domain verification and a production-access request to leave the 200/day sandbox. |
| Microsoft 365 | `smtp.office365.com:587` | Included in the Online Services DPA, no separate signature | Fine if the practice is on Outlook. |

**Do not use SendGrid, Postmark, Resend or Brevo.** None of them will sign a BAA, and
SendGrid's and Postmark's own documentation says so explicitly.

One more subtlety: for a specialty practice, the *sender identity alone* can be revealing.
Keep the From name as the practice name, never the specialty, and keep the subject generic.

Add these DNS records so mail from a brand-new domain is not filed as spam:

```
TXT  @             v=spf1 include:_spf.google.com ~all
TXT  google._domainkey    (the DKIM value Workspace generates)
TXT  _dmarc        v=DMARC1; p=quarantine; rua=mailto:dmarc@mojavemedical.org
```

Swap the SPF include for `amazonses.com` if you use SES.

## 4. Backups

Coolify has native scheduled volume backups. Use them rather than a cron sidecar.

On the application, open **Storage → Backups**, add a backup for the `mojave-data` volume,
set frequency `daily` (or `0 3 * * *`), turn on **Stop During Backup** so the archive is
taken against a quiesced database, and turn on **Save to S3** pointing at an S3 target you
added under Settings → S3. Cloudflare R2, Backblaze B2, Wasabi and AWS all work. Set both
local and remote retention.

Archives land at `/data/coolify/backups/volumes/<team>/<uuid>/<name>-<timestamp>.tar.gz`.

If you need point-in-time recovery on top of the nightly snapshot, add Litestream in the
same container replicating to S3 with a one second sync interval.

**Test the restore quarterly.** Extract a backup into a scratch volume and run
`PRAGMA integrity_check;`. A backup you have never restored is not a backup, and this one
holds patient information. Keep the archives encrypted.

## 5. Local development

```
./build.sh                     # regenerate server/public from src/
cd server && npm install
DATA_DIR=./data ADMIN_USER=dev ADMIN_PASS=dev PORT=3000 npm start
```

Then open `http://localhost:3000` and `http://localhost:3000/admin`.

## 6. Before this goes live for a real practice

- Sign a BAA with the hosting provider and the email provider.
- Turn on `RETAIN_DAYS` so closed requests are purged on a schedule.
- Replace HTTP Basic auth on `/admin` with per-user logins if more than a couple of staff
  need access, so the audit log attributes actions to a person.
- Confirm hours, insurance list, payment methods and the suite number with Dr. Ganesh.
- Have a lawyer review the privacy notice before publishing it.
