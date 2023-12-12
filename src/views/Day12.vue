<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { splitLines, splitNumbers } from '@/lib/helpers'
import { flow, head, last, map, max, split, sum, take } from 'lodash/fp'

const props = defineProps<{ data: string; variant: string }>()

const OPERATIONAL = '.'
const DAMAGED = '#'
const UNKNOWN = '?'

const result = ref()
const result2 = ref()

type Item = { row: string[]; counts: number[] }

const parseInput = (): Item[] =>
  flow([
    splitLines,
    map(
      flow([split(' '), (pair) => ({ row: pair[0].split(''), counts: splitNumbers(pair[1], ',') })])
    )
  ])(props.data)

const CHARS = [DAMAGED, OPERATIONAL]

const matchesCounts = (row: string, counts: number[]) => {
  //console.log('matchesCounts', row, counts)
  const matches = row.matchAll(/#+/g)
  let countIndex = 0
  for (const match of matches) {
    //console.log('  match', match[0].length, counts[countIndex])
    if (counts[countIndex] !== match[0].length) {
      return false
    }
    countIndex++
  }
  if (countIndex !== counts.length) {
    return false
  }
  return true
}

const createRegex = (i: number) => [new RegExp(`^\\.*#{${i},}`), new RegExp(`#{${i},}\\.*$`)]

const tests = Array.from({ length: 8 }).map((_, i) => createRegex(i + 2))

const sanityCheck = (row: string, maxCount: number, countSum: number, counts: number[]) => {
  const matches = row.matchAll(/#+/g)
  let totalChars = 0
  for (const match of matches) {
    const len = match[0].length
    if (len > maxCount) {
      return false
    }
    totalChars += len
  }
  if (totalChars > countSum) {
    return false
  }
  const c0 = head(counts)
  const c1 = last(counts)
  for (let i = 0; i < tests.length; ++i) {
    if (tests[i][0].test(row) && c0 === i + 1) {
      return false
    }
    if (tests[i][1].test(row) && c1 === i + 1) {
      return false
    }
  }

  return true
}

const getCombinations = (x: Item) => {
  const maxCount = max(x.counts) as number
  const countSum = sum(x.counts)
  console.log('getCombinations', x.row.join(''), x.counts)
  const initialRow = [...x.row]
  const firstCount = x.counts[0]
  if (initialRow[0] === DAMAGED && firstCount > 1) {
    for (let i = 1; i < firstCount; ++i) {
      initialRow[i] = DAMAGED
    }
    console.log('  pre-fixed', initialRow.join(''))
  }
  const lastCount = last(x.counts) as number
  if (last(initialRow) === DAMAGED && lastCount > 1) {
    for (let i = initialRow.length - 2; i >= initialRow.length - lastCount; --i) {
      initialRow[i] = DAMAGED
    }
    console.log('  pre-fixed', initialRow.join(''))
  }

  let possibles = [initialRow]
  let pushes = 0
  let fails = 0

  while (possibles.length && possibles[0].some((x) => x === UNKNOWN)) {
    const firstUnknown = possibles[0].findIndex((x) => x === UNKNOWN)
    CHARS.forEach((c) => {
      const row = [
        ...possibles[0].slice(0, firstUnknown),
        c,
        ...possibles[0].slice(firstUnknown + 1)
      ]
      if (sanityCheck(row.join(''), maxCount, countSum, x.counts)) {
        //console.log('pushing', row.join(''))
        possibles.push(row)
        pushes++
      } else {
        //console.log('  fails sanity check', row.join(''))
        fails++
      }
    })
    possibles.shift()
  }
  console.log('pushes', pushes, 'fails', fails, ((fails / pushes) * 100).toFixed(2))

  possibles = possibles.map((x) => x.join('')).filter((row) => matchesCounts(row, x.counts))

  return possibles.length
}

const getCombinations2 = (x: Item) => {
  // start with minimum length for counts
  const len = sum(x.counts) + x.counts.length - 1
  let out = 1
  console.log('start', out, x.row.length, x.counts.length)
  for (let i = len; i < x.row.length; ++i) {
    // each increase in row size multiplies previous combinations by counts length + 1
    out *= x.counts.length + 1
    console.log('  after', i, out)
  }
  return out
}

const part1 = () => {
  const input = parseInput()
  const combinations = input.map((x) => getCombinations2(x))
  //result.value = sum(combinations)
  result.value = combinations
}
const part2 = () => {
  const input = parseInput()

  const unfolded = input.map((x) => {
    const row = Array.from({ length: 5 }).flatMap(() => [...x.row, '?'])
    return {
      counts: Array.from({ length: 5 }).flatMap(() => x.counts),
      row: take(row.length - 1)(row)
    }
  })

  const combinations = unfolded.map((x) => getCombinations2(x))

  //result2.value = sum(combinations)
  result2.value = combinations
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
    Day NN part 1
    <AssertResult pretty :expected="variant === 'test' ? 21 : undefined" :value="result" />
    part 2: {{ result2 }}
  </div>
</template>
