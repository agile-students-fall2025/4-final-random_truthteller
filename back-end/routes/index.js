const express = require("express");
const router = express.Router();
const courses = [
  { id: 1, code: "CS101", name: "Intro to Computer Science", instructor: "Dr. Smith", description: "Focuses on C++ and Python" },
  { id: 2, code: "MATH201", name: "Calculus II", instructor: "Prof. Lee", description: "Designed for students who completed Calculus I" },
  { id: 3, code: "HIST110", name: "World History", instructor: "Dr. Patel", description: "Focuses on World History from pre-historic times to modern times" }
];




router.use("/", require("./validation"));

router.get("/", (req, res) => {
  res.json({ message: "Welcome to ProfPick API" });
});

// Schedule routes
const schedulesRouter = require("../api/schedules");
router.use("/schedules", schedulesRouter);

router.get("/courses", (req, res) => {
  res.json(courses);
});
module.exports = router;
