import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSchedules } from "./api/schedules";
import "./SavedSchedules.css";

export default function SavedSchedules() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);

  // Fetch schedules from backend
  useEffect(() => {
    const loadSchedules = async () => {
      const data = await fetchSchedules();
      setSchedules(data);
    };

    loadSchedules();
  }, []);

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
