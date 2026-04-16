<template>
  <header class="app-header-shell">
    <div class="app-header">
      <div class="app-header-left">
        <h1 class="app-title">{{ title }}</h1>
        <p v-if="subtitle" class="app-subtitle" v-html="subtitle"></p>
      </div>

      <div class="app-header-right">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>