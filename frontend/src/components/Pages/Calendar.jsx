import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

// ✅ Relative API endpoint for Nginx proxy
const API_URL = "/api/events/";

const MyCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [events, setEvents] = useState([]);

  // ✅ Load events from Django backend
  const fetchEvents = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      // Convert strings to Date objects
      const formatted = data.map((evt) => ({
        ...evt,
        start: new Date(evt.start),
        end: new Date(evt.end),
      }));

      setEvents(expandRecurringEvents(formatted));
    } catch (err) {
      console.error("Failed to load events:", err);
    }
  };

  // ✅ Expand recurring events for next 3 months
  const expandRecurringEvents = (events) => {
    const expanded = [];
    const limit = moment().add(3, "months");

    events.forEach((evt) => {
      if (!evt.recurrence) {
        expanded.push(evt);
        return;
      }

      let current = moment(evt.start);
      const duration = moment(evt.end).diff(moment(evt.start));

      while (current.isBefore(limit)) {
        expanded.push({
          ...evt,
          start: current.toDate(),
          end: moment(current).add(duration).toDate(),
        });

        if (evt.recurrence === "daily") current.add(1, "day");
        if (evt.recurrence === "weekly") current.add(1, "week");
        if (evt.recurrence === "monthly") current.add(1, "month");
      }
    });

    return expanded;
  };

  // ✅ Save new event to Django API
  const saveEvent = async (newEvent) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });

      if (!res.ok) throw new Error("Failed to save event");

      const saved = await res.json();

      // Add the saved event (recurrence will be handled too)
      setEvents((prev) => [
        ...prev,
        ...expandRecurringEvents([
          { ...saved, start: new Date(saved.start), end: new Date(saved.end) },
        ]),
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Initial load
  useEffect(() => {
    fetchEvents();
  }, []);

  const handleNavigate = (newDate) => setDate(newDate);
  const handleViewChange = (newView) => setView(newView);

  const handleSelectSlot = ({ start, end }) => {
    const title = prompt("Enter meeting title:");
    if (!title) return;

    const attendees = prompt(
      "Enter attendees (comma-separated emails, leave blank if none):"
    );

    const recurrence = prompt(
      "Recurrence? (daily/weekly/monthly or leave blank)"
    );

    const newEvent = {
      title,
      description: "",
      start,
      end,
      attendees,
      recurrence,
    };

    // ✅ Save to backend
    saveEvent(newEvent);
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
        components={{
          toolbar: CustomToolbar,
        }}
        style={{ height: "90vh" }}
      />
    </div>
  );
};

// ✅ Simple Custom Toolbar
const CustomToolbar = (toolbar) => {
  return (
    <div style={{ padding: "10px", background: "#f0f0f0" }}>
      <button onClick={() => toolbar.onNavigate("TODAY")}>Today</button>
      <button onClick={() => toolbar.onNavigate("PREV")}>← Prev</button>
      <button onClick={() => toolbar.onNavigate("NEXT")}>Next →</button>

      <select
        value={toolbar.view}
        onChange={(e) => toolbar.onView(e.target.value)}
      >
        <option value={Views.MONTH}>Month</option>
        <option value={Views.WEEK}>Week</option>
        <option value={Views.DAY}>Day</option>
        <option value={Views.AGENDA}>Agenda</option>
      </select>
    </div>
  );
};

export default MyCalendar;
