<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { splitLines } from '@/lib/helpers'
import { sum } from 'lodash/fp'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

const readImage = () => splitLines(props.data)

const combinations = <T,>(arr: T[]): T[][] =>
  arr.flatMap((v, i) => arr.slice(i + 1).map((x) => [v, x]))

const getWeightedDistance = (
  p1: [number, number],
  p2: [number, number],
  rows: number[],
  cols: number[],
  weight: number
) => {
  const smallerX = p1[0] <= p2[0] ? p1 : p2
  const biggerX = smallerX === p1 ? p2 : p1
  const smallerY = p1[1] <= p2[1] ? p1 : p2
  const biggerY = smallerY === p1 ? p2 : p1
  let distance = 0
  for (let x = smallerX[0]; x < biggerX[0]; ++x) {
    distance += cols.includes(x) ? weight : 1
  }
  for (let y = smallerY[1]; y < biggerY[1]; ++y) {
    distance += rows.includes(y) ? weight : 1
  }
  return distance
}

const image = readImage()

const emptyRows: number[] = image
  .map((line, i) => [line, i])
  .filter(([line, i]) => line.split('').every((x) => x === '.'))
  .map((x) => x[1])

const cols = Array.from({ length: image.length }).map(() => true)
const galaxies = []
for (let y = 0; y < image.length; ++y) {
  for (let x = 0; x < image[0].length; ++x) {
    if (image[y][x] !== '.') {
      cols[x] = false
    }
    if (image[y][x] === '#') {
      galaxies.push([x, y])
    }
  }
}
const emptyCols: number[] = cols
  .map((x, i) => [x, i])
  .filter((x) => !!x[0])
  .map((x) => x[1])

const part1 = () => {
  const distances = combinations(galaxies).map((comb) =>
    getWeightedDistance(comb[0], comb[1], emptyRows, emptyCols, 2)
  )

  result.value = sum(distances)
}

const part2 = () => {
  const weight = 1000000
  const distances = combinations(galaxies).map((comb) =>
    getWeightedDistance(comb[0], comb[1], emptyRows, emptyCols, weight)
  )

  result2.value = sum(distances)
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
    Day 11 part 1
    <AssertResult :expected="variant === 'test' ? 374 : undefined" :value="result" pretty />
    part 2: {{ result2 }}
  </div>
</template>
