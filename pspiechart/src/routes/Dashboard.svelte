<script>
	import Grid from 'svelte-grid';
	import gridHelp from 'svelte-grid/build/helper/index.mjs';

	const COLS = 6;

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

	const cols = [[1100, 6]];

	function add() {
		let newItem = {
			6: gridHelp.item({
				w: Math.round(randomNumberInRange(1, 4)),
				h: Math.round(randomNumberInRange(1, 4)),
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
			6: gridHelp.item({
				w: Math.round(randomNumberInRange(1, 4)),
				h: Math.round(randomNumberInRange(1, 4)),
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
	<Grid {items} rowHeight={100} let:item {cols} let:dataItem>
		<div class="dashboard-widget card bg-dark">
			<span
				on:pointerdown={(e) => e.stopPropagation()}
				on:click={() => remove(dataItem)}
				class="remove"
			>
				✕
			</span>
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
