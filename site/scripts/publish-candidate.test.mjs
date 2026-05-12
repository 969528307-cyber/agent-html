import assert from "node:assert/strict";
import test from "node:test";

import { validateCandidateForPublish } from "./publish-candidate.mjs";

test("blocks non-skill candidates with install hints from nested skill docs", () => {
  assert.throws(
    () =>
      validateCandidateForPublish({
        id: "candidate-activepieces-2026-05-12",
        type: "tool",
        title: "Activepieces",
        proposedToolType: "mcp",
        status: "approved",
        extractedInstall: [
          {
            title: "Install command",
            command: "npm run lint-dev",
            sourcePath: ".agents/skills/agent-browser/SKILL.md",
          },
        ],
      }),
    /Unsafe install source/
  );
});

test("blocks old generated non-skill candidates with unsourced install hints and nested skill docs", () => {
  assert.throws(
    () =>
      validateCandidateForPublish({
        id: "candidate-activepieces-2026-05-12",
        type: "tool",
        title: "Activepieces",
        proposedToolType: "mcp",
        status: "approved",
        detectedFiles: [".agents/skills/agent-browser/SKILL.md"],
        extractedInstall: [
          {
            title: "Install command",
            command: "npm run lint-dev",
          },
        ],
      }),
    /Re-ingest candidate/
  );
});

test("allows skill candidates to publish install hints from SKILL.md", () => {
  assert.doesNotThrow(() =>
    validateCandidateForPublish({
      id: "candidate-context-skill-2026-05-12",
      type: "tool",
      title: "Context Skill",
      proposedToolType: "skill",
      status: "approved",
      extractedInstall: [
        {
          title: "Install command",
          command: "cp skills/context/SKILL.md ~/.codex/skills/context/SKILL.md",
          sourcePath: "skills/context/SKILL.md",
        },
      ],
    })
  );
});
