const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

// MOCK DATA
let mockReviews = [
  {
    id: 1,
    type: "course",
    subject: "CS-UY 101 - Intro to CS",
    rating: 5,
    reviewText: "Great course!",
    date: "2024-11-01",
  },
  {
    id: 2,
    type: "professor",
    subject: "Dr. Ada Lovelace",
    rating: 5,
    reviewText: "Amazing professor!",
    date: "2024-11-02",
  },
];

// MOCK IMPLEMENTATION
export const fetchCourseReviews = async (courseName, options = {}) => {
  console.log("MOCK fetchCourseReviews", courseName);
  if (!courseName) return mockReviews.filter((r) => r.type === "course");
  return mockReviews.filter(
    (r) => r.type === "course" && r.subject.includes(courseName),
  );
};

export const fetchProfReviews = async (profName, options = {}) => {
  console.log("MOCK fetchProfReviews", profName);
  if (!profName) return mockReviews.filter((r) => r.type === "professor");
  return mockReviews.filter(
    (r) => r.type === "professor" && r.subject.includes(profName),
  );
};

export const submitCourseReview = async (course, rating, reviewText) => {
  console.log("MOCK submitCourseReview", course, rating);
  const newReview = {
    id: Date.now(),
    type: "course",
    subject: course,
    rating,
    reviewText,
    date: new Date().toISOString().split("T")[0],
  };
  mockReviews.push(newReview);
  return newReview;
};

export const submitProfReview = async (professor, rating, reviewText) => {
  console.log("MOCK submitProfReview", professor, rating);
  const newReview = {
    id: Date.now(),
    type: "professor",
    subject: professor,
    rating,
    reviewText,
    date: new Date().toISOString().split("T")[0],
  };
  mockReviews.push(newReview);
  return newReview;
};

export const flagReview = async (reviewId, reason, reviewType) => {
  console.log("MOCK flagReview", reviewId, reason);
  return { success: true };
};

export const deleteReview = async (reviewId) => {
  console.log("MOCK deleteReview", reviewId);
  mockReviews = mockReviews.filter((r) => r.id !== reviewId);
  return { success: true };
};

export const fetchRecentReviews = async () => {
  console.log("MOCK fetchRecentReviews");
  return [...mockReviews].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
};
