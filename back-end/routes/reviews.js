import express from "express";
import { requireAuth } from "./auth.js";
import Review from "../models/Review.js";

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
      return {};
  }
};

router.get("/course", async (req, res) => {
  try {
    const { sort } = req.query || {};
    const sortOptions = getSortObject(sort);
    const reviews = await Review.find({ type: "course" }).sort(sortOptions);
    res.json(reviews);
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
    const sortOptions = getSortObject(sort);
    // Case insensitive search with escaped regex
    const escapedName = escapeRegex(name);
    const reviews = await Review.find({
      type: "course",
      course: { $regex: new RegExp(`^${escapedName}$`, "i") },
    }).sort(sortOptions);
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching course reviews by name", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/professor", async (req, res) => {
  try {
    const { sort } = req.query || {};
    const sortOptions = getSortObject(sort);
    const reviews = await Review.find({ type: "professor" }).sort(sortOptions);
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching professor reviews", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/professor/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const { sort } = req.query || {};
    const sortOptions = getSortObject(sort);
    const escapedName = escapeRegex(name);
    const reviews = await Review.find({
      type: "professor",
      professor: { $regex: new RegExp(`^${escapedName}$`, "i") },
    }).sort(sortOptions);
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching professor reviews by name", err);
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

    res.status(201).json(newReview);
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

    res.status(201).json(newReview);
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
    res.json(reviews);
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
