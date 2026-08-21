import { useCallback, useEffect, useMemo, useState } from "react";

function sortNewestFirst(list) {
  return [...(list || [])].sort((a, b) => {
    const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (tb - ta !== 0) return tb - ta;
    return String(b?._id || "").localeCompare(String(a?._id || ""));
  });
}

/**
 * Keep the selected farm object in sync with Redux `fields`.
 * After subscribe / getFarmFields, plan features update without a remount.
 */
export function useLiveSelectedField(fields, { newestFirst = true } = {}) {
  const [selectedId, setSelectedId] = useState(null);

  const ordered = useMemo(
    () => (newestFirst ? sortNewestFirst(fields) : [...(fields || [])]),
    [fields, newestFirst],
  );

  useEffect(() => {
    if (!ordered.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !ordered.some((f) => f._id === selectedId)) {
      setSelectedId(ordered[0]._id);
    }
  }, [ordered, selectedId]);

  const selectedField = useMemo(
    () => (fields || []).find((f) => f._id === selectedId) || null,
    [fields, selectedId],
  );

  const setSelectedField = useCallback((fieldOrId) => {
    if (!fieldOrId) return;
    const id =
      typeof fieldOrId === "object" ? fieldOrId._id || fieldOrId.id : fieldOrId;
    if (id) setSelectedId(id);
  }, []);

  return { selectedField, setSelectedField };
}
