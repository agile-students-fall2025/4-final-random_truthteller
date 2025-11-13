const express = require("express");
const router = express.Router();

const courses = [
  {
    id: 1,
    code: "CS 101",
    courseName: "CS 101 - Intro to CS",
    name: "CS 101 - Intro to CS",
    title: "Intro to Computer Science",
    description:
      "An introduction to programming and computational thinking. Covers basics of algorithms, data structures, and problem solving.",
    credits: 3,
    department: "Computer Science",
    instructor: "Dr. Ada Lovelace",
    building: "Hall A",
    days: ["Mon", "Wed"],
    sections: [
      {
        sectionId: "001",
        days: "Mon/Wed",
        time: "9:00 - 10:15",
        location: "Hall A",
        instructor: "Dr. Ada Lovelace",
      },
      {
        sectionId: "002",
        days: "Tue/Thu",
        time: "13:00 - 14:15",
        location: "Hall B",
        instructor: "Prof. Alan Turing",
      },
    ],
  },
  {
    id: 2,
    code: "MATH 220",
    courseName: "MATH 220 - Calculus II",
    name: "MATH 220 - Calculus II",
    title: "Calculus II",
    description:
      "Limits, integrals, sequences and series, and applications of integration.",
    credits: 4,
    department: "Mathematics",
    instructor: "Prof. Isaac Newton",
    building: "Hall B",
    days: ["Tue", "Thu"],
    sections: [
      {
        sectionId: "001",
        days: "Mon/Wed/Fri",
        time: "10:30 - 11:20",
        location: "Math Building 1",
        instructor: "Prof. Isaac Newton",
      },
    ],
  },
  {
    id: 3,
    code: "BIO 110",
    courseName: "BIO 110 - Biology I",
    name: "BIO 110 - Biology I",
    title: "Biology I",
    description:
      "Foundations of cellular biology, genetics, and evolution with lab sessions.",
    credits: 4,
    department: "Biology",
    instructor: "Dr. Rosalind Franklin",
    building: "Hall C",
    days: ["Tue", "Thu"],
    sections: [
      {
        sectionId: "001",
        days: "Tue/Thu",
        time: "8:30 - 9:45",
        location: "Bio Lab 2",
        instructor: "Dr. Rosalind Franklin",
      },
    ],
  },
  {
    id: 4,
    code: "ECON 201",
    courseName: "ECON 201 - Microeconomics",
    name: "ECON 201 - Microeconomics",
    title: "Microeconomics",
    description:
      "Introduction to supply and demand, consumer choice, and firm behavior.",
    credits: 3,
    department: "Economics",
    instructor: "Prof. Adam Smith",
    building: "Hall A",
    days: ["Mon", "Wed"],
    sections: [
      {
        sectionId: "001",
        days: "Mon/Wed",
        time: "14:00 - 15:15",
        location: "Econ Hall",
        instructor: "Prof. Adam Smith",
      },
    ],
  },
  {
    id: 5,
    code: "ART 110",
    courseName: "ART 110 - Drawing",
    name: "ART 110 - Drawing",
    title: "Drawing",
    description:
      "Basic drawing techniques, composition, and observational skills.",
    credits: 2,
    department: "Art",
    instructor: "Ms. Frida Kahlo",
    building: "Hall C",
    days: ["Fri"],
    sections: [
      {
        sectionId: "001",
        days: "Fri",
        time: "12:00 - 14:50",
        location: "Art Studio",
        instructor: "Ms. Frida Kahlo",
      },
    ],
  },
];

router.get("/", (req, res) => {
  const { building, credits, days } = req.query;

  let filtered = courses;

  if (building) {
    filtered = filtered.filter(
      (course) => course.building.toLowerCase() === building.toLowerCase(),
    );
  }

  if (credits) {
    filtered = filtered.filter((course) => course.credits === Number(credits));
  }

  if (days) {
    const daysArray = days.split(",");
    filtered = filtered.filter((course) =>
      daysArray.every((day) => course.days.includes(day)),
    );
  }

  res.json(filtered);
});

router.get("/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const course = courses.find((c) => c.id === id);

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  return res.json(course);
});

module.exports = router;
