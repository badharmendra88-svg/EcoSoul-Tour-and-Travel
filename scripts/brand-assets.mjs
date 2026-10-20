// Generates website brand assets from the approved logo sheet
// (docs/brand/logo-options-sheet.png → "Option 1: Nature Circle Logo" and
// "Favicon 1: Clean & Simple"). Re-run after replacing the sheet:
//   node scripts/brand-assets.mjs
// For best quality, replace with the designer's original high-resolution or
// vector files when available.

import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const SHEET = "docs/brand/logo-options-sheet.png";
const OUT = "public/brand";
const APP = "src/app";

// Regions in the 1536×1024 sheet
const LOGO = { left: 48, top: 24, width: 588, height: 478 }; // full Option 1 logo
const WORDMARK = { left: 95, top: 298, width: 495, height: 152 }; // "EcoSoul" + "Uttarakhand Travel"
const FAV_ART = { left: 810, top: 660, width: 196, height: 196 }; // inside the favicon tile

const sheet = sharp(SHEET);
const meta = await sheet.metadata();
if (meta.width !== 1536 || meta.height !== 1024) throw new Error(`Unexpected sheet size ${meta.width}×${meta.height}`);

async function rgba(region) {
  const { data, info } = await sharp(SHEET).extract(region).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

const isBg = (d, i) => {
  const r = d[i], g = d[i + 1], b = d[i + 2];
  return r > 238 && g > 238 && b > 238 && Math.max(r, g, b) - Math.min(r, g, b) < 12;
};

/** Background → transparent, but only background connected to the edges (keeps white snow/car inside). */
function floodClear({ data, w, h }) {
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop();
    if (seen[p]) continue;
    seen[p] = 1;
    const i = p * 4;
    if (!isBg(data, i)) continue;
    data[i + 3] = 0;
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
  // Soften the 1-px fringe next to cleared pixels (un-blend from white)
  for (let p = 0; p < w * h; p++) {
    const i = p * 4;
    if (data[i + 3] === 0) continue;
    const x = p % w, y = (p / w) | 0;
    const edge = [p - 1, p + 1, p - w, p + w].some((q, k) => (k === 0 ? x > 0 : k === 1 ? x < w - 1 : k === 2 ? y > 0 : y < h - 1) && data[q * 4 + 3] === 0);
    if (!edge) continue;
    const m = Math.min(data[i], data[i + 1], data[i + 2]);
    const a = Math.max(0.15, (255 - m) / 255);
    for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, Math.round((data[i + c] - 255 * (1 - a)) / a)));
    data[i + 3] = Math.round(a * 255);
  }
  return { data, w, h };
}

/** Text-only artwork: alpha from darkness, colour un-blended from white (clean on any background). */
function unblendWhite({ data, w, h }, mono) {
  for (let i = 0; i < data.length; i += 4) {
    const m = Math.min(data[i], data[i + 1], data[i + 2]);
    const a = (255 - m) / 255;
    if (a < 0.04) { data[i + 3] = 0; continue; }
    for (let c = 0; c < 3; c++) {
      data[i + c] = mono ?? Math.max(0, Math.min(255, Math.round((data[i + c] - 255 * (1 - a)) / a)));
    }
    data[i + 3] = Math.round(Math.min(1, a * 1.08) * 255);
  }
  return { data, w, h };
}

const toPng = ({ data, w, h }) => sharp(data, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 });

/** Average colour of strongly-coloured pixels in a region — used for theme tokens. */
async function dominant(region, filter) {
  const { data } = await rgba(region);
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (filter(data[i], data[i + 1], data[i + 2])) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
  }
  const hex = (v) => Math.round(v / n).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

await mkdir(OUT, { recursive: true });

// 1) Full logo (transparent outside); next/image serves AVIF/WebP sizes
const full = floodClear(await rgba(LOGO));
await toPng(full).toFile(`${OUT}/logo-full.png`);

// 2) Wordmark: brand colours + white version for dark backgrounds.
// The logo's green road swoosh dips into the top-left of the crop (above "Eco") — clear that strip.
function clearSwoosh(img) {
  for (let y = 0; y < 8; y++) for (let x = 0; x < 250; x++) img.data[(y * img.w + x) * 4 + 3] = 0;
  return img;
}
await toPng(clearSwoosh(unblendWhite(await rgba(WORDMARK)))).toFile(`${OUT}/wordmark.png`);
await toPng(clearSwoosh(unblendWhite(await rgba(WORDMARK), 255))).toFile(`${OUT}/wordmark-light.png`);

// 3) Icons from Favicon 1 artwork on a clean white tile
const art = await sharp(SHEET).extract(FAV_ART).png().toBuffer();
async function tile(size, { maskable = false, rounded = true, badge } = {}) {
  const pad = Math.round(size * (maskable ? 0.14 : 0.04));
  const inner = await sharp(art).resize(size - pad * 2, size - pad * 2, { kernel: "lanczos3" }).sharpen({ sigma: size > 256 ? 0.8 : 0.4 }).toBuffer();
  const radius = rounded && !maskable ? Math.round(size * 0.2) : 0;
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#ffffff"/></svg>`);
  const layers = [{ input: inner, left: pad, top: pad }];
  if (badge) {
    const bw = Math.round(size * 0.62), bh = Math.round(size * 0.2);
    layers.push({
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${bw}" height="${bh}"><rect width="${bw}" height="${bh}" rx="${bh * 0.3}" fill="#f7941d"/><text x="50%" y="70%" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="${bh * 0.62}" fill="#0b3d22">${badge}</text></svg>`),
      left: Math.round((size - bw) / 2),
      top: size - bh - Math.round(size * (maskable ? 0.12 : 0.03)),
    });
  }
  return sharp(bg).composite(layers).png({ compressionLevel: 9 });
}
await (await tile(64)).toFile(`${APP}/icon.png`);
await (await tile(180, { rounded: false })).toFile(`${APP}/apple-icon.png`);
for (const s of [192, 512]) {
  await (await tile(s)).toFile(`${OUT}/icon-${s}.png`);
  await (await tile(s, { maskable: true })).toFile(`${OUT}/icon-${s}-maskable.png`);
  await (await tile(s, { badge: "ADMIN" })).toFile(`${OUT}/admin-icon-${s}.png`);
  await (await tile(s, { maskable: true, badge: "ADMIN" })).toFile(`${OUT}/admin-icon-${s}-maskable.png`);
}
await (await tile(96)).toFile(`${OUT}/emblem.png`); // header/admin emblem

// 4) Brand colours measured from the logo
const colours = {
  ecoGreen: await dominant({ left: 100, top: 300, width: 200, height: 95 }, (r, g, b) => g > r && g > b && r + g + b < 260),
  soulGreen: await dominant({ left: 330, top: 300, width: 250, height: 95 }, (r, g, b) => g > r + 30 && g > b + 30 && g > 110),
  textGreen: await dominant({ left: 100, top: 400, width: 480, height: 45 }, (r, g, b) => g >= r && r + g + b < 260),
  sunOrange: await dominant({ left: 330, top: 60, width: 110, height: 90 }, (r, g, b) => r > 220 && g > 120 && b < 90),
  skyBlue: await dominant({ left: 150, top: 80, width: 260, height: 160 }, (r, g, b) => b > r + 40 && b > 150),
};
await writeFile(`${OUT}/colours.json`, JSON.stringify(colours, null, 2));
console.log("Brand assets written to", OUT, colours);
