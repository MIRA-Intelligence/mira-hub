import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';
import YAML from 'yaml';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { mirahubSchema } from './schema.mjs';

const ajv = new Ajv.default({ allErrors: true, strict: false });
addFormats.default(ajv);
const validateMirahub = ajv.compile(mirahubSchema);

/**
 * @typedef {Object} SkillRecord
 * @property {string} slug
 * @property {string} dir              absolute path to the skill folder
 * @property {object} mirahub          parsed mirahub.yaml
 * @property {object} skill            parsed SKILL.md frontmatter
 * @property {string} markdown         SKILL.md body (no frontmatter)
 * @property {string} description      skill.description (from frontmatter)
 * @property {{en:string, zh:string}} descriptions  hub abstract per site language
 * @property {string[]} files          relative file list inside the folder, sorted
 */

/** Site languages every skill needs an abstract in. */
export const LANGS = /** @type {const} */ (['en', 'zh']);

/**
 * Walk the skills root and load every <slug>/ entry. Throws aggregated errors
 * if anything is missing or invalid.
 *
 * @param {string} skillsDir absolute path to the `skills/` directory
 * @returns {Promise<SkillRecord[]>}
 */
export async function loadSkills(skillsDir) {
  if (!fs.existsSync(skillsDir) || !fs.statSync(skillsDir).isDirectory()) {
    throw new Error(`skills directory not found: ${skillsDir}`);
  }

  const entries = await fsp.readdir(skillsDir, { withFileTypes: true });
  const slugs = entries
    .filter((e) => e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('_'))
    .map((e) => e.name)
    .sort();

  /** @type {SkillRecord[]} */
  const records = [];
  /** @type {string[]} */
  const errors = [];

  for (const slug of slugs) {
    const dir = path.join(skillsDir, slug);
    try {
      records.push(await loadOne(dir, slug));
    } catch (err) {
      errors.push(`[${slug}] ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (errors.length > 0) {
    throw new AggregateValidationError(errors);
  }
  return records;
}

export class AggregateValidationError extends Error {
  /** @param {string[]} errors */
  constructor(errors) {
    super(`mira-skills validation failed (${errors.length}):\n  - ${errors.join('\n  - ')}`);
    this.name = 'AggregateValidationError';
    this.errors = errors;
  }
}

async function loadOne(dir, slug) {
  const skillPath = path.join(dir, 'SKILL.md');
  const yamlPath = path.join(dir, 'mirahub.yaml');

  if (!fs.existsSync(skillPath)) throw new Error('missing SKILL.md');
  if (!fs.existsSync(yamlPath)) throw new Error('missing mirahub.yaml');

  // SKILL.md frontmatter + body
  const raw = await fsp.readFile(skillPath, 'utf8');
  const parsed = matter(raw);
  const skill = parsed.data ?? {};
  if (!skill || typeof skill !== 'object') throw new Error('SKILL.md frontmatter is not an object');
  if (typeof skill.name !== 'string' || skill.name.trim() === '') {
    throw new Error('SKILL.md frontmatter is missing `name`');
  }
  if (typeof skill.description !== 'string' || skill.description.trim() === '') {
    throw new Error('SKILL.md frontmatter is missing `description`');
  }
  if (skill.name !== slug) {
    throw new Error(`SKILL.md \`name\` (${skill.name}) does not match folder slug (${slug})`);
  }

  // mirahub.yaml
  const yamlRaw = await fsp.readFile(yamlPath, 'utf8');
  let mirahub;
  try {
    mirahub = YAML.parse(yamlRaw);
  } catch (err) {
    throw new Error(`mirahub.yaml is not valid YAML: ${err instanceof Error ? err.message : err}`);
  }
  if (!mirahub || typeof mirahub !== 'object') throw new Error('mirahub.yaml is empty or not an object');

  if (!validateMirahub(mirahub)) {
    const messages = (validateMirahub.errors ?? [])
      .map((e) => `${e.instancePath || '/'} ${e.message}`)
      .join('; ');
    throw new Error(`mirahub.yaml schema errors: ${messages}`);
  }
  if (mirahub.slug !== slug) {
    throw new Error(`mirahub.yaml.slug (${mirahub.slug}) does not match folder name (${slug})`);
  }

  // Cover / screenshots must exist if declared
  if (mirahub.cover) {
    const cover = path.join(dir, mirahub.cover);
    if (!fs.existsSync(cover)) throw new Error(`cover not found: ${mirahub.cover}`);
  }
  for (const shot of mirahub.screenshots ?? []) {
    const p = path.join(dir, shot);
    if (!fs.existsSync(p)) throw new Error(`screenshot not found: ${shot}`);
  }

  const descriptions = resolveDescriptions(skill.description, mirahub.description);
  const files = await listFiles(dir);

  return {
    slug,
    dir,
    mirahub,
    skill,
    markdown: parsed.content,
    description: skill.description,
    descriptions,
    files,
  };
}

/**
 * The SKILL.md description stands in for the language it's written in; every
 * other site language must come from mirahub.yaml `description`.
 *
 * @param {string} skillDescription
 * @param {{en?:string, zh?:string}|undefined} overrides
 * @returns {{en:string, zh:string}}
 */
function resolveDescriptions(skillDescription, overrides = {}) {
  const own = skillDescription.trim();
  const ownLang = isMostlyCjk(own) ? 'zh' : 'en';
  /** @type {Record<string, string>} */
  const out = {};
  for (const lang of LANGS) {
    const text = overrides[lang]?.trim() ?? (lang === ownLang ? own : undefined);
    if (!text) {
      throw new Error(
        `no ${lang} description: SKILL.md's is ${ownLang}, so set mirahub.yaml \`description.${lang}\``,
      );
    }
    out[lang] = text;
  }
  return /** @type {{en:string, zh:string}} */ (out);
}

/** True when CJK characters make up most of the letters (mixed-in trigger words don't count). */
function isMostlyCjk(text) {
  const cjk = text.match(/[㐀-鿿豈-﫿]/g)?.length ?? 0;
  const latin = text.match(/[A-Za-z]/g)?.length ?? 0;
  // One CJK char carries roughly a word's worth of meaning, ~4 Latin letters.
  return cjk * 4 > latin;
}

/** Recursively list files inside a directory, sorted, excluding hidden files. */
async function listFiles(dir) {
  /** @type {string[]} */
  const out = [];
  async function walk(rel) {
    const abs = path.join(dir, rel);
    const entries = await fsp.readdir(abs, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith('.')) continue;
      const next = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) await walk(next);
      else if (e.isFile()) out.push(next);
    }
  }
  await walk('');
  out.sort();
  return out;
}

/**
 * sha256 of a file's contents.
 * @param {string} absPath
 * @returns {Promise<string>}
 */
export async function sha256File(absPath) {
  const buf = await fsp.readFile(absPath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}
