<script lang="ts" module>
	export type ViewMode = 'cards' | 'table';
</script>

<script lang="ts">
	interface Props {
		value: ViewMode;
	}

	let { value = $bindable() }: Props = $props();

	const modes: { id: ViewMode; label: string }[] = [
		{ id: 'cards', label: 'Cards' },
		{ id: 'table', label: 'Table' }
	];
</script>

<div class="view-switch" role="group" aria-label="View">
	{#each modes as m (m.id)}
		<button type="button" aria-pressed={value === m.id} onclick={() => (value = m.id)}
			>{m.label}</button
		>
	{/each}
</div>

<style>
	.view-switch {
		display: inline-flex;
		flex: none;
		border: var(--border-strong);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	button {
		padding: 0.35rem 0.8rem;
		background: none;
		border: 0;
		font-size: var(--fs-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--c-text-muted);
		cursor: pointer;
	}

	button[aria-pressed='true'] {
		background: var(--c-gold);
		color: var(--c-on-gold);
	}
</style>
