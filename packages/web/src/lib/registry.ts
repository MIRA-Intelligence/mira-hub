import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import type { RegistryIndex, SkillDetail, Taxonomy } from './types';

const REGISTRY_DIR = path.join(process.cwd(), 'public', 'registry');
const TAXONOMY_PATH = path.resolve(process.cwd(), '..', '..', 'taxonomy.yaml');

export function getRegistry(): RegistryIndex {
  const file = path.join(REGISTRY_DIR, 'index.json');
  if (!fs.existsSync(file)) {
    return { generatedAt: new Date(0).toISOString(), count: 0, skills: [] };
  }
  return JSON.parse(fs.readFileSync(file, 'utf8')) as RegistryIndex;
}

export function getSkillDetail(slug: string): SkillDetail | null {
  const file = path.join(REGISTRY_DIR, 'skills', `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8')) as SkillDetail;
}

export function getTaxonomy(): Taxonomy {
  if (!fs.existsSync(TAXONOMY_PATH)) {
    return { facets: [] };
  }
  const raw = fs.readFileSync(TAXONOMY_PATH, 'utf8');
  return YAML.parse(raw) as Taxonomy;
}
