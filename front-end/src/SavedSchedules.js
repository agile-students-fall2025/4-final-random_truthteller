import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSchedules, createSchedule } from "./api/schedules";
import "./SavedSchedules.css";

// Local fallback schedules with full event objects (and credits)
const SCHEDULE_EVENTS_BY_ID = {
  s1: [
    { id: "s1-a", courseName: "Writing 101", day: 0, startTime: "09:00", endTime: "10:15", professor: "Dr. Gray", room: "W-201", credits: 4 },
    { id: "s1-b", courseName: "History 110", day: 2, startTime: "11:00", endTime: "12:15", professor: "Dr. Peach", room: "H-105", credits: 4 },
  ],
  s2: [
    { id: "s2-a", courseName: "Calculus I",  day: 0, startTime: "09:00", endTime: "10:15", professor: "Dr. Newton", room: "M-210", credits: 4 },
    { id: "s2-b", courseName: "CS 101",      day: 0, startTime: "10:30", endTime: "11:45", professor: "Dr. Ada",    room: "CS-101", credits: 4 },
    { id: "s2-c", courseName: "Psych 101",   day: 1, startTime: "13:00", endTime: "14:15", professor: "Dr. Freud",  room: "P-120", credits: 4 },
    { id: "s2-d", courseName: "Econ 101",    day: 3, startTime: "15:00", endTime: "16:15", professor: "Dr. Smith",  room: "E-333", credits: 4 },
  ],
  s3: [
    { id: "s3-a", courseName: "Chem 101",    day: 0, startTime: "09:00", endTime: "10:15", professor: "Dr. Curie",  room: "C-100", credits: 4 },
    { id: "s3-b", courseName: "Music 120",   day: 0, startTime: "10:30", endTime: "11:30", professor: "Dr. Bach",   room: "MU-12", credits: 4 },
    { id: "s3-c", courseName: "Stats 200",   day: 1, startTime: "09:00", endTime: "10:15", professor: "Dr. Bayes",  room: "S-220", credits: 4 },
    { id: "s3-d", courseName: "Physics I",   day: 1, startTime: "10:30", endTime: "11:45", professor: "Dr. Feynman",room: "P-101", credits: 4 },
    { id: "s3-e", courseName: "Philosophy",  day: 2, startTime: "13:00", endTime: "14:15", professor: "Dr. Plato",  room: "PH-5",  credits: 4 },
    { id: "s3-f", courseName: "Design 101",  day: 3, startTime: "15:00", endTime: "16:00", professor: "Dr. Braun",  room: "D-40",  credits: 2 },
  ],
};

export default function SavedSchedules() {
  const navigate = useNavigate();

  // Backend-mode state
  const [schedules, setSchedules] = useState([]);
  const [newName, setNewName] = useState("");
  const [backendMode, setBackendMode] = useState(false);

  // Fallback cards derived from local data
  const localCards = useMemo(() => {
    return [
      {
        id: "s1",
        name: "Schedule 1",
        modified: "12-11-2024",
        classes: SCHEDULE_EVENTS_BY_ID.s1.length,
      },
      {
        id: "s2",
        name: "Schedule 2",
        modified: "09-10-2024",
        classes: SCHEDULE_EVENTS_BY_ID.s2.length,
      },
      {
        id: "s3",
        name: "Schedule 3",
        modified: "03-07-2023",
        classes: SCHEDULE_EVENTS_BY_ID.s3.length,
      },
    ];
  }, []);

  // Try to fetch schedules from backend; if that fails, fall back to local cards
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const data = await fetchSchedules();
        if (Array.isArray(data) && data.length > 0) {
          setSchedules(data);
          setBackendMode(true);
        } else {
          setBackendMode(false);
        }
      } catch (e) {
        setBackendMode(false);
      }
    };
    loadSchedules();
  }, []);

  // Local fallback "open schedule" (stores events in localStorage)
  function openLocalSchedule(scheduleId) {
    const key = "currentScheduleEvents";
    const nameKey = "currentScheduleName";
    const idKey = "currentScheduleId";
    const card = localCards.find((c) => c.id === scheduleId);
    const events = SCHEDULE_EVENTS_BY_ID[scheduleId] || [];

    localStorage.setItem(key, JSON.stringify(events));
    localStorage.setItem(idKey, scheduleId);
    localStorage.setItem(nameKey, card?.name || "Schedule");
    navigate("/dashboard");
  }

  // Backend create
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
    <div className="saved-schedules-page">
      <div className="saved-schedules-container">
        <h1 className="page-title">Select Schedule</h1>

        {backendMode ? (
          <>
            <div className="add-row">
              <input
                className="name-input"
                placeholder="Schedule Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleAdd();
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
          </>
        ) : (
          <div className="schedules-grid">
            {localCards.map((s) => (
              <button
                key={s.id}
                className="schedule-card"
                type="button"
                onClick={() => openLocalSchedule(s.id)}
              >
                <div className="schedule-card-row">
                  <div className="schedule-name">{s.name}</div>
                  <div className="schedule-meta-count">{s.classes} classes</div>
                </div>
                <div className="schedule-sub">Last modified: {s.modified}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
