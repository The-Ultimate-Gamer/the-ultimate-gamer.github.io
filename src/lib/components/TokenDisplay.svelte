<script lang="ts">
	import type { TokenCounts } from '#lib/data/types.ts';
	import { tokenContent } from '#lib/content/tokens.ts';

	interface Props {
		tokens?: TokenCounts | null;
	}

	let { tokens }: Props = $props();

	const items = $derived(
		tokens
			? (['doubleDown', 'nominate'] as const).map((id) => ({
					...tokenContent[id],
					count: tokens[id]
				}))
			: []
	);
</script>

{#if tokens}
	<span class="tokens">
		{#each items as item (item.key)}
			<span
				class="token"
				class:spent={item.count <= 0}
				title="{item.name}: {item.count} left — {item.description}"
			>
				<span aria-hidden="true">{item.key}<span class="x">×</span>{item.count}</span>
				<span class="visually-hidden">{item.name}: {item.count} left</span>
			</span>
		{/each}
	</span>
{:else}
	<span class="subtle" title="Token data unavailable">–</span>
{/if}

<style>
	.tokens {
		display: inline-flex;
		gap: 0.35rem;
	}

	.token {
		display: inline-block;
		min-width: 2.6em;
		padding: 0.1em 0.4em;
		border-radius: var(--radius-sm);
		border: 1px solid var(--c-gold-line);
		background: var(--c-gold-soft);
		color: var(--c-gold-bright);
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		font-size: var(--fs-xs);
		font-weight: 700;
		text-align: center;
		cursor: help;
	}

	.x {
		opacity: 0.6;
		margin-inline: 0.05em;
	}

	.spent {
		border-color: var(--c-border);
		background: transparent;
		color: var(--c-text-subtle);
		text-decoration: line-through;
		text-decoration-color: rgb(255 255 255 / 0.25);
	}
</style>
