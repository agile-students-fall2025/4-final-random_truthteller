import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Event } from "./Event";
import { fetchScheduleEvents, fetchScheduleById } from "./api/schedules";
import "./Dashboard.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const START_HOUR = 8;
const END_HOUR = 19;
const SLOT_HEIGHT = 40; // pixels per 30-minute slot

const DEFAULT_SCHEDULE_ID = "s1"; // default used when param missing

// Fallback sample events (used if nothing else available)
const createSampleEvents = () => [
  new Event({
    id: "cs101",
    courseName: "Intro to Computer Science",
    day: 0,
    startTime: "09:00",
    endTime: "10:30",
    professor: "Prof 1",
    room: "Room 204",
    credits: 4,
  }),
  new Event({
    id: "cs102",
    courseName: "Intro to Data Structures",
    day: 2,
    startTime: "10:00",
    endTime: "11:30",
    professor: "Prof 2",
    room: "Hall A",
    credits: 4,
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
      if (events[i].overlapsWith && events[i].overlapsWith(events[j])) {
        conflicts.push({ event1: events[i], event2: events[j] });
      }
    }
  }
  return conflicts;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scheduleIdFromQuery = searchParams.get("scheduleId");

  const [events, setEvents] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [currentScheduleName, setCurrentScheduleName] = useState("(custom)");

  // Load events by priority:
  // 1) If ?scheduleId=... present → fetch from backend
  // 2) Else try localStorage (SavedSchedules.js writes there)
  // 3) Else fallback samples
  useEffect(() => {
    const load = async () => {
      try {
        if (scheduleIdFromQuery) {
          const sid = scheduleIdFromQuery || DEFAULT_SCHEDULE_ID;
          const [sched, evs] = await Promise.all([
            fetchScheduleById(sid),
            fetchScheduleEvents(sid),
          ]);
          setCurrentSchedule(sched || null);
          if (sched?.name) setCurrentScheduleName(sched.name);
          const mapped = (evs || []).map((d) =>
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
          );
          setEvents(mapped.length ? mapped : createSampleEvents());
          return;
        }

        // localStorage path
        const eventsKey = "currentScheduleEvents";
        const nameKey = "currentScheduleName";
        const idKey = "currentScheduleId";

        const raw = localStorage.getItem(eventsKey);
        const savedName = localStorage.getItem(nameKey);
        const savedId = localStorage.getItem(idKey);

        if (savedName) setCurrentScheduleName(savedName);
        else if (savedId) setCurrentScheduleName(String(savedId).toUpperCase());

        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length) {
            const mapped = list.map(
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
            );
            setEvents(mapped);
            return;
          }
        }

        // fallback
        setEvents(createSampleEvents());
      } catch (e) {
        console.warn("Failed to load schedule; falling back to samples", e);
        setEvents(createSampleEvents());
      }
    };

    load();
  }, [scheduleIdFromQuery]);

  // --- Validation banner state + action ---
  const [warnings, setWarnings] = useState([]);
  const [creditTotal, setCreditTotal] = useState(0);

  async function runValidation() {
    try {
      const API_BASE = process.env.REACT_APP_API_BASE ?? "http://localhost:8000";
      const payload = {
        items: events.map((e) => ({
          id: e.id,
          courseName: e.courseName,
          day: e.day,
          startTime: e.startTime,
          endTime: e.endTime,
          credits: e.credits ?? 4, // default 4
        })),
        creditMin: 12,
        creditMax: 20,
      };

      const resp = await fetch(`${API_BASE}/api/validate-schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
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
      slots.push(h * 60);
      slots.push(h * 60 + 30);
    }
    slots.push(END_HOUR * 60);
    return slots;
  }, []);

  const getEventsForDay = (dayIndex) => events.filter((e) => e.day === dayIndex);

  const isEventInConflict = (event) =>
    conflicts.some((c) => c.event1.id === event.id || c.event2.id === event.id);

  const calculateEventStyle = (event) => {
    const startMinutes = event.getStartMinutes();
    const endMinutes = event.getEndMinutes();
    const startSlotMinutes = START_HOUR * 60;
    const totalMinutes = (END_HOUR - START_HOUR) * 60;
    const totalHeight = (timeSlots.length - 1) * SLOT_HEIGHT;

    const top = ((startMinutes - startSlotMinutes) / totalMinutes) * totalHeight;
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
                      <span className="time-label">{minutesToLabel(minutes)}</span>
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

                  {/* Events */}
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
                          <div className="event-professor">{event.professor}</div>
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
          <button className="validate-btn" type="button" onClick={runValidation}>
            Validate Schedule
          </button>

          {warnings.length > 0 ? (
            <div className="warnings-banner">
              <strong>Warnings:</strong> {warnings.join(" | ")} • Credits: {creditTotal}
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
              {currentSchedule?.name || currentScheduleName}
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
