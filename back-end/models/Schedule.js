import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // sections is an array of objects, where each object contains
    // a reference to the Course document and the _id of a section
    // within that course's 'sections' array.
    sections: [
      {
        _id: false, // Don't create an _id for this sub-array element
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        section: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Schedule", scheduleSchema);
