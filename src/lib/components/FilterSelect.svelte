<script lang="ts" generics="T extends string">
	interface Props {
		label: string;
		options: { value: T; label: string }[];
		value: T;
		/** Compact inline style for toolbars. */
		inline?: boolean;
	}

	let { label, options, value = $bindable(), inline = false }: Props = $props();
</script>

<label class="select" class:inline>
	<span class="label">{label}</span>
	<select bind:value>
		{#each options as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
	</select>
</label>

<style>
	.select {
		display: grid;
	}

	.label {
		margin-bottom: var(--sp-2);
		font-family: var(--font-display);
		font-size: var(--fs-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--c-text-subtle);
	}

	.inline {
		display: inline-flex;
		align-items: center;
		gap: var(--sp-2);
	}

	.inline .label {
		margin: 0;
		letter-spacing: var(--tracking-wide);
	}

	select {
		padding: 0.45rem 0.6rem;
		background: var(--c-surface-2);
		border: var(--border-strong);
		border-radius: var(--radius-md);
		font: inherit;
		font-size: var(--fs-sm);
		color: var(--c-text);
	}

	.inline select {
		padding: 0.3rem 0.5rem;
		font-size: var(--fs-xs);
	}
</style>
