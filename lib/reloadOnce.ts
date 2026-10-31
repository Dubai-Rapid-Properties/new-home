/**
 * After a deploy, a tab still running the previous version asks for script
 * files that are gone, and the page fails to load. Reloading once fetches the
 * current version; a second failure within a minute shows the error instead
 * of looping.
 */
const KEY = 'drp-error-reload';

export function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0);
    if (Date.now() - last < 60_000) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}
