import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardMobile.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const START_MIN = 8 * 60;
const END_MIN = 19 * 60;
const STEP = 30;

const SAMPLE_EVENTS = [
  { id: "cs101", title: "CS 101", day: 0, start: "09:00", end: "10:30", room: "Room 204" },
  { id: "math220", title: "Math 220", day: 2, start: "10:00", end: "11:30", room: "Hall A" },
  { id: "hist300", title: "Hist 300", day: 2, start: "10:30", end: "11:15", room: "Room 105" },
  { id: "art110", title: "Art 110", day: 4, start: "13:00", end: "14:00", room: "Studio 3" },
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

export default function DashboardMobile() {
    const navigate = useNavigate();
  const dayGroups = useMemo(() => {
    const map = new Map();
    DAYS.forEach((_, i) => map.set(i, []));
    SAMPLE_EVENTS.forEach((e) => map.get(e.day).push(e));
    for (const [k, arr] of map) {
      arr.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    }
    return map;
  }, []);

  const timeMarks = useMemo(() => {
    const arr = [];
    for (let t = START_MIN; t <= END_MIN; t += STEP) arr.push(t);
    return arr;
  }, []);

  return (
    <div className="m-dashboard-page">
      <header className="m-header">
        <h1 className="m-title">Weekly Planner</h1>
        <div className="m-actions">
            <button className="m-btn" type="button" onClick={() => navigate("/dashboard")}> Desktop View </button>
            <button className="m-btn" type="button">Select</button>
            <button className="m-btn" type="button">Settings</button>
            <button className="m-btn" type="button">Export</button>
        </div>
      </header>

      <div className="m-legend">
        <span className="m-pill">Class</span>
        <span className="m-pill m-pill-danger">Conflict</span>
      </div>

      <section className="m-days">
        {DAYS.map((label, idx) => (
          <div className="m-day" key={label}>
            <div className="m-day-header">
              <h2>{label}</h2>
              <img
                className="m-day-avatar"
                alt="course preview"
                src={`https://picsum.photos/seed/${label}/40/40`}
              />
            </div>

            <div className="m-timechips">
              {timeMarks.filter((t) => t % 60 === 0).map((m) => (
                <span className="m-chip" key={m}>{minutesToLabel(m)}</span>
              ))}
            </div>

            <div className="m-events">
              {dayGroups.get(idx).length === 0 ? (
                <div className="m-empty">No events</div>
              ) : (
                dayGroups.get(idx).map((e) => (
                  <div className="m-card" key={e.id}>
                    <div className="m-card-row">
                      <div className="m-card-title">{e.title}</div>
                      <div className="m-card-time">{e.start}–{e.end}</div>
                    </div>
                    <div className="m-card-meta">{e.room}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </section>

      <div className="m-fabrow">
        <button className="m-fab" aria-label="Select Schedule">Select</button>
        <button className="m-fab" aria-label="Settings">⚙</button>
        <button className="m-fab" aria-label="Export">⇩</button>
      </div>
    </div>
  );
}
