import mongoose from "mongoose";

const flaggedReviewSchema = new mongoose.Schema({
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Review",
  },
  reviewType: {
    type: String,
    required: true,
    enum: ["course", "professor"],
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  flaggedAt: {
    type: Date,
    default: Date.now,
  },
  // Store review details for quick access (denormalized)
  course: String,
  professor: String,
  rating: Number,
  reviewText: String,
  date: Date,
});

// Add a virtual 'id' field that maps to _id
flaggedReviewSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtuals are included in JSON output
flaggedReviewSchema.set("toJSON", {
  virtuals: true,
});

export default mongoose.model("FlaggedReview", flaggedReviewSchema);

