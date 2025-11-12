import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSchedules, createSchedule } from "./api/schedules";
import "./SavedSchedules.css";

export default function SavedSchedules() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSchedules();
        setSchedules(Array.isArray(data) ? data : []);
      } catch {
        setSchedules([]);
      }
    };
    load();
  }, []);

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    try {
      const created = await createSchedule(trimmed);
      setSchedules((prev) => [...prev, created]);
      setNewName("");
    } catch (e) {
      console.error("createSchedule failed", e);
    }
  };

  return (
    <div className="saved-schedules-page">
      <div className="saved-schedules-container">
        <h1 className="page-title">Select Schedule</h1>

        <div className="add-row">
          <input
            className="name-input"
            placeholder="Schedule Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button className="primary" type="button" onClick={handleAdd}>
            Add
          </button>
        </div>

        <div className="schedule-list">
          {schedules.map((s) => (
            <button
              key={s.id}
              className="schedule-card"
              type="button"
              onClick={() => navigate(`/dashboard?scheduleId=${s.id}`)}
            >
              <div className="schedule-card-row">
                <div className="schedule-name">{s.name}</div>
                <div className="schedule-meta-count">
                  {(s.classes ?? s.eventCount ?? 0)} classes
                </div>
              </div>
              <div className="schedule-sub">
                Last modified: {s.modified ?? s.updatedAt ?? ""}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
