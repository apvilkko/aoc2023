<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { splitLines, splitNumbers } from '@/lib/helpers'
import { first, last, sum } from 'lodash/fp'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

const parseInput = () => splitLines(props.data).map((x) => splitNumbers(x))

const getDeltas = (arr: number[]) =>
  Array.from({ length: arr.length - 1 }).map((_, i) => arr[i + 1] - arr[i])

const down = (arrs: Array<Array<number[]>>) => {
  for (let n = 1; ; ++n) {
    const ready: Record<number, boolean> = {}
    for (let i = 0; i < arrs.length; ++i) {
      if (last(arrs[i])!.every((x) => x === 0)) {
        ready[i] = true
        continue
      }
      const deltas = getDeltas(arrs[i][n - 1])
      arrs[i].push(deltas)
    }
    if (Object.keys(ready).length === arrs.length) {
      break
    }
  }
  return arrs
}

const part1 = () => {
  const arrs = down(parseInput().map((x) => [x]))

  for (let i = 0; i < arrs.length; ++i) {
    for (let n = arrs[i].length - 1; n >= 0; --n) {
      const value = n === arrs[i].length - 1 ? 0 : last(arrs[i][n + 1])
      arrs[i][n].push(last(arrs[i][n]) + value)
    }
  }

  result.value = sum(arrs.map((x) => first(x)).map((x) => last(x)))
}

const part2 = () => {
  const arrs = down(parseInput().map((x) => [x]))

  for (let i = 0; i < arrs.length; ++i) {
    for (let n = arrs[i].length - 1; n >= 0; --n) {
      const value = n === arrs[i].length - 1 ? 0 : first(arrs[i][n + 1])
      arrs[i][n].unshift(first(arrs[i][n]) - value)
    }
  }

  result2.value = sum(arrs.map((x) => first(x)).map((x) => first(x)))
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
    Day 09 part 1
    <AssertResult :expected="variant === 'test' ? 114 : undefined" :value="result" />
    part 2: <AssertResult :expected="variant === 'test' ? 2 : undefined" :value="result2" />
  </div>
</template>
