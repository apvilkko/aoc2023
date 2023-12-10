<script setup lang="ts">
import { PipeMap } from './day10'

const props = defineProps<{ data: PipeMap }>()
</script>

<template>
  <div class="table">
    <template v-for="i in data.matrix.length" :key="i">
      <div
        :class="[
          'cell',
          {
            n: !!data.getIndex(i - 1).n,
            e: !!data.getIndex(i - 1).e,
            s: !!data.getIndex(i - 1).s,
            w: !!data.getIndex(i - 1).w
          }
        ]"
      >
        {{ data.startIndex === i - 1 ? 'S' : data.getIndex(i - 1).value }}
      </div>
      <div class="break" v-if="i % data.rowLen === 0" />
    </template>
  </div>
</template>

<style scoped>
.table {
  display: flex;
  flex-wrap: wrap;
  --cell-border: #777;
  --pipe-color: #555;
}
.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2em;
  height: 2em;
  border: 1px solid var(--cell-border);
  position: relative;
}

.cell::before,
.cell::after {
  position: absolute;
  content: '';
  z-index: -1;
  background: var(--pipe-color);
}

.n::before {
  top: 0;
  left: 25%;
  width: 50%;
  height: 50%;
}
.s::before {
  left: 25%;
  top: 50%;
  width: 50%;
  height: 50%;
}
.n.s::before {
  left: 25%;
  top: 0;
  width: 50%;
  height: 100%;
}
.e::after {
  top: 25%;
  right: 0;
  width: 50%;
  height: 50%;
}
.w::after {
  left: 0;
  top: 25%;
  width: 50%;
  height: 50%;
}

.e.w::after {
  top: 25%;
  right: 0;
  width: 100%;
  height: 50%;
  background: #444;
}

.break {
  flex-basis: 100%;
  height: 0;
}
</style>
