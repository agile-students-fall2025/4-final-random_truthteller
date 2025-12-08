// scripts/scrapeRMPReviews.js - Scrape RateMyProfessors using GraphQL API
import axios from "axios";
import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../config/database.js";
import Course from "../models/Course.js";
import ProfessorReview from "../models/ProfessorReview.js";

// Target CS courses we want reviews for
const TARGET_COURSE_SET = new Set([
  "CSCI-UA 2",
  "CSCI-UA 3",
  "CSCI-UA 4",
  "CSCI-UA 60",
  "CSCI-UA 61",
  "CSCI-UA 101",
  "CSCI-UA 102",
  "CSCI-UA 201",
  "CSCI-UA 202",
  "CSCI-UA 310",
  "CSCI-UA 380",
  "CSCI-UA 381",
  "CSCI-UA 430",
  "CSCI-UA 467",
  "CSCI-UA 469",
  "CSCI-UA 470",
  "CSCI-UA 472",
  "CSCI-UA 473",
  "CSCI-UA 474",
  "CSCI-UA 475",
  "CSCI-UA 476",
  "CSCI-UA 477",
  "CSCI-UA 478",
  "CSCI-UA 479",
  "CSCI-UA 480",
  "CSCI-UA 520",
  "CSCI-UA 897",
  "CSCI-UA 997",
]);

// NYU CS professors to scrape
const PROFESSORS = [
  {
    name: "Amanda Steigman",
    url: "https://www.ratemyprofessors.com/professor/2873614",
  },
  {
    name: "Julie Lizardo",
    url: "https://www.ratemyprofessors.com/professor/2719545",
  },
  {
    name: "Deena Engel",
    url: "https://www.ratemyprofessors.com/professor/686184",
  },
  {
    name: "Karl Rosenberg",
    url: "https://www.ratemyprofessors.com/professor/2951855",
  },
  {
    name: "Mihir Patil",
    url: "https://www.ratemyprofessors.com/professor/2835462",
  },
  {
    name: "Susan Liao",
    url: "https://www.ratemyprofessors.com/professor/2760063",
  },
  {
    name: "Alvaro Olsen",
    url: "https://www.ratemyprofessors.com/professor/2325076",
  },
  {
    name: "Adam Scher",
    url: "https://www.ratemyprofessors.com/professor/1852405",
  },
  {
    name: "Mark Ramos",
    url: "https://www.ratemyprofessors.com/professor/2756762",
  },
  {
    name: "Tobias Blickhan",
    url: "https://www.ratemyprofessors.com/professor/3009418",
  },
  {
    name: "Candido Cabo",
    url: "https://www.ratemyprofessors.com/professor/2567373",
  },
  {
    name: "Hilbert Gene Locklear",
    url: "https://www.ratemyprofessors.com/professor/2537849",
  },
  {
    name: "Evan Korth",
    url: "https://www.ratemyprofessors.com/professor/272737",
  },
  {
    name: "Benjamin Goldberg",
    url: "https://www.ratemyprofessors.com/professor/216065",
  },
  {
    name: "Aurojit Panda",
    url: "https://www.ratemyprofessors.com/professor/2524333",
  },
  {
    name: "Michael Walfish",
    url: "https://www.ratemyprofessors.com/professor/2016443",
  },
  {
    name: "Oded Regev",
    url: "https://www.ratemyprofessors.com/professor/2025897",
  },
  {
    name: "Joseph Versoza",
    url: "https://www.ratemyprofessors.com/professor/1889463",
  },
  {
    name: "Matthew Zeidenberg",
    url: "https://www.ratemyprofessors.com/professor/2731531",
  },
  {
    name: "Davi Geiger",
    url: "https://www.ratemyprofessors.com/professor/1904391",
  },
  {
    name: "Bhubaneswar Mishra",
    url: "https://www.ratemyprofessors.com/professor/2254039",
  },
  {
    name: "Mohamed Zahran",
    url: "https://www.ratemyprofessors.com/professor/1743821",
  },
  {
    name: "Adam Meyers",
    url: "https://www.ratemyprofessors.com/professor/2105994",
  },
  {
    name: "Craig Kapp",
    url: "https://www.ratemyprofessors.com/professor/1579749",
  },
  {
    name: "Michael Tao",
    url: "https://www.ratemyprofessors.com/professor/2910630",
  },
  {
    name: "Joanna Klukowska",
    url: "https://www.ratemyprofessors.com/professor/1852308",
  },
  {
    name: "Joseph Bonneau",
    url: "https://www.ratemyprofessors.com/professor/2352147",
  },
  {
    name: "Lerrel Pinto",
    url: "https://www.ratemyprofessors.com/professor/2792558",
  },
  {
    name: "Alfredo Canziani",
    url: "https://www.ratemyprofessors.com/professor/2599268",
  },
  {
    name: "Ernest Davis",
    url: "https://www.ratemyprofessors.com/professor/887858",
  },
  {
    name: "Khye Borg Liew",
    url: "https://www.ratemyprofessors.com/professor/2854679",
  },
  {
    name: "Douglas Moody",
    url: "https://www.ratemyprofessors.com/professor/2815171",
  },
  {
    name: "Ahmad Emad",
    url: "https://www.ratemyprofessors.com/professor/3043400",
  },
  {
    name: "Gezim Hakramaj",
    url: "https://www.ratemyprofessors.com/professor/3004612",
  },
  {
    name: "Benedikt Bünz",
    url: "https://www.ratemyprofessors.com/professor/3035862",
  },
  {
    name: "Alan Amin",
    url: "https://www.ratemyprofessors.com/professor/2956463",
  },
  {
    name: "Sana Odeh",
    url: "https://www.ratemyprofessors.com/professor/686173",
  },
  {
    name: "Sumit Chopra",
    url: "https://www.ratemyprofessors.com/professor/2759150",
  },
  {
    name: "Daniel Zint",
    url: "https://www.ratemyprofessors.com/professor/2907109",
  },
  {
    name: "Anasse Bari",
    url: "https://www.ratemyprofessors.com/professor/2094203",
  },
  {
    name: "Amos Bloomberg",
    url: "https://www.ratemyprofessors.com/professor/1594259",
  },
  {
    name: "Hasan Aljabbouli",
    url: "https://www.ratemyprofessors.com/professor/2702098",
  },
  {
    name: "Rotem Oshman",
    url: "https://www.ratemyprofessors.com/professor/3044653",
  },
  {
    name: "Gizem Kayar",
    url: "https://www.ratemyprofessors.com/professor/2792978",
  },
  {
    name: "Joshua Clayton",
    url: "https://www.ratemyprofessors.com/professor/1808953",
  },
];

/**
 * Normalize raw course codes (like "CSCIUA3", "CS 3", etc.) to canonical "CSCI-UA 3" format
 */
function normalizeCourseCode(rawCourseCode) {
  if (!rawCourseCode) return null;

  let s = String(rawCourseCode).toUpperCase().trim();

  // Remove leading bullets/dashes and common punctuation separators
  s = s.replace(/^[*•\-\u2022]+\s*/, "");
  s = s.replace(/[\|_:\/(),]/g, " ");
  s = s.replace(/\s+/g, " ");

  // Try matching explicit course code patterns like:
  // "CSCI-UA 3", "CS 3", "CSCI UA3", "CSCI-UA3", "COMP SCI 3", etc.
  const codeMatch = s.match(
    /(?:CSCI|COMP(?:UTER)?\s*SCI|CS)\s*(?:-?\s*UA\s*)?\.?\s*(\d{1,3})/i,
  );
  if (codeMatch && codeMatch[1]) {
    const number = parseInt(codeMatch[1], 10);
    if (!Number.isNaN(number)) {
      const canonical = `CSCI-UA ${number}`;
      if (TARGET_COURSE_SET.has(canonical)) return canonical;
    }
  }

  // Fallback: find the last numeric token in the string and try that
  const fallbackDigits = s.match(/(\d{1,3})/g);
  if (fallbackDigits && fallbackDigits.length > 0) {
    const number = parseInt(fallbackDigits[fallbackDigits.length - 1], 10);
    if (!Number.isNaN(number)) {
      const canonical = `CSCI-UA ${number}`;
      if (TARGET_COURSE_SET.has(canonical)) return canonical;
    }
  }

  return null;
}

/**
 * Convert RMP numeric quality to 1–5 stars
 */
function scoreToStars(score) {
  const n = Number(score);
  if (Number.isNaN(n)) return null;
  const rounded = Math.round(n);
  return Math.min(5, Math.max(1, rounded));
}

/**
 * Fetch professor ratings from RMP's GraphQL API
 */
async function fetchProfessorRatings(profId) {
  const query = `
    query GetProfessor($id: ID!) {
      node(id: $id) {
        ... on Teacher {
          firstName
          lastName
          ratings(first: 100) {
            edges {
              node {
                comment
                clarityRating
                difficultyRating
                wouldTakeAgain
                grade
                class
                textbookUse
                date
              }
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://www.ratemyprofessors.com/graphql",
      { query, variables: { id: profId } },
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Authorization: "Basic dGVzdDp0ZXN0",
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );

    if (response.data.errors) {
      console.error("GraphQL errors:", response.data.errors);
      return [];
    }

    const ratings =
      response.data.data?.node?.ratings?.edges?.map((e) => e.node) || [];
    return ratings;
  } catch (error) {
    console.error(`Error fetching ratings:`, error.message);
    return [];
  }
}

/**
 * Convert RMP rating object to app review format
 */
function convertRatingToReview(rating) {
  const courseCode = normalizeCourseCode(rating.class);
  if (!courseCode) {
    return null;
  }

  const stars = scoreToStars(rating.clarityRating);
  if (stars == null) return null;

  // Normalize wouldTakeAgain into a numeric percentage when possible
  const rawWTA = rating.wouldTakeAgain;
  let wouldTakeAgainPct = null;

  if (rawWTA != null) {
    if (typeof rawWTA === "number") {
      // If value is 0..1 (fraction), convert to percent
      if (rawWTA > 0 && rawWTA <= 1) {
        wouldTakeAgainPct = Math.round(rawWTA * 100);
      } else if (rawWTA >= 0 && rawWTA <= 100) {
        wouldTakeAgainPct = Math.round(rawWTA);
      }
    } else if (typeof rawWTA === "string") {
      const m = rawWTA.match(/(\d{1,3})/);
      if (m) wouldTakeAgainPct = parseInt(m[1], 10);
    }
  }

  return {
    rawCourseCode: rating.class,
    courseCode,
    takenOn: new Date(rating.date).toISOString().split("T")[0],
    grade: rating.grade || null,
    wouldTakeAgain: rawWTA != null ? String(rawWTA) : null,
    wouldTakeAgainPct: wouldTakeAgainPct,
    textbook:
      rating.textbookUse === 1
        ? "Yes"
        : rating.textbookUse === -1
          ? "N/A"
          : "No",
    quality: rating.clarityRating,
    difficulty: rating.difficultyRating,
    stars,
    reviewText: rating.comment || "",
  };
}

/**
 * Scrape a single professor using GraphQL API
 */
async function scrapeProfessor(prof) {
  console.log(`Scraping RMP for ${prof.name} -> ${prof.url}`);

  // Extract prof ID from URL (e.g., /professor/3069136)
  const urlMatch = prof.url.match(/\/professor\/(\d+)/);
  if (!urlMatch) {
    console.error(`Could not extract professor ID from ${prof.url}`);
    return [];
  }

  const profNumId = urlMatch[1];
  // Convert numeric ID to RMP's base64 format: "VGVhY2hlci0{id}"
  const profId = Buffer.from(`Teacher-${profNumId}`).toString("base64");

  const ratings = await fetchProfessorRatings(profId);

  const reviews = ratings.map(convertRatingToReview).filter((r) => r !== null);

  console.log(
    `Parsed ${reviews.length} matching reviews on RMP for ${prof.name}`,
  );

  return reviews.map((r) => ({
    ...r,
    professorName: prof.name,
    professorUrl: prof.url,
    source: "ratemyprofessors",
  }));
}

/**
 * (Optional) Get the set of instructors that actually teach target CS courses
 */
async function getTargetInstructors() {
  const courses = await Course.find({
    code: { $in: Array.from(TARGET_COURSE_SET) },
  });

  const names = new Set();
  for (const course of courses) {
    for (const section of course.sections || []) {
      if (section.instructor) {
        names.add(section.instructor.trim());
      }
    }
  }
  return Array.from(names).sort();
}

/**
 * Main entry point
 */
async function scrapeAll() {
  try {
    await connectDB();

    // Optional: clear old RMP reviews so you can re-scrape fresh
    // await ProfessorReview.deleteMany({ source: "ratemyprofessors" });

    // Optional: see which instructors from Course DB you *should* cover
    const instructors = await getTargetInstructors();
    console.log("Instructors teaching target CS courses:", instructors);

    let totalSaved = 0;

    for (const prof of PROFESSORS) {
      try {
        const reviews = await scrapeProfessor(prof);

        if (reviews.length === 0) {
          console.log(`No matching reviews found for ${prof.name}`);
          continue;
        }

        // Upsert logic: avoid duplicates if you rerun often.
        // We treat (professorUrl + courseCode + takenOn + reviewText) as "unique".
        const bulkOps = reviews.map((r) => ({
          updateOne: {
            filter: {
              professorUrl: r.professorUrl,
              courseCode: r.courseCode,
              takenOn: r.takenOn,
              reviewText: r.reviewText,
            },
            update: { $set: r },
            upsert: true,
          },
        }));

        if (bulkOps.length > 0) {
          const res = await ProfessorReview.bulkWrite(bulkOps);
          const upserts = res.upsertedCount || 0;
          const modified = res.modifiedCount || 0;

          totalSaved += upserts + modified;
          console.log(
            `Saved/updated ${upserts + modified} reviews for ${prof.name}`,
          );
        }
      } catch (err) {
        console.error(`Error scraping ${prof.name}:`, err.message);
      }
    }

    console.log(`Done. Total reviews saved/updated: ${totalSaved}`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Fatal error scraping RMP reviews:", err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

scrapeAll();
