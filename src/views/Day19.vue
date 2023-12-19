<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { splitLines, splitMultilines } from '@/lib/helpers'
import { flow, map, reduce, split, sum, trimCharsEnd, trimCharsStart } from 'lodash/fp'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

enum Operation {
  Lt,
  Gt
}

type Target = { target: string }
type Condition = { op: Operation; left: string; right: number }
type ArrayItem = Condition | Target

type Instruction = {
  name: string
  instructions: Array<Target | Array<ArrayItem>>
}

type Workflows = Record<string, Instruction>

type Part = {
  x: number
  m: number
  a: number
  s: number
}

const parseInput = (): [Workflows, Part[]] => {
  const [one, two] = splitMultilines(props.data)
  const workflows = flow([
    splitLines,
    map((line: string) => {
      const [name, rest] = line.split('{')
      const inst = trimCharsEnd('}')(rest).split(',')
      const instructions = inst.map((x) => {
        const p = x.split(':')
        if (p.length > 1) {
          return p.map((y) => {
            const pa = y.split('<')
            if (pa.length > 1) {
              return { op: Operation.Lt, left: pa[0], right: Number(pa[1]) }
            }
            const pb = y.split('>')
            if (pb.length > 1) {
              return { op: Operation.Gt, left: pb[0], right: Number(pb[1]) }
            }
            return { target: y }
          })
        }
        return { target: x }
      })
      return { name, instructions }
    })
  ])(one) as Instruction[]

  const parts = flow([
    splitLines,
    map(
      flow([
        trimCharsStart('{'),
        trimCharsEnd('}'),
        split(','),
        map((item: string) => {
          const parts = item.split('=')
          return {
            [parts[0]]: Number(parts[1])
          }
        }),
        reduce((acc, curr) => {
          return Object.assign({}, acc, curr)
        }, {})
      ])
    )
  ])(two) as Part[]
  return [
    workflows.reduce((acc, curr) => {
      acc[curr.name] = curr
      return acc
    }, {} as Workflows) as Workflows,
    parts
  ]
}

const isTarget = (x: unknown): x is Target => !!(x as Target).target

const processPart = (p: Part, workflows: Workflows) => {
  //console.log('processPart', p)
  const q = ['in']
  let accepted = 0
  while (q.length) {
    const key = q.shift() as string
    if (key === 'A') {
      //console.log('accepted')
      accepted++
      break
    }
    if (key === 'R') {
      //console.log('rejected')
      break
    }
    const wf = workflows[key]
    //console.log('at inst', key, wf)
    for (let i = 0; i < wf.instructions.length; ++i) {
      const inst = wf.instructions[i]
      if (isTarget(inst)) {
        //console.log('is target')
        q.push(inst.target)
        break
      } else if (Array.isArray(inst)) {
        const condition = inst[0] as Condition
        const target = inst[1] as Target
        const left = p[condition.left as keyof Part]
        if (
          (condition.op === Operation.Gt && left > condition.right) ||
          (condition.op === Operation.Lt && left < condition.right)
        ) {
          //console.log('condition ok')
          q.push(target.target)
          break
        }
      }
    }
  }
  return accepted > 0
}

const sumPart = (p: Part) => p.x + p.m + p.a + p.s

const part1 = () => {
  const [workflows, parts] = parseInput()
  result.value = sum(
    parts.map((p) => {
      if (processPart(p, workflows)) {
        return sumPart(p)
      }
      return 0
    })
  )
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
    Day 19 part 1
    <AssertResult pretty :expected="variant === 'test' ? 19114 : undefined" :value="result" />
    part 2: {{ result2 }}
  </div>
</template>
