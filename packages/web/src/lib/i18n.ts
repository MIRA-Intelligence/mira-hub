export type Lang = 'en' | 'zh';

export const LANGS: Lang[] = ['en', 'zh'];
export const DEFAULT_LANG: Lang = 'zh';
export const LANG_STORAGE_KEY = 'mirahub.lang';

/** Attribute on <html> holding the active language; CSS hides the other one. */
export const LANG_ATTR = 'data-lang';

export type Localized = Record<Lang, string>;

/**
 * Runs before first paint (inlined in <head>) so a static page never flashes
 * the wrong language: `?lang=` wins, then the saved choice, then Chinese.
 */
export const LANG_BOOT_SCRIPT = `(function(){try{
var q=new URLSearchParams(location.search).get('lang');
var s=localStorage.getItem('${LANG_STORAGE_KEY}');
var l=q==='zh'||q==='en'?q:s==='zh'||s==='en'?s:'${DEFAULT_LANG}';
if(q===l)localStorage.setItem('${LANG_STORAGE_KEY}',l);
document.documentElement.setAttribute('${LANG_ATTR}',l);
document.documentElement.lang=l==='zh'?'zh-CN':'en';
}catch(e){}})();`;

/** MIRA docs home page for each language. */
export const DOCS_HOME: Localized = {
  en: 'https://mira-intelligence.com/en/',
  zh: 'https://mira-intelligence.com/',
};

export const messages = {
  'nav.docsHome': { en: 'MIRA Docs', zh: 'MIRA 文档' },
  'nav.skills': { en: 'Skills', zh: '技能' },
  'nav.contribute': { en: 'Contribute', zh: '贡献' },
  'footer.tagline': {
    en: 'MIRA Hub · skills for medical & scientific research.',
    zh: 'MIRA Hub · 面向医学与科研的技能。',
  },
  'footer.docs': { en: 'Docs', zh: '文档' },

  'theme.label': { en: 'Color mode', zh: '颜色模式' },
  'theme.light': { en: 'light', zh: '浅色' },
  'theme.dark': { en: 'dark', zh: '深色' },
  'theme.system': { en: 'system', zh: '跟随系统' },

  'home.published': { en: 'skills published', zh: '个技能已发布' },
  'home.heroTitle': { en: 'Skills for medical & scientific research, ', zh: '医学与科研技能，' },
  'home.heroAccent': { en: 'one click away', zh: '一键即装' },
  'home.heroEnd': { en: '.', zh: '。' },
  'home.heroBody': {
    en: 'Curated, installable workflows — from PubMed search to DICOM radiomics, survival analysis, and journal-ready slides — that drop straight into MIRA Desktop.',
    zh: '精选、可直接安装的工作流：从 PubMed 检索到 DICOM 影像组学、生存分析和可投稿的幻灯片，一键装进 MIRA Desktop。',
  },
  'home.browse': { en: 'Browse skills', zh: '浏览技能' },
  'home.contributeSkill': { en: 'Contribute a skill', zh: '贡献技能' },
  'home.featured': { en: 'Featured skills', zh: '精选技能' },
  'home.browseAll': { en: 'Browse all →', zh: '查看全部 →' },
  'home.browseBy': { en: 'Browse by', zh: '分类浏览' },
  'home.emptyTitle': { en: 'No skills published yet.', zh: '还没有发布任何技能。' },
  'home.emptyBody': {
    en: 'Run `npm run build:registry` at the repo root to generate the registry locally.',
    zh: '在仓库根目录运行 `npm run build:registry` 以在本地生成技能索引。',
  },

  'skills.title': { en: 'Skills', zh: '技能' },
  'skills.searchPlaceholder': {
    en: 'Search skills, tags, descriptions…',
    zh: '搜索技能、标签、简介……',
  },
  'skills.noMatch': { en: 'No skills match your filters.', zh: '没有符合筛选条件的技能。' },

  'notFound.title': { en: 'Not found', zh: '页面不存在' },
  'notFound.body': { en: "That page or skill doesn't exist.", zh: '该页面或技能不存在。' },

  'detail.version': { en: 'Version', zh: '版本' },
  'detail.maturity': { en: 'Maturity', zh: '成熟度' },
  'detail.license': { en: 'License', zh: '许可证' },
  'detail.author': { en: 'Author', zh: '作者' },
  'detail.homepage': { en: 'Homepage', zh: '主页' },
  'detail.repo': { en: 'Repo', zh: '仓库' },
  'detail.issues': { en: 'Issues', zh: '问题反馈' },
  'detail.tracker': { en: 'Tracker', zh: 'Issues' },
  'detail.size': { en: 'Size', zh: '大小' },

  'maturity.stable': { en: 'stable', zh: '稳定' },
  'maturity.beta': { en: 'beta', zh: '测试' },
  'maturity.experimental': { en: 'experimental', zh: '实验' },
  'card.unknownAuthor': { en: 'unknown author', zh: '未知作者' },

  'readme.title': { en: 'Instructions', zh: '使用说明' },
  'readme.subtitle': {
    en: 'How the agent uses this skill — sourced from SKILL.md.',
    zh: '智能体如何使用该技能（取自 SKILL.md，保留原文）。',
  },
  'readme.expand': { en: 'Show full instructions', zh: '展开完整说明' },
  'readme.collapse': { en: 'Collapse', zh: '收起' },

  'install.desktop': { en: 'Install in MIRA Desktop', zh: '在 MIRA Desktop 中安装' },
  'install.opening': { en: 'Opening MIRA Desktop…', zh: '正在打开 MIRA Desktop……' },
  'install.missingTitle': { en: "MIRA Desktop didn't respond.", zh: 'MIRA Desktop 没有响应。' },
  'install.missingBefore': {
    en: "Either it isn't installed yet —",
    zh: '可能还没有安装（',
  },
  'install.missingLink': { en: 'download the latest build', zh: '下载最新版本' },
  'install.missingAfter': {
    en: "— or it's installed but has never been launched, so the system hasn't registered the mira:// handler yet. Open it once and try again, or just use the .zip below.",
    zh: '），或者已安装但从未启动过，系统还没注册 mira:// 链接。先打开一次再重试，或直接使用下面的 .zip。',
  },
  'install.download': { en: 'Download .zip', zh: '下载 .zip' },
  'install.copy': { en: 'Copy install prompt', zh: '复制安装指令' },
  'install.copied': { en: 'Copied!', zh: '已复制！' },
  'install.manual': { en: 'Select & copy below', zh: '请在下方手动复制' },
  'install.help': {
    en: "The desktop button opens MIRA via the mira:// deep link. If MIRA isn't installed, use the .zip and import it from Settings → Skills & Plugins.",
    zh: '桌面按钮通过 mira:// 链接打开 MIRA。如果尚未安装 MIRA，可下载 .zip，然后在“设置 → 技能与插件”中导入。',
  },
} satisfies Record<string, Localized>;

export type MessageKey = keyof typeof messages;

export function t(lang: Lang, key: MessageKey): string {
  return messages[key][lang];
}
