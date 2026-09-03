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
| `brand/` | his logo rebuilt as vector: shield, virus mark, horizontal and stacked lockups, colour and white, SVG + transparent PNG. `build-logo.js` regenerates them from `shield.svg`, `virus.svg` and the outlined text. |
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

Everything in `brand/` is transparent and vector, rebuilt from the raster logo on his Yelp
listing and the signage on his building. Colours are sampled from the original: amber
`#FEBD5A`, shield grey `#BCBCBC`, wordmark grey `#737373`. Fonts are outlined into paths,
so the SVGs need no font installed.

| File | Use |
|---|---|
| `mojave-medical-logo-horizontal-primary-care.svg` / `@2000.png` | primary lockup, tagline as on the building |
| `mojave-medical-logo-horizontal.svg` / `-classic@2000.png` | the Yelp-era tagline "Infections, Wounds, and More" |
| `mojave-medical-logo-horizontal-white.svg` / `@2000.png` | one-colour white for dark backgrounds, like the window graphic |
| `mojave-medical-logo-stacked.svg` / `-white` | square-ish layout for social profiles and print |
| `mojave-medical-shield.svg` / `-white` | the emblem alone |
| `mojave-medical-virus.svg` / `-white`, `@512.png`, `@1024.png` | the virus mark alone; it is the favicon and the rotating O in the header |

The site header sets the wordmark in Montserrat with the virus as the O, rotating once a
minute (and not at all when the visitor prefers reduced motion). The footer and the
printable forms carry the full lockup.

## Notes

- The practice address is **16041 Kamana Rd, Apple Valley, CA 92307**, with no suite
  number. His federal provider record still shows the old Tuscola Road address; see
  `PLAN.md`.
- Notification emails carry only a reference number by design. Patient details stay
  behind the dashboard login. `MAIL_INCLUDE_DETAILS=true` changes that, but only do it
  once a BAA is signed with the email provider.
- The clinic photo comes from his own Google Business Profile.
