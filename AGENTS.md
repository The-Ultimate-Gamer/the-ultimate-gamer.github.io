# AGENTS.md — The Ultimate Gamer website

Guidance for developers and AI coding agents working in this repository. Read this before making changes. The README has the user-facing overview, and [docs/data-contract.md](docs/data-contract.md) is the JSON reference.

## What this is

This is a static SvelteKit site for a multi-game LAN tournament, deployed to GitHub Pages at `https://the-ultimate-gamer.github.io/`.

All tournament data lives in a **separate repository** ([The-Ultimate-Gamer/data](https://github.com/The-Ultimate-Gamer/data), usually checked out at `../ultimate-gamer-data`). That data is published as JSON at `https://the-ultimate-gamer.github.io/data/`. **This site fetches it in the browser at runtime.**

## Architecture rules (do not break)

1. **Never bundle tournament data.**
   - Never import JSON data, never fetch data in `load` functions during prerender/build, and never copy data files into `static/`.
   - There is no backend and no database connection.
2. **All data access goes through `src/lib/data/client.ts`.**
   - Paths are defined once in `dataPaths`, and the base URL comes from `src/lib/config/site.ts`.
   - Components never build URLs or call `fetch` for data themselves.
3. **Components load data with `useResource()`** from `src/lib/data/resource.svelte.ts`. Render the loading, error, empty and not-found states, usually via `DataView.svelte`.
4. **The site is a presentation layer.**
   - Never compute tournament outcomes: no Challenger/champion logic, award winners, rank tie-breaks or statistics. The data repository computes them.
   - Sorting and formatting for display are fine.
5. **Never show invented data.**
   - Missing optional fields render as "–" or are hidden.
   - A failed request shows `ErrorState`, never fallback or mock data.
6. **Challenger and champion are separate concepts.** The champion is not necessarily rank 1.
7. **The build must not depend on the data host.** `npm run build` must succeed offline.

## Stack and SvelteKit 3 gotchas

- **Versions:** Node **≥ 22.17** (`.nvmrc` = 24; run `nvm use`), SvelteKit **3**, Svelte **5 runes only**, Vite 8, TypeScript 6.
- **Config lives in `vite.config.ts`** (`sveltekit({...})`). There is **no `svelte.config.js`**.
- **Imports use `#lib/...` with the file extension** (`import X from '#lib/components/X.svelte'`, `'#lib/data/client.ts'`). `$lib` does not exist in Kit 3.
- **Module renames:** `$app/env` (not `$app/environment`), `$app/state` (not `$app/stores`).
- **Env vars** are declared in `src/env.ts` (`defineEnvVars`) and imported from `$app/env/public`.
- **Links:** always use `resolve()` from `$app/paths`, for example `resolve('/players/[slug]', { slug })`. The site must keep working under a non-root base path.
- **Svelte 5:**
  - Use `$props`, `$state`, `$derived` and `$effect`.
  - Use snippets and `{@render}`, not slots.
  - Use `onclick`, not `on:click`.
  - Use `{#each ... (key)}` with keys.
- **Svelte MCP:** if your agent has the Svelte MCP server, use it for docs and run `svelte-autofixer` on new or changed components.

## Routing model

- **Prerendered static shells:** `/`, `/players`, `/tournaments`, `/games`, `/awards`, `/history`, `/rules` (`export const prerender = true` in `src/routes/+layout.ts`).
- **Client-rendered dynamic routes:** `/players/[slug]` and `/tournaments/[slug]` have `prerender = false` and are served by the `404.html` fallback on GitHub Pages. Do not try to prerender them, because that would mean fetching data at build time.
- **Static explanatory copy** (rules, award and category descriptions) lives in `src/lib/content/` so it renders without data.

## Project map

```
src/env.ts                     PUBLIC_DATA_BASE_URL declaration
src/lib/config/site.ts         site name, data base URL, cache/timeout settings
src/lib/data/types.ts          TypeScript mirror of the JSON contract
src/lib/data/validate.ts       essential-field checks per document
src/lib/data/client.ts         the only data fetcher (cache, dedupe, errors)
src/lib/data/resource.svelte.ts useResource(), refreshData(), refreshIfStale()
src/lib/data/errors.ts         DataError kinds
src/lib/content/               static category/award copy, icons
src/lib/components/            UI components (see below)
src/lib/styles/tokens.css      design tokens (colours, type, spacing, motion)
src/lib/styles/global.css      base styles + shared utility classes
src/lib/format.ts              date/number/ordinal helpers
src/routes/                    pages
tools/dev-local-data.ts        dev-only plugin serving a local data dir at /__local-data/
docs/data-contract.md          JSON contract reference
```

**Key components:**
- `Leaderboard` / `PlayerRow`: the standings table.
- `TournamentHero`: status and meta tiles.
- `TournamentProgress`: category timeline.
- `GameSelectionPanel`: nominations and draw.
- `RecentResults`: game cards.
- `ChampionBanner`.
- Badges: `StatusBadge`, `CategoryBadge`, `AwardBadge`, `TokenDisplay`, `StatusPill`.
- States: `DataView`, `LoadingState`, `ErrorState`, `EmptyState`, `NotFoundState`.
- Layout: `PageTitle`, `LastUpdated`, `SiteHeader`, `SiteFooter`.

## Commands

```sh
npm run dev:local   # dev server, data from ../ultimate-gamer-data/data (or DEV_DATA_DIR)
npm run dev         # dev server, data from the published URL
npm run check       # svelte-check (must be 0 errors, 0 warnings)
npm test            # vitest unit tests (data client)
npm run build       # static build into build/
npm run format      # prettier
```

To get rich demo data, generate the fictional dataset in the data repo:

```sh
python3 scripts/seed.py --demo --db demo/demo.sqlite
python3 scripts/export_json.py --db demo/demo.sqlite --out demo/data
```

Then run `DEV_DATA_DIR=../ultimate-gamer-data/demo/data npm run dev:local`. Add `DEV_DATA_DELAY_MS=1500` to see the loading states.

## Common tasks

### Add a page
1. Create `src/routes/<name>/+page.svelte` with a `<svelte:head>` `<title>` and a meta description.
2. Use `PageTitle`, and load data with `useResource(getX)` wrapped in `DataView`.
3. Add the nav link in `SiteHeader.svelte` using `resolve()`.

### Add or change a data field
This change spans **both repositories**:
1. **Data repo:** produce the field in `scripts/ugdata.py` (`Exporter`), and add a test in `tests/`.
2. **This repo:** add the field to `src/lib/data/types.ts`. Make it optional (`?` / `| null`) unless every document will always have it.
3. If the field is essential, add a check in `src/lib/data/validate.ts` and a test in `client.spec.ts`.
4. Document it in `docs/data-contract.md`, then render it, handling its absence.
5. **Breaking changes** need a new `schemaVersion`. Bump `SUPPORTED_SCHEMA_VERSION` here first, deploy, then bump `SCHEMA_VERSION` in the data repo. The site rejects newer versions with an "update needed" error.

### Add a category or award
- Add it to the data repo (`scripts/seed.py` reference data), and optionally add copy and an icon in `src/lib/content/`.
- For a category colour, add a `--cat-<slug>` token in `tokens.css`. Unknown slugs fall back to a neutral style automatically.

## Styling conventions

- **CSS:** use component-scoped `<style>` blocks plus the tokens in `tokens.css`. Do not use Tailwind or a UI library, and do not hard-code colours or spacing when a token exists.
- **Shared classes** in `global.css`: `.container`, `.page`, `.panel`, `.panel-header`, `.panel-title`, `.panel-body`, `.btn`, `.btn-primary`, `.num` (tabular mono numbers), `.eyebrow`, `.stat-grid`, `.data-table`, `.grid-cards`, `.visually-hidden`, `.muted`, `.subtle`.
- **Design direction:** a dark esports dashboard with gold as the accent.
  - Use restrained glows and gradients, compact information density, and few rounded "cards".
  - Use emojis only as category and award icons.
- **Responsive:**
  - Support mobile through large screens and tournament TVs. The root font scales up at 1800px and 2400px.
  - There must be no horizontal page overflow; wide tables go in `.table-scroll`.

## Accessibility requirements

- Use semantic landmarks and real `<table>`s for tabular data, with a `caption` and `scope` attributes.
- Interactive elements must be native `<a>` or `<button>` with visible focus (the global `:focus-visible` ring).
- **Status must never rely on colour alone.** Always include a text label, such as "Challenger".
- Respect `prefers-reduced-motion` (handled globally; don't add motion that ignores it).
- Loading regions use `role="status"` and errors use `role="alert"`.

## Security

- Render external data as text only. Never use `{@html}` with data.
- Avatar URLs are accepted only if they are `https:`. Slugs are validated (`isValidSlug`) before being used in URLs. Don't weaken these checks.
- Inject CSS custom properties only from sanitised slugs (see `CategoryBadge`).

## Before you finish a change

1. `npm run check`: 0 errors and 0 warnings.
2. `npm test`: all tests pass.
3. `npm run build`: succeeds, and `build/` contains no tournament JSON.
4. Look at affected pages via `npm run dev:local` with demo data. Check loading, empty and error states as well as narrow and wide viewports.
5. Update the README or `docs/data-contract.md` if behaviour or the contract changed.

## Deployment

- **Workflow:** pushing to `main` runs `.github/workflows/deploy.yml`, which checks, tests, builds and deploys to Pages.
- **Base path:** `BASE_PATH` comes from `actions/configure-pages`. It is empty for this `*.github.io` repository.
- **Data URL:** `PUBLIC_DATA_BASE_URL` comes from the repository variable `DATA_BASE_URL`, or defaults to `https://<owner>.github.io/data/`.
- **Data changes never require redeploying this site.**
