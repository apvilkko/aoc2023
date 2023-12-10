<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { flow, map } from 'lodash/fp'
import { splitLines } from '@/lib/helpers'
import { PipeMap, directions, type Nmc, MapCell, dirMap } from './day10'
import Day10PipeMap from './Day10PipeMap.vue'

const props = defineProps<{ data: string; variant: string }>()

const inputMap: Record<string, [string, string]> = {
  '|': ['n', 's'],
  L: ['n', 'e'],
  F: ['e', 's'],
  '7': ['w', 's'],
  '-': ['e', 'w'],
  J: ['n', 'w']
}

const parseMap = () =>
  new PipeMap(
    flow([splitLines, map((line: string) => map((c: string) => inputMap[c] || c)(line))])(
      props.data
    )
  )

const result = ref()
const result2 = ref()

const pipeMap = shallowRef<PipeMap>()

const isCell = (x: Nmc): x is MapCell => !!x && typeof x !== 'boolean'

type CoordLike = { x: number; y: number }
const getKey = (o: CoordLike) => `${o.x},${o.y}`

const bfs = (g: PipeMap, startCell: MapCell, target: MapCell) => {
  //console.log('bfs', startCell.coords, target.coords)
  let visited: Record<string, boolean> = {}
  let q: MapCell[] = [startCell]
  visited[getKey(startCell)] = true

  while (q.length > 0) {
    const v = q.shift()
    if (getKey(v) === getKey(target)) {
      //console.log('reached target')
      return v
    }
    dirMap.forEach((dm) => {
      const [d, _, dx, dy] = dm
      const x1 = v.x + dx
      const y1 = v.y + dy
      const adjV = g.getAt(x1, y1)
      if (v[d] && isCell(adjV) && !visited[getKey(adjV)]) {
        visited[getKey(adjV)] = true
        adjV.parent = v
        q.push(adjV)
      }
    })
  }
  return undefined
}

const markLoopAndGetMaxLen = () => {
  pipeMap.value = parseMap()
  const startCell = pipeMap.value.getIndex(pipeMap.value.startIndex)
  let curr = startCell
  startCell.value = 1
  const visited = [curr]

  const loopCells = []

  while (true) {
    let moved = false
    for (let i = 0; i < directions.length; ++i) {
      const d = directions[i]
      if (isCell(curr[d]) && !visited.includes(curr[d])) {
        curr = curr[d]
        loopCells.push(curr)
        visited.push(curr)
        moved = true
        break
      }
    }
    if (!moved) {
      break
    }
  }

  let maxLen = 0

  loopCells.forEach((cell) => {
    const res = bfs(pipeMap.value, cell, startCell)
    let curr = res
    let len = 1
    for (; ; ++len) {
      curr = curr.parent
      if (!curr || getKey(curr) === getKey(cell) || len > 100000) {
        break
      }
    }
    cell.value = len
    if (len > maxLen) {
      maxLen = len
    }
  })
}

const part1 = () => {
  result.value = markLoopAndGetMaxLen()
}

const numIntersections = (cell: MapCell) => {
  const p = pipeMap.value!
  const x0 = cell.x
  const y0 = cell.y
  const len = p.rowLen
  let lastValue = Number.MIN_VALUE
  let entryDir
  let intersections = 0
  for (let i = x0 + 1; i < len; ++i) {
    const c = p.getAt(i, y0)
    const value = c.value
    const hasSameEntry = (c.n && entryDir === 'n') || (c.s && entryDir === 's')
    if ((value > 1 && value === lastValue) || c.w === p.getAt(i - 1, y0)) {
      // same edge
      if (hasSameEntry) {
        //console.log('exits same way')
      } else if (c.n || c.s) {
        //console.log('adding intersection')
        intersections++
      }
    } else if (value !== 0) {
      if (!c.e && !hasSameEntry) {
        //console.log('does not continue, adding')
        intersections++
      } else {
        if (c.n && c.s) {
          //console.log('vertical intersection')
          intersections++
        } else {
          // remember entry direction
          entryDir = c.n ? 'n' : 's'
        }
      }
    }
    lastValue = value
  }
  return intersections
}

const part2 = () => {
  markLoopAndGetMaxLen()
  const p = pipeMap.value

  // remove any pipes not in the loop
  for (let y = 0; y < p.height; ++y) {
    for (let x = 0; x < p.rowLen; ++x) {
      const c = p.getAt(x, y)
      if (c.value === 0) {
        c.w = undefined
        c.e = undefined
        c.n = undefined
        c.s = undefined
      }
    }
  }

  const insides = []
  for (let y = 0; y < p.height; ++y) {
    for (let x = 0; x < p.rowLen; ++x) {
      const cell = p.getAt(x, y)
      if (cell.value === 0) {
        if (numIntersections(cell) % 2 === 1) {
          insides.push(cell.coords)
          p.getAt(x, y).value = 'I'
        }
      }
    }
  }

  result2.value = insides.length
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
    Day 10 part 1
    <AssertResult :expected="variant === 'test' ? 4 : undefined" :value="result" />
    <div style="margin-top: 1em; margin-bottom: 1em">
      <Day10PipeMap :data="pipeMap" />
    </div>
    part 2: {{ result2 }}
  </div>
</template>
