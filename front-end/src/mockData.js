//Llocal fallback data used when Mockaroo is unavailable
const FALLBACK_COURSES = [
  { id: 1, courseName: "CSCI-UA 101 - Introduction to Computer Science" },
  { id: 2, courseName: "CSCI-UA 201 - Computer Systems Organization" },
  { id: 3, courseName: "MATH-UA 121 - Calculus I" },
  { id: 4, courseName: "ECON-UA 2 - Intro to Microeconomics" },
  { id: 5, courseName: "BIOL-UA 11 - Principles of Biology I" },
];

const FALLBACK_COURSE_REVIEWS = [
  {
    id: 1,
    rating: 5,
    reviewText: "Challenging but fair. Learned a ton.",
    date: "2024-10-01",
  },
  {
    id: 2,
    rating: 4,
    reviewText: "Clear lectures and helpful office hours.",
    date: "2024-09-14",
  },
  {
    id: 3,
    rating: 3,
    reviewText: "Heavy workload near finals.",
    date: "2024-08-30",
  },
];

const FALLBACK_PROF_REVIEWS = [
  {
    id: 1,
    rating: 5,
    reviewText: "Engaging instructor, great examples.",
    date: "2024-09-05",
  },
  {
    id: 2,
    rating: 4,
    reviewText: "Organized and responsive.",
    date: "2024-07-21",
  },
  {
    id: 3,
    rating: 2,
    reviewText: "Fast pace, tough exams.",
    date: "2024-06-11",
  },
];

const COURSE_DETAILS = {
  "CSCI-UA 101 - Introduction to Computer Science": {
    credits: 4,
    prereqs: "None",
    description:
      "Introduction to fundamental concepts of computer science and programming using Python. Emphasizes problem solving and algorithmic thinking.",
    sections: [
      {
        sectionId: "001",
        name: "Section 001",
        professor: "J. Klein",
        days: "Mon/Wed",
        time: "11:00 AM – 12:15 PM",
        location: "Warren Weaver Hall 109 (Greenwich Village)",
        enrolled: 92,
        capacity: 120,
      },
      {
        sectionId: "002",
        name: "Section 002",
        professor: "L. Chen",
        days: "Tue/Thu",
        time: "2:00 PM – 3:15 PM",
        location: "Silver Center 207 (Washington Square)",
        enrolled: 118,
        capacity: 120,
      },
    ],
  },
  "CSCI-UA 201 - Computer Systems Organization": {
    credits: 4,
    prereqs: "CSCI-UA 102",
    description:
      "C programming, data representation, the machine level, memory hierarchy, and operating system interfaces.",
    sections: [
      {
        sectionId: "001",
        name: "Section 001",
        professor: "M. Patel",
        days: "Tue/Thu",
        time: "9:30 AM – 10:45 AM",
        location: "Warren Weaver Hall 130",
        enrolled: 58,
        capacity: 75,
      },
      {
        sectionId: "002",
        name: "Section 002",
        professor: "A. Rossi",
        days: "Mon/Wed",
        time: "5:00 PM – 6:15 PM",
        location: "6 MetroTech (Brooklyn) Dibner 620",
        enrolled: 73,
        capacity: 75,
      },
    ],
  },
  "MATH-UA 121 - Calculus I": {
    credits: 4,
    prereqs: "Precalculus or placement exam",
    description:
      "Differential and integral calculus of one variable, with applications to the sciences.",
    sections: [
      {
        sectionId: "003",
        name: "Section 003",
        professor: "S. Ahmed",
        days: "Mon/Wed/Fri",
        time: "10:00 AM – 10:50 AM",
        location: "Silver Center 101",
        enrolled: 85,
        capacity: 90,
      },
    ],
  },
  "ECON-UA 2 - Intro to Microeconomics": {
    credits: 4,
    prereqs: "None",
    description:
      "Supply and demand, consumer and firm behavior, market structures, and public policy.",
    sections: [
      {
        sectionId: "001",
        name: "Section 001",
        professor: "D. Nguyen",
        days: "Tue/Thu",
        time: "12:30 PM – 1:45 PM",
        location: "Kimmel Center 405",
        enrolled: 140,
        capacity: 160,
      },
    ],
  },
  "BIOL-UA 11 - Principles of Biology I": {
    credits: 4,
    prereqs: "None",
    description:
      "Cell structure and function, genetics, development, and physiology with lab-focused applications.",
    sections: [
      {
        sectionId: "L01",
        name: "Lecture L01",
        professor: "K. Morales",
        days: "Mon/Wed",
        time: "2:00 PM – 3:15 PM",
        location: "Brown Building 312",
        enrolled: 180,
        capacity: 200,
      },
      {
        sectionId: "R21",
        name: "Recitation R21",
        professor: "Staff",
        days: "Fri",
        time: "11:00 AM – 11:50 AM",
        location: "Brown Building 204",
        enrolled: 24,
        capacity: 25,
      },
    ],
  },
};

// minimal sample details builder used when Mockaroo fails
const FALLBACK_COURSE_DETAILS = (courseName) => {
  const preset = COURSE_DETAILS[courseName];
  if (preset) {
    return { courseName, ...preset };
  }
  // fallback for any other course name
  return {
    courseName,
    credits: 4,
    prereqs: "None",
    description: "Description: placeholder overview for the selected course.",
    sections: [
      {
        sectionId: "001",
        name: "Section 001",
        professor: "Staff",
        days: "Tue/Thu",
        time: "2:00 PM – 3:15 PM",
        location: "Silver Center 207",
        enrolled: 48,
        capacity: 60,
      },
      {
        sectionId: "002",
        name: "Section 002",
        professor: "Staff",
        days: "Mon/Wed",
        time: "8:00 AM – 9:15 AM",
        location: "Warren Weaver Hall 109",
        enrolled: 30,
        capacity: 30,
      },
    ],
  };
};

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
    throw new Error(
      `Mockaroo fetch failed: ${response.status} ${response.statusText}`,
    );
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

// Fetch details for a single course, including sections
export const fetchCourseDetails = async (courseName) => {
  try {
    if (!process.env.REACT_APP_MOCKAROO_API_KEY) {
      console.warn("Mockaroo key not set; using fallback course details.");
      return FALLBACK_COURSE_DETAILS(courseName);
    }
    // Expecting a mock API that returns an object with the fields used below
    const data = await fetchFromMockaroo("course_details.json");
    // Find the requested course or fall back to first
    const match = Array.isArray(data)
      ? data.find((d) => d.courseName === courseName) || data[0]
      : data;

    const normalized = {
      courseName: match.courseName || courseName,
      credits: parseInt(match.credits) || 4,
      prereqs: match.prereqs || "None",
      description: match.description || "",
      sections: (match.sections || []).map((s, idx) => ({
        sectionId: s.sectionId || String(idx + 1).padStart(3, "0"),
        name: s.name || `Section ${String(idx + 1).padStart(3, "0")}`,
        professor: s.professor || "Staff",
        days: s.days || "",
        time: s.time || "",
        location: s.location || "",
        enrolled: parseInt(s.enrolled) || 0,
        capacity: parseInt(s.capacity) || 0,
      })),
    };
    // If mock returns sections as CSV rows instead of nested, normalize
    if (!normalized.sections.length && Array.isArray(data)) {
      const byCourse = data.filter(
        (row) => row.courseName === normalized.courseName,
      );
      normalized.sections = byCourse.map((row, idx) => ({
        sectionId: row.sectionId || String(idx + 1).padStart(3, "0"),
        name: row.name || `Section ${String(idx + 1).padStart(3, "0")}`,
        professor: row.professor || "Staff",
        days: row.days || "",
        time: row.time || "",
        location: row.location || "",
        enrolled: parseInt(row.enrolled) || 0,
        capacity: parseInt(row.capacity) || 0,
      }));
    }
    return normalized;
  } catch (err) {
    console.warn("Falling back to local course details:", err);
    return FALLBACK_COURSE_DETAILS(courseName);
  }
};
