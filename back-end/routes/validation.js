import express from "express";
import { validateSchedule } from "../utils/schedule.js";

const router = express.Router();

router.post("/validate-schedule", (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];

    // Defaults
    let creditMin = 12;
    let creditMax = 20;

    // Accept new fields
    if (Number.isFinite(Number(req.body.creditMin))) {
      creditMin = Number(req.body.creditMin);
    }
    if (Number.isFinite(Number(req.body.creditMax))) {
      creditMax = Number(req.body.creditMax);
    }

    // Backward compatibility: creditCap means "max"
    if (
      req.body.creditCap !== undefined &&
      !Number.isFinite(Number(req.body.creditMax))
    ) {
      creditMax = Number(req.body.creditCap);
    }

    const result = validateSchedule(items, { creditMin, creditMax });
    res.json(result);
  } catch (err) {
    console.error("validate-schedule error:", err);
    res.status(400).json({ ok: false, error: "Invalid input" });
  }
});

export default router;
