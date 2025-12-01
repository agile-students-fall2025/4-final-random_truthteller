import express from "express";
import { createEvents } from "ics";

const router = express.Router();

// Default schedules data
// TODO: Replace with database
let schedules = [
  {
    id: "s1",
    name: "Schedule 1",
    modified: "12-11-2024",
    classes: 0,
  },
];

const scheduleEvents = {
  s1: [],
};

// Track a user's last selected schedule in memory until we add persistence.
// TODO: replace with storage once auth is wired up.
const userCurrentSchedules = Object.create(null);

router.get("/current", (req, res) => {
  const userId = req.query.userId || "default";
  let scheduleId = userCurrentSchedules[userId];

  const scheduleExists =
    scheduleId && schedules.some((schedule) => schedule.id === scheduleId);

  if (!scheduleExists) {
    scheduleId = schedules.length > 0 ? schedules[0].id : null;
    if (scheduleId) {
      userCurrentSchedules[userId] = scheduleId;
    } else {
      delete userCurrentSchedules[userId];
    }
  }

  res.json({ scheduleId });
});

/*
 * PUT /api/schedules/current
 * Set the current schedule ID for the user
 */
router.put("/current", (req, res) => {
  const { scheduleId } = req.body;
  if (!scheduleId) {
    return res.status(400).json({ error: "scheduleId is required" });
  }

  const userId = req.query.userId || "default";
  const schedule = schedules.find((s) => s.id === scheduleId);
  if (!schedule) {
    return res.status(404).json({ error: "Schedule not found" });
  }

  userCurrentSchedules[userId] = scheduleId;
  res.json({ scheduleId });
});

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
 * POST /api/schedules
 * Create a new schedule
 */
router.post("/", (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Schedule name is required" });
  }

  const now = new Date();
  const modified = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}`;
  const newSchedule = {
    id: `s-${schedules.length + 1}`,
    name: name.trim(),
    modified,
    classes: 0,
  };

  schedules.push(newSchedule);
  scheduleEvents[newSchedule.id] = [];

  res.status(201).json(newSchedule);
});

/*
 * DELETE /api/schedules/:id
 * Delete a schedule
 */
router.delete("/:id", (req, res) => {
  const index = schedules.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Schedule not found" });
  }

  schedules.splice(index, 1);
  delete scheduleEvents[req.params.id];

  for (const [userId, currentId] of Object.entries(userCurrentSchedules)) {
    if (currentId === req.params.id) {
      delete userCurrentSchedules[userId];
    }
  }

  res.status(204).send();
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

/*
 * POST /api/schedules/:id/events
 * Add events to a schedule
 */
router.post("/:id/events", (req, res) => {
  const schedule = schedules.find((s) => s.id === req.params.id);
  if (!schedule) {
    return res.status(404).json({ error: "Schedule not found" });
  }

  const { events } = req.body;
  if (!Array.isArray(events)) {
    return res.status(400).json({ error: "Events must be an array" });
  }

  if (!scheduleEvents[req.params.id]) {
    scheduleEvents[req.params.id] = [];
  }

  const timestamp = Date.now();
  const newEvents = events.map((event, index) => ({
    id: event.id || `event-${timestamp}-${index}`,
    courseName: event.courseName,
    day: event.day,
    startTime: event.startTime,
    endTime: event.endTime,
    professor: event.professor || "",
    room: event.room || "",
    credits: event.credits != null ? Number(event.credits) : 4,
  }));

  scheduleEvents[req.params.id].push(...newEvents);

  const now = new Date();
  schedule.modified = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}`;
  schedule.classes = scheduleEvents[req.params.id].length;

  res.status(201).json(newEvents);
});

router.delete("/:id/events/:eventId", (req, res) => {
  const schedule = schedules.find((s) => s.id === req.params.id);
  if (!schedule) {
    return res.status(404).json({ error: "Schedule not found" });
  }

  const events = scheduleEvents[req.params.id];
  if (!events || events.length === 0) {
    return res.status(404).json({ error: "Event not found" });
  }

  const eventIndex = events.findIndex(
    (event) => event.id === req.params.eventId,
  );
  if (eventIndex === -1) {
    return res.status(404).json({ error: "Event not found" });
  }

  events.splice(eventIndex, 1);
  scheduleEvents[req.params.id] = events;

  const now = new Date();
  schedule.modified = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}`;
  schedule.classes = events.length;

  return res.status(204).send();
});

/*
 * GET /api/schedules/:id/export
 * Export schedule as .ics file
 */
router.get("/:id/export", (req, res) => {
  const schedule = schedules.find((s) => s.id === req.params.id);
  if (!schedule) {
    return res.status(404).json({ error: "Schedule not found" });
  }

  const events = scheduleEvents[req.params.id] || [];
  if (events.length === 0) {
    return res.status(400).json({ error: "Schedule has no events to export" });
  }

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return [hours, minutes];
  };

  const getNextOccurrence = (dayOfWeek) => {
    const today = new Date();
    const currentDay = today.getDay();
    const targetDay = dayOfWeek === 0 ? 1 : dayOfWeek + 1;
    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7;
    }
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilTarget);
    return [
      nextDate.getFullYear(),
      nextDate.getMonth() + 1, // ics uses 1-based months
      nextDate.getDate(),
    ];
  };

  // Set end date to 1 year from now
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);
  // Format as YYYYMMDDTHHMMSSZ for RRULE UNTIL
  const untilDateStr =
    endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  // RRULE format: https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html
  // Examples: https://icalendar.org/rrule-tool.html
  const icalDays = ["MO", "TU", "WE", "TH", "FR"];
  const icsEvents = events.map((event) => {
    const [year, month, day] = getNextOccurrence(event.day);
    const [startHour, startMinute] = parseTime(event.startTime);
    const [endHour, endMinute] = parseTime(event.endTime);

    let description = "";
    if (event.professor) {
      description = `Professor: ${event.professor}`;
    }

    const rrule = `FREQ=WEEKLY;BYDAY=${icalDays[event.day]};UNTIL=${untilDateStr}`;

    return {
      start: [year, month, day, startHour, startMinute],
      end: [year, month, day, endHour, endMinute],
      title: event.courseName,
      description: description,
      location: event.room || "",
      recurrenceRule: rrule,
    };
  });

  // Create the .ics file
  const result = createEvents(icsEvents);

  if (result.error) {
    console.error("Error creating .ics file:", result.error);
    return res.status(500).json({ error: "Failed to create .ics file" });
  }

  // Set headers for file download
  const filename = `${schedule.name.replace(/[^a-z0-9]/gi, "_")}.ics`;
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  res.send(result.value);
});

export default router;
