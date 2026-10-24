/**
 * The market report that /market-report emails to everyone who fills in its form.
 *
 *  - `file`  the PDF in /public, e.g. '/reports/drp-h1-2026-market-report.pdf'.
 *            While it is null nothing is emailed to the visitor (the enquiry
 *            still reaches the office and the portal).
 *  - Rebuild the PDF from data/market/dld.json with `python3 scripts/build-market-report.py`.
 *  - Setting MARKET_REPORT_URL on the Worker overrides it with any full link.
 */
export const marketReport = {
  title: 'H1 2026 Dubai Market Report',
  file: '/reports/drp-h1-2026-market-report.pdf' as string | null,
};
