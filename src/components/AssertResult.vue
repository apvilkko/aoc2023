<script setup lang="ts">
import { equals } from 'lodash/fp'

defineProps<{ expected?: any; value: any }>()
</script>

<template>
  <div class="assert ok" v-if="typeof expected === 'undefined' || equals(expected, value)">
    {{ value }}
  </div>
  <div class="assert nok" v-else>
    Not equal:<br />Expected: {{ expected }}<br />Actual:
    <pre>{{ JSON.stringify(value, null, 2) }}</pre>
  </div>
</template>

<style scoped>
.assert {
  padding: 0.5rem;
}
.ok {
  border: 2px solid green;
  color: green;
}
.nok {
  border: 2px solid red;
  color: red;
}
</style>
