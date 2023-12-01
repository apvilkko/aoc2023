<script setup lang="ts">
import DaySelect from '@/components/DaySelect.vue'
import VariantSelect from '@/components/VariantSelect.vue'
import { useInputData } from '@/stores/data'

const store = useInputData()
</script>

<template>
  <main>
    <DaySelect />
    <VariantSelect />
    {{ store.current }}
  </main>
</template>
