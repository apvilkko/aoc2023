<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { splitLines } from '@/lib/helpers'
import { Grid2d } from '@/lib/grid2d'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

const parseInput = () => new Grid2d(splitLines(props.data))

type Coords = [number, number]

const coordKey = (pos: Coords) => `${pos[0]},${pos[1]}`

const directions = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0]
]

const bfs = (input: Grid2d, visited: Record<string, boolean>, pathLen: number) => {
  const start = input.find('S')
  visited[coordKey(start)] = false

  const path: Coords[] = []
  //const q: Array<[Coords, Coords[]]> = [[start, [...path]]]
  const q: Array<[Coords, number]> = [[start, 0]]

  while (q.length > 0) {
    const v = q.shift()!
    for (let i = 0; i < directions.length; ++i) {
      const [dx, dy] = directions[i]
      const x1 = v[0][0] + dx
      const y1 = v[0][1] + dy
      const cell = input.getAt(x1, y1)
      if (typeof cell === 'undefined' || cell === '#') {
        continue
      }
      const coords: Coords = [x1, y1]
      const key = coordKey(coords)

      if (v[1] + 1 === pathLen) {
        visited[key] = true
      }

      if (v[1] <= pathLen) {
        //visited[key] = true
        //const newPath = [...v[1], coords]
        q.push([coords, v[1] + 1])
      }
    }
  }
  return Object.keys(visited).length
}

const view = ref<string[][]>([])

const updateView = (input: Grid2d, visited: Record<string, boolean>) => {
  const out = []
  for (let y = 0; y < input.height; ++y) {
    out.push(
      input.rows[y].split('').map((c, x) => {
        return {
          cell: c,
          visited: visited[coordKey([x, y])]
        }
      })
    )
  }
  view.value = out
}

const part1 = () => {
  const input = parseInput()
  const visited: Record<string, boolean> = {}
  const res = bfs(input, visited, 6)
  updateView(input, visited)
  result.value = res
}

const part2 = () => {
  result2.value = 0
}

const run = () => {
  part1() // 1055 too low
  part2()
}

run()
</script>
<template>
  <button @click="run">Run</button>
  <div>
    Day 21 part 1
    <AssertResult pretty :expected="variant === 'test' ? 13 : undefined" :value="result" />
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
