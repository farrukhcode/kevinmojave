# Mojave Medical — website + appointment system

For Kevin N. Ganesh, MD · Infectious Disease and Internal Medicine · Apple Valley, CA

## Run it

```
./build.sh                 # regenerate index.html, dist/, and server/public/ from src/
cd server && npm install
DATA_DIR=./data ADMIN_USER=dev ADMIN_PASS=dev PORT=3000 npm start
```

Site at `http://localhost:3000`, staff dashboard at `http://localhost:3000/admin`.
`index.html` also opens straight from disk with no server; the booking form then saves
to browser storage instead of the API.

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
| `server/lib/` | `db.js` (SQLite), `mail.js` (SMTP), `validate.js`, `util.js` |
| `server/admin.html` | staff dashboard |
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
| `POST /api/appointments` | public, rate limited to 8/hour per IP |
| `GET /admin` | Basic auth |
| `GET /api/admin/appointments`, `POST /api/admin/appointments/:ref` | Basic auth |
| `GET /api/admin/export.csv`, `GET /api/admin/audit` | Basic auth |
| `GET /healthz` | public, no data |

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
