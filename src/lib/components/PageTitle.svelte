<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		eyebrow?: string;
		lead?: string;
		actions?: Snippet;
	}

	let { title, eyebrow, lead, actions }: Props = $props();
</script>

<header class="page-title">
	<div class="text">
		{#if eyebrow}<p class="eyebrow">{eyebrow}</p>{/if}
		<h1>{title}</h1>
		{#if lead}<p class="lead muted">{lead}</p>{/if}
	</div>
	{#if actions}<div class="actions">{@render actions()}</div>{/if}
</header>

<style>
	.page-title {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--sp-4);
		flex-wrap: wrap;
		padding-bottom: var(--sp-5);
		border-bottom: var(--border);
	}

	.eyebrow {
		color: var(--c-gold);
		margin-bottom: var(--sp-2);
	}

	h1 {
		font-size: var(--fs-3xl);
		text-transform: uppercase;
		letter-spacing: 0.02em;
		overflow-wrap: anywhere;
	}

	.lead {
		margin-top: var(--sp-3);
		max-width: 60ch;
	}
</style>
