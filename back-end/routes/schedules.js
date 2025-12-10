import express from "express";
import mongoose from "mongoose";
import { createEvents } from "ics";
import Schedule from "../models/Schedule.js";
import Course from "../models/Course.js";
import User from "../models/User.js";

const router = express.Router();

// Middleware to get user.
// TODO: Replace with actual authentication middleware
const getUser = async (req, res, next) => {
  const userId = req.query.userId;
  if (!userId) {
    let user = await User.findOne({ email: "test@example.com" });
    if (!user) {
      user = new User({
        email: "test@example.com",
        passwordHash: "dummy",
        accounts: [{ email: "test@example.com", name: "Test User" }],
      });
      await user.save();
      user.currentAccountId = user.accounts[0]._id;
      await user.save();
    }
    req.user = user;
  } else {
    try {
      req.user = await User.findById(userId);
      if (!req.user) {
        return res.status(404).json({ error: "User not found" });
      }
    } catch (e) {
      return res.status(400).json({ error: "Invalid userId" });
    }
  }
  next();
};

router.use(getUser);

// GET /api/schedules/current
router.get("/current", async (req, res) => {
  try {
    let scheduleId = req.user.currentSchedule;
    if (!scheduleId) {
      const firstSchedule = await Schedule.findOne({ user: req.user._id }).sort(
        { createdAt: 1 },
      );
      if (firstSchedule) {
        scheduleId = firstSchedule._id;
        req.user.currentSchedule = scheduleId;
        await req.user.save();
      }
    }
    res.json({ scheduleId: scheduleId?.toString() });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /api/schedules/current
router.put("/current", async (req, res) => {
  try {
    const { scheduleId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
      return res.status(400).json({ error: "Invalid scheduleId" });
    }
    const schedule = await Schedule.findOne({
      _id: scheduleId,
      user: req.user._id,
    });
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    req.user.currentSchedule = schedule._id;
    await req.user.save();
    res.json({ scheduleId: schedule._id.toString() });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/schedules
router.get("/", async (req, res) => {
  try {
    const schedules = await Schedule.find({ user: req.user._id });
    res.json(
      schedules.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        modified: s.updatedAt.toISOString().split("T")[0],
        classes: s.sections.length,
      })),
    );
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/schedules/:id
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid schedule ID" });
    }
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    res.json({
      id: schedule._id.toString(),
      name: schedule.name,
      modified: schedule.updatedAt.toISOString().split("T")[0],
      classes: schedule.sections.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/schedules
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Schedule name is required" });
    }
    const newSchedule = new Schedule({
      name: name.trim(),
      user: req.user._id,
      sections: [],
    });
    await newSchedule.save();
    res.status(201).json({
      id: newSchedule._id.toString(),
      name: newSchedule.name,
      modified: newSchedule.updatedAt.toISOString().split("T")[0],
      classes: 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /api/schedules/:id
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid schedule ID" });
    }
    const schedule = await Schedule.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    if (req.user.currentSchedule?.toString() === req.params.id) {
      req.user.currentSchedule = undefined;
      await req.user.save();
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/schedules/:id/events
router.get("/:id/events", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid schedule ID" });
    }
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate({
      path: "sections.course",
      model: "Course",
    });
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const events = [];
    for (const item of schedule.sections) {
      const course = item.course;
      if (course) {
        const section = course.sections.id(item.section);
        if (section) {
          for (const event of section.events) {
            events.push({
              id: `${course._id}-${section._id}-${event.day}`, // Composite ID
              courseName: `${course.code} - ${course.title}`,
              day: event.day,
              startTime: event.startTime,
              endTime: event.endTime,
              professor: section.instructor,
              room: section.location,
              credits: course.credits,
            });
          }
        }
      }
    }
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/schedules/:id/events
router.post("/:id/events", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid schedule ID" });
    }
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    if (schedule.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { events } = req.body;
    if (!events || !Array.isArray(events) || events.length === 0) {
      return res
        .status(400)
        .json({ error: "Bad Request: events array is missing or empty." });
    }

    // All events in the array are from the same section, so we can use the first one.
    const representativeEvent = events[0];
    const { courseName, professor, room, startTime, day } = representativeEvent;

    if (!courseName) {
      return res
        .status(400)
        .json({ error: "Bad Request: courseName is missing." });
    }

    const nameParts = courseName.split(" - ");
    if (nameParts.length < 2) {
      return res.status(400).json({
        error: "Bad Request: courseName is not in 'CODE - TITLE' format.",
      });
    }
    const courseCode = nameParts[0].trim();
    const courseTitle = nameParts.slice(1).join(" - ").trim();

    const course = await Course.findOne({
      code: courseCode,
      title: courseTitle,
    });

    if (!course) {
      return res
        .status(404)
        .json({ error: `Course with name "${courseName}" not found.` });
    }

    // Find the section. This is brittle.
    const section = course.sections.find(
      (s) =>
        s.instructor === professor &&
        s.location === room &&
        s.events.some((e) => e.day === day && e.startTime === startTime),
    );

    if (!section) {
      return res
        .status(404)
        .json({ error: "Could not find a matching section in the course." });
    }

    // Check if section is already in schedule
    if (schedule.sections.some((s) => s.section.equals(section._id))) {
      // Already exists, so we can just return success
      return res.status(200).json({ message: "Section already in schedule." });
    }

    schedule.sections.push({ course: course._id, section: section._id });
    await schedule.save();

    res.status(201).json({ message: "Section added to schedule." });
  } catch (error) {
    console.error("Failed to add events to schedule:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /api/schedules/:id/events/:eventId
router.delete("/:id/events/:eventId", async (req, res) => {
  try {
    const { id, eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid schedule ID" });
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    if (schedule.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // The eventId is a composite key: courseId-sectionId-day
    // We want to remove all sections associated with the course of this event.
    const eventIdParts = eventId.split("-");
    if (eventIdParts.length < 2) {
      return res.status(400).json({ error: "Invalid eventId format" });
    }
    const courseId = eventIdParts[0];
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: "Invalid courseId in eventId" });
    }

    const initialLength = schedule.sections.length;
    // Remove all sections that belong to this course
    schedule.sections = schedule.sections.filter(
      (s) => s.course.toString() !== courseId,
    );

    if (schedule.sections.length === initialLength) {
      return res.status(404).json({ error: "Course not found in schedule" });
    }

    await schedule.save();
    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete event:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/schedules/:id/export
router.get("/:id/export", async (req, res) => {
  // This implementation seems fine and can be reused.
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid schedule ID" });
    }

    const schedule = await Schedule.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("sections.course");

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const events = [];
    for (const item of schedule.sections) {
      const course = item.course;
      if (course) {
        const section = course.sections.id(item.section);
        if (section) {
          for (const event of section.events) {
            events.push({
              courseName: `${course.code} - ${course.title}`,
              day: event.day,
              startTime: event.startTime,
              endTime: event.endTime,
              professor: section.instructor,
              room: section.location,
            });
          }
        }
      }
    }

    if (events.length === 0) {
      return res
        .status(400)
        .json({ error: "Schedule has no events to export" });
    }

    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return [hours, minutes];
    };

    const getPreviousOccurrence = (dayOfWeek) => {
      const today = new Date();
      const currentDay = today.getDay();
      const targetDay = (dayOfWeek + 1) % 7; // Convert day index to Date.getDay() index (Sun=0)

      let daysToSubtract = currentDay - targetDay;
      if (daysToSubtract <= 0) {
        daysToSubtract += 7;
      }
      if (daysToSubtract > 6) daysToSubtract -= 7;

      const prevDate = new Date();
      prevDate.setDate(today.getDate() - daysToSubtract);
      return [
        prevDate.getFullYear(),
        prevDate.getMonth() + 1,
        prevDate.getDate(),
      ];
    };

    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    const untilDateStr =
      endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const icalDays = ["MO", "TU", "WE", "TH", "FR"];

    const icsEvents = events.map((event) => {
      const [year, month, day] = getPreviousOccurrence(event.day);
      const [startHour, startMinute] = parseTime(event.startTime);
      const [endHour, endMinute] = parseTime(event.endTime);

      return {
        start: [year, month, day, startHour, startMinute],
        end: [year, month, day, endHour, endMinute],
        title: event.courseName,
        description: `Professor: ${event.professor}`,
        location: event.room || "",
        recurrenceRule: `FREQ=WEEKLY;BYDAY=${icalDays[event.day]};UNTIL=${untilDateStr}`,
      };
    });

    const { error, value } = createEvents(icsEvents);

    if (error) {
      console.error("Error creating .ics file:", error);
      return res.status(500).json({ error: "Failed to create .ics file" });
    }

    const filename = `${schedule.name.replace(/[^a-z0-9]/gi, "_")}.ics`;
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(value);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
