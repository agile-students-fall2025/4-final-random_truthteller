const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

export const fetchCourseById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch course: ${response.statusText}`);
  }
  return await response.json();
};
