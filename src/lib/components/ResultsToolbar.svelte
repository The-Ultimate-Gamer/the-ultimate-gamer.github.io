<script lang="ts">
	import type { Snippet } from 'svelte';
	import ViewSwitch, { type ViewMode } from './ViewSwitch.svelte';

	interface Props {
		shown: number;
		total: number;
		/** Plural noun, e.g. "games". */
		noun: string;
		view: ViewMode;
		/** Extra controls before the view switch. */
		extra?: Snippet;
	}

	let { shown, total, noun, view = $bindable(), extra }: Props = $props();
</script>

<div class="toolbar">
	<p class="subtle" aria-live="polite">
		<span class="num">{shown}</span> of <span class="num">{total}</span>
		{noun}
	</p>
	<div class="controls">
		{@render extra?.()}
		<ViewSwitch bind:value={view} />
	</div>
</div>

<style>
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-3);
		font-size: var(--fs-sm);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-3);
	}
</style>
