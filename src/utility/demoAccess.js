/**
 * Read ?demo=KEY from the current URL (if present).
 */
export function getDemoKeyFromUrl() {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("demo");
    return key && key.trim() ? key.trim() : null;
  } catch {
    return null;
  }
}

/**
 * Remove ?demo= from the address bar without a full reload.
 */
export function stripDemoKeyFromUrl() {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("demo")) return;
    url.searchParams.delete("demo");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", next);
  } catch {
    // ignore
  }
}

/** Module-level lock so React Strict Mode cannot fire activate twice. */
let demoActivateInFlight = false;

export function beginDemoActivate() {
  if (demoActivateInFlight) return false;
  demoActivateInFlight = true;
  return true;
}

export function endDemoActivate() {
  demoActivateInFlight = false;
}
