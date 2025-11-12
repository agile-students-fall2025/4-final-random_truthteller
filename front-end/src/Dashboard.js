import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Event } from "./Event";
import { fetchScheduleEvents, fetchScheduleById } from "./api/schedules";
import { validateSchedule } from "./api/validation";
import "./Dashboard.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const START_HOUR = 8;
const END_HOUR = 19;
const SLOT_HEIGHT = 40; // pixels per 30-minute slot

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
      // Assume Event guarantees .overlapsWith
      if (events[i].overlapsWith(events[j])) {
        conflicts.push({ event1: events[i], event2: events[j] });
      }
    }
  }
  return conflicts;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scheduleId = searchParams.get("scheduleId");

  const [events, setEvents] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState(null);

  // If no scheduleId, send user to picker (always backend; no local fallback)
  useEffect(() => {
    if (!scheduleId) navigate("/schedules", { replace: true });
  }, [scheduleId, navigate]);

  // Fetch schedule + events from backend
  useEffect(() => {
    if (!scheduleId) return;

    const load = async () => {
      try {
        const [sched, evs] = await Promise.all([
          fetchScheduleById(scheduleId),
          fetchScheduleEvents(scheduleId),
        ]);

        setCurrentSchedule(sched || null);

        const mapped = Array.isArray(evs)
          ? evs.map(
              (d) =>
                new Event({
                  id: d.id,
                  courseName: d.courseName,
                  day: d.day,
                  startTime: d.startTime,
                  endTime: d.endTime,
                  professor: d.professor || "",
                  room: d.room || "",
                  credits: d.credits != null ? Number(d.credits) : 4,
                }),
            )
          : [];

        // Keep empty array if backend has no events (new schedule)
        setEvents(mapped);
      } catch (e) {
        console.warn("Failed to load schedule/events", e);
        setCurrentSchedule(null);
        setEvents([]);
      }
    };

    load();
  }, [scheduleId]);

  // Validation UI state + action
  const [warnings, setWarnings] = useState([]);
  const [creditTotal, setCreditTotal] = useState(0);

  async function runValidation() {
    try {
      const data = await validateSchedule(events, 12, 20);
      setWarnings(data.warnings || []);
      setCreditTotal((data.details && data.details.creditTotal) || 0);
    } catch (e) {
      console.warn("Validation error", e);
      setWarnings(["Could not validate schedule (server unavailable)"]);
      setCreditTotal(0);
    }
  }

  const conflicts = useConflicts(events);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      slots.push(h * 60); // top of hour
      slots.push(h * 60 + 30); // half hour
    }
    slots.push(END_HOUR * 60); // final time
    return slots;
  }, []);

  const getEventsForDay = (dayIndex) =>
    events.filter((e) => e.day === dayIndex);

  const isEventInConflict = (event) =>
    conflicts.some((c) => c.event1.id === event.id || c.event2.id === event.id);

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
                  {timeSlots.slice(0, -1).map((m) => (
                    <div key={m} className="time-cell"></div>
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
          <button
            className="validate-btn"
            type="button"
            onClick={runValidation}
          >
            Validate Schedule
          </button>

          {warnings.length > 0 ? (
            <div className="warnings-banner">
              <strong>Warnings:</strong> {warnings.join(" | ")} • Credits:{" "}
              {creditTotal}
            </div>
          ) : creditTotal > 0 ? (
            <div className="valid-banner">
              ✅ This schedule is valid! • Total Credits: {creditTotal}
            </div>
          ) : null}

          <div className="current-schedule">
            <span>Current Schedule:</span>
            <button
              className="schedule-button"
              type="button"
              onClick={() => navigate("/schedules")}
              title="Choose a different saved schedule"
            >
              {currentSchedule?.name || ""}
              <span className="schedule-dropdown-icon">▼</span>
            </button>
          </div>

          <button className="export-button" type="button">
            Export <span className="export-icon">▼</span>
          </button>
          <button
            className="settings-button"
            type="button"
            aria-label="Settings"
            onClick={() => navigate("/settings")}
          >
            ⚙
          </button>
        </div>
      </div>
    </div>
  );
}
