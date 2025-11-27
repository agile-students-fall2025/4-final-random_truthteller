const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  // day: 0 = Monday, 1 = Tuesday, ..., 4 = Friday
  day: {
    type: Number,
    required: true,
    min: 0,
    max: 4,
  },
  // startTime: "HH:MM" format (e.g., "09:00")
  startTime: {
    type: String,
    required: true,
    match: /^\d{2}:\d{2}$/,
  },
  // endTime: "HH:MM" format (e.g., "10:30")
  endTime: {
    type: String,
    required: true,
    match: /^\d{2}:\d{2}$/,
  },
});

const sectionSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    trim: true,
  },
  events: [eventSchema],
  instructor: {
    type: String,
    default: "",
    trim: true,
  },
  location: {
    type: String,
    default: "",
    trim: true,
  },
});

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    credits: {
      type: Number,
      required: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    sections: [sectionSchema],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Course", courseSchema);
