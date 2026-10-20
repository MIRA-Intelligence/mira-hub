'use client';

import { useEffect, useMemo, useState } from 'react';
import FlexSearch from 'flexsearch';
import type { Facet, SkillSummary, Taxonomy } from '@/lib/types';
import { splitTag } from '@/lib/tags';
import { SkillCard } from '@/components/SkillCard';

type Selected = Record<string, Set<string>>;

export function SkillsBrowser({
  skills,
  taxonomy,
}: {
  skills: SkillSummary[];
  taxonomy: Taxonomy;
}) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Selected>(() => initSelected(taxonomy));

  // Initialize selected facets from URL on first paint
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const next: Selected = initSelected(taxonomy);
    for (const facet of taxonomy.facets) {
      const raw = sp.get(facet.namespace);
      if (!raw) continue;
      for (const v of raw.split(',').filter(Boolean)) next[facet.namespace].add(v);
    }
    setSelected(next);
    const q = sp.get('q');
    if (q) setQuery(q);
  }, [taxonomy]);

  const index = useMemo(() => {
    const idx = new FlexSearch.Document<SkillSummary>({
      tokenize: 'forward',
      document: {
        id: 'slug',
        index: ['name', 'description', 'tags'],
      },
    });
    for (const s of skills) idx.add(s);
    return idx;
  }, [skills]);

  const filtered = useMemo(() => {
    let pool = skills;
    const q = query.trim();
    if (q) {
      const hits = index.search(q, { limit: 200 }) as unknown as Array<{
        field: string;
        result: Array<string | number>;
      }>;
      const matched = new Set<string>();
      for (const group of hits) {
        for (const id of group.result) matched.add(String(id));
      }
      pool = pool.filter((s) => matched.has(s.slug));
    }
    for (const facet of taxonomy.facets) {
      const sel = selected[facet.namespace];
      if (!sel || sel.size === 0) continue;
      pool = pool.filter((s) =>
        s.tags.some((t) => {
          const { ns, value } = splitTag(t);
          return ns === facet.namespace && sel.has(value);
        }),
      );
    }
    return pool;
  }, [skills, query, selected, index, taxonomy]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Skills</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {filtered.length} of {skills.length} skill{skills.length === 1 ? '' : 's'}
        </p>
      </div>
      <div className="mb-5">
        <input
          type="search"
          value={query}
          placeholder="Search skills, tags, descriptions…"
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        <aside className="space-y-6 md:sticky md:top-20 md:self-start">
          {taxonomy.facets.map((facet) => (
            <FacetGroup
              key={facet.id}
              facet={facet}
              selected={selected[facet.namespace] ?? new Set()}
              onToggle={(v) =>
                setSelected((prev) => {
                  const next: Selected = {};
                  for (const k of Object.keys(prev)) next[k] = new Set(prev[k]);
                  if (!next[facet.namespace]) next[facet.namespace] = new Set();
                  if (next[facet.namespace].has(v)) next[facet.namespace].delete(v);
                  else next[facet.namespace].add(v);
                  return next;
                })
              }
            />
          ))}
        </aside>

        <div>
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] p-10 text-center text-[var(--color-muted)]">
              No skills match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((s) => (
                <SkillCard key={s.slug} skill={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FacetGroup({
  facet,
  selected,
  onToggle,
}: {
  facet: Facet;
  selected: Set<string>;
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-2">
        {facet.label.en}
      </h3>
      <div className="space-y-1.5">
        {facet.values.map((v) => (
          <label
            key={v.id}
            className="flex items-center gap-2 text-sm cursor-pointer hover:text-[var(--color-accent)]"
          >
            <input
              type="checkbox"
              className="accent-[var(--color-accent)]"
              checked={selected.has(v.id)}
              onChange={() => onToggle(v.id)}
            />
            <span>{v.label.en}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function initSelected(taxonomy: Taxonomy): Selected {
  const out: Selected = {};
  for (const f of taxonomy.facets) out[f.namespace] = new Set();
  return out;
}
