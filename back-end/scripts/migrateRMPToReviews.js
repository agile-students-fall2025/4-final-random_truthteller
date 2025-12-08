// scripts/migrateRMPToReviews.js
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/database.js";
import ProfessorReview from "../models/ProfessorReview.js";
import Review from "../models/Review.js";

/**
 * Migration: copy/normalize ProfessorReview docs into Review collection
 * For each ProfessorReview we create/upsert:
 *  - a `professor` type Review with `professor` = professorName
 *  - a `course` type Review with `course` = courseCode (if present)
 * We avoid duplicates by upserting based on (type + professor/course + reviewText + date)
 */

const normalizeDate = (d) => {
  if (!d) return new Date();
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return new Date();
  return parsed;
};

async function migrate() {
  try {
    await connectDB();

    const docs = await ProfessorReview.find({}).lean();
    console.log(`Found ${docs.length} ProfessorReview documents`);

    let totalUpserted = 0;
    let totalSkipped = 0;

    for (const r of docs) {
      const date = normalizeDate(
        r.takenOn || r.createdAt || r.updatedAt || r.date,
      );

      // Create professor review object
      // professor-level review
      const profFilter = {
        type: "professor",
        professor: r.professorName,
        reviewText: r.reviewText,
        // match by date (exact) when possible
        date: date,
      };

      const profExisting = await Review.findOne(profFilter);
      if (profExisting) {
        // update existing review to add source metadata and rating if missing
        const updated = await Review.findByIdAndUpdate(
          profExisting._id,
          {
            $set: {
              rating:
                r.stars || Math.round(r.quality || 0) || profExisting.rating,
              source: "ratemyprofessors",
              sourceId: `${r._id}:prof`,
            },
          },
          { new: true },
        );
        if (updated) totalUpserted++;
      } else {
        const profDoc = {
          type: "professor",
          professor: r.professorName,
          rating: r.stars || Math.round(r.quality || 0) || 0,
          reviewText: r.reviewText,
          date: date,
          source: "ratemyprofessors",
          sourceId: `${r._id}:prof`,
        };

        const profRes = await Review.create(profDoc);
        if (profRes) totalUpserted++;
      }

      // If there's a course code, create a course-type review as well
      if (r.courseCode) {
        const courseFilter = {
          type: "course",
          course: r.courseCode,
          reviewText: r.reviewText,
          date: date,
        };

        const courseExisting = await Review.findOne(courseFilter);
        if (courseExisting) {
          const updated = await Review.findByIdAndUpdate(
            courseExisting._id,
            {
              $set: {
                rating:
                  r.stars ||
                  Math.round(r.quality || 0) ||
                  courseExisting.rating,
                source: "ratemyprofessors",
                sourceId: `${r._id}:course`,
              },
            },
            { new: true },
          );
          if (updated) totalUpserted++;
        } else {
          const courseDoc = {
            type: "course",
            course: r.courseCode,
            rating: r.stars || Math.round(r.quality || 0) || 0,
            reviewText: r.reviewText,
            date: date,
            source: "ratemyprofessors",
            sourceId: `${r._id}:course`,
          };

          const courseRes = await Review.create(courseDoc);
          if (courseRes) totalUpserted++;
        }
      }
    }

    console.log(`Migration done. Upserted ${totalUpserted} review(s).`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

migrate();
