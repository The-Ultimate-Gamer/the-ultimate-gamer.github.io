<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title: string;
		/** Small line above the title. */
		eyebrow?: string;
		onclose: () => void;
		children: Snippet;
	}

	let { open, title, eyebrow, onclose, children }: Props = $props();

	const uid = $props.id();
	let dialog: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});

	// A click on the backdrop lands on the dialog element itself.
	function onclick(event: MouseEvent) {
		if (event.target === dialog) dialog?.close();
	}
</script>

<dialog
	bind:this={dialog}
	class="side-panel"
	aria-labelledby="{uid}-title"
	{onclick}
	onclose={() => {
		if (open) onclose();
	}}
>
	{#if open}
		<div class="inner">
			<header>
				<div class="titles">
					{#if eyebrow}<p class="eyebrow">{eyebrow}</p>{/if}
					<h2 id="{uid}-title">{title}</h2>
				</div>
				<button class="close" type="button" onclick={() => dialog?.close()}>
					<span aria-hidden="true">✕</span>
					<span class="visually-hidden">Close</span>
				</button>
			</header>
			<div class="body">
				{@render children()}
			</div>
		</div>
	{/if}
</dialog>

<style>
	.side-panel {
		position: fixed;
		inset: 0 0 0 auto;
		width: min(34rem, 100vw);
		max-width: 100vw;
		height: 100dvh;
		max-height: 100dvh;
		margin: 0;
		padding: 0;
		border: 0;
		border-left: var(--border-strong);
		background: var(--c-bg-raised);
		color: var(--c-text);
		box-shadow: -24px 0 48px -24px rgb(0 0 0 / 0.8);
	}

	.side-panel[open] {
		animation: slide-in var(--t-slow) var(--ease-out);
	}

	.side-panel::backdrop {
		background: rgb(0 0 0 / 0.55);
		backdrop-filter: blur(2px);
	}

	.inner {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		height: 100%;
	}

	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--sp-3);
		padding: var(--sp-5);
		border-bottom: var(--border);
	}

	.titles {
		display: grid;
		gap: var(--sp-1);
		min-width: 0;
	}

	.eyebrow {
		color: var(--c-gold);
	}

	h2 {
		font-size: var(--fs-xl);
		text-transform: uppercase;
		overflow-wrap: anywhere;
	}

	.close {
		flex: none;
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		background: var(--c-surface-2);
		border: var(--border-strong);
		border-radius: var(--radius-md);
		cursor: pointer;
	}

	.close:hover {
		border-color: var(--c-gold-line);
		color: var(--c-gold-bright);
	}

	.body {
		overflow-y: auto;
		padding: var(--sp-5);
		display: grid;
		align-content: start;
		gap: var(--sp-5);
	}

	@keyframes slide-in {
		from {
			transform: translateX(2rem);
			opacity: 0;
		}
	}
</style>
