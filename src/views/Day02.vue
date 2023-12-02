<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { splitLines } from '@/lib/helpers'
import { flow, map, prop, propEq, split, sum, trim, filter, max, multiply, reduce } from 'lodash/fp'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

type BagColor = { amount: number; color: 'red' | 'green' | 'blue' }
type Game = { id: number; reveals: BagColor[] }

const getGames = () =>
  flow([
    map(split(':')),
    map((x: [string, string]) => ({
      id: Number(x[0].split(' ')[1]),
      reveals: flow([
        split(','),
        map(flow([trim, split(' ')])),
        map(
          (x: [string, string]) =>
            ({
              amount: Number(x[0]),
              color: x[1]
            }) as BagColor
        )
      ])(x[1].trim().split(';'))
    }))
  ])(splitLines(props.data))

const part1 = () => {
  const bag: Record<BagColor['color'], number> = {
    red: 12,
    green: 13,
    blue: 14
  }
  const games: Game[] = getGames()

  const possibles = games.filter((game) => game.reveals.every((x) => x.amount <= bag[x.color]))

  result.value = sum(possibles.map(prop('id')))
}

const part2 = () => {
  const games: Game[] = getGames()

  const powers = games.map((game) =>
    flow([
      map((color) =>
        flow([filter(propEq('color', color)), map(prop('amount')), max])(game.reveals)
      ),
      reduce(multiply, 1)
    ])(['red', 'blue', 'green'])
  )

  result2.value = sum(powers)
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
    Day 02 part 1
    <AssertResult :expected="variant === 'test' ? 8 : undefined" :value="result" />
    part 2: {{ result2 }}
  </div>
</template>
