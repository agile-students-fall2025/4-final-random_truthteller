import "dotenv/config";
import mongoose from "mongoose";
import Course from "../models/Course.js";
import connectDB from "../config/database.js";

const coursesData = [
  {
    code: "CS 101",
    title: "Intro to Computer Science",
    description:
      "An introduction to programming and computational thinking. Covers basics of algorithms, data structures, and problem solving.",
    credits: 3,
    department: "Computer Science",
    sections: [
      {
        number: "001",
        events: [
          { day: 0, startTime: "09:00", endTime: "10:15" },
          { day: 2, startTime: "09:00", endTime: "10:15" },
        ],
        instructor: "Dr. Ada Lovelace",
        location: "Hall A",
      },
      {
        number: "002",
        events: [
          { day: 1, startTime: "13:00", endTime: "14:15" },
          { day: 3, startTime: "13:00", endTime: "14:15" },
        ],
        instructor: "Prof. Alan Turing",
        location: "Hall B",
      },
    ],
  },
  {
    code: "MATH 220",
    title: "Calculus II",
    description:
      "Limits, integrals, sequences and series, and applications of integration.",
    credits: 4,
    department: "Mathematics",
    sections: [
      {
        number: "001",
        events: [
          { day: 0, startTime: "10:30", endTime: "11:20" },
          { day: 2, startTime: "10:30", endTime: "11:20" },
          { day: 4, startTime: "10:30", endTime: "11:20" },
        ],
        instructor: "Prof. Isaac Newton",
        location: "Math Building 1",
      },
    ],
  },
  {
    code: "BIO 110",
    title: "Biology I",
    description:
      "Foundations of cellular biology, genetics, and evolution with lab sessions.",
    credits: 4,
    department: "Biology",
    sections: [
      {
        number: "001",
        events: [
          { day: 1, startTime: "08:30", endTime: "09:45" },
          { day: 3, startTime: "08:30", endTime: "09:45" },
        ],
        instructor: "Dr. Rosalind Franklin",
        location: "Bio Lab 2",
      },
    ],
  },
  {
    code: "ECON 201",
    title: "Microeconomics",
    description:
      "Introduction to supply and demand, consumer choice, and firm behavior.",
    credits: 3,
    department: "Economics",
    sections: [
      {
        number: "001",
        events: [
          { day: 0, startTime: "14:00", endTime: "15:15" },
          { day: 2, startTime: "14:00", endTime: "15:15" },
        ],
        instructor: "Prof. Adam Smith",
        location: "Econ Hall",
      },
    ],
  },
  {
    code: "ART 110",
    title: "Drawing",
    description:
      "Basic drawing techniques, composition, and observational skills.",
    credits: 2,
    department: "Art",
    sections: [
      {
        number: "001",
        events: [{ day: 4, startTime: "12:00", endTime: "14:50" }],
        instructor: "Ms. Frida Kahlo",
        location: "Art Studio",
      },
    ],
  },
];

async function seedCourses() {
  try {
    await connectDB();

    await Course.deleteMany({});
    console.log("Cleared existing courses");

    const courses = await Course.insertMany(coursesData);
    console.log(`Seeded ${courses.length} courses`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding courses:", error);
    process.exit(1);
  }
}

seedCourses();
