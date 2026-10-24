#!/usr/bin/env python3
"""
Builds the market report PDF that /market-report emails to visitors:
public/reports/drp-h1-2026-market-report.pdf

Every figure comes from data/market/dld.json (Dubai Land Department open data,
refreshed by scripts/sync-dld.mjs). Nothing is estimated.

  python3 scripts/build-market-report.py

Needs reportlab (pip install reportlab). Re-run it after refreshing the DLD data.
"""
import json
import os
from datetime import date

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, PageBreak, PageTemplate, Paragraph, Spacer, Table,
                                TableStyle, KeepTogether)
from reportlab.graphics.shapes import Drawing, Rect, String, Line, PolyLine, Circle

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'reports', 'drp-h1-2026-market-report.pdf')

# ---------- Brand ----------
INK = HexColor('#1c1c1c')
CHARCOAL = HexColor('#2d2d2d')
ORANGE = HexColor('#f26f3d')
CREAM = HexColor('#f5f3ef')
GREY = HexColor('#6b6b6b')
LINE = HexColor('#dcd8d0')

F = '/usr/share/fonts/truetype/'
pdfmetrics.registerFont(TTFont('Serif', F + 'liberation/LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Serif-Bold', F + 'liberation/LiberationSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Sans', F + 'liberation/LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Sans-Bold', F + 'liberation/LiberationSans-Bold.ttf'))

# ---------- Data ----------
with open(os.path.join(ROOT, 'data', 'market', 'dld.json')) as fh:
    dld = json.load(fh)

H1 = [f'2026-{m:02d}' for m in range(1, 7)]
Q3 = ['2026-07', '2026-08', '2026-09']
MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
UPDATED = dld['updatedAt'][:10]


def by_month(summary):
    return {m['month']: m for m in summary['months']}


def total(summary, months):
    mm_ = by_month(summary)
    return sum(mm_[m]['sales'] for m in months if m in mm_)


def avg_psf(summary, months):
    """Average of the monthly median prices per sq ft, weighted by each month's sales."""
    mm_ = by_month(summary)
    rows = [(mm_[m]['sales'], mm_[m]['medianPsf']) for m in months if m in mm_ and mm_[m]['medianPsf']]
    n = sum(s for s, _ in rows)
    return round(sum(s * p for s, p in rows) / n) if n else None


def fmt(n):
    return f'{n:,.0f}'


def pct(x, signed=False):
    return f'{x * 100:+.0f}%' if signed else f'{x * 100:.0f}%'


def nice(name):
    """DLD building names come in capitals: 'SERENIA LIVING' -> 'Serenia Living'."""
    return ' '.join(w.capitalize() if w.isupper() else w for w in name.split())


def aed_m(n):
    return f'AED {n / 1e6:.2f}M'


dubai = dld['dubai']
h1_sales = total(dubai, H1)
q3_sales = total(dubai, Q3)
h1_avg_month = h1_sales / 6
q3_avg_month = q3_sales / 3
h1_psf = avg_psf(dubai, H1)
q3_psf = avg_psf(dubai, Q3)
mm_dubai = by_month(dubai)
best_month = max(H1, key=lambda m: mm_dubai[m]['sales'])
soft_month = min(H1, key=lambda m: mm_dubai[m]['sales'])
name_of = lambda m: MONTH_NAMES[int(m[5:]) - 1]

PRIME = ['Palm Jumeirah', 'Dubai Marina', 'Jumeirah Beach Residence', 'Dubai Harbour', 'Bluewaters Island',
         'Downtown Dubai', 'City Walk', 'Dubai Hills Estate']
areas = {a: s for a, s in dld['areas'].items() if total(s, H1) >= 50}
top = sorted(areas.items(), key=lambda kv: -total(kv[1], H1))


# ---------- Styles ----------
def style(name, **kw):
    base = dict(fontName='Sans', fontSize=9.5, leading=14.5, textColor=INK)
    base.update(kw)
    return ParagraphStyle(name, **base)


body = style('body', textColor=HexColor('#3a3a3a'), spaceAfter=7)
small = style('small', fontSize=8, leading=11.5, textColor=GREY)
eyebrow = style('eyebrow', fontName='Sans-Bold', fontSize=8, leading=11, textColor=ORANGE, spaceAfter=4)
h1 = style('h1', fontName='Serif', fontSize=26, leading=30, spaceAfter=10)
h2 = style('h2', fontName='Serif', fontSize=17, leading=21, spaceBefore=10, spaceAfter=6)
cell = style('cell', fontSize=8.5, leading=11)
cellb = style('cellb', fontName='Sans-Bold', fontSize=8.5, leading=11)


def p(text, st=body):
    return Paragraph(text, st)


# ---------- Page furniture ----------
W, H = A4
M = 20 * mm


def cover(c, doc):
    c.setFillColor(INK)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(ORANGE)
    c.rect(M, H - 62 * mm, 14 * mm, 1.2 * mm, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont('Serif', 30)
    c.drawString(M, H - 30 * mm, 'D  |  R  |  P')
    c.setFont('Sans', 8)
    c.setFillColor(HexColor('#b8b8b8'))
    c.drawString(M, H - 36 * mm, 'DUBAI RAPID PROPERTIES')
    c.setFillColor(ORANGE)
    c.setFont('Sans-Bold', 9)
    c.drawString(M, H - 76 * mm, 'MARKET REPORT')
    c.setFillColor(white)
    c.setFont('Serif', 46)
    c.drawString(M, H - 100 * mm, 'Dubai Residential')
    c.drawString(M, H - 116 * mm, 'Market H1 2026')
    c.setFont('Sans', 11)
    c.setFillColor(HexColor('#d0d0d0'))
    c.drawString(M, H - 132 * mm, 'Registered sales, prices and areas, January to June 2026,')
    c.drawString(M, H - 138 * mm, 'with the picture through September.')
    c.setFont('Sans', 8.5)
    c.setFillColor(HexColor('#9a9a9a'))
    c.drawString(M, 28 * mm, 'Source: Dubai Land Department open data, registered residential sales.')
    c.drawString(M, 23 * mm, f'Figures as published up to {UPDATED}. Prepared by Dubai Rapid Properties, Golden Mile 9, Palm Jumeirah.')


def page(c, doc):
    c.setStrokeColor(LINE)
    c.line(M, 16 * mm, W - M, 16 * mm)
    c.setFont('Sans', 7.5)
    c.setFillColor(GREY)
    c.drawString(M, 11 * mm, 'D|R|P  Dubai Residential Market H1 2026')
    c.drawRightString(W - M, 11 * mm, f'{doc.page}')


# ---------- Charts ----------
def bar_chart(months, sales, psf, width=170 * mm, height=62 * mm, colour=ORANGE, later=HexColor('#c9c3b8')):
    d = Drawing(width, height)
    left, bottom, top_pad = 34, 22, 16
    cw, ch = width - left - 8, height - bottom - top_pad
    mx = max(sales) * 1.12
    for i in range(5):
        y = bottom + ch * i / 4
        d.add(Line(left, y, left + cw, y, strokeColor=LINE, strokeWidth=0.5))
        d.add(String(left - 4, y - 3, fmt(mx * i / 4), fontName='Sans', fontSize=6.5, fillColor=GREY, textAnchor='end'))
    n = len(months)
    slot = cw / n
    bw = slot * 0.5
    for i, (m, s) in enumerate(zip(months, sales)):
        x = left + slot * i + (slot - bw) / 2
        h = ch * s / mx
        d.add(Rect(x, bottom, bw, h, fillColor=colour if m in H1 else later, strokeColor=None))
        d.add(String(x + bw / 2, bottom + h + 3, fmt(s), fontName='Sans-Bold', fontSize=7, fillColor=INK, textAnchor='middle'))
        d.add(String(x + bw / 2, bottom - 10, name_of(m), fontName='Sans', fontSize=7.5, fillColor=GREY, textAnchor='middle'))
        if psf[i]:
            d.add(String(x + bw / 2, bottom - 19, f'{fmt(psf[i])}', fontName='Sans', fontSize=6.5, fillColor=GREY, textAnchor='middle'))
    d.add(String(left - 30, bottom - 19, 'AED/sq ft', fontName='Sans', fontSize=6, fillColor=GREY))
    return d


def series(summary, months):
    mm_ = by_month(summary)
    return ([mm_[m]['sales'] if m in mm_ else 0 for m in months],
            [mm_[m]['medianPsf'] if m in mm_ else None for m in months])


def table(rows, widths, header=True, zebra=True):
    t = Table(rows, colWidths=widths, repeatRows=1 if header else 0)
    st = [('FONT', (0, 0), (-1, -1), 'Sans', 8.5),
          ('TEXTCOLOR', (0, 0), (-1, -1), INK),
          ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
          ('TOPPADDING', (0, 0), (-1, -1), 4.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 4.5),
          ('LINEBELOW', (0, 0), (-1, -1), 0.4, LINE)]
    if header:
        st += [('BACKGROUND', (0, 0), (-1, 0), INK), ('TEXTCOLOR', (0, 0), (-1, 0), white),
               ('FONT', (0, 0), (-1, 0), 'Sans-Bold', 7.5)]
    t.setStyle(TableStyle(st))
    return t


def kpis(items):
    row1 = [Paragraph(f'<font name="Serif" size="21" color="#1c1c1c">{v}</font>', style('kv', leading=25)) for v, _ in items]
    row2 = [Paragraph(l, style('kl', fontSize=7.8, leading=10.5, textColor=GREY)) for _, l in items]
    t = Table([row1, row2], colWidths=[(W - 2 * M) / len(items)] * len(items))
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), CREAM), ('LEFTPADDING', (0, 0), (-1, -1), 9),
                           ('TOPPADDING', (0, 0), (-1, 0), 11), ('BOTTOMPADDING', (0, 1), (-1, 1), 11),
                           ('LINEAFTER', (0, 0), (-2, -1), 1.5, white), ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return t


# ---------- Story ----------
S = []
S.append(PageBreak())  # the cover is drawn by the first page template

# Page 2: at a glance
S += [p('AT A GLANCE', eyebrow), p('The first half of 2026', h1)]
S.append(p(f'Dubai recorded <b>{fmt(h1_sales)}</b> registered residential sales between January and June 2026, an average of '
           f'<b>{fmt(h1_avg_month)}</b> a month. {name_of(best_month)} was the busiest month with {fmt(mm_dubai[best_month]["sales"])} sales and '
           f'{name_of(soft_month)} the quietest with {fmt(mm_dubai[soft_month]["sales"])}.'))
S.append(Spacer(1, 4))
S.append(kpis([
    (fmt(h1_sales), 'registered sales, January to June'),
    (f'AED {fmt(h1_psf)}', 'average median price per sq ft, H1'),
    (pct(dubai['offPlanShare']), 'of sales are off-plan, 2026 to date'),
    (aed_m(dubai['medianPrice']), 'median sale price, 2026 to date'),
]))
S.append(Spacer(1, 10))
S.append(p('Sales by month, 2026', h2))
s_, ps_ = series(dubai, H1 + Q3)
S.append(bar_chart(H1 + Q3, s_, ps_))
S.append(p('Bars show registered sales (July to September in grey, after the half-year); the figures under each month are the median price per sq ft in AED.', small))
S.append(Spacer(1, 4))
S.append(p(f'Prices held in a range of AED {fmt(min(mm_dubai[m]["medianPsf"] for m in H1))} to AED '
           f'{fmt(max(mm_dubai[m]["medianPsf"] for m in H1))} per sq ft through the half. '
           f'The off-plan share of 2026 sales is {pct(dubai["offPlanShare"])}: most buyers in Dubai are still buying '
           'from the developer rather than from another owner.'))

# Page 3: areas
S.append(PageBreak())
S += [p('AREA BY AREA', eyebrow), p('Where the sales happened', h1)]
S.append(p('The areas with the most registered sales in H1. Price per sq ft is the average of the monthly medians, weighted by '
           'sales. Median price and off-plan share cover 2026 to date.'))
rows = [['AREA', 'SALES H1', 'SHARE', 'AED / SQ FT', 'MEDIAN PRICE', 'OFF-PLAN']]
for a, s in top[:15]:
    rows.append([a, fmt(total(s, H1)), pct(total(s, H1) / h1_sales), fmt(avg_psf(s, H1) or 0),
                 aed_m(s['medianPrice']) if s['medianPrice'] else '-', pct(s['offPlanShare']) if s['offPlanShare'] is not None else '-'])
col = [52 * mm, 20 * mm, 17 * mm, 24 * mm, 30 * mm, 24 * mm]
t = table(rows, col)
t.setStyle(TableStyle([('ALIGN', (1, 0), (-1, -1), 'RIGHT'), ('FONT', (0, 1), (0, -1), 'Sans-Bold', 8.5)]))
S.append(t)

S.append(Spacer(1, 12))
S.append(p('Prime and waterfront communities', h2))
S.append(p('The communities D|R|P knows best, where a sale is rarer and each one moves the figures more.'))
rows = [['AREA', 'SALES H1', 'AED / SQ FT, H1', 'JAN', 'JUN', 'MEDIAN PRICE']]
for a in PRIME:
    s = dld['areas'].get(a)
    if not s:
        continue
    mm_ = by_month(s)
    rows.append([a, fmt(total(s, H1)), fmt(avg_psf(s, H1) or 0),
                 fmt(mm_['2026-01']['medianPsf']) if '2026-01' in mm_ and mm_['2026-01']['medianPsf'] else '-',
                 fmt(mm_['2026-06']['medianPsf']) if '2026-06' in mm_ and mm_['2026-06']['medianPsf'] else '-',
                 aed_m(s['medianPrice']) if s['medianPrice'] else '-'])
t = table(rows, [52 * mm, 20 * mm, 30 * mm, 20 * mm, 20 * mm, 25 * mm])
t.setStyle(TableStyle([('ALIGN', (1, 0), (-1, -1), 'RIGHT'), ('FONT', (0, 1), (0, -1), 'Sans-Bold', 8.5)]))
S.append(t)

# Page 4: Palm Jumeirah
palm = dld['areas']['Palm Jumeirah']
pm = by_month(palm)
S.append(PageBreak())
S += [p('PALM JUMEIRAH', eyebrow), p('On our own doorstep', h1)]
S.append(p(f'Palm Jumeirah recorded <b>{fmt(total(palm, H1))}</b> registered sales in H1 at an average of '
           f'<b>AED {fmt(avg_psf(palm, H1))}</b> per sq ft, about {avg_psf(palm, H1) / h1_psf:.1f} times the Dubai average. '
           f'{pct(palm["offPlanShare"])} of the Palm&rsquo;s 2026 sales are off-plan, against {pct(dubai["offPlanShare"])} across the city, '
           f'and the median sale price is {aed_m(palm["medianPrice"])}.'))
S.append(Spacer(1, 4))
ps, pp = series(palm, H1 + Q3)
S.append(bar_chart(H1 + Q3, ps, pp))
S.append(p('Palm Jumeirah registered sales by month; median price per sq ft in AED under each month. Monthly medians move '
           'with the mix of homes sold: a month with several large villas lifts the figure.', small))
S.append(Spacer(1, 8))
S.append(p('Buildings with the most sales on the Palm, 2026 to date', h2))
pj = sorted([(n, b['sales'], b['medianPsf']) for n, b in dld['buildings'].items() if b['area'] in ('PALM JUMEIRAH', 'Palm Jumeirah')],
            key=lambda x: -x[1])[:8]
rows = [['BUILDING', 'SALES', 'MEDIAN AED / SQ FT']] + [[nice(n), fmt(s), fmt(pf) if pf else '-'] for n, s, pf in pj]
t = table(rows, [90 * mm, 25 * mm, 45 * mm])
t.setStyle(TableStyle([('ALIGN', (1, 0), (-1, -1), 'RIGHT')]))
S.append(t)

# Page 5: since June + method
S.append(PageBreak())
S += [p('SINCE JUNE', eyebrow), p('What July to September added', h1)]
chg_s = q3_avg_month / h1_avg_month - 1
chg_p = q3_psf / h1_psf - 1
S.append(p(f'Registered sales averaged <b>{fmt(q3_avg_month)}</b> a month in July to September, '
           f'{"up" if chg_s >= 0 else "down"} <b>{abs(chg_s) * 100:.0f}%</b> on the H1 monthly average of {fmt(h1_avg_month)}. '
           f'The average median price per sq ft was AED {fmt(q3_psf)}, '
           f'{"up" if chg_p >= 0 else "down"} {abs(chg_p) * 100:.1f}% on H1.'))
rows = [['', 'H1 (JAN-JUN)', 'Q3 (JUL-SEP)', 'CHANGE']]
rows.append(['Registered sales per month', fmt(h1_avg_month), fmt(q3_avg_month), pct(chg_s, True)])
rows.append(['Average median AED / sq ft', fmt(h1_psf), fmt(q3_psf), f'{chg_p * 100:+.1f}%'])
ph, pq = avg_psf(palm, H1), avg_psf(palm, Q3)
rows.append(['Palm Jumeirah sales per month', fmt(total(palm, H1) / 6), fmt(total(palm, Q3) / 3),
             pct(total(palm, Q3) / 3 / (total(palm, H1) / 6) - 1, True)])
rows.append(['Palm Jumeirah AED / sq ft', fmt(ph), fmt(pq), f'{(pq / ph - 1) * 100:+.1f}%'])
t = table(rows, [64 * mm, 34 * mm, 34 * mm, 28 * mm])
t.setStyle(TableStyle([('ALIGN', (1, 0), (-1, -1), 'RIGHT'), ('FONT', (0, 1), (0, -1), 'Sans-Bold', 8.5)]))
S.append(t)
S.append(Spacer(1, 6))
S.append(p('A quarter is a short window, and Dubai&rsquo;s numbers move with launches, school holidays and the summer. '
           'Treat the comparison as a snapshot, not a forecast.', small))

S.append(Spacer(1, 12))
S.append(p('About these figures', h2))
S.append(p(f'All figures are taken from the Dubai Land Department&rsquo;s open data on registered residential sales, as published up to {UPDATED}. '
           'They cover homes sold in 2026, ready and off-plan; rentals, land, offices, shops and hotel rooms are excluded, as are sales with an implausible price or area. '
           'Price per sq ft is calculated from the registered price and the registered area of each sale. '
           'Monthly figures are medians; a half-year figure averages the six monthly medians, weighted by sales. '
           'Median price and off-plan share cover 2026 up to the date above. '
           'Areas follow the Dubai Land Department&rsquo;s own area names, grouped into the communities used on dubairapidproperties.com. '
           'Areas with fewer than 50 sales in H1 are left out of the tables.'))
S.append(p('This report is general market information and not investment, legal or tax advice. Past sales do not predict future prices.', small))
S.append(Spacer(1, 14))
S.append(KeepTogether([
    p('Talk to D|R|P', h2),
    p('Buying, selling or letting in Dubai? Our team on Palm Jumeirah can tell you what these figures mean for your property.'),
    p('<b>Call</b> +971 4 529 4904 &nbsp;&nbsp; <b>WhatsApp</b> +971 56 777 0272 &nbsp;&nbsp; <b>Email</b> office@dubairapidproperties.com<br/>'
      'Dubai Rapid Properties, Golden Mile 9, Palm Jumeirah, Dubai &nbsp;|&nbsp; RERA ORN 25348 &nbsp;|&nbsp; dubairapidproperties.com'),
]))

os.makedirs(os.path.dirname(OUT), exist_ok=True)
doc = BaseDocTemplate(OUT, pagesize=A4, leftMargin=M, rightMargin=M, topMargin=20 * mm, bottomMargin=24 * mm,
                      title='Dubai Residential Market H1 2026', author='Dubai Rapid Properties',
                      subject='Dubai residential market report, H1 2026')
frame = Frame(M, 24 * mm, W - 2 * M, H - 44 * mm, id='f', leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
doc.addPageTemplates([PageTemplate(id='cover', frames=[frame], onPage=cover, autoNextPageTemplate='body'),
                      PageTemplate(id='body', frames=[frame], onPage=page)])
doc.build(S)
print('wrote', OUT, os.path.getsize(OUT), 'bytes')
