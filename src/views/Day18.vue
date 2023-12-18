<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { splitLines } from '@/lib/helpers'
import { flow, map, sortBy } from 'lodash/fp'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

type LetterDirection = 'D' | 'U' | 'L' | 'R'

const dirMap: Record<LetterDirection, [number, number]> = {
  D: [0, 1],
  U: [0, -1],
  L: [-1, 0],
  R: [1, 0]
}

type Instruction = { direction: LetterDirection; amount: number; color: string }

const parseInput = () =>
  flow([
    splitLines,
    map((line: string) => {
      const parts = line.split(' ')
      return {
        direction: parts[0],
        amount: Number(parts[1]),
        color: parts[2].replace(/[^a-f0-9]+/g, '')
      }
    })
  ])(props.data) as Instruction[]

const coordKey = (pos: [number, number]) => `${pos[0]},${pos[1]}`

const view = ref<string[][]>([])

type Dims = { x0: number; y0: number; x1: number; y1: number }

const createView = (
  dim: Dims,
  visited: Record<string, boolean>,
  filled: Record<string, boolean>
) => {
  const width = dim.x1 - dim.x0 + 1
  const height = dim.y1 - dim.y0 + 1
  const rows = Array.from({ length: height }).map(() => Array.from({ length: width }).map(() => ''))
  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      const xx = x + dim.x0
      const yy = y + dim.y0
      const key = coordKey([xx, yy])
      if (visited[key]) {
        rows[y][x] = '#'
      } else if (filled[key]) {
        rows[y][x] = 'I'
      }
    }
  }
  return rows
}

const isInside = (x: number, y: number, visited: Record<string, boolean>, maxX: number) => {
  //console.log('isInside', x, y, maxX)
  let i = x + 1
  const row: Record<number, { up: boolean; down: boolean; entry: boolean; index: number }> = {}
  let prev = ''
  let count = 0
  while (i <= maxX + 1) {
    const cell = visited[coordKey([i, y])] ? '#' : '.'
    if (prev !== cell) {
      if (cell === '#') {
        const up = !!visited[coordKey([i, y - 1])]
        const down = !!visited[coordKey([i, y + 1])]
        row[i] = { up, down, entry: true, index: i }
      } else if (prev === '#') {
        const up = !!visited[coordKey([i - 1, y - 1])]
        const down = !!visited[coordKey([i - 1, y + 1])]
        row[i - 1] = { up, down, entry: false, index: i - 1 }
      }
    }

    ++i
    prev = cell
  }

  const values = sortBy('index')(Object.values(row))
  for (i = 0; i < values.length; ++i) {
    const v = values[i]
    const n = values[i + 1]
    if (v.up && v.down) {
      count++
    } else if (
      i + 1 < values.length &&
      v.entry &&
      !n.entry &&
      ((v.up && n.down) || (v.down && n.up))
    ) {
      count++
    }
  }
  const res = count % 2 === 1
  return res
}

const fillInterior = (
  dim: Dims,
  visited: Record<string, boolean>,
  filled: Record<string, boolean>
) => {
  for (let x = dim.x0; x <= dim.x1; ++x) {
    for (let y = dim.y0; y <= dim.y1; ++y) {
      const key = coordKey([x, y])
      if (!visited[key] && isInside(x, y, visited, dim.x1)) {
        filled[key] = true
      }
    }
  }
}

const getAmount = (input: Instruction[]) => {
  const pos: [number, number] = [0, 0]
  const visited: Record<string, boolean> = {}
  visited[coordKey(pos)] = true
  const dim: Dims = {
    x0: Number.MAX_VALUE,
    x1: -Number.MAX_VALUE,
    y0: Number.MAX_VALUE,
    y1: -Number.MAX_VALUE
  }
  input.forEach((n) => {
    const dir = dirMap[n.direction]
    for (let i = 0; i < n.amount; ++i) {
      pos[0] += dir[0]
      pos[1] += dir[1]
      visited[coordKey(pos)] = true
      if (pos[0] < dim.x0) {
        dim.x0 = pos[0]
      }
      if (pos[0] > dim.x1) {
        dim.x1 = pos[0]
      }
      if (pos[1] < dim.y0) {
        dim.y0 = pos[1]
      }
      if (pos[1] > dim.y1) {
        dim.y1 = pos[1]
      }
    }
  })

  const filled: Record<string, boolean> = {}

  fillInterior(dim, visited, filled)

  view.value = createView(dim, visited, filled)

  return Object.keys(visited).length + Object.keys(filled).length
}

const part1 = () => {
  const input = parseInput()

  result.value = getAmount(input)
}

const part2 = () => {
  const input = parseInput()
  const correctInput = input.map((x) => {
    const amount = parseInt(x.color.slice(0, 5), 16)
    const c = x.color.slice(5)
    return {
      amount,
      direction: c === '0' ? 'R' : c === '1' ? 'D' : c === '2' ? 'L' : 'U'
    }
  })
  result2.value = getAmount(correctInput)
}

const run = () => {
  part1()
  //part2()
}

run()
</script>
<template>
  <button @click="run">Run</button>
  <div>
    Day 18 part 1
    <AssertResult pretty :expected="variant === 'test' ? 62 : undefined" :value="result" />
    part 2: {{ result2 }}
    <table style="font-size: 0.1rem; margin: 0; padding: 0">
      <tr v-for="row in view">
        <td style="margin: 0; padding: 0" v-for="cell in row">{{ cell }}</td>
      </tr>
    </table>
  </div>
</template>
