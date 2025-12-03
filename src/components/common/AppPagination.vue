<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  total: { type: Number, default: 0 },
})

const emit = defineEmits(['update:page'])

const maxPage = computed(() => {
  if (!props.pageSize) {
    return 1
  }
  return Math.max(1, Math.ceil(props.total / props.pageSize))
})

const goTo = (value) => {
  const next = Math.min(Math.max(value, 1), maxPage.value)
  if (next !== props.page) {
    emit('update:page', next)
  }
}
</script>

<template>
  <div class="app-pagination">
    <button type="button" @click="goTo(page - 1)" :disabled="page <= 1">Trước</button>
    <span>Trang {{ page }} / {{ maxPage }}</span>
    <button type="button" @click="goTo(page + 1)" :disabled="page >= maxPage">Sau</button>
  </div>
</template>

<style scoped>
.app-pagination {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: flex-end;
}

.app-pagination button {
  border: 1px solid var(--border-color);
  background: #fff;
  padding: 0.5rem 0.9rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.app-pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
