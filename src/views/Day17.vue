<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { Grid2dGeneric } from '@/lib/grid2d'
import { splitLines } from '@/lib/helpers'
import { last, takeRight } from 'lodash/fp'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

const parseInput = () =>
  new Grid2dGeneric(splitLines(props.data).map((line) => line.split('').map((x) => Number(x))))

const MAX_MOVES_IN_DIRECTION = 3

const coordKey = (x: number, y: number) => `${x},${y}`

const directions = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0]
]

const view = ref<string[][]>([])

const updateView = (input: Grid2dGeneric, visited: Record<string, boolean>) => {
  const out = []
  for (let y = 0; y < input.height; ++y) {
    out.push(
      input.rows[y].map((c, x) => {
        return {
          cell: c,
          visited: visited[coordKey(x, y)]
        }
      })
    )
  }
  view.value = out
}

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined)
    }, ms)
  })

const dijkstra = async (
  input: Grid2dGeneric,
  start: [number, number],
  target: [number, number]
) => {
  let finished = false
  const visited: Record<string, boolean> = {}
  let x = start[0]
  let y = start[1]
  const distMap = input.clone(Number.MAX_VALUE)
  distMap.setAt(start[0], start[1], 0)
  const originMap = new Grid2dGeneric<[number, number]>(
    Array.from({ length: input.height }).map(() =>
      Array.from({ length: input.width }).map(() => [-1, -1])
    )
  )
  let forbiddenDirection = [-1, -1]

  while (!finished) {
    for (let i = 0; i < directions.length; ++i) {
      const [dx, dy] = directions[i]
      if (forbiddenDirection[0] === dx && forbiddenDirection[1] === dy) {
        //console.log('forbidden to go to', dx, dy)
        continue
      }
      const x1 = x + dx
      const y1 = y + dy
      //console.log('trying', x1, y1)
      const k = coordKey(x1, y1)
      const outOfBounds = x1 < 0 || x1 >= input.width || y1 < 0 || y1 >= input.height
      const value = input.getAt(x1, y1) + distMap.getAt(x, y)
      const larger = distMap.getAt(x1, y1) > value
      if (!visited[k] && !outOfBounds && larger) {
        distMap.setAt(x1, y1, value)
        originMap.setAt(x1, y1, [x, y])
      }
    }
    forbiddenDirection = [-1, -1]
    visited[coordKey(x, y)] = true
    updateView(input, visited)
    await sleep(10)

    let minX = -1,
      minY = -1,
      minValue = Number.MAX_VALUE
    for (let x = 0; x < input.width; ++x) {
      for (let y = 0; y < input.height; ++y) {
        if (!visited[coordKey(x, y)]) {
          const val = distMap.getAt(x, y) as number
          if (val < minValue) {
            minValue = val
            minX = x
            minY = y
          }
        }
      }
    }
    x = minX
    y = minY

    let v = [x, y]
    const history = [[x, y, 0, 0]]
    for (let i = 0; i < MAX_MOVES_IN_DIRECTION; ++i) {
      v = originMap.getAt(v[0], v[1])
      if (v[0] === -1) {
        break
      }
      const l = last(history)
      history.push([v[0], v[1], l[0] - v[0], l[1] - v[1]])
    }

    //console.log('moving to', x, y, JSON.stringify(history), originMap.getAt(x, y))
    const arr = takeRight(MAX_MOVES_IN_DIRECTION - 1)(history)
    if (
      history.length >= MAX_MOVES_IN_DIRECTION - 1 &&
      arr.every((n) => n[2] === arr[0][2] && n[3] === arr[0][3])
    ) {
      forbiddenDirection = [arr[0][2], arr[0][3]]
    }
    if (target[0] === x && target[1] === y) {
      console.log('finished')
      finished = true
    }
  }
  return originMap
}

const part1 = async () => {
  const input = parseInput()
  const end = [input.width - 1, input.height - 1]
  const start = [0, 0]
  const originMap = await dijkstra(input, start, end)
  let c = end
  let cost = input.getAt(c[0], c[1])
  const visited = {}
  while (true) {
    c = originMap.getAt(c[0], c[1])
    if (c[0] === -1) {
      break
    }
    visited[coordKey(c[0], c[1])] = true
    if (c[0] !== start[0] && c[1] !== start[1]) {
      cost += input.getAt(c[0], c[1])
    }
  }
  updateView(input, visited)
  result.value = cost
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
    Day 17 part 1
    <AssertResult :expected="variant === 'test' ? 13 : undefined" :value="result" />
    part 2: {{ result2 }}
    <div class="table">
      <div class="row" v-for="row in view">
        <div :class="['cell', { visited: cell.visited }]" v-for="cell in row">{{ cell.cell }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table {
  display: flex;
  flex-direction: column;
}
.row {
  display: flex;
  flex-direction: row;
}
.cell {
  height: 1.5em;
  width: 1.5em;
}
.visited {
  background: blue;
}
</style>
