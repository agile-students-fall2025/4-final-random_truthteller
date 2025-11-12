import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchSchedules,
  createSchedule,
  deleteSchedule,
  setCurrentSchedule,
} from "./api/schedules";
import "./SavedSchedules.css";

export default function SavedSchedules() {
  const navigate = useNavigate();
  const location = useLocation();
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
  }, [location.pathname]);

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    try {
      const created = await createSchedule(trimmed);
      setSchedules((prev) => [...prev, created]);
      setNewName("");
      // Set as current schedule and navigate to dashboard
      try {
        await setCurrentSchedule(created.id);
        navigate(`/dashboard?scheduleId=${created.id}`);
      } catch (e) {
        console.error("Failed to set current schedule", e);
        // Still navigate even if saving fails
        navigate(`/dashboard?scheduleId=${created.id}`);
      }
    } catch (e) {
      console.error("createSchedule failed", e);
    }
  };

  const handleDelete = async (scheduleId, e) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    try {
      await deleteSchedule(scheduleId);
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    } catch (error) {
      console.error("Error deleting schedule:", error);
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
              onClick={async () => {
                try {
                  await setCurrentSchedule(s.id);
                  navigate(`/dashboard?scheduleId=${s.id}`);
                } catch (error) {
                  console.error("Failed to set current schedule:", error);
                  // Still navigate even if saving fails
                  navigate(`/dashboard?scheduleId=${s.id}`);
                }
              }}
            >
              <div className="schedule-card-row">
                <div className="schedule-name">{s.name}</div>
                <div className="schedule-meta-count">
                  {s.classes ?? s.eventCount ?? 0} classes
                  <button
                    type="button"
                    className="delete-button"
                    onClick={(e) => handleDelete(s.id, e)}
                    aria-label={`Delete ${s.name}`}
                  >
                    ×
                  </button>
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
