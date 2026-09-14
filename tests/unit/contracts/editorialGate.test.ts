import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { validateChallenges } from "../../../scripts/validate-challenges";

describe("Editorial Release Gate (PO Root Cause 1 / T066)", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "cruzadas-editorial-test-"));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  const validChallengeData = {
    id: "cruzadas-2026-09-12",
    cycleDate: "2026-09-12",
    word: "PEDRO",
    normalizedWord: "PEDRO",
    wordLength: 5,
    initialClue: "O Apóstolo e primeira rocha da Igreja",
    postGameContext: "Simão Pedro recebeu de Cristo a primazia pastoral.",
    sourceCitation: "Mateus 16, 18-19",
    sourceCategory: "Sagrada Escritura",
  };

  it("fails release gate when zero production challenges exist", () => {
    const report = validateChallenges({
      release: true,
      targetCycle: "2026-09-12",
      challengesDir: tempDir,
    });
    expect(report.success).toBe(false);
    expect(report.errors.some((e) => e.includes("Zero production challenges found"))).toBe(true);
  });

  it("fails release gate when only Draft challenges exist", () => {
    const draftChallenge = {
      ...validChallengeData,
      editorialStatus: "Draft",
    };
    fs.writeFileSync(
      path.join(tempDir, "2026-09-12.json"),
      JSON.stringify(draftChallenge, null, 2)
    );

    const report = validateChallenges({
      release: true,
      targetCycle: "2026-09-12",
      challengesDir: tempDir,
    });
    expect(report.success).toBe(false);
    expect(report.errors.some((e) => e.includes("EDITORIAL RELEASE GATE PENDING"))).toBe(true);
    expect(report.errors.some((e) => e.includes("Autonomous agent promotion is strictly prohibited"))).toBe(true);
  });

  it("fails release gate when a Verified challenge exists only for an old unrelated cycle", () => {
    const oldVerifiedChallenge = {
      ...validChallengeData,
      id: "cruzadas-2026-08-01",
      cycleDate: "2026-08-01",
      editorialStatus: "Verified",
    };
    fs.writeFileSync(
      path.join(tempDir, "2026-08-01.json"),
      JSON.stringify(oldVerifiedChallenge, null, 2)
    );

    const report = validateChallenges({
      release: true,
      targetCycle: "2026-09-12",
      challengesDir: tempDir,
    });
    expect(report.success).toBe(false);
    expect(report.errors.some((e) => e.includes("No challenge exists for target release cycle"))).toBe(true);
  });

  it("passes release gate when a Verified or Published challenge exists for the target release cycle", () => {
    const verifiedTargetChallenge = {
      ...validChallengeData,
      editorialStatus: "Verified",
    };
    fs.writeFileSync(
      path.join(tempDir, "2026-09-12.json"),
      JSON.stringify(verifiedTargetChallenge, null, 2)
    );

    const report = validateChallenges({
      release: true,
      targetCycle: "2026-09-12",
      challengesDir: tempDir,
    });
    expect(report.success).toBe(true);
    expect(report.errors).toHaveLength(0);
    expect(report.targetCycleFound).toBe(true);
    expect(report.targetCycleStatus).toBe("Verified");
  });

  it("strictly rejects test fixtures under tests/fixtures from satisfying the release gate", () => {
    const fixturesDir = path.resolve(process.cwd(), "tests/fixtures/challenges");
    const report = validateChallenges({
      release: true,
      targetCycle: "2026-09-12",
      challengesDir: fixturesDir,
    });
    expect(report.success).toBe(false);
    expect(report.errors.some((e) => e.includes("Test fixtures cannot be used to satisfy the release gate"))).toBe(true);
  });
});
