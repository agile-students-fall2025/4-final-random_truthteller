import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const START_MIN = 8 * 60;
const END_MIN = 19 * 60;
const STEP = 30;

// Placeholder sample data to render the visuals only
const SAMPLE_EVENTS = [
  {
    id: "cs101",
    title: "CS 101",
    day: 0,
    start: "09:00",
    end: "10:30",
    room: "Room 204",
  },
  {
    id: "math220",
    title: "Math 220",
    day: 2,
    start: "10:00",
    end: "11:30",
    room: "Hall A",
  },
  // overlap to demonstrate conflict alert + red styling
  {
    id: "hist300",
    title: "Hist 300",
    day: 2,
    start: "10:30",
    end: "11:15",
    room: "Room 105",
  },
  {
    id: "art110",
    title: "Art 110",
    day: 4,
    start: "13:00",
    end: "14:00",
    room: "Studio 3",
  },
];

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function minutesToLabel(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = ((h + 11) % 12) + 1;
  return `${hr}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function useConflicts(events) {
  const byDay = new Map();
  events.forEach((e) => {
    const list = byDay.get(e.day) || [];
    list.push(e);
    byDay.set(e.day, list);
  });

  const conflicts = [];
  for (const [day, list] of byDay.entries()) {
    const sorted = [...list].sort(
      (a, b) => toMinutes(a.start) - toMinutes(b.start),
    );
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i];
      for (let j = i + 1; j < sorted.length; j++) {
        const b = sorted[j];
        if (toMinutes(b.start) < toMinutes(a.end)) {
          conflicts.push({ day, a, b });
        } else {
          break;
        }
      }
    }
  }
  return conflicts;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const timeMarks = useMemo(() => {
    const arr = [];
    for (let t = START_MIN; t <= END_MIN; t += STEP) arr.push(t);
    return arr;
  }, []);

  const conflicts = useConflicts(SAMPLE_EVENTS);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Weekly Planner</h1>
          <div className="dashboard-actions">
            <button 
              className="button" 
              type="button" 
              onClick={() => navigate("/dashboard-mobile")}
            >
              Mobile View
            </button>
            <button
              className="button"
              type="button"
              onClick={() => navigate("/courses")}
            >
              Search Courses
            </button>
            <button
              className="button"
              type="button"
              onClick={() => navigate("/schedules")}
            >
              Select Schedule
            </button>
            {/* TODO: add the buttons once we have the pages for them and redirect
            <button className="button" type="button">Settings</button>
            <button className="button" type="button">Export Schedule</button> */}
          </div>
        </header>

        <div className="legend">
          <span>
            <span className="legend-dot event" /> Class
          </span>
          <span>
            <span className="legend-dot conflict" /> Conflict
          </span>
        </div>

        <section className="alerts" aria-live="polite">
          {conflicts.length === 0 ? (
            <div>No conflicts detected.</div>
          ) : (
            conflicts.map((c, idx) => (
              <div className="alert" key={idx}>
                Conflict on {DAYS[c.day]}: {c.a.title} ({c.a.start}-{c.a.end})
                overlaps with {c.b.title} ({c.b.start}-{c.b.end})
              </div>
            ))
          )}
        </section>

        <section className="calendar-card">
          <div className="calendar-header">
            <div></div>
            {DAYS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {/* Time column */}
            <div className="time-col">
              {timeMarks.map((m) => (
                <div className="time-slot" key={m}>
                  {minutesToLabel(m)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map((_, dayIndex) => (
              <div className="day-col" key={dayIndex}>
                {timeMarks.slice(0, -1).map((m) => (
                  <div className="day-row" key={m} />
                ))}

                {/* Events for this day */}
                {SAMPLE_EVENTS.filter((e) => e.day === dayIndex).map((e) => {
                  const top =
                    ((toMinutes(e.start) - START_MIN) / (END_MIN - START_MIN)) *
                    (timeMarks.length - 1) *
                    40;
                  const height =
                    ((toMinutes(e.end) - toMinutes(e.start)) / STEP) * 40;
                  const isConflict = conflicts.some(
                    (c) =>
                      c.day === dayIndex &&
                      (c.a.id === e.id || c.b.id === e.id),
                  );

                  return (
                    <div
                      key={e.id}
                      className={`event-block${isConflict ? " conflict" : ""}`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <div className="event-title">{e.title}</div>
                      <div className="event-meta">
                        {e.start} – {e.end} • {e.room}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
