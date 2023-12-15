<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { sum } from 'lodash/fp'
import { X509Certificate } from 'crypto'
import { convertCompilerOptionsFromJson } from 'typescript'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

const parseInput = (part2 = false) => {
  const data = props.data.trim().split(',')
  if (!part2) {
    return data
  }
  return data.map((x) => {
    let s = x.split('=')
    if (s.length > 1) {
      return {
        label: s[0],
        focalLength: Number(s[1])
      }
    } else {
      s = x.split('-')
      return {
        label: s[0],
        focalLength: undefined
      }
    }
  })
}

const hash = (s: string) => {
  let value = 0
  for (let i = 0, len = s.length; i < len; i++) {
    let chr = s.charCodeAt(i)
    value += chr
    value *= 17
    value %= 256
  }
  return value
}

const part1 = () => {
  const input = parseInput()
  result.value = sum(input.map((x) => hash(x)))
}

const part2 = () => {
  const input = parseInput(true) as Array<{ label: string; focalLength?: number }>

  const hashMap: Record<number, Array<{ label: string; focalLength: number }>> = {}
  input.forEach((x) => {
    const box = hash(x.label)
    if (typeof x.focalLength === 'number') {
      // case '='
      if (!hashMap[box]) {
        hashMap[box] = []
      }

      const i = hashMap[box].findIndex((n) => n.label === x.label)
      if (i > -1) {
        // found, replace
        hashMap[box][i].focalLength = x.focalLength
        hashMap[box][i].label = x.label
      } else {
        hashMap[box].push({ label: x.label, focalLength: x.focalLength })
      }
    } else {
      // case '-'
      if (hashMap[box]) {
        hashMap[box] = hashMap[box].filter((n) => n.label !== x.label)
      }
    }
    return box
  })

  result2.value = Object.entries(hashMap).reduce((acc, curr) => {
    const box = Number(curr[0])
    const lenses = curr[1].map((lens, i) => (box + 1) * (i + 1) * lens.focalLength)
    return acc + sum(lenses)
  }, 0)
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
    Day 15 part 1
    <AssertResult pretty :expected="variant === 'test' ? 1320 : undefined" :value="result" />
    part2: <AssertResult pretty :expected="0" :value="result2" />
  </div>
</template>
