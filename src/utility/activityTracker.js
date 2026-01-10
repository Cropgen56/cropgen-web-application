import axios from "axios";

let lastPing = 0;
const PING_INTERVAL = 60 * 1000; 

export function initActivityTracker(token) {
  if (!token) return;

  const ping = async () => {
    const now = Date.now();
    if (now - lastPing < PING_INTERVAL) return;

    lastPing = now;
    try {
      await axios.post(
   `${process.env.REACT_APP_API_URL}/api/analytics/ping`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      
    }
  };

  ["click", "keydown", "scroll"].forEach((event) =>
    window.addEventListener(event, ping)
  );
}
