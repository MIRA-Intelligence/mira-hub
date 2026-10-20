import { splitTag } from '@/lib/tags';

export function TagChip({ tag }: { tag: string }) {
  const { ns, value } = splitTag(tag);
  return (
    <span
      className="inline-flex items-center text-[11px] rounded-md px-1.5 py-0.5 bg-[var(--color-chip-bg)] text-[var(--color-chip-fg)]"
      title={tag}
    >
      {ns ? <span className="opacity-60 mr-1">{ns}:</span> : null}
      {value}
    </span>
  );
}
