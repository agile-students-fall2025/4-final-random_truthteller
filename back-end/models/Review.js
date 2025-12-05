//Modified

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ["course", "professor"],
    },
    course: {
        type: String,
        required: function () {
            return this.type === "course";
        },
    },
    professor: {
        type: String,
        required: function () {
            return this.type === "professor";
        },
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    // Source metadata (optional): where the review originated from
    source: {
        type: String,
        required: false,
    },
    sourceId: {
        type: String,
        required: false,
    },
    reviewText: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// Add a virtual 'id' field that maps to _id
reviewSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

// Ensure virtuals are included in JSON output
reviewSchema.set("toJSON", {
    virtuals: true,
});

export default mongoose.model("Review", reviewSchema);
