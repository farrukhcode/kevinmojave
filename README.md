# Mojave Medical — website + appointment system

For Kevin Ganesh, MD · Infectious Disease and Internal Medicine · Apple Valley, CA

## Run it

```
./build.sh                 # regenerate index.html, dist/, and server/public/ from src/
cd server && npm install
DATA_DIR=./data ADMIN_USER=dev ADMIN_PASS=dev PORT=3000 npm start
```

Site at `http://localhost:3000`, staff dashboard at `http://localhost:3000/admin`.
Over plain `http`, add `NODE_ENV=development` so the session cookie is not dropped for
being non-Secure.

`index.html` also opens straight from disk for design work, but the booking calendar needs
the server: openings come from `/api/availability`, and with no server the page says so and
points at the phone number rather than inventing times.

Check everything still works after a change (use a throwaway `DATA_DIR`; the suite books,
blocks and closes days):

```
cd server
DATA_DIR=/tmp/mm-test ADMIN_USER=test ADMIN_PASS=secret123 PORT=3999 \
  SITE_HOST=localhost NODE_ENV=development RATE_LIMIT_PER_HOUR=50 node server.js &
npm test
```

## Layout

| Path | What it is |
|---|---|
| `src/part1-head.html` | the whole stylesheet and design tokens |
| `src/part2-skeleton.html` | page chrome and the Physician / MedicalClinic JSON-LD |
| `src/part3-content.js` | every word on the site, English and Spanish |
| `src/part4-app.js` | router, page renderers, booking flow, the map |
| `src/map.svg.txt` | schematic map, generated from real OpenStreetMap geometry |
| `src/plan-template.html` | the pitch brief page |
| `server/server.js` | HTTP server: static files, appointment API, admin |
| `server/lib/` | `db.js` (SQLite), `schedule.js` (availability engine), `security.js` (sessions, CSRF, lockout), `mail.js` (SMTP), `validate.js`, `util.js` |
| `server/admin.html` | staff dashboard: requests, day calendar, weekly hours, activity log |
| `server/test.mjs` | end-to-end checks for booking, scheduling and the security controls |
| `Dockerfile`, `docker-compose.yml`, `.env.example` | deployment |
| `brand/` | his own logo, extracted from the source artwork with a real alpha channel. `extract-from-source.js` regenerates it from `assets/logo-source-hd.png`. |
| `assets/` | headshot, clinic exterior photo, his original logo raster and business card |
| `PLAN.md`, `DEPLOY.md` | the pitch brief and the Coolify guide |
| `research/` | raw research output |

Edit copy in `src/part3-content.js`, then run `./build.sh`. Nothing else needs touching.

## Endpoints

| Route | Auth |
|---|---|
| `GET /` and the site | public |
| `GET /api/availability` | public, rate limited |
| `POST /api/appointments` | public, rate limited to 8/hour per IP |
| `POST /api/admin/login`, `/logout`, `GET /api/admin/session` | public / session |
| `GET /admin` | the page is public, all of its data is not |
| `GET`/`POST /api/admin/appointments`, `POST /api/admin/appointments/:ref` | staff |
| `GET /api/admin/day`, `GET /api/admin/agenda` | staff |
| `GET /api/admin/schedule`, `POST .../rules`, `.../settings`, `.../override` | staff |
| `POST /api/admin/blocks` | staff |
| `GET /api/admin/export.csv`, `GET /api/admin/audit` | staff |
| `GET /healthz` | public, no data |

Staff auth is a signed `HttpOnly` / `SameSite=Strict` session cookie from the sign-in form;
the same credentials also work as HTTP Basic for scripts. Writes additionally require a
same-origin request, a JSON content type, and — for a browser session — a CSRF token.

## How appointments work

The website never invents an opening. `GET /api/availability` computes them from the
schedule staff keep in the dashboard:

- **Weekly hours** — one or more windows per weekday, each with its own slot length and how
  many patients can be seen at once. Two windows on a day is how you get a lunch break.
- **Overrides** — one date that is closed, or that has its own hours.
- **Blocks** — an hour for hospital rounds, or a date range for a conference. A block closes
  the time outright, whatever the capacity is.
- **Rules** — how much notice a booking needs, and how far ahead the calendar opens.

A request holds its slot the moment it arrives, inside a transaction, so two patients cannot
book the same time; a visit longer than one slot holds every slot it covers. If the slot goes
while a patient is filling in their details, the server returns `409` and the page says so
instead of pretending the booking worked.

## Brand assets

`brand/` holds his actual logo, not a redraw. The background was flood-filled away and the
edges feathered, so every file has a true alpha channel and sits cleanly on light or dark.

| File | Use |
|---|---|
| `mojave-medical-emblem.png` | the shield with the masked physician. Header, portrait card, footer, printable forms, app icon. |
| `mojave-medical-virus-mark.png` | the virus alone. It is the rotating O in the wordmark. |
| `mojave-medical-logo-full.png` | the whole lockup, for light backgrounds and print. |
| `mojave-medical-logo-full-dark.png` | the same, with only the type lightened for dark backgrounds. |
| `mojave-medical-app-icon.png` | the emblem on an ink tile, 512px. |
| `extract-from-source.js` | regenerates all of the above from `assets/logo-source-hd.png`. |

Favicons at 32, 180 and 192 are generated into `server/public/` by `build.sh`.
`brand/_superseded-vector/` holds an earlier vector redraw; it is not used.

## Notes

- The practice address is **16041 Kamana Rd, Apple Valley, CA 92307**, with no suite
  number. His federal provider record still shows the old Tuscola Road address; see
  `PLAN.md`.
- Notification emails carry only a reference number by design. Patient details stay
  behind the dashboard login. `MAIL_INCLUDE_DETAILS=true` changes that, but only do it
  once a BAA is signed with the email provider.
- The clinic photo comes from his own Google Business Profile.
- The booking form has a hidden spam trap. A filled trap **flags** the request as spam and
  still stores it — it never discards it. An autofill profile or a password manager can fill
  a hidden field as easily as a bot can, and a request thrown away silently is a patient who
  believes they have an appointment.
