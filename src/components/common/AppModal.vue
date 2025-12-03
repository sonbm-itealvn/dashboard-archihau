<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="app-modal" role="dialog" aria-modal="true">
      <div class="app-modal__backdrop" @click="close" />
      <div class="app-modal__panel">
        <header class="app-modal__header">
          <h3>{{ title }}</h3>
          <button type="button" class="close-btn" aria-label="Đóng hộp thoại" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>
        <div class="app-modal__body">
          <slot />
        </div>
        <footer class="app-modal__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.app-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.app-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
}

.app-modal__panel {
  position: relative;
  background: #fff;
  border-radius: var(--radius-md);
  width: min(90vw, 520px);
  padding: 1.5rem;
  border: 1px solid rgba(14, 165, 233, 0.2);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.3);
  max-height: 90vh;
  overflow: hidden;
}

.app-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.close-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0.25rem;
  border-radius: var(--radius-full);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.close-btn:hover {
  background: rgba(15, 23, 42, 0.05);
  color: var(--text-color);
}

.app-modal__footer {
  margin-top: 1.25rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
