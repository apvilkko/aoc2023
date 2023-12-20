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

const getNameMap = (input: ModuleConfig[]) =>
  input.reduce(
    (acc, curr, i) => {
      acc[curr.name] = i
      return acc
    },
    {} as Record<string, number>
  )

const parseInput = (): ModuleConfig[] => {
  const mods = flow([
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
  ])(props.data) as ModuleConfig[]
  const nameMap = getNameMap(mods)
  mods.forEach((m) => {
    m.output.forEach((o) => {
      const target = mods[nameMap[o]]
      if (target && target.type === ModuleType.Conjunction) {
        target.memory![m.name] = false
      }
    })
  })
  return mods
}

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
      //console.log('broadcast to', o)
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
    const value = !Object.values(mod.memory!).every((x) => !!x)
    mod.output.forEach((o) => {
      //console.log('  conjunction', name, pulse, sender, mod.memory, o, value)
      outputs.push([o, value, name])
    })
  }
  return outputs
}

const pushButton = (input: ModuleConfig[]): [number, number] => {
  const nameMap = getNameMap(input)
  const pulse = false
  const mod = input[nameMap.broadcaster].name
  const q = [[mod, pulse, 'button']]
  let pulseCount: [number, number] = [1, 0]
  while (q.length) {
    const v = q.shift()
    //console.log(v[2], v[1] ? 'high' : 'low', '->', v[0])
    const ret = receive(v[0], v[1], v[2], input, nameMap)
    ret.forEach((r) => {
      if (r[1]) {
        pulseCount[1]++
      } else {
        pulseCount[0]++
      }
      q.push(r)
    })
  }
  return pulseCount
}

const part1 = () => {
  const input = parseInput()
  const totals = [0, 0]
  for (let i = 0; i < 1000; ++i) {
    //console.log('push', i)
    const [lo, hi] = pushButton(input)
    totals[0] += lo
    totals[1] += hi
  }
  result.value = totals[0] * totals[1]
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
