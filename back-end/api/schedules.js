const express = require("express");
const router = express.Router();

// Default schedules data
// TODO: Replace with database
let schedules = [
  {
    id: "s1",
    name: "Schedule 1",
    modified: "12-11-2024",
    classes: 2,
  },
  {
    id: "s2",
    name: "Schedule 2",
    modified: "9-10-2024",
    classes: 1,
  },
  {
    id: "s3",
    name: "Schedule 3",
    modified: "3-7-2023",
    classes: 0,
  },
];

const scheduleEvents = {
  s1: [
    {
      id: "cs101",
      courseName: "Intro to Computer Science",
      day: 0, // Monday
      startTime: "09:00",
      endTime: "10:30",
      professor: "Prof 1",
      room: "Room 204",
    },
    {
      id: "cs102",
      courseName: "Intro to Data Structures",
      day: 2, // Wednesday
      startTime: "10:00",
      endTime: "11:30",
      professor: "Prof 2",
      room: "Hall A",
    },
  ],
  s2: [
    {
      id: "math201",
      courseName: "Calculus II",
      day: 1, // Tuesday
      startTime: "09:00",
      endTime: "10:30",
      professor: "Prof 3",
      room: "Math Building 1",
    },
  ],
  s3: [],
};

/*
 * GET /api/schedules
 * Get all schedules
 */
router.get("/", (req, res) => {
  res.json(schedules);
});

/*
 * GET /api/schedules/:id
 * Get a specific schedule
 */
router.get("/:id", (req, res) => {
  const schedule = schedules.find((s) => s.id === req.params.id);
  if (!schedule) {
    return res.status(404).json({ error: "Schedule not found" });
  }
  res.json(schedule);
});

/*
 * GET /api/schedules/:id/events
 * Get all events for a schedule
 */
router.get("/:id/events", (req, res) => {
  const schedule = schedules.find((s) => s.id === req.params.id);
  if (!schedule) {
    return res.status(404).json({ error: "Schedule not found" });
  }

  const events = scheduleEvents[req.params.id] || [];
  res.json(events);
});

module.exports = router;
