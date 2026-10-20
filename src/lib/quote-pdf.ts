import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Quote } from "@prisma/client";
import { site } from "@/config/site";
import { formatDate } from "./format";
import { parseList } from "./json";
import { getSettings } from "@/lib/settings";
import { lineAmount, rupees, type QuoteItem } from "./quote";

// A4 quotation PDF using built-in fonts (no font files to ship).
// Standard PDF fonts only support WinAnsi characters, so text is sanitised
// and amounts use "Rs." instead of the ₹ glyph.

const A4: [number, number] = [595.28, 841.89];
const M = 48; // page margin
// Brand colours from the logo
const FOREST = rgb(0.043, 0.29, 0.188); // #0b4a30
const ORANGE = rgb(0.996, 0.639, 0.141); // #fea324
const SLATE = rgb(0.2, 0.25, 0.3);
const MUTED = rgb(0.42, 0.47, 0.53);
const LINE = rgb(0.85, 0.87, 0.89);
const TINT = rgb(0.933, 0.965, 0.945);

const rs = (v: number) => rupees(v, "Rs.");

function clean(text: string) {
  return text
    .replace(/₹\s?/g, "Rs. ")
    .replace(/[→⟶]/g, "->")
    .replace(/[✓✔]/g, "-")
    .replace(/[^\x20-\x7E -ÿ–—‘’“”•…]/g, "");
}

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];
  for (const para of clean(text).split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= width) line = next;
      else {
        if (line) lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

export async function renderQuotePdf(q: Quote) {
  const settings = await getSettings();
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Quotation ${q.number} — ${site.name}`);
  pdf.setAuthor(site.name);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = pdf.addPage(A4);
  let y = A4[1] - M;
  const width = A4[0] - M * 2;

  const text = (t: string, x: number, size = 10, f = font, color = SLATE) =>
    page.drawText(clean(t), { x, y, size, font: f, color });
  const ensure = (needed: number) => {
    if (y - needed < M + 30) {
      page = pdf.addPage(A4);
      y = A4[1] - M;
    }
  };
  const paragraph = (t: string, size = 9.5, f = font, color = SLATE, indent = 0) => {
    for (const l of wrap(t, f, size, width - indent)) {
      ensure(size + 4);
      text(l, M + indent, size, f, color);
      y -= size + 4;
    }
  };

  // Header: brand logo (Option 1) on white, quote number and contact on the right
  const logoPng = await readFile(path.join(process.cwd(), "public", "brand", "logo-full.png")).catch(() => null);
  if (logoPng) {
    const logo = await pdf.embedPng(logoPng);
    const lh = 92;
    const lw = (logo.width / logo.height) * lh;
    page.drawImage(logo, { x: M - 6, y: A4[1] - 24 - lh, width: lw, height: lh });
  } else {
    page.drawText(clean(site.name), { x: M, y: A4[1] - 60, size: 18, font: bold, color: FOREST });
  }
  const right = (t: string, yy: number, size: number, f: PDFFont, color = SLATE) =>
    page.drawText(clean(t), { x: A4[0] - M - f.widthOfTextAtSize(clean(t), size), y: yy, size, font: f, color });
  right("QUOTATION", A4[1] - 50, 18, bold, ORANGE);
  right(q.number, A4[1] - 68, 10, bold, FOREST);
  right(settings.phone, A4[1] - 86, 9, font, MUTED);
  right(settings.email, A4[1] - 98, 9, font, MUTED);
  right(site.url.replace(/^https?:\/\//, ""), A4[1] - 110, 9, font, MUTED);
  page.drawRectangle({ x: M, y: A4[1] - 128, width: width, height: 2, color: FOREST });
  page.drawRectangle({ x: M, y: A4[1] - 128, width: 70, height: 2, color: ORANGE });
  y = A4[1] - 158;

  // Meta: customer + dates
  const colX = M + width / 2 + 10;
  text("Prepared for", M, 8.5, bold, MUTED);
  text("Quote details", colX, 8.5, bold, MUTED);
  y -= 15;
  text(q.customerName, M, 11, bold);
  text(`Date: ${formatDate(q.createdAt)}`, colX);
  y -= 14;
  text([q.customerPhone, q.customerEmail].filter(Boolean).join("  ·  "), M, 9.5);
  text(`Valid until: ${formatDate(q.validUntil)}`, colX);
  y -= 14;
  if (q.travelDate) text(`Travel date: ${formatDate(q.travelDate)}`, colX);
  y -= 26;

  // Trip title + summary
  paragraph(q.title, 14, bold, FOREST);
  y -= 2;
  if (q.tripSummary) paragraph(q.tripSummary, 9.5, font, SLATE);
  y -= 10;

  // Items table
  const cols = { item: M + 8, qty: M + width - 210, rate: M + width - 140, amt: M + width - 8 };
  const header = () => {
    ensure(40);
    page.drawRectangle({ x: M, y: y - 6, width, height: 22, color: TINT });
    y += 1;
    text("Description", cols.item, 9, bold, FOREST);
    text("Qty", cols.qty, 9, bold, FOREST);
    text("Rate", cols.rate, 9, bold, FOREST);
    const a = "Amount";
    page.drawText(a, { x: cols.amt - bold.widthOfTextAtSize(a, 9), y, size: 9, font: bold, color: FOREST });
    y -= 26;
  };
  header();

  const items = JSON.parse(q.items) as QuoteItem[];
  for (const it of items) {
    const lines = wrap(it.label, font, 9.5, cols.qty - cols.item - 12);
    const h = lines.length * 13;
    if (y - h < M + 40) {
      page = pdf.addPage(A4);
      y = A4[1] - M;
      header();
    }
    const top = y;
    lines.forEach((l, i) => page.drawText(l, { x: cols.item, y: top - i * 13, size: 9.5, font, color: SLATE }));
    page.drawText(clean(`${it.qty} ${it.unit}`), { x: cols.qty, y: top, size: 9.5, font, color: SLATE });
    page.drawText(rs(it.rate), { x: cols.rate, y: top, size: 9.5, font, color: SLATE });
    const amount = rs(lineAmount(it));
    page.drawText(amount, { x: cols.amt - font.widthOfTextAtSize(amount, 9.5), y: top, size: 9.5, font, color: SLATE });
    y = top - h - 6;
    page.drawLine({ start: { x: M, y: y + 3 }, end: { x: M + width, y: y + 3 }, thickness: 0.5, color: LINE });
    y -= 8;
  }

  // Totals
  const totalRow = (label: string, value: string, strong = false) => {
    ensure(20);
    const f = strong ? bold : font;
    const size = strong ? 12 : 10;
    page.drawText(clean(label), { x: cols.rate - 120, y, size, font: f, color: strong ? FOREST : SLATE });
    page.drawText(value, { x: cols.amt - f.widthOfTextAtSize(value, size), y, size, font: f, color: strong ? FOREST : SLATE });
    y -= strong ? 22 : 16;
  };
  y -= 4;
  totalRow("Subtotal", rs(q.subtotal));
  if (q.markupAmount > 0) totalRow(`${q.markupLabel}`, rs(q.markupAmount));
  if (q.taxAmount > 0) totalRow(`${q.taxLabel} (${q.taxPct}%)`, rs(q.taxAmount));
  ensure(30);
  page.drawLine({ start: { x: cols.rate - 120, y: y + 10 }, end: { x: M + width, y: y + 10 }, thickness: 1, color: FOREST });
  y -= 4;
  totalRow("Total", rs(q.total), true);
  if (q.advancePct > 0) {
    totalRow(`Advance to confirm (${q.advancePct}%)`, rs(Math.round((q.total * q.advancePct) / 100)));
  }
  y -= 8;

  const section = (title: string, list: string[]) => {
    if (list.length === 0) return;
    ensure(40);
    text(title, M, 11, bold, FOREST);
    y -= 16;
    for (const item of list) {
      const lines = wrap(item, font, 9.5, width - 14);
      lines.forEach((l, i) => {
        ensure(14);
        if (i === 0) text("•", M + 2, 9.5);
        text(l, M + 14, 9.5);
        y -= 13;
      });
    }
    y -= 8;
  };
  section("Inclusions", parseList(q.inclusions));
  section("Exclusions", parseList(q.exclusions));
  if (q.notes) {
    ensure(40);
    text("Notes", M, 11, bold, FOREST);
    y -= 16;
    paragraph(q.notes);
    y -= 8;
  }
  section("Terms", parseList(q.terms));

  // Footer on every page
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    const f = clean(`${site.name} · ${q.number} · This quotation is not a booking confirmation · Page ${i + 1} of ${pages.length}`);
    p.drawText(f, { x: M, y: 24, size: 7.5, font, color: MUTED });
  });

  return pdf.save();
}
