<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

const part1 = () => {
  result.value = 0
}

const part2 = () => {
  result2.value = 0
}

const run = () => {
  part1()
  part2()
}

run()
</script>
<template>
  <button @click="run">Run</button>
  <div>
    Day NN part 1
    <AssertResult :expected="variant === 'test' ? 13 : undefined" :value="result" />
    part 2: {{ result2 }}
  </div>
</template>
