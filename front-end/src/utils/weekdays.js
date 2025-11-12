/**
 * Weekday enum utility for converting between different weekday representations
 * - Number format: 0 = Monday, 1 = Tuesday, ..., 4 = Friday
 * - iCalendar format: "MO", "TU", "WE", "TH", "FR"
 * - Display format: "Mon", "Tue", "Wed", "Thu", "Fri"
 */

export const Weekday = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
};

const I_CAL_DAYS = ["MO", "TU", "WE", "TH", "FR"];
const DISPLAY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/**
 * Convert weekday number (0-4) to iCalendar format (MO, TU, etc.)
 */
export function toICalDay(day) {
  if (day < 0 || day > 4) {
    throw new Error(`Invalid weekday number: ${day}. Must be 0-4.`);
  }
  return I_CAL_DAYS[day];
}

/**
 * Convert iCalendar day format (MO, TU, etc.) to weekday number (0-4)
 */
export function fromICalDay(icalDay) {
  const index = I_CAL_DAYS.indexOf(icalDay.toUpperCase());
  if (index === -1) {
    throw new Error(`Invalid iCalendar day: ${icalDay}`);
  }
  return index;
}

/**
 * Convert weekday number (0-4) to display format (Mon, Tue, etc.)
 */
export function toDisplayDay(day) {
  if (day < 0 || day > 4) {
    throw new Error(`Invalid weekday number: ${day}. Must be 0-4.`);
  }
  return DISPLAY_DAYS[day];
}

/**
 * Convert weekday number (0-4) to full day name (Monday, Tuesday, etc.)
 */
export function toFullDay(day) {
  if (day < 0 || day > 4) {
    throw new Error(`Invalid weekday number: ${day}. Must be 0-4.`);
  }
  return FULL_DAYS[day];
}

/**
 * Get all weekday numbers
 */
export function getAllWeekdays() {
  return [0, 1, 2, 3, 4];
}

/**
 * Get all iCalendar day formats
 */
export function getAllICalDays() {
  return [...I_CAL_DAYS];
}

/**
 * Get all display day formats
 */
export function getAllDisplayDays() {
  return [...DISPLAY_DAYS];
}
