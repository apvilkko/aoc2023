<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { splitLines } from '@/lib/helpers'
import { clone, filter, flow, intersection, last, map, split, sum, trim } from 'lodash/fp'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

type CardRow = { id: string; mine: number[]; winning: number[] }

let amountOfWins: Record<string, number> = {}

const cards = flow([
  map(
    flow([
      split(':'),
      (line) => {
        const nums = flow([
          split('|'),
          map(flow([trim, split(' '), map(trim), filter((x) => !!x), map((x) => Number(x))]))
        ])(line[1])
        return {
          id: last(line[0].split(' ')),
          mine: nums[1],
          winning: nums[0]
        }
      }
    ])
  )
])(splitLines(props.data)) as CardRow[]

const part1 = () => {
  amountOfWins = {}
  result.value = cards.reduce((acc: number, curr) => {
    const value = intersection(curr.mine)(curr.winning).length
    // pre-calculate for part 2
    amountOfWins[curr.id] = value
    return acc + (value === 0 ? 0 : Math.pow(2, value - 1))
  }, 0)
}

const part2 = () => {
  const amounts = [
    cards.reduce(
      (acc, curr) => {
        acc[String(curr.id)] = 1
        return acc
      },
      {} as Record<string, number>
    )
  ]

  let round = 0
  const sums = clone(amounts[0])

  while (true) {
    if (!amounts[round]) {
      break
    }
    Object.keys(amounts[round]).forEach((id) => {
      const amountOfCards = amounts[round][id]
      const winAmount = amountOfWins[id]
      const nid = Number(id)
      for (let i = nid + 1; i <= nid + winAmount; ++i) {
        if (amounts.length <= round + 1) {
          amounts.push({})
        }
        if (typeof amounts[round + 1][i] === 'undefined') {
          amounts[round + 1][i] = 0
        }
        amounts[round + 1][i] += amountOfCards
        sums[i] += amountOfCards
      }
    })
    round++
  }

  result2.value = sum(Object.values(sums))
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
    Day 04 part 1
    <AssertResult :expected="variant === 'test' ? 13 : undefined" :value="result" />
    part 2: {{ result2 }}
  </div>
</template>
