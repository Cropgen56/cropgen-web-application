import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./OperationCalender.css";
import moment from "moment";
import EventForm from "./eventForm";

const localizer = momentLocalizer(moment);

const Calender = (props) => {
  const [events, setEvents] = useState(props.events || []);
  const [view, setView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  const handleSelectSlot = ({ start, end }) => {
    setSelectedCell({ start, end });
    setShowForm(true);
  };

  const handleSaveEvent = (formValues) => {
    const newEvent = {
      title: formValues.title,
      cropName: formValues.cropName,
      operationType: formValues.operationType,
      supervisorName: formValues.supervisorName,
      labourMale: formValues.labourMale,
      labourFemale: formValues.labourFemale,
      date: formValues.date,
      estimatedCost: formValues.estimatedCost,
      start: formValues.start.toDate(),
      end: formValues.end.toDate(),
    };
    setEvents([...events, newEvent]);
    setShowForm(false);
    setSelectedCell(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedCell(null);
  };

  const eventPropGetter = (event) => ({
    style: { backgroundColor: "#63a4ff", color: "white", padding: "5px" },
  });

  const EventComponent = ({ event }) => (
    <div className="w-100 h-50">
      <strong>{event.title}</strong>
      <div>{event.cropName}</div>
      <div>{event.operationType}</div>
    </div>
  );

  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "calc(100vh - 50px)" }}
        date={currentDate}
        defaultView={view}
        views={["day", "week", "month"]}
        onNavigate={(date) => setCurrentDate(date)}
        className="Custom-Calendar p-1"
        selectable
        onSelectSlot={handleSelectSlot}
        eventPropGetter={eventPropGetter}
        components={{
          event: EventComponent,
        }}
      />

      <EventForm
        visible={showForm}
        onClose={handleCloseForm}
        onSave={handleSaveEvent}
        initialData={selectedCell}
      />
    </div>
  );
};

export default Calender;
