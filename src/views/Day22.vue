<script setup lang="ts">
import { ref } from 'vue'
import AssertResult from '@/components/AssertResult.vue'
import { splitLines } from '@/lib/helpers'
import { intersection } from 'lodash/fp'

const props = defineProps<{ data: string; variant: string }>()

const result = ref()
const result2 = ref()

const DIMS: Array<keyof Point3d> = ['x', 'y', 'z']

const isBetween = (a: number, b: number, c: number) => (a >= b && a <= c) || (a >= c && a <= b)

const isPointBetween = (p: [number, number], x0: [number, number], x1: [number, number]) =>
  (p[0] === x0[0] && p[0] === x1[0] && isBetween(p[1], x0[1], x1[1])) ||
  (p[1] === x0[1] && p[1] === x1[1] && isBetween(p[0], x0[0], x1[0]))

const coordKey = (x: Point3d) => x.toString()

class Brick {
  id: string
  start: Point3d
  end: Point3d
  orientation: Array<keyof Point3d> = []
  constructor(id: string, start: Point3d, end: Point3d) {
    this.id = id
    this.start = start
    this.end = end
    this.orientation = this.getOrientation()
  }
  toString() {
    return `{${this.id}:${this.start}~${this.end}}`
  }
  transform(dz: number) {
    this.start.transform(dz)
    this.end.transform(dz)
  }
  getOrientation(): Array<keyof Point3d> {
    const out: Array<keyof Point3d> = []
    for (let i = 0; i < DIMS.length; ++i) {
      const dim = DIMS[i]
      if (this.start[dim] === this.end[dim]) {
        out.push(dim)
      }
    }
    return out
  }
  intersects(other: Brick) {
    if (
      (this.start.z > other.start.z &&
        this.start.z > other.end.z &&
        this.end.z > other.start.z &&
        this.end.z > other.end.z) ||
      (this.start.z < other.start.z &&
        this.start.z < other.end.z &&
        this.end.z < other.start.z &&
        this.end.z < other.end.z) ||
      (this.start.x > other.start.x &&
        this.start.x > other.end.x &&
        this.end.x > other.start.x &&
        this.end.x > other.end.x) ||
      (this.start.x < other.start.x &&
        this.start.x < other.end.x &&
        this.end.x < other.start.x &&
        this.end.x < other.end.x) ||
      (this.start.y > other.start.y &&
        this.start.y > other.end.y &&
        this.end.y > other.start.y &&
        this.end.y > other.end.y) ||
      (this.start.y < other.start.y &&
        this.start.y < other.end.y &&
        this.end.y < other.start.y &&
        this.end.y < other.end.y)
    ) {
      return false
    }
    const same = intersection(this.orientation, other.orientation)
    //console.log(`intersects ${this} - ${other}`, same)
    const o0 = same[0]
    if (same.length > 0) {
      if (this.start[o0] !== other.start[o0]) {
        // same orientation, different coords -> no overlap
        //console.log('  no (orientation) -> false')
        return false
      } else if (this.start[o0] === other.start[o0]) {
        // same orientation, same plane
        const dims = DIMS.filter((d) => d !== o0)
        const x0 = dims.map((d) => this.start[d])
        const x1 = dims.map((d) => this.end[d])
        const y0 = dims.map((d) => other.start[d])
        const y1 = dims.map((d) => other.end[d])
        const res =
          isPointBetween(x0, y0, y1) ||
          isPointBetween(x1, y0, y1) ||
          isPointBetween(y0, x0, x1) ||
          isPointBetween(y1, x0, x1)
        //console.log('  same plane ->', res)
        return res
      }
    }

    return true
  }
}

class Point3d {
  x: number
  y: number
  z: number

  constructor(x: number | [number, number, number], y?: number, z?: number) {
    if (Array.isArray(x)) {
      this.x = x[0]
      this.y = x[1]
      this.z = x[2]
    } else {
      this.x = x
      this.y = y as number
      this.z = z as number
    }
  }

  transform(dz: number) {
    this.z += dz
  }

  toString() {
    return `${this.x},${this.y},${this.z}`
  }
}

const parseInput = (): Brick[] =>
  splitLines(props.data).map((line, i) => {
    const points = line
      .split('~')
      .map(
        (coord) => new Point3d(coord.split(',').map((x) => Number(x)) as [number, number, number])
      )
    return new Brick(String.fromCharCode(i + 0x41), points[0], points[1])
  })

const FLOOR_Z = 1

const down = (b: Brick, others: Brick[]) => {
  //console.log('down ' + b)
  if (b.start.z <= FLOOR_Z || b.end.z <= FLOOR_Z) {
    //console.log('  floor')
    return false
  }
  b.transform(-1)
  if (others.filter((n) => n.id !== b.id).some((n) => b.intersects(n))) {
    b.transform(1)
    return false
  }
  return true
}

const part1 = () => {
  const input = parseInput()

  let someDropped = true
  while (someDropped) {
    someDropped = false
    for (let i = 0; i < input.length; ++i) {
      const ret = down(input[i], input)
      if (ret) {
        //console.log('dropped ' + input[i])
        someDropped = true
      }
    }
  }

  result.value = input
}

const part2 = () => {
  result2.value = 0
}

const run = () => {
  part1()
  part2()
}
</script>
<template>
  <button @click="run">Run</button>
  <div>
    Day 22 part 1
    <AssertResult pretty :expected="variant === 'test' ? 13 : undefined" :value="result" />
    part 2: {{ result2 }}
  </div>
</template>
