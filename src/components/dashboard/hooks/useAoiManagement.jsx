import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAOIs, createAOI } from "../../../redux/slices/weatherSlice";
import { findAoiForField, toAoiPolygon } from "../../../utils/farmGeometry";

/**
 * Manages AOI (Area of Interest) for a selected farm field.
 *
 * Behavior:
 * - Fetches all AOIs once on mount
 * - Checks if AOI with name = field._id (or field._id-wx) already exists
 * - If missing → creates a 1.5 ha centroid sample (never the full polygon)
 * - Returns:
 *   - aoiId          → string | null
 *   - isLoading      → true while fetching AOIs
 *   - isCreating     → true while creation is in progress
 *   - error          → string | null
 *   - aoisInitialized → boolean (fetch completed)
 */
export const useAoiManagement = (selectedField) => {
  const dispatch = useDispatch();

  // ─── State ────────────────────────────────────────────────
  const [aoiId, setAoiId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  // ─── Redux selectors ──────────────────────────────────────
  const aois = useSelector((state) => state?.weather?.aois ?? []);

  // Refs for deduplication
  const creationInProgress = useRef(new Set());
  const creationAttempted = useRef(new Set());
  const hasFetched = useRef(false);

  // ─── Fetch AOIs once ──────────────────────────────────────
  useEffect(() => {
    if (hasFetched.current) return;

    setIsLoading(true);
    setError(null);

    dispatch(fetchAOIs())
      .unwrap()
      .then(() => {
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch AOIs:", err);
        setError("Failed to load areas of interest");
        setIsLoading(false);
      })
      .finally(() => {
        hasFetched.current = true;
      });
  }, [dispatch]);

  // ─── Find matching AOI or decide to create ────────────────
  const fieldId = selectedField?._id;

  const matchingAoi = useMemo(() => {
    if (!fieldId || !aois.length) return null;
    return findAoiForField(aois, fieldId);
  }, [aois, fieldId]);

  // Update aoiId when we find match
  useEffect(() => {
    if (matchingAoi?.id) {
      setAoiId(matchingAoi.id);
      setIsCreating(false);
      setError(null);
    }
  }, [matchingAoi]);

  // ─── Auto-create AOI when missing ─────────────────────────
  useEffect(() => {
    // Skip if:
    // - no field selected
    // - still loading AOIs
    // - already have matching AOI
    // - already tried or in progress
    if (
      !fieldId ||
      isLoading ||
      matchingAoi ||
      creationAttempted.current.has(fieldId) ||
      creationInProgress.current.has(fieldId)
    ) {
      return;
    }

    let aoiGeometry;
    try {
      aoiGeometry = toAoiPolygon(selectedField?.field || []);
    } catch {
      setError("Invalid field geometry – cannot create AOI");
      creationAttempted.current.add(fieldId);
      return;
    }

    setIsCreating(true);
    setError(null);

    creationInProgress.current.add(fieldId);
    creationAttempted.current.add(fieldId);

    dispatch(
      createAOI({
        name: fieldId,
        geometry: aoiGeometry,
      }),
    )
      .unwrap()
      .then((createdAoi) => {
        // Success – new AOI created
        setAoiId(createdAoi?.id || createdAoi);
        setIsCreating(false);
      })
      .catch((err) => {
        console.error("AOI creation failed:", err);
        setError("Failed to create area of interest");
        setIsCreating(false);
      })
      .finally(() => {
        // Always clean up – but keep attempted so we don't retry endlessly
        setTimeout(() => {
          creationInProgress.current.delete(fieldId);
        }, 2000);
      });
  }, [fieldId, matchingAoi, isLoading, selectedField?.field, dispatch]);

  return {
    aoiId, // ← most important: string | null
    isLoading, // AOIs are still being fetched
    isCreating, // Creation request is in flight
    error, // Any error message
    aoisInitialized: hasFetched.current && !isLoading,
  };
};
