<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { Resource } from '#lib/data/resource.svelte.ts';
	import LoadingState from './LoadingState.svelte';
	import ErrorState from './ErrorState.svelte';
	import EmptyState from './EmptyState.svelte';

	interface Props {
		resource: Resource<T>;
		children: Snippet<[T]>;
		/** Return true when the loaded document has nothing to show. */
		isEmpty?: (data: T) => boolean;
		emptyTitle?: string;
		emptyMessage?: string;
		notFound?: Snippet;
		loadingRows?: number;
		loadingLabel?: string;
	}

	let {
		resource,
		children,
		isEmpty,
		emptyTitle = 'Nothing here yet',
		emptyMessage = 'No information is currently available. Check back once results are published.',
		notFound,
		loadingRows = 5,
		loadingLabel
	}: Props = $props();
</script>

{#if resource.status === 'loading'}
	<LoadingState rows={loadingRows} label={loadingLabel} />
{:else if resource.status === 'error' && resource.error}
	{#if resource.error.kind === 'not-found' && notFound}
		{@render notFound()}
	{:else}
		<ErrorState error={resource.error} onretry={resource.retry} />
	{/if}
{:else if resource.data !== undefined}
	{#if isEmpty?.(resource.data)}
		<EmptyState title={emptyTitle} message={emptyMessage} />
	{:else}
		{@render children(resource.data)}
	{/if}
{/if}
