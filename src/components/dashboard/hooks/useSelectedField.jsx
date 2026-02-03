import { useState, useEffect, useMemo, useCallback } from "react";

const SELECTED_FIELD_KEY = "selectedFieldId";

export const useSelectedField = (fields) => {
  const [selectedField, setSelectedFieldState] = useState(
    () => localStorage.getItem(SELECTED_FIELD_KEY) || "",
  );

  const [prevLength, setPrevLength] = useState(0);

  const selectedFieldDetails = useMemo(
    () => fields.find((f) => f?._id === selectedField) ?? null,
    [fields, selectedField],
  );

  useEffect(() => {
    if (!fields?.length) {
      setPrevLength(0);
      return;
    }

    const newest = [...fields].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (tb - ta !== 0) return tb - ta;
      return (b._id || "").localeCompare(a._id || "");
    })[0];

    const shouldAutoSelect =
      (!selectedField && newest) || (fields.length > prevLength && newest);

    if (shouldAutoSelect && newest?._id) {
      setSelectedFieldState(newest._id);
      localStorage.setItem(SELECTED_FIELD_KEY, newest._id);
    }

    setPrevLength(fields.length);
  }, [fields, selectedField, prevLength]);

  const handleFieldSelection = useCallback((id) => {
    if (!id) return;
    setSelectedFieldState(id);
    localStorage.setItem(SELECTED_FIELD_KEY, id);
  }, []);

  return {
    selectedField,
    selectedFieldDetails,
    handleFieldSelection,
  };
};
