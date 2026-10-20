<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PlayerProfile } from '#lib/data/types.ts';
	import { getAwardContent } from '#lib/content/awards.ts';

	interface Props {
		player: PlayerProfile;
		/** Limit to one tournament. */
		tournament?: string | null;
	}

	let { player, tournament = null }: Props = $props();

	/** Grants grouped per award, in the order they were first listed. */
	const groups = $derived.by(() => {
		const map = new Map<string, NonNullable<PlayerProfile['awards']>>();
		for (const a of player.awards ?? []) {
			if (tournament && a.tournament?.slug !== tournament) continue;
			map.set(a.award, [...(map.get(a.award) ?? []), a]);
		}
		return [...map].map(([slug, grants]) => ({ award: getAwardContent(slug), grants }));
	});
</script>

{#if groups.length}
	<ul class="awards">
		{#each groups as { award, grants } (award.slug)}
			<li>
				<span class="icon" aria-hidden="true">{award.icon}</span>
				<div class="text">
					<p class="name">
						<strong>{award.name}</strong>
						{#if grants.length > 1}<span class="num count">×{grants.length}</span>{/if}
					</p>
					<p class="muted desc">{award.description}</p>
					{#if !tournament || grants.some((g) => g.detail)}
						<ul class="grants">
							{#each grants as g, i (i)}
								<li>
									{#if !tournament && g.tournament}
										<a href={resolve('/tournaments/[slug]', { slug: g.tournament.slug })}
											>{g.tournament.name}</a
										>
									{/if}
									{#if g.detail}<span class="subtle">{g.detail}</span>{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
{:else}
	<p class="subtle">No awards {tournament ? 'in this tournament' : 'yet'}.</p>
{/if}

<style>
	.awards {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-4);
	}

	.awards > li {
		display: grid;
		grid-template-columns: 3rem minmax(0, 1fr);
		gap: var(--sp-3);
		align-items: start;
	}

	.icon {
		display: grid;
		place-items: center;
		width: 3rem;
		height: 3rem;
		font-size: 1.5rem;
		background: var(--c-surface);
		border: var(--border-strong);
		border-radius: var(--radius-md);
	}

	.text {
		display: grid;
		gap: 0.15rem;
		font-size: var(--fs-sm);
	}

	.count {
		color: var(--c-gold-bright);
		font-weight: 700;
	}

	.desc {
		font-size: var(--fs-xs);
	}

	.grants {
		list-style: none;
		margin: var(--sp-1) 0 0;
		padding: 0;
		display: grid;
		gap: 0.15rem;
		font-size: var(--fs-xs);
	}

	.grants li {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-2);
	}

	.grants a {
		font-weight: 600;
		text-decoration: none;
	}
</style>
