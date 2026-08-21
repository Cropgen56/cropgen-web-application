import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { message } from "antd";
import {
  AlertTriangle,
  CheckCircle2,
  Leaf,
  Loader2,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import {
  CROP_CONFIDENCE_HIGH,
  CROP_CONFIDENCE_MIN,
  classifyCrop,
  cropConfidenceScore,
  cropDisplayName,
  detectDisease,
  fetchSymptomsControlSafe,
  getDiseaseApiErrorMessage,
  getDiseaseMetadata,
  parseDiseaseMetadata,
  isDiseaseDetectionCrop,
  isLeafGateAccepted,
  leafRejectionMessage,
  normalizeCropKey,
  parseLeafRejection,
  runLeafGate,
} from "../../../api/diseaseDetectionApi";
import CropDetails from "../cropdetails/CropDetails";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const UploadCropImage = ({ selectedField = null }) => {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [stepLabel, setStepLabel] = useState("");
  const [allCrops, setAllCrops] = useState([]);
  const [cropDisplay, setCropDisplay] = useState({});
  const [diseaseCrops, setDiseaseCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [cropResult, setCropResult] = useState(null);
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [symptomsResult, setSymptomsResult] = useState(null);
  const [error, setError] = useState("");
  const [needsCropSelection, setNeedsCropSelection] = useState(false);
  const [cropConfirmed, setCropConfirmed] = useState(false);
  const [cropHighConfidence, setCropHighConfidence] = useState(false);

  const fieldCropKey = useMemo(
    () => normalizeCropKey(selectedField?.cropName || ""),
    [selectedField?.cropName],
  );

  useEffect(() => {
    let cancelled = false;
    getDiseaseMetadata()
      .then((meta) => {
        if (cancelled) return;
        setAllCrops(meta.allCrops);
        setCropDisplay(meta.display);
        setDiseaseCrops(meta.diseaseCrops);
      })
      .catch(() => {
        if (!cancelled) {
          const fallback = parseDiseaseMetadata({});
          setAllCrops(fallback.allCrops);
          setCropDisplay(fallback.display);
          setDiseaseCrops(fallback.diseaseCrops);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const resetResults = useCallback(() => {
    setCropResult(null);
    setDiseaseResult(null);
    setSymptomsResult(null);
    setError("");
    setStepLabel("");
    setNeedsCropSelection(false);
    setCropConfirmed(false);
    setCropHighConfidence(false);
  }, []);

  const clearAll = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    resetResults();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [resetResults]);

  const assignFile = useCallback(
    (nextFile) => {
      if (!nextFile) return;
      if (
        nextFile.type &&
        !ACCEPTED_TYPES.includes(nextFile.type) &&
        !nextFile.type.startsWith("image/")
      ) {
        message.error("Please upload a valid image file");
        return;
      }
      resetResults();
      setFile(nextFile);
      setPreviewUrl(URL.createObjectURL(nextFile));
    },
    [resetResults],
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      const dropped = event.dataTransfer?.files?.[0];
      if (dropped) assignFile(dropped);
    },
    [assignFile],
  );

  const runPhase2 = useCallback(
    async (cropKey) => {
      const label = cropDisplayName(cropKey, cropDisplay);
      setCropConfirmed(true);
      setNeedsCropSelection(false);

      if (!isDiseaseDetectionCrop(cropKey, diseaseCrops)) {
        setError(
          `Crop “${label}” was detected, but disease detection is not available for it yet. Try another leaf photo or pick a supported crop.`,
        );
        message.warning("Disease model does not support this crop yet");
        return;
      }

      setStepLabel("Detecting disease…");
      const diseaseRes = await detectDisease(file, cropKey);
      setDiseaseResult(diseaseRes);

      setStepLabel("Loading symptoms & treatment…");
      const symptoms = await fetchSymptomsControlSafe(
        cropKey,
        diseaseRes,
        "en",
      );
      setSymptomsResult(symptoms);

      message.success("Disease analysis complete");
    },
    [cropDisplay, diseaseCrops, file],
  );

  const runFullPipeline = useCallback(async () => {
    if (!file) {
      message.warning("Please select a leaf image first");
      return;
    }

    setAnalyzing(true);
    setError("");
    setCropResult(null);
    setDiseaseResult(null);
    setSymptomsResult(null);
    setNeedsCropSelection(false);
    setCropConfirmed(false);
    setCropHighConfidence(false);

    try {
      setStepLabel("Checking for a leaf…");
      const gate = await runLeafGate(file);
      if (!isLeafGateAccepted(gate)) {
        setError(leafRejectionMessage(parseLeafRejection(gate)));
        return;
      }

      setStepLabel("Classifying crop…");
      let cropRes;
      try {
        cropRes = await classifyCrop(file);
      } catch (err) {
        if (err?.response?.status === 422) {
          setError(leafRejectionMessage(parseLeafRejection(err)));
          return;
        }
        throw err;
      }
      setCropResult(cropRes);

      const predicted = normalizeCropKey(
        cropRes?.predicted_crop || cropRes?.display_name,
      );
      const score = cropConfidenceScore(cropRes?.confidence);
      const detectedCrop = Boolean(predicted) && score >= CROP_CONFIDENCE_MIN;
      setCropHighConfidence(detectedCrop && score >= CROP_CONFIDENCE_HIGH);

      if (!detectedCrop) {
        const fallbackCrop =
          (fieldCropKey && allCrops.includes(fieldCropKey) && fieldCropKey) ||
          "";
        setSelectedCrop(fallbackCrop);
        setNeedsCropSelection(true);
        return;
      }

      setSelectedCrop(predicted);
      await runPhase2(predicted);
    } catch (err) {
      const msg = getDiseaseApiErrorMessage(err);
      setError(msg);
      message.error(msg);
    } finally {
      setAnalyzing(false);
      setStepLabel("");
    }
  }, [file, runPhase2, fieldCropKey, allCrops]);

  const continueWithSelectedCrop = useCallback(async () => {
    if (!file) {
      message.warning("Please select a leaf image first");
      return;
    }
    if (!selectedCrop) {
      message.warning("Select a crop to continue, or retry with a clearer photo.");
      return;
    }

    setAnalyzing(true);
    setError("");
    try {
      await runPhase2(selectedCrop);
    } catch (err) {
      const msg = getDiseaseApiErrorMessage(err);
      setError(msg);
      message.error(msg);
    } finally {
      setAnalyzing(false);
      setStepLabel("");
    }
  }, [file, selectedCrop, runPhase2]);

  const cropLabel = cropConfirmed
    ? cropDisplayName(selectedCrop || cropResult?.predicted_crop, cropDisplay)
    : null;

  const showResults = Boolean(cropConfirmed || diseaseResult);
  const showLeafOrError = Boolean(error && !showResults && !needsCropSelection);

  return (
    <div className="flex h-full min-h-[calc(100vh-1rem)] w-full flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white sm:text-2xl">
            Disease Detection
          </h1>
          <p className="mt-1 text-sm text-white/70">
            Upload a clear leaf photo. We’ll classify the crop, detect disease,
            and suggest control measures.
          </p>
        </div>
        {selectedField?.cropName ? (
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
            <span className="text-white/50">Field crop: </span>
            {selectedField.cropName}
          </div>
        ) : null}
      </div>

      <div className="grid flex-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#344e41]/40 p-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`relative flex min-h-[280px] flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition ${
              isDragging
                ? "border-[#00b2eb] bg-[#00b2eb]/10"
                : "border-white/20 bg-black/10"
            }`}
          >
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Leaf preview"
                  className="max-h-[320px] w-full rounded-lg object-contain"
                />
                <button
                  type="button"
                  onClick={clearAll}
                  className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <Upload className="mb-3 text-white/50" size={40} />
                <p className="text-center text-sm text-white/80">
                  Drag and drop a leaf image, or
                  <button
                    type="button"
                    className="mx-1 font-semibold text-[#00b2eb] underline-offset-2 hover:underline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    click here
                  </button>
                  to select from your device
                </p>
                <p className="mt-2 text-xs text-white/40">JPG, PNG, or WEBP</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => assignFile(e.target.files?.[0])}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-white/60">
              {needsCropSelection
                ? "Select crop to continue"
                : "Crop for disease detection"}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className={`rounded-lg border px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[#00b2eb]/40 ${
                needsCropSelection
                  ? "border-amber-300 bg-[#344e41]"
                  : "border-white/15 bg-[#344e41]"
              }`}
            >
              <option value="">
                {needsCropSelection ? "Select crop" : "Auto-detect from image"}
              </option>
              {allCrops.map((crop) => (
                <option key={crop} value={crop}>
                  {cropDisplayName(crop, cropDisplay)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {!previewUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#344e41] hover:bg-gray-100"
              >
                <Upload size={16} />
                Choose image
              </button>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/5"
              >
                <RefreshCw size={16} />
                Change image
              </button>
            )}
            <button
              type="button"
              disabled={!file || analyzing || (needsCropSelection && !selectedCrop)}
              onClick={
                needsCropSelection ? continueWithSelectedCrop : runFullPipeline
              }
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#00b2eb] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {stepLabel || "Analyzing…"}
                </>
              ) : (
                <>
                  <Leaf size={16} />
                  {needsCropSelection ? "Continue" : "Analyze leaf"}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex min-h-[280px] flex-col rounded-xl border border-white/10 bg-white p-4 text-[#344e41]">
          {analyzing && !showResults ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-[#344e41]/70">
              <Loader2 size={36} className="animate-spin text-[#00b2eb]" />
              <p className="text-sm font-medium">{stepLabel || "Analyzing…"}</p>
            </div>
          ) : needsCropSelection && !showResults ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
              <AlertTriangle className="text-amber-500" size={36} />
              <p className="text-sm font-medium text-[#344e41]">
                Could not detect the crop confidently. Retry with a clearer
                photo or select the crop, then continue.
              </p>
              <button
                type="button"
                onClick={runFullPipeline}
                className="rounded-lg border border-[#344e41]/20 px-4 py-2 text-sm font-semibold text-[#344e41]"
              >
                Try again
              </button>
            </div>
          ) : showLeafOrError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
              <AlertTriangle className="text-amber-500" size={36} />
              <p className="text-sm font-medium text-[#344e41]">{error}</p>
              <button
                type="button"
                onClick={runFullPipeline}
                className="rounded-lg bg-[#344e41] px-4 py-2 text-sm font-semibold text-white"
              >
                Try again
              </button>
            </div>
          ) : showResults ? (
            <CropDetails
              previewUrl={previewUrl}
              cropLabel={cropLabel}
              cropHighConfidence={cropHighConfidence}
              diseaseName={diseaseResult?.predicted_disease}
              symptomsResult={symptomsResult}
              error={error}
              onClose={clearAll}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-[#344e41]/50">
              <CheckCircle2 size={36} className="opacity-40" />
              <p className="text-sm">
                Results will appear here after you analyze a leaf photo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadCropImage;
