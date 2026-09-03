const fs = require('fs'), path = require('path');
const OUT = __dirname;
const T = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));     // text-outlines.json
const shieldSrc = fs.readFileSync(path.join(OUT, 'shield.svg'), 'utf8');
const virusSrc  = fs.readFileSync(path.join(OUT, 'virus.svg'), 'utf8');
const inner = s => s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const AMBER = '#FEBD5A', GREY_TEXT = '#737373', GREY_TAG = '#8C8C8C', BLACK = '#161616';

/* ---------- colour mapping helpers ---------- */
function themed(svgInner, id) {   // colours -> CSS variables (with fallbacks) so inline copies follow the site theme
  return svgInner
    .replace(/#BCBCBC/g, 'var(--logo-grey,#BCBCBC)').replace(/#989898/g, 'var(--logo-grey2,#989898)')
    .replace(/#BEBEBE/g, 'var(--logo-grey3,#BEBEBE)').replace(/#B1B1B1/g, 'var(--logo-grey4,#B1B1B1)')
    .replace(/#858585/g, 'var(--logo-grey5,#858585)').replace(/#F5F5F5/g, 'var(--logo-white,#F5F5F5)')
    .replace(/mmInner/g, 'mmInner-' + id);
}
function mono(svgInner, id) {      // single-colour version, like the window graphic; gaps cut with a mask
  let s = svgInner.replace(/mmInner/g, 'mmInnerM-' + id);
  s = s.replace(/#FEBD5A|#BCBCBC|#BEBEBE|#B1B1B1|#989898|#858585/g, 'currentColor');
  s = s.replace(/fill="#F5F5F5"/g, 'fill="none"').replace(/stroke="#F5F5F5"/g, 'stroke="currentColor"');
  s = s.replace(/stroke="#E8603E"/g, 'stroke="currentColor"');
  // the cap band and the collar V read as cut-outs in mono
  s = s.replace('<rect x="81" y="98.5" width="42" height="6.5" rx="2" fill="currentColor"/>', '');
  return s;
}
const shieldColor = inner(shieldSrc), virusColor = inner(virusSrc);
const virusMono = virusColor.replace(/#FEBD5A/g, 'currentColor');

/* ---------- text placement ---------- */
// fit "M[virus]JAVE MEDICAL" so the whole word measures `targetW` at cap height `cap`
function wordmark(cap, targetW, fill, virusInner) {
  const size = cap / 0.70;                     // Montserrat cap height = 0.70 em
  const sc = size / 100;
  const track = 0.20 * size;                   // will be refined by fit
  const parts = [T.M, T.JAVE, T.MEDICAL];
  const virusD = cap * 1.46;                   // virus outer diameter relative to caps
  let natural = (T.M.width + T.JAVE.width + T.MEDICAL.width) * sc + virusD + track * 4 + size * 0.42;
  const k = targetW / natural;                 // uniform scale to hit the target width
  const S = sc * k, TR = track * k, VD = virusD * k, SP = size * 0.42 * k, CAP = cap * k;
  let x = 0, out = '';
  const glyph = (p) => { out += `<path transform="translate(${x.toFixed(2)} 0) scale(${S.toFixed(5)} ${S.toFixed(5)})" fill="${fill}" d="${p.path}"/>`; x += p.width * S; };
  glyph(T.M); x += TR;
  // virus sits where the O would be, vertically centred on the cap height
  const vx = x + VD / 2, vy = -CAP / 2;
  out += `<g transform="translate(${vx.toFixed(2)} ${vy.toFixed(2)}) scale(${(VD / 100).toFixed(5)}) translate(-50 -50)">${virusInner}</g>`;
  x += VD + TR;
  glyph(T.JAVE); x += SP; glyph(T.MEDICAL);
  return { svg: out, width: x, cap: CAP, size: size * k, virus: { cx: vx, cy: vy, d: VD } };
}
function line(p, size, fill, x, y, track) {
  const sc = size / 100;
  return `<path transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${sc.toFixed(5)} ${sc.toFixed(5)})" fill="${fill}" d="${p.path}"/>`;
}
// Word-spacing/tracking are baked into the outlines at generation time (0.22em / 0.16em), so widths are exact.

/* ---------- horizontal lockup ---------- */
function horizontal({ tagline, taglineSize, white, themedVars }) {
  const W = 1000, H = 330;
  const shieldH = 262, sSc = shieldH / 202;                 // shield spans y 44..246 in its own space
  const shieldG = `<g transform="translate(${(6 - 24 * sSc).toFixed(2)} ${(34 - 44 * sSc).toFixed(2)}) scale(${sSc.toFixed(4)})">${white ? mono(shieldColor, 'h') : (themedVars ? themed(shieldColor, 'h') : shieldColor)}</g>`;
  const tx = 262, textW = 720;
  const wm = wordmark(52, textW, white ? 'currentColor' : (themedVars ? 'var(--logo-text,#737373)' : GREY_TEXT), white ? virusMono : virusColor);
  const wmY = 118;                                           // baseline of the wordmark
  const tagFill = white ? 'currentColor' : (themedVars ? 'var(--logo-tag,#8C8C8C)' : GREY_TAG);
  const nameFill = white ? 'currentColor' : (themedVars ? 'var(--logo-name,#161616)' : BLACK);
  const tagP = tagline === 'classic' ? T.taglineClassic : T.tagline;
  const tagS = taglineSize || Math.min(52, (textW / tagP.width) * 100);
  const nameS = 41;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mojave Medical, Kevin Ganesh MD">${shieldG}` +
    `<g transform="translate(${tx} ${wmY})">${wm.svg}</g>` +
    line(tagP, tagS, tagFill, tx + 2, 196, 0) +
    line(T.name, nameS, nameFill, tx + 2, 270, 0) + `</svg>`;
}
/* ---------- stacked lockup (window-graphic layout) ---------- */
function stacked({ white, themedVars }) {
  const W = 640, H = 600;
  const sSc = 1.15, sx = (W / 2) - 101.5 * sSc, sy = 12 - 44 * sSc;
  const shieldG = `<g transform="translate(${sx.toFixed(2)} ${sy.toFixed(2)}) scale(${sSc})">${white ? mono(shieldColor, 's') : (themedVars ? themed(shieldColor, 's') : shieldColor)}</g>`;
  const wm = wordmark(50, 560, white ? 'currentColor' : (themedVars ? 'var(--logo-text,#737373)' : GREY_TEXT), white ? virusMono : virusColor);
  const nameFill = white ? 'currentColor' : (themedVars ? 'var(--logo-name,#161616)' : BLACK);
  const tagFill = white ? 'currentColor' : (themedVars ? 'var(--logo-tag,#8C8C8C)' : GREY_TAG);
  const l1 = T.tagLine1 || T.taglineClassic, l2 = T.tagLine2;
  const tagS = 44;
  const c = (p, s) => (W - p.width * s / 100) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mojave Medical, Kevin Ganesh MD">${shieldG}` +
    `<g transform="translate(${((W - wm.width) / 2).toFixed(2)} 350)">${wm.svg}</g>` +
    line(T.name, 34, nameFill, c(T.name, 34), 408, 0) +
    (l2 ? line(l1, tagS, tagFill, c(l1, tagS), 490, 0) + line(l2, tagS, tagFill, c(l2, tagS), 548, 0) : line(l1, tagS, tagFill, c(l1, tagS), 510, 0)) + `</svg>`;
}
const files = {
  'mojave-medical-shield.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 215 288" role="img" aria-label="Mojave Medical shield emblem">${shieldColor}</svg>`,
  'mojave-medical-shield-white.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 215 288" role="img" aria-label="Mojave Medical shield emblem" style="color:#fff">${mono(shieldColor, 'w')}</svg>`,
  'mojave-medical-virus.svg': virusSrc,
  'mojave-medical-virus-white.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="Mojave Medical virus mark" style="color:#fff">${virusMono}</svg>`,
  'mojave-medical-logo-horizontal.svg': horizontal({ tagline: 'classic' }),
  'mojave-medical-logo-horizontal-primary-care.svg': horizontal({ tagline: 'signage' }),
  'mojave-medical-logo-horizontal-white.svg': horizontal({ tagline: 'signage', white: true }).replace('<svg ', '<svg style="color:#fff" '),
  'mojave-medical-logo-stacked.svg': stacked({}),
  'mojave-medical-logo-stacked-white.svg': stacked({ white: true }).replace('<svg ', '<svg style="color:#fff" '),
};
for (const [n, c] of Object.entries(files)) fs.writeFileSync(path.join(OUT, n), c);
// inline, theme-aware copies for the website
const inline = {
  LOGO_LOCKUP: horizontal({ tagline: 'signage', themedVars: true }),
  LOGO_SHIELD: `<svg viewBox="0 0 215 288" aria-hidden="true">${themed(shieldColor, 'i')}</svg>`,
  LOGO_VIRUS: `<svg viewBox="0 0 100 100" aria-hidden="true">${virusColor}</svg>`,
  LOGO_VIRUS_MONO: `<svg viewBox="0 0 100 100" aria-hidden="true">${virusMono}</svg>`,
};
fs.writeFileSync(path.join(OUT, '..', 'src', 'logo-inline.js'), '<script>' + Object.entries(inline).map(([k, v]) => `const ${k}=${JSON.stringify(v)};`).join('') + '</script>\n');
console.log('wrote', Object.keys(files).length, 'svg files + src/logo-inline.js');
