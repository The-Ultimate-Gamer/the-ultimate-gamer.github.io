/**
 * TypeScript mirror of the data repository's JSON contract (schema version 1).
 * See docs/data-contract.md. Optional/nullable fields may be absent in real data.
 */

export const SUPPORTED_SCHEMA_VERSION = 1;

/** Every exported JSON document uses this envelope. */
export interface Envelope<T> {
	schemaVersion: number;
	/** ISO 8601 UTC timestamp of the export. */
	generatedAt: string;
	data: T;
}

export type Slug = string;
export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed';
export type CategoryStatus = 'completed' | 'active' | 'upcoming';

export interface PlayerRef {
	slug: Slug;
	name: string;
}

export interface GameRef {
	slug: Slug;
	name: string;
}

export interface TournamentRef {
	slug: Slug;
	name: string;
}

export interface TokenCounts {
	doubleDown: number;
	nominate: number;
}

// ---------------------------------------------------------------- site.json

export interface SiteData {
	name: string;
	tagline?: string | null;
	currentTournament?: TournamentRef | null;
}

// ---------------------------------------------------------- categories.json

export interface CategoryDefinition {
	slug: Slug;
	name: string;
	icon?: string | null;
	description?: string | null;
}

export interface CategoriesData {
	categories: CategoryDefinition[];
}

// -------------------------------------------------------------- awards.json

export interface AwardGrant {
	award: Slug;
	player: PlayerRef;
	tournament?: TournamentRef | null;
	/** Human-readable supporting statistic, e.g. "4 Nemesis wins". */
	detail?: string | null;
}

export interface AwardDefinition {
	slug: Slug;
	name: string;
	icon?: string | null;
	description?: string | null;
	scope?: 'tournament' | 'career' | null;
	recipients?: AwardGrant[];
}

export interface AwardsData {
	awards: AwardDefinition[];
}

// -------------------------------------------------------- games/index.json

export interface GameInfo {
	slug: Slug;
	name: string;
	/** Category slugs. A game may belong to several categories. */
	categories: Slug[];
	description?: string | null;
	minPlayers?: number | null;
	maxPlayers?: number | null;
	timesPlayed?: number;
	timesNominated?: number;
	lastPlayed?: { tournament: TournamentRef; gameNumber: number } | null;
	/** Whether the game is currently eligible for nomination. */
	available?: boolean;
}

export interface GamesData {
	games: GameInfo[];
}

// --------------------------------------------------- shared tournament parts

export interface StandingEntry {
	rank: number;
	player: PlayerRef;
	points: number;
	isChallenger: boolean;
	/** Game number in which the player reached the threshold. */
	challengerSinceGame?: number | null;
	isChampion: boolean;
	tokens?: TokenCounts | null;
	gamesPlayed?: number;
	gamesWon?: number;
	/** Category slugs won, in order. */
	categoryWins?: Slug[];
	/** Award slugs held in this tournament. */
	awards?: Slug[];
	isFirstTournament?: boolean;
}

export interface CategoryProgressEntry {
	order: number;
	category: Slug;
	status: CategoryStatus;
	gameNumber?: number | null;
	game?: GameRef | null;
	winner?: PlayerRef | null;
}

export interface Nomination {
	game: GameRef;
	nominatedBy?: PlayerRef | null;
	/** 'winner' | 'vote' | 'token' */
	source: string;
	entries?: number | null;
}

export interface GameSelection {
	/** 'pending' | 'drawn' */
	status: string;
	category?: Slug | null;
	nominations?: Nomination[];
	selected?: GameRef | null;
}

export interface GameResultEntry {
	player: PlayerRef;
	placement: number;
	points: number;
	basePoints?: number | null;
	nemesisBonus?: number | null;
	doubleDown?: boolean;
	nemesis?: PlayerRef | null;
	defeatedNemesis?: boolean | null;
}

export interface GameResult {
	number: number;
	category: Slug;
	game: GameRef;
	tournament?: TournamentRef | null;
	playedAt?: string | null;
	winner?: PlayerRef | null;
	results?: GameResultEntry[];
	newChallengers?: PlayerRef[];
	/** True when a Challenger won this game and became the Ultimate Gamer. */
	decidedTournament?: boolean;
	selection?: GameSelection | null;
}

export interface TournamentLeader {
	rank: number;
	player: PlayerRef;
	points: number;
}

export interface TournamentRecord {
	label: string;
	value: string;
	player?: PlayerRef | null;
}

export interface TournamentSummary {
	slug: Slug;
	name: string;
	edition?: string | null;
	startDate?: string | null;
	endDate?: string | null;
	location?: string | null;
	status: TournamentStatus;
	challengerThreshold?: number | null;
	playerCount?: number;
	gamesPlayed?: number;
	categoriesCompleted?: number;
	categoriesPlanned?: number;
	champion?: PlayerRef | null;
	leaders?: TournamentLeader[];
	awards?: AwardGrant[];
}

// ---------------------------------------------------------- leaderboard.json

export interface LeaderboardData {
	tournament: TournamentSummary | null;
	currentCategory?: Slug | null;
	currentGame?: GameRef | null;
	nextSelection?: GameSelection | null;
	standings: StandingEntry[];
	categories: CategoryProgressEntry[];
	recentResults?: GameResult[];
}

// ------------------------------------------------------- tournaments/*.json

export interface TournamentsIndexData {
	tournaments: TournamentSummary[];
}

export interface TournamentDetail extends TournamentSummary {
	currentCategory?: Slug | null;
	currentGame?: GameRef | null;
	nextSelection?: GameSelection | null;
	standings: StandingEntry[];
	categories: CategoryProgressEntry[];
	games: GameResult[];
	records?: TournamentRecord[];
}

export interface TournamentData {
	tournament: TournamentDetail;
}

// ----------------------------------------------------------- players/*.json

export interface PlayerSummary {
	slug: Slug;
	name: string;
	initials?: string | null;
	/** Absolute https URL. Anything else is ignored. */
	avatarUrl?: string | null;
	firstTournament?: TournamentRef | null;
	tournamentsPlayed?: number;
	ultimateGamerWins?: number;
	challengerAppearances?: number;
	gameWins?: number;
	podiumFinishes?: number;
	awardCount?: number;
	bestPlacement?: number | null;
	current?: { tournament: TournamentRef; rank: number; points: number } | null;
}

export interface PlayersIndexData {
	players: PlayerSummary[];
}

export interface PlayerTournamentEntry {
	tournament: TournamentRef;
	startDate?: string | null;
	status: TournamentStatus;
	placement?: number | null;
	points?: number;
	gamesWon?: number;
	wasChallenger?: boolean;
	wasChampion?: boolean;
}

export interface PlayerMatch {
	tournament: TournamentRef;
	gameNumber: number;
	category: Slug;
	game: GameRef;
	placement: number;
	points: number;
	doubleDown?: boolean;
	nemesis?: PlayerRef | null;
	defeatedNemesis?: boolean | null;
}

export interface PlayerRival {
	player: PlayerRef;
	/** Times this player defeated `player` while `player` was their Nemesis. */
	nemesisWins: number;
	/** Times `player` defeated this player while this player was their Nemesis. */
	nemesisLosses: number;
}

export interface PlayerProfile extends PlayerSummary {
	tournaments?: PlayerTournamentEntry[];
	awards?: Omit<AwardGrant, 'player'>[];
	categoryWins?: { category: Slug; wins: number }[];
	nemesis?: { defeated: number; defeatedBy: number; timesAssigned?: number | null } | null;
	doubleDown?: { used: number; wins: number; bonusPoints?: number | null } | null;
	nominate?: { used: number; selected: number } | null;
	matches?: PlayerMatch[];
	rivals?: PlayerRival[];
}

export interface PlayerData {
	player: PlayerProfile;
}
