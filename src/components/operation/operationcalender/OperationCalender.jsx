import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { FilterIcon } from "../../../assets/Icons";
import EventForm from "../operationform/EventForm";
import moment from "moment";
import { getOperationsByFarmField } from "../../../redux/slices/operationSlice";
import "./OperationCalender.css";

const FarmerScheduler = (selectedField) => {
  const dispatch = useDispatch();
  const { operations, loading, error } = useSelector(
    (state) => state.operation
  );

  const [view, setView] = useState("timeGridThreeDay");
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Map operations to FullCalendar events using operationDate and operationTime
  useEffect(() => {
    const mappedEvents = operations.reduce((acc, operation) => {
      const startDateTime = moment(
        `${operation.operationDate} ${operation.operationTime}`,
        "YYYY-MM-DD HH:mm:ss"
      ).toISOString();
      const endDateTime = moment(startDateTime).add(1, "hour").toISOString();

      // Check if an event with the same ID already exists to avoid duplicates
      if (!acc.some((event) => event.id === operation._id)) {
        acc.push({
          id: operation._id,
          title: operation.operationType.replace(/_/g, " ").toUpperCase(),
          start: startDateTime,
          end: endDateTime,
          extendedProps: { ...operation },
        });
      }
      return acc;
    }, []);

    setEvents(mappedEvents);
  }, [operations]);

  const handleNavigate = (action) => {
    const increment = view === "timeGridThreeDay" ? 3 : 1;
    const newDate =
      action === "prev"
        ? moment(date).subtract(increment, "days").toDate()
        : moment(date).add(increment, "days").toDate();
    setDate(newDate);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleFilter = () => {
    alert("Filter functionality triggered!");
  };

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

  const handleMonthChange = (monthIndex) => {
    const newDate = moment(date).month(monthIndex).startOf("month").toDate();
    setDate(newDate);
  };

  // Debounced handleSave to prevent multiple rapid calls
  const handleSave = useCallback((newEvent) => {
    setEvents((prevEvents) => {
      const filteredEvents = prevEvents.filter(
        (event) =>
          event.id !== (newEvent._id || `new-${Date.now()}`) &&
          event.start !==
            moment(
              `${newEvent.operationDate || newEvent.date} ${
                newEvent.operationTime || newEvent.time
              }`,
              "YYYY-MM-DD HH:mm:ss"
            ).toISOString()
      );

      // Create the new event
      const startDateTime = moment(
        `${newEvent.operationDate || newEvent.date} ${
          newEvent.operationTime || newEvent.time
        }`,
        "YYYY-MM-DD HH:mm:ss"
      ).toISOString();
      const endDateTime = moment(startDateTime).add(1, "hour").toISOString();

      const eventToAdd = {
        id: newEvent._id || `new-${Date.now()}`,
        title:
          newEvent.operationType?.replace(/_/g, " ").toUpperCase() ||
          newEvent.title,
        start: startDateTime,
        end: endDateTime,
        extendedProps: { ...newEvent },
      };

      // Add the new event to the filtered list
      const updatedEvents = [...filteredEvents, eventToAdd];
      return updatedEvents;
    });
    setIsModalVisible(false);
    setSelectedEvent(null);
  }, []);

  const handleClose = () => {
    setIsModalVisible(false);
    setSelectedEvent(null);
  };

  return (
    <div className="calender-container p-1">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="top-left">
          <select
            onChange={(e) => handleMonthChange(e.target.value)}
            value={moment(date).month()}
          >
            {moment.monthsShort().map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
          <button className="filter-button" onClick={handleFilter}>
            <FilterIcon />
            Filter
          </button>
          <div className="long-button">
            <button
              onClick={() => handleViewChange("timeGridDay")}
              className={view === "timeGridDay" ? "selected-button" : ""}
            >
              D
            </button>
            <button
              onClick={() => handleViewChange("timeGridThreeDay")}
              className={view === "timeGridThreeDay" ? "selected-button" : ""}
            >
              3D
            </button>
            <button
              onClick={() => handleViewChange("timeGridWeek")}
              className={view === "timeGridWeek" ? "selected-button" : ""}
            >
              W
            </button>
          </div>
        </div>
        <div className="top-right">
          <div className="button-group">
            <button
              onClick={() => handleNavigate("prev")}
              className="left-arrow"
            >
              {"<"}
            </button>
            <button
              onClick={() => handleNavigate("next")}
              className="right-arrow"
            >
              {">"}
            </button>
          </div>
          <button
            onClick={() => setIsModalVisible(true)}
            className="add-option-button"
          >
            Add Opp +
          </button>
        </div>
      </div>

      {/* FullCalendar */}
      <div className="calendar-container-body">
        <FullCalendar
          key={`${view}-${date}`}
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView={view}
          initialDate={date}
          headerToolbar={false}
          views={{
            timeGridThreeDay: {
              type: "timeGrid",
              duration: { days: 3 },
              buttonText: "3 Days",
            },
          }}
          events={events}
          selectable
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventColor="#378006"
          eventTextColor="#ffffff"
          height="80vh"
          contentHeight="auto"
          scrollTime="09:00:00"
          slotDuration="01:00:00"
          slotLabelInterval="01:00:00"
          slotLabelFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short",
          }}
        />

        {/* Event Form Modal */}
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
    </div>
  );
};

export default FarmerScheduler;
