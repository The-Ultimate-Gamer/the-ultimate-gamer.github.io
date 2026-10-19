<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	// History moved: champions are on Tournaments, all-time records on Players.
	$effect(() => {
		goto(resolve('/tournaments'), { replaceState: true });
	});
</script>

<svelte:head>
	<title>History · The Ultimate Gamer</title>
	<meta http-equiv="refresh" content="0; url={resolve('/tournaments')}" />
</svelte:head>

<div class="container page">
	<p class="muted">
		History has moved. Champions are on <a href={resolve('/tournaments')}>Tournaments</a>, and
		all-time records are on <a href={resolve('/players')}>Players</a>.
	</p>
</div>
