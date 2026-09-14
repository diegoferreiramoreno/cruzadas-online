import { describe, it, expect } from "vitest";
import { normalizeWord } from "../../../src/engine/normalizer";

describe("normalizeWord", () => {
  it("converts lowercase to uppercase", () => {
    expect(normalizeWord("maria")).toBe("MARIA");
  });

  it("removes acute accents and diacritics", () => {
    expect(normalizeWord("oração")).toBe("ORACAO");
    expect(normalizeWord("coração")).toBe("CORACAO");
    expect(normalizeWord("fé")).toBe("FE");
    expect(normalizeWord("glória")).toBe("GLORIA");
    expect(normalizeWord("espírito")).toBe("ESPIRITO");
    expect(normalizeWord("comunhão")).toBe("COMUNHAO");
  });

  it("asserts explicit functional equivalence ACAO === AÇÃO", () => {
    expect(normalizeWord("ACAO")).toBe("ACAO");
    expect(normalizeWord("AÇÃO")).toBe("ACAO");
    expect(normalizeWord("acao")).toBe("ACAO");
    expect(normalizeWord("ação")).toBe("ACAO");
    expect(normalizeWord("ACAO")).toBe(normalizeWord("AÇÃO"));
  });

  it("strips non-alpha characters and trims whitespace", () => {
    expect(normalizeWord("  Jesus  ")).toBe("JESUS");
  });
});
