import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import moment from "moment";
import EventForm from "../operationform/EventForm";
import { getOperationsByFarmField } from "../../../redux/slices/operationSlice";
import { FaTractor } from "react-icons/fa";
import { Operation } from "../../../assets/Icons";

const FarmerScheduler = (selectedField) => {
  const dispatch = useDispatch();
  const { operations } = useSelector((state) => state.operation);
  console.log(operations)
  console.log("Selected Field:", selectedField);

  const [view, setView] = useState("timeGridThreeDay");
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  console.log(events)
  const [currentMonth, setCurrentMonth] = useState(moment());

  useEffect(() => {
    const mappedEvents = operations.map((operation) => {
      const startDateTime = moment(
        `${operation.operationDate} ${operation.operationTime}`,
        "YYYY-MM-DD HH:mm:ss"
      ).toISOString();

      return {
        id: operation._id,
        title: operation.operationType.replace(/_/g, " "),
        start: startDateTime,
        end: moment(startDateTime).add(1, "hour").toISOString(),
        extendedProps: { ...operation },
      };
    });
    setEvents(mappedEvents);
  }, [operations]);

  const handleDateSelect = (selectInfo) => {
    const selectedDate = moment(selectInfo.startStr).format("YYYY-MM-DD");
    const selectedTime = moment(selectInfo.startStr).format("HH:mm:ss");

    setSelectedEvent({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      date: selectedDate,
      time: selectedTime,
    });
    setIsModalVisible(true);
  };
  const handleMonthChange = (direction) => {
    const newMonth =
      direction === "prev"
        ? moment(currentMonth).subtract(1, "month")
        : moment(currentMonth).add(1, "month");
    setCurrentMonth(newMonth);
  };
  const filteredEvents = events.filter((event) =>
    moment(event.start).isSame(currentMonth, "month")
  );

  const handleEventClick = (info) => {
    const selectedDate = moment(info.event.startStr).format("YYYY-MM-DD");
    const selectedTime = moment(info.event.startStr).format("HH:mm:ss");

    setSelectedEvent({
      ...info.event.extendedProps,
      start: info.event.startStr,
      end: info.event.endStr,
      date: selectedDate,
      time: selectedTime,
    });
    setIsModalVisible(true);
  };

  const handleSave = useCallback((newEvent) => {
    dispatch(getOperationsByFarmField(selectedField._id));
    setIsModalVisible(false);
    setSelectedEvent(null);
  }, [dispatch, selectedField]);

  const handleClose = () => {
    setIsModalVisible(false);
    setSelectedEvent(null);
  };

  const handleNavigate = (direction) => {
    const newDate =
      direction === "prev"
        ? moment(date).subtract(1, "day").toDate()
        : moment(date).add(1, "day").toDate();
    setDate(newDate);
  };

  const renderEventContent = (eventInfo) => (
    <div className="bg-blue-100 text-[#344e41] text-xs font-medium px-2 py-1 rounded-md whitespace-normal overflow-hidden">
      <div className="truncate">
        {moment(eventInfo.event.start).format("h A")} - {eventInfo.event.title}
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#344e41] text-white overflow-y-auto p-4">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => handleNavigate("prev")}
          className="bg-white text-[#344e41] px-4 py-1 rounded-md text-lg font-bold shadow"
        >
          ←
        </button>
        <div className="text-lg font-semibold">
          {moment(date).format("MMMM D, YYYY")}
        </div>
        <button
          onClick={() => handleNavigate("next")}
          className="bg-white text-[#344e41] px-4 py-1 rounded-md text-lg font-bold shadow"
        >
          →
        </button>
      </div>

      {/* Calendar (not scrollable individually) */}
      <div className="rounded-xl bg-[#344e41] shadow-inner p-2 mb-6">
        <FullCalendar
          key={moment(date).format("YYYY-MM-DD")}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate={date}
          headerToolbar={false}
          events={events}
          selectable
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          showNonCurrentDates={false}
          dayMaxEventRows={3}
          contentHeight="auto"
          dayCellClassNames={() => "bg-[#5a7c6b] border-none"}
          dayHeaderClassNames={() => "bg-[#344e41] text-white font-bold"}
          slotLaneClassNames={() => "border-none"}

          dayHeaderContent={(args) => (
            <div className="text-white font-bold py-2 text-sm text-center">
              {args.text}
            </div>
          )}
          dayCellContent={(args) => (
            <div className="text-white font-semibold text-sm">
              {args.dayNumberText}
            </div>
          )}
        />

      </div>


      {/* Real-Time Operation Cards */}
      {/* Monthly Operations Section */}
      <div className="mt-10 px-4">
        {/* Heading with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Operation className="text-white text-6xl" />
            <h2 className="text-3xl font-bold text-white">
              This Month's Operations
            </h2>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => handleMonthChange("prev")}
              className="bg-white text-[#344e41] px-3 py-1 rounded-md font-semibold shadow"
            >
              ←
            </button>
            <div className="text-white font-medium text-xl">
              {currentMonth.format("MMMM YYYY")}
            </div>
            <button
              onClick={() => handleMonthChange("next")}
              className="bg-white text-[#344e41] px-3 py-1 rounded-md font-semibold shadow"
            >
              →
            </button>
          </div>
        </div>

        {/* Monthly Container */}
        <div className="bg-[#294036] rounded-xl shadow-lg p-6 mb-8">
          {filteredEvents.length === 0 ? (
            <div className="text-white text-center text-lg">
              No operations for this month.
            </div>
          ) : (
            <div



              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => {
                    const selectedDate = moment(event.start).format("YYYY-MM-DD");
                    const selectedTime = moment(event.start).format("HH:mm:ss");

                    setSelectedEvent({
                      ...event.extendedProps,
                      start: event.start,
                      end: event.end,
                      date: selectedDate,
                      time: selectedTime,
                    });
                    setIsModalVisible(true);
                  }}
                  className="bg-gradient-to-br from-[#5a7c6b] to-[#3d5d50] hover:from-[#4b6b5a] hover:to-[#2e473c] 
      text-white p-4 rounded-xl shadow-md hover:shadow-xl 
      transition-all duration-300 ease-in-out transform hover:scale-[1.03] min-h-[130px]"
                >
                  <div className="text-base font-semibold mb-1 capitalize">
                    {event.title}
                  </div>
                  <div className="text-xs leading-tight">
                    <span className="font-semibold">Date:</span>{" "}
                    {moment(event.start).format("MMM D, YYYY")}
                  </div>
                  <div className="text-xs leading-tight">
                    <span className="font-semibold">Scheduled:</span>{" "}
                    {moment(event.start).format("hh:mm A")}
                  </div>
                  <div className="text-xs leading-tight">
                    <span className="font-semibold">Created:</span>{" "}
                    {moment(event.extendedProps.createdAt).format("hh:mm A, MMM D")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Modal */}
      {isModalVisible && (
        <EventForm
          visible={isModalVisible}
          onClose={handleClose}
          onSave={handleSave}
          initialData={selectedEvent}
          selectedField={selectedField}
        />
      )}
    </div>
  );
};

export default FarmerScheduler;