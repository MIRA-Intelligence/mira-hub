'use client';

import { useSyncExternalStore } from 'react';
import { THEME_MODE_ATTR, THEME_STORAGE_KEY, type ThemeMode } from './theme';

function read(): ThemeMode {
  const mode = document.documentElement.getAttribute(THEME_MODE_ATTR);
  return mode === 'light' || mode === 'dark' ? mode : 'system';
}

function subscribe(onChange: () => void) {
  const obs = new MutationObserver(onChange);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: [THEME_MODE_ATTR] });
  return () => obs.disconnect();
}

export function useThemeMode(): ThemeMode {
  return useSyncExternalStore(subscribe, read, () => 'system');
}

export function setThemeMode(mode: ThemeMode) {
  document.documentElement.setAttribute(THEME_MODE_ATTR, mode);
  try {
    if (mode === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // storage blocked (private mode etc.) — the switch still applies to this page
  }
}
