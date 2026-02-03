import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAOIs, createAOI } from "../../../redux/slices/weatherSlice";

// Helper – makes sure polygon is closed
const formatCoordinates = (points) => {
  if (!Array.isArray(points) || points.length < 3) return [];

  const coords = points.map((p) => [Number(p.lng), Number(p.lat)]);

  const first = coords[0];
  const last = coords[coords.length - 1];

  // Close the polygon if not already closed
  if (first[0] !== last[0] || first[1] !== last[1]) {
    coords.push(first);
  }

  return coords;
};

/**
 * Manages AOI (Area of Interest) for a selected farm field.
 *
 * Behavior:
 * - Fetches all AOIs once on mount
 * - Checks if AOI with name = field._id already exists
 * - If missing → automatically creates it
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
  const aoisFetchStatus = useSelector((state) => state?.weather?.aoisStatus); // optional – if you have it

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
    return aois.find((a) => a.name === fieldId);
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

    const coords = formatCoordinates(selectedField?.field || []);

    if (coords.length < 4) {
      // at least 3 + closing point
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
        name: fieldId, // we use field _id as AOI name
        geometry: {
          type: "Polygon",
          coordinates: [coords],
        },
      }),
    )
      .unwrap()
      .then((createdAoi) => {
        // Success – new AOI created
        setAoiId(createdAoi.id);
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
