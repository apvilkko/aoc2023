<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { splitLines } from '@/lib/helpers'
import { Grid2d } from '@/lib/grid2d'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

const ROUND = 'O'
const EMPTY = '.'

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT
}

const dirMap: Record<Direction, [number, number]> = {
  [Direction.UP]: [0, -1],
  [Direction.DOWN]: [0, 1],
  [Direction.LEFT]: [-1, 0],
  [Direction.RIGHT]: [1, 0]
}

const parseInput = () => new Grid2d(splitLines(props.data))

const tilt = (grid: Grid2d, direction: Direction) => {
  const [dx, dy] = dirMap[direction]

  const y0 = dy === -1 ? grid.height - 1 : 0
  const x0 = dx === -1 ? grid.width - 1 : 0

  if (y0 !== 0 && dx === 0) {
    let found
    do {
      found = false
      for (let x = 0; x < grid.width; ++x) {
        for (let y = grid.height - 1; y >= 0; --y) {
          if (grid.getAt(x, y) === ROUND && grid.getAt(x, y - 1) === EMPTY) {
            found = true
            grid.setAt(x, y, EMPTY)
            grid.setAt(x, y - 1, ROUND)
          }
        }
      }
    } while (found)
  } else if (y0 === 0 && dx === 0) {
    let found
    do {
      found = false
      for (let x = 0; x < grid.width; ++x) {
        for (let y = 0; y < grid.height; ++y) {
          if (grid.getAt(x, y) === ROUND && grid.getAt(x, y + 1) === EMPTY) {
            found = true
            grid.setAt(x, y, EMPTY)
            grid.setAt(x, y + 1, ROUND)
          }
        }
      }
    } while (found)
  } else if (x0 !== 0 && dy === 0) {
    let found
    do {
      found = false
      for (let y = 0; y < grid.height; ++y) {
        for (let x = grid.width - 1; x >= 0; --x) {
          if (grid.getAt(x, y) === ROUND && grid.getAt(x - 1, y) === EMPTY) {
            found = true
            grid.setAt(x, y, EMPTY)
            grid.setAt(x - 1, y, ROUND)
          }
        }
      }
    } while (found)
  } else if (x0 === 0 && dy === 0) {
    let found
    do {
      found = false
      for (let y = 0; y < grid.height; ++y) {
        for (let x = 0; x < grid.width; ++x) {
          if (grid.getAt(x, y) === ROUND && grid.getAt(x + 1, y) === EMPTY) {
            found = true
            grid.setAt(x, y, EMPTY)
            grid.setAt(x + 1, y, ROUND)
          }
        }
      }
    } while (found)
  }
}

const calculateLoads = (grid: Grid2d) => {
  let sum = 0
  for (let y = 0; y < grid.height; ++y) {
    const mult = grid.height - y
    sum += mult * grid.filterRow(y, (x) => x === ROUND).length
  }
  return sum
}

const part1 = () => {
  const grid = parseInput()

  tilt(grid, Direction.UP)

  result.value = calculateLoads(grid)
}

const fastHash = (str: string) => {
  let hash = 0
  for (let i = 0, len = str.length; i < len; i++) {
    let chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0
  }
  return hash
}

const part2 = () => {
  const grid = parseInput()

  const cycle = [Direction.UP, Direction.LEFT, Direction.DOWN, Direction.RIGHT]

  const hashes: Record<number, number> = {}
  let cycleLen = 0
  let cycleIndex = 0
  const targetAmount = 1000000000
  for (let i = 0; i < 1000; ++i) {
    cycle.forEach((c) => {
      tilt(grid, c)
      const hash = fastHash(grid.flatten())
      if (typeof hashes[hash] !== 'undefined') {
        cycleLen = i - hashes[hash]
        cycleIndex = i
        console.log('found', hash, hashes[hash], i, cycleLen, i % cycleLen, targetAmount % cycleLen)
        if (i % cycleLen === (targetAmount % cycleLen) - 1) {
          // read the answer from console log, it's the smaller load :)
          console.log('load', calculateLoads(grid))
        }
      }
      hashes[hash] = i
    })
  }

  result2.value = [cycleLen, cycleIndex]
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
    Day 14 part 1
    <AssertResult :expected="variant === 'test' ? 136 : undefined" :value="result" />
    part 2:
    <AssertResult :expected="0" :value="result2" />
  </div>
</template>
