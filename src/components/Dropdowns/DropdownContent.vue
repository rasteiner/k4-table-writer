<template>
	<dialog
		v-if="isOpen"
		ref="dropdown"
		:data-align-x="axis.x"
		:data-align-y="axis.y"
		:data-theme="theme"
		:style="{
			top: position.y + 'px',
			left: position.x + 'px'
		}"
		class="k-dropdown-content"
		@close="onClose"
		@click="onClick"
	>
		<k-navigate ref="navigate" :disabled="navigate === false" axis="y">
			<!-- @slot Content of the dropdown which overrides passed `options` prop -->
			<slot>
				<template v-for="(option, index) in items">
                    <k-toggles-input v-if="Array.isArray(option)" :key="_uid + '-switch-' + index" :options="option" :grow="false" @input="onSubOptionClick(option, $event)" :value="option.find(o => o.current)?.value" />
					<hr v-else-if="option === '-'" :key="_uid + '-sep-' + index" />
					<k-dropdown-item
						v-else-if="option.when ?? true"
						:key="_uid + '-item-' + index"
						v-bind="option"
						@click="onOptionClick(option)"
					>
						{{ option.label ?? option.text }}
					</k-dropdown-item>
				</template>
			</slot>
		</k-navigate>
	</dialog>
</template>

<script>
export default {
	methods: {
		onSubOptionClick(option, value) {
			const current = option.find(o => o.value === value);
			if (current) {
				this.onOptionClick(current);
			}
		},
	}
};
</script>

<style>
</style>