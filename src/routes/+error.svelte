<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import NotFoundState from '#lib/components/NotFoundState.svelte';
</script>

<svelte:head>
	<title
		>{page.status === 404 ? 'Page not found' : 'Something went wrong'} · The Ultimate Gamer</title
	>
</svelte:head>

<div class="container">
	{#if page.status === 404}
		<NotFoundState
			title="Page not found"
			message="This page doesn’t exist. It may have moved, or the link might be mistyped."
			backHref={resolve('/')}
			backLabel="Back to live standings"
		/>
	{:else}
		<NotFoundState
			title="Something went wrong"
			message={page.error?.message ?? 'An unexpected error occurred.'}
			backHref={resolve('/')}
			backLabel="Back to live standings"
		/>
	{/if}
</div>
