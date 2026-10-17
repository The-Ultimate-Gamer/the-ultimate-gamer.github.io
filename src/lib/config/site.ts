import { PUBLIC_DATA_BASE_URL } from '$app/env/public';

/**
 * Default location of the published data repository (The-Ultimate-Gamer/data on GitHub Pages).
 * Override with PUBLIC_DATA_BASE_URL at build time.
 * Alternative host: https://raw.githubusercontent.com/The-Ultimate-Gamer/data/main/data/
 */
export const DEFAULT_DATA_BASE_URL = 'https://the-ultimate-gamer.github.io/data/';

function withTrailingSlash(url: string): string {
	return url.endsWith('/') ? url : `${url}/`;
}

export const siteConfig = {
	name: 'The Ultimate Gamer',
	shortName: 'Ultimate Gamer',
	description:
		'The Ultimate Gamer is a multi-game LAN tournament. Score points across every genre, become a Challenger, then win one more game to claim the crown.',
	dataBaseUrl: withTrailingSlash(PUBLIC_DATA_BASE_URL || DEFAULT_DATA_BASE_URL),
	data: {
		/** Successful responses are reused for this long before being re-requested. */
		cacheTtlMs: 60_000,
		/** Abort requests that take longer than this. */
		requestTimeoutMs: 12_000,
		/** Minimum gap between automatic refreshes when the tab regains focus. */
		focusRefreshMinIntervalMs: 60_000,
		/** Browser HTTP cache mode: 'no-cache' revalidates with the host (ETag) every time. */
		httpCache: 'no-cache' as RequestCache
	}
} as const;
