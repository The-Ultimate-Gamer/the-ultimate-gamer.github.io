<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Number of filters that differ from their default. */
		active: number;
		onreset: () => void;
		/** Filter controls (FilterOptions, FilterSelect…). */
		filters: Snippet;
		/** Results column. */
		children: Snippet;
	}

	let { active, onreset, filters, children }: Props = $props();

	const uid = $props.id();
	let open = $state(false);
</script>

<div class="filter-layout">
	<aside class="panel filters" aria-label="Filters">
		<button
			class="filters-toggle"
			type="button"
			aria-expanded={open}
			aria-controls="{uid}-filters"
			onclick={() => (open = !open)}
		>
			Filters & sorting
			{#if active}<span class="badge num">{active}</span>{/if}
			<span class="chev" aria-hidden="true">{open ? '▴' : '▾'}</span>
		</button>

		<div id="{uid}-filters" class="filter-body" class:open>
			{@render filters()}
			{#if active}
				<button class="btn reset" type="button" onclick={onreset}>Clear filters</button>
			{/if}
		</div>
	</aside>

	<div class="results">
		{@render children()}
	</div>
</div>

<style>
	.filter-layout {
		display: grid;
		grid-template-columns: 15rem minmax(0, 1fr);
		gap: var(--sp-5);
		align-items: start;
	}

	.filters {
		position: sticky;
		top: 5.5rem;
		max-height: calc(100vh - 7rem);
		overflow-y: auto;
	}

	.filters-toggle {
		display: none;
	}

	.filter-body {
		display: grid;
		gap: var(--sp-4);
		padding: var(--sp-4);
	}

	.reset {
		justify-self: start;
	}

	.results {
		display: grid;
		gap: var(--sp-4);
		min-width: 0;
	}

	@media (max-width: 900px) {
		.filter-layout {
			grid-template-columns: minmax(0, 1fr);
		}

		.filters {
			position: static;
			max-height: none;
		}

		.filters-toggle {
			display: flex;
			align-items: center;
			gap: var(--sp-2);
			width: 100%;
			padding: var(--sp-3) var(--sp-4);
			background: none;
			border: 0;
			font-family: var(--font-display);
			font-size: var(--fs-sm);
			font-weight: 700;
			letter-spacing: var(--tracking-wide);
			text-transform: uppercase;
			cursor: pointer;
		}

		.badge {
			padding: 0 0.4rem;
			border-radius: 999px;
			background: var(--c-gold);
			color: var(--c-on-gold);
			font-size: var(--fs-xs);
		}

		.chev {
			margin-left: auto;
		}

		.filter-body {
			display: none;
			border-top: var(--border);
		}

		.filter-body.open {
			display: grid;
		}
	}
</style>
