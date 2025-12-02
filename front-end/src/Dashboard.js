import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Event } from "./Event";
import {
  fetchScheduleEvents,
  fetchScheduleById,
  exportSchedule,
  getCurrentSchedule,
  setCurrentSchedule as saveCurrentSchedule,
  deleteEventFromSchedule,
} from "./api/schedules";
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
  const [eventBeingDeleted, setEventBeingDeleted] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch schedule + events from backend and save as current schedule
  useEffect(() => {
    const load = async () => {
      // If no scheduleId, try to load current schedule or redirect to picker
      let targetScheduleId = scheduleId;
      if (!targetScheduleId) {
        try {
          const { scheduleId: currentScheduleId } = await getCurrentSchedule();
          if (currentScheduleId) {
            navigate(`/dashboard?scheduleId=${currentScheduleId}`, {
              replace: true,
            });
            targetScheduleId = currentScheduleId;
          } else {
            navigate("/schedules", { replace: true });
            return;
          }
        } catch (e) {
          console.error("Cannot load current schedule", e);
          navigate("/schedules", { replace: true });
          return;
        }
      }

      // Load schedule and events
      try {
        const [schedule, scheduleEvents] = await Promise.all([
          fetchScheduleById(targetScheduleId),
          fetchScheduleEvents(targetScheduleId),
        ]);

        setCurrentSchedule(schedule || null);

        try {
          await saveCurrentSchedule(targetScheduleId);
        } catch (e) {
          console.error("Unable to record current schedule", e);
        }

        const events = scheduleEvents.map((eventData) => new Event(eventData));
        setEvents(events);
      } catch (e) {
        console.error("Unable to load schedule or events", e);
        setCurrentSchedule(null);
        setEvents([]);
      }
    };

    load();
  }, [scheduleId, navigate]);

  // Validation UI state + action
  const [warnings, setWarnings] = useState([]);
  const [creditTotal, setCreditTotal] = useState(0);

  async function runValidation() {
    try {
      const data = await validateSchedule(events, 12, 20);
      setWarnings(data.warnings || []);
      setCreditTotal((data.details && data.details.creditTotal) || 0);
    } catch (e) {
      console.error("Validation error", e);
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

  const handleDeleteEvent = async (eventId) => {
    const activeScheduleId = scheduleId || currentSchedule?.id;
    if (!activeScheduleId) {
      return;
    }

    setEventBeingDeleted(eventId);
    try {
      await deleteEventFromSchedule(activeScheduleId, eventId);
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      try {
        const refreshedSchedule = await fetchScheduleById(activeScheduleId);
        setCurrentSchedule(refreshedSchedule || null);
      } catch (refreshError) {
        console.error(
          "Failed to refresh schedule after deletion",
          refreshError,
        );
      }
    } catch (error) {
      console.error("Failed to delete event", error);
    } finally {
      setEventBeingDeleted(null);
    }
  };

  const handleExport = async () => {
    try {
      await exportSchedule(scheduleId);
    } catch (error) {
      console.error("Error exporting schedule:", error);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="page-title">Weekly Planner</h1>
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
                    // For dashboard view, show only the course title portion
                    const displayTitle = (() => {
                      if (!event.courseName) return "";
                      const parts = String(event.courseName).split(" - ");
                      if (parts.length >= 2) {
                        return parts.slice(1).join(" - ").trim();
                      }
                      return event.courseName;
                    })();

                    return (
                      <div
                        key={event.id}
                        className={`event-block${isConflict ? " conflict" : ""}`}
                        style={calculateEventStyle(event)}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedEvent(event)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedEvent(event);
                          }
                        }}
                      >
                        <div className="event-title">{displayTitle}</div>
                        <div className="event-footer">
                          {event.professor && (
                            <div className="event-professor">
                              {event.professor}
                            </div>
                          )}
                          <div className="event-meta">
                            {event.room || ""}
                          </div>
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
          <div className="footer-schedule">
            <button
              className="schedule-button"
              type="button"
              onClick={() => navigate("/schedules")}
              title="Choose a different saved schedule"
            >
              {currentSchedule?.name || "New Schedule"}
              <span className="schedule-dropdown-icon">▼</span>
            </button>
          </div>
          <div className="footer-actions">
            <button
              className="icon-button settings-icon-button"
              type="button"
              aria-label="Settings"
              title="Settings"
              onClick={() => navigate("/settings")}
            >
              ⚙
            </button>
            <button
              className="icon-button export-icon-button"
              type="button"
              onClick={handleExport}
              title="Export schedule"
              aria-label="Export schedule"
            >
              ⤓
            </button>
            <button
              className="icon-button validate-icon-button"
              type="button"
              onClick={runValidation}
              title="Validate schedule"
              aria-label="Validate schedule"
            >
              ✓
            </button>
            <button
              className="icon-button add-course-icon-button"
              type="button"
              onClick={() => navigate("/courses")}
              title="Register for courses"
              aria-label="Register for courses"
            >
              +
            </button>
            {localStorage.getItem("isAdmin") === "true" && (
              <button
                className="icon-button admin-icon-button"
                type="button"
                onClick={() => navigate("/admin/reviews")}
                title="Admin Dashboard"
                aria-label="Admin Dashboard"
                style={{ backgroundColor: "#333", color: "white" }}
              >
                🔒
              </button>
            )}
          </div>
        </div>

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
      </div>
      {selectedEvent && (
        <div
          className="event-modal-overlay"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="event-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Details for ${selectedEvent.courseName}`}
          >
            <button
              type="button"
              className="event-modal-close"
              onClick={() => setSelectedEvent(null)}
            >
              ×
            </button>
            <h2 className="event-modal-title">{selectedEvent.courseName}</h2>
            <div className="event-modal-row">
              <span className="event-modal-label">Professor:</span>
              <span className="event-modal-value">
                {selectedEvent.professor || "TBA"}
              </span>
            </div>
            <div className="event-modal-row">
              <span className="event-modal-label">Time:</span>
              <span className="event-modal-value">
                {selectedEvent.startTime} – {selectedEvent.endTime}
              </span>
            </div>
            <div className="event-modal-row">
              <span className="event-modal-label">Building / Room:</span>
              <span className="event-modal-value">
                {selectedEvent.room || "TBA"}
              </span>
            </div>
            <div className="event-modal-row">
              <span className="event-modal-label">Day:</span>
              <span className="event-modal-value">
                {DAYS[selectedEvent.day] ?? ""}
              </span>
            </div>
            <div className="event-modal-actions">
              <button
                type="button"
                className="event-modal-delete"
                onClick={async () => {
                  await handleDeleteEvent(selectedEvent.id);
                  setSelectedEvent(null);
                }}
                disabled={eventBeingDeleted === selectedEvent.id}
              >
                Delete from schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
