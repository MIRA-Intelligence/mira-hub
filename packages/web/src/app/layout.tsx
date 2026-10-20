import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'MIRA Hub · Skills for medical & scientific research',
  description:
    'Community marketplace of installable skills for the MIRA agent — designed for medical, biomedical, and scientific research workflows.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
            Skills
          </Link>
          <a
            href="https://github.com/MIRA-Intelligence/mira-skills"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--color-accent)]"
          >
            Contribute
          </a>
          <a
            href="https://github.com/MIRA-Intelligence/mira"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--color-accent)]"
          >
            GitHub
          </a>
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
          MIRA Hub · skills for medical & scientific research.
        </div>
        <div className="flex gap-4">
          <a href="https://mira-intelligence.github.io" className="hover:text-[var(--color-accent)]">
            Docs
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
