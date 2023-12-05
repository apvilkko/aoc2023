<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { splitLines, splitMultilines, splitNumbers } from '@/lib/helpers'
import { filter, flow, map, min, reduce } from 'lodash/fp'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

type RangeDef = { destination: number; source: number; len: number }
type RangeMap = Record<string, RangeDef[]>

const mapValue = (x: number, ranges: RangeDef[]) => {
  for (let i = 0; i < ranges.length; ++i) {
    const { source, destination, len } = ranges[i]
    if (x >= source && x < source + len) {
      return x + (destination - source)
    }
  }
  return x
}

const mapRanges = (x: [number, number], ranges: RangeDef[]) => {
  for (let i = 0; i < ranges.length; ++i) {
    const { source, destination, len } = ranges[i]
    const x0 = x[0]
    const x1 = x[0] + x[1]

    if (x0 >= source && x1 < source + len) {
      // Is fully contained in range
      // source  x0  x1  source+len
      return [x0 + (destination - source), x[1]]
    } else if (x0 >= source && x0 < source + len && x1 >= source + len) {
      // Numbers start overlaps range
      // source  x0  source+len  x1
      const overlapLen = source + len - x0
      const x0t = x0 + (destination - source)
      return [
        // Transformed section that overlaps range
        [x0t, overlapLen],
        // Unchanged section
        [x0 + overlapLen, x[1] - overlapLen]
      ]
    } else if (x0 < source && x1 >= source && x1 < source + len) {
      // Numbers end overlaps range
      // x0  source  x1  source+len
      const overlapLen = x1 - source
      return [
        // Transformed section that overlaps range
        [destination, overlapLen],
        // Unchanged section
        [x0, source - x0]
      ]
    } else if (source > x0 && source + len < x1) {
      // Range fully contained in numbers
      // x0  source  source+len  x1
      return [
        // Beginning untranslated
        [x0, source - x0],
        // Translated
        [destination, len],
        // End untranslated
        [source + len, x1 - (source + len)]
      ]
    } else {
      //console.log('unhandled', x, ranges[i])
    }
  }
  return x
}

let seeds: number[] = []
let seedRanges: Array<[number, number]> = []

const maps: RangeMap = flow([
  splitMultilines,
  map((item: string) => {
    const items = splitLines(item)
    const line = item.split(':')
    const name = line[0].replace(' map', '')
    let ranges = []
    if (items.length > 1) {
      ranges = items.slice(1).map((x) => {
        const s = splitNumbers(x)
        return { destination: s[0], source: s[1], len: s[2] }
      })
      return [name, ranges]
    } else {
      seeds = splitNumbers(line[1])
      for (let i = 0; i < seeds.length; i += 2) {
        seedRanges.push([seeds[i], seeds[i + 1]])
      }
    }
    return undefined
  }),
  filter((x) => !!x),
  reduce((acc, curr: [string, RangeDef[]]) => {
    acc[curr[0]] = curr[1]
    return acc
  }, {} as RangeMap)
])(props.data)

const part1 = () => {
  Object.keys(maps).forEach((mapName) => {
    seeds = seeds.map((x) => mapValue(x, maps[mapName]))
  })

  result.value = min(seeds)
}

const flattenIfNested = (arr: Array<unknown[]>) => {
  const out = []
  arr.forEach((item) => {
    if (Array.isArray(item[0])) {
      item.forEach((inner) => {
        out.push(inner)
      })
    } else {
      out.push(item)
    }
  })
  return out
}

const part2 = () => {
  Object.keys(maps).forEach((mapName) => {
    seedRanges = seedRanges.map((x) => mapRanges(x, maps[mapName]))
    seedRanges = flattenIfNested(seedRanges).filter((x) => x[1] !== 0)
  })

  result2.value = min(seedRanges.map((x) => x[0]))
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
    Day 05 part 1
    <AssertResult :expected="variant === 'test' ? 35 : undefined" :value="result" />
    part 2 <AssertResult :expected="variant === 'test' ? 46 : undefined" :value="result2" />
  </div>
</template>
