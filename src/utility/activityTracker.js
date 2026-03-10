import axios from "axios";

let lastPing = 0;
let teardownActivityTracker = null;

const PING_INTERVAL = 60 * 1000;
const ANALYTICS_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:7070/v1";

export function initActivityTracker(token) {
  if (!token) return;

  teardownActivityTracker?.();

  const ping = async () => {
    const now = Date.now();
    if (now - lastPing < PING_INTERVAL) return;

    lastPing = now;
    try {
      await axios.post(
        `${ANALYTICS_BASE_URL}/api/analytics/ping`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {}
  };

  const events = ["click", "keydown", "scroll"];

  events.forEach((event) => window.addEventListener(event, ping, { passive: true }));

  teardownActivityTracker = () => {
    events.forEach((event) => window.removeEventListener(event, ping));
  };

  return teardownActivityTracker;
}
