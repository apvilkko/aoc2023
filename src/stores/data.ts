import { ref, shallowRef, watch, computed } from 'vue'
import { defineStore } from 'pinia'

export const useInputData = defineStore('inputData', () => {
  const data = shallowRef<Record<string, string>>({})
  const current = ref('')
  const days = ref<number[]>([])
  const day = ref('')
  const variant = ref('')
  const variants = ref<string[]>([])
  const dayIndex = computed(() => Number(day.value) - 1)

  const getKey = (day: string, variant: string) => `${day}_${variant}`

  const getDays = async () => {
    const resp = await fetch('/api/day')
    if (resp.ok) {
      days.value = await resp.json()
    }
  }

  const getData = async () => {
    if (!variant.value) {
      return
    }
    const key = getKey(day.value, variant.value)

    if (data.value[key]) {
      current.value = data.value[key]
      return
    }

    const resp = await fetch(`/api/day/${day.value}/${variant.value}`)
    if (resp.ok) {
      const text = await resp.text()
      data.value[key] = text
      current.value = text
    }
  }

  watch(
    () => day.value,
    async (newDay) => {
      const resp = await fetch(`/api/day/${newDay}`)
      if (resp.ok) {
        const arr = await resp.json()
        variants.value = arr
      }
    }
  )

  watch(
    () => variant.value,
    async () => {
      await getData()
    }
  )

  return { getData, current, day, variant, variants, days, getDays, dayIndex }
})
