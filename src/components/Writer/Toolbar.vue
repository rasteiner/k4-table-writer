<template>
	<k-toolbar
		v-if="isOpen || !inline"
		ref="toolbar"
		:buttons="buttons"
		:data-inline="inline"
		:theme="inline ? 'dark' : 'light'"
		:style="{
			top: position.y + 'px',
			left: position.x + 'px'
		}"
		class="k-writer-toolbar"
	/>
</template>

<script>
/**
 * Toolbar for `k-writer`
 * @displayName WriterToolbar
 * @internal
 */
import { getTableButtons } from './Extensions/Tables';

export default {
	props: {
		editor: {
			required: true,
			type: Object
		},
		inline: {
			default: true,
			type: Boolean
		},
		marks: {
			default: () => [
				"bold",
				"italic",
				"underline",
				"strike",
				"code",
				"|",
				"link",
				"email",
				"|",
				"clear"
			],
			type: [Array, Boolean]
		},
		nodes: {
			default: true,
			type: [Array, Boolean]
		}
	},
	data() {
		return {
			isOpen: false,
			showTableOptions: false,
			position: { x: 0, y: 0 }
		};
	},
	computed: {
		activeNode() {
			const nodes = Object.values(this.nodeButtons);
			return nodes.find((button) => this.isNodeActive(button)) ?? false;
		},
		/**
		 * Button objects for k-toolbar
		 */
		 buttons() {
			const buttons = [];
			// Nodes
			if (this.hasNodes) {
				const nodes = [];
				let nodeIndex = 0;
				for (const nodeType in this.nodeButtons) {
					const node = this.nodeButtons[nodeType];
					nodes.push({
						current: this.activeNode?.id === node.id,
						disabled: this.activeNode?.when?.includes(node.name) === false,
						icon: node.icon,
						label: node.label,
						click: () => this.command(node.command ?? nodeType)
					});
					if (
						node.separator === true &&
						nodeIndex !== Object.keys(this.nodeButtons).length - 1
					) {
						nodes.push("-");
					}
					nodeIndex++;
				}
				buttons.push({
					current: Boolean(this.activeNode),
					icon: this.activeNode.icon ?? "title",
					dropdown: nodes
				});
			}
			// Divider between nodes and marks
			if (this.hasNodes && (this.hasMarks || this.showTableOptions)) {
				buttons.push("|");
			}

			if (this.showTableOptions) {
				
				buttons.push({
					current: this.editor.activeNodes.includes("table"),
					icon: "table",
					dropdown: this.tableButtons.map(button => {
						// if button is an array
						if (Array.isArray(button)) {
							return button.map(b => {
								return {
									...b,
									click: () => this.command(b.value)
								}
							});
						}

						if (typeof button === "string") {
							return button;
						}

						if (typeof button === "object") {
							return {
								...button,
								click: () => this.command(button.name)
							};
						}

						return button;
					})
				});

				if(this.hasMarks) {
					buttons.push("|");
				}
			}


			// Marks
			if (this.hasMarks) {
				for (const markType in this.markButtons) {
					const mark = this.markButtons[markType];
					if (mark === "|") {
						buttons.push("|");
						continue;
					}
					buttons.push({
						current: this.editor.activeMarks.includes(markType),
						icon: mark.icon,
						label: mark.label,
						click: (e) => this.command(mark.command ?? markType, e)
					});
				}
			}
			return buttons;
		},
		hasMarks() {
			return this.$helper.object.length(this.markButtons) > 0;
		},
		hasNodes() {
			return this.$helper.object.length(this.nodeButtons) > 1;
		},
		markButtons() {
			const available = this.editor.buttons("mark");

			if (this.marks === false || this.$helper.object.length(available) === 0) {
				return {};
			}

			if (this.marks === true) {
				return available;
			}

			const buttons = {};

			for (const [index, mark] of this.marks.entries()) {
				if (mark === "|") {
					buttons["divider" + index] = "|";
				} else if (available[mark]) {
					buttons[mark] = available[mark];
				}
			}

			return buttons;
		},
		nodeButtons() {
			const available = this.editor.buttons("node");
			if (this.nodes === false || this.$helper.object.length(available) === 0) {
				return {};
			}

			if (this.editor.nodes.doc.content !== "block+" && available.paragraph) {
				delete available.paragraph;
			}

			if (this.nodes === true) {
				return available;
			}

			const buttons = {};

			for (const node of this.nodes) {
				if (available[node]) {
					buttons[node] = available[node];
				}
			}

			return buttons;
		},
		tableButtons() {
			return getTableButtons(this.editor);
		}
	},
	methods: {
		/**
		 * Closes the inline toolbar
		 * @public
		 * @param {FocusEvent} event
		 */
		close(event) {
			if (!event || this.$el.contains(event.relatedTarget) === false) {
				this.isOpen = false;
			}
		},
		
		/**
		 * Sets if the table options should be shown
		 * @public
		 * @param {Boolean} available
		 */
		tableOptions(available) {
			this.showTableOptions = available;
		},

		command(command, ...args) {
			this.$emit("command", command, ...args);
		},
		/**
		 * Checks if the given node is active
		 * @param {Object} node
		 * @returns {Boolean}
		 */
		isNodeActive(node) {
			if (this.editor.activeNodes.includes(node.name) === false) {
				return false;
			}

			// Since the list element also contains a paragraph,
			// don't consider paragraph as an active node when
			// the list item is active
			if (node.name === "paragraph") {
				return (
					this.editor.activeNodes.includes("listItem") === false &&
					this.editor.activeNodes.includes("quote") === false
				);
			}

			// Te might have multiple node buttons for the same node
			// (e.g. headings). To know which one is active, we need
			// to compare the active attributes with the
			// attributes of the node button
			if (node.attrs) {
				const activeAttrs = Object.values(this.editor.activeNodeAttrs);
				const activeNode = activeAttrs.find(
					(attrs) => JSON.stringify(attrs) === JSON.stringify(node.attrs)
				);

				if (activeNode === undefined) {
					return false;
				}
			}

			return true;
		},
		/**
		 * Opens the toolbar
		 * @public
		 */
		open() {
			this.isOpen = true;

			if (this.inline) {
				this.$nextTick(this.setPosition);
			}
		},
		/**
		 * Calculates the position of the inline toolbar
		 * based on the current selection in the editor
		 */
		setPosition() {
			// Get sizes for the toolbar itself but also the editor box
			const toolbar = this.$el.getBoundingClientRect();
			const editor = this.editor.element.getBoundingClientRect();
			const menu = document
				.querySelector(".k-panel-menu")
				.getBoundingClientRect();

			// Create pseudo rectangle for the selection
			const { from, to } = this.editor.selection;
			const start = this.editor.view.coordsAtPos(from);
			const end = this.editor.view.coordsAtPos(to, true);
			const selection = new DOMRect(
				start.left,
				start.top,
				end.right - start.left,
				end.bottom - start.top
			);

			// Calculate the position of the toolbar: centered above the selection
			let x = selection.x - editor.x + selection.width / 2 - toolbar.width / 2;
			let y = selection.y - editor.y - toolbar.height - 5;

			// Contain in editor (if possible)
			if (toolbar.width < editor.width) {
				if (x < 0) {
					x = 0;
				} else if (x + toolbar.width > editor.width) {
					x = editor.width - toolbar.width;
				}
			} else {
				// Contain in viewport
				const left = editor.x + x;
				const right = left + toolbar.width;
				const safeSpaceLeft = menu.width + 20;
				const safeSpaceRight = 20;

				if (left < safeSpaceLeft) {
					x += safeSpaceLeft - left;
				} else if (right > window.innerWidth - safeSpaceRight) {
					x -= right - (window.innerWidth - safeSpaceRight);
				}
			}

			this.position = { x, y };
		}
	}
};
</script>

<style>
</style>
