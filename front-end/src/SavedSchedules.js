import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SavedSchedules.css";

export default function SavedSchedules() {
  const navigate = useNavigate();

  const initialSchedules = useMemo(
    () => [
      { id: "s1", name: "Schedule 1", modified: "12-11-2024", classes: 4 },
      { id: "s2", name: "Schedule 2", modified: "9-10-2024", classes: 5 },
      { id: "s3", name: "Schedule 3", modified: "3-7-2023", classes: 2 },
    ],
    [],
  );

  const [schedules, setSchedules] = useState(initialSchedules);
  const [newName, setNewName] = useState("");

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const now = new Date();
    const label = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}`;
    setSchedules((prev) => [
      ...prev,
      { id: `s-${Date.now()}`, name: trimmed, modified: label, classes: 0 },
    ]);
    setNewName("");
  }

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
              onClick={() => navigate("/dashboard")}
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
