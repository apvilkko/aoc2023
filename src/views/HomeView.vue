<script setup lang="ts">
import DaySelect from '@/components/DaySelect.vue'
import VariantSelect from '@/components/VariantSelect.vue'
import { useInputData } from '@/stores/data'
import LocationUpdater from '@/components/LocationUpdater.vue'
import Day01 from './Day01.vue'
import Day02 from './Day02.vue'
import Day03 from './Day03.vue'
import Day04 from './Day04.vue'
import Day05 from './Day05.vue'
import Day06 from './Day06.vue'
import Day07 from './Day07.vue'
import Day08 from './Day08.vue'
import Day09 from './Day09.vue'
import Day10 from './Day10.vue'
import Day11 from './Day11.vue'
import Day12 from './Day12.vue'
import Day13 from './Day13.vue'
import Day14 from './Day14.vue'
import Day15 from './Day15.vue'
import Day16 from './Day16.vue'
import Day17 from './Day17.vue'
import Day18 from './Day18.vue'
import Day19 from './Day19.vue'
import Day20 from './Day20.vue'
import Day21 from './Day21.vue'
import Day22 from './Day22.vue'

const store = useInputData()
const components = [
  Day01,
  Day02,
  Day03,
  Day04,
  Day05,
  Day06,
  Day07,
  Day08,
  Day09,
  Day10,
  Day11,
  Day12,
  Day13,
  Day14,
  Day15,
  Day16,
  Day17,
  Day18,
  Day19,
  Day20,
  Day21,
  Day22
  // ,Day23
  // ,Day24
  // ,Day25
]
</script>

<template>
  <main>
    <DaySelect />
    <VariantSelect />
    <LocationUpdater />
    <div v-if="store.current">
      <component :is="components[store.dayIndex]" :data="store.current" :variant="store.variant" />
    </div>
  </main>
</template>
