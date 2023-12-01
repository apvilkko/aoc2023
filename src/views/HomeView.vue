<script setup lang="ts">
import DaySelect from '@/components/DaySelect.vue'
import VariantSelect from '@/components/VariantSelect.vue'
import { useInputData } from '@/stores/data'
import Day01 from './Day01.vue'

const store = useInputData()
const components = [Day01]
</script>

<template>
  <main>
    <DaySelect />
    <VariantSelect />
    <div v-if="store.current">
      <component :is="components[store.dayIndex]" :data="store.current" />
    </div>
  </main>
</template>
