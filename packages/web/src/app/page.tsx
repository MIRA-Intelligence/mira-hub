import Link from 'next/link';
import { getRegistry, getTaxonomy } from '@/lib/registry';
import { SkillCard } from '@/components/SkillCard';

export default function HomePage() {
  const registry = getRegistry();
  const taxonomy = getTaxonomy();
  const featured = registry.skills.slice(0, 6);

  return (
    <div>
      <Hero count={registry.count} />

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Featured skills</h2>
          <Link
            href="/skills/"
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            Browse all →
          </Link>
        </div>
        {featured.length === 0 ? (
          <EmptyRegistry />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((s) => (
              <SkillCard key={s.slug} skill={s} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <h2 className="text-lg font-semibold mb-4">Browse by</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {taxonomy.facets.map((facet) => (
            <div
              key={facet.id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4"
            >
              <h3 className="font-medium mb-2">{facet.label.en}</h3>
              <div className="flex flex-wrap gap-1.5">
                {facet.values.map((v) => (
                  <Link
                    key={v.id}
                    href={`/skills/?${facet.namespace}=${v.id}`}
                    className="text-xs rounded-md px-2 py-1 bg-[var(--color-chip-bg)] text-[var(--color-chip-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-fg)] transition"
                  >
                    {v.label.en}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Hero({ count }: { count: number }) {
  return (
    <section className="border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-3">
          MIRA Hub · {count} skills published
        </div>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight max-w-3xl">
          Skills for medical &amp; scientific research,{' '}
          <span className="text-[var(--color-accent)]">one click away</span>.
        </h1>
        <p className="mt-4 text-[var(--color-muted)] max-w-2xl">
          Curated, installable workflows — from PubMed search to DICOM
          radiomics, survival analysis, and journal-ready slides — that drop
          straight into MIRA Desktop.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/skills/"
            className="inline-flex items-center px-4 py-2 rounded-md bg-[var(--color-accent)] text-[var(--color-accent-fg)] text-sm font-medium hover:opacity-90"
          >
            Browse skills
          </Link>
          <a
            href="https://github.com/MIRA-Intelligence/mira-skills"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-md border border-[var(--color-border)] text-sm hover:border-[var(--color-accent)]"
          >
            Contribute a skill
          </a>
        </div>
      </div>
    </section>
  );
}

function EmptyRegistry() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border)] p-10 text-center text-[var(--color-muted)]">
      <p className="font-medium mb-1">No skills published yet.</p>
      <p className="text-sm">
        Run <code>npm run build:registry</code> at the repo root to generate
        the registry locally.
      </p>
    </div>
  );
}
