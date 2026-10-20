#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadSkills, AggregateValidationError } from './loadSkills.mjs';
import { emitRegistry } from './emitRegistry.mjs';
import { vendorUpstream } from './vendorUpstream.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HUB_ROOT = path.resolve(__dirname, '..', '..', '..'); // .../mira-hub
const WEB_PUBLIC = path.join(HUB_ROOT, 'packages', 'web', 'public');
const DEFAULT_SKILLS_DIR = path.resolve(HUB_ROOT, '..', 'mira-skills', 'skills');

// Relative CLI paths are taken from where the user ran npm (INIT_CWD), not
// from this workspace, so `npm run build:registry -- --skills-dir ../x` works
// from the hub root as documented.
const CALLER_CWD = process.env.INIT_CWD ?? process.cwd();

const DEFAULT_BASE_PATH = '/mira-hub';
const DEFAULT_BASE_URL = 'https://mira-intelligence.github.io';

async function main() {
  const [, , cmd, ...rest] = process.argv;
  const args = parseArgs(rest);

  if (!cmd || cmd === '--help' || cmd === '-h') return printHelp();

  const skillsDir = path.resolve(CALLER_CWD, args.skillsDir ?? process.env.MIRA_SKILLS_DIR ?? DEFAULT_SKILLS_DIR);
  const basePath = args.basePath ?? process.env.MIRAHUB_BASE_PATH ?? DEFAULT_BASE_PATH;
  const baseUrl = args.baseUrl ?? process.env.MIRAHUB_BASE_URL ?? DEFAULT_BASE_URL;

  if (cmd === 'check') {
    return await runCheck({ skillsDir });
  }
  if (cmd === 'build') {
    return await runBuild({ skillsDir, basePath, baseUrl, outDir: args.outDir && path.resolve(CALLER_CWD, args.outDir) });
  }
  if (cmd === 'vendor') {
    const manifestPath = path.resolve(CALLER_CWD, args.manifest ?? path.join(skillsDir, '..', 'upstream.yaml'));
    console.error(`[mirahub-builder] vendor: ${manifestPath} -> ${skillsDir}`);
    const { count } = await vendorUpstream({ skillsDir, manifestPath, cacheDir: args.cacheDir && path.resolve(CALLER_CWD, args.cacheDir), only: args.only });
    console.error(`[mirahub-builder] OK — vendored ${count} skill(s).`);
    return;
  }
  console.error(`Unknown command: ${cmd}`);
  printHelp();
  process.exit(2);
}

async function runCheck({ skillsDir }) {
  console.error(`[mirahub-builder] check: ${skillsDir}`);
  try {
    const records = await loadSkills(skillsDir);
    console.error(`[mirahub-builder] OK — ${records.length} skill(s) validated.`);
  } catch (err) {
    if (err instanceof AggregateValidationError) {
      console.error(`[mirahub-builder] FAIL — ${err.errors.length} error(s):`);
      for (const e of err.errors) console.error(`  - ${e}`);
    } else {
      console.error(`[mirahub-builder] FAIL — ${err instanceof Error ? err.message : err}`);
    }
    process.exit(1);
  }
}

async function runBuild({ skillsDir, basePath, baseUrl, outDir }) {
  const finalOut = path.resolve(outDir ?? WEB_PUBLIC);
  console.error(`[mirahub-builder] build: ${skillsDir}`);
  console.error(`[mirahub-builder]   basePath = ${basePath}`);
  console.error(`[mirahub-builder]   baseUrl  = ${baseUrl}`);
  console.error(`[mirahub-builder]   outDir   = ${finalOut}`);

  const records = await loadSkills(skillsDir);
  const result = await emitRegistry(records, {
    outDir: finalOut,
    basePath,
    baseUrl,
  });
  console.error(`[mirahub-builder] OK — wrote ${result.count} skill(s) to ${result.registryDir}`);
}

function parseArgs(argv) {
  /** @type {Record<string,string>} */
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const eq = key.indexOf('=');
    if (eq >= 0) {
      out[camel(key.slice(0, eq))] = key.slice(eq + 1);
    } else {
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        out[camel(key)] = 'true';
      } else {
        out[camel(key)] = next;
        i++;
      }
    }
  }
  return out;
}

function camel(s) {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function printHelp() {
  console.error(`mirahub-builder <check|build|vendor> [options]

Options:
  --skills-dir <path>   path to mira-skills/skills (default: ../mira-skills/skills, env MIRA_SKILLS_DIR)
  --base-path <prefix>  URL prefix where the site will live (default: /mira-hub, env MIRAHUB_BASE_PATH)
  --base-url <origin>   absolute origin used in mira:// install URLs (default: https://mira-intelligence.github.io, env MIRAHUB_BASE_URL)
  --out-dir <path>      where to write registry/ (default: packages/web/public)

vendor options:
  --manifest <path>     upstream manifest (default: <skills-dir>/../upstream.yaml)
  --cache-dir <path>    where pinned upstream checkouts are kept (default: $TMPDIR/mirahub-upstream)
  --only <slug>         vendor a single manifest entry`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
