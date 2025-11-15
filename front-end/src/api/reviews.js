const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.statusText}`);
  }

  return await response.json();
};

export const fetchCourseReviews = async (courseName) => {
  const endpoint = courseName
    ? `${API_BASE_URL}/reviews/course/${encodeURIComponent(courseName)}`
    : `${API_BASE_URL}/reviews/course`;
  const response = await fetch(endpoint);
  return await handleResponse(response);
};

export const fetchProfReviews = async (profName) => {
  const endpoint = profName
    ? `${API_BASE_URL}/reviews/professor/${encodeURIComponent(profName)}`
    : `${API_BASE_URL}/reviews/professor`;
  const response = await fetch(endpoint);
  return await handleResponse(response);
};
