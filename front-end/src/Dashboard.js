import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Event } from "./Event";
import "./Dashboard.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const START_HOUR = 8;
const END_HOUR = 19;
const SLOT_HEIGHT = 40; // pixels per 30-minute slot

// Sample events using Event class
const createSampleEvents = () => [
  new Event({
    id: "cs101",
    courseName: "Intro to Computer Science",
    day: 0, // Monday
    startTime: "09:00",
    endTime: "10:30",
    professor: "Prof 1",
    room: "Room 204",
  }),
  new Event({
    id: "cs102",
    courseName: "Intro to Data Structures",
    day: 2, // Wednesday
    startTime: "10:00",
    endTime: "11:30",
    professor: "Prof 2",
    room: "Hall A",
  }),
];

function minutesToLabel(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = ((h + 11) % 12) + 1;
  return `${hr}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function useConflicts(events) {
  const conflicts = [];
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      if (events[i].overlapsWith(events[j])) {
        conflicts.push({ event1: events[i], event2: events[j] });
      }
    }
  }
  return conflicts;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState(createSampleEvents());

  const conflicts = useConflicts(events);

  const handleRemoveEvent = (eventId) => {
    setEvents((prevEvents) => prevEvents.filter((e) => e.id !== eventId));
  };

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      slots.push(h * 60); // Top of hour
      slots.push(h * 60 + 30); // Half hour
    }
    slots.push(END_HOUR * 60); // Final time
    return slots;
  }, []);

  const getEventsForDay = (dayIndex) => {
    return events.filter((e) => e.day === dayIndex);
  };

  const isEventInConflict = (event) => {
    return conflicts.some(
      (c) => c.event1.id === event.id || c.event2.id === event.id,
    );
  };

  const calculateEventStyle = (event) => {
    const startMinutes = event.getStartMinutes();
    const endMinutes = event.getEndMinutes();
    const startSlotMinutes = START_HOUR * 60;
    const totalMinutes = (END_HOUR - START_HOUR) * 60;
    const totalHeight = (timeSlots.length - 1) * SLOT_HEIGHT;

    const top =
      ((startMinutes - startSlotMinutes) / totalMinutes) * totalHeight;
    const height = ((endMinutes - startMinutes) / 30) * SLOT_HEIGHT;

    return { top: `${top}px`, height: `${height}px` };
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Weekly Planner</h1>
          <div className="dashboard-actions">
            <button
              className="button"
              type="button"
              onClick={() => navigate("/courses")}
            >
              Register For Courses
            </button>
          </div>
        </header>

        <section className="calendar-card">
          <div className="calendar-wrapper">
            {/* Day Headers */}
            <div className="calendar-header-row">
              <div className="time-header-cell"></div>
              {DAYS.map((day) => (
                <div key={day} className="day-header-cell">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="calendar-body">
              {/* Time Column */}
              <div className="time-column">
                {timeSlots.slice(0, -1).map((minutes, idx) => (
                  <div key={minutes} className="time-slot">
                    {idx % 2 === 0 && (
                      <span className="time-label">
                        {minutesToLabel(minutes)}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {DAYS.map((_, dayIndex) => (
                <div key={dayIndex} className="day-column">
                  {timeSlots.slice(0, -1).map((minutes) => (
                    <div key={minutes} className="time-cell"></div>
                  ))}

                  {/* Events for this day */}
                  {getEventsForDay(dayIndex).map((event) => {
                    const isConflict = isEventInConflict(event);
                    return (
                      <div
                        key={event.id}
                        className={`event-block${isConflict ? " conflict" : ""}`}
                        style={calculateEventStyle(event)}
                      >
                        <button
                          className="event-remove"
                          onClick={() => handleRemoveEvent(event.id)}
                          aria-label={`Remove ${event.courseName}`}
                          type="button"
                        >
                          ×
                        </button>
                        <div className="event-title">{event.courseName}</div>
                        {event.professor && (
                          <div className="event-professor">
                            {event.professor}
                          </div>
                        )}
                        <div className="event-meta">
                          {event.startTime} – {event.endTime}
                          {event.room && ` • ${event.room}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="calendar-footer">
          <div className="current-schedule">
            <span>Current Schedule:</span>
            {/* TODO: Get the current schedule from the backend. What should be
                considered first? Might need to store last selected schedule in
                our database. */}
            <button
              className="schedule-button"
              type="button"
              onClick={() => navigate("/schedules")}
            >
              Schedule 1<span className="schedule-dropdown-icon">▼</span>
            </button>
          </div>
          <button className="export-button" type="button">
            Export
            <span className="export-icon">▼</span>
          </button>
          <button
            className="settings-button"
            type="button"
            aria-label="Settings"
          >
            ⚙
          </button>
        </div>
      </div>
    </div>
  );
}
