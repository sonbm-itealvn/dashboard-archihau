<template>
  <button :type="props.type" :disabled="props.disabled" :class="buttonClasses">
    <slot name="icon-left"></slot>
    <slot></slot>
    <slot name="icon-right"></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const VARIANT_OPTIONS = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const
const SIZE_OPTIONS = ['sm', 'md', 'lg'] as const

const props = withDefaults(
  defineProps<{
    variant?: (typeof VARIANT_OPTIONS)[number]
    size?: (typeof SIZE_OPTIONS)[number]
    block?: boolean
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    block: false,
    type: 'button',
    disabled: false,
  }
)

const buttonClasses = computed(() => [
  'btn',
  `btn-${props.variant}`,
  `btn-${props.size}`,
  { 'w-full': props.block, 'is-disabled': props.disabled },
])
</script>

<style scoped>
.btn-secondary {
  background: rgba(14, 165, 233, 0.08);
  border: 1px solid rgba(14, 165, 233, 0.2);
  color: var(--primary-hover);
}

.btn-secondary:hover {
  background: rgba(14, 165, 233, 0.15);
  border-color: rgba(14, 165, 233, 0.35);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background: var(--primary-color);
  color: white;
}

.btn-ghost {
  background: transparent;
  color: var(--primary-hover);
}

.btn-ghost:hover {
  background: rgba(14, 165, 233, 0.08);
  color: var(--primary-hover);
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  opacity: 0.9;
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.is-disabled {
  pointer-events: none;
}
</style>
