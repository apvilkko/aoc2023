<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { splitLines, splitNumbers } from '@/lib/helpers'
import {
  flow,
  head,
  last,
  map,
  max,
  split,
  sum,
  take,
  trimCharsEnd,
  trimCharsStart
} from 'lodash/fp'

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

const getKey = (row: string, counts: number[]) => `${row} ${counts.join(',')}`

function count(row: string, counts: number[], cache: Record<string, number>, level = 0) {
  const r = trimCharsStart(OPERATIONAL)(trimCharsEnd(OPERATIONAL)(row))

  const key = getKey(r, counts)

  const cacheValue = cache[key]
  if (cacheValue) {
    //console.log('  <- cache', cacheValue)
    return cacheValue
  }

  //console.log('count', r, counts, level)
  if (r.length === 0 && counts.length === 0) {
    //console.log('  end')
    return 1
  }
  if (r.length === 0 || counts.length === 0) {
    //console.log('  terminate')
    return 0
  }
  if (r.length < sum(counts) + (counts.length - 1)) {
    //console.log('  sanity check')
    cache[key] = 0
    return 0
  }

  const rs = r.split('')
  const unknownCount = rs.filter((x) => x === UNKNOWN).length
  const damagedCount = rs.filter((x) => x === DAMAGED).length
  if (
    r.length === counts[0] &&
    counts.length === 1 &&
    unknownCount + damagedCount === rs.length &&
    damagedCount > 0
  ) {
    // only one way to place this
    //console.log('  end checking')
    cache[key] = 1
    return 1
  }

  const maxCountLen = max(counts) as number
  const matches = r.matchAll(/#+/g)
  for (const match of matches) {
    const matchLen = match[0].length
    if (matchLen > maxCountLen) {
      // doesn't fit
      cache[key] = 0
      return 0
    }
    if (match.index === 0 && counts[0] < matchLen) {
      cache[key] = 0
      return 0
    }
  }

  let c = 0

  let matched = false
  for (let i = 0; i < counts[0]; ++i) {
    const chars = r.slice(i, counts[0] + i).split('')
    if (
      chars.every((x) => x === DAMAGED || x === UNKNOWN) &&
      (r[counts[0] + i] !== DAMAGED || counts[0] + i > r.length - 1)
    ) {
      //console.log('  recursing to', r.slice(counts[0] + i), level)
      matched = true
      // path of placing the count item here
      const newRow = r.slice(counts[0] + i + 1)
      const newCounts = counts.slice(1)
      //console.log('  new row', newRow.length, newCounts[0])
      c += count(newRow, newCounts, cache, level + 1)
      if (chars[0] === DAMAGED) {
        // this spot needs to be filled, go no further with this count
        break
      }
      if (chars[0] === UNKNOWN) {
        // path of NOT placing the item, only if possible
        //console.log('  taking unknown path', chars[0], r, i)
        c += count(r.slice(counts[0] + i), counts, cache, level + 1)
      }
    }
  }
  if (!matched) {
    //console.log('  advancing to', r.slice(1))
    c += count(r.slice(1), counts, cache)
  }

  cache[key] = c

  return c
}

// initialize some combinations
const initCache = () => {
  return {
    '?? 1': 2,
    '??? 1': 3,
    '???? 1': 4,
    '??? 2': 2,
    '???? 2,1': 1,
    '???? 1,2': 1
  }
}

const part1 = () => {
  const input = parseInput()

  const cache = initCache()
  const combinations = input.map((x) => {
    const res = count(x.row.join(''), x.counts, cache)
    return res
  })
  result.value = sum(combinations)
  //result.value = combinations
}
const part2 = () => {
  const input = parseInput()

  const unfolded = input.slice(5, 6).map((x) => {
    const row = Array.from({ length: 5 }).flatMap(() => [...x.row, '?'])
    return {
      counts: Array.from({ length: 5 }).flatMap(() => x.counts),
      row: take(row.length - 1)(row)
    }
  })

  const cache = initCache()
  const combinations = unfolded.map((x) => {
    const res = count(x.row.join(''), x.counts, cache)

    return res
  })
  console.log(cache)

  //result2.value = sum(combinations)
  result2.value = combinations
}

const run = () => {
  //part1()
  part2()
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
