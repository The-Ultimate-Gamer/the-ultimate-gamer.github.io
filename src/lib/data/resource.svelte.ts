import { untrack } from 'svelte';
import { siteConfig } from '#lib/config/site.ts';
import { dataClient, type LoadOptions } from './client';
import { DataError, toDataError } from './errors';
import type { Envelope } from './types';

type Fetcher<T> = (options: LoadOptions) => Promise<Envelope<T>>;

let refreshVersion = $state(0);
let lastAutoRefresh = Date.now();

/** Explicit user refresh: drop cached documents and reload everything on screen. */
export function refreshData(): void {
	dataClient.clearCache();
	lastAutoRefresh = Date.now();
	refreshVersion++;
}

/**
 * Soft refresh (e.g. on tab focus). Visible resources reload, but the client's cache TTL
 * still applies, so recently fetched documents are not requested again.
 */
export function refreshIfStale(): void {
	const now = Date.now();
	if (now - lastAutoRefresh < siteConfig.data.focusRefreshMinIntervalMs) return;
	lastAutoRefresh = now;
	refreshVersion++;
}

export class Resource<T> {
	/** 'loading' until the first response; 'error' only when there is no data to show. */
	status = $state<'loading' | 'success' | 'error'>('loading');
	data = $state.raw<T | undefined>(undefined);
	generatedAt = $state<string | undefined>(undefined);
	/** Most recent failure. May be set alongside stale `data` after a failed refresh. */
	error = $state.raw<DataError | undefined>(undefined);
	refreshing = $state(false);

	#fetcher: Fetcher<T> | undefined;
	#token = 0;

	reset(): void {
		this.#token++;
		this.status = 'loading';
		this.data = undefined;
		this.generatedAt = undefined;
		this.error = undefined;
		this.refreshing = false;
	}

	async load(fetcher: Fetcher<T> | undefined = this.#fetcher, options: LoadOptions = {}) {
		if (!fetcher) return;
		this.#fetcher = fetcher;
		const token = ++this.#token;
		if (this.data === undefined) this.status = 'loading';
		else this.refreshing = true;

		try {
			const envelope = await fetcher(options);
			if (token !== this.#token) return;
			this.data = envelope.data;
			this.generatedAt = envelope.generatedAt;
			this.error = undefined;
			this.status = 'success';
		} catch (error) {
			if (token !== this.#token) return;
			this.error = toDataError(error);
			if (this.data === undefined) this.status = 'error';
		} finally {
			if (token === this.#token) this.refreshing = false;
		}
	}

	retry = () => this.load(undefined, { force: true });
}

const UNSET = Symbol('unset');

/**
 * Load a data document for the lifetime of the calling component.
 * Must be called during component initialisation. Re-runs when `key()` changes
 * or when a refresh is requested.
 */
export function useResource<T>(fetcher: Fetcher<T>): Resource<T>;
export function useResource<K, T>(
	key: () => K,
	fetcher: (key: K, options: LoadOptions) => Promise<Envelope<T>>
): Resource<T>;
export function useResource<K, T>(
	a: Fetcher<T> | (() => K),
	b?: (key: K, options: LoadOptions) => Promise<Envelope<T>>
): Resource<T> {
	const key = b ? (a as () => K) : () => null as K;
	const fetcher = b ?? ((_: K, options: LoadOptions) => (a as Fetcher<T>)(options));
	const resource = new Resource<T>();
	let currentKey: K | typeof UNSET = UNSET;

	$effect(() => {
		const k = key();
		void refreshVersion;
		untrack(() => {
			if (k !== currentKey) {
				currentKey = k;
				resource.reset();
			}
			resource.load((options) => fetcher(k, options));
		});
	});

	return resource;
}
