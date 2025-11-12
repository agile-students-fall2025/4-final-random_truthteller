const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

export const validateSchedule = async (
  events,
  creditMin = 12,
  creditMax = 20,
) => {
  const payload = {
    items: events.map((e) => ({
      id: e.id,
      courseName: e.courseName,
      day: e.day,
      startTime: e.startTime,
      endTime: e.endTime,
      credits: e.credits ?? 4,
    })),
    creditMin,
    creditMax,
  };

  const response = await fetch(`${API_BASE_URL}/validate-schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Validation failed: ${response.status} ${response.statusText}`,
    );
  }

  return await response.json();
};
