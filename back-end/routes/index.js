const express = require("express");
const router = express.Router();
const courses = [
  { id: 1,
    code: "CS101",
    name: "Intro to Computer Science",
    instructor: "Dr. Smith", 
    description: "Focuses on C++ and Python", 
    credits: 2, 
    building: "Hall C", 
    days: ["Mon", "Wed"] 
  },
  { id: 2, 
    code: "MATH201", 
    name: "Calculus II", 
    instructor: "Prof. Lee", 
    description: "Designed for students who completed Calculus I", 
    credits: 4, 
    building: "Hall B", 
    days: ["Tue", "Thur"] 
  },
  { id: 3, 
    code: "HIST110", 
    name: "World History", 
    instructor: "Dr. Patel", 
    description: "Focuses on World History from pre-historic times to modern times", 
    credits: 3, 
    building: "Hall A", 
    days: ["Mon", "Wed"] 
  }
];

router.use("/", require("./validation"));
router.use("/schedules", require("./schedules.js"));
router.get("/courses", (req, res) => {
  const { building, credits, days } = req.query;

  let filtered = courses;

  if (building) {
    filtered = filtered.filter(
      (course) => course.building.toLowerCase() === building.toLowerCase()
    );
  }

  if (credits) {
    filtered = filtered.filter(
      (course) => course.credits === Number(credits)
    );
  }

  if (days) {
    const daysArray = days.split(","); 
    filtered = filtered.filter((course) =>
      daysArray.every((day) => course.days.includes(day))
    );
  }

  res.json(filtered);
});

module.exports = router;
