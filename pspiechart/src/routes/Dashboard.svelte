<script>
	import Grid from 'svelte-grid';
	import gridHelp from 'svelte-grid/build/helper/index.mjs';

	const COLS = 12;

	const id = () => '_' + Math.random().toString(36).substr(2, 9);

	const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;

	let items = [
		{
			[COLS]: gridHelp.item({
				x: 0,
				y: 0,
				w: 2,
				h: 2
			}),
			id: id()
		},

		{
			[COLS]: gridHelp.item({
				x: 2,
				y: 0,
				w: 2,
				h: 2
			}),
			id: id()
		}
	];

	const cols = [[1600, COLS]];

	function add() {
		let newItem = {
			[COLS]: gridHelp.item({
				w: 2,
				h: 2,
				x: 0,
				y: 0
			}),
			id: id()
		};

		let findOutPosition = gridHelp.findSpace(newItem, items, COLS);

		newItem = {
			...newItem,
			[COLS]: {
				...newItem[COLS],
				...findOutPosition
			}
		};

		items = [...items, ...[newItem]];
	}

	const addAt = () => {
		let newItem = {
			[COLS]: gridHelp.item({
				w: 2,
				h: 2,
				x: 0,
				y: 0
			}),
			id: id()
		};

		items = [...[newItem], ...items];

		items = gridHelp.adjust(items, COLS);
	};

	const remove = (item) => {
		items = items.filter((value) => value.id !== item.id);
		items = gridHelp.adjust(items, COLS);
	};
</script>

<div class="flex-fill">
	<button on:click={add}>goofy aah</button>

	<Grid bind:items rowHeight={100} let:item let:dataItem {cols}>
		<div class="dashboard-widget card bg-dark">
			<button
				on:pointerdown={(e) => e.stopPropagation()}
				on:click={() => remove(dataItem)}
				class="remove"
			>
				✕
			</button>
			<h3>
				{dataItem.id}
			</h3>
		</div>
	</Grid>
</div>

<style>
	.dashboard-widget {
		height: 100%;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
