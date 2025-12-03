function toMinutes(t) {
  const [h, m] = String(t)
    .split(":")
    .map((x) => parseInt(x, 10));
  return h * 60 + (m || 0);
}

function normalizeMeetings(item) {
  // Event-like: { day, startTime, endTime }
  if (Number.isInteger(item.day) && item.startTime && item.endTime) {
    return [
      {
        day: item.day,
        start: toMinutes(item.startTime),
        end: toMinutes(item.endTime),
        id: item.id,
      },
    ];
  }
  // Explicit meetings array
  if (Array.isArray(item.meetings)) {
    return item.meetings
      .filter((m) => Number.isInteger(m.day) && m.startTime && m.endTime)
      .map((m) => ({
        day: m.day,
        start: toMinutes(m.startTime),
        end: toMinutes(m.endTime),
        id: item.id,
      }));
  }
  // Sections like { days: "Mon/Wed", time: "10:00-11:15" }
  if (Array.isArray(item.sections)) {
    const dayMap = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
    const out = [];
    item.sections.forEach((s) => {
      const days = String(s.days || "")
        .split("/")
        .map((d) => d.trim())
        .filter(Boolean);
      if (s.time) {
        const [startT, endT] = String(s.time)
          .split("-")
          .map((x) => x.trim());
        days.forEach((d) => {
          if (dayMap[d] !== undefined) {
            out.push({
              day: dayMap[d],
              start: toMinutes(startT),
              end: toMinutes(endT),
              id: item.id,
            });
          }
        });
      }
    });
    return out;
  }
  return [];
}

function validateSchedule(items, opts) {
  // Defaults and backward compatibility
  let creditMin = 12;
  let creditMax = 20;

  if (typeof opts === "number") {
    // legacy call: validateSchedule(items, creditCap)
    creditMax = Number.isFinite(opts) ? opts : 20;
  } else if (opts && typeof opts === "object") {
    if (Number.isFinite(opts.creditMin)) creditMin = Number(opts.creditMin);
    if (Number.isFinite(opts.creditMax)) creditMax = Number(opts.creditMax);
  }

  const warnings = [];
  const details = { duplicates: [], overlaps: [], creditTotal: 0 };

  const courses = new Map(); // course identifier -> { credits, sections: Set, reported: boolean, id }

  items.forEach((item) => {
    const code = item.code || item.courseCode;
    const name = item.courseName || item.title || item.name;
    const credits = Number(item.credits || 0);
    const idParts = item.id ? String(item.id).split("-") : [];

    // The course name from the front-end is "CODE - TITLE". I can get the code from there.
    let courseIdentifier = code;
    if (!courseIdentifier && name) {
      courseIdentifier = name.split(" - ")[0];
    }
    courseIdentifier = courseIdentifier || name; // fallback to full name

    const sectionId = idParts.length > 1 ? idParts[1] : item.id || name; // Use item.id or name as fallback section id

    if (!courseIdentifier) return;

    if (!courses.has(courseIdentifier)) {
      courses.set(courseIdentifier, {
        credits: credits,
        sections: new Set(),
        reported: false,
        id: item.id,
      });
    }

    const courseRecord = courses.get(courseIdentifier);
    courseRecord.sections.add(sectionId);
  });

  let totalCredits = 0;
  for (const [identifier, record] of courses.entries()) {
    totalCredits += record.credits;
    if (record.sections.size > 1 && !record.reported) {
      details.duplicates.push({
        by: "course",
        identifier: identifier,
        firstId: record.id,
        secondId: null, // Hard to get second id here
      });
      record.reported = true;
    }
  }

  details.creditTotal = totalCredits;

  if (details.duplicates.length > 0) {
    warnings.push("Duplicate course detected");
  }

  // Credit min/max checks
  if (Number.isFinite(creditMin) && totalCredits < creditMin) {
    warnings.push(
      `Credit minimum not met (total ${totalCredits}, min ${creditMin})`,
    );
  }
  if (Number.isFinite(creditMax) && totalCredits > creditMax) {
    warnings.push(
      `Credit cap exceeded (total ${totalCredits}, cap ${creditMax})`,
    );
  }

  // Overlap detection per day
  const meetingsByDay = new Map();
  items.forEach((item) => {
    const meetings = normalizeMeetings(item);
    meetings.forEach((m) => {
      if (!meetingsByDay.has(m.day)) meetingsByDay.set(m.day, []);
      meetingsByDay.get(m.day).push({
        start: m.start,
        end: m.end,
        id: m.id,
        label: item.courseName || item.code || item.title,
      });
    });
  });

  for (const [day, meetings] of meetingsByDay.entries()) {
    meetings.sort((a, b) => a.start - b.start);
    for (let i = 1; i < meetings.length; i++) {
      const prev = meetings[i - 1];
      const cur = meetings[i];
      if (cur.start < prev.end) {
        details.overlaps.push({ day, a: prev, b: cur });
      }
    }
  }

  if (details.overlaps.length > 0) {
    warnings.push("Time overlaps detected");
  }

  return { ok: warnings.length === 0, warnings, details };
}

export { validateSchedule, toMinutes, normalizeMeetings };
