import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSchedules, createSchedule } from "./api/schedules";
import "./SavedSchedules.css";

export default function SavedSchedules() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [newName, setNewName] = useState("");

  // Fetch schedules from backend
  useEffect(() => {
    const loadSchedules = async () => {
      const data = await fetchSchedules();
      setSchedules(data);
    };

    loadSchedules();
  }, []);

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    try {
      const newSchedule = await createSchedule(trimmed);
      setSchedules((prev) => [...prev, newSchedule]);
      setNewName("");
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };

  return (
    <div className="schedules-page">
      <div className="schedules-container">
        <button
          className="back-button"
          type="button"
          onClick={() => navigate(-1)}
        >
          ←
        </button>

        <h1 className="page-title">Select Schedule</h1>

        <div className="add-row">
          <input
            className="name-input"
            placeholder="Schedule Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAdd();
              }
            }}
          />
          <button className="primary" type="button" onClick={handleAdd}>
            Add
          </button>
        </div>

        <div className="schedule-list">
          {schedules.map((s) => (
            <button
              key={s.id}
              type="button"
              className="schedule-card"
              onClick={() => navigate(`/dashboard?scheduleId=${s.id}`)}
            >
              <div className="schedule-card-row">
                <div className="schedule-name">{s.name}</div>
                <div className="schedule-meta-count">{s.classes} classes</div>
              </div>
              <div className="schedule-sub">Last modified: {s.modified}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
