import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { zipSkill } from './zipSkill.mjs';

/**
 * @typedef {import('./loadSkills.mjs').SkillRecord} SkillRecord
 */

/**
 * Emit the static registry consumed by the Next.js site.
 *
 * Layout under <outDir>/registry/:
 *   index.json            list of summary entries (homepage + listing)
 *   skills/<slug>.json    per-slug detail payload (markdown body, screenshots, install URLs)
 *   skills/<slug>-<v>.zip the installable artifact
 *   covers/<slug>.<ext>   copied skill cover (if any)
 *   screenshots/<slug>/.. copied screenshots
 *
 * @param {SkillRecord[]} records
 * @param {{outDir:string, basePath:string, baseUrl:string}} opts
 *   outDir   - absolute path to the Next public dir (registry/ created inside)
 *   basePath - URL prefix the registry will be served under (e.g. /mira-hub)
 *   baseUrl  - absolute origin used to build mira:// install URLs (e.g. https://mira-intelligence.github.io)
 */
export async function emitRegistry(records, { outDir, basePath, baseUrl }) {
  const registryDir = path.join(outDir, 'registry');
  const skillsOutDir = path.join(registryDir, 'skills');
  const coversDir = path.join(registryDir, 'covers');
  const shotsDir = path.join(registryDir, 'screenshots');

  // Clean and recreate
  await fsp.rm(registryDir, { recursive: true, force: true });
  await fsp.mkdir(skillsOutDir, { recursive: true });
  await fsp.mkdir(coversDir, { recursive: true });
  await fsp.mkdir(shotsDir, { recursive: true });

  /** @type {object[]} */
  const indexEntries = [];

  for (const r of records) {
    const { zipPath, sha256, size } = await zipSkill(
      { slug: r.slug, version: r.mirahub.version, dir: r.dir, files: r.files },
      skillsOutDir,
    );
    const zipRel = `registry/skills/${path.basename(zipPath)}`;
    const zipUrl = joinUrl(basePath, zipRel);
    const zipAbsoluteUrl = joinUrl(baseUrl, zipUrl);

    let coverUrl = null;
    if (r.mirahub.cover) {
      const ext = path.extname(r.mirahub.cover) || '.png';
      const dest = path.join(coversDir, `${r.slug}${ext}`);
      await fsp.copyFile(path.join(r.dir, r.mirahub.cover), dest);
      coverUrl = joinUrl(basePath, `registry/covers/${path.basename(dest)}`);
    }

    /** @type {string[]} */
    const screenshotUrls = [];
    for (const [i, shot] of (r.mirahub.screenshots ?? []).entries()) {
      const ext = path.extname(shot) || '.png';
      const dest = path.join(shotsDir, `${r.slug}-${String(i + 1).padStart(2, '0')}${ext}`);
      await fsp.mkdir(path.dirname(dest), { recursive: true });
      await fsp.copyFile(path.join(r.dir, shot), dest);
      screenshotUrls.push(joinUrl(basePath, `registry/screenshots/${path.basename(dest)}`));
    }

    const installDeepLink = buildMiraInstallUrl({
      slug: r.slug,
      version: r.mirahub.version,
      zipAbsoluteUrl,
      sha256,
    });

    const summary = {
      slug: r.slug,
      name: r.skill.name,
      version: r.mirahub.version,
      description: r.description,
      maturity: r.mirahub.maturity ?? 'experimental',
      license: r.mirahub.license ?? null,
      author: r.mirahub.author ?? null,
      tags: r.mirahub.tags,
      cover: coverUrl,
      zip: zipUrl,
      sha256,
      size,
    };

    const detail = {
      ...summary,
      homepage: r.mirahub.homepage ?? null,
      links: r.mirahub.links ?? null,
      screenshots: screenshotUrls,
      markdown: r.markdown,
      installDeepLink,
      zipAbsoluteUrl,
      skillFrontmatter: r.skill,
    };

    await fsp.writeFile(
      path.join(skillsOutDir, `${r.slug}.json`),
      JSON.stringify(detail, null, 2) + '\n',
      'utf8',
    );

    indexEntries.push(summary);
  }

  indexEntries.sort((a, b) => a.slug.localeCompare(b.slug));
  await fsp.writeFile(
    path.join(registryDir, 'index.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: indexEntries.length,
        skills: indexEntries,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );

  return {
    registryDir,
    count: indexEntries.length,
  };
}

function joinUrl(base, rel) {
  if (!base || base === '/') return `/${rel.replace(/^\/+/, '')}`;
  if (rel.startsWith('/')) {
    return base.replace(/\/+$/, '') + rel;
  }
  if (/^https?:/.test(rel)) return rel;
  return base.replace(/\/+$/, '') + '/' + rel.replace(/^\/+/, '');
}

function buildMiraInstallUrl({ slug, version, zipAbsoluteUrl, sha256 }) {
  const params = new URLSearchParams({
    slug,
    version,
    zip: zipAbsoluteUrl,
    sha256,
  });
  return `mira://install?${params.toString()}`;
}
