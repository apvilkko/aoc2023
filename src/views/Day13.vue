<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { splitLines, splitMultilines } from '@/lib/helpers'
import { sum } from 'lodash/fp'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

const parseInput = () => {
  const patterns = splitMultilines(props.data).map((x) => splitLines(x))
  return patterns
}

type Pattern = string[]

const checkMirrorRow = (row: number, data: Pattern) => {
  //console.log('checkMirrorRow', row, data[row])
  let i = row
  let j = row + 1
  let r1 = data[i]
  let r2 = data[j]
  while (true) {
    //console.log('  comparing', i, j, r1, r2)
    if (r1 && r2 && r1 !== r2) {
      //console.log('  NOPE')
      return false
    }
    i--
    j++
    if (i < 0 || j >= data.length) {
      break
    }
    r1 = data[i]
    r2 = data[j]
  }
  return true
}

const getColumn = (x: number, data: Pattern) => data.map((n) => n[x]).join('')

const checkMirrorCol = (col: number, data: Pattern, debug = false) => {
  if (debug) console.log('checkMirrorCol', col)
  let i = col
  let j = col + 1
  let r1 = getColumn(i, data)
  let r2 = getColumn(j, data)
  while (true) {
    if (debug) console.log('  comparing col', i, j, r1, r2)
    if (r1 && r2 && r1 !== r2) {
      if (debug) console.log('  NOPE')
      return false
    }
    i--
    j++
    if (i < 0 || j >= data[0].length) {
      break
    }
    r1 = getColumn(i, data)
    r2 = getColumn(j, data)
  }
  return true
}

const searchHorizontal = (data: Pattern, forbidden?: number) => {
  //console.log('searchHorizontal', data[0])
  for (let y = 0; y < data.length; ++y) {
    const line = data[y]

    for (let y1 = data.length - 1; y1 > y; y1--) {
      let index = -1
      const candidate = data[y1]
      if (line === candidate) {
        //console.log('  h matches', y, y1, line)
        index = y1
      }
      if (index > -1) {
        const row = Math.abs(index - y) === 1 ? y : Math.ceil(y + (index - y) / 2)
        if (row !== forbidden && checkMirrorRow(row, data)) {
          return row
        }
      }
    }
  }
  return -1
}

const searchVertical = (data: Pattern, forbidden?: number, debug = false) => {
  if (debug) console.log('searchVertical', data[0])
  for (let x = 0; x < data[0].length; ++x) {
    const col = getColumn(x, data)

    for (let x1 = data[0].length - 1; x1 > x; x1--) {
      let index = -1
      const candidate = getColumn(x1, data)
      if (debug) console.log('  col', col, 'cand', candidate)
      if (col === candidate) {
        if (debug) console.log('  v matches', x, x1, col)
        index = x1
      }
      if (index > -1) {
        const col = Math.abs(index - x) === 1 ? x : Math.ceil(x + (index - x) / 2)
        if (col !== forbidden && checkMirrorCol(col, data, debug)) {
          return col
        }
      }
    }
  }
  return -1
}

const findDifferent = (data: Pattern, knownSolutions: { h: number; v: number }) => {
  for (let y = 0; y < data.length; ++y) {
    for (let x = 0; x < data[0].length; ++x) {
      const oldChar = data[y][x]
      const newChar = data[y][x] === '.' ? '#' : '.'
      data[y] = data[y].slice(0, x) + newChar + data[y].slice(x + 1)

      const h = searchHorizontal(data, knownSolutions.h)
      const v = searchVertical(data, knownSolutions.v)

      const checkH = h > -1 && knownSolutions.h !== h ? h : -1
      const checkV = v > -1 && knownSolutions.v !== v ? v : -1

      if (checkH > -1 || checkV > -1) {
        console.log('  solution', data[0], x, y, { h: checkH, v: checkV }, 'was', knownSolutions)
        return { h: checkH, v: checkV }
      }

      data[y] = data[y].slice(0, x) + oldChar + data[y].slice(x + 1)
    }
  }
  console.log('  no solution', data[0], 'was', knownSolutions)
  return { h: -1, v: -1 }
}

const part1 = () => {
  const res = parseInput().map((x) => {
    const h = searchHorizontal(x)
    const v = searchVertical(x)
    let ret = 0
    if (h > -1) {
      ret += (h + 1) * 100
    }
    if (v > -1) {
      ret += v + 1
    }
    return ret
    //return { h, v }
  })

  result.value = sum(res)
  //result.value = res
}

const part2 = () => {
  const input = parseInput()
  const known = input.map((x) => {
    const h = searchHorizontal(x)
    const v = searchVertical(x)
    return { h, v }
  })

  const res = input.map((x, i) => {
    const { h, v } = findDifferent(x, known[i])
    let ret = 0
    if (h > -1) {
      ret += (h + 1) * 100
    }
    if (v > -1) {
      ret += v + 1
    }
    return ret
    //return { h, v }
  })

  result2.value = sum(res)
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
    Day NN part 1
    <AssertResult pretty :expected="variant === 'test' ? 405 : undefined" :value="result" />
    part 2: {{ result2 }}
  </div>
</template>
