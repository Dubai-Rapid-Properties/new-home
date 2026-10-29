/**
 * Builds an off-plan project brochure as a PDF in the visitor's browser,
 * with the D|R|P agent's own contact details on every page. Used by
 * components/offplan/BrochureButton.tsx; jsPDF is loaded only when someone
 * asks for a brochure, so it adds nothing to the page itself.
 *
 * Property Finder's photos come through /api/brochure-image (their server
 * sends no CORS header); the site's own photos are read directly.
 */
import type { jsPDF as JsPdf } from 'jspdf';
import QRCode from 'qrcode';

export type BrochureProject = {
  slug: string;
  name: string;
  /** "Emaar · Dubai Hills Estate" */
  eyebrow: string;
  facts: [string, string][];
  description: string[];
  highlights: { title: string; text: string }[];
  configurations: string;
  area: string;
  locationText: string[];
  images: string[];
  pageUrl: string;
};

export type BrochureAgent = {
  name: string;
  role: string;
  phone: string;
  whatsapp: string;
  email: string;
  brn: string;
  photo?: string;
  /** The agent's own 16:9 contact card (data/agentCards.ts): the closing page shows it instead of the standard card */
  card?: string;
};

export type BrochureOffice = { phone: string; email: string; address: string; orn: string; website: string };

/* Brand colours (tailwind.config.ts) */
const INK: [number, number, number] = [26, 26, 26];
const ORANGE: [number, number, number] = [244, 123, 73];
const CHARCOAL: [number, number, number] = [51, 51, 51];
const MUTED: [number, number, number] = [130, 126, 120];
const LINE: [number, number, number] = [230, 226, 220];
const CREAM: [number, number, number] = [247, 245, 242];

const W = 210;
const H = 297;
const M = 18;
const CW = W - 2 * M;

/** The PDF's built-in fonts cover Latin-1 only: straighten quotes and dashes, drop the rest. */
const plain = (s: string) =>
  s
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/[–—−]/g, '-')
    .replace(/…/g, '...')
    .replace(/[•●▪]/g, '·')
    .replace(/ /g, ' ')
    .replace(/[^\x20-\x7e\xa0-\xff\n]/g, '');

/* -------------------------------------------------------------------------- */
/*  Images                                                                    */
/* -------------------------------------------------------------------------- */

const readable = (src: string) =>
  /^https?:\/\//.test(src) && !src.startsWith(window.location.origin)
    ? `/api/brochure-image?src=${encodeURIComponent(src)}`
    : src;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = readable(src);
  });
}

/** The photo cropped to fill w×h pixels, as a JPEG data URL; null when it cannot be read. */
async function photo(src: string, w: number, h: number, quality = 0.82): Promise<string | null> {
  try {
    const img = await loadImage(src);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.fillStyle = '#e6e2dc';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return null;
  }
}

/** A round crop of a portrait, as a PNG data URL with a transparent corner. */
async function portrait(src: string, size = 360): Promise<string | null> {
  try {
    const img = await loadImage(src);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    /* Faces sit in the upper part of a portrait */
    ctx.drawImage(img, (size - dw) / 2, Math.min(0, (size - dh) * 0.2), dw, dh);
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

/** The SVG logo drawn as a PNG (the PDF cannot hold SVG), with its aspect ratio. */
async function logo(src: string): Promise<{ data: string; ratio: number } | null> {
  try {
    const img = await loadImage(src);
    const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 2.6;
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = Math.round(900 / ratio);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { data: canvas.toDataURL('image/png'), ratio };
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  The PDF                                                                   */
/* -------------------------------------------------------------------------- */

export async function makeBrochure(project: BrochureProject, agent: BrochureAgent, office: BrochureOffice) {
  const { jsPDF } = await import('jspdf');
  const doc: JsPdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

  const digits = (n: string) => n.replace(/[^\d]/g, '');
  const waLink = agent.whatsapp ? `https://wa.me/${digits(agent.whatsapp)}` : '';

  const [cover, gallery, whiteLogo, blackLogo, face, qr, card] = await Promise.all([
    project.images[0] ? photo(project.images[0], 1680, 1520, 0.85) : Promise.resolve(null),
    Promise.all(project.images.slice(1, 7).map((src) => photo(src, 1000, 700))),
    logo('/brand/drp-white.svg'),
    logo('/brand/drp-black.svg'),
    agent.photo ? portrait(agent.photo) : Promise.resolve(null),
    waLink ? QRCode.toDataURL(waLink, { margin: 0, width: 360, color: { dark: '#1a1a1a', light: '#ffffff' } }) : Promise.resolve(null),
    agent.card ? photo(agent.card, 1920, 1080, 0.9) : Promise.resolve(null),
  ]);

  const text = (s: string, x: number, y: number, opts?: Parameters<JsPdf['text']>[3]) => doc.text(plain(s), x, y, opts);
  const font = (face: 'times' | 'helvetica', style: 'normal' | 'bold', size: number, color: [number, number, number]) => {
    doc.setFont(face, style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };
  const eyebrow = (s: string, x: number, y: number, color = ORANGE) => {
    font('helvetica', 'bold', 7.5, color);
    doc.setCharSpace(0.9);
    text(s.toUpperCase(), x, y);
    doc.setCharSpace(0);
  };
  const lines = (s: string, width: number) => doc.splitTextToSize(plain(s), width) as string[];
  const lineH = (size: number, leading = 1.45) => (size * 0.3528 * leading);

  /* ---------- Cover ---------- */
  doc.setFillColor(...INK);
  doc.rect(0, 0, W, H, 'F');
  if (cover) doc.addImage(cover, 'JPEG', 0, 0, W, 190);
  doc.setFillColor(...ORANGE);
  doc.rect(0, 190, W, 1.2, 'F');
  if (whiteLogo) doc.addImage(whiteLogo.data, 'PNG', M, 200, 16 * whiteLogo.ratio, 16);
  eyebrow(project.eyebrow, M, 228);
  font('times', 'normal', 32, [255, 255, 255]);
  const title = lines(project.name, CW).slice(0, 2);
  title.forEach((l, i) => text(l, M, 242 + i * 12));
  const factsY = title.length > 1 ? 272 : 262;
  const shown = project.facts.slice(0, 4);
  const colW = CW / Math.max(shown.length, 1);
  shown.forEach(([label, value], i) => {
    const x = M + i * colW;
    font('helvetica', 'normal', 6.5, [170, 165, 158]);
    doc.setCharSpace(0.6);
    text(label.toUpperCase(), x, factsY);
    doc.setCharSpace(0);
    font('times', 'normal', 11.5, [255, 255, 255]);
    lines(value, colW - 5)
      .slice(0, 2)
      .forEach((l, j) => text(l, x, factsY + 6.5 + j * 5));
  });
  font('helvetica', 'normal', 7.5, [170, 165, 158]);
  text(`Presented by ${agent.name}${agent.brn ? ` · BRN ${agent.brn}` : ''} · ${agent.phone}`, M, H - 10);

  /* ---------- Inner pages ---------- */
  let page = 1;
  let y = 0;
  const header = () => {
    if (blackLogo) doc.addImage(blackLogo.data, 'PNG', M, 12, 8 * blackLogo.ratio, 8);
    font('helvetica', 'normal', 7.5, MUTED);
    text(project.name, W - M, 17.5, { align: 'right' });
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(M, 25, W - M, 25);
  };
  const footer = () => {
    doc.setDrawColor(...LINE);
    doc.line(M, H - 16, W - M, H - 16);
    font('helvetica', 'normal', 7, MUTED);
    const who = [agent.name, agent.brn ? `BRN ${agent.brn}` : '', agent.phone, agent.email].filter(Boolean).join('  ·  ');
    text(who, M, H - 10.5);
    text(String(page), W - M, H - 10.5, { align: 'right' });
  };
  const newPage = () => {
    doc.addPage();
    page += 1;
    header();
    footer();
    y = 38;
  };
  const room = (h: number) => {
    if (y + h > H - 24) newPage();
  };
  const heading = (kicker: string, title: string) => {
    room(24);
    eyebrow(kicker, M, y);
    font('times', 'normal', 22, INK);
    text(title, M, y + 10);
    doc.setFillColor(...ORANGE);
    doc.rect(M, y + 14.5, 14, 0.6, 'F');
    y += 24;
  };
  const paragraph = (s: string, size = 9.5, width = CW, x = M) => {
    font('helvetica', 'normal', size, CHARCOAL);
    for (const l of lines(s, width)) {
      room(lineH(size));
      text(l, x, y);
      y += lineH(size);
    }
    y += 2.5;
  };

  /* The project */
  newPage();
  heading('The Project', `About ${project.name}`);
  for (const p of project.description.slice(0, 6)) paragraph(p);

  if (project.highlights.length) {
    y += 4;
    room(16);
    eyebrow('Highlights', M, y);
    y += 6;
    for (const h of project.highlights.slice(0, 8)) {
      font('helvetica', 'normal', 8.5, MUTED);
      const body = h.text ? lines(h.text, CW - 6) : [];
      room(6 + body.length * lineH(8.5));
      doc.setFillColor(...ORANGE);
      doc.circle(M + 1, y - 1.2, 0.8, 'F');
      font('helvetica', 'bold', 9.5, INK);
      text(h.title, M + 6, y);
      y += lineH(9.5);
      font('helvetica', 'normal', 8.5, MUTED);
      for (const l of body) {
        text(l, M + 6, y);
        y += lineH(8.5);
      }
      y += 2.5;
    }
  }
  if (project.configurations) {
    y += 2;
    room(14);
    eyebrow('Configurations', M, y);
    y += 6;
    paragraph(project.configurations);
  }

  /* Gallery */
  const shots = gallery.filter((g): g is string => Boolean(g));
  if (shots.length) {
    newPage();
    heading('Gallery', `Inside ${project.name}`);
    const gw = (CW - 6) / 2;
    const gh = gw * 0.7;
    shots.forEach((g, i) => {
      if (i > 0 && i % 2 === 0) y += gh + 6;
      if (i % 2 === 0) room(gh);
      doc.addImage(g, 'JPEG', M + (i % 2) * (gw + 6), y, gw, gh);
    });
    y += gh + 10;
  }

  /* Location */
  if (project.locationText.length) {
    room(40);
    if (y > 38) y += 4;
    heading('Location', project.area);
    for (const p of project.locationText.slice(0, 3)) paragraph(p);
  }

  /* The agent */
  if (card) {
    /* The agent's own contact card, across the page */
    const ch = (CW * 9) / 16;
    room(ch + 40);
    y += 6;
    eyebrow('Your D|R|P Specialist', M, y);
    y += 5;
    doc.addImage(card, 'JPEG', M, y, CW, ch);
    y += ch + 8;
  } else {
    const cardH = 62;
    room(cardH + 30);
    y += 6;
    eyebrow('Your D|R|P Specialist', M, y);
    y += 5;
    doc.setFillColor(...INK);
    doc.rect(M, y, CW, cardH, 'F');
    let tx = M + 10;
    if (face) {
      doc.addImage(face, 'PNG', M + 10, y + 12, 36, 36);
      tx = M + 54;
    }
    font('times', 'normal', 20, [255, 255, 255]);
    text(agent.name, tx, y + 18);
    font('helvetica', 'normal', 8.5, [190, 185, 178]);
    text([agent.role, agent.brn ? `BRN ${agent.brn}` : ''].filter(Boolean).join('  ·  '), tx, y + 25);
    const rows: [string, string][] = [
      ['Phone', agent.phone],
      ...(agent.whatsapp ? ([['WhatsApp', agent.whatsapp]] as [string, string][]) : []),
      ['Email', agent.email],
    ];
    rows.forEach(([label, value], i) => {
      font('helvetica', 'normal', 6.5, [150, 145, 138]);
      text(label.toUpperCase(), tx, y + 35 + i * 7.5);
      font('helvetica', 'normal', 9.5, [255, 255, 255]);
      text(value, tx + 20, y + 35 + i * 7.5);
    });
    if (qr) {
      doc.setFillColor(255, 255, 255);
      doc.rect(W - M - 38, y + 12, 30, 30, 'F');
      doc.addImage(qr, 'PNG', W - M - 36, y + 14, 26, 26);
      font('helvetica', 'normal', 6.5, [190, 185, 178]);
      text('Scan to WhatsApp', W - M - 23, y + 47, { align: 'center' });
    }
    y += cardH + 8;
  }

  /* D|R|P and the small print */
  doc.setFillColor(...CREAM);
  room(30);
  doc.rect(M, y, CW, 20, 'F');
  font('helvetica', 'bold', 8, INK);
  text('D|R|P Dubai Rapid Properties', M + 6, y + 7.5);
  font('helvetica', 'normal', 7.5, CHARCOAL);
  text(`${office.address}  ·  ${office.phone}  ·  ${office.email}  ·  ${office.website}`, M + 6, y + 13);
  text(`RERA ORN ${office.orn}`, M + 6, y + 17.5);
  y += 26;
  font('helvetica', 'normal', 6.5, MUTED);
  for (const l of lines(
    `Prices, payment plans and handover dates are the developer's published figures and may change; availability is not guaranteed. This brochure is for information only and is not an offer. Full details: ${project.pageUrl}`,
    CW,
  )) {
    room(3.5);
    text(l, M, y);
    y += 3.2;
  }

  const first = agent.name.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'drp';
  doc.save(`${project.slug}-brochure-${first}.pdf`);
}
