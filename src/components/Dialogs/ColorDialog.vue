<template>
  <k-dialog v-bind="$props" @submit="submit" @cancel="$emit('cancel')" class="rs-color-dialog">
    <div class="custom-color">
      
      <button type="button" class="color-display" :style="{backgroundColor: color}" @click="$refs.colorInput.click()">
        <input type="color" v-model="color" ref="colorInput" />
      </button>
      <input type="text" v-model="color" />
    </div>

    <div class="palette" v-if="palette.length">
      <button
        v-for="swatch in palette"
        type="button"
        class="color-swatch"
        :key="swatch"
        :style="{backgroundColor: swatch, borderColor: color.toUpperCase() === swatch.toUpperCase() ? '#000' : '#fff'}"
        @click="color = swatch"
      />
      <button
        type="button"
        class="empty-swatch"
        :style="{backgroundColor: '#fff', borderColor: color === '' ? '#000' : '#fff'}"
        @click="color = ''"
      />
    </div>
  </k-dialog>
</template>

<script>
import dialog from '@/mixins/dialog.js'

export default {
  mixins: [dialog],
  props: {
    value: {
      type: String,
      default: ''
    },
    palette: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      color: this.value
    }
  },
  methods: {
    submit() {
      this.$emit('submit', this.color)
    }
  }
}
</script>

<style scoped>
.custom-color {
  display: flex;
  align-items: center;
  border: 1px solid #999;
}

button.color-display {
  width: 2rem;
  height: 2rem;
  border-radius: 2px 0 0 2px;
  position: relative;
  overflow: hidden;
}

input[type=color] {
  position: absolute;
  top: 100%;
  left: 0;
  opacity: 0;
  width: 0;
  height: 0;
}

input[type=text] {
  width: 100%;
  height: 2rem;
  background: white;
  padding: 0 10px;
}

.palette {
  display: grid;
  grid-template-columns: repeat(auto-fill, 1.5rem);
  gap: .25rem;
  margin-top: 1rem;
  padding: 0.5rem;
  justify-content: center;
  background: #fff;
  border: 1px solid #999;
}

.color-swatch, .empty-swatch {
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid #fff;
  cursor: pointer;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.empty-swatch {
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16"><line x1="0" y1="16" x2="16" y2="0" stroke="red" stroke-width="1" /></svg>');
}

</style>