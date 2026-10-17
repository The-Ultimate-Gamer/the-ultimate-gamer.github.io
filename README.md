# The Ultimate Gamer — Website

The public website for **The Ultimate Gamer**, a multi-game LAN tournament. Players score points across many genres. When a player reaches the score threshold they become a **Challenger**, and a Challenger who then wins a game is crowned the **Ultimate Gamer**.

Live site: **https://the-ultimate-gamer.github.io/**

This repository holds **only the website**. All tournament data (SQLite database, export scripts and generated JSON) lives in the separate **[The-Ultimate-Gamer/data](https://github.com/The-Ultimate-Gamer/data)** repository. The website downloads that JSON **in the visitor's browser when the page loads**. So:

- Updating results never requires rebuilding or redeploying the website.
- The website builds and deploys even if the data host is offline.
- No tournament data is committed to, imported by, or bundled into this repository.

## Tech stack

- [SvelteKit 3](https://svelte.dev/docs/kit) + Svelte 5 (runes) + TypeScript
- `@sveltejs/adapter-static`: static output with a `404.html` SPA fallback
- Plain modern CSS with design tokens (`src/lib/styles/tokens.css`), no UI framework
- Vitest for unit tests
- GitHub Actions → GitHub Pages

## Local development

Requires **Node.js ≥ 22.17** (see `.nvmrc`; `nvm use` picks Node 24).

```sh
npm install
npm run dev        # dev server using the published data URL
npm run dev:local  # dev server using JSON from a local checkout of the data repository
```

`npm run dev:local` points the site at `/__local-data/`. A **dev-server-only** Vite plugin (`tools/dev-local-data.ts`) serves that path from `../ultimate-gamer-data/data` by default. Use `DEV_DATA_DIR` to point it somewhere else.

To work with the fictional demo dataset, generate it in the data repository and then start the dev server against it:

```sh
# in the data repository
python3 scripts/seed.py --demo --db demo/demo.sqlite && python3 scripts/export_json.py --db demo/demo.sqlite --out demo/data
# in this repository
DEV_DATA_DIR=../ultimate-gamer-data/demo/data npm run dev:local
```

To simulate a slow network, add `FIXTURE_DELAY_MS=1500`.

Other commands:

```sh
npm run check     # svelte-check / TypeScript
npm test          # unit tests (data client)
npm run build     # static build into build/
npm run preview   # preview the build
npm run format    # prettier
```

## Configuring the data URL

The data location is configured in one place: `src/lib/config/site.ts`.

| Source | Value |
| --- | --- |
| `PUBLIC_DATA_BASE_URL` env var at build time | e.g. `https://the-ultimate-gamer.github.io/data/` |
| Fallback in `site.ts` | `DEFAULT_DATA_BASE_URL` = `https://the-ultimate-gamer.github.io/data/` |

The deploy workflow sets `PUBLIC_DATA_BASE_URL` from the repository variable `DATA_BASE_URL`. If that variable is not set, it falls back to `https://<repo-owner>.github.io/data/`.

Hosting options for the data repository:

- **GitHub Pages (preferred):** `https://the-ultimate-gamer.github.io/data/`. The data repository publishes its `data/` folder as its Pages site.
- **raw.githubusercontent.com (alternative):** `https://raw.githubusercontent.com/The-Ultimate-Gamer/data/main/data/`

Both hosts send `Access-Control-Allow-Origin: *`, so browsers can fetch the JSON from another origin.

Changing the data URL is a website configuration change and needs a rebuild. Changing the **data itself** does not.

## How data is fetched

- `src/lib/data/client.ts` is the only place that builds data URLs (see `dataPaths`). It exposes `getSiteConfig`, `getLeaderboard`, `getCategories`, `getAwards`, `getGames`, `getPlayers`, `getPlayer(slug)`, `getTournaments` and `getTournament(slug)`.
- **Every request:**
  - Has a timeout and checks the HTTP status (404 → not found).
  - Parses the JSON safely.
  - Checks the envelope (`schemaVersion`, `generatedAt`) and the essential fields of each document (`src/lib/data/validate.ts`).
  - Raises a typed `DataError` on failure (`network`, `timeout`, `http`, `not-found`, `invalid-json`, `invalid-data` or `unsupported-schema`).
- **Caching:**
  - Successful responses are kept in memory for 60 s. Simultaneous identical requests share one fetch. Failed requests are never cached.
  - Requests use `cache: 'no-cache'`, so the browser revalidates with the host (ETag) instead of serving stale copies.
- **Refreshing:**
  - Every data panel has a **Refresh** button. Error states offer **Retry**.
  - When the tab regains focus, visible data reloads only if it is older than the cache lifetime. The minimum gap between automatic refreshes is 60 s.
  - There is no polling.
- If a refresh fails while data is already shown, the older data stays visible with a "Refresh failed" notice. Failed requests are **never** replaced with mock data.
- Components use `useResource()` (`src/lib/data/resource.svelte.ts`). It provides loading, success, error, empty and not-found states.

Timing values live in `siteConfig.data` in `src/lib/config/site.ts`.

The JSON contract is documented in [docs/data-contract.md](docs/data-contract.md) and mirrored in `src/lib/data/types.ts`.

## Updating tournament data (no website rebuild)

1. Update the SQLite database in `ultimate-gamer-data`.
2. Run the JSON export script, then validate the output.
3. Commit and push the database and the generated JSON.
4. GitHub Pages publishes the new files.
5. Visitors get the new data on their next load, on Refresh, or when they return to the tab.

**Expect a short delay.** A GitHub Pages deployment takes a minute or two, and the CDN may serve cached copies for up to about 10 minutes (`raw.githubusercontent.com` caches for about 5 minutes). Every document includes `generatedAt`, and the site shows it as "Updated … ago".

## GitHub Pages setup

1. In the repository, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
2. Optionally, go to **Settings → Secrets and variables → Actions → Variables** and add `DATA_BASE_URL` (it must end with `/`).
3. Push to `main`. `.github/workflows/deploy.yml` then:
   - Installs dependencies with `npm ci`.
   - Runs `npm run check` and `npm test`.
   - Builds with `BASE_PATH` from `actions/configure-pages`.
   - Deploys `build/`.

The workflow never checks out or downloads the data repository.

The repository is named `the-ultimate-gamer.github.io`, so GitHub serves it as the organisation site at the domain root (`BASE_PATH` is empty). If it is ever renamed to a regular project repository, it will be served under `/<repo-name>/` instead. That works without code changes, because every internal link goes through `resolve()` from `$app/paths` and the workflow takes `BASE_PATH` from `actions/configure-pages`.

## Routing and known limitations

- **Static pages** (home, players, tournaments, games, awards, history, rules) are prerendered as HTML shells. They include static copy such as the rules and award descriptions. Live data loads on the client.
- **Dynamic pages** (`/players/[slug]`, `/tournaments/[slug]`) are not prerendered, because that would require fetching data during the build. GitHub Pages answers those URLs with `404.html`, which boots the app and renders the page client-side. Direct links, refreshes and in-app navigation all work, and unknown slugs show a proper "not found" page.
- **Consequences of this trade-off:**
  - Dynamic pages are served with **HTTP status 404** even when they render correctly. Crawlers may skip them, and link previews only show generic metadata.
  - Standings and statistics need JavaScript and an extra request before they appear.
  - If the data host is unreachable, pages show an error with a Retry button. The static content stays available.

## Project structure

```
src/
  env.ts                    PUBLIC_DATA_BASE_URL declaration
  lib/config/site.ts        site name, data URL, cache/timeout settings
  lib/data/                 types, validation, client, reactive resource helper, tests
  lib/content/              static category & award copy (for rules/badges)
  lib/components/           UI components (Leaderboard, PlayerRow, badges, states…)
  lib/styles/               design tokens + global styles
  routes/                   pages
tools/dev-local-data.ts     dev-server plugin that serves a local data directory
```
