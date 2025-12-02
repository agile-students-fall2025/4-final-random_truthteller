/*
 * Utility functions for interacting with the schedules API in the backend
 */

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

// MOCK IMPLEMENTATION
export const fetchSchedules = async () => {
  console.log("MOCK fetchSchedules");
  return [
    {
      id: "mock-schedule-id",
      name: "Mock Schedule",
      events: [],
    },
  ];
};

export const fetchScheduleById = async (id) => {
  console.log("MOCK fetchScheduleById", id);
  return {
    id: id || "mock-schedule-id",
    name: "Mock Schedule",
    events: [],
  };
};

export const fetchScheduleEvents = async (scheduleId) => {
  console.log("MOCK fetchScheduleEvents", scheduleId);
  return [
    {
      id: "mock-event-1",
      courseName: "CS-UY 101 - Intro to CS",
      professor: "John Doe",
      startTime: "10:00",
      endTime: "11:30",
      day: 0, // Monday
      room: "370 Jay St",
    },
    {
      id: "mock-event-2",
      courseName: "MA-UY 102 - Calculus I",
      professor: "Jane Smith",
      startTime: "14:00",
      endTime: "15:30",
      day: 2, // Wednesday
      room: "2 MetroTech",
    },
  ];
};

export const createSchedule = async (name) => {
  console.log("MOCK createSchedule", name);
  return {
    id: "new-mock-schedule-id",
    name: name,
    events: [],
  };
};

export const deleteSchedule = async (id) => {
  console.log("MOCK deleteSchedule", id);
  return;
};

export const exportSchedule = async (scheduleId) => {
  console.log("MOCK exportSchedule", scheduleId);
  alert("Export not supported in mock mode");
};

export const addEventsToSchedule = async (scheduleId, events) => {
  console.log("MOCK addEventsToSchedule", scheduleId, events);
  return { success: true };
};

export const getCurrentSchedule = async () => {
  console.log("MOCK getCurrentSchedule");
  return { scheduleId: "mock-schedule-id" };
};

export const setCurrentSchedule = async (scheduleId) => {
  console.log("MOCK setCurrentSchedule", scheduleId);
  return { success: true };
};

export const deleteEventFromSchedule = async (scheduleId, eventId) => {
  console.log("MOCK deleteEventFromSchedule", scheduleId, eventId);
  return;
};
