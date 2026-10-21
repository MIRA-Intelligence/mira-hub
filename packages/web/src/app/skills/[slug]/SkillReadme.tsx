'use client';

import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { L, T } from '@/components/T';

const COLLAPSED_MAX_PX = 440;
const HEADING_RE = /^##\s+(.+?)\s*$/gm;

export function SkillReadme({ markdown }: { markdown: string }) {
  const sections = useMemo(() => extractSections(markdown), [markdown]);
  // Auto-expand short skills (<= ~60 lines); collapse long ones by default.
  const [expanded, setExpanded] = useState(() => markdown.split('\n').length <= 60);
  const long = markdown.split('\n').length > 60;

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      <header className="px-5 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              <T k="readme.title" />
            </h2>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              <T k="readme.subtitle" />
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] shrink-0">
            {sections.length > 0 ? (
              <L
                text={{
                  en: `${sections.length} sections`,
                  zh: `${sections.length} 个章节`,
                }}
              />
            ) : (
              'Markdown'
            )}
          </span>
        </div>
        {sections.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {sections.map((s) => (
              <span
                key={s}
                className="text-[11px] rounded-md px-2 py-0.5 bg-[var(--color-chip-bg)] text-[var(--color-chip-fg)]"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="relative">
        <div
          className="prose-mirahub px-5 py-4 transition-[max-height] duration-200"
          style={expanded ? undefined : { maxHeight: COLLAPSED_MAX_PX, overflow: 'hidden' }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
        {!expanded && long && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--color-card)] via-[var(--color-card)]/85 to-transparent"
          />
        )}
      </div>

      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full py-2.5 text-sm font-medium text-[var(--color-accent)] hover:bg-[var(--color-chip-bg)] transition border-t border-[var(--color-border)] flex items-center justify-center gap-1.5"
        >
          <T k={expanded ? 'readme.collapse' : 'readme.expand'} />
          <Chevron up={expanded} />
        </button>
      )}
    </section>
  );
}

function Chevron({ up = false }: { up?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={up ? 'rotate-180' : ''}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function extractSections(markdown: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  HEADING_RE.lastIndex = 0;
  while ((m = HEADING_RE.exec(markdown)) && out.length < 8) {
    out.push(m[1].trim());
  }
  return out;
}
