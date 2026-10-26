import type { Metadata } from 'next';
import Link from 'next/link';
import { DOCS_HOME, LANG_BOOT_SCRIPT } from '@/lib/i18n';
import { THEME_BOOT_SCRIPT } from '@/lib/theme';
import { LocalizedLink, T } from '@/components/T';
import { LangToggle } from '@/components/LangToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import './globals.css';

export const metadata: Metadata = {
  title: 'MIRA Hub · Skills for medical & scientific research',
  description:
    'Community marketplace of installable skills for the MIRA agent — designed for medical, biomedical, and scientific research workflows.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The boot scripts set lang/data-lang and data-theme before hydration.
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-dvh flex flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          <span className="text-[var(--color-accent)]">MIRA</span> Hub
        </Link>
        <nav className="flex items-center gap-4 sm:gap-5 text-sm">
          <LocalizedLink
            href={DOCS_HOME}
            className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-2 py-1 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <HomeIcon />
            <span className="sr-only sm:not-sr-only">
              <T k="nav.docsHome" />
            </span>
          </LocalizedLink>
          <Link href="/skills" className="hover:text-[var(--color-accent)]">
            <T k="nav.skills" />
          </Link>
          <a
            href="https://github.com/MIRA-Intelligence/mira-skills"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--color-accent)]"
          >
            <T k="nav.contribute" />
          </a>
          <a
            href="https://github.com/MIRA-Intelligence/mira"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline hover:text-[var(--color-accent)]"
          >
            GitHub
          </a>
          <LangToggle />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] py-8 text-sm text-[var(--color-muted)]">
      <div className="mx-auto max-w-6xl px-5 flex flex-wrap justify-between gap-4">
        <div>
          <T k="footer.tagline" />
        </div>
        <div className="flex gap-4">
          <LocalizedLink href={DOCS_HOME} className="hover:text-[var(--color-accent)]">
            <T k="footer.docs" />
          </LocalizedLink>
          <a
            href="https://github.com/MIRA-Intelligence/mira-skills"
            className="hover:text-[var(--color-accent)]"
          >
            mira-skills
          </a>
          <a
            href="https://github.com/MIRA-Intelligence/mira-hub"
            className="hover:text-[var(--color-accent)]"
          >
            mira-hub
          </a>
        </div>
      </div>
    </footer>
  );
}

function HomeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}
