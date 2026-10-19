<script lang="ts">
	import { resolve } from '$app/paths';
	import type { NemesisPair } from '#lib/data/types.ts';

	interface Props {
		pairs: NemesisPair[];
	}

	let { pairs }: Props = $props();
	const uid = $props.id();
</script>

<section class="nemeses" aria-labelledby="{uid}-title">
	<h3 class="eyebrow" id="{uid}-title">Nemeses this game</h3>
	{#if pairs.length}
		<ul>
			{#each pairs as pair (pair.player.slug)}
				<li>
					<a href={resolve('/players/[slug]', { slug: pair.player.slug })}>{pair.player.name}</a>
					<span class="vs" aria-hidden="true">→</span>
					<span class="visually-hidden">has the Nemesis</span>
					<a class="target" href={resolve('/players/[slug]', { slug: pair.nemesis.slug })}
						>{pair.nemesis.name}</a
					>
				</li>
			{/each}
		</ul>
		<p class="subtle hint">Finish ahead of your Nemesis for +1 point.</p>
	{:else}
		<p class="subtle hint">The Nemeses for this game haven’t been drawn yet.</p>
	{/if}
</section>

<style>
	.nemeses {
		display: grid;
		gap: var(--sp-2);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 11rem), 1fr));
		gap: 1px;
		background: var(--c-border);
		border: var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	li {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		padding: var(--sp-2) var(--sp-3);
		background: var(--c-surface);
		font-size: var(--fs-sm);
	}

	a {
		font-weight: 600;
		text-decoration: none;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.vs {
		color: var(--c-text-subtle);
	}

	.target {
		color: var(--c-violet);
	}

	.hint {
		font-size: var(--fs-xs);
	}
</style>
