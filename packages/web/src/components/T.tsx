import type { Localized, MessageKey } from '@/lib/i18n';
import { LANGS, messages } from '@/lib/i18n';

/**
 * Renders every language and lets CSS (keyed on <html data-lang>) show the
 * active one. Works in server components, so static pages ship both texts and
 * switching languages needs no re-render.
 */
export function L({ text }: { text: Localized }) {
  return (
    <>
      {LANGS.map((lang) => (
        <span key={lang} lang={lang === 'zh' ? 'zh-CN' : 'en'} data-lang-only={lang}>
          {text[lang]}
        </span>
      ))}
    </>
  );
}

/** One <a> per language (CSS shows the active one), for links whose target depends on it. */
export function LocalizedLink({
  href,
  className,
  children,
}: {
  href: Localized;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      {LANGS.map((lang) => (
        <a key={lang} href={href[lang]} data-lang-only={lang} className={className}>
          {children}
        </a>
      ))}
    </>
  );
}

/** <L> for a UI string from the message table. */
export function T({ k }: { k: MessageKey }) {
  return <L text={messages[k]} />;
}
