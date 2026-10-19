<script lang="ts">
	import { siteConfig } from '#lib/config/site.ts';

	interface Props {
		/** Page name; the site name is appended. Omit for the site name alone. */
		title?: string;
		description?: string;
	}

	let { title, description = siteConfig.description }: Props = $props();

	const full = $derived(title ? `${title} · ${siteConfig.name}` : siteConfig.name);
</script>

<!-- Title, description and link-preview tags, rendered into the prerendered HTML. -->
<svelte:head>
	<title>{full}</title>
	<meta name="description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={full} />
	<meta property="og:description" content={description} />
	<meta name="twitter:card" content="summary" />
</svelte:head>
