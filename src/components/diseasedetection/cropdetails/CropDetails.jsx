import React from "react";
import { AlertTriangle, X } from "lucide-react";

const CropDetails = ({
  previewUrl,
  cropLabel,
  cropHighConfidence = false,
  diseaseName,
  symptomsResult,
  error,
  onClose,
}) => {
  const hasSymptoms = Boolean(symptomsResult?.symptoms?.length);
  const hasControl = Boolean(symptomsResult?.control?.length);
  const symptomsUnavailable =
    Boolean(diseaseName) && !hasSymptoms && !hasControl;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#344e41]">
            Analysis result
          </h2>
          {cropHighConfidence ? (
            <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
              High confidence
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-[#344e41]/60 hover:bg-black/5 hover:text-[#344e41]"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Leaf preview"
          className="h-36 w-full rounded-lg border border-[#e5e7eb] object-cover"
        />
      ) : null}

      {error ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-[#5a7c6b]/10 px-3 py-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[#344e41]/50">
            Crop Name
          </p>
          <p className="mt-1 text-base font-semibold text-[#344e41]">
            {cropLabel || "—"}
          </p>
        </div>

        <div className="rounded-lg bg-[#5a7c6b]/10 px-3 py-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[#344e41]/50">
            Disease
          </p>
          <p className="mt-1 text-base font-semibold text-[#344e41]">
            {diseaseName || "—"}
          </p>
        </div>
      </div>

      {hasSymptoms ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-[#344e41]">
            Symptoms
            {symptomsResult.disease_hi ? ` · ${symptomsResult.disease_hi}` : ""}
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[#344e41]/80">
            {symptomsResult.symptoms.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasControl ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-[#344e41]">
            Treatment
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[#344e41]/80">
            {symptomsResult.control.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {symptomsUnavailable ? (
        <p className="text-sm text-[#344e41]/60">
          Symptoms and treatment notes are not available for this disease yet.
        </p>
      ) : null}
    </div>
  );
};

export default CropDetails;
