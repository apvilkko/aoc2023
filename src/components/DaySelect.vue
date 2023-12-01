<script setup lang="ts">
import { useInputData } from '@/stores/data'

const store = useInputData()
store.getDays()

const setDay = (day: number) => {
  store.day = String(day).padStart(2, '0')
}
</script>

<template>
  <div>
    <button v-for="day in store.days" :key="day" @click="setDay(day)">{{ day }}</button>
  </div>
</template>
