<script lang="ts">
	import '#lib/styles/global.css';
	import favicon from '#lib/assets/favicon.svg';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import DemoBanner from '#lib/components/DemoBanner.svelte';
	import { refreshIfStale } from '#lib/data/resource.svelte.ts';
	import { siteConfig } from '#lib/config/site.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	$effect(() => {
		const onVisible = () => {
			if (document.visibilityState === 'visible') refreshIfStale();
		};
		document.addEventListener('visibilitychange', onVisible);
		window.addEventListener('focus', onVisible);
		return () => {
			document.removeEventListener('visibilitychange', onVisible);
			window.removeEventListener('focus', onVisible);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content={siteConfig.description} />
	<meta name="theme-color" content="#09090b" />
	<meta property="og:site_name" content={siteConfig.name} />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>

<div class="shell">
	<DemoBanner />
	<SiteHeader />
	<main id="main" tabindex="-1">
		{@render children()}
	</main>
	<SiteFooter />
</div>

<style>
	.shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	main {
		flex: 1;
		outline: none;
	}

	.skip-link {
		position: absolute;
		left: var(--sp-4);
		top: -4rem;
		z-index: 100;
		padding: var(--sp-2) var(--sp-4);
		background: var(--c-gold);
		color: var(--c-on-gold);
		font-weight: 700;
		border-radius: var(--radius-md);
		text-decoration: none;
	}

	.skip-link:focus {
		top: var(--sp-3);
	}
</style>
