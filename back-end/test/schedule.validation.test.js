const { expect } = require("chai");
const {
  validateSchedule,
  toMinutes,
  normalizeMeetings,
} = require("../utils/schedule");

describe("schedule validation", () => {
  it("converts time to minutes", () => {
    expect(toMinutes("09:30")).to.equal(570);
  });

  it("detects duplicates", () => {
    const items = [
      { id: "a", code: "CS 101", credits: 3 },
      { id: "b", code: "CS 101", credits: 3 },
    ];
    const { warnings } = validateSchedule(items, 18);
    expect(warnings).to.include("Duplicate course detected");
  });

  it("flags credit cap exceeded", () => {
    const items = [
      { id: "a", credits: 10 },
      { id: "b", credits: 10 },
    ];
    const result = validateSchedule(items, 16);
    expect(result.warnings.join(" ")).to.match(/Credit cap exceeded/);
  });

  it("detects time overlaps", () => {
    const items = [
      {
        id: "x",
        day: 0,
        startTime: "09:00",
        endTime: "10:00",
        credits: 3,
      },
      {
        id: "y",
        day: 0,
        startTime: "09:30",
        endTime: "10:30",
        credits: 3,
      },
    ];
    const result = validateSchedule(items, 18);
    expect(result.warnings).to.include("Time overlaps detected");
  });
});
