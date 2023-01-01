<script>
	import Dashboard from './Dashboard.svelte';
	import Sidebar from './Sidebar.svelte';
</script>

<main class="d-flex flex-row">
	<Sidebar />
	<Dashboard />
</main>

<style>
	main {
		display: flex;
		flex-wrap: nowrap;
		height: 100vh;
		height: -webkit-fill-available;
		max-height: 100vh;
		overflow-x: auto;
		overflow-y: hidden;
	}
</style>
