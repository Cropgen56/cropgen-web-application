import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../Operation.css";
import EventForm from "../components/operation/eventForm";
const localizer = momentLocalizer(moment);

const Operation = (props) => {
  const [events, setEvents] = useState(props.events || []);
  const [showForm, setShowForm] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  const handleSelectSlot = ({ start, end }) => {
    setSelectedCell({ start, end });
    setShowForm(true);
  };

  const handleSaveEvent = (formValues) => {
    const newEvent = {
      title: formValues.title,
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

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "130vh" }}
        defaultView="week"
        views={["week"]}
        className="Custom-Calendar"
        selectable
        onSelectSlot={handleSelectSlot}
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

export default Operation;
