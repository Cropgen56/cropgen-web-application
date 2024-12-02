import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { FilterIcon } from "../../../assets/Icons";
import EventForm from "../operationform/EventForm";
import moment from "moment";
import "./OperationCalender.css";

const FarmerScheduler = () => {
  const [view, setView] = useState("timeGridThreeDay");
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([
    {
      title: "Example Task 2",
      start: "2024-11-28T12:00:00",
      end: "2024-11-28T14:00:00",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

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
    setSelectedEvent({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });
    setIsModalVisible(true);
  };

  const handleEventClick = (info) => {
    setSelectedEvent({
      ...info.event.extendedProps,
      start: info.event.startStr,
      end: info.event.endStr,
    });
    setIsModalVisible(true);
  };

  const handleMonthChange = (monthIndex) => {
    const newDate = moment(date).month(monthIndex).startOf("month").toDate();
    setDate(newDate);
  };

  const handleSave = (newEvent) => {
    setEvents((prevEvents) => [
      ...prevEvents,
      {
        title: newEvent.title,
        start: moment(newEvent.start).format(),
        end: moment(newEvent.end).format(),
      },
    ]);
    setIsModalVisible(false);
  };

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
          />
        )}
      </div>
    </div>
  );
};

export default FarmerScheduler;
