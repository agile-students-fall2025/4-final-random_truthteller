import { hideBin } from "yargs/helpers";
import yargs from "yargs";
import axios from "axios";
import "dotenv/config";
import * as cheerio from "cheerio";
import mongoose from "mongoose";
import Course from "../models/Course.js";
import connectDB from "../config/database.js";

const BASE_URL = "https://bulletins.nyu.edu";
const COURSES_BASE_URL = `${BASE_URL}/courses/`;

function extractDepartment(code) {
  if (!code) return "Unknown";
  const match = code.match(/^([A-Z]+)/);
  return match ? match[1] : "Unknown";
}

async function scrapeCourses(courseUrl) {
  const response = await axios.get(courseUrl, {
    timeout: 10000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  const $ = cheerio.load(response.data);
  const courses = [];

  $(".courseblock").each((i, elem) => {
    const $block = $(elem);
    const code = $block.find(".detail-code strong").first().text().trim() || "";
    const title =
      $block.find(".detail-title strong").first().text().trim() || "";
    const description =
      $block.find(".courseblockextra").first().text().trim() || "";
    const creditsText =
      $block.find(".detail-hours_html strong").first().text().trim() || "";

    // Handles ranges like "0-4 Credits" by taking the maximum value
    const creditsMatch = creditsText.match(/(\d+)(?:-(\d+))?/);
    let credits = 3;
    if (creditsMatch) {
      const min = parseInt(creditsMatch[1], 10);
      const max = creditsMatch[2] ? parseInt(creditsMatch[2], 10) : min;
      credits = Math.max(min, max);
    }

    if (code && title) {
      courses.push({
        code: code.trim(),
        title: title.trim(),
        description: description.trim() || "",
        credits: Number(credits),
        department: extractDepartment(code).trim(),
        sections: [],
      });
    }
  });

  return courses;
}

async function discoverCourses(limit = null) {
  const response = await axios.get(COURSES_BASE_URL, {
    timeout: 10000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  const $ = cheerio.load(response.data);
  const courseUrls = [];

  $("a[href*='/courses/'], a[href*='course']").each((i, elem) => {
    const href = $(elem).attr("href");
    if (href) {
      const fullUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
      if (!courseUrls.includes(fullUrl)) {
        courseUrls.push(fullUrl);
      }
    }
  });

  return limit ? courseUrls.slice(0, limit) : courseUrls;
}

async function scrapeAllCourses(options = {}) {
  const { limit = null, clear = false } = options;

  try {
    await connectDB();

    if (clear) {
      await Course.deleteMany({});
    }

    const courseUrls = await discoverCourses(limit);
    const courses = [];

    for (let i = 0; i < courseUrls.length; i++) {
      const url = courseUrls[i];
      console.log(`Scraping [${i + 1}/${courseUrls.length}]: ${url}`);

      try {
        const scrapedCourses = await scrapeCourses(url);
        if (scrapedCourses?.length > 0) {
          courses.push(...scrapedCourses);
        }
      } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
      }

      if (i < courseUrls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    if (courses.length > 0) {
      for (const courseData of courses) {
        await Course.findOneAndUpdate({ code: courseData.code }, courseData, {
          upsert: true,
          new: true,
        });
      }
      console.log(`Saved ${courses.length} courses to database`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error scraping courses:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

const argv = yargs(hideBin(process.argv))
  .option("clear", {
    type: "boolean",
    default: false,
    describe: "Clear existing courses before scraping",
  })
  .option("limit", {
    type: "number",
    default: null,
    describe: "Limit the number of courses to scrape",
  })
  .help()
  .alias("help", "h")
  .parseSync();

scrapeAllCourses({
  limit: argv.limit,
  clear: argv.clear,
});
