'use client';

import { t } from '@/lib/i18n';
import { useLang } from '@/lib/useLang';
import { THEME_MODES, type ThemeMode } from '@/lib/theme';
import { setThemeMode, useThemeMode } from '@/lib/useThemeMode';

/** One button that cycles light → dark → system, like the MIRA docs. */
export function ThemeToggle() {
  const mode = useThemeMode();
  const lang = useLang();
  const next = THEME_MODES[(THEME_MODES.indexOf(mode) + 1) % THEME_MODES.length];
  const label = `${t(lang, 'theme.label')}: ${t(lang, `theme.${mode}`)}`;
  return (
    <button
      type="button"
      onClick={() => setThemeMode(next)}
      title={label}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-chip-bg)]"
    >
      <ThemeIcon mode={mode} />
    </button>
  );
}

function ThemeIcon({ mode }: { mode: ThemeMode }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (mode === 'light') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }
  if (mode === 'dark') {
    return (
      <svg {...common}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
    </svg>
  );
}
