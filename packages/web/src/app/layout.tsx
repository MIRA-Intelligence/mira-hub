import type { Metadata } from 'next';
import Link from 'next/link';
import { LANG_BOOT_SCRIPT } from '@/lib/i18n';
import { T } from '@/components/T';
import { LangToggle } from '@/components/LangToggle';
import './globals.css';

export const metadata: Metadata = {
  title: 'MIRA Hub · Skills for medical & scientific research',
  description:
    'Community marketplace of installable skills for the MIRA agent — designed for medical, biomedical, and scientific research workflows.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The boot script sets lang/data-lang before hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_BOOT_SCRIPT }} />
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
        <nav className="flex items-center gap-5 text-sm">
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
            className="hover:text-[var(--color-accent)]"
          >
            GitHub
          </a>
          <LangToggle />
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
          <a href="https://mira-intelligence.github.io" className="hover:text-[var(--color-accent)]">
            <T k="footer.docs" />
          </a>
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
