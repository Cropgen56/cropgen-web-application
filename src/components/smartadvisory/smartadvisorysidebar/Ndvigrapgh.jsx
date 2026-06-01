import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { MdDownload } from "react-icons/md";
import { getDaysAgo, getTodayDate } from "../../../utility/formatDate";
import IndexChartLoader from "./IndexChartLoader";
import { fetchVegetationTimeseries } from "../../../api/satelliteTimeseriesApi";

const THEME = {
  primary: "#0D6B45",
  primaryLight: "#48A36D",
  dark: "#10271D",
  surface: "#173A2A",
  surface2: "#1B3F2E",
  surface3: "#1F4D38",
  card: "#214A37",
  chart: "#173828",
};

const NDVIChartCard = ({ selectedField }) => {
  const [indexTimeSeriesSummary, setIndexTimeSeriesSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const [index, setIndex] = useState("NDVI");

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const fieldGeometry = selectedField?.field;
  const sowingDate = selectedField?.sowingDate;

  useEffect(() => {
    if (!fieldGeometry || !sowingDate) return;

    const today = getTodayDate();

    const sixMonthsBefore = (() => {
      const d = new Date(today);
      d.setMonth(d.getMonth() - 6);
      return d.toISOString().split("T")[0];
    })();

    const params = {
      startDate: sixMonthsBefore,
      endDate: today,
      geometry: fieldGeometry,
      index,
    };

    if (abortRef.current) abortRef.current.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setIsLoading(true);

    fetchVegetationTimeseries({ ...params, signal: controller.signal })
      .then(({ data }) => {
        setIndexTimeSeriesSummary(data);
        setIsLoading(false);
      })
      .catch((e) => {
        if (controller.signal.aborted) return;

        setError(e?.message || "Failed to load vegetation timeseries");
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [fieldGeometry, sowingDate, index]);

  const chartData = useMemo(() => {
    const timeseries =
      indexTimeSeriesSummary?.data?.timeseries ||
      indexTimeSeriesSummary?.timeseries ||
      (Array.isArray(indexTimeSeriesSummary) ? indexTimeSeriesSummary : []);

    if (!Array.isArray(timeseries) || timeseries.length === 0) return [];

    return timeseries.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      }),
      [index]: parseFloat(item.value?.toFixed(2) || 0),
      rawDate: item.date,
      status: item.status || "Unknown",
    }));
  }, [indexTimeSeriesSummary, index]);

  const summaryData = useMemo(() => {
    const summary =
      indexTimeSeriesSummary?.data?.summary ||
      indexTimeSeriesSummary?.summary ||
      {};

    const timestamp = indexTimeSeriesSummary?.timestamp || null;
    const { min = 0, mean = 0, max = 0 } = summary;

    let change = 0;

    if (chartData.length >= 2) {
      const lastValue = chartData[chartData.length - 1]?.[index] || 0;
      const prevValue = chartData[chartData.length - 2]?.[index] || 0;
      change = lastValue - prevValue;
    }

    return { min, mean, max, timestamp, change };
  }, [indexTimeSeriesSummary, chartData, index]);

  const handleIndexChange = useCallback((e) => setIndex(e.target.value), []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleMouseDown = (e) => {
      isDragging.current = true;
      startX.current = e.pageX - el.offsetLeft;
      scrollLeft.current = el.scrollLeft;
      el.style.cursor = "grabbing";
    };

    const stopDragging = () => {
      isDragging.current = false;
      el.style.cursor = "grab";
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;

      e.preventDefault();

      const x = e.pageX - el.offsetLeft;
      const walk = x - startX.current;
      el.scrollLeft = scrollLeft.current - walk;
    };

    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mouseleave", stopDragging);
    el.addEventListener("mouseup", stopDragging);
    el.addEventListener("mousemove", handleMouseMove);

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mouseleave", stopDragging);
      el.removeEventListener("mouseup", stopDragging);
      el.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const hasData = chartData.length > 0;

  const changeDisplay =
    summaryData.change >= 0
      ? `+${summaryData.change.toFixed(2)}`
      : summaryData.change.toFixed(2);

  const isPositive = summaryData.change >= 0;

  if (!selectedField) {
    return (
      <div className="w-full rounded-2xl bg-gradient-to-br from-[#173A2A] via-[#1B3F2E] to-[#10271D] p-5 text-white shadow-xl">
        <h2 className="mb-4 text-2xl font-extrabold text-[#48A36D]">
          NDVI
        </h2>

        <div className="flex h-[220px] items-center justify-center rounded-xl bg-[#173828]/70 text-center">
          <div>
            <p className="text-sm font-semibold text-white">
              No field selected
            </p>
            <p className="mt-1 text-xs text-white/55">
              Select a field to view vegetation index data
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#173A2A] via-[#1B3F2E] to-[#10271D] px-4 py-4 text-white shadow-xl">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#48A36D]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-[#0D6B45]/20 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-4 lg:flex-row">
        <div className="w-full lg:w-[34%]">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                Vegetation Index
              </p>

              <h2 className="mt-1 text-4xl font-extrabold leading-none text-[#48A36D]">
                {index}
              </h2>
            </div>

            <select
              value={index}
              onChange={handleIndexChange}
              className="rounded-xl bg-[#1F4D38]/90 px-3 py-2 text-xs font-semibold text-white outline-none transition focus:bg-[#214A37]"
            >
              <option value="NDVI">NDVI</option>
              <option value="EVI">EVI</option>
              <option value="SAVI">SAVI</option>
              <option value="SUCROSE">SUCROSE</option>
            </select>
          </div>

          <div className="mb-4 rounded-2xl bg-[#1B3F2E]/90 p-4 backdrop-blur">
            <div
              className={`mb-2 inline-flex rounded-full px-3 py-1 text-sm font-bold ${
                isPositive
                  ? "bg-[#48A36D]/15 text-[#48A36D]"
                  : "bg-red-500/15 text-red-300"
              }`}
            >
              {isLoading ? "..." : changeDisplay}
            </div>

            <p className="text-xs text-white/55">
              {summaryData.timestamp
                ? `Last Update ${getDaysAgo(summaryData.timestamp)} days Ago`
                : "Last Update N/A"}
            </p>

            <p className="mt-2 truncate text-xs font-medium text-white/70">
              Field:{" "}
              <span className="text-white">
                {selectedField?.fieldName ||
                  selectedField?.farmName ||
                  "Unknown"}
              </span>
            </p>
          </div>

          {hasData && (
            <div className="grid grid-cols-3 gap-2">
              {[
                ["Min", summaryData.min],
                ["Mean", summaryData.mean],
                ["Max", summaryData.max],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl bg-[#214A37] px-2 py-3 text-center"
                >
                  <p className="text-[10px] uppercase tracking-wide text-white/45">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-[#48A36D]">
                    {value?.toFixed(2) || "N/A"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full lg:w-[66%]">
          <div className="relative rounded-2xl bg-[#173828]/70 p-3">
            {isLoading ? (
              <div className="flex h-[230px] items-center justify-center">
                <IndexChartLoader message={`Loading ${index} data...`} />
              </div>
            ) : !hasData ? (
              <div className="flex h-[230px] items-center justify-center text-center">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {error ? "Failed to load data" : `No ${index} data available`}
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    {error ? error : "Try selecting a different field"}
                  </p>
                </div>
              </div>
            ) : (
              <div
                ref={scrollRef}
                className="no-scrollbar cursor-grab overflow-x-auto active:cursor-grabbing"
              >
                <div style={{ minWidth: Math.max(chartData.length * 42, 540) }}>
                  <ResponsiveContainer width="100%" height={230}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 22, right: 28, left: 0, bottom: 4 }}
                    >
                      <CartesianGrid
                        stroke="rgba(255,255,255,0.09)"
                        strokeDasharray="4 4"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.55)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        interval={Math.floor(chartData.length / 8)}
                      />

                      <YAxis
                        stroke="rgba(255,255,255,0.55)"
                        fontSize={11}
                        domain={[0, 1]}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.toFixed(1)}
                      />

                      <Tooltip
                        cursor={{
                          stroke: THEME.primaryLight,
                          strokeWidth: 1,
                          strokeDasharray: "4 4",
                        }}
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;

                          const point = payload[0]?.payload;
                          const value = payload[0]?.value;

                          return (
                            <div className="rounded-xl bg-[#10271D]/95 px-3 py-2 text-xs text-white shadow-xl backdrop-blur">
                              <div className="mb-1 font-bold text-[#48A36D]">
                                {label}
                              </div>
                              <div>
                                {index}:{" "}
                                <span className="font-bold">
                                  {Number(value).toFixed(3)}
                                </span>
                              </div>
                              <div className="mt-1 text-white/60">
                                Status: {point?.status || "Unknown"}
                              </div>
                            </div>
                          );
                        }}
                      />

                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{
                          paddingBottom: 10,
                          fontSize: 12,
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey={index}
                        stroke={THEME.primaryLight}
                        strokeWidth={3}
                        dot={{
                          r: 3,
                          fill: THEME.primaryLight,
                          stroke: THEME.chart,
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 6,
                          fill: THEME.primaryLight,
                          stroke: "#ffffff",
                          strokeWidth: 2,
                        }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {hasData && (
              <button
                type="button"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#214A37] text-white transition hover:bg-[#48A36D] hover:text-[#10271D]"
                title="Download data"
              >
                <MdDownload className="text-lg" />
              </button>
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
            {[
              [
                `Low ${index} Areas`,
                "Check irrigation leaks, clogged drippers, or uneven fertilizer distribution.",
              ],
              [
                `Sudden ${index} Drops`,
                "Investigate pest outbreaks or extreme weather events like hailstorms or drought.",
              ],
              [
                `Consistently Low ${index}`,
                "May indicate soil fertility issues. Conduct soil tests for corrective measures.",
              ],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl bg-[#1F4D38] p-3">
                <p className="mb-1 text-xs font-bold text-[#48A36D]">
                  {title}
                </p>
                <p className="text-[11px] leading-relaxed text-white/75">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NDVIChartCard;