import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CopyPlus,
  Hand,
  Layers,
  Maximize2,
  PencilLine,
  Redo2,
  RotateCcw,
  Trash2,
} from "lucide-react";
import ZoningMap from "./ZoningMap";
import {
  buildDashboardStats,
  calculateZoneAreaHa,
  calculateZoneCentroid,
  DEFAULT_MAP_CENTER,
  formatArea,
  getZoneColor,
  scaleZone,
  translateZone,
} from "./zoningUtils";

const cardClass = "rounded-2xl border border-slate-100 bg-white p-4 shadow-sm";

const cloneZones = (zones) => JSON.parse(JSON.stringify(zones));

const ZoneEditorView = ({
  zones,
  setZones,
  selectedZoneId,
  setSelectedZoneId,
  fieldBoundary,
}) => {
  const [showLayer, setShowLayer] = useState(true);
  const [activeTool, setActiveTool] = useState("draw");
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const mapWrapperRef = useRef(null);

  const selectedZone = useMemo(
    () => zones.find((zone) => zone.id === selectedZoneId) || zones[0],
    [zones, selectedZoneId],
  );

  const stats = useMemo(() => buildDashboardStats(zones), [zones]);
  const selectedArea = useMemo(() => {
    if (!selectedZone?.coordinates?.length) return 0;
    return calculateZoneAreaHa(selectedZone.coordinates);
  }, [selectedZone?.coordinates]);

  const mapCenter = useMemo(() => {
    if (fieldBoundary?.length >= 3) return calculateZoneCentroid(fieldBoundary);
    if (selectedZone?.coordinates?.length) return selectedZone.coordinates[0];
    return DEFAULT_MAP_CENTER;
  }, [fieldBoundary, selectedZone?.coordinates]);

  if (!selectedZone?.coordinates?.length) {
    return (
      <div className={`${cardClass} text-sm text-slate-600`}>
        Add or select a field with a drawn boundary to edit zones inside the farm polygon.
      </div>
    );
  }

  const commitZones = (nextZones) => {
    setHistory((prev) => [...prev, cloneZones(zones)]);
    setFuture([]);
    setZones(nextZones);
    setLastUpdated(new Date());
  };

  const handleDrawZone = () => {
    const seed = zones[zones.length - 1] || selectedZone;
    const newId = `zone-${Date.now()}`;
    const newZone = {
      ...seed,
      id: newId,
      name: `Zone ${String.fromCharCode(65 + zones.length)}`,
      coordinates: seed.coordinates.map(([lat, lng]) => [lat + 0.0015, lng + 0.0012]),
    };

    commitZones([...zones, newZone]);
    setSelectedZoneId(newId);
  };

  const handleDeleteZone = () => {
    if (zones.length <= 1) return;
    const nextZones = zones.filter((zone) => zone.id !== selectedZone.id);
    commitZones(nextZones);
    setSelectedZoneId(nextZones[0].id);
  };

  const handleDuplicateZone = () => {
    const duplicate = {
      ...selectedZone,
      id: `zone-${Date.now()}`,
      name: `${selectedZone.name} Copy`,
      coordinates: selectedZone.coordinates.map(([lat, lng]) => [lat + 0.0009, lng + 0.0009]),
    };
    commitZones([...zones, duplicate]);
    setSelectedZoneId(duplicate.id);
  };

  const handleMoveZone = (latShift, lngShift) => {
    const nextZones = zones.map((zone) =>
      zone.id === selectedZone.id ? translateZone(zone, latShift, lngShift) : zone,
    );
    commitZones(nextZones);
  };

  const handleResizeZone = (scaleFactor) => {
    const nextZones = zones.map((zone) =>
      zone.id === selectedZone.id ? scaleZone(zone, scaleFactor) : zone,
    );
    commitZones(nextZones);
  };

  const handleUndo = () => {
    if (!history.length) return;
    const prevState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setFuture((prev) => [...prev, cloneZones(zones)]);
    setZones(prevState);
  };

  const handleRedo = () => {
    if (!future.length) return;
    const nextState = future[future.length - 1];
    setFuture((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, cloneZones(zones)]);
    setZones(nextState);
  };

  const updateSelectedZone = (updates) => {
    const nextZones = zones.map((zone) =>
      zone.id === selectedZone.id ? { ...zone, ...updates } : zone,
    );
    commitZones(nextZones);
  };

  const handleFullscreen = async () => {
    const el = mapWrapperRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await el.requestFullscreen();
  };

  const TOOL_BUTTONS = [
    {
      key: "draw",
      icon: PencilLine,
      onClick: handleDrawZone,
      label: "Draw Zone",
    },
    {
      key: "move",
      icon: Hand,
      onClick: () => setActiveTool("move"),
      label: "Move Zone",
    },
    { key: "delete", icon: Trash2, onClick: handleDeleteZone, label: "Delete" },
    { key: "undo", icon: RotateCcw, onClick: handleUndo, label: "Undo" },
    { key: "redo", icon: Redo2, onClick: handleRedo, label: "Redo" },
    {
      key: "layer",
      icon: Layers,
      onClick: () => setShowLayer((prev) => !prev),
      label: "Toggle Layer",
    },
    {
      key: "fullscreen",
      icon: Maximize2,
      onClick: handleFullscreen,
      label: "Fullscreen",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <section className="grid gap-4 xl:grid-cols-3">
        <div className={`${cardClass} xl:col-span-2`}>
          <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Create / Edit Zones
              </h1>
              <p className="text-sm text-slate-500">
                Draw, edit, resize, and manage smart farm zones.
              </p>
            </div>
            <div className="flex gap-2">
              {TOOL_BUTTONS.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.key;
                return (
                  <button
                    key={tool.key}
                    onClick={tool.onClick}
                    className={`rounded-xl border p-2 ${
                      isActive
                        ? "border-emerald-700 bg-emerald-700 text-white"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                    title={tool.label}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          </header>

          <div ref={mapWrapperRef}>
            <ZoningMap
              zones={zones}
              center={mapCenter}
              fieldBoundary={fieldBoundary}
              selectedZoneId={selectedZone.id}
              onSelectZone={setSelectedZoneId}
              showLayer={showLayer}
              className="h-[520px]"
            />
          </div>

          {activeTool === "move" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => handleMoveZone(0.0008, 0)}
                className="rounded-xl border border-slate-200 px-3 py-1 text-sm"
              >
                Move North
              </button>
              <button
                onClick={() => handleMoveZone(-0.0008, 0)}
                className="rounded-xl border border-slate-200 px-3 py-1 text-sm"
              >
                Move South
              </button>
              <button
                onClick={() => handleMoveZone(0, 0.0008)}
                className="rounded-xl border border-slate-200 px-3 py-1 text-sm"
              >
                Move East
              </button>
              <button
                onClick={() => handleMoveZone(0, -0.0008)}
                className="rounded-xl border border-slate-200 px-3 py-1 text-sm"
              >
                Move West
              </button>
              <button
                onClick={() => handleResizeZone(1.05)}
                className="rounded-xl border border-slate-200 px-3 py-1 text-sm"
              >
                Resize +
              </button>
              <button
                onClick={() => handleResizeZone(0.95)}
                className="rounded-xl border border-slate-200 px-3 py-1 text-sm"
              >
                Resize -
              </button>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className={cardClass}>
            <h2 className="mb-3 text-base font-semibold text-slate-900">
              Zone Properties
            </h2>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm text-slate-600">
                  Zone Name
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={selectedZone.name}
                  onChange={(e) => updateSelectedZone({ name: e.target.value })}
                />
              </label>

              <div>
                <p className="mb-2 text-sm text-slate-600">
                  Color Overlay
                </p>
                <div className="flex gap-2">
                  {["high", "medium", "low", "critical"].map((level) => (
                    <button
                      key={level}
                      onClick={() => updateSelectedZone({ productivityLevel: level })}
                      className="h-7 w-7 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: getZoneColor(level) }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Area Calculation</span>
                <span className="font-semibold text-slate-900">{formatArea(selectedArea)}</span>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-600">Product Dose</span>
                  <span className="font-semibold text-emerald-700">
                    {selectedZone.productDoseKgHa != null
                      ? `${selectedZone.productDoseKgHa} kg/ha`
                      : "—"}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {selectedZone.product
                    ? `${selectedZone.product} · ${selectedZone.healthStatus || selectedZone.zoneLabel || ""}`
                    : selectedZone.healthStatus || "From VRA analysis"}
                </p>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-600">
                  Priority
                </span>
                <select
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={selectedZone.priority || "Medium Priority"}
                  onChange={(e) => updateSelectedZone({ priority: e.target.value })}
                >
                  <option value="High Priority">High Priority</option>
                  <option value="Medium Priority">Medium Priority</option>
                  <option value="Low Priority">Low Priority</option>
                  <option value="Critical Priority">Critical Priority</option>
                </select>
              </label>

              <button className="w-full rounded-xl bg-emerald-700 px-3 py-2 text-sm font-medium text-white">
                Apply Changes
              </button>
              <button
                onClick={handleDuplicateZone}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
              >
                <CopyPlus size={16} />
                Duplicate Zone
              </button>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="mb-3 text-base font-semibold text-slate-900">
              Zone Guidance
            </h3>
            <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              {selectedZone.suggestedAction ||
                "No guidance available for this zone yet."}
            </p>
          </div>
        </aside>
      </section>

      <section className={`${cardClass} flex flex-wrap items-center justify-between gap-3 text-sm`}>
        <div>
          <span className="text-slate-500">Total Zones</span>{" "}
          <strong className="text-slate-900">{stats.totalZones}</strong>
        </div>
        <div>
          <span className="text-slate-500">Covered Area</span>{" "}
          <strong className="text-slate-900">{formatArea(stats.totalAreaHa)}</strong>
        </div>
        <div>
          <span className="text-slate-500">Last Updated</span>{" "}
          <strong className="text-slate-900">{lastUpdated.toLocaleString()}</strong>
        </div>
      </section>
    </motion.div>
  );
};

export default ZoneEditorView;
