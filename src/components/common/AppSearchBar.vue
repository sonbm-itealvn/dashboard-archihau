<script setup>
import { ref } from 'vue'

const props = defineProps({
  placeholder: { type: String, default: 'Tìm kiếm...' },
})

const emit = defineEmits(['search'])
const keyword = ref('')

const submit = () => {
  emit('search', keyword.value)
}
</script>

<template>
  <form class="app-search" @submit.prevent="submit">
    <span class="search-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    </span>
    <input v-model="keyword" :placeholder="placeholder" />
    <button type="submit">Tìm</button>
  </form>
</template>

<style scoped>
.app-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: var(--radius-full);
  padding: 0.35rem 0.35rem 0.35rem 0.85rem;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08);
}

.app-search input {
  border: none;
  padding: 0.5rem 0.25rem;
  flex: 1;
  background: transparent;
}

.app-search button {
  border: none;
  background: var(--primary-color);
  color: #fff;
  padding: 0.45rem 1.1rem;
  cursor: pointer;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 0.85rem;
}

.search-icon {
  display: inline-flex;
  color: var(--text-muted);
}

@media (max-width: 640px) {
  .app-search {
    width: 100%;
    padding-right: 0.5rem;
  }

  .app-search button {
    padding-inline: 0.85rem;
    white-space: nowrap;
  }
}
</style>
