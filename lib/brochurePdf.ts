/**
 * Builds an off-plan project brochure as a PDF in the visitor's browser: a
 * 16:9 deck in D|R|P's own brochure style (Cormorant Garamond and Montserrat,
 * full-page photos, the agent's own contact card at the end). Used by
 * components/offplan/BrochureButton.tsx; jsPDF and the fonts are loaded only
 * when someone asks for a brochure, so they add nothing to the page itself.
 *
 * Property Finder's photos come through /api/brochure-image (their server
 * sends no CORS header); the site's own photos and the map tiles
 * (OpenStreetMap, which allows it) are read directly.
 */
import type { jsPDF as JsPdf } from 'jspdf';
import QRCode from 'qrcode';

export type BrochureProject = {
  slug: string;
  name: string;
  /** "Off-plan · Danube" */
  eyebrow: string;
  /** "JVC · Dubai" */
  location: string;
  /** "AED 1,350,000", or null for price on request */
  price: string | null;
  /** Three [value, label] pairs under the cover price */
  keyFacts: [string, string][];
  /** The fact grid beside the description: up to nine cells */
  grid: { label: string; value: string; sub: string }[];
  description: string[];
  highlights: { title: string; text: string }[];
  /** Each unit type with its size and starting price, ready to print */
  units: { name: string; size: string; price: string }[];
  /** Payment stages in %: on booking, during construction, on and after handover */
  schedule?: [number, number, number];
  amenities: string[];
  area: string;
  locationText: string[];
  /** [lat, lng] of the building, when known exactly */
  coords?: [number, number];
  images: string[];
  masterPlan?: string;
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
  /** The agent's own 16:9 contact card (data/agentCards.ts): its own page near the end */
  card?: string;
};

export type BrochureOffice = { phone: string; email: string; address: string; orn: string; website: string };

type Rgb = [number, number, number];
const INK: Rgb = [26, 26, 26];
const DARK: Rgb = [51, 51, 51];
const ORANGE: Rgb = [244, 123, 73];
const TEXT: Rgb = [70, 70, 70];
const MUTED: Rgb = [120, 116, 110];
const LINE: Rgb = [225, 218, 210];
const WHITE: Rgb = [255, 255, 255];
const PALE: Rgb = [210, 206, 200];

/* The page: 1440 × 810 pt, 16:9 */
const W = 1440;
const H = 810;
const M = 80;
/* The right-hand column on the white pages */
const RX = 517;
const RW = W - RX - 71;
const STAGES = ['On booking', 'During construction', 'On & after handover'];

/** Straighten quotes and dashes, and drop what the fonts cannot show. */
const plain = (s: string) =>
  s
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/[–—−]/g, '-')
    .replace(/…/g, '...')
    .replace(/[•●▪]/g, '·')
    .replace(/ /g, ' ')
    .replace(/[^\x20-\x7e\xa0-\xff\n]/g, '');

/* -------------------------------------------------------------------------- */
/*  Images                                                                    */
/* -------------------------------------------------------------------------- */

/* OpenStreetMap's tiles allow cross-origin reads, so they are fetched directly */
const DIRECT = /^https:\/\/tile\.openstreetmap\.org\//;

const readable = (src: string) =>
  /^https?:\/\//.test(src) && !src.startsWith(window.location.origin) && !DIRECT.test(src)
    ? `/api/brochure-image?src=${encodeURIComponent(src)}`
    : src;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (DIRECT.test(src)) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = readable(src);
  });
}

/** Property Finder's photos at full size for a full page, with the smaller copy to fall back on. */
const sources = (src: string) =>
  /\/(gallery|master_plan)\/image\/[^/]+\/medium\.webp$/.test(src) ? [src.replace(/medium\.webp$/, 'original.webp'), src] : [src];

async function loadFirst(srcs: string[]): Promise<HTMLImageElement> {
  for (const s of srcs) {
    try {
      return await loadImage(s);
    } catch {
      /* try the next */
    }
  }
  throw new Error(`Could not load ${srcs[0]}`);
}

type Shade = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
type Crop = (iw: number, ih: number) => [number, number, number, number];

/** The photo cropped to fill w×h pixels (optionally shaded), as a JPEG data URL; null when it cannot be read. */
async function photo(
  src: string,
  w: number,
  h: number,
  { quality = 0.8, shade, big = false, crop }: { quality?: number; shade?: Shade; big?: boolean; crop?: Crop } = {},
): Promise<string | null> {
  try {
    const img = await loadFirst(big ? sources(src) : [src]);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(0, 0, w, h);
    if (crop) {
      const [sx, sy, sw, sh] = crop(img.naturalWidth, img.naturalHeight);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    } else {
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    }
    shade?.(ctx, w, h);
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return null;
  }
}

/** A drawing shown whole (no crop), at most `max` pixels across, with its aspect ratio. */
async function drawing(src: string, max = 2200): Promise<{ data: string; ratio: number } | null> {
  try {
    const img = await loadFirst(sources(src));
    const ratio = img.naturalWidth / img.naturalHeight || 1.4;
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(max, img.naturalWidth || max);
    canvas.height = Math.round(canvas.width / ratio);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { data: canvas.toDataURL('image/jpeg', 0.85), ratio };
  } catch {
    return null;
  }
}

/** A round crop of a portrait, as a PNG data URL with a transparent corner. */
async function portrait(src: string, size = 480): Promise<string | null> {
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
    const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1.87;
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = Math.round(1000 / ratio);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { data: canvas.toDataURL('image/png'), ratio };
  } catch {
    return null;
  }
}

/**
 * A street map around [lat, lng], w×h points, from OpenStreetMap's tiles one
 * zoom level closer, so the map is sharp at twice the resolution.
 */
async function streetMap([lat, lng]: [number, number], w: number, h: number, zoom = 15): Promise<string | null> {
  try {
    const world = 256 * 2 ** zoom;
    const cx = ((lng + 180) / 360) * world;
    const s = Math.sin((lat * Math.PI) / 180);
    const cy = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * world;
    const pw = w * 2;
    const ph = h * 2;
    const left = cx - pw / 2;
    const top = cy - ph / 2;
    const canvas = document.createElement('canvas');
    canvas.width = pw;
    canvas.height = ph;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f2efe9';
    ctx.fillRect(0, 0, pw, ph);
    const jobs: Promise<void>[] = [];
    for (let tx = Math.floor(left / 256); tx <= Math.floor((left + pw) / 256); tx++)
      for (let ty = Math.floor(top / 256); ty <= Math.floor((top + ph) / 256); ty++)
        jobs.push(
          loadImage(`https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`).then((img) =>
            ctx.drawImage(img, tx * 256 - left, ty * 256 - top, 256, 256),
          ),
        );
    const done = await Promise.allSettled(jobs);
    if (!done.some((d) => d.status === 'fulfilled')) return null;
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch {
    return null;
  }
}

/** A 64-bit difference hash of an image, to spot the same render saved twice under different addresses */
function fingerprint(data: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 9;
      c.height = 8;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0, 9, 8);
      const px = ctx.getImageData(0, 0, 9, 8).data;
      const grey = (i: number) => px[i * 4] * 0.3 + px[i * 4 + 1] * 0.59 + px[i * 4 + 2] * 0.11;
      let bits = '';
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += grey(y * 9 + x) > grey(y * 9 + x + 1) ? '1' : '0';
      resolve(bits);
    };
    img.onerror = () => resolve('');
    img.src = data;
  });
}
const alike = (a: string, b: string) => {
  if (!a || !b) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d <= 10;
};

/** Runs the jobs `n` at a time, so a long gallery does not load every full-size photo at once. */
async function inTurn<T>(items: string[], n: number, job: (s: string) => Promise<T>): Promise<T[]> {
  const out: T[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await job(items[i]);
      }
    }),
  );
  return out;
}

/* -------------------------------------------------------------------------- */
/*  Fonts                                                                     */
/* -------------------------------------------------------------------------- */

const FONTS: [string, string, string][] = [
  ['Cormorant', 'light', 'CormorantGaramond-Light.ttf'],
  ['Cormorant', 'normal', 'CormorantGaramond-Regular.ttf'],
  ['Cormorant', 'medium', 'CormorantGaramond-Medium.ttf'],
  ['Montserrat', 'light', 'Montserrat-Light.ttf'],
  ['Montserrat', 'normal', 'Montserrat-Regular.ttf'],
  ['Montserrat', 'medium', 'Montserrat-Medium.ttf'],
];

function base64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/** The brochure's fonts (public/fonts/brochure); false when they cannot be loaded, and the built-in fonts stand in. */
async function addFonts(doc: JsPdf): Promise<boolean> {
  try {
    const files = await Promise.all(
      FONTS.map(async ([, , file]) => {
        const res = await fetch(`/fonts/brochure/${file}`);
        if (!res.ok) throw new Error(file);
        return base64(await res.arrayBuffer());
      }),
    );
    FONTS.forEach(([family, style, file], i) => {
      doc.addFileToVFS(file, files[i]);
      doc.addFont(file, family, style);
    });
    return true;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*  The PDF                                                                   */
/* -------------------------------------------------------------------------- */

/* Dark on the left of the cover, where the words sit */
const coverShade: Shade = (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, 'rgba(22,22,22,0.86)');
  g.addColorStop(0.45, 'rgba(22,22,22,0.62)');
  g.addColorStop(1, 'rgba(22,22,22,0.12)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};
const dim: Shade = (ctx, w, h) => {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, w, h);
};
/* The team photo is wider than the page: its top, with the D|R|P sign, a little larger */
const teamCrop: Crop = (iw, ih) => {
  const sh = ih * 0.835;
  const sw = Math.min(iw, (sh * 16) / 9);
  return [(iw - sw) / 2, 0, sw, sh];
};

export async function makeBrochure(project: BrochureProject, agent: BrochureAgent, office: BrochureOffice) {
  const { jsPDF } = await import('jspdf');
  const doc: JsPdf = new jsPDF({ unit: 'pt', format: [W, H], orientation: 'landscape', compress: true });

  const digits = (n: string) => n.replace(/[^\d]/g, '');
  const waLink = agent.whatsapp ? `https://wa.me/${digits(agent.whatsapp)}` : '';

  const [fonts, team, cover, whiteLogo, blackLogo, face, qr, card, plan, map, gallery] = await Promise.all([
    addFonts(doc),
    photo('/images/drpteam.jpeg', 1920, 1080, { shade: dim, crop: teamCrop }),
    project.images[0] ? photo(project.images[0], 1920, 1080, { quality: 0.85, shade: coverShade, big: true }) : Promise.resolve(null),
    logo('/brand/drp-white.svg'),
    logo('/brand/drp-black.svg'),
    agent.photo ? portrait(agent.photo) : Promise.resolve(null),
    waLink ? QRCode.toDataURL(waLink, { margin: 0, width: 480, color: { dark: '#1a1a1a', light: '#ffffff' } }) : Promise.resolve(null),
    agent.card ? photo(agent.card, 1920, 1080, { quality: 0.9 }) : Promise.resolve(null),
    project.masterPlan ? drawing(project.masterPlan) : Promise.resolve(null),
    project.coords ? streetMap(project.coords, 945, H) : Promise.resolve(null),
    inTurn(project.images.slice(1, 17), 4, (src) => photo(src, 1920, 1080, { big: true })),
  ]);

  /* ---------- Type ---------- */
  const SERIF = fonts ? 'Cormorant' : 'times';
  const SANS = fonts ? 'Montserrat' : 'helvetica';
  const font = (face: 'serif' | 'sans', weight: 'light' | 'normal' | 'medium', size: number, color: Rgb) => {
    doc.setFont(face === 'serif' ? SERIF : SANS, fonts ? weight : weight === 'medium' ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };
  const text = (s: string, x: number, y: number, opts?: Parameters<JsPdf['text']>[3]) => doc.text(plain(s), x, y, opts);
  const lines = (s: string, width: number) => doc.splitTextToSize(plain(s), width) as string[];
  /** Spaced capitals: eyebrows, labels and footers */
  const caps = (s: string, x: number, y: number, size: number, color: Rgb, opts?: Parameters<JsPdf['text']>[3], spacing = size * 0.28) => {
    font('sans', 'medium', size, color);
    doc.setCharSpace(spacing);
    text(s.toUpperCase(), x, y, opts);
    doc.setCharSpace(0);
  };
  /** Shrinks the current font, from `size`, until the text fits in `width` */
  const fit = (s: string, width: number, size: number, min = size * 0.6) => {
    let z = size;
    doc.setFontSize(z);
    while (z > min && doc.getTextWidth(plain(s)) > width) doc.setFontSize((z -= 1));
  };

  let pageNo = 0;
  const page = (first = false) => {
    if (!first) doc.addPage([W, H], 'landscape');
    pageNo += 1;
  };
  const fill = (c: Rgb) => {
    doc.setFillColor(...c);
    doc.rect(0, 0, W, H, 'F');
  };
  const cornerLogo = (white = false) => {
    const l = white ? whiteLogo : blackLogo;
    if (l) doc.addImage(l.data, 'PNG', W - 62 - 42 * l.ratio, 38, 42 * l.ratio, 42);
  };
  const footer = (label: string) => {
    caps(label, M, 776, 8, MUTED);
    caps(String(pageNo).padStart(2, '0'), W - 62, 776, 8, MUTED, { align: 'right' });
  };
  /** Eyebrow, title and the short orange rule, top of a white page's left column; returns where the copy starts */
  const intro = (kicker: string, title: string, y = 243, width = 380, size = 52) => {
    caps(kicker, M, y, 10.5, ORANGE);
    font('serif', 'normal', size, INK);
    const t = lines(title, width).slice(0, 3);
    t.forEach((l, i) => text(l, M, y + 56 + i * size * 1.05));
    const ry = y + 56 + (t.length - 1) * size * 1.05 + 32;
    doc.setFillColor(...ORANGE);
    doc.rect(M, ry, 56, 2, 'F');
    return ry + 36;
  };
  /** Body copy in `width` from y, stopping before `bottom`; returns where it ended */
  const body = (paragraphs: string[], x: number, y: number, width: number, bottom: number, size = 13.5) => {
    font('sans', 'light', size, TEXT);
    const lh = size * 1.92;
    for (const p of paragraphs) {
      if (y + lh > bottom) break;
      const ls = lines(p, width);
      const shown = ls.slice(0, Math.floor((bottom - y) / lh));
      if (shown.length < ls.length) shown[shown.length - 1] = shown[shown.length - 1].replace(/\s*\S*$/, '...');
      shown.forEach((l, i) => text(l, x, y + i * lh));
      y += shown.length * lh + size * 1.1;
    }
    return y;
  };

  /* ---------- 1. Investment offer, by D|R|P ---------- */
  page(true);
  fill([70, 70, 70]);
  if (team) doc.addImage(team, 'JPEG', 0, 0, W, H);
  font('serif', 'normal', 46, WHITE);
  text('Investment offer', 115, 258);
  font('serif', 'normal', 30, ORANGE);
  text('by ', 395, 312);
  const byW = doc.getTextWidth('by ');
  font('serif', 'normal', 30, WHITE);
  text('Dubai Rapid Properties', 395 + byW, 312);

  /* ---------- 2. Cover ---------- */
  page();
  fill(INK);
  if (cover) doc.addImage(cover, 'JPEG', 0, 0, W, H);
  if (whiteLogo) doc.addImage(whiteLogo.data, 'PNG', 90, 62, 60 * whiteLogo.ratio, 60);
  caps(project.eyebrow, 90, 193, 11, ORANGE);
  font('serif', 'normal', 56, WHITE);
  const titleLines = lines(project.name, 640).slice(0, 2);
  titleLines.forEach((l, i) => text(l, 90, 268 + i * 60));
  let cy = 268 + (titleLines.length - 1) * 60;
  caps(project.location, 90, cy + 52, 12, WHITE, undefined, 3.2);
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.6);
  doc.line(90, cy + 110, 710, cy + 110);
  cy += 145;
  caps(project.price ? 'Starting price' : 'Price', 90, cy, 10, PALE);
  font('serif', 'medium', 60, ORANGE);
  text(project.price ?? 'On request', 90, cy + 56);
  const factX = [90, 280, 470, 700];
  project.keyFacts.slice(0, 3).forEach(([value, label], i) => {
    font('serif', 'medium', 30, WHITE);
    fit(value, factX[i + 1] - factX[i] - 18, 30, 18);
    text(value, factX[i], cy + 120);
    caps(label, factX[i], cy + 143, 9.5, PALE);
  });
  caps(`RERA ORN ${office.orn}`, 80, 776, 8.5, PALE);
  caps(`Presented by ${agent.name}  ·  ${agent.phone}`, W - 62, 776, 8.5, PALE, { align: 'right' });

  /* ---------- 3. The project: description and the fact grid ---------- */
  page();
  fill(WHITE);
  cornerLogo();
  const ty = intro('The Project', project.name);
  body(project.description, M, ty + 10, 370, 740);
  const cells = project.grid.slice(0, 9);
  const cw = RW / 3;
  const ch = Math.min(123, 520 / Math.max(Math.ceil(cells.length / 3), 1));
  const gy = Math.max(150, 405 - (Math.ceil(cells.length / 3) * ch) / 2);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.8);
  cells.forEach((c, i) => {
    const x = RX + (i % 3) * cw;
    const y = gy + Math.floor(i / 3) * ch;
    const first = i === 0;
    if (first) {
      doc.setFillColor(...DARK);
      doc.rect(x, y, cw, ch, 'F');
    }
    doc.rect(x, y, cw, ch, 'S');
    caps(c.label, x + 26, y + 34, 8.5, first ? PALE : MUTED);
    font('serif', 'medium', 32, first ? ORANGE : INK);
    fit(c.value, cw - 50, 32, 18);
    text(c.value, x + 26, y + 70);
    font('sans', 'light', 10.5, first ? [235, 232, 228] : MUTED);
    text(lines(c.sub, cw - 50)[0] ?? '', x + 26, y + 94);
  });
  footer('The Project');

  /* ---------- 4. Units, prices and the payment plan ---------- */
  const plan3 = project.schedule;
  const units = project.units.slice(0, 12);
  if (units.length || plan3) {
    page();
    fill(WHITE);
    cornerLogo();
    if (units.length) {
      let y = intro('Units & Prices', 'Starting prices by unit', 200, 380, 48);
      font('sans', 'light', 11.5, MUTED);
      lines("The developer's published starting prices. Your D|R|P specialist confirms availability and current prices.", 370)
        .slice(0, 3)
        .forEach((l, i) => text(l, M, y + i * 20));
      y += 90;
      if (plan3) {
        caps('Payment plan', M, y, 10, ORANGE);
        font('serif', 'normal', 30, INK);
        text(`${plan3[0] + plan3[1]}/${plan3[2]}`, M, y + 40);
        plan3.forEach((pct, i) => {
          const x = M + i * 125;
          font('serif', 'medium', 26, i === 0 ? ORANGE : INK);
          text(`${pct}%`, x, y + 92);
          font('sans', 'light', 9.5, MUTED);
          lines(STAGES[i], 110).forEach((l, j) => text(l, x, y + 112 + j * 14));
        });
      }
      /* The table */
      const sized = units.some((u) => u.size);
      const rh = Math.min(52, 500 / (units.length + 1));
      let ry = Math.max(140, 405 - ((units.length + 1) * rh) / 2);
      caps('Unit type', RX, ry, 8.5, MUTED);
      if (sized) caps('Size', RX + RW * 0.48, ry, 8.5, MUTED);
      caps('Starting price', RX + RW, ry, 8.5, MUTED, { align: 'right' });
      ry += 16;
      doc.setDrawColor(...DARK);
      doc.setLineWidth(1);
      doc.line(RX, ry, RX + RW, ry);
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.8);
      const size = Math.min(26, rh * 0.5);
      for (const u of units) {
        const by = ry + rh * 0.64;
        font('serif', 'medium', size, INK);
        text(u.name, RX, by);
        if (sized) {
          font('sans', 'light', 12.5, TEXT);
          text(u.size || '-', RX + RW * 0.48, by);
        }
        font('serif', 'medium', size, u.price.startsWith('AED') ? ORANGE : MUTED);
        text(u.price, RX + RW, by, { align: 'right' });
        ry += rh;
        doc.line(RX, ry, RX + RW, ry);
      }
    } else if (plan3) {
      intro('Payment Plan', `${plan3[0] + plan3[1]}/${plan3[2]} payment plan`);
      const sw = RW / 3;
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.8);
      plan3.forEach((pct, i) => {
        const x = RX + i * sw;
        doc.rect(x, 300, sw, 200, 'S');
        caps(STAGES[i], x + 26, 340, 9, MUTED);
        font('serif', 'medium', 64, i === 0 ? ORANGE : INK);
        text(`${pct}%`, x + 26, 440);
      });
    }
    footer(units.length ? 'Units & Prices' : 'Payment Plan');
  }

  /* ---------- 5. Amenities ---------- */
  if (project.amenities.length) {
    page();
    fill(WHITE);
    cornerLogo();
    const y = intro('Amenities', `Life at ${project.name}`);
    font('sans', 'light', 13, TEXT);
    lines(`${project.amenities.length} amenities for residents, as the developer publishes them.`, 360)
      .slice(0, 2)
      .forEach((l, i) => text(l, M, y + 10 + i * 24));
    const list = project.amenities.slice(0, 42);
    const rowsN = Math.ceil(list.length / 3);
    const rh = Math.min(46, 560 / Math.max(rowsN, 1));
    const ay = Math.max(130, 405 - (rowsN * rh) / 2);
    const aw = RW / 3;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.8);
    list.forEach((a, i) => {
      const x = RX + (i % 3) * aw;
      const y2 = ay + Math.floor(i / 3) * rh;
      doc.setFillColor(...ORANGE);
      doc.circle(x + 4, y2 + rh / 2 - 4, 2.6, 'F');
      font('sans', 'normal', 12.5, INK);
      fit(a, aw - 34, 12.5, 9);
      text(a, x + 18, y2 + rh / 2);
      doc.line(x, y2 + rh - 6, x + aw - 20, y2 + rh - 6);
    });
    footer('Amenities');
  }

  /* ---------- 6. The photos, one to a page ---------- */
  /* Each photo once: the cover, the master plan and repeats are left out */
  const seen = await Promise.all([cover, plan?.data].filter((x): x is string => Boolean(x)).map(fingerprint));
  const shots: string[] = [];
  for (const g of gallery) {
    if (!g) continue;
    const f = await fingerprint(g);
    if (seen.some((s) => alike(s, f))) continue;
    seen.push(f);
    shots.push(g);
  }
  for (const g of shots) {
    page();
    doc.addImage(g, 'JPEG', 0, 0, W, H);
    cornerLogo(true);
  }

  /* ---------- 7. Master plan ---------- */
  if (plan) {
    page();
    fill(WHITE);
    cornerLogo();
    caps('Master Plan', M, 110, 10.5, ORANGE);
    font('serif', 'normal', 40, INK);
    text(`${project.name} master plan`, M, 158);
    const top = 195;
    let pw = W - 2 * M;
    let ph = pw / plan.ratio;
    if (ph > 740 - top) {
      ph = 740 - top;
      pw = ph * plan.ratio;
    }
    doc.addImage(plan.data, 'JPEG', (W - pw) / 2, top, pw, ph);
    footer('Master Plan');
  }

  /* ---------- 8. Location: the map, or a photo, and the area ---------- */
  page();
  fill(WHITE);
  const mapW = 945;
  if (map) {
    doc.addImage(map, 'JPEG', 0, 0, mapW, H);
    /* The pin, and the project's name beside it */
    const px = mapW / 2;
    const py = H / 2;
    doc.setFillColor(...ORANGE);
    doc.circle(px, py - 38, 24, 'F');
    doc.triangle(px - 21, py - 26, px + 21, py - 26, px, py + 4, 'F');
    doc.setFillColor(...WHITE);
    doc.circle(px, py - 38, 9, 'F');
    font('serif', 'medium', 24, ORANGE);
    const lw = Math.min(doc.getTextWidth(plain(project.name)) + 40, mapW - px - 44);
    doc.setFillColor(...DARK);
    doc.rect(px + 14, py - 22, lw, 44, 'F');
    fit(project.name, lw - 40, 24, 14);
    text(project.name, px + 34, py + 8);
    font('sans', 'light', 7, [90, 90, 90]);
    text('© OpenStreetMap contributors', 12, H - 10);
  } else if (shots[0] ?? cover) {
    /* The middle of a full-page photo, in the left panel */
    doc.addImage((shots[0] ?? cover)!, 'JPEG', -(W - mapW) / 2, 0, W, H);
    doc.setFillColor(...WHITE);
    doc.rect(mapW, 0, W - mapW, H, 'F');
  }
  cornerLogo();
  const lx = 995;
  const lwid = W - lx - 62;
  caps('Location & Features', lx, 197, 10.5, ORANGE);
  font('serif', 'normal', 46, INK);
  const lt = lines(project.area, lwid).slice(0, 2);
  lt.forEach((l, i) => text(l, lx, 268 + i * 50));
  let ly = 268 + (lt.length - 1) * 50 + 30;
  doc.setFillColor(...ORANGE);
  doc.rect(lx, ly, 56, 2, 'F');
  ly = body(project.locationText.slice(0, 2), lx, ly + 40, lwid, 560, 12.5);
  const features = project.highlights.map((h) => h.title).slice(0, 6);
  if (features.length && ly < 640) {
    caps('Highlights', lx, ly + 6, 9, MUTED);
    font('sans', 'light', 12.5, TEXT);
    lines(features.join('  ·  '), lwid)
      .slice(0, 3)
      .forEach((l, i) => text(l, lx, ly + 32 + i * 24));
  }
  footer('Location');

  /* ---------- 9. The agent: their own card, or one drawn from their details ---------- */
  page();
  if (card) {
    doc.addImage(card, 'JPEG', 0, 0, W, H);
  } else {
    fill(INK);
    if (whiteLogo) doc.addImage(whiteLogo.data, 'PNG', 90, 62, 60 * whiteLogo.ratio, 60);
    caps('Get in touch with a specialist', 90, 250, 11, ORANGE);
    let tx = 90;
    if (face) {
      doc.addImage(face, 'PNG', 90, 300, 220, 220);
      tx = 360;
    }
    font('serif', 'normal', 56, WHITE);
    text(agent.name, tx, 360);
    font('sans', 'light', 14, PALE);
    text([agent.role, agent.brn ? `BRN ${agent.brn}` : ''].filter(Boolean).join('  ·  '), tx, 395);
    const rows: [string, string][] = [
      ['Phone', agent.phone],
      ...(agent.whatsapp ? ([['WhatsApp', agent.whatsapp]] as [string, string][]) : []),
      ['Email', agent.email],
      ['Web', office.website],
      ['Office', office.address],
    ];
    rows.forEach(([label, value], i) => {
      caps(label, tx, 450 + i * 34, 8.5, [170, 165, 158]);
      font('sans', 'normal', 15, WHITE);
      text(value, tx + 100, 450 + i * 34);
    });
    if (qr) {
      doc.setFillColor(...WHITE);
      doc.rect(W - 300, 300, 200, 200, 'F');
      doc.addImage(qr, 'PNG', W - 288, 312, 176, 176);
      caps('Scan to WhatsApp', W - 200, 530, 8.5, PALE, { align: 'center' });
    }
  }

  /* ---------- 10. D|R|P, and the small print ---------- */
  page();
  fill([0, 0, 0]);
  if (whiteLogo) {
    const lh = 220;
    doc.addImage(whiteLogo.data, 'PNG', (W - lh * whiteLogo.ratio) / 2, 285, lh * whiteLogo.ratio, lh);
  }
  font('serif', 'normal', 22, WHITE);
  text(office.website, W / 2, 625, { align: 'center' });
  font('sans', 'light', 8, [140, 136, 130]);
  lines(
    `RERA ORN ${office.orn}  ·  ${office.address}  ·  ${office.phone}  ·  ${office.email}. Prices, payment plans and handover dates are the developer's published figures and may change; availability is not guaranteed. This brochure is for information only and is not an offer. Full details: ${project.pageUrl}`,
    900,
  ).forEach((l, i) => text(l, W / 2, 730 + i * 13, { align: 'center' }));

  const first = agent.name.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'drp';
  doc.save(`DRP_${project.slug}-brochure-${first}.pdf`);
}
