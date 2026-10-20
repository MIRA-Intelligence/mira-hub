import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import archiver from 'archiver';

const FIXED_MTIME = new Date(0);

/**
 * Deterministically zip a skill folder.
 * - Entries are added in sorted order.
 * - All entries get a fixed mtime so identical content yields identical sha256.
 *
 * Returns the absolute zip path and its sha256.
 *
 * @param {{slug:string, version:string, dir:string, files:string[]}} record
 * @param {string} outDir absolute path to the directory to write the zip into
 * @returns {Promise<{zipPath:string, sha256:string, size:number}>}
 */
export async function zipSkill(record, outDir) {
  await fsp.mkdir(outDir, { recursive: true });
  const zipName = `${record.slug}-${record.version}.zip`;
  const zipPath = path.join(outDir, zipName);

  // Build into a temp file first so partial failures don't leave junk.
  const tmp = `${zipPath}.tmp-${process.pid}-${Date.now()}`;

  await new Promise((resolve, reject) => {
    const out = fs.createWriteStream(tmp);
    const archive = archiver('zip', {
      zlib: { level: 9 },
      forceLocalTime: false,
    });
    out.on('close', resolve);
    out.on('error', reject);
    archive.on('warning', reject);
    archive.on('error', reject);
    archive.pipe(out);

    for (const rel of record.files) {
      const abs = path.join(record.dir, rel);
      // Skip files that vanished between scan and zip
      if (!fs.existsSync(abs)) continue;
      archive.file(abs, {
        name: `${record.slug}/${rel}`,
        date: FIXED_MTIME,
      });
    }

    archive.finalize().catch(reject);
  });

  await fsp.rename(tmp, zipPath);

  const buf = await fsp.readFile(zipPath);
  const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
  return { zipPath, sha256, size: buf.length };
}
