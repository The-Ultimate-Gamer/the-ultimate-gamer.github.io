/**
 * Static award descriptions so the award gallery and rules render immediately.
 * Recipients are always provided by the data repository.
 */
export interface AwardContent {
	slug: string;
	name: string;
	icon: string;
	description: string;
	scope: 'tournament' | 'career';
}

export const awardContent: AwardContent[] = [
	{
		slug: 'ultimate-gamer',
		name: 'Ultimate Gamer',
		icon: '👑',
		scope: 'tournament',
		description: 'The tournament champion.'
	},
	{
		slug: 'challenger',
		name: 'Challenger',
		icon: '⚔️',
		scope: 'tournament',
		description: 'Reached the Challenger threshold during the tournament.'
	},
	{
		slug: 'dominator',
		name: 'Dominator',
		icon: '📈',
		scope: 'tournament',
		description: 'Highest-scoring player when the tournament ends.'
	},
	{
		slug: 'contender',
		name: 'Contender',
		icon: '🥊',
		scope: 'tournament',
		description: 'Highest-scoring player who never became a Challenger.'
	},
	{
		slug: 'podium',
		name: 'Podium',
		icon: '🥉',
		scope: 'tournament',
		description: 'Most podium finishes across games.'
	},
	{
		slug: 'believer',
		name: 'Believer',
		icon: '🙏',
		scope: 'tournament',
		description: 'Won a game while using a Double Down token.'
	},
	{
		slug: 'nominator',
		name: 'Nominator',
		icon: '🗳️',
		scope: 'tournament',
		description: 'Had a game selected from one of their Nominate tokens.'
	},
	{
		slug: 'rookie',
		name: 'Rookie',
		icon: '🌱',
		scope: 'tournament',
		description: 'Highest-placed player in their first tournament.'
	},
	{
		slug: 'underdog',
		name: 'Underdog',
		icon: '🐕',
		scope: 'tournament',
		description: 'Largest improvement between consecutive tournaments.'
	},
	{
		slug: 'fallout',
		name: 'Fallout',
		icon: '☢️',
		scope: 'tournament',
		description: 'Largest decline between consecutive tournaments.'
	},
	{
		slug: 'legend',
		name: 'Legend',
		icon: '🏛️',
		scope: 'career',
		description: 'Won at least three Ultimate Gamer tournaments.'
	},
	{
		slug: 'nemesis',
		name: 'Nemesis',
		icon: '😈',
		scope: 'tournament',
		description: 'Defeated their assigned Nemesis the most times.'
	},
	{
		slug: 'victim',
		name: 'Victim',
		icon: '🎯',
		scope: 'tournament',
		description: 'Was defeated as someone else’s Nemesis the most times.'
	},
	{
		slug: 'ghost',
		name: 'Ghost',
		icon: '👻',
		scope: 'tournament',
		description: 'Never finished last in a game during the tournament.'
	},
	{
		slug: 'survivor',
		name: 'Survivor',
		icon: '🩹',
		scope: 'tournament',
		description: 'Won a game while last in the overall standings.'
	}
];

const bySlug = new Map(awardContent.map((a) => [a.slug, a]));

export function getAwardContent(slug: string): AwardContent {
	return (
		bySlug.get(slug) ?? {
			slug,
			name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
			icon: '🏅',
			description: '',
			scope: 'tournament'
		}
	);
}
