# Mojave Medical — Website Pitch & Site Plan

Prepared September 2026 for the pitch to Kevin Ganesh, MD (Mojave Medical, Apple Valley, CA).
Companion files: `index.html` (working prototype), `src/` (source parts), `assets/` (portrait, existing brand), `research/` (raw research).

## 1. Why he should say yes (pitch angles)

1. **His business card already promises a website that doesn't exist.** The card on his Yelp listing prints `MojaveMedical.org`. That domain is unregistered and available today. Register it before someone else does.
2. **Third-party directories are his homepage, and they're wrong.** Practo calls him "Mr. Kevin Ganesh" with "Free Consultation" and hours of 9 AM–9 PM seven days a week. Vitals lists his primary office as his old residency address in Richmond, VA. Doximity shows a phantom Stanford gastroenterology residency. Healthgrades shows 9 AM–5 PM while Yelp shows 8 AM–5 PM plus Saturdays. A site of record fixes the source of truth.
4. **He is the only board-certified ID physician in Apple Valley without a website.** Dr. Vincent Covelli (Providence St. Mary) has MyChart, online scheduling and video visits. Dr. Mallad is closed to new patients. Dr. Bhagat (Victorville) has no site. The new-patient market is his to take.
5. **His one negative review is about the front desk and payment, not medicine.** Online booking, clear payment info and a "we confirm by text" promise fix that structurally, and the site presents the three 5-star reviews he already has.
6. **Four other "Mojave Medical" businesses and his father's "Ganesh Medical Center" at the same address confuse search engines.** Schema markup, "Apple Valley" in every title, Suite B everywhere, and a footer disambiguation line separate his brand.
7. **Unclaimed niches he can own in local search:** Valley Fever, HIV/PrEP, travel medicine, post-discharge OPAT follow-up, and telehealth for Barstow and Lucerne Valley patients who currently drive to Loma Linda.

## 2. Verified profile (safe for site copy)

| Item | Value | Source |
|---|---|---|
| Name | Kevin Naresh Ganesh, MD | NPI registry |
| NPI / CA license | 1225563026 / A169955 (2020–2028) | NPPES, Doximity |
| Board certifications | ABIM Infectious Disease; ABIM Internal Medicine | Providence, Doximity, Healthgrades |
| Medical school | Eastern Virginia Medical School, 2013–2017 | DVMC credentialing JSON, Doximity |
| Residency | Internal Medicine, VCU Health, Richmond, 2017–2020 | Doximity, Healthgrades |
| Fellowship | Infectious Disease, Keck School of Medicine of USC / LA General, 2020–2022 | Doximity, DVMC, PubMed affiliation |
| Hospital privileges | Providence St. Mary (7/2022), Desert Valley Hospital (7/2022), Victor Valley Global (8/2022) | DVMC credentialing JSON |
| Practice address (current) | Mojave Medical, **16041 Kamana Rd**, Apple Valley CA 92307. No suite number. | Google Business Profile address string, building signage photo, US Census geocoder |
| Practice address (stale, still everywhere) | 15982 Tuscola Rd, Suite B | NPPES (last updated 2025-07-20), Yelp, Healthgrades, Providence, Doximity, Practo |
| Organization NPI | 1578215307, "MOJAVE MEDICAL", DBA "MOJAVE MEDICAL: KEVIN GANESH MD", authorized official Dr. Kevin Ganesh, CEO | NPPES |
| Phone / fax / email | (760) 688-0084 / (760) 688-0470 / mojavemedicalclinic@gmail.com | NPPES, business card, DVMC |
| Hours | Mon–Fri 8–5, Sat 1–5, Sun closed | Yelp (owner-claimed listing) |
| Accepting new patients / telehealth | Yes / Yes | Providence, Healthgrades |
| Publication | Park SY, Faraci G, Ganesh K, Dubé MP, Lee HY. Portable Nanopore sequencing solution for next-generation HIV drug resistance testing. J Clin Virol 2024 Apr. PMID 38219684 | PubMed |
| Age | 37 | Healthgrades page state |
| Google Business Profile | "Kevin Ganesh MD - Mojave Medical", category *Infectious disease physician*, **no website set**, two photos (logo, building exterior) | Google Maps place /g/11y3n827gf |
| His own tagline | "Infections, Wounds, Primary Care and More" | Window graphic in the building photo |
| Existing brand | Amber + grey shield emblem, virus icon as the "O" in MOJAVE, tagline "Infections, Wounds, and More", small-caps serif business card | Yelp photos |

Reviews: Yelp 4.0 (3× five-star, 1× one-star); Healthgrades 5.0 from one survey (all seven sub-scores 5/5). No reviews on Google could be retrieved programmatically; verify in a browser.

Insurance (Healthgrades/Sharecare, 11 carriers): Aetna, Anthem Blue Cross, Blue Shield of CA, BCBS PPO, Cigna, Health Net, UnitedHealthcare, Molina (Marketplace), Oscar, CareFirst. Providence adds CareMore, Blue Shield and Health Net Medicare Advantage.

### The address, settled

Two candidates existed. The evidence is now conclusive for **16041 Kamana Rd**:

- His Google Business Profile's address *string* reads "16041 Kamana Rd, Apple Valley, CA 92307", recovered from three independent Google entry points.
- The profile's cover photo is a daylight photograph of the building showing raised letters "MOJAVE MEDICAL / KEVIN GANESH MD", the mounted street number "16041", and a window graphic reading "Infections, Wounds, Primary Care and More". Its EXIF timestamp is 4 June 2026, so the signage was up by then.
- The US Census geocoder places 16041 Kamana Rd 45 m from the Google pin and 15982 Tuscola Rd 155 m away.
- The LoopNet lease listing for that suite has been withdrawn.
- **No suite number.** Google shows none, the signage shows none, and every "Ste A" tenant at 16041 Kamana is somebody else (Harbans Singh MD, nephrology). Do not invent one.

The move happened between 20 July 2025 and 4 June 2026. His CMS NPI records, individual and organizational, both still show Tuscola. **Updating NPPES should be step one of the engagement**, because insurance claims and every directory feed off it.

### Conflicts to confirm with Dr. Ganesh before launch
- Hours: Yelp 8–5 + Sat 1–5 vs Healthgrades 9–5 vs Practo 9–21 daily. Prototype uses Yelp.
- Suite number, if the building has one that the signage omits.
- Whether the second phone line on the organizational NPI record, (760) 498-6140, is still in use.
- Payment: Yelp says credit cards accepted; the May 2025 review says cash or check only, no HSA/FSA. Prototype says cards accepted, "call about HSA/FSA".
- Languages: every directory says English only. Spanish version of the site is offered as a feature; do not claim Spanish-speaking staff until confirmed.
- Doximity "Stanford GI residency 2021–2027" and Practo "UC Irvine medical school 2010" are directory errors. Excluded.
- Dr. Naresh J. Ganesh (internist, 40+ years, Suite A, same building) is very likely his father. A "second-generation Apple Valley physician" story would be powerful. Ask before using.
- mojavemedicalclinic.com was registered April 2025 by a California registrant on Squarespace and is now expired. Ask whether that was his own abandoned attempt.
- Portrait: the prototype uses his public Doximity headshot. Budget a real photo session (clinic, exam room, exterior) for launch.
- Second publication: Doximity says two, PubMed shows one. Ask.

## 3. Domain strategy

**Decided (Sept 3 2026): the practice is using `mojavemedclinic.com` as the primary domain,
with `kevin.ganesh@mojavemedclinic.com` as the contact address.** The table below is the
original availability research and is kept for the defensive registrations still worth taking.

| Domain | Status (RDAP, Sept 2 2026) | Recommendation |
|---|---|---|
| mojavemedclinic.com | **Chosen** | Primary domain. Site, email and all canonical URLs point here. |
| mojavemedical.org | Available | Still worth registering as a defensive redirect; it is on his business cards. |
| drkevinganesh.com, kevinganeshmd.com | Available | Register as defensive redirects and for the personal brand. |
| mojavemedical.care / .clinic / .doctor / .health / .net / .us | Available | Optional defensive set (.net and .clinic at minimum). |
| mojavemedicalapplevalley.com, mojaveinfectiousdisease.com, mojaveidclinic.com | Available | Optional SEO redirects. |
| drganesh.md, mojave.md, kevinganesh.md | Available | .md reads as "MD"; drganesh.md is a nice short vanity URL. |
| mojavemedical.com | Taken since 2004 (NameCheap, no nameservers, unused) | Worth a quiet acquisition inquiry. |
| mojavemedicalclinic.com | Taken April 2025, expired Squarespace, CA registrant | Confirm whether it's his. If so, renew and redirect. |
| mojavemed.com, drganesh.com, ganeshmd.com, mojaveid.com, highdesertid.com, ganeshid.com | Taken | Skip. |

## 4. Design system

- **Direction:** "Desert Clinical." The precision of a modern clinical brand (credibility for referring physicians, speed, credential blocks, sticky Book button) wearing the warmth of the High Desert and his existing amber identity. Not the generic cream-and-terracotta look.
- **Color:** ink `#10202F` (night sky), ground `#F8F7F4`, sand `#EFEBE3`, amber `#FEBD5A` (sampled from his logo, used for the Book button and the virus mark), ochre `#8A5A0E` (amber as text, AA-safe), sage `#2F6B5B` (telehealth/success). Full dark theme defined.
- **Type:** Montserrat for the wordmark and name, as in his logo; Spectral for display headings; Hanken Grotesk for body; IBM Plex Mono for labels, hours and phone numbers.
- **Logo:** his own logo, extracted from the source artwork rather than redrawn. The background is flood-filled away and the edges feathered, so the emblem has a true alpha channel and sits on light or dark. The emblem appears in the header, on the card over his portrait, in the footer and on every printable form; the real virus rotates as the O in the wordmark; the app icon is the emblem on an ink tile. Files in `brand/`.
- **Layout:** 1180px grid, split hero with arch-cropped portrait, hospital affiliation strip, bento "what we treat" grid, three-step visit process, credential facts, reviews, insurance chips, location card with schematic map, referring-physician panel. Sticky Call/Book bar on mobile.
- **Motion:** page fade-rise, 60-second slow rotation on the mark, hover lifts only. Honors `prefers-reduced-motion`.
- **Accessibility:** WCAG 2.2 AA contrast on all text, skip link, visible focus, semantic landmarks, labeled form fields, keyboard-operable calendar. ADA lawsuits target medical sites; this matters.
- **Bilingual:** full English/Spanish toggle across every page including the booking flow. The census supports it: Apple Valley is 40.2% Hispanic, 22.5% speak Spanish at home, and 7.1% are Spanish speakers with limited English. Victorville, which feeds his hospital referrals, is 58.7% Hispanic with 39% speaking Spanish at home. Confirm who at the practice actually speaks Spanish before launch, and if nobody does, keep the translated pages but say so plainly rather than implying a bilingual front desk.

## 5. Sitemap

| Page | Job | Key sections |
|---|---|---|
| Home | Convert referred and searching patients | Hero, affiliations, what we treat, how a visit works, meet Dr. Ganesh, post-discharge band, reviews, insurance, location, referring physicians |
| About Dr. Ganesh | Credibility for patients and colleagues | Bio, approach, timeline, certifications, publication, hospital staff |
| Conditions & Services | Rank for condition searches | 12 infectious disease services, 6 internal medicine services, referral note |
| Patient Info | Reduce front-desk friction | What to bring, video visits, payment, insurance, forms, FAQ |
| Reviews | Social proof | Ratings, verbatim quotes, leave-a-review link |
| Contact | NAP consistency, directions, referrals | Address, phone, fax, email, hours, map, parking, emergency note |
| Book | Appointment requests | 4-step flow: visit type, calendar + times, details, confirm |

Phase-2 pages: Valley Fever, HIV & PrEP, Travel Medicine, Wound Infections (each a local-SEO landing page), plus a short news/blog for seasonal posts (flu, COVID, Valley Fever season).

## 6. Booking and technology recommendation

- **Site:** one small Node 24 container serving the static site plus the appointment API, deployed on Coolify with Docker. Sub-second loads on rural mobile, no plugin maintenance, no WordPress attack surface. See `DEPLOY.md`.
- **Booking, phase 1 (launch):** built and working. The form posts to a small Node API that stores requests in SQLite and shows them on a staff dashboard at `/admin`. Notification emails deliberately carry only a reference number; patient details stay behind the login. Add the "Book" link to his Google Business Profile, which currently has no website set at all.
- **Booking, phase 2:** true real-time scheduling through his EHR. If he uses Tebra/Kareo, use Tebra's patient portal scheduling; if eClinicalWorks, Healow; otherwise NexHealth sits on top of most EHRs. Confirm the EHR first.
- **Telehealth:** Doxy.me (free HIPAA tier) or the EHR's built-in video.
- **Analytics:** privacy-first (Plausible or Fathom). No Meta Pixel or Google Ads remarketing on a medical site; FTC and OCR have penalized practices for this.
- **Local SEO:** Physician + MedicalClinic JSON-LD (already in the prototype), NAP cleanup on Google, Yelp, Healthgrades, Practo, Vitals and the DVMC directory, sameAs links, "Apple Valley" and "High Desert" in titles.
- **Email:** the practice address is now kevin.ganesh@mojavemedclinic.com; add a shared frontdesk@ alias before launch so requests do not sit in one personal inbox. For sending, Paubox includes a BAA on every account including its free tier; Amazon SES and Google Workspace also sign one. SendGrid, Postmark, Resend and Brevo will not, so they are out.

## 7. Proposed engagement

| Phase | Scope | Timeline |
|---|---|---|
| 0. Foundations | **Update the NPI records to Kamana Rd**, register domains, Google Workspace, set the website on his Google Business Profile, photo session | Week 1 |
| 1. Launch site | Logo rebuilt as vector, 10 pages including privacy, accessibility and printable patient forms, bilingual, working booking API with staff dashboard, schema | Done |
| 2. Scheduling | EHR-connected real-time booking, patient portal link, online intake forms | Weeks 4–6 |
| 3. Growth | Condition landing pages, review-generation flow (text after visit), quarterly content | Ongoing |

## 8. Sources

Yelp, Yahoo Local, Healthgrades, Sharecare, Vitals, WebMD Care, Healthline FindCare, Providence.org, psjhmedgroups.org, providers.dvmc.com, Doximity, Practo, US News (snippet), NPPES NPI Registry, PubMed E-utilities, RDAP domain lookups. Raw extracts in `research/`.

## Published artifacts

- Working prototype: https://claude.ai/code/artifact/bcdf6070-d9c1-4f0b-b53d-fb8889655c86
- This plan as a shareable page: https://claude.ai/code/artifact/7d2b24cf-5462-43e9-a4d6-e0cfdf446935
