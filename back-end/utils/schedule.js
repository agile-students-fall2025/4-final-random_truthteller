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

  const seenByCode = new Map();
  const seenByName = new Map();

  // Compute credit total & detect duplicates
  let totalCredits = 0;
  items.forEach((item) => {
    const code = item.code || item.courseCode;
    const name = item.courseName || item.title || item.name;
    const credits = Number(item.credits || 0);
    totalCredits += credits;

    if (code) {
      if (seenByCode.has(code)) {
        details.duplicates.push({
          by: "code",
          code,
          firstId: seenByCode.get(code),
          secondId: item.id || null,
        });
      } else {
        seenByCode.set(code, item.id || null);
      }
    } else if (name) {
      if (seenByName.has(name)) {
        details.duplicates.push({
          by: "courseName",
          name,
          firstId: seenByName.get(name),
          secondId: item.id || null,
        });
      } else {
        seenByName.set(name, item.id || null);
      }
    }
  });
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
