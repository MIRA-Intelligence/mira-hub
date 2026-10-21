import Link from 'next/link';
import { T } from '@/components/T';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        <T k="notFound.title" />
      </h1>
      <p className="text-[var(--color-muted)] mt-2">
        <T k="notFound.body" />
      </p>
      <Link
        href="/skills/"
        className="inline-flex mt-5 px-4 py-2 rounded-md bg-[var(--color-accent)] text-[var(--color-accent-fg)] text-sm"
      >
        <T k="home.browse" />
      </Link>
    </div>
  );
}
