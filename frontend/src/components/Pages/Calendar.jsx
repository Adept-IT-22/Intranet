import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

// ✅ Django API endpoint
const API_URL = "/api/events/";
const ANNOUNCEMENTS_API = "/api/announcements/";
const token = localStorage.getItem('access_token');

const MyCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [events, setEvents] = useState([]);

  // ✅ Load events from Django backend
  const fetchEvents = async () => {
    try {
      // Fetch calendar events
      const res = await fetch(API_URL);
      const calendarData = await res.json();

      // Fetch announcements with event dates
      const announcementsRes = await fetch(ANNOUNCEMENTS_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      let announcementsData = [];
      if (announcementsRes.ok) {
        announcementsData = await announcementsRes.json();
      } else {
        console.error("Failed to fetch announcements:", announcementsRes.status);
      }

      // Convert calendar events
      const calendarEvents = calendarData.map((evt) => ({
        ...evt,
        start: new Date(evt.start),
        end: new Date(evt.end),
        type: 'event',
      }));

      // Convert announcements with event dates to calendar events
      const announcementEvents = announcementsData
        .filter(ann => {
          // Filter for announcements with event dates that are active
          const hasEventDate = ann.event_date && ann.event_date !== null && ann.event_date !== '';
          const isActive = ann.is_active !== false; // Handle undefined as true
          
          if (hasEventDate && isActive) {
            // Validate the date is parseable
            const testDate = new Date(ann.event_date);
            if (isNaN(testDate.getTime())) {
              console.warn(`Invalid event_date for announcement ${ann.id}:`, ann.event_date);
              return false;
            }
            return true;
          }
          return false;
        })
        .map((ann) => {
          // Ensure we have valid dates
          const startDate = new Date(ann.event_date);
          // If no end date, default to 1 hour after start
          let endDate;
          if (ann.event_end_date && ann.event_end_date !== null && ann.event_end_date !== '') {
            endDate = new Date(ann.event_end_date);
            if (isNaN(endDate.getTime())) {
              endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
            }
          } else {
            endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
          }
          
          return {
            id: `announcement-${ann.id}`,
            title: `📢 ${ann.title}`,
            start: startDate,
            end: endDate,
            description: ann.content || ann.summary || '',
            type: 'announcement',
            priority: ann.priority || 'normal',
          };
        });

      console.log("Calendar events:", calendarEvents.length);
      console.log("Announcement events:", announcementEvents.length);
      console.log("Announcements data:", announcementsData);

      const allEvents = [...calendarEvents, ...announcementEvents];
      setEvents(expandRecurringEvents(allEvents));
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

  // ✅ Initial load and refresh on navigation
  useEffect(() => {
    fetchEvents();
  }, [date, view]); // Refresh when date or view changes

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
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Calendar</h2>
        <button 
          onClick={fetchEvents}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#004aad', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Refresh
        </button>
      </div>
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
        style={{ height: "85vh" }}
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
