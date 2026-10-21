'use client';

import { setLang, useLang } from '@/lib/useLang';
import type { Lang } from '@/lib/i18n';

const OPTIONS: { lang: Lang; label: string }[] = [
  { lang: 'en', label: 'EN' },
  { lang: 'zh', label: '中文' },
];

export function LangToggle() {
  const current = useLang();
  return (
    <div
      role="group"
      aria-label="Language / 语言"
      className="flex items-center rounded-md border border-[var(--color-border)] p-0.5 text-xs"
    >
      {OPTIONS.map(({ lang, label }) => (
        <button
          key={lang}
          type="button"
          aria-pressed={current === lang}
          onClick={() => setLang(lang)}
          className={
            current === lang
              ? 'px-2 py-0.5 rounded bg-[var(--color-accent)] text-[var(--color-accent-fg)]'
              : 'px-2 py-0.5 rounded text-[var(--color-muted)] hover:text-[var(--color-accent)]'
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
