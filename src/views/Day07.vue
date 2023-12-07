<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { splitLines } from '@/lib/helpers'
import { flow, groupBy, identity, map, split, sum } from 'lodash/fp'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

const cards = 'AKQJT98765432'.split('')
const cards2 = 'AKQT98765432J'.split('')

enum HandType {
  FiveOfAKind = 0,
  FourOfAKind = 1,
  FullHouse = 2,
  ThreeOfAKind = 3,
  TwoPair = 4,
  OnePair = 5,
  HighCard = 6
}

const getHandType2 = (hand: string[]): HandType => {
  const groups = groupBy(identity)(hand)
  const jokerCount = (groups['J'] || []).length
  const values = Object.values(groups)
  const uniqs = values.length
  if (uniqs === 1 || (uniqs === 2 && jokerCount > 0)) {
    return HandType.FiveOfAKind
  }
  if (
    /* 3333? */
    (uniqs === 2 && values.some((x) => x.length === 4)) ||
    /* J333? */
    (uniqs === 3 && values.some((x) => x.length === 3) && jokerCount === 1) ||
    /* JJ33? */
    (uniqs === 3 && values.some((x) => x.length === 2) && jokerCount === 2) ||
    /* JJJ3? */
    (uniqs === 3 && values.some((x) => x.length === 1) && jokerCount === 3)
  ) {
    return HandType.FourOfAKind
  }
  const hasThree = values.some((x) => x.length === 3)
  const pairs = groupBy('length')(values)[2] || []
  if (
    /* 333KK */
    (uniqs === 2 && hasThree) ||
    /* J33KK */
    (pairs.length === 2 && jokerCount === 1) ||
    /* JJ3KK */
    (pairs.length === 2 && jokerCount === 2) ||
    /* JJJ3K */
    (pairs.length === 0 && jokerCount === 3)
  ) {
    return HandType.FullHouse
  }
  if (
    hasThree ||
    /* J33?? */
    (pairs.length === 1 && jokerCount === 1) ||
    /* JJ3?? */
    jokerCount === 2 ||
    jokerCount === 3
  ) {
    return HandType.ThreeOfAKind
  }

  if (
    pairs.length === 2 ||
    /* 33J?? */
    (pairs.length === 1 && jokerCount === 1)
  ) {
    return HandType.TwoPair
  }
  if (pairs.length === 1 || jokerCount === 1) {
    return HandType.OnePair
  }
  return HandType.HighCard
}

const getHandType = (hand: string[]): HandType => {
  const groups = groupBy(identity)(hand)
  const values = Object.values(groups)
  const uniqs = values.length
  if (uniqs === 1) {
    return HandType.FiveOfAKind
  }
  if (uniqs === 2 && values.some((x) => x.length === 4)) {
    return HandType.FourOfAKind
  }
  const hasThree = values.some((x) => x.length === 3)
  if (uniqs === 2 && hasThree) {
    return HandType.FullHouse
  }
  if (hasThree) {
    return HandType.ThreeOfAKind
  }
  const pairs = groupBy('length')(values)[2] || []
  if (pairs.length === 2) {
    return HandType.TwoPair
  }
  if (pairs.length === 1) {
    return HandType.OnePair
  }
  return HandType.HighCard
}

const sortHands = (arr: Array<[HandType, string[]]>, order: string[]) => {
  const a = [...arr]
  a.sort((a, b) => {
    if (a[0] === b[0]) {
      const h1 = a[1]
      const h2 = b[1]
      for (let i = 0; i < h1.length; ++i) {
        const v1 = order.indexOf(h1[i])
        const v2 = order.indexOf(h2[i])
        if (v1 < v2) return 1
        if (v1 > v2) return -1
      }
      return 0
    } else {
      if (a[0] > b[0]) return -1
      return 1
    }
  })
  return a
}

type InputHand = { hand: string[]; bid: number }

const hands: InputHand[] = flow([
  splitLines,
  map(
    flow([
      split(' '),
      (x) => ({
        hand: x[0].split(''),
        bid: Number(x[1])
      })
    ])
  )
])(props.data)

const part1 = () => {
  result.value = flow([
    map((x: InputHand) => [getHandType(x.hand), x.hand, x.bid]),
    (x) => sortHands(x, cards),
    (x) => x.map((y, i) => /* rank */ (i + 1) * /* bid */ y[2]),
    sum
  ])(hands)
}

const part2 = () => {
  result2.value = flow([
    map((x: InputHand) => [getHandType2(x.hand), x.hand, x.bid]),
    (x) => sortHands(x, cards2),
    (x) => x.map((y, i) => (i + 1) * y[2]),
    sum
  ])(hands)
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
    Day 07 part 1
    <AssertResult :expected="variant === 'test' ? 6440 : undefined" :value="result" />
    part 2: {{ result2 }}
  </div>
</template>
