import { describe, expect, it, vi } from 'vitest';
import { createDataClient, isValidSlug } from './client';
import { DataError } from './errors';

const BASE = 'https://example.test/data/';

function envelope(data: unknown, overrides: Record<string, unknown> = {}) {
	return JSON.stringify({
		schemaVersion: 1,
		generatedAt: '2026-10-17T08:00:00Z',
		data,
		...overrides
	});
}

const leaderboard = {
	tournament: { slug: 't', name: 'T', status: 'ongoing', challengerThreshold: 20 },
	standings: [
		{
			rank: 1,
			player: { slug: 'a', name: 'A' },
			points: 21,
			isChallenger: true,
			isChampion: false,
			tokens: { doubleDown: 1, nominate: 0 }
		}
	],
	categories: [{ order: 1, category: 'strategy', status: 'active' }]
};

function setup(responses: Array<() => Response | Promise<Response>>, now = () => 0) {
	const fetch = vi.fn(async () => {
		const next = responses.shift();
		if (!next) throw new Error('unexpected fetch');
		return next();
	});
	const client = createDataClient({
		baseUrl: BASE,
		cacheTtlMs: 1000,
		requestTimeoutMs: 1000,
		fetch: fetch as unknown as typeof globalThis.fetch,
		now
	});
	return { client, fetch };
}

async function errorOf(promise: Promise<unknown>): Promise<DataError> {
	try {
		await promise;
	} catch (error) {
		if (error instanceof DataError) return error;
		throw error;
	}
	throw new Error('expected rejection');
}

describe('data client', () => {
	it('fetches and validates a document from the configured base URL', async () => {
		const { client, fetch } = setup([() => new Response(envelope(leaderboard))]);
		const result = await client.getLeaderboard();
		expect(result.data.standings[0].player.slug).toBe('a');
		expect(result.generatedAt).toBe('2026-10-17T08:00:00Z');
		expect(fetch).toHaveBeenCalledWith(`${BASE}leaderboard.json`, expect.any(Object));
	});

	it('deduplicates concurrent requests and caches within the TTL', async () => {
		let time = 0;
		const { client, fetch } = setup(
			[() => new Response(envelope(leaderboard)), () => new Response(envelope(leaderboard))],
			() => time
		);
		await Promise.all([client.getLeaderboard(), client.getLeaderboard()]);
		expect(fetch).toHaveBeenCalledTimes(1);

		time = 500;
		await client.getLeaderboard();
		expect(fetch).toHaveBeenCalledTimes(1);

		time = 1500;
		await client.getLeaderboard();
		expect(fetch).toHaveBeenCalledTimes(2);
	});

	it('bypasses the cache when forced or after clearCache()', async () => {
		const ok = () => new Response(envelope(leaderboard));
		const { client, fetch } = setup([ok, ok, ok]);
		await client.getLeaderboard();
		await client.getLeaderboard({ force: true });
		client.clearCache();
		await client.getLeaderboard();
		expect(fetch).toHaveBeenCalledTimes(3);
	});

	it('maps 404 to not-found and other statuses to http errors', async () => {
		const { client } = setup([
			() => new Response('nope', { status: 404 }),
			() => new Response('boom', { status: 503 })
		]);
		expect((await errorOf(client.getPlayer('ghost'))).kind).toBe('not-found');
		const http = await errorOf(client.getLeaderboard());
		expect(http.kind).toBe('http');
		expect(http.status).toBe(503);
		expect(http.retryable).toBe(true);
	});

	it('reports network failures and does not cache them', async () => {
		const { client, fetch } = setup([
			() => Promise.reject(new TypeError('Failed to fetch')),
			() => new Response(envelope(leaderboard))
		]);
		expect((await errorOf(client.getLeaderboard())).kind).toBe('network');
		await expect(client.getLeaderboard()).resolves.toBeTruthy();
		expect(fetch).toHaveBeenCalledTimes(2);
	});

	it('reports invalid JSON', async () => {
		const { client } = setup([() => new Response('{ not json')]);
		expect((await errorOf(client.getLeaderboard())).kind).toBe('invalid-json');
	});

	it('rejects documents missing essential fields', async () => {
		const broken = { ...leaderboard, standings: [{ rank: 1, points: 3 }] };
		const { client } = setup([
			() => new Response(envelope(broken)),
			() => new Response(envelope(leaderboard, { generatedAt: 'yesterday' }))
		]);
		const invalid = await errorOf(client.getLeaderboard());
		expect(invalid.kind).toBe('invalid-data');
		expect(invalid.detail).toContain('data.standings[0].player');
		expect((await errorOf(client.getLeaderboard())).kind).toBe('invalid-data');
	});

	it('refuses newer schema versions', async () => {
		const { client } = setup([() => new Response(envelope(leaderboard, { schemaVersion: 2 }))]);
		expect((await errorOf(client.getLeaderboard())).kind).toBe('unsupported-schema');
	});

	it('treats malformed slugs as not found without a request', async () => {
		const { client, fetch } = setup([]);
		expect((await errorOf(client.getTournament('../site'))).kind).toBe('not-found');
		expect(fetch).not.toHaveBeenCalled();
	});
});

describe('isValidSlug', () => {
	it('accepts kebab-case slugs only', () => {
		expect(isValidSlug('demo-2026')).toBe(true);
		expect(isValidSlug('Demo')).toBe(false);
		expect(isValidSlug('a/b')).toBe(false);
		expect(isValidSlug('')).toBe(false);
	});
});
