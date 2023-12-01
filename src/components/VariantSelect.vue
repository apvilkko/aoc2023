<script setup lang="ts">
import { useInputData } from '@/stores/data'

const store = useInputData()
</script>
<template>
  <button
    :class="[{ active: store.variant === variant }]"
    v-for="variant in store.variants"
    :key="variant"
    @click="() => (store.variant = variant)"
  >
    {{ variant }}
  </button>
</template>
