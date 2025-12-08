export const fetchCourseById = async (id) => {
  const response = await fetch(`/api/courses/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch course: ${response.statusText}`);
  }
  return await response.json();
};
