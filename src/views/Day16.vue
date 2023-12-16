<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { Grid2d } from '@/lib/grid2d'
import { splitLines } from '@/lib/helpers'
import Day16Beams from './Day16Beams.vue'
import { flatten, max } from 'lodash/fp'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

const parseInput = () => new Grid2d(splitLines(props.data))

type Beam = { dx: number; dy: number; x: number; y: number }

const forward = (b: Beam) => {
  b.x += b.dx
  b.y += b.dy
}

const view = ref<{ cell: string; energized: boolean }[][]>([])

const coordsKey = (x: number, y: number) => `${x},${y}`

const updateView = (input: Grid2d, energized: Record<string, boolean>) => {
  view.value = input.rows.map((row, y) => {
    return row.split('').map((cell, x) => {
      return { cell, energized: !!energized[coordsKey(x, y)] }
    })
  })
}

const cacheKey = (cell: string, beam: Beam) =>
  `${cell}_${coordsKey(beam.x, beam.y)}_${coordsKey(beam.dx, beam.dy)}`

const traverse = (
  input: Grid2d,
  beam: Beam,
  energized: Record<string, boolean>,
  cache: Record<string, boolean>
) => {
  while (true) {
    const cell = input.getAt(beam.x, beam.y)
    energized[coordsKey(beam.x, beam.y)] = true
    if (cache[cacheKey(cell, beam)]) {
      break
    }
    if (cell === '-' && beam.dy !== 0) {
      cache[cacheKey(cell, beam)] = true
      beam.dx = 1
      beam.dy = 0
      traverse(input, { dx: -1, dy: 0, x: beam.x, y: beam.y }, energized, cache)
    } else if (cell === '|' && beam.dx !== 0) {
      cache[cacheKey(cell, beam)] = true
      beam.dx = 0
      beam.dy = 1
      traverse(input, { dx: 0, dy: -1, x: beam.x, y: beam.y }, energized, cache)
    } else if (cell === '\\') {
      cache[cacheKey(cell, beam)] = true
      if (beam.dx > 0) {
        beam.dx = 0
        beam.dy = 1
      } else if (beam.dx < 0) {
        beam.dx = 0
        beam.dy = -1
      } else if (beam.dy > 0) {
        beam.dx = 1
        beam.dy = 0
      } else if (beam.dy < 0) {
        beam.dx = -1
        beam.dy = 0
      }
    } else if (cell === '/') {
      cache[cacheKey(cell, beam)] = true
      if (beam.dx > 0) {
        beam.dx = 0
        beam.dy = -1
      } else if (beam.dx < 0) {
        beam.dx = 0
        beam.dy = 1
      } else if (beam.dy > 0) {
        beam.dx = -1
        beam.dy = 0
      } else if (beam.dy < 0) {
        beam.dx = 1
        beam.dy = 0
      }
    }
    forward(beam)

    if (!(beam.x >= 0 && beam.x < input.width && beam.y >= 0 && beam.y < input.height)) {
      break
    }
  }
  return Object.keys(energized).length
}

const part1 = async () => {
  const input = parseInput()

  const startBeam = { dx: 1, dy: 0, x: 0, y: 0 }
  const energized: Record<string, boolean> = {}

  const cache = {}
  const res = traverse(input, startBeam, energized, cache)

  updateView(input, energized)

  result.value = res
}

const part2 = () => {
  const input = parseInput()

  const amounts = []
  let cache = {}
  let energized: Record<string, boolean>
  for (let x = 0; x < input.width; ++x) {
    // Top edge
    energized = {}
    cache = {}
    amounts.push(traverse(input, { x, y: 0, dy: 1, dx: 0 }, energized, cache))
    // Bottom edge
    energized = {}
    cache = {}
    amounts.push(traverse(input, { x, y: input.height - 1, dy: -1, dx: 0 }, energized, cache))
  }
  for (let y = 0; y < input.height; ++y) {
    // Left edge
    energized = {}
    cache = {}
    amounts.push(traverse(input, { x: 0, y, dy: 0, dx: 1 }, energized, cache))
    // Right edge
    energized = {}
    cache = {}
    amounts.push(traverse(input, { x: input.width - 1, y, dy: 0, dx: -1 }, energized, cache))
  }

  result2.value = max(amounts)
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
    Day 16 part 1
    <AssertResult :expected="variant === 'test' ? 46 : undefined" :value="result" />
    part 2: {{ result2 }}
    <Day16Beams :view="view" />
  </div>
</template>
