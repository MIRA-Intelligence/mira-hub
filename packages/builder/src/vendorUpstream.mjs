import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';
import YAML from 'yaml';

/**
 * Copy third-party skills into mira-skills from a pinned manifest
 * (mira-skills/upstream.yaml) and generate their mirahub.yaml.
 *
 * Manifest shape:
 *   sources:
 *     <id>: { repo: owner/name, ref: <commit sha>, license, author: {name, github},
 *             strip_sections?: [SKILL.md heading text to drop] }
 *   skills:
 *     - { slug, source, path, license?, maturity?, tags: [...],
 *         exclude?: [paths relative to the skill folder] }
 *
 * A vendored folder is fully owned by the manifest: it is deleted and
 * re-copied on every run, so local edits must go upstream or into the
 * manifest (e.g. tags), never into the copied files. Vendored folders whose
 * entry was removed from the manifest are deleted on a full run.
 *
 * @param {{ skillsDir: string, manifestPath: string, cacheDir?: string, only?: string }} opts
 */
export async function vendorUpstream({ skillsDir, manifestPath, cacheDir, only }) {
  const manifest = YAML.parse(await fsp.readFile(manifestPath, 'utf8'));
  const sources = manifest.sources ?? {};
  const skills = (manifest.skills ?? []).filter((s) => !only || s.slug === only);
  const cache = path.resolve(cacheDir ?? path.join(os.tmpdir(), 'mirahub-upstream'));
  await fsp.mkdir(cache, { recursive: true });

  const seen = new Set();
  for (const s of skills) {
    if (seen.has(s.slug)) throw new Error(`duplicate slug in manifest: ${s.slug}`);
    seen.add(s.slug);
    if (!sources[s.source]) throw new Error(`[${s.slug}] unknown source: ${s.source}`);
  }

  const checkouts = new Map();
  for (const s of skills) {
    const src = sources[s.source];
    if (!checkouts.has(s.source)) checkouts.set(s.source, checkout(cache, src));
    const repoDir = checkouts.get(s.source);
    await vendorOne({ skillsDir, repoDir, src, entry: s });
    console.error(`[mirahub-builder] vendored ${s.slug} <- ${src.repo}/${s.path}`);
  }
  if (!only) await pruneStale(skillsDir, seen);
  return { count: skills.length };
}

/** Delete vendored folders (tagged source:lobehub) that left the manifest. */
async function pruneStale(skillsDir, keep) {
  for (const e of await fsp.readdir(skillsDir, { withFileTypes: true })) {
    if (!e.isDirectory() || keep.has(e.name)) continue;
    const yamlPath = path.join(skillsDir, e.name, 'mirahub.yaml');
    if (!fs.existsSync(yamlPath)) continue;
    const meta = YAML.parse(await fsp.readFile(yamlPath, 'utf8')) ?? {};
    if (!(meta.tags ?? []).includes('source:lobehub')) continue;
    await fsp.rm(path.join(skillsDir, e.name), { recursive: true, force: true });
    console.error(`[mirahub-builder] removed ${e.name} (no longer in manifest)`);
  }
}

/** Shallow-fetch `repo` at the pinned commit into the cache; reuse if present. */
function checkout(cache, src) {
  const dir = path.join(cache, `${src.repo.replace('/', '__')}@${src.ref.slice(0, 12)}`);
  if (fs.existsSync(path.join(dir, '.git'))) return dir;
  fs.mkdirSync(dir, { recursive: true });
  const git = (...args) => execFileSync('git', args, { cwd: dir, stdio: ['ignore', 'ignore', 'inherit'] });
  git('init', '-q');
  git('remote', 'add', 'origin', `https://github.com/${src.repo}.git`);
  git('fetch', '-q', '--depth', '1', 'origin', src.ref);
  git('checkout', '-q', 'FETCH_HEAD');
  return dir;
}

async function vendorOne({ skillsDir, repoDir, src, entry }) {
  const from = path.join(repoDir, entry.path);
  if (!fs.existsSync(path.join(from, 'SKILL.md'))) {
    throw new Error(`[${entry.slug}] no SKILL.md at ${src.repo}/${entry.path}`);
  }
  const repoUrl = `https://github.com/${src.repo}`;
  const dest = path.join(skillsDir, entry.slug);

  // Never clobber a hand-written skill that happens to share the slug.
  const existingYaml = path.join(dest, 'mirahub.yaml');
  if (fs.existsSync(existingYaml)) {
    const prev = YAML.parse(await fsp.readFile(existingYaml, 'utf8')) ?? {};
    if (!String(prev.links?.repo ?? '').startsWith(`${repoUrl}/`)) {
      throw new Error(`[${entry.slug}] ${dest} exists and is not vendored from ${src.repo}`);
    }
  }
  await fsp.rm(dest, { recursive: true, force: true });
  await fsp.cp(from, dest, {
    recursive: true,
    filter: (p) => !path.basename(p).startsWith('.') || p === from,
  });
  for (const rel of entry.exclude ?? []) {
    const target = path.resolve(dest, rel);
    if (!target.startsWith(dest + path.sep)) throw new Error(`[${entry.slug}] bad exclude: ${rel}`);
    await fsp.rm(target, { recursive: true, force: true });
  }

  // Keep the upstream license next to the copied files.
  const hasLicense = (await fsp.readdir(dest)).some((f) => /^licen[cs]e/i.test(f));
  if (!hasLicense) {
    const repoLicense = (await fsp.readdir(repoDir)).find((f) => /^licen[cs]e/i.test(f));
    if (!repoLicense) throw new Error(`[${entry.slug}] no LICENSE in ${src.repo}`);
    await fsp.copyFile(path.join(repoDir, repoLicense), path.join(dest, 'LICENSE'));
  }

  // The hub requires SKILL.md `name` to equal the slug.
  const skillPath = path.join(dest, 'SKILL.md');
  let raw = await fsp.readFile(skillPath, 'utf8');
  const fm = matter(raw).data ?? {};
  let changed = false;
  if (fm.name !== entry.slug) {
    const fixed = raw.replace(/^(---\r?\n[\s\S]*?^)name:[^\r\n]*/m, `$1name: ${entry.slug}`);
    if (fixed === raw) throw new Error(`[${entry.slug}] could not rewrite SKILL.md name`);
    raw = fixed;
    changed = true;
  }
  if (src.strip_sections?.length) {
    const stripped = stripSections(raw, src.strip_sections);
    changed ||= stripped !== raw;
    raw = stripped;
  }
  if (changed) await fsp.writeFile(skillPath, raw);

  const mirahub = {
    slug: entry.slug,
    version: semver(fm.version ?? fm.metadata?.version),
    maturity: entry.maturity ?? 'beta',
    license: entry.license ?? src.license,
    author: src.author,
    links: {
      repo: `${repoUrl}/tree/${src.ref}/${entry.path.split('/').map(encodeURIComponent).join('/')}`,
      issues: `${repoUrl}/issues`,
    },
    tags: [...new Set([...entry.tags, 'source:lobehub'])],
  };
  const header =
    '# yaml-language-server: $schema=../../schemas/mirahub.schema.json\n' +
    '# Generated from upstream.yaml by `mirahub-builder vendor`; do not edit by hand.\n';
  await fsp.writeFile(existingYaml, header + YAML.stringify(mirahub));
}

/**
 * Drop markdown sections whose heading text is in `titles`, up to the next
 * heading of the same or higher level. Headings inside code fences are ignored.
 */
function stripSections(md, titles) {
  const eol = md.includes('\r\n') ? '\r\n' : '\n';
  const out = [];
  let fence = false;
  let skipLevel = 0;
  for (const line of md.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const h = !fence && line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (h && skipLevel && h[1].length <= skipLevel) skipLevel = 0;
    if (h && !skipLevel && titles.includes(h[2])) skipLevel = h[1].length;
    if (!skipLevel) out.push(line);
  }
  return out.join(eol).replace(/(\r?\n)+$/, eol);
}

/** Coerce upstream versions like "2.5" or 3 into SemVer; default 0.1.0. */
function semver(v) {
  if (v == null) return '0.1.0';
  const m = String(v).trim().match(/^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?$/);
  if (!m) return '0.1.0';
  return `${m[1]}.${m[2] ?? 0}.${m[3] ?? 0}`;
}
