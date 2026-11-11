import assert from 'node:assert/strict';
import { test } from 'node:test';
import { reviewChangedPaths } from './mpdk-guard.mjs';

test('governance-only change is allowed', () => {
  assert.equal(reviewChangedPaths(['AGENTS.md', 'docs/MPDK_V0_1_PILOT_2026-10.md']).ok, true);
});

test('core change without independent unit and scientific note is blocked', () => {
  const result = reviewChangedPaths(['src/core/radiobiology.ts']);
  assert.equal(result.ok, false);
  assert.equal(result.errors.length, 2);
});

test('core change with unit only still needs scientific documentation', () => {
  const result = reviewChangedPaths(['src/core/math.ts', 'tests/math.test.ts']);
  assert.equal(result.ok, false);
  assert.equal(result.errors.length, 1);
});

test('evidence edit with only a science note requires a unit test', () => {
  const result = reviewChangedPaths(['src/data/evidence/coefficients.ts', 'docs/EVIDENCE_VALIDATION.md']);
  assert.equal(result.ok, false);
  assert.equal(result.errors.length, 1);
});

test('unit regression plus scientific note satisfies procedural gate', () => {
  const result = reviewChangedPaths(['src/evidence/models.ts', 'tests/modelSource.test.ts', 'docs/SOURCE_NUMERICAL_CROSSCHECK_2026-10.md']);
  assert.equal(result.ok, true);
});

test('E2E alone is not an independent numerical oracle', () => {
  const result = reviewChangedPaths(['src/workflows/time.ts', 'e2e/qa.pw.ts', 'docs/QA_ACCEPTANCE.md']);
  assert.equal(result.ok, false);
});

test('non-scientific UI-only change does not trigger medical-science gate', () => {
  assert.equal(reviewChangedPaths(['src/ui/header.tsx']).ok, true);
});

