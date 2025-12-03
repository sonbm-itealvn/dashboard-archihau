<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
</script>

<template>
  <BaseButton v-bind="$attrs">
    <slot />
  </BaseButton>
</template>
