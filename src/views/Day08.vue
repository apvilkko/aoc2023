<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { splitLines, splitMultilines } from '@/lib/helpers'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

type InputData = { moves: string[]; nodes: Record<string, { L: string; R: string }> }

const parseInput = (): InputData => {
  const parts = splitMultilines(props.data)
  const moves = parts[0].split('')
  const nodes = splitLines(parts[1])
    .map((x) => {
      const n = x.split(' = ')
      const dirs = n[1].split(',').map((y) => y.trim().replace(/[^A-Z0-9]/g, ''))
      return [n[0], { L: dirs[0], R: dirs[1] }]
    })
    .reduce((acc, curr) => {
      acc[curr[0]] = curr[1]
      return acc
    }, {})

  return { moves, nodes }
}

const traverse = (input: InputData, startNode: string, endCondition: (x: string) => boolean) => {
  let currentNode = startNode
  let moveIndex = 0
  let numMoves = 0
  while (true) {
    const move = input.moves[moveIndex % input.moves.length]

    const directions = input.nodes[currentNode]
    currentNode = directions[move]

    numMoves++
    if (endCondition(currentNode)) {
      return numMoves
    }
    moveIndex++
  }
}

const gcd = (a: number, b: number): number => (a ? gcd(b % a, a) : b)
const lcm = (a: number, b: number): number => (a * b) / gcd(a, b)

const part1 = () => {
  const input = parseInput()

  result.value = traverse(input, 'AAA', (x) => x === 'ZZZ')
}

const part2 = () => {
  const input = parseInput()

  const startNodes = Object.keys(input.nodes).filter((x) => x.endsWith('A'))
  const endCondition = (x: string) => x.endsWith('Z')
  const numMoves = startNodes.map((node) => traverse(input, node, endCondition))

  result2.value = numMoves.reduce((a, b) => lcm(a, b), numMoves[0])
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
    <AssertResult :expected="variant === 'test' ? 2 : undefined" :value="result" />
    part 2: {{ result2 }}
  </div>
</template>
