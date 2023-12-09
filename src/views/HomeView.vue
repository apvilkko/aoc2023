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
  Day09
  // ,Day10
  // ,Day11
  // ,Day12
  // ,Day13
  // ,Day14
  // ,Day15
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
