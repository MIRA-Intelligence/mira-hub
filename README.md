# mira-hub

Builder + static Next.js site that publishes the MIRA skill registry to
<https://hub.mira-intelligence.com/> and
<https://mira-intelligence.github.io/mira-hub/>.

The actual skill payloads live in
[`MIRA-Intelligence/mira-skills`](https://github.com/MIRA-Intelligence/mira-skills).
This repo only contains:

- `packages/builder` — TS Node CLI that walks `mira-skills/skills/`,
  validates each skill, deterministically zips it, and emits the registry
  JSON consumed by the site.
- `packages/web` — Next.js 15 (static export) site rendering the registry.
- `taxonomy.yaml` — curated tag namespaces that become faceted filters
  (Domain × Functionality). Free-form tags stay searchable but unfaceted.
- `.github/workflows/` — validate on PRs, deploy to `gh-pages` on `main`
  pushes and on `repository_dispatch` from `mira-skills`.

## Local dev

```bash
git clone https://github.com/MIRA-Intelligence/mira-skills ../mira-skills
git clone https://github.com/MIRA-Intelligence/mira-hub
cd mira-hub
npm install

# Validate skill metadata (no output written):
npm run check:registry -- --skills-dir ../mira-skills/skills

# Build the registry into packages/web/public/registry:
npm run build:registry -- --skills-dir ../mira-skills/skills

# Run the site:
npm run dev
```

The builder accepts `--skills-dir <path>` or the `MIRA_SKILLS_DIR` env var.
If neither is set it defaults to `../mira-skills/skills` (sibling checkout).

Third-party skills are mirrored from their upstream repos (pinned commits in
`mira-skills/upstream.yaml`) with `npm run vendor:upstream`; see the
mira-skills README.

The site is bilingual (English / 中文). UI strings live in
`packages/web/src/lib/i18n.ts`; pages render both languages and CSS shows the
one set on `<html data-lang>` (chosen by `?lang=`, the saved toggle, or the
browser language). Skill abstracts come from the registry's `descriptions`,
and `check` fails if a skill lacks either language.

## Production build

```bash
npm run build
# Static site at packages/web/out, registry zips at packages/web/public/registry
```

GitHub Actions runs the same steps twice: once for GitHub Pages (base path
`/mira-hub`) and once for `hub.mira-intelligence.com` (base path `/`, rsynced
to the Tencent Cloud server). See [`deploy/README.md`](deploy/README.md).
