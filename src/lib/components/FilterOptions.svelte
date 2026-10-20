<script lang="ts" module>
	export interface FilterOption<V extends string = string> {
		value: V;
		label: string;
		icon?: string;
		count?: number;
	}
</script>

<script lang="ts" generics="T extends string">
	interface Props {
		legend: string;
		/** Small note next to the legend. */
		hint?: string;
		/** Radio group name; unique per page. */
		name: string;
		options: FilterOption<T>[];
		value: T;
	}

	let { legend, hint, name, options, value = $bindable() }: Props = $props();
</script>

<fieldset>
	<legend
		>{legend}{#if hint}<span class="hint"> · {hint}</span>{/if}</legend
	>
	{#each options as o (o.value)}
		<label class="option">
			<input type="radio" {name} value={o.value} bind:group={value} />
			<span
				>{#if o.icon}<span aria-hidden="true">{o.icon}</span>
				{/if}{o.label}</span
			>
			{#if o.count != null}<span class="num count">{o.count}</span>{/if}
		</label>
	{/each}
</fieldset>

<style>
	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
		display: grid;
		gap: 0.15rem;
		min-width: 0;
	}

	legend {
		margin-bottom: var(--sp-2);
		font-family: var(--font-display);
		font-size: var(--fs-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--c-text-subtle);
	}

	.hint {
		text-transform: none;
		letter-spacing: normal;
		font-family: var(--font-sans);
		font-weight: 400;
	}

	.option {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--sp-2);
		padding: 0.3rem var(--sp-2);
		border-radius: var(--radius-sm);
		font-size: var(--fs-sm);
		cursor: pointer;
	}

	.option:hover {
		background: var(--c-surface-2);
	}

	.option:has(input:checked) {
		background: var(--c-gold-soft);
		color: var(--c-gold-bright);
	}

	.option input {
		accent-color: var(--c-gold);
		margin: 0;
	}

	.count {
		font-size: var(--fs-xs);
		color: var(--c-text-subtle);
	}
</style>
