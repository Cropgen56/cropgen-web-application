import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSmartAdvisory } from "../redux/slices/smartAdvisorySlice";
import { fieldIsRecentlyCreated } from "../utils/subscriptionAccess";

const POLL_MS = 4000;
const MAX_POLLS = 30;

function advisoryFieldIdOf(advisory) {
  if (!advisory) return null;
  const raw = advisory.farmFieldId?._id ?? advisory.farmFieldId;
  return raw ? String(raw) : null;
}

/**
 * Fetch the latest advisory for a farm. If the farm was just added, keep
 * polling until generation finishes (or ~2 minutes) so the dashboard
 * renders as soon as the backend writes the doc.
 */
export function usePollSmartAdvisory(field, { enabled = true } = {}) {
  const dispatch = useDispatch();
  const fieldId = field?._id ? String(field._id) : null;

  const exists = useSelector((s) => s.smartAdvisory?.exists);
  const loading = useSelector((s) => s.smartAdvisory?.loading);
  const advisory = useSelector((s) => s.smartAdvisory?.advisory);

  const haveAdvisory =
    Boolean(exists && advisory) && advisoryFieldIdOf(advisory) === fieldId;

  const shouldPoll = Boolean(
    enabled && fieldId && fieldIsRecentlyCreated(field) && !haveAdvisory,
  );

  useEffect(() => {
    if (!enabled || !fieldId) return undefined;
    dispatch(fetchSmartAdvisory({ fieldId }));
  }, [dispatch, enabled, fieldId]);

  useEffect(() => {
    if (!shouldPoll) return undefined;

    const timer = setInterval(() => {
      dispatch(fetchSmartAdvisory({ fieldId }));
    }, POLL_MS);
    const stop = setTimeout(() => clearInterval(timer), POLL_MS * MAX_POLLS);

    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [dispatch, shouldPoll, fieldId]);

  const isGenerating = Boolean(
    enabled && fieldId && !haveAdvisory && (shouldPoll || loading),
  );

  return { isGenerating, haveAdvisory };
}
