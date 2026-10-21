'use client';

import { useSyncExternalStore } from 'react';
import { DEFAULT_LANG, LANG_ATTR, LANG_STORAGE_KEY, type Lang } from './i18n';

function read(): Lang {
  return document.documentElement.getAttribute(LANG_ATTR) === 'zh' ? 'zh' : 'en';
}

function subscribe(onChange: () => void) {
  const obs = new MutationObserver(onChange);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: [LANG_ATTR] });
  return () => obs.disconnect();
}

/** Active site language, for the few places CSS can't switch (attributes, generated text). */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_LANG);
}

export function setLang(lang: Lang) {
  const root = document.documentElement;
  root.setAttribute(LANG_ATTR, lang);
  root.lang = lang === 'zh' ? 'zh-CN' : 'en';
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // storage blocked (private mode etc.) — the switch still applies to this page
  }
}
