#!/usr/bin/env node
/**
 * MPDK v0.1: deterministic procedural companion-file guard.
 * Does NOT validate equation correctness, citation truth or clinical safety.
 */
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const protectedPrefixes = [
  'src/core/',
  'src/workflows/',
  'src/evidence/',
  'src/data/evidence/',
  'src/regimens/',
  'src/data/regimens/',
];

const scientificDoc = /^docs\/(?:AUDIT|EVIDENCE|HYTEC|P[0-9]+_|SOURCE|OUTCOME|CONSTRAINT|QA_|REGIMEN|REIRRADIATION|TREATMENT|LITERATURE|PRIMARY_|MPDK_|SCIENTIFIC|adr\/).*\.(?:md|csv|json)$/i;

export function reviewChangedPaths(input) {
  const files = [...new Set(input.map((p) => p.trim().replaceAll('\\', '/')).filter(Boolean))];
  const touched = files.filter((p) => protectedPrefixes.some((prefix) => p.startsWith(prefix)));
  const errors = [];
  if (touched.length) {
    if (!files.some((p) => p.startsWith('tests/') && /\.(ts|tsx|js|mjs)$/.test(p))) {
      errors.push('Protected scientific change requires a changed tests/ unit regression file; E2E alone is insufficient.');
    }
    if (!files.some((p) => scientificDoc.test(p))) {
      errors.push('Protected scientific change requires an updated docs/ scientific or QA note.');
    }
  }
  return { ok: errors.length === 0, protected: touched, errors };
}

function parseArgs(args) {
  const index = args.indexOf('--base');
  if (index < 0 || !args[index + 1]) {
    throw new Error('Provide --base <git-ref-or-commit> (e.g. origin/develop).');
  }
  return args[index + 1];
}

function main() {
  try {
    const base = parseArgs(process.argv.slice(2));
    const diff = spawnSync('git', ['diff', '--name-only', '--diff-filter=ACMR', base + '...HEAD'], { encoding: 'utf8' });
    if (diff.status !== 0 || diff.error) {
      throw new Error('git diff failed: ' + (diff.stderr || diff.error?.message || 'unknown error'));
    }
    const result = reviewChangedPaths(diff.stdout.split(/\r?\n/));
    console.log(JSON.stringify({ policy: 'mpdk-v0.1', base, ...result }, null, 2));
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    console.error('[MPDK guard] ' + error.message);
    process.exitCode = 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

