const express = require("express");

const router = express.Router();

const courseReviews = [
  {
    id: 1,
    course: "CS 101 - Intro to CS",
    rating: 5,
    reviewText:
      "Great on-ramp for folks new to programming. Labs were hands-on and the TAs were patient about explaining debugging steps.",
    date: "2024-11-02",
  },
  {
    id: 2,
    course: "CS 101 - Intro to CS",
    rating: 4,
    reviewText:
      "Weekly projects take time, but they build on each other nicely. Start early and you'll be fine.",
    date: "2024-10-18",
  },
  {
    id: 3,
    course: "CS 101 - Intro to CS",
    rating: 5,
    reviewText:
      "Lecture demos made the abstract concepts click. Loved the pair-programming labs.",
    date: "2024-09-07",
  },
  {
    id: 4,
    course: "CS 101 - Intro to CS",
    rating: 3,
    reviewText:
      "A bit heavy on theory the first few weeks. The review sessions before exams helped balance things out.",
    date: "2024-08-28",
  },
  {
    id: 5,
    course: "CS 101 - Intro to CS",
    rating: 4,
    reviewText:
      "Group project at the end is a big lift, but the rubric is clear. Make sure to coordinate with your partner early.",
    date: "2024-08-11",
  },
  {
    id: 6,
    course: "MATH 220 - Calculus II",
    rating: 4,
    reviewText:
      "Recitation leaders break down the trickier integration techniques really well. Practice problems are worth doing.",
    date: "2024-10-01",
  },
  {
    id: 7,
    course: "MATH 220 - Calculus II",
    rating: 3,
    reviewText:
      "Lectures move quick. Recitations help a lot, so don't skip them. Expect plenty of integration practice.",
    date: "2024-09-30",
  },
  {
    id: 8,
    course: "MATH 220 - Calculus II",
    rating: 5,
    reviewText:
      "Professor tied new material back to Calc I seamlessly. The weekly quizzes kept me on pace.",
    date: "2024-09-14",
  },
  {
    id: 9,
    course: "MATH 220 - Calculus II",
    rating: 4,
    reviewText:
      "We spent a lot of time on series and convergence tests, which definitely showed up on the final.",
    date: "2024-08-21",
  },
  {
    id: 10,
    course: "BIO 110 - Biology I",
    rating: 5,
    reviewText:
      "Instructor connects concepts to real research. The lab reports are detailed but feedback is thorough.",
    date: "2024-09-12",
  },
  {
    id: 11,
    course: "BIO 110 - Biology I",
    rating: 4,
    reviewText:
      "Lecture slides are posted early which makes note-taking easy. Expect to memorize a fair bit of vocabulary.",
    date: "2024-08-30",
  },
  {
    id: 12,
    course: "BIO 110 - Biology I",
    rating: 5,
    reviewText:
      "Lab partners rotate every few weeks so you get comfortable with the whole cohort. The microscopy unit was a highlight.",
    date: "2024-08-22",
  },
  {
    id: 13,
    course: "BIO 110 - Biology I",
    rating: 4,
    reviewText:
      "Clicker questions at the start of class are quick checks but do add up for participation points.",
    date: "2024-08-13",
  },
  {
    id: 14,
    course: "ECON 201 - Microeconomics",
    rating: 4,
    reviewText:
      "Case studies make the theory click. Midterm is fair if you keep up with the weekly reflections.",
    date: "2024-08-25",
  },
  {
    id: 15,
    course: "ECON 201 - Microeconomics",
    rating: 3,
    reviewText:
      "Problem sets can feel repetitive, but the instructor goes over the tricky ones in class.",
    date: "2024-08-16",
  },
  {
    id: 16,
    course: "ECON 201 - Microeconomics",
    rating: 5,
    reviewText:
      "Loved the discussion on behavioral economics. Final project gives a lot of freedom to explore topics.",
    date: "2024-08-08",
  },
  {
    id: 17,
    course: "ECON 201 - Microeconomics",
    rating: 4,
    reviewText:
      "Read the news blurbs the professor shares; they show up in the short-answer portion of exams.",
    date: "2024-07-31",
  },
  {
    id: 18,
    course: "ART 110 - Drawing",
    rating: 5,
    reviewText:
      "Studio critiques are super supportive. You see real growth from week one to the final portfolio.",
    date: "2024-10-02",
  },
  {
    id: 19,
    course: "ART 110 - Drawing",
    rating: 4,
    reviewText:
      "Supplies list is a little pricey, but everything gets used. The charcoal sessions are messy but fun.",
    date: "2024-09-19",
  },
  {
    id: 20,
    course: "ART 110 - Drawing",
    rating: 5,
    reviewText:
      "Professor gives targeted feedback without being intimidating. Class playlists set a relaxed vibe.",
    date: "2024-09-05",
  },
  {
    id: 21,
    course: "ART 110 - Drawing",
    rating: 4,
    reviewText:
      "Expect to sketch outside around campus even when it's chilly. Bring gloves you don't mind getting graphite on.",
    date: "2024-08-27",
  },
];

const professorReviews = [
  {
    id: 1,
    professor: "Dr. Ada Lovelace",
    rating: 5,
    reviewText:
      "Explains concepts clearly and shares fun computing history tangents. Office hours are always packed for a reason.",
    date: "2024-10-08",
  },
  {
    id: 2,
    professor: "Dr. Ada Lovelace",
    rating: 4,
    reviewText:
      "Assignments are challenging but she provides plenty of starter code and support. Very approachable.",
    date: "2024-09-21",
  },
  {
    id: 3,
    professor: "Dr. Ada Lovelace",
    rating: 5,
    reviewText:
      "Runs the most efficient office hours I've seen—whiteboard, timers, the works. You leave with a plan.",
    date: "2024-09-02",
  },
  {
    id: 4,
    professor: "Dr. Ada Lovelace",
    rating: 4,
    reviewText:
      "Expect cold calls, but they're more like guided questions. Keeps everyone engaged without being scary.",
    date: "2024-08-18",
  },
  {
    id: 5,
    professor: "Prof. Alan Turing",
    rating: 4,
    reviewText:
      "Tough but fair grader. Lectures are dense, so bring questions to discussion sections.",
    date: "2024-09-27",
  },
  {
    id: 6,
    professor: "Prof. Alan Turing",
    rating: 3,
    reviewText:
      "Homework hints are hidden in the lecture slides—rewatch the recordings if you're stuck.",
    date: "2024-09-12",
  },
  {
    id: 7,
    professor: "Prof. Alan Turing",
    rating: 4,
    reviewText:
      "Takes time to explain algorithm trade-offs. The occasional British humor keeps things light.",
    date: "2024-08-30",
  },
  {
    id: 8,
    professor: "Prof. Alan Turing",
    rating: 5,
    reviewText:
      "Capstone lecture on AI ethics was a standout. Definitely knows how to tie theory to modern topics.",
    date: "2024-08-10",
  },
  {
    id: 9,
    professor: "Prof. Isaac Newton",
    rating: 3,
    reviewText:
      "Board work can be hard to read from the back. Homework keys are detailed though, which balances things out.",
    date: "2024-09-04",
  },
  {
    id: 10,
    professor: "Prof. Isaac Newton",
    rating: 4,
    reviewText:
      "He'll toss apples at you if you fall asleep—kidding, but the dad jokes are constant. Keeps class lively.",
    date: "2024-08-29",
  },
  {
    id: 11,
    professor: "Prof. Isaac Newton",
    rating: 3,
    reviewText:
      "Weekly problem sessions are optional but practically required if you want to ace the exams.",
    date: "2024-08-17",
  },
  {
    id: 12,
    professor: "Prof. Isaac Newton",
    rating: 4,
    reviewText:
      "Uses clickers for instant feedback, which helps figure out what to review before quizzes.",
    date: "2024-08-09",
  },
  {
    id: 13,
    professor: "Dr. Rosalind Franklin",
    rating: 5,
    reviewText:
      "Creates a welcoming lab environment and encourages peer feedback. Expect pop quizzes on reading notes.",
    date: "2024-08-31",
  },
  {
    id: 14,
    professor: "Dr. Rosalind Franklin",
    rating: 5,
    reviewText:
      "Her passion for molecular biology is contagious. Gives shout-outs to student research every week.",
    date: "2024-08-22",
  },
  {
    id: 15,
    professor: "Dr. Rosalind Franklin",
    rating: 4,
    reviewText:
      "Lab prep videos are a lifesaver. Watch them before every session and you'll fly through the experiments.",
    date: "2024-08-15",
  },
  {
    id: 16,
    professor: "Dr. Rosalind Franklin",
    rating: 5,
    reviewText:
      "Gives super detailed feedback on lab notebooks. Learned a ton about scientific writing.",
    date: "2024-08-04",
  },
  {
    id: 17,
    professor: "Prof. Adam Smith",
    rating: 4,
    reviewText:
      "Lots of real-world examples tied to current events. Participation matters more than you'd think.",
    date: "2024-08-19",
  },
  {
    id: 18,
    professor: "Prof. Adam Smith",
    rating: 4,
    reviewText:
      "Weekly podcasts he records are a nice supplement to the readings. Makes econ feel less abstract.",
    date: "2024-08-11",
  },
  {
    id: 19,
    professor: "Prof. Adam Smith",
    rating: 5,
    reviewText:
      "Brings in guest speakers from local startups to talk pricing strategy. Super engaging.",
    date: "2024-08-02",
  },
  {
    id: 20,
    professor: "Prof. Adam Smith",
    rating: 3,
    reviewText:
      "Grades participation strictly—better speak up every few classes. Exams are otherwise straightforward.",
    date: "2024-07-26",
  },
];

const caseInsensitiveMatch = (value = "", target = "") =>
  value.trim().toLowerCase() === target.trim().toLowerCase();

router.get("/course", (req, res) => {
  res.json(courseReviews);
});

router.get("/course/:name", (req, res) => {
  const { name } = req.params;
  const filtered = courseReviews.filter(({ course }) =>
    caseInsensitiveMatch(course, name),
  );
  res.json(filtered);
});

router.get("/professor", (req, res) => {
  res.json(professorReviews);
});

router.get("/professor/:name", (req, res) => {
  const { name } = req.params;
  const filtered = professorReviews.filter(({ professor }) =>
    caseInsensitiveMatch(professor, name),
  );
  res.json(filtered);
});

// POST route to submit a new review
router.post("/course", (req, res) => {
  const { course, rating, reviewText } = req.body;

  if (!course || !rating || !reviewText) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  const newReview = {
    id: courseReviews.length + 1,
    course,
    rating: Number(rating),
    reviewText: reviewText.trim(),
    date: new Date().toISOString().split("T")[0],
  };

  courseReviews.push(newReview);
  res.status(201).json(newReview);
});

router.post("/professor", (req, res) => {
  const { professor, rating, reviewText } = req.body;

  if (!professor || !rating || !reviewText) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  const newReview = {
    id: professorReviews.length + 1,
    professor,
    rating: Number(rating),
    reviewText: reviewText.trim(),
    date: new Date().toISOString().split("T")[0],
  };

  professorReviews.push(newReview);
  res.status(201).json(newReview);
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

module.exports = router;
