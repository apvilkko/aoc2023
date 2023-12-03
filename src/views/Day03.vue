<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { splitLines } from '@/lib/helpers'
import { filter, flatten, flow, map, prop, sum, uniqBy } from 'lodash/fp'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

type Entry = {
  x0: number
  x1: number
  y: number
  value: number
}

const adjacents = [
  [-1, 1],
  [0, 1],
  [1, 1],
  [-1, 0],
  [1, 0],
  [-1, -1],
  [0, -1],
  [1, -1]
]

const lines = splitLines(props.data)
const numbers = shallowRef<Entry[]>([])

const addNumber = (x0: number, x1: number, y: number) => {
  if (x0 > -1 && x1 > -1 && y > -1) {
    numbers.value.push({
      x0,
      x1,
      y,
      value: Number(lines[y].slice(x0, x1 + 1))
    })
  }
}

const findNumbers = () => {
  let numberStart = -1
  let numberEnd = -1
  for (let y = 0; y < lines.length; ++y) {
    addNumber(numberStart, numberEnd, y - 1)
    numberStart = -1
    numberEnd = -1
    for (let x = 0; x < lines[0].length; ++x) {
      if (/\d/.test(lines[y][x])) {
        if (numberStart === -1) {
          numberStart = x
          numberEnd = x
        } else {
          numberEnd = x
        }
      } else {
        addNumber(numberStart, numberEnd, y)
        numberStart = -1
        numberEnd = -1
      }
    }
  }
}

const getCandidates = (e: Entry): Array<[number, number]> => {
  const entryCells = Array.from({ length: e.x1 - e.x0 + 1 }).map((_, i) => [i + e.x0, e.y])
  return flow([
    map((cell: [number, number]) => adjacents.map((adj) => [cell[0] + adj[0], cell[1] + adj[1]])),
    flatten,
    uniqBy((c) => `${c[0]}.${c[1]}`),
    filter(
      (cell: [number, number]) =>
        cell[1] >= 0 &&
        cell[1] < lines.length &&
        cell[0] >= 0 &&
        cell[0] < lines[0].length &&
        !entryCells.some((c) => c[0] === cell[0] && c[1] === cell[1])
    )
  ])(entryCells)
}

const part1 = () => {
  numbers.value = []
  const isPart = (e: Entry) => getCandidates(e).some((c) => lines[c[1]][c[0]] !== '.')
  findNumbers()
  const parts = numbers.value.filter(isPart)

  result.value = sum(parts.map(prop('value')))
}

const part2 = () => {
  numbers.value = []

  type Gp = { entry: Entry; gearPosition: [number, number] }

  const getGearPosition = (e: Entry): Gp => {
    const arr = getCandidates(e).filter((c) => lines[c[1]][c[0]] === '*')
    if (arr.length > 1) {
      console.error('more than one gear')
    }
    return { entry: e, gearPosition: arr[0] }
  }

  findNumbers()

  const gearPositions: Array<Gp> = flow([
    map(getGearPosition),
    filter((x: Gp) => !!x.gearPosition)
  ])(numbers.value)

  const actualGears: Record<string, number> = {}
  gearPositions.forEach((gp, j) => {
    for (let i = 0; i < gearPositions.length; ++i) {
      if (i === j) {
        continue
      }
      const other = gearPositions[i]
      if (
        gp.gearPosition[0] === other.gearPosition[0] &&
        gp.gearPosition[1] === other.gearPosition[1]
      ) {
        actualGears[`${gp.gearPosition[0]},${gp.gearPosition[1]}`] =
          gp.entry.value * other.entry.value
      }
    }
  })

  result2.value = sum(Object.values(actualGears))
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
    Day 03 part 1
    <AssertResult :expected="variant === 'test' ? 4361 : undefined" :value="result" />
    part 2: {{ result2 }}
  </div>
</template>
