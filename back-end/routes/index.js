const express = require("express");
const router = express.Router();
const courses = [
  { id: 1, code: "CS101", name: "Intro to Computer Science", instructor: "Dr. Smith" },
  { id: 2, code: "MATH201", name: "Calculus II", instructor: "Prof. Lee" },
  { id: 3, code: "HIST110", name: "World History", instructor: "Dr. Patel" }
];




router.get("/", (req, res) => {
  res.json({ message: "Welcome to ProfPick API" });
});

router.get("/courses", (req, res) => {
  res.json(courses);
});
module.exports = router;
