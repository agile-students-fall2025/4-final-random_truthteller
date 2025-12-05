// models/ProfessorReview.js
import mongoose from "mongoose";

const ProfessorReviewSchema = new mongoose.Schema(
  {
    source: { type: String, default: "ratemyprofessors" },

    professorName: { type: String, required: true },
    professorUrl: { type: String, required: true },

    // Course mapping
    rawCourseCode: { type: String, required: true }, // e.g. "CSCIUA3"
    courseCode: { type: String, required: true },    // e.g. "CSCI-UA 3"
    courseTitle: { type: String },                   // optional, if you want to add later

    // Ratings
    quality: { type: Number, required: true },       // RMP numeric 0–5
    difficulty: { type: Number, required: false },
    stars: { type: Number, required: true },         // 1–5 stars for ProfPick

    // Meta from RMP
    takenOn: { type: String },                       // e.g. "Sep 11th, 2025"
    wouldTakeAgain: { type: String },
    // Normalized percentage (0-100) when available
    wouldTakeAgainPct: { type: Number, required: false },
    grade: { type: String },
    textbook: { type: String },

    // The actual text review
    reviewText: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.models.ProfessorReview ||
  mongoose.model("ProfessorReview", ProfessorReviewSchema);
