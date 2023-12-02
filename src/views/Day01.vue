<script setup lang="ts">
import { ref } from 'vue'
import { sum } from 'lodash/fp'
import { splitLines } from '@/lib/helpers'

const props = defineProps<{ data: string }>()

const result = ref()
const result2 = ref()

const part1 = () => {
  const numbers = splitLines(props.data).map((line: string) => {
    let first
    let last
    for (let i = 0; i < line.length; ++i) {
      if (/\d/.test(line[i])) {
        if (typeof first === 'undefined') {
          first = line[i]
        }
        last = line[i]
      }
    }
    return Number(`${first}${last}`)
  })
  result.value = sum(numbers)
}

const numberMap = 'one,two,three,four,five,six,seven,eight,nine'.split(',').reduce(
  (acc, curr, index) => {
    acc[curr] = index + 1
    return acc
  },
  {} as Record<string, number>
)

const textNumbers = Object.keys(numberMap)

const getTextNumber = (line: string, index: number) => {
  for (let i = 0; i < textNumbers.length; ++i) {
    const num = textNumbers[i]
    if (index + num.length <= line.length && line.slice(index, index + num.length) === num) {
      return numberMap[num]
    }
  }
  return undefined
}

const part2 = () => {
  const numbers = splitLines(props.data).map((line: string) => {
    let first
    let last
    for (let i = 0; i < line.length; ++i) {
      if (/\d/.test(line[i])) {
        if (typeof first === 'undefined') {
          first = line[i]
        }
        last = line[i]
      } else {
        const num = getTextNumber(line, i)
        if (typeof num !== 'undefined') {
          if (typeof first === 'undefined') {
            first = num
          }
          last = num
        }
      }
    }
    return Number(`${first}${last}`)
  })
  result2.value = sum(numbers)
}

const run = () => {
  part1()
  part2()
}

run()
</script>
<template>
  <button @click="run">Run</button>
  <div>Day 01 part 1: {{ result }}, part 2: {{ result2 }}</div>
</template>
