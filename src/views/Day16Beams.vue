<script setup lang="ts">
defineProps<{ view: { cell: string; energized: boolean }[][] }>()
</script>

<template>
  <div class="beam-view">
    <div class="row" v-for="row in view">
      <div :class="['cell', { energized: item.energized }]" v-for="item in row">
        {{ item.cell }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.beam-view {
  display: flex;
  flex-direction: column;
}
.row {
  display: flex;
  flex-direction: row;
}
.cell {
  width: 1em;
  height: 1em;
}
.energized {
  background-color: blue;
}
</style>
