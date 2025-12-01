import axios from "axios";
import "dotenv/config";
import * as cheerio from "cheerio";
import mongoose from "mongoose";
import Course from "../models/Course.js";
import connectDB from "../config/database.js";

const BASE_URL = "https://cs.nyu.edu/dynamic/courses/schedule/";

// Map day abbreviations to day numbers (0 = Monday, 4 = Friday)
const DAY_MAP = {
  M: 0,
  T: 1,
  W: 2,
  R: 3,
  F: 4,
};

// Normalizes building / room strings from the CS schedule
// For some reason some classes have "Online Online" locations
function normalizeLocation(location) {
  if (!location) return "";
  const trimmed = location.trim();
  if (/^Online\s+Online$/i.test(trimmed)) {
    return "Online";
  }
  return trimmed;
}

// Cleans a course code by removing leading zeros and replacing dot with space
// Example: "CSCI-UA.0480" -> "CSCI-UA 480"
function cleanCourseCode(code) {
  const match = code.match(/^([A-Z]+-[A-Z]+)\.(0*)(\d+)$/);
  if (!match) {
    return code;
  }
  const [, prefix, leadingZeros, number] = match;
  return `${prefix} ${number}`;
}

// Extracts and cleans the base course code from a full course code with section
// Example: "CSCI-UA.0480-042" -> "CSCI-UA 480"
function extractBaseCode(fullCode) {
  const baseCodeMatch = fullCode.match(/^([A-Z]+-[A-Z]+\.\d+)/);
  const rawBaseCode = baseCodeMatch ? baseCodeMatch[1] : fullCode;
  return cleanCourseCode(rawBaseCode);
}

// Parses meeting time string (e.g., "TR 2:00-3:15PM") into events array
// Returns array of { day, startTime, endTime } objects
function parseMeetingTime(timeStr) {
  if (!timeStr || timeStr.trim() === "-" || timeStr.trim() === "") {
    return [];
  }

  const timeMatch = timeStr.match(
    /^([MTWRF]+)\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})([AP]M?)$/i,
  );

  if (!timeMatch) {
    return [];
  }

  const [, daysStr, startH, startM, endH, endM, period] = timeMatch;
  const days = daysStr
    .split("")
    .map((d) => DAY_MAP[d])
    .filter((d) => d !== undefined);

  if (days.length === 0) {
    return [];
  }

  let startHour = parseInt(startH, 10);
  let endHour = parseInt(endH, 10);
  const startMin = parseInt(startM, 10);
  const endMin = parseInt(endM, 10);
  const isPM = period.toUpperCase().startsWith("P");

  // Convert 12-hour format to 24-hour format
  if (isPM && startHour !== 12) {
    startHour += 12;
  }
  if (!isPM && startHour === 12) {
    startHour = 0;
  }

  if (isPM && endHour !== 12) {
    endHour += 12;
  }
  if (!isPM && endHour === 12) {
    endHour = 0;
  }

  const startTime = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;
  const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;

  // Create one event per day (e.g., "TR" creates events for Tuesday and Thursday)
  return days.map((day) => ({
    day,
    startTime,
    endTime,
  }));
}

// Extracts course description from collapsible div, excluding prerequisites
// Returns empty string if description not found
function extractDescription($, descId) {
  if (!descId) {
    return "";
  }

  const $descDiv = $(`#${descId}-desc`);
  if (!$descDiv.length) {
    return "";
  }

  const descText = $descDiv.text();
  const prereqIndex = descText.indexOf("Prerequisites");
  if (prereqIndex > 0) {
    return descText.substring(0, prereqIndex).trim();
  }
  return descText.trim();
}

// Scrapes CSCI-UA courses from the CS department schedule page
// Groups sections by base course code and saves to database
async function scrapeCSCourses() {
  try {
    await connectDB();

    await Course.deleteMany({});
    console.log("Cleared existing courses");

    const response = await axios.get(BASE_URL, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    // Map from base course code (e.g., "CSCI-UA.0480") to course object
    const coursesMap = new Map();

    let processedCount = 0;
    // Each course section is in an <li class="row"> element
    // Structure: span[0]=code, span[1]=title, span[2]=professor, span[3]=time, span[4]=room
    $("li.row").each((i, elem) => {
      const $li = $(elem);
      const $spans = $li.find("span.col-xs-12");

      // Extract course code (e.g., "CSCI-UA.0480-042")
      const $codeSpan = $spans.eq(0);
      const codeLink = $codeSpan.find("a").first();
      const codeText = codeLink
        .text()
        .trim()
        .replace(/\u200B/g, "");

      // Only process CSCI-UA undergraduate courses
      if (!codeText.match(/^CSCI-UA\.\d+-\d+$/)) {
        return;
      }

      const fullCode = codeText;
      const baseCode = extractBaseCode(fullCode);

      const $titleSpan = $spans.eq(1);
      const titleLink = $titleSpan.find("a").first();
      let title = titleLink.text().trim();
      if (!title) {
        title = $titleSpan.text().trim();
      }

      const $profSpan = $spans.eq(2);
      const instructor = $profSpan.text().trim();

      const $timeSpan = $spans.eq(3);
      const meetTime = $timeSpan.text().trim();

      const $roomSpan = $spans.eq(4);
      const location = normalizeLocation($roomSpan.text());

      const descId = $li.attr("id");
      const description = extractDescription($, descId);
      const events = parseMeetingTime(meetTime);

      // Group sections by base course code (multiple sections per course)
      if (!coursesMap.has(baseCode)) {
        coursesMap.set(baseCode, {
          code: baseCode,
          title: title || "Unknown",
          description: description,
          credits: 4, // CS schedule doesn't provide credit count so we default to 4
          department: "CSCI",
          sections: [],
        });
      }

      const course = coursesMap.get(baseCode);

      // Add section suffix to cleaned base code: "CSCI-UA 480" + "-042" -> "CSCI-UA 480-042"
      const sectionSuffix = fullCode.match(/-(\d+)$/);
      const sectionNumber = sectionSuffix
        ? `${baseCode}-${sectionSuffix[1]}`
        : baseCode;

      course.sections.push({
        number: sectionNumber, // Full section with cleaned course code (e.g., "CSCI-UA 480-042")
        events: events,
        instructor: instructor || "",
        location: location || "",
      });

      processedCount++;
    });

    console.log(`Processed ${processedCount} CSCI-UA course sections`);

    const courses = Array.from(coursesMap.values()).filter((course) =>
      course.code.startsWith("CSCI-UA"),
    );

    if (courses.length === 0) {
      console.log("No CSCI-UA courses found");
      await mongoose.connection.close();
      process.exit(1);
    }

    const savedCourses = await Course.insertMany(courses);
    console.log(`Saved ${savedCourses.length} CSCI-UA courses to database`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error scraping CS courses:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

scrapeCSCourses();
