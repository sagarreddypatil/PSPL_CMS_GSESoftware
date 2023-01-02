<script>
	import Grid from 'svelte-grid';
	import gridHelp from 'svelte-grid/build/helper/index.mjs';

	let editMode = false;

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

<div class="dashboard-container flex-fill">
	<nav class="navbar navbar-expand-lg navbar-dark">
		<div class="container-fluid justify-content-end">
			<button class="btn btn-outline-primary mx-2" on:click={add} disabled={!editMode}
				>+ Add Panel</button
			>
			<div class="form-check form-switch mx-2">
				<input
					class="form-check-input"
					type="checkbox"
					role="switch"
					id="editModeSwitch"
					bind:checked={editMode}
				/>
				<label class="form-check-label" for="editModeSwitch">Edit Mode</label>
			</div>
		</div>
	</nav>

	<Grid bind:items rowHeight={100} let:item let:dataItem {cols} fastStart={true}>
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
	.dashboard-container {
		overflow-y: auto;
	}

	.dashboard-widget {
		height: 100%;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.bruh:hover {
		color: white !important;
	}
</style>
