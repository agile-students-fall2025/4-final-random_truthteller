// Local fallback data used when Mockaroo is unavailable
const FALLBACK_COURSES = [
  { id: 1, courseName: "CS 101 - Intro to CS" },
  { id: 2, courseName: "MATH 220 - Calculus II" },
  { id: 3, courseName: "BIO 110 - Biology I" },
  { id: 4, courseName: "ECON 201 - Microeconomics" },
  { id: 5, courseName: "ART 110 - Drawing" },
];

const FALLBACK_COURSE_REVIEWS = [
  { id: 1, rating: 5, reviewText: "Challenging but fair. Learned a ton.", date: "2024-10-01" },
  { id: 2, rating: 4, reviewText: "Clear lectures and helpful office hours.", date: "2024-09-14" },
  { id: 3, rating: 3, reviewText: "Heavy workload near finals.", date: "2024-08-30" },
];

const FALLBACK_PROF_REVIEWS = [
  { id: 1, rating: 5, reviewText: "Engaging instructor, great examples.", date: "2024-09-05" },
  { id: 2, rating: 4, reviewText: "Organized and responsive.", date: "2024-07-21" },
  { id: 3, rating: 2, reviewText: "Fast pace, tough exams.", date: "2024-06-11" },
];

function parseCsvToObjects(csvText) {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i] ? values[i].trim() : "";
    });
    return obj;
  });
}

async function fetchFromMockaroo(path) {
  const apiKey = process.env.REACT_APP_MOCKAROO_API_KEY;
  const url = `https://my.api.mockaroo.com/${path}?key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Mockaroo fetch failed: ${response.status} ${response.statusText}`);
  }
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }
  const csv = await response.text();
  return parseCsvToObjects(csv);
}

// Fetch list of courses
export const fetchCourses = async () => {
  try {
    if (!process.env.REACT_APP_MOCKAROO_API_KEY) {
      console.warn("Mockaroo key not set; using fallback course list.");
      return FALLBACK_COURSES;
    }
    const data = await fetchFromMockaroo("courses.json");
    const courses = data.map((item, index) => ({
      id: parseInt(item.id) || index,
      courseName: item.courseName,
    }));

    const seen = new Set();
    const uniqueCourses = courses.filter((course) => {
      if (seen.has(course.courseName)) return false;
      seen.add(course.courseName);
      return true;
    });
    return uniqueCourses;
  } catch (err) {
    console.warn("Falling back to local course list:", err);
    return FALLBACK_COURSES;
  }
};

// Fetch course reviews
export const fetchCourseReviews = async () => {
  try {
    if (!process.env.REACT_APP_MOCKAROO_API_KEY) {
      console.warn("Mockaroo key not set; using fallback course reviews.");
      return FALLBACK_COURSE_REVIEWS;
    }
    const data = await fetchFromMockaroo("course_reviews.json");
    return data.map((item, index) => ({
      id: parseInt(item.id) || index,
      rating: parseInt(item.rating),
      reviewText: item.reviewText,
      date: item.date,
    }));
  } catch (err) {
    console.warn("Falling back to local course reviews:", err);
    return FALLBACK_COURSE_REVIEWS;
  }
};

// Fetch professor reviews
export const fetchProfReviews = async () => {
  try {
    if (!process.env.REACT_APP_MOCKAROO_API_KEY) {
      console.warn("Mockaroo key not set; using fallback professor reviews.");
      return FALLBACK_PROF_REVIEWS;
    }
    const data = await fetchFromMockaroo("professor_reviews.json");
    return data.map((item, index) => ({
      id: parseInt(item.id) || index,
      rating: parseInt(item.rating),
      reviewText: item.reviewText,
      date: item.date,
    }));
  } catch (err) {
    console.warn("Falling back to local professor reviews:", err);
    return FALLBACK_PROF_REVIEWS;
  }
};
