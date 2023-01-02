<script>
	import Grid from 'svelte-grid';
	import gridHelp from 'svelte-grid/build/helper/index.mjs';
	import bottomRightIcon from '$lib/assets/bottom-right.svg';

	let editMode = false;

	const COLS = 12;

	const id = () => '_' + Math.random().toString(36).substr(2, 9);

	const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;

	let items = [];

	const cols = [[1600, COLS]];

	function add() {
		let newItem = {
			[COLS]: gridHelp.item({
				w: 2,
				h: 2,
				x: 0,
				y: 0,
				customResizer: true
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

	const remove = (item) => {
		items = items.filter((value) => value.id !== item.id);
		items = gridHelp.adjust(items, COLS);
	};
</script>

<div class="dashboard-container flex-fill">
	<nav class="navbar navbar-expand-lg navbar-dark p-0">
		<div class="container-fluid justify-content-end">
			<button class="btn bruh btn-outline-primary m-2" on:click={add} disabled={!editMode}
				>+ Add Panel</button
			>
			<div class="form-check form-switch m-2">
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

	<Grid
		bind:items
		rowHeight={100}
		let:item
		let:dataItem
		{cols}
		fastStart={true}
		let:resizePointerDown
	>
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

			{#if editMode}
				<img
					class="resizer"
					draggable="false"
					on:pointerdown={resizePointerDown}
					src={bottomRightIcon}
					alt="resize"
				/>
			{/if}
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

	.resizer {
		position: absolute;
		bottom: 5px;
		right: 5px;
		cursor: se-resize;
	}
</style>
