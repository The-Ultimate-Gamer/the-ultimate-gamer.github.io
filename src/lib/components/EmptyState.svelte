<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		message?: string;
		icon?: string;
		children?: Snippet;
	}

	let { title, message, icon = '🎮', children }: Props = $props();
</script>

<div class="empty-state">
	<span class="icon" aria-hidden="true">{icon}</span>
	<p class="title">{title}</p>
	{#if message}<p class="muted">{message}</p>{/if}
	{#if children}<div class="extra">{@render children()}</div>{/if}
</div>

<style>
	.empty-state {
		display: grid;
		justify-items: center;
		text-align: center;
		gap: var(--sp-2);
		padding: var(--sp-7) var(--sp-5);
		border: 1px dashed var(--c-border-strong);
		border-radius: var(--radius-lg);
	}

	.icon {
		font-size: 2rem;
		opacity: 0.8;
	}

	.title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--fs-lg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.muted {
		max-width: 48ch;
	}

	.extra {
		margin-top: var(--sp-3);
	}
</style>
