<script setup lang="ts">
import { useInputData } from '@/stores/data'

const store = useInputData()

const setDay = (day: number) => {
  store.day = String(day).padStart(2, '0')
}
</script>

<template>
  <div>
    <button
      :class="[{ active: store.dayIndex + 1 === day }]"
      v-for="day in store.days"
      :key="day"
      @click="setDay(day)"
    >
      {{ day }}
    </button>
  </div>
</template>
