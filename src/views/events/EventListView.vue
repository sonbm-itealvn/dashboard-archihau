<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppSearchBar from '@/components/common/AppSearchBar.vue'
import { useEventStore } from '@/store/modules/event'

const router = useRouter()
const store = useEventStore()

const FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'upcoming', label: 'Sắp diễn ra' },
  { value: 'live', label: 'Đang diễn ra' },
  { value: 'ended', label: 'Đã kết thúc' },
]

const keyword = ref('')
const activeFilter = ref('all')
const actionError = ref('')
const deletingId = ref(null)

onMounted(() => {
  store.fetchEvents()
})

const normalizedEvents = computed(() =>
  store.events.map((event) => {
    const status = computeStatus(event)
    return {
      ...event,
      status,
      statusLabel: getStatusLabel(status),
      startLabel: formatVietnamTime(event.start_time),
      endLabel: formatVietnamTime(event.end_time),
    }
  }),
)

const filteredEvents = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  const events = normalizedEvents.value.filter((event) => (activeFilter.value === 'all' ? true : event.status === activeFilter.value))
  if (!query) {
    return events
  }
  return events.filter((event) => {
    const haystack = `${event.title ?? ''} ${event.description ?? ''} ${event.location ?? ''}`.toLowerCase()
    return haystack.includes(query)
  })
})

const handleSearch = (value) => {
  keyword.value = value ?? ''
}

const openDetail = (event) => {
  router.push({ name: 'event-detail', params: { id: event.id } })
}

const openEdit = (event) => {
  router.push({ name: 'event-edit', params: { id: event.id } })
}

const computeStatus = (event) => {
  const now = new Date()
  const start = new Date(event.start_time)
  const end = new Date(event.end_time)
  if (now < start) return 'upcoming'
  if (now >= start && now <= end) return 'live'
  return 'ended'
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'upcoming':
      return 'Sắp diễn ra'
    case 'live':
      return 'Đang diễn ra'
    case 'ended':
      return 'Đã kết thúc'
    default:
      return 'Không xác định'
  }
}

const formatVietnamTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
}

const handleDelete = async (event) => {
  actionError.value = ''
  const confirmed = typeof window === 'undefined' ? true : window.confirm(`Bạn có chắc muốn xóa sự kiện "${event.title}"?`)
  if (!confirmed) return

  deletingId.value = event.id
  try {
    await store.deleteEvent(event.id)
  } catch (error) {
    actionError.value = error?.message ?? 'Không thể xóa sự kiện. Vui lòng thử lại.'
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <section class="card page">
    <header class="page__header">
      <div>
        <p class="eyebrow">Lịch sự kiện</p>
        <h2>Sự kiện</h2>
        <p>Theo dõi các hoạt động của trường: sắp diễn ra, đang diễn ra và đã kết thúc.</p>
      </div>
      <div class="page__actions">
        <div class="page__search">
          <AppSearchBar placeholder="Tìm kiếm sự kiện..." @search="handleSearch" />
        </div>
        <BaseButton @click="router.push({ name: 'event-form' })">Thêm sự kiện</BaseButton>
      </div>
    </header>

    <div class="filters">
      <button
        v-for="filter in FILTERS"
        :key="filter.value"
        type="button"
        class="filter-chip"
        :class="{ 'filter-chip--active': activeFilter === filter.value }"
        @click="activeFilter = filter.value"
      >
        {{ filter.label }}
      </button>
    </div>

    <p v-if="actionError" class="alert alert--error">{{ actionError }}</p>

    <div class="event-grid">
      <article v-for="event in filteredEvents" :key="event.id" class="event-card" :class="`event-card--${event.status}`">
        <div class="event-card__header">
          <p class="status-pill" :class="`status-pill--${event.status}`">{{ event.statusLabel }}</p>
          <span class="event-time">{{ event.startLabel }} → {{ event.endLabel }}</span>
        </div>
        <h3>{{ event.title }}</h3>
        <p class="event-description">{{ event.description || 'Chưa có mô tả chi tiết.' }}</p>
        <div class="event-meta">
          <div>
            <span class="label">Địa điểm</span>
            <p>{{ event.location ?? '—' }}</p>
          </div>
          <div>
            <span class="label">Bắt đầu</span>
            <p>{{ event.startLabel }}</p>
          </div>
          <div>
            <span class="label">Kết thúc</span>
            <p>{{ event.endLabel }}</p>
          </div>
        </div>
        <div class="event-card__actions">
          <button type="button" class="link" @click="openDetail(event)">Chi tiết</button>
          <button type="button" class="link" @click="openEdit(event)">Chỉnh sửa</button>
          <button
            type="button"
            class="link link--danger"
            :disabled="deletingId === event.id"
            @click="handleDelete(event)"
          >
            {{ deletingId === event.id ? 'Đang xóa...' : 'Xóa' }}
          </button>
        </div>
      </article>

      <p v-if="!filteredEvents.length" class="empty-state">Không có sự kiện nào phù hợp.</p>
    </div>
  </section>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.page__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.page__search {
  min-width: 220px;
  flex: 1;
  max-width: 320px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-chip {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  padding: 0.35rem 0.9rem;
  background: #fff;
  color: var(--text-color);
  font-size: 0.85rem;
  transition: all var(--transition-fast);
}

.filter-chip--active {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(14, 165, 233, 0.12);
  font-weight: 600;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.event-card {
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  background: #fff;
  border: 1px solid rgba(14, 165, 233, 0.12);
  box-shadow: 0 18px 35px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-card--live {
  border-color: rgba(16, 185, 129, 0.4);
}

.event-card--upcoming {
  border-color: rgba(59, 130, 246, 0.3);
}

.event-card--ended {
  border-color: rgba(148, 163, 184, 0.4);
}

.event-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-pill {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.status-pill--upcoming {
  background: rgba(59, 130, 246, 0.15);
  color: #1d4ed8;
}

.status-pill--live {
  background: rgba(16, 185, 129, 0.18);
  color: #047857;
}

.status-pill--ended {
  background: rgba(148, 163, 184, 0.2);
  color: #475569;
}

.event-time {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.event-description {
  margin: 0;
  color: var(--text-muted);
}

.event-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

.event-card__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.link {
  border: none;
  background: none;
  color: #0f6ddf;
  font-weight: 600;
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}

.link--danger {
  color: var(--danger-color);
}

.link--danger:hover {
  color: #dc2626;
}

.link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
}

.alert--error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.35);
  color: var(--danger-color);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-muted);
  padding: 2rem 1rem;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-lg);
}

@media (max-width: 640px) {
  .page__actions {
    justify-content: stretch;
  }
}
</style>
