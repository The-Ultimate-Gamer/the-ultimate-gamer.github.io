/** Static copy for the two single-use player tokens (see the Rules page). */
export const tokenContent = {
	doubleDown: {
		key: 'D',
		name: 'Double Down',
		description:
			'Play it before a game to double every point earned in that game, including the Nemesis bonus.'
	},
	nominate: {
		key: 'N',
		name: 'Nominate',
		description: 'Add one extra game to the nominations for the next draw.'
	}
} as const;
