<script setup lang="ts">
import { useInputData } from '@/stores/data'

const store = useInputData()
</script>
<template>
  <button v-for="variant in store.variants" :key="variant" @click="() => (store.variant = variant)">
    {{ variant }}
  </button>
</template>
