import { getDaysAgo, latestTimeseriesTimestamp } from "./formatDate";

describe("latestTimeseriesTimestamp", () => {
  const series = [
    { date: "2026-09-25", value: 0.3 },
    { date: "2026-10-19", value: 0.31 },
    { date: "2026-10-05", value: 0.29 },
  ];

  test("uses the newest data date from the satellite response", () => {
    expect(latestTimeseriesTimestamp({ summary: {}, timeseries: series })).toBe(
      new Date("2026-10-19").getTime(),
    );
    expect(latestTimeseriesTimestamp({ data: { timeseries: series } })).toBe(
      new Date("2026-10-19").getTime(),
    );
  });

  test("returns null when there is no data, so the card shows N/A", () => {
    expect(latestTimeseriesTimestamp(null)).toBeNull();
    expect(latestTimeseriesTimestamp({ timeseries: [] })).toBeNull();
  });

  test("result works with getDaysAgo", () => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const ts = latestTimeseriesTimestamp({
      timeseries: [{ date: new Date(threeDaysAgo).toISOString() }],
    });
    expect(getDaysAgo(ts)).toBe(3);
  });
});
