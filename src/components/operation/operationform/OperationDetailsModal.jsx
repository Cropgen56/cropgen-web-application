import React, { useEffect, useMemo, useState } from "react";
import { Modal, message } from "antd";
import moment from "moment";
import { useDispatch } from "react-redux";
import {
  formatOperationType,
  getOperationDisplayTitle,
  getOperationTypeColor,
  getProgressStyle,
  formatAdvisoryActivityType,
} from "../operationUtils";
import {
  getOperationTypeFieldConfig,
  FIELD_KEYS,
} from "./operationFieldConfig";
import { updateOperation } from "../../../redux/slices/operationSlice";
import { updateAdvisoryActivityProgress } from "../../../redux/slices/smartAdvisorySlice";
import {
  X,
  Calendar,
  ClipboardList,
  Pencil,
  Trash2,
  User,
  FlaskConical,
  Users,
  IndianRupee,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Circle,
  Loader2,
  PlayCircle,
} from "lucide-react";
import "../operations.css";

const PROGRESS_OPTIONS = [
  {
    value: "started",
    label: "Started",
    icon: Circle,
    activeClass: "bg-sky-100 text-sky-800 border-sky-300 ring-1 ring-sky-200",
    idleClass: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-sky-50",
  },
  {
    value: "in_progress",
    label: "In Progress",
    icon: PlayCircle,
    activeClass: "bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-200",
    idleClass: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-amber-50",
  },
  {
    value: "completed",
    label: "Completed",
    icon: CheckCircle2,
    activeClass:
      "bg-emerald-100 text-emerald-900 border-emerald-300 ring-1 ring-emerald-200",
    idleClass: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-emerald-50",
  },
];

const DetailRow = ({ icon: Icon, label, value, className = "" }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className={`flex gap-3 py-3 border-b border-gray-100 last:border-0 ${className}`}>
      <div className="shrink-0 w-9 h-9 rounded-lg bg-ember-card flex items-center justify-center text-ember-sidebar">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-sm text-gray-800 font-medium break-words whitespace-pre-wrap">
          {value}
        </p>
      </div>
    </div>
  );
};

const OperationDetailsModal = ({
  visible,
  onClose,
  operation,
  fieldName,
  onEdit,
  onDelete,
  onProgressUpdated,
}) => {
  const dispatch = useDispatch();
  const [localOp, setLocalOp] = useState(operation || {});
  const [updatingProgress, setUpdatingProgress] = useState(false);

  useEffect(() => {
    if (visible && operation) {
      setLocalOp(operation);
    }
  }, [visible, operation]);

  const op = localOp;
  const typeColor = getOperationTypeColor(op.operationType, op);
  const progressStyle = getProgressStyle(op.progress);
  const title = getOperationDisplayTitle(op);
  const fromAdvisory = op.source === "advisory";
  const progress = op.progress ?? null;

  const fieldLabels = useMemo(() => {
    const config = getOperationTypeFieldConfig(op.operationType);
    const map = {};
    config.fields.forEach((f) => {
      map[f.name] = f.label;
    });
    return map;
  }, [op.operationType]);

  const scheduledAt =
    op.date && op.time
      ? moment(`${op.date} ${op.time}`, "YYYY-MM-DD HH:mm:ss").format(
          "dddd, MMMM D, YYYY · h:mm A"
        )
      : op.operationDate && op.operationTime
        ? moment(
            `${op.operationDate} ${op.operationTime}`,
            "YYYY-MM-DD HH:mm:ss"
          ).format("dddd, MMMM D, YYYY · h:mm A")
        : null;

  const formatComments = (comments) => {
    if (!comments) return null;
    return comments.replace(/^\[Smart Advisory\]\s*/i, "").trim();
  };

  const labourSummary = () => {
    const male = op.labourMale;
    const female = op.labourFemale;
    if (
      (male === undefined || male === null || male === "") &&
      (female === undefined || female === null || female === "")
    ) {
      return null;
    }
    const parts = [];
    if (male != null && male !== "") parts.push(`${male} male`);
    if (female != null && female !== "") parts.push(`${female} female`);
    return parts.join(", ");
  };

  const handleProgressChange = async (newProgress) => {
    if (!op._id || progress === newProgress) return;

    setUpdatingProgress(true);
    try {
      const result = await dispatch(
        updateOperation({
          operationId: op._id,
          operationData: {
            supervisorName: op.supervisorName ?? "",
            operationType: op.operationType,
            progress: newProgress,
            chemicalUsed: op.chemicalUsed,
            chemicalQuantity: op.chemicalQuantity,
            labourMale: op.labourMale,
            labourFemale: op.labourFemale,
            estimatedCost: op.estimatedCost,
            comments: op.comments,
          },
        })
      ).unwrap();

      const updated = result.operation;
      setLocalOp((prev) => ({
        ...prev,
        ...updated,
        progress: newProgress,
        date: prev.date ?? updated.operationDate,
        time: prev.time ?? updated.operationTime,
      }));

      if (
        fromAdvisory &&
        op.advisoryId &&
        op.advisoryActivityType &&
        newProgress
      ) {
        try {
          await dispatch(
            updateAdvisoryActivityProgress({
              advisoryId: op.advisoryId,
              activityType: op.advisoryActivityType,
              progress: newProgress,
            })
          ).unwrap();
        } catch {
          /* advisory sync optional */
        }
      }

      message.success("Status updated");
      onProgressUpdated?.(updated);
    } catch (err) {
      message.error(err?.message || "Failed to update status");
    } finally {
      setUpdatingProgress(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="100%"
      style={{ maxWidth: 520, top: 24, paddingBottom: 0 }}
      closable={false}
      centered={false}
      className="operation-details-modal"
      styles={{ mask: { backdropFilter: "blur(4px)" } }}
    >
      <div
        className="relative px-5 py-5 text-white"
        style={{
          background: `linear-gradient(135deg, ${typeColor.bg} 0%, #344e41 100%)`,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/15 transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-3 pr-10">
          <div className="p-2.5 rounded-xl bg-white/20 shrink-0">
            <ClipboardList size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-0.5">
              Operation Details
            </p>
            <h2 className="text-xl font-bold leading-tight">{title}</h2>
            {fieldName && (
              <p className="text-white/80 text-sm mt-1 truncate">{fieldName}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white capitalize">
            {formatOperationType(op.operationType)}
          </span>
          {fromAdvisory && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-400/30 text-sky-50 border border-sky-300/30">
              <Sparkles size={12} />
              Smart Advisory
              {op.advisoryActivityType && (
                <span className="opacity-90">
                  · {formatAdvisoryActivityType(op.advisoryActivityType)}
                </span>
              )}
            </span>
          )}
          {progressStyle ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white">
              {progressStyle.label}
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/70">
              Not set
            </span>
          )}
        </div>

        {scheduledAt && (
          <p className="flex items-center gap-1.5 text-white/75 text-xs mt-3">
            <Calendar size={13} />
            {scheduledAt}
          </p>
        )}
      </div>

      <div className="px-5 py-2 max-h-[50vh] overflow-y-auto">
        {/* Progress tracker */}
        <div className="py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="shrink-0 w-9 h-9 rounded-lg bg-ember-card flex items-center justify-center text-ember-sidebar">
              <ClipboardList size={16} />
            </div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              Progress status
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pl-12">
            {PROGRESS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = progress === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={updatingProgress}
                  onClick={() => handleProgressChange(opt.value)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all disabled:opacity-60 ${
                    isActive ? opt.activeClass : opt.idleClass
                  }`}
                >
                  {updatingProgress && isActive ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Icon size={14} />
                  )}
                  {opt.label}
                </button>
              );
            })}
          </div>
          {!progress && (
            <p className="text-xs text-gray-400 mt-2 pl-12">
              Tap a status to track this operation
            </p>
          )}
        </div>

        <DetailRow
          icon={User}
          label={fieldLabels[FIELD_KEYS.SUPERVISOR] || "Supervisor"}
          value={op.supervisorName}
        />
        <DetailRow
          icon={FlaskConical}
          label={fieldLabels[FIELD_KEYS.CHEMICAL_USED] || "Material Used"}
          value={op.chemicalUsed}
        />
        <DetailRow
          icon={FlaskConical}
          label={fieldLabels[FIELD_KEYS.CHEMICAL_QUANTITY] || "Quantity"}
          value={op.chemicalQuantity}
        />
        <DetailRow icon={Users} label="Labour" value={labourSummary()} />
        <DetailRow
          icon={IndianRupee}
          label={fieldLabels[FIELD_KEYS.ESTIMATED_COST] || "Estimated Cost"}
          value={
            op.estimatedCost != null && op.estimatedCost !== ""
              ? `₹${Number(op.estimatedCost).toLocaleString("en-IN")}`
              : null
          }
        />
        <DetailRow
          icon={MessageSquare}
          label={fromAdvisory ? "Advisory Notes" : "Comments"}
          value={formatComments(op.comments)}
        />

        {op.createdAt && (
          <p className="text-[11px] text-gray-400 py-3 text-center">
            Created {moment(op.createdAt).format("MMM D, YYYY · h:mm A")}
          </p>
        )}
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-2 bg-gray-50/80">
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition"
        >
          <Trash2 size={16} />
          Delete
        </button>
        <div className="flex gap-2 flex-1 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-white transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-ember-sidebar text-white font-semibold text-sm hover:bg-ember-sidebar-hover transition shadow-sm"
          >
            <Pencil size={16} />
            Edit
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OperationDetailsModal;
