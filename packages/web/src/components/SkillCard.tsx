import Link from 'next/link';
import type { SkillSummary } from '@/lib/types';
import { TagChip } from './TagChip';

export function SkillCard({ skill }: { skill: SkillSummary }) {
  const primaryTags = skill.tags.slice(0, 4);
  return (
    <Link
      href={`/skills/${skill.slug}/`}
      className="group flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 hover:border-[var(--color-accent)] transition"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-semibold tracking-tight">{skill.name}</h3>
        <MaturityChip maturity={skill.maturity} />
      </div>
      <p className="text-sm text-[var(--color-muted)] line-clamp-3 mb-3 min-h-[3.5rem]">
        {skill.description}
      </p>
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {primaryTags.map((t) => (
          <TagChip key={t} tag={t} />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span>{skill.author?.name ?? 'unknown author'}</span>
        <span>v{skill.version}</span>
      </div>
    </Link>
  );
}

function MaturityChip({ maturity }: { maturity: SkillSummary['maturity'] }) {
  const tone =
    maturity === 'stable'
      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
      : maturity === 'beta'
      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
      : 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300';
  return (
    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${tone}`}>
      {maturity}
    </span>
  );
}
