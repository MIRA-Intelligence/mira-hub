export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system'];
export const THEME_STORAGE_KEY = 'mirahub.theme';

/** The chosen mode lives on <html data-theme-mode>; the resolved palette on <html data-theme>. */
export const THEME_MODE_ATTR = 'data-theme-mode';

/**
 * Runs before first paint (inlined in <head>). Restores the saved mode
 * (default: follow the system), resolves it to data-theme, and keeps it
 * resolved when the mode changes or, in system mode, when the OS switches.
 * Without scripts, globals.css falls back to prefers-color-scheme.
 */
export const THEME_BOOT_SCRIPT = `(function(){
var r=document.documentElement,m='system';
try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');if(s==='light'||s==='dark')m=s;}catch(e){}
r.setAttribute('${THEME_MODE_ATTR}',m);
var mq=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null;
function apply(){var x=r.getAttribute('${THEME_MODE_ATTR}');r.setAttribute('data-theme',x==='light'||x==='dark'?x:mq&&mq.matches?'dark':'light');}
apply();
if(mq&&mq.addEventListener)mq.addEventListener('change',apply);
new MutationObserver(apply).observe(r,{attributes:true,attributeFilter:['${THEME_MODE_ATTR}']});
})();`;
