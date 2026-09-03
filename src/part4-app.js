<script>
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let lang = "en";
  let theme = "auto";
  try { const th = localStorage.getItem("mm_theme"); if (th === "light" || th === "dark" || th === "auto") theme = th; } catch (e) {}
  function applyTheme() {
    const r = document.documentElement;
    if (theme === "auto") r.removeAttribute("data-theme"); else r.setAttribute("data-theme", theme);
    const dark = theme === "dark" || (theme === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    let m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement("meta"); m.name = "theme-color"; document.head.appendChild(m); }
    m.setAttribute("content", dark ? "#0D1822" : "#F8F7F4");
  }
  applyTheme();
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSys = () => { if (theme === "auto") applyTheme(); };
    if (mq.addEventListener) mq.addEventListener("change", onSys); else if (mq.addListener) mq.addListener(onSys);
  }
  try { const l = localStorage.getItem("mm_lang"); if (l === "es" || l === "en") lang = l; } catch (e) {}
  const t = x => x == null ? "" : (typeof x === "string" ? x : (x[lang] != null ? x[lang] : (x.en != null ? x.en : "")));

  /* ---------- icons (24px, stroke) ---------- */
  const I = {
    check: '<path d="M5 12l5 5L20 7"/>',
    phone: '<path d="M5 4h3l2 5-2.2 1.3a12 12 0 0 0 5.9 5.9L15 14l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    video: '<rect x="3" y="7" width="13" height="10" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    fax: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    wound: '<path d="M7 3l14 14-4 4L3 7z"/><path d="M9.5 9.5h.01M12 12h.01M14.5 14.5h.01"/>',
    bone: '<path d="M17 4a3 3 0 0 1 3 3 3 3 0 0 1-3 3l-4 4a3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1-3-3 3 3 0 0 1 3-3l4-4a3 3 0 0 1 3-3 3 3 0 0 1 3 3z"/>',
    hospital: '<path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6M12 10v4M10 12h4"/>',
    ribbon: '<path d="M12 3c-2 0-3.5 1.6-3.5 3.5 0 3 3.5 6 3.5 6s3.5-3 3.5-6C15.5 4.6 14 3 12 3z"/><path d="M9.8 10.5L5 21M14.2 10.5L19 21M8 16l8-5M16 16l-8-5"/>',
    liver: '<path d="M4 9c0-3 3-5 7-5h6c2 0 3 1 3 3s-1 3-3 4l-3 1c-2 1-3 3-5 4s-5 0-5-3V9z"/>',
    fungus: '<circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
    lung: '<path d="M12 4v9M12 13c-1 3-3 4-6 4-2 0-3-1-3-3V9c0-2 1-3 3-3 3 0 5 3 6 7zM12 13c1 3 3 4 6 4 2 0 3-1 3-3V9c0-2-1-3-3-3-3 0-5 3-6 7z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    fever: '<path d="M14 14.5V5a2 2 0 0 0-4 0v9.5a4 4 0 1 0 4 0z"/><path d="M12 9v6"/>',
    plane: '<path d="M2.5 19l19-7-19-7v5l13 2-13 2v5z"/>',
    tick: '<circle cx="12" cy="13" r="5"/><path d="M12 8V5M8 3l2 2M16 3l-2 2M4 12h3M17 12h3M5 18l3-2M19 18l-3-2"/>',
    immune: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M12 8v6M9 11h6"/>',
    stetho: '<path d="M5 3h2v6a5 5 0 0 0 10 0V3h2"/><path d="M12 14v3a4 4 0 0 0 8 0v-2"/><circle cx="20" cy="13" r="2"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    heart: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
    syringe: '<path d="M18 2l4 4M20 4l-9 9M11 13l-5 5M6 18l-3 3M8 10l6 6M14 8l2 2"/>',
    pulse: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    chevL: '<path d="M15 5l-7 7 7 7"/>',
    chevR: '<path d="M9 5l7 7-7 7"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.5"/>',
    file: '<path d="M6 3h8l5 5v13H6zM14 3v5h5M9 13h6M9 17h6"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    auto: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" stroke="none"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
    moon: '<path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2z"/>'
  };
  const ico = (n, cls) => '<svg class="i' + (cls ? " " + cls : "") + '" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[n] || "") + "</svg>";
  const MARK = cls => '<img class="' + (cls || "mark") + '" src="' + EMBLEM + '" alt="" aria-hidden="true" width="191" height="252">';
  const SUN = '<img class="sun spin" src="' + VIRUS_MARK + '" alt="" aria-hidden="true">';
  const VIRUS_O = spin => '<span class="virus-o"><img class="' + (spin ? "spin" : "") + '" src="' + VIRUS_MARK + '" alt="" aria-hidden="true" width="100" height="100"></span>';
  const LOCKUP = () =>
    '<span class="emblem"><img src="' + EMBLEM + '" alt="" aria-hidden="true" width="191" height="252"></span>' +
    '<span class="lock-text"><span class="lock-word"><span>M</span>' + VIRUS_O(false) + '<span>jave Medical</span></span>' +
    '<span class="lock-tag">' + esc(t(C.location.signTag)) + '</span>' +
    '<span class="lock-name">Kevin Ganesh MD</span></span>';
  const stars = n => '<span class="stars" aria-label="' + n + ' of 5 stars">' + "★★★★★".slice(0, n) + "</span>";

  /* ---------- helpers ---------- */
  const pad = n => (n < 10 ? "0" : "") + n;
  const ymd = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const fromYmd = s => { const p = s.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  const fmtDate = d => lang === "es"
    ? t(C.ui.days)[d.getDay()].toLowerCase() + " " + d.getDate() + " de " + t(C.ui.months)[d.getMonth()]
    : t(C.ui.days)[d.getDay()] + ", " + t(C.ui.months)[d.getMonth()] + " " + d.getDate();
  const fmtTime = m => { const h = Math.floor(m / 60), mm = pad(m % 60); if (lang === "es") return h + ":" + mm; const h12 = h % 12 === 0 ? 12 : h % 12; return h12 + ":" + mm + (h < 12 ? " AM" : " PM"); };
  const hoursSrc = () => (AV.hours && AV.hours.length ? AV.hours : C.location.hours);
  const hoursRow = (d) => { const r = hoursSrc().find(x => x.d === d); return r && r.en ? t(r) : t(C.ui.closed); };
  const todayDow = new Date().getDay();
  let toastTimer;
  function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2600); }

  function hoursTable() {
    const order = [1, 2, 3, 4, 5, 6, 0];
    return '<table class="hours"><tbody>' + order.map(d =>
      '<tr' + (d === todayDow ? ' class="today"' : "") + "><td>" + esc(t(C.ui.days)[d]) + (d === todayDow ? ' <span class="small">· ' + esc(t(C.ui.today)) + "</span>" : "") + "</td><td>" + esc(hoursRow(d)) + "</td></tr>"
    ).join("") + "</tbody></table>";
  }
  function addressCard(extraKv) {
    return '<div class="card"><address class="addr"><b>Mojave Medical</b><br>' + esc(ADDRESS.line1) + "<br>" + esc(ADDRESS.city) + "</address>" +
      '<dl class="kv"><dt>' + esc(t(C.contact.phone)) + '</dt><dd><a class="mono" href="' + PHONE_TEL + '">' + PHONE + "</a></dd>" +
      "<dt>" + esc(t(C.contact.fax)) + '</dt><dd class="mono">' + FAX + "</dd>" +
      (extraKv || "") + "</dl>" +
      '<div class="flex" style="margin-top:1.2rem"><a class="btn btn-ink btn-sm" href="' + ADDRESS.maps + '" target="_blank" rel="noopener">' + ico("pin") + esc(t(C.ui.directions)) + '</a><a class="btn btn-ghost btn-sm" href="#/book">' + ico("cal") + esc(t(C.ui.book)) + "</a></div>" +
      '<h3 style="margin-top:1.6rem;font-size:1.15rem">' + esc(t(C.ui.hoursTitle)) + "</h3>" + hoursTable() + "</div>";
  }
  const MAP_SVG = "<svg viewBox=\"0 0 680 470\" role=\"img\" aria-label=\"Map showing Mojave Medical at 16041 Kamana Road, Apple Valley, California\" preserveAspectRatio=\"xMidYMid slice\"><defs><pattern id=\"mmgrid\" width=\"34\" height=\"34\" patternUnits=\"userSpaceOnUse\"><path d=\"M34 0H0v34\" fill=\"none\" stroke=\"currentColor\" stroke-opacity=\".055\"/></pattern></defs><rect width=\"680\" height=\"470\" fill=\"url(#mmgrid)\" style=\"color:var(--ink)\"/><g fill=\"none\" stroke=\"var(--line-2)\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><g stroke-width=\"2.2\"><path d=\"M746.8 455.1 L726.3 454.3 L695.3 447.9 L661.0 442.8 L648.9 443.2 L622.6 447.0 L607.3 448.2 L589.1 448.0 L572.4 442.8\"/><path d=\"M514.4 163.6 L503.6 163.4 L494.7 161.8 L488.2 159.1 L482.0 155.5 L466.0 141.7 L453.2 130.8 L448.7 126.9 L429.5 110.6 L425.7 107.3\"/><path d=\"M123.7 376.0 L145.1 368.7 L152.7 366.8 L167.8 363.0 L185.0 359.7 L229.1 352.9 M283.5 337.5 L287.5 336.8 L293.2 336.4 L305.5 339.7 L313.5 339.3 L330.4 336.6 L340.7 335.0 L359.2 332.1 L373.8 329.8 L389.2 327.4 L399.3 325.8 L419.4 322.6\"/><path d=\"M62.0 576.1 L87.2 575.8 L89.5 573.1 L88.7 535.4 L88.4 530.4 L90.3 513.1 L94.0 499.0 L97.0 489.2 L99.4 484.6 L101.9 479.8 L110.4 466.6 L123.0 450.9 L145.5 426.2 L148.7 422.7 L162.0 408.3 M162.0 408.3 L170.2 403.4 L177.7 401.4 L188.9 400.5 L199.0 401.3 L208.5 403.0 L228.5 410.6 L269.9 428.8 L278.4 431.3 L284.9 431.3 L291.3 430.4 L305.0 425.9\"/><path d=\"M123.7 376.0 L121.6 369.1 L121.2 363.4 L121.8 356.7 L126.3 341.6 L129.3 332.9 L132.5 325.2 L139.6 315.4 L146.7 307.5 L158.2 298.2 L171.3 289.2 L180.1 281.6 L183.9 277.6 L188.3 272.5 L194.1 264.1 L199.6 252.9 L206.7 238.5 L212.3 227.6 L216.0 223.0 L220.1 219.5 L227.1 216.4 L231.9 215.4 L238.9 214.3 L245.0 213.1 L250.8 211.6 L256.6 208.6 L261.6 204.0 L276.1 187.5 L312.2 146.0 L340.3 113.9 L349.1 103.7 L353.0 99.3 L362.5 88.3 L374.6 74.5 L391.3 55.3 L396.1 49.8 L420.7 21.5 L466.3 -30.9 L474.5 -40.6 L477.6 -48.8 L478.7 -57.4 L478.3 -65.0 L467.5 -126.0 L464.3 -145.9 L461.2 -163.1 L461.1 -174.2 L462.7 -184.0 L465.3 -191.3 L469.4 -199.2 L474.6 -206.2 L480.9 -212.6 L509.7 -229.9 L515.4 -236.7 L519.7 -243.0 L524.3 -254.2 L534.4 -285.0 L548.7 -330.8 L552.9 -338.4 L556.3 -344.4 L568.3 -355.4 L577.5 -360.4 L594.4 -365.8 L621.6 -373.5\"/><path d=\"M206.7 238.5 L198.6 234.5 L191.2 228.3 L187.9 224.2 L185.8 220.2 L184.4 216.0 L183.1 209.6 L181.9 142.8 L180.0 37.5 L179.7 28.7 L178.1 19.5 L172.5 1.2 L170.2 -11.1 L169.4 -28.3 L168.5 -52.7 L167.1 -134.0 L168.5 -153.7 L172.3 -189.2 L173.5 -204.0 L171.0 -220.0 L161.9 -239.9\"/><path d=\"M513.6 475.3 L545.4 474.9 L558.3 472.8 L561.3 470.5 L568.6 458.4 L572.4 442.8 L578.4 422.7 L590.5 382.7 L595.0 365.5 L597.3 357.0\"/><path d=\"M312.7 60.4 L303.9 53.2 L300.4 48.3 L297.6 42.3 L296.4 36.8 L295.6 29.7 L293.7 -70.9 L293.2 -94.2 L295.8 -124.6 L296.2 -143.2 L302.1 -215.3 M94.0 499.0 L103.3 502.1 L112.4 503.4 L171.1 502.9 L205.6 502.6 L260.0 501.7 L303.6 500.8 L308.0 500.7 L320.0 500.5 L329.5 498.2 L336.5 492.7 L341.6 488.6 L344.3 485.8 L347.3 483.2 L352.3 479.6 L360.4 476.4 L371.9 475.1 L389.7 475.1 L388.8 411.0 L388.3 401.4 L387.4 379.4 L383.2 353.8 L382.6 350.3 M359.2 332.1 L358.5 327.9 L356.8 317.3 L355.3 303.5 L354.2 296.9 L351.9 282.7 L350.4 272.9 L349.1 265.1 L345.8 256.4 L340.6 251.4 L321.2 234.0 L317.8 230.9\"/><path d=\"M773.2 182.1 L758.4 182.2 L747.8 185.3 L738.8 188.9 L727.6 193.6 L721.0 196.1 L707.1 200.6 L695.6 202.6 L684.4 202.0 L677.0 200.7 L673.1 200.1 L668.0 198.5 L657.4 192.9 L649.9 184.7 L645.5 176.6 L642.8 168.7 L641.3 155.9 L640.9 137.2\"/><path d=\"M158.2 298.2 L150.7 287.7 L148.0 281.2 L139.6 246.3 L137.7 234.5 L133.9 169.6 L130.8 31.5 L128.7 18.2 L126.1 8.8 L117.1 -15.4 L110.4 -31.9 L108.3 -39.4 L107.7 -46.3 L107.2 -57.9 L106.0 -117.9 L106.1 -129.7 L107.9 -139.1 L110.6 -146.6 L115.3 -154.8 L122.5 -162.0 L138.1 -173.8\"/><path d=\"M514.4 163.6 L514.6 158.0 L516.6 150.6 L519.0 144.9 L522.3 139.3 L526.6 133.7 L537.0 123.9 L588.1 77.3 L643.4 27.2 L649.2 20.9 L658.8 7.9 L665.7 -4.4 L683.2 -50.6 L685.5 -58.9 L687.4 -68.4 L687.6 -79.7 L685.9 -90.1 L681.6 -102.6 L657.8 -142.7 L626.2 -194.2 L616.9 -212.1 L614.9 -222.3 L616.0 -237.2 L618.2 -257.0 L618.6 -267.7 L617.9 -278.8 L615.8 -290.4 L612.3 -302.2 L594.4 -365.8 L587.8 -389.2 M512.3 413.3 L513.1 448.1 L513.6 475.3 L512.3 530.1 M513.4 324.5 L513.2 316.4 M513.4 330.5 L513.4 324.5 M513.4 330.5 L513.2 337.8 M513.0 299.7 L513.0 287.9 L513.0 274.8 L512.9 252.3 L513.0 236.7 L513.0 212.7 L513.3 186.8 L514.4 163.6 M513.2 316.4 L513.0 299.7 M512.9 360.4 L512.7 366.1 L512.6 374.3 L512.4 394.2 M513.2 337.8 L513.1 345.8 L512.9 360.4 M512.4 405.7 L512.3 413.3 M512.5 397.3 L512.4 405.7\"/></g><g stroke-width=\"6.5\"><path d=\"M466.4 60.6 L470.4 64.1 L502.1 92.0 L514.5 103.0 L525.9 113.3 L537.0 123.9 L544.5 132.0 L551.1 136.2 L556.0 137.6 L561.1 138.4 L572.8 138.2 L582.7 138.0 L595.7 137.8 L640.9 137.2 L679.0 135.6 L710.6 133.4 L740.1 132.3 L767.7 132.0 L772.2 132.4 L862.4 133.4 L952.4 134.5 L1003.2 134.5 L1020.7 133.1 L1037.2 130.9 L1053.5 127.2 L1069.1 122.9 L1102.7 107.9 L1156.9 81.5 L1221.4 50.0 L1230.8 46.4 L1238.1 44.8 L1245.8 44.5 L1252.7 45.4 L1267.0 48.6 M230.6 -29.4 L198.4 -28.8 L169.4 -28.3 L158.2 -27.7 L149.0 -26.2 L137.6 -23.0 L117.1 -15.4 L75.1 0.7 L65.9 3.5 L61.2 4.5 L56.2 5.2 M229.7 -69.7 L262.7 -70.3 L293.7 -70.9 L304.8 -70.9 L312.1 -69.4 L316.8 -67.4 L321.7 -64.2 L378.7 -15.5 L400.9 4.0 L413.2 14.8 L420.7 21.5 L461.1 56.1 L466.4 60.6\"/><path d=\"M317.8 230.9 L308.7 240.3 L303.5 246.4 L298.7 251.8 L293.7 257.4 L289.7 260.7 L286.2 263.4 L276.8 269.2 L264.1 274.8 L257.6 277.1 M970.2 -294.0 L964.7 -288.3 L944.6 -271.0 L927.9 -259.7 L908.1 -248.6 L859.0 -227.2 L743.9 -180.1 L708.7 -165.2 L671.5 -149.5 L657.8 -142.7 L648.1 -137.1 L638.1 -130.4 L621.5 -115.8 L597.9 -89.1 L554.2 -39.3 L466.4 60.6 M466.4 60.6 L445.2 85.0 L437.8 93.4 L432.6 99.4 L425.7 107.3 M425.7 107.3 L404.8 130.8 L399.9 136.4 L391.3 146.2 L385.4 152.8 L367.7 173.2 L358.1 184.3 L349.5 194.2 M349.5 194.2 L334.4 211.7 L330.3 216.5 L324.6 223.0 L317.8 230.9\"/><path d=\"M419.4 322.6 L418.8 318.3 L416.6 301.9 L415.5 294.2 L412.8 272.1 L412.1 261.4 L412.1 256.1 L412.0 247.0 L411.9 234.1 L411.9 223.3 L411.8 218.5 L411.7 208.6 L411.6 189.5 L410.9 181.8 L409.9 177.4 L407.8 173.6 L404.8 170.0 L385.4 152.8 L361.6 132.3 L342.6 116.0 L340.3 113.9 M443.0 569.9 L448.1 563.2 L451.1 555.8 L452.1 546.8 L452.1 530.4 L451.8 504.3 L451.2 464.4 L451.2 457.8 L451.1 452.8 L450.5 402.6 L450.4 392.4 L451.1 369.7 L451.2 361.0 L451.4 346.5 L449.9 341.0\"/></g><g stroke-width=\"12\"><path d=\"M353.3 354.8 L382.6 350.3 L420.7 343.7 L444.7 340.3 L449.9 341.0 M513.2 337.8 L517.8 338.0 L531.1 339.0 L535.0 339.5 L565.9 345.1 L572.9 347.2 L581.6 349.8 L597.9 354.6 L614.5 359.1 L618.9 360.3 L627.7 362.8 L642.9 367.0 L662.6 372.4 L676.4 376.2 L689.4 379.9 L699.8 382.8 L715.5 387.2 L727.0 390.9 L735.3 393.6 L740.2 395.6 L745.8 399.0 L750.1 401.0 L754.2 402.3 L758.6 402.9 L764.5 403.6 L779.7 405.1 L791.1 406.8 L821.0 415.1 L880.4 432.1 L964.9 455.6 L973.5 457.9 L996.0 464.2 L1067.6 483.1 L1102.7 491.7 L1111.2 494.1 L1119.1 497.3 L1129.0 502.5 L1132.6 504.4 L1138.9 506.0 L1144.4 506.8 L1159.4 507.1 L1189.8 511.7 L1222.6 515.5 L1250.5 518.4 L1269.4 520.4 L1323.9 524.9 L1333.4 525.6 L1365.2 526.5 L1396.8 525.8 L1405.7 525.6 L1415.6 525.4 L1429.1 525.2 L1437.7 525.2 L1461.5 525.7 L1466.4 526.0 L1477.8 526.8 L1489.2 528.2 L1508.5 531.2 L1527.9 535.0 L1549.9 540.6 L1572.2 547.7 L1594.9 556.5 L1617.4 566.7 L1631.8 574.7 L1678.2 600.2 L1715.1 620.0 L1738.9 639.1 L1741.8 641.4 M290.3 365.8 L298.7 364.2 L311.0 361.8 M311.0 361.8 L333.1 357.8 M333.1 357.8 L353.3 354.8\"/><path d=\"M513.2 316.4 L506.8 316.3 L493.9 316.0 L482.7 316.2 L470.1 316.7 L463.8 317.2 M463.8 317.2 L455.5 317.9 L419.4 322.6\"/><path d=\"M149.5 377.9 L131.8 385.1 L75.0 410.1 L18.9 435.1 L13.5 437.6 L2.6 444.0 L-12.2 454.2 L-23.1 463.8 L-33.5 474.2 L-50.4 494.9 L-57.5 505.0 L-69.9 521.0 L-78.8 530.6 L-87.2 538.2 L-96.3 544.6 L-107.1 551.1 L-119.6 557.2 L-133.3 562.1 L-148.0 566.2 L-173.8 572.3 L-194.7 577.5 L-211.8 581.7 L-223.4 585.2 L-236.7 591.2 L-241.9 594.8 M513.4 330.5 L518.2 330.7 L533.3 332.1 L551.1 334.6 L562.1 336.7 L579.1 341.1 L628.3 354.7 M-237.8 600.4 L-230.5 596.3 L-219.8 591.5 L-210.3 588.1 L-193.0 583.4 L-172.2 578.3 L-146.3 572.0 L-131.3 568.0 L-117.1 562.4 L-104.1 555.4 L-93.6 548.8 L-83.8 541.2 L-75.4 533.8 L-66.7 524.6 L-53.4 507.8 L-45.5 498.2 L-28.5 478.7 L-18.5 468.6 L-8.1 459.4 L6.2 449.6 L16.6 443.5 L21.7 441.1 L77.7 416.2 L134.0 390.9 L143.0 387.3 M210.5 369.6 L228.6 366.8 M242.0 364.7 L276.5 359.9 L283.2 359.0 M478.7 329.6 L496.1 329.7 L506.7 330.2 L513.4 330.5 M361.1 339.4 L296.8 350.4 L293.0 351.0 L287.4 352.0 M628.3 354.7 L671.6 366.8 L680.5 369.2 M513.4 324.5 L506.6 324.0 L492.1 323.3 L475.3 323.4 L458.2 324.4 L440.1 327.2 L419.6 330.1 L361.1 339.4 M348.7 347.6 L420.0 336.2 L440.0 333.2 L458.4 330.9 L478.7 329.6 M561.1 330.6 L550.6 328.8 L529.2 326.1 L517.9 324.9 L513.4 324.5 M143.0 387.3 L151.8 384.1 L169.7 378.3 L192.8 373.2 L198.2 372.0 L210.5 369.6 M642.4 351.9 L618.1 345.3 L598.0 340.0 M228.6 366.8 L242.0 364.7 M283.2 359.0 L288.7 358.1 M288.7 358.1 L294.9 357.1 L348.7 347.6 M287.4 352.0 L281.9 352.8 M682.4 363.1 L642.4 351.9 M598.0 340.0 L571.6 333.0 L561.1 330.6 M281.9 352.8 L197.0 365.4 L168.0 371.9 L149.5 377.9\"/><path d=\"M257.6 277.1 L265.2 296.9 L270.8 312.0 L273.7 319.2 M281.9 352.8 L283.2 359.0 M283.2 359.0 L284.3 364.9 L288.4 385.0 M294.2 393.3 L295.8 389.0 L293.3 378.5 L290.3 365.8 M333.0 472.9 L322.6 457.9 L313.8 443.5 M247.3 247.5 L248.3 251.1 L257.6 277.1 M242.6 -220.9 L230.8 -118.8 L229.3 -98.6 L229.7 -69.7 L230.6 -29.4 L232.7 94.8 L234.9 175.5 L236.3 192.4 L238.9 214.3 M290.3 365.8 L288.7 358.1 M287.4 352.0 L285.8 344.0 L283.5 337.5 L282.2 333.7 L277.3 321.1 L273.7 319.2 M273.7 319.2 L272.9 322.7 L275.0 329.1 L278.6 340.1 L280.0 345.6 L281.9 352.8 M238.9 214.3 L242.7 230.6 M288.7 358.1 L287.4 352.0 M288.4 385.0 L289.5 390.0 L294.2 393.3 M300.2 413.7 L298.4 407.7 L294.2 393.3 M313.8 443.5 L307.0 430.0 L305.0 425.9 M344.3 485.8 L333.0 472.9 M363.1 502.9 L344.3 485.8 M417.5 549.2 L412.5 545.0 L398.1 532.6 L363.1 502.9 M242.7 230.6 L244.5 238.3 L247.3 247.5 M305.0 425.9 L301.2 416.8 L300.2 413.7\"/></g></g><g fill=\"none\" stroke=\"var(--surface)\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><g stroke-width=\"3\"><path d=\"M466.4 60.6 L470.4 64.1 L502.1 92.0 L514.5 103.0 L525.9 113.3 L537.0 123.9 L544.5 132.0 L551.1 136.2 L556.0 137.6 L561.1 138.4 L572.8 138.2 L582.7 138.0 L595.7 137.8 L640.9 137.2 L679.0 135.6 L710.6 133.4 L740.1 132.3 L767.7 132.0 L772.2 132.4 L862.4 133.4 L952.4 134.5 L1003.2 134.5 L1020.7 133.1 L1037.2 130.9 L1053.5 127.2 L1069.1 122.9 L1102.7 107.9 L1156.9 81.5 L1221.4 50.0 L1230.8 46.4 L1238.1 44.8 L1245.8 44.5 L1252.7 45.4 L1267.0 48.6 M230.6 -29.4 L198.4 -28.8 L169.4 -28.3 L158.2 -27.7 L149.0 -26.2 L137.6 -23.0 L117.1 -15.4 L75.1 0.7 L65.9 3.5 L61.2 4.5 L56.2 5.2 M229.7 -69.7 L262.7 -70.3 L293.7 -70.9 L304.8 -70.9 L312.1 -69.4 L316.8 -67.4 L321.7 -64.2 L378.7 -15.5 L400.9 4.0 L413.2 14.8 L420.7 21.5 L461.1 56.1 L466.4 60.6\"/><path d=\"M317.8 230.9 L308.7 240.3 L303.5 246.4 L298.7 251.8 L293.7 257.4 L289.7 260.7 L286.2 263.4 L276.8 269.2 L264.1 274.8 L257.6 277.1 M970.2 -294.0 L964.7 -288.3 L944.6 -271.0 L927.9 -259.7 L908.1 -248.6 L859.0 -227.2 L743.9 -180.1 L708.7 -165.2 L671.5 -149.5 L657.8 -142.7 L648.1 -137.1 L638.1 -130.4 L621.5 -115.8 L597.9 -89.1 L554.2 -39.3 L466.4 60.6 M466.4 60.6 L445.2 85.0 L437.8 93.4 L432.6 99.4 L425.7 107.3 M425.7 107.3 L404.8 130.8 L399.9 136.4 L391.3 146.2 L385.4 152.8 L367.7 173.2 L358.1 184.3 L349.5 194.2 M349.5 194.2 L334.4 211.7 L330.3 216.5 L324.6 223.0 L317.8 230.9\"/><path d=\"M419.4 322.6 L418.8 318.3 L416.6 301.9 L415.5 294.2 L412.8 272.1 L412.1 261.4 L412.1 256.1 L412.0 247.0 L411.9 234.1 L411.9 223.3 L411.8 218.5 L411.7 208.6 L411.6 189.5 L410.9 181.8 L409.9 177.4 L407.8 173.6 L404.8 170.0 L385.4 152.8 L361.6 132.3 L342.6 116.0 L340.3 113.9 M443.0 569.9 L448.1 563.2 L451.1 555.8 L452.1 546.8 L452.1 530.4 L451.8 504.3 L451.2 464.4 L451.2 457.8 L451.1 452.8 L450.5 402.6 L450.4 392.4 L451.1 369.7 L451.2 361.0 L451.4 346.5 L449.9 341.0\"/></g><g stroke-width=\"6.5\"><path d=\"M353.3 354.8 L382.6 350.3 L420.7 343.7 L444.7 340.3 L449.9 341.0 M513.2 337.8 L517.8 338.0 L531.1 339.0 L535.0 339.5 L565.9 345.1 L572.9 347.2 L581.6 349.8 L597.9 354.6 L614.5 359.1 L618.9 360.3 L627.7 362.8 L642.9 367.0 L662.6 372.4 L676.4 376.2 L689.4 379.9 L699.8 382.8 L715.5 387.2 L727.0 390.9 L735.3 393.6 L740.2 395.6 L745.8 399.0 L750.1 401.0 L754.2 402.3 L758.6 402.9 L764.5 403.6 L779.7 405.1 L791.1 406.8 L821.0 415.1 L880.4 432.1 L964.9 455.6 L973.5 457.9 L996.0 464.2 L1067.6 483.1 L1102.7 491.7 L1111.2 494.1 L1119.1 497.3 L1129.0 502.5 L1132.6 504.4 L1138.9 506.0 L1144.4 506.8 L1159.4 507.1 L1189.8 511.7 L1222.6 515.5 L1250.5 518.4 L1269.4 520.4 L1323.9 524.9 L1333.4 525.6 L1365.2 526.5 L1396.8 525.8 L1405.7 525.6 L1415.6 525.4 L1429.1 525.2 L1437.7 525.2 L1461.5 525.7 L1466.4 526.0 L1477.8 526.8 L1489.2 528.2 L1508.5 531.2 L1527.9 535.0 L1549.9 540.6 L1572.2 547.7 L1594.9 556.5 L1617.4 566.7 L1631.8 574.7 L1678.2 600.2 L1715.1 620.0 L1738.9 639.1 L1741.8 641.4 M290.3 365.8 L298.7 364.2 L311.0 361.8 M311.0 361.8 L333.1 357.8 M333.1 357.8 L353.3 354.8\"/><path d=\"M513.2 316.4 L506.8 316.3 L493.9 316.0 L482.7 316.2 L470.1 316.7 L463.8 317.2 M463.8 317.2 L455.5 317.9 L419.4 322.6\"/><path d=\"M149.5 377.9 L131.8 385.1 L75.0 410.1 L18.9 435.1 L13.5 437.6 L2.6 444.0 L-12.2 454.2 L-23.1 463.8 L-33.5 474.2 L-50.4 494.9 L-57.5 505.0 L-69.9 521.0 L-78.8 530.6 L-87.2 538.2 L-96.3 544.6 L-107.1 551.1 L-119.6 557.2 L-133.3 562.1 L-148.0 566.2 L-173.8 572.3 L-194.7 577.5 L-211.8 581.7 L-223.4 585.2 L-236.7 591.2 L-241.9 594.8 M513.4 330.5 L518.2 330.7 L533.3 332.1 L551.1 334.6 L562.1 336.7 L579.1 341.1 L628.3 354.7 M-237.8 600.4 L-230.5 596.3 L-219.8 591.5 L-210.3 588.1 L-193.0 583.4 L-172.2 578.3 L-146.3 572.0 L-131.3 568.0 L-117.1 562.4 L-104.1 555.4 L-93.6 548.8 L-83.8 541.2 L-75.4 533.8 L-66.7 524.6 L-53.4 507.8 L-45.5 498.2 L-28.5 478.7 L-18.5 468.6 L-8.1 459.4 L6.2 449.6 L16.6 443.5 L21.7 441.1 L77.7 416.2 L134.0 390.9 L143.0 387.3 M210.5 369.6 L228.6 366.8 M242.0 364.7 L276.5 359.9 L283.2 359.0 M478.7 329.6 L496.1 329.7 L506.7 330.2 L513.4 330.5 M361.1 339.4 L296.8 350.4 L293.0 351.0 L287.4 352.0 M628.3 354.7 L671.6 366.8 L680.5 369.2 M513.4 324.5 L506.6 324.0 L492.1 323.3 L475.3 323.4 L458.2 324.4 L440.1 327.2 L419.6 330.1 L361.1 339.4 M348.7 347.6 L420.0 336.2 L440.0 333.2 L458.4 330.9 L478.7 329.6 M561.1 330.6 L550.6 328.8 L529.2 326.1 L517.9 324.9 L513.4 324.5 M143.0 387.3 L151.8 384.1 L169.7 378.3 L192.8 373.2 L198.2 372.0 L210.5 369.6 M642.4 351.9 L618.1 345.3 L598.0 340.0 M228.6 366.8 L242.0 364.7 M283.2 359.0 L288.7 358.1 M288.7 358.1 L294.9 357.1 L348.7 347.6 M287.4 352.0 L281.9 352.8 M682.4 363.1 L642.4 351.9 M598.0 340.0 L571.6 333.0 L561.1 330.6 M281.9 352.8 L197.0 365.4 L168.0 371.9 L149.5 377.9\"/><path d=\"M257.6 277.1 L265.2 296.9 L270.8 312.0 L273.7 319.2 M281.9 352.8 L283.2 359.0 M283.2 359.0 L284.3 364.9 L288.4 385.0 M294.2 393.3 L295.8 389.0 L293.3 378.5 L290.3 365.8 M333.0 472.9 L322.6 457.9 L313.8 443.5 M247.3 247.5 L248.3 251.1 L257.6 277.1 M242.6 -220.9 L230.8 -118.8 L229.3 -98.6 L229.7 -69.7 L230.6 -29.4 L232.7 94.8 L234.9 175.5 L236.3 192.4 L238.9 214.3 M290.3 365.8 L288.7 358.1 M287.4 352.0 L285.8 344.0 L283.5 337.5 L282.2 333.7 L277.3 321.1 L273.7 319.2 M273.7 319.2 L272.9 322.7 L275.0 329.1 L278.6 340.1 L280.0 345.6 L281.9 352.8 M238.9 214.3 L242.7 230.6 M288.7 358.1 L287.4 352.0 M288.4 385.0 L289.5 390.0 L294.2 393.3 M300.2 413.7 L298.4 407.7 L294.2 393.3 M313.8 443.5 L307.0 430.0 L305.0 425.9 M344.3 485.8 L333.0 472.9 M363.1 502.9 L344.3 485.8 M417.5 549.2 L412.5 545.0 L398.1 532.6 L363.1 502.9 M242.7 230.6 L244.5 238.3 L247.3 247.5 M305.0 425.9 L301.2 416.8 L300.2 413.7\"/></g></g><g font-family=\"IBM Plex Mono, monospace\" font-size=\"10.5\" letter-spacing=\"1.1\" fill=\"var(--mute)\" text-anchor=\"middle\"><text x=\"212\" y=\"272\" transform=\"rotate(0 212 272)\">KAMANA RD</text><text x=\"470\" y=\"80\" transform=\"rotate(0 470 80)\">KAMANA RD</text><text x=\"404\" y=\"152\" transform=\"rotate(90 404 152)\">TUSCOLA RD</text><text x=\"236\" y=\"124\" transform=\"rotate(90 236 124)\">APPLE VALLEY RD</text><text x=\"256\" y=\"392\" transform=\"rotate(-6 256 392)\">HWY 18 · HAPPY TRAILS</text><text x=\"180\" y=\"108\" transform=\"rotate(0 180 108)\">SISKIYOU RD</text><text x=\"524\" y=\"330\" transform=\"rotate(90 524 330)\">KASOTA RD</text></g><g font-family=\"IBM Plex Mono, monospace\" font-size=\"10\" letter-spacing=\".8\" fill=\"var(--ink-2)\"><text x=\"530\" y=\"424\" text-anchor=\"end\">ST. MARY MEDICAL CENTER</text><path d=\"M536 420 l14 12\" stroke=\"var(--ink-2)\" stroke-width=\"1.4\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M550 432 l-8.280000000000001 -2.2399999999999998 l4.800000000000001 -5.6000000000000005\" stroke=\"var(--ink-2)\" stroke-width=\"1.4\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><text x=\"168\" y=\"52\" text-anchor=\"start\">I-15 · VICTORVILLE</text><path d=\"M160 48 l-14 -12\" stroke=\"var(--ink-2)\" stroke-width=\"1.4\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M146 36 l8.280000000000001 2.2399999999999998 l-4.800000000000001 5.6000000000000005\" stroke=\"var(--ink-2)\" stroke-width=\"1.4\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g><g transform=\"translate(340 235)\"><circle r=\"30\" fill=\"var(--amber)\" fill-opacity=\".16\"><animate attributeName=\"r\" values=\"20;34;20\" dur=\"4.5s\" repeatCount=\"indefinite\"/></circle><circle r=\"15\" fill=\"var(--amber)\" fill-opacity=\".28\"/><path d=\"M0 4s11-10 11-17.5A11 11 0 0 0-11-13.5C-11-6 0 4 0 4z\" fill=\"var(--amber)\" stroke=\"var(--ink)\" stroke-width=\"1.6\"/><circle cy=\"-13.5\" r=\"3.9\" fill=\"var(--ink)\"/></g><g font-family=\"Hanken Grotesk, sans-serif\" text-anchor=\"middle\"><rect x=\"248\" y=\"252\" width=\"184\" height=\"42\" rx=\"8\" fill=\"var(--surface)\" fill-opacity=\".92\" stroke=\"var(--line)\"/><text x=\"340\" y=\"269\" font-size=\"13.5\" font-weight=\"600\" fill=\"var(--ink)\">Mojave Medical</text><text x=\"340\" y=\"285\" font-size=\"11\" fill=\"var(--ink-2)\">16041 Kamana Rd, Apple Valley</text></g></svg>";
  function mapCard() {
    return '<div class="map">' +
      '<a class="map-link" href="' + ADDRESS.maps + '" target="_blank" rel="noopener" aria-label="' + esc(t(C.ui.openMaps)) + '">' +
      '<span class="map-badge">' + ico("ext") + esc(t(C.ui.openMaps)) + "</span>" + MAP_SVG + "</a>" +
      '<div class="map-foot"><span class="small">' + esc(t(C.location.mapNote)) + '</span>' +
      '<a href="' + ADDRESS.dir + '" target="_blank" rel="noopener" style="display:inline-flex;gap:.4rem;align-items:center;font-weight:600">' + esc(t(C.ui.directions)) + ico("arrow") + "</a></div></div>";
  }
  function clinicPhoto() {
    return '<figure class="clinic" style="margin:0"><img src="' + CLINIC + '" alt="' + esc(t(C.location.photoAlt)) + '" loading="lazy" width="1200" height="875">' +
      '<figcaption><span>' + esc(t(C.location.photoCap)) + '</span><span class="sign">' + esc(t(C.location.signTag)) + "</span></figcaption></figure>";
  }
  function referPanel() {
    return '<div class="refer"><div><span class="eyebrow">' + esc(t(C.refer.eyebrow)) + '</span><h2 style="margin-top:.7rem;font-size:clamp(1.5rem,1.1rem + 1.3vw,2rem)">' + esc(t(C.refer.h2)) + "</h2></div>" +
      '<div><p style="color:var(--ink-2)">' + esc(t(C.refer.p)) + '</p><dl class="kv" style="margin-top:1rem"><dt>' + esc(t(C.contact.fax)) + '</dt><dd class="mono">' + FAX + "</dd><dt>" + esc(t(C.contact.phone)) + '</dt><dd><a class="mono" href="' + PHONE_TEL + '">' + PHONE + "</a></dd></dl></div></div>";
  }
  function pageHead(key, lede) {
    return '<section class="page-head"><div class="wrap"><span class="eyebrow">Mojave Medical</span><h1>' + esc(t(C.titles[key])) + "</h1>" + (lede ? '<p class="lede">' + esc(t(lede)) + "</p>" : "") + "</div></section>";
  }

  /* ---------- pages ---------- */
  function pageHome() {
    const H = C.hero, T = C.treat;
    return '<section class="hero"><div class="wrap hero-grid"><div class="hero-copy">' +
      '<span class="eyebrow">' + esc(t(H.eyebrow)) + "</span>" +
      "<h1>" + esc(t(H.h1a)) + ' <span class="dot">' + esc(t(H.h1b)) + "</span></h1>" +
      '<p class="lede">' + esc(t(H.lede)) + "</p>" +
      '<div class="hero-ctas"><a class="btn btn-amber btn-lg" href="#/book">' + ico("cal") + esc(t(C.ui.book)) + '</a><a class="btn btn-ghost btn-lg" href="' + PHONE_TEL + '">' + ico("phone") + esc(t(C.ui.callUs)) + "</a></div>" +
      '<div class="chips">' + H.chips.map(c => '<span class="chip">' + ico("check") + esc(t(c)) + "</span>").join("") + "</div>" +
      "</div>" +
      '<div class="portrait"><div class="portrait-frame"><div class="sand"></div><div class="ring"></div><img src="' + HEADSHOT + '" alt="Portrait of Dr. Kevin Ganesh" width="643" height="900"></div>' +
      '<div class="tag">' + MARK() + "<div><b>" + esc(H.tagName) + "</b><span>" + esc(t(H.tagRole)) + "</span></div></div></div>" +
      "</div></section>" +

      '<section class="strip"><div class="wrap">' + C.strips.map(s => '<div class="strip-row"><span class="strip-label">' + esc(t(s.label)) + '</span><div class="strip-items">' + s.items.map(i => "<span>" + esc(i) + "</span>").join("") + "</div></div>").join("") + "</div></section>" +

      '<section class="section"><div class="wrap"><div class="section-head"><span class="eyebrow">' + esc(t(T.eyebrow)) + "</span><h2>" + esc(t(T.h2)) + '</h2><p class="lede">' + esc(t(T.lede)) + "</p></div>" +
      '<div class="bento"><a class="tile tile-big" href="#/services">' + SUN + '<div><div class="ico">' + ico("wound") + "</div><h3>" + esc(t(T.big.h)) + "</h3><p>" + esc(t(T.big.p)) + '</p><div class="list">' + T.big.tags.map(x => "<span>" + esc(t(x)) + "</span>").join("") + '</div></div><span class="more">' + esc(t(C.ui.learn)) + ico("arrow") + "</span></a>" +
      T.tiles.map(x => '<a class="tile' + (x.sand ? " tile-sand" : "") + '" href="#/services"><div class="ico">' + ico(x.ico) + "</div><h3>" + esc(t(x.h)) + "</h3><p>" + esc(t(x.p)) + "</p></a>").join("") +
      '</div><div style="margin-top:1.4rem"><a class="btn btn-ghost" href="#/services">' + esc(t(C.ui.seeAll)) + ico("arrow") + "</a></div></div></section>" +

      '<section class="section" style="padding-top:0"><div class="wrap"><div class="section-head"><span class="eyebrow">' + esc(t(C.steps.eyebrow)) + "</span><h2>" + esc(t(C.steps.h2)) + "</h2></div>" +
      '<div class="steps">' + C.steps.items.map(s => '<div class="step"><h3>' + esc(t(s.h)) + "</h3><p>" + esc(t(s.p)) + "</p></div>").join("") + "</div></div></section>" +

      '<section class="section" style="background:var(--surface);border-block:1px solid var(--line)"><div class="wrap cred"><div class="cred-photo"><img src="' + HEADSHOT + '" alt="Dr. Kevin Ganesh" loading="lazy"></div>' +
      '<div><span class="eyebrow">' + esc(t(C.cred.eyebrow)) + '</span><h2 style="margin-top:.7rem">' + esc(t(C.cred.h2)) + '</h2><p class="lede" style="margin-top:1rem">' + esc(t(C.cred.p)) + "</p>" +
      '<div class="facts">' + C.cred.facts.map(f => '<div class="fact' + (f.amber ? " amber" : "") + '"><b>' + esc(t(f.b)) + "</b><span>" + esc(t(f.s)) + "</span></div>").join("") + "</div>" +
      '<div style="margin-top:1.6rem"><a class="btn btn-ink" href="#/about">' + esc(t(C.cred.cta)) + ico("arrow") + "</a></div></div></div></section>" +

      '<section class="section"><div class="wrap"><div class="band">' + SUN + "<div><h2>" + esc(t(C.band.h2)) + '</h2><p style="margin-top:.8rem;max-width:56ch">' + esc(t(C.band.p)) + "</p></div>" +
      '<div class="actions"><a class="btn btn-amber btn-lg" href="#/book/post">' + ico("cal") + esc(t(C.ui.book)) + '</a><a class="btn btn-ghost btn-lg" href="' + PHONE_TEL + '">' + ico("phone") + PHONE + "</a></div></div></div></section>" +

      '<section class="section" style="padding-top:0"><div class="wrap"><div class="section-head"><span class="eyebrow">' + esc(t(C.reviews.eyebrow)) + "</span><h2>" + esc(t(C.reviews.h2)) + "</h2></div>" +
      ratingCards() + '<div class="quotes">' + C.reviews.items.map(quoteCard).join("") + "</div>" +
      '<div style="margin-top:1.4rem"><a class="btn btn-ghost" href="#/reviews">' + esc(t(C.ui.readReviews)) + ico("arrow") + "</a></div></div></section>" +

      '<section class="section" style="background:var(--sand);border-block:1px solid var(--sand-2)"><div class="wrap"><div class="section-head"><span class="eyebrow">' + esc(t(C.insurance.eyebrow)) + "</span><h2>" + esc(t(C.insurance.h2)) + '</h2><p class="lede">' + esc(t(C.insurance.p)) + "</p></div>" +
      '<div class="carriers">' + C.insurance.carriers.map(c => "<span>" + esc(c) + "</span>").join("") + "</div></div></section>" +

      '<section class="section"><div class="wrap"><div class="section-head"><span class="eyebrow">' + esc(t(C.location.eyebrow)) + "</span><h2>" + esc(t(C.location.h2)) + "</h2></div>" +
      clinicPhoto() + '<div class="loc">' + addressCard() + mapCard() + "</div></div></section>" +

      '<section class="section" style="padding-top:0"><div class="wrap">' + referPanel() + "</div></section>";
  }
  function ratingCards() {
    return '<div class="rating-card"><div><div class="big">5.0</div><div class="small">' + esc(t(C.reviews.hgLabel)) + "</div></div>" +
      '<div><div class="big">4.0</div><div class="small">' + esc(t(C.reviews.yelpLabel)) + "</div></div>" +
      '<div style="flex:1"></div><a class="btn btn-ghost btn-sm" href="https://www.google.com/maps/search/Mojave+Medical+Kevin+Ganesh+MD+Apple+Valley" target="_blank" rel="noopener">' + ico("star") + esc(t(C.reviews.leave)) + "</a></div>";
  }
  function quoteCard(r) {
    return '<figure class="quote" style="margin:0"><blockquote class="q" style="margin:0">' + esc(r.q) + '</blockquote><figcaption class="who"><span><b>' + esc(r.who) + '</b> · <span class="small">' + esc(t(C.ui.viaYelp)) + ", " + esc(r.when) + "</span></span>" + stars(r.stars) + "</figcaption></figure>";
  }

  function pageAbout() {
    const A = C.about;
    return pageHead("about", A.lede) +
      '<section class="section"><div class="wrap about-grid">' +
      '<aside class="about-side"><div class="cred-photo"><img src="' + HEADSHOT + '" alt="Dr. Kevin Ganesh"></div>' +
      '<div class="card"><h3 style="font-size:1.1rem;font-family:var(--sans);font-weight:600">' + esc(t(A.hospTitle)) + '</h3><ul class="check" style="gap:.4rem">' + A.hosp.map(h => "<li>" + ico("hospital") + esc(h) + "</li>").join("") + "</ul></div>" +
      '<a class="btn btn-amber" href="#/book">' + ico("cal") + esc(t(C.ui.book)) + "</a></aside>" +
      '<div><div class="bio">' + t(A.bio).map(p => "<p>" + esc(p) + "</p>").join("") + "</div>" +
      '<div class="pull"><span class="eyebrow" style="font-style:normal;display:block;margin-bottom:.5rem">' + esc(t(A.pullLabel)) + "</span>" + esc(t(A.pull)) + "</div>" +
      '<h2 style="font-size:1.7rem;margin:2.2rem 0 1rem">' + esc(t(A.tlTitle)) + '</h2><div class="timeline">' + A.timeline.map(x => '<div class="tl"><span class="yr">' + esc(x.yr) + "</span><div><b>" + esc(t(x.b)) + "</b><span>" + esc(t(x.s)) + "</span></div></div>").join("") + "</div>" +
      '<h2 style="font-size:1.7rem;margin:2.2rem 0 1rem">' + esc(t(A.credTitle)) + '</h2><div class="badge-list">' + A.creds.map(c => '<div class="badge"><div class="ico">' + ico("shield") + "</div><div><b>" + esc(t(c.b)) + "</b><span>" + esc(t(c.s)) + "</span></div></div>").join("") + "</div>" +
      '<h2 style="font-size:1.7rem;margin:2.2rem 0 1rem">' + esc(t(A.pubTitle)) + '</h2><div class="pub"><span class="t">' + esc(A.pub.t) + '</span><span class="muted">' + esc(A.pub.a) + " </span><span>" + esc(A.pub.j) + '</span> <a href="https://pubmed.ncbi.nlm.nih.gov/38219684/" target="_blank" rel="noopener" style="white-space:nowrap">PubMed ' + ico("ext") + "</a></div>" +
      "</div></div></section>";
  }

  function pageServices() {
    const S = C.services;
    return pageHead("services", S.lede) +
      '<section><div class="wrap">' + S.groups.map(g =>
        '<div class="svc-group"><div class="svc-intro"><span class="eyebrow">' + esc(t(g.eyebrow)) + '</span><h2 style="margin-top:.5rem">' + esc(t(g.h2)) + '</h2><p style="color:var(--ink-2)">' + esc(t(g.p)) + '</p><div style="margin-top:.6rem"><a class="btn btn-ink btn-sm" href="#/book">' + ico("cal") + esc(t(C.ui.book)) + "</a></div></div>" +
        '<div class="svc-list">' + g.items.map(x => '<div class="svc' + (x.hi ? " hi" : "") + '"><div class="ico">' + ico(x.ico) + "</div>" + (x.pill ? '<span class="pill">' + esc(t(x.pill)) + "</span>" : "") + "<h3>" + esc(t(x.h)) + "</h3><p>" + esc(t(x.p)) + "</p></div>").join("") + "</div></div>"
      ).join("") + "</div></section>" +
      '<section class="section" style="padding-top:0"><div class="wrap">' + referPanel() + "</div></section>";
  }

  function pagePatients() {
    const P = C.patients;
    return pageHead("patients", P.lede) +
      '<section class="section"><div class="wrap two">' +
      '<div><h2 style="font-size:1.7rem;margin-bottom:1rem">' + esc(t(P.bringTitle)) + '</h2><ul class="check">' + P.bring.map(b => "<li>" + ico("check") + esc(t(b)) + "</li>").join("") + "</ul></div>" +
      '<div class="stack"><div class="card"><h3>' + esc(t(P.teleTitle)) + '</h3><p style="color:var(--ink-2)">' + esc(t(P.tele)) + '</p><div style="margin-top:1rem"><a class="btn btn-ink btn-sm" href="#/book/video">' + ico("video") + esc(t(C.ui.telehealth)) + "</a></div></div>" +
      '<div class="card"><h3>' + esc(t(P.payTitle)) + '</h3><p style="color:var(--ink-2)">' + esc(t(P.pay)) + "</p></div></div>" +
      "</div></section>" +
      '<section class="section" style="padding-top:0"><div class="wrap two">' +
      '<div><h2 style="font-size:1.7rem;margin-bottom:1rem">' + esc(t(C.insurance.eyebrow)) + '</h2><p style="color:var(--ink-2);margin-bottom:1rem">' + esc(t(C.insurance.p)) + '</p><div class="carriers">' + C.insurance.carriers.map(c => "<span>" + esc(c) + "</span>").join("") + "</div></div>" +
      '<div><h2 style="font-size:1.7rem;margin-bottom:1rem">' + esc(t(P.formsTitle)) + '</h2><div class="forms">' + P.forms.map(f => '<a class="form-link" href="#/forms/' + f.id + '">' + esc(t(f)) + "<span>PDF</span></a>").join("") + '</div><div class="note amber" style="margin-top:1rem">' + ico("info") + "<span>" + esc(t(P.formsNote)) + "</span></div></div>" +
      "</div></section>" +
      '<section class="section" style="padding-top:0"><div class="wrap"><h2 style="font-size:1.7rem;margin-bottom:1rem">' + esc(t(P.faqTitle)) + '</h2><div class="faq">' + P.faq.map((f, i) => "<details" + (i === 0 ? " open" : "") + "><summary>" + esc(t(f.q)) + '</summary><div class="a">' + esc(t(f.a)) + "</div></details>").join("") + "</div></div></section>";
  }

  function pageReviews() {
    return pageHead("reviews", C.reviews.h2) +
      '<section class="section"><div class="wrap">' + ratingCards() + '<div class="quotes">' + C.reviews.items.map(quoteCard).join("") + "</div>" +
      '<p class="small" style="margin-top:1.4rem;max-width:70ch">' + (lang === "es" ? "Las opiniones se citan textualmente de reseñas públicas en Yelp y Healthgrades. Los resultados individuales varían." : "Reviews are quoted verbatim from public Yelp and Healthgrades listings. Individual results vary.") + "</p></div></section>";
  }

  function pageContact() {
    const extra = "<dt>" + esc(t(C.contact.email)) + '</dt><dd><a href="mailto:' + EMAIL + '" style="word-break:break-all">' + EMAIL + "</a></dd>";
    return pageHead("contact", C.contact.lede) +
      '<section class="section"><div class="wrap">' + clinicPhoto() + '<div class="loc">' + addressCard(extra) + mapCard() + "</div></div>" +
      '<div class="wrap" style="margin-top:1.25rem"><div class="two"><div class="note">' + ico("pin") + "<span>" + esc(t(C.contact.parking)) + '</span></div><div class="note amber">' + ico("info") + "<span>" + esc(t(C.contact.emergency)) + "</span></div></div></div></section>" +
      '<section class="section" style="padding-top:0"><div class="wrap">' + referPanel() + "</div></section>";
  }


  /* ---------- legal + forms ---------- */
  function legalSections(secs) {
    return secs.map(x => "<h3>" + esc(t(x.h)) + "</h3>" + (x.p ? "<p>" + esc(t(x.p)) + "</p>" : "") + (x.list ? "<ul>" + x.list.map(li => "<li>" + esc(t(li)) + "</li>").join("") + "</ul>" : "")).join("");
  }
  function pagePrivacy() {
    const L = C.legal.privacy;
    return pageHead("privacy", L.lede) + '<section class="section"><div class="wrap"><div class="legal">' + legalSections(L.sections) +
      '<p class="small" style="margin-top:2rem">' + esc(t(L.updated)) + ' · Mojave Medical · ' + esc(ADDRESS.line1) + ", " + esc(ADDRESS.city) + ' · <a href="' + PHONE_TEL + '">' + PHONE + "</a></p>" +
      '<p style="margin-top:1rem"><a href="#/forms/privacy-notice" style="font-weight:600">' + esc(t(C.forms.items[3].title)) + " " + ico("arrow") + "</a></p></div></div></section>";
  }
  function pageAccessibility() {
    const L = C.legal.accessibility;
    return pageHead("accessibility", L.lede) + '<section class="section"><div class="wrap"><div class="legal">' + legalSections(L.sections) +
      '<p style="margin-top:1.5rem"><a class="btn btn-ink" href="' + PHONE_TEL + '">' + ico("phone") + PHONE + '</a> <a class="btn btn-ghost" href="mailto:' + EMAIL + '">' + ico("mail") + EMAIL + "</a></p></div></div></section>";
  }
  function pageForms(id) {
    const F = C.forms;
    const form = id && F.items.find(f => f.id === id);
    if (!form) {
      return pageHead("forms", F.lede) + '<section class="section"><div class="wrap"><div class="forms-grid">' +
        F.items.map(f => '<a class="form-card" href="#/forms/' + f.id + '">' + '<div class="ico" style="width:36px;height:36px;border-radius:9px;background:var(--amber-soft);color:var(--amber-deep);display:grid;place-items:center">' + ico("file") + "</div><h3>" + esc(t(f.title)) + "</h3><p>" + esc(t(f.desc)) + '</p><span class="more">' + esc(t(F.print)) + ico("arrow") + "</span></a>").join("") +
        '</div><div class="note amber" style="margin-top:1.25rem">' + ico("info") + "<span>" + esc(t(C.patients.formsNote)) + "</span></div></div></section>";
    }
    const head = '<div class="sheet-head"><div class="lock"><span class="foot-lockup">' + LOCKUP() + "</span></div><address>Kevin Ganesh, MD · Infectious Disease &amp; Internal Medicine<br>" + esc(ADDRESS.line1) + ", " + esc(ADDRESS.city) + "<br>" + esc(t(C.contact.phone)) + " " + PHONE + " · " + esc(t(C.contact.fax)) + " " + FAX + "</address></div>";
    let body = "";
    if (form.sections) body += form.sections.map(sec => {
      let inner = "";
      if (sec.fields) inner = '<div class="fgrid">' + sec.fields.map(f => '<div class="fld" style="grid-column:span ' + (f.w || 6) + '"><span>' + esc(t(f.l)) + "</span><i></i></div>").join("") + "</div>";
      if (sec.lines) inner = '<div class="flines">' + "<i></i>".repeat(sec.lines) + "</div>";
      if (sec.checks) inner = '<div class="fchecks">' + sec.checks.map(c => "<span>" + esc(t(c)) + "</span>").join("") + "</div>";
      return "<h3>" + esc(t(sec.h)) + "</h3>" + inner;
    }).join("");
    if (form.text) body += form.text.map(x => (x.p || x.list ? "<h4>" + esc(t(x.h)) + "</h4>" : '<p style="font-weight:600">' + esc(t(x.h)) + "</p>") + (x.p ? "<p>" + esc(t(x.p)) + "</p>" : "") + (x.list ? "<ul>" + x.list.map(li => "<li>" + esc(t(li)) + "</li>").join("") + "</ul>" : "")).join("");
    const consent = form.consent || form.ack;
    const sig = '<div class="fconsent">' + esc(t(consent)) + '<div class="fsig"><div>' + esc(t(F.sig)) + "</div><div>" + esc(t(F.date)) + "</div></div></div>" +
      '<div class="foffice"><span>' + esc(t(F.officeUse)) + "</span><span>MRN ____________</span><span>" + esc(t(F.date)) + " ____________</span><span>Staff ____________</span></div>";
    return pageHead("forms", form.desc) +
      '<section class="section" style="padding-top:1.5rem"><div class="wrap"><div class="sheet-tools no-print"><a class="btn btn-ghost btn-sm" href="#/forms">' + ico("chevL") + esc(t(F.back)) + '</a><button type="button" class="btn btn-ink btn-sm" onclick="window.print()">' + ico("file") + esc(t(F.print)) + "</button></div>" +
      '<div class="sheet">' + head + "<h2>" + esc(t(form.title)) + '</h2><p class="sub">' + esc(t(form.desc)) + "</p>" + body + sig + "</div></div></section>";
  }

  /* ---------- booking ---------- */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const BOOK_OPENED = Date.now();
  const B = { step: 0, type: null, date: null, time: null, form: {}, errors: {}, done: null, fail: null, month: new Date(today.getFullYear(), today.getMonth(), 1) };
  const typeOf = id => C.book.types.find(x => x.id === id);

  /* Openings come from the practice's own schedule, over /api/availability. The calendar
     never invents a time: if the API cannot be reached we say so and send people to the
     phone, because a made-up opening is worse than no calendar at all. */
  const AV = { state: "idle", type: null, days: null, hours: null, today: null, horizon: 60, tz: null, error: null };
  function loadAvailability(force) {
    const wanted = B.type || "";
    if (!force && AV.state === "loading") return AV.promise;
    if (!force && AV.state === "ready" && AV.type === wanted) return Promise.resolve(AV);
    AV.state = "loading"; AV.type = wanted; AV.error = null;
    AV.promise = fetch("/api/availability" + (wanted ? "?visit_type=" + encodeURIComponent(wanted) : ""),
      { headers: { accept: "application/json" }, cache: "no-store" })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .then(d => {
        const days = {};
        (d.days || []).forEach(x => { days[x.date] = x; });
        AV.days = days; AV.hours = d.hours || null; AV.today = d.today || null;
        AV.tz = d.tz || null; AV.horizon = d.horizon_days || 60;
        AV.state = "ready";
        return AV;
      })
      .catch(e => { AV.state = "error"; AV.error = e.message; return AV; });
    return AV.promise;
  }
  /** Start a load if the cached answer does not match the chosen visit type, then redraw. */
  function ensureAvailability() {
    if (AV.state === "loading") return;
    if (AV.state === "ready" && AV.type === (B.type || "")) return;
    loadAvailability().then(() => { if (currentPage() === "book") rerenderBook(); });
  }
  const dayInfo = d => (AV.days ? AV.days[ymd(d)] : null) || null;
  const slotsFor = d => { const x = dayInfo(d); return x && x.open ? x.open : []; };
  const dayOk = d => slotsFor(d).length > 0;
  const horizonEnd = () => { const e = new Date(today); e.setDate(e.getDate() + (AV.horizon || 60)); return e; };

  function pageBook() {
    return pageHead("book", C.book.lede) +
      '<section class="section"><div class="wrap book"><div class="book-main" id="book-main">' + bookMain() + "</div>" +
      '<aside class="book-side"><div class="card"><h3 style="font-size:1.2rem">' + esc(t(C.book.sideH)) + '</h3><p style="color:var(--ink-2)">' + esc(t(C.book.sideP)) + '</p><div style="margin-top:1rem"><a class="btn btn-ink" href="' + PHONE_TEL + '">' + ico("phone") + PHONE + "</a></div>" +
      '<h3 style="margin-top:1.4rem;font-size:1rem;font-family:var(--sans);font-weight:600">' + esc(t(C.ui.hoursTitle)) + "</h3>" + hoursTable() + "</div>" +
      '<div class="note">' + ico("hospital") + "<span>" + esc(t(C.book.sideRef)) + "</span></div>" +
      '<div class="note amber">' + ico("lock") + "<span>" + esc(t(C.book.hipaa)) + "</span></div></aside></div></section>";
  }
  function progress() {
    return '<div class="progress" aria-hidden="true">' + C.book.stepsLabel.map((s, i) => "<div class=\"" + (i < B.step ? "done" : i === B.step ? "on" : "") + '">' + esc(t(s)) + "</div>").join("") + "</div>";
  }
  function bookMain() {
    if (B.done) return success();
    const K = C.book;
    let body = "";
    if (B.step === 0) {
      body = "<h2 style=\"font-size:1.6rem;margin-bottom:1rem\">" + esc(t(K.s1)) + '</h2><div class="opts">' + K.types.map(x =>
        '<button type="button" class="opt" data-type="' + x.id + '" aria-pressed="' + (B.type === x.id) + '"><b>' + esc(t(x.h)) + "</b><span>" + esc(t(x.s)) + '</span><span class="dur">' + x.dur + " " + esc(t(K.min)) + (x.id === "video" ? " · " + esc(t(C.ui.telehealth)) : "") + "</span></button>").join("") + "</div>";
    } else if (B.step === 1) {
      const h2 = "<h2 style=\"font-size:1.6rem;margin-bottom:1rem\">" + esc(t(K.s2)) + "</h2>";
      if (AV.state === "error") body = h2 + calendarDown();
      else if (AV.state !== "ready") body = h2 + '<div class="slot-empty" style="min-height:8rem;display:grid;place-items:center">' + esc(t(K.loading)) + "</div>";
      else body = h2 + '<div class="cal-wrap">' + calendar() + '<div class="slots" id="slots">' + slotList() + "</div></div>";
    } else if (B.step === 2) {
      body = "<h2 style=\"font-size:1.6rem;margin-bottom:1rem\">" + esc(t(K.s3)) + "</h2>" + detailsForm();
    } else {
      body = "<h2 style=\"font-size:1.6rem;margin-bottom:1rem\">" + esc(t(K.s4)) + '</h2><div class="note" style="margin-bottom:1rem">' + ico("info") + "<span>" + esc(t(K.reviewNote)) + "</span></div>" + summary(true);
    }
    const canNext = B.step === 0 ? !!B.type : B.step === 1 ? !!(B.date && B.time != null) : true;
    return progress() + (B.fail ? failure() : "") + body +
      '<div class="book-nav"><div>' + (B.step > 0 ? '<button type="button" class="btn btn-ghost" data-nav="back">' + ico("chevL") + esc(t(K.back)) + "</button>" : "") + "</div>" +
      "<div>" + (B.step < 3 ? '<button type="button" class="btn btn-ink" data-nav="next"' + (canNext ? "" : " disabled") + ">" + esc(t(K.next)) + ico("arrow") + "</button>" : '<button type="button" class="btn btn-amber btn-lg" data-nav="send">' + ico("cal") + esc(t(K.send)) + "</button>") + "</div></div>";
  }
  function calendar() {
    const m = B.month, y = m.getFullYear(), mo = m.getMonth();
    const first = new Date(y, mo, 1), startDow = first.getDay(), days = new Date(y, mo + 1, 0).getDate();
    const end = horizonEnd();
    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1), maxMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    let cells = "";
    for (let i = 0; i < startDow; i++) cells += "<span></span>";
    for (let d = 1; d <= days; d++) {
      const dt = new Date(y, mo, d), ok = dayOk(dt), key = ymd(dt);
      cells += '<button type="button" class="day' + (ok ? " avail" : "") + (key === ymd(today) ? " today" : "") + '" data-day="' + key + '"' + (ok ? "" : " disabled") + ' aria-pressed="' + (B.date === key) + '" aria-label="' + esc(fmtDate(dt)) + '">' + d + "</button>";
    }
    return '<div class="cal"><div class="cal-head"><button type="button" data-month="-1"' + (m <= minMonth ? " disabled" : "") + ' aria-label="Previous month">' + ico("chevL") + "</button><b>" + esc(t(C.ui.months)[mo]) + " " + y + '</b><button type="button" data-month="1"' + (m >= maxMonth ? " disabled" : "") + ' aria-label="Next month">' + ico("chevR") + "</button></div>" +
      '<div class="cal-grid">' + t(C.ui.dow).map(x => '<span class="dow">' + x + "</span>").join("") + cells + "</div>" +
      '<p class="small" style="margin-top:.7rem">' + esc(t(C.book.pickDay)) + "</p></div>";
  }
  function slotList() {
    if (!B.date) return '<div class="slot-empty">' + esc(t(C.book.pickDay)) + "</div>";
    const d = fromYmd(B.date), info = dayInfo(d), s = slotsFor(d);
    if (!s.length) return '<div class="slot-empty">' + esc(t(info && info.closed ? C.book.closedDay : C.book.noSlots)) + "</div>";
    return "<h4>" + esc(t(C.book.timesFor)) + " " + esc(fmtDate(d)) + '</h4><div class="slot-grid">' + s.map(x => '<button type="button" class="slot" data-time="' + x.m + '" aria-pressed="' + (B.time === x.m) + '">' + fmtTime(x.m) + "</button>").join("") + "</div>";
  }
  function calendarDown() {
    return '<div class="note amber" style="align-items:flex-start">' + ico("info") +
      "<span><b>" + esc(t(C.book.avErrH)) + "</b><br>" + esc(t(C.book.avErrP)) + "</span></div>" +
      '<p style="margin-top:1.2rem"><a class="btn btn-ink" href="' + PHONE_TEL + '">' + ico("phone") + PHONE +
      '</a> <button type="button" class="btn btn-ghost" data-nav="retry">' + esc(t(C.book.retry)) + "</button></p>";
  }
  function field(name, label, input, hint) {
    const err = B.errors[name];
    return '<div class="field' + (err ? " err" : "") + '"><label for="f-' + name + '">' + esc(t(label)) + "</label>" + input + (hint ? '<span class="hint">' + esc(t(hint)) + "</span>" : "") + (err ? '<span class="err-msg">' + esc(err) + "</span>" : "") + "</div>";
  }
  function detailsForm() {
    const F = C.book.f, v = n => esc(B.form[n] || "");
    const inp = (n, type, extra) => '<input id="f-' + n + '" name="' + n + '" type="' + (type || "text") + '" value="' + v(n) + '" ' + (extra || "") + ">";
    const insOpts = ['<option value="">—</option>'].concat(C.insurance.carriers.map(c => '<option' + (B.form.ins === c ? " selected" : "") + ">" + esc(c) + "</option>"), ['<option value="selfpay"' + (B.form.ins === "selfpay" ? " selected" : "") + ">" + esc(t(F.selfpay)) + "</option>", '<option value="other"' + (B.form.ins === "other" ? " selected" : "") + ">" + esc(t(F.other)) + "</option>"]).join("");
    return '<form class="form-grid" id="details" novalidate>' +
      field("first", F.first, inp("first", "text", 'autocomplete="given-name" required')) +
      field("last", F.last, inp("last", "text", 'autocomplete="family-name" required')) +
      field("dob", F.dob, inp("dob", "date", 'autocomplete="bday" required')) +
      field("phone", F.phone, inp("phone", "tel", 'autocomplete="tel" inputmode="tel" required')) +
      field("email", F.email, inp("email", "email", 'autocomplete="email"')) +
      field("ins", F.ins, '<select id="f-ins" name="ins">' + insOpts + "</select>") +
      '<div class="field full"><span style="font-weight:600;font-size:.92rem">' + esc(t(F.status)) + '</span><div class="opts" style="margin-top:.3rem"><button type="button" class="opt" data-status="new" aria-pressed="' + (B.form.status !== "est") + '"><b>' + esc(t(F.newp)) + '</b></button><button type="button" class="opt" data-status="est" aria-pressed="' + (B.form.status === "est") + '"><b>' + esc(t(F.estp)) + "</b></button></div></div>" +
      '<div class="full">' + field("ref", F.ref, inp("ref", "text")) + "</div>" +
      '<div aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden"><label for="f-mm_ref_code">Leave this field empty</label><input id="f-mm_ref_code" name="mm_ref_code" type="text" tabindex="-1" autocomplete="new-password" data-lpignore="true" data-1p-ignore data-form-type="other" value="' + v("mm_ref_code") + '"></div>' +
      '<div class="full">' + field("reason", F.reason, '<textarea id="f-reason" name="reason" rows="2" maxlength="140">' + v("reason") + "</textarea>", F.reasonHint) + "</div>" +
      '<div class="full field' + (B.errors.consent ? " err" : "") + '"><label style="display:flex;gap:.6rem;align-items:flex-start;font-weight:400;font-size:.92rem"><input type="checkbox" id="f-consent" name="consent" style="width:auto;margin-top:.25rem"' + (B.form.consent ? " checked" : "") + ">" + esc(t(F.consent)) + "</label>" + (B.errors.consent ? '<span class="err-msg">' + esc(B.errors.consent) + "</span>" : "") + "</div>" +
      "</form>";
  }
  function validate() {
    const F = C.book.f, f = B.form, e = {};
    ["first", "last", "dob", "phone"].forEach(n => { if (!(f[n] || "").trim()) e[n] = t(F.req); });
    if (f.phone && (f.phone.replace(/\D/g, "").length < 10)) e.phone = t(F.badPhone);
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = t(F.badEmail);
    if (!f.consent) e.consent = t(F.req);
    B.errors = e; return !Object.keys(e).length;
  }
  function summary(full) {
    const K = C.book, L = K.labels, ty = typeOf(B.type), f = B.form;
    const row = (k, v) => "<dt>" + esc(t(k)) + "</dt><dd" + (v ? "" : ' class="empty"') + ">" + (v ? esc(v) : esc(t(K.notChosen))) + "</dd>";
    const insLabel = f.ins === "selfpay" ? t(K.f.selfpay) : f.ins === "other" ? t(K.f.other) : f.ins;
    return '<div class="summary"><h3 style="font-size:1.05rem;font-family:var(--sans);font-weight:600;margin-bottom:.8rem">' + esc(t(K.summaryTitle)) + "</h3><dl>" +
      row(L.type, ty && t(ty.h)) + row(L.dur, ty && ty.dur + " " + t(K.min)) +
      row(L.when, B.date && B.time != null ? fmtDate(fromYmd(B.date)) + " · " + fmtTime(B.time) : "") +
      row(L.where, ty ? (ty.id === "video" ? t(K.byVideo) : t(K.inOffice)) : "") +
      (full ? row(L.who, ((f.first || "") + " " + (f.last || "")).trim() + (f.phone ? " · " + f.phone : "")) + row(L.ins, insLabel) : "") +
      "</dl></div>";
  }
  function success() {
    const K = C.book;
    return '<div class="success"><div class="big-check">' + ico("check") + "</div><h2>" + esc(t(K.doneH)) + '</h2><p class="lede">' + esc(t(K.doneP)) + '</p><span class="ref">' + esc(t(K.refNo)) + " " + esc(B.done) + "</span>" + summary(true) +
      '<div class="flex"><a class="btn btn-ink" href="' + PHONE_TEL + '">' + ico("phone") + PHONE + '</a><button type="button" class="btn btn-ghost" data-nav="reset">' + esc(t(K.another)) + "</button></div></div>";
  }
  /* A request that did not reach the office must never look like one that did. */
  function failure() {
    const K = C.book, taken = B.fail === "taken";
    return '<div class="note amber" style="align-items:flex-start;margin-bottom:1.2rem">' + ico("info") +
      "<span><b>" + esc(t(taken ? K.takenH : K.failH)) + "</b><br>" + esc(t(taken ? K.takenP : K.failP)) +
      (taken ? "" : " " + esc(t(K.failKept))) + "</span></div>" +
      '<p style="margin-bottom:1.2rem"><a class="btn btn-ink" href="' + PHONE_TEL + '">' + ico("phone") + PHONE + "</a></p>";
  }
  function rerenderBook() {
    const el = $("#book-main");
    if (el) { el.innerHTML = bookMain(); el.scrollIntoView({ block: "start", behavior: "smooth" }); }
    if (B.step === 1 && !B.done) ensureAvailability();
  }
  function onBookClick(e) {
    const b = e.target.closest("[data-type],[data-day],[data-time],[data-month],[data-nav],[data-status]"); if (!b || b.disabled) return;
    if (b.dataset.type) { B.type = b.dataset.type; B.time = null; rerenderBook(); }
    else if (b.dataset.day) { B.date = b.dataset.day; B.time = null; rerenderBook(); }
    else if (b.dataset.time) { B.time = +b.dataset.time; rerenderBook(); }
    else if (b.dataset.month) { B.month = new Date(B.month.getFullYear(), B.month.getMonth() + (+b.dataset.month), 1); rerenderBook(); }
    else if (b.dataset.status) { B.form.status = b.dataset.status; rerenderBook(); }
    else if (b.dataset.nav === "retry") { loadAvailability(true).then(() => rerenderBook()); rerenderBook(); }
    else if (b.dataset.nav === "back") { B.step = Math.max(0, B.step - 1); rerenderBook(); }
    else if (b.dataset.nav === "next") {
      if (B.step === 2 && !validate()) { rerenderBook(); const first = $("#book-main .field.err input, #book-main .field.err select"); if (first) first.focus(); return; }
      B.step = Math.min(3, B.step + 1); rerenderBook();
    }
    else if (b.dataset.nav === "send") { submitBooking(b); }
    else if (b.dataset.nav === "reset") { Object.assign(B, { step: 0, type: null, date: null, time: null, form: {}, errors: {}, done: null, fail: null }); rerenderBook(); }
  }
  async function submitBooking(btn) {
    if (B.sending) return;
    B.sending = true;
    B.fail = null;
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = lang === "es" ? "Enviando…" : "Sending…";
    const payload = {
      visit_type: B.type,
      requested_date: B.date,
      requested_time: B.time == null ? null : Math.floor(B.time / 60) + ":" + pad(B.time % 60),
      first_name: B.form.first, last_name: B.form.last, dob: B.form.dob,
      phone: B.form.phone, email: B.form.email, insurance: B.form.ins,
      patient_status: B.form.status === "est" ? "est" : "new",
      referred_by: B.form.ref, reason: B.form.reason,
      consent: !!B.form.consent, lang: lang,
      mm_ref_code: B.form.mm_ref_code || "",   // spam trap: a person never sees this field
      elapsed_ms: Date.now() - BOOK_OPENED,
      source: "website"
    };
    const restore = () => { B.sending = false; btn.disabled = false; btn.innerHTML = original; };
    try {
      const r = await fetch("/api/appointments", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await r.json().catch(() => ({}));

      if (r.ok && data.ref) { B.done = data.ref; }
      else if (r.status === 422 && data.errors) {
        const map = { first_name: "first", last_name: "last", dob: "dob", phone: "phone", email: "email", consent: "consent" };
        B.errors = {}; Object.keys(data.errors).forEach(k => { B.errors[map[k] || k] = data.errors[k]; });
        B.step = 2; restore(); rerenderBook(); toast(data.error || t(C.book.f.req)); return;
      }
      else if (r.status === 409) {
        // Someone else took the slot mid-form. Nothing was stored; show the fresh calendar.
        B.fail = "taken"; B.time = null; B.step = 1;
        restore();
        loadAvailability(true).then(() => rerenderBook());
        rerenderBook();
        toast(t(C.book.takenH));
        return;
      }
      else if (r.status === 429) { restore(); toast(data.error || t(C.book.failH)); return; }
      else throw new Error(data.error || ("HTTP " + r.status));
    } catch (err) {
      /* The office system could not be reached. Say so plainly: a reference number here
         would tell a patient they have an appointment when the office has no record. */
      B.fail = "error";
      restore();
      rerenderBook();
      toast(t(C.book.failH));
      return;
    }
    B.sending = false;
    rerenderBook();
    toast(t(C.book.doneH));
  }

  function onBookInput(e) {
    const el = e.target; if (!el.name || !el.closest("#details")) return;
    B.form[el.name] = el.type === "checkbox" ? el.checked : el.value;
    if (B.errors[el.name]) { delete B.errors[el.name]; const f = el.closest(".field"); if (f) { f.classList.remove("err"); const m = f.querySelector(".err-msg"); if (m) m.remove(); } }
  }

  /* ---------- chrome ---------- */
  function currentPage() { const h = location.hash.replace(/^#\/?/, ""); return h.split("/")[0] || "home"; }
  function renderChrome() {
    const cur = currentPage();
    document.documentElement.lang = lang;
    $("#nav").innerHTML = C.nav.map(n => '<a href="#/' + (n.id === "home" ? "" : n.id) + '"' + (cur === n.id ? ' aria-current="page"' : "") + ">" + esc(t(n)) + "</a>").join("");
    $("#brand-shield").innerHTML = '<img src="' + EMBLEM + '" alt="" aria-hidden="true" width="191" height="252">';
    $("#brand-virus").innerHTML = '<img class="spin" src="' + VIRUS_MARK + '" alt="" aria-hidden="true" width="100" height="100">';
    $("#head-book").textContent = t(C.ui.book);
    $("#menu-btn").innerHTML = ico($("#site-head").classList.contains("open") ? "x" : "menu");
    $("#menu-btn").setAttribute("aria-label", t(C.ui.menu));
    $(".skip").textContent = t(C.ui.skip);
    document.querySelectorAll(".lang button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    const themes = [["auto", "auto"], ["light", "sun"], ["dark", "moon"]];
    const switchHtml = themes.map(([id, ic]) =>
      '<button type="button" data-theme-set="' + id + '" aria-pressed="' + (theme === id) + '" title="' + esc(t(C.ui.themes[id])) + '" aria-label="' + esc(t(C.ui.themes[id])) + '">' + ico(ic) + "</button>").join("");
    $("#mobile-bar").innerHTML = '<a class="btn btn-ghost" href="' + PHONE_TEL + '">' + ico("phone") + esc(t(C.ui.call)) + '</a><a class="btn btn-amber" href="#/book">' + ico("cal") + esc(t(C.ui.book)) + "</a>";
    const F = C.footer;
    $("#site-foot").innerHTML = '<div class="wrap foot-grid"><div><a class="foot-lockup" href="#/" aria-label="Mojave Medical home">' + LOCKUP() + '</a><p class="small" style="max-width:34ch">' + esc(t(F.tag)) + '</p><address class="addr small" style="margin-top:1rem">' + esc(ADDRESS.line1) + "<br>" + esc(ADDRESS.city) + "</address></div>" +
      "<div><h4>" + esc(t(F.pages)) + "</h4><ul>" + [{ id: "home", en: "Home", es: "Inicio" }].concat(C.nav).map(n => '<li><a href="#/' + (n.id === "home" ? "" : n.id) + '">' + esc(t(n)) + "</a></li>").join("") + "</ul></div>" +
      "<div><h4>" + esc(t(F.patientsCol)) + "</h4><ul>" + F.links.map(l => '<li><a href="' + l.href + '">' + esc(t(l)) + "</a></li>").join("") + '<li><a href="#/forms">' + esc(t(F.formsLink)) + "</a></li>" + "</ul></div>" +
      "<div><h4>" + esc(t(F.contactCol)) + '</h4><ul><li><a class="mono" href="' + PHONE_TEL + '">' + PHONE + '</a></li><li class="mono small">' + esc(t(C.contact.fax)) + " " + FAX + '</li><li><a href="mailto:' + EMAIL + '" style="word-break:break-all">' + EMAIL + '</a></li><li class="small">' + esc(t(C.ui.days)[1]) + "–" + esc(t(C.ui.days)[5]) + " " + esc(hoursRow(1)) + "<br>" + esc(t(C.ui.days)[6]) + " " + esc(hoursRow(6)) + "</li></ul></div></div>" +
      '<div class="wrap foot-bottom"><span>' + esc(t(F.legal)) + '</span><span class="foot-links"><a href="#/privacy">' + esc(t(F.privacy)) + '</a><a href="#/accessibility">' + esc(t(F.access)) + '</a><a href="#/forms">' + esc(t(F.formsLink)) + '</a><a href="' + ADDRESS.maps + '" target="_blank" rel="noopener">' + esc(t(F.google)) + "</a></span>" +
      '<span class="foot-theme"><span class="foot-theme-label" id="foot-theme-label">' + esc(t(C.ui.themeLabel)) + '</span><span class="theme-switch" role="group" aria-labelledby="foot-theme-label">' + switchHtml + "</span></span></div>";
  }
  const PAGES = { home: pageHome, about: pageAbout, services: pageServices, patients: pagePatients, reviews: pageReviews, contact: pageContact, book: pageBook, privacy: pagePrivacy, accessibility: pageAccessibility, forms: () => pageForms(ROUTE_ARG) };
  let ROUTE_ARG = null;
  function route() {
    const h = location.hash.replace(/^#\/?/, ""), parts = h.split("/"), name = PAGES[parts[0]] ? parts[0] : "home";
    if (name === "book" && parts[1] && typeOf(parts[1])) { B.type = parts[1]; if (B.step === 0 && !B.done) B.step = 1; }
    ROUTE_ARG = parts[1] || null;
    const main = $("#main");
    main.classList.remove("page"); void main.offsetWidth; main.classList.add("page");
    main.innerHTML = PAGES[name]();
    document.title = "Mojave Medical · " + t(C.titles[name]);
    if (name === "book" && !B.done) ensureAvailability();
    $("#site-head").classList.remove("open"); $("#menu-btn").setAttribute("aria-expanded", "false");
    renderChrome();
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }
  document.addEventListener("click", e => {
    const tb = e.target.closest("[data-theme-set]");
    if (tb) { theme = tb.dataset.themeSet; try { localStorage.setItem("mm_theme", theme); } catch (err) {} applyTheme(); renderChrome(); return; }
    const lb = e.target.closest(".lang button"); if (lb) { lang = lb.dataset.lang; try { localStorage.setItem("mm_lang", lang); } catch (err) {} route(); return; }
    if (e.target.closest("#menu-btn")) { const hd = $("#site-head"); const open = hd.classList.toggle("open"); $("#menu-btn").setAttribute("aria-expanded", String(open)); $("#menu-btn").innerHTML = ico(open ? "x" : "menu"); return; }
    if (e.target.closest("#book-main")) onBookClick(e);
  });
  document.addEventListener("input", onBookInput);
  document.addEventListener("change", onBookInput);
  window.addEventListener("hashchange", route);
  route();
  /* One quiet call at start-up keeps the printed office hours in step with the schedule
     staff maintain in the dashboard, and warms the calendar before anyone clicks Book. */
  loadAvailability().then(() => {
    // Redraw when the practice's real hours differ from the ones compiled into the page,
    // and always on the booking page so the calendar and the sidebar agree.
    const stale = AV.hours && AV.hours.some(r => { const c = C.location.hours.find(x => x.d === r.d); return (c ? c.en : null) !== r.en; });
    if (stale || currentPage() === "book") route();
  });
})();
</script>
