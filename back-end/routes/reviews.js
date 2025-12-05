import express from "express";
import { requireAuth } from "./auth.js";
import Review from "../models/Review.js";
import ProfessorReview from "../models/ProfessorReview.js";

// Ensure API responses include source/sourceId when present
const serializeReview = (r) => {
  if (!r) return r;
  const obj = typeof r.toObject === "function" ? r.toObject() : r;
  return {
    ...obj,
    source: obj.source || null,
    sourceId: obj.sourceId || null,
  };
};

const router = express.Router();

const caseInsensitiveMatch = (value = "", target = "") =>
  value.trim().toLowerCase() === target.trim().toLowerCase();

// Sorting helper used by endpoints. Accepts sort keys:
// 'newest' | 'oldest' | 'most_positive' | 'most_negative'
// Note: With MongoDB we can sort directly in the query, but for now we'll keep the logic consistent
// or adapt it to use Mongoose sorting if possible.
// For simplicity and to match previous behavior, we can fetch then sort, or sort in DB.
// Let's sort in DB where possible for efficiency.

const getSortObject = (sortKey) => {
  switch ((sortKey || "").toLowerCase()) {
    case "newest":
    case "newest first":
      return { date: -1 };
    case "oldest":
    case "oldest first":
      return { date: 1 };
    case "most_positive":
    case "most positive first":
      return { rating: -1, date: -1 };
    case "most_negative":
    case "most negative first":
      return { rating: 1, date: -1 };
    default:
      // Default to newest first when no explicit sort provided
      return { date: -1 };
  }
};

// Helper to fetch reviews but always prioritize non-RMP reviews first
const fetchReviewsWithPriority = async (match = {}, sortKey) => {
  const sortOptions = getSortObject(sortKey) || { date: -1 };

  // Build aggregation pipeline: match -> add isRmp flag -> sort by isRmp then requested sort -> remove flag
  const pipeline = [
    { $match: match },
    {
      $addFields: {
        isRmp: {
          $cond: [{ $eq: ["$source", "ratemyprofessors"] }, 1, 0],
        },
      },
    },
    { $sort: Object.assign({ isRmp: 1 }, sortOptions) },
    { $project: { isRmp: 0 } },
  ];

  const docs = await Review.aggregate(pipeline).exec();
  return docs;
};

router.get("/course", async (req, res) => {
  try {
    const { sort } = req.query || {};
    const reviews = await fetchReviewsWithPriority({ type: "course" }, sort);
    res.json(reviews.map(serializeReview));
  } catch (err) {
    console.error("Error fetching course reviews", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

router.get("/course/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const { sort } = req.query || {};
    // Case insensitive search with escaped regex
    const escapedName = escapeRegex(name);
    const reviews = await fetchReviewsWithPriority(
      { type: "course", course: { $regex: new RegExp(`^${escapedName}$`, "i") } },
      sort
    );
    res.json(reviews.map(serializeReview));
  } catch (err) {
    console.error("Error fetching course reviews by name", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/professor", async (req, res) => {
  try {
    const { sort } = req.query || {};
    const reviews = await fetchReviewsWithPriority({ type: "professor" }, sort);
    res.json(reviews.map(serializeReview));
  } catch (err) {
    console.error("Error fetching professor reviews", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/professor/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const { sort } = req.query || {};
    const escapedName = escapeRegex(name);
    const reviews = await fetchReviewsWithPriority(
      { type: "professor", professor: { $regex: new RegExp(`^${escapedName}$`, "i") } },
      sort
    );
    res.json(reviews.map(serializeReview));
  } catch (err) {
    console.error("Error fetching professor reviews by name", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- RMP scraped reviews (ProfessorReview collection) ---
// GET all scraped professor reviews (optionally sorted)
router.get("/rmp/professor", async (req, res) => {
  try {
    const { sort } = req.query || {};
    const sortOptions = getSortObject(sort);
    const reviews = await ProfessorReview.find({}).sort(sortOptions);
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching RMP professor reviews", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET RMP reviews for a specific professor by (case-insensitive) name
router.get("/rmp/professor/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const { sort } = req.query || {};
    const sortOptions = getSortObject(sort);
    const escapedName = escapeRegex(name);
    const reviews = await ProfessorReview.find({
      professorName: { $regex: new RegExp(escapedName, "i") },
    }).sort(sortOptions);
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching RMP professor reviews by name", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET RMP reviews for a specific course code (canonical e.g. "CSCI-UA 3")
router.get("/rmp/course/:code", async (req, res) => {
  try {
    const { code } = req.params; // expecting canonical code like "CSCI-UA 3"
    const { sort } = req.query || {};
    const sortOptions = getSortObject(sort);
    const escapedCode = escapeRegex(code);
    const reviews = await ProfessorReview.find({
      courseCode: { $regex: new RegExp(`^${escapedCode}$`, "i") },
    }).sort(sortOptions);
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching RMP course reviews by code", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET aggregated RMP course statistics (quality, difficulty, wouldTakeAgain avg/range for all profs teaching the course)
router.get("/rmp/course-stats/:code", async (req, res) => {
  try {
    const { code } = req.params; // expecting canonical code like "CSCI-UA 3"
    const escapedCode = escapeRegex(code);

    // Aggregate all professor reviews for this course
    const reviews = await ProfessorReview.find({
      courseCode: { $regex: new RegExp(`^${escapedCode}$`, "i") },
    });

    if (reviews.length === 0) {
      return res.json({
        courseCode: code,
        professorCount: 0,
        reviewCount: 0,
        quality: null,
        difficulty: null,
        wouldTakeAgain: null,
        grade: null,
      });
    }

    // Parse numeric and string metrics
    const quality = reviews
      .map((r) => r.quality)
      .filter((q) => q !== null && q !== undefined && !isNaN(q));
    const difficulty = reviews
      .map((r) => r.difficulty)
      .filter((d) => d !== null && d !== undefined && !isNaN(d));

    // Parse wouldTakeAgain percentages (prefer numeric pct field, fallback to parsing string)
    const wouldTakeAgainPcts = reviews
      .map((r) => {
        if (r.wouldTakeAgainPct != null && !isNaN(r.wouldTakeAgainPct)) return Number(r.wouldTakeAgainPct);
        if (!r.wouldTakeAgain) return null;
        const match = String(r.wouldTakeAgain).match(/(\d{1,3})/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((p) => p !== null && !isNaN(p));

    // Parse grade distribution (e.g., "A", "B+", etc.) - just track mentions
    const gradeMap = {};
    reviews.forEach((r) => {
      if (r.grade) {
        gradeMap[r.grade] = (gradeMap[r.grade] || 0) + 1;
      }
    });

    // Calculate averages and ranges
    const calcStats = (arr) => {
      if (arr.length === 0) return null;
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      return {
        average: parseFloat(avg.toFixed(2)),
        min: Math.min(...arr),
        max: Math.max(...arr),
        count: arr.length,
      };
    };

    // For wouldTakeAgain, calculate average percentage
    const wouldTakeAgainStats = calcStats(wouldTakeAgainPcts);
    const qualityStats = calcStats(quality);
    const difficultyStats = calcStats(difficulty);

    // Find most common grade
    let mostCommonGrade = null;
    if (Object.keys(gradeMap).length > 0) {
      mostCommonGrade = Object.entries(gradeMap).sort((a, b) => b[1] - a[1])[0][0];
    }

    res.json({
      courseCode: code,
      uniqueProfessorCount: new Set(reviews.map((r) => r.professorName)).size,
      totalReviewCount: reviews.length,
      quality: qualityStats,
      difficulty: difficultyStats,
      wouldTakeAgain: wouldTakeAgainStats,
      mostCommonGrade,
      gradeDistribution: gradeMap,
    });
  } catch (err) {
    console.error("Error fetching RMP course statistics", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST route to submit a new review
router.post("/course", async (req, res) => {
  try {
    const { course, rating, reviewText } = req.body;

    if (!course || !rating || !reviewText) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const newReview = await Review.create({
      type: "course",
      course,
      rating: Number(rating),
      reviewText: reviewText.trim(),
    });

    res.status(201).json(serializeReview(newReview));
  } catch (err) {
    console.error("Error creating course review", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/professor", async (req, res) => {
  try {
    const { professor, rating, reviewText } = req.body;

    if (!professor || !rating || !reviewText) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const newReview = await Review.create({
      type: "professor",
      professor,
      rating: Number(rating),
      reviewText: reviewText.trim(),
    });

    res.status(201).json(serializeReview(newReview));
  } catch (err) {
    console.error("Error creating professor review", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST route to flag a review
router.post("/flag", (req, res) => {
  const { reviewId, reason, reviewType } = req.body;

  if (!reviewId || !reason) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // For now, we just acknowledge the flag - actual removal will be handled later
  // In a real app, you'd store this in a database
  console.log(`Review ${reviewId} (${reviewType}) flagged: ${reason}`);

  res.status(200).json({
    message: "Review flagged successfully",
    reviewId,
  });
});

// ADMIN: Get recent reviews
router.get("/recent", requireAuth, async (req, res) => {
  try {
    if (req.auth.email !== "admin@nyu.edu") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Sort by newest first
    const reviews = await Review.find().sort({ date: -1 });
    res.json(reviews.map(serializeReview));
  } catch (err) {
    console.error("Error fetching recent reviews", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ADMIN: Delete a review
router.delete("/:type/:id", requireAuth, async (req, res) => {
  try {
    if (req.auth.email !== "admin@nyu.edu") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    // Use findByIdAndDelete
    const deleted = await Review.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Review not found" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Error deleting review", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
