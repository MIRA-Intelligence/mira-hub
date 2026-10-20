import type { Facet, Taxonomy } from './types';

export function splitTag(tag: string): { ns: string | null; value: string } {
  const i = tag.indexOf(':');
  if (i < 0) return { ns: null, value: tag };
  return { ns: tag.slice(0, i), value: tag.slice(i + 1) };
}

export function tagsByFacet(tags: string[], taxonomy: Taxonomy): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const facet of taxonomy.facets) {
    map.set(facet.namespace, new Set());
  }
  for (const t of tags) {
    const { ns, value } = splitTag(t);
    if (ns && map.has(ns)) map.get(ns)!.add(value);
  }
  return map;
}

export function freeTags(tags: string[], taxonomy: Taxonomy): string[] {
  const known = new Set(taxonomy.facets.map((f) => f.namespace));
  return tags.filter((t) => {
    const { ns } = splitTag(t);
    return !ns || !known.has(ns);
  });
}

export function facetValueLabel(facet: Facet, valueId: string, lang: 'en' | 'zh' = 'en'): string {
  const v = facet.values.find((x) => x.id === valueId);
  return v ? v.label[lang] ?? v.label.en : valueId;
}
