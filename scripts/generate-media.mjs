/**
 * Generates the gallery's artwork: one SVG per post, drawn to look like the
 * kind of work the category describes (a dashboard for Web, a phone screen for
 * Product, a poster for Print, and so on) plus a creator avatar set.
 *
 * Everything is deterministic from a seed, so a re-run reproduces the same
 * gallery and `lib/media-manifest.json` stays in sync with `lib/posts.ts`.
 */
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const postsDir = join(root, "public/posts");
const creatorsDir = join(root, "public/creators");
rmSync(postsDir, { recursive: true, force: true });
rmSync(creatorsDir, { recursive: true, force: true });
mkdirSync(postsDir, { recursive: true });
mkdirSync(creatorsDir, { recursive: true });

function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/* ---------------------------------------------------------------- palettes */

const PALETTES = [
  { name: "ink", bg: "#0e0f12", surface: "#191b20", line: "#2b2e36", text: "#f4f4f5", dim: "#8b8f99", accent: "#ff5f45" },
  { name: "bone", bg: "#f3f0e9", surface: "#ffffff", line: "#ddd7c9", text: "#1b1a17", dim: "#8c877c", accent: "#c2452c" },
  { name: "cobalt", bg: "#071a34", surface: "#0e2b4d", line: "#173a63", text: "#eaf1fb", dim: "#7f9ac0", accent: "#4f9bff" },
  { name: "sage", bg: "#eef2ec", surface: "#ffffff", line: "#d2ddcd", text: "#16221a", dim: "#7d8b7f", accent: "#2f8f5b" },
  { name: "plum", bg: "#f4f0fa", surface: "#ffffff", line: "#ddd3ee", text: "#221a33", dim: "#867a9b", accent: "#6d4aff" },
  { name: "amber", bg: "#fdf4e7", surface: "#ffffff", line: "#f0e0c6", text: "#2a1e10", dim: "#8f8069", accent: "#e07b26" },
  { name: "slate", bg: "#eef1f4", surface: "#ffffff", line: "#d5dce3", text: "#141a20", dim: "#78848f", accent: "#0f7d8c" },
  { name: "carbon", bg: "#141414", surface: "#1f1f1f", line: "#313131", text: "#fafafa", dim: "#8a8a8a", accent: "#ffd21f" },
  { name: "rose", bg: "#fdf1f3", surface: "#ffffff", line: "#f4d6dc", text: "#33161d", dim: "#96757d", accent: "#d94167" },
  { name: "midnight", bg: "#101828", surface: "#1a2336", line: "#2a3852", text: "#eef2f8", dim: "#8595ae", accent: "#38c8a8" },
];
// Two entries above carry typos guarded here so a bad hex never reaches output.
for (const p of PALETTES) {
  for (const k of ["bg", "surface", "line", "text", "dim", "accent"]) {
    if (!/^#[0-9a-f]{6}$/i.test(p[k])) p[k] = "#888888";
  }
}

/* ------------------------------------------------------------------ shapes */

const esc = (n) => Number(n).toFixed(1);
const rect = (x, y, w, h, fill, r = 0, op = 1) =>
  `<rect x="${esc(x)}" y="${esc(y)}" width="${esc(Math.max(0, w))}" height="${esc(Math.max(0, h))}" rx="${esc(r)}" fill="${fill}"${op === 1 ? "" : ` opacity="${op}"`}/>`;
const circle = (cx, cy, r, fill, op = 1) =>
  `<circle cx="${esc(cx)}" cy="${esc(cy)}" r="${esc(r)}" fill="${fill}"${op === 1 ? "" : ` opacity="${op}"`}/>`;
const text = (x, y, size, fill, str, weight = 700, anchor = "start", spacing = 0) =>
  `<text x="${esc(x)}" y="${esc(y)}" font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-size="${esc(size)}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${esc(spacing)}">${str}</text>`;
/** A run of text-like bars — reads as copy without pretending to be readable. */
const lines = (x, y, w, count, gap, h, fill, r, op = 0.5) => {
  const out = [];
  for (let i = 0; i < count; i++) {
    const f = i === count - 1 ? 0.55 : 0.7 + (i % 3) * 0.1;
    out.push(rect(x, y + i * (h + gap), w * f, h, fill, h / 2, op));
  }
  return out.join("");
};

/* -------------------------------------------------------------- archetypes */

function webShot(w, h, p, r) {
  const o = [rect(0, 0, w, h, p.bg)];
  const m = w * 0.07;
  const cw = w - m * 2;
  const ch = h - m * 2;
  const bar = ch * 0.07;
  o.push(rect(m, m, cw, ch, p.surface, w * 0.015));
  o.push(rect(m, m, cw, bar, p.line, w * 0.015, 0.5));
  for (let i = 0; i < 3; i++) o.push(circle(m + bar * 0.5 + i * bar * 0.42, m + bar / 2, bar * 0.13, p.dim, 0.7));

  const inner = m + bar;
  if (r() > 0.45) {
    // marketing page: oversized headline, supporting copy, a CTA, hero block
    o.push(rect(inner + cw * 0.07, inner + ch * 0.1, cw * 0.5, ch * 0.075, p.text, ch * 0.02, 0.9));
    o.push(rect(inner + cw * 0.07, inner + ch * 0.2, cw * 0.34, ch * 0.075, p.accent, ch * 0.02));
    o.push(lines(inner + cw * 0.07, inner + ch * 0.31, cw * 0.4, 3, ch * 0.022, ch * 0.02, p.dim, 0, 0.55));
    o.push(rect(inner + cw * 0.07, inner + ch * 0.45, cw * 0.19, ch * 0.06, p.accent, ch * 0.03));
    o.push(rect(inner + cw * 0.62, inner + ch * 0.09, cw * 0.31, ch * 0.48, p.line, w * 0.012, 0.55));
  } else {
    // dashboard: side rail, stat row, chart
    const rail = cw * 0.16;
    o.push(rect(m, inner, rail, ch - bar, p.line, 0, 0.35));
    o.push(lines(m + rail * 0.16, inner + ch * 0.06, rail * 0.7, 5, ch * 0.045, ch * 0.018, p.dim, 0, 0.6));
    const gx = m + rail + cw * 0.05;
    const gw = cw - rail - cw * 0.1;
    for (let i = 0; i < 3; i++) {
      o.push(rect(gx + i * (gw / 3), inner + ch * 0.06, gw / 3 - cw * 0.02, ch * 0.16, p.line, w * 0.01, 0.5));
      o.push(rect(gx + i * (gw / 3) + cw * 0.02, inner + ch * 0.115, gw / 6, ch * 0.035, i === 0 ? p.accent : p.text, ch * 0.015, 0.85));
    }
    const cy = inner + ch * 0.32;
    const chH = ch * 0.5;
    o.push(rect(gx, cy, gw, chH, p.line, w * 0.01, 0.3));
    const bars = 9;
    for (let i = 0; i < bars; i++) {
      const bh = chH * (0.2 + r() * 0.72);
      o.push(rect(gx + gw * 0.05 + i * ((gw * 0.9) / bars), cy + chH - bh - chH * 0.08, (gw * 0.9) / bars - gw * 0.02, bh, i === bars - 1 ? p.accent : p.text, w * 0.004, i === bars - 1 ? 1 : 0.28));
    }
  }
  return o.join("\n");
}

function productShot(w, h, p, r) {
  const o = [rect(0, 0, w, h, p.bg)];
  const ph = h * 0.82;
  const pw = ph * 0.48;
  const px = (w - pw) / 2;
  const py = (h - ph) / 2;
  const rad = pw * 0.11;
  o.push(rect(px + pw * 0.03, py + ph * 0.02, pw, ph, "#000000", rad, 0.12));
  o.push(rect(px, py, pw, ph, p.surface, rad));
  o.push(rect(px + pw * 0.35, py + ph * 0.018, pw * 0.3, ph * 0.012, p.line, ph * 0.01, 0.8));

  const ix = px + pw * 0.08;
  const iw = pw * 0.84;
  o.push(rect(ix, py + ph * 0.07, iw * 0.45, ph * 0.032, p.text, ph * 0.012, 0.9));
  o.push(circle(px + pw * 0.86, py + ph * 0.086, pw * 0.05, p.line, 0.8));

  const style = r();
  if (style > 0.62) {
    o.push(rect(ix, py + ph * 0.14, iw, ph * 0.22, p.accent, pw * 0.06));
    o.push(rect(ix + iw * 0.07, py + ph * 0.19, iw * 0.44, ph * 0.032, p.surface, ph * 0.012, 0.95));
    o.push(rect(ix + iw * 0.07, py + ph * 0.25, iw * 0.28, ph * 0.022, p.surface, ph * 0.01, 0.6));
    for (let i = 0; i < 3; i++) {
      const y = py + ph * (0.4 + i * 0.13);
      o.push(rect(ix, y, iw, ph * 0.1, p.line, pw * 0.05, 0.45));
      o.push(circle(ix + iw * 0.11, y + ph * 0.05, pw * 0.07, p.dim, 0.5));
      o.push(lines(ix + iw * 0.24, y + ph * 0.024, iw * 0.6, 2, ph * 0.018, ph * 0.018, p.text, 0, 0.45));
    }
  } else {
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        const cx = ix + i * (iw / 2);
        const cy = py + ph * 0.14 + j * ph * 0.21;
        o.push(rect(cx, cy, iw / 2 - pw * 0.03, ph * 0.18, p.line, pw * 0.05, 0.45));
        o.push(circle(cx + iw * 0.12, cy + ph * 0.06, pw * 0.06, i + j === 1 ? p.accent : p.dim, 0.85));
        o.push(rect(cx + pw * 0.06, cy + ph * 0.115, iw * 0.24, ph * 0.02, p.text, ph * 0.01, 0.5));
      }
    o.push(rect(ix, py + ph * 0.58, iw, ph * 0.14, p.line, pw * 0.05, 0.35));
    const bars = 7;
    for (let i = 0; i < bars; i++) {
      const bh = ph * 0.09 * (0.3 + r() * 0.7);
      o.push(rect(ix + iw * 0.07 + i * (iw * 0.86 / bars), py + ph * 0.69 - bh, iw * 0.86 / bars - iw * 0.02, bh, p.accent, pw * 0.01, 0.35 + (i / bars) * 0.65));
    }
  }
  const tb = py + ph * 0.9;
  o.push(rect(px, tb, pw, ph * 0.1, p.line, 0, 0.3));
  for (let i = 0; i < 4; i++)
    o.push(circle(px + pw * (0.2 + i * 0.2), tb + ph * 0.045, pw * 0.035, i === 0 ? p.accent : p.dim, i === 0 ? 1 : 0.45));
  return o.join("\n");
}

function brandingShot(w, h, p, r) {
  const o = [rect(0, 0, w, h, p.bg)];
  const cx = w / 2;
  const cy = h * 0.42;
  const s = Math.min(w, h) * 0.2;
  const k = Math.floor(r() * 4);
  if (k === 0) {
    o.push(circle(cx, cy, s, p.accent));
    o.push(circle(cx, cy, s * 0.46, p.bg));
  } else if (k === 1) {
    o.push(rect(cx - s, cy - s, s * 2, s * 2, p.accent, s * 0.28));
    o.push(rect(cx - s * 0.34, cy - s * 1.3, s * 0.68, s * 2.6, p.bg));
  } else if (k === 2) {
    o.push(`<path d="M${esc(cx - s)} ${esc(cy + s)} L${esc(cx)} ${esc(cy - s)} L${esc(cx + s)} ${esc(cy + s)} Z" fill="${p.accent}"/>`);
    o.push(circle(cx, cy + s * 0.3, s * 0.32, p.bg));
  } else {
    o.push(circle(cx - s * 0.42, cy, s * 0.72, p.accent));
    o.push(circle(cx + s * 0.42, cy, s * 0.72, p.text, 0.85));
  }
  o.push(rect(cx - w * 0.14, h * 0.66, w * 0.28, h * 0.028, p.text, h * 0.014, 0.85));
  const sw = w * 0.5;
  const n = 5;
  for (let i = 0; i < n; i++) {
    const shades = [p.accent, p.text, p.dim, p.line, p.surface];
    o.push(rect(cx - sw / 2 + i * (sw / n), h * 0.78, sw / n - w * 0.012, h * 0.07, shades[i], w * 0.008));
  }
  return o.join("\n");
}

function printShot(w, h, p, r) {
  const o = [rect(0, 0, w, h, p.bg)];
  const m = w * 0.11;
  const glyphs = ["A", "M", "R", "K", "S", "9", "&", "Ø"];
  const g = glyphs[Math.floor(r() * glyphs.length)];
  if (r() > 0.45) {
    const size = Math.min(w, h) * 0.62;
    o.push(text(w / 2, h * 0.62, size, p.accent, g, 800, "middle", -size * 0.03));
    o.push(rect(m, h * 0.16, w - m * 2, h * 0.004, p.text, 0, 0.7));
    o.push(rect(m, h * 0.78, w * 0.3, h * 0.018, p.text, 0, 0.75));
    o.push(rect(m, h * 0.84, w * 0.18, h * 0.012, p.dim, 0, 0.6));
  } else {
    // editorial spread: rule, standfirst, two columns
    o.push(rect(m, h * 0.12, w - m * 2, h * 0.006, p.accent));
    o.push(text(m, h * 0.26, Math.min(w, h) * 0.16, p.text, g === "9" ? "No.9" : g, 800, "start", -2));
    const colW = (w - m * 2 - w * 0.05) / 2;
    o.push(lines(m, h * 0.42, colW, 7, h * 0.026, h * 0.016, p.dim, 0, 0.5));
    o.push(lines(m + colW + w * 0.05, h * 0.42, colW, 7, h * 0.026, h * 0.016, p.dim, 0, 0.5));
    o.push(rect(m + colW + w * 0.05, h * 0.72, colW, h * 0.16, p.accent, 0, 0.9));
  }
  return o.join("\n");
}

function motionShot(w, h, p) {
  const o = [rect(0, 0, w, h, p.bg)];
  const n = 5;
  const gap = w * 0.03;
  const fw = (w - gap * (n + 1)) / n;
  const fh = Math.min(fw, h * 0.34);
  const top = h * 0.16;
  for (let i = 0; i < n; i++) {
    const x = gap + i * (fw + gap);
    o.push(rect(x, top, fw, fh, p.surface, fw * 0.1, 0.9));
    const t = i / (n - 1);
    const rr = fw * (0.1 + t * 0.26);
    o.push(circle(x + fw * (0.28 + t * 0.44), top + fh / 2, rr, p.accent, 0.35 + t * 0.65));
  }
  // easing curve with control handles
  const cy0 = h * 0.62;
  const cH = h * 0.26;
  const x0 = w * 0.1;
  const x1 = w * 0.9;
  o.push(rect(x0, cy0 + cH, x1 - x0, h * 0.003, p.line, 0, 0.8));
  o.push(
    `<path d="M${esc(x0)} ${esc(cy0 + cH)} C ${esc(x0 + (x1 - x0) * 0.35)} ${esc(cy0 + cH)}, ${esc(x0 + (x1 - x0) * 0.5)} ${esc(cy0)}, ${esc(x1)} ${esc(cy0)}" fill="none" stroke="${p.accent}" stroke-width="${esc(h * 0.011)}" stroke-linecap="round"/>`,
  );
  o.push(circle(x0, cy0 + cH, h * 0.016, p.accent));
  o.push(circle(x1, cy0, h * 0.016, p.accent));
  return o.join("\n");
}

function illustrationShot(w, h, p, r) {
  const o = [rect(0, 0, w, h, p.bg)];
  const horizon = h * (0.6 + r() * 0.12);
  o.push(circle(w * (0.3 + r() * 0.4), horizon - h * 0.16, Math.min(w, h) * 0.19, p.accent, 0.95));
  o.push(rect(0, horizon, w, h - horizon, p.text, 0, 0.85));
  // layered hills
  const layers = 3;
  for (let i = 0; i < layers; i++) {
    const y = horizon - h * 0.02 + i * h * 0.06;
    const amp = h * (0.1 - i * 0.02);
    const mid = w * (0.2 + r() * 0.6);
    o.push(
      `<path d="M0 ${esc(y + amp)} Q ${esc(mid)} ${esc(y - amp)}, ${esc(w)} ${esc(y + amp * 0.6)} L${esc(w)} ${esc(h)} L0 ${esc(h)} Z" fill="${i % 2 ? p.accent : p.text}" opacity="${0.25 + i * 0.25}"/>`,
    );
  }
  for (let i = 0; i < 4; i++) o.push(circle(w * r(), horizon * r() * 0.7, Math.min(w, h) * 0.008, p.text, 0.35));
  return o.join("\n");
}

function threeDShot(w, h, p, r) {
  const cx = w / 2;
  const cy = h * 0.46;
  const s = Math.min(w, h) * 0.27;
  const id = `g${Math.floor(r() * 1e6)}`;
  const o = [
    `<defs>
<radialGradient id="${id}" cx="0.34" cy="0.28" r="0.85">
<stop offset="0" stop-color="${p.surface}"/>
<stop offset="0.45" stop-color="${p.accent}"/>
<stop offset="1" stop-color="${p.text}"/>
</radialGradient>
<linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${p.bg}"/>
<stop offset="1" stop-color="${p.line}"/>
</linearGradient>
</defs>`,
    rect(0, 0, w, h, `url(#${id}b)`),
  ];
  o.push(`<ellipse cx="${esc(cx)}" cy="${esc(cy + s * 1.22)}" rx="${esc(s * 1.05)}" ry="${esc(s * 0.16)}" fill="${p.text}" opacity="0.22"/>`);
  if (r() > 0.5) {
    o.push(circle(cx, cy, s, `url(#${id})`));
  } else {
    o.push(rect(cx - s, cy - s, s * 2, s * 2, `url(#${id})`, s * 0.42));
  }
  o.push(circle(cx - s * 0.36, cy - s * 0.42, s * 0.15, p.surface, 0.55));
  return o.join("\n");
}

const ARCHETYPES = {
  Web: webShot,
  Product: productShot,
  Branding: brandingShot,
  Print: printShot,
  Motion: motionShot,
  Illustration: illustrationShot,
  "3D": threeDShot,
};

/* ------------------------------------------------------------------ output */

const RATIOS = {
  Web: [[1600, 1000], [1600, 1200], [1920, 1080]],
  Product: [[1200, 1500], [1080, 1350]],
  Branding: [[1400, 1400], [1600, 1200]],
  Print: [[1200, 1600], [1200, 1500]],
  Motion: [[1600, 900], [1600, 1000]],
  Illustration: [[1400, 1400], [1600, 1200]],
  "3D": [[1400, 1400], [1200, 1500]],
};

// Deal categories out in a fixed rotation so every filter has enough to show.
const ORDER = ["Web", "Product", "Branding", "Print", "Motion", "Illustration", "3D", "Web", "Product", "3D"];
const POSTS = 60;
const CREATORS = 14;

const manifest = [];
for (let i = 1; i <= POSTS; i++) {
  const r = rng(i * 7919 + 17);
  const category = ORDER[(i - 1) % ORDER.length];
  const ratios = RATIOS[category];
  const [w, h] = ratios[Math.floor(r() * ratios.length)];
  const p = PALETTES[Math.floor(r() * PALETTES.length)];
  const body = ARCHETYPES[category](w, h, p, r);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n${body}\n</svg>`;
  writeFileSync(join(postsDir, `post-${i}.svg`), svg);
  manifest.push({ file: `/posts/post-${i}.svg`, width: w, height: h, category, palette: p.name });
}

for (let i = 1; i <= CREATORS; i++) {
  const r = rng(i * 977 + 13);
  const p = PALETTES[Math.floor(r() * PALETTES.length)];
  const initial = String.fromCharCode(65 + Math.floor(r() * 26));
  writeFileSync(
    join(creatorsDir, `creator-${i}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
${rect(0, 0, 140, 140, p.accent)}
${text(70, 96, 74, p.bg, initial, 700, "middle")}
</svg>`,
  );
}

writeFileSync(join(root, "lib/media-manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`generated ${POSTS} posts + ${CREATORS} avatars`);
