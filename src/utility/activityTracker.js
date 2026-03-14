import api from "../api/api";

let lastPing = 0;
let teardownActivityTracker = null;

const PING_INTERVAL = 60 * 1000;

export function initActivityTracker() {
  teardownActivityTracker?.();

  const ping = async () => {
    const now = Date.now();
    if (now - lastPing < PING_INTERVAL) return;
    lastPing = now;
    try {
      await api.post("/api/analytics/ping");
    } catch {
      // Silently ignore ping failures
    }
  };

  const events = ["click", "keydown", "scroll"];
  events.forEach((event) =>
    window.addEventListener(event, ping, { passive: true }),
  );

  teardownActivityTracker = () => {
    events.forEach((event) => window.removeEventListener(event, ping));
  };

  return teardownActivityTracker;
}
