<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useMediaStore } from '@/store/modules/media'

const router = useRouter()
const store = useMediaStore()

const filters = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Hình ảnh', value: 'Image' },
  { label: 'Video', value: 'Video' },
  { label: 'Tài liệu', value: 'Document' },
]

const activeFilter = ref('all')

const typeLabels = {
  Image: 'Hình ảnh',
  Video: 'Video',
  Document: 'Tài liệu',
}

const displayedMedia = computed(() => {
  if (activeFilter.value === 'all') {
    return store.mediaItems
  }
  return store.mediaItems.filter((item) => item.type === activeFilter.value)
})

const setFilter = (value) => {
  activeFilter.value = value
}

onMounted(() => {
  store.fetchMedia()
})
</script>

<template>
  <section class="card media">
    <header class="media__header">
      <div>
        <h2>Kho Media</h2>
        <p>Tải lên và quản lý hình ảnh, video, tài liệu một cách đồng bộ.</p>
      </div>
      <div class="media__actions">
        <BaseButton variant="outline" size="sm">Đồng bộ</BaseButton>
        <BaseButton size="sm">Tải tệp</BaseButton>
      </div>
    </header>

    <div class="media__toolbar">
      <div class="media__filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          :class="['media__filter', { 'is-active': activeFilter === filter.value }]"
          @click="setFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <div class="media__grid">
      <article
        v-for="item in displayedMedia"
        :key="item.id"
        class="media__item"
        @click="router.push({ name: 'media-detail', params: { id: item.id } })"
      >
        <div class="media__icon">{{ (typeLabels[item.type] ?? item.type).charAt(0) }}</div>
        <div class="media__info">
          <h3>{{ item.name }}</h3>
          <p>{{ typeLabels[item.type] ?? item.type }}</p>
        </div>
        <span class="badge badge-neutral">{{ item.size }}</span>
      </article>
    </div>
  </section>
</template>

<style scoped>
.media {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.media__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.media__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.media__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.media__filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.media__filter {
  border: 1px solid rgba(14, 165, 233, 0.25);
  background: transparent;
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  font-weight: 500;
}

.media__filter.is-active {
  background: rgba(14, 165, 233, 0.15);
  color: var(--primary-hover);
  border-color: transparent;
}

.media__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.media__item {
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.media__item:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.1);
}

.media__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(14, 165, 233, 0.15);
  color: var(--primary-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.media__info h3 {
  margin: 0;
  font-size: 1rem;
}

.media__info p {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}
</style>
