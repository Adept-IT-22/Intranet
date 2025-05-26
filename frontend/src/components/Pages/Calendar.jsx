import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: "", start: null, end: null });

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleSelectSlot = ({ start, end }) => {
    const title = prompt("Enter meeting title:");
    if (title) {
      const meeting = { title, start, end };
      setEvents([...events, meeting]);
    }
  };

  return (
    <div className="h-screen p-4">
      <Calendar
        localizer={localizer}
        selectable
        date={date}
        view={view}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        events={events}
        onSelectSlot={handleSelectSlot}
        style={{ height: "90vh" }}
      />
    </div>
  );
};

export default MyCalendar;
