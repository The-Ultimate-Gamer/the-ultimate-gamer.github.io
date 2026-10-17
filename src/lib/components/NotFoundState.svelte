<script lang="ts">
	interface Props {
		title: string;
		message: string;
		backHref: string;
		backLabel: string;
	}

	let { title, message, backHref, backLabel }: Props = $props();
</script>

<div class="not-found">
	<p class="code num" aria-hidden="true">404</p>
	<h1>{title}</h1>
	<p class="muted">{message}</p>
	<a class="btn" href={backHref}>← {backLabel}</a>
</div>

<style>
	.not-found {
		display: grid;
		justify-items: start;
		gap: var(--sp-3);
		padding: var(--sp-7) 0;
	}

	.code {
		font-size: var(--fs-hero);
		font-weight: 800;
		line-height: 0.9;
		color: transparent;
		-webkit-text-stroke: 1px var(--c-gold-line);
	}

	h1 {
		font-size: var(--fs-3xl);
		text-transform: uppercase;
	}

	.muted {
		max-width: 50ch;
		margin-bottom: var(--sp-3);
	}
</style>
