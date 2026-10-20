'use client';

import { useRef, useState } from 'react';
import type { SkillDetail } from '@/lib/types';

type CopyState = 'idle' | 'copied' | 'manual';
type DesktopState = 'idle' | 'launching' | 'opened' | 'missing';

const DESKTOP_RELEASES_URL = 'https://github.com/MIRA-Intelligence/mira-ui/releases';
const DEEP_LINK_TIMEOUT_MS = 1500;

export function InstallActions({ detail }: { detail: SkillDetail }) {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [desktopState, setDesktopState] = useState<DesktopState>('idle');
  const manualRef = useRef<HTMLTextAreaElement | null>(null);
  const installPrompt = `Install the "${detail.slug}" skill v${detail.version} from MIRA Hub (${detail.zipAbsoluteUrl}).`;

  const handleInstallDesktop = () => {
    setDesktopState('launching');
    tryOpenDeepLink(detail.installDeepLink, {
      onOpened: () => setDesktopState('opened'),
      onMissing: () => setDesktopState('missing'),
    });
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(installPrompt);
    if (ok) {
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1500);
      return;
    }
    setCopyState('manual');
    queueMicrotask(() => {
      const ta = manualRef.current;
      if (ta) {
        ta.focus();
        ta.select();
      }
    });
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 space-y-3">
      <button
        type="button"
        onClick={handleInstallDesktop}
        disabled={desktopState === 'launching'}
        className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md bg-[var(--color-accent)] text-[var(--color-accent-fg)] text-sm font-medium hover:opacity-90 disabled:opacity-70"
      >
        {desktopState === 'launching' ? 'Opening MIRA Desktop…' : 'Install in MIRA Desktop'}
      </button>

      {desktopState === 'missing' && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] leading-snug text-amber-700 dark:text-amber-200 space-y-1">
          <p className="font-medium">MIRA Desktop didn&apos;t respond.</p>
          <p>
            Either it isn&apos;t installed yet —{' '}
            <a
              href={DESKTOP_RELEASES_URL}
              target="_blank"
              rel="noreferrer"
              className="underline hover:opacity-80"
            >
              download the latest build
            </a>{' '}
            — or it&apos;s installed but has never been launched, so the system
            hasn&apos;t registered the <code>mira://</code> handler yet. Open it
            once and try again, or just use the .zip below.
          </p>
        </div>
      )}

      <a
        href={detail.zip}
        download
        className="flex items-center justify-center w-full px-3 py-2 rounded-md border border-[var(--color-border)] text-sm font-medium hover:border-[var(--color-accent)]"
      >
        Download .zip
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center justify-center w-full px-3 py-2 rounded-md border border-dashed border-[var(--color-border)] text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]"
      >
        {copyState === 'copied'
          ? 'Copied!'
          : copyState === 'manual'
            ? 'Select & copy below'
            : 'Copy install prompt'}
      </button>
      {copyState === 'manual' && (
        <textarea
          ref={manualRef}
          readOnly
          value={installPrompt}
          rows={3}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full text-[11px] font-mono rounded-md border border-[var(--color-border)] bg-[var(--color-chip-bg)] text-[var(--color-fg)] p-2 resize-none focus:outline-none focus:border-[var(--color-accent)]"
        />
      )}
      <p className="text-[11px] text-[var(--color-muted)] leading-snug">
        The desktop button opens MIRA via the <code>mira://</code> deep link.
        If MIRA isn&apos;t installed, use the .zip and import it from{' '}
        <em>Settings → Skills &amp; Plugins</em>.
      </p>
    </div>
  );
}

/**
 * Attempt to open a custom-protocol deep link without showing the browser's
 * default "invalid address" error. We use a hidden iframe (Safari, Chrome,
 * Edge all suppress navigation errors that originate inside a same-origin
 * iframe) and treat a `visibilitychange` -> hidden as "the app took focus".
 *
 * If the page is still visible after `DEEP_LINK_TIMEOUT_MS`, we assume no
 * handler is registered and call `onMissing`.
 */
function tryOpenDeepLink(
  url: string,
  { onOpened, onMissing }: { onOpened: () => void; onMissing: () => void },
): void {
  if (typeof document === 'undefined') {
    onMissing();
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.src = url;
  document.body.appendChild(iframe);

  let settled = false;
  const finish = (state: 'opened' | 'missing') => {
    if (settled) return;
    settled = true;
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('blur', onBlur);
    window.clearTimeout(timer);
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    (state === 'opened' ? onOpened : onMissing)();
  };

  const onVisibility = () => {
    if (document.hidden) finish('opened');
  };
  const onBlur = () => finish('opened');

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('blur', onBlur);

  const timer = window.setTimeout(() => finish('missing'), DEEP_LINK_TIMEOUT_MS);
}

/**
 * Copy text to clipboard with a graceful fallback chain:
 *   1. async Clipboard API (only available in secure contexts: https / localhost)
 *   2. legacy document.execCommand('copy') via a hidden textarea
 *   3. give up — the caller surfaces a manual-copy textarea instead
 *
 * Returns true iff one of the automated paths succeeded.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy path
    }
  }
  if (typeof document === 'undefined') return false;
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
