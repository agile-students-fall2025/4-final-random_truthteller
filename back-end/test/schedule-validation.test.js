import { expect } from "chai";
import {
  validateSchedule,
  toMinutes,
  normalizeMeetings,
} from "../utils/schedule.js";

describe("Schedule validation", () => {
  it("should convert time to minutes", () => {
    expect(toMinutes("09:30")).to.equal(570);
  });

  it("should detect duplicates", () => {
    const items = [
      { id: "a", code: "CS 101", credits: 3 },
      { id: "b", code: "CS 101", credits: 3 },
    ];
    const { warnings } = validateSchedule(items, 18);
    expect(warnings).to.include("Duplicate course detected");
  });

  it("should flag credit cap exceeded", () => {
    const items = [
      { id: "a", code: "CS 101", credits: 10 },
      { id: "b", code: "MATH 101", credits: 10 },
    ];
    const result = validateSchedule(items, 16);
    expect(result.warnings.join(" ")).to.match(/Credit cap exceeded/);
  });

  it("should detect time overlaps", () => {
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
