/*
 * Utility functions for interacting with the schedules API in the backend
 */

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

export const fetchSchedules = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules`);
    if (!response.ok) {
      throw new Error(`Failed to fetch schedules: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw error;
  }
};

export const fetchScheduleById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch schedule: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching schedule:", error);
    throw error;
  }
};

export const fetchScheduleEvents = async (scheduleId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/schedules/${scheduleId}/events`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching schedule events:", error);
    throw error;
  }
};
