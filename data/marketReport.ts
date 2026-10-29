/**
 * The market report that /market-report emails to everyone who fills in its form.
 *
 *  - `file`  the PDF in /public, e.g. '/reports/drp-q3-2026-market-report.pdf'.
 *            While it is null nothing is emailed to the visitor (the enquiry
 *            still reaches the office and the portal).
 *  - The Q3 2026 report is D|R|P's own, from Property Monitor's DLD figures. The
 *    H1 2026 one (scripts/build-market-report.py) stays in /public/reports for
 *    links already emailed.
 *  - Setting MARKET_REPORT_URL on the Worker overrides it with any full link.
 */
export const marketReport = {
  title: 'Q3 2026 Dubai Residential Market Report',
  file: '/reports/drp-q3-2026-market-report.pdf' as string | null,
};
