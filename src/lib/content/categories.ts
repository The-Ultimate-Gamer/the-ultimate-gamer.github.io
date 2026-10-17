/**
 * Static explanatory copy for the known categories. Used for icons, colours and the
 * rules page so they render without waiting for data. Which categories a tournament
 * uses, and in which order, always comes from the data repository.
 */
export interface CategoryContent {
	slug: string;
	name: string;
	icon: string;
	blurb: string;
}

export const categoryContent: CategoryContent[] = [
	{
		slug: 'strategy',
		name: 'Strategy',
		icon: '♟️',
		blurb: 'Outthink the room. Planning, economy and long-term decisions.'
	},
	{
		slug: 'combat',
		name: 'Combat',
		icon: '⚔️',
		blurb: 'Direct confrontation. Aim, reflexes and nerve.'
	},
	{
		slug: 'puzzle',
		name: 'Puzzle',
		icon: '🧩',
		blurb: 'Logic and pattern recognition under pressure.'
	},
	{ slug: 'platform', name: 'Platform', icon: '🍄', blurb: 'Jumps, timing and precise movement.' },
	{
		slug: 'chaos',
		name: 'Chaos',
		icon: '🌀',
		blurb: 'Unpredictable party games where anything can happen.'
	},
	{
		slug: 'racing',
		name: 'Racing',
		icon: '🏁',
		blurb: 'First across the line. Speed, lines and the occasional blue shell.'
	},
	{
		slug: 'teamwork',
		name: 'Teamwork',
		icon: '🤝',
		blurb: 'Temporary alliances. Cooperate now, compete later.'
	},
	{
		slug: 'wildcard',
		name: 'Wildcard',
		icon: '🃏',
		blurb: 'Anything goes. The organisers pick something unexpected.'
	},
	{
		slug: 'knowledge',
		name: 'Knowledge',
		icon: '🧠',
		blurb: 'Trivia and quizzes. What do you actually know?'
	},
	{
		slug: 'tabletop',
		name: 'Tabletop',
		icon: '🎲',
		blurb: 'Board and card games, digital or physical.'
	},
	{
		slug: 'offline',
		name: 'Offline',
		icon: '🎯',
		blurb: 'Away from the screen. Darts, cards, physical challenges.'
	},
	{
		slug: 'idle',
		name: 'Idle',
		icon: '⏳',
		blurb: 'Patience and optimisation over a longer timeframe.'
	},
	{
		slug: 'speedrun',
		name: 'Speedrun',
		icon: '⏱️',
		blurb: 'Fastest completion of a set goal wins.'
	},
	{
		slug: 'simulation',
		name: 'Simulation',
		icon: '🛠️',
		blurb: 'Build, manage or simulate better than everyone else.'
	}
];

const bySlug = new Map(categoryContent.map((c) => [c.slug, c]));

function titleCase(slug: string): string {
	return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Known category content, or a neutral fallback for categories added later. */
export function getCategoryContent(slug: string): CategoryContent {
	return bySlug.get(slug) ?? { slug, name: titleCase(slug), icon: '🎮', blurb: '' };
}
