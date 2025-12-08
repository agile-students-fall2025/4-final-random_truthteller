import "dotenv/config";
import mongoose from "mongoose";
import Review from "../models/Review.js";
import connectDB from "../config/database.js";

const courseReviews = [
  {
    course: "CSCI-UA 101 - Intro To Computer Science",
    rating: 5,
    reviewText:
      "Great on-ramp for folks new to programming. Labs were hands-on and the TAs were patient about explaining debugging steps.",
    date: "2024-11-02",
  },
  {
    course: "CSCI-UA 101 - Intro To Computer Science",
    rating: 4,
    reviewText:
      "Weekly projects take time, but they build on each other nicely. Start early and you'll be fine.",
    date: "2024-10-18",
  },
  {
    course: "CSCI-UA 101 - Intro To Computer Science",
    rating: 5,
    reviewText:
      "Lecture demos made the abstract concepts click. Loved the pair-programming labs.",
    date: "2024-09-07",
  },
  {
    course: "CSCI-UA 101 - Intro To Computer Science",
    rating: 3,
    reviewText:
      "A bit heavy on theory the first few weeks. The review sessions before exams helped balance things out.",
    date: "2024-08-28",
  },
  {
    course: "CSCI-UA 101 - Intro To Computer Science",
    rating: 4,
    reviewText:
      "Group project at the end is a big lift, but the rubric is clear. Make sure to coordinate with your partner early.",
    date: "2024-08-11",
  },
  {
    course: "CSCI-UA 2 - Intro To Computer Programming (No Prior Experience)",
    rating: 4,
    reviewText:
      "Recitation leaders break down the trickier integration techniques really well. Practice problems are worth doing.",
    date: "2024-10-01",
  },
  {
    course: "CSCI-UA 2 - Intro To Computer Programming (No Prior Experience)",
    rating: 3,
    reviewText:
      "Lectures move quick. Recitations help a lot, so don't skip them. Expect plenty of integration practice.",
    date: "2024-09-30",
  },
  {
    course: "CSCI-UA 2 - Intro To Computer Programming (No Prior Experience)",
    rating: 5,
    reviewText:
      "Professor tied new material back to Calc I seamlessly. The weekly quizzes kept me on pace.",
    date: "2024-09-14",
  },
  {
    course: "CSCI-UA 2 - Intro To Computer Programming (No Prior Experience)",
    rating: 4,
    reviewText:
      "We spent a lot of time on series and convergence tests, which definitely showed up on the final.",
    date: "2024-08-21",
  },
  {
    course: "BIO 110 - Biology I",
    rating: 5,
    reviewText:
      "Instructor connects concepts to real research. The lab reports are detailed but feedback is thorough.",
    date: "2024-09-12",
  },
  {
    course: "BIO 110 - Biology I",
    rating: 4,
    reviewText:
      "Lecture slides are posted early which makes note-taking easy. Expect to memorize a fair bit of vocabulary.",
    date: "2024-08-30",
  },
  {
    course: "BIO 110 - Biology I",
    rating: 5,
    reviewText:
      "Lab partners rotate every few weeks so you get comfortable with the whole cohort. The microscopy unit was a highlight.",
    date: "2024-08-22",
  },
  {
    course: "BIO 110 - Biology I",
    rating: 4,
    reviewText:
      "Clicker questions at the start of class are quick checks but do add up for participation points.",
    date: "2024-08-13",
  },
  {
    course: "ECON 201 - Microeconomics",
    rating: 4,
    reviewText:
      "Case studies make the theory click. Midterm is fair if you keep up with the weekly reflections.",
    date: "2024-08-25",
  },
  {
    course: "ECON 201 - Microeconomics",
    rating: 3,
    reviewText:
      "Problem sets can feel repetitive, but the instructor goes over the tricky ones in class.",
    date: "2024-08-16",
  },
  {
    course: "ECON 201 - Microeconomics",
    rating: 5,
    reviewText:
      "Loved the discussion on behavioral economics. Final project gives a lot of freedom to explore topics.",
    date: "2024-08-08",
  },
  {
    course: "ECON 201 - Microeconomics",
    rating: 4,
    reviewText:
      "Read the news blurbs the professor shares; they show up in the short-answer portion of exams.",
    date: "2024-07-31",
  },
  {
    course: "ART 110 - Drawing",
    rating: 5,
    reviewText:
      "Studio critiques are super supportive. You see real growth from week one to the final portfolio.",
    date: "2024-10-02",
  },
  {
    course: "ART 110 - Drawing",
    rating: 4,
    reviewText:
      "Supplies list is a little pricey, but everything gets used. The charcoal sessions are messy but fun.",
    date: "2024-09-19",
  },
  {
    course: "ART 110 - Drawing",
    rating: 5,
    reviewText:
      "Professor gives targeted feedback without being intimidating. Class playlists set a relaxed vibe.",
    date: "2024-09-05",
  },
  {
    course: "ART 110 - Drawing",
    rating: 4,
    reviewText:
      "Expect to sketch outside around campus even when it's chilly. Bring gloves you don't mind getting graphite on.",
    date: "2024-08-27",
  },
];

const professorReviews = [
  {
    professor: "Dr. Ada Lovelace",
    rating: 5,
    reviewText:
      "Explains concepts clearly and shares fun computing history tangents. Office hours are always packed for a reason.",
    date: "2024-10-08",
  },
  {
    professor: "Dr. Ada Lovelace",
    rating: 4,
    reviewText:
      "Assignments are challenging but she provides plenty of starter code and support. Very approachable.",
    date: "2024-09-21",
  },
  {
    professor: "Dr. Ada Lovelace",
    rating: 5,
    reviewText:
      "Runs the most efficient office hours I've seen—whiteboard, timers, the works. You leave with a plan.",
    date: "2024-09-02",
  },
  {
    professor: "Dr. Ada Lovelace",
    rating: 4,
    reviewText:
      "Expect cold calls, but they're more like guided questions. Keeps everyone engaged without being scary.",
    date: "2024-08-18",
  },
  {
    professor: "Prof. Alan Turing",
    rating: 4,
    reviewText:
      "Tough but fair grader. Lectures are dense, so bring questions to discussion sections.",
    date: "2024-09-27",
  },
  {
    professor: "Prof. Alan Turing",
    rating: 3,
    reviewText:
      "Homework hints are hidden in the lecture slides—rewatch the recordings if you're stuck.",
    date: "2024-09-12",
  },
  {
    professor: "Prof. Alan Turing",
    rating: 4,
    reviewText:
      "Takes time to explain algorithm trade-offs. The occasional British humor keeps things light.",
    date: "2024-08-30",
  },
  {
    professor: "Prof. Alan Turing",
    rating: 5,
    reviewText:
      "Capstone lecture on AI ethics was a standout. Definitely knows how to tie theory to modern topics.",
    date: "2024-08-10",
  },
  {
    professor: "Prof. Isaac Newton",
    rating: 3,
    reviewText:
      "Board work can be hard to read from the back. Homework keys are detailed though, which balances things out.",
    date: "2024-09-04",
  },
  {
    professor: "Prof. Isaac Newton",
    rating: 4,
    reviewText:
      "He'll toss apples at you if you fall asleep—kidding, but the dad jokes are constant. Keeps class lively.",
    date: "2024-08-29",
  },
  {
    professor: "Prof. Isaac Newton",
    rating: 3,
    reviewText:
      "Weekly problem sessions are optional but practically required if you want to ace the exams.",
    date: "2024-08-17",
  },
  {
    professor: "Prof. Isaac Newton",
    rating: 4,
    reviewText:
      "Uses clickers for instant feedback, which helps figure out what to review before quizzes.",
    date: "2024-08-09",
  },
  {
    professor: "Dr. Rosalind Franklin",
    rating: 5,
    reviewText:
      "Creates a welcoming lab environment and encourages peer feedback. Expect pop quizzes on reading notes.",
    date: "2024-08-31",
  },
  {
    professor: "Dr. Rosalind Franklin",
    rating: 5,
    reviewText:
      "Her passion for molecular biology is contagious. Gives shout-outs to student research every week.",
    date: "2024-08-22",
  },
  {
    professor: "Dr. Rosalind Franklin",
    rating: 4,
    reviewText:
      "Lab prep videos are a lifesaver. Watch them before every session and you'll fly through the experiments.",
    date: "2024-08-15",
  },
  {
    professor: "Dr. Rosalind Franklin",
    rating: 5,
    reviewText:
      "Gives super detailed feedback on lab notebooks. Learned a ton about scientific writing.",
    date: "2024-08-04",
  },
  {
    professor: "Prof. Adam Smith",
    rating: 4,
    reviewText:
      "Lots of real-world examples tied to current events. Participation matters more than you'd think.",
    date: "2024-08-19",
  },
  {
    professor: "Prof. Adam Smith",
    rating: 4,
    reviewText:
      "Weekly podcasts he records are a nice supplement to the readings. Makes econ feel less abstract.",
    date: "2024-08-11",
  },
  {
    professor: "Prof. Adam Smith",
    rating: 5,
    reviewText:
      "Brings in guest speakers from local startups to talk pricing strategy. Super engaging.",
    date: "2024-08-02",
  },
  {
    professor: "Prof. Adam Smith",
    rating: 3,
    reviewText:
      "Grades participation strictly—better speak up every few classes. Exams are otherwise straightforward.",
    date: "2024-07-26",
  },
];

const seed = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    await Review.deleteMany({});
    console.log("Cleared existing reviews");

    const courseReviewsWithType = courseReviews.map((r) => ({
      ...r,
      type: "course",
    }));
    const professorReviewsWithType = professorReviews.map((r) => ({
      ...r,
      type: "professor",
    }));

    await Review.insertMany([
      ...courseReviewsWithType,
      ...professorReviewsWithType,
    ]);
    console.log("Seeded reviews successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seed();
