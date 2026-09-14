import { describe, it, expect } from "vitest";
import {
  getBrasiliaCycleId,
  getNextCycleMidnight,
  getMillisecondsUntilNextCycle,
  isValidCivilDate,
} from "../../../src/services/timeService";

describe("timeService", () => {
  it("computes Brasília Date (UTC-3) correctly during the day", () => {
    // 2026-09-11 15:00 UTC = 12:00 Brasília
    const testDate = new Date("2026-09-11T15:00:00Z");
    expect(getBrasiliaCycleId(testDate)).toBe("2026-09-11");
  });

  it("handles the critical boundary at 23:59:59 Brasília Time", () => {
    // 23:59:59 in Brasília is 02:59:59 UTC of next day
    const beforeMidnight = new Date("2026-09-12T02:59:59Z");
    expect(getBrasiliaCycleId(beforeMidnight)).toBe("2026-09-11");
  });

  it("advances cycle at exactly 00:00:00 Brasília Time", () => {
    // 00:00:00 in Brasília is 03:00:00 UTC
    const atMidnight = new Date("2026-09-12T03:00:00Z");
    expect(getBrasiliaCycleId(atMidnight)).toBe("2026-09-12");
  });

  it("satisfies PO regression: 2026-09-13T02:59:59Z => 2026-09-12 and 2026-09-13T03:00:00Z => 2026-09-13", () => {
    expect(getBrasiliaCycleId(new Date("2026-09-13T02:59:59Z"))).toBe("2026-09-12");
    expect(getBrasiliaCycleId(new Date("2026-09-13T03:00:00Z"))).toBe("2026-09-13");
  });

  it("ensures completion between 21:00 and 23:59 Brasília does not prematurely count toward the next cycle", () => {
    // 21:00 Brasília = 00:00 UTC next day
    const at2100 = new Date("2026-09-13T00:00:00Z");
    expect(getBrasiliaCycleId(at2100)).toBe("2026-09-12");

    // 22:30 Brasília = 01:30 UTC next day
    const at2230 = new Date("2026-09-13T01:30:00Z");
    expect(getBrasiliaCycleId(at2230)).toBe("2026-09-12");

    // 23:59 Brasília = 02:59:00 UTC next day
    const at2359 = new Date("2026-09-13T02:59:00Z");
    expect(getBrasiliaCycleId(at2359)).toBe("2026-09-12");
  });

  it("computes next cycle midnight and remaining milliseconds", () => {
    // 2026-09-11 20:00:00 UTC-3 (23:00:00 UTC)
    // 4 hours remaining until midnight UTC-3 (03:00:00 UTC next day)
    const refDate = new Date("2026-09-11T23:00:00Z");
    const nextMidnight = getNextCycleMidnight(refDate);
    expect(nextMidnight.toISOString()).toBe("2026-09-12T03:00:00.000Z");

    const ms = getMillisecondsUntilNextCycle(refDate);
    expect(ms).toBe(4 * 60 * 60 * 1000);
  });

  describe("isValidCivilDate", () => {
    it("accepts valid civil calendar dates", () => {
      expect(isValidCivilDate("2026-09-11")).toBe(true);
      expect(isValidCivilDate("2026-12-31")).toBe(true);
      expect(isValidCivilDate("2024-02-29")).toBe(true); // 2024 is a leap year
    });

    it("rejects impossible or malformed dates", () => {
      expect(isValidCivilDate("2026-02-29")).toBe(false); // 2026 is NOT a leap year
      expect(isValidCivilDate("2026-02-30")).toBe(false);
      expect(isValidCivilDate("2026-04-31")).toBe(false); // April has 30 days
      expect(isValidCivilDate("2026-13-01")).toBe(false); // Invalid month
      expect(isValidCivilDate("2026-00-10")).toBe(false); // Month 0
      expect(isValidCivilDate("2026-09-00")).toBe(false); // Day 0
      expect(isValidCivilDate("2026-09-32")).toBe(false); // Day 32
      expect(isValidCivilDate("2026/09/11")).toBe(false); // Bad separator
      expect(isValidCivilDate("not-a-date")).toBe(false);
    });
  });
});
