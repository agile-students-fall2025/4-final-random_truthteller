/*
 * Utility functions for interacting with the schedules API in the backend
 */

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

export const fetchSchedules = async () => {
  const response = await fetch(`${API_BASE_URL}/schedules`);
  if (!response.ok) {
    throw new Error(`Failed to fetch schedules: ${response.statusText}`);
  }
  return await response.json();
};

export const fetchScheduleById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/schedules/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch schedule: ${response.statusText}`);
  }
  return await response.json();
};

export const fetchScheduleEvents = async (scheduleId) => {
  const response = await fetch(
    `${API_BASE_URL}/schedules/${scheduleId}/events`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }
  return await response.json();
};

export const createSchedule = async (name) => {
  const response = await fetch(`${API_BASE_URL}/schedules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create schedule: ${response.statusText}`);
  }
  return await response.json();
};

export const deleteSchedule = async (id) => {
  const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete schedule: ${response.statusText}`);
  }
};

export const exportSchedule = async (scheduleId) => {
  const response = await fetch(
    `${API_BASE_URL}/schedules/${scheduleId}/export`,
  );
  if (!response.ok) {
    throw new Error(`Failed to export schedule: ${response.statusText}`);
  }

  // extract the filename from Content-Disposition header or use default
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = "schedule.ics";
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    if (filenameMatch) {
      filename = filenameMatch[1];
    }
  }

  // download blob
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
