import { dev } from '$app/env';
import { siteConfig } from '#lib/config/site.ts';
import { DataError } from './errors';
import { ValidationError, validators } from './validate';
import { SUPPORTED_SCHEMA_VERSION, type Envelope } from './types';

/** The single mapping from logical resources to JSON paths in the data repository. */
export const dataPaths = {
	site: () => 'site.json',
	leaderboard: () => 'leaderboard.json',
	categories: () => 'categories.json',
	awards: () => 'awards.json',
	games: () => 'games/index.json',
	players: () => 'players/index.json',
	player: (slug: string) => `players/${encodeURIComponent(slug)}.json`,
	tournaments: () => 'tournaments/index.json',
	tournament: (slug: string) => `tournaments/${encodeURIComponent(slug)}.json`
} as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
	return slug.length <= 80 && SLUG_PATTERN.test(slug);
}

export interface LoadOptions {
	/** Bypass the in-memory cache and request the document again. */
	force?: boolean;
}

export interface DataClientOptions {
	baseUrl: string;
	cacheTtlMs: number;
	requestTimeoutMs: number;
	httpCache?: RequestCache;
	fetch?: typeof fetch;
	now?: () => number;
	/** Log diagnostics to the console. */
	debug?: boolean;
}

interface CacheEntry {
	promise: Promise<Envelope<unknown>>;
	storedAt: number;
}

export function createDataClient(options: DataClientOptions) {
	const cache = new Map<string, CacheEntry>();
	const now = options.now ?? Date.now;

	function resolveUrl(path: string): string {
		const origin = typeof location === 'undefined' ? 'http://localhost/' : location.href;
		return new URL(path, new URL(options.baseUrl, origin)).href;
	}

	async function fetchDocument<T>(
		url: string,
		validate: (data: unknown) => T
	): Promise<Envelope<T>> {
		const doFetch = options.fetch ?? globalThis.fetch;
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), options.requestTimeoutMs);

		let response: Response;
		let text: string;
		try {
			response = await doFetch(url, {
				method: 'GET',
				mode: 'cors',
				credentials: 'omit',
				cache: options.httpCache ?? 'no-cache',
				headers: { Accept: 'application/json' },
				signal: controller.signal
			});
			if (response.status === 404) throw new DataError('not-found', { url, status: 404 });
			if (!response.ok) {
				throw new DataError('http', { url, status: response.status, detail: response.statusText });
			}
			text = await response.text();
		} catch (error) {
			if (error instanceof DataError) throw error;
			const aborted = controller.signal.aborted;
			throw new DataError(aborted ? 'timeout' : 'network', {
				url,
				detail: error instanceof Error ? error.message : String(error),
				cause: error
			});
		} finally {
			clearTimeout(timer);
		}

		let json: unknown;
		try {
			json = JSON.parse(text);
		} catch (error) {
			throw new DataError('invalid-json', {
				url,
				detail: error instanceof Error ? error.message : String(error),
				cause: error
			});
		}

		try {
			const envelope = json as Record<string, unknown>;
			if (typeof json !== 'object' || json === null) throw new ValidationError('$', 'object');
			if (typeof envelope.schemaVersion !== 'number') {
				throw new ValidationError('schemaVersion', 'number');
			}
			if (envelope.schemaVersion > SUPPORTED_SCHEMA_VERSION) {
				throw new DataError('unsupported-schema', {
					url,
					detail: `schemaVersion ${envelope.schemaVersion} > ${SUPPORTED_SCHEMA_VERSION}`
				});
			}
			if (
				typeof envelope.generatedAt !== 'string' ||
				Number.isNaN(Date.parse(envelope.generatedAt))
			) {
				throw new ValidationError('generatedAt', 'ISO 8601 timestamp');
			}
			return {
				schemaVersion: envelope.schemaVersion,
				generatedAt: envelope.generatedAt,
				data: validate(envelope.data)
			};
		} catch (error) {
			if (error instanceof DataError) throw error;
			throw new DataError('invalid-data', {
				url,
				detail: error instanceof Error ? error.message : String(error),
				cause: error
			});
		}
	}

	function load<T>(
		path: string,
		validate: (data: unknown) => T,
		{ force = false }: LoadOptions = {}
	): Promise<Envelope<T>> {
		const url = resolveUrl(path);
		const cached = cache.get(url);
		if (!force && cached && now() - cached.storedAt < options.cacheTtlMs) {
			return cached.promise as Promise<Envelope<T>>;
		}

		const promise = fetchDocument(url, validate);
		cache.set(url, { promise, storedAt: now() });
		promise.catch((error: DataError) => {
			// Failed requests are never cached, so a retry always hits the network.
			if (cache.get(url)?.promise === promise) cache.delete(url);
			if (options.debug && error.kind !== 'not-found') {
				console.error(`[data] ${error.kind} ${url}`, error.detail ?? '', error.cause ?? '');
			}
		});
		return promise;
	}

	function bySlug<T>(
		slug: string,
		path: (slug: string) => string,
		validate: (data: unknown) => T,
		opts?: LoadOptions
	): Promise<Envelope<T>> {
		if (!isValidSlug(slug)) {
			return Promise.reject(new DataError('not-found', { detail: `Invalid slug "${slug}"` }));
		}
		return load(path(slug), validate, opts);
	}

	return {
		resolveUrl,
		/** Drop all cached responses so the next request goes to the network. */
		clearCache: () => cache.clear(),
		getSiteConfig: (o?: LoadOptions) => load(dataPaths.site(), validators.site, o),
		getLeaderboard: (o?: LoadOptions) => load(dataPaths.leaderboard(), validators.leaderboard, o),
		getCategories: (o?: LoadOptions) => load(dataPaths.categories(), validators.categories, o),
		getAwards: (o?: LoadOptions) => load(dataPaths.awards(), validators.awards, o),
		getGames: (o?: LoadOptions) => load(dataPaths.games(), validators.games, o),
		getPlayers: (o?: LoadOptions) => load(dataPaths.players(), validators.players, o),
		getPlayer: (slug: string, o?: LoadOptions) =>
			bySlug(slug, dataPaths.player, validators.player, o),
		getTournaments: (o?: LoadOptions) => load(dataPaths.tournaments(), validators.tournaments, o),
		getTournament: (slug: string, o?: LoadOptions) =>
			bySlug(slug, dataPaths.tournament, validators.tournament, o)
	};
}

export type DataClient = ReturnType<typeof createDataClient>;

export const dataClient: DataClient = createDataClient({
	baseUrl: siteConfig.dataBaseUrl,
	cacheTtlMs: siteConfig.data.cacheTtlMs,
	requestTimeoutMs: siteConfig.data.requestTimeoutMs,
	httpCache: siteConfig.data.httpCache,
	debug: dev
});

export const {
	getSiteConfig,
	getLeaderboard,
	getCategories,
	getAwards,
	getGames,
	getPlayers,
	getPlayer,
	getTournaments,
	getTournament
} = dataClient;
