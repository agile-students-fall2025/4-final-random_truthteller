import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./SavedSchedules.css";

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
    { id: "s3-f", courseName: "Design 101",  day: 3, startTime: "15:00", endTime: "16:00", professor: "Dr. Braun",  room: "D-40",  credits: 2 }, // example 2-credit
  ],
};

export default function SavedSchedules() {
  const navigate = useNavigate();

  const initialSchedules = useMemo(() => {
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

  function openSchedule(scheduleId) {
    const key = "currentScheduleEvents";
    const nameKey = "currentScheduleName";
    const idKey = "currentScheduleId";
    const schedule = initialSchedules.find((s) => s.id === scheduleId);
    const events = SCHEDULE_EVENTS_BY_ID[scheduleId] || [];

    // Persist for Dashboard to read and display
    localStorage.setItem(key, JSON.stringify(events));
    localStorage.setItem(idKey, scheduleId);
    localStorage.setItem(nameKey, schedule?.name || "Schedule");

    navigate("/dashboard");
  }

  return (
    <div className="saved-schedules-page">
      <div className="saved-schedules-container">
        <h1>Saved Schedules</h1>

        <div className="schedules-grid">
          {initialSchedules.map((s) => (
            <button
              key={s.id}
              className="schedule-card"
              type="button"
              onClick={() => openSchedule(s.id)}
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
