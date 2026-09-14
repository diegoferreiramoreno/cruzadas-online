import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { getBrasiliaCycleId, isValidCivilDate } from "../src/services/timeService";

const schemaPath = path.resolve(
  process.cwd(),
  "specs/001-daily-challenge/contracts/challenge-schema.json"
);
const defaultChallengesDir = path.resolve(process.cwd(), "content/challenges");

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
const validate = ajv.compile(schema);

export interface ValidationOptions {
  release?: boolean;
  targetCycle?: string;
  challengesDir?: string;
}

export interface ValidationReport {
  success: boolean;
  errors: string[];
  warnings: string[];
  totalFiles: number;
  draftCount: number;
  publishableCount: number;
  targetCycleFound: boolean;
  targetCycleStatus?: string;
}

export function validateChallenges(options: ValidationOptions = {}): ValidationReport {
  const isRelease = options.release ?? false;
  const targetCycle = options.targetCycle ?? getBrasiliaCycleId();
  const dir = options.challengesDir ?? defaultChallengesDir;

  const errors: string[] = [];
  const warnings: string[] = [];

  // Invariant: test fixtures under tests/fixtures/ must never satisfy the release gate
  const normalizedPath = path.normalize(dir).replace(/\\/g, "/");
  if (isRelease && normalizedPath.includes("tests/fixtures")) {
    errors.push(
      "[EDITORIAL RELEASE GATE REJECTED] Test fixtures cannot be used to satisfy the release gate. Production challenges must reside in content/challenges/."
    );
    return {
      success: false,
      errors,
      warnings,
      totalFiles: 0,
      draftCount: 0,
      publishableCount: 0,
      targetCycleFound: false,
    };
  }

  if (!fs.existsSync(dir)) {
    errors.push(`[EDITORIAL GATE ERROR] Directory does not exist: ${dir}`);
    return {
      success: false,
      errors,
      warnings,
      totalFiles: 0,
      draftCount: 0,
      publishableCount: 0,
      targetCycleFound: false,
    };
  }

  const files = fs
    .readdirSync(dir)
    .filter((file: string) => file.endsWith(".json"));

  let publishableCount = 0;
  let draftCount = 0;
  let targetCycleFound = false;
  let targetCycleStatus: string | undefined;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    try {
      const content = JSON.parse(fs.readFileSync(fullPath, "utf-8"));

      const valid = validate(content);
      if (!valid) {
        errors.push(`[SCHEMA ERROR] ${file}: ${JSON.stringify(validate.errors)}`);
      }

      // Invariant: wordLength === normalizedWord.length
      if (content.wordLength !== content.normalizedWord?.length) {
        errors.push(
          `[INVARIANT ERROR] ${file}: wordLength (${content.wordLength}) !== normalizedWord.length (${content.normalizedWord?.length})`
        );
      }

      if (content.cycleDate === targetCycle) {
        targetCycleFound = true;
        targetCycleStatus = content.editorialStatus;
      }

      // Invariant: AI is assistive, not authoritative. Production builds reject Draft.
      if (content.editorialStatus === "Draft") {
        draftCount++;
        warnings.push(
          `[EDITORIAL WARNING] ${file} is in "Draft" status. Human review required before release.`
        );
      } else if (
        content.editorialStatus === "Verified" ||
        content.editorialStatus === "Published"
      ) {
        publishableCount++;
      }
    } catch (err) {
      errors.push(`[PARSE ERROR] Failed to parse ${file}: ${String(err)}`);
    }
  }

  // Release Gate validations
  if (isRelease) {
    if (!isValidCivilDate(targetCycle)) {
      errors.push(
        `[EDITORIAL RELEASE GATE FAILED] Target release cycle "${targetCycle}" is not a valid civil calendar date (YYYY-MM-DD).`
      );
    }

    if (files.length === 0) {
      errors.push(
        `[EDITORIAL RELEASE GATE FAILED] Zero production challenges found in ${dir}. Cannot ship release with an empty production registry.`
      );
    } else if (!targetCycleFound) {
      errors.push(
        `[EDITORIAL RELEASE GATE FAILED] No challenge exists for target release cycle "${targetCycle}". A human-curated challenge must be added before release.`
      );
    } else if (targetCycleStatus !== "Verified" && targetCycleStatus !== "Published") {
      errors.push(
        `[EDITORIAL RELEASE GATE PENDING] Target cycle "${targetCycle}" challenge is in "${targetCycleStatus ?? "unknown"}" status. Autonomous agent promotion is strictly prohibited. An authorized human editor must review and verify content before release.`
      );
    }
  }

  const success = errors.length === 0;
  return {
    success,
    errors,
    warnings,
    totalFiles: files.length,
    draftCount,
    publishableCount,
    targetCycleFound,
    targetCycleStatus,
  };
}

// CLI execution check
const isDirectExecution = process.argv[1] && (
  process.argv[1].endsWith("validate-challenges.ts") ||
  process.argv[1].endsWith("validate-challenges.js")
);

if (isDirectExecution) {
  const isRelease = process.argv.includes("--release");
  
  // Look for --cycle=YYYY-MM-DD or positional argument
  let targetCycle: string | undefined;
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--cycle=")) {
      targetCycle = arg.slice("--cycle=".length);
    } else if (!arg.startsWith("--") && /^\d{4}-\d{2}-\d{2}$/.test(arg)) {
      targetCycle = arg;
    }
  }

  const result = validateChallenges({ release: isRelease, targetCycle });

  for (const w of result.warnings) {
    console.warn(w);
  }

  if (!result.success) {
    for (const e of result.errors) {
      console.error(e);
    }
    process.exit(1);
  }

  console.log(
    `Validation completed successfully: ${result.publishableCount} publishable, ${result.draftCount} draft(s).`
  );
}
