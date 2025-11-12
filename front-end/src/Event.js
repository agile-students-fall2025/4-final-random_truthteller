/**
 * Event class for creating calendar events
 */
export class Event {
  constructor({ id, courseName, day, startTime, endTime, professor, room, credits }) {
    this.id =
      id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.courseName = courseName;
    // day is the day of the week, 0 = Monday, 1 = Tuesday, etc.
    this.day = day;
    // startTime is the start time of the event in "HH:MM" 24-hour format (e.g., "09:00")
    this.startTime = startTime;
    // endTime is the end time of the event in "HH:MM" 24-hour format (e.g., "10:30")
    this.endTime = endTime;
    // TODO: Consider using a professor ID instead of a name.
    this.professor = professor || "";
    // TODO: Consider using a room ID instead of a name.
    this.room = room || "";
    this.credits = Number(credits || 0);
  }

  /**
   * Convert time string to minutes from midnight
   * @param {string} timeStr - Time in "HH:MM" format
   * @returns {number} Minutes from midnight
   */
  static timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  }

  getStartMinutes() {
    return Event.timeToMinutes(this.startTime);
  }

  getEndMinutes() {
    return Event.timeToMinutes(this.endTime);
  }

  getDuration() {
    return this.getEndMinutes() - this.getStartMinutes();
  }

  overlapsWith(otherEvent) {
    if (this.day !== otherEvent.day) return false;

    const thisStart = this.getStartMinutes();
    const thisEnd = this.getEndMinutes();
    const otherStart = otherEvent.getStartMinutes();
    const otherEnd = otherEvent.getEndMinutes();

    return thisStart < otherEnd && thisEnd > otherStart;
  }

  toJSON() {
    return {
      id: this.id,
      courseName: this.courseName,
      day: this.day,
      startTime: this.startTime,
      endTime: this.endTime,
      professor: this.professor,
      room: this.room,
    };
  }

  static fromJSON(data) {
    return new Event(data);
  }

  toCalendarEvent(weekStart) {
    const startDate = new Date(weekStart);
    startDate.setDate(weekStart.getDate() + this.day);
    const [startHours, startMinutes] = this.startTime.split(":").map(Number);
    startDate.setHours(startHours, startMinutes, 0, 0);

    const endDate = new Date(startDate);
    const [endHours, endMinutes] = this.endTime.split(":").map(Number);
    endDate.setHours(endHours, endMinutes, 0, 0);

    return {
      id: this.id,
      title: this.courseName,
      start: startDate,
      end: endDate,
      resource: {
        professor: this.professor,
        room: this.room,
        startTime: this.startTime,
        endTime: this.endTime,
        courseName: this.courseName,
        credits: this.credits,
      },
    };
  }
}
