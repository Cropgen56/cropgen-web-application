import React from "react";
import { Modal } from "antd";
import moment from "moment";
import { getOperationDisplayTitle, getOperationTypeColor, getProgressStyle } from "../operationUtils";
import { X, Plus, Calendar, ChevronRight } from "lucide-react";

const DayOperationsModal = ({
  visible,
  onClose,
  date,
  operations = [],
  fieldName,
  onSelectOperation,
  onAddOperation,
}) => {
  const formattedDate = date
    ? moment(date, "YYYY-MM-DD").format("dddd, MMMM D, YYYY")
    : "";

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="100%"
      style={{ maxWidth: 440, top: 40 }}
      closable={false}
      centered={false}
      className="operation-details-modal"
    >
      <div className="bg-gradient-to-r from-[#344e41] to-[#2b4035] px-5 py-4 text-white relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/15"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <p className="text-xs text-white/60 uppercase tracking-wider font-medium">Day Schedule</p>
        <h2 className="text-lg font-bold flex items-center gap-2 mt-0.5">
          <Calendar size={18} />
          {formattedDate}
        </h2>
        {fieldName && <p className="text-sm text-white/75 mt-1">{fieldName}</p>}
      </div>

      <div className="p-4 max-h-[45vh] overflow-y-auto">
        {operations.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-6">No operations on this day.</p>
        ) : (
          <ul className="space-y-2">
            {operations.map((op) => {
              const color = getOperationTypeColor(op.operationType);
              const progress = getProgressStyle(op.progress);
              return (
                <li key={op._id}>
                  <button
                    type="button"
                    onClick={() => onSelectOperation(op)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-ember-sidebar/30 hover:bg-ember-card/50 transition text-left"
                  >
                    <span
                      className="w-1 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: color.bg }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {getOperationDisplayTitle(op)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {moment(
                          `${op.operationDate} ${op.operationTime}`,
                          "YYYY-MM-DD HH:mm:ss"
                        ).format("h:mm A")}
                        {progress ? ` · ${progress.label}` : ""}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={onAddOperation}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ember-sidebar text-white font-semibold text-sm hover:bg-ember-sidebar-hover transition"
        >
          <Plus size={16} />
          Add Operation
        </button>
      </div>
    </Modal>
  );
};

export default DayOperationsModal;
