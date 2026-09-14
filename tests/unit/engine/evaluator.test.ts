import { describe, it, expect } from "vitest";
import { evaluateGuess } from "../../../src/engine/evaluator";

describe("evaluateGuess", () => {
  it("evaluates a winning exact match correctly", () => {
    const result = evaluateGuess("MARIA", "MARIA");
    expect(result.isWin).toBe(true);
    expect(result.evaluations.map((e) => e.status)).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ]);
  });

  it("handles the canonical duplicate letters case (MARIA vs ARARA)", () => {
    // Secret: MARIA (A at 1 and 4, M at 0, R at 2, I at 3)
    // Guess:  ARARA
    // Pos 4: A === A -> correct (uses 1 'A', 1 'A' left)
    // Pos 0: A in secret -> present (uses 1 'A', 0 'A' left)
    // Pos 1: R in secret (index 2) -> present (uses 1 'R', 0 'R' left)
    // Pos 2: A -> 0 'A' left -> absent
    // Pos 3: R -> 0 'R' left -> absent
    const result = evaluateGuess("ARARA", "MARIA");
    expect(result.isWin).toBe(false);
    expect(result.evaluations).toEqual([
      { letter: "A", status: "present" },
      { letter: "R", status: "present" },
      { letter: "A", status: "absent" },
      { letter: "R", status: "absent" },
      { letter: "A", status: "correct" },
    ]);
  });

  it("evaluates completely absent letters", () => {
    const result = evaluateGuess("BENTO", "MARIA");
    expect(result.isWin).toBe(false);
    expect(result.evaluations.map((e) => e.status)).toEqual([
      "absent",
      "absent",
      "absent",
      "absent",
      "absent",
    ]);
  });

  it("supports variable word lengths dynamically (4 letters: CRUZ vs ALTAR error)", () => {
    expect(() => evaluateGuess("CRUZ", "ALTAR")).toThrowError(/Tamanho do palpite/);
  });

  it("evaluates 4-letter words (PAULO vs CRUZ)", () => {
    const result = evaluateGuess("PAULO", "PEDRO");
    expect(result.isWin).toBe(false);
    expect(result.evaluations[0]).toEqual({ letter: "P", status: "correct" });
  });

  it("evaluates accented words transparently via normalization (AÇÃO vs ACAO)", () => {
    const result = evaluateGuess("ACAO", "AÇÃO");
    expect(result.isWin).toBe(true);
    expect(result.evaluations.map((e) => e.status)).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
    ]);
  });
});
