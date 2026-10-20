import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Not found</h1>
      <p className="text-[var(--color-muted)] mt-2">
        That page or skill doesn&apos;t exist.
      </p>
      <Link
        href="/skills/"
        className="inline-flex mt-5 px-4 py-2 rounded-md bg-[var(--color-accent)] text-[var(--color-accent-fg)] text-sm"
      >
        Browse skills
      </Link>
    </div>
  );
}
