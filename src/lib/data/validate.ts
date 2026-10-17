/**
 * Minimal structural checks for the essential fields of each JSON document.
 * Optional fields are left to the components, which handle absence explicitly.
 */
import type {
	AwardsData,
	CategoriesData,
	GamesData,
	LeaderboardData,
	PlayerData,
	PlayersIndexData,
	SiteData,
	TournamentData,
	TournamentsIndexData
} from './types';

export class ValidationError extends Error {
	constructor(path: string, expected: string) {
		super(`${path}: expected ${expected}`);
		this.name = 'ValidationError';
	}
}

type Obj = Record<string, unknown>;

export function obj(value: unknown, path: string): Obj {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new ValidationError(path, 'object');
	}
	return value as Obj;
}

export function str(value: unknown, path: string): string {
	if (typeof value !== 'string' || value.length === 0) throw new ValidationError(path, 'string');
	return value;
}

export function num(value: unknown, path: string): number {
	if (typeof value !== 'number' || !Number.isFinite(value))
		throw new ValidationError(path, 'number');
	return value;
}

export function bool(value: unknown, path: string): boolean {
	if (typeof value !== 'boolean') throw new ValidationError(path, 'boolean');
	return value;
}

export function arr(value: unknown, path: string, each?: (item: unknown, path: string) => void) {
	if (!Array.isArray(value)) throw new ValidationError(path, 'array');
	if (each) value.forEach((item, i) => each(item, `${path}[${i}]`));
	return value;
}

function optional<T>(check: (v: unknown, p: string) => T) {
	return (value: unknown, path: string) => {
		if (value !== undefined && value !== null) check(value, path);
	};
}

function ref(value: unknown, path: string) {
	const o = obj(value, path);
	str(o.slug, `${path}.slug`);
	str(o.name, `${path}.name`);
}

function oneOf(value: unknown, path: string, options: readonly string[]) {
	if (typeof value !== 'string' || !options.includes(value)) {
		throw new ValidationError(path, options.join(' | '));
	}
}

const TOURNAMENT_STATUSES = ['upcoming', 'ongoing', 'completed'] as const;
const CATEGORY_STATUSES = ['completed', 'active', 'upcoming'] as const;

function standing(value: unknown, path: string) {
	const o = obj(value, path);
	num(o.rank, `${path}.rank`);
	ref(o.player, `${path}.player`);
	num(o.points, `${path}.points`);
	bool(o.isChallenger, `${path}.isChallenger`);
	bool(o.isChampion, `${path}.isChampion`);
	optional(arr)(o.categoryWins, `${path}.categoryWins`);
	optional(arr)(o.awards, `${path}.awards`);
	if (o.tokens !== undefined && o.tokens !== null) {
		const t = obj(o.tokens, `${path}.tokens`);
		num(t.doubleDown, `${path}.tokens.doubleDown`);
		num(t.nominate, `${path}.tokens.nominate`);
	}
}

function categoryProgress(value: unknown, path: string) {
	const o = obj(value, path);
	num(o.order, `${path}.order`);
	str(o.category, `${path}.category`);
	oneOf(o.status, `${path}.status`, CATEGORY_STATUSES);
	optional(ref)(o.game, `${path}.game`);
	optional(ref)(o.winner, `${path}.winner`);
}

function gameResult(value: unknown, path: string) {
	const o = obj(value, path);
	num(o.number, `${path}.number`);
	str(o.category, `${path}.category`);
	ref(o.game, `${path}.game`);
	optional(ref)(o.winner, `${path}.winner`);
	optional(ref)(o.tournament, `${path}.tournament`);
	if (o.results !== undefined) {
		arr(o.results, `${path}.results`, (r, p) => {
			const e = obj(r, p);
			ref(e.player, `${p}.player`);
			num(e.placement, `${p}.placement`);
			num(e.points, `${p}.points`);
		});
	}
}

function tournamentSummary(value: unknown, path: string) {
	const o = obj(value, path);
	str(o.slug, `${path}.slug`);
	str(o.name, `${path}.name`);
	oneOf(o.status, `${path}.status`, TOURNAMENT_STATUSES);
	optional(num)(o.challengerThreshold, `${path}.challengerThreshold`);
	optional(ref)(o.champion, `${path}.champion`);
	return o;
}

function award(value: unknown, path: string) {
	const o = obj(value, path);
	str(o.slug, `${path}.slug`);
	str(o.name, `${path}.name`);
	if (o.recipients !== undefined) {
		arr(o.recipients, `${path}.recipients`, (r, p) => {
			const g = obj(r, p);
			str(g.award, `${p}.award`);
			ref(g.player, `${p}.player`);
		});
	}
}

export const validators = {
	site(data: unknown): SiteData {
		const o = obj(data, 'data');
		str(o.name, 'data.name');
		optional(ref)(o.currentTournament, 'data.currentTournament');
		return o as unknown as SiteData;
	},

	categories(data: unknown): CategoriesData {
		const o = obj(data, 'data');
		arr(o.categories, 'data.categories', ref);
		return o as unknown as CategoriesData;
	},

	awards(data: unknown): AwardsData {
		const o = obj(data, 'data');
		arr(o.awards, 'data.awards', award);
		return o as unknown as AwardsData;
	},

	games(data: unknown): GamesData {
		const o = obj(data, 'data');
		arr(o.games, 'data.games', (g, p) => {
			ref(g, p);
			arr((g as Obj).categories, `${p}.categories`);
		});
		return o as unknown as GamesData;
	},

	leaderboard(data: unknown): LeaderboardData {
		const o = obj(data, 'data');
		if (o.tournament !== null) tournamentSummary(o.tournament, 'data.tournament');
		arr(o.standings, 'data.standings', standing);
		arr(o.categories, 'data.categories', categoryProgress);
		if (o.recentResults != null) arr(o.recentResults, 'data.recentResults', gameResult);
		return o as unknown as LeaderboardData;
	},

	tournaments(data: unknown): TournamentsIndexData {
		const o = obj(data, 'data');
		arr(o.tournaments, 'data.tournaments', tournamentSummary);
		return o as unknown as TournamentsIndexData;
	},

	tournament(data: unknown): TournamentData {
		const o = obj(data, 'data');
		const t = tournamentSummary(o.tournament, 'data.tournament');
		arr(t.standings, 'data.tournament.standings', standing);
		arr(t.categories, 'data.tournament.categories', categoryProgress);
		arr(t.games, 'data.tournament.games', gameResult);
		return o as unknown as TournamentData;
	},

	players(data: unknown): PlayersIndexData {
		const o = obj(data, 'data');
		arr(o.players, 'data.players', ref);
		return o as unknown as PlayersIndexData;
	},

	player(data: unknown): PlayerData {
		const o = obj(data, 'data');
		const p = obj(o.player, 'data.player');
		ref(p, 'data.player');
		optional(arr)(p.tournaments, 'data.player.tournaments');
		optional(arr)(p.matches, 'data.player.matches');
		return o as unknown as PlayerData;
	}
};
