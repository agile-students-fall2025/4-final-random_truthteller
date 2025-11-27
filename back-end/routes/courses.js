const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

router.get("/", async (req, res) => {
  try {
    const { building, credits, days } = req.query;

    const query = {};
    if (building) {
      query["sections.location"] = { $regex: new RegExp(building, "i") };
    }
    if (credits) {
      query.credits = Number(credits);
    }
    if (days) {
      const daysArray = days.split(",");
      const DAY_MAP = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4 };
      const dayNumbers = daysArray
        .map((d) => DAY_MAP[d.trim()])
        .filter((d) => d !== undefined);
      if (dayNumbers.length > 0) {
        // Find courses where any section has an event on any of the selected days
        query["sections.events.day"] = { $in: dayNumbers };
      }
    }

    const courses = await Course.find(query);
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    return res.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    if (error.name === "CastError") {
      return res.status(404).json({ error: "Course not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
