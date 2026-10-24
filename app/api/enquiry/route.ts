/**
 * POST /api/enquiry — every website form posts here; the enquiry is emailed
 * to DRP through Resend (https://resend.com).
 *
 *   RESEND_API_KEY   required — Resend → API Keys
 *   ENQUIRY_TO       optional, default office@dubairapidproperties.com
 *   ENQUIRY_FROM     optional, default "D|R|P Website <onboarding@resend.dev>".
 *                    The default sender only delivers to the Resend account's
 *                    own address; once dubairapidproperties.com is verified in
 *                    Resend, use e.g. "D|R|P Website <website@dubairapidproperties.com>".
 *
 * Each enquiry is also saved as a lead in the D|R|P portal (Leads), so staff
 * can assign and follow it up there:
 *
 *   PORTAL_API_KEY        the portal's WEBSITE_API_KEY; without it nothing is saved
 *   PORTAL_ENQUIRIES_URL  optional, default https://admin.dubairapidproperties.com/api/public/enquiries
 *
 * The visitor sees success when either the email or the portal got the enquiry.
 *
 * The market-report form also emails the report to the visitor (data/marketReport.ts).
 * That email is sent from ENQUIRY_FROM (or REPORT_FROM) and, like every email to a
 * visitor, only reaches them once the sender's domain is verified in Resend.
 *
 * The body is multipart: `data` (the fields as JSON) and an optional `file` (a CV).
 */

export const runtime = 'nodejs';

import { marketReport } from '@/data/marketReport';
import { siteUrl } from '@/lib/siteUrl';

const TO = process.env.ENQUIRY_TO || 'office@dubairapidproperties.com';
const FROM = process.env.ENQUIRY_FROM || 'D|R|P Website <onboarding@resend.dev>';
/* Overridable for local testing against a mock */
const RESEND_URL = process.env.RESEND_API_URL || 'https://api.resend.com/emails';
const PORTAL_URL = process.env.PORTAL_ENQUIRIES_URL || 'https://admin.dubairapidproperties.com/api/public/enquiries';

const MAX_DATA = 20_000;
const MAX_FILE = 4 * 1024 * 1024;
const FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The fields shown first, in this order */
const LEAD = ['form', 'name', 'email', 'phone'];

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** "listingRef" → "Listing ref", "book-a-stay" → "Book a stay" */
const humanise = (s: string) => {
  const t = s.replace(/[-_]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().trim();
  return (t.charAt(0).toUpperCase() + t.slice(1)).replace(/\bdrp\b/gi, 'D|R|P');
};

const show = (v: unknown): string => {
  if (v == null || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.map(show).join(', ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

/** Link to the market report PDF, or null while there is none to send. */
const reportLink = () => {
  const override = process.env.MARKET_REPORT_URL?.trim();
  if (override) return override;
  if (!marketReport.file) return null;
  /* Without NEXT_PUBLIC_SITE_URL the site address is localhost, which no visitor can open */
  const base = /localhost/.test(siteUrl) ? 'https://dubairapidproperties.com' : siteUrl;
  return `${base}${marketReport.file}`;
};

/** The report's own sender: the enquiry sender's address under D|R|P's name. */
const reportFrom = () =>
  process.env.REPORT_FROM || FROM.replace(/^[^<]*(?=<)/, 'Dubai Rapid Properties ');

/** Emails the report link to the visitor. True when Resend accepted it. */
async function sendReport(key: string, to: string, name: string, link: string): Promise<boolean> {
  const first = escape(name.split(/\s+/)[0]);
  const html = `<!doctype html><html><body style="margin:0;background:#f5f3ef;font-family:Arial,sans-serif;color:#1a1a1a">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<p style="letter-spacing:.2em;font-size:12px;color:#f26f3d;margin:0 0 20px">D|R|P &middot; DUBAI RAPID PROPERTIES</p>
<h1 style="font-weight:normal;font-size:26px;margin:0 0 16px">Your ${escape(marketReport.title)}</h1>
<p style="font-size:15px;line-height:1.6">Dear ${first},</p>
<p style="font-size:15px;line-height:1.6">Thank you for your interest. Here is the report you asked for.</p>
<p style="margin:28px 0"><a href="${escape(link)}" style="background:#f26f3d;color:#fff;text-decoration:none;padding:14px 26px;font-size:13px;letter-spacing:.12em">DOWNLOAD THE REPORT</a></p>
<p style="font-size:14px;line-height:1.6;color:#555">If you would like to talk it through, reply to this email, call +971 4 529 4904 or WhatsApp +971 56 777 0272.</p>
<p style="font-size:14px;line-height:1.6;color:#555;margin-top:24px">Dubai Rapid Properties<br>Golden Mile 9, Palm Jumeirah, Dubai</p>
</div></body></html>`;
  const text = `Dear ${name.split(/\s+/)[0]},\n\nThank you for your interest. Here is your ${marketReport.title}:\n${link}\n\nTo talk it through, reply to this email, call +971 4 529 4904 or WhatsApp +971 56 777 0272.\n\nDubai Rapid Properties\nGolden Mile 9, Palm Jumeirah, Dubai`;
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: reportFrom(),
        to: [to],
        reply_to: TO,
        subject: `Your ${marketReport.title}`,
        html,
        text,
      }),
    });
    if (!res.ok) console.error('[enquiry] Resend refused the report email', res.status, (await res.text()).slice(0, 300));
    return res.ok;
  } catch (error) {
    console.error('[enquiry] the report email could not be sent', error instanceof Error ? error.message : error);
    return false;
  }
}

const fail = (status: number, error: string) => Response.json({ ok: false, error }, { status });

/** Saves the enquiry as a lead in the portal. True when it is there (or the portal skips this form). */
async function saveToPortal(data: Record<string, unknown>): Promise<boolean> {
  const key = process.env.PORTAL_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch(PORTAL_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error('[enquiry] the portal did not save the lead', res.status, (await res.text()).slice(0, 300));
    return res.ok;
  } catch (error) {
    console.error('[enquiry] the portal could not be reached', error instanceof Error ? error.message : error);
    return false;
  }
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, 'bad-body');
  }

  const raw = form.get('data');
  if (typeof raw !== 'string' || raw.length > MAX_DATA) return fail(400, 'bad-data');
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw);
  } catch {
    return fail(400, 'bad-data');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return fail(400, 'bad-data');

  const email = String(data.email ?? '').trim();
  const phone = String(data.phone ?? '').trim();
  /* The newsletter signup asks for an email address only */
  const emailOnly = data.form === 'newsletter';
  const name = String(data.name ?? '').trim() || (emailOnly ? email : '');
  if (!name || (!EMAIL.test(email) && !(phone && !emailOnly))) return fail(400, 'missing-contact');

  const file = form.get('file');
  const attachments: { filename: string; content: string }[] = [];
  if (file instanceof File && file.size > 0) {
    /* Some browsers send Word files without a type; fall back to the extension */
    const typeOk = FILE_TYPES.includes(file.type) || (!file.type && /\.(pdf|docx?)$/i.test(file.name));
    if (file.size > MAX_FILE || !typeOk) return fail(400, 'bad-file');
    attachments.push({
      filename: file.name.replace(/[^\w.\- ]+/g, '_').slice(0, 120),
      content: Buffer.from(await file.arrayBuffer()).toString('base64'),
    });
  }

  const formName = humanise(String(data.form ?? 'website'));
  const keys = [...LEAD.filter((k) => k in data), ...Object.keys(data).filter((k) => !LEAD.includes(k))];
  const rows = keys.map((k) => [humanise(k), show(k === 'form' ? formName : data[k])]);

  /* The visitor gets the report itself; the office email below says whether that went out. */
  const link = reportLink();
  const reportKey = process.env.RESEND_API_KEY;
  if (data.form === 'market-report' && link && reportKey && EMAIL.test(email)) {
    rows.push(['Report emailed', (await sendReport(reportKey, email, name, link)) ? 'Yes' : 'No (check the Worker logs)']);
  }

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1a1a1a">
<h2 style="font-weight:normal;margin:0 0 16px">New website enquiry — ${escape(formName)}</h2>
<table cellpadding="8" style="border-collapse:collapse;font-size:14px">
${rows.map(([k, v]) => `<tr><td style="border-bottom:1px solid #eee;color:#777;vertical-align:top;white-space:nowrap">${escape(k)}</td><td style="border-bottom:1px solid #eee;white-space:pre-wrap">${escape(v)}</td></tr>`).join('\n')}
</table>
${attachments.length ? `<p style="font-size:13px;color:#777">Attached: ${escape(attachments[0].filename)}</p>` : ''}
</body></html>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  const saved = await saveToPortal(data);

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('[enquiry] RESEND_API_KEY is not set — enquiry not emailed');
    return saved ? Response.json({ ok: true }) : fail(503, 'not-configured');
  }

  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      ...(EMAIL.test(email) ? { reply_to: email } : {}),
      subject: `Website enquiry: ${formName} — ${name}`.slice(0, 200),
      html,
      text,
      ...(attachments.length ? { attachments } : {}),
    }),
  });

  if (!res.ok) {
    console.error('[enquiry] Resend refused the email', res.status, (await res.text()).slice(0, 300));
    if (!saved) return fail(502, 'send-failed');
  }
  return Response.json({ ok: true });
}
