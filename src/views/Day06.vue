<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { splitLines, splitNumbers } from '@/lib/helpers'
import { flow, map, multiply, split, zip } from 'lodash/fp'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

const readInput = () => {
  const lines = flow([splitLines, map(flow([split(':'), (x) => x[1], (x) => splitNumbers(x)]))])(
    props.data
  )
  return zip(...lines).map((x) => ({ time: x[0], record: x[1] }))
}
const input = readInput()

const solveQuadratic = (a: number, b: number, c: number) => {
  const discriminant = b * b - 4 * a * c
  if (discriminant <= 0) {
    throw new Error('no usable roots')
  }
  const sq = Math.sqrt(discriminant)
  const div = 2 * a
  return [(-b + sq) / div, (-b - sq) / div]
}

const waysToWin = input
  .map((race) => {
    // -x^2 + time*x - record
    const roots = solveQuadratic(-1, race.time, -1 * race.record)
    // eliminate even numbers since they correspond to equal record (not winning)
    return [
      Number.isInteger(roots[0]) ? roots[0] + 1 : Math.ceil(roots[0]),
      Number.isInteger(roots[1]) ? roots[1] - 1 : Math.floor(roots[1])
    ]
  })
  .map((x) => x[1] - x[0] + 1) // add 1 because winning numbers range is inclusive

const part1 = () => {
  result.value = waysToWin.reduce(multiply, 1)
}

const part2 = () => {
  // part 1 algorithm works also here with manually rearranged input
  result2.value = waysToWin[0]
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
    Day 06 part 1
    <AssertResult :expected="variant === 'test' ? 288 : undefined" :value="result" />
    part 2: {{ result2 }}
  </div>
</template>
