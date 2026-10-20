import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRegistry, getSkillDetail } from '@/lib/registry';
import { TagChip } from '@/components/TagChip';
import { InstallActions } from './InstallActions';
import { SkillReadme } from './SkillReadme';

export function generateStaticParams() {
  const registry = getRegistry();
  return registry.skills.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = getSkillDetail(slug);
  if (!detail) return { title: 'Skill not found · MIRA Hub' };
  return {
    title: `${detail.name} · MIRA Hub`,
    description: detail.description,
  };
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = getSkillDetail(slug);
  if (!detail) notFound();

  return (
    <article className="mx-auto max-w-6xl px-5 py-8">
      <nav className="text-sm text-[var(--color-muted)] mb-4">
        <Link href="/skills/" className="hover:text-[var(--color-accent)]">
          Skills
        </Link>
        <span className="mx-1.5">/</span>
        <span>{detail.name}</span>
      </nav>

      <header className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{detail.name}</h1>
            <p className="text-[var(--color-muted)] mt-1 max-w-2xl">{detail.description}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 max-w-md justify-end">
            {detail.tags.map((t) => (
              <TagChip key={t} tag={t} />
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8">
        <div>
          {detail.screenshots.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {detail.screenshots.map((s) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={s}
                  src={s}
                  alt=""
                  className="rounded-lg border border-[var(--color-border)] w-full"
                />
              ))}
            </div>
          )}
          <SkillReadme markdown={detail.markdown} />
        </div>

        <aside className="space-y-5 md:sticky md:top-20 md:self-start">
          <InstallActions detail={detail} />
          <SidebarMeta detail={detail} />
        </aside>
      </div>
    </article>
  );
}

function SidebarMeta({ detail }: { detail: ReturnType<typeof getSkillDetail> }) {
  if (!detail) return null;
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-sm space-y-2">
      <Row label="Version" value={`v${detail.version}`} />
      <Row label="Maturity" value={detail.maturity} />
      {detail.license && <Row label="License" value={detail.license} />}
      {detail.author && (
        <Row
          label="Author"
          value={
            detail.author.github ? (
              <a
                href={`https://github.com/${detail.author.github}`}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-accent)] hover:underline"
              >
                {detail.author.name}
              </a>
            ) : (
              detail.author.name
            )
          }
        />
      )}
      {detail.homepage && (
        <Row
          label="Homepage"
          value={
            <a
              href={detail.homepage}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-accent)] hover:underline truncate"
            >
              {detail.homepage}
            </a>
          }
        />
      )}
      {detail.links?.repo && (
        <Row
          label="Repo"
          value={
            <a
              href={detail.links.repo}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-accent)] hover:underline"
            >
              GitHub
            </a>
          }
        />
      )}
      {detail.links?.issues && (
        <Row
          label="Issues"
          value={
            <a
              href={detail.links.issues}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-accent)] hover:underline"
            >
              Tracker
            </a>
          }
        />
      )}
      <Row label="Size" value={`${(detail.size / 1024).toFixed(1)} KB`} />
      <Row
        label="sha256"
        value={<code className="text-[10px] break-all">{detail.sha256}</code>}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}
