<script lang="ts" module>
	export interface Tab {
		id: string;
		label: string;
		/** Optional count shown next to the label. */
		count?: number | null;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		tabs: Tab[];
		/** Id of the selected tab. Falls back to the first tab. */
		selected?: string;
		/** Accessible name of the tab list. */
		label: string;
		children: Snippet<[string]>;
		/** Rendered at the end of the tab bar, e.g. a timestamp. */
		aside?: Snippet;
	}

	let { tabs, selected = $bindable(), label, children, aside }: Props = $props();

	const uid = $props.id();
	const current = $derived(tabs.some((t) => t.id === selected) ? selected! : tabs[0]?.id);
	const buttons: HTMLButtonElement[] = $state([]);

	function onkeydown(event: KeyboardEvent, index: number) {
		const moves: Record<string, number> = {
			ArrowRight: index + 1,
			ArrowLeft: index - 1,
			Home: 0,
			End: tabs.length - 1
		};
		if (!(event.key in moves)) return;
		event.preventDefault();
		const next = (moves[event.key] + tabs.length) % tabs.length;
		selected = tabs[next].id;
		buttons[next]?.focus();
	}
</script>

<div class="tabs">
	<div class="bar">
		{#if tabs.length > 1}
			<div class="tablist" role="tablist" aria-label={label}>
				{#each tabs as tab, i (tab.id)}
					<button
						bind:this={buttons[i]}
						id="{uid}-tab-{tab.id}"
						class="tab"
						role="tab"
						type="button"
						aria-selected={tab.id === current}
						aria-controls="{uid}-panel"
						tabindex={tab.id === current ? 0 : -1}
						onclick={() => (selected = tab.id)}
						onkeydown={(e) => onkeydown(e, i)}
					>
						{tab.label}
						{#if tab.count != null}<span class="count num">{tab.count}</span>{/if}
					</button>
				{/each}
			</div>
		{:else if tabs.length === 1}
			<h2 class="panel-title single">{tabs[0].label}</h2>
		{/if}
		{#if aside}<div class="aside">{@render aside()}</div>{/if}
	</div>

	{#if current}
		<div
			id="{uid}-panel"
			class="tabpanel"
			role={tabs.length > 1 ? 'tabpanel' : undefined}
			aria-labelledby={tabs.length > 1 ? `${uid}-tab-${current}` : undefined}
		>
			{@render children(current)}
		</div>
	{/if}
</div>

<style>
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--sp-2) var(--sp-3);
		padding: 0 var(--sp-5);
		border-bottom: var(--border);
		min-height: 3.25rem;
	}

	.tablist {
		display: flex;
		min-width: 0;
		max-width: 100%;
		gap: var(--sp-4);
		overflow-x: auto;
		scrollbar-width: none;
	}

	.tab {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: var(--sp-4) 0;
		background: none;
		border: 0;
		font-family: var(--font-display);
		font-size: var(--fs-sm);
		font-weight: 700;
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--c-text-subtle);
		white-space: nowrap;
		cursor: pointer;
	}

	.tab:hover {
		color: var(--c-text);
	}

	.tab[aria-selected='true'] {
		color: var(--c-text);
	}

	.tab[aria-selected='true']::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -1px;
		height: 2px;
		background: var(--c-gold);
		box-shadow: 0 0 10px var(--c-gold);
	}

	.count {
		font-size: var(--fs-xs);
		color: var(--c-text-subtle);
	}

	.single {
		padding-block: var(--sp-4);
	}

	.aside {
		margin-left: auto;
		padding-block: var(--sp-2);
	}

	.tabpanel:focus-visible {
		box-shadow: inset var(--focus-ring);
	}
</style>
