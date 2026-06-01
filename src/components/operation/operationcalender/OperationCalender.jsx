import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import moment from "moment";
import { message } from "antd";
import EventForm from "../operationform/EventForm";
import OperationDetailsModal from "../operationform/OperationDetailsModal";
import DayOperationsModal from "../operationform/DayOperationsModal";
import {
  getOperationsByFarmField,
  deleteOperation,
} from "../../../redux/slices/operationSlice";
import {
  getOperationDisplayTitle,
  getOperationTypeColor,
  getProgressStyle,
} from "../operationUtils";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  User,
  IndianRupee,
  Clock,
  Sprout,
} from "lucide-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import "../operations.css";

const DeleteConfirmationModal = ({ operationTitle, onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl">
      <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
        <Trash2 className="text-red-500" size={20} />
      </div>
      <h3 className="text-base font-bold text-center text-ember-sidebar mb-1">
        Delete Operation?
      </h3>
      {operationTitle && (
        <p className="text-center text-sm text-gray-600 mb-2 capitalize">{operationTitle}</p>
      )}
      <p className="text-xs text-gray-500 text-center mb-5">
        This cannot be undone.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl bg-gray-100 text-ember-sidebar font-semibold text-sm hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-2.5 bg-white/10 rounded-lg px-3 py-2.5 border border-white/10 min-w-0 flex-1">
    <div className="p-1.5 rounded-md bg-white/12 shrink-0">
      <Icon size={15} className="text-emerald-200" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-white/50 uppercase tracking-wide truncate">{label}</p>
      <p className="text-lg font-bold text-white leading-none mt-0.5">{value}</p>
    </div>
  </div>
);

const OperationCard = ({ event, onOpen, onDelete }) => {
  const props = event.extendedProps || {};
  const typeColor = getOperationTypeColor(props.operationType, props);
  const progressStyle = getProgressStyle(props.progress);
  const title = getOperationDisplayTitle(props);
  const fromAdvisory = props.source === "advisory";

  return (
    <div
      onClick={onOpen}
      className="group relative bg-white/10 hover:bg-white/14 border border-white/10 rounded-xl p-3 cursor-pointer transition-colors overflow-hidden"
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: typeColor.bg }}
      />
      <div className="pl-2.5 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: typeColor.bg }}
            />
            <h3 className="font-semibold text-white text-sm capitalize truncate">{title}</h3>
          </div>
          <button
            type="button"
            className="shrink-0 p-1 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/20 sm:opacity-0 sm:group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete"
          >
            <RiDeleteBin6Line size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1 mb-1.5">
          {fromAdvisory && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-100 border border-sky-400/30">
              Advisory
            </span>
          )}
          {progressStyle && (
            <span
              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${progressStyle.className}`}
            >
              {progressStyle.label}
            </span>
          )}
        </div>
        <div className="space-y-0.5 text-[11px] text-white/60">
          <p className="flex items-center gap-1 truncate">
            <Clock size={11} className="shrink-0" />
            {moment(event.start).format("MMM D, h:mm A")}
          </p>
          {props.supervisorName && (
            <p className="flex items-center gap-1 truncate">
              <User size={11} className="shrink-0" />
              {props.supervisorName}
            </p>
          )}
          {props.estimatedCost > 0 && (
            <p className="flex items-center gap-1">
              <IndianRupee size={11} className="shrink-0" />
              ₹{Number(props.estimatedCost).toLocaleString("en-IN")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const FarmerScheduler = ({ selectedField: farmFieldId, fieldName }) => {
  const dispatch = useDispatch();
  const { operations, loading } = useSelector((state) => state.operation);
  const calendarRef = useRef(null);

  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [dayModalVisible, setDayModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [operationToDelete, setOperationToDelete] = useState(null);

  useEffect(() => {
    if (farmFieldId) {
      dispatch(getOperationsByFarmField({ farmId: farmFieldId }));
    }
  }, [dispatch, farmFieldId]);

  useEffect(() => {
    const mappedEvents = operations.map((operation) => {
      const colors = getOperationTypeColor(operation.operationType, operation);
      const startDateTime = moment(
        `${operation.operationDate} ${operation.operationTime}`,
        "YYYY-MM-DD HH:mm:ss"
      ).toISOString();

      return {
        id: operation._id,
        title: getOperationDisplayTitle(operation),
        start: startDateTime,
        end: moment(startDateTime).add(1, "hour").toISOString(),
        backgroundColor: colors.bg,
        borderColor: colors.bg,
        textColor: "#ffffff",
        extendedProps: { ...operation },
      };
    });
    setEvents(mappedEvents);
  }, [operations]);

  const filteredEvents = useMemo(
    () => events.filter((e) => moment(e.start).isSame(currentMonth, "month")),
    [events, currentMonth]
  );

  const monthStats = useMemo(() => {
    const completed = filteredEvents.filter(
      (e) => e.extendedProps?.progress === "completed"
    ).length;
    const inProgress = filteredEvents.filter(
      (e) => e.extendedProps?.progress === "in_progress"
    ).length;
    return { total: filteredEvents.length, completed, inProgress };
  }, [filteredEvents]);

  const openFormForDate = (dateStr, timeStr) => {
    setSelectedEvent({ date: dateStr, time: timeStr });
    setDetailsVisible(false);
    setFormVisible(true);
  };

  const openOperationDetails = (event) => {
    setSelectedEvent({
      ...event.extendedProps,
      start: event.start,
      end: event.end,
      date: moment(event.start).format("YYYY-MM-DD"),
      time: moment(event.start).format("HH:mm:ss"),
    });
    setFormVisible(false);
    setDetailsVisible(true);
  };

  const openOperationEdit = () => {
    setDetailsVisible(false);
    setFormVisible(true);
  };

  const getOperationsOnDate = (dateStr) =>
    operations.filter((op) => op.operationDate === dateStr);

  const handleDateSelect = (selectInfo) => {
    const dateStr = moment(selectInfo.startStr).format("YYYY-MM-DD");
    const timeStr = moment(selectInfo.startStr).format("HH:mm:ss");
    const dayOps = getOperationsOnDate(dateStr);

    if (dayOps.length > 0) {
      setSelectedDay({ date: dateStr, time: timeStr, operations: dayOps });
      setDayModalVisible(true);
      setFormVisible(false);
      setDetailsVisible(false);
    } else {
      openFormForDate(dateStr, timeStr);
    }
  };

  const handleAddToday = () => {
    const now = moment();
    openFormForDate(now.format("YYYY-MM-DD"), now.format("HH:mm:ss"));
  };

  const handleMonthChange = (direction) => {
    const newMonth =
      direction === "prev"
        ? moment(currentMonth).subtract(1, "month")
        : moment(currentMonth).add(1, "month");
    setCurrentMonth(newMonth);
    calendarRef.current?.getApi()?.gotoDate(newMonth.toDate());
  };

  const handleEventClick = (info) => {
    openOperationDetails({
      start: info.event.startStr,
      end: info.event.endStr,
      extendedProps: info.event.extendedProps,
    });
  };

  const handleSave = useCallback(() => {
    if (farmFieldId) dispatch(getOperationsByFarmField({ farmId: farmFieldId }));
    setFormVisible(false);
    setSelectedEvent(null);
  }, [dispatch, farmFieldId]);

  const handleCloseForm = () => {
    setFormVisible(false);
    setSelectedEvent(null);
  };

  const handleCloseDetails = () => {
    setDetailsVisible(false);
    setSelectedEvent(null);
  };

  const handleProgressUpdated = useCallback(
    (updated) => {
      if (farmFieldId) {
        dispatch(getOperationsByFarmField({ farmId: farmFieldId }));
      }
      if (updated && selectedEvent?._id === updated._id) {
        setSelectedEvent((prev) => ({
          ...prev,
          ...updated,
          date: prev?.date ?? updated.operationDate,
          time: prev?.time ?? updated.operationTime,
        }));
      }
    },
    [dispatch, farmFieldId, selectedEvent?._id]
  );

  const handleCloseDayModal = () => {
    setDayModalVisible(false);
    setSelectedDay(null);
  };

  const handleSelectFromDay = (op) => {
    setDayModalVisible(false);
    openOperationDetails({
      start: moment(`${op.operationDate} ${op.operationTime}`, "YYYY-MM-DD HH:mm:ss").toISOString(),
      extendedProps: op,
    });
  };

  const handleAddFromDay = () => {
    if (!selectedDay) return;
    setDayModalVisible(false);
    openFormForDate(selectedDay.date, selectedDay.time);
    setSelectedDay(null);
  };

  const handleDeleteFromDetails = () => {
    if (!selectedEvent?._id) return;
    setDetailsVisible(false);
    setOperationToDelete({
      id: selectedEvent._id,
      title: getOperationDisplayTitle(selectedEvent),
    });
    setSelectedEvent(null);
  };

  const handleNavigate = (direction) => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    if (direction === "prev") api.prev();
    else api.next();
    const newDate = moment(api.getDate());
    setDate(newDate.toDate());
    setCurrentMonth(newDate.clone().startOf("month"));
  };

  const renderEventContent = (eventInfo) => (
    <div className="px-1 py-0.5 text-[9px] sm:text-[10px] font-semibold leading-tight truncate">
      {moment(eventInfo.event.start).format("h A")} {eventInfo.event.title}
    </div>
  );

  const handleConfirmDelete = async () => {
    if (!operationToDelete) return;
    try {
      await dispatch(deleteOperation(operationToDelete.id)).unwrap();
      message.success("Operation deleted");
      if (farmFieldId) dispatch(getOperationsByFarmField({ farmId: farmFieldId }));
    } catch {
      message.error("Failed to delete operation");
    } finally {
      setOperationToDelete(null);
    }
  };

  if (!farmFieldId) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-gradient-to-br from-[#344e41] to-[#2b4035] text-white">
        <div className="text-center max-w-xs">
          <Sprout className="mx-auto mb-4 text-white/40" size={40} />
          <h2 className="text-lg font-bold mb-1">Select a Farm</h2>
          <p className="text-sm text-white/55">
            Choose a farm from the sidebar to manage operations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-br from-[#344e41] via-[#4a6a5a] to-[#2b4035] text-white overflow-hidden">
      {/* Sticky top bar */}
      <header className="shrink-0 z-10 px-3 sm:px-4 py-3 border-b border-white/10 bg-[#344e41]/90 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-emerald-200/70 uppercase tracking-wider font-medium">
              Operations
            </p>
            <h1 className="text-lg sm:text-xl font-bold truncate" title={fieldName}>
              {fieldName || "Selected Farm"}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleAddToday}
            className="shrink-0 inline-flex items-center justify-center gap-1.5 bg-white text-ember-sidebar text-sm font-semibold px-4 py-2 rounded-lg hover:bg-emerald-50 transition shadow"
          >
            <Plus size={16} />
            Add Operation
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <StatCard label="Month" value={monthStats.total} icon={CalendarDays} />
          <StatCard label="Done" value={monthStats.completed} icon={Sprout} />
          <StatCard label="Active" value={monthStats.inProgress} icon={Clock} />
        </div>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar relative">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#344e41]/60 backdrop-blur-[1px]">
            <div className="w-9 h-9 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        <div className="p-3 sm:p-4 xl:p-4 xl:grid xl:grid-cols-[1fr_320px] xl:gap-4 xl:items-start xl:max-h-none">
          {/* Calendar column */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 mb-4 xl:mb-0 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => handleNavigate("prev")}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <h2 className="text-sm sm:text-base font-bold">
                {currentMonth.format("MMMM YYYY")}
              </h2>
              <button
                type="button"
                onClick={() => handleNavigate("next")}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="operations-calendar w-full min-w-0 overflow-x-auto">
              <FullCalendar
                ref={calendarRef}
                key={moment(date).format("YYYY-MM")}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                initialDate={date}
                headerToolbar={false}
                events={events}
                selectable
                selectMirror
                select={handleDateSelect}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                showNonCurrentDates={false}
                dayMaxEventRows={2}
                height="auto"
                fixedWeekCount
                aspectRatio={1.5}
                dayHeaderContent={(args) => (
                  <span className="text-[10px] sm:text-xs font-semibold py-1.5 block truncate">
                    {args.text}
                  </span>
                )}
                dayCellContent={(args) => (
                  <span className="text-xs font-medium text-white/85 px-0.5 pt-0.5">
                    {args.dayNumberText}
                  </span>
                )}
              />
            </div>
            <p className="text-[10px] text-white/45 mt-2 text-center sm:text-left">
              Tap a date to add · Tap an operation to view details
            </p>
          </section>

          {/* Operations list column */}
          <section className="xl:sticky xl:top-0 min-w-0 flex flex-col xl:max-h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h2 className="text-sm font-bold flex items-center gap-1.5 min-w-0">
                <CalendarDays size={16} className="text-emerald-300 shrink-0" />
                <span className="truncate">{currentMonth.format("MMM YYYY")}</span>
              </h2>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMonthChange("prev")}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMonthChange("next")}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 xl:overflow-y-auto xl:no-scrollbar space-y-2 pb-4">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-white/15 bg-white/5">
                  <p className="text-sm text-white/70 mb-1">No operations</p>
                  <p className="text-[11px] text-white/45 mb-3">Schedule work on the calendar</p>
                  <button
                    type="button"
                    onClick={handleAddToday}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-white text-ember-sidebar rounded-lg"
                  >
                    <Plus size={14} />
                    Add
                  </button>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <OperationCard
                    key={event.id}
                    event={event}
                    onOpen={() => openOperationDetails(event)}
                    onDelete={() =>
                      setOperationToDelete({
                        id: event.id,
                        title: getOperationDisplayTitle(event.extendedProps),
                      })
                    }
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {dayModalVisible && selectedDay && (
        <DayOperationsModal
          visible={dayModalVisible}
          onClose={handleCloseDayModal}
          date={selectedDay.date}
          operations={selectedDay.operations}
          fieldName={fieldName}
          onSelectOperation={handleSelectFromDay}
          onAddOperation={handleAddFromDay}
        />
      )}

      {detailsVisible && selectedEvent?._id && (
        <OperationDetailsModal
          visible={detailsVisible}
          onClose={handleCloseDetails}
          operation={selectedEvent}
          fieldName={fieldName}
          onEdit={openOperationEdit}
          onDelete={handleDeleteFromDetails}
          onProgressUpdated={handleProgressUpdated}
        />
      )}

      {formVisible && farmFieldId && (
        <EventForm
          visible={formVisible}
          onClose={handleCloseForm}
          onSave={handleSave}
          initialData={selectedEvent}
          farmId={farmFieldId}
          fieldName={fieldName}
        />
      )}

      {operationToDelete && (
        <DeleteConfirmationModal
          operationTitle={operationToDelete.title}
          onCancel={() => setOperationToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default FarmerScheduler;
