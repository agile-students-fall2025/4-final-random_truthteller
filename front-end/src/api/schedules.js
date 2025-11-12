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
