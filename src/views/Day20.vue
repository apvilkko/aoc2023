<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { flow } from 'lodash'
import { splitLines } from '@/lib/helpers'
import { map } from 'lodash/fp'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

enum ModuleType {
  Broadcaster,
  FlipFlop,
  Conjunction
}

type ModuleConfig = {
  type: ModuleType
  name: string
  output: string[]
  memory?: Record<string, boolean>
  value?: boolean
}

const parseInput = (): ModuleConfig[] =>
  flow([
    splitLines,
    map((line: string) => {
      const parts = line.split('->').map((x) => x.trim())
      const output = parts[1].split(',').map((x) => x.trim())
      const type =
        parts[0] === 'broadcaster'
          ? ModuleType.Broadcaster
          : parts[0].startsWith('&')
            ? ModuleType.Conjunction
            : ModuleType.FlipFlop
      const name = type === ModuleType.Broadcaster ? parts[0] : parts[0].replace(/[^a-z]+/g, '')
      const memory = type === ModuleType.Conjunction ? {} : undefined
      const value = type === ModuleType.FlipFlop ? false : undefined
      return { type, name, output, memory, value }
    })
  ])(props.data)

const receive = (
  name: string,
  pulse: boolean,
  sender: string,
  input: ModuleConfig[],
  nameMap: Record<string, number>
) => {
  const mod = input[nameMap[name]]
  const outputs = []
  if (!mod) {
    return outputs
  }
  if (mod.type === ModuleType.Broadcaster) {
    mod.output.forEach((o) => {
      console.log('broadcast to', o)
      outputs.push([o, pulse, name])
    })
  } else if (mod.type === ModuleType.FlipFlop) {
    if (!pulse) {
      mod.value = !mod.value
      mod.output.forEach((o) => {
        outputs.push([o, mod.value as boolean, name])
      })
    }
  } else if (mod.type === ModuleType.Conjunction) {
    mod.memory![sender] = pulse
    const value = Object.values(mod.memory!).every((x) => !!x)
    console.log('conjunction', mod.memory, value)
    mod.output.forEach((o) => {
      outputs.push([o, value, name])
    })
  }
  return outputs
}

const pushButton = (input: ModuleConfig[]) => {
  let i = 0
  const nameMap = input.reduce(
    (acc, curr, i) => {
      acc[curr.name] = i
      return acc
    },
    {} as Record<string, number>
  )
  const pulse = false
  const mod = input[i].name
  const q = [[mod, pulse, undefined]]
  let pulseCount = 1
  while (q.length) {
    const v = q.shift()
    const ret = receive(v[0], v[1], v[2], input, nameMap)
    ret.forEach((r) => {
      console.log(v[2], '->', v[0], v[1])
      pulseCount++
      q.push(r)
    })
  }
  return pulseCount
}

const part1 = () => {
  const input = parseInput()
  result.value = pushButton(input)
}

const part2 = () => {
  result2.value = 0
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
    Day 20 part 1
    <AssertResult pretty :expected="variant === 'test2' ? 11687500 : undefined" :value="result" />
    part 2: {{ result2 }}
  </div>
</template>
