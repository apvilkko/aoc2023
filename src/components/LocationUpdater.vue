<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useInputData } from '@/stores/data'

const store = useInputData()
const { day, variant } = storeToRefs(store)

watch(day, (value) => {
  const params = new URLSearchParams(document.location.search)
  params.delete('day')
  params.append('day', String(value))
  window.history.pushState(null, '', '?' + params.toString())
})

watch(variant, (value) => {
  const params = new URLSearchParams(document.location.search)
  params.delete('variant')
  params.append('variant', String(value))
  window.history.pushState(null, '', '?' + params.toString())
})
</script>
<template><slot></slot></template>
