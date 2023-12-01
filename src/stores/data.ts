import { ref, shallowRef, watch, computed } from 'vue'
import { defineStore } from 'pinia'

const getInitial = (key: string) => {
  const params = new URLSearchParams(document.location.search)
  return params.get(key) || ''
}

export const useInputData = defineStore('inputData', () => {
  const data = shallowRef<Record<string, string>>({})
  const current = ref('')
  const days = ref<number[]>([])
  const day = ref(getInitial('day'))
  const variant = ref(getInitial('variant'))
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

  const getVariants = async (d: string | undefined) => {
    if (d) {
      const resp = await fetch(`/api/day/${d}`)
      if (resp.ok) {
        const arr = await resp.json()
        variants.value = arr
      }
    }
  }

  watch(() => day.value, getVariants)

  watch(
    () => variant.value,
    async () => {
      await getData()
    }
  )

  getDays()
  getVariants(day.value)
  getData()

  return { getData, current, day, variant, variants, days, getDays, dayIndex }
})
