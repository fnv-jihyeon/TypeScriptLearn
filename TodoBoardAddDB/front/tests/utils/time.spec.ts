/// <reference types="vitest/globals" />
import { describe, it, expect } from "vitest";
import { isValidHHmm, toMinutes, minutesToHHmm, overlaps } from "../../src/utils/time";

describe("time utils", () => {
  it("validates HH:mm strictly", () => {
    expect(isValidHHmm("09:00")).toBe(true);
    expect(isValidHHmm("9:0")).toBe(false);
    expect(isValidHHmm("24:00")).toBe(false);
  });

  it("converts HH:mm <-> minutes", () => {
    expect(toMinutes("00:00")).toBe(0);
    expect(toMinutes("23:59")).toBe(23 * 60 + 59);
    expect(minutesToHHmm(0)).toBe("00:00");
    expect(minutesToHHmm(23 * 60 + 59)).toBe("23:59");
  });

  it("detects interval overlap", () => {
    expect(overlaps("09:00", "10:00", "09:30", "10:30")).toBe(true);
    expect(overlaps("09:00", "10:00", "10:00", "11:00")).toBe(false);
  });
});
